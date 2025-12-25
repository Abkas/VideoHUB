import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVideoById, updateVideo, deleteVideo } from '../../../api/publicAPI/videoApi';
import { getAllCategories, getAllTags, createTag } from '../../../api/adminAPI/categoryTagApi';
import toast from 'react-hot-toast';
import { ArrowLeft, Trash2, Pencil, Star, Crown, PlayCircle, Clock, Folder, Tag, Settings, MessageSquare, Download, User, Calendar, Lock, Eye, ThumbsUp, ThumbsDown, MessageCircle, X, Plus } from 'lucide-react';

export default function UserVideosDetail() {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategories, setEditCategories] = useState([]);
  const [editTags, setEditTags] = useState([]);
  const [editLoading, setEditLoading] = useState(false);

  const [allCategories, setAllCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toggleLoading, setToggleLoading] = useState({ premium: false, comments: false, downloads: false, featured: false, visibility: false });

  const [newTagName, setNewTagName] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchVideo() {
      setLoading(true);
      try {
        const data = await getVideoById(videoId);
        if (mounted) setVideo(data);
      } catch (err) {
        toast.error(err?.message || 'Failed to load video');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchVideo();
    return () => { mounted = false; };
  }, [videoId]);

  const fetchMeta = async () => {
    try { const cats = await getAllCategories(true); setAllCategories(cats?.categories || cats || []); } catch {}
    try { const tags = await getAllTags(true); setAllTags(tags?.tags || tags || []); } catch {}
  };

  const openEditModal = async () => {
    await fetchMeta();
    setEditTitle(video?.title || '');
    setEditDescription(video?.description || '');
    // Initialize with slugs for proper matching
    setEditCategories(video?.categories?.map(cat => {
      const category = allCategories.find(c => c.name === cat || c.slug === cat);
      return category?.slug || category?.name || cat;
    }) || []);
    setEditTags(video?.tags?.map(tag => {
      const tagObj = allTags.find(t => t.name === tag || t.slug === tag);
      return tagObj?.slug || tagObj?.name || tag;
    }) || []);
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      // Convert slugs back to names for API
      const categoriesNames = editCategories.map(slug => {
        const category = allCategories.find(c => c.slug === slug || c.name === slug);
        return category?.name || category?.title || slug;
      });
      const tagsNames = editTags.map(slug => {
        const tag = allTags.find(t => t.slug === slug || t.name === slug);
        return tag?.name || tag?.title || slug;
      });

      const updated = { 
        ...video, 
        title: editTitle, 
        description: editDescription, 
        categories: categoriesNames, 
        tags: tagsNames 
      };
      await updateVideo(videoId, updated);
      setVideo(updated);
      toast.success('Video updated');
      setEditModalOpen(false);
    } catch (e) { toast.error(e?.message || 'Update failed'); } finally { setEditLoading(false); }
  };

  const handleDeleteVideo = async () => {
    try { await deleteVideo(videoId); toast.success('Video deleted'); navigate('/profile'); } catch (e) { toast.error(e?.message || 'Delete failed'); } finally { setShowDeleteModal(false); }
  };

  const handleToggle = async (key, field) => {
    if (toggleLoading[key]) return;
    setToggleLoading(prev => ({ ...prev, [key]: true }));
    const newValue = !video[field];
    try { const updated = { ...video, [field]: newValue }; setVideo(updated); await updateVideo(videoId, updated); toast.success(`${field.replace('_', ' ')} ${newValue ? 'enabled' : 'disabled'}`); }
    catch (e) { toast.error(e?.message || 'Update failed'); setVideo(prev => ({ ...prev, [field]: !newValue })); }
    finally { setToggleLoading(prev => ({ ...prev, [key]: false })); }
  };

  const toggleCategory = (categorySlug) => {
    setEditCategories(prev => {
      if (prev.includes(categorySlug)) {
        return prev.filter(slug => slug !== categorySlug);
      } else {
        return [...prev, categorySlug];
      }
    });
  };

  const toggleTag = (tagSlug) => {
    setEditTags(prev => {
      if (prev.includes(tagSlug)) {
        return prev.filter(slug => slug !== tagSlug);
      } else {
        return [...prev, tagSlug];
      }
    });
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim() || creatingTag) return;

    try {
      setCreatingTag(true);
      const slug = newTagName.toLowerCase().replace(/\s+/g, '-');
      const newTag = await createTag({
        name: newTagName.trim(),
        slug,
        is_active: true
      });
      // Add the new tag to the local tags list
      setAllTags(prev => [...prev, newTag]);
      // Auto-select the newly created tag
      setEditTags(prev => [...prev, newTag.slug || newTag.name]);
      setNewTagName('');
      toast.success('Tag created successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to create tag');
    } finally {
      setCreatingTag(false);
    }
  };

  const formatDate = (dateString) => { if (!dateString) return 'N/A'; return new Date(dateString).toLocaleString(); };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading video details...</p>
      </div>
    </div>
  );

  if (!video) return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="text-center">
        <p className="mb-4 text-muted-foreground">Video not found</p>
        <button onClick={() => navigate('/profile')} className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity">Back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between gap-3">
        <button onClick={() => navigate('/profile')} className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to My Videos
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowDeleteModal(true)} className="px-3 py-2 bg-destructive text-destructive-foreground rounded hover:opacity-90 transition-opacity flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Video Player Card */}
      <div className="bg-card border border-border rounded shadow overflow-hidden mb-6">
        <div className="aspect-video bg-black"><video src={video.video_url} poster={video.thumbnail_url} controls className="w-full h-full" /></div>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">{video.title}</h1>
              <p className="text-sm text-muted-foreground mt-2">{video.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-2">
                {video.is_featured && <span className="px-2 py-1 bg-warning/20 text-warning-foreground rounded flex items-center gap-1"><Star className="w-4 h-4" /> Featured</span>}
                {video.is_premium && <span className="px-2 py-1 bg-warning/20 text-warning-foreground rounded flex items-center gap-1"><Crown className="w-4 h-4" /> Premium</span>}
              </div>
              <button onClick={openEditModal} className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded transition-colors flex items-center gap-2">
                <Pencil className="w-4 h-4" /> Edit
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div>Views: <span className="text-foreground font-medium">{video.views || 0}</span></div>
            <div>Uploaded: <span className="text-foreground">{formatDate(video.created_at)}</span></div>
            <div>Status: <span className="text-foreground font-medium">{video.status}</span></div>
            <div>Visibility: <span className="text-foreground font-medium">{video.is_public ? 'Public' : 'Private'}</span></div>
            <div>Duration: <span className="text-foreground">{video.duration || 'N/A'}</span></div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded p-4">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">Views</div>
          </div>
          <div className="text-xl font-bold text-foreground">{video.views || 0}</div>
        </div>
        <div className="bg-card border border-border rounded p-4">
          <div className="flex items-center gap-2 mb-1">
            <ThumbsUp className="w-4 h-4 text-success" />
            <div className="text-sm text-muted-foreground">Likes</div>
          </div>
          <div className="text-xl font-bold text-success">{video.likes || 0}</div>
        </div>
        <div className="bg-card border border-border rounded p-4">
          <div className="flex items-center gap-2 mb-1">
            <ThumbsDown className="w-4 h-4 text-destructive" />
            <div className="text-sm text-muted-foreground">Dislikes</div>
          </div>
          <div className="text-xl font-bold text-destructive">{video.dislikes || 0}</div>
        </div>
        <div className="bg-card border border-border rounded p-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="w-4 h-4 text-primary" />
            <div className="text-sm text-muted-foreground">Comments</div>
          </div>
          <div className="text-xl font-bold text-primary">{video.comments_count || 0}</div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Information */}
        <div className="bg-card border border-border rounded p-4">
          <div className="flex items-center gap-2 mb-4">
            <PlayCircle className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Video Information</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Duration</div>
                <div className="text-sm text-foreground">{video.duration || 'N/A'}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Content Rating</div>
                <div className="text-sm text-foreground">{video.content_rating || 'Not rated'}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Uploader</div>
                <div className="text-sm text-foreground">{video.uploader_display_name || video.uploader_username || 'Unknown'}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Uploaded</div>
                <div className="text-sm text-foreground">{formatDate(video.created_at)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories & Tags */}
        <div className="bg-card border border-border rounded p-4">
          <div className="flex items-center gap-2 mb-4">
            <Folder className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Categories & Tags</h2>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <Folder className="w-4 h-4" /> Categories
              </div>
              <div className="flex flex-wrap gap-2">
                {video.categories && video.categories.length > 0 ? video.categories.map((cat, idx) => (
                  <span key={idx} className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm">{cat}</span>
                )) : <span className="text-sm text-muted-foreground">No categories</span>}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                <Tag className="w-4 h-4" /> Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {video.tags && video.tags.length > 0 ? video.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">#{tag}</span>
                )) : <span className="text-sm text-muted-foreground">No tags</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Content Settings */}
        <div className="bg-card border border-border rounded p-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Content Settings</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">Public Video</span>
              </div>
              <button onClick={() => handleToggle('visibility', 'is_public')} disabled={toggleLoading.visibility} className={`px-3 py-1 rounded text-sm transition-colors ${video.is_public ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {toggleLoading.visibility ? '...' : video.is_public ? 'Public' : 'Private'}
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-warning" />
                <span className="text-sm text-foreground">Premium Content</span>
              </div>
              <button onClick={() => handleToggle('premium', 'is_premium')} disabled={toggleLoading.premium} className={`px-3 py-1 rounded text-sm transition-colors ${video.is_premium ? 'bg-warning text-warning-foreground hover:bg-warning/90' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {toggleLoading.premium ? '...' : video.is_premium ? 'Yes' : 'No'}
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">Allow Comments</span>
              </div>
              <button onClick={() => handleToggle('comments', 'allow_comments')} disabled={toggleLoading.comments} className={`px-3 py-1 rounded text-sm transition-colors ${video.allow_comments ? 'bg-success text-success-foreground hover:bg-success/90' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {toggleLoading.comments ? '...' : video.allow_comments ? 'On' : 'Off'}
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-success" />
                <span className="text-sm text-foreground">Allow Downloads</span>
              </div>
              <button onClick={() => handleToggle('downloads', 'allow_downloads')} disabled={toggleLoading.downloads} className={`px-3 py-1 rounded text-sm transition-colors ${video.allow_downloads ? 'bg-success text-success-foreground hover:bg-success/90' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {toggleLoading.downloads ? '...' : video.allow_downloads ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border border-border rounded p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold text-foreground mb-4">Edit Video</h2>
            <div className="mb-3">
              <label className="block text-sm font-medium text-foreground mb-1">Title</label>
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full border border-input bg-background text-foreground rounded p-2 focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={4} className="w-full border border-input bg-background text-foreground rounded p-2 focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-foreground mb-1">Categories</label>
              
              {/* Selected Categories */}
              <div className="flex flex-wrap gap-2 mb-2 min-h-[32px] p-2 bg-secondary border border-border rounded-lg">
                {editCategories && editCategories.length > 0 ? (
                  editCategories.map((slug) => {
                    const category = allCategories.find(c => c.slug === slug || c.name === slug);
                    return category ? (
                      <span
                        key={slug}
                        className="flex items-center gap-1 px-2 py-1 bg-green-900/30 text-green-300 rounded-md text-sm"
                      >
                        {category.name || category.title || slug}
                        <button
                          type="button"
                          onClick={() => toggleCategory(slug)}
                          className="hover:text-green-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ) : null;
                  })
                ) : (
                  <span className="text-sm text-muted-foreground">No categories selected</span>
                )}
              </div>

              {/* Available Categories */}
              <div className="border border-border rounded-lg bg-card p-3 space-y-2 max-h-40 overflow-y-auto">
                <div className="text-xs text-muted-foreground mb-1">Click to select categories:</div>
                <div className="space-y-1">
                  {allCategories.filter(cat => !editCategories.includes(cat.slug || cat.name)).map((cat) => (
                    <button
                      key={cat.id || cat._id || cat.name}
                      type="button"
                      onClick={() => toggleCategory(cat.slug || cat.name)}
                      className="w-full text-left flex items-center gap-2 p-2 hover:bg-secondary rounded cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-primary" />
                      <span className="text-sm text-foreground">{cat.name || cat.title || cat}</span>
                    </button>
                  ))}
                  {allCategories.filter(cat => !editCategories.includes(cat.slug || cat.name)).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">All categories selected</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1">Tags</label>
              
              {/* Selected Tags */}
              <div className="flex flex-wrap gap-2 mb-2 min-h-[32px] p-2 bg-secondary border border-border rounded-lg">
                {editTags && editTags.length > 0 ? (
                  editTags.map((slug) => {
                    const tag = allTags.find(t => t.slug === slug || t.name === slug);
                    return tag ? (
                      <span
                        key={slug}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-900/30 text-blue-300 rounded-md text-sm"
                      >
                        #{tag.name || tag.title || slug}
                        <button
                          type="button"
                          onClick={() => toggleTag(slug)}
                          className="hover:text-blue-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ) : null;
                  })
                ) : (
                  <span className="text-sm text-muted-foreground">No tags selected</span>
                )}
              </div>

              {/* Available Tags */}
              <div className="border border-border rounded-lg bg-card p-3 space-y-2 max-h-40 overflow-y-auto">
                <div className="text-xs text-muted-foreground mb-1">Click to select tags:</div>
                <div className="space-y-1">
                  {allTags.filter(tag => !editTags.includes(tag.slug || tag.name)).map((tag) => (
                    <button
                      key={tag.id || tag._id || tag.name}
                      type="button"
                      onClick={() => toggleTag(tag.slug || tag.name)}
                      className="w-full text-left flex items-center gap-2 p-2 hover:bg-secondary rounded cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-primary" />
                      <span className="text-sm text-foreground">#{tag.name || tag.title || tag}</span>
                    </button>
                  ))}
                  {allTags.filter(tag => !editTags.includes(tag.slug || tag.name)).length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-2">All tags selected</p>
                  )}
                </div>
              </div>

              {/* Create New Tag Section */}
              <div className="bg-secondary/50 border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Plus className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">Create New Tag</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Enter tag name"
                    className="flex-1 px-3 py-1.5 bg-card border border-border rounded text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                  />
                  <button
                    type="button"
                    onClick={handleCreateTag}
                    disabled={creatingTag || !newTagName.trim()}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {creatingTag ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditModalOpen(false)} className="px-3 py-2 rounded border border-border bg-background text-foreground hover:bg-secondary transition-colors">Cancel</button>
              <button onClick={handleEditSave} disabled={editLoading} className="px-3 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border border-border rounded p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-foreground mb-2">Delete video?</h3>
            <p className="mb-4 text-muted-foreground">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-3 py-2 border border-border bg-background text-foreground rounded hover:bg-secondary transition-colors">Cancel</button>
              <button onClick={handleDeleteVideo} className="px-3 py-2 bg-destructive text-destructive-foreground rounded hover:opacity-90 transition-opacity">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

