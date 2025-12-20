import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, Users, Search } from "lucide-react";
import { useAuthorizer } from "../../../Auth/Authorizer";
import { getAllUsers } from "../../../api/adminAPI/adminApi";
import toast, { Toaster } from 'react-hot-toast';
import UserProfileCard from "../subPages/UserProfileCard";

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { isAdmin, isAuthenticated, loading: authLoading } = useAuthorizer();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchUsers();
  }, [isAuthenticated, isAdmin, navigate, authLoading]);

  useEffect(() => {
    if (searchQuery || roleFilter !== "all" || statusFilter !== "all") {
      let filtered = users;
      
      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(user => 
          user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.username?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Apply role filter
      if (roleFilter !== "all") {
        filtered = filtered.filter(user => user.role === roleFilter);
      }
      
      // Apply status filter
      if (statusFilter === "active") {
        filtered = filtered.filter(user => !user.is_banned);
      } else if (statusFilter === "banned") {
        filtered = filtered.filter(user => user.is_banned);
      }
      
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
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
              to="/admin/dashboard"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Total Users</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{users.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Active Users</p>
            <p className="text-xl sm:text-2xl font-bold text-green-400">
              {users.filter(u => !u.is_banned).length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Banned Users</p>
            <p className="text-xl sm:text-2xl font-bold text-red-400">
              {users.filter(u => u.is_banned).length}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or username..."
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Role:</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 bg-card border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-card border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>

          {(searchQuery || roleFilter !== "all" || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
                setStatusFilter("all");
              }}
              className="px-3 py-1.5 bg-secondary text-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
            {filteredUsers.map((user) => (
              <UserProfileCard 
                key={user._id} 
                user={user} 
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminUserManagement;
