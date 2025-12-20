import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Ban, CheckCircle } from "lucide-react";

const mockUsers = [
  { id: 1, username: "JohnDoe123", email: "john@example.com", status: "Active", videos: 12 },
  { id: 2, username: "JaneSmith", email: "jane@example.com", status: "Active", videos: 8 },
  { id: 3, username: "SpammerX", email: "spam@bad.com", status: "Banned", videos: 0 },
  { id: 4, username: "TravelGuy", email: "travel@example.com", status: "Active", videos: 24 },
  { id: 5, username: "BeatMaker", email: "beats@example.com", status: "Active", videos: 45 },
  { id: 6, username: "BadActor99", email: "bad@example.com", status: "Banned", videos: 0 },
];

const AdminUsers = () => {
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
        <h1 className="text-2xl font-bold text-foreground mb-6">User Management</h1>

        {/* User List */}
        <div className="space-y-3">
          {mockUsers.map((user) => (
            <div key={user.id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-muted-foreground">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{user.username}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    user.status === "Active" 
                      ? "bg-success/10 text-success" 
                      : "bg-destructive/10 text-destructive"
                  }`}>
                    {user.status}
                  </span>
                  <span className="text-sm text-muted-foreground">{user.videos} videos</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                {user.status === "Active" ? (
                  <button className="flex items-center gap-2 px-3 py-2 bg-destructive/10 text-destructive rounded-lg text-sm hover:bg-destructive/20 transition-colors">
                    <Ban className="w-4 h-4" />
                    <span>Ban User</span>
                  </button>
                ) : (
                  <button className="flex items-center gap-2 px-3 py-2 bg-success/10 text-success rounded-lg text-sm hover:bg-success/20 transition-colors">
                    <CheckCircle className="w-4 h-4" />
                    <span>Unban User</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;
