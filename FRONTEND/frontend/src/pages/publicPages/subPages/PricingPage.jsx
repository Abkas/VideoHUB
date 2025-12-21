import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionCard from '../../../components/SubscriptionCard';
import { Check, HelpCircle } from 'lucide-react';

const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    display_name: 'Free',
    description: 'Basic access with ads',
    features: [
      '480p quality',
      'Ad-supported',
      'Limited watch history (30 days)',
      'No downloads'
    ],
    price_inr: 0,
    price_npr: 0,
    price_usd: 0
  },
  basic: {
    name: 'Basic',
    display_name: 'Basic',
    description: 'Ad-free with HD quality',
    features: [
      '720p HD quality',
      'Ad-free experience',
      'Download 5 videos/month',
      'Full watch history',
      '1 concurrent stream'
    ],
    price_inr: 99,
    price_npr: 200,
    price_usd: 1.99
  },
  premium: {
    name: 'Premium',
    display_name: 'Premium',
    description: 'Full HD with unlimited downloads',
    features: [
      '1080p Full HD quality',
      'Ad-free experience',
      'Unlimited downloads',
      '2 concurrent streams',
      'Early access to content',
      'Priority support'
    ],
    price_inr: 299,
    price_npr: 500,
    price_usd: 4.99
  },
  premium_plus: {
    name: 'Premium Plus',
    display_name: 'Premium Plus',
    description: '4K Ultra HD with premium features',
    features: [
      '4K Ultra HD quality',
      'Ad-free experience',
      'Unlimited downloads',
      '4 concurrent streams',
      'Exclusive premium content',
      'No watermarks',
      'Priority support'
    ],
    price_inr: 499,
    price_npr: 800,
    price_usd: 7.99
  }
};

export default function PricingPage() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [currency, setCurrency] = useState('INR');

  const handleSelectPlan = (plan) => {
    // Redirect to checkout or subscription creation
    if (plan.price_inr === 0) {
      // Free plan - direct signup
      navigate('/signup');
    } else {
      // Paid plans - go to checkout
      navigate('/checkout', { state: { plan: plan.name.toLowerCase().replace(' ', '_'), billingCycle, currency } });
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
          <SubscriptionCard
            plan={SUBSCRIPTION_PLANS.free}
            currency={currency}
            billingCycle={billingCycle}
            onSelect={handleSelectPlan}
          />
          <SubscriptionCard
            plan={SUBSCRIPTION_PLANS.basic}
            currency={currency}
            billingCycle={billingCycle}
            onSelect={handleSelectPlan}
          />
          <SubscriptionCard
            plan={SUBSCRIPTION_PLANS.premium}
            isPopular={true}
            currency={currency}
            billingCycle={billingCycle}
            onSelect={handleSelectPlan}
          />
          <SubscriptionCard
            plan={SUBSCRIPTION_PLANS.premium_plus}
            currency={currency}
            billingCycle={billingCycle}
            onSelect={handleSelectPlan}
          />
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
                  <th className="text-center py-4 px-4 text-foreground font-semibold">Free</th>
                  <th className="text-center py-4 px-4 text-foreground font-semibold">Basic</th>
                  <th className="text-center py-4 px-4 text-foreground font-semibold">Premium</th>
                  <th className="text-center py-4 px-4 text-foreground font-semibold">Premium+</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-muted-foreground">Video Quality</td>
                  <td className="text-center py-4 px-4 text-foreground">480p</td>
                  <td className="text-center py-4 px-4 text-foreground">720p HD</td>
                  <td className="text-center py-4 px-4 text-foreground">1080p FHD</td>
                  <td className="text-center py-4 px-4 text-foreground">4K UHD</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-muted-foreground">Ad-free</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-muted-foreground">Downloads</td>
                  <td className="text-center py-4 px-4 text-foreground">0</td>
                  <td className="text-center py-4 px-4 text-foreground">5/month</td>
                  <td className="text-center py-4 px-4 text-foreground">Unlimited</td>
                  <td className="text-center py-4 px-4 text-foreground">Unlimited</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-4 px-4 text-muted-foreground">Concurrent Streams</td>
                  <td className="text-center py-4 px-4 text-foreground">1</td>
                  <td className="text-center py-4 px-4 text-foreground">1</td>
                  <td className="text-center py-4 px-4 text-foreground">2</td>
                  <td className="text-center py-4 px-4 text-foreground">4</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-muted-foreground">Priority Support</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4">-</td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-green-400 mx-auto" /></td>
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
