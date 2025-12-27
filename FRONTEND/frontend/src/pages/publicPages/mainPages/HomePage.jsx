import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, Home, Grid, User, Settings, FileText, Shield, LogOut, TrendingUp, Flame, Users, Sparkles } from "lucide-react";
import { useAuthorizer } from "../../../Auth/Authorizer";
import VideoSection from "../../../components/VideoSection";
import { 
  getTrendingVideos, 
  getHotVideos, 
  getFollowingVideos, 
  getRecommendedVideos 
} from "../../../api/publicAPI/videoApi";
import toast from "react-hot-toast";

const HomePage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuthorizer();
  
  // Video sections state
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [hotVideos, setHotVideos] = useState([]);
  const [followingVideos, setFollowingVideos] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllVideos();
  }, [isAuthenticated]);

  const fetchAllVideos = async () => {
    try {
      setLoading(true);
      
      // Fetch trending and hot for all users
      const [trending, hot] = await Promise.all([
        getTrendingVideos(10),
        getHotVideos(10)
      ]);
      
      setTrendingVideos(trending.videos || []);
      setHotVideos(hot.videos || []);
      
      // Fetch following and recommended only for authenticated users
      if (isAuthenticated) {
        try {
          const [following, recommended] = await Promise.all([
            getFollowingVideos(10),
            getRecommendedVideos(10)
          ]);
          setFollowingVideos(following.videos || []);
          setRecommendedVideos(recommended.videos || []);
        } catch (error) {
          console.log('Error fetching personalized videos:', error);
          // Don't show error toast for auth-required endpoints
        }
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="text-xl font-bold text-primary">
              VideoHUB
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

      {/* Main Content */}
      <main className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Trending Section */}
            {trendingVideos.length > 0 && (
              <VideoSection 
                title={
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span>Trending Now</span>
                  </div>
                }
                videos={trendingVideos}
                showViewAll={true}
                viewAllLink="/browse?filter=trending"
              />
            )}

            {/* Following Section (Authenticated Users Only) */}
            {isAuthenticated && followingVideos.length > 0 && (
              <VideoSection 
                title={
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span>From Your Following</span>
                  </div>
                }
                videos={followingVideos}
                showViewAll={true}
                viewAllLink="/browse?filter=following"
              />
            )}

            {/* Hot Section */}
            {hotVideos.length > 0 && (
              <VideoSection 
                title={
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span>Hot Right Now</span>
                  </div>
                }
                videos={hotVideos}
                showViewAll={true}
                viewAllLink="/browse?filter=hot"
              />
            )}

            {/* Recommended Section (Authenticated Users Only) */}
            {isAuthenticated && recommendedVideos.length > 0 && (
              <VideoSection 
                title={
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <span>Recommended For You</span>
                  </div>
                }
                videos={recommendedVideos}
                showViewAll={true}
                viewAllLink="/browse?filter=recommended"
              />
            )}

            {/* Empty State */}
            {!loading && trendingVideos.length === 0 && hotVideos.length === 0 && (
              <div className="text-center py-20">
                <Grid className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No videos available</h3>
                <p className="text-muted-foreground">Check back later for new content</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
