import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { InventoryService } from '../services/inventoryService';

export const getInventory = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id;
  if (!cafeId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const { category, search, low_stock_only } = req.query;

  let items = db.inventory.filter(i => i.cafe_id === cafeId);

  if (category && category !== 'all') {
    items = items.filter(i => i.category.toLowerCase() === String(category).toLowerCase());
  }

  if (search) {
    const s = String(search).toLowerCase();
    items = items.filter(
      i => i.name.toLowerCase().includes(s) || i.sku.toLowerCase().includes(s) || i.supplier?.toLowerCase().includes(s)
    );
  }

  if (low_stock_only === 'true') {
    items = items.filter(i => i.current_quantity <= i.min_quantity);
  }

  const itemsWithStatus = items.map(item => ({
    ...item,
    is_low_stock: item.current_quantity <= item.min_quantity,
    is_critical: item.current_quantity <= item.min_quantity * 0.5,
    stock_value: Number((item.current_quantity * item.cost_per_unit).toFixed(2)),
  }));

  const allCafeItems = db.inventory.filter(i => i.cafe_id === cafeId);

  return res.json({
    success: true,
    count: itemsWithStatus.length,
    low_stock_count: allCafeItems.filter(i => i.current_quantity <= i.min_quantity).length,
    total_valuation: Number(allCafeItems.reduce((acc, i) => acc + (i.current_quantity * i.cost_per_unit), 0).toFixed(2)),
    data: itemsWithStatus,
  });
};

export const createInventoryItem = (req: AuthRequest, res: Response) => {
  const cafeId = req.user?.cafe_id;
  if (!cafeId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const { name, category, current_quantity, unit, min_quantity, cost_per_unit, supplier, sku } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Valid item name is required' });
  }

  if (!unit || typeof unit !== 'string' || !unit.trim()) {
    return res.status(400).json({ success: false, message: 'Unit of measurement is required' });
  }

  const numQty = current_quantity !== undefined ? Number(current_quantity) : 0;
  if (isNaN(numQty) || numQty < 0) {
    return res.status(400).json({ success: false, message: 'Initial quantity cannot be negative' });
  }

  const numMinQty = min_quantity !== undefined ? Number(min_quantity) : 0;
  if (isNaN(numMinQty) || numMinQty < 0) {
    return res.status(400).json({ success: false, message: 'Minimum quantity cannot be negative' });
  }

  const numCost = cost_per_unit !== undefined ? Number(cost_per_unit) : 0;
  if (isNaN(numCost) || numCost < 0) {
    return res.status(400).json({ success: false, message: 'Cost per unit cannot be negative' });
  }

  const itemSku = sku ? String(sku).trim() : `RAW-${name.trim().substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  if (db.inventory.some(i => i.cafe_id === cafeId && i.sku.toLowerCase() === itemSku.toLowerCase())) {
    return res.status(409).json({ success: false, message: 'An inventory item with this SKU already exists in this cafe' });
  }

  const newItem = {
    id: `inv-${uuidv4().substring(0, 8)}`,
    cafe_id: cafeId,
    name: name.trim(),
    sku: itemSku,
    category: category ? String(category).trim() : 'General',
    current_quantity: numQty,
    unit: unit.trim(),
    min_quantity: numMinQty,
    cost_per_unit: numCost,
    supplier: supplier ? String(supplier).trim() : 'Local Vendor',
    last_updated: new Date().toISOString(),
  };

  db.inventory.unshift(newItem);

  // Initial movement log
  if (newItem.current_quantity > 0) {
    db.inventoryMovements.unshift({
      id: uuidv4(),
      cafe_id: cafeId,
      inventory_id: newItem.id,
      inventory_name: newItem.name,
      movement_type: 'PURCHASE',
      quantity_change: newItem.current_quantity,
      quantity_after: newItem.current_quantity,
      unit: newItem.unit,
      reason: 'Initial Opening Stock Setup',
      created_by_name: req.user?.name || 'Staff',
      created_at: new Date().toISOString(),
    });
  }

  db.logAudit(cafeId, req.user?.name || 'Staff', req.user?.role || 'STAFF', 'Create Raw Material', `Added ${newItem.name}`);

  return res.status(201).json({ success: true, message: 'Inventory item created', data: newItem });
};

export const updateInventoryItem = (req: AuthRequest, res: Response) => {
  const cafeId = req.user?.cafe_id;
  if (!cafeId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const { id } = req.params;
  const index = db.inventory.findIndex(i => i.cafe_id === cafeId && i.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Inventory item not found in this cafe' });
  }

  if (req.body.current_quantity !== undefined) {
    const qty = Number(req.body.current_quantity);
    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({ success: false, message: 'Current quantity cannot be negative' });
    }
  }

  if (req.body.min_quantity !== undefined) {
    const minQty = Number(req.body.min_quantity);
    if (isNaN(minQty) || minQty < 0) {
      return res.status(400).json({ success: false, message: 'Minimum quantity cannot be negative' });
    }
  }

  if (req.body.cost_per_unit !== undefined) {
    const cost = Number(req.body.cost_per_unit);
    if (isNaN(cost) || cost < 0) {
      return res.status(400).json({ success: false, message: 'Cost per unit cannot be negative' });
    }
  }

  if (req.body.sku) {
    const skuExists = db.inventory.some(i => i.cafe_id === cafeId && i.id !== id && i.sku.toLowerCase() === String(req.body.sku).trim().toLowerCase());
    if (skuExists) {
      return res.status(409).json({ success: false, message: 'An inventory item with this SKU already exists in this cafe' });
    }
  }

  const existing = db.inventory[index];
  const updated = {
    ...existing,
    ...req.body,
    cafe_id: cafeId,
    current_quantity: req.body.current_quantity !== undefined ? Number(req.body.current_quantity) : existing.current_quantity,
    min_quantity: req.body.min_quantity !== undefined ? Number(req.body.min_quantity) : existing.min_quantity,
    cost_per_unit: req.body.cost_per_unit !== undefined ? Number(req.body.cost_per_unit) : existing.cost_per_unit,
    last_updated: new Date().toISOString(),
  };

  db.inventory[index] = updated;
  db.logAudit(cafeId, req.user?.name || 'Staff', req.user?.role || 'STAFF', 'Update Raw Material', `Updated ${updated.name}`);

  return res.json({ success: true, message: 'Inventory item updated', data: updated });
};

export const adjustStock = (req: AuthRequest, res: Response) => {
  const cafeId = req.user?.cafe_id;
  if (!cafeId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const { inventory_id, quantity_change, movement_type, reason } = req.body;

  if (!inventory_id || quantity_change === undefined || !movement_type) {
    return res.status(400).json({ success: false, message: 'Inventory ID, quantity change, and movement type are required' });
  }

  const validMovements = ['PURCHASE', 'USAGE', 'WASTAGE', 'ADJUSTMENT', 'AUDIT_CORRECTION', 'RETURN'];
  if (!validMovements.includes(movement_type)) {
    return res.status(400).json({ success: false, message: `Invalid movement type. Allowed: ${validMovements.join(', ')}` });
  }

  const delta = Number(quantity_change);
  if (isNaN(delta) || delta === 0) {
    return res.status(400).json({ success: false, message: 'Quantity change must be a non-zero number' });
  }

  try {
    const normalizedType: 'PURCHASE' | 'ADJUSTMENT' | 'WASTAGE' = 
      movement_type === 'PURCHASE' ? 'PURCHASE' : 
      movement_type === 'WASTAGE' ? 'WASTAGE' : 'ADJUSTMENT';

    const result = InventoryService.adjustStock(
      cafeId,
      inventory_id,
      delta,
      normalizedType,
      reason || 'Manual Adjustment',
      req.user?.name || 'Staff'
    );
    return res.json({ success: true, message: 'Stock adjusted successfully', data: result });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message || 'Error adjusting stock' });
  }
};

export const getMovements = (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const cafeId = authReq.user?.cafe_id;
  if (!cafeId) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const { inventory_id, type } = req.query;
  let movements = db.inventoryMovements.filter(m => m.cafe_id === cafeId);

  if (inventory_id) {
    movements = movements.filter(m => m.inventory_id === inventory_id);
  }

  if (type && type !== 'all') {
    movements = movements.filter(m => m.movement_type === type);
  }

  return res.json({ success: true, count: movements.length, data: movements.slice(0, 100) });
};

