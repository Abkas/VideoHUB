import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Eye, CheckCircle } from "lucide-react";

const mockReports = [
  { id: 1, content: "Video: Urban exploration doc", reason: "Copyright infringement", reporter: "User123", status: "Pending" },
  { id: 2, content: "Video: Cooking masterclass", reason: "Spam or misleading", reporter: "JaneDoe", status: "Pending" },
  { id: 3, content: "Comment on Travel vlog", reason: "Harassment", reporter: "TravelFan", status: "Pending" },
  { id: 4, content: "Video: Music tutorial", reason: "Inappropriate content", reporter: "SafeUser", status: "Resolved" },
  { id: 5, content: "Video: Fitness routine", reason: "Dangerous content", reporter: "Concerned1", status: "Pending" },
];

const AdminReports = () => {
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
        <h1 className="text-2xl font-bold text-foreground mb-6">Content Reports</h1>

        {/* Report List */}
        <div className="space-y-3">
          {mockReports.map((report) => (
            <div key={report.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h3 className="font-medium text-foreground">{report.content}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Reason: <span className="text-foreground">{report.reason}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Reported by: {report.reporter}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  report.status === "Pending" 
                    ? "bg-warning/10 text-warning" 
                    : "bg-success/10 text-success"
                }`}>
                  {report.status}
                </span>
              </div>
              {report.status === "Pending" && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                  <button className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm hover:bg-muted transition-colors">
                    <Eye className="w-4 h-4" />
                    <span>Review</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 bg-success/10 text-success rounded-lg text-sm hover:bg-success/20 transition-colors">
                    <CheckCircle className="w-4 h-4" />
                    <span>Resolve</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminReports;
