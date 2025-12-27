import NavigationBar from "../../../components/NavigationBar";

const Terms = () => {

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-6">Last updated: December 2024</p>

        <div className="space-y-6">
          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using StreamHub, you agree to be bound by these Terms of Service and all 
              applicable laws and regulations. If you do not agree with any of these terms, you are 
              prohibited from using or accessing this site.
            </p>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Age Requirement</h2>
            <p className="text-muted-foreground">
              You must be at least 18 years of age to use this platform. By creating an account, 
              you represent and warrant that you are at least 18 years old. We reserve the right 
              to terminate accounts of users who are found to be underage.
            </p>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">3. User Accounts</h2>
            <p className="text-muted-foreground">
              You are responsible for safeguarding the password that you use to access the service 
              and for any activities or actions under your password. You agree not to disclose your 
              password to any third party. You must notify us immediately upon becoming aware of any 
              breach of security or unauthorized use of your account.
            </p>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">4. User Content</h2>
            <p className="text-muted-foreground">
              Users retain ownership of content they upload. By uploading content, you grant us a 
              worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute 
              your content for the purpose of operating the platform. You represent that you have all 
              necessary rights to the content you upload.
            </p>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Prohibited Activities</h2>
            <p className="text-muted-foreground">
              You may not use the platform for any illegal purpose, to violate any laws, to infringe 
              upon the rights of others, to upload harmful content, to engage in harassment, or to 
              distribute spam or malware. Violations may result in immediate account termination.
            </p>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Termination</h2>
            <p className="text-muted-foreground">
              We may terminate or suspend your account immediately, without prior notice or liability, 
              for any reason whatsoever, including without limitation if you breach the Terms. Upon 
              termination, your right to use the service will immediately cease.
            </p>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              In no event shall StreamHub, its directors, employees, partners, agents, suppliers, or 
              affiliates, be liable for any indirect, incidental, special, consequential or punitive 
              damages, including without limitation, loss of profits, data, use, goodwill, or other 
              intangible losses.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Terms;
