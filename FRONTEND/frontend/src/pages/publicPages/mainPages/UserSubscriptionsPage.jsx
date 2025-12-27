import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Plus, AlertCircle, Check, Play, Zap, Shield, Star, Crown, Sparkles, Timer } from 'lucide-react';
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
      
      toast.success(previousCountdownRef.current > 0 ? 'Subscription extended successfully!' : 'Subscription purchased successfully!');
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

  // Get plan-specific styling and icons based on tags from backend
  const getPlanConfig = (plan) => {
    const tags = plan.tags || [];
    const planName = plan.name.toLowerCase().replace(' ', '_');

    // Check for specific tags first
    if (tags.includes('most popular')) {
      return {
        icon: Star,
        gradient: 'from-yellow-500/10 to-yellow-600/5',
        borderColor: 'border-yellow-500/30',
        hoverBorder: 'hover:border-yellow-500/60',
        iconColor: 'text-yellow-500',
        badge: 'Most Popular'
      };
    }
    if (tags.includes('best value')) {
      return {
        icon: Shield,
        gradient: 'from-green-500/10 to-green-600/5',
        borderColor: 'border-green-500/30',
        hoverBorder: 'hover:border-green-500/60',
        iconColor: 'text-green-500',
        badge: 'Best Value'
      };
    }
    if (tags.includes('loved')) {
      return {
        icon: Sparkles,
        gradient: 'from-pink-500/10 to-pink-600/5',
        borderColor: 'border-pink-500/30',
        hoverBorder: 'hover:border-pink-500/60',
        iconColor: 'text-pink-500',
        badge: 'Loved'
      };
    }

    // Fallback based on plan name
    const configs = {
      'half-hour': {
        icon: Timer,
        gradient: 'from-blue-500/10 to-blue-600/5',
        borderColor: 'border-blue-500/30',
        hoverBorder: 'hover:border-blue-500/60',
        iconColor: 'text-blue-500',
        badge: null
      },
      'hourly': {
        icon: Clock,
        gradient: 'from-green-500/10 to-green-600/5',
        borderColor: 'border-green-500/30',
        hoverBorder: 'hover:border-green-500/60',
        iconColor: 'text-green-500',
        badge: null
      },
      'day': {
        icon: Star,
        gradient: 'from-purple-500/10 to-purple-600/5',
        borderColor: 'border-purple-500/30',
        hoverBorder: 'hover:border-purple-500/60',
        iconColor: 'text-purple-500',
        badge: null
      },
      'weekly': {
        icon: Crown,
        gradient: 'from-yellow-500/10 to-yellow-600/5',
        borderColor: 'border-yellow-500/30',
        hoverBorder: 'hover:border-yellow-500/60',
        iconColor: 'text-yellow-500',
        badge: null
      }
    };
    return configs[planName] || configs['30_min'];
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
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full mb-4 shadow-lg">
                  <Star className="w-10 h-10 text-primary-foreground" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Active Subscription</h2>
                <p className="text-lg text-muted-foreground">Enjoy premium access to all content</p>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Play className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <h3 className="font-bold text-foreground">Watch all videos ad-free</h3>
                  </div>
                  <p className="text-sm text-muted-foreground ml-11">Enjoy uninterrupted viewing experience</p>
                </div>

                <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Zap className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <h3 className="font-bold text-foreground">Unlimited video access</h3>
                  </div>
                  <p className="text-sm text-muted-foreground ml-11">Access our entire library anytime</p>
                </div>

                <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Shield className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <h3 className="font-bold text-foreground">HD quality playback</h3>
                  </div>
                  <p className="text-sm text-muted-foreground ml-11">Crystal clear video in high definition</p>
                </div>

                <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-4 border border-primary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <h3 className="font-bold text-foreground">Priority support</h3>
                  </div>
                  <p className="text-sm text-muted-foreground ml-11">Get help faster with premium support</p>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="bg-gradient-to-r from-background to-primary/5 rounded-xl p-6 mb-6 border border-primary/10">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Time Remaining</p>
                  <div 
                    className={`text-6xl font-mono font-bold text-primary mb-3 transition-all duration-300 ${isOptimisticUpdate ? 'scale-110 animate-pulse' : ''}`}
                  >
                    {formatCountdown(countdown)}
                  </div>
                  {isOptimisticUpdate && (
                    <p className="text-xs text-primary mb-2 animate-pulse font-medium">
                      Updating subscription...
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
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
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  Extend Subscription
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
                Your subscription has expired. Please contact support to renew your subscription.
              </p>
            </div>
          )}
        </div>

        {/* Available Plans Section */}
        {plans.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <div className="text-center flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-2">Available Plans</h2>
                <p className="text-muted-foreground">Choose a plan to extend or start your subscription</p>
              </div>
              <button
                onClick={() => {
                  fetchPlans();
                  toast.success('Plans refreshed');
                }}
                className="ml-4 p-2 hover:bg-secondary rounded-lg transition-colors"
                title="Refresh plans"
              >
                <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {plans.slice(0, 2).map((plan) => {
                const config = getPlanConfig(plan);
                const Icon = config.icon;
                const isPopular = config.badge === 'Most Popular';

                return (
                  <div
                    key={plan.plan_id}
                    className={`relative bg-gradient-to-br ${config.gradient} border ${config.borderColor} rounded-2xl p-6 hover:shadow-2xl ${config.hoverBorder} transition-all duration-500 group hover:-translate-y-2 hover:scale-105 overflow-hidden`}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full translate-y-12 -translate-x-12"></div>
                    </div>

                    {/* Plan Icon */}
                    <div className="relative z-10 text-center mb-4">
                      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/20 mb-3 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                        <Icon className={`w-7 h-7 ${config.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                      </div>
                    </div>

                    {/* Plan Header */}
                    <div className="relative z-10 text-center mb-4">
                      <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">{plan.name}</h3>
                      {config.badge && (
                        <div className="inline-flex items-center justify-center mb-2">
                          <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                            config.badge === 'Most Popular' 
                              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                              : config.badge === 'Best Value'
                              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                              : 'bg-gradient-to-r from-pink-500 to-pink-600 text-white'
                          }`}>
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              {config.badge}
                            </div>
                          </div>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground font-medium">{plan.duration_display}</p>
                    </div>

                    {/* Price */}
                    <div className="relative z-10 text-center mb-6">
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20 group-hover:border-primary/40 transition-all duration-300">
                        <div className="flex items-baseline justify-center gap-1 mb-1">
                          <span className="text-4xl font-bold text-primary">{plan.currency}</span>
                          <span className="text-4xl font-bold text-primary">{plan.price}</span>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">one-time payment</p>
                      </div>
                    </div>

                    {/* Features Preview */}
                    <div className="relative z-10 space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm group-hover:translate-x-1 transition-transform duration-300">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-muted-foreground font-medium">Watch all videos ad-free</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm group-hover:translate-x-1 transition-transform duration-300 delay-75">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-muted-foreground font-medium">HD quality playback</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm group-hover:translate-x-1 transition-transform duration-300 delay-150">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-muted-foreground font-medium">Priority support</span>
                      </div>
                    </div>

                    {/* Subscribe Button */}
                    <div className="relative z-10">
                      <button
                        onClick={() => handleExtend(plan.plan_id)}
                        disabled={extending === plan.plan_id}
                        className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
                          isPopular
                            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                            : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground'
                        } hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group-hover:shadow-2xl`}
                      >
                        {extending === plan.plan_id ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Play className="w-4 h-4" />
                            Subscribe
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-2xl blur-xl"></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Other Plans - Below */}
            {plans.length > 2 && (
              <div className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {plans.slice(2).map((plan) => {
                    const config = getPlanConfig(plan);
                    const Icon = config.icon;
                    const isPopular = config.badge === 'Most Popular';

                    return (
                      <div
                        key={plan.plan_id}
                        className={`relative bg-gradient-to-br ${config.gradient} border ${config.borderColor} rounded-2xl p-6 hover:shadow-2xl ${config.hoverBorder} transition-all duration-500 group hover:-translate-y-2 hover:scale-105 overflow-hidden`}
                      >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -translate-y-16 translate-x-16"></div>
                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full translate-y-12 -translate-x-12"></div>
                        </div>

                        {/* Plan Icon */}
                        <div className="relative z-10 text-center mb-4">
                          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border border-white/20 mb-3 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                            <Icon className={`w-7 h-7 ${config.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                          </div>
                        </div>

                        {/* Plan Header */}
                        <div className="relative z-10 text-center mb-4">
                          <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">{plan.name}</h3>
                          {config.badge && (
                            <div className="inline-flex items-center justify-center mb-2">
                              <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                                config.badge === 'Most Popular' 
                                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                                  : config.badge === 'Best Value'
                                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                  : 'bg-gradient-to-r from-pink-500 to-pink-600 text-white'
                              }`}>
                                <div className="flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  {config.badge}
                                </div>
                              </div>
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground font-medium">{plan.duration_display}</p>
                        </div>

                        {/* Price */}
                        <div className="relative z-10 text-center mb-6">
                          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20 group-hover:border-primary/40 transition-all duration-300">
                            <div className="flex items-baseline justify-center gap-1 mb-1">
                              <span className="text-4xl font-bold text-primary">{plan.currency}</span>
                              <span className="text-4xl font-bold text-primary">{plan.price}</span>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">one-time payment</p>
                          </div>
                        </div>

                        {/* Features Preview */}
                        <div className="relative z-10 space-y-3 mb-6">
                          <div className="flex items-center gap-3 text-sm group-hover:translate-x-1 transition-transform duration-300">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span className="text-muted-foreground font-medium">Watch all videos ad-free</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm group-hover:translate-x-1 transition-transform duration-300 delay-75">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span className="text-muted-foreground font-medium">HD quality playback</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm group-hover:translate-x-1 transition-transform duration-300 delay-150">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-primary" />
                            </div>
                            <span className="text-muted-foreground font-medium">Priority support</span>
                          </div>
                        </div>

                        {/* Subscribe Button */}
                        <div className="relative z-10">
                          <button
                            onClick={() => handleExtend(plan.plan_id)}
                            disabled={extending === plan.plan_id}
                            className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl ${
                              isPopular
                                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                                : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground'
                            } hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group-hover:shadow-2xl`}
                          >
                            {extending === plan.plan_id ? (
                              <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                Processing...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Play className="w-4 h-4" />
                                Subscribe
                              </span>
                            )}
                          </button>
                        </div>

                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-2xl blur-xl"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

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
