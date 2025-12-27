import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Check, Sparkles, Heart } from 'lucide-react';
import { getSubscriptionPlans, subscribe } from '../../../api/publicAPI/subscriptionApi';
import { useAuthorizer } from '../../../Auth/Authorizer';
import NavigationBar from '../../../components/NavigationBar';
import toast from 'react-hot-toast';

export default function SubscriptionPlansPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuthorizer();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    if (!isAuthenticated) {
      toast.error('Please login to view subscription plans');
      navigate('/login');
      return;
    }
    fetchPlans();
  }, [isAuthenticated, authLoading, navigate]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await getSubscriptionPlans();
      setPlans(response.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    if (!isAuthenticated) {
      toast.error('Please login to subscribe');
      navigate('/login');
      return;
    }

    try {
      setSubscribing(planId);
      await subscribe(planId);
      toast.success('Subscription activated successfully!');
      navigate('/subscriptions');
    } catch (error) {
      console.error('Error subscribing:', error);
      toast.error(error.response?.data?.detail || 'Failed to subscribe');
    } finally {
      setSubscribing(null);
    }
  };

  const getTagIcon = (tag) => {
    if (tag === 'Most Popular') return <Sparkles className="w-4 h-4" />;
    if (tag === 'Loved') return <Heart className="w-4 h-4" />;
    return null;
  };

  // Show loading while auth is checking or plans are loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationBar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              {authLoading ? 'Checking authentication...' : 'Loading plans...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock unlimited access to all videos with an ad-free experience. 
            Select the perfect plan for your viewing needs.
          </p>
        </div>

        {/* Plans Grid */}
        {plans.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">No subscription plans available at the moment.</p>
            <p className="text-muted-foreground text-sm mt-2">Please check back later or contact support.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {plans.map((plan) => {
              // Highlight plans with tags like "Most Popular" or "Loved"
              const isHighlighted = plan.tags && (plan.tags.includes('Most Popular') || plan.tags.includes('Loved'));
              const isSubscribing = subscribing === plan.plan_id;

              return (
                <div
                  key={plan.plan_id}
                  className={`relative bg-card border rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                    isHighlighted 
                      ? 'border-primary border-2 shadow-xl ring-2 ring-primary/20' 
                      : 'border-border shadow-lg hover:border-primary/50'
                  }`}
                >
                  {/* Highlight Badge */}
                  {isHighlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded-full shadow-lg">
                        <Sparkles className="w-3 h-3" />
                        {plan.tags.find(t => t === 'Most Popular' || t === 'Loved')}
                      </span>
                    </div>
                  )}

                  {/* Tags */}
                  {plan.tags && plan.tags.length > 0 && !isHighlighted && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {plan.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full"
                        >
                          {getTagIcon(tag)}
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Plan Name */}
                  <h3 className={`text-2xl font-bold text-foreground mb-3 ${isHighlighted ? 'text-primary' : ''}`}>
                    {plan.name}
                  </h3>

                  {/* Duration */}
                  <div className="flex items-center gap-2 text-muted-foreground mb-6">
                    <Clock className="w-5 h-5" />
                    <span className="text-base font-medium">{plan.duration_display}</span>
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-border">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-foreground">
                        {plan.currency} {plan.price}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <h4 className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                      What's Included
                    </h4>
                    <ul className="space-y-3.5">
                      <li className="flex items-center gap-3 text-base text-foreground">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary font-bold" />
                        </div>
                        <span className="leading-relaxed font-semibold">Watch all videos ad-free</span>
                      </li>
                      <li className="flex items-center gap-3 text-base text-foreground">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary font-bold" />
                        </div>
                        <span className="leading-relaxed font-semibold">Access to all videos</span>
                      </li>
                      <li className="flex items-center gap-3 text-base text-foreground">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary font-bold" />
                        </div>
                        <span className="leading-relaxed font-semibold">Unlimited streaming</span>
                      </li>
                      <li className="flex items-center gap-3 text-base text-foreground">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary font-bold" />
                        </div>
                        <span className="leading-relaxed font-semibold">HD quality playback</span>
                      </li>
                    </ul>
                  </div>

                  {/* Subscribe Button */}
                  <button
                    onClick={() => handleSubscribe(plan.plan_id)}
                    disabled={isSubscribing}
                    className={`w-full py-3.5 rounded-xl font-semibold text-base transition-all duration-200 ${
                      isHighlighted
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl'
                        : 'bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground'
                    } ${isSubscribing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                  >
                    {isSubscribing ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </span>
                    ) : (
                      'Subscribe Now'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

