import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">Sign in to access admin controls</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="space-y-4">
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
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <Link 
              to="/admin/dashboard"
              className="block w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-center hover:opacity-90 transition-opacity"
            >
              Login to Admin
            </Link>
          </div>
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
