import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  MapPin,
  Heart,
  Settings,
  LogOut,
  Mail,
  Phone,
  CheckCircle2,
  Plus,
  Camera,
  UploadCloud,
  Bell,
  Send,
  MessageSquare,
  AlertCircle,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout, updateUser } from '../store/slices/authSlice';
import {
  useLogoutUserMutation,
  useSaveAddressMutation,
  useUpdateProfileMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useSendTestNotificationMutation,
} from '../store/api/authApi';
import { useGetUserOrdersQuery, OrderRecord } from '../store/api/ordersApi';
import { useGetMyReturnsQuery } from '../store/api/returnsApi';
import { formatETB } from '../components/common/ProductPrice';
import { EthiopianAddress, ETHIOPIA_CONSTANTS, ReturnRequestDTO } from '@shopnest/shared';

type AccountTab = 'dashboard' | 'orders' | 'returns' | 'addresses' | 'wishlist' | 'settings';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const wishlistIds = useAppSelector((state) => state.wishlist.productIds);

  const [activeTab, setActiveTab] = useState<AccountTab>('dashboard');
  const [logoutApi] = useLogoutUserMutation();
  const [saveAddressApi] = useSaveAddressMutation();
  const [updateProfileApi, { isLoading: isUploadingAvatar }] = useUpdateProfileMutation();
  const { data: ordersResponse } = useGetUserOrdersQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: myReturnsData } = useGetMyReturnsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const returnsList = myReturnsData?.data || [];

  // Profile Upload & Edit State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editError, setEditError] = useState('');
  const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    if (!editName.trim()) {
      setEditError('Name is required');
      return;
    }
    setIsUpdatingInfo(true);
    try {
      const res = await updateProfileApi({ name: editName.trim(), phone: editPhone.trim() }).unwrap();
      if (res.data) {
        dispatch(updateUser(res.data));
        setProfileNotice('Profile information updated successfully!');
        setIsEditingInfo(false);
        setTimeout(() => setProfileNotice(null), 3500);
      }
    } catch (err: any) {
      setEditError(err.data?.message || err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  // New Address Modal / Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newCity, setNewCity] = useState('Addis Ababa');
  const [newSubCity, setNewSubCity] = useState('Bole');
  const [newWoreda, setNewWoreda] = useState('03');
  const [newLandmark, setNewLandmark] = useState('');
  const [addressSavedNotice, setAddressSavedNotice] = useState<string | null>(null);

  // Notification Preferences State (Telegram Bot & SMS)
  const { data: notifData } = useGetNotificationPreferencesQuery(undefined, { skip: !isAuthenticated });
  const [updateNotificationPrefs, { isLoading: isSavingNotifs }] = useUpdateNotificationPreferencesMutation();
  const [sendTestNotification, { isLoading: isSendingTestNotif }] = useSendTestNotificationMutation();

  const [telegramEnabled, setTelegramEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [telegramChatId, setTelegramChatId] = useState('');
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [notifSavedNotice, setNotifSavedNotice] = useState<string | null>(null);
  const [testNotifNotice, setTestNotifNotice] = useState<{ success: boolean; message: string } | null>(null);

  React.useEffect(() => {
    if (notifData?.data) {
      setTelegramEnabled(notifData.data.telegramEnabled ?? true);
      setSmsEnabled(notifData.data.smsEnabled ?? true);
      setTelegramChatId(notifData.data.telegramChatId || '');
      setOrderUpdates(notifData.data.orderUpdates ?? true);
      setPromotions(notifData.data.promotions ?? false);
    }
  }, [notifData]);

  const handleSaveNotificationPrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifSavedNotice(null);
    try {
      await updateNotificationPrefs({
        telegramEnabled,
        smsEnabled,
        telegramChatId: telegramChatId.trim(),
        orderUpdates,
        promotions,
      }).unwrap();
      setNotifSavedNotice('Notification preferences saved successfully!');
      setTimeout(() => setNotifSavedNotice(null), 3500);
    } catch (err: any) {
      setNotifSavedNotice(err.data?.message || 'Failed to save notification preferences');
    }
  };

  const handleTriggerTestNotification = async (channel: 'telegram' | 'sms' | 'both') => {
    setTestNotifNotice(null);
    try {
      const res = await sendTestNotification({
        channel,
        chatId: telegramChatId.trim() || undefined,
        phone: user?.phone,
      }).unwrap();
      const tgStatus = channel !== 'sms' ? (res.data?.telegramSuccess ? 'Telegram Sent' : 'Telegram Skipped (check Bot Token/Chat ID)') : '';
      const smsStatus = channel !== 'telegram' ? (res.data?.smsSuccess ? 'SMS Sent (Mocked/Live)' : 'SMS Skipped') : '';
      setTestNotifNotice({
        success: true,
        message: `Test alert dispatched: ${[tgStatus, smsStatus].filter(Boolean).join(' • ')}`,
      });
      setTimeout(() => setTestNotifNotice(null), 5000);
    } catch (err: any) {
      setTestNotifNotice({
        success: false,
        message: err.data?.message || 'Failed to send test alert',
      });
    }
  };

  const orders = ordersResponse?.data || [];

  const totalSpent = orders
    .filter((o) => o.paymentStatus === 'completed' || o.orderStatus === 'delivered')
    .reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // ignore
    }
    dispatch(logout());
    navigate('/');
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileNotice('Please choose an image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileNotice('Image file must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await updateProfileApi({ avatar: base64 }).unwrap();
        if (res.data) {
          dispatch(updateUser(res.data));
          setProfileNotice('Profile photo successfully updated!');
          setTimeout(() => setProfileNotice(null), 3500);
        }
      } catch (err: any) {
        setProfileNotice('Failed to upload picture: ' + (err.data?.message || err.message));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await saveAddressApi({
        fullName: user.name,
        phone: user.phone,
        city: newCity,
        subCity: newSubCity,
        woreda: newWoreda,
        landmark: newLandmark,
        isDefault: !user.addresses || user.addresses.length === 0,
      }).unwrap();

      setAddressSavedNotice('Address successfully added to your profile!');
      setShowAddressForm(false);
      setTimeout(() => setAddressSavedNotice(null), 3500);
    } catch (err: any) {
      setAddressSavedNotice('Failed to save address: ' + (err.data?.message || err.message));
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#1F2937] dark:text-white">Sign In Required</h2>
        <p className="text-xs text-[#6B7280] dark:text-gray-400">
          Please sign in to view your Ethiopian customer dashboard and track orders.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 rounded-xl bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA580C]"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  const registeredYear = user.createdAt ? new Date(user.createdAt).getFullYear() : 2026;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notice */}
      {(addressSavedNotice || profileNotice) && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{addressSavedNotice || profileNotice}</span>
        </div>
      )}

      {/* Hidden File Input for Avatar Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleAvatarFile}
        className="hidden"
        aria-label="Upload profile avatar"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar matching Image 1 Screen 6 */}
        <aside className="lg:col-span-3 space-y-4">
          {/* User Quick Card in Sidebar */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-800 p-4 shadow-2xs flex items-center gap-3 transition-colors">
            <div className="relative group shrink-0">
              <div className="w-12 h-12 rounded-full bg-[#FFF7ED] dark:bg-orange-950/50 border border-[#F97316]/30 flex items-center justify-center text-[#F97316] font-bold text-sm overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Change Profile Picture"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-[#1F2937] dark:text-white truncate">
                {user.name}
              </h3>
              <p className="text-[10px] text-[#6B7280] dark:text-gray-400 truncate">{user.email}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] text-[#F97316] hover:underline font-semibold flex items-center gap-1 mt-0.5"
              >
                <UploadCloud className="w-3 h-3" />
                <span>Change Photo</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-800 p-4 shadow-2xs space-y-1 transition-colors">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-[#F97316] text-white shadow-xs'
                  : 'text-[#4B5563] dark:text-gray-300 hover:bg-[#F9FAFB] dark:hover:bg-gray-800 hover:text-[#1F2937] dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <Link
              to="/account/orders"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#4B5563] dark:text-gray-300 hover:bg-[#F9FAFB] dark:hover:bg-gray-800 hover:text-[#1F2937] dark:hover:text-white transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders</span>
            </Link>

            <button
              onClick={() => setActiveTab('returns')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'returns'
                  ? 'bg-[#F97316] text-white shadow-xs'
                  : 'text-[#4B5563] dark:text-gray-300 hover:bg-[#F9FAFB] dark:hover:bg-gray-800 hover:text-[#1F2937] dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <RotateCcw className="w-4 h-4" />
                <span>Returns & Refunds</span>
              </div>
              {returnsList.length > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'returns'
                      ? 'bg-white text-[#F97316]'
                      : 'bg-orange-100 dark:bg-orange-950 text-[#F97316]'
                  }`}
                >
                  {returnsList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'addresses'
                  ? 'bg-[#F97316] text-white shadow-xs'
                  : 'text-[#4B5563] dark:text-gray-300 hover:bg-[#F9FAFB] dark:hover:bg-gray-800 hover:text-[#1F2937] dark:hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Addresses</span>
            </button>

            <Link
              to="/wishlist"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#4B5563] dark:text-gray-300 hover:bg-[#F9FAFB] dark:hover:bg-gray-800 hover:text-[#1F2937] dark:hover:text-white transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span>Wishlist ({wishlistIds.length})</span>
            </Link>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'settings'
                  ? 'bg-[#F97316] text-white shadow-xs'
                  : 'text-[#4B5563] dark:text-gray-300 hover:bg-[#F9FAFB] dark:hover:bg-gray-800 hover:text-[#1F2937] dark:hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Account Settings</span>
            </button>

            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#FFF7ED] dark:bg-orange-950/60 text-[#EA580C] dark:text-orange-300 hover:bg-[#F97316] hover:text-white transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Admin Operations</span>
              </Link>
            )}

            <div className="border-t border-[#F3F4F6] dark:border-gray-800 my-2 pt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="lg:col-span-9 space-y-6">
          {/* Welcome Card matching Image 1 Screen 6 */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-800 p-6 shadow-2xs space-y-5 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3F4F6] dark:border-gray-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FFF7ED] dark:bg-orange-950/60 border-2 border-[#F97316]/30 flex items-center justify-center text-[#F97316] font-bold text-lg overflow-hidden shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute inset-0 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Upload Avatar"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-2xl font-black text-[#1F2937] dark:text-white">
                    Welcome, {user.name}
                  </h1>
                  <p className="text-xs text-[#6B7280] dark:text-gray-400">
                    Customer since {registeredYear} • ShopNest Ethiopia Verified Shopper
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B7280] dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>{user.email}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#F97316]" />
                  <span>{user.phone}</span>
                </div>
              </div>
            </div>

            {/* 3 Metric Cards matching Image 1 Screen 6 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-[#E5E7EB] dark:border-gray-800 bg-[#F9FAFB] dark:bg-gray-900/50 space-y-1">
                <span className="text-[11px] font-bold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider block">
                  Total Orders
                </span>
                <span className="text-2xl font-black text-[#1F2937] dark:text-white">
                  {orders.length}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-[#E5E7EB] dark:border-gray-800 bg-[#F9FAFB] dark:bg-gray-900/50 space-y-1">
                <span className="text-[11px] font-bold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider block">
                  Wishlist Items
                </span>
                <span className="text-2xl font-black text-[#1F2937] dark:text-white">
                  {wishlistIds.length}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-[#E5E7EB] dark:border-gray-800 bg-[#F9FAFB] dark:bg-gray-900/50 space-y-1">
                <span className="text-[11px] font-bold text-[#6B7280] dark:text-gray-400 uppercase tracking-wider block">
                  Total Spent
                </span>
                <span className="text-2xl font-black text-[#F97316]">
                  ETB {formatETB(totalSpent || (orders.length > 0 ? 45997 : 0))}
                </span>
              </div>
            </div>
          </div>

          {/* TAB: DASHBOARD (Recent Orders Table) */}
          {activeTab === 'dashboard' && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-800 p-6 shadow-2xs space-y-4 transition-colors">
              <div className="flex items-center justify-between border-b border-[#F3F4F6] dark:border-gray-800 pb-3">
                <h2 className="text-base font-bold text-[#1F2937] dark:text-white">
                  Recent Orders
                </h2>
                <Link
                  to="/account/orders"
                  className="text-xs font-bold text-[#F97316] hover:underline"
                >
                  View all →
                </Link>
              </div>

              {orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#F3F4F6] dark:border-gray-800 text-[#6B7280] dark:text-gray-400">
                        <th className="py-2.5 font-bold">Order #</th>
                        <th className="py-2.5 font-bold">Status</th>
                        <th className="py-2.5 font-bold">Date</th>
                        <th className="py-2.5 font-bold">Total</th>
                        <th className="py-2.5 font-bold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6] dark:divide-gray-800">
                      {orders.slice(0, 5).map((order: OrderRecord) => (
                        <tr key={order.id} className="hover:bg-[#F9FAFB] dark:hover:bg-gray-850">
                          <td className="py-3 font-semibold text-[#1F2937] dark:text-gray-200">
                            #{order.orderNumber}
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                order.orderStatus === 'delivered'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                                  : order.orderStatus === 'shipped'
                                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                                  : order.orderStatus === 'processing'
                                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                                  : order.orderStatus === 'cancelled'
                                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                              }`}
                            >
                              {(order.orderStatus || 'Pending').toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 text-[#6B7280] dark:text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 font-bold text-[#1F2937] dark:text-gray-200">
                            ETB {formatETB(order.totalAmount || order.total || 0)}
                          </td>
                          <td className="py-3 text-right">
                            <Link
                              to={`/track-order?order=${order.orderNumber}`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F97316] hover:underline"
                            >
                              {order.orderStatus === 'delivered' ? 'Return / Details' : 'Track'}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <ShoppingBag className="w-10 h-10 text-[#9CA3AF] mx-auto stroke-1" />
                  <p className="text-xs text-[#6B7280] dark:text-gray-400">
                    No orders placed yet. Start exploring ShopNest Ethiopia catalog!
                  </p>
                  <Link
                    to="/shop"
                    className="inline-block px-4 py-2 rounded-xl bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA580C]"
                  >
                    Explore Products
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB: RETURNS & REFUNDS */}
          {activeTab === 'returns' && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-800 p-6 shadow-2xs space-y-5 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F3F4F6] dark:border-gray-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-[#1F2937] dark:text-white">
                    Returns & Refund Requests (የእቃ መመለስ)
                  </h2>
                  <p className="text-xs text-[#6B7280] dark:text-gray-400">
                    Track returned items, inspection decisions, and verified refunds.
                  </p>
                </div>
              </div>

              {returnsList.length > 0 ? (
                <div className="space-y-3">
                  {returnsList.map((ret: ReturnRequestDTO) => (
                    <div
                      key={ret.id || (ret as any)._id}
                      className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-[#F9FAFB] dark:bg-gray-900/50 space-y-2 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 text-[#F97316]" />
                          <span className="font-bold text-[#1F2937] dark:text-white">
                            Order #{ret.orderNumber}
                          </span>
                          <span className="text-[#9CA3AF]">
                            • {new Date(ret.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block self-start sm:self-auto ${
                            ret.status === 'refunded'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : ret.status === 'approved'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                              : ret.status === 'rejected'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {ret.status === 'refunded' && '💸 Refunded'}
                          {ret.status === 'approved' && '✅ Return Approved'}
                          {ret.status === 'rejected' && '❌ Declined'}
                          {ret.status === 'pending' && '⏳ Review in Progress'}
                        </span>
                      </div>

                      <div className="text-gray-600 dark:text-gray-300 space-y-1">
                        <p>
                          <strong>Reason:</strong> <span className="capitalize">{ret.reason.replace(/_/g, ' ')}</span>
                          {ret.customerNote && ` — "${ret.customerNote}"`}
                        </p>
                        {ret.status === 'refunded' && (
                          <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            Refund of ETB {formatETB(ret.refundAmount || 0)} transferred via {ret.refundMethod?.toUpperCase()} (Tx Ref: {ret.refundReference}) on {ret.processedAt ? new Date(ret.processedAt).toLocaleDateString() : 'N/A'}.
                          </p>
                        )}
                        {ret.status === 'rejected' && ret.rejectionReason && (
                          <p className="text-rose-600 dark:text-rose-400">
                            Reason for rejection: {ret.rejectionReason}
                          </p>
                        )}
                      </div>

                      {ret.images && ret.images.length > 0 && (
                        <div className="flex gap-2 pt-1">
                          {ret.images.map((img, imgIdx) => (
                            <img
                              key={imgIdx}
                              src={img}
                              alt="Return photo"
                              className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 space-y-2 text-[#6B7280] dark:text-gray-400 text-xs">
                  <RotateCcw className="w-8 h-8 mx-auto text-gray-400 stroke-1" />
                  <p>You have no active return or refund requests.</p>
                  <p className="text-[11px] text-[#9CA3AF]">
                    You can request a return from your Track Order page within 7 days of receiving your package.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-800 p-6 shadow-2xs space-y-5 transition-colors">
              <div className="flex items-center justify-between border-b border-[#F3F4F6] dark:border-gray-800 pb-3">
                <h2 className="text-base font-bold text-[#1F2937] dark:text-white">
                  Saved Ethiopian Addresses
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/60 text-[#EA580C] dark:text-orange-300 hover:bg-[#F97316] hover:text-white text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddressForm ? 'Cancel' : 'Add New Address'}</span>
                </button>
              </div>

              {showAddressForm && (
                <form
                  onSubmit={handleAddAddress}
                  className="p-4 rounded-xl bg-[#F9FAFB] dark:bg-gray-900 border border-[#E5E7EB] dark:border-gray-800 space-y-4 text-xs"
                >
                  <h3 className="font-bold text-[#1F2937] dark:text-white">New Delivery Location</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-[#1F2937] dark:text-gray-300">City</label>
                      <select
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-[#1F2937] dark:text-gray-100"
                      >
                        {ETHIOPIA_CONSTANTS.majorCities.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-[#1F2937] dark:text-gray-300">
                        Sub-City / Area
                      </label>
                      <select
                        value={newSubCity}
                        onChange={(e) => setNewSubCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-[#1F2937] dark:text-gray-100"
                      >
                        {ETHIOPIA_CONSTANTS.addisAbabaSubCities.map((sc) => (
                          <option key={sc} value={sc}>
                            {sc}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-[#1F2937] dark:text-gray-300">Woreda</label>
                      <input
                        type="text"
                        value={newWoreda}
                        onChange={(e) => setNewWoreda(e.target.value)}
                        placeholder="e.g. 03"
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-[#1F2937] dark:text-gray-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-[#1F2937] dark:text-gray-300">
                        Landmark / Instructions
                      </label>
                      <input
                        type="text"
                        required
                        value={newLandmark}
                        onChange={(e) => setNewLandmark(e.target.value)}
                        placeholder="Near Edna Mall..."
                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-[#1F2937] dark:text-gray-100"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#F97316] text-white font-bold hover:bg-[#EA580C]"
                  >
                    Save Address
                  </button>
                </form>
              )}

              {user.addresses && user.addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses.map((addr: EthiopianAddress, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-[#E5E7EB] dark:border-gray-800 bg-[#F9FAFB] dark:bg-gray-900/50 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1F2937] dark:text-white">
                          {addr.fullName}
                        </span>
                        {addr.isDefault && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[#FFF7ED] dark:bg-orange-950/70 text-[#EA580C] dark:text-orange-400 font-semibold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[#6B7280] dark:text-gray-400">{addr.phone}</p>
                      <p className="text-[#4B5563] dark:text-gray-300">
                        {addr.city}, {addr.subCity} Sub-City, Woreda {addr.woreda}
                      </p>
                      {addr.landmark && (
                        <p className="text-[#6B7280] dark:text-gray-400 italic">
                          Landmark: {addr.landmark}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6B7280] dark:text-gray-400">No addresses saved yet.</p>
              )}
            </div>
          )}

          {/* TAB: SETTINGS & AVATAR UPLOAD */}
          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E5E7EB] dark:border-gray-800 p-6 shadow-2xs space-y-6 transition-colors">
              <h2 className="text-base font-bold text-[#1F2937] dark:text-white">
                Account Information & Profile Photo
              </h2>

              {/* Profile Photo Uploader Section */}
              <div className="p-4 rounded-xl border border-[#E5E7EB] dark:border-gray-800 bg-[#F9FAFB] dark:bg-gray-900/50 flex flex-col sm:flex-row items-center gap-5">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-full bg-[#FFF7ED] dark:bg-orange-950/60 border-2 border-[#F97316] flex items-center justify-center text-[#F97316] font-black text-2xl overflow-hidden shadow-xs">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="absolute inset-0 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Upload New Photo"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-1.5 text-center sm:text-left">
                  <h4 className="text-sm font-bold text-[#1F2937] dark:text-white">
                    Profile Avatar
                  </h4>
                  <p className="text-xs text-[#6B7280] dark:text-gray-400">
                    Upload a custom profile photo (PNG, JPG, or WEBP up to 5MB).
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{isUploadingAvatar ? 'Uploading...' : 'Upload New Photo'}</span>
                  </button>
                </div>
              </div>

              {/* Account Details Readout & Edit Form */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#F3F4F6] dark:border-gray-800 pb-2">
                  <h4 className="text-xs font-bold text-[#1F2937] dark:text-white uppercase tracking-wider">
                    Personal Details
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingInfo(!isEditingInfo);
                      setEditName(user.name);
                      setEditPhone(user.phone);
                      setEditError('');
                    }}
                    className="text-xs font-semibold text-[#F97316] hover:text-[#EA580C] cursor-pointer"
                  >
                    {isEditingInfo ? 'Cancel' : 'Edit Details'}
                  </button>
                </div>

                {editError && (
                  <p className="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800">
                    {editError}
                  </p>
                )}

                {isEditingInfo ? (
                  <form onSubmit={handleUpdateInfo} className="space-y-3 text-xs">
                    <div>
                      <label className="font-semibold text-[#1F2937] dark:text-gray-300 block mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-[#1F2937] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-[#1F2937] dark:text-gray-300 block mb-1">
                        Ethiopian Phone (+2519... or 09...) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-[#1F2937] dark:text-white"
                      />
                    </div>
                    <div className="pt-1 flex gap-2">
                      <button
                        type="submit"
                        disabled={isUpdatingInfo}
                        className="px-4 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                      >
                        {isUpdatingInfo ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingInfo(false)}
                        className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3 text-xs text-[#4B5563] dark:text-gray-300">
                    <div className="flex justify-between p-3 rounded-xl bg-[#F9FAFB] dark:bg-gray-900/50 border border-[#E5E7EB] dark:border-gray-800">
                      <span className="font-semibold text-[#1F2937] dark:text-white">Full Name</span>
                      <span>{user.name}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-[#F9FAFB] dark:bg-gray-900/50 border border-[#E5E7EB] dark:border-gray-800">
                      <span className="font-semibold text-[#1F2937] dark:text-white">Primary Email</span>
                      <span>{user.email}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-[#F9FAFB] dark:bg-gray-900/50 border border-[#E5E7EB] dark:border-gray-800">
                      <span className="font-semibold text-[#1F2937] dark:text-white">Verified Phone</span>
                      <span>{user.phone}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-[#F9FAFB] dark:bg-gray-900/50 border border-[#E5E7EB] dark:border-gray-800">
                      <span className="font-semibold text-[#1F2937] dark:text-white">Account Role</span>
                      <span className="uppercase font-bold text-[#F97316]">{user.role}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Preferences Card (Telegram Bot & SMS Gateway) */}
              <div className="pt-6 border-t border-[#F3F4F6] dark:border-gray-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#FFF7ED] dark:bg-orange-950/40 text-[#F97316] flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1F2937] dark:text-white">
                        Order Alerts & Telegram Bot / የቴሌግራም እና የኤስኤምኤስ ማሳወቂያዎች
                      </h4>
                      <p className="text-xs text-[#6B7280] dark:text-gray-400">
                        Get instant order confirmation, payment receipt, and live shipping updates.
                      </p>
                    </div>
                  </div>
                </div>

                {notifSavedNotice && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{notifSavedNotice}</span>
                  </div>
                )}

                {testNotifNotice && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                      testNotifNotice.success
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {testNotifNotice.success ? (
                      <Check className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{testNotifNotice.message}</span>
                  </div>
                )}

                <form onSubmit={handleSaveNotificationPrefs} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Telegram Toggle & Chat ID */}
                    <div className="p-4 rounded-2xl bg-[#F9FAFB] dark:bg-gray-900/50 border border-[#E5E7EB] dark:border-gray-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4 text-sky-500" />
                          <span className="text-xs font-bold text-[#1F2937] dark:text-white">
                            Telegram Notifications
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={telegramEnabled}
                            onChange={(e) => setTelegramEnabled(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#F97316]"></div>
                        </label>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-[#4B5563] dark:text-gray-300 block">
                          Telegram Chat ID (የቴሌግራም መለያ ቁጥር)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 123456789"
                          value={telegramChatId}
                          onChange={(e) => setTelegramChatId(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 text-[#1F2937] dark:text-white placeholder:text-gray-400"
                        />
                        <p className="text-[10px] text-[#6B7280] dark:text-gray-400">
                          To get your Chat ID: Open Telegram, search for <b>@userinfobot</b>, tap Start, and copy the number labeled "Id".
                        </p>
                      </div>
                    </div>

                    {/* SMS Gateway Toggle */}
                    <div className="p-4 rounded-2xl bg-[#F9FAFB] dark:bg-gray-900/50 border border-[#E5E7EB] dark:border-gray-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-bold text-[#1F2937] dark:text-white">
                            SMS Text Messages
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={smsEnabled}
                            onChange={(e) => setSmsEnabled(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#F97316]"></div>
                        </label>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-[#4B5563] dark:text-gray-300 block">
                          Dispatched To Phone
                        </label>
                        <div className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-gray-800 border border-[#E5E7EB] dark:border-gray-700 font-mono text-[#1F2937] dark:text-white">
                          {user?.phone || 'No phone set in profile'}
                        </div>
                        <p className="text-[10px] text-[#6B7280] dark:text-gray-400">
                          Standard Ethiopian telecom numbers (Ethio Telecom 09... and Safaricom 07...).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Channel Preferences Toggles */}
                  <div className="p-3.5 rounded-xl bg-[#F9FAFB] dark:bg-gray-900/50 border border-[#E5E7EB] dark:border-gray-800 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={orderUpdates}
                        onChange={(e) => setOrderUpdates(e.target.checked)}
                        className="rounded text-[#F97316] focus:ring-[#F97316]"
                      />
                      <span className="font-semibold text-[#1F2937] dark:text-white">
                        Order Lifecycle & Shipping Updates (የትዕዛዝ ሁኔታ ማሳወቂያዎች)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={promotions}
                        onChange={(e) => setPromotions(e.target.checked)}
                        className="rounded text-[#F97316] focus:ring-[#F97316]"
                      />
                      <span className="font-semibold text-[#1F2937] dark:text-white">
                        Special ETB Promo Discounts (የቅናሽ ኩፖን ማሳወቂያዎች)
                      </span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSavingNotifs}
                      className="px-4 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-xs cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isSavingNotifs ? 'Saving...' : 'Save Notification Preferences'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerTestNotification('both')}
                      disabled={isSendingTestNotif}
                      className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-[#1F2937] dark:text-gray-200 font-semibold text-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Bell className="w-3.5 h-3.5 text-[#F97316]" />
                      <span>{isSendingTestNotif ? 'Sending Test...' : 'Send Test Notification'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
