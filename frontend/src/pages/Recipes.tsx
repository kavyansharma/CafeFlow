import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Recipe, Product, InventoryItem, RecipeItem } from '../types';
import { Modal } from '../components/common/Modal';
import { useNotifications } from '../context/NotificationContext';
import { formatCurrency } from '../utils/formatters';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  Percent,
  Clock,
  Sparkles,
  Coffee,
  CheckCircle2,
} from 'lucide-react';

export const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [prepTime, setPrepTime] = useState<number>(3);
  const [recipeItems, setRecipeItems] = useState<
    Array<{ inventory_id: string; quantity_required: number; unit: string }>
  >([]);

  const { showToast } = useNotifications();

  const fetchRecipesData = async () => {
    setIsLoading(true);
    try {
      const [recRes, prodRes, invRes] = await Promise.all([
        api.getRecipes(),
        api.getProducts(),
        api.getInventory(),
      ]);
      if (recRes.success) setRecipes(recRes.data);
      if (prodRes.success) setProducts(prodRes.data);
      if (invRes.success) setInventory(invRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipesData();
  }, []);

  const handleOpenAdd = () => {
    const unassignedProduct = products.find(p => !recipes.some(r => r.product_id === p.id)) || products[0];
    setSelectedProductId(unassignedProduct?.id || '');
    setInstructions('');
    setPrepTime(3);
    setRecipeItems([
      { inventory_id: inventory[0]?.id || '', quantity_required: 0.018, unit: inventory[0]?.unit || 'kg' },
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rec: Recipe) => {
    setSelectedProductId(rec.product_id);
    setInstructions(rec.instructions);
    setPrepTime(rec.prep_time_mins || 3);
    setRecipeItems(
      rec.items.map(i => ({
        inventory_id: i.inventory_id,
        quantity_required: i.quantity_required,
        unit: i.unit,
      }))
    );
    setIsModalOpen(true);
  };

  const handleAddItemRow = () => {
    setRecipeItems(prev => [
      ...prev,
      { inventory_id: inventory[0]?.id || '', quantity_required: 1, unit: inventory[0]?.unit || 'kg' },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setRecipeItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setRecipeItems(prev =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (field === 'inventory_id') {
          const matchedInv = inventory.find(inv => inv.id === value);
          return {
            ...item,
            inventory_id: value,
            unit: matchedInv ? matchedInv.unit : item.unit,
          };
        }
        return { ...item, [field]: value };
      })
    );
  };

  // Calculate live estimated COGS in modal
  const modalCogs = recipeItems.reduce((sum, item) => {
    const inv = inventory.find(i => i.id === item.inventory_id);
    return sum + (inv ? inv.cost_per_unit * Number(item.quantity_required || 0) : 0);
  }, 0);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const modalMargin = (selectedProduct?.selling_price || 0) - modalCogs;
  const modalMarginPct =
    selectedProduct?.selling_price ? ((modalMargin / selectedProduct.selling_price) * 100).toFixed(1) : 0;

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || recipeItems.length === 0) return;

    try {
      const res = await api.saveRecipe({
        product_id: selectedProductId,
        instructions,
        prep_time_mins: prepTime,
        items: recipeItems,
      });

      if (res.success) {
        showToast('success', 'Recipe Saved', `Configured BOM for ${res.data.product_name} (COGS: ${formatCurrency(res.data.calculated_cogs)})`);
        setIsModalOpen(false);
        fetchRecipesData();
      }
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Recipe Management & Food Costing (BOM)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define ingredient proportions per dish to calculate precise COGS and auto-deduct raw materials on sale.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Recipe BOM
        </button>
      </div>

      {/* Recipes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recipes.map(recipe => {
          const product = products.find(p => p.id === recipe.product_id);
          const sellingPrice = product?.selling_price || recipe.selling_price || 0;
          const grossMargin = sellingPrice - recipe.calculated_cogs;
          const marginPct = sellingPrice > 0 ? ((grossMargin / sellingPrice) * 100).toFixed(0) : '0';

          return (
            <div
              key={recipe.id}
              className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Coffee className="w-4 h-4 text-amber-500" />
                      {recipe.product_name}
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {recipe.prep_time_mins || 3} mins prep time
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(recipe)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Economics Box */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">Selling Price</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{formatCurrency(sellingPrice)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">COGS (Cost)</p>
                    <p className="text-xs font-black text-amber-500">{formatCurrency(recipe.calculated_cogs)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400">Gross Margin</p>
                    <p className="text-xs font-black text-emerald-500">{marginPct}%</p>
                  </div>
                </div>

                {/* Ingredients List */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Ingredient Bill of Materials
                  </p>
                  <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar pr-1">
                    {recipe.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/40"
                      >
                        <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[150px]">
                          {item.inventory_name}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-slate-500 font-bold">
                            {item.quantity_required} {item.unit}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            ({formatCurrency(item.cost_contribution)})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                {recipe.instructions && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 line-clamp-2">
                    "{recipe.instructions}"
                  </p>
                )}
              </div>

              {/* Footer status */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-500 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Deducts on POS Sale
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recipe Edit / Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Configure Product Recipe & BOM"
        subtitle="Set ingredient measures to calculate live recipe food cost"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveRecipe} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Product *</label>
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({formatCurrency(p.selling_price)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Preparation Time (Mins)</label>
              <input
                type="number"
                min={1}
                value={prepTime}
                onChange={e => setPrepTime(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Ingredient Rows */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                Recipe Ingredients & Raw Materials
              </label>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-amber-500 hover:text-amber-400 font-bold text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Ingredient Row
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {recipeItems.map((item, idx) => {
                const inv = inventory.find(i => i.id === item.inventory_id);
                const cost = inv ? inv.cost_per_unit * Number(item.quantity_required || 0) : 0;

                return (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <select
                      value={item.inventory_id}
                      onChange={e => handleItemChange(idx, 'inventory_id', e.target.value)}
                      className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    >
                      {inventory.map(invItem => (
                        <option key={invItem.id} value={invItem.id}>
                          {invItem.name} ({formatCurrency(invItem.cost_per_unit)}/{invItem.unit})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      step="any"
                      min={0.001}
                      value={item.quantity_required}
                      onChange={e => handleItemChange(idx, 'quantity_required', Number(e.target.value))}
                      placeholder="Qty"
                      className="w-24 px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-center"
                    />

                    <span className="w-10 text-[11px] text-slate-400 font-semibold">{item.unit}</span>

                    <span className="w-20 text-right font-black text-amber-500 text-xs shrink-0">
                      {formatCurrency(cost)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live COGS Economics Meter */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">Estimated Food Cost (COGS)</p>
              <p className="text-xl font-black text-amber-600 dark:text-amber-400">{formatCurrency(modalCogs)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">Projected Margin</p>
              <p className="text-xl font-black text-emerald-500">
                {modalMarginPct}% ({formatCurrency(modalMargin)})
              </p>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Preparation Instructions (SOP)</label>
            <textarea
              rows={2}
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="e.g. 1. Pull double shot. 2. Steam whole milk to 65C microfoam..."
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition-colors"
            >
              Save Recipe BOM
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
