import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Eye, Ban, Trash2 } from "lucide-react";

const mockVideos = [
  { id: 1, title: "Amazing sunset timelapse over the ocean waves", uploader: "JohnDoe123", status: "Active" },
  { id: 2, title: "Urban exploration documentary part one", uploader: "JaneSmith", status: "Active" },
  { id: 3, title: "Cooking masterclass with professional chef", uploader: "ChefMaster", status: "Disabled" },
  { id: 4, title: "Travel vlog exploring hidden gems", uploader: "TravelGuy", status: "Active" },
  { id: 5, title: "Music production tutorial for beginners", uploader: "BeatMaker", status: "Active" },
  { id: 6, title: "Fitness workout routine at home", uploader: "FitPro", status: "Active" },
];

const AdminVideos = () => {
  return (
    <div className="min-h-screen bg-background">
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
        <h1 className="text-2xl font-bold text-foreground mb-6">Video Management</h1>

        {/* Video List */}
        <div className="space-y-3">
          {mockVideos.map((video) => (
            <div key={video.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-24 sm:w-32 aspect-video bg-muted rounded-lg flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">Thumb</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">by {video.uploader}</p>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                    video.status === "Active" 
                      ? "bg-success/10 text-success" 
                      : "bg-destructive/10 text-destructive"
                  }`}>
                    {video.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <button className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm hover:bg-muted transition-colors">
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-warning/10 text-warning rounded-lg text-sm hover:bg-warning/20 transition-colors">
                  <Ban className="w-4 h-4" />
                  <span>Disable</span>
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-destructive/10 text-destructive rounded-lg text-sm hover:bg-destructive/20 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminVideos;
