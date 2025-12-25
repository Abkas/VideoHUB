import { useState, useEffect } from "react";
import { getAllCategories, getAllTags, createTag } from "../../../api/adminAPI/categoryTagApi";
import { uploadVideo, uploadThumbnail, createVideo } from "../../../api/publicAPI/videoApi";
import { Link } from "react-router-dom";
import { Menu, X, Search, Home, Grid, Upload, User, Settings, FileText, Shield, LogOut, Video, Image } from "lucide-react";

const UploadPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    getAllCategories().then(data => setCategories(data || [])).catch(() => setCategories([]));
    // Fetch tags
    getAllTags().then(data => setTags(data || [])).catch(() => setTags([]));
  }, []);
  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    try {
      const name = newTag.trim();
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      const res = await createTag({ name, slug });
      setTags(prev => [...prev, res]);
      setSelectedTags(prev => [...prev, res.name]);
      setNewTag("");
    } catch {
      // Optionally show error
    }
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
              <Link to="/upload" className="flex items-center gap-3 px-4 py-3 bg-secondary text-foreground rounded-lg">
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
              <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-destructive hover:bg-secondary rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </Link>
            </nav>
          </div>
        </div>
      )}

      <main className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Upload Video</h1>

        <div className="space-y-6">
          {/* Video Upload */}
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center transition-colors">
            <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <input
              type="file"
              accept="video/*"
              onChange={e => setVideoFile(e.target.files[0])}
              className="mb-2"
            />
            <button
              type="button"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold mt-2"
              disabled={!videoFile || uploading}
              onClick={async () => {
                if (!videoFile) return;
                setUploading(true);
                try {
                  const res = await uploadVideo(videoFile, e => setProgress(Math.round((e.loaded * 100) / e.total)));
                  console.log('Cloudinary upload response:', res);
                  setVideoUrl(res.url || res.secure_url || "");
                  setVideoDuration(Math.round(res.metadata?.duration || 0));
                  setProgress(0);
                } catch {
                  setVideoUrl("");
                  setVideoDuration(0);
                }
                setUploading(false);
              }}
            >
              {uploading ? `Uploading... (${progress}%)` : "Upload Video"}
            </button>
            {videoUrl && <p className="text-green-600 mt-2">Video uploaded!</p>}
            <p className="text-sm text-muted-foreground mt-1">MP4, WebM, MOV up to 2GB</p>
          </div>

          {/* Thumbnail Upload */}
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center transition-colors">
            <Image className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <input
              type="file"
              accept="image/*"
              onChange={e => setThumbnailFile(e.target.files[0])}
              className="mb-2"
            />
            <button
              type="button"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold mt-2"
              disabled={!thumbnailFile || uploading}
              onClick={async () => {
                if (!thumbnailFile) return;
                setUploading(true);
                try {
                  const res = await uploadThumbnail(thumbnailFile, e => setProgress(Math.round((e.loaded * 100) / e.total)));
                  setThumbnailUrl(res.url || res.secure_url || "");
                  setProgress(0);
                } catch {
                  setThumbnailUrl("");
                }
                setUploading(false);
              }}
            >
              {uploading ? `Uploading... (${progress}%)` : "Upload Thumbnail"}
            </button>
            {thumbnailUrl && <p className="text-green-600 mt-2">Thumbnail uploaded!</p>}
            <p className="text-sm text-muted-foreground mt-1">JPG, PNG (16:9 ratio recommended)</p>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your video"
              rows={4}
              className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Categories Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Categories</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {categories.map(cat => {
                const value = cat.name || cat.title || cat._id || cat.id;
                return (
                  <button
                    key={cat._id || cat.id || cat.name || cat.title}
                    type="button"
                    className={`px-3 py-1 rounded-full border ${selectedCategories.includes(value) ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-foreground border-border'} transition-colors`}
                    onClick={() => setSelectedCategories(selectedCategories.includes(value)
                      ? selectedCategories.filter(c => c !== value)
                      : [...selectedCategories, value])}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">You can select multiple categories.</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <button
                  key={tag.id || tag.name}
                  type="button"
                  className={`px-3 py-1 rounded-full border ${selectedTags.includes(tag.name) ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-foreground border-border'} transition-colors`}
                  onClick={() => setSelectedTags(selectedTags.includes(tag.name)
                    ? selectedTags.filter(t => t !== tag.name)
                    : [...selectedTags, tag.name])}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                placeholder="Add new tag"
                className="px-3 py-2 rounded-lg border border-border bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold"
              >
                Add Tag
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">You can select multiple tags or create new ones.</p>
          </div>

          {/* Publish Button */}
          <button
            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
            disabled={uploading || !videoUrl || !thumbnailUrl || !title || selectedCategories.length === 0}
            onClick={async () => {
              if (!videoUrl || !thumbnailUrl || !title || selectedCategories.length === 0) return;
              setUploading(true);
              try {
                await createVideo({
                  title,
                  description,
                  categories: selectedCategories,
                  tags: selectedTags,
                  video_url: videoUrl,
                  thumbnail_url: thumbnailUrl,
                  duration: videoDuration || 0
                });
                // Optionally reset form or show success
                setTitle("");
                setDescription("");
                setSelectedCategories([]);
                setSelectedTags([]);
                setVideoFile(null);
                setThumbnailFile(null);
                setVideoUrl("");
                setThumbnailUrl("");
                setVideoDuration(0);
                alert("Video uploaded successfully!");
              } catch {
                alert("Failed to upload video.");
              }
              setUploading(false);
            }}
          >
            {uploading ? "Publishing..." : "Publish Video"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
