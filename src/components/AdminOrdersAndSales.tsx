import React, { useState, useEffect, useMemo } from 'react';
import { HousePlan, HousePlanOrder, Settings } from '../types';
import { defaultHousePlans } from '../data/defaultHousePlans';
import {
  TrendingUp,
  ShoppingBag,
  Eye,
  IndianRupee,
  Users,
  Download,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  MessageCircle,
  ExternalLink,
  FileSpreadsheet,
  Copy,
  Trash2,
  Edit3,
  RefreshCw,
  X,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Layers,
  Compass,
  FileText,
  BadgeCheck,
  Check,
  DollarSign
} from 'lucide-react';

interface AdminOrdersAndSalesProps {
  housePlans?: HousePlan[];
  refreshAllData?: () => void;
  settings?: Settings | null;
  isStaticMode?: boolean;
}

export const AdminOrdersAndSales: React.FC<AdminOrdersAndSalesProps> = ({
  housePlans = [],
  refreshAllData,
  settings,
  isStaticMode = false
}) => {
  const plans = housePlans && housePlans.length > 0 ? housePlans : defaultHousePlans;

  // Local state
  const [orders, setOrders] = useState<HousePlanOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<'all' | 'Razorpay' | 'PhonePe' | 'Manual' | 'Free Claim'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Completed' | 'Pending' | 'Failed'>('all');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all');
  const [activeView, setActiveView] = useState<'all' | 'overview' | 'products' | 'purchasers'>('all');

  // Modals
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<HousePlanOrder | null>(null);
  const [isManualOrderModalOpen, setIsManualOrderModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Manual Order Form State
  const [manualForm, setManualForm] = useState({
    planId: plans[0]?.id || 'lh-hp-1800-duplex-villa',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    amount: plans[0]?.cadPackagePrice || 999,
    paymentMethod: 'Manual',
    notes: 'Walk-in / Direct bank payment consultation'
  });

  // Fetch orders and analytics
  const loadOrdersData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      let combinedOrders: HousePlanOrder[] = [];

      // 1. Fetch from backend API
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            combinedOrders = [...data];
          }
        }
      } catch (srvErr) {
        console.warn('API orders fetch notice, reading from local cache:', srvErr);
      }

      // 2. Fetch and merge from localStorage
      try {
        const local = localStorage.getItem('lifehut_local_orders');
        if (local) {
          const localOrders: HousePlanOrder[] = JSON.parse(local);
          if (Array.isArray(localOrders)) {
            for (const lo of localOrders) {
              const exists = combinedOrders.some(
                co => co.id === lo.id ||
                     (lo.transactionId && co.transactionId === lo.transactionId) ||
                     (lo.razorpayPaymentId && co.razorpayPaymentId === lo.razorpayPaymentId)
              );
              if (!exists) {
                combinedOrders.unshift(lo);
              }
            }
          }
        }
      } catch (locErr) {
        console.warn('Local storage orders parse notice:', locErr);
      }

      // Sort by createdAt descending
      combinedOrders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setOrders(combinedOrders);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrdersData();

    // Auto refresh when a customer completes a checkout or order is added
    const handleOrdersUpdated = () => {
      loadOrdersData(true);
    };

    window.addEventListener('lifehut_orders_updated', handleOrdersUpdated);
    window.addEventListener('storage', handleOrdersUpdated);
    return () => {
      window.removeEventListener('lifehut_orders_updated', handleOrdersUpdated);
      window.removeEventListener('storage', handleOrdersUpdated);
    };
  }, []);

  // Sync manual orders to localStorage for safety
  const saveOrdersList = (newOrders: HousePlanOrder[]) => {
    setOrders(newOrders);
    try {
      localStorage.setItem('lifehut_local_orders', JSON.stringify(newOrders));
    } catch (err) {
      console.warn('Storage save failed:', err);
    }
  };

  // Aggregated Sales & Performance Metrics
  const metrics = useMemo(() => {
    const completedOrders = orders.filter(o => o.paymentStatus === 'Completed');
    const totalSales = completedOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    const paidOrders = completedOrders.filter(o => Number(o.amount) > 0);
    const totalPaidOrdersCount = paidOrders.length;
    const freeClaimsCount = completedOrders.filter(o => Number(o.amount) === 0).length;
    const totalOrdersCount = completedOrders.length;
    
    // Product catalog views
    const totalCatalogViews = plans.reduce((sum, p) => sum + (Number(p.views) || 0), 0);
    
    // Conversion rate
    const conversionRate = totalCatalogViews > 0 
      ? ((totalOrdersCount / totalCatalogViews) * 100).toFixed(2) 
      : '0.00';

    // Average Order Value (AOV) on paid blueprints
    const averageOrderValue = totalPaidOrdersCount > 0 
      ? Math.round(totalSales / totalPaidOrdersCount) 
      : 0;

    return {
      totalSales,
      totalOrdersCount,
      totalPaidOrdersCount,
      freeClaimsCount,
      totalCatalogViews,
      conversionRate,
      averageOrderValue
    };
  }, [orders, plans]);

  // Product-wise Performance stats
  const productPerformance = useMemo(() => {
    return plans.map(plan => {
      const planOrders = orders.filter(
        o => (o.planId === plan.id || o.planCode === plan.planCode) && o.paymentStatus === 'Completed'
      );
      
      const purchaseCount = planOrders.length > 0 ? planOrders.length : (plan.purchaseCount || 0);
      const paidRevenue = planOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
      const calculatedRevenue = paidRevenue > 0 ? paidRevenue : (purchaseCount * (plan.cadPackagePrice || 999));
      
      const views = plan.views || 0;
      const conversion = views > 0 ? ((purchaseCount / views) * 100).toFixed(1) : '0.0';
      const viewsShare = metrics.totalCatalogViews > 0 
        ? ((views / metrics.totalCatalogViews) * 100).toFixed(1) 
        : '0.0';

      return {
        id: plan.id,
        planCode: plan.planCode,
        title: plan.title,
        floorsLabel: plan.floorsLabel,
        bedrooms: plan.bedrooms,
        builtUpArea: plan.builtUpArea,
        price: plan.cadPackagePrice,
        elevationImage: plan.elevationImage,
        views,
        viewsShare,
        purchaseCount,
        revenue: calculatedRevenue,
        conversionRate: conversion,
        ordersCount: planOrders.length,
        recentOrders: planOrders.slice(0, 3)
      };
    }).sort((a, b) => b.purchaseCount - a.purchaseCount);
  }, [plans, orders, metrics.totalCatalogViews]);

  // Filtered Orders List (for Purchaser Contact Details & Transactions)
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search query (customer name, phone, email, plan code, txn ID)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = order.customerName?.toLowerCase().includes(q);
        const matchesPhone = order.customerPhone?.toLowerCase().includes(q);
        const matchesEmail = order.customerEmail?.toLowerCase().includes(q);
        const matchesPlan = order.planCode?.toLowerCase().includes(q) || order.planTitle?.toLowerCase().includes(q);
        const matchesTxn = order.transactionId?.toLowerCase().includes(q) || order.id?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesEmail && !matchesPlan && !matchesTxn) {
          return false;
        }
      }

      // Filter by payment method
      if (filterMethod !== 'all' && order.paymentMethod !== filterMethod) {
        return false;
      }

      // Filter by payment status
      if (filterStatus !== 'all' && order.paymentStatus !== filterStatus) {
        return false;
      }

      // Filter by specific plan
      if (selectedPlanFilter !== 'all') {
        if (order.planId !== selectedPlanFilter && order.planCode !== selectedPlanFilter) {
          return false;
        }
      }

      return true;
    });
  }, [orders, searchQuery, filterMethod, filterStatus, selectedPlanFilter]);

  // Handle Manual Order Submission
  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPlan = plans.find(p => p.id === manualForm.planId) || plans[0];

    const newOrderPayload: Partial<HousePlanOrder> = {
      id: `ord_man_${Date.now()}`,
      transactionId: `TXN_OFFICE_${Date.now().toString().slice(-6)}`,
      planId: selectedPlan?.id || '',
      planCode: selectedPlan?.planCode || '',
      planTitle: selectedPlan?.title || '',
      customerName: manualForm.customerName.trim() || 'Direct Client',
      customerPhone: manualForm.customerPhone.trim() || '',
      customerEmail: manualForm.customerEmail.trim() || '',
      amount: Number(manualForm.amount) >= 0 ? Number(manualForm.amount) : (selectedPlan?.cadPackagePrice || 999),
      currency: 'INR',
      paymentMethod: manualForm.paymentMethod as any,
      paymentStatus: 'Completed',
      downloadToken: `tok_man_${Date.now()}`,
      createdAt: new Date().toISOString(),
      deliveryStatus: 'Delivered',
      notes: manualForm.notes.trim()
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrderPayload)
      });

      if (res.ok) {
        const json = await res.json();
        const created = json.order || (newOrderPayload as HousePlanOrder);
        saveOrdersList([created, ...orders]);
      } else {
        saveOrdersList([newOrderPayload as HousePlanOrder, ...orders]);
      }
    } catch (err) {
      console.warn('Fallback saving manual order locally:', err);
      saveOrdersList([newOrderPayload as HousePlanOrder, ...orders]);
    }

    // Reset and close
    setIsManualOrderModalOpen(false);
    setManualForm({
      planId: plans[0]?.id || '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      amount: plans[0]?.cadPackagePrice || 999,
      paymentMethod: 'Manual',
      notes: 'Walk-in / Direct bank payment consultation'
    });

    setSaveSuccessMsg('New manual order recorded successfully!');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
    if (refreshAllData) refreshAllData();
  };

  // Toggle delivery status
  const handleToggleDeliveryStatus = async (order: HousePlanOrder) => {
    const updatedStatus = order.deliveryStatus === 'Delivered' ? 'Pending Dispatch' : 'Delivered';
    const updatedOrders = orders.map(o => o.id === order.id ? { ...o, deliveryStatus: updatedStatus } : o);
    saveOrdersList(updatedOrders);

    try {
      await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryStatus: updatedStatus })
      });
    } catch (err) {
      console.warn('API update failed:', err);
    }
  };

  // Delete an order
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to remove this order from sales records?')) {
      return;
    }

    const updated = orders.filter(o => o.id !== orderId);
    saveOrdersList(updated);

    try {
      await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('API delete failed:', err);
    }
  };

  // Copy to clipboard helper
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export CSV Report
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('No orders available to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Transaction ID',
      'Date & Time',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'Plan Code',
      'Plan Title',
      'Amount (INR)',
      'Payment Method',
      'Payment Status',
      'Delivery Status',
      'Notes'
    ];

    const rows = orders.map(o => [
      `"${o.id || ''}"`,
      `"${o.transactionId || ''}"`,
      `"${new Date(o.createdAt).toLocaleString('en-IN')}"`,
      `"${(o.customerName || '').replace(/"/g, '""')}"`,
      `"${o.customerPhone || ''}"`,
      `"${o.customerEmail || ''}"`,
      `"${o.planCode || ''}"`,
      `"${(o.planTitle || '').replace(/"/g, '""')}"`,
      `"${o.amount || 0}"`,
      `"${o.paymentMethod || 'PhonePe'}"`,
      `"${o.paymentStatus || 'Completed'}"`,
      `"${o.deliveryStatus || 'Delivered'}"`,
      `"${(o.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Lifehut_HousePlans_Orders_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 text-left">
      {/* Notifications */}
      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* Top Section: Dashboard Header with Quick Actions */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5" />
                Live Revenue & Conversion Metrics
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-100 text-slate-600">
                PhonePe Integrated
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A2332] tracking-tight">
              House Plans Orders & Sales Dashboard
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Track real-time digital CAD blueprint sales, monitor product-wise catalog view traffic, measure conversion rates, and access verified purchaser contact details.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => loadOrdersData(true)}
              disabled={refreshing}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              title="Refresh Orders & Sales Metrics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
              title="Export all orders to CSV spreadsheet"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsManualOrderModalOpen(true)}
              className="px-5 py-2.5 bg-[#1A6DB5] hover:bg-[#1558a0] text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-md shadow-[#1A6DB5]/20"
            >
              <Plus className="w-4 h-4" />
              <span>Record Direct Sale</span>
            </button>
          </div>
        </div>

        {/* 5 Primary Executive Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8 pt-8 border-t border-slate-100">
          
          {/* Card 1: Total Sales */}
          <div className="bg-gradient-to-br from-emerald-50/70 to-white p-5 rounded-2xl border border-emerald-100/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Total Sales Revenue</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-black text-emerald-900 tracking-tight">
              ₹{metrics.totalSales.toLocaleString('en-IN')}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{metrics.totalPaidOrdersCount} Paid Transactions</span>
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="bg-gradient-to-br from-blue-50/70 to-white p-5 rounded-2xl border border-blue-100/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Total Orders</span>
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-black text-blue-950 tracking-tight">
              {metrics.totalOrdersCount}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-700 font-medium">
              <span>{metrics.freeClaimsCount} Promo Claims</span>
              <span className="text-slate-300">•</span>
              <span>100% Fulfilled</span>
            </div>
          </div>

          {/* Card 3: Total Product Views */}
          <div className="bg-gradient-to-br from-indigo-50/70 to-white p-5 rounded-2xl border border-indigo-100/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">Catalog Plan Views</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">
              {metrics.totalCatalogViews.toLocaleString('en-IN')}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-700 font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>Across {plans.length} Architectural Plans</span>
            </div>
          </div>

          {/* Card 4: Conversion Rate */}
          <div className="bg-gradient-to-br from-amber-50/70 to-white p-5 rounded-2xl border border-amber-100/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Overall Conversion</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-black text-amber-950 tracking-tight">
              {metrics.conversionRate}%
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 font-medium">
              <span>Views to blueprint downloads</span>
            </div>
          </div>

          {/* Card 5: Average Order Value */}
          <div className="bg-gradient-to-br from-purple-50/70 to-white p-5 rounded-2xl border border-purple-100/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">Average Order (AOV)</span>
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                <BadgeCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-black text-purple-950 tracking-tight">
              ₹{metrics.averageOrderValue.toLocaleString('en-IN')}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-700 font-medium">
              <span>Per paid CAD & PDF package</span>
            </div>
          </div>

        </div>
      </div>

      {/* View Switcher Tabs (All, Product Wise, Purchaser Details) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveView('all')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeView === 'all'
              ? 'bg-[#1A2332] text-white'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Complete Dashboard</span>
        </button>

        <button
          onClick={() => setActiveView('products')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeView === 'products'
              ? 'bg-[#1A2332] text-white'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Product Wise Analytics ({productPerformance.length})</span>
        </button>

        <button
          onClick={() => setActiveView('purchasers')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
            activeView === 'purchasers'
              ? 'bg-[#1A2332] text-white'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Purchaser Contacts & Orders ({filteredOrders.length})</span>
        </button>
      </div>

      {/* SECTION 1: PRODUCT WISE PERFORMANCE TABLE (Views, Purchases, Revenue, Conversion) */}
      {(activeView === 'all' || activeView === 'products') && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#1A6DB5] uppercase tracking-wider">Product Wise Breakdown</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                  {productPerformance.length} Active Plans
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#1A2332] mt-0.5">
                Product-Wise Views & Purchase Counts
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Comparative analysis of each house plan's total page views, confirmed digital CAD package downloads, and revenue generated.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-xl">House Plan Product</th>
                  <th className="py-3 px-4">Code / Specs</th>
                  <th className="py-3 px-4 text-center">Package Price</th>
                  <th className="py-3 px-4 text-center">Catalog Views</th>
                  <th className="py-3 px-4 text-center">Purchase Count</th>
                  <th className="py-3 px-4 text-center">Conversion</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productPerformance.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Plan Product Image & Title */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                          {item.elevationImage ? (
                            <img
                              src={item.elevationImage}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Compass className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-slate-900 hover:text-[#1A6DB5] transition-colors block truncate" title={item.title}>
                            {item.title}
                          </span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            Rank #{idx + 1} Best Seller
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Code & Specs */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {item.planCode}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {item.builtUpArea} sq.ft • {item.floorsLabel}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="font-bold text-slate-800">
                        ₹{item.price ? item.price.toLocaleString('en-IN') : '999'}
                      </span>
                    </td>

                    {/* Product Wise Views */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 font-bold text-slate-800 bg-slate-100/80 px-2.5 py-1 rounded-lg">
                        <Eye className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{item.views}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 font-medium">
                        {item.viewsShare}% of traffic
                      </div>
                    </td>

                    {/* Product Wise Purchase Count */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-lg">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.purchaseCount} Sales</span>
                      </div>
                    </td>

                    {/* Conversion Rate */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200/60">
                        {item.conversionRate}%
                      </span>
                    </td>

                    {/* Total Revenue */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="font-extrabold text-sm text-slate-900">
                        ₹{item.revenue.toLocaleString('en-IN')}
                      </span>
                      <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                        Completed
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: PURCHASER CONTACT DETAILS & ORDER MANAGEMENT */}
      {(activeView === 'all' || activeView === 'purchasers') && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Customer Relationship Management</span>
              <h3 className="text-xl font-bold text-[#1A2332] mt-0.5">
                Purchaser Contact Details & Transaction Log
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Verified homeowner contact information, Razorpay transaction IDs, and direct communication links for construction follow-ups.
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, phone, email, plan..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5] bg-slate-50/50"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Payment Method Filter */}
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value as any)}
                className="py-2 px-3 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5] bg-white font-medium text-slate-700"
              >
                <option value="all">All Methods</option>
                <option value="Razorpay">Razorpay Gateway</option>
                <option value="PhonePe">PhonePe (Legacy)</option>
                <option value="Manual">Manual / Walk-in</option>
                <option value="Free Claim">Free Blueprint Claim</option>
              </select>

              {/* Plan Filter */}
              <select
                value={selectedPlanFilter}
                onChange={(e) => setSelectedPlanFilter(e.target.value)}
                className="py-2 px-3 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#1A6DB5] bg-white font-medium text-slate-700 max-w-[160px]"
              >
                <option value="all">All House Plans</option>
                {plans.map(p => (
                  <option key={p.id} value={p.planCode}>
                    {p.planCode}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Orders Table */}
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#1A6DB5] mb-2" />
              <p className="text-sm font-semibold">Loading orders and purchaser records...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No matching orders found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery || filterMethod !== 'all' || selectedPlanFilter !== 'all'
                  ? 'Try clearing your search query or filters to view all orders.'
                  : 'No customer orders have been recorded yet. Click "Record Direct Sale" to add one.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4 rounded-l-xl">Purchaser Details</th>
                    <th className="py-3 px-4">Contact & Quick Connect</th>
                    <th className="py-3 px-4">Purchased Plan</th>
                    <th className="py-3 px-4 text-center">Amount & Gateway</th>
                    <th className="py-3 px-4 text-center">Date & Status</th>
                    <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => {
                    const cleanPhone = (order.customerPhone || '').replace(/[^0-9]/g, '');
                    const waNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        
                        {/* Purchaser Name & Transaction ID */}
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#1A6DB5]/10 text-[#1A6DB5] font-extrabold flex items-center justify-center text-xs flex-shrink-0">
                              {order.customerName ? order.customerName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block text-sm">
                                {order.customerName || 'Homeowner'}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[10px] text-slate-400">
                                  {order.transactionId || order.id}
                                </span>
                                <button
                                  onClick={() => handleCopyText(order.transactionId || order.id, order.id)}
                                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                                  title="Copy transaction ID"
                                >
                                  {copiedId === order.id ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Details (Phone, Email, WhatsApp) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {order.customerPhone && (
                              <div className="flex items-center gap-2">
                                <a
                                  href={`tel:${order.customerPhone}`}
                                  className="font-medium text-slate-800 hover:text-[#1A6DB5] flex items-center gap-1 text-xs"
                                  title="Call Customer"
                                >
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{order.customerPhone}</span>
                                </a>

                                {/* WhatsApp shortcut button */}
                                {cleanPhone && (
                                  <a
                                    href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello ${order.customerName || 'Sir/Madam'}, Greetings from Lifehut Developers Chennai! Thank you for purchasing house plan ${order.planCode}. How can we assist with your construction drawings?`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                    title="Chat on WhatsApp"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            )}

                            {order.customerEmail && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <a
                                  href={`mailto:${order.customerEmail}?subject=${encodeURIComponent(`Your Lifehut House Plan Blueprints: ${order.planCode}`)}`}
                                  className="text-slate-500 hover:text-[#1A6DB5] truncate max-w-[180px] text-[11px] block"
                                  title={order.customerEmail}
                                >
                                  {order.customerEmail}
                                </a>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Plan Title & Code */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-xs bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md inline-block">
                            {order.planCode || 'LH-HP-PLAN'}
                          </span>
                          <div className="text-[11px] text-slate-600 font-medium mt-1 line-clamp-1 max-w-xs" title={order.planTitle}>
                            {order.planTitle || 'Custom Architectural Blueprint'}
                          </div>
                        </td>

                        {/* Amount & Method */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="font-extrabold text-sm text-slate-900">
                            {Number(order.amount) === 0 ? (
                              <span className="text-emerald-600 font-bold">FREE PROMO</span>
                            ) : (
                              `₹${Number(order.amount).toLocaleString('en-IN')}`
                            )}
                          </div>
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                            order.paymentMethod === 'Razorpay'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : order.paymentMethod === 'PhonePe'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : order.paymentMethod === 'Manual'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {order.paymentMethod || 'Razorpay'}
                          </span>
                        </td>

                        {/* Date & Delivery Status */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="text-[11px] text-slate-500 font-mono">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                          <button
                            onClick={() => handleToggleDeliveryStatus(order)}
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 cursor-pointer transition-colors ${
                              order.deliveryStatus === 'Delivered'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                            title="Click to toggle delivery status"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{order.deliveryStatus || 'Delivered'}</span>
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedOrderForModal(order)}
                              className="p-1.5 text-slate-500 hover:text-[#1A6DB5] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="View Full Order & Purchaser Details"
                            >
                              <FileText className="w-4 h-4" />
                            </button>

                            {order.downloadUrl && (
                              <a
                                href={order.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="Download CAD Package ZIP"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            )}

                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Order Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ORDER DETAILS / RECEIPT VIEW */}
      {selectedOrderForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-left relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrderForModal(null)}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Order Receipt</span>
                <h3 className="text-xl font-extrabold text-[#1A2332]">
                  {selectedOrderForModal.planCode}
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs mt-6 border-t border-slate-100 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 font-medium block">Order ID</span>
                  <span className="font-mono font-bold text-slate-800">{selectedOrderForModal.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Transaction ID</span>
                  <span className="font-mono font-bold text-slate-800">{selectedOrderForModal.transactionId}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <div className="font-bold text-slate-800 text-sm">Purchaser Contact Information</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[10px]">FULL NAME</span>
                    <span className="font-bold text-slate-900">{selectedOrderForModal.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">PHONE NUMBER</span>
                    <span className="font-bold text-slate-900">{selectedOrderForModal.customerPhone || 'N/A'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block text-[10px]">EMAIL ADDRESS</span>
                    <span className="font-bold text-slate-900">{selectedOrderForModal.customerEmail || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-medium block">Purchased Plan Title</span>
                <span className="font-semibold text-slate-800 text-sm">{selectedOrderForModal.planTitle}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-100 py-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">AMOUNT</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    ₹{Number(selectedOrderForModal.amount).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">PAYMENT METHOD</span>
                  <span className="font-bold text-slate-800">{selectedOrderForModal.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">STATUS</span>
                  <span className="font-bold text-emerald-600">{selectedOrderForModal.paymentStatus}</span>
                </div>
              </div>

              {selectedOrderForModal.notes && (
                <div>
                  <span className="text-slate-400 font-medium block">Admin / Client Notes</span>
                  <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">
                    {selectedOrderForModal.notes}
                  </p>
                </div>
              )}

              {selectedOrderForModal.downloadUrl && (
                <div className="pt-2">
                  <a
                    href={selectedOrderForModal.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#1A6DB5] hover:bg-[#1558a0] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Blueprint Package ZIP</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MANUAL ORDER RECORDING */}
      {isManualOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-left relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsManualOrderModalOpen(false)}
              className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#1A6DB5]/10 text-[#1A6DB5] flex items-center justify-center font-bold">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#1A6DB5] uppercase tracking-widest">Office Sale Entry</span>
                <h3 className="text-xl font-extrabold text-[#1A2332]">
                  Record Direct Blueprint Sale
                </h3>
              </div>
            </div>

            <form onSubmit={handleCreateManualOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select House Plan *
                </label>
                <select
                  value={manualForm.planId}
                  onChange={(e) => {
                    const sel = plans.find(p => p.id === e.target.value);
                    setManualForm({
                      ...manualForm,
                      planId: e.target.value,
                      amount: sel?.cadPackagePrice || 999
                    });
                  }}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#1A6DB5] bg-white"
                  required
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.planCode} — {p.title} (₹{p.cadPackagePrice})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Customer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senthil Nathan"
                    value={manualForm.customerName}
                    onChange={(e) => setManualForm({ ...manualForm, customerName: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#1A6DB5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98401 23456"
                    value={manualForm.customerPhone}
                    onChange={(e) => setManualForm({ ...manualForm, customerPhone: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#1A6DB5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="client@gmail.com"
                    value={manualForm.customerEmail}
                    onChange={(e) => setManualForm({ ...manualForm, customerEmail: e.target.value })}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#1A6DB5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Amount Paid (INR ₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={manualForm.amount}
                    onChange={(e) => setManualForm({ ...manualForm, amount: Number(e.target.value) })}
                    className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#1A6DB5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Payment Method
                </label>
                <select
                  value={manualForm.paymentMethod}
                  onChange={(e) => setManualForm({ ...manualForm, paymentMethod: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-[#1A6DB5] bg-white"
                >
                  <option value="Manual">Manual / Office Visit</option>
                  <option value="Razorpay">Razorpay Gateway (Online)</option>
                  <option value="PhonePe">Direct PhonePe / UPI (Legacy)</option>
                  <option value="Free Claim">Free Promotional Blueprint</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Notes / Plot Location / Turnkey Interest
                </label>
                <textarea
                  rows={2}
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  placeholder="e.g. 30x40 site in Medavakkam. Looking for structural consultation."
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#1A6DB5]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsManualOrderModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1A6DB5] hover:bg-[#1558a0] text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-[#1A6DB5]/20 flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Order Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
