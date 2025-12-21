import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVideoDetails, updateVideo, deleteVideo } from '../../../api/adminAPI/videoApi';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Edit2, Trash2, Eye, ThumbsUp, ThumbsDown, MessageCircle, 
  Clock, Star, Crown, Lock, Download, MessageSquare, Calendar, User,
  Tag, Folder, Settings, PlayCircle, Image
} from 'lucide-react';

export default function VideoDetailPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [toggleLoading, setToggleLoading] = useState({
    premium: false,
    comments: false,
    downloads: false,
    featured: false
  });

  const fetchVideoDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getVideoDetails(videoId);
      setVideo(data);
      setEditFormData(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchVideoDetails();
  }, [fetchVideoDetails]);

  const handleUpdateVideo = async (e) => {
    e.preventDefault();
    try {
      await updateVideo(videoId, editFormData);
      toast.success('Video updated successfully');
      setShowEditModal(false);
      fetchVideoDetails();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteVideo = async () => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteVideo(videoId);
      toast.success('Video deleted successfully');
      navigate('/admin/videos');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updatedVideo = { ...video, status: newStatus };
      setVideo(updatedVideo);
      await updateVideo(videoId, updatedVideo);
      toast.success(`Video status changed to ${newStatus}`);
    } catch (error) {
      toast.error(error.message);
      fetchVideoDetails();
    }
  };

  const handleFeatureToggle = async () => {
    if (toggleLoading.featured) return;
    
    setToggleLoading(prev => ({ ...prev, featured: true }));
    const newValue = !video.is_featured;
    
    try {
      setVideo({ ...video, is_featured: newValue });
      await updateVideo(videoId, { ...video, is_featured: newValue });
      toast.success(newValue ? 'Video featured' : 'Video unfeatured');
    } catch (error) {
      toast.error(error.message);
      setVideo({ ...video, is_featured: !newValue });
    } finally {
      setToggleLoading(prev => ({ ...prev, featured: false }));
    }
  };

  const handleTogglePremium = async () => {
    if (toggleLoading.premium) return;
    
    setToggleLoading(prev => ({ ...prev, premium: true }));
    const newValue = !video.is_premium;
    
    try {
      setVideo({ ...video, is_premium: newValue });
      await updateVideo(videoId, { ...video, is_premium: newValue });
      toast.success(newValue ? 'Premium enabled' : 'Premium disabled');
    } catch (error) {
      toast.error(error.message);
      setVideo({ ...video, is_premium: !newValue });
    } finally {
      setToggleLoading(prev => ({ ...prev, premium: false }));
    }
  };

  const handleToggleComments = async () => {
    if (toggleLoading.comments) return;
    
    setToggleLoading(prev => ({ ...prev, comments: true }));
    const newValue = !video.allow_comments;
    
    try {
      setVideo({ ...video, allow_comments: newValue });
      await updateVideo(videoId, { ...video, allow_comments: newValue });
      toast.success(newValue ? 'Comments enabled' : 'Comments disabled');
    } catch (error) {
      toast.error(error.message);
      setVideo({ ...video, allow_comments: !newValue });
    } finally {
      setToggleLoading(prev => ({ ...prev, comments: false }));
    }
  };

  const handleToggleDownloads = async () => {
    if (toggleLoading.downloads) return;
    
    setToggleLoading(prev => ({ ...prev, downloads: true }));
    const newValue = !video.allow_downloads;
    
    try {
      setVideo({ ...video, allow_downloads: newValue });
      await updateVideo(videoId, { ...video, allow_downloads: newValue });
      toast.success(newValue ? 'Downloads enabled' : 'Downloads disabled');
    } catch (error) {
      toast.error(error.message);
      setVideo({ ...video, allow_downloads: !newValue });
    } finally {
      setToggleLoading(prev => ({ ...prev, downloads: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground">Loading video details...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="text-center">
          <p className="text-lg sm:text-xl text-muted-foreground mb-4">Video not found</p>
          <button
            onClick={() => navigate('/admin/videos')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            Back to Videos
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 lg:p-6">
      {/* Mobile-First Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            onClick={() => navigate('/admin/videos')}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-card border border-border text-foreground rounded-lg hover:bg-secondary transition-colors w-full sm:w-auto justify-center sm:justify-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm sm:text-base">Back to Videos</span>
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 sm:px-4 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-sm sm:text-base">Edit</span>
            </button>
            <button
              onClick={handleDeleteVideo}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 sm:px-4 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-sm sm:text-base">Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Video Player Card */}
      <div className="bg-card border border-border rounded-lg overflow-hidden mb-4 sm:mb-6">
        <div className="aspect-video bg-black">
          <video
            src={video.video_url}
            poster={video.thumbnail_url}
            controls
            className="w-full h-full"
          />
        </div>
        <div className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{video.title}</h1>
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${
                video.status === 'published' ? 'bg-green-900 text-green-300' :
                video.status === 'processing' ? 'bg-yellow-900 text-yellow-300' :
                video.status === 'private' ? 'bg-gray-800 text-gray-300' :
                video.status === 'unlisted' ? 'bg-blue-900 text-blue-300' :
                'bg-red-900 text-red-300'
              }`}>
                {video.status}
              </span>
              {video.is_featured && (
                <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-900 text-purple-300 flex items-center gap-1">
                  <Star className="w-3 h-3" /> Featured
                </span>
              )}
              {video.is_premium && (
                <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-yellow-900 text-yellow-300 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Premium
                </span>
              )}
            </div>
          </div>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground leading-relaxed">{video.description}</p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
            <div className="text-xs sm:text-sm text-gray-400">Views</div>
          </div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{video.views || 0}</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1">
            <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
            <div className="text-xs sm:text-sm text-gray-400">Likes</div>
          </div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-400">{video.likes || 0}</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1">
            <ThumbsDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
            <div className="text-xs sm:text-sm text-gray-400">Dislikes</div>
          </div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-400">{video.dislikes || 0}</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
            <div className="text-xs sm:text-sm text-gray-400">Comments</div>
          </div>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-400">{video.comments_count || 0}</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        {/* Quick Actions Card */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground">Quick Actions</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs sm:text-sm text-muted-foreground mb-2">Change Status</label>
              <select
                value={video.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="published">Published</option>
                <option value="processing">Processing</option>
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
            <button
              onClick={handleFeatureToggle}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base transition-opacity ${
                video.is_featured
                  ? 'bg-primary text-primary-foreground hover:opacity-90'
                  : 'bg-secondary text-foreground hover:opacity-90'
              }`}
            >
              <Star className="w-4 h-4" />
              {video.is_featured ? 'Unfeature Video' : 'Feature Video'}
            </button>
          </div>
        </div>

        {/* Video Information Card */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground">Video Information</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs sm:text-sm text-muted-foreground">Duration</div>
                <div className="text-sm sm:text-base text-foreground">{video.duration || 'N/A'}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs sm:text-sm text-muted-foreground">Content Rating</div>
                <div className="text-sm sm:text-base text-foreground">{video.content_rating || 'Not rated'}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs sm:text-sm text-muted-foreground">Uploader</div>
                <div className="text-sm sm:text-base text-foreground">{video.uploader_name || 'Unknown'}</div>
                {video.uploader_email && (
                  <div className="text-xs sm:text-sm text-muted-foreground">{video.uploader_email}</div>
                )}
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs sm:text-sm text-muted-foreground">Uploaded</div>
                <div className="text-sm sm:text-base text-foreground">{formatDate(video.created_at)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories & Tags Card */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground">Categories & Tags</h2>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-2">
                <Folder className="w-3 h-3 sm:w-4 sm:h-4" />
                Categories
              </div>
              <div className="flex flex-wrap gap-2">
                {video.categories && video.categories.length > 0 ? (
                  video.categories.map((cat, idx) => (
                    <span key={idx} className="px-2 py-1 bg-secondary text-foreground rounded text-xs sm:text-sm">
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-xs sm:text-sm text-muted-foreground">No categories</span>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-2">
                <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {video.tags && video.tags.length > 0 ? (
                  video.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs sm:text-sm">
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs sm:text-sm text-muted-foreground">No tags</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Settings Card */}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground">Content Settings</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 sm:p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-xs sm:text-sm text-foreground">Premium Content</span>
              </div>
              <button
                onClick={handleTogglePremium}
                disabled={toggleLoading.premium}
                className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium cursor-pointer transition-all duration-300 transform ${
                  video.is_premium 
                    ? 'bg-yellow-600 text-white hover:opacity-90 scale-100' 
                    : 'bg-muted text-muted-foreground hover:opacity-90'
                } ${toggleLoading.premium ? 'opacity-50 scale-95' : ''}`}
              >
                {toggleLoading.premium ? (
                  <span className="flex items-center gap-1">
                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                ) : video.is_premium ? 'Yes' : 'No'}
              </button>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span className="text-xs sm:text-sm text-foreground">Allow Comments</span>
              </div>
              <button
                onClick={handleToggleComments}
                disabled={toggleLoading.comments}
                className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium cursor-pointer transition-all duration-300 transform ${
                  video.allow_comments 
                    ? 'bg-green-600 text-white hover:opacity-90 scale-100' 
                    : 'bg-muted text-muted-foreground hover:opacity-90'
                } ${toggleLoading.comments ? 'opacity-50 scale-95' : ''}`}
              >
                {toggleLoading.comments ? (
                  <span className="flex items-center gap-1">
                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                ) : video.allow_comments ? 'On' : 'Off'}
              </button>
            </div>
            <div className="flex items-center justify-between p-2 sm:p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-green-400" />
                <span className="text-xs sm:text-sm text-foreground">Allow Downloads</span>
              </div>
              <button
                onClick={handleToggleDownloads}
                disabled={toggleLoading.downloads}
                className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium cursor-pointer transition-all duration-300 transform ${
                  video.allow_downloads 
                    ? 'bg-green-600 text-white hover:opacity-90 scale-100' 
                    : 'bg-muted text-muted-foreground hover:opacity-90'
                } ${toggleLoading.downloads ? 'opacity-50 scale-95' : ''}`}
              >
                {toggleLoading.downloads ? (
                  <span className="flex items-center gap-1">
                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                ) : video.allow_downloads ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </div>

        {/* URLs Card - Full Width */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4 sm:p-5 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Image className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-foreground">Media URLs</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-secondary rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                <PlayCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                Video URL
              </div>
              <a
                href={video.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-primary hover:underline break-all block"
              >
                {video.video_url}
              </a>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                <Image className="w-3 h-3 sm:w-4 sm:h-4" />
                Thumbnail URL
              </div>
              <a
                href={video.thumbnail_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-primary hover:underline break-all block"
              >
                {video.thumbnail_url}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-card border border-border rounded-lg p-4 sm:p-5 lg:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Edit Video</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateVideo} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm text-muted-foreground mb-1">Title</label>
                <input
                  type="text"
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full bg-secondary text-foreground border border-border rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm text-muted-foreground mb-1">Description</label>
                <textarea
                  value={editFormData.description || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full bg-secondary text-foreground border border-border rounded-lg px-3 py-2 h-24 sm:h-32 text-sm sm:text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm text-muted-foreground mb-1">Duration</label>
                  <input
                    type="text"
                    value={editFormData.duration || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, duration: e.target.value })}
                    placeholder="00:00:00"
                    className="w-full bg-secondary text-foreground border border-border rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm text-muted-foreground mb-1">Content Rating</label>
                  <select
                    value={editFormData.content_rating || 'G'}
                    onChange={(e) => setEditFormData({ ...editFormData, content_rating: e.target.value })}
                    className="w-full bg-secondary text-foreground border border-border rounded-lg px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="G">G</option>
                    <option value="PG">PG</option>
                    <option value="PG-13">PG-13</option>
                    <option value="R">R</option>
                    <option value="NC-17">NC-17</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2 bg-secondary rounded-lg p-3 sm:p-4">
                <label className="flex items-center gap-2 text-xs sm:text-sm text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.is_premium || false}
                    onChange={(e) => setEditFormData({ ...editFormData, is_premium: e.target.checked })}
                    className="rounded"
                  />
                  <Crown className="w-4 h-4 text-yellow-400" />
                  Premium Content
                </label>
                <label className="flex items-center gap-2 text-xs sm:text-sm text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.is_featured || false}
                    onChange={(e) => setEditFormData({ ...editFormData, is_featured: e.target.checked })}
                    className="rounded"
                  />
                  <Star className="w-4 h-4 text-purple-400" />
                  Featured Video
                </label>
                <label className="flex items-center gap-2 text-xs sm:text-sm text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.allow_comments !== false}
                    onChange={(e) => setEditFormData({ ...editFormData, allow_comments: e.target.checked })}
                    className="rounded"
                  />
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  Allow Comments
                </label>
                <label className="flex items-center gap-2 text-xs sm:text-sm text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.allow_downloads || false}
                    onChange={(e) => setEditFormData({ ...editFormData, allow_downloads: e.target.checked })}
                    className="rounded"
                  />
                  <Download className="w-4 h-4 text-green-400" />
                  Allow Downloads
                </label>
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-full sm:w-auto px-4 py-2 bg-secondary text-foreground rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
