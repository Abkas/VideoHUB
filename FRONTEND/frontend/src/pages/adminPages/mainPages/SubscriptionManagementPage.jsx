import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllSubscriptions,
  getSubscriptionStats,
  extendSubscription,
  createSubscription,
  deleteSubscription,
  updateSubscription,
} from '../../../api/adminAPI/subscriptionApi';
import toast from 'react-hot-toast';
import {
  Crown, Users, Clock, DollarSign,
  Search, CheckCircle, Plus, ArrowLeft, Shield, AlertCircle
} from 'lucide-react';
import SubscriptionCard from '../subPages/SubscriptionCard';

export default function SubscriptionManagementPage() {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [extendDays, setExtendDays] = useState(30);
  const [editSubscription, setEditSubscription] = useState({
    subscription_name: '',
    plan: 'basic',
    duration_value: 1,
    duration_unit: 'month',
    status: 'active',
    currency: 'INR',
    custom_price: '',
    description: ''
  });
  const [newSubscription, setNewSubscription] = useState({
    subscription_name: '',
    plan: 'basic',
    duration_value: 1,
    duration_unit: 'month',
    status: 'active',
    currency: 'INR',
    custom_price: '',
    description: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subscriptionsData, statsData] = await Promise.all([
        getAllSubscriptions({
          skip: (page - 1) * 20,
          limit: 20,
          status: statusFilter || undefined,
          plan: planFilter || undefined,
          search: searchTerm || undefined
        }),
        getSubscriptionStats()
      ]);

      setSubscriptions(subscriptionsData.subscriptions);
      setTotalPages(Math.ceil(subscriptionsData.total / 20));
      setStats(statsData);
    } catch (error) {
      toast.error(error.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, planFilter, searchTerm]);

  const handleExtendSubscription = async () => {
    if (!selectedSubscription) return;

    try {
      await extendSubscription(selectedSubscription.id, extendDays);
      toast.success(`Subscription extended by ${extendDays} days`);
      setShowExtendModal(false);
      setSelectedSubscription(null);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to extend subscription');
    }
  };

  const handleCreateSubscription = async () => {
    if (!newSubscription.subscription_name) {
      toast.error('Please enter a Subscription Name');
      return;
    }

    try {
      await createSubscription(newSubscription);
      toast.success('Subscription plan created successfully');
      setShowCreateModal(false);
      setNewSubscription({
        subscription_name: '',
        plan: 'basic',
        duration_value: 1,
        duration_unit: 'month',
        status: 'active',
        currency: 'INR',
        custom_price: '',
        description: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to create subscription');
    }
  };

  const handleDeleteSubscription = async (subscriptionId) => {
    setSelectedSubscription(subscriptionId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteSubscription(selectedSubscription);
      toast.success('Subscription deleted successfully');
      setShowDeleteModal(false);
      setSelectedSubscription(null);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete subscription');
    }
  };

  const handleEditClick = (subscription) => {
    setEditSubscription({
      id: subscription.id,
      subscription_name: subscription.subscription_name,
      plan: subscription.plan,
      duration_value: subscription.duration_value,
      duration_unit: subscription.duration_unit,
      status: subscription.status,
      currency: subscription.currency,
      custom_price: subscription.price,
      description: subscription.description || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateSubscription = async () => {
    if (!editSubscription.subscription_name) {
      toast.error('Please enter a Subscription Name');
      return;
    }

    try {
      const { id, ...updateData } = editSubscription;
      await updateSubscription(id, updateData);
      toast.success('Subscription plan updated successfully');
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to update subscription');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-900 text-green-300',
      trial: 'bg-blue-900 text-blue-300',
      expired: 'bg-red-900 text-red-300',
      cancelled: 'bg-gray-800 text-gray-300',
      pending: 'bg-yellow-900 text-yellow-300'
    };
    return badges[status] || 'bg-gray-800 text-gray-300';
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

  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount && amount !== 0) return 'N/A';
    const symbols = { INR: '₹', NPR: 'Rs.', USD: '$' };
    return `${symbols[currency] || '$'}${Number(amount).toFixed(2)}`;
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold text-foreground">Admin Panel</span>
            </div>
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Subscription Plans</h1>
            <p className="text-muted-foreground">Create and manage subscription plan templates</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Create Plan</span>
          </button>
        </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-foreground">{stats.total_subscriptions}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Subscriptions</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-2xl font-bold text-green-400">{stats.active_subscriptions}</span>
            </div>
            <p className="text-sm text-muted-foreground">Active Subscriptions</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">{stats.trial_subscriptions}</span>
            </div>
            <p className="text-sm text-muted-foreground">Trial Subscriptions</p>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">{formatCurrency(stats.monthly_revenue)}</span>
            </div>
            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Plans</option>
            <option value="free">Free</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
            <option value="premium_plus">Premium Plus</option>
          </select>
        </div>
      </div>

      {/* Subscription Plans Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions.length === 0 ? (
          <div className="col-span-full bg-card border border-border rounded-lg p-8 text-center">
            <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No subscription plans found</p>
            <p className="text-sm text-muted-foreground mt-2">Create your first plan to get started</p>
          </div>
        ) : (
          subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              formatCurrency={formatCurrency}
              getPlanColor={getPlanColor}
              getStatusBadge={getStatusBadge}
              onDelete={handleDeleteSubscription}
              onEdit={handleEditClick}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 bg-card border border-border rounded-lg px-4 py-3">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 bg-secondary text-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
      </main>

      {/* Extend Modal */}
      {showExtendModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-foreground mb-4">Extend Subscription</h2>
            <p className="text-muted-foreground mb-4">
              Extend subscription for User ID: <span className="text-foreground font-medium">{selectedSubscription.user_id}</span>
            </p>
            <div className="mb-4">
              <label className="block text-sm text-muted-foreground mb-2">Number of Days</label>
              <input
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(parseInt(e.target.value))}
                min="1"
                max="365"
                className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowExtendModal(false);
                  setSelectedSubscription(null);
                }}
                className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Cancel
              </button>
              <button
                onClick={handleExtendSubscription}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Extend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Subscription Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground mb-4">Create Subscription Plan</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Subscription Name *</label>
                <input
                  type="text"
                  value={newSubscription.subscription_name}
                  onChange={(e) => setNewSubscription({ ...newSubscription, subscription_name: e.target.value })}
                  placeholder="e.g., Premium Monthly Plan"
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Plan Type *</label>
                <select
                  value={newSubscription.plan}
                  onChange={(e) => setNewSubscription({ ...newSubscription, plan: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="premium_plus">Premium Plus</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Duration *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={newSubscription.duration_value}
                    onChange={(e) => setNewSubscription({ ...newSubscription, duration_value: parseInt(e.target.value) || 1 })}
                    placeholder="1"
                    className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <select
                    value={newSubscription.duration_unit}
                    onChange={(e) => setNewSubscription({ ...newSubscription, duration_unit: e.target.value })}
                    className="w-32 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="hour">Hour(s)</option>
                    <option value="day">Day(s)</option>
                    <option value="month">Month(s)</option>
                    <option value="year">Year(s)</option>
                  </select>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Subscription will be valid for {newSubscription.duration_value} {newSubscription.duration_unit}(s)
                </p>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Status *</label>
                <select
                  value={newSubscription.status}
                  onChange={(e) => setNewSubscription({ ...newSubscription, status: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="trial">Trial</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Currency *</label>
                <select
                  value={newSubscription.currency}
                  onChange={(e) => setNewSubscription({ ...newSubscription, currency: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="INR">🇮🇳 INR (Indian Rupee)</option>
                  <option value="NPR">🇳🇵 NPR (Nepali Rupee)</option>
                  <option value="USD">🌍 USD (US Dollar)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Custom Price (Optional)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newSubscription.custom_price}
                  onChange={(e) => setNewSubscription({ ...newSubscription, custom_price: e.target.value })}
                  placeholder="Leave empty to use default plan pricing"
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Default prices: Free=0, Basic={newSubscription.currency === 'INR' ? '₹99' : newSubscription.currency === 'NPR' ? 'Rs.200' : '$1.99'}, 
                  Premium={newSubscription.currency === 'INR' ? '₹299' : newSubscription.currency === 'NPR' ? 'Rs.500' : '$4.99'}, 
                  Premium+={newSubscription.currency === 'INR' ? '₹499' : newSubscription.currency === 'NPR' ? 'Rs.800' : '$7.99'}
                </p>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Description</label>
                <textarea
                  value={newSubscription.description}
                  onChange={(e) => setNewSubscription({ ...newSubscription, description: e.target.value })}
                  placeholder="Enter subscription details or notes..."
                  rows="3"
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-300">
                  <strong>Note:</strong> This will create a subscription plan card that users can purchase. Pricing will be calculated based on the plan type and duration.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewSubscription({
                    subscription_name: '',
                    plan: 'basic',
                    duration_value: 1,
                    duration_unit: 'month',
                    status: 'active',
                    currency: 'INR',
                    custom_price: '',
                    description: ''
                  });
                }}
                className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubscription}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Create Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subscription Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground mb-4">Edit Subscription Plan</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Subscription Name *</label>
                <input
                  type="text"
                  value={editSubscription.subscription_name}
                  onChange={(e) => setEditSubscription({ ...editSubscription, subscription_name: e.target.value })}
                  placeholder="e.g., Premium Monthly Plan"
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Plan Type *</label>
                <select
                  value={editSubscription.plan}
                  onChange={(e) => setEditSubscription({ ...editSubscription, plan: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="premium_plus">Premium Plus</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Duration *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={editSubscription.duration_value}
                    onChange={(e) => setEditSubscription({ ...editSubscription, duration_value: parseInt(e.target.value) || 1 })}
                    placeholder="1"
                    className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <select
                    value={editSubscription.duration_unit}
                    onChange={(e) => setEditSubscription({ ...editSubscription, duration_unit: e.target.value })}
                    className="w-32 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="hour">Hour(s)</option>
                    <option value="day">Day(s)</option>
                    <option value="month">Month(s)</option>
                    <option value="year">Year(s)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Status *</label>
                <select
                  value={editSubscription.status}
                  onChange={(e) => setEditSubscription({ ...editSubscription, status: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="trial">Trial</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Currency *</label>
                <select
                  value={editSubscription.currency}
                  onChange={(e) => setEditSubscription({ ...editSubscription, currency: e.target.value })}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="INR">🇮🇳 INR (Indian Rupee)</option>
                  <option value="NPR">🇳🇵 NPR (Nepali Rupee)</option>
                  <option value="USD">🌍 USD (US Dollar)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Custom Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editSubscription.custom_price}
                  onChange={(e) => setEditSubscription({ ...editSubscription, custom_price: e.target.value })}
                  placeholder="Leave empty to use default plan pricing"
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Description</label>
                <textarea
                  value={editSubscription.description}
                  onChange={(e) => setEditSubscription({ ...editSubscription, description: e.target.value })}
                  placeholder="Enter subscription details or notes..."
                  rows="3"
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditSubscription({
                    subscription_name: '',
                    plan: 'basic',
                    duration_value: 1,
                    duration_unit: 'month',
                    status: 'active',
                    currency: 'INR',
                    custom_price: '',
                    description: ''
                  });
                }}
                className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubscription}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Update Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-600/20 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Delete Subscription Plan</h2>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Are you sure you want to permanently delete this subscription plan? All associated data will be removed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedSubscription(null);
                }}
                className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
