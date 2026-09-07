import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { InventoryItem, InventoryMovement } from '../types';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { useNotifications } from '../context/NotificationContext';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  History,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Sliders,
  DollarSign,
  Layers,
} from 'lucide-react';

export const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [activeTab, setActiveTab] = useState<'stock' | 'movements'>('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Stock Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState<number | ''>('');
  const [movementType, setMovementType] = useState<'PURCHASE' | 'ADJUSTMENT' | 'WASTAGE'>('PURCHASE');
  const [adjustReason, setAdjustReason] = useState('');

  // Add Item Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Dairy');
  const [currentQty, setCurrentQty] = useState<number | ''>('');
  const [unit, setUnit] = useState('kg');
  const [minQty, setMinQty] = useState<number | ''>('');
  const [costPerUnit, setCostPerUnit] = useState<number | ''>('');
  const [supplier, setSupplier] = useState('');

  const { showToast } = useNotifications();

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const [invRes, movRes] = await Promise.all([
        api.getInventory(),
        api.getMovements(),
      ]);
      if (invRes.success) setItems(invRes.data);
      if (movRes.success) setMovements(movRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenAdjust = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustQty('');
    setMovementType('PURCHASE');
    setAdjustReason('');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || adjustQty === '') return;

    try {
      const change = movementType === 'WASTAGE' ? -Math.abs(Number(adjustQty)) : Number(adjustQty);
      const res = await api.adjustStock({
        inventory_id: selectedItem.id,
        quantity_change: change,
        movement_type: movementType,
        reason: adjustReason || `${movementType} logged manually`,
      });

      if (res.success) {
        showToast('success', 'Stock Adjusted', `${selectedItem.name} updated (${change > 0 ? '+' : ''}${change} ${selectedItem.unit})`);
        setIsAdjustModalOpen(false);
        fetchInventory();
      }
    } catch (err: any) {
      showToast('error', 'Adjustment Failed', err.message);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !unit) return;

    try {
      const res = await api.createInventoryItem({
        name,
        category,
        current_quantity: Number(currentQty || 0),
        unit,
        min_quantity: Number(minQty || 0),
        cost_per_unit: Number(costPerUnit || 0),
        supplier,
      });

      if (res.success) {
        showToast('success', 'Raw Material Created', `${name} added to inventory`);
        setIsAddModalOpen(false);
        setName('');
        setCurrentQty('');
        setMinQty('');
        setCostPerUnit('');
        setSupplier('');
        fetchInventory();
      }
    } catch (err: any) {
      showToast('error', 'Create Failed', err.message);
    }
  };

  const totalValuation = items.reduce((sum, i) => sum + i.current_quantity * i.cost_per_unit, 0);
  const lowStockCount = items.filter(i => i.current_quantity <= i.min_quantity).length;

  const filteredItems = items.filter(i => {
    const matchesSearch =
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.supplier?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLow = !lowStockFilter || (i.current_quantity <= i.min_quantity);
    return matchesSearch && matchesLow;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Inventory & Raw Materials
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track ingredient stocks, safety reorder thresholds, and live POS recipe BOM deductions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Raw Material
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Stock Valuation</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{formatCurrency(totalValuation)}</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Low Stock Items</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{lowStockCount} Materials</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Raw SKUs</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{items.length} Ingredients</h3>
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#181b24] p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'stock'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" /> Stock Table
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'movements'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Movement History ({movements.length})
          </button>
        </div>

        {activeTab === 'stock' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search raw materials..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={() => setLowStockFilter(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 shrink-0 ${
                lowStockFilter
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Low Stock ({lowStockCount})
            </button>
          </div>
        )}
      </div>

      {/* Main Table Content */}
      <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        {activeTab === 'stock' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-3.5 px-4">Raw Material</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Current Stock</th>
                  <th className="py-3.5 px-4 text-right">Min Threshold</th>
                  <th className="py-3.5 px-4 text-right">Unit Cost</th>
                  <th className="py-3.5 px-4 text-right">Valuation</th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">Loading stock table...</td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">No inventory items found.</td>
                  </tr>
                ) : (
                  filteredItems.map(item => {
                    const isLow = item.current_quantity <= item.min_quantity;
                    const isCritical = item.current_quantity <= item.min_quantity * 0.5;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{item.name}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{item.sku}</td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{item.category}</td>
                        <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white">
                          {item.current_quantity} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-500 dark:text-slate-400">
                          {item.min_quantity} {item.unit}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                          {formatCurrency(item.cost_per_unit)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-black text-amber-500">
                          {formatCurrency(item.current_quantity * item.cost_per_unit)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">{item.supplier || '—'}</td>
                        <td className="py-3.5 px-4 text-center">
                          {isCritical ? (
                            <Badge variant="critical">Critical</Badge>
                          ) : isLow ? (
                            <Badge variant="warning">Low Stock</Badge>
                          ) : (
                            <Badge variant="success">Healthy</Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenAdjust(item)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-bold text-[11px] border border-amber-500/20 transition-colors"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-3.5 px-4">Date / Time</th>
                  <th className="py-3.5 px-4">Item Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4 text-right">Quantity Change</th>
                  <th className="py-3.5 px-4 text-right">Balance After</th>
                  <th className="py-3.5 px-4">Reason / Order Ref</th>
                  <th className="py-3.5 px-4 text-right">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">No stock movements recorded yet.</td>
                  </tr>
                ) : (
                  movements.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-500">{formatDateTime(m.created_at)}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{m.inventory_name}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.movement_type === 'PURCHASE'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : m.movement_type === 'SALE'
                              ? 'bg-sky-500/10 text-sky-500'
                              : m.movement_type === 'WASTAGE'
                              ? 'bg-rose-500/10 text-rose-500'
                              : 'bg-slate-500/10 text-slate-400'
                          }`}
                        >
                          {m.movement_type}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-black ${
                          m.quantity_change > 0 ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change} {m.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                        {m.quantity_after} {m.unit}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{m.reason}</td>
                      <td className="py-3 px-4 text-right text-slate-500 font-semibold">{m.created_by_name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title={`Adjust Stock: ${selectedItem?.name}`}
        subtitle={`Current Level: ${selectedItem?.current_quantity} ${selectedItem?.unit}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Adjustment Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['PURCHASE', 'ADJUSTMENT', 'WASTAGE'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMovementType(t)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${
                    movementType === t
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Quantity to {movementType === 'WASTAGE' ? 'Deduct' : 'Add/Adjust'} ({selectedItem?.unit}) *
            </label>
            <input
              type="number"
              step="any"
              required
              value={adjustQty}
              onChange={e => setAdjustQty(Number(e.target.value))}
              placeholder="e.g. 5.0"
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-sm"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reason / Vendor Invoice Ref</label>
            <input
              type="text"
              value={adjustReason}
              onChange={e => setAdjustReason(e.target.value)}
              placeholder="e.g. Received weekly fresh milk batch PO-948"
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition-colors"
            >
              Update Stock Level
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Raw Material Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Raw Material"
        subtitle="Track ingredient consumption and minimum reorder triggers"
        maxWidth="md"
      >
        <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Ingredient Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Whipping Cream 35%"
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Dairy">Dairy</option>
                <option value="Coffee">Coffee Beans</option>
                <option value="Syrups">Syrups & Sauces</option>
                <option value="Dry Goods">Dry Goods</option>
                <option value="Bakery">Bakery</option>
                <option value="Packaging">Packaging</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unit of Measure *</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="kg">kg (Kilogram)</option>
                <option value="g">g (Gram)</option>
                <option value="L">L (Liter)</option>
                <option value="ml">ml (Milliliter)</option>
                <option value="pcs">pcs (Pieces)</option>
                <option value="pack">pack (Packs)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Current Qty</label>
              <input
                type="number"
                step="any"
                min={0}
                value={currentQty}
                onChange={e => setCurrentQty(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Min Threshold</label>
              <input
                type="number"
                step="any"
                min={0}
                value={minQty}
                onChange={e => setMinQty(Number(e.target.value))}
                placeholder="2"
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cost / Unit (₹)</label>
              <input
                type="number"
                step="any"
                min={0}
                value={costPerUnit}
                onChange={e => setCostPerUnit(Number(e.target.value))}
                placeholder="120"
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Supplier / Vendor Name</label>
            <input
              type="text"
              value={supplier}
              onChange={e => setSupplier(e.target.value)}
              placeholder="e.g. Amul Fresh Hub"
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition-colors"
            >
              Save Raw Material
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
