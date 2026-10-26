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
} from 'lucide-react';
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
  const orders = ordersData?.data?.orders || [];
  const customers = usersData?.data?.users || [];
  const inventoryLogs = inventoryData?.data || [];
  const products = productsData?.data?.products || [];
  const categories = categoriesData?.data || [];
  const reviews = reviewsData?.data || [];

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateStatus({ orderId, status: newStatus }).unwrap();
      setStatusMessage(`Order updated to ${newStatus.toUpperCase()}`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage(`Failed to update status: ${err.data?.message || err.message}`);
    }
  };

  const exportOrdersToCSV = () => {
    if (!orders || orders.length === 0) return;
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
    const rows = orders.map((ord) => [
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
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F3F4F6] pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#1F2937]">Orders Management</h2>
                <p className="text-xs text-[#6B7280]">
                  Inspect deliveries, customer contact details, and update shipment progress
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={exportOrdersToCSV}
                  disabled={orders.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#E5E7EB] hover:border-[#F97316] text-[#1F2937] hover:text-[#F97316] text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                  title="Export orders as CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <span className="text-xs text-[#6B7280] font-semibold bg-gray-100 px-2.5 py-1 rounded-lg">
                  Total Orders: {orders.length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                    <th className="py-3 font-bold">Order #</th>
                    <th className="py-3 font-bold">Customer & Phone</th>
                    <th className="py-3 font-bold">Delivery Location</th>
                    <th className="py-3 font-bold">Payment</th>
                    <th className="py-3 font-bold">Status</th>
                    <th className="py-3 font-bold">Total</th>
                    <th className="py-3 font-bold text-right">Update Order Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {orders.map((ord) => (
                    <tr key={ord.orderNumber} className="hover:bg-[#F9FAFB]">
                      <td className="py-3 font-bold text-[#1F2937]">{ord.orderNumber}</td>
                      <td className="py-3">
                        <span className="font-semibold text-[#1F2937] block">
                          {ord.customerName || ord.shippingAddress?.fullName}
                        </span>
                        <span className="text-[11px] text-[#6B7280]">{ord.shippingAddress?.phone}</span>
                      </td>
                      <td className="py-3 text-[#4B5563]">
                        {ord.shippingAddress?.city}
                        {ord.shippingAddress?.subCity && `, ${ord.shippingAddress.subCity}`}
                      </td>
                      <td className="py-3">
                        <span className="uppercase text-[11px] font-semibold text-[#1F2937] block">
                          {ord.paymentMethod?.replace(/_/g, ' ')}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            ord.paymentStatus === 'completed' ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {ord.paymentStatus?.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
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
                      <td className="py-3 font-black text-[#F97316]">
                        ETB {formatETB(ord.totalAmount || ord.total || 0)}
                      </td>
                      <td className="py-3 text-right">
                        <select
                          disabled={isUpdatingStatus}
                          value={ord.orderStatus}
                          onChange={(e) =>
                            handleStatusChange(ord.id || (ord as any)._id, e.target.value as OrderStatus)
                          }
                          className="px-2 py-1 rounded-lg bg-white border border-[#E5E7EB] text-xs font-semibold text-[#1F2937] cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                    <th className="py-3 font-bold">Redemptions</th>
                    <th className="py-3 font-bold">Expires</th>
                    <th className="py-3 font-bold">Status</th>
                    <th className="py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {(!couponsData?.data || couponsData.data.length === 0) ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#9CA3AF]">
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
                        <label className="font-semibold text-[#1F2937] block mb-1">Max Usage Limit</label>
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
                  Inspect buyer feedback, audit ratings, and remove inappropriate content or spam.
                </p>
              </div>
              <span className="text-xs text-[#6B7280] font-semibold">
                Total Reviews: {reviews.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E5E7EB] text-[#6B7280]">
                    <th className="py-3 font-bold">Product</th>
                    <th className="py-3 font-bold">Reviewer</th>
                    <th className="py-3 font-bold">Rating</th>
                    <th className="py-3 font-bold">Feedback / Comment</th>
                    <th className="py-3 font-bold">Date</th>
                    <th className="py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {reviews.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#9CA3AF]">
                        No customer reviews submitted yet.
                      </td>
                    </tr>
                  ) : (
                    reviews.map((rev: any) => (
                      <tr key={rev._id || rev.id} className="hover:bg-[#F9FAFB]">
                        <td className="py-3 font-bold text-[#1F2937]">
                          {rev.product?.title || 'Catalog Product'}
                        </td>
                        <td className="py-3">
                          <span className="font-semibold text-[#1F2937] block">
                            {rev.user?.name || 'Customer'}
                          </span>
                          <span className="text-[11px] text-[#6B7280]">{rev.user?.email}</span>
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
                          <p className="line-clamp-2">{rev.comment}</p>
                        </td>
                        <td className="py-3 text-[#9CA3AF]">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev._id || rev.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 inline-flex items-center cursor-pointer"
                            title="Delete review"
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
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
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
        )}
      </main>
    </div>
  );
};
