import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthorizer } from "../../../Auth/Authorizer";
import toast, { Toaster } from 'react-hot-toast';

const LoginPage = () => {
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
        toast.success('Login successful! Redirecting...', {
          style: {
            background: 'hsl(0 0% 11%)',
            color: 'hsl(0 0% 95%)',
            border: '1px solid hsl(142 76% 36%)'
          }
        });
        setTimeout(() => navigate("/"), 500);
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
          <Link to="/" className="text-3xl font-bold text-primary">
            StreamHub
          </Link>
          <p className="text-muted-foreground mt-2">Welcome back</p>
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
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
