import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { InventoryService } from '../services/inventoryService';

export const getInventory = (req: Request, res: Response) => {
  const { category, search, low_stock_only } = req.query;

  let items = [...db.inventory];

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

  return res.json({
    success: true,
    count: itemsWithStatus.length,
    low_stock_count: db.inventory.filter(i => i.current_quantity <= i.min_quantity).length,
    total_valuation: Number(db.inventory.reduce((acc, i) => acc + (i.current_quantity * i.cost_per_unit), 0).toFixed(2)),
    data: itemsWithStatus,
  });
};

export const createInventoryItem = (req: AuthRequest, res: Response) => {
  const { name, category, current_quantity, unit, min_quantity, cost_per_unit, supplier } = req.body;

  if (!name || !unit) {
    return res.status(400).json({ success: false, message: 'Name and unit are required' });
  }

  const sku = `RAW-${name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  const newItem = {
    id: `inv-${uuidv4().substring(0, 8)}`,
    name,
    sku,
    category: category || 'General',
    current_quantity: Number(current_quantity || 0),
    unit,
    min_quantity: Number(min_quantity || 0),
    cost_per_unit: Number(cost_per_unit || 0),
    supplier: supplier || 'Local Vendor',
    last_updated: new Date().toISOString(),
  };

  db.inventory.unshift(newItem);

  // Initial movement log
  if (newItem.current_quantity > 0) {
    db.inventoryMovements.unshift({
      id: uuidv4(),
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

  db.logAudit(req.user?.name || 'Staff', req.user?.role || 'STAFF', 'Create Raw Material', `Added ${newItem.name}`);

  return res.status(201).json({ success: true, message: 'Inventory item created', data: newItem });
};

export const updateInventoryItem = (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const index = db.inventory.findIndex(i => i.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Inventory item not found' });
  }

  const existing = db.inventory[index];
  const updated = {
    ...existing,
    ...req.body,
    current_quantity: req.body.current_quantity !== undefined ? Number(req.body.current_quantity) : existing.current_quantity,
    min_quantity: req.body.min_quantity !== undefined ? Number(req.body.min_quantity) : existing.min_quantity,
    cost_per_unit: req.body.cost_per_unit !== undefined ? Number(req.body.cost_per_unit) : existing.cost_per_unit,
    last_updated: new Date().toISOString(),
  };

  db.inventory[index] = updated;
  db.logAudit(req.user?.name || 'Staff', req.user?.role || 'STAFF', 'Update Raw Material', `Updated ${updated.name}`);

  return res.json({ success: true, message: 'Inventory item updated', data: updated });
};

export const adjustStock = (req: AuthRequest, res: Response) => {
  const { inventory_id, quantity_change, movement_type, reason } = req.body;

  if (!inventory_id || quantity_change === undefined || !movement_type) {
    return res.status(400).json({ success: false, message: 'Inventory ID, quantity change, and movement type are required' });
  }

  try {
    const result = InventoryService.adjustStock(
      inventory_id,
      Number(quantity_change),
      movement_type,
      reason,
      req.user?.name || 'Staff'
    );
    return res.json({ success: true, message: 'Stock adjusted successfully', data: result });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message || 'Error adjusting stock' });
  }
};

export const getMovements = (req: Request, res: Response) => {
  const { inventory_id, type } = req.query;
  let movements = [...db.inventoryMovements];

  if (inventory_id) {
    movements = movements.filter(m => m.inventory_id === inventory_id);
  }

  if (type && type !== 'all') {
    movements = movements.filter(m => m.movement_type === type);
  }

  return res.json({ success: true, count: movements.length, data: movements.slice(0, 100) });
};
