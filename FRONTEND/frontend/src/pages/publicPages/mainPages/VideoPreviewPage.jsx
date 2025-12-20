import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Menu, X, Search, Home, Grid, Upload, User, Settings, FileText, Shield, LogOut, ThumbsUp, ThumbsDown, Bookmark, ChevronDown, ChevronUp } from "lucide-react";

const mockComments = [
  { id: 1, user: "JohnDoe", text: "Great video! Really enjoyed this content.", time: "2 hours ago" },
  { id: 2, user: "JaneSmith", text: "Amazing quality, thanks for sharing!", time: "5 hours ago" },
  { id: 3, user: "VideoFan99", text: "Can't wait for the next one!", time: "1 day ago" },
];

const relatedVideos = [
  { id: 2, title: "Urban exploration documentary part one", duration: "8:45", views: "856K" },
  { id: 3, title: "Cooking masterclass with professional chef", duration: "15:20", views: "2.1M" },
  { id: 4, title: "Travel vlog exploring hidden gems", duration: "10:11", views: "543K" },
  { id: 5, title: "Music production tutorial for beginners", duration: "22:30", views: "1.8M" },
  { id: 6, title: "Fitness workout routine at home", duration: "18:45", views: "3.2M" },
  { id: 7, title: "Nature documentary wildlife adventure", duration: "25:10", views: "987K" },
  { id: 8, title: "Tech review latest smartphone comparison", duration: "14:22", views: "2.5M" },
  { id: 9, title: "Art tutorial watercolor painting basics", duration: "11:55", views: "654K" },
];

const Watch = () => {
  const { id } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [descriptionOpen, setDescriptionOpen] = useState(false);

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
              <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-destructive hover:bg-secondary rounded-lg transition-colors">
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </Link>
            </nav>
          </div>
        </div>
      )}

      <main className="max-w-[1280px] mx-auto">
        {/* Video Player */}
        <div className="aspect-video bg-card flex items-center justify-center">
          <span className="text-muted-foreground">Video Player</span>
        </div>

        <div className="px-2 sm:px-3 md:px-4 py-4">
          {/* Video Title */}
          <h1 className="text-lg sm:text-xl font-semibold text-foreground">
            Amazing sunset timelapse over the ocean waves - Full Documentary
          </h1>

          {/* Views & Date */}
          <p className="text-sm text-muted-foreground mt-1">
            1.2M views • Uploaded 3 days ago
          </p>

          {/* Action Row */}
          <div className="flex items-center gap-4 mt-4 py-3 border-y border-border">
            <button className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <ThumbsUp className="w-5 h-5" />
              <span className="text-sm">12K</span>
            </button>
            <button className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <ThumbsDown className="w-5 h-5" />
              <span className="text-sm">245</span>
            </button>
            <button className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <Bookmark className="w-5 h-5" />
              <span className="text-sm">Save</span>
            </button>
            <Link to="/report" className="ml-auto text-sm text-muted-foreground hover:text-primary transition-colors">
              Report
            </Link>
          </div>

          {/* Description */}
          <div className="py-4 border-b border-border">
            <button
              onClick={() => setDescriptionOpen(!descriptionOpen)}
              className="flex items-center gap-2 text-foreground font-medium"
            >
              Description
              {descriptionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {descriptionOpen && (
              <p className="mt-3 text-sm text-muted-foreground">
                This is a beautiful timelapse video capturing the stunning sunset over the ocean. 
                The video was shot over multiple days to capture the perfect moment. 
                We used professional equipment and techniques to bring you this amazing visual experience.
                Don't forget to like and subscribe for more content like this!
              </p>
            )}
          </div>

          {/* Comments */}
          <div className="py-4 border-b border-border">
            <h2 className="font-medium text-foreground mb-4">Comments ({mockComments.length})</h2>
            <div className="space-y-4">
              {mockComments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-secondary rounded-full flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{comment.user}</span>
                      <span className="text-xs text-muted-foreground">{comment.time}</span>
                    </div>
                    <p className="text-sm text-foreground mt-1">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Videos */}
          <div className="py-4">
            <h2 className="font-medium text-foreground mb-4">Related Videos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {relatedVideos.map((video) => (
                <Link key={video.id} to={`/watch/${video.id}`} className="group">
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">Thumbnail</span>
                    </div>
                    <div className="absolute bottom-1 right-1 bg-background/90 text-foreground text-xs px-1.5 py-0.5 rounded font-medium">
                      {video.duration}
                    </div>
                  </div>
                  <div className="mt-2">
                    <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{video.views} views</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Watch;
