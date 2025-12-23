import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, Home, Grid, Upload as UploadIcon, User, Settings, FileText, Shield, LogOut, Video, PlaySquare, Heart, Bookmark, Users, UserPlus } from "lucide-react";
import { verifyToken } from "../../../api/publicAPI/userApi";
import { axiosInstance } from "../../../api/lib/axios";
import { getMyFollowers, getMyFollowing } from "../../../api/publicAPI/followerApi";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");
  const [userData, setUserData] = useState(null);
  const [userVideos, setUserVideos] = useState([]);
  const [likedVideos, setLikedVideos] = useState([]);
  const [savedVideos, setSavedVideos] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Get current user data
      const { isValid, user } = await verifyToken();
      if (!isValid) {
        toast.error("Please login to view your profile");
        navigate("/login");
        return;
      }

      setUserData(user);

      // Fetch user's videos
      try {
        const response = await axiosInstance.get(`/videos/user/${user.user_id}`);
        setUserVideos(response.data.videos || []);
      } catch (videoError) {
        console.error("Failed to fetch videos:", videoError);
        setUserVideos([]);
      }

      // Fetch followers and following
      try {
        const [followersData, followingData] = await Promise.all([
          getMyFollowers(),
          getMyFollowing()
        ]);
        setFollowers(followersData || []);
        setFollowing(followingData || []);
      } catch (followError) {
        console.error("Failed to fetch followers/following:", followError);
        setFollowers([]);
        setFollowing([]);
      }

      // TODO: Fetch liked videos and saved videos when endpoints are ready
      setLikedVideos([]); // Placeholder
      setSavedVideos([]); // Placeholder
      
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views) => {
    if (!views) return "0";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const getCurrentContent = () => {
    switch (activeTab) {
      case "videos":
        return userVideos;
      case "liked":
        return likedVideos;
      case "saved":
        return savedVideos;
      case "followers":
        return followers;
      case "following":
        return following;
      default:
        return [];
    }
  };

  const currentContent = getCurrentContent();

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
                <UploadIcon className="w-5 h-5" />
                <span>Upload</span>
              </Link>
              <Link to="/profile" className="flex items-center gap-3 px-4 py-3 bg-secondary text-foreground rounded-lg">
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
              <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-destructive hover:bg-secondary rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </Link>
            </nav>
          </div>
        </div>
      )}

      <main className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        ) : !userData ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">Unable to load profile</p>
            <Link to="/login" className="text-primary hover:underline">Please login</Link>
          </div>
        ) : (
          <>
            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-secondary rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  {userData.display_name || userData.username}
                </h1>
                <p className="text-sm text-muted-foreground">@{userData.username}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{userVideos.length} Videos</span>
                  <span>•</span>
                  <span>{userData.followers_count || 0} Followers</span>
                  <span>•</span>
                  <span>{formatViews(userData.total_views || 0)} Views</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 sm:gap-4 border-b border-border mb-4 overflow-x-auto">
              <button
                onClick={() => setActiveTab("videos")}
                className={`pb-3 px-2 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === "videos"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Videos ({userVideos.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("liked")}
                className={`pb-3 px-2 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === "liked"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Liked ({likedVideos.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`pb-3 px-2 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === "saved"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Saved ({savedVideos.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("followers")}
                className={`pb-3 px-2 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === "followers"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Followers ({followers.length})</span>
              </button>
              <button
                onClick={() => setActiveTab("following")}
                className={`pb-3 px-2 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === "following"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Following ({following.length})</span>
              </button>
            </div>

            {/* Empty State or Content */}
            {activeTab === "followers" || activeTab === "following" ? (
              // User List View for Followers/Following
              currentContent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <div className="bg-secondary/50 rounded-full p-8 mb-6">
                    {activeTab === "followers" ? (
                      <Users className="w-16 h-16 text-muted-foreground" />
                    ) : (
                      <UserPlus className="w-16 h-16 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {activeTab === "followers" ? "No followers yet" : "Not following anyone yet"}
                  </h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {activeTab === "followers" 
                      ? "When people follow you, they'll appear here."
                      : "Start following creators to see their content in your feed."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentContent.map((item) => {
                    // For followers, use follower_ prefix fields
                    // For following, use following_ prefix fields
                    const isFollowerTab = activeTab === "followers";
                    const userId = isFollowerTab ? item.follower_id : item.following_id;
                    const username = isFollowerTab ? item.follower_username : item.following_username;
                    const displayName = isFollowerTab ? item.follower_display_name : item.following_display_name;
                    
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">
                            {displayName || username}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">@{username}</p>
                        </div>
                        <Link
                          to={`/user/${userId}`}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                        >
                          View Profile
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              // Video Grid View for Videos/Liked/Saved
              currentContent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <div className="bg-secondary/50 rounded-full p-8 mb-6">
                    {activeTab === "videos" ? (
                      <Video className="w-16 h-16 text-muted-foreground" />
                    ) : activeTab === "liked" ? (
                      <Heart className="w-16 h-16 text-muted-foreground" />
                    ) : (
                      <Bookmark className="w-16 h-16 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {activeTab === "videos" 
                      ? "No videos yet" 
                      : activeTab === "liked"
                      ? "No liked videos"
                      : "No saved videos"}
                  </h3>
                  <p className="text-muted-foreground text-center mb-6 max-w-md">
                    {activeTab === "videos" 
                      ? "Start your content creation journey by uploading your first video!"
                      : activeTab === "liked"
                      ? "Videos you like will appear here for easy access."
                      : "Save videos to watch later and they'll appear here."}
                  </p>
                  {activeTab === "videos" && (
                    <Link
                      to="/upload"
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
                    >
                      <UploadIcon className="w-5 h-5" />
                      Upload Your First Video
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  {currentContent.map((video) => (
                    <Link key={video.id} to={`/watch/${video.id}`} className="group">
                      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                        {video.thumbnail_url ? (
                          <img 
                            src={video.thumbnail_url} 
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                            <PlaySquare className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 bg-background/90 text-foreground text-xs px-1.5 py-0.5 rounded font-medium">
                          {formatDuration(video.duration)}
                        </div>
                      </div>
                      <div className="mt-2">
                        <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatViews(video.views)} views
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
