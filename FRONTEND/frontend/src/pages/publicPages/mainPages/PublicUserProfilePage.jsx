import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { User, Video, Users, UserPlus, UserCheck, Heart } from "lucide-react";
import { axiosInstance } from "../../../api/lib/axios";
import VideoCard from "../../../components/VideoCard";
import { getUserFollowers, getUserFollowing, checkIsFollowing, followUser, unfollowUser } from "../../../api/publicAPI/followerApi";
import { getUserLikedVideos } from "../../../api/publicAPI/likeApi";
import { useAuthorizer } from "../../../Auth/Authorizer";
import toast from "react-hot-toast";
import NavigationBar from "../../../components/NavigationBar";


const PublicUserProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser, isAuthenticated } = useAuthorizer();
  const [user, setUser] = useState(null);
  const [likedVideos, setLikedVideos] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [userRes, likedVideosRes, followersRes, followingRes] = await Promise.all([
          axiosInstance.get(`/users/${id}`),
          getUserLikedVideos(id),
          getUserFollowers(id),
          getUserFollowing(id)
        ]);
        setUser(userRes.data);
        setLikedVideos(likedVideosRes.videos || []);
        setFollowers(followersRes || []);
        setFollowing(followingRes || []);
      } catch {
        setUser(null);
        setLikedVideos([]);
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
      <NavigationBar />
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
            <button
              onClick={() => setShowFollowersModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span className="font-semibold">{followers.length}</span>
              <span className="text-muted-foreground">Followers</span>
            </button>
            <button
              onClick={() => setShowFollowingModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span className="font-semibold">{following.length}</span>
              <span className="text-muted-foreground">Following</span>
            </button>
          </div>
        </div>
      </div>
        {/* Liked Videos Grid */}
        <div className="mt-8">
          <div className="bg-muted rounded-xl p-6">
            {/* Liked Videos Header */}
            {likedVideos.length > 0 && (
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary fill-current" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Liked Videos</h2>
                  <p className="text-sm text-muted-foreground">Videos this user has liked</p>
                </div>
              </div>
            )}
            {likedVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="bg-secondary/50 rounded-full p-8 mb-6">
                  <Heart className="w-16 h-16 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No liked videos yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">This user hasn't liked any videos yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {likedVideos.map((video) => (
                  <div className="bg-card rounded-lg overflow-hidden shadow border border-border" key={video.id || video._id}>
                    <VideoCard video={video} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
                      <Link
                        to={`/user/${item.follower_id}`}
                        onClick={() => setShowFollowersModal(false)}
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                      >
                        {item.follower_avatar_url ? (
                          <img src={item.follower_avatar_url} alt="avatar" className="w-10 h-10 object-cover rounded-full" />
                        ) : (
                          <User className="w-5 h-5 text-muted-foreground" />
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/user/${item.follower_id}`}
                          onClick={() => setShowFollowersModal(false)}
                          className="block"
                        >
                          <h4 className="font-medium text-foreground truncate">
                            {item.follower_display_name || item.follower_username}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">@{item.follower_username || 'unknown'}</p>
                        </Link>
                      </div>
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
                      <Link
                        to={`/user/${item.following_id}`}
                        onClick={() => setShowFollowingModal(false)}
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                      >
                        {item.following_avatar_url ? (
                          <img src={item.following_avatar_url} alt="avatar" className="w-10 h-10 object-cover rounded-full" />
                        ) : (
                          <User className="w-5 h-5 text-muted-foreground" />
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/user/${item.following_id}`}
                          onClick={() => setShowFollowingModal(false)}
                          className="block"
                        >
                          <h4 className="font-medium text-foreground truncate">
                            {item.following_display_name || item.following_username}
                          </h4>
                          <p className="text-sm text-muted-foreground truncate">@{item.following_username || 'unknown'}</p>
                        </Link>
                      </div>
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

export default PublicUserProfilePage;
