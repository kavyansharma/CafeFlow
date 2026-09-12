process.env.NODE_ENV = 'test';
import http from 'http';

async function runTests() {
  const { default: app } = await import('../server');
  console.log('================================================================');
  console.log('☕ CAFEFLOW PRODUCTION READINESS & MULTI-TENANT SECURITY SUITE');
  console.log('================================================================\n');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const API_BASE = `http://127.0.0.1:${port}/api`;

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // SUITE 1: AUTHENTICATION & TOKEN VERIFICATION
    // ----------------------------------------------------
    console.log('1. [AUTH] Testing Authentication & Token Validation...');

    // 1.1 Sunrise Owner Login
    const sunriseLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@sunrise.demo', password: 'demo123' }),
    });
    const sunriseLogin = (await sunriseLoginRes.json()) as any;
    const sunriseToken = sunriseLogin.token;
    const sunriseCafe = sunriseLogin.cafe;
    assert(sunriseLoginRes.status === 200 && sunriseToken && sunriseCafe?.id === 'cafe-sunrise-001', 'Sunrise Owner login returned 200 and cafe-sunrise-001');

    // 1.2 Bean Theory Owner Login
    const beanLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@bean.demo', password: 'demo123' }),
    });
    const beanLogin = (await beanLoginRes.json()) as any;
    const beanToken = beanLogin.token;
    const beanCafe = beanLogin.cafe;
    assert(beanLoginRes.status === 200 && beanToken && beanCafe?.id === 'cafe-bean-002', 'Bean Theory Owner login returned 200 and cafe-bean-002');

    // 1.3 Sunrise Manager Login
    const sunriseMgrLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@sunrise.demo', password: 'demo123' }),
    });
    const sunriseMgrLogin = (await sunriseMgrLoginRes.json()) as any;
    assert(sunriseMgrLoginRes.status === 200 && sunriseMgrLogin.user?.role === 'MANAGER', 'Sunrise Manager login returned 200 with MANAGER role');

    // 1.4 Sunrise Cashier Login
    const cashierLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'cashier@sunrise.demo', password: 'demo123' }),
    });
    const cashierLogin = (await cashierLoginRes.json()) as any;
    const cashierToken = cashierLogin.token;
    assert(cashierLoginRes.status === 200 && cashierLogin.user?.role === 'CASHIER', 'Sunrise Cashier login returned 200 with CASHIER role');

    // 1.5 Bean Theory Manager Login
    const beanMgrLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'manager@bean.demo', password: 'demo123' }),
    });
    const beanMgrLogin = (await beanMgrLoginRes.json()) as any;
    assert(beanMgrLoginRes.status === 200 && beanMgrLogin.user?.role === 'MANAGER', 'Bean Theory Manager login returned 200 with MANAGER role');

    // 1.6 Bean Theory Cashier Login
    const beanCashierLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'cashier@bean.demo', password: 'demo123' }),
    });
    const beanCashierLogin = (await beanCashierLoginRes.json()) as any;
    assert(beanCashierLoginRes.status === 200 && beanCashierLogin.user?.role === 'CASHIER', 'Bean Theory Cashier login returned 200 with CASHIER role');

    // 1.7 Invalid credentials rejection
    const badLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@sunrise.demo', password: 'wrongpassword' }),
    });
    assert(badLoginRes.status === 401, 'Invalid password rejected with 401 Unauthorized');

    // 1.8 Missing Authorization Header rejection
    const noAuthRes = await fetch(`${API_BASE}/products`);
    assert(noAuthRes.status === 401, 'Unauthenticated request to /products rejected with 401');

    // 1.9 Malformed / Expired JWT rejection
    const fakeTokenRes = await fetch(`${API_BASE}/products`, {
      headers: { Authorization: 'Bearer this.is.an.invalid.jwt.token' },
    });
    assert(fakeTokenRes.status === 401, 'Invalid JWT token rejected with 401 Unauthorized');

    const sunriseHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sunriseToken}`,
    };
    const beanHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${beanToken}`,
    };
    const cashierHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cashierToken}`,
    };

    // ----------------------------------------------------
    // SUITE 2: ROLE-BASED ACCESS CONTROL (RBAC)
    // ----------------------------------------------------
    console.log('\n2. [RBAC] Testing Role Permissions & Access Control...');

    // 2.1 Owner can access staff list
    const ownerStaffRes = await fetch(`${API_BASE}/staff`, { headers: sunriseHeaders });
    assert(ownerStaffRes.status === 200, 'Owner successfully accesses /staff');

    // 2.2 Cashier cannot access staff list (403 Forbidden)
    const cashierStaffRes = await fetch(`${API_BASE}/staff`, { headers: cashierHeaders });
    assert(cashierStaffRes.status === 403, 'Cashier is forbidden (403) from accessing /staff');

    // 2.3 Cashier cannot update cafe settings (403 Forbidden)
    const cashierSettingsRes = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: cashierHeaders,
      body: JSON.stringify({ cafe_name: 'Hacked Name' }),
    });
    assert(cashierSettingsRes.status === 403, 'Cashier is forbidden (403) from updating /settings');

    // 2.4 Cashier cannot create product (403 Forbidden)
    const cashierCreateProdRes = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: cashierHeaders,
      body: JSON.stringify({ name: 'Unauthorized Item', category_id: 'cat-coffee', selling_price: 100 }),
    });
    assert(cashierCreateProdRes.status === 403, 'Cashier is forbidden (403) from creating products');

    // 2.5 Cashier cannot manually alter customer loyalty points
    const custRes = await fetch(`${API_BASE}/customers`, { headers: sunriseHeaders });
    const sunriseCustomers = ((await custRes.json()) as any).data;
    const targetCustId = sunriseCustomers[0].id;

    const cashierModifyPointsRes = await fetch(`${API_BASE}/customers/${targetCustId}`, {
      method: 'PUT',
      headers: cashierHeaders,
      body: JSON.stringify({ loyalty_points: 99999 }),
    });
    assert(cashierModifyPointsRes.status === 403, 'Cashier is forbidden (403) from manually setting loyalty points');

    // ----------------------------------------------------
    // SUITE 3: INPUT VALIDATION & BUSINESS BOUNDS
    // ----------------------------------------------------
    console.log('\n3. [VALIDATION] Testing Strict Input Validation...');

    // 3.1 Reject negative / zero selling price
    const sunriseCategories = ((await (await fetch(`${API_BASE}/categories`, { headers: sunriseHeaders })).json()) as any).data;
    const validSunriseCatId = sunriseCategories[0].id;

    const negPriceRes = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: sunriseHeaders,
      body: JSON.stringify({
        name: 'Invalid Price Product',
        category_id: validSunriseCatId,
        selling_price: -50,
      }),
    });
    assert(negPriceRes.status === 400, 'Creating product with negative price rejected (400)');

    // 3.2 Reject product with cross-tenant category
    const beanCategories = ((await (await fetch(`${API_BASE}/categories`, { headers: beanHeaders })).json()) as any).data;
    const beanCatId = beanCategories[0].id;

    const crossCatRes = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: sunriseHeaders,
      body: JSON.stringify({
        name: 'Cross Cat Product',
        category_id: beanCatId, // Belongs to Bean Theory!
        selling_price: 150,
      }),
    });
    assert(crossCatRes.status === 400, 'Creating product with foreign tenant category rejected (400)');

    // 3.3 Reject order with negative / zero item quantity
    const sunriseProducts = ((await (await fetch(`${API_BASE}/products`, { headers: sunriseHeaders })).json()) as any).data;
    const sunriseProdId = sunriseProducts[0].id;

    const negOrderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: sunriseHeaders,
      body: JSON.stringify({
        items: [{ product_id: sunriseProdId, quantity: -2 }],
        payment_method: 'CASH',
      }),
    });
    assert(negOrderRes.status === 400, 'Placing order with negative quantity rejected (400)');

    // 3.4 Reject order with excessive discount beyond cafe max limit
    const overDiscountRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: sunriseHeaders,
      body: JSON.stringify({
        items: [{ product_id: sunriseProdId, quantity: 1 }],
        discount_type: 'PERCENTAGE',
        discount_percentage: 85,
        payment_method: 'CASH',
      }),
    });
    assert(overDiscountRes.status === 400, 'Placing order exceeding max discount limit rejected (400)');

    // 3.5 Reject order with invalid payment method
    const badPaymentRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: sunriseHeaders,
      body: JSON.stringify({
        items: [{ product_id: sunriseProdId, quantity: 1 }],
        payment_method: 'CRYPTO_BITCOIN',
      }),
    });
    assert(badPaymentRes.status === 400, 'Placing order with invalid payment method rejected (400)');

    // ----------------------------------------------------
    // SUITE 4: MULTI-TENANT ISOLATION (DATA ACCESS)
    // ----------------------------------------------------
    console.log('\n4. [ISOLATION] Testing Cross-Tenant Isolation...');

    const beanProducts = ((await (await fetch(`${API_BASE}/products`, { headers: beanHeaders })).json()) as any).data;

    // 4.1 Products Isolation
    assert(sunriseProducts.every((p: any) => p.cafe_id === 'cafe-sunrise-001'), 'All Sunrise products have cafe_id cafe-sunrise-001');
    assert(beanProducts.every((p: any) => p.cafe_id === 'cafe-bean-002'), 'All Bean Theory products have cafe_id cafe-bean-002');

    // 4.2 Cross-access product by ID returns 404
    const crossProductRes = await fetch(`${API_BASE}/products/${sunriseProdId}`, { headers: beanHeaders });
    assert(crossProductRes.status === 404, 'Bean Theory accessing Sunrise product ID returns 404 Not Found');

    // 4.3 Customers Isolation
    const sunriseCust = ((await (await fetch(`${API_BASE}/customers`, { headers: sunriseHeaders })).json()) as any).data;
    const beanCust = ((await (await fetch(`${API_BASE}/customers`, { headers: beanHeaders })).json()) as any).data;
    assert(sunriseCust.every((c: any) => c.cafe_id === 'cafe-sunrise-001'), 'Sunrise customers belong exclusively to Sunrise');
    assert(beanCust.every((c: any) => c.cafe_id === 'cafe-bean-002'), 'Bean Theory customers belong exclusively to Bean Theory');

    if (sunriseCust.length > 0) {
      const crossCustRes = await fetch(`${API_BASE}/customers/${sunriseCust[0].id}`, { headers: beanHeaders });
      assert(crossCustRes.status === 404, 'Bean Theory accessing Sunrise customer ID returns 404 Not Found');
    }

    // 4.4 Orders Isolation & Cross-Tenant Order Placement Rejection
    const crossOrderPlacement = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: beanHeaders, // Bean Theory token trying to buy Sunrise product
      body: JSON.stringify({
        items: [{ product_id: sunriseProdId, quantity: 1 }],
        payment_method: 'UPI',
      }),
    });
    assert(crossOrderPlacement.status === 400, 'Bean Theory placing order with Sunrise product rejected (400)');

    // 4.5 Inventory Movements Isolation
    const sunriseMovements = ((await (await fetch(`${API_BASE}/inventory/movements`, { headers: sunriseHeaders })).json()) as any).data;
    const beanMovements = ((await (await fetch(`${API_BASE}/inventory/movements`, { headers: beanHeaders })).json()) as any).data;
    assert(sunriseMovements.every((m: any) => m.cafe_id === 'cafe-sunrise-001'), 'Sunrise inventory movements are completely isolated');
    assert(beanMovements.every((m: any) => m.cafe_id === 'cafe-bean-002'), 'Bean Theory inventory movements are completely isolated');

    // 4.6 AI Insights Isolation
    const sunriseAI = ((await (await fetch(`${API_BASE}/ai/insights`, { headers: sunriseHeaders })).json()) as any).data;
    const beanAI = ((await (await fetch(`${API_BASE}/ai/insights`, { headers: beanHeaders })).json()) as any).data;
    assert(sunriseAI.sales_forecast !== undefined && beanAI.sales_forecast !== undefined, 'AI insights calculate independently for both cafes');

    // ----------------------------------------------------
    // SUITE 5: POS ATOMICITY, RECIPES & INVENTORY DEDUCTION
    // ----------------------------------------------------
    console.log('\n5. [INVENTORY & POS] Testing Stock Atomicity & Deduction...');

    const sunriseInv = ((await (await fetch(`${API_BASE}/inventory`, { headers: sunriseHeaders })).json()) as any).data;
    const beanInv = ((await (await fetch(`${API_BASE}/inventory`, { headers: beanHeaders })).json()) as any).data;

    const coffeeBeansSunrise = sunriseInv.find((i: any) => i.name.toLowerCase().includes('beans'));
    const initialSunriseQty = coffeeBeansSunrise ? coffeeBeansSunrise.current_quantity : 0;

    // 5.1 Place valid order in Sunrise Cafe
    const validOrderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: sunriseHeaders,
      body: JSON.stringify({
        items: [{ product_id: sunriseProdId, quantity: 2 }],
        payment_method: 'UPI',
      }),
    });
    const validOrder = (await validOrderRes.json()) as any;
    assert(validOrderRes.status === 201 && validOrder.success && validOrder.order.cafe_id === 'cafe-sunrise-001', 'Order placed successfully with cafe_id cafe-sunrise-001');

    // 5.2 Stock deducted accurately for Sunrise
    const updatedSunriseInv = ((await (await fetch(`${API_BASE}/inventory`, { headers: sunriseHeaders })).json()) as any).data;
    const updatedCoffeeBeansSunrise = updatedSunriseInv.find((i: any) => i.id === coffeeBeansSunrise?.id);
    assert(updatedCoffeeBeansSunrise && updatedCoffeeBeansSunrise.current_quantity < initialSunriseQty, 'Sunrise inventory quantity deducted after Sunrise order');

    // 5.3 Bean Theory inventory completely untouched
    const updatedBeanInv = ((await (await fetch(`${API_BASE}/inventory`, { headers: beanHeaders })).json()) as any).data;
    const beanBeans = updatedBeanInv.find((i: any) => i.name.toLowerCase().includes('beans'));
    const originalBeanBeans = beanInv.find((i: any) => i.name.toLowerCase().includes('beans'));
    assert(beanBeans && beanBeans.current_quantity === originalBeanBeans?.current_quantity, 'Bean Theory raw inventory remained completely unaffected');

    // ----------------------------------------------------
    // SUITE 6: INDEPENDENT INVOICE SEQUENCING
    // ----------------------------------------------------
    console.log('\n6. [INVOICING] Testing Independent Tenant Invoice Sequences...');

    // 6.1 Sunrise invoice generated
    const sunriseInvoices = ((await (await fetch(`${API_BASE}/invoices`, { headers: sunriseHeaders })).json()) as any).data;
    assert(sunriseInvoices.length > 0 && sunriseInvoices[0].invoice_number.startsWith('SC-2026-'), 'Sunrise invoice has correct prefix SC-2026-');

    // 6.2 Place Bean Theory order and check its invoice
    const beanProdId = beanProducts[0].id;
    const beanOrderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: beanHeaders,
      body: JSON.stringify({
        items: [{ product_id: beanProdId, quantity: 1 }],
        payment_method: 'CASH',
      }),
    });
    const beanOrder = (await beanOrderRes.json()) as any;
    assert(beanOrderRes.status === 201 && beanOrder.success, 'Bean Theory order placed successfully');

    const beanInvoices = ((await (await fetch(`${API_BASE}/invoices`, { headers: beanHeaders })).json()) as any).data;
    assert(beanInvoices.length > 0 && beanInvoices[0].invoice_number.startsWith('BT-2026-'), 'Bean Theory invoice has correct prefix BT-2026-');
    assert(beanInvoices.every((inv: any) => inv.cafe_id === 'cafe-bean-002'), 'Bean Theory invoices contain only Bean Theory records');

    // 6.3 Cross-tenant invoice access by ID returns 404
    const sunriseInvoiceId = sunriseInvoices[0].id;
    const crossInvoiceRes = await fetch(`${API_BASE}/invoices/${sunriseInvoiceId}`, { headers: beanHeaders });
    assert(crossInvoiceRes.status === 404, 'Bean Theory accessing Sunrise invoice ID returns 404 Not Found');

    // ----------------------------------------------------
    // SUITE 7: SHIFTS & AUDIT LOGS ISOLATION
    // ----------------------------------------------------
    console.log('\n7. [SHIFTS & AUDIT] Testing Shift & Audit Isolation...');

    const sunriseShift = ((await (await fetch(`${API_BASE}/shifts/current`, { headers: sunriseHeaders })).json()) as any).data;
    const beanShift = ((await (await fetch(`${API_BASE}/shifts/current`, { headers: beanHeaders })).json()) as any).data;
    assert(sunriseShift?.cafe_id === 'cafe-sunrise-001', 'Sunrise active shift belongs to Sunrise Cafe');
    assert(beanShift?.cafe_id === 'cafe-bean-002', 'Bean Theory active shift belongs to Bean Theory');

    const sunriseAudit = ((await (await fetch(`${API_BASE}/staff/audit-logs`, { headers: sunriseHeaders })).json()) as any).data;
    const beanAudit = ((await (await fetch(`${API_BASE}/staff/audit-logs`, { headers: beanHeaders })).json()) as any).data;
    assert(sunriseAudit.every((a: any) => a.cafe_id === 'cafe-sunrise-001'), 'Sunrise audit trail belongs exclusively to Sunrise');
    assert(beanAudit.every((a: any) => a.cafe_id === 'cafe-bean-002'), 'Bean Theory audit trail belongs exclusively to Bean Theory');

    // ----------------------------------------------------
    // SUITE 8: CAFE & RESTAURANT SELF-REGISTRATION FLOW
    // ----------------------------------------------------
    console.log('\n8. [REGISTRATION & CONCEPTS] Testing Multi-Concept Registration & Starter Data...');

    // 8.1 Full-Service Restaurant Registration
    const restaurantRes = (await (
      await fetch(`${API_BASE}/auth/register-cafe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cafe_name: 'Royal Haveli Fine Dine',
          owner_name: 'Vikramaditya Singhania',
          email: `vikram_${Date.now()}@haveli.demo`,
          password: 'password123',
          phone: '+91 98765 11223',
          address: '45 Heritage Boulevard, Jaipur',
          business_type: 'restaurant',
          invoice_prefix: 'RH-2026-',
        }),
      })
    ).json()) as any;

    assert(restaurantRes.success && restaurantRes.cafe?.name === 'Royal Haveli Fine Dine', 'Full-Service Restaurant registered successfully');
    assert(restaurantRes.cafe?.business_type === 'restaurant', 'Stored business_type is restaurant');

    const restHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${restaurantRes.token}`,
    };

    const restCats = ((await (await fetch(`${API_BASE}/categories`, { headers: restHeaders })).json()) as any).data;
    const catNames = restCats.map((c: any) => c.name);
    assert(catNames.includes('Starters') && catNames.includes('Main Course') && catNames.includes('Indian Breads') && catNames.includes('Rice & Biryani') && catNames.includes('Dal & Curries') && catNames.includes('Tandoor') && catNames.includes('Chinese') && catNames.includes('Desserts') && catNames.includes('Beverages'), 'Restaurant seeded with all 9 required categories');

    const restProds = ((await (await fetch(`${API_BASE}/products`, { headers: restHeaders })).json()) as any).data;
    const prodNames = restProds.map((p: any) => p.name);
    assert(prodNames.includes('Paneer Tikka') && prodNames.includes('Veg Dum Biryani') && prodNames.includes('Butter Naan') && prodNames.includes('Dal Tadka') && prodNames.includes('Paneer Butter Masala') && prodNames.includes('Chicken Dum Biryani') && prodNames.includes('Tandoori Chicken (Half)') && prodNames.includes('Gulab Jamun (2 pcs)') && prodNames.includes('Royal Sweet Lassi'), 'Restaurant seeded with authentic starter menu items');

    const restInv = ((await (await fetch(`${API_BASE}/inventory`, { headers: restHeaders })).json()) as any).data;
    const invNames = restInv.map((i: any) => i.name);
    assert(invNames.some((n: string) => n.includes('Paneer')) && invNames.some((n: string) => n.includes('Basmati')) && invNames.some((n: string) => n.includes('Chicken')) && invNames.some((n: string) => n.includes('Ghee')), 'Restaurant seeded with matching raw materials/inventory');

    const restRecipes = ((await (await fetch(`${API_BASE}/recipes`, { headers: restHeaders })).json()) as any).data;
    assert(restRecipes.length > 0 && restRecipes.every((r: any) => r.calculated_cogs > 0 && r.items.length > 0), 'Restaurant starter items have calculated COGS recipes');

    // 8.2 Verify Starter Menu Items Can Be Edited / Deleted / Added by Owner
    const targetProd = restProds[0];
    const updateProdRes = await fetch(`${API_BASE}/products/${targetProd.id}`, {
      method: 'PUT',
      headers: restHeaders,
      body: JSON.stringify({
        selling_price: 310,
        description: 'Updated gourmet paneer tikka description',
      }),
    });
    const updatedProd = (await updateProdRes.json()) as any;
    assert(updateProdRes.status === 200 && updatedProd.data?.selling_price === 310, 'Owner can edit starter product price and details');

    // 8.3 Quick-Service Restaurant (QSR) Registration
    const qsrRes = (await (
      await fetch(`${API_BASE}/auth/register-cafe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cafe_name: 'Turbo Burger QSR',
          owner_name: 'Samir Khan',
          email: `samir_${Date.now()}@turboburger.demo`,
          password: 'password123',
          phone: '+91 98765 44332',
          business_type: 'qsr',
        }),
      })
    ).json()) as any;

    const qsrHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${qsrRes.token}` };
    const qsrCats = ((await (await fetch(`${API_BASE}/categories`, { headers: qsrHeaders })).json()) as any).data;
    const qsrProds = ((await (await fetch(`${API_BASE}/products`, { headers: qsrHeaders })).json()) as any).data;
    assert(qsrCats.some((c: any) => c.name === 'Burgers') && qsrCats.some((c: any) => c.name === 'Combos'), 'QSR seeded with Burgers and Combos categories');
    assert(qsrProds.some((p: any) => p.name.includes('Burger')) && qsrProds.some((p: any) => p.name.includes('Wrap')), 'QSR seeded with burger and wrap starter items');

    // 8.4 Cloud Kitchen Registration
    const ckRes = (await (
      await fetch(`${API_BASE}/auth/register-cafe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cafe_name: 'BoxMeal Cloud Kitchen',
          owner_name: 'Ritu Sen',
          email: `ritu_${Date.now()}@boxmeal.demo`,
          password: 'password123',
          phone: '+91 98765 99887',
          business_type: 'cloud_kitchen',
        }),
      })
    ).json()) as any;

    const ckHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${ckRes.token}` };
    const ckCats = ((await (await fetch(`${API_BASE}/categories`, { headers: ckHeaders })).json()) as any).data;
    const ckProds = ((await (await fetch(`${API_BASE}/products`, { headers: ckHeaders })).json()) as any).data;
    assert(ckCats.some((c: any) => c.name === 'Packaging') && ckCats.some((c: any) => c.name === 'Combos'), 'Cloud Kitchen seeded with Packaging and Combos');
    assert(ckProds.some((p: any) => p.name.includes('Thali') || p.name.includes('Box')), 'Cloud Kitchen seeded with thali & meal box items');

    // 8.5 Strict Tenant Isolation Check across new concepts
    assert(restProds.every((p: any) => p.cafe_id === restaurantRes.cafe.id), 'Restaurant products isolated strictly to restaurant tenant');
    assert(qsrProds.every((p: any) => p.cafe_id === qsrRes.cafe.id), 'QSR products isolated strictly to QSR tenant');
    assert(ckProds.every((p: any) => p.cafe_id === ckRes.cafe.id), 'Cloud kitchen products isolated strictly to cloud kitchen tenant');

    // ----------------------------------------------------
    // SUITE 9: DATABASE MIGRATOR & BACKWARD COMPATIBILITY
    // ----------------------------------------------------
    console.log('\n9. [MIGRATOR] Testing Automated Migration Runner & Idempotency...');
    const { DatabaseMigrator } = await import('../database/migrator');

    // 9.1 Execute migration runner
    const migrationRun1 = await DatabaseMigrator.runMigrations();
    assert(
      migrationRun1.applied.includes('001_add_business_type_to_cafes.sql') ||
        migrationRun1.skipped.includes('001_add_business_type_to_cafes.sql'),
      'DatabaseMigrator successfully processed 001_add_business_type_to_cafes.sql'
    );

    // 9.2 Execute migration runner second time to prove idempotency
    const migrationRun2 = await DatabaseMigrator.runMigrations();
    assert(
      migrationRun2.skipped.includes('001_add_business_type_to_cafes.sql'),
      'DatabaseMigrator is idempotent: subsequent runs safely skip already applied migrations'
    );

    // 9.3 Verify demo cafes (Sunrise Cafe and Bean Theory) remain completely operational
    const reSunriseRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@sunrise.demo', password: 'demo123' }),
    });
    const reSunrise = (await reSunriseRes.json()) as any;
    assert(reSunriseRes.status === 200 && reSunrise.cafe?.id === 'cafe-sunrise-001', 'Sunrise Demo Cafe continues working normally with zero disruption');

    const reBeanRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@bean.demo', password: 'demo123' }),
    });
    const reBean = (await reBeanRes.json()) as any;
    assert(reBeanRes.status === 200 && reBean.cafe?.id === 'cafe-bean-002', 'Bean Theory Demo Cafe continues working normally with zero disruption');

    // ----------------------------------------------------
    // SUMMARY
    // ----------------------------------------------------
    console.log(`\n======================================================`);
    console.log(`COMPREHENSIVE AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================\n`);

    server.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (err: any) {
    console.error('Test execution error:', err);
    server.close();
    process.exit(1);
  }
}

runTests();
