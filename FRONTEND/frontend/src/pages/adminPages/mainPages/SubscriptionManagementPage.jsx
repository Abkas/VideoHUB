import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, Users, Clock, Plus, Edit, Trash2, 
  TrendingUp, AlertCircle, CheckCircle, XCircle 
} from 'lucide-react';
import {
  getSubscriptionStats,
  getSubscriptionHistory,
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan
} from '../../../api/adminAPI/subscriptionApi';
import toast from 'react-hot-toast';

export default function SubscriptionManagementPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    duration_seconds: 1800, // 30 minutes default
    price: 0,
    currency: 'Rs.',
    tags: [],
    description: ''
  });
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  useEffect(() => {
    fetchData();
  }, [historyPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, plansData, historyData] = await Promise.all([
        getSubscriptionStats(),
        getSubscriptionPlans(),
        getSubscriptionHistory((historyPage - 1) * 20, 20)
      ]);
      setStats(statsData);
      setPlans(plansData.plans || []);
      setHistory(historyData.subscriptions || []);
      setHistoryTotal(historyData.total || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  const formatDurationInput = (seconds) => {
    if (seconds < 60) return { value: seconds, unit: 'seconds' };
    if (seconds < 3600) return { value: Math.floor(seconds / 60), unit: 'minutes' };
    if (seconds < 86400) return { value: Math.floor(seconds / 3600), unit: 'hours' };
    return { value: Math.floor(seconds / 86400), unit: 'days' };
  };

  const parseDurationInput = (value, unit) => {
    const multipliers = {
      seconds: 1,
      minutes: 60,
      hours: 3600,
      days: 86400
    };
    return Math.floor(value * (multipliers[unit] || 1));
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await updateSubscriptionPlan(editingPlan.id, planForm);
        toast.success('Plan updated successfully');
      } else {
        await createSubscriptionPlan(planForm);
        toast.success('Plan created successfully');
      }
      setShowPlanModal(false);
      setEditingPlan(null);
      setPlanForm({
        name: '',
        duration_seconds: 1800,
        price: 0,
        currency: 'Rs.',
        tags: [],
        description: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error(error.response?.data?.detail || 'Failed to save plan');
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name || '',
      duration_seconds: plan.duration_seconds || 1800,
      price: plan.price || 0,
      currency: plan.currency || 'Rs.',
      tags: plan.tags || [],
      description: plan.description || ''
    });
    setShowPlanModal(true);
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await deleteSubscriptionPlan(planId);
      toast.success('Plan deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete plan');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">Subscription Management</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-foreground">{stats?.active_users || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                <p className="text-2xl font-bold text-foreground">{stats?.total_subscriptions || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold text-foreground">{stats?.expired_subscriptions || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Section */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Subscription Plans</h2>
            <button
              onClick={() => {
                setEditingPlan(null);
                setPlanForm({
                  name: '',
                  duration_seconds: 1800,
                  price: 0,
                  currency: 'Rs.',
                  tags: [],
                  description: ''
                });
                setShowPlanModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Create Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{formatDuration(plan.duration_seconds)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-foreground" />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
                <p className="text-lg font-bold text-primary mb-2">
                  {plan.currency} {plan.price}
                </p>
                {plan.tags && plan.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {plan.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Subscription History */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Subscription History</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 text-sm font-medium text-muted-foreground">User ID</th>
                  <th className="text-left p-2 text-sm font-medium text-muted-foreground">Plan</th>
                  <th className="text-left p-2 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-2 text-sm font-medium text-muted-foreground">Expires At</th>
                  <th className="text-left p-2 text-sm font-medium text-muted-foreground">Created</th>
                </tr>
              </thead>
              <tbody>
                {history.map((sub) => (
                  <tr key={sub.id} className="border-b border-border hover:bg-secondary/50">
                    <td className="p-2 text-foreground">{sub.user_id}</td>
                    <td className="p-2 text-foreground">{sub.plan_name || 'N/A'}</td>
                    <td className="p-2">
                      {sub.is_active ? (
                        <span className="inline-flex items-center gap-1 text-success">
                          <CheckCircle className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-destructive">
                          <XCircle className="w-4 h-4" />
                          Expired
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-foreground">{formatDate(sub.expires_at)}</td>
                    <td className="p-2 text-foreground">{formatDate(sub.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {historyTotal > 20 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(historyPage - 1) * 20 + 1} to {Math.min(historyPage * 20, historyTotal)} of {historyTotal}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                  disabled={historyPage === 1}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setHistoryPage(p => p + 1)}
                  disabled={historyPage * 20 >= historyTotal}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Plan Modal */}
        {showPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-foreground mb-4">
                {editingPlan ? 'Edit Plan' : 'Create Plan'}
              </h3>
              <form onSubmit={handleCreatePlan} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Plan Name</label>
                  <input
                    type="text"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Duration</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formatDurationInput(planForm.duration_seconds).value}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        const unit = formatDurationInput(planForm.duration_seconds).unit;
                        setPlanForm({ ...planForm, duration_seconds: parseDurationInput(value, unit) });
                      }}
                      className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                      required
                      min="1"
                    />
                    <select
                      value={formatDurationInput(planForm.duration_seconds).unit}
                      onChange={(e) => {
                        const value = formatDurationInput(planForm.duration_seconds).value;
                        setPlanForm({ ...planForm, duration_seconds: parseDurationInput(value, e.target.value) });
                      }}
                      className="px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                    >
                      <option value="seconds">Seconds</option>
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Price</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={planForm.currency}
                      onChange={(e) => setPlanForm({ ...planForm, currency: e.target.value })}
                      className="w-20 px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                      placeholder="Rs."
                    />
                    <input
                      type="number"
                      value={planForm.price}
                      onChange={(e) => setPlanForm({ ...planForm, price: parseFloat(e.target.value) || 0 })}
                      className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={planForm.tags.join(', ')}
                    onChange={(e) => setPlanForm({ ...planForm, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                    placeholder="Most Popular, Loved"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                  <textarea
                    value={planForm.description}
                    onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground"
                    rows="3"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {editingPlan ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPlanModal(false);
                      setEditingPlan(null);
                    }}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
