import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSubscriptionById, cancelSubscription, extendSubscription, updateSubscription } from '../../../api/adminAPI/subscriptionApi';
import { getUserDetails } from '../../../api/adminAPI/adminApi';
import toast from 'react-hot-toast';
import {
  ArrowLeft, User, CreditCard, Calendar, Clock, DollarSign,
  CheckCircle, XCircle, Edit2, Save, X, AlertCircle
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
