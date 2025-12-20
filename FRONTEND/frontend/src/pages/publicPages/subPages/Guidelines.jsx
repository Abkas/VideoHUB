import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Search, Home, Grid, Upload, User, Settings, FileText, Shield, LogOut, AlertTriangle } from "lucide-react";

const Guidelines = () => {
  const [menuOpen, setMenuOpen] = useState(false);

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
              <Link to="/guidelines" className="flex items-center gap-3 px-4 py-3 bg-secondary text-foreground rounded-lg">
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
        <h1 className="text-2xl font-bold text-foreground mb-6">Community Guidelines</h1>

        {/* Age Restriction Notice */}
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-lg font-semibold text-destructive">18+ Age Restriction</p>
            <p className="text-sm text-muted-foreground mt-1">
              This platform is strictly for users who are 18 years of age or older. 
              Access by minors is prohibited. By using this platform, you confirm that you meet 
              the minimum age requirement and agree to comply with all applicable laws regarding 
              age-restricted content in your jurisdiction.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Content Rules</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• All content must comply with local and international laws</li>
              <li>• Uploaders must have rights to all content they share</li>
              <li>• All participants in videos must be consenting adults (18+)</li>
              <li>• Copyright infringement is strictly prohibited</li>
              <li>• No content depicting violence, abuse, or illegal activities</li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">User Conduct</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Treat all users with respect</li>
              <li>• No harassment, bullying, or hate speech</li>
              <li>• Do not share personal information of others</li>
              <li>• Report violations through proper channels</li>
              <li>• No spam, scams, or deceptive practices</li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Account Responsibility</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• You are responsible for maintaining account security</li>
              <li>• Do not share your login credentials</li>
              <li>• One account per user only</li>
              <li>• False identity or impersonation is prohibited</li>
            </ul>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Enforcement</h2>
            <p className="text-muted-foreground">
              Violations of these guidelines may result in content removal, account suspension, 
              or permanent ban. Severe violations may be reported to law enforcement authorities. 
              We reserve the right to remove any content and terminate any account at our discretion.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Guidelines;
