import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Boxes,
  Tag,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Plus,
  Trash2,
  X,
  Package,
  Edit,
  MessageSquare,
  Star,
  Search,
  Download,
  Eye,
  Printer,
  MapPin,
  Phone,
  Truck,
  Clock,
  Bell,
  Send,
  Radio,
  Activity,
  Check,
} from 'lucide-react';
import { OrderRecord } from '../store/api/ordersApi';
import {
  useGetAdminStatsQuery,
  useGetAdminOrdersQuery,
  useGetAdminUsersQuery,
  useGetAdminInventoryQuery,
  useUpdateOrderStatusByAdminMutation,
  useCreateProductAdminMutation,
  useUpdateProductAdminMutation,
  useDeleteProductAdminMutation,
  useGetAdminReviewsQuery,
  useDeleteReviewAdminMutation,
  useModerateReviewAdminMutation,
} from '../store/api/adminApi';
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
  ProductItem,
} from '../store/api/productsApi';
import {
  useGetAdminCouponsQuery,
  useCreateCouponMutation,
  useToggleCouponActiveMutation,
  useDeleteCouponMutation,
} from '../store/api/couponApi';
import {
  useGetNotificationGatewayStatusQuery,
  useSendTestNotificationMutation,
} from '../store/api/authApi';
import { useAppSelector } from '../store/hooks';
import { formatETB } from '../components/common/ProductPrice';
import { OrderStatus, CouponDTO } from '@shopnest/shared';

type AdminTab = 'dashboard' | 'products' | 'orders' | 'customers' | 'inventory' | 'promotions' | 'reviews' | 'settings';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const { data: statsData } = useGetAdminStatsQuery(undefined, {
    skip: !isAuthenticated || user?.role !== 'admin',
  });
  const { data: ordersData } = useGetAdminOrdersQuery(undefined, {
    skip: !isAuthenticated || user?.role !== 'admin',
  });
  const { data: usersData } = useGetAdminUsersQuery(undefined, {
    skip: !isAuthenticated || user?.role !== 'admin',
  });
  const { data: inventoryData } = useGetAdminInventoryQuery(undefined, {
    skip: !isAuthenticated || user?.role !== 'admin',
  });

  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusByAdminMutation();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Orders Management Search, Filter & Modal State
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>('all');
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<OrderRecord | null>(null);
  const [modalNotesInput, setModalNotesInput] = useState('');

  // Real Coupon Management Hooks & State
  const { data: couponsData } = useGetAdminCouponsQuery(undefined, {
    skip: !isAuthenticated || user?.role !== 'admin',
  });
  const [createCoupon, { isLoading: isCreatingCoupon }] = useCreateCouponMutation();
  const [toggleCoupon] = useToggleCouponActiveMutation();
  const [deleteCoupon] = useDeleteCouponMutation();

  const [showCreateCouponModal, setShowCreateCouponModal] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [discountTypeInput, setDiscountTypeInput] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [discountValueInput, setDiscountValueInput] = useState<number>(10);
  const [minOrderInput, setMinOrderInput] = useState<number>(0);
  const [maxDiscountInput, setMaxDiscountInput] = useState<number | undefined>(undefined);
  const [expiryDaysInput, setExpiryDaysInput] = useState<number>(30);
  const [usageLimitInput, setUsageLimitInput] = useState<number>(100);
  const [perCustomerLimitInput, setPerCustomerLimitInput] = useState<number>(1);
  const [selectedEligibleCategory, setSelectedEligibleCategory] = useState<string>('all');
  const [couponFormError, setCouponFormError] = useState('');

  // Product Management Hooks & State
  const { data: productsData } = useGetProductsQuery({ limit: 50 }, {
    skip: !isAuthenticated || user?.role !== 'admin',
  });
  const { data: categoriesData } = useGetCategoriesQuery(undefined, {
    skip: !isAuthenticated || user?.role !== 'admin',
  });
  const [createProductAdmin, { isLoading: isCreatingProduct }] = useCreateProductAdminMutation();
  const [updateProductAdmin, { isLoading: isUpdatingProduct }] = useUpdateProductAdminMutation();
  const [deleteProductAdmin] = useDeleteProductAdminMutation();

  const [productSearch, setProductSearch] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productFormError, setProductFormError] = useState('');
  const [productForm, setProductForm] = useState({
    title: '',
    titleAmharic: '',
    description: '',
    price: 0,
    discountPrice: 0,
    category: '',
    stock: 0,
    sku: '',
    imageUrl: '',
  });

  // Reviews Management Hooks & State
  const { data: reviewsData } = useGetAdminReviewsQuery(undefined, {
    skip: !isAuthenticated || user?.role !== 'admin',
  });
  const [deleteReviewAdmin] = useDeleteReviewAdminMutation();
  const [moderateReviewAdmin] = useModerateReviewAdminMutation();
  const [reviewStatusFilter, setReviewStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [adminReviewImageModal, setAdminReviewImageModal] = useState<string | null>(null);

  const handleModerateReview = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      await moderateReviewAdmin({ reviewId, status }).unwrap();
      setStatusMessage(`Review status successfully changed to "${status}".`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage(err?.data?.message || 'Failed to moderate review');
    }
  };

  // Notification Gateway Monitoring (Telegram Bot & SMS)
  const { data: gatewayStatusData, refetch: refetchGatewayStatus } = useGetNotificationGatewayStatusQuery(undefined, {
    skip: !isAuthenticated || user?.role !== 'admin',
  });
  const [sendTestNotificationAdmin, { isLoading: isAdminTestingNotif }] = useSendTestNotificationMutation();
  const [adminNotifFeedback, setAdminNotifFeedback] = useState<string | null>(null);

  const handleAdminTestAlert = async () => {
    setAdminNotifFeedback(null);
    try {
      const res = await sendTestNotificationAdmin({ channel: 'both' }).unwrap();
      setAdminNotifFeedback(`Test alert dispatched! Telegram: ${res.data?.telegramSuccess ? 'OK' : 'Not configured'}, SMS: ${res.data?.smsSuccess ? 'OK' : 'Failed'}`);
      refetchGatewayStatus();
      setTimeout(() => setAdminNotifFeedback(null), 5000);
    } catch (err: any) {
      setAdminNotifFeedback(err.data?.message || 'Failed to trigger test notification');
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[#1F2937]">Restricted Admin Area</h2>
        <p className="text-xs text-[#6B7280]">
          You need an authorized administrator account to access the ShopNest Ethiopia management portal.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 rounded-xl bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA580C]"
        >
          Sign In as Admin
        </Link>
      </div>
    );
  }

  const stats = statsData?.data;
  const rawOrders = ordersData?.data;
  const orders: OrderRecord[] = Array.isArray(rawOrders)
    ? (rawOrders as OrderRecord[])
    : (rawOrders as any)?.orders || [];

  const filteredOrders = orders.filter((ord) => {
    if (orderStatusFilter !== 'all' && ord.orderStatus !== orderStatusFilter) {
      return false;
    }
    if (orderPaymentFilter !== 'all' && ord.paymentMethod !== orderPaymentFilter) {
      return false;
    }
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchNum = (ord.orderNumber || '').toLowerCase().includes(q);
      const matchName = (ord.customerName || ord.shippingAddress?.fullName || '').toLowerCase().includes(q);
      const matchPhone = (ord.shippingAddress?.phone || ord.customerPhone || '').toLowerCase().includes(q);
      const matchCity = (ord.shippingAddress?.city || '').toLowerCase().includes(q);
      const matchSubCity = (ord.shippingAddress?.subCity || '').toLowerCase().includes(q);
      return matchNum || matchName || matchPhone || matchCity || matchSubCity;
    }
    return true;
  });

  const orderCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.orderStatus === 'pending').length,
    processing: orders.filter((o) => o.orderStatus === 'processing').length,
    shipped: orders.filter((o) => o.orderStatus === 'shipped').length,
    delivered: orders.filter((o) => o.orderStatus === 'delivered').length,
    cancelled: orders.filter((o) => o.orderStatus === 'cancelled').length,
  };

  const customers = usersData?.data?.users || [];
  const inventoryLogs = inventoryData?.data || [];
  const products = productsData?.data?.products || [];
  const categories = categoriesData?.data || [];
  const reviews = reviewsData?.data || [];

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus, customNotes?: string) => {
    try {
      await updateStatus({ orderId, status: newStatus, notes: customNotes }).unwrap();
      setStatusMessage(`Order updated to ${newStatus.toUpperCase()}`);
      if (selectedOrderForModal) {
        const curId = selectedOrderForModal.id || (selectedOrderForModal as any)._id || selectedOrderForModal.orderNumber;
        if (curId === orderId) {
          setSelectedOrderForModal((prev) =>
            prev
              ? {
                  ...prev,
                  orderStatus: newStatus,
                  status: newStatus,
                  paymentStatus: newStatus === 'delivered' ? 'completed' : prev.paymentStatus,
                  trackingHistory: [
                    ...(prev.trackingHistory || []),
                    {
                      status: newStatus,
                      notes: customNotes || `Status updated to ${newStatus}`,
                      timestamp: new Date().toISOString(),
                    },
                  ],
                }
              : null
          );
        }
      }
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage(`Failed to update status: ${err.data?.message || err.message}`);
    }
  };

  const exportOrdersToCSV = () => {
    const listToExport = filteredOrders.length > 0 ? filteredOrders : orders;
    if (!listToExport || listToExport.length === 0) return;
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Phone',
      'City',
      'SubCity',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Total Amount (ETB)',
    ];
    const rows = listToExport.map((ord) => [
      ord.orderNumber,
      new Date((ord as any).createdAt || Date.now()).toISOString().split('T')[0],
      `"${ord.customerName || ord.shippingAddress?.fullName || 'Customer'}"`,
      `"${ord.shippingAddress?.phone || ''}"`,
      `"${ord.shippingAddress?.city || ''}"`,
      `"${ord.shippingAddress?.subCity || ''}"`,
      ord.paymentMethod,
      ord.paymentStatus,
      ord.orderStatus,
      ord.totalAmount || ord.total || 0,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shopnest_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openCreateProductModal = () => {
    setEditingProductId(null);
    setProductForm({
      title: '',
      titleAmharic: '',
      description: '',
      price: 0,
      discountPrice: 0,
      category: categories[0]?.id || categories[0]?._id || '',
      stock: 10,
      sku: `ETH-${Math.floor(1000 + Math.random() * 9000)}`,
      imageUrl: '',
    });
    setProductFormError('');
    setShowProductModal(true);
  };

  const openEditProductModal = (prod: ProductItem) => {
    setEditingProductId(prod.id || prod._id || '');
    const catId = typeof prod.category === 'object' ? (prod.category.id || prod.category._id || '') : prod.category;
    setProductForm({
      title: prod.title || '',
      titleAmharic: prod.titleAmharic || '',
      description: prod.description || '',
      price: prod.price || 0,
      discountPrice: prod.discountPrice || 0,
      category: catId || '',
      stock: prod.stock || 0,
      sku: prod.sku || '',
      imageUrl: prod.images?.[0] || '',
    });
    setProductFormError('');
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductFormError('');

    if (!productForm.title.trim()) {
      setProductFormError('Product title is required');
      return;
    }
    if (productForm.price <= 0) {
      setProductFormError('Price must be greater than 0');
      return;
    }
    if (!productForm.sku.trim()) {
      setProductFormError('SKU code is required');
      return;
    }

    try {
      const payload: any = {
        title: productForm.title.trim(),
        titleAmharic: productForm.titleAmharic.trim() || undefined,
        description: productForm.description.trim() || 'Quality product available in Ethiopia.',
        price: Number(productForm.price),
        discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : undefined,
        stock: Number(productForm.stock),
        sku: productForm.sku.trim().toUpperCase(),
        category: productForm.category || categories[0]?.id || categories[0]?._id,
        images: productForm.imageUrl.trim() ? [productForm.imageUrl.trim()] : ['/images/placeholder.webp'],
        isPublished: true,
      };

      if (editingProductId) {
        await updateProductAdmin({ id: editingProductId, data: payload }).unwrap();
        setStatusMessage(`Product "${productForm.title}" updated successfully!`);
      } else {
        await createProductAdmin(payload).unwrap();
        setStatusMessage(`Product "${productForm.title}" added to catalog!`);
      }

      setShowProductModal(false);
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      setProductFormError(err.data?.message || err.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (prod: ProductItem) => {
    const id = prod.id || prod._id || '';
    if (!window.confirm(`Are you sure you want to delete product "${prod.title}"?`)) return;

    try {
      await deleteProductAdmin(id).unwrap();
      setStatusMessage(`Product "${prod.title}" deleted.`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage(`Failed to delete product: ${err.data?.message || err.message}`);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReviewAdmin(reviewId).unwrap();
      setStatusMessage('Review deleted successfully');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage('Failed to delete review');
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.titleAmharic && p.titleAmharic.toLowerCase().includes(q)) ||
      p.sku.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-[#1F2937] flex flex-col md:flex-row">
      {/* Admin Sidebar matching Image 1 Screen 8 */}
      <aside className="w-full md:w-64 bg-[#1F2937] text-white p-5 flex flex-col justify-between shrink-0 shadow-lg">
        <div className="space-y-6">
          {/* Brand header */}
          <div className="flex items-center gap-3 px-2 py-1 border-b border-gray-700 pb-4">
            <div className="w-8 h-8 rounded-lg bg-[#F97316] flex items-center justify-center font-black text-white text-base">
              S
            </div>
            <div>
              <span className="font-extrabold text-sm block tracking-wide">ShopNest Admin</span>
              <span className="text-[10px] text-gray-400">Addis Ababa Operations</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'dashboard' ? 'bg-[#F97316] text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'products' ? 'bg-[#F97316] text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products Catalog</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'orders' ? 'bg-[#F97316] text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders Management</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'inventory' ? 'bg-[#F97316] text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Inventory & Stock</span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'customers' ? 'bg-[#F97316] text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Customers</span>
            </button>

            <button
              onClick={() => setActiveTab('promotions')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'promotions' ? 'bg-[#F97316] text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Promotions & Coupons</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'reviews' ? 'bg-[#F97316] text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Customer Reviews</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeTab === 'settings' ? 'bg-[#F97316] text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Store Settings</span>
            </button>
          </nav>
        </div>

        {/* Admin User info footer */}
        <div className="pt-4 border-t border-gray-700 text-xs text-gray-400 space-y-1">
          <p className="font-bold text-white truncate">{user.name}</p>
          <p className="text-[11px] truncate">{user.email}</p>
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F97316]/20 text-[#F97316]">
            Super Admin
          </span>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-x-hidden">
        {/* Top notification toast */}
        {statusMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold text-[#1F2937]">Executive Store Overview</h1>
                <p className="text-xs text-[#6B7280]">
                  Real-time sales, order fulfillment, and inventory analytics for Ethiopian market
                </p>
              </div>
              <div className="text-xs font-semibold text-[#6B7280] bg-white px-3 py-1.5 rounded-xl border border-[#E5E7EB]">
                Timezone: Africa/Addis_Ababa
              </div>
            </div>

            {/* 4 Metric Cards matching Image 1 Screen 8 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block">Total Revenue</span>
                <div className="text-2xl font-black text-[#1F2937]">
                  ETB {formatETB(stats?.totalRevenueETB || 45997)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+18.4% this month</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block">Total Orders</span>
                <div className="text-2xl font-black text-[#1F2937]">
                  {stats?.totalOrders || 48}
                </div>
                <span className="text-xs text-[#6B7280]">Across all 11 Ethiopian regions</span>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block">Active Customers</span>
                <div className="text-2xl font-black text-[#1F2937]">
                  {stats?.totalCustomers || 1248}
                </div>
                <span className="text-xs text-emerald-600 font-semibold">+92 newly verified</span>
              </div>

              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider block">Catalog Products</span>
                <div className="text-2xl font-black text-[#1F2937]">
                  {stats?.totalProducts || 32}
                </div>
                <span className="text-xs text-[#6B7280]">In 8 curated categories</span>
              </div>
            </div>

            {/* Sales Chart Visualization */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
                <h3 className="font-bold text-sm text-[#1F2937]">Sales Overview & Revenue Trend (ETB)</h3>
                <span className="text-xs text-[#6B7280]">Year 2026 Fulfillment</span>
              </div>

              <div className="h-44 flex items-end justify-between gap-3 pt-6 px-4">
                {[
                  { month: 'Jan', val: 65 },
                  { month: 'Feb', val: 78 },
                  { month: 'Mar', val: 92 },
                  { month: 'Apr', val: 84 },
                  { month: 'May', val: 110 },
                  { month: 'Jun', val: 135 },
                  { month: 'Jul', val: 120 },
                  { month: 'Aug', val: 145 },
                  { month: 'Sep', val: 160 },
                  { month: 'Oct', val: 195 },
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] text-[#6B7280] opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.val * 350} Br
                    </div>
                    <div
                      className="w-full bg-[#FFF7ED] group-hover:bg-[#F97316] rounded-t-lg transition-all"
                      style={{ height: `${(item.val / 200) * 100}%` }}
                    />
                    <span className="text-[10px] font-semibold text-[#6B7280]">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders Snippet */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F3F4F6] pb-3">
                <h3 className="font-bold text-sm text-[#1F2937]">Recent Ethiopian Orders</h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-[#F97316] hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#F3F4F6] text-[#6B7280]">
                      <th className="py-2.5 font-semibold">Order Number</th>
                      <th className="py-2.5 font-semibold">Customer</th>
                      <th className="py-2.5 font-semibold">Payment Method</th>
                      <th className="py-2.5 font-semibold">Order Status</th>
                      <th className="py-2.5 font-semibold">Payment Status</th>
                      <th className="py-2.5 font-semibold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.orderNumber} className="hover:bg-[#F9FAFB]">
                        <td className="py-3 font-bold text-[#1F2937]">{ord.orderNumber}</td>
                        <td className="py-3 text-[#4B5563]">
                          {ord.customerName || ord.shippingAddress?.fullName}
                        </td>
                        <td className="py-3 uppercase text-[#6B7280]">{ord.paymentMethod?.replace(/_/g, ' ')}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              ord.orderStatus === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.orderStatus === 'shipped'
                                ? 'bg-purple-100 text-purple-800'
                                : ord.orderStatus === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.orderStatus}
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              ord.paymentStatus === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.paymentStatus === 'failed'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 font-black text-[#F97316] text-right">
                          ETB {formatETB(ord.totalAmount || ord.total || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3F4F6] pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#1F2937]">Products Catalog</h2>
                <p className="text-xs text-[#6B7280]">
                  Manage items, update live prices, configure discounts, and track warehouse inventory.
                </p>
              </div>
              <button
                type="button"
                onClick={openCreateProductModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Search Filter */}
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by title or SKU..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-medium focus:outline-none focus:border-[#F97316]"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                    <th className="py-3 font-bold">Product</th>
                    <th className="py-3 font-bold">SKU</th>
                    <th className="py-3 font-bold">Category</th>
                    <th className="py-3 font-bold">Price (ETB)</th>
                    <th className="py-3 font-bold">Stock</th>
                    <th className="py-3 font-bold">Status</th>
                    <th className="py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#9CA3AF]">
                        No products found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((prod) => {
                      const catName = typeof prod.category === 'object' ? prod.category.name : 'General';
                      return (
                        <tr key={prod.id || prod._id} className="hover:bg-[#F9FAFB]">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={prod.images?.[0] || '/images/placeholder.webp'}
                                alt={prod.title}
                                className="w-10 h-10 rounded-lg object-cover border border-[#E5E7EB] bg-gray-50 shrink-0"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100';
                                }}
                              />
                              <div>
                                <span className="font-bold text-[#1F2937] block line-clamp-1">{prod.title}</span>
                                {prod.titleAmharic && (
                                  <span className="text-[11px] text-[#6B7280] block">{prod.titleAmharic}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 font-mono font-semibold text-[#4B5563]">{prod.sku}</td>
                          <td className="py-3 text-[#4B5563]">{catName}</td>
                          <td className="py-3">
                            <span className="font-bold text-[#F97316] block">
                              ETB {formatETB(prod.discountPrice && prod.discountPrice > 0 ? prod.discountPrice : prod.price)}
                            </span>
                            {prod.discountPrice && prod.discountPrice > 0 && (
                              <span className="text-[10px] text-[#9CA3AF] line-through block">
                                ETB {formatETB(prod.price)}
                              </span>
                            )}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                prod.stock > 10
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : prod.stock > 0
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                prod.isPublished !== false
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {prod.isPublished !== false ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="py-3 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => openEditProductModal(prod)}
                              className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-gray-50 text-[#4B5563] hover:text-[#1F2937] inline-flex items-center cursor-pointer"
                              title="Edit product"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(prod)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 inline-flex items-center cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Add / Edit Product Modal */}
            {showProductModal && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-base font-bold text-[#1F2937]">
                      {editingProductId ? 'Edit Product Details' : 'Add New Product to Catalog'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowProductModal(false)}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {productFormError && (
                    <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                      {productFormError}
                    </p>
                  )}

                  <form onSubmit={handleProductSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="font-semibold text-[#1F2937] block mb-1">Product Title (English) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Traditional Ethiopian Coffee Pot (Jebena)"
                        value={productForm.title}
                        onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-[#1F2937] block mb-1">Product Title (Amharic)</label>
                      <input
                        type="text"
                        placeholder="e.g. የሸክላ ጀበና"
                        value={productForm.titleAmharic}
                        onChange={(e) => setProductForm({ ...productForm, titleAmharic: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-[#1F2937] block mb-1">SKU Code *</label>
                        <input
                          type="text"
                          required
                          placeholder="ETH-2026-X"
                          value={productForm.sku}
                          onChange={(e) => setProductForm({ ...productForm, sku: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] uppercase text-xs font-bold"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-[#1F2937] block mb-1">Category</label>
                        <select
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs"
                        >
                          {categories.map((c) => (
                            <option key={c.id || c._id} value={c.id || c._id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="font-semibold text-[#1F2937] block mb-1">Price (ETB) *</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={productForm.price || ''}
                          onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-[#1F2937] block mb-1">Discount Price (ETB)</label>
                        <input
                          type="number"
                          min={0}
                          placeholder="Optional"
                          value={productForm.discountPrice || ''}
                          onChange={(e) =>
                            setProductForm({ ...productForm, discountPrice: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-[#1F2937] block mb-1">Warehouse Stock *</label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-[#1F2937] block mb-1">Image URL</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={productForm.imageUrl}
                        onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-[#1F2937] block mb-1">Product Description</label>
                      <textarea
                        rows={3}
                        placeholder="Describe key features, specs, origin, and warranty..."
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowProductModal(false)}
                        className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isCreatingProduct || isUpdatingProduct}
                        className="px-5 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {isCreatingProduct || isUpdatingProduct
                          ? 'Saving...'
                          : editingProductId
                          ? 'Update Product'
                          : 'Save Product'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-6">
            {/* Header with Title and Global Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3F4F6] pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#1F2937] flex items-center gap-2">
                  <span>Orders Management</span>
                  <span className="text-xs font-bold text-[#F97316] bg-[#FFF7ED] px-2.5 py-0.5 rounded-full border border-orange-200">
                    {orders.length} Total
                  </span>
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Inspect deliveries, customer contact details, verify payments, and update shipment progress
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={exportOrdersToCSV}
                  disabled={orders.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E7EB] hover:border-[#F97316] text-[#1F2937] hover:text-[#F97316] text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-2xs bg-white"
                  title="Export orders to CSV file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Search Bar & Payment Method Filter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by Order #, Customer Name, Phone (09...), or Sub-City..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-[#E5E7EB] text-xs text-[#1F2937] focus:outline-none focus:border-[#F97316] transition-colors bg-[#F9FAFB]/50"
                />
                {orderSearch && (
                  <button
                    type="button"
                    onClick={() => setOrderSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div>
                <select
                  value={orderPaymentFilter}
                  onChange={(e) => setOrderPaymentFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold text-[#1F2937] bg-white cursor-pointer focus:outline-none focus:border-[#F97316]"
                >
                  <option value="all">All Payment Methods</option>
                  <option value="telebirr">Telebirr (ቴሌብር)</option>
                  <option value="cbe_birr">CBE Birr (ሲቢኢ ብር)</option>
                  <option value="chapa">Chapa Payment Gateway</option>
                  <option value="cash_on_delivery">Cash on Delivery (በእጅ በእጅ ክፍያ)</option>
                </select>
              </div>
            </div>

            {/* Status Filter Tabs (Pills) */}
            <div className="flex flex-wrap items-center gap-1.5 border-b border-[#F3F4F6] pb-3">
              {[
                { id: 'all', label: 'All Orders', count: orderCounts.all, color: 'bg-gray-100 text-gray-800' },
                { id: 'pending', label: 'Pending', count: orderCounts.pending, color: 'bg-amber-100 text-amber-800' },
                { id: 'processing', label: 'Processing', count: orderCounts.processing, color: 'bg-blue-100 text-blue-800' },
                { id: 'shipped', label: 'Shipped', count: orderCounts.shipped, countColor: 'bg-purple-100 text-purple-800' },
                { id: 'delivered', label: 'Delivered', count: orderCounts.delivered, color: 'bg-emerald-100 text-emerald-800' },
                { id: 'cancelled', label: 'Cancelled', count: orderCounts.cancelled, color: 'bg-rose-100 text-rose-800' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setOrderStatusFilter(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    orderStatusFilter === tab.id
                      ? 'bg-[#F97316] text-white shadow-xs'
                      : 'bg-[#F9FAFB] hover:bg-gray-100 text-[#4B5563]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      orderStatusFilter === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Orders Table or Empty State */}
            {filteredOrders.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-[#1F2937]">No orders found</h4>
                <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
                  {orderSearch || orderStatusFilter !== 'all' || orderPaymentFilter !== 'all'
                    ? 'No orders match your current search and filter criteria. Try resetting your filters.'
                    : 'No orders recorded in the system yet.'}
                </p>
                {(orderSearch || orderStatusFilter !== 'all' || orderPaymentFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrderSearch('');
                      setOrderStatusFilter('all');
                      setOrderPaymentFilter('all');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#1F2937] transition-colors cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                      <th className="py-3 font-bold">Order # & Date</th>
                      <th className="py-3 font-bold">Customer & Contact</th>
                      <th className="py-3 font-bold">Delivery Location</th>
                      <th className="py-3 font-bold">Payment Method</th>
                      <th className="py-3 font-bold">Status</th>
                      <th className="py-3 font-bold">Total</th>
                      <th className="py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.orderNumber} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="py-3.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForModal(ord)}
                            className="font-bold text-[#F97316] hover:underline flex items-center gap-1 cursor-pointer"
                            title="Click to inspect order"
                          >
                            <span>{ord.orderNumber}</span>
                            <Eye className="w-3 h-3 text-[#F97316]" />
                          </button>
                          <span className="text-[10px] text-[#9CA3AF] block mt-0.5">
                            {new Date(ord.createdAt || Date.now()).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </td>

                        <td className="py-3.5">
                          <span className="font-semibold text-[#1F2937] block">
                            {ord.customerName || ord.shippingAddress?.fullName || 'Customer'}
                          </span>
                          <a
                            href={`tel:${ord.shippingAddress?.phone || ord.customerPhone || ''}`}
                            className="text-[11px] text-[#4B5563] hover:text-[#F97316] hover:underline inline-flex items-center gap-1 mt-0.5"
                          >
                            <Phone className="w-2.5 h-2.5 text-[#F97316]" />
                            <span>{ord.shippingAddress?.phone || ord.customerPhone || 'N/A'}</span>
                          </a>
                        </td>

                        <td className="py-3.5 text-[#4B5563]">
                          <span className="font-medium text-[#1F2937] block">
                            {ord.shippingAddress?.city || 'Addis Ababa'}
                          </span>
                          <span className="text-[11px] text-[#6B7280] block">
                            {ord.shippingAddress?.subCity
                              ? `${ord.shippingAddress.subCity} Sub-City`
                              : 'Addis Ababa'}
                            {ord.shippingAddress?.woreda ? `, Woreda ${ord.shippingAddress.woreda}` : ''}
                          </span>
                        </td>

                        <td className="py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="uppercase text-[11px] font-bold text-[#1F2937]">
                              {ord.paymentMethod?.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <span
                            className={`inline-block text-[10px] font-bold uppercase mt-0.5 ${
                              ord.paymentStatus === 'completed'
                                ? 'text-emerald-600'
                                : ord.paymentStatus === 'failed'
                                ? 'text-rose-600'
                                : 'text-amber-600'
                            }`}
                          >
                            ● {ord.paymentStatus}
                          </span>
                        </td>

                        <td className="py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                              ord.orderStatus === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.orderStatus === 'shipped'
                                ? 'bg-purple-100 text-purple-800'
                                : ord.orderStatus === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : ord.orderStatus === 'cancelled'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            <span>{ord.orderStatus}</span>
                          </span>
                        </td>

                        <td className="py-3.5">
                          <span className="font-extrabold text-[#F97316] text-xs block">
                            ETB {formatETB(ord.totalAmount || ord.total || 0)}
                          </span>
                          <span className="text-[10px] text-[#9CA3AF]">
                            {ord.items?.length || 1} item{ord.items && ord.items.length > 1 ? 's' : ''}
                          </span>
                        </td>

                        <td className="py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {/* Quick Status Select */}
                          <select
                            disabled={isUpdatingStatus}
                            value={ord.orderStatus}
                            onChange={(e) =>
                              handleStatusChange(
                                ord.id || (ord as any)._id || ord.orderNumber,
                                e.target.value as OrderStatus
                              )
                            }
                            className="px-2 py-1 rounded-lg bg-white border border-[#E5E7EB] text-xs font-semibold text-[#1F2937] cursor-pointer hover:border-[#F97316] transition-colors"
                            title="Update shipment stage"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          {/* Inspect Modal Trigger */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForModal(ord)}
                            className="p-1.5 rounded-lg border border-[#E5E7EB] hover:bg-[#FFF7ED] hover:border-[#F97316] text-[#4B5563] hover:text-[#F97316] inline-flex items-center cursor-pointer transition-colors"
                            title="Inspect full order details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ORDER DETAILS & FULFILLMENT MODAL */}
        {selectedOrderForModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6 my-8 border border-gray-100 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-[#F3F4F6] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#1F2937]">
                      Order #{selectedOrderForModal.orderNumber}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        selectedOrderForModal.orderStatus === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedOrderForModal.orderStatus === 'shipped'
                          ? 'bg-purple-100 text-purple-800'
                          : selectedOrderForModal.orderStatus === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : selectedOrderForModal.orderStatus === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedOrderForModal.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280]">
                    Placed on{' '}
                    {new Date(selectedOrderForModal.createdAt || Date.now()).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedOrderForModal(null)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body: Two Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Column 1: Customer & Delivery Address */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-2">
                    <h4 className="font-bold text-[#1F2937] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#F97316]" />
                      <span>Customer Contact</span>
                    </h4>
                    <p className="font-semibold text-sm text-[#1F2937]">
                      {selectedOrderForModal.customerName ||
                        selectedOrderForModal.shippingAddress?.fullName ||
                        'Customer'}
                    </p>
                    <p className="text-[#6B7280] flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-[#F97316]" />
                      <a
                        href={`tel:${selectedOrderForModal.shippingAddress?.phone || selectedOrderForModal.customerPhone}`}
                        className="hover:underline font-semibold text-[#1F2937]"
                      >
                        {selectedOrderForModal.shippingAddress?.phone || selectedOrderForModal.customerPhone || 'N/A'}
                      </a>
                    </p>
                    {selectedOrderForModal.customerEmail && (
                      <p className="text-[#6B7280]">{selectedOrderForModal.customerEmail}</p>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-2">
                    <h4 className="font-bold text-[#1F2937] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
                      <span>Delivery Location</span>
                    </h4>
                    <p className="text-[#1F2937] font-semibold">
                      {selectedOrderForModal.shippingAddress?.city || 'Addis Ababa'},{' '}
                      {selectedOrderForModal.shippingAddress?.subCity
                        ? `${selectedOrderForModal.shippingAddress.subCity} Sub-City`
                        : ''}
                    </p>
                    <p className="text-[#6B7280]">
                      Woreda: {selectedOrderForModal.shippingAddress?.woreda || '01'} • House #:{' '}
                      {selectedOrderForModal.shippingAddress?.houseNumber || 'N/A'}
                    </p>
                    {selectedOrderForModal.shippingAddress?.landmark && (
                      <p className="text-[#6B7280]">
                        <span className="font-semibold text-[#1F2937]">Landmark:</span>{' '}
                        {selectedOrderForModal.shippingAddress.landmark}
                      </p>
                    )}
                    {selectedOrderForModal.deliveryInstructions && (
                      <p className="text-[#F97316] font-medium bg-[#FFF7ED] p-2 rounded-xl mt-1">
                        Note: {selectedOrderForModal.deliveryInstructions}
                      </p>
                    )}
                  </div>

                  {/* Payment Details */}
                  <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-2">
                    <h4 className="font-bold text-[#1F2937] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#F97316]" />
                      <span>Payment Channel</span>
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase text-[#1F2937]">
                        {selectedOrderForModal.paymentMethod?.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={`font-bold uppercase px-2 py-0.5 rounded-full text-[10px] ${
                          selectedOrderForModal.paymentStatus === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {selectedOrderForModal.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Order Items & Status Update Controls */}
                <div className="space-y-4">
                  {/* Status Dispatch Box */}
                  <div className="p-4 rounded-2xl bg-[#FFF7ED] border border-orange-200 space-y-3">
                    <h4 className="font-bold text-[#EA580C] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span>Dispatch & Status Management</span>
                    </h4>

                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold text-[#1F2937] block">
                        Update Order Stage
                      </label>
                      <select
                        value={selectedOrderForModal.orderStatus}
                        onChange={(e) =>
                          handleStatusChange(
                            selectedOrderForModal.id ||
                              (selectedOrderForModal as any)._id ||
                              selectedOrderForModal.orderNumber,
                            e.target.value as OrderStatus,
                            modalNotesInput
                          )
                        }
                        disabled={isUpdatingStatus}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E7EB] font-bold text-xs cursor-pointer focus:outline-none focus:border-[#F97316]"
                      >
                        <option value="pending">Pending (ትዕዛዝ ተመዝግቧል)</option>
                        <option value="processing">Processing (ክፍያ ተረጋግጦ እየተዘጋጀ ነው)</option>
                        <option value="shipped">Shipped (ለመላክ በመንገድ ላይ ነው)</option>
                        <option value="delivered">Delivered (ለደንበኛ ደርሷል)</option>
                        <option value="cancelled">Cancelled (ትዕዛዝ ተሰርዟል)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#1F2937] block">
                        Courier / Delivery Dispatch Note
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Courier Dawit assigned with motorbike #ET-342..."
                        value={modalNotesInput}
                        onChange={(e) => setModalNotesInput(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#E5E7EB] text-xs text-[#1F2937] focus:outline-none focus:border-[#F97316]"
                      />
                    </div>
                  </div>

                  {/* Tracking History */}
                  <div className="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-2.5">
                    <h4 className="font-bold text-[#1F2937] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#F97316]" />
                      <span>Shipment Timeline Log</span>
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {selectedOrderForModal.trackingHistory && selectedOrderForModal.trackingHistory.length > 0 ? (
                        selectedOrderForModal.trackingHistory.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[11px] border-l-2 border-[#F97316] pl-2 py-0.5">
                            <div>
                              <span className="font-bold text-[#1F2937] uppercase">{step.status}</span>
                              <p className="text-[#6B7280]">{step.notes || 'Status synchronized'}</p>
                              <span className="text-[10px] text-[#9CA3AF]">
                                {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                                {new Date(step.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[#9CA3AF] text-[11px]">No tracking events recorded yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items List */}
              <div className="space-y-3 border-t border-[#F3F4F6] pt-4 text-xs">
                <h4 className="font-bold text-sm text-[#1F2937] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#F97316]" />
                  <span>Purchased Catalog Items</span>
                </h4>

                <div className="divide-y divide-[#F3F4F6] border border-[#E5E7EB] rounded-2xl overflow-hidden">
                  {selectedOrderForModal.items?.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                          {item.product?.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.title || item.product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#1F2937]">{item.title || item.product?.title}</p>
                          <span className="text-[11px] text-[#6B7280]">
                            SKU: {item.sku || item.product?.sku || 'N/A'} • Qty: {item.quantity}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-[#1F2937]">
                          ETB {formatETB(item.subtotal || (item.price || 0) * item.quantity)}
                        </span>
                        <span className="text-[10px] text-[#9CA3AF] block">
                          ETB {formatETB(item.price || item.unitPrice || 0)} each
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals Summary */}
                <div className="bg-[#F9FAFB] p-4 rounded-2xl border border-[#E5E7EB] space-y-1.5 text-xs text-[#4B5563]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>ETB {formatETB(selectedOrderForModal.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Door-to-Door Delivery Fee</span>
                    <span>
                      {selectedOrderForModal.deliveryFee === 0 ? (
                        <span className="text-emerald-600 font-bold">FREE</span>
                      ) : (
                        `ETB ${formatETB(selectedOrderForModal.deliveryFee || 0)}`
                      )}
                    </span>
                  </div>
                  {Number(selectedOrderForModal.discountAmount || 0) > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Promotional Coupon Discount</span>
                      <span>- ETB {formatETB(selectedOrderForModal.discountAmount || 0)}</span>
                    </div>
                  )}
                  <div className="border-t border-[#E5E7EB] pt-2 flex justify-between font-black text-sm text-[#F97316]">
                    <span>Grand Total</span>
                    <span>ETB {formatETB(selectedOrderForModal.totalAmount || selectedOrderForModal.total || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 hover:border-[#F97316] text-[#1F2937] hover:text-[#F97316] text-xs font-bold transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Packing Slip</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrderForModal(null)}
                  className="px-5 py-2 rounded-xl bg-[#1F2937] hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY & STOCK */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Low Stock Threshold Monitor (Units ≤ 5)</span>
              </div>

              {stats?.lowStockItems && stats.lowStockItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  {stats.lowStockItems.map((item) => (
                    <div key={item._id} className="p-4 rounded-xl border border-amber-200 bg-amber-50 space-y-1">
                      <span className="font-bold text-amber-950 block">{item.title}</span>
                      <span className="text-[#6B7280]">SKU: {item.sku}</span>
                      <div className="flex justify-between pt-1">
                        <span className="font-semibold text-rose-600">Stock: {item.stock} left</span>
                        <span className="font-bold text-[#1F2937]">ETB {formatETB(item.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6B7280]">All catalog products maintain sufficient warehouse inventory.</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-4">
              <h3 className="font-bold text-sm text-[#1F2937]">Inventory Movement Audit Log</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                      <th className="py-2.5 font-semibold">Product</th>
                      <th className="py-2.5 font-semibold">Type</th>
                      <th className="py-2.5 font-semibold">Delta</th>
                      <th className="py-2.5 font-semibold">Prev → New</th>
                      <th className="py-2.5 font-semibold">Reason</th>
                      <th className="py-2.5 font-semibold text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {inventoryLogs.slice(0, 10).map((log) => (
                      <tr key={log._id}>
                        <td className="py-2.5 font-bold text-[#1F2937]">{log.product?.title || 'Product'}</td>
                        <td className="py-2.5 uppercase text-[10px] text-[#6B7280]">{log.type}</td>
                        <td className="py-2.5 font-bold text-rose-600">-{log.quantity}</td>
                        <td className="py-2.5 text-[#4B5563]">
                          {log.previousStock} → {log.newStock}
                        </td>
                        <td className="py-2.5 text-[#6B7280]">{log.reason || 'Order reservation'}</td>
                        <td className="py-2.5 text-right text-[#9CA3AF]">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-4">
            <h2 className="text-xl font-extrabold text-[#1F2937]">Registered Ethiopian Customers</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                    <th className="py-3 font-semibold">Customer Name</th>
                    <th className="py-3 font-semibold">Email</th>
                    <th className="py-3 font-semibold">Ethiopian Phone</th>
                    <th className="py-3 font-semibold">Role</th>
                    <th className="py-3 font-semibold text-right">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {customers.map((c) => (
                    <tr key={c._id}>
                      <td className="py-3 font-bold text-[#1F2937]">{c.name}</td>
                      <td className="py-3 text-[#4B5563]">{c.email}</td>
                      <td className="py-3 font-semibold text-[#1F2937]">{c.phone}</td>
                      <td className="py-3 uppercase text-[10px] font-bold text-[#F97316]">{c.role}</td>
                      <td className="py-3 text-right text-[#6B7280]">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: PROMOTIONS (Live Coupon Management) */}
        {activeTab === 'promotions' && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3F4F6] pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#1F2937]">Promotional Coupons & Discounts</h2>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Manage active promo codes, set minimum order values, and control discount caps.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateCouponModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Coupon</span>
              </button>
            </div>

            {/* Coupons List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                    <th className="py-3 font-bold">Code</th>
                    <th className="py-3 font-bold">Discount</th>
                    <th className="py-3 font-bold">Min Order</th>
                    <th className="py-3 font-bold">Max Cap</th>
                    <th className="py-3 font-bold">Total / Per-User Limit</th>
                    <th className="py-3 font-bold">Category Restriction</th>
                    <th className="py-3 font-bold">Expires</th>
                    <th className="py-3 font-bold">Status</th>
                    <th className="py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {(!couponsData?.data || couponsData.data.length === 0) ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-[#9CA3AF]">
                        No promotional coupons created yet. Click "Create New Coupon" to add one.
                      </td>
                    </tr>
                  ) : (
                    couponsData.data.map((cpn: CouponDTO) => (
                      <tr key={cpn.id || (cpn as any)._id} className="hover:bg-[#F9FAFB]">
                        <td className="py-3 font-black text-[#EA580C] tracking-wide">
                          {cpn.code}
                        </td>
                        <td className="py-3 font-bold text-[#1F2937]">
                          {cpn.discountType === 'percentage'
                            ? `${cpn.discountValue}% OFF`
                            : `ETB ${formatETB(cpn.discountValue)} OFF`}
                        </td>
                        <td className="py-3 text-[#4B5563]">
                          {cpn.minOrderValue > 0 ? `ETB ${formatETB(cpn.minOrderValue)}` : 'No minimum'}
                        </td>
                        <td className="py-3 text-[#6B7280]">
                          {cpn.maxDiscount ? `ETB ${formatETB(cpn.maxDiscount)}` : 'None'}
                        </td>
                        <td className="py-3 text-[#4B5563]">
                          <span className="font-semibold text-[#1F2937]">{cpn.usedCount ?? 0}</span>
                          <span className="text-[#9CA3AF]"> / {cpn.usageLimit ?? 100}</span>
                          <span className="ml-1 text-[11px] text-[#F97316] font-medium">({cpn.perCustomerLimit ?? 1}/user)</span>
                        </td>
                        <td className="py-3 text-[#4B5563]">
                          {cpn.eligibleCategories && cpn.eligibleCategories.length > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              {cpn.eligibleCategories.join(', ')}
                            </span>
                          ) : (
                            <span className="text-[#9CA3AF]">All Catalog</span>
                          )}
                        </td>
                        <td className="py-3 text-[#6B7280]">
                          {new Date(cpn.expiryDate).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              cpn.isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {cpn.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await toggleCoupon(cpn.id || (cpn as any)._id).unwrap();
                                setStatusMessage(`Coupon ${cpn.code} status toggled`);
                                setTimeout(() => setStatusMessage(null), 3000);
                              } catch (err: any) {
                                setStatusMessage('Failed to toggle coupon');
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg border border-[#E5E7EB] hover:bg-gray-50 text-[11px] font-semibold text-[#4B5563] cursor-pointer"
                            title="Toggle active status"
                          >
                            {cpn.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm(`Delete coupon ${cpn.code}?`)) {
                                try {
                                  await deleteCoupon(cpn.id || (cpn as any)._id).unwrap();
                                  setStatusMessage(`Coupon ${cpn.code} deleted`);
                                  setTimeout(() => setStatusMessage(null), 3000);
                                } catch (err: any) {
                                  setStatusMessage('Failed to delete coupon');
                                }
                              }
                            }}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer inline-flex items-center"
                            title="Delete coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Create Coupon Modal */}
            {showCreateCouponModal && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-base font-bold text-[#1F2937]">Create New Promo Code</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateCouponModal(false);
                        setCouponFormError('');
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {couponFormError && (
                    <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                      {couponFormError}
                    </p>
                  )}

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setCouponFormError('');
                      const code = couponCodeInput.trim().toUpperCase();
                      if (!code) {
                        setCouponFormError('Coupon code is required');
                        return;
                      }

                      const expiryDate = new Date();
                      expiryDate.setDate(expiryDate.getDate() + expiryDaysInput);

                      try {
                        await createCoupon({
                          code,
                          discountType: discountTypeInput,
                          discountValue: discountValueInput,
                          minOrderValue: minOrderInput,
                          maxDiscount: maxDiscountInput,
                          expiryDate: expiryDate.toISOString(),
                          usageLimit: usageLimitInput,
                          perCustomerLimit: perCustomerLimitInput,
                          eligibleCategories: selectedEligibleCategory !== 'all' ? [selectedEligibleCategory] : undefined,
                          isActive: true,
                        }).unwrap();

                        setShowCreateCouponModal(false);
                        setCouponCodeInput('');
                        setStatusMessage(`Coupon "${code}" created successfully!`);
                        setTimeout(() => setStatusMessage(null), 3000);
                      } catch (err: any) {
                        setCouponFormError(err.data?.message || err.message || 'Failed to create coupon');
                      }
                    }}
                    className="space-y-3 text-xs"
                  >
                    <div>
                      <label className="font-semibold text-[#1F2937] block mb-1">Coupon Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. TIMKAT2026"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] uppercase text-xs font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-[#1F2937] block mb-1">Discount Type</label>
                        <select
                          value={discountTypeInput}
                          onChange={(e) => setDiscountTypeInput(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs"
                        >
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed_amount">Fixed Amount (ETB)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-[#1F2937] block mb-1">
                          {discountTypeInput === 'percentage' ? 'Percentage Value (%)' : 'Amount (ETB)'}
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={discountTypeInput === 'percentage' ? 90 : 100000}
                          value={discountValueInput}
                          onChange={(e) => setDiscountValueInput(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-[#1F2937] block mb-1">Min Order Value (ETB)</label>
                        <input
                          type="number"
                          min={0}
                          value={minOrderInput}
                          onChange={(e) => setMinOrderInput(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-[#1F2937] block mb-1">Max Cap (ETB, Optional)</label>
                        <input
                          type="number"
                          min={1}
                          placeholder="None"
                          value={maxDiscountInput || ''}
                          onChange={(e) => setMaxDiscountInput(e.target.value ? Number(e.target.value) : undefined)}
                          className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-[#1F2937] block mb-1">Per-Customer Limit</label>
                        <input
                          type="number"
                          min={1}
                          value={perCustomerLimitInput}
                          onChange={(e) => setPerCustomerLimitInput(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-[#1F2937] block mb-1">Eligible Category</label>
                        <select
                          value={selectedEligibleCategory}
                          onChange={(e) => setSelectedEligibleCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs"
                        >
                          <option value="all">All Store Categories</option>
                          {categoriesData?.data?.map((cat: any) => (
                            <option key={cat._id || cat.id} value={cat.slug || cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-[#1F2937] block mb-1">Valid For (Days)</label>
                        <input
                          type="number"
                          min={1}
                          value={expiryDaysInput}
                          onChange={(e) => setExpiryDaysInput(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-[#1F2937] block mb-1">Max Total Usage</label>
                        <input
                          type="number"
                          min={1}
                          value={usageLimitInput}
                          onChange={(e) => setUsageLimitInput(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateCouponModal(false)}
                        className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isCreatingCoupon}
                        className="px-5 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        {isCreatingCoupon ? 'Creating...' : 'Create Coupon'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: REVIEWS MODERATION */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3F4F6] pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#1F2937]">Customer Reviews Moderation</h2>
                <p className="text-xs text-[#6B7280]">
                  Inspect buyer feedback, audit ratings, review customer product photos, and moderate or delete submissions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B7280] font-semibold">Filter:</span>
                {(['all', 'approved', 'pending', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setReviewStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer ${
                      reviewStatusFilter === st
                        ? 'bg-[#F97316] text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                    <th className="py-3 font-bold">Product</th>
                    <th className="py-3 font-bold">Reviewer</th>
                    <th className="py-3 font-bold">Rating</th>
                    <th className="py-3 font-bold">Feedback / Title</th>
                    <th className="py-3 font-bold">Photos</th>
                    <th className="py-3 font-bold">Status</th>
                    <th className="py-3 font-bold">Date</th>
                    <th className="py-3 font-bold text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {reviews
                    .filter((rev: any) => reviewStatusFilter === 'all' || (rev.status || 'approved') === reviewStatusFilter)
                    .length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#9CA3AF]">
                        No customer reviews matching current filter.
                      </td>
                    </tr>
                  ) : (
                    reviews
                      .filter((rev: any) => reviewStatusFilter === 'all' || (rev.status || 'approved') === reviewStatusFilter)
                      .map((rev: any) => (
                        <tr key={rev._id || rev.id} className="hover:bg-[#F9FAFB]">
                          <td className="py-3 font-bold text-[#1F2937]">
                            {rev.product?.title || 'Catalog Product'}
                          </td>
                          <td className="py-3">
                            <span className="font-semibold text-[#1F2937] block">
                              {rev.user?.name || 'Customer'}
                            </span>
                            <span className="text-[11px] text-[#6B7280]">{rev.user?.email}</span>
                            {rev.isVerifiedPurchase && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full font-bold">
                                ✓ Verified Buyer
                              </span>
                            )}
                          </td>
                          <td className="py-3">
                            <div className="flex text-[#F97316]">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Star
                                  key={idx}
                                  className={`w-3.5 h-3.5 ${
                                    idx < rev.rating ? 'fill-[#F97316] text-[#F97316]' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </td>
                          <td className="py-3 text-[#4B5563] max-w-xs">
                            {rev.title && (
                              <span className="font-bold text-[#1F2937] block truncate">
                                {rev.title}
                              </span>
                            )}
                            <p className="line-clamp-2">{rev.comment}</p>
                          </td>
                          <td className="py-3">
                            {rev.images && rev.images.length > 0 ? (
                              <div className="flex items-center gap-1.5">
                                {rev.images.map((img: string, imgIdx: number) => (
                                  <img
                                    key={imgIdx}
                                    src={img}
                                    alt="Review thumbnail"
                                    onClick={() => setAdminReviewImageModal(img)}
                                    className="w-8 h-8 rounded-lg object-cover border border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                                  />
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-gray-400">None</span>
                            )}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                rev.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : rev.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {rev.status || 'approved'}
                            </span>
                          </td>
                          <td className="py-3 text-[#9CA3AF]">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              {rev.status !== 'approved' && (
                                <button
                                  type="button"
                                  onClick={() => handleModerateReview(rev._id || rev.id, 'approved')}
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 inline-flex items-center cursor-pointer"
                                  title="Approve review"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {rev.status !== 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() => handleModerateReview(rev._id || rev.id, 'rejected')}
                                  className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 inline-flex items-center cursor-pointer"
                                  title="Reject review"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteReview(rev._id || rev.id)}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 inline-flex items-center cursor-pointer"
                                title="Delete review"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Admin Photo Preview Modal */}
            {adminReviewImageModal && (
              <div
                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
                onClick={() => setAdminReviewImageModal(null)}
              >
                <div
                  className="relative max-w-2xl max-h-[85vh] bg-transparent rounded-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setAdminReviewImageModal(null)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer z-10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <img
                    src={adminReviewImageModal}
                    alt="Customer review photo"
                    className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-4">
              <h2 className="text-xl font-extrabold text-[#1F2937]">Store Configuration & Policies</h2>
              <div className="space-y-3 text-xs text-[#4B5563]">
                <div className="flex justify-between p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                  <span className="font-semibold text-[#1F2937]">Default Currency</span>
                  <span className="font-bold text-[#F97316]">ETB (Ethiopian Birr / የኢትዮጵያ ብር)</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                  <span className="font-semibold text-[#1F2937]">Addis Ababa Delivery Standard Fee</span>
                  <span className="font-bold">ETB 150.00</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                  <span className="font-semibold text-[#1F2937]">Regional Delivery Standard Fee</span>
                  <span className="font-bold">ETB 250.00</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
                  <span className="font-semibold text-[#1F2937]">Free Door-to-Door Delivery Threshold</span>
                  <span className="font-bold text-emerald-600">ETB 2,500.00</span>
                </div>
              </div>
            </div>

            {/* Feature 1: Notification Gateway Status Panel */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3F4F6] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FFF7ED] text-[#F97316] flex items-center justify-center">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#1F2937]">
                      Notification Gateways (Telegram Bot + Ethiopian SMS)
                    </h3>
                    <p className="text-xs text-[#6B7280]">
                      Real-time delivery confirmation, order status updates, and customer SMS broadcast status
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAdminTestAlert}
                    disabled={isAdminTestingNotif}
                    className="px-4 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isAdminTestingNotif ? 'Sending Test...' : 'Send Live Test Alert'}</span>
                  </button>
                </div>
              </div>

              {adminNotifFeedback && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700 flex items-center gap-2">
                  <Activity className="w-4 h-4 shrink-0" />
                  <span>{adminNotifFeedback}</span>
                </div>
              )}

              {/* Status Badges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1F2937] flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-sky-500" />
                      Telegram Bot Gateway
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        gatewayStatusData?.data?.telegram?.configured
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {gatewayStatusData?.data?.telegram?.configured ? 'Active / Configured' : 'Env Token Pending (Fallback Graceful)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7280]">
                    Token: {gatewayStatusData?.data?.telegram?.configured ? '••••••••' : 'TELEGRAM_BOT_TOKEN not provided'} | Default Chat: {gatewayStatusData?.data?.telegram?.defaultChatIdConfigured ? 'Set' : 'Uses user chat IDs'}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1F2937] flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-emerald-500" />
                      SMS Provider Gateway
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                      {gatewayStatusData?.data?.sms?.provider || 'mock'} Mode Active
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7280]">
                    Sender ID: <span className="font-mono">{gatewayStatusData?.data?.sms?.senderId || 'ShopNestET'}</span> | Targets: +251 9... / +251 7...
                  </p>
                </div>
              </div>

              {/* Live Dispatch Audit Log */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">
                    Recent Dispatched Notification Logs ({gatewayStatusData?.data?.recentLogs?.length || 0})
                  </h4>
                  <span className="text-[11px] text-[#6B7280]">Updated in real time</span>
                </div>

                <div className="overflow-x-auto border border-[#E5E7EB] rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F9FAFB] text-[#6B7280] border-b border-[#E5E7EB]">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold">Channel</th>
                        <th className="py-2.5 px-3 font-semibold">Recipient</th>
                        <th className="py-2.5 px-3 font-semibold">Event</th>
                        <th className="py-2.5 px-3 font-semibold">Status</th>
                        <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {!gatewayStatusData?.data?.recentLogs || gatewayStatusData.data.recentLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-[#9CA3AF]">
                            No notifications dispatched yet. Click "Send Live Test Alert" above or place an order.
                          </td>
                        </tr>
                      ) : (
                        gatewayStatusData.data.recentLogs.map((log: any) => (
                          <tr key={log.id} className="hover:bg-[#F9FAFB]">
                            <td className="py-2 px-3 font-bold uppercase text-[11px]">
                              {log.channel === 'telegram' ? '✈️ Telegram' : '💬 SMS'}
                            </td>
                            <td className="py-2 px-3 font-mono text-[11px] text-[#1F2937]">
                              {log.recipient}
                            </td>
                            <td className="py-2 px-3 text-[#4B5563]">
                              <span className="px-2 py-0.5 rounded-md bg-gray-100 font-mono text-[10px]">
                                {log.event}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  log.status === 'sent'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : log.status === 'mocked'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {log.status}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-[#6B7280] text-[11px]">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
