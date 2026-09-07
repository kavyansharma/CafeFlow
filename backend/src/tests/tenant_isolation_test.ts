const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING CAFEFLOW MULTI-TENANT ISOLATION TESTS ---\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Login Sunrise Cafe Owner
    console.log('1. Testing Sunrise Cafe & Bean Theory Logins...');
    const sunriseLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@sunrise.demo', password: 'demo123' }),
    });
    const sunriseLogin = await sunriseLoginRes.json() as any;
    const sunriseToken = sunriseLogin.token;
    const sunriseCafe = sunriseLogin.cafe;
    assert(sunriseToken && sunriseCafe?.id === 'cafe-sunrise-001', 'Sunrise Owner login returned correct cafe_id');

    // 2. Login Bean Theory Owner
    const beanLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@bean.demo', password: 'demo123' }),
    });
    const beanLogin = await beanLoginRes.json() as any;
    const beanToken = beanLogin.token;
    const beanCafe = beanLogin.cafe;
    assert(beanToken && beanCafe?.id === 'cafe-bean-002', 'Bean Theory Owner login returned correct cafe_id');

    const sunriseHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sunriseToken}`,
    };
    const beanHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${beanToken}`,
    };

    // 3. Test Products Isolation
    console.log('\n2. Testing Product Isolation...');
    const sunriseProducts = ((await (await fetch(`${API_BASE}/products`, { headers: sunriseHeaders })).json()) as any).data;
    const beanProducts = ((await (await fetch(`${API_BASE}/products`, { headers: beanHeaders })).json()) as any).data;

    assert(sunriseProducts.length > 0 && beanProducts.length > 0, 'Both cafes have products');
    assert(sunriseProducts.every((p: any) => p.cafe_id === 'cafe-sunrise-001'), 'All Sunrise products belong to Sunrise Cafe');
    assert(beanProducts.every((p: any) => p.cafe_id === 'cafe-bean-002'), 'All Bean Theory products belong to Bean Theory');

    // Check that Sunrise product is inaccessible by Bean Theory
    const sunriseProdId = sunriseProducts[0].id;
    const crossAccessRes = await fetch(`${API_BASE}/products/${sunriseProdId}`, { headers: beanHeaders });
    assert(crossAccessRes.status === 404, 'Bean Theory received 404 for Sunrise Cafe product ID');

    // 4. Test Inventory Isolation
    console.log('\n3. Testing Inventory Isolation...');
    const sunriseInv = ((await (await fetch(`${API_BASE}/inventory`, { headers: sunriseHeaders })).json()) as any).data;
    const beanInv = ((await (await fetch(`${API_BASE}/inventory`, { headers: beanHeaders })).json()) as any).data;

    assert(sunriseInv.every((i: any) => i.cafe_id === 'cafe-sunrise-001'), 'All Sunrise inventory belongs to Sunrise');
    assert(beanInv.every((i: any) => i.cafe_id === 'cafe-bean-002'), 'All Bean Theory inventory belongs to Bean Theory');

    // 5. Test Stock Deduction Isolation on Order
    console.log('\n4. Testing POS Order & Inventory Isolation...');
    const coffeeBeansSunrise = sunriseInv.find((i: any) => i.name.toLowerCase().includes('beans'));
    const initialSunriseQty = coffeeBeansSunrise ? coffeeBeansSunrise.current_quantity : 0;

    // Place an order in Sunrise Cafe
    const orderRes = await (await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: sunriseHeaders,
      body: JSON.stringify({
        items: [{ product_id: sunriseProdId, quantity: 2 }],
        payment_method: 'UPI',
      }),
    })).json() as any;

    assert(orderRes.success && orderRes.order.cafe_id === 'cafe-sunrise-001', 'Order placed successfully in Sunrise Cafe');

    // Check Sunrise inventory was deducted
    const updatedSunriseInv = ((await (await fetch(`${API_BASE}/inventory`, { headers: sunriseHeaders })).json()) as any).data;
    const updatedCoffeeBeansSunrise = updatedSunriseInv.find((i: any) => i.id === coffeeBeansSunrise?.id);
    assert(updatedCoffeeBeansSunrise && updatedCoffeeBeansSunrise.current_quantity < initialSunriseQty, 'Sunrise inventory quantity deducted after Sunrise order');

    // Check Bean Theory inventory remained unaffected
    const updatedBeanInv = ((await (await fetch(`${API_BASE}/inventory`, { headers: beanHeaders })).json()) as any).data;
    const beanBeans = updatedBeanInv.find((i: any) => i.name.toLowerCase().includes('beans'));
    const originalBeanBeans = beanInv.find((i: any) => i.name.toLowerCase().includes('beans'));
    assert(beanBeans && beanBeans.current_quantity === originalBeanBeans?.current_quantity, 'Bean Theory inventory remained UNCHANGED');

    // 6. Test Shift Isolation
    console.log('\n5. Testing Shift Isolation...');
    const sunriseShift = ((await (await fetch(`${API_BASE}/shifts/current`, { headers: sunriseHeaders })).json()) as any).data;
    const beanShift = ((await (await fetch(`${API_BASE}/shifts/current`, { headers: beanHeaders })).json()) as any).data;
    assert(sunriseShift?.cafe_id === 'cafe-sunrise-001', 'Sunrise active shift belongs to Sunrise');
    assert(beanShift?.cafe_id === 'cafe-bean-002', 'Bean Theory active shift belongs to Bean Theory');

    // 7. Test Cafe Self-Registration Flow
    console.log('\n6. Testing Cafe Self-Registration Flow...');
    const newCafeRes = await (await fetch(`${API_BASE}/auth/register-cafe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cafe_name: 'Moonlight Espresso Lounge',
        owner_name: 'Diana Prince',
        email: `diana_${Date.now()}@moonlight.demo`,
        password: 'password123',
        phone: '+91 91234 56789',
        address: '74 MG Road, Indiranagar, Bengaluru',
        gstin: '29ABCDE1234F1Z5',
        currency: '₹',
        invoice_prefix: 'ML-2026-',
        business_type: 'Cafe & Bakery',
        seating_capacity: 40,
      }),
    })).json() as any;

    assert(newCafeRes.success && newCafeRes.cafe.name === 'Moonlight Espresso Lounge', 'New cafe registered successfully');
    assert(newCafeRes.token, 'Registration issued a JWT token for the new owner');

    const newCafeHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${newCafeRes.token}`,
    };
    const newCafeProducts = ((await (await fetch(`${API_BASE}/products`, { headers: newCafeHeaders })).json()) as any).data;
    assert(newCafeProducts.length > 0 && newCafeProducts.every((p: any) => p.cafe_id === newCafeRes.cafe.id), 'New cafe auto-populated with its own starter menu and zero leakage');

    console.log(`\n========================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
