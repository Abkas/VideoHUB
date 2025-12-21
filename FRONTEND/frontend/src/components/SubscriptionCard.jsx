import { Check, Crown, Zap, Star } from 'lucide-react';

export default function SubscriptionCard({ 
  plan, 
  isPopular = false, 
  currency = 'INR',
  onSelect,
  currentPlan = null,
  billingCycle = 'monthly'
}) {
  const planConfig = {
    free: {
      icon: Zap,
      color: 'text-gray-400',
      bgColor: 'bg-gray-900/50',
      borderColor: 'border-gray-800'
    },
    basic: {
      icon: Check,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-800'
    },
    premium: {
      icon: Crown,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-800'
    },
    premium_plus: {
      icon: Star,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-800'
    }
  };

  const config = planConfig[plan.name.toLowerCase().replace(' ', '_')] || planConfig.free;
  const Icon = config.icon;
  
  const getPrice = () => {
    if (currency === 'INR') return plan.price_inr;
    if (currency === 'NPR') return plan.price_npr;
    return plan.price_usd;
  };

  const getCurrencySymbol = () => {
    if (currency === 'INR') return '₹';
    if (currency === 'NPR') return 'Rs.';
    return '$';
  };

  const price = getPrice();
  const yearlyPrice = billingCycle === 'yearly' ? (price * 12 * 0.75) : null;
  const monthlyPrice = price;
  
  const isCurrentPlan = currentPlan === plan.name.toLowerCase().replace(' ', '_');

  return (
    <div 
      className={`relative bg-card border ${config.borderColor} rounded-xl p-6 hover:shadow-lg transition-all duration-300 ${
        isPopular ? 'ring-2 ring-primary' : ''
      } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-medium">
            Most Popular
          </span>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            Current Plan
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${config.bgColor} mb-3`}>
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">{plan.display_name}</h3>
        <p className="text-muted-foreground text-sm">{plan.description}</p>
      </div>

      {/* Pricing */}
      <div className="text-center mb-6">
        {billingCycle === 'yearly' ? (
          <>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-foreground">{getCurrencySymbol()}{(yearlyPrice / 12).toFixed(0)}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Billed {getCurrencySymbol()}{yearlyPrice?.toFixed(0)} yearly
            </p>
            <p className="text-xs text-green-400 mt-1">Save 25%</p>
          </>
        ) : (
          <>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-foreground">{getCurrencySymbol()}{monthlyPrice}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Billed monthly</p>
          </>
        )}
      </div>

      {/* Features */}
      <div className="space-y-3 mb-6">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-2">
            <Check className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        onClick={() => onSelect && onSelect(plan)}
        disabled={isCurrentPlan}
        className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
          isCurrentPlan
            ? 'bg-secondary text-muted-foreground cursor-not-allowed'
            : isPopular
            ? 'bg-primary text-primary-foreground hover:opacity-90'
            : 'bg-secondary text-foreground hover:bg-secondary/80'
        }`}
      >
        {isCurrentPlan ? 'Current Plan' : plan.price_inr === 0 ? 'Get Started' : 'Subscribe Now'}
      </button>
    </div>
  );
}
