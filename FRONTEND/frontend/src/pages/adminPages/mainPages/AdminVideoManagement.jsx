import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, Plus, Search, X, Tag as TagIcon, Eye } from "lucide-react";
import { useAuthorizer } from "../../../Auth/Authorizer";
import { createVideo, updateVideo, deleteVideo } from "../../../api/publicAPI/videoApi";
import { getAllVideos as getAllVideosAdmin } from "../../../api/adminAPI/videoApi";
import { getAllCategories, getAllTags } from "../../../api/adminAPI/categoryTagApi";
import toast, { Toaster } from 'react-hot-toast';
import VideoFormModal from "../subPages/VideoFormModal";
import VideoCard from "../subPages/VideoCard";

const AdminVideoManagement = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const { isAdmin, isAuthenticated, loading: authLoading } = useAuthorizer();
  const navigate = useNavigate();

  const [newVideo, setNewVideo] = useState({
    title: "",
    description: "",
    video_url: "",
    thumbnail_url: "",
    duration: 0,
    tags: [],
    categories: [],
    content_rating: "safe",
    status: "published",
    is_premium: false,
    is_featured: false,
    allow_comments: true,
    allow_downloads: false
  });

  const fetchData = useCallback(async () => {
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (searchQuery) filters.search = searchQuery;
      if (categoryFilter) filters.category = categoryFilter;

      const [videosData, categoriesData, tagsData] = await Promise.all([
        getAllVideosAdmin(0, 100, filters),
        getAllCategories(),
        getAllTags()
      ]);
      setVideos(videosData.videos || []);
      setCategories(categoriesData || []);
      setTags(tagsData || []);
    } catch (error) {
      toast.error(error.message, {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(0 72% 51%)'
        }
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, categoryFilter]);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, isAdmin, navigate, fetchData, authLoading]);

  const handleSearch = () => {
    fetchData();
  };

  const handleAddVideo = async () => {
    if (!newVideo.title || !newVideo.video_url) {
      toast.error('Title and video URL are required', {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(0 72% 51%)'
        }
      });
      return;
    }

    try {
      const videoData = {
        ...newVideo,
        duration: parseInt(newVideo.duration) || 0
      };
      
      await createVideo(videoData);
      toast.success('Video added successfully', {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(142 76% 36%)'
        }
      });
      setShowAddModal(false);
      setNewVideo({
        title: "",
        description: "",
        video_url: "",
        thumbnail_url: "",
        duration: 0,
        tags: "",
        categories: [],
        content_rating: "safe",
        status: "published",
        is_premium: false,
        is_featured: false,
        allow_comments: true,
        allow_downloads: false
      });
      fetchData();
    } catch (error) {
      toast.error(error.message, {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(0 72% 51%)'
        }
      });
    }
  };

  const handleUpdateVideo = async () => {
    if (!editingVideo) return;

    try {
      // Remove fields that shouldn't be updated
      // eslint-disable-next-line no-unused-vars
      const { _id, created_at, updated_at, uploader_id, uploader_name, views, likes, dislikes, comments_count, ...updateData } = editingVideo;
      
      // Ensure tags is an array
      if (typeof updateData.tags === 'string') {
        updateData.tags = updateData.tags.split(',').map(t => t.trim()).filter(t => t);
      }
      
      await updateVideo(editingVideo._id, updateData);
      toast.success('Video updated successfully', {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(142 76% 36%)'
        }
      });
      setShowEditModal(false);
      setEditingVideo(null);
      fetchData();
    } catch (error) {
      toast.error(error.message, {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(0 72% 51%)'
        }
      });
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      await deleteVideo(videoId);
      toast.success('Video deleted successfully', {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(142 76% 36%)'
        }
      });
      fetchData();
    } catch (error) {
      toast.error(error.message, {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(0 72% 51%)'
        }
      });
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hrs > 0 
      ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` 
      : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold text-foreground">Admin Panel</span>
            </div>
            <Link 
              to="/admin/dashboard"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Video Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-sm sm:text-base"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Video</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Total Videos</p>
            <p className="text-xl sm:text-2xl font-bold text-foreground">{videos.length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Published</p>
            <p className="text-xl sm:text-2xl font-bold text-green-400">{videos.filter(v => v.status === 'published').length}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-muted-foreground">Private</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-400">{videos.filter(v => v.status === 'private').length}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search videos..."
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-card border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="processing">Processing</option>
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-card border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>

          {(searchQuery || statusFilter || categoryFilter) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("");
                setCategoryFilter("");
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
          {videos.length === 0 ? (
            <div className="col-span-full bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground">No videos found</p>
            </div>
          ) : (
            videos.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                formatDuration={formatDuration}
                onEdit={(video) => {
                  setEditingVideo({
                    ...video,
                    tags: Array.isArray(video.tags) ? video.tags : []
                  });
                  setShowEditModal(true);
                }}
                onDelete={handleDeleteVideo}
              />
            ))
          )}
        </div>
      </main>

      {/* Add Video Modal */}
      {showAddModal && (
        <VideoFormModal
          title="Add New Video"
          video={newVideo}
          setVideo={setNewVideo}
          categories={categories}
          tags={tags}
          onSave={handleAddVideo}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Video Modal */}
      {showEditModal && editingVideo && (
        <VideoFormModal
          title="Edit Video"
          video={editingVideo}
          setVideo={setEditingVideo}
          categories={categories}
          tags={tags}
          onSave={handleUpdateVideo}
          onClose={() => setShowEditModal(false)}
          isEdit
        />
      )}
    </div>
  );
};

export default AdminVideoManagement;
