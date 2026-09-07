import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Product, Category } from '../types';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { useNotifications } from '../context/NotificationContext';
import { formatCurrency } from '../utils/formatters';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Add/Edit Product Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Category Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Product Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [gstRate, setGstRate] = useState<number>(5);
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [trackStock, setTrackStock] = useState<boolean>(false);
  const [stockQuantity, setStockQuantity] = useState<number | ''>('');
  const [minStockLevel, setMinStockLevel] = useState<number | ''>('');

  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const fetchCatalog = async () => {
    setIsLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);
      if (pRes.success) setProducts(pRes.data);
      if (cRes.success) setCategories(cRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setSku('');
    setDescription('');
    setSellingPrice('');
    setCostPrice('');
    setGstRate(5);
    setImageUrl('https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80');
    setIsAvailable(true);
    setTrackStock(false);
    setStockQuantity('');
    setMinStockLevel('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategoryId(p.category_id);
    setSku(p.sku);
    setDescription(p.description || '');
    setSellingPrice(p.selling_price);
    setCostPrice(p.cost_price || 0);
    setGstRate(p.gst_rate || 5);
    setImageUrl(p.image_url);
    setIsAvailable(p.is_available);
    setTrackStock(p.track_stock);
    setStockQuantity(p.stock_quantity);
    setMinStockLevel(p.min_stock_level);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId || sellingPrice === '') return;

    try {
      const payload = {
        name,
        category_id: categoryId,
        sku: sku || undefined,
        description,
        selling_price: Number(sellingPrice),
        cost_price: Number(costPrice || 0),
        gst_rate: Number(gstRate),
        image_url: imageUrl,
        is_available: isAvailable,
        track_stock: trackStock,
        stock_quantity: Number(stockQuantity || 0),
        min_stock_level: Number(minStockLevel || 0),
      };

      if (editingProduct) {
        const res = await api.updateProduct(editingProduct.id, payload);
        if (res.success) {
          showToast('success', 'Product Updated', `${name} updated successfully`);
        }
      } else {
        const res = await api.createProduct(payload);
        if (res.success) {
          showToast('success', 'Product Created', `${name} added to catalog`);
        }
      }

      setIsModalOpen(false);
      fetchCatalog();
    } catch (err: any) {
      showToast('error', 'Operation Failed', err.message);
    }
  };

  const handleDeleteProduct = async (p: Product) => {
    if (!window.confirm(`Are you sure you want to delete ${p.name}?`)) return;
    try {
      const res = await api.deleteProduct(p.id);
      if (res.success) {
        showToast('success', 'Product Deleted', `${p.name} removed from menu`);
        fetchCatalog();
      }
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    try {
      const res = await api.createCategory({ name: newCatName, description: newCatDesc });
      if (res.success) {
        showToast('success', 'Category Created', `Category ${newCatName} created`);
        setNewCatName('');
        setNewCatDesc('');
        setIsCatModalOpen(false);
        fetchCatalog();
      }
    } catch (err: any) {
      showToast('error', 'Failed', err.message);
    }
  };

  const filtered = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Menu & Products
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure catalog items, prices, COGS costs, GST taxation, recipe links, and stock limits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCatModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <FolderPlus className="w-4 h-4" /> Add Category
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-[#181b24] p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            All Categories ({products.length})
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                selectedCategory === c.id
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-[#181b24] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-400 uppercase font-bold text-[10px]">
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4 text-right">Selling Price</th>
                <th className="py-3.5 px-4 text-right">Cost (COGS)</th>
                <th className="py-3.5 px-4 text-center">Gross Margin</th>
                <th className="py-3.5 px-4 text-center">GST</th>
                <th className="py-3.5 px-4 text-center">Stock Status</th>
                <th className="py-3.5 px-4 text-center">Recipe BOM</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">Loading catalog...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">No products found.</td>
                </tr>
              ) : (
                filtered.map(p => {
                  const grossMargin = p.selling_price - (p.cost_price || 0);
                  const marginPct = p.selling_price > 0 ? ((grossMargin / p.selling_price) * 100).toFixed(0) : '0';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{p.name}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{p.description}</p>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {p.category_name || categories.find(c => c.id === p.category_id)?.name}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{p.sku}</td>

                      <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white">
                        {formatCurrency(p.selling_price)}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400">
                        {p.cost_price ? formatCurrency(p.cost_price) : '—'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px]">
                          {marginPct}% (₹{grossMargin.toFixed(0)})
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-slate-500">{p.gst_rate || 5}%</td>

                      <td className="py-3 px-4 text-center">
                        {p.track_stock ? (
                          p.stock_quantity <= p.min_stock_level ? (
                            <Badge variant="warning">{p.stock_quantity} left</Badge>
                          ) : (
                            <Badge variant="neutral">{p.stock_quantity} in stock</Badge>
                          )
                        ) : (
                          <span className="text-slate-400 text-[10px]">Unlimited</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {p.has_recipe ? (
                          <button
                            onClick={() => navigate('/recipes')}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 hover:underline"
                          >
                            <BookOpen className="w-3 h-3" /> BOM Set
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate('/recipes')}
                            className="text-[10px] text-slate-400 hover:text-amber-500"
                          >
                            + Setup BOM
                          </button>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Cafe Product'}
        subtitle="Set menu parameters, pricing, and stock tracking"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Classic Cappuccino"
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Flavor notes, milk texture, ingredients..."
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                required
                min={0}
                value={sellingPrice}
                onChange={e => setSellingPrice(Number(e.target.value))}
                placeholder="e.g. 180"
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cost Price / COGS (₹)</label>
              <input
                type="number"
                min={0}
                value={costPrice}
                onChange={e => setCostPrice(Number(e.target.value))}
                placeholder="e.g. 36"
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">GST Rate (%)</label>
              <select
                value={gstRate}
                onChange={e => setGstRate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value={0}>0% (Exempt)</option>
                <option value={5}>5% (Standard Cafe GST)</option>
                <option value={12}>12%</option>
                <option value={18}>18%</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">SKU / Item Code</label>
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="Auto-generated if blank"
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Stock Tracking Toggle */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <label className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={trackStock}
                onChange={e => setTrackStock(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-500"
              />
              Track Finished Goods Stock Quantity
            </label>

            {trackStock && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Current Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={stockQuantity}
                    onChange={e => setStockQuantity(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Minimum Alert Level</label>
                  <input
                    type="number"
                    min={0}
                    value={minStockLevel}
                    onChange={e => setMinStockLevel(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition-colors"
            >
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title="Add Menu Category"
        subtitle="Group products logically for POS filters and reporting"
        maxWidth="sm"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              placeholder="e.g. Artisanal Bakes"
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={2}
              value={newCatDesc}
              onChange={e => setNewCatDesc(e.target.value)}
              placeholder="Freshly baked sourdoughs, croissants..."
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCatModalOpen(false)}
              className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-400 transition-colors"
            >
              Save Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
