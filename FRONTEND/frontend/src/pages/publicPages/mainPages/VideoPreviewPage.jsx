
import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Menu, X, Search, Home, Grid, Upload, User, Settings, FileText, Shield, LogOut, ThumbsUp, ThumbsDown, Bookmark, BookmarkCheck, Share2, ChevronDown, ChevronUp, Play, Send, UserPlus, UserCheck } from "lucide-react";
import { useAuthorizer } from "../../../Auth/Authorizer";
import { getVideoById, incrementVideoView, getTrendingVideos } from "../../../api/publicAPI/videoApi";
import { likeVideo, removeLike, getLikeStatus } from "../../../api/publicAPI/likeApi";
import { createComment, getVideoComments, updateComment, deleteComment } from "../../../api/publicAPI/commentApi";
import { saveVideo, unsaveVideo, getSaveStatus } from "../../../api/publicAPI/savedVideoApi";
import { followUser, unfollowUser, checkIsFollowing } from "../../../api/publicAPI/followerApi";
import toast from "react-hot-toast";

const VideoPreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuthorizer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interactive features state
  const [likeStatus, setLikeStatus] = useState(null); // null, 'like', or 'dislike'
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);
  const [localDislikes, setLocalDislikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [deletingComment, setDeletingComment] = useState(null);
  // Edit comment handler
  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setEditText(comment.text);
  };

  const handleEditCommentSubmit = async (e) => {
    e.preventDefault();
    if (!editingComment) return;
    try {
      await updateComment(editingComment.id, editText);
      toast.success('Comment updated!');
      setEditingComment(null);
      setEditText('');
      // Refresh comments
      const data = await getVideoComments(id);
      setComments(data.comments || []);
    } catch {
      toast.error('Could not update comment');
    }
  };

  // Delete comment handler
  const handleDeleteComment = (comment) => {
    setDeletingComment(comment);
  };

  const confirmDeleteComment = async () => {
    if (!deletingComment) return;
    try {
      await deleteComment(deletingComment.id);
      toast.success('Comment deleted!');
      setDeletingComment(null);
      // Refresh comments
      const data = await getVideoComments(id);
      setComments(data.comments || []);
      setVideo(prev => ({ ...prev, comments_count: Math.max(0, (prev?.comments_count || 1) - 1) }));
    } catch {
      toast.error('Could not delete comment');
    }
  };

  const cancelDeleteComment = () => setDeletingComment(null);
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const videoData = await getVideoById(id);
        setVideo(videoData);
        setLocalLikes(videoData.likes || 0);
        setLocalDislikes(videoData.dislikes || 0);
        await incrementVideoView(id).catch(() => {});
      } catch {
        toast.error('Video not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    const fetchRelatedVideos = async () => {
      try {
        const data = await getTrendingVideos(8);
        setRelatedVideos(data.videos || []);
      } catch {
        setRelatedVideos([]);
      }
    };
    const fetchComments = async () => {
      try {
        const data = await getVideoComments(id);
        setComments(data.comments || []);
      } catch {
        setComments([]);
      }
    };
    const fetchLikeStatus = async () => {
      try {
        const data = await getLikeStatus(id);
        setLikeStatus(data.like_type || null);
      } catch {
        setLikeStatus(null);
      }
    };
    const fetchSaveStatus = async () => {
      try {
        const data = await getSaveStatus(id);
        setIsSaved(data.saved || false);
      } catch {
        setIsSaved(false);
      }
    };
    if (id) {
      fetchVideo();
      fetchRelatedVideos();
      fetchComments();
      if (isAuthenticated) {
        fetchLikeStatus();
        fetchSaveStatus();
      }
    }
  }, [id, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!video?.uploader_id) return;
      try {
        const data = await checkIsFollowing(video.uploader_id);
        setIsFollowing(data.is_following || false);
      } catch {
        setIsFollowing(false);
      }
    };
    if (video && video.uploader_id && isAuthenticated && user) {
      if (video.uploader_id !== user.user_id) {
        fetchFollowStatus();
      }
    }
  }, [video, isAuthenticated, user]);

  const fetchVideo = async () => {
    try {
      setLoading(true);
      const videoData = await getVideoById(id);
      setVideo(videoData);
      setLocalLikes(videoData.likes || 0);
      setLocalDislikes(videoData.dislikes || 0);
      
      // Increment view count
      await incrementVideoView(id).catch(() => {});
    } catch {
      toast.error('Video not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedVideos = async () => {
    try {
      const data = await getTrendingVideos(8);
      setRelatedVideos(data.videos || []);
    } catch {
      setRelatedVideos([]);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await getVideoComments(id);
      setComments(data.comments || []);
    } catch {
      setComments([]);
    }
  };

  const fetchLikeStatus = async () => {
    try {
      const data = await getLikeStatus(id);
      setLikeStatus(data.like_type || null);
    } catch {
      // User not authenticated or error fetching
      setLikeStatus(null);
    }
  };

  const fetchSaveStatus = async () => {
    try {
      const data = await getSaveStatus(id);
      setIsSaved(data.saved || false);
    } catch {
      // User not authenticated or error fetching
      setIsSaved(false);
    }
  };

  const fetchFollowStatus = async () => {
    if (!video?.uploader_id) return;
    
    try {
      const data = await checkIsFollowing(video.uploader_id);
      setIsFollowing(data.is_following || false);
    } catch {
      setIsFollowing(false);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to follow creators');
      return;
    }

    if (!video?.uploader_id) return;

    try {
      if (isFollowing) {
        await unfollowUser(video.uploader_id);
        setIsFollowing(false);
        toast.success('Unfollowed');
        setVideo(prev => prev ? {
          ...prev,
          uploader_followers_count: Math.max(0, (prev.uploader_followers_count || 1) - 1)
        } : prev);
      } else {
        await followUser(video.uploader_id);
        setIsFollowing(true);
        toast.success('Following!');
        setVideo(prev => prev ? {
          ...prev,
          uploader_followers_count: (prev.uploader_followers_count || 0) + 1
        } : prev);
      }
    } catch {
      toast.error('Could not update follow status');
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to like videos');
      return;
    }

    try {
      if (likeStatus === 'like') {
        await removeLike(id);
        setLikeStatus(null);
        setLocalLikes(prev => Math.max(0, prev - 1));
      } else {
        if (likeStatus === 'dislike') {
          setLocalDislikes(prev => Math.max(0, prev - 1));
        }
        await likeVideo(id, 'like');
        setLikeStatus('like');
        setLocalLikes(prev => prev + 1);
      }
    } catch {
      toast.error('Could not update like');
    }
  };

  const handleDislike = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to dislike videos');
      return;
    }

    try {
      if (likeStatus === 'dislike') {
        await removeLike(id);
        setLikeStatus(null);
        setLocalDislikes(prev => Math.max(0, prev - 1));
      } else {
        if (likeStatus === 'like') {
          setLocalLikes(prev => Math.max(0, prev - 1));
        }
        await likeVideo(id, 'dislike');
        setLikeStatus('dislike');
        setLocalDislikes(prev => prev + 1);
      }
    } catch {
      toast.error('Could not update dislike');
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save videos');
      return;
    }

    try {
      if (isSaved) {
        await unsaveVideo(id);
        setIsSaved(false);
        toast.success('Removed from saved');
      } else {
        await saveVideo(id);
        setIsSaved(true);
        toast.success('Video saved!');
      }
    } catch {
      toast.error('Could not update saved status');
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
    setShowShareModal(false);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to comment');
      return;
    }
    if (!commentText.trim()) {
      return;
    }
    try {
      setSubmittingComment(true);
      await createComment(id, commentText);
      setCommentText('');
      toast.success('Comment posted!');
      // Re-fetch comments after posting
      const data = await getVideoComments(id);
      setComments(data.comments || []);
      setVideo(prev => ({
        ...prev,
        comments_count: (prev?.comments_count || 0) + 1
      }));
    } catch {
      toast.error('Could not post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views?.toString() || '0';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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


      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : video ? (
        <main className="max-w-[1280px] mx-auto">
          {/* Top Section: Title, Views, Duration, Date */}
          <div className="px-2 sm:px-3 md:px-4 pt-6 pb-2">
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">
              {video.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
              <span>{formatViews(video.views)} views</span>
              {video.duration && <span>{formatDuration(video.duration)}</span>}
              <span>{formatDate(video.created_at || video.published_at)}</span>
            </div>
          </div>

          {/* Video Player */}
          <div className="aspect-video bg-black">
            {video.video_url ? (
              <video
                className="w-full h-full"
                controls
                autoPlay
                poster={video.thumbnail_url}
              >
                <source src={video.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Play className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Uploader Info */}
          {video.uploader_username && (
            <div className="px-2 sm:px-3 md:px-4 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Link 
                    to={`/user/${video.uploader_id}`}
                    className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0 overflow-hidden"
                  >
                    {video.uploader_profile_picture ? (
                      <img src={video.uploader_profile_picture} alt={video.uploader_username} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-primary" />
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/user/${video.uploader_id}`}
                      className="font-semibold text-foreground hover:text-primary transition-colors block truncate"
                    >
                      {video.uploader_display_name || video.uploader_username}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {video.uploader_followers_count ? `${video.uploader_followers_count} followers` : 'Content Creator'}
                    </p>
                  </div>
                </div>
                {isAuthenticated && user && video.uploader_id !== user.user_id && (
                  <button
                    onClick={handleFollow}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all flex-shrink-0 ${
                      isFollowing
                        ? 'bg-secondary text-foreground hover:bg-secondary/80'
                        : 'bg-primary text-primary-foreground hover:opacity-90'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="px-2 sm:px-3 md:px-4 py-4 border-b border-border">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 transition-colors ${
                  likeStatus === 'like' 
                    ? 'text-primary' 
                    : 'text-foreground hover:text-primary'
                }`}
              >
                <ThumbsUp className={`w-5 h-5 ${likeStatus === 'like' ? 'fill-current' : ''}`} />
                <span className="text-sm">{formatViews(localLikes)}</span>
              </button>
              <button 
                onClick={handleDislike}
                className={`flex items-center gap-2 transition-colors ${
                  likeStatus === 'dislike' 
                    ? 'text-destructive' 
                    : 'text-foreground hover:text-destructive'
                }`}
              >
                <ThumbsDown className={`w-5 h-5 ${likeStatus === 'dislike' ? 'fill-current' : ''}`} />
                <span className="text-sm">{formatViews(localDislikes)}</span>
              </button>
              <button 
                onClick={handleSave}
                className={`flex items-center gap-2 transition-colors ${
                  isSaved 
                    ? 'text-primary' 
                    : 'text-foreground hover:text-primary'
                }`}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-5 h-5 fill-current" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
                <span className="text-sm">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm">Share</span>
              </button>
              <Link to="/report" className="ml-auto text-sm text-muted-foreground hover:text-primary transition-colors">
                Report
              </Link>
            </div>
          </div>

          {/* Description */}
          {video.description && (
            <div className="px-2 sm:px-3 md:px-4 py-4 border-b border-border">
              <button
                onClick={() => setDescriptionOpen(!descriptionOpen)}
                className="flex items-center gap-2 text-foreground font-medium"
              >
                Description
                {descriptionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {descriptionOpen && (
                <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
                  {video.description}
                </p>
              )}
            </div>
          )}

          {/* Categories */}
          {video.categories && video.categories.length > 0 && (
            <div className="px-2 sm:px-3 md:px-4 py-2">
              <div className="font-medium text-foreground mb-1">Categories:</div>
              <div className="flex flex-wrap gap-2">
                {video.categories.map((cat, idx) => (
                  <span key={idx} className="text-xs bg-secondary text-foreground px-2 py-1 rounded hover:bg-secondary/80 transition-colors">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="px-2 sm:px-3 md:px-4 py-2">
              <div className="font-medium text-foreground mb-1">Tags:</div>
              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs bg-secondary text-foreground px-2 py-1 rounded hover:bg-secondary/80 transition-colors">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments (toggleable) */}
          <div className="py-4 border-b border-border">
            <button
              onClick={() => setCommentsOpen((open) => !open)}
              className="flex items-center gap-2 text-foreground font-medium mb-4"
            >
              Comments ({video.comments_count || 0})
              {commentsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {commentsOpen && (
              <>
                {/* Comment Input */}
                {isAuthenticated ? (
                  <form onSubmit={handleSubmitComment} className="mb-6">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-secondary rounded-full flex-shrink-0 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Add a comment..."
                          className="w-full px-3 py-2 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                          rows="2"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => setCommentText('')}
                            className="px-4 py-1.5 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={submittingComment || !commentText.trim()}
                            className="flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send className="w-4 h-4" />
                            {submittingComment ? 'Posting...' : 'Comment'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="mb-6 p-4 bg-secondary rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-2">Sign in to leave a comment</p>
                    <Link to="/login" className="text-sm text-primary hover:underline">
                      Login
                    </Link>
                  </div>
                )}
                {/* Comments List */}
                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment) => {
                      const isCurrentUser = user && (comment.user_id === user.user_id || comment.user_id === user.id);
                      const profileLink = isCurrentUser ? "/profile" : `/user/${comment.user_id}`;
                      return (
                        <div key={comment.id} className="flex gap-3">
                          <Link
                            to={profileLink}
                            className="w-8 h-8 bg-secondary rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform"
                          >
                            {comment.user_profile_picture ? (
                              <img src={comment.user_profile_picture} alt={comment.username || 'User'} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-primary" />
                            )}
                          </Link>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Link
                                to={profileLink}
                                className="text-sm font-medium text-foreground hover:text-primary transition-colors block truncate"
                              >
                                {comment.username || 'User'}
                              </Link>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-foreground mt-1">{comment.text}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <button className="text-xs text-muted-foreground hover:text-foreground">
                                Reply
                              </button>
                              {isCurrentUser && (
                                <>
                                  <button
                                    className="text-xs px-2 py-1 rounded bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors font-medium"
                                    onClick={() => handleEditComment(comment)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20 transition-colors font-medium"
                                    onClick={() => handleDeleteComment(comment)}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                                  {/* Edit Comment Modal */}
                                  {editingComment && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                                      <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-md border border-border">
                                        <h3 className="font-semibold text-lg mb-4 text-foreground">Edit Comment</h3>
                                        <form onSubmit={handleEditCommentSubmit}>
                                          <textarea
                                            value={editText}
                                            onChange={e => setEditText(e.target.value)}
                                            className="w-full px-3 py-2 bg-secondary text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-4"
                                            rows="3"
                                            autoFocus
                                          />
                                          <div className="flex justify-end gap-2">
                                            <button
                                              type="button"
                                              onClick={() => setEditingComment(null)}
                                              className="px-4 py-1.5 text-sm text-foreground bg-secondary rounded-lg border border-border hover:bg-secondary/80 transition-colors"
                                            >
                                              Cancel
                                            </button>
                                            <button
                                              type="submit"
                                              disabled={!editText.trim()}
                                              className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                              Save
                                            </button>
                                          </div>
                                        </form>
                                      </div>
                                    </div>
                                  )}

                                  {/* Delete Comment Confirmation Modal */}
                                  {deletingComment && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                                      <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-sm border border-border">
                                        <h3 className="font-semibold text-lg mb-4 text-foreground">Delete Comment</h3>
                                        <p className="mb-6 text-foreground">Are you sure you want to delete this comment?</p>
                                        <div className="flex justify-end gap-2">
                                          <button
                                            type="button"
                                            onClick={cancelDeleteComment}
                                            className="px-4 py-1.5 text-sm text-foreground bg-secondary rounded-lg border border-border hover:bg-secondary/80 transition-colors"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            type="button"
                                            onClick={confirmDeleteComment}
                                            className="px-4 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </>
            )}
          </div>

          {/* Recommended Videos */}
          {relatedVideos.length > 0 && (
            <div className="px-2 sm:px-3 md:px-4 py-4">
              <h2 className="font-medium text-foreground mb-4">Recommended Videos</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {relatedVideos.map((relatedVideo) => (
                  <Link key={relatedVideo.id} to={`/watch/${relatedVideo.id}`} className="group">
                    <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      {relatedVideo.thumbnail_url ? (
                        <img 
                          src={relatedVideo.thumbnail_url} 
                          alt={relatedVideo.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                          <Play className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                        {formatDuration(relatedVideo.duration)}
                      </div>
                    </div>
                    <div className="mt-2">
                      <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {relatedVideo.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">{formatViews(relatedVideo.views)} views</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Video not found</h2>
            <Link to="/" className="text-primary hover:underline">Go back home</Link>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowShareModal(false)}
          />
          <div className="relative bg-card rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Share Video</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={copyLink}
                className="w-full flex items-center gap-3 px-4 py-3 bg-secondary hover:bg-muted rounded-lg transition-colors"
              >
                <Share2 className="w-5 h-5 text-foreground" />
                <span className="text-foreground">Copy Link</span>
              </button>
              
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(video?.title || 'Check out this video!')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3 bg-secondary hover:bg-muted rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-foreground">Share on Twitter</span>
              </a>
              
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3 bg-secondary hover:bg-muted rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-foreground">Share on Facebook</span>
              </a>
              
              <a
                href={`https://wa.me/?text=${encodeURIComponent((video?.title || 'Check out this video!') + ' ' + window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3 bg-secondary hover:bg-muted rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="text-foreground">Share on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPreviewPage;
