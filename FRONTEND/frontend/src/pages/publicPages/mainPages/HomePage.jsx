import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, Home, Grid, Upload, User, Settings, FileText, Shield, LogOut } from "lucide-react";
import { useAuthorizer } from "../../../Auth/Authorizer";

const mockVideos = [
  { id: 1, title: "Amazing sunset timelapse over the ocean waves", duration: "12:34", views: "1.2M" },
  { id: 2, title: "Urban exploration documentary part one", duration: "8:45", views: "856K" },
  { id: 3, title: "Cooking masterclass with professional chef", duration: "15:20", views: "2.1M" },
  { id: 4, title: "Travel vlog exploring hidden gems", duration: "10:11", views: "543K" },
  { id: 5, title: "Music production tutorial for beginners", duration: "22:30", views: "1.8M" },
  { id: 6, title: "Fitness workout routine at home", duration: "18:45", views: "3.2M" },
  { id: 7, title: "Nature documentary wildlife adventure", duration: "25:10", views: "987K" },
  { id: 8, title: "Tech review latest smartphone comparison", duration: "14:22", views: "2.5M" },
  { id: 9, title: "Art tutorial watercolor painting basics", duration: "11:55", views: "654K" },
  { id: 10, title: "Gaming highlights epic moments compilation", duration: "9:30", views: "4.1M" },
  { id: 11, title: "Dance choreography tutorial step by step", duration: "7:45", views: "1.5M" },
  { id: 12, title: "Photography tips for stunning portraits", duration: "13:20", views: "892K" },
];

const categories = [
  "All", "Trending", "New", "Popular", "Featured", "Documentary", "Music", "Sports", "Gaming", "Lifestyle"
];

const HomePage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const { isAuthenticated, logout, user } = useAuthorizer();

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
              {isAuthenticated ? (
                <>
                  <div className="hidden sm:flex items-center gap-3">
                    <span className="text-sm px-3 py-1.5 bg-secondary/50 rounded-lg">
                      Hello, <span className="text-primary font-semibold">{user?.display_name || user?.username || 'User'}</span>
                    </span>
                    <Link 
                      to="/profile" 
                      className="flex items-center justify-center p-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
                      title="Profile"
                    >
                      <User className="w-5 h-5" />
                    </Link>
                  </div>
                </>
              ) : (
                <Link to="/login" className="hidden sm:flex px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                  Login
                </Link>
              )}
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
            className="absolute inset-0 bg-black/20 backdrop-blur-md animate-fade-in"
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
              <Link to="/settings" className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-secondary rounded-lg transition-colors">
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
              {isAuthenticated ? (
                <button 
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-secondary rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              ) : (
                <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-primary hover:bg-secondary rounded-lg transition-colors">
                  <User className="w-5 h-5" />
                  <span>Login</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Category Chips */}
      <div className="sticky top-14 z-40 bg-background border-b border-border">
        <div className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4">
          <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <main className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {mockVideos.map((video) => (
            <Link key={video.id} to={`/watch/${video.id}`} className="group">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">Thumbnail</span>
                </div>
                <div className="absolute bottom-1 right-1 bg-background/90 text-foreground text-xs px-1.5 py-0.5 rounded font-medium">
                  {video.duration}
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{video.views} views</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
