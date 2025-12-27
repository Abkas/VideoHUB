import { AlertTriangle } from "lucide-react";
import NavigationBar from "../../../components/NavigationBar";

const Guidelines = () => {

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

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
