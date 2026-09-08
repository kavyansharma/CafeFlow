import { db } from '../database/db';
import { v4 as uuidv4 } from 'uuid';
import { OrderItem } from '../database/seedData';

export class InventoryService {
  /**
   * Pre-validate stock availability for all direct products and recipe BOM raw materials.
   * Fails atomically before modifying database state or creating orders.
   */
  public static validateOrderStockAvailability(cafeId: string, orderItems: OrderItem[]): { available: boolean; error?: string } {
    // 1. Direct stock verification
    for (const item of orderItems) {
      const product = db.products.find(p => p.cafe_id === cafeId && p.id === item.product_id);
      if (!product) {
        return { available: false, error: `Product not found: ${item.product_name || item.product_id}` };
      }
      if (!product.is_available) {
        return { available: false, error: `Product ${product.name} is marked as currently unavailable.` };
      }
      if (product.track_stock && product.stock_quantity < item.quantity) {
        return {
          available: false,
          error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`,
        };
      }
    }

    // 2. Aggregate recipe raw material requirements across cart
    const requiredRawMaterials: Record<string, { name: string; required: number; unit: string }> = {};

    for (const item of orderItems) {
      const recipe = db.recipes.find(r => r.cafe_id === cafeId && r.product_id === item.product_id);
      if (recipe && recipe.items && recipe.items.length > 0) {
        for (const recipeItem of recipe.items) {
          const inv = db.inventory.find(i => i.cafe_id === cafeId && i.id === recipeItem.inventory_id);
          if (inv) {
            const needed = recipeItem.quantity_required * item.quantity;
            if (!requiredRawMaterials[inv.id]) {
              requiredRawMaterials[inv.id] = { name: inv.name, required: 0, unit: inv.unit };
            }
            requiredRawMaterials[inv.id].required += needed;
          }
        }
      }
    }

    // Check aggregated requirements against current inventory
    for (const [invId, req] of Object.entries(requiredRawMaterials)) {
      const inv = db.inventory.find(i => i.cafe_id === cafeId && i.id === invId);
      if (!inv || inv.current_quantity < req.required) {
        const avail = inv ? inv.current_quantity : 0;
        return {
          available: false,
          error: `Insufficient raw material stock: ${req.name}. Available: ${avail} ${req.unit}, Required for order: ${Number(req.required.toFixed(3))} ${req.unit}`,
        };
      }
    }

    return { available: true };
  }

  /**
   * Process stock deduction for all items in an order scoped to a specific cafe.
   */
  public static processOrderStockDeduction(cafeId: string, orderItems: OrderItem[], orderId: string, cashierName: string) {
    for (const item of orderItems) {
      const product = db.products.find(p => p.cafe_id === cafeId && p.id === item.product_id);
      if (!product) continue;

      // 1. If product tracks direct stock quantity
      if (product.track_stock) {
        product.stock_quantity = Math.max(0, product.stock_quantity - item.quantity);
        product.updated_at = new Date().toISOString();

        if (product.stock_quantity <= product.min_stock_level) {
          db.addNotification(
            cafeId,
            'LOW_STOCK',
            `Low Stock Alert: ${product.name}`,
            `${product.name} is down to ${product.stock_quantity} units (Threshold: ${product.min_stock_level}).`,
            product.stock_quantity === 0 ? 'CRITICAL' : 'WARNING',
            '/products'
          );
        }
      }

      // 2. If product has a recipe, deduct individual ingredients within the same cafe
      const recipe = db.recipes.find(r => r.cafe_id === cafeId && r.product_id === product.id);
      if (recipe && recipe.items && recipe.items.length > 0) {
        for (const recipeItem of recipe.items) {
          const inv = db.inventory.find(i => i.cafe_id === cafeId && i.id === recipeItem.inventory_id);
          if (inv) {
            const totalRequired = recipeItem.quantity_required * item.quantity;
            inv.current_quantity = Math.max(0, Number((inv.current_quantity - totalRequired).toFixed(3)));
            inv.last_updated = new Date().toISOString();

            // Log movement
            db.inventoryMovements.unshift({
              id: uuidv4(),
              cafe_id: cafeId,
              inventory_id: inv.id,
              inventory_name: inv.name,
              movement_type: 'SALE',
              quantity_change: -totalRequired,
              quantity_after: inv.current_quantity,
              unit: inv.unit,
              reason: `POS Sale: ${item.quantity}x ${product.name}`,
              reference_id: orderId,
              created_by_name: cashierName,
              created_at: new Date().toISOString(),
            });

            // Check low stock threshold
            if (inv.current_quantity <= inv.min_quantity) {
              const severity = inv.current_quantity <= inv.min_quantity * 0.5 ? 'CRITICAL' : 'WARNING';
              db.addNotification(
                cafeId,
                'LOW_STOCK',
                `Raw Material Alert: ${inv.name}`,
                `${inv.name} is at ${inv.current_quantity} ${inv.unit} (Min requirement: ${inv.min_quantity} ${inv.unit}). Replenish immediately.`,
                severity,
                '/inventory'
              );
            }
          }
        }
      }
    }
  }

  /**
   * Adjust raw material stock manually, scoped strictly to the authenticated cafe.
   */
  public static adjustStock(
    cafeId: string,
    inventoryId: string,
    quantityChange: number,
    movementType: 'PURCHASE' | 'ADJUSTMENT' | 'WASTAGE',
    reason: string,
    userName: string
  ) {
    const inv = db.inventory.find(i => i.cafe_id === cafeId && i.id === inventoryId);
    if (!inv) throw new Error('Inventory item not found in this cafe');

    const newQty = Math.max(0, Number((inv.current_quantity + quantityChange).toFixed(3)));
    inv.current_quantity = newQty;
    inv.last_updated = new Date().toISOString();

    const movement = {
      id: uuidv4(),
      cafe_id: cafeId,
      inventory_id: inv.id,
      inventory_name: inv.name,
      movement_type: movementType,
      quantity_change: quantityChange,
      quantity_after: newQty,
      unit: inv.unit,
      reason: reason || `${movementType} by ${userName}`,
      created_by_name: userName,
      created_at: new Date().toISOString(),
    };

    db.inventoryMovements.unshift(movement);
    return { item: inv, movement };
  }
}
