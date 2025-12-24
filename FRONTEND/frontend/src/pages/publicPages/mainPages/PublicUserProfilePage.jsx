
import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { User, Video, Users, UserPlus, UserCheck, Menu, X, Search, Home, Grid, Upload as UploadIcon, Settings, FileText, Shield, LogOut } from "lucide-react";
import { axiosInstance } from "../../../api/lib/axios";
import VideoCard from "../../../components/VideoCard";
import { getUserFollowers, getUserFollowing, checkIsFollowing, followUser, unfollowUser } from "../../../api/publicAPI/followerApi";
import { useAuthorizer } from "../../../Auth/Authorizer";
import toast from "react-hot-toast";


const PublicUserProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser, isAuthenticated } = useAuthorizer();
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [userRes, videosRes, followersRes, followingRes] = await Promise.all([
          axiosInstance.get(`/users/${id}`),
          axiosInstance.get(`/videos/user/${id}`),
          getUserFollowers(id),
          getUserFollowing(id)
        ]);
        setUser(userRes.data);
        setVideos(videosRes.data.videos || []);
        setFollowers(followersRes || []);
        setFollowing(followingRes || []);
      } catch {
        setUser(null);
        setVideos([]);
        setFollowers([]);
        setFollowing([]);
      }
      setLoading(false);
    };
    fetchAll();
  }, [id]);

  useEffect(() => {
    const checkFollow = async () => {
      if (!isAuthenticated || !currentUser || currentUser.user_id === id) {
        setIsFollowing(false);
        return;
      }
      try {
        const res = await checkIsFollowing(id);
        setIsFollowing(res.is_following || false);
      } catch {
        setIsFollowing(false);
      }
    };
    checkFollow();
  }, [id, isAuthenticated, currentUser]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to follow users");
      return;
    }
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(id);
        setIsFollowing(false);
        setFollowers(f => f.filter(fol => fol.follower_id !== currentUser.user_id));
      } else {
        await followUser(id);
        setIsFollowing(true);
        setFollowers(f => [...f, { follower_id: currentUser.user_id }]);
      }
    } catch (e) {
      toast.error("Could not update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20">Loading...</div>;
  if (!user) return <div className="flex justify-center py-20">User not found</div>;

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
      {/* Slide-in Menu - same as ProfilePage */}
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
              <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-destructive hover:bg-secondary rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </Link>
            </nav>
          </div>
        </div>
      )}
      <main className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4 py-6">
        <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 relative">
              {user.profile_picture ? (
                <img src={user.profile_picture} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-primary" />
                </div>
              )}
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">{user.display_name || user.username}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
              <div className="min-h-[32px] mt-4 mb-2 w-full text-center px-2">
                {user.bio ? (
                  <span className="text-muted-foreground text-base break-words leading-relaxed">{user.bio}</span>
                ) : (
                  <span className="text-muted-foreground text-xs italic">No bio set</span>
                )}
              </div>
              {isAuthenticated && currentUser && currentUser.user_id !== id && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={followLoading ? undefined : handleFollow}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-base font-semibold shadow transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40 ${isFollowing ? "bg-muted text-foreground hover:bg-muted/80 border border-border" : "bg-primary text-white hover:bg-primary/80"}`}
                    style={{ minWidth: 140 }}
                    disabled={followLoading}
                  >
                    {isFollowing ? <UserCheck size={22} /> : <UserPlus size={22} />}
                    {followLoading ? (isFollowing ? "Unfollowing..." : "Following...") : (isFollowing ? "Following" : "Follow")}
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Followers and Following Row */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
              <Users className="w-4 h-4" />
              <span className="font-semibold">{followers.length}</span>
              <span className="text-muted-foreground">Followers</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
              <UserPlus className="w-4 h-4" />
              <span className="font-semibold">{following.length}</span>
              <span className="text-muted-foreground">Following</span>
            </div>
          </div>
          {/* Videos and Views Stats */}
          <div className="flex items-center gap-8 text-center pt-2 border-t border-border w-full justify-center mt-4">
            <div>
              <div className="flex items-center gap-2 text-foreground">
                <Video className="w-4 h-4 text-muted-foreground" />
                <span className="text-lg font-bold">{videos.length}</span>
              </div>
              <div className="text-sm text-muted-foreground">Videos</div>
            </div>
            {/* Optionally add total views if available */}
            {typeof user.total_views !== 'undefined' && (
              <>
                <div className="w-px h-8 bg-border" />
                <div>
                  <div className="flex items-center gap-2 text-foreground">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="text-lg font-bold">{user.total_views || 0}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Total Views</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
        {/* Videos Grid - dark section like ProfilePage */}
        <div className="mt-8">
          <div className="bg-muted rounded-xl p-6">
            {videos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="bg-secondary/50 rounded-full p-8 mb-6">
                  <Video className="w-16 h-16 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No videos yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">This user hasn't uploaded any videos yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {videos.map((video) => (
                  <div className="bg-card rounded-lg overflow-hidden shadow border border-border" key={video.id || video._id}>
                    <VideoCard video={video} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicUserProfilePage;
