import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionCard from '../../../components/SubscriptionCard';
import { Check, HelpCircle } from 'lucide-react';
import { getSubscriptionPlans, createSubscription, getMyActiveSubscription } from '../../../api/publicAPI/subscriptionApi';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [currency, setCurrency] = useState('INR');
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching subscription data from backend...');

      // Fetch available plans
      const plansResponse = await getSubscriptionPlans();
      console.log('📦 Plans response:', plansResponse);
      const plansArray = Object.values(plansResponse.plans || {});
      setSubscriptionPlans(plansArray);

      // Try to fetch current user's active subscription (if logged in)
      try {
        const activeSubscription = await getMyActiveSubscription();
        console.log('👤 Current active subscription:', activeSubscription);
        setCurrentSubscription(activeSubscription);
      } catch (error) {
        console.log('ℹ️ User not logged in or no active subscription');
        setCurrentSubscription(null);
      }

    } catch (error) {
      console.error('❌ Error fetching subscription data:', error);
      toast.error('Failed to load subscription data');
      setSubscriptionPlans([]);
      setCurrentSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan) => {
    console.log('🎯 Selecting plan:', plan.name);

    // Check if user is logged in by trying to get active subscription
    let isLoggedIn = false;
    try {
      await getMyActiveSubscription();
      isLoggedIn = true;
    } catch (error) {
      isLoggedIn = false;
    }

    if (!isLoggedIn) {
      console.log('👤 User not logged in, redirecting to login');
      toast.error('Please login to subscribe to plans');
      navigate('/login', { state: { redirectTo: '/plans', selectedPlan: plan.name } });
      return;
    }

    // Check if this is already the current plan
    if (currentSubscription && currentSubscription.plan === plan.name) {
      toast.info('You are already subscribed to this plan');
      return;
    }

    if (plan.price_inr === 0) {
      // Free plan - create subscription directly
      try {
        setCreatingSubscription(true);
        console.log('🆓 Creating free subscription...');

        const subscriptionData = {
          plan: plan.name,
          billing_cycle: billingCycle,
          currency: currency,
          price: plan.price_inr,
          payment_method: 'free'
        };

        const result = await createSubscription(subscriptionData);
        console.log('✅ Free subscription created:', result);

        toast.success(`Successfully subscribed to ${plan.display_name}!`);
        navigate('/subscriptions'); // Redirect to user's subscriptions page

      } catch (error) {
        console.error('❌ Error creating free subscription:', error);
        toast.error('Failed to create subscription. Please try again.');
      } finally {
        setCreatingSubscription(false);
      }
    } else {
      // Paid plans - go to checkout
      console.log('💳 Redirecting to checkout for paid plan');
      navigate('/checkout', {
        state: {
          plan: plan.name.toLowerCase().replace(' ', '_'),
          billingCycle,
          currency,
          planData: plan
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Start with 7 days free trial. Cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:opacity-80'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all relative ${
                billingCycle === 'yearly'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:opacity-80'
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                Save 25%
              </span>
            </button>
          </div>

          {/* Currency Selector */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Currency:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-3 py-1 bg-secondary border border-border rounded-lg text-foreground text-sm"
            >
              <option value="INR">🇮🇳 INR (₹)</option>
              <option value="NPR">🇳🇵 NPR (Rs.)</option>
              <option value="USD">🌍 USD ($)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading available plans...</p>
              </div>
            </div>
          ) : subscriptionPlans.length > 0 ? (
            subscriptionPlans.map((plan) => {
              console.log('🎨 Rendering plan:', plan.name, plan);
              return (
                <SubscriptionCard
                  key={plan.name}
                  plan={plan}
                  currency={currency}
                  billingCycle={billingCycle}
                  onSelect={handleSelectPlan}
                  currentPlan={currentSubscription?.plan}
                  isPopular={plan.name === 'Premium'}
                />
              );
            })
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-muted-foreground">No subscription plans available</p>
            </div>
          )}
        </div>

        {/* Features Comparison */}
        <div className="bg-card border border-border rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Compare Plans
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 text-muted-foreground font-medium">Feature</th>
                  {subscriptionPlans.map((plan) => (
                    <th key={plan.name} className="text-center py-4 px-4 text-foreground font-semibold">
                      {plan.display_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-muted-foreground">Video Quality</td>
                  {subscriptionPlans.map((plan) => (
                    <td key={plan.name} className="text-center py-4 px-4 text-foreground">
                      {plan.max_quality || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-muted-foreground">Ad-free</td>
                  {subscriptionPlans.map((plan) => (
                    <td key={plan.name} className="text-center py-4 px-4">
                      {plan.ad_free ? (
                        <Check className="w-5 h-5 text-green-400 mx-auto" />
                      ) : (
                        '-'
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-muted-foreground">Downloads</td>
                  {subscriptionPlans.map((plan) => (
                    <td key={plan.name} className="text-center py-4 px-4 text-foreground">
                      {plan.downloads_per_month === -1 ? 'Unlimited' : (plan.downloads_per_month || '0')}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-muted-foreground">Concurrent Streams</td>
                  {subscriptionPlans.map((plan) => (
                    <td key={plan.name} className="text-center py-4 px-4 text-foreground">
                      {plan.concurrent_streams || '1'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-4 px-4 text-muted-foreground">Priority Support</td>
                  {subscriptionPlans.map((plan) => (
                    <td key={plan.name} className="text-center py-4 px-4">
                      {plan.priority_support ? (
                        <Check className="w-5 h-5 text-green-400 mx-auto" />
                      ) : (
                        '-'
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Can I cancel anytime?
                  </h3>
                  <p className="text-muted-foreground">
                    Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    What payment methods do you accept?
                  </h3>
                  <p className="text-muted-foreground">
                    We accept credit/debit cards, UPI, net banking (India), Fonepay QR (Nepal), and PayPal for international payments.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Can I upgrade or downgrade my plan?
                  </h3>
                  <p className="text-muted-foreground">
                    Yes, you can change your plan at any time. Upgrades are immediate, and you'll be charged the prorated difference. Downgrades take effect at the end of your current billing period.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
