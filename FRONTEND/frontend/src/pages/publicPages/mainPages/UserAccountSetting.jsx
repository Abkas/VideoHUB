import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, Home, Grid, Upload, User, Settings, FileText, Shield, LogOut } from "lucide-react";

const SettingsPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState("JohnDoe123");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [privateProfile, setPrivateProfile] = useState(false);
  const [showActivity, setShowActivity] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="text-xl font-bold text-primary">
              StreamHub
            </Link>
            
            <div className="flex items-center gap-2">
              <Link to="/search" className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <Search className="w-5 h-5 text-foreground" />
              </Link>
              <button 
                onClick={() => setMenuOpen(true)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-in Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-lg font-bold text-primary">Menu</span>
              <button 
                onClick={() => setMenuOpen(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>
            <nav className="p-2">
              <Link to="/" className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors">
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>
              <Link to="/browse" className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors">
                <Grid className="w-5 h-5" />
                <span>Browse</span>
              </Link>
              <Link to="/upload" className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors">
                <Upload className="w-5 h-5" />
                <span>Upload</span>
              </Link>
              <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors">
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
              <Link to="/settings" className="flex items-center gap-3 px-4 py-3 bg-secondary text-foreground rounded-lg">
                <Settings className="w-5 h-5" />
                <span>Account Settings</span>
              </Link>
              <div className="my-2 border-t border-border" />
              <Link to="/guidelines" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
                <Shield className="w-5 h-5" />
                <span>Community Guidelines</span>
              </Link>
              <Link to="/terms" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
                <FileText className="w-5 h-5" />
                <span>Terms of Service</span>
              </Link>
              <Link to="/privacy" className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
                <FileText className="w-5 h-5" />
                <span>Privacy Policy</span>
              </Link>
              <div className="my-2 border-t border-border" />
              <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-destructive hover:bg-secondary rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </Link>
            </nav>
          </div>
        </div>
      )}

      <main className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Account Settings</h1>

        <div className="space-y-6">
          {/* Change Username */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Change Username</h2>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
              Update Username
            </button>
          </div>

          {/* Change Password */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground mb-2">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-2">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <button className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
              Update Password
            </button>
          </div>

          {/* Privacy Settings */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Privacy Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">Private Profile</p>
                  <p className="text-sm text-muted-foreground">Only approved followers can see your content</p>
                </div>
                <button
                  onClick={() => setPrivateProfile(!privateProfile)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    privateProfile ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-foreground rounded-full transition-transform ${
                      privateProfile ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">Show Activity Status</p>
                  <p className="text-sm text-muted-foreground">Let others see when you're online</p>
                </div>
                <button
                  onClick={() => setShowActivity(!showActivity)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    showActivity ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-foreground rounded-full transition-transform ${
                      showActivity ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <Link 
            to="/login"
            className="block w-full py-3 bg-destructive text-destructive-foreground rounded-lg font-semibold text-center hover:opacity-90 transition-opacity"
          >
            Logout
          </Link>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
