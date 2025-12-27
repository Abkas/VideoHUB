import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Users, Video, Flag, FolderOpen, LogOut, TrendingUp, CreditCard } from "lucide-react";
import { useAuthorizer } from "../../../Auth/Authorizer";
import { getPlatformStats } from "../../../api/adminAPI/adminApi";
import toast, { Toaster } from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin, isAuthenticated, logout, loading: authLoading } = useAuthorizer();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    if (!isAdmin) {
      toast.error('Access denied. Admin privileges required.', {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(0 72% 51%)'
        }
      });
      navigate('/');
      return;
    }

    fetchStats();
  }, [isAuthenticated, isAdmin, navigate, authLoading]);

  const fetchStats = async () => {
    try {
      const data = await getPlatformStats();
      setStats(data);
    } catch (error) {
      toast.error(error.message || 'Failed to load statistics', {
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

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

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
              to="/admin/login"
              onClick={handleLogout}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.total_users || 0}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats?.total_videos || 0}</p>
                <p className="text-xs text-muted-foreground">Total Videos</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <Flag className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">23</p>
                <p className="text-xs text-muted-foreground">Pending Reports</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">+12%</p>
                <p className="text-xs text-muted-foreground">Growth</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="space-y-2">
          <Link 
            to="/admin/videos"
            className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-secondary transition-colors"
          >
            <Video className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Video Management</p>
              <p className="text-sm text-muted-foreground">View, disable, or delete videos</p>
            </div>
          </Link>

          <Link 
            to="/admin/users"
            className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-secondary transition-colors"
          >
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">User Management</p>
              <p className="text-sm text-muted-foreground">Manage user accounts and bans</p>
            </div>
          </Link>

          <Link 
            to="/admin/reports"
            className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-secondary transition-colors"
          >
            <Flag className="w-5 h-5 text-destructive" />
            <div>
              <p className="font-medium text-foreground">Reports</p>
              <p className="text-sm text-muted-foreground">Review and resolve content reports</p>
            </div>
          </Link>

          <Link 
            to="/admin/categories"
            className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-secondary transition-colors"
          >
            <FolderOpen className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Category Management</p>
              <p className="text-sm text-muted-foreground">Add or remove video categories</p>
            </div>
          </Link>

          <Link 
            to="/admin/subscriptions"
            className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-secondary transition-colors"
          >
            <CreditCard className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="font-medium text-foreground">Subscription Management</p>
              <p className="text-sm text-muted-foreground">Manage user subscriptions and payments</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
