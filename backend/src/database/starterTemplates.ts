import { v4 as uuidv4 } from 'uuid';
import { Category, Product, InventoryItem, Recipe } from './seedData';

export type BusinessType =
  | 'restaurant'
  | 'qsr'
  | 'cloud_kitchen'
  | 'roastery'
  | 'bakery'
  | 'bistro'
  | 'tea';

export interface StarterDataResult {
  categories: Category[];
  inventory: InventoryItem[];
  products: Product[];
  recipes: Recipe[];
}

export const normalizeBusinessType = (type?: string): BusinessType => {
  if (!type) return 'restaurant';
  const lower = type.toLowerCase().trim();
  if (lower.includes('full') || lower.includes('restaurant') || lower === 'dining') return 'restaurant';
  if (lower.includes('qsr') || lower.includes('quick') || lower.includes('fast')) return 'qsr';
  if (lower.includes('cloud') || lower.includes('kitchen') || lower.includes('delivery')) return 'cloud_kitchen';
  if (lower.includes('roast') || lower.includes('coffee')) return 'roastery';
  if (lower.includes('bake') || lower.includes('pastry')) return 'bakery';
  if (lower.includes('bistro') || lower.includes('cafe')) return 'bistro';
  if (lower.includes('tea') || lower.includes('chai') || lower.includes('lounge')) return 'tea';
  return 'restaurant';
};

export const generateStarterDataForTenant = (
  cafeId: string,
  cafeSlug: string,
  rawBusinessType?: string
): StarterDataResult => {
  const concept = normalizeBusinessType(rawBusinessType);
  const prefix = (cafeSlug.substring(0, 3) || 'CF').toUpperCase();
  const now = new Date().toISOString();

  let categoryDefs: Array<{ slug: string; name: string; desc: string; icon: string; order: number }> = [];
  let rawMaterialDefs: Array<{
    name: string;
    sku: string;
    category: string;
    qty: number;
    unit: string;
    min: number;
    cost: number;
    supplier: string;
  }> = [];
  let productDefs: Array<{
    name: string;
    sku: string;
    catSlug: string;
    desc: string;
    price: number;
    gst: number;
    image: string;
    stock: number;
    minStock: number;
    instructions: string;
    prepTime: number;
    recipeItems: Array<{ rawName: string; qty: number; unit: string }>;
  }> = [];

  switch (concept) {
    case 'restaurant':
      categoryDefs = [
        { slug: 'starters', name: 'Starters', desc: 'Tandoori, Crispy & Platter Starters', icon: 'Utensils', order: 1 },
        { slug: 'main-course', name: 'Main Course', desc: 'North Indian, Mughlai & Gourmet Mains', icon: 'Soup', order: 2 },
        { slug: 'indian-breads', name: 'Indian Breads', desc: 'Tandoori Roti, Naan & Kulcha', icon: 'Sandwich', order: 3 },
        { slug: 'rice-biryani', name: 'Rice & Biryani', desc: 'Dum Biryanis, Pulao & Fragrant Rice', icon: 'Soup', order: 4 },
        { slug: 'dal-curries', name: 'Dal & Curries', desc: 'Homestyle Dals, Rich Gravies & Tadka', icon: 'Soup', order: 5 },
        { slug: 'tandoor', name: 'Tandoor', desc: 'Clay Oven Roasted Kebabs & Tikkas', icon: 'Flame', order: 6 },
        { slug: 'chinese', name: 'Chinese', desc: 'Wok-tossed Noodles, Fried Rice & Starters', icon: 'Utensils', order: 7 },
        { slug: 'desserts', name: 'Desserts', desc: 'Traditional Sweets & Hot Desserts', icon: 'Cake', order: 8 },
        { slug: 'beverages', name: 'Beverages', desc: 'Lassis, Chaas, Mocktails & Coolers', icon: 'GlassWater', order: 9 },
      ];

      rawMaterialDefs = [
        { name: 'Fresh Malai Paneer', sku: `${prefix}-RAW-PAN-01`, category: 'Dairy', qty: 12.0, unit: 'kg', min: 4.0, cost: 380, supplier: 'Metro Fresh Dairy' },
        { name: 'Premium Aged Basmati Rice', sku: `${prefix}-RAW-RIC-01`, category: 'Grains', qty: 50.0, unit: 'kg', min: 15.0, cost: 110, supplier: 'India Gate Select' },
        { name: 'Fresh Farm Chicken Cuts', sku: `${prefix}-RAW-CHK-01`, category: 'Poultry', qty: 25.0, unit: 'kg', min: 8.0, cost: 260, supplier: 'Fresh Meat Direct' },
        { name: 'Shuddh Desi Ghee & Butter', sku: `${prefix}-RAW-GHE-01`, category: 'Dairy', qty: 12.0, unit: 'kg', min: 4.0, cost: 620, supplier: 'Amul Dairy Hub' },
        { name: 'Refined Wheat Flour & Atta', sku: `${prefix}-RAW-FLR-01`, category: 'Dry Goods', qty: 60.0, unit: 'kg', min: 20.0, cost: 45, supplier: 'Fortune Flour Mill' },
        { name: 'Toor & Yellow Dal Mix', sku: `${prefix}-RAW-DAL-01`, category: 'Pulses', qty: 30.0, unit: 'kg', min: 10.0, cost: 140, supplier: 'Tata Sampann' },
        { name: 'Full Cream Milk & Fresh Curd', sku: `${prefix}-RAW-MLK-01`, category: 'Dairy', qty: 30.0, unit: 'L', min: 10.0, cost: 65, supplier: 'Amul Fresh Hub' },
        { name: 'Authentic Garam Masala & Whole Spices', sku: `${prefix}-RAW-SPC-01`, category: 'Spices', qty: 6.0, unit: 'kg', min: 2.0, cost: 480, supplier: 'MDH Spice Hub' },
        { name: 'Gulab Jamun Mawa Mix', sku: `${prefix}-RAW-GJM-01`, category: 'Bakery', qty: 8.0, unit: 'kg', min: 3.0, cost: 320, supplier: 'Bikaji Sweet Base' },
      ];

      productDefs = [
        {
          name: 'Paneer Tikka',
          sku: `${prefix}-STA-01`,
          catSlug: 'starters',
          desc: 'Succulent cubes of malai paneer marinated in spiced yogurt, charred in clay tandoor with bell peppers',
          price: 280,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80',
          stock: 60,
          minStock: 10,
          instructions: '1. Marinate 150g paneer in spiced curd for 30m. 2. Skewer with capsicum. 3. Tandoor roast for 6-8 mins.',
          prepTime: 12,
          recipeItems: [
            { rawName: 'Fresh Malai Paneer', qty: 0.150, unit: 'kg' },
            { rawName: 'Full Cream Milk & Fresh Curd', qty: 0.050, unit: 'L' },
            { rawName: 'Authentic Garam Masala & Whole Spices', qty: 0.015, unit: 'kg' },
            { rawName: 'Shuddh Desi Ghee & Butter', qty: 0.012, unit: 'kg' },
          ],
        },
        {
          name: 'Veg Dum Biryani',
          sku: `${prefix}-RIC-01`,
          catSlug: 'rice-biryani',
          desc: 'Fragrant basmati rice layered with paneer, garden veggies, saffron, and slow-cooked in handi',
          price: 290,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
          stock: 45,
          minStock: 8,
          instructions: '1. Parboil 200g basmati rice. 2. Layer with spiced paneer gravy. 3. Dum seal for 15 mins with desi ghee.',
          prepTime: 18,
          recipeItems: [
            { rawName: 'Premium Aged Basmati Rice', qty: 0.200, unit: 'kg' },
            { rawName: 'Fresh Malai Paneer', qty: 0.060, unit: 'kg' },
            { rawName: 'Shuddh Desi Ghee & Butter', qty: 0.020, unit: 'kg' },
            { rawName: 'Authentic Garam Masala & Whole Spices', qty: 0.020, unit: 'kg' },
            { rawName: 'Full Cream Milk & Fresh Curd', qty: 0.020, unit: 'L' },
          ],
        },
        {
          name: 'Butter Naan',
          sku: `${prefix}-BRD-01`,
          catSlug: 'indian-breads',
          desc: 'Traditional clay-oven baked refined flour flatbread brushed with molten desi butter',
          price: 60,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
          stock: 120,
          minStock: 25,
          instructions: '1. Roll 120g fermented dough. 2. Slap onto tandoor wall. 3. Bake for 90s and brush with melted butter.',
          prepTime: 4,
          recipeItems: [
            { rawName: 'Refined Wheat Flour & Atta', qty: 0.120, unit: 'kg' },
            { rawName: 'Shuddh Desi Ghee & Butter', qty: 0.012, unit: 'kg' },
            { rawName: 'Full Cream Milk & Fresh Curd', qty: 0.015, unit: 'L' },
          ],
        },
        {
          name: 'Dal Tadka',
          sku: `${prefix}-DAL-01`,
          catSlug: 'dal-curries',
          desc: 'Yellow lentils tempered with fragrant cumin, garlic, Kashmiri dry red chilies & pure desi ghee',
          price: 220,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
          stock: 50,
          minStock: 10,
          instructions: '1. Pressure cook 120g dal mix. 2. Prepare garlic-cumin tadka in desi ghee. 3. Simmer 4 mins.',
          prepTime: 10,
          recipeItems: [
            { rawName: 'Toor & Yellow Dal Mix', qty: 0.120, unit: 'kg' },
            { rawName: 'Shuddh Desi Ghee & Butter', qty: 0.025, unit: 'kg' },
            { rawName: 'Authentic Garam Masala & Whole Spices', qty: 0.020, unit: 'kg' },
          ],
        },
        {
          name: 'Paneer Butter Masala',
          sku: `${prefix}-MAI-01`,
          catSlug: 'main-course',
          desc: 'Fresh paneer simmered in a velvety, buttery tomato cashew gravy infused with kasuri methi',
          price: 320,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
          stock: 40,
          minStock: 8,
          instructions: '1. Heat makhani gravy base with 30g butter. 2. Add 150g paneer cubes. 3. Finish with cream & kasuri methi.',
          prepTime: 10,
          recipeItems: [
            { rawName: 'Fresh Malai Paneer', qty: 0.150, unit: 'kg' },
            { rawName: 'Shuddh Desi Ghee & Butter', qty: 0.030, unit: 'kg' },
            { rawName: 'Full Cream Milk & Fresh Curd', qty: 0.050, unit: 'L' },
            { rawName: 'Authentic Garam Masala & Whole Spices', qty: 0.015, unit: 'kg' },
          ],
        },
        {
          name: 'Chicken Dum Biryani',
          sku: `${prefix}-RIC-02`,
          catSlug: 'rice-biryani',
          desc: 'Tender spiced chicken pieces dum-cooked with aged long grain basmati rice, mint & saffron',
          price: 360,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&auto=format&fit=crop&q=80',
          stock: 40,
          minStock: 8,
          instructions: '1. Marinate 220g chicken in spices. 2. Layer parboiled basmati rice. 3. Dum cook for 20 mins.',
          prepTime: 20,
          recipeItems: [
            { rawName: 'Premium Aged Basmati Rice', qty: 0.200, unit: 'kg' },
            { rawName: 'Fresh Farm Chicken Cuts', qty: 0.220, unit: 'kg' },
            { rawName: 'Shuddh Desi Ghee & Butter', qty: 0.015, unit: 'kg' },
            { rawName: 'Authentic Garam Masala & Whole Spices', qty: 0.020, unit: 'kg' },
          ],
        },
        {
          name: 'Tandoori Chicken (Half)',
          sku: `${prefix}-TAN-01`,
          catSlug: 'tandoor',
          desc: 'Classic bone-in chicken marinated in hung curd and tandoori spices, roasted over charcoal',
          price: 340,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=500&auto=format&fit=crop&q=80',
          stock: 35,
          minStock: 6,
          instructions: '1. Score chicken and marinate in hung curd. 2. Roast in clay oven at 260C for 14 mins. 3. Baste with butter.',
          prepTime: 16,
          recipeItems: [
            { rawName: 'Fresh Farm Chicken Cuts', qty: 0.300, unit: 'kg' },
            { rawName: 'Full Cream Milk & Fresh Curd', qty: 0.060, unit: 'L' },
            { rawName: 'Authentic Garam Masala & Whole Spices', qty: 0.020, unit: 'kg' },
            { rawName: 'Shuddh Desi Ghee & Butter', qty: 0.005, unit: 'kg' },
          ],
        },
        {
          name: 'Gulab Jamun (2 pcs)',
          sku: `${prefix}-DES-01`,
          catSlug: 'desserts',
          desc: 'Warm khoya dumplings soaked in fragrant cardamom & saffron sugar syrup',
          price: 110,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500&auto=format&fit=crop&q=80',
          stock: 80,
          minStock: 15,
          instructions: '1. Fry mawa dumplings in pure ghee. 2. Steep in warm saffron-cardamom syrup.',
          prepTime: 3,
          recipeItems: [
            { rawName: 'Gulab Jamun Mawa Mix', qty: 0.070, unit: 'kg' },
            { rawName: 'Shuddh Desi Ghee & Butter', qty: 0.010, unit: 'kg' },
          ],
        },
        {
          name: 'Royal Sweet Lassi',
          sku: `${prefix}-BEV-01`,
          catSlug: 'beverages',
          desc: 'Thick churned Punjabi sweet curd lassi topped with malai, cardamom and roasted pistachios',
          price: 120,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1571006682885-300e84d4b1a2?w=500&auto=format&fit=crop&q=80',
          stock: 60,
          minStock: 12,
          instructions: '1. Blend fresh chilled curd with sugar. 2. Pour into kulhad glass. 3. Top with malai & pistachios.',
          prepTime: 4,
          recipeItems: [
            { rawName: 'Full Cream Milk & Fresh Curd', qty: 0.300, unit: 'L' },
            { rawName: 'Shuddh Desi Ghee & Butter', qty: 0.005, unit: 'kg' },
            { rawName: 'Authentic Garam Masala & Whole Spices', qty: 0.005, unit: 'kg' },
          ],
        },
      ];
      break;

    case 'qsr':
      categoryDefs = [
        { slug: 'burgers', name: 'Burgers', desc: 'Crispy Veg & Chicken Gourmet Burgers', icon: 'Utensils', order: 1 },
        { slug: 'wraps', name: 'Wraps', desc: 'Toasted Tortilla & Kathi Wraps', icon: 'Sandwich', order: 2 },
        { slug: 'sandwiches', name: 'Sandwiches', desc: 'Grilled Paninis & Club Sandwiches', icon: 'Sandwich', order: 3 },
        { slug: 'fries-sides', name: 'Fries & Sides', desc: 'Crinkle Fries, Cheese Balls & Nuggets', icon: 'Utensils', order: 4 },
        { slug: 'combos', name: 'Combos', desc: 'Value Meal Combos with Sides & Drinks', icon: 'Utensils', order: 5 },
        { slug: 'beverages', name: 'Beverages', desc: 'Fountain Sodas, Iced Teas & Milkshakes', icon: 'GlassWater', order: 6 },
        { slug: 'desserts', name: 'Desserts', desc: 'Warm Choco Lava & Sundaes', icon: 'Cake', order: 7 },
      ];

      rawMaterialDefs = [
        { name: 'Brioche Burger Buns', sku: `${prefix}-RAW-BUN-01`, category: 'Bakery', qty: 120, unit: 'pcs', min: 30, cost: 18, supplier: 'Bakers Choice' },
        { name: 'Crispy Herb Veg Patty', sku: `${prefix}-RAW-VPT-01`, category: 'Frozen', qty: 80, unit: 'pcs', min: 20, cost: 25, supplier: 'McCain Foods' },
        { name: 'Crispy Chicken Patty & Strips', sku: `${prefix}-RAW-CPT-01`, category: 'Frozen', qty: 60, unit: 'pcs', min: 20, cost: 42, supplier: 'Godrej Yummiez' },
        { name: 'Frozen Crinkle Cut Fries', sku: `${prefix}-RAW-FRS-01`, category: 'Frozen', qty: 30.0, unit: 'kg', min: 10.0, cost: 120, supplier: 'HyFun Foods' },
        { name: 'Tortilla Flour Wraps 8-inch', sku: `${prefix}-RAW-WRP-01`, category: 'Bakery', qty: 100, unit: 'pcs', min: 25, cost: 12, supplier: 'Mission Foods' },
        { name: 'Cheddar Cheese Melt Slices', sku: `${prefix}-RAW-CHS-01`, category: 'Dairy', qty: 150, unit: 'pcs', min: 40, cost: 14, supplier: 'Amul Hub' },
        { name: 'Signature Mayo & Peri-Peri Sauce', sku: `${prefix}-RAW-SAU-01`, category: 'Condiments', qty: 15.0, unit: 'kg', min: 4.0, cost: 190, supplier: 'Veeba Sauces' },
        { name: 'Fountain Soda Beverage Syrup', sku: `${prefix}-RAW-SOD-01`, category: 'Beverage', qty: 20.0, unit: 'L', min: 5.0, cost: 75, supplier: 'Beverage Direct' },
        { name: 'Eco Kraft QSR Boxes & Cups', sku: `${prefix}-RAW-BOX-01`, category: 'Packaging', qty: 400, unit: 'pcs', min: 100, cost: 5.5, supplier: 'EcoPack India' },
      ];

      productDefs = [
        {
          name: 'Classic Crispy Veg Burger',
          sku: `${prefix}-QSR-01`,
          catSlug: 'burgers',
          desc: 'Crispy herb potato patty topped with fresh lettuce, mayo, cheddar slice and brioche bun',
          price: 160,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
          stock: 75,
          minStock: 15,
          instructions: '1. Fry veg patty 3m. 2. Toast brioche bun. 3. Layer mayo, lettuce, cheese slice and pack.',
          prepTime: 4,
          recipeItems: [
            { rawName: 'Brioche Burger Buns', qty: 1, unit: 'pcs' },
            { rawName: 'Crispy Herb Veg Patty', qty: 1, unit: 'pcs' },
            { rawName: 'Cheddar Cheese Melt Slices', qty: 1, unit: 'pcs' },
            { rawName: 'Signature Mayo & Peri-Peri Sauce', qty: 0.025, unit: 'kg' },
            { rawName: 'Eco Kraft QSR Boxes & Cups', qty: 1, unit: 'pcs' },
          ],
        },
        {
          name: 'Spicy Crispy Chicken Wrap',
          sku: `${prefix}-QSR-02`,
          catSlug: 'wraps',
          desc: 'Golden crispy chicken strips tossed in peri-peri sauce, folded in a warm toasted tortilla',
          price: 210,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&auto=format&fit=crop&q=80',
          stock: 60,
          minStock: 12,
          instructions: '1. Deep fry chicken strips. 2. Warm tortilla wrap. 3. Add chipotle sauce, cheese & fold.',
          prepTime: 5,
          recipeItems: [
            { rawName: 'Tortilla Flour Wraps 8-inch', qty: 1, unit: 'pcs' },
            { rawName: 'Crispy Chicken Patty & Strips', qty: 1, unit: 'pcs' },
            { rawName: 'Cheddar Cheese Melt Slices', qty: 1, unit: 'pcs' },
            { rawName: 'Signature Mayo & Peri-Peri Sauce', qty: 0.025, unit: 'kg' },
            { rawName: 'Eco Kraft QSR Boxes & Cups', qty: 1, unit: 'pcs' },
          ],
        },
        {
          name: 'Peri-Peri Crinkle Fries',
          sku: `${prefix}-QSR-03`,
          catSlug: 'fries-sides',
          desc: 'Crinkle cut golden french fries tossed in zesty African peri-peri seasoning',
          price: 130,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
          stock: 80,
          minStock: 15,
          instructions: '1. Fry 180g fries at 175C for 3 mins. 2. Toss in peri-peri shaker. 3. Box with dip.',
          prepTime: 3,
          recipeItems: [
            { rawName: 'Frozen Crinkle Cut Fries', qty: 0.180, unit: 'kg' },
            { rawName: 'Signature Mayo & Peri-Peri Sauce', qty: 0.020, unit: 'kg' },
            { rawName: 'Eco Kraft QSR Boxes & Cups', qty: 1, unit: 'pcs' },
          ],
        },
        {
          name: 'Loaded Burger & Fries Combo',
          sku: `${prefix}-QSR-04`,
          catSlug: 'combos',
          desc: 'Choice of crispy burger served with peri-peri fries and a chilled fountain soda',
          price: 290,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=500&auto=format&fit=crop&q=80',
          stock: 50,
          minStock: 10,
          instructions: '1. Assemble crispy burger. 2. Fry side portion fries. 3. Fill fountain drink.',
          prepTime: 6,
          recipeItems: [
            { rawName: 'Brioche Burger Buns', qty: 1, unit: 'pcs' },
            { rawName: 'Crispy Herb Veg Patty', qty: 1, unit: 'pcs' },
            { rawName: 'Frozen Crinkle Cut Fries', qty: 0.120, unit: 'kg' },
            { rawName: 'Fountain Soda Beverage Syrup', qty: 0.150, unit: 'L' },
            { rawName: 'Eco Kraft QSR Boxes & Cups', qty: 2, unit: 'pcs' },
          ],
        },
        {
          name: 'Chilled Cola Fizz (500ml)',
          sku: `${prefix}-QSR-05`,
          catSlug: 'beverages',
          desc: 'Refreshing ice-cold fountain soda with fizzy citrus undertones',
          price: 80,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500&auto=format&fit=crop&q=80',
          stock: 120,
          minStock: 25,
          instructions: '1. Dispense 500ml chilled soda into eco paper cup.',
          prepTime: 1,
          recipeItems: [
            { rawName: 'Fountain Soda Beverage Syrup', qty: 0.200, unit: 'L' },
            { rawName: 'Eco Kraft QSR Boxes & Cups', qty: 1, unit: 'pcs' },
          ],
        },
        {
          name: 'Warm Choco Lava Cake',
          sku: `${prefix}-QSR-06`,
          catSlug: 'desserts',
          desc: 'Warm decadent chocolate cake with a molten dark fudge center',
          price: 120,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80',
          stock: 40,
          minStock: 10,
          instructions: '1. Microwave for 30s until molten center oozes. 2. Pack in dessert box.',
          prepTime: 2,
          recipeItems: [
            { rawName: 'Brioche Burger Buns', qty: 1, unit: 'pcs' },
            { rawName: 'Eco Kraft QSR Boxes & Cups', qty: 1, unit: 'pcs' },
          ],
        },
      ];
      break;

    case 'cloud_kitchen':
      categoryDefs = [
        { slug: 'starters', name: 'Starters', desc: 'Quick Delivery Starters & Appetizers', icon: 'Utensils', order: 1 },
        { slug: 'main-course', name: 'Main Course', desc: 'Rich Curries & Gravy Bowls', icon: 'Soup', order: 2 },
        { slug: 'rice-biryani', name: 'Rice & Biryani', desc: 'Delivery Dum Biryani & Pulao', icon: 'Soup', order: 3 },
        { slug: 'combos', name: 'Combos', desc: 'Executive Thalis & Box Meals', icon: 'Utensils', order: 4 },
        { slug: 'beverages', name: 'Beverages', desc: 'Sealed Bottles & Cold Coolers', icon: 'GlassWater', order: 5 },
        { slug: 'desserts', name: 'Desserts', desc: 'Packaged Sweets & Delicacies', icon: 'Cake', order: 6 },
        { slug: 'packaging', name: 'Packaging', desc: 'Tamper-proof Boxes & Pouches', icon: 'Package', order: 7 },
      ];

      rawMaterialDefs = [
        { name: 'Basmati Biryani Rice', sku: `${prefix}-RAW-RIC-01`, category: 'Grains', qty: 40.0, unit: 'kg', min: 12.0, cost: 105, supplier: 'India Gate' },
        { name: 'Fresh Malai Paneer Cubes', sku: `${prefix}-RAW-PAN-01`, category: 'Dairy', qty: 12.0, unit: 'kg', min: 4.0, cost: 380, supplier: 'Amul Hub' },
        { name: 'Boneless Chicken Breast Cubes', sku: `${prefix}-RAW-CHK-01`, category: 'Poultry', qty: 20.0, unit: 'kg', min: 6.0, cost: 280, supplier: 'Fresh Meat Hub' },
        { name: 'Rich Onion-Tomato Gravy Base', sku: `${prefix}-RAW-GRV-01`, category: 'Sauces', qty: 25.0, unit: 'kg', min: 8.0, cost: 95, supplier: 'Chef Base Foods' },
        { name: 'Desi Ghee & Refined Oil', sku: `${prefix}-RAW-OIL-01`, category: 'Oils', qty: 18.0, unit: 'L', min: 6.0, cost: 180, supplier: 'Fortune Hub' },
        { name: 'Dum Biryani & Curry Masala', sku: `${prefix}-RAW-SPC-01`, category: 'Spices', qty: 6.0, unit: 'kg', min: 2.0, cost: 450, supplier: 'MDH Spices' },
        { name: '3-Compartment Meal Trays with Lids', sku: `${prefix}-RAW-TRY-01`, category: 'Packaging', qty: 350, unit: 'pcs', min: 100, cost: 9.0, supplier: 'SmartPack India' },
        { name: 'Heavy-Duty Delivery Paper Bags', sku: `${prefix}-RAW-BAG-01`, category: 'Packaging', qty: 400, unit: 'pcs', min: 100, cost: 4.5, supplier: 'SmartPack India' },
        { name: 'Sealed Beverage Bottles 300ml', sku: `${prefix}-RAW-BTL-01`, category: 'Packaging', qty: 250, unit: 'pcs', min: 80, cost: 3.5, supplier: 'BottlePack India' },
      ];

      productDefs = [
        {
          name: 'Executive Shahi Paneer Thali Box',
          sku: `${prefix}-CK-01`,
          catSlug: 'combos',
          desc: 'Deluxe meal tray with Shahi Paneer, Jeera Rice, Dal Makhani, 2 Parathas, Salad & Gulab Jamun',
          price: 280,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
          stock: 60,
          minStock: 12,
          instructions: '1. Portion paneer & dal in compartments. 2. Pack rice & parathas. 3. Seal with tamper-evident film.',
          prepTime: 8,
          recipeItems: [
            { rawName: 'Fresh Malai Paneer Cubes', qty: 0.120, unit: 'kg' },
            { rawName: 'Basmati Biryani Rice', qty: 0.150, unit: 'kg' },
            { rawName: 'Rich Onion-Tomato Gravy Base', qty: 0.100, unit: 'kg' },
            { rawName: 'Desi Ghee & Refined Oil', qty: 0.015, unit: 'L' },
            { rawName: '3-Compartment Meal Trays with Lids', qty: 1, unit: 'pcs' },
            { rawName: 'Heavy-Duty Delivery Paper Bags', qty: 1, unit: 'pcs' },
          ],
        },
        {
          name: 'Hyderabadi Dum Chicken Biryani Box',
          sku: `${prefix}-CK-02`,
          catSlug: 'rice-biryani',
          desc: 'Authentic dum cooked boneless chicken biryani served with spiced salan & cucumber raita',
          price: 320,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
          stock: 50,
          minStock: 10,
          instructions: '1. Portion hot dum biryani into container. 2. Pack side raita & salan containers. 3. Seal.',
          prepTime: 6,
          recipeItems: [
            { rawName: 'Basmati Biryani Rice', qty: 0.180, unit: 'kg' },
            { rawName: 'Boneless Chicken Breast Cubes', qty: 0.200, unit: 'kg' },
            { rawName: 'Desi Ghee & Refined Oil', qty: 0.015, unit: 'L' },
            { rawName: 'Dum Biryani & Curry Masala', qty: 0.015, unit: 'kg' },
            { rawName: '3-Compartment Meal Trays with Lids', qty: 1, unit: 'pcs' },
            { rawName: 'Heavy-Duty Delivery Paper Bags', qty: 1, unit: 'pcs' },
          ],
        },
        {
          name: 'Butter Chicken Rice Bowl',
          sku: `${prefix}-CK-03`,
          catSlug: 'main-course',
          desc: 'Tender chicken tikka cooked in rich buttery makhani gravy over a bed of fragrant jeera basmati rice',
          price: 290,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500&auto=format&fit=crop&q=80',
          stock: 45,
          minStock: 8,
          instructions: '1. Layer 150g rice in bowl. 2. Top with 160g chicken in gravy. 3. Drizzle cream & seal lid.',
          prepTime: 5,
          recipeItems: [
            { rawName: 'Basmati Biryani Rice', qty: 0.150, unit: 'kg' },
            { rawName: 'Boneless Chicken Breast Cubes', qty: 0.160, unit: 'kg' },
            { rawName: 'Rich Onion-Tomato Gravy Base', qty: 0.080, unit: 'kg' },
            { rawName: 'Desi Ghee & Refined Oil', qty: 0.015, unit: 'L' },
            { rawName: '3-Compartment Meal Trays with Lids', qty: 1, unit: 'pcs' },
            { rawName: 'Heavy-Duty Delivery Paper Bags', qty: 1, unit: 'pcs' },
          ],
        },
        {
          name: 'Dal Makhani & Jeera Rice Meal',
          sku: `${prefix}-CK-04`,
          catSlug: 'main-course',
          desc: 'Slow cooked black lentils simmered overnight with butter, paired with steamed jeera rice',
          price: 240,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
          stock: 50,
          minStock: 10,
          instructions: '1. Portion hot dal makhani and jeera rice. 2. Seal tamper-proof container.',
          prepTime: 4,
          recipeItems: [
            { rawName: 'Basmati Biryani Rice', qty: 0.150, unit: 'kg' },
            { rawName: 'Rich Onion-Tomato Gravy Base', qty: 0.100, unit: 'kg' },
            { rawName: 'Desi Ghee & Refined Oil', qty: 0.020, unit: 'L' },
            { rawName: 'Dum Biryani & Curry Masala', qty: 0.010, unit: 'kg' },
            { rawName: '3-Compartment Meal Trays with Lids', qty: 1, unit: 'pcs' },
            { rawName: 'Heavy-Duty Delivery Paper Bags', qty: 1, unit: 'pcs' },
          ],
        },
        {
          name: 'Fresh Mint Chaas (300ml Bottle)',
          sku: `${prefix}-CK-05`,
          catSlug: 'beverages',
          desc: 'Refreshing spiced buttermilk with mint, roasted cumin, and black salt in a sealed bottle',
          price: 70,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1571006682885-300e84d4b1a2?w=500&auto=format&fit=crop&q=80',
          stock: 80,
          minStock: 15,
          instructions: '1. Fill 300ml fresh mint chaas. 2. Cap with tamper seal lock.',
          prepTime: 1,
          recipeItems: [
            { rawName: 'Fresh Malai Paneer Cubes', qty: 0.050, unit: 'kg' },
            { rawName: 'Dum Biryani & Curry Masala', qty: 0.005, unit: 'kg' },
            { rawName: 'Sealed Beverage Bottles 300ml', qty: 1, unit: 'pcs' },
          ],
        },
        {
          name: 'Gulab Jamun (2 pcs Box)',
          sku: `${prefix}-CK-06`,
          catSlug: 'desserts',
          desc: 'Warm khoya gulab jamuns in sealed dessert container',
          price: 95,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500&auto=format&fit=crop&q=80',
          stock: 70,
          minStock: 15,
          instructions: '1. Place 2 warm gulab jamuns with syrup in sealed dessert container.',
          prepTime: 2,
          recipeItems: [
            { rawName: 'Fresh Malai Paneer Cubes', qty: 0.080, unit: 'kg' },
            { rawName: '3-Compartment Meal Trays with Lids', qty: 1, unit: 'pcs' },
          ],
        },
      ];
      break;

    case 'roastery':
    default:
      categoryDefs = [
        { slug: 'coffee', name: 'Coffee', desc: 'Espresso, Cappuccinos & Americanos', icon: 'Coffee', order: 1 },
        { slug: 'manual-brews', name: 'Manual Brews', desc: 'V60, Aeropress & French Press', icon: 'Coffee', order: 2 },
        { slug: 'cold-brews', name: 'Cold Brews', desc: 'Steeped Nitro & Tonic Cold Brews', icon: 'GlassWater', order: 3 },
        { slug: 'sandwiches', name: 'Sandwiches', desc: 'Artisan Paninis & Grilled Bites', icon: 'Sandwich', order: 4 },
        { slug: 'desserts', name: 'Pastries & Desserts', desc: 'Croissants, Cheesecakes & Brownies', icon: 'Cake', order: 5 },
        { slug: 'addons', name: 'Add-ons', desc: 'Syrups, Extra Shots & Plant Milks', icon: 'PlusCircle', order: 6 },
      ];

      rawMaterialDefs = [
        { name: 'Arabica Espresso Roast Beans', sku: `${prefix}-RAW-BN-01`, category: 'Coffee', qty: 8.0, unit: 'kg', min: 2.5, cost: 1200, supplier: 'Blue Mountain Roasters' },
        { name: 'Whole Cream Dairy Milk', sku: `${prefix}-RAW-MLK-01`, category: 'Dairy', qty: 15.0, unit: 'L', min: 8.0, cost: 65, supplier: 'Amul Fresh Hub' },
        { name: 'Barista Edition Oat Milk', sku: `${prefix}-RAW-OAT-01`, category: 'Dairy Alternatives', qty: 10.0, unit: 'L', min: 4.0, cost: 290, supplier: 'Oatly Hub' },
        { name: 'Organic Brown Sugar & Syrups', sku: `${prefix}-RAW-SUG-01`, category: 'Dry Goods', qty: 8.0, unit: 'kg', min: 3.0, cost: 75, supplier: 'Nature Basket' },
        { name: 'Artisan Sourdough Loaves', sku: `${prefix}-RAW-BRD-01`, category: 'Bakery', qty: 18, unit: 'pcs', min: 6, cost: 80, supplier: 'Craft Bakers' },
        { name: 'Fresh Malai Paneer & Cheese', sku: `${prefix}-RAW-PAN-01`, category: 'Dairy', qty: 5.0, unit: 'kg', min: 2.0, cost: 380, supplier: 'Amul Hub' },
        { name: 'Eco Takeaway Hot Cups 80mm', sku: `${prefix}-RAW-CUP-01`, category: 'Packaging', qty: 350, unit: 'pcs', min: 100, cost: 4.5, supplier: 'EcoPack India' },
      ];

      productDefs = [
        {
          name: 'House Blend Cappuccino',
          sku: `${prefix}-CAP-01`,
          catSlug: 'coffee',
          desc: 'Double shot rich espresso with velvety steamed micro-foam and cocoa dust',
          price: 180,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&auto=format&fit=crop&q=80',
          stock: 120,
          minStock: 20,
          instructions: '1. Dose 18g espresso beans. 2. Pull 36g espresso. 3. Steam 150ml milk to 65C. 4. Pour latte art.',
          prepTime: 3,
          recipeItems: [
            { rawName: 'Arabica Espresso Roast Beans', qty: 0.018, unit: 'kg' },
            { rawName: 'Whole Cream Dairy Milk', qty: 0.150, unit: 'L' },
            { rawName: 'Eco Takeaway Hot Cups 80mm', qty: 1, unit: 'pcs' },
            { rawName: 'Organic Brown Sugar & Syrups', qty: 0.006, unit: 'kg' },
          ],
        },
        {
          name: 'Vanilla Bean Cafe Latte',
          sku: `${prefix}-LAT-02`,
          catSlug: 'coffee',
          desc: 'Smooth espresso balanced with steamed milk and premium Madagascar vanilla',
          price: 210,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1593443320739-77f74939d0da?w=500&auto=format&fit=crop&q=80',
          stock: 100,
          minStock: 20,
          instructions: '1. Dose 18g espresso. 2. Add vanilla syrup. 3. Steam 180ml milk.',
          prepTime: 3,
          recipeItems: [
            { rawName: 'Arabica Espresso Roast Beans', qty: 0.018, unit: 'kg' },
            { rawName: 'Whole Cream Dairy Milk', qty: 0.180, unit: 'L' },
            { rawName: 'Eco Takeaway Hot Cups 80mm', qty: 1, unit: 'pcs' },
            { rawName: 'Organic Brown Sugar & Syrups', qty: 0.015, unit: 'kg' },
          ],
        },
        {
          name: 'Paneer Tikka Panini Grill',
          sku: `${prefix}-SND-01`,
          catSlug: 'sandwiches',
          desc: 'Tandoori spiced cottage cheese, peppers, mint chutney & melted cheddar in sourdough',
          price: 220,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
          stock: 45,
          minStock: 10,
          instructions: '1. Slice sourdough loaf. 2. Layer 80g paneer with chutney & cheddar. 3. Grill 4 mins.',
          prepTime: 6,
          recipeItems: [
            { rawName: 'Artisan Sourdough Loaves', qty: 0.20, unit: 'pcs' },
            { rawName: 'Fresh Malai Paneer & Cheese', qty: 0.080, unit: 'kg' },
          ],
        },
        {
          name: 'Signature Cold Brew Tonic',
          sku: `${prefix}-CLD-01`,
          catSlug: 'cold-brews',
          desc: '18-hour steep single-origin cold brew topped with premium tonic and citrus zest',
          price: 240,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
          stock: 60,
          minStock: 12,
          instructions: '1. Pour 120ml cold brew concentrate over ice. 2. Top with 100ml tonic.',
          prepTime: 2,
          recipeItems: [
            { rawName: 'Arabica Espresso Roast Beans', qty: 0.025, unit: 'kg' },
            { rawName: 'Eco Takeaway Hot Cups 80mm', qty: 1, unit: 'pcs' },
          ],
        },
        {
          name: 'Peri-Peri Crinkle Fries',
          sku: `${prefix}-SNK-01`,
          catSlug: 'sandwiches',
          desc: 'Golden crispy crinkle cut fries tossed in spicy African peri-peri seasoning',
          price: 150,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80',
          stock: 75,
          minStock: 15,
          instructions: '1. Fry fries at 180C for 3 mins. 2. Dust with peri-peri seasoning.',
          prepTime: 4,
          recipeItems: [
            { rawName: 'Eco Takeaway Hot Cups 80mm', qty: 1, unit: 'pcs' },
          ],
        },
      ];
      break;

    case 'bakery':
      categoryDefs = [
        { slug: 'viennoiserie', name: 'Croissants & Viennoiserie', desc: 'French Butter Croissants & Danishes', icon: 'Cake', order: 1 },
        { slug: 'artisan-breads', name: 'Artisan Breads', desc: 'Sourdough, Baguettes & Focaccia', icon: 'Sandwich', order: 2 },
        { slug: 'cakes-tarts', name: 'Cakes & Tarts', desc: 'Cheesecakes, Chocolate Tarts & Pastries', icon: 'Cake', order: 3 },
        { slug: 'cookies-savories', name: 'Cookies & Savories', desc: 'Gourmet Cookies, Puffs & Quiches', icon: 'Utensils', order: 4 },
        { slug: 'beverages', name: 'Coffee & Beverages', desc: 'Espresso Bar, Hot Chocolate & Teas', icon: 'Coffee', order: 5 },
      ];

      rawMaterialDefs = [
        { name: 'Pure French Butter Block', sku: `${prefix}-RAW-BTR-01`, category: 'Dairy', qty: 15.0, unit: 'kg', min: 5.0, cost: 750, supplier: 'Bridor Gourmet' },
        { name: 'Artisan Bread Flour T55', sku: `${prefix}-RAW-FLR-01`, category: 'Dry Goods', qty: 60.0, unit: 'kg', min: 20.0, cost: 65, supplier: 'Moulins Viron' },
        { name: 'Dark Chocolate 70% Callets', sku: `${prefix}-RAW-CHO-01`, category: 'Confectionery', qty: 10.0, unit: 'kg', min: 3.0, cost: 850, supplier: 'Callebaut India' },
        { name: 'Philadelphia Cream Cheese', sku: `${prefix}-RAW-CHS-01`, category: 'Dairy', qty: 8.0, unit: 'kg', min: 2.5, cost: 680, supplier: 'Mondelez Direct' },
        { name: 'Fresh Farm Eggs', sku: `${prefix}-RAW-EGG-01`, category: 'Dairy', qty: 180, unit: 'pcs', min: 50, cost: 7.5, supplier: 'Farm Gate' },
        { name: 'Whole Cream Milk', sku: `${prefix}-RAW-MLK-01`, category: 'Dairy', qty: 20.0, unit: 'L', min: 6.0, cost: 65, supplier: 'Amul Fresh' },
        { name: 'Bakery Eco Carry Boxes', sku: `${prefix}-RAW-BOX-01`, category: 'Packaging', qty: 300, unit: 'pcs', min: 80, cost: 6.0, supplier: 'EcoPack India' },
      ];

      productDefs = [
        {
          name: 'Butter French Croissant',
          sku: `${prefix}-BAK-01`,
          catSlug: 'viennoiserie',
          desc: 'Flaky 27-layer laminated pure butter French croissant with honeycomb crumb',
          price: 160,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80',
          stock: 45,
          minStock: 10,
          instructions: '1. Proof laminated dough 2.5h. 2. Bake at 190C for 16 mins.',
          prepTime: 20,
          recipeItems: [
            { rawName: 'Artisan Bread Flour T55', qty: 0.080, unit: 'kg' },
            { rawName: 'Pure French Butter Block', qty: 0.045, unit: 'kg' },
            { rawName: 'Whole Cream Milk', qty: 0.025, unit: 'L' },
          ],
        },
        {
          name: 'Artisan Sourdough Country Loaf',
          sku: `${prefix}-BAK-02`,
          catSlug: 'artisan-breads',
          desc: '36-hour cold fermented wild sourdough with blistered crust and open crumb',
          price: 220,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=500&auto=format&fit=crop&q=80',
          stock: 25,
          minStock: 5,
          instructions: '1. Autolyse flour. 2. 4 stretch-and-folds. 3. 24h cold retard. 4. Dutch oven bake.',
          prepTime: 40,
          recipeItems: [
            { rawName: 'Artisan Bread Flour T55', qty: 0.450, unit: 'kg' },
            { rawName: 'Bakery Eco Carry Boxes', qty: 1, unit: 'pcs' },
          ],
        },
        {
          name: 'Belgian Dark Chocolate Tart',
          sku: `${prefix}-BAK-03`,
          catSlug: 'cakes-tarts',
          desc: 'Crisp sable shell filled with 70% Callebaut ganache and sea salt flakes',
          price: 240,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80',
          stock: 30,
          minStock: 6,
          instructions: '1. Blind bake sable tart shells. 2. Emulsify ganache. 3. Pour & chill.',
          prepTime: 15,
          recipeItems: [
            { rawName: 'Dark Chocolate 70% Callets', qty: 0.090, unit: 'kg' },
            { rawName: 'Pure French Butter Block', qty: 0.030, unit: 'kg' },
            { rawName: 'Whole Cream Milk', qty: 0.040, unit: 'L' },
          ],
        },
        {
          name: 'New York Baked Cheesecake',
          sku: `${prefix}-BAK-04`,
          catSlug: 'cakes-tarts',
          desc: 'Dense and creamy Philadelphia cheesecake on graham cracker crust with berry compote',
          price: 260,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80',
          stock: 35,
          minStock: 8,
          instructions: '1. Blend cream cheese, sugar & eggs. 2. Water bath bake at 150C. 3. Chill overnight.',
          prepTime: 30,
          recipeItems: [
            { rawName: 'Philadelphia Cream Cheese', qty: 0.120, unit: 'kg' },
            { rawName: 'Fresh Farm Eggs', qty: 1, unit: 'pcs' },
            { rawName: 'Pure French Butter Block', qty: 0.020, unit: 'kg' },
          ],
        },
        {
          name: 'Cafe Latte',
          sku: `${prefix}-BAK-05`,
          catSlug: 'beverages',
          desc: 'Double shot espresso balanced with velvety steamed milk',
          price: 180,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1593443320739-77f74939d0da?w=500&auto=format&fit=crop&q=80',
          stock: 80,
          minStock: 15,
          instructions: '1. Pull espresso shot. 2. Steam 180ml milk. 3. Pour microfoam.',
          prepTime: 3,
          recipeItems: [
            { rawName: 'Whole Cream Milk', qty: 0.180, unit: 'L' },
            { rawName: 'Bakery Eco Carry Boxes', qty: 1, unit: 'pcs' },
          ],
        },
      ];
      break;

    case 'bistro':
      categoryDefs = [
        { slug: 'breakfast', name: 'All-Day Breakfast', desc: 'Eggs, Avocado Toast & Pancakes', icon: 'Utensils', order: 1 },
        { slug: 'sandwiches', name: 'Gourmet Sandwiches', desc: 'Grilled Paninis, Subs & Wraps', icon: 'Sandwich', order: 2 },
        { slug: 'pastas-bowls', name: 'Pastas & Bowls', desc: 'Penne, Spaghetti & Grain Bowls', icon: 'Soup', order: 3 },
        { slug: 'beverages', name: 'Coffee & Beverages', desc: 'Espresso Bar, Smoothies & Coolers', icon: 'Coffee', order: 4 },
        { slug: 'desserts', name: 'Desserts', desc: 'Waffles, Brownies & Sundaes', icon: 'Cake', order: 5 },
      ];

      rawMaterialDefs = [
        { name: 'Artisan Sourdough Bread', sku: `${prefix}-RAW-BRD-01`, category: 'Bakery', qty: 20, unit: 'pcs', min: 6, cost: 85, supplier: 'Bistro Bakers' },
        { name: 'Hass Avocados Grade A', sku: `${prefix}-RAW-AVO-01`, category: 'Produce', qty: 25, unit: 'pcs', min: 8, cost: 110, supplier: 'Farm Direct' },
        { name: 'Durum Wheat Penne Pasta', sku: `${prefix}-RAW-PST-01`, category: 'Dry Goods', qty: 20.0, unit: 'kg', min: 6.0, cost: 130, supplier: 'Barilla Hub' },
        { name: 'Parmesan & Mozzarella Blend', sku: `${prefix}-RAW-CHS-01`, category: 'Dairy', qty: 10.0, unit: 'kg', min: 3.0, cost: 580, supplier: 'Amul Dairy' },
        { name: 'Fresh Farm Chicken Breast', sku: `${prefix}-RAW-CHK-01`, category: 'Poultry', qty: 15.0, unit: 'kg', min: 5.0, cost: 260, supplier: 'Meat Direct' },
        { name: 'Espresso Roast Coffee Beans', sku: `${prefix}-RAW-COF-01`, category: 'Coffee', qty: 6.0, unit: 'kg', min: 2.0, cost: 1200, supplier: 'Roastery Hub' },
        { name: 'Whole Cream Milk', sku: `${prefix}-RAW-MLK-01`, category: 'Dairy', qty: 20.0, unit: 'L', min: 6.0, cost: 65, supplier: 'Amul Fresh' },
      ];

      productDefs = [
        {
          name: 'Sourdough Avocado Tartine',
          sku: `${prefix}-BIS-01`,
          catSlug: 'breakfast',
          desc: 'Crushed Hass avocado, cherry tomatoes, Danish feta, chili flakes & micro-herbs on sourdough',
          price: 320,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80',
          stock: 40,
          minStock: 8,
          instructions: '1. Toast sourdough slice. 2. Mash 1 avocado with lime & salt. 3. Top with feta.',
          prepTime: 5,
          recipeItems: [
            { rawName: 'Artisan Sourdough Bread', qty: 0.20, unit: 'pcs' },
            { rawName: 'Hass Avocados Grade A', qty: 1, unit: 'pcs' },
            { rawName: 'Parmesan & Mozzarella Blend', qty: 0.030, unit: 'kg' },
          ],
        },
        {
          name: 'Pesto Chicken Panini Grill',
          sku: `${prefix}-BIS-02`,
          catSlug: 'sandwiches',
          desc: 'Grilled herb chicken, basil pesto, sundried tomatoes and melted mozzarella in sourdough',
          price: 260,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
          stock: 45,
          minStock: 10,
          instructions: '1. Grill marinated chicken. 2. Spread basil pesto on bread. 3. Add cheese and press grill.',
          prepTime: 7,
          recipeItems: [
            { rawName: 'Artisan Sourdough Bread', qty: 0.20, unit: 'pcs' },
            { rawName: 'Fresh Farm Chicken Breast', qty: 0.120, unit: 'kg' },
            { rawName: 'Parmesan & Mozzarella Blend', qty: 0.040, unit: 'kg' },
          ],
        },
        {
          name: 'Creamy Truffle Mushroom Penne',
          sku: `${prefix}-BIS-03`,
          catSlug: 'pastas-bowls',
          desc: 'Al dente penne tossed in rich parmesan cream sauce, sauteed button mushrooms & truffle oil',
          price: 340,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=500&auto=format&fit=crop&q=80',
          stock: 35,
          minStock: 8,
          instructions: '1. Boil penne 8 mins. 2. Saute mushrooms in cream & parmesan. 3. Drizzle white truffle oil.',
          prepTime: 10,
          recipeItems: [
            { rawName: 'Durum Wheat Penne Pasta', qty: 0.150, unit: 'kg' },
            { rawName: 'Parmesan & Mozzarella Blend', qty: 0.060, unit: 'kg' },
            { rawName: 'Whole Cream Milk', qty: 0.100, unit: 'L' },
          ],
        },
        {
          name: 'Signature Iced Caramel Macchiato',
          sku: `${prefix}-BIS-04`,
          catSlug: 'beverages',
          desc: 'Chilled milk marked with rich espresso and house-made salted caramel drizzle',
          price: 220,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80',
          stock: 75,
          minStock: 15,
          instructions: '1. Pour cold milk over ice. 2. Pull double espresso. 3. Drizzle salted caramel.',
          prepTime: 3,
          recipeItems: [
            { rawName: 'Espresso Roast Coffee Beans', qty: 0.018, unit: 'kg' },
            { rawName: 'Whole Cream Milk', qty: 0.180, unit: 'L' },
          ],
        },
      ];
      break;

    case 'tea':
      categoryDefs = [
        { slug: 'kadak-chai', name: 'Desi Kadak Chai', desc: 'Kulhad Masala, Adrak & Elaichi Chai', icon: 'Coffee', order: 1 },
        { slug: 'specialty-tea', name: 'Specialty Green Teas', desc: 'Kashmiri Kahwa, Darjeeling & Herbal', icon: 'CupSoda', order: 2 },
        { slug: 'iced-teas', name: 'Iced Teas & Coolers', desc: 'Peach, Lemon & Hibiscus Iced Teas', icon: 'GlassWater', order: 3 },
        { slug: 'snacks', name: 'Finger Snacks', desc: 'Samosas, Kachoris & Bun Maska', icon: 'Utensils', order: 4 },
        { slug: 'quick-bites', name: 'Quick Bites', desc: 'Vada Pav, Maggi Bowls & Sandwiches', icon: 'Sandwich', order: 5 },
      ];

      rawMaterialDefs = [
        { name: 'Assam CTC Premium Tea', sku: `${prefix}-RAW-TEA-01`, category: 'Tea', qty: 15.0, unit: 'kg', min: 4.0, cost: 340, supplier: 'Assam Tea Estates' },
        { name: 'Specialty Chai Masala Blend', sku: `${prefix}-RAW-SPC-01`, category: 'Spices', qty: 5.0, unit: 'kg', min: 1.5, cost: 480, supplier: 'Spice Garden' },
        { name: 'Full Cream Buffalo & Cow Milk', sku: `${prefix}-RAW-MLK-01`, category: 'Dairy', qty: 35.0, unit: 'L', min: 10.0, cost: 68, supplier: 'Local Dairy Hub' },
        { name: 'Kashmiri Kahwa Green Leaves & Saffron', sku: `${prefix}-RAW-KHW-01`, category: 'Tea', qty: 3.0, unit: 'kg', min: 1.0, cost: 1100, supplier: 'Valley Teas' },
        { name: 'Fresh Bun Maska & Butter', sku: `${prefix}-RAW-BUN-01`, category: 'Bakery', qty: 60, unit: 'pcs', min: 15, cost: 18, supplier: 'City Bakery' },
        { name: 'Frozen Crispy Punjabi Samosas', sku: `${prefix}-RAW-SAM-01`, category: 'Snacks', qty: 80, unit: 'pcs', min: 20, cost: 15, supplier: 'Haldiram Direct' },
        { name: 'Earthen Clay Kulhads 150ml', sku: `${prefix}-RAW-KUL-01`, category: 'Packaging', qty: 400, unit: 'pcs', min: 100, cost: 3.0, supplier: 'Claycraft India' },
      ];

      productDefs = [
        {
          name: 'Special Kulhad Masala Chai',
          sku: `${prefix}-TEA-01`,
          catSlug: 'kadak-chai',
          desc: 'Slow brewed strong Assam CTC tea with crushed fresh ginger, green cardamom & cloves in an earthen kulhad',
          price: 60,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=80',
          stock: 150,
          minStock: 30,
          instructions: '1. Boil water with crushed ginger & chai masala. 2. Add CTC tea. 3. Add full cream milk. 4. Strain into hot kulhad.',
          prepTime: 4,
          recipeItems: [
            { rawName: 'Assam CTC Premium Tea', qty: 0.008, unit: 'kg' },
            { rawName: 'Specialty Chai Masala Blend', qty: 0.004, unit: 'kg' },
            { rawName: 'Full Cream Buffalo & Cow Milk', qty: 0.090, unit: 'L' },
            { rawName: 'Earthen Clay Kulhads 150ml', qty: 1, unit: 'pcs' },
          ],
        },
        {
          name: 'Royal Kashmiri Kahwa',
          sku: `${prefix}-TEA-02`,
          catSlug: 'specialty-tea',
          desc: 'Traditional saffron-infused Kashmiri green tea brewed with cinnamon, cardamom and slivered almonds',
          price: 110,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80',
          stock: 60,
          minStock: 15,
          instructions: '1. Steep kahwa leaves with saffron & cinnamon. 2. Pour into glass with sliced almonds.',
          prepTime: 3,
          recipeItems: [
            { rawName: 'Kashmiri Kahwa Green Leaves & Saffron', qty: 0.008, unit: 'kg' },
            { rawName: 'Earthen Clay Kulhads 150ml', qty: 1, unit: 'pcs' },
          ],
        },
        {
          name: 'Irani Bun Maska Jam',
          sku: `${prefix}-TEA-03`,
          catSlug: 'snacks',
          desc: 'Soft pillowy sweet bun slathered with salted butter and mixed fruit jam',
          price: 70,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
          stock: 50,
          minStock: 10,
          instructions: '1. Slice fresh bun in half. 2. Spread generous amul butter & fruit jam. 3. Warm toast lightly.',
          prepTime: 2,
          recipeItems: [
            { rawName: 'Fresh Bun Maska & Butter', qty: 1, unit: 'pcs' },
          ],
        },
        {
          name: 'Crispy Samosa Plate (2 pcs)',
          sku: `${prefix}-TEA-04`,
          catSlug: 'snacks',
          desc: 'Flaky golden pastry filled with spiced potato and peas, served with mint & saunth chutneys',
          price: 80,
          gst: 5,
          image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
          stock: 70,
          minStock: 15,
          instructions: '1. Fry 2 samosas in hot oil until golden crisp. 2. Serve with sweet and spicy chutneys.',
          prepTime: 4,
          recipeItems: [
            { rawName: 'Frozen Crispy Punjabi Samosas', qty: 2, unit: 'pcs' },
          ],
        },
      ];
      break;
  }

  // Generate mapped database entities
  const categories: Category[] = categoryDefs.map(c => ({
    id: `cat-${uuidv4().substring(0, 8)}`,
    cafe_id: cafeId,
    name: c.name,
    slug: c.slug,
    description: c.desc,
    icon: c.icon,
    sort_order: c.order,
    is_active: true,
  }));

  const inventory: InventoryItem[] = rawMaterialDefs.map(i => ({
    id: `inv-${uuidv4().substring(0, 8)}`,
    cafe_id: cafeId,
    name: i.name,
    sku: i.sku,
    category: i.category,
    current_quantity: i.qty,
    unit: i.unit,
    min_quantity: i.min,
    cost_per_unit: i.cost,
    supplier: i.supplier,
    last_updated: now,
  }));

  const products: Product[] = [];
  const recipes: Recipe[] = [];

  for (const p of productDefs) {
    const matchedCat = categories.find(c => c.slug === p.catSlug) || categories[0];
    const prodId = `prod-${uuidv4().substring(0, 8)}`;

    // Build Recipe Items
    let totalCalculatedCogs = 0;
    const recipeItems = p.recipeItems
      .map(r => {
        const inv = inventory.find(i => i.name === r.rawName);
        if (!inv) return null;
        const costContrib = Number((inv.cost_per_unit * r.qty).toFixed(2));
        totalCalculatedCogs += costContrib;
        return {
          inventory_id: inv.id,
          inventory_name: inv.name,
          quantity_required: r.qty,
          unit: r.unit,
          cost_contribution: costContrib,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    const finalCostPrice = recipeItems.length > 0 ? Number(totalCalculatedCogs.toFixed(2)) : p.price * 0.3;

    products.push({
      id: prodId,
      cafe_id: cafeId,
      category_id: matchedCat.id,
      category_name: matchedCat.name,
      name: p.name,
      sku: p.sku,
      description: p.desc,
      selling_price: p.price,
      cost_price: finalCostPrice,
      gst_rate: p.gst,
      image_url: p.image,
      is_available: true,
      track_stock: true,
      stock_quantity: p.stock,
      min_stock_level: p.minStock,
      has_recipe: recipeItems.length > 0,
      created_at: now,
      updated_at: now,
    });

    if (recipeItems.length > 0) {
      recipes.push({
        id: `rec-${uuidv4().substring(0, 8)}`,
        cafe_id: cafeId,
        product_id: prodId,
        product_name: p.name,
        instructions: p.instructions,
        prep_time_mins: p.prepTime,
        calculated_cogs: finalCostPrice,
        items: recipeItems,
      });
    }
  }

  return { categories, inventory, products, recipes };
};
