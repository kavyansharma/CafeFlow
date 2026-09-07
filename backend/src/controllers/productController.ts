import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { CAFE_SUNRISE_ID } from '../database/seedData';

export const getProducts = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id || CAFE_SUNRISE_ID;
  const { category_id, search, available_only } = req.query;
  
  let products = db.products
    .filter(p => p.cafe_id === cafeId)
    .map(p => {
      const category = db.categories.find(c => c.cafe_id === cafeId && c.id === p.category_id);
      return {
        ...p,
        category_name: category ? category.name : 'Unknown',
      };
    });

  if (category_id && category_id !== 'all') {
    products = products.filter(p => p.category_id === category_id);
  }

  if (search) {
    const s = String(search).toLowerCase();
    products = products.filter(
      p => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s) || p.description.toLowerCase().includes(s)
    );
  }

  if (available_only === 'true') {
    products = products.filter(p => p.is_available);
  }

  return res.json({ success: true, count: products.length, data: products });
};

export const getProductById = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id || CAFE_SUNRISE_ID;
  const { id } = req.params;
  const product = db.products.find(p => p.cafe_id === cafeId && p.id === id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found in this cafe' });
  }
  const category = db.categories.find(c => c.cafe_id === cafeId && c.id === product.category_id);
  const recipe = db.recipes.find(r => r.cafe_id === cafeId && r.product_id === product.id);

  return res.json({
    success: true,
    data: {
      ...product,
      category_name: category?.name,
      recipe,
    },
  });
};

export const createProduct = (req: AuthRequest, res: Response) => {
  const cafeId = req.user?.cafe_id || CAFE_SUNRISE_ID;
  const {
    name,
    category_id,
    sku,
    description,
    selling_price,
    cost_price,
    gst_rate,
    image_url,
    is_available,
    track_stock,
    stock_quantity,
    min_stock_level,
    has_recipe,
  } = req.body;

  if (!name || !category_id || !selling_price) {
    return res.status(400).json({ success: false, message: 'Name, Category, and Selling Price are required' });
  }

  const generatedSku = sku || `CF-${name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  const newProduct = {
    id: `prod-${uuidv4().substring(0, 8)}`,
    cafe_id: cafeId,
    name,
    category_id,
    sku: generatedSku,
    description: description || '',
    selling_price: Number(selling_price),
    cost_price: Number(cost_price || 0),
    gst_rate: Number(gst_rate || 5),
    image_url: image_url || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    is_available: is_available !== undefined ? Boolean(is_available) : true,
    track_stock: Boolean(track_stock),
    stock_quantity: Number(stock_quantity || 0),
    min_stock_level: Number(min_stock_level || 0),
    has_recipe: Boolean(has_recipe),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.products.unshift(newProduct);
  db.logAudit(cafeId, req.user?.name || 'Staff', req.user?.role || 'STAFF', 'Create Product', `Added ${newProduct.name} (${newProduct.sku})`);

  return res.status(201).json({ success: true, message: 'Product created successfully', data: newProduct });
};

export const updateProduct = (req: AuthRequest, res: Response) => {
  const cafeId = req.user?.cafe_id || CAFE_SUNRISE_ID;
  const { id } = req.params;
  const productIndex = db.products.findIndex(p => p.cafe_id === cafeId && p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ success: false, message: 'Product not found in this cafe' });
  }

  const existing = db.products[productIndex];
  const updated = {
    ...existing,
    ...req.body,
    cafe_id: cafeId, // Ensure cafe_id cannot be overwritten
    selling_price: req.body.selling_price !== undefined ? Number(req.body.selling_price) : existing.selling_price,
    cost_price: req.body.cost_price !== undefined ? Number(req.body.cost_price) : existing.cost_price,
    gst_rate: req.body.gst_rate !== undefined ? Number(req.body.gst_rate) : existing.gst_rate,
    stock_quantity: req.body.stock_quantity !== undefined ? Number(req.body.stock_quantity) : existing.stock_quantity,
    min_stock_level: req.body.min_stock_level !== undefined ? Number(req.body.min_stock_level) : existing.min_stock_level,
    updated_at: new Date().toISOString(),
  };

  db.products[productIndex] = updated;
  db.logAudit(cafeId, req.user?.name || 'Staff', req.user?.role || 'STAFF', 'Update Product', `Updated ${updated.name}`);

  return res.json({ success: true, message: 'Product updated successfully', data: updated });
};

export const deleteProduct = (req: AuthRequest, res: Response) => {
  const cafeId = req.user?.cafe_id || CAFE_SUNRISE_ID;
  const { id } = req.params;
  const productIndex = db.products.findIndex(p => p.cafe_id === cafeId && p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ success: false, message: 'Product not found in this cafe' });
  }

  const removed = db.products.splice(productIndex, 1)[0];
  db.logAudit(cafeId, req.user?.name || 'Staff', req.user?.role || 'STAFF', 'Delete Product', `Deleted ${removed.name}`);

  return res.json({ success: true, message: 'Product deleted successfully', data: removed });
};

export const getCategories = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id || CAFE_SUNRISE_ID;
  const tenantCategories = db.categories.filter(c => c.cafe_id === cafeId);
  
  const categoriesWithCounts = tenantCategories.map(c => {
    const count = db.products.filter(p => p.cafe_id === cafeId && p.category_id === c.id).length;
    return {
      ...c,
      product_count: count,
    };
  });

  return res.json({ success: true, count: categoriesWithCounts.length, data: categoriesWithCounts });
};

export const createCategory = (req: AuthRequest, res: Response) => {
  const cafeId = req.user?.cafe_id || CAFE_SUNRISE_ID;
  const { name, description, icon } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newCat = {
    id: `cat-${uuidv4().substring(0, 6)}`,
    cafe_id: cafeId,
    name,
    slug,
    description: description || '',
    icon: icon || 'Coffee',
    sort_order: db.categories.filter(c => c.cafe_id === cafeId).length + 1,
    is_active: true,
  };

  db.categories.push(newCat);
  db.logAudit(cafeId, req.user?.name || 'Staff', req.user?.role || 'STAFF', 'Create Category', `Created category ${newCat.name}`);
  return res.status(201).json({ success: true, message: 'Category created', data: newCat });
};
