import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Grid, User, Settings, FileText, Shield, LogOut, Crown, Calendar, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { verifyToken } from '../../../api/publicAPI/userApi';
import { getAllMySubscriptions, cancelMySubscription, getMySubscriptionHistory } from '../../../api/publicAPI/subscriptionApi';
import SubscriptionCard from '../../../components/SubscriptionCard';
import toast from 'react-hot-toast';

export default function UserSubscriptionsPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [userData, setUserData] = useState(null);
  const [cancellingSubscription, setCancellingSubscription] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [subscriptionHistory, setSubscriptionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Verify user is logged in
      const { isValid, user } = await verifyToken();
      if (!isValid) {
        toast.error("Please login to view subscriptions");
        navigate("/login");
        return;
      }
      setUserData(user);

      // Fetch user's subscriptions
      try {
        const subscriptionsData = await getAllMySubscriptions();
        setUserSubscriptions(subscriptionsData.subscriptions || []);
      } catch (error) {
        console.error('Error fetching user subscriptions:', error);
        setUserSubscriptions([]);
      }

    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!confirm('Are you sure you want to cancel this subscription? You will lose access at the end of the billing period.')) {
      return;
    }

    try {
      setCancellingSubscription(subscriptionId);
      console.log('🗑️ Cancelling subscription:', subscriptionId);

      await cancelMySubscription(subscriptionId);
      console.log('✅ Subscription cancelled successfully');

      toast.success('Subscription cancelled successfully');

      // Refresh subscriptions
      const subscriptionsData = await getAllMySubscriptions();
      setUserSubscriptions(subscriptionsData.subscriptions || []);

    } catch (error) {
      console.error('❌ Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setCancellingSubscription(null);
    }
  };

  const handleToggleHistory = async () => {
    if (!showHistory && subscriptionHistory.length === 0) {
      // Fetch history if not already loaded
      try {
        setLoadingHistory(true);
        console.log('📚 Fetching subscription history...');

        const historyData = await getMySubscriptionHistory();
        console.log('📖 Subscription history:', historyData);

        setSubscriptionHistory(historyData.subscriptions || []);
      } catch (error) {
        console.error('❌ Error fetching subscription history:', error);
        toast.error('Failed to load subscription history');
      } finally {
        setLoadingHistory(false);
      }
    }
    setShowHistory(!showHistory);
  };

  const getCurrentPlanName = () => {
    const activeSub = userSubscriptions.find(sub => sub.status === 'active');
    if (!activeSub) return null;
    return activeSub.plan_name?.toLowerCase().replace(' ', '_') || null;
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'expired':
        return <Clock className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">VH</span>
            </div>
            <span className="font-bold text-foreground">StreamHub</span>
          </Link>
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        </header>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading subscriptions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">VH</span>
          </div>
          <span className="font-bold text-foreground">VideoHUB</span>
        </Link>
        <button
          onClick={() => setMenuOpen(true)}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
      </header>

      {/* Slide-in Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-lg font-bold text-primary">Menu</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <nav className="p-2">
              <Link to="/" className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors">
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>
              <Link to="/browse" className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors">
                <Grid className="w-5 h-5" />
                <span>Browse</span>
              </Link>
              <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors">
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <Link to="/subscriptions" className="flex items-center gap-3 px-4 py-3 bg-secondary text-foreground rounded-lg">
                <Crown className="w-5 h-5" />
                <span>Subscriptions</span>
              </Link>
              <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
                <span>Account Settings</span>
              </Link>
              <div className="my-2 border-t border-border" />
              <Link to="/guidelines" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
                <Shield className="w-5 h-5" />
                <span>Community Guidelines</span>
              </Link>
              <Link to="/terms" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
                <FileText className="w-5 h-5" />
                <span>Terms of Service</span>
              </Link>
              <Link to="/privacy" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
                <FileText className="w-5 h-5" />
                <span>Privacy Policy</span>
              </Link>
              <div className="my-2 border-t border-border" />
              <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-destructive hover:bg-secondary rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">My Subscriptions</h1>
          <p className="text-muted-foreground">Manage your subscription plans and view your history</p>
        </div>

        {/* My Subscriptions */}
        <div className="mb-8">
          {userSubscriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userSubscriptions.map((subscription) => {
                // Transform subscription data to match SubscriptionCard format
                const planData = {
                  name: subscription.plan_name || subscription.name || 'Premium',
                  display_name: subscription.plan_name || subscription.name || 'Premium Plan',
                  description: `Active subscription - ${subscription.status || 'Active'}`,
                  features: [
                    `Status: ${subscription.status || 'Active'}`,
                    `Duration: ${subscription.billing_cycle || subscription.duration || 'Monthly'}`,
                    `Payment: ${subscription.currency === 'NPR' ? 'Rs.' : '₹'}${subscription.amount || '999'}`,
                    `Started: ${formatDate(subscription.created_at || subscription.start_date)}`
                  ],
                  price_inr: subscription.amount || 999,
                  price_npr: subscription.amount || 999,
                  price_usd: subscription.amount || 999
                };

                return (
                  <div key={subscription.id || subscription._id} className="relative">
                    <SubscriptionCard
                      plan={planData}
                      currency={subscription.currency || 'INR'}
                      billingCycle={subscription.billing_cycle || 'monthly'}
                      onSelect={() => {}}
                      currentPlan={subscription.status === 'active' ? subscription.plan_name?.toLowerCase().replace(' ', '_') : null}
                      isPopular={subscription.status === 'active'}
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button className="px-2 py-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded text-xs transition-colors">
                        View Details
                      </button>
                      {subscription.status === 'active' && (
                        <button
                          onClick={() => handleCancelSubscription(subscription.id || subscription._id)}
                          disabled={cancellingSubscription === (subscription.id || subscription._id)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors disabled:opacity-50"
                        >
                          {cancellingSubscription === (subscription.id || subscription._id) ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <Crown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Subscriptions Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't purchased any subscriptions yet. Visit the pricing page to get started.
              </p>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                <Crown className="w-4 h-4" />
                View Plans
              </Link>
            </div>
          )}
        </div>

        {/* History Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={handleToggleHistory}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <Calendar className="w-4 h-4" />
            {showHistory ? 'Hide History' : 'View Subscription History'}
          </button>
        </div>

        {/* Subscription History */}
        {showHistory && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Subscription History</h2>

            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Loading history...</span>
              </div>
            ) : subscriptionHistory.length > 0 ? (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Plan</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Start Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-foreground">End Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptionHistory.map((subscription) => (
                        <tr key={subscription.id || subscription._id} className="border-t border-border">
                          <td className="px-4 py-3 text-sm text-foreground">
                            {subscription.plan_name || subscription.name || 'Unknown'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                              subscription.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {subscription.status || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {subscription.currency === 'NPR' ? 'Rs.' : '₹'}{subscription.amount || '0'}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {formatDate(subscription.created_at || subscription.start_date)}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {subscription.expires_at ? formatDate(subscription.expires_at) : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-6 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No History Available</h3>
                <p className="text-muted-foreground">
                  Your subscription history will appear here once you have past subscriptions.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}