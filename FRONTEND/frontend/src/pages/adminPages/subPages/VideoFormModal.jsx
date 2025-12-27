import { useState } from 'react';
import { Upload, X, Save, Plus, Search } from 'lucide-react';
import { uploadVideo, uploadThumbnail } from '../../../api/adminAPI/videoApi';
import { createCategory, createTag } from '../../../api/adminAPI/categoryTagApi';
import toast from 'react-hot-toast';

const VideoFormModal = ({ title, video, setVideo, categories, tags, onSave, onClose, isEdit = false }) => {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState(0);
  const [videoMetadata, setVideoMetadata] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [creatingTag, setCreatingTag] = useState(false);
  const [localCategories, setLocalCategories] = useState(categories);
  const [localTags, setLocalTags] = useState(tags);
  const [categorySearch, setCategorySearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
      } else {
        toast.error('Please select a valid video file');
      }
    }
  };

  const handleThumbnailFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setThumbnailFile(file);
      } else {
        toast.error('Please select a valid image file');
      }
    }
  };

  const handleVideoUpload = async () => {
    if (!videoFile) {
      toast.error('Please select a video file first');
      return;
    }

    try {
      setUploadingVideo(true);

      const response = await uploadVideo(videoFile, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setVideoUploadProgress(percentCompleted);
      });
      // Debug Cloudinary response
      console.log('Cloudinary upload response:', response);
      // Extract video metadata from Cloudinary response
      const duration = response.duration || 0;
      setVideo({ 
        ...video, 
        video_url: response.url,
        duration: Math.round(duration) || 1  // Ensure at least 1 second
      });

      // Store metadata for display
      setVideoMetadata({
        duration: Math.round(duration) || 1,
        format: response.format,
        resolution: response.width && response.height ? `${response.width}x${response.height}` : null,
        size: response.bytes ? `${(response.bytes / (1024 * 1024)).toFixed(2)} MB` : null
      });

      toast.success('Video uploaded successfully');
      setVideoFile(null);
      setVideoUploadProgress(0);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleThumbnailUpload = async () => {
    if (!thumbnailFile) {
      toast.error('Please select a thumbnail image first');
      return;
    }

    try {
      setUploadingThumbnail(true);
      const response = await uploadThumbnail(thumbnailFile, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setThumbnailUploadProgress(percentCompleted);
      });
      
      setVideo({ ...video, thumbnail_url: response.url });
      toast.success('Thumbnail uploaded successfully');
      setThumbnailFile(null);
      setThumbnailUploadProgress(0);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setCreatingCategory(true);
      // Let the backend auto-generate the slug
      const newCat = await createCategory({ 
        name: newCategoryName.trim(), 
        is_active: true 
      });
      setLocalCategories([...localCategories, newCat]);
      setVideo({ ...video, categories: [...(video.categories || []), newCat.slug] });
      setNewCategoryName('');
      toast.success('Category created');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error('Tag name is required');
      return;
    }

    try {
      setCreatingTag(true);
      // Let the backend auto-generate the slug
      const newTag = await createTag({ 
        name: newTagName.trim(), 
        is_active: true 
      });
      setLocalTags([...localTags, newTag]);
      setVideo({ ...video, tags: [...(video.tags || []), newTag.slug] });
      setNewTagName('');
      toast.success('Tag created');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setCreatingTag(false);
    }
  };

  const toggleCategory = (slug) => {
    const current = video.categories || [];
    if (current.includes(slug)) {
      setVideo({ ...video, categories: current.filter(c => c !== slug) });
    } else {
      setVideo({ ...video, categories: [...current, slug] });
    }
  };

  const toggleTag = (slug) => {
    const current = video.tags || [];
    if (current.includes(slug)) {
      setVideo({ ...video, tags: current.filter(t => t !== slug) });
    } else {
      setVideo({ ...video, tags: [...current, slug] });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-3 sm:p-4 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
            <input
              type="text"
              value={video.title}
              onChange={(e) => setVideo({ ...video, title: e.target.value })}
              className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              value={video.description || ''}
              onChange={(e) => setVideo({ ...video, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {!isEdit && (
            <>
              {/* Video Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Video File *</label>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="flex-1 px-3 sm:px-4 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90"
                    />
                    <button
                      type="button"
                      onClick={handleVideoUpload}
                      disabled={!videoFile || uploadingVideo}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingVideo ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                  {uploadingVideo && (
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${videoUploadProgress}%` }}
                      />
                    </div>
                  )}
                  {video.video_url && (
                    <div className="space-y-1">
                      <p className="text-xs text-green-500">✓ Video uploaded successfully</p>
                      {videoMetadata && (
                        <div className="text-xs text-muted-foreground space-y-0.5">
                          {videoMetadata.duration && <p>• Duration: {videoMetadata.duration}s ({Math.floor(videoMetadata.duration / 60)}:{(videoMetadata.duration % 60).toString().padStart(2, '0')} min)</p>}
                          {videoMetadata.resolution && <p>• Resolution: {videoMetadata.resolution}</p>}
                          {videoMetadata.format && <p>• Format: {videoMetadata.format.toUpperCase()}</p>}
                          {videoMetadata.size && <p>• Size: {videoMetadata.size}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Duration (seconds)</label>
                <input
                  type="number"
                  value={video.duration}
                  onChange={(e) => setVideo({ ...video, duration: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Enter duration in seconds"
                  min="1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {videoMetadata && videoMetadata.duration ? `✓ Auto-detected: ${videoMetadata.duration}s` : 'Enter video duration manually'}
                </p>
              </div>
            </>
          )}

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Thumbnail Image</label>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailFileChange}
                  className="flex-1 px-3 sm:px-4 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90"
                />
                <button
                  type="button"
                  onClick={handleThumbnailUpload}
                  disabled={!thumbnailFile || uploadingThumbnail}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  {uploadingThumbnail ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {uploadingThumbnail && (
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${thumbnailUploadProgress}%` }}
                  />
                </div>
              )}
              {video.thumbnail_url && (
                <>
                  <img src={video.thumbnail_url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                </>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Status</label>
            <select
              value={video.status}
              onChange={(e) => setVideo({ ...video, status: e.target.value })}
              className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="published">Published</option>
              <option value="processing">Processing</option>
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
              {isEdit && <option value="flagged">Flagged</option>}
            </select>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Categories</label>
            
            {/* Selected Categories Box */}
            <div className="mb-4">
              <div className="text-xs text-muted-foreground mb-2">Selected Categories:</div>
              <div className="min-h-[60px] p-3 bg-secondary border border-border rounded-lg">
                {video.categories && video.categories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {video.categories.map((slug) => {
                      const cat = localCategories.find(c => c.slug === slug);
                      return cat ? (
                        <span
                          key={slug}
                          className="flex items-center gap-1 px-3 py-1.5 bg-primary/20 text-primary rounded-full text-sm font-medium"
                        >
                          {cat.name}
                          <button
                            type="button"
                            onClick={() => toggleCategory(slug)}
                            className="hover:text-primary/70 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No categories selected</span>
                )}
              </div>
            </div>

            {/* Search and Create Category */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name"
                  className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={creatingCategory || !newCategoryName.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  {creatingCategory ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>

            {/* Available Categories */}
            <div>
              <div className="text-xs text-muted-foreground mb-2">Available Categories:</div>
              <div className="border border-border rounded-lg bg-card p-3 max-h-32 overflow-y-auto">
                {localCategories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {localCategories
                      .filter(cat => 
                        !video.categories?.includes(cat.slug) && 
                        cat.name.toLowerCase().includes(categorySearch.toLowerCase())
                      )
                      .map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => toggleCategory(cat.slug)}
                          className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-full text-sm transition-colors"
                        >
                          + {cat.name}
                        </button>
                      ))}
                    {localCategories.filter(cat => 
                      !video.categories?.includes(cat.slug) && 
                      cat.name.toLowerCase().includes(categorySearch.toLowerCase())
                    ).length === 0 && (
                      <p className="text-xs text-muted-foreground w-full text-center py-2">
                        {categorySearch ? 'No matching categories found' : 'All categories selected'}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">No categories available</p>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Tags</label>
            
            {/* Selected Tags Box */}
            <div className="mb-4">
              <div className="text-xs text-muted-foreground mb-2">Selected Tags:</div>
              <div className="min-h-[60px] p-3 bg-secondary border border-border rounded-lg">
                {video.tags && video.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {video.tags.map((slug) => {
                      const tag = localTags.find(t => t.slug === slug);
                      return tag ? (
                        <span
                          key={slug}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-900/30 text-blue-300 rounded-full text-sm font-medium"
                        >
                          #{tag.name}
                          <button
                            type="button"
                            onClick={() => toggleTag(slug)}
                            className="hover:text-blue-200 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No tags selected</span>
                )}
              </div>
            </div>

            {/* Search and Create Tag */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  placeholder="Search tags..."
                  className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="New tag name"
                  className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                />
                <button
                  type="button"
                  onClick={handleCreateTag}
                  disabled={creatingTag || !newTagName.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  {creatingTag ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>

            {/* Available Tags */}
            <div>
              <div className="text-xs text-muted-foreground mb-2">Available Tags:</div>
              <div className="border border-border rounded-lg bg-card p-3 max-h-32 overflow-y-auto">
                {localTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {localTags
                      .filter(tag => 
                        !video.tags?.includes(tag.slug) && 
                        tag.name.toLowerCase().includes(tagSearch.toLowerCase())
                      )
                      .map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => toggleTag(tag.slug)}
                          className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-full text-sm transition-colors"
                        >
                          + #{tag.name}
                        </button>
                      ))}
                    {localTags.filter(tag => 
                      !video.tags?.includes(tag.slug) && 
                      tag.name.toLowerCase().includes(tagSearch.toLowerCase())
                    ).length === 0 && (
                      <p className="text-xs text-muted-foreground w-full text-center py-2">
                        {tagSearch ? 'No matching tags found' : 'All tags selected'}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">No tags available</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={video.is_premium || false}
                onChange={(e) => setVideo({ ...video, is_premium: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-foreground">Premium Content</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={video.is_featured || false}
                onChange={(e) => setVideo({ ...video, is_featured: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-foreground">Featured</span>
            </label>

            {!isEdit && (
              <>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={video.allow_comments}
                    onChange={(e) => setVideo({ ...video, allow_comments: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">Allow Comments</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={video.allow_downloads}
                    onChange={(e) => setVideo({ ...video, allow_downloads: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-foreground">Allow Downloads</span>
                </label>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4">
            <button
              onClick={onSave}
              disabled={!isEdit && (!video.title || !video.video_url)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              title={!isEdit && (!video.title || !video.video_url) ? 'Please enter title and upload video first' : ''}
            >
              <Save className="w-4 h-4" />
              <span>{isEdit ? 'Update' : 'Add'} Video</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
          </div>
          {!isEdit && (!video.title || !video.video_url) && (
            <p className="text-xs text-amber-500 text-center -mt-2">
              {!video.title && !video.video_url ? 'Enter a title and upload the video to continue' : 
               !video.title ? 'Please enter a title' : 
               'Please upload the video file'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoFormModal;
