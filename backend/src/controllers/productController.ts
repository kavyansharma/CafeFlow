import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';

export const getProducts = (req: Request, res: Response) => {
  const { category_id, search, available_only } = req.query;
  
  let products = db.products.map(p => {
    const category = db.categories.find(c => c.id === p.category_id);
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
  const { id } = req.params;
  const product = db.products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  const category = db.categories.find(c => c.id === product.category_id);
  const recipe = db.recipes.find(r => r.product_id === product.id);

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
  db.logAudit(req.user?.name || 'Staff', req.user?.role || 'STAFF', 'Create Product', `Added ${newProduct.name} (${newProduct.sku})`);

  return res.status(201).json({ success: true, message: 'Product created successfully', data: newProduct });
};

export const updateProduct = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const productIndex = db.products.findIndex(p => p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const existing = db.products[productIndex];
  const updated = {
    ...existing,
    ...req.body,
    selling_price: req.body.selling_price !== undefined ? Number(req.body.selling_price) : existing.selling_price,
    cost_price: req.body.cost_price !== undefined ? Number(req.body.cost_price) : existing.cost_price,
    gst_rate: req.body.gst_rate !== undefined ? Number(req.body.gst_rate) : existing.gst_rate,
    stock_quantity: req.body.stock_quantity !== undefined ? Number(req.body.stock_quantity) : existing.stock_quantity,
    min_stock_level: req.body.min_stock_level !== undefined ? Number(req.body.min_stock_level) : existing.min_stock_level,
    updated_at: new Date().toISOString(),
  };

  db.products[productIndex] = updated;
  db.logAudit(req.user?.name || 'Staff', req.user?.role || 'STAFF', 'Update Product', `Updated ${updated.name}`);

  return res.json({ success: true, message: 'Product updated successfully', data: updated });
};

export const deleteProduct = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const productIndex = db.products.findIndex(p => p.id === id);

  if (productIndex === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  const removed = db.products.splice(productIndex, 1)[0];
  db.logAudit(req.user?.name || 'Staff', req.user?.role || 'STAFF', 'Delete Product', `Deleted ${removed.name}`);

  return res.json({ success: true, message: 'Product deleted successfully', data: removed });
};

export const getCategories = (req: Request, res: Response) => {
  const categoriesWithCounts = db.categories.map(c => {
    const count = db.products.filter(p => p.category_id === c.id).length;
    return {
      ...c,
      product_count: count,
    };
  });

  return res.json({ success: true, count: categoriesWithCounts.length, data: categoriesWithCounts });
};

export const createCategory = (req: AuthRequest, res: Response) => {
  const { name, description, icon } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newCat = {
    id: `cat-${uuidv4().substring(0, 6)}`,
    name,
    slug,
    description: description || '',
    icon: icon || 'Coffee',
    sort_order: db.categories.length + 1,
    is_active: true,
  };

  db.categories.push(newCat);
  return res.status(201).json({ success: true, message: 'Category created', data: newCat });
};
