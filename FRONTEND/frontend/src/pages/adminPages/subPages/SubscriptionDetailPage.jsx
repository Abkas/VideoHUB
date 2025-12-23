import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubscriptionById, cancelSubscription, extendSubscription, updateSubscription } from '../../../api/adminAPI/subscriptionApi';
import { getUserDetails } from '../../../api/adminAPI/adminApi';
import toast from 'react-hot-toast';
import {
  ArrowLeft, User, CreditCard, Calendar, Clock, DollarSign,
  CheckCircle, XCircle, Edit2, Save, X, AlertCircle, Users
} from 'lucide-react';

export default function SubscriptionDetailPage() {
  const { subscriptionId } = useParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [extendDays, setExtendDays] = useState(30);
  const [showExtendModal, setShowExtendModal] = useState(false);
  
  // Mock data for subscribed users - TODO: Replace with API call
  const [subscribedUsers] = useState([
    {
      id: 1,
      user_id: 12345,
      username: 'john_doe',
      email: 'john@example.com',
      subscribed_at: new Date('2024-12-01T10:30:00'),
      expires_at: new Date('2025-01-01T10:30:00'),
    },
    {
      id: 2,
      user_id: 23456,
      username: 'jane_smith',
      email: 'jane@example.com',
      subscribed_at: new Date('2024-12-10T14:20:00'),
      expires_at: new Date('2025-01-10T14:20:00'),
    },
    {
      id: 3,
      user_id: 34567,
      username: 'bob_wilson',
      email: 'bob@example.com',
      subscribed_at: new Date('2024-12-15T09:15:00'),
      expires_at: new Date('2025-01-15T09:15:00'),
    },
    {
      id: 4,
      user_id: 45678,
      username: 'alice_brown',
      email: 'alice@example.com',
      subscribed_at: new Date('2024-12-18T16:45:00'),
      expires_at: new Date('2025-01-18T16:45:00'),
    },
    {
      id: 5,
      user_id: 56789,
      username: 'charlie_davis',
      email: 'charlie@example.com',
      subscribed_at: new Date('2024-12-20T11:00:00'),
      expires_at: new Date('2025-01-20T11:00:00'),
    },
  ]);

  // Filter states for subscribed users
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all'); // all, active, expired
  const [userSortBy, setUserSortBy] = useState('subscribed_desc'); // subscribed_desc, subscribed_asc, expires_desc, expires_asc, username_asc, username_desc

  useEffect(() => {
    fetchSubscriptionDetails();
  }, [subscriptionId]);

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);
      const subData = await getSubscriptionById(subscriptionId);
      setSubscription(subData);
      
      // Check if this is a subscription plan (has subscription_name) or user subscription (has user_id)
      if (subData.subscription_name) {
        // Subscription plan
        setEditData({
          status: subData.status,
          subscription_name: subData.subscription_name,
          plan: subData.plan,
          duration_value: subData.duration_value,
          duration_unit: subData.duration_unit,
          currency: subData.currency,
          custom_price: subData.price,
          description: subData.description || ''
        });
      } else {
        // User subscription
        setEditData({
          status: subData.status,
          auto_renew: subData.auto_renew
        });
        
        // Fetch user details if available
        if (subData.user_id) {
          try {
            const userData = await getUserDetails(subData.user_id);
            setUser(userData);
          } catch (err) {
            console.error('Failed to fetch user:', err);
          }
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load subscription');
      navigate('/admin/subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Transform editData for API (custom_price -> price)
      const dataToSend = { ...editData };
      if (dataToSend.custom_price !== undefined) {
        dataToSend.price = dataToSend.custom_price;
        delete dataToSend.custom_price;
      }
      
      await updateSubscription(subscriptionId, dataToSend);
      toast.success('Subscription updated successfully');
      setEditing(false);
      fetchSubscriptionDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to update subscription');
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;

    try {
      await cancelSubscription(subscriptionId, 'Admin cancelled');
      toast.success('Subscription cancelled successfully');
      fetchSubscriptionDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to cancel subscription');
    }
  };

  const handleExtend = async () => {
    try {
      await extendSubscription(subscriptionId, extendDays);
      toast.success(`Subscription extended by ${extendDays} days`);
      setShowExtendModal(false);
      fetchSubscriptionDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to extend subscription');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-400 bg-green-900/30',
      trial: 'text-blue-400 bg-blue-900/30',
      expired: 'text-red-400 bg-red-900/30',
      cancelled: 'text-gray-400 bg-gray-800/30',
      pending: 'text-yellow-400 bg-yellow-900/30'
    };
    return colors[status] || 'text-gray-400 bg-gray-800/30';
  };

  const getPlanColor = (plan) => {
    const colors = {
      free: 'text-gray-400',
      basic: 'text-blue-400',
      premium: 'text-purple-400',
      premium_plus: 'text-yellow-400'
    };
    return colors[plan] || 'text-gray-400';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount && amount !== 0) return 'N/A';
    const symbols = { INR: '₹', NPR: 'Rs.', USD: '$' };
    return `${symbols[currency] || '$'}${Number(amount).toFixed(2)}`;
  };

  const getTimeRemaining = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry - now;

    if (diff <= 0) {
      return { text: 'Expired', color: 'text-red-400', days: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 30) {
      return { text: `${days} days`, color: 'text-green-400', days };
    } else if (days > 7) {
      return { text: `${days} days`, color: 'text-yellow-400', days };
    } else if (days > 0) {
      return { text: `${days}d ${hours}h`, color: 'text-orange-400', days };
    } else {
      return { text: `${hours} hours`, color: 'text-red-400', days };
    }
  };

  // Filter and sort subscribed users
  const getFilteredAndSortedUsers = () => {
    let filtered = [...subscribedUsers];

    // Search filter
    if (userSearchTerm) {
      const searchLower = userSearchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.user_id.toString().includes(searchLower)
      );
    }

    // Status filter
    if (userStatusFilter === 'active') {
      filtered = filtered.filter(user => getTimeRemaining(user.expires_at).days > 0);
    } else if (userStatusFilter === 'expired') {
      filtered = filtered.filter(user => getTimeRemaining(user.expires_at).days <= 0);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (userSortBy) {
        case 'subscribed_desc':
          return new Date(b.subscribed_at) - new Date(a.subscribed_at);
        case 'subscribed_asc':
          return new Date(a.subscribed_at) - new Date(b.subscribed_at);
        case 'expires_desc':
          return new Date(b.expires_at) - new Date(a.expires_at);
        case 'expires_asc':
          return new Date(a.expires_at) - new Date(b.expires_at);
        case 'username_asc':
          return a.username.localeCompare(b.username);
        case 'username_desc':
          return b.username.localeCompare(a.username);
        default:
          return 0;
      }
    });

    return filtered;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">Subscription not found</p>
          <button
            onClick={() => navigate('/admin/subscriptions')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Back to Subscriptions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-[1280px] mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <button
              onClick={() => navigate('/admin/subscriptions')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Back to Subscriptions</span>
            </button>
            <div className="flex items-center gap-2">
              {!editing ? (
                <>
                  {!subscription.subscription_name && (
                    <button
                      onClick={() => setShowExtendModal(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={subscription.status === 'cancelled' || subscription.status === 'expired'}
                    >
                      <Clock className="w-4 h-4" />
                      <span className="hidden sm:inline">Extend</span>
                    </button>
                  )}
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  {!subscription.subscription_name && (
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={subscription.status === 'cancelled' || subscription.status === 'expired'}
                    >
                      <XCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Cancel</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      if (subscription.subscription_name) {
                        setEditData({
                          status: subscription.status,
                          subscription_name: subscription.subscription_name,
                          plan: subscription.plan,
                          duration_value: subscription.duration_value,
                          duration_unit: subscription.duration_unit,
                          currency: subscription.currency,
                          custom_price: subscription.price,
                          description: subscription.description || ''
                        });
                      } else {
                        setEditData({
                          status: subscription.status,
                          auto_renew: subscription.auto_renew
                        });
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-3 sm:px-4 md:px-6 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {subscription.subscription_name || 'Subscription Details'}
          </h1>
          <p className="text-sm text-muted-foreground">ID: {subscription.id}</p>
        </div>

        {/* Stats Cards - Only show for subscription plans */}
        {subscription.subscription_name && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Subscribers */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold text-foreground">{subscribedUsers.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Total Subscribers</p>
            </div>

            {/* Active Subscribers */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <span className="text-2xl font-bold text-green-400">
                  {subscribedUsers.filter(u => getTimeRemaining(u.expires_at).days > 0).length}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Active Subscribers</p>
            </div>

            {/* Total Revenue */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-yellow-400" />
                <span className="text-2xl font-bold text-yellow-400">
                  {formatCurrency(subscription.price * subscribedUsers.length, subscription.currency)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>

            {/* Monthly Revenue */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold text-purple-400">
                  {formatCurrency(
                    subscription.duration_unit === 'month' && subscription.duration_value === 1
                      ? subscription.price * subscribedUsers.filter(u => getTimeRemaining(u.expires_at).days > 0).length
                      : (subscription.price * subscribedUsers.filter(u => getTimeRemaining(u.expires_at).days > 0).length) / 
                        (subscription.duration_unit === 'year' ? subscription.duration_value * 12 : 
                         subscription.duration_unit === 'day' ? subscription.duration_value / 30 : 1),
                    subscription.currency
                  )}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
            </div>
          </div>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {subscription.subscription_name ? 'Plan Details' : 'Subscription Status'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                {editing ? (
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                ) : (
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                    {subscription.status}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Plan</p>
                {editing && subscription.subscription_name ? (
                  <select
                    value={editData.plan}
                    onChange={(e) => setEditData({ ...editData, plan: e.target.value })}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                  >
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="premium">Premium</option>
                    <option value="premium_plus">Premium Plus</option>
                  </select>
                ) : (
                  <p className={`text-lg font-semibold ${getPlanColor(subscription.plan)}`}>
                    {subscription.plan}
                  </p>
                )}
              </div>
              {subscription.subscription_name ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Duration</p>
                    {editing ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          value={editData.duration_value}
                          onChange={(e) => setEditData({ ...editData, duration_value: parseInt(e.target.value) || 1 })}
                          className="w-20 px-2 py-1 bg-secondary border border-border rounded text-foreground"
                        />
                        <select
                          value={editData.duration_unit}
                          onChange={(e) => setEditData({ ...editData, duration_unit: e.target.value })}
                          className="flex-1 px-2 py-1 bg-secondary border border-border rounded text-foreground"
                        >
                          <option value="hour">Hour(s)</option>
                          <option value="day">Day(s)</option>
                          <option value="month">Month(s)</option>
                          <option value="year">Year(s)</option>
                        </select>
                      </div>
                    ) : (
                      <p className="text-foreground">{subscription.duration_value} {subscription.duration_unit}(s)</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Currency</p>
                    {editing ? (
                      <select
                        value={editData.currency}
                        onChange={(e) => setEditData({ ...editData, currency: e.target.value })}
                        className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                      >
                        <option value="INR">INR</option>
                        <option value="NPR">NPR</option>
                        <option value="USD">USD</option>
                      </select>
                    ) : (
                      <p className="text-foreground">{subscription.currency}</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Billing Cycle</p>
                    <p className="text-foreground">{subscription.billing_cycle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Auto Renew</p>
                    {editing ? (
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editData.auto_renew}
                          onChange={(e) => setEditData({ ...editData, auto_renew: e.target.checked })}
                          className="mr-2"
                        />
                        <span className="text-foreground">{editData.auto_renew ? 'Enabled' : 'Disabled'}</span>
                      </label>
                    ) : (
                      <p className="text-foreground">{subscription.auto_renew ? 'Enabled' : 'Disabled'}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Payment Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                {editing && subscription.subscription_name ? (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editData.custom_price || ''}
                    onChange={(e) => setEditData({ ...editData, custom_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                    placeholder="Enter price"
                  />
                ) : (
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(subscription.price, subscription.currency)}
                  </p>
                )}
              </div>
              {subscription.final_price !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Final Price</p>
                  <p className="text-lg font-semibold text-green-400">
                    {formatCurrency(subscription.final_price, subscription.currency)}
                  </p>
                </div>
              )}
              {!editing && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Currency</p>
                  <p className="text-foreground">{subscription.currency}</p>
                </div>
              )}
              {subscription.discount_percentage !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Discount</p>
                  <p className="text-foreground">{subscription.discount_percentage}%</p>
                </div>
              )}
              {subscription.payment_gateway && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Payment Gateway</p>
                  <p className="text-foreground capitalize">{subscription.payment_gateway}</p>
                </div>
              )}
              {subscription.payment_method && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                  <p className="text-foreground capitalize">{subscription.payment_method}</p>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Important Dates
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground">Created At</span>
                <span className="text-foreground">{formatDate(subscription.created_at)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground">Started At</span>
                <span className="text-foreground">{formatDate(subscription.started_at)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-muted-foreground">Expires At</span>
                <span className="text-foreground font-medium">{formatDate(subscription.expires_at)}</span>
              </div>
              {subscription.next_billing_date && (
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <span className="text-muted-foreground">Next Billing</span>
                  <span className="text-foreground">{formatDate(subscription.next_billing_date)}</span>
                </div>
              )}
              {subscription.cancelled_at && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cancelled At</span>
                  <span className="text-red-400">{formatDate(subscription.cancelled_at)}</span>
                </div>
              )}
              {subscription.is_trial && subscription.trial_ends_at && (
                <div className="flex justify-between items-center bg-blue-900/20 p-3 rounded-lg">
                  <span className="text-blue-400">Trial Ends At</span>
                  <span className="text-blue-400 font-medium">{formatDate(subscription.trial_ends_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          {user && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                User Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="text-foreground font-medium">{user.username}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="text-foreground">{subscription.user_id}</p>
                </div>
                <button
                  onClick={() => navigate(`/admin/users/${subscription.user_id}`)}
                  className="w-full mt-4 px-4 py-2 bg-secondary text-foreground rounded-lg hover:opacity-90"
                >
                  View User Profile
                </button>
              </div>
            </div>
          )}

          {/* Trial Info */}
          {subscription.is_trial && (
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-blue-400">Trial Period</h3>
              </div>
              <p className="text-blue-300 text-sm">
                This subscription is currently in trial period.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Subscribed Users Section - Only show for subscription plans */}
      {subscription.subscription_name && (
        <div className="mt-6">
          <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Subscribed Users</h2>
              </div>
              <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                {getFilteredAndSortedUsers().length} of {subscribedUsers.length}
              </span>
            </div>

            {/* Filters */}
            <div className="bg-secondary/50 border border-border rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search username, email, or ID..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>

                {/* Status Filter */}
                <select
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="expired">Expired Only</option>
                </select>

                {/* Sort By */}
                <select
                  value={userSortBy}
                  onChange={(e) => setUserSortBy(e.target.value)}
                  className="px-4 py-2 bg-background border border-border rounded-lg text-foreground text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="subscribed_desc">Newest First</option>
                  <option value="subscribed_asc">Oldest First</option>
                  <option value="expires_desc">Expires Latest</option>
                  <option value="expires_asc">Expires Soonest</option>
                  <option value="username_asc">Username A-Z</option>
                  <option value="username_desc">Username Z-A</option>
                </select>
              </div>

              {/* Active Filters Info */}
              {(userSearchTerm || userStatusFilter !== 'all') && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">Active filters:</span>
                  {userSearchTerm && (
                    <button
                      onClick={() => setUserSearchTerm('')}
                      className="px-2 py-1 bg-primary/20 text-primary rounded text-xs hover:bg-primary/30 transition-colors"
                    >
                      Search: {userSearchTerm} ✕
                    </button>
                  )}
                  {userStatusFilter !== 'all' && (
                    <button
                      onClick={() => setUserStatusFilter('all')}
                      className="px-2 py-1 bg-primary/20 text-primary rounded text-xs hover:bg-primary/30 transition-colors capitalize"
                    >
                      {userStatusFilter} ✕
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setUserSearchTerm('');
                      setUserStatusFilter('all');
                    }}
                    className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Username</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Subscribed</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time Remaining</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredAndSortedUsers().map((subUser) => {
                    const timeRemaining = getTimeRemaining(subUser.expires_at);
                    return (
                      <tr 
                        key={subUser.id} 
                        className="border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/users/${subUser.user_id}`)}
                      >
                        <td className="py-3 px-4 text-sm text-foreground">#{subUser.user_id}</td>
                        <td className="py-3 px-4 text-sm text-foreground font-medium">{subUser.username}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{subUser.email}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDate(subUser.subscribed_at)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-sm font-semibold ${timeRemaining.color}`}>
                            {timeRemaining.text}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDate(subUser.expires_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {getFilteredAndSortedUsers().map((subUser) => {
                const timeRemaining = getTimeRemaining(subUser.expires_at);
                return (
                  <div 
                    key={subUser.id}
                    onClick={() => navigate(`/admin/users/${subUser.user_id}`)}
                    className="bg-secondary/50 border border-border rounded-lg p-4 hover:bg-secondary transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-foreground">{subUser.username}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">ID: #{subUser.user_id}</p>
                      </div>
                      <span className={`text-sm font-semibold ${timeRemaining.color}`}>
                        {timeRemaining.text}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="text-foreground truncate ml-2">{subUser.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subscribed:</span>
                        <span className="text-foreground">{new Date(subUser.subscribed_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expires:</span>
                        <span className="text-foreground">{new Date(subUser.expires_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {subscribedUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No users subscribed to this plan yet</p>
                <p className="text-sm text-muted-foreground mt-1">Users will appear here once they subscribe</p>
              </div>
            ) : getFilteredAndSortedUsers().length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                <p className="text-muted-foreground">No users match your filters</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
                <button
                  onClick={() => {
                    setUserSearchTerm('');
                    setUserStatusFilter('all');
                  }}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm"
                >
                  Clear Filters
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Extend Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-foreground mb-4">Extend Subscription</h2>
            <p className="text-muted-foreground mb-4">
              Current expiry: <span className="text-foreground font-medium">{formatDate(subscription.expires_at)}</span>
            </p>
            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-2">Number of Days</label>
              <input
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(parseInt(e.target.value))}
                min="1"
                max="365"
                className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExtendModal(false)}
                className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg hover:opacity-90"
              >
                Cancel
              </button>
              <button
                onClick={handleExtend}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                Extend
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}
