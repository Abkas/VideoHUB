import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuthorizer } from "../../../Auth/Authorizer";
import toast, { Toaster } from 'react-hot-toast';

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthorizer();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login({ email, password });
      if (result.success) {
        // Check if user is admin after login
        const userData = result.data?.user;
        if (userData?.is_admin) {
          toast.success('Admin login successful!', {
            style: {
              background: 'hsl(0 0% 11%)',
              color: 'hsl(0 0% 95%)',
              border: '1px solid hsl(142 76% 36%)'
            }
          });
          setTimeout(() => navigate("/admin/dashboard"), 500);
        } else {
          toast.error('Access denied. Admin privileges required.', {
            style: {
              background: 'hsl(0 0% 11%)',
              color: 'hsl(0 0% 95%)',
              border: '1px solid hsl(0 72% 51%)'
            }
          });
        }
      } else {
        toast.error(result.error || 'Login failed. Please try again.', {
          style: {
            background: 'hsl(0 0% 11%)',
            color: 'hsl(0 0% 95%)',
            border: '1px solid hsl(0 72% 51%)'
          }
        });
      }
    } catch (err) {
      toast.error('Login failed. Please try again.', {
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">Sign in to access admin controls</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@streamhub.com"
                required
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                minLength={8}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="block w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login to Admin'}
            </button>
          </form>
        </div>

        <p className="text-center text-muted-foreground mt-6">
          <Link to="/" className="text-primary hover:underline">
            ← Back to main site
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
