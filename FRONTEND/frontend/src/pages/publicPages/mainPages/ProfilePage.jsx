import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, Home, Grid, Upload as UploadIcon, User, Settings, FileText, Shield, LogOut, Video, Heart, Bookmark, Users, UserPlus, Camera } from "lucide-react";
import { verifyToken, uploadAvatar, deleteAvatar } from "../../../api/publicAPI/userApi";
import { axiosInstance } from "../../../api/lib/axios";
import { getMyFollowers, getMyFollowing } from "../../../api/publicAPI/followerApi";
import { getMyLikedVideos } from "../../../api/publicAPI/likeApi";
import { getMySavedVideos } from "../../../api/publicAPI/savedVideoApi";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");
  const [userData, setUserData] = useState(null);
  const [userVideos, setUserVideos] = useState([]);
  const [likedVideos, setLikedVideos] = useState([]);
  const [savedVideos, setSavedVideos] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
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
      } catch {
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
      } catch {
        setFollowers([]);
        setFollowing([]);
      }
      
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedVideos = async () => {
    if (likedVideos.length > 0) return; // Already loaded
    
    try {
      const data = await getMyLikedVideos(0, 50);
      setLikedVideos(data.videos || []);
    } catch {
      setLikedVideos([]);
      toast.error("Could not load liked videos");
    }
  };

  const fetchSavedVideos = async () => {
    if (savedVideos.length > 0) return; // Already loaded
    
    try {
      const data = await getMySavedVideos(0, 50);
      setSavedVideos(data.videos || []);
    } catch {
      setSavedVideos([]);
      toast.error("Could not load saved videos");
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "liked") {
      fetchLikedVideos();
    } else if (tab === "saved") {
      fetchSavedVideos();
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Confirmation dialog
    if (!window.confirm('Do you want to change your avatar?')) {
      return;
    }

    try {
      setUploadingAvatar(true);
      const result = await uploadAvatar(file);
      setUserData(prev => ({ ...prev, avatar_url: result.avatar_url }));
      toast.success('Avatar updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      await deleteAvatar();
      setUserData(prev => ({ ...prev, avatar_url: null }));
      toast.success('Avatar removed');
    } catch (error) {
      toast.error('Failed to remove avatar');
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
            <div className="bg-card rounded-lg border border-border p-6 mb-6">
              <div className="flex flex-col items-center gap-4">
                {/* Avatar and Name */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10">
                      {userData.avatar_url ? (
                        <img 
                          src={userData.avatar_url} 
                          alt={userData.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-12 h-12 text-primary" />
                        </div>
                      )}
                    </div>
                    {/* Avatar Upload Overlay */}
                    <button
                      onClick={handleAvatarClick}
                      disabled={uploadingAvatar}
                      className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                    >
                      {uploadingAvatar ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      ) : (
                        <Camera className="w-6 h-6 text-white" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  {userData.avatar_url && (
                    <button
                      onClick={handleDeleteAvatar}
                      className="text-xs text-destructive hover:underline"
                    >
                      Remove avatar
                    </button>
                  )}
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-foreground">
                      {userData.display_name || userData.username}
                    </h1>
                    <p className="text-muted-foreground">@{userData.username}</p>
                  </div>
                </div>

                {/* Followers and Following Row */}
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setShowFollowersModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span className="font-semibold">{followers.length}</span>
                    <span className="text-muted-foreground">Followers</span>
                  </button>
                  <button
                    onClick={() => setShowFollowingModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="font-semibold">{following.length}</span>
                    <span className="text-muted-foreground">Following</span>
                  </button>
                </div>

                {/* Videos and Views Stats */}
                <div className="flex items-center gap-8 text-center pt-2 border-t border-border w-full justify-center">
                  <div>
                    <div className="flex items-center gap-2 text-foreground">
                      <Video className="w-4 h-4 text-muted-foreground" />
                      <span className="text-lg font-bold">{userVideos.length}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Videos</div>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div>
                    <div className="flex items-center gap-2 text-foreground">
                      <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-lg font-bold">{formatViews(userData.total_views || 0)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">Total Views</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border mb-6">
              <button
                onClick={() => handleTabChange("videos")}
                className={`pb-3 px-4 text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === "videos"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Videos</span>
                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{userVideos.length}</span>
              </button>
              <button
                onClick={() => handleTabChange("liked")}
                className={`pb-3 px-4 text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === "liked"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Liked</span>
                {likedVideos.length > 0 && (
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{likedVideos.length}</span>
                )}
              </button>
              <button
                onClick={() => handleTabChange("saved")}
                className={`pb-3 px-4 text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === "saved"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Saved</span>
                {savedVideos.length > 0 && (
                  <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{savedVideos.length}</span>
                )}
              </button>
            </div>

            {/* Content */}
            {currentContent.length === 0 ? (
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {currentContent.map((video) => (
                  <Link key={video.id} to={`/watch/${video.id}`} className="group">
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      {video.thumbnail_url ? (
                        <img 
                          src={video.thumbnail_url} 
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                          <Video className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                          {formatDuration(video.duration)}
                        </div>
                      )}
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
            )}
          </>
        )}
      </main>

      {/* Followers Modal */}
      {showFollowersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFollowersModal(false)}
          />
          <div className="relative bg-card rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5" />
                Followers ({followers.length})
              </h3>
              <button
                onClick={() => setShowFollowersModal(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
              {followers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Users className="w-12 h-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-center">No followers yet</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {followers.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {item.follower_display_name || item.follower_username}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">@{item.follower_username}</p>
                      </div>
                      <Link
                        to={`/user/${item.follower_id}`}
                        onClick={() => setShowFollowersModal(false)}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFollowingModal(false)}
          />
          <div className="relative bg-card rounded-lg w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Following ({following.length})
              </h3>
              <button
                onClick={() => setShowFollowingModal(false)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
              {following.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <UserPlus className="w-12 h-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-center">Not following anyone yet</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {following.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 hover:bg-secondary rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {item.following_display_name || item.following_username}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">@{item.following_username}</p>
                      </div>
                      <Link
                        to={`/user/${item.following_id}`}
                        onClick={() => setShowFollowingModal(false)}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
