import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { RecipeItem } from '../database/seedData';

export const getRecipes = (req: Request, res: Response) => {
  const recipesWithDetails = db.recipes.map(r => {
    const product = db.products.find(p => p.id === r.product_id);
    const sellingPrice = product ? product.selling_price : 0;
    const cogs = r.calculated_cogs;
    const grossMargin = sellingPrice - cogs;
    const marginPercent = sellingPrice > 0 ? Number(((grossMargin / sellingPrice) * 100).toFixed(1)) : 0;

    return {
      ...r,
      product_name: product?.name || r.product_name,
      selling_price: sellingPrice,
      gross_margin: Number(grossMargin.toFixed(2)),
      margin_percent: marginPercent,
    };
  });

  return res.json({ success: true, count: recipesWithDetails.length, data: recipesWithDetails });
};

export const getRecipeByProductId = (req: Request, res: Response) => {
  const { productId } = req.params;
  const recipe = db.recipes.find(r => r.product_id === productId);
  const product = db.products.find(p => p.id === productId);

  if (!recipe) {
    return res.json({
      success: true,
      exists: false,
      product,
      data: null,
    });
  }

  const sellingPrice = product ? product.selling_price : 0;
  const grossMargin = sellingPrice - recipe.calculated_cogs;
  const marginPercent = sellingPrice > 0 ? Number(((grossMargin / sellingPrice) * 100).toFixed(1)) : 0;

  return res.json({
    success: true,
    exists: true,
    data: {
      ...recipe,
      product_name: product?.name,
      selling_price: sellingPrice,
      gross_margin: Number(grossMargin.toFixed(2)),
      margin_percent: marginPercent,
    },
  });
};

export const saveRecipe = (req: AuthRequest, res: Response) => {
  const { product_id, instructions, prep_time_mins, items } = req.body;

  if (!product_id || !Array.isArray(items)) {
    return res.status(400).json({ success: false, message: 'Product ID and recipe items array are required' });
  }

  const product = db.products.find(p => p.id === product_id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Calculate COGS from recipe items
  let totalCogs = 0;
  const processedItems: RecipeItem[] = items.map((item: any) => {
    const inv = db.inventory.find(i => i.id === item.inventory_id);
    const unitCost = inv ? inv.cost_per_unit : 0;
    const costContrib = Number((unitCost * Number(item.quantity_required)).toFixed(2));
    totalCogs += costContrib;

    return {
      inventory_id: item.inventory_id,
      inventory_name: inv ? inv.name : 'Unknown Raw Material',
      quantity_required: Number(item.quantity_required),
      unit: item.unit || inv?.unit || 'units',
      cost_contribution: costContrib,
    };
  });

  const existingIndex = db.recipes.findIndex(r => r.product_id === product_id);
  const roundedCogs = Number(totalCogs.toFixed(2));

  let savedRecipe;
  if (existingIndex >= 0) {
    savedRecipe = {
      ...db.recipes[existingIndex],
      instructions: instructions || '',
      prep_time_mins: Number(prep_time_mins || 5),
      calculated_cogs: roundedCogs,
      items: processedItems,
    };
    db.recipes[existingIndex] = savedRecipe;
  } else {
    savedRecipe = {
      id: `rec-${uuidv4().substring(0, 8)}`,
      product_id,
      product_name: product.name,
      instructions: instructions || '',
      prep_time_mins: Number(prep_time_mins || 5),
      calculated_cogs: roundedCogs,
      items: processedItems,
    };
    db.recipes.push(savedRecipe);
  }

  // Sync cost_price and has_recipe flag onto product
  product.has_recipe = true;
  product.cost_price = roundedCogs;
  product.updated_at = new Date().toISOString();

  db.logAudit(req.user?.name || 'Staff', req.user?.role || 'STAFF', 'Save Recipe BOM', `Configured recipe for ${product.name} (COGS: ₹${roundedCogs})`);

  return res.json({ success: true, message: 'Recipe saved successfully', data: savedRecipe });
};

export const deleteRecipe = (req: AuthRequest, res: Response) => {
  const { productId } = req.params;
  const index = db.recipes.findIndex(r => r.product_id === productId);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Recipe not found' });
  }

  const removed = db.recipes.splice(index, 1)[0];
  const product = db.products.find(p => p.id === productId);
  if (product) {
    product.has_recipe = false;
  }

  return res.json({ success: true, message: 'Recipe deleted', data: removed });
};
