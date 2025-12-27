import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, Mail, Calendar, Video, Clock, Ban, CheckCircle, Crown, UserCog, ChevronDown, Edit, Plus, Minus } from "lucide-react";
import { useAuthorizer } from "../../../Auth/Authorizer";
import { getUserDetails, banUser, unbanUser, promoteToAdmin, demoteFromAdmin, getUserSubscriptions, updateUserSubscription } from "../../../api/adminAPI/adminApi";
import toast, { Toaster } from 'react-hot-toast';

const UserDetailPage = () => {
  const { userId } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionDays, setSubscriptionDays] = useState(0);
  const [subscriptionHours, setSubscriptionHours] = useState(0);
  const [subscriptionMinutes, setSubscriptionMinutes] = useState(0);
  const { isAdmin, isAuthenticated } = useAuthorizer();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchUserDetails();
    fetchSubscriptionData();
  }, [userId, isAuthenticated, isAdmin, navigate]);

  const fetchUserDetails = async () => {
    try {
      const data = await getUserDetails(userId);
      setUserDetails(data);
    } catch (error) {
      toast.error(error.message, {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(0 72% 51%)'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptionData = async () => {
    try {
      const data = await getUserSubscriptions(userId);
      setSubscriptionData(data);
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    }
  };

  const handleBanUser = async () => {
    if (!userDetails) return;
    
    try {
      if (userDetails.user.is_banned) {
        await unbanUser(userId);
        toast.success('User unbanned successfully', {
          style: {
            background: 'hsl(0 0% 11%)',
            color: 'hsl(0 0% 95%)',
            border: '1px solid hsl(142 76% 36%)'
          }
        });
      } else {
        await banUser(userId);
        toast.success('User banned successfully', {
          style: {
            background: 'hsl(0 0% 11%)',
            color: 'hsl(0 0% 95%)',
            border: '1px solid hsl(142 76% 36%)'
          }
        });
      }
      setShowActionsMenu(false);
      fetchUserDetails();
    } catch (error) {
      toast.error(error.message, {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(0 72% 51%)'
        }
      });
    }
  };

  const handlePromoteUser = async () => {
    if (!userDetails) return;
    
    if (!window.confirm('Are you sure you want to promote this user to admin?')) return;
    
    try {
      await promoteToAdmin(userId);
      toast.success('User promoted to admin successfully', {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(142 76% 36%)'
        }
      });
      setShowActionsMenu(false);
      fetchUserDetails();
    } catch (error) {
      toast.error(error.message, {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(0 72% 51%)'
        }
      });
    }
  };

  const handleDemoteUser = async () => {
    if (!userDetails) return;
    
    if (!window.confirm('Are you sure you want to demote this admin to regular user?')) return;
    
    try {
      await demoteFromAdmin(userId);
      toast.success('User demoted to regular user successfully', {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(142 76% 36%)'
        }
      });
      setShowActionsMenu(false);
      fetchUserDetails();
    } catch (error) {
      toast.error(error.message, {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(0 72% 51%)'
        }
      });
    }
  };

  const handleEditSubscription = () => {
    if (subscriptionData?.current_status?.remaining_seconds > 0) {
      const remainingSeconds = subscriptionData.current_status.remaining_seconds;
      const days = Math.floor(remainingSeconds / 86400);
      const hours = Math.floor((remainingSeconds % 86400) / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      
      setSubscriptionDays(days);
      setSubscriptionHours(hours);
      setSubscriptionMinutes(minutes);
    } else {
      setSubscriptionDays(0);
      setSubscriptionHours(0);
      setSubscriptionMinutes(0);
    }
    setShowSubscriptionModal(true);
  };

  const handleUpdateSubscription = async () => {
    try {
      // Calculate total seconds from days, hours, and minutes
      const totalSeconds = (subscriptionDays * 86400) + (subscriptionHours * 3600) + (subscriptionMinutes * 60);
      const newExpiryDate = new Date();
      newExpiryDate.setSeconds(newExpiryDate.getSeconds() + totalSeconds);
      
      await updateUserSubscription(userId, {
        expires_at: newExpiryDate.toISOString()
      });

      toast.success('Subscription updated successfully', {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(142 76% 36%)'
        }
      });
      
      setShowSubscriptionModal(false);
      fetchSubscriptionData();
    } catch (error) {
      toast.error(error.message || 'Failed to update subscription', {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(0 72% 51%)'
        }
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRemainingTime = (seconds) => {
    if (seconds <= 0) return 'Expired';

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.join(' ') + ' remaining';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">User not found</p>
          <Link to="/admin/users" className="text-primary hover:underline mt-2 inline-block">
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  const { user, stats, recent_watch_history } = userDetails;

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold text-foreground">Admin Panel</span>
            </div>
            <Link 
              to="/admin/users"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Users</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4 py-6 space-y-6">
        {/* User Profile Header */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-foreground">
                  {(user.display_name || user.email).charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-foreground">{user.display_name || 'Unknown User'}</h1>
                  {user.role === 'admin' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-sm font-medium">
                      <Crown className="w-4 h-4" />
                      Admin
                    </span>
                  )}
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    user.is_banned
                      ? "bg-destructive/10 text-destructive" 
                      : "bg-success/10 text-success"
                  }`}>
                    {user.is_banned ? "Banned" : "Active"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(user.created_at)}</span>
                </div>
              </div>
            </div>
            
            {/* Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                <UserCog className="w-4 h-4" />
                <span>Actions</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showActionsMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-10">
                  {/* Ban/Unban */}
                  {!user.is_banned ? (
                    <button 
                      onClick={handleBanUser}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary transition-colors text-destructive"
                    >
                      <Ban className="w-4 h-4" />
                      <div>
                        <p className="font-medium text-sm">Ban User</p>
                        <p className="text-xs text-muted-foreground">Restrict user access</p>
                      </div>
                    </button>
                  ) : (
                    <button 
                      onClick={handleBanUser}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary transition-colors text-success"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <div>
                        <p className="font-medium text-sm">Unban User</p>
                        <p className="text-xs text-muted-foreground">Restore user access</p>
                      </div>
                    </button>
                  )}
                  
                  <div className="border-t border-border"></div>
                  
                  {/* Promote/Demote */}
                  {user.role !== 'admin' ? (
                    <button 
                      onClick={handlePromoteUser}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary transition-colors text-foreground"
                    >
                      <Crown className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium text-sm">Promote to Admin</p>
                        <p className="text-xs text-muted-foreground">Grant admin privileges</p>
                      </div>
                    </button>
                  ) : (
                    <button 
                      onClick={handleDemoteUser}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary transition-colors text-foreground"
                    >
                      <UserCog className="w-4 h-4" />
                      <div>
                        <p className="font-medium text-sm">Demote to User</p>
                        <p className="text-xs text-muted-foreground">Remove admin privileges</p>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Videos Uploaded</p>
                <p className="text-2xl font-bold text-foreground">{stats.video_count}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Watch History</p>
                <p className="text-2xl font-bold text-foreground">{stats.watch_history_count}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subscription Status</p>
                  <p className="text-lg font-bold text-foreground">
                    {subscriptionData?.current_status?.is_active ? 'Active' : 'Inactive'}
                  </p>
                  {subscriptionData?.current_status?.remaining_seconds > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formatRemainingTime(subscriptionData.current_status.remaining_seconds)}
                    </p>
                  )}
                </div>
              </div>
              {subscriptionData?.current_status?.is_active && (
                <button
                  onClick={handleEditSubscription}
                  className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Recent Watch History */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Recent Watch History</h2>
          </div>
          <div className="divide-y divide-border">
            {recent_watch_history.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No watch history yet
              </div>
            ) : (
              recent_watch_history.map((history) => (
                <div key={history._id} className="p-4 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-start gap-4">
                    {history.video_thumbnail && (
                      <img 
                        src={history.video_thumbnail} 
                        alt={history.video_title}
                        className="w-32 h-20 object-cover rounded-lg bg-secondary flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground mb-1 truncate">
                        {history.video_title || 'Unknown Video'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Watched: {formatDate(history.last_watched_at)}</span>
                        {history.completion_percentage !== undefined && (
                          <span>Progress: {Math.round(history.completion_percentage)}%</span>
                        )}
                      </div>
                      {history.watch_duration && (
                        <div className="mt-2">
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(history.completion_percentage || 0, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Subscription History */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Subscription History</h2>
          </div>
          <div className="divide-y divide-border">
            {subscriptionData?.subscription_history?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No subscription history
              </div>
            ) : (
              subscriptionData?.subscription_history?.map((sub) => (
                <div key={sub.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Crown className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{sub.plan_name || 'Unknown Plan'}</p>
                        <p className="text-sm text-muted-foreground">
                          {sub.transaction_type === 'subscribe' ? 'Initial Purchase' : 'Extended'} • {formatDate(sub.created_at)}
                        </p>
                        {sub.price && (
                          <p className="text-sm text-muted-foreground">
                            ₹{sub.price}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        sub.is_active 
                          ? 'bg-success/10 text-success' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {sub.is_active ? 'Active' : 'Expired'}
                      </div>
                      {sub.expires_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Expires: {formatDate(sub.expires_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold text-foreground mb-4">User Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">User ID</p>
              <p className="text-foreground font-mono text-sm">{user._id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Role</p>
              <p className="text-foreground">{user.role || 'user'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Account Created</p>
              <p className="text-foreground">{formatDate(user.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
              <p className="text-foreground">{formatDate(user.updated_at)}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Subscription Edit Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-foreground mb-4">Edit Subscription Time</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Remaining Time
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Days */}
                  <div className="text-center">
                    <label className="block text-xs text-muted-foreground mb-1">Days</label>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSubscriptionDays(Math.max(0, subscriptionDays - 1))}
                        className="w-6 h-6 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 flex items-center justify-center text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        value={subscriptionDays}
                        onChange={(e) => setSubscriptionDays(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-12 px-2 py-1 bg-secondary border border-border rounded text-foreground text-center text-sm"
                        min="0"
                      />
                      <button
                        onClick={() => setSubscriptionDays(subscriptionDays + 1)}
                        className="w-6 h-6 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 flex items-center justify-center text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="text-center">
                    <label className="block text-xs text-muted-foreground mb-1">Hours</label>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSubscriptionHours(Math.max(0, subscriptionHours - 1))}
                        className="w-6 h-6 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 flex items-center justify-center text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        value={subscriptionHours}
                        onChange={(e) => setSubscriptionHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                        className="w-12 px-2 py-1 bg-secondary border border-border rounded text-foreground text-center text-sm"
                        min="0"
                        max="23"
                      />
                      <button
                        onClick={() => setSubscriptionHours(Math.min(23, subscriptionHours + 1))}
                        className="w-6 h-6 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 flex items-center justify-center text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Minutes */}
                  <div className="text-center">
                    <label className="block text-xs text-muted-foreground mb-1">Minutes</label>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSubscriptionMinutes(Math.max(0, subscriptionMinutes - 1))}
                        className="w-6 h-6 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 flex items-center justify-center text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        value={subscriptionMinutes}
                        onChange={(e) => setSubscriptionMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                        className="w-12 px-2 py-1 bg-secondary border border-border rounded text-foreground text-center text-sm"
                        min="0"
                        max="59"
                      />
                      <button
                        onClick={() => setSubscriptionMinutes(Math.min(59, subscriptionMinutes + 1))}
                        className="w-6 h-6 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 flex items-center justify-center text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Set all values to 0 to expire the subscription immediately
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleUpdateSubscription}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
                >
                  Update Subscription
                </button>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetailPage;
