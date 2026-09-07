import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Customer, HeldOrder } from '../types';
import { api } from '../services/api';
import { useNotifications } from './NotificationContext';

interface CartContextType {
  cart: CartItem[];
  customer: Customer | null;
  heldOrders: HeldOrder[];
  discountType: 'NONE' | 'PERCENTAGE' | 'FIXED' | 'LOYALTY';
  discountValue: number; // percentage value (e.g. 10) or fixed amount (e.g. 50)
  pointsToRedeem: number;
  orderNotes: string;
  
  // Calculations
  subtotal: number;
  discountAmount: number;
  loyaltyDiscount: number;
  taxAmount: number;
  grandTotal: number;
  totalItemsCount: number;

  // Actions
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setCustomer: (customer: Customer | null) => void;
  setDiscount: (type: 'NONE' | 'PERCENTAGE' | 'FIXED' | 'LOYALTY', value: number) => void;
  setPointsToRedeem: (points: number) => void;
  setOrderNotes: (notes: string) => void;
  holdCurrentBill: () => Promise<void>;
  resumeHeldBill: (heldOrder: HeldOrder) => void;
  deleteHeldBill: (id: string) => Promise<void>;
  fetchHeldOrders: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [discountType, setDiscountType] = useState<'NONE' | 'PERCENTAGE' | 'FIXED' | 'LOYALTY'>('NONE');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [pointsToRedeem, setPointsToRedeemState] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState<string>('');
  const { showToast } = useNotifications();

  const fetchHeldOrders = async () => {
    try {
      const res = await api.getHeldOrders();
      if (res.success) {
        setHeldOrders(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch held orders', err);
    }
  };

  useEffect(() => {
    fetchHeldOrders();
  }, []);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomer(null);
    setDiscountType('NONE');
    setDiscountValue(0);
    setPointsToRedeemState(0);
    setOrderNotes('');
  };

  const setDiscount = (type: 'NONE' | 'PERCENTAGE' | 'FIXED' | 'LOYALTY', value: number) => {
    setDiscountType(type);
    setDiscountValue(value);
  };

  const setPointsToRedeem = (points: number) => {
    if (!customer) {
      setPointsToRedeemState(0);
      return;
    }
    const maxAvailable = customer.loyalty_points || 0;
    const bounded = Math.min(points, maxAvailable);
    setPointsToRedeemState(bounded);
  };

  const holdCurrentBill = async () => {
    if (cart.length === 0) {
      showToast('warning', 'Empty Cart', 'Add products to cart before holding bill');
      return;
    }

    try {
      const res = await api.holdOrder({
        items: cart,
        customer_name: customer ? customer.name : 'Walk-in Customer',
        customer_phone: customer?.phone,
        notes: orderNotes || 'Parked Bill',
      });

      if (res.success) {
        showToast('info', 'Bill Placed on Hold', `Bill for ${customer?.name || 'Walk-in'} held successfully`);
        clearCart();
        fetchHeldOrders();
      }
    } catch (err: any) {
      showToast('error', 'Hold Failed', err.message);
    }
  };

  const resumeHeldBill = (heldOrder: HeldOrder) => {
    setCart(heldOrder.items);
    if (heldOrder.customer_name && heldOrder.customer_name !== 'Walk-in Customer') {
      setCustomer({
        id: `temp-${Date.now()}`,
        name: heldOrder.customer_name,
        phone: heldOrder.customer_phone || '',
        loyalty_points: 0,
        total_orders: 1,
        total_spent: 0,
        created_at: new Date().toISOString(),
      });
    } else {
      setCustomer(null);
    }
    setOrderNotes(heldOrder.notes || '');
    deleteHeldBill(heldOrder.id);
    showToast('success', 'Bill Resumed', `Resumed bill for ${heldOrder.customer_name}`);
  };

  const deleteHeldBill = async (id: string) => {
    try {
      await api.removeHeldOrder(id);
      setHeldOrders(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      console.error('Failed to delete held bill', err);
    }
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.product.selling_price * item.quantity, 0);

  let discountAmount = 0;
  if (discountType === 'PERCENTAGE' && discountValue > 0) {
    discountAmount = Number(((subtotal * discountValue) / 100).toFixed(2));
  } else if (discountType === 'FIXED' && discountValue > 0) {
    discountAmount = Math.min(discountValue, subtotal);
  }

  // 1 loyalty point = ₹1.00 discount
  const loyaltyDiscount = Number((pointsToRedeem * 1.0).toFixed(2));
  const totalDiscounts = discountAmount + loyaltyDiscount;

  const taxableAmount = Math.max(0, subtotal - totalDiscounts);
  const taxAmount = cart.reduce((acc, item) => {
    const itemSubtotal = item.product.selling_price * item.quantity;
    const ratio = subtotal > 0 ? itemSubtotal / subtotal : 0;
    const itemDiscounted = taxableAmount * ratio;
    const itemTax = (itemDiscounted * (item.product.gst_rate || 5)) / 100;
    return acc + itemTax;
  }, 0);

  const grandTotal = Math.max(0, Number((taxableAmount + taxAmount).toFixed(2)));
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        customer,
        heldOrders,
        discountType,
        discountValue,
        pointsToRedeem,
        orderNotes,
        subtotal: Number(subtotal.toFixed(2)),
        discountAmount: Number(discountAmount.toFixed(2)),
        loyaltyDiscount: Number(loyaltyDiscount.toFixed(2)),
        taxAmount: Number(taxAmount.toFixed(2)),
        grandTotal,
        totalItemsCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        setCustomer,
        setDiscount,
        setPointsToRedeem,
        setOrderNotes,
        holdCurrentBill,
        resumeHeldBill,
        deleteHeldBill,
        fetchHeldOrders,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
