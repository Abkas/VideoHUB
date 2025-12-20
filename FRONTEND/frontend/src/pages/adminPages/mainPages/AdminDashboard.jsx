import { Link } from "react-router-dom";
import { Shield, Users, Video, Flag, FolderOpen, LogOut, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
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
                <p className="text-2xl font-bold text-foreground">12,458</p>
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
                <p className="text-2xl font-bold text-foreground">45,892</p>
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
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
