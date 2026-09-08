import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { config } from '../config';
import { AuthRequest } from '../middleware/auth';
import { Cafe, User, hashPassword } from '../database/seedData';

export const registerCafe = (req: Request, res: Response) => {
  const { cafe_name, owner_name, email, phone, password, address, gstin } = req.body;

  if (!cafe_name || !owner_name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Cafe Name, Owner Name, Email, and Password are required.',
    });
  }

  // Generate unique slug
  let baseSlug = cafe_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!baseSlug) baseSlug = 'cafe';
  let slug = baseSlug;
  let counter = 1;
  while (db.cafes.some(c => c.slug === slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  // Check if owner email is already taken in global system or cafe
  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'A user account with this email already exists. Please sign in or use a different email.',
    });
  }

  const cafeId = `cafe-${uuidv4().substring(0, 8)}`;
  const now = new Date().toISOString();

  // 1. Create Cafe Tenant Record
  const newCafe: Cafe = {
    id: cafeId,
    name: cafe_name,
    slug,
    logo_url: '',
    address: address || 'Main Commercial Area',
    phone: phone || '',
    email,
    gstin: gstin || '',
    currency: '₹',
    timezone: 'Asia/Kolkata',
    invoice_prefix: `${cafe_name.substring(0, 2).toUpperCase()}-2026-`,
    default_gst_rate: 5,
    loyalty_spend_per_point: 100,
    loyalty_point_value: 1.0,
    max_discount_percent: 30,
    enable_ai_insights: true,
    status: 'ACTIVE',
    created_at: now,
    updated_at: now,
  };

  db.cafes.push(newCafe);

  // 2. Create Owner User for this Cafe
  const ownerUser: User = {
    id: `usr-${uuidv4().substring(0, 8)}`,
    cafe_id: cafeId,
    name: owner_name,
    email: email.toLowerCase(),
    phone: phone || '',
    password_hash: hashPassword(password),
    role: 'OWNER',
    is_active: true,
    created_at: now,
  };

  db.users.push(ownerUser);

  // 3. Create Default Categories for new cafe
  const defaultCategories = [
    { id: `cat-${uuidv4().substring(0, 6)}`, cafe_id: cafeId, name: 'Coffee', slug: 'coffee', description: 'Espresso & Brews', icon: 'Coffee', sort_order: 1, is_active: true },
    { id: `cat-${uuidv4().substring(0, 6)}`, cafe_id: cafeId, name: 'Tea', slug: 'tea', description: 'Artisan Teas & Chais', icon: 'CupSoda', sort_order: 2, is_active: true },
    { id: `cat-${uuidv4().substring(0, 6)}`, cafe_id: cafeId, name: 'Beverages', slug: 'beverages', description: 'Coolers & Shakes', icon: 'GlassWater', sort_order: 3, is_active: true },
    { id: `cat-${uuidv4().substring(0, 6)}`, cafe_id: cafeId, name: 'Food & Snacks', slug: 'food-snacks', description: 'Sandwiches & Snacks', icon: 'Sandwich', sort_order: 4, is_active: true },
    { id: `cat-${uuidv4().substring(0, 6)}`, cafe_id: cafeId, name: 'Desserts', slug: 'desserts', description: 'Cakes & Pastries', icon: 'Cake', sort_order: 5, is_active: true },
  ];
  db.categories.push(...defaultCategories);

  // 4. Create Initial Starter Products
  const starterProducts = [
    {
      id: `prod-${uuidv4().substring(0, 8)}`,
      cafe_id: cafeId,
      category_id: defaultCategories[0].id,
      name: 'House Blend Cappuccino',
      sku: `${newCafe.slug.substring(0, 3).toUpperCase()}-CAP-01`,
      description: 'Velvety espresso with textured micro-foam',
      selling_price: 160,
      cost_price: 32,
      gst_rate: 5,
      image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&auto=format&fit=crop&q=80',
      is_available: true,
      track_stock: true,
      stock_quantity: 100,
      min_stock_level: 15,
      has_recipe: false,
      created_at: now,
      updated_at: now,
    },
    {
      id: `prod-${uuidv4().substring(0, 8)}`,
      cafe_id: cafeId,
      category_id: defaultCategories[3].id,
      name: 'Grilled Cheese Panini',
      sku: `${newCafe.slug.substring(0, 3).toUpperCase()}-PAN-02`,
      description: 'Artisanal grilled sandwich with melted cheddar',
      selling_price: 200,
      cost_price: 45,
      gst_rate: 5,
      image_url: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
      is_available: true,
      track_stock: true,
      stock_quantity: 50,
      min_stock_level: 10,
      has_recipe: false,
      created_at: now,
      updated_at: now,
    },
  ];
  db.products.push(...starterProducts);

  db.logAudit(cafeId, ownerUser.name, 'OWNER', 'Cafe Registered', `New cafe "${newCafe.name}" registered and onboarded.`);
  db.addNotification(cafeId, 'SYSTEM', 'Welcome to CAFEFLOW', `Welcome to CAFEFLOW! Your cafe "${newCafe.name}" is ready for billing.`, 'SUCCESS', '/dashboard');

  // Sign JWT with cafe_id
  const token = jwt.sign(
    {
      id: ownerUser.id,
      email: ownerUser.email,
      name: ownerUser.name,
      role: ownerUser.role,
      cafe_id: cafeId,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  return res.status(201).json({
    success: true,
    message: 'Cafe created and registered successfully',
    token,
    cafe: newCafe,
    user: {
      id: ownerUser.id,
      name: ownerUser.name,
      email: ownerUser.email,
      phone: ownerUser.phone,
      role: ownerUser.role,
      cafe_id: cafeId,
    },
  });
};

export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !user.is_active) {
    return res.status(401).json({ success: false, message: 'Invalid credentials or inactive account' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const cafe = db.getCafe(user.cafe_id);
  if (!cafe) {
    return res.status(404).json({ success: false, message: 'Assigned cafe tenant not found' });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      cafe_id: user.cafe_id,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  db.logAudit(user.cafe_id, user.name, user.role, 'User Login', `Logged into ${cafe.name} from IP: ${req.ip || '127.0.0.1'}`);

  return res.json({
    success: true,
    message: 'Login successful',
    token,
    cafe,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      cafe_id: user.cafe_id,
    },
  });
};

export const getCurrentUser = (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const user = db.users.find(u => u.id === req.user?.id);
  if (!user || !user.is_active) {
    return res.status(404).json({ success: false, message: 'User not found or inactive' });
  }

  const cafe = db.getCafe(user.cafe_id);

  return res.json({
    success: true,
    cafe,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      cafe_id: user.cafe_id,
    },
  });
};

export const switchDemoUser = (req: Request, res: Response) => {
  const { role, cafe_slug, cafeSlug } = req.body;
  const targetSlug = cafe_slug || cafeSlug || 'sunrise-cafe';

  const validRoles: Array<'OWNER' | 'MANAGER' | 'CASHIER'> = ['OWNER', 'MANAGER', 'CASHIER'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role. Must be OWNER, MANAGER, or CASHIER.' });
  }

  // Only allow demo switching for pre-seeded demo cafes
  const allowedDemoSlugs = ['sunrise-cafe', 'bean-theory'];
  if (!allowedDemoSlugs.includes(targetSlug)) {
    return res.status(403).json({ success: false, message: 'Demo switching is restricted to authorized demo cafes.' });
  }

  const cafe = db.cafes.find(c => c.slug === targetSlug);
  if (!cafe) {
    return res.status(404).json({ success: false, message: `Demo cafe '${targetSlug}' not found.` });
  }

  const user = db.users.find(u => u.cafe_id === cafe.id && u.role === role && u.is_active);

  if (!user) {
    return res.status(404).json({ success: false, message: `No active demo user found for role ${role} in ${cafe.name}` });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      cafe_id: user.cafe_id,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );

  return res.json({
    success: true,
    message: `Switched session to ${cafe.name} - ${user.role} (${user.name})`,
    token,
    cafe,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      cafe_id: user.cafe_id,
    },
  });
};
