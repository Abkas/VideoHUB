import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Plus, AlertCircle } from 'lucide-react';
import { getSubscriptionStatus, extendSubscription, getSubscriptionPlans } from '../../../api/publicAPI/subscriptionApi';
import { useAuthorizer } from '../../../Auth/Authorizer';
import NavigationBar from '../../../components/NavigationBar';
import toast from 'react-hot-toast';

export default function UserSubscriptionsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuthorizer();
  const [status, setStatus] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extending, setExtending] = useState(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [countdown, setCountdown] = useState(0);
  // Store previous countdown for optimistic update rollback
  const previousCountdownRef = useRef(0);
  // Track if we're in an optimistic update state
  const [isOptimisticUpdate, setIsOptimisticUpdate] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    if (!isAuthenticated) {
      toast.error('Please login to view your subscription');
      navigate('/login');
      return;
    }
    fetchStatus();
    fetchPlans();
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch subscription status
  const fetchStatus = async () => {
    try {
      const data = await getSubscriptionStatus();
      setStatus(data);
      // Set countdown from server (server time is source of truth)
      if (data.is_active && data.remaining_seconds > 0) {
        setCountdown(data.remaining_seconds);
      } else {
        setCountdown(0);
      }
    } catch (error) {
      console.error('Error fetching status:', error);
      if (!loading) {
        // Only show error if not initial load
        toast.error('Failed to load subscription status');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch plans for extend modal
  const fetchPlans = async () => {
    try {
      const response = await getSubscriptionPlans();
      setPlans(response.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  // Countdown timer effect - sync with server every 30 seconds
  useEffect(() => {
    if (!status?.is_active || countdown <= 0) {
      return;
    }

    // Sync with server every 30 seconds to stay accurate
    const syncInterval = setInterval(() => {
      fetchStatus();
    }, 30000);

    // Update countdown every second
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Expired, refresh status
          fetchStatus();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(syncInterval);
      clearInterval(countdownInterval);
    };
  }, [status?.is_active]);

  // Format countdown to hh:mm:ss
  const formatCountdown = (seconds) => {
    if (seconds <= 0) return '00:00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleExtend = async (planId) => {
    // Find the plan from fetched plans to get duration_seconds
    const selectedPlan = plans.find(p => p.plan_id === planId);
    if (!selectedPlan || !selectedPlan.duration_seconds) {
      toast.error('Invalid plan selected');
      return;
    }

    const planDuration = selectedPlan.duration_seconds;

    // Store current countdown for potential rollback
    previousCountdownRef.current = countdown;
    
    // Optimistic update: immediately add the plan duration to current countdown
    // If subscription is expired (countdown is 0), start from the plan duration
    // Otherwise, add to existing time
    const newCountdown = countdown > 0 ? countdown + planDuration : planDuration;
    setCountdown(newCountdown);
    setIsOptimisticUpdate(true);
    
    // Update status optimistically
    setStatus(prev => ({
      ...prev,
      is_active: true,
      remaining_seconds: newCountdown
    }));

    try {
      setExtending(planId);
      
      // Make API call
      const result = await extendSubscription(planId);
      
      // Update with server response (source of truth)
      if (result.remaining_seconds > 0) {
        setCountdown(result.remaining_seconds);
        setStatus(prev => ({
          ...prev,
          ...result,
          is_active: true
        }));
      }
      
      toast.success('Subscription extended successfully!');
      setShowExtendModal(false);
      
      // Refresh status to ensure sync
      await fetchStatus();
    } catch (error) {
      console.error('Error extending subscription:', error);
      
      // Rollback optimistic update on error
      setCountdown(previousCountdownRef.current);
      setStatus(prev => ({
        ...prev,
        is_active: prev?.is_active || false,
        remaining_seconds: previousCountdownRef.current
      }));
      
      toast.error(error.response?.data?.detail || 'Failed to extend subscription');
    } finally {
      setExtending(null);
      setIsOptimisticUpdate(false);
    }
  };

  // Show loading while auth is checking or subscription is loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              {authLoading ? 'Checking authentication...' : 'Loading subscription...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isActive = status?.is_active && countdown > 0;

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">My Subscription</h1>

        {/* Subscription Status Card */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-lg mb-6">
          {isActive ? (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Active Subscription</h2>
                <p className="text-muted-foreground">Watch all videos ad-free</p>
              </div>

              {/* Countdown Timer */}
              <div className="bg-background rounded-lg p-6 mb-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Time Remaining</p>
                  <div 
                    className={`text-5xl font-mono font-bold text-primary mb-2 transition-all duration-300 ${
                      isOptimisticUpdate ? 'scale-110 animate-pulse' : ''
                    }`}
                  >
                    {formatCountdown(countdown)}
                  </div>
                  {isOptimisticUpdate && (
                    <p className="text-xs text-primary mb-1 animate-pulse">
                      Updating...
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {status.expires_at
                      ? `Expires: ${new Date(status.expires_at).toLocaleString()}`
                      : ''}
                  </p>
                </div>
              </div>

              {/* Extend Button */}
              <div className="text-center">
                <button
                  onClick={() => setShowExtendModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-5 h-5" />
                  Extend Time
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Subscription Expired</h2>
              <p className="text-muted-foreground mb-6">
                Your subscription has expired. Subscribe to continue watching ad-free.
              </p>
              <button
                onClick={() => navigate('/subscriptions/plans')}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                View Plans
              </button>
            </div>
          )}
        </div>

        {/* Extend Modal */}
        {showExtendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">Extend Subscription</h3>
                <button
                  onClick={() => setShowExtendModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.plan_id}
                    className="border border-border rounded-lg p-4 hover:border-primary transition-colors"
                  >
                    <h4 className="font-semibold text-foreground mb-2">{plan.name}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{plan.duration_display}</p>
                    <p className="text-lg font-bold text-foreground mb-4">
                      {plan.currency} {plan.price}
                    </p>
                    <button
                      onClick={() => handleExtend(plan.plan_id)}
                      disabled={extending === plan.plan_id}
                      className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {extending === plan.plan_id ? 'Processing...' : `Extend ${plan.name}`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
