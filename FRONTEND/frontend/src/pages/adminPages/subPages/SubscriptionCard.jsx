import { Crown, Eye, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubscriptionCard = ({ subscription, formatCurrency, getPlanColor, getStatusBadge, onDelete, onEdit }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-all hover:shadow-lg flex flex-col h-full">
      {/* Plan Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground mb-1">
            {subscription.subscription_name}
          </h3>
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(subscription.status)}`}>
            {subscription.status}
          </span>
        </div>
        <Crown className={`w-6 h-6 ${getPlanColor(subscription.plan)}`} />
      </div>

      {/* Plan Type */}
      <div className="mb-4">
        <span className={`text-sm font-semibold uppercase ${getPlanColor(subscription.plan)}`}>
          {subscription.plan}
        </span>
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-foreground">
          {formatCurrency(subscription.price, subscription.currency)}
        </div>
        <div className="text-sm text-muted-foreground">
          per {subscription.duration_value} {subscription.duration_unit}{subscription.duration_value > 1 ? 's' : ''}
        </div>
      </div>

      {/* Description */}
      {subscription.description && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {subscription.description}
        </p>
      )}

      {/* Features */}
      {subscription.features && subscription.features.length > 0 && (
        <div className="mb-4 space-y-2 flex-1">
          {subscription.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="line-clamp-1">{feature}</span>
            </div>
          ))}
          {subscription.features.length > 3 && (
            <p className="text-xs text-muted-foreground pl-6">
              +{subscription.features.length - 3} more features
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-border">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/subscriptions/${subscription.id}`);
          }}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm"
          title="View details"
        >
          <Eye className="w-4 h-4" />
          <span>View</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(subscription);
          }}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-600/20 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition-colors text-sm"
          title="Edit plan"
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(subscription.id);
          }}
          className="px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
          title="Delete plan"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SubscriptionCard;
