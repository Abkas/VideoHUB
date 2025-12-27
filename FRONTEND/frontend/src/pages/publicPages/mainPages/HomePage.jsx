import { useState, useEffect } from "react";
import { TrendingUp, Flame, Users, Sparkles, Grid } from "lucide-react";
import { useAuthorizer } from "../../../Auth/Authorizer";
import VideoSection from "../../../components/VideoSection";
import NavigationBar from "../../../components/NavigationBar";
import { 
  getTrendingVideos, 
  getHotVideos, 
  getFollowingVideos, 
  getRecommendedVideos 
} from "../../../api/publicAPI/videoApi";
import toast from "react-hot-toast";

const HomePage = () => {
  const { isAuthenticated, user } = useAuthorizer();
  
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
      <NavigationBar />
      
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
