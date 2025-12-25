import { useState } from 'react';
import { Upload, X, Save, Plus } from 'lucide-react';
import { uploadVideo, uploadThumbnail } from '../../../api/publicAPI/videoApi';
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
      const duration = response.metadata?.duration || 0;
      setVideo({ 
        ...video, 
        video_url: response.url,
        duration: Math.round(duration)
      });

      // Store metadata for display
      setVideoMetadata({
        duration: Math.round(duration),
        format: response.metadata?.format,
        resolution: response.metadata?.width && response.metadata?.height ? `${response.metadata.width}x${response.metadata.height}` : null,
        size: response.metadata?.bytes ? `${(response.metadata.bytes / (1024 * 1024)).toFixed(2)} MB` : null
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
      const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-');
      const newCat = await createCategory({ 
        name: newCategoryName, 
        slug,
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
      const slug = newTagName.toLowerCase().replace(/\s+/g, '-');
      const newTag = await createTag({ 
        name: newTagName, 
        slug,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
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
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90"
                    />
                    <button
                      type="button"
                      onClick={handleVideoUpload}
                      disabled={!videoFile || uploadingVideo}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                  className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg text-foreground cursor-not-allowed"
                  placeholder="Auto-filled from video"
                  readOnly
                  disabled
                />
                <p className="text-xs text-muted-foreground mt-1">✓ Automatically extracted from video file</p>
              </div>
            </>
          )}

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Thumbnail Image</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailFileChange}
                  className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90"
                />
                <button
                  type="button"
                  onClick={handleThumbnailUpload}
                  disabled={!thumbnailFile || uploadingThumbnail}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                  <p className="text-xs text-green-500">✓ Thumbnail URL: {video.thumbnail_url}</p>
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
            <label className="block text-sm font-medium text-foreground mb-2">Categories</label>
            
            {/* Selected Categories */}
            <div className="flex flex-wrap gap-2 mb-2 min-h-[32px] p-2 bg-secondary border border-border rounded-lg">
              {video.categories && video.categories.length > 0 ? (
                video.categories.map((slug) => {
                  const cat = localCategories.find(c => c.slug === slug);
                  return cat ? (
                    <span
                      key={slug}
                      className="flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded-md text-sm"
                    >
                      {cat.name}
                      <button
                        type="button"
                        onClick={() => toggleCategory(slug)}
                        className="hover:text-primary/70"
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

            {/* Select Existing Categories */}
            <div className="border border-border rounded-lg bg-card p-3 space-y-2 max-h-40 overflow-y-auto mb-2">
              <div className="text-xs text-muted-foreground mb-1">Select existing categories:</div>
              <div className="space-y-1">
                {localCategories.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-2 p-2 hover:bg-secondary rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={video.categories?.includes(cat.slug) || false}
                      onChange={() => toggleCategory(cat.slug)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">{cat.name}</span>
                  </label>
                ))}
                {localCategories.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">No categories available</p>
                )}
              </div>
            </div>

            {/* Create New Category Section */}
            <div className="bg-secondary/50 border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Plus className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-foreground">Create New Category</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="flex-1 px-3 py-1.5 bg-card border border-border rounded text-sm text-foreground"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={creatingCategory || !newCategoryName.trim()}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm hover:opacity-90 disabled:opacity-50"
                >
                  {creatingCategory ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tags</label>
            
            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2 mb-2 min-h-[32px] p-2 bg-secondary border border-border rounded-lg">
              {video.tags && video.tags.length > 0 ? (
                video.tags.map((slug) => {
                  const tag = localTags.find(t => t.slug === slug);
                  return tag ? (
                    <span
                      key={slug}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-900/30 text-blue-300 rounded-md text-sm"
                    >
                      #{tag.name}
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

            {/* Select Existing Tags */}
            <div className="border border-border rounded-lg bg-card p-3 space-y-2 max-h-40 overflow-y-auto mb-2">
              <div className="text-xs text-muted-foreground mb-1">Select existing tags:</div>
              <div className="space-y-1">
                {localTags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex items-center gap-2 p-2 hover:bg-secondary rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={video.tags?.includes(tag.slug) || false}
                      onChange={() => toggleTag(tag.slug)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">#{tag.name}</span>
                  </label>
                ))}
                {localTags.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">No tags available</p>
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
                  className="flex-1 px-3 py-1.5 bg-card border border-border rounded text-sm text-foreground"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                />
                <button
                  type="button"
                  onClick={handleCreateTag}
                  disabled={creatingTag || !newTagName.trim()}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm hover:opacity-90 disabled:opacity-50"
                >
                  {creatingTag ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <div className="flex gap-2 pt-4">
            <button
              onClick={onSave}
              disabled={!isEdit && (!video.title || !video.video_url)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              title={!isEdit && (!video.title || !video.video_url) ? 'Please enter title and upload video first' : ''}
            >
              <Save className="w-4 h-4" />
              <span>{isEdit ? 'Update' : 'Add'} Video</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
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
