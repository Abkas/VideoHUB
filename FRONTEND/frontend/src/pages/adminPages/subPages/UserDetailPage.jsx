import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, Mail, Calendar, Video, Clock, Ban, CheckCircle, Crown, UserCog, ChevronDown } from "lucide-react";
import { useAuthorizer } from "../../../Auth/Authorizer";
import { getUserDetails, banUser, unbanUser, promoteToAdmin, demoteFromAdmin } from "../../../api/adminAPI/adminApi";
import toast, { Toaster } from 'react-hot-toast';

const UserDetailPage = () => {
  const { userId } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const { isAdmin, isAuthenticated } = useAuthorizer();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchUserDetails();
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
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subscription</p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.has_subscription ? 'Active' : 'None'}
                </p>
              </div>
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
    </div>
  );
};

export default UserDetailPage;
