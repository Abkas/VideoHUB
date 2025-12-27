import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, Home, Grid, User, Settings, FileText, Shield, LogOut, Crown } from "lucide-react";
import { useAuthorizer } from "../Auth/Authorizer";

const NavigationBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthorizer();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  const displayName = user?.display_name || user?.username || "User";
  const username = user?.username || "";

  return (
    <>
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-[1280px] mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="text-xl sm:text-2xl font-bold text-primary hover:opacity-80 transition-opacity flex-shrink-0"
            >
              VideoHUB
            </Link>

            {/* Desktop User Info - Only show when logged in */}
            {isAuthenticated && user && (
              <div className="hidden md:flex items-center gap-3 flex-1 justify-center px-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="hidden lg:inline">Welcome,</span>
                  <span className="font-medium text-foreground max-w-[150px] truncate">
                    {displayName}
                  </span>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors group"
                  title="Go to Profile"
                >
                  {user.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt={displayName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  )}
                </Link>
              </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link 
                to="/search" 
                className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-foreground" />
              </Link>
              <button
                onClick={() => setMenuOpen(true)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
                aria-label="Open Menu"
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
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute left-0 top-0 bottom-0 w-80 sm:w-96 bg-card border-r border-border shadow-xl animate-slide-in overflow-y-auto">
            {/* Menu Header with User Info */}
            <div className="sticky top-0 bg-card border-b border-border z-10">
              <div className="flex items-center justify-between p-4">
                <span className="text-lg font-bold text-primary">Menu</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>
              
              {/* User Welcome Section - Only show when logged in */}
              {isAuthenticated && user && (
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 pb-4 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {user.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-muted-foreground">Welcome back,</div>
                    <div className="font-semibold text-foreground truncate">{displayName}</div>
                    {username && (
                      <div className="text-xs text-muted-foreground truncate">@{username}</div>
                    )}
                  </div>
                </Link>
              )}
            </div>

            {/* Navigation Links */}
            <nav className="p-2">
              <Link 
                to="/" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                <Home className="w-5 h-5 flex-shrink-0" />
                <span>Home</span>
              </Link>
              <Link 
                to="/browse" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                <Grid className="w-5 h-5 flex-shrink-0" />
                <span>Browse</span>
              </Link>
              
              {isAuthenticated && (
                <>
                  <Link 
                    to="/subscriptions" 
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    <Crown className="w-5 h-5 flex-shrink-0" />
                    <span>My Subscription</span>
                  </Link>
                  <Link 
                    to="/profile" 
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    <User className="w-5 h-5 flex-shrink-0" />
                    <span>Profile</span>
                  </Link>
                  <Link 
                    to="/settings" 
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    <span>Account Settings</span>
                  </Link>
                </>
              )}

              <div className="my-2 border-t border-border" />
              
              <Link 
                to="/guidelines" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                <Shield className="w-5 h-5 flex-shrink-0" />
                <span>Community Guidelines</span>
              </Link>
              <Link 
                to="/terms" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                <FileText className="w-5 h-5 flex-shrink-0" />
                <span>Terms of Service</span>
              </Link>
              <Link 
                to="/privacy" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                <FileText className="w-5 h-5 flex-shrink-0" />
                <span>Privacy Policy</span>
              </Link>
              
              <div className="my-2 border-t border-border" />
              
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-secondary rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5 flex-shrink-0" />
                  <span>Logout</span>
                </button>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-primary hover:bg-secondary rounded-lg transition-colors font-medium"
                >
                  <User className="w-5 h-5 flex-shrink-0" />
                  <span>Login</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default NavigationBar;