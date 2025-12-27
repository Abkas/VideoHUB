import NavigationBar from "../../../components/NavigationBar";

const PrivacyPage = () => {

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-6">Last updated: December 2024</p>

        <div className="space-y-6">
          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide directly to us, such as when you create an account, 
              upload content, or contact us. This may include your name, email address, username, 
              password, and any other information you choose to provide. We also automatically collect 
              certain information when you use our service, including your IP address, browser type, 
              and usage data.
            </p>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use the information we collect to provide, maintain, and improve our services, 
              process transactions, send you technical notices and support messages, respond to your 
              comments and questions, and communicate with you about products, services, and events. 
              We may also use your information for analytics and to personalize your experience.
            </p>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Information Sharing</h2>
            <p className="text-muted-foreground">
              We do not share your personal information with third parties except as described in this 
              policy. We may share information with service providers who assist us in operating our 
              platform, when required by law, or with your consent. We may also share aggregated or 
              de-identified information that cannot reasonably be used to identify you.
            </p>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Data Security</h2>
            <p className="text-muted-foreground">
              We take reasonable measures to help protect your personal information from loss, theft, 
              misuse, and unauthorized access, disclosure, alteration, and destruction. However, no 
              internet transmission is completely secure, and we cannot guarantee the security of 
              information transmitted through our platform.
            </p>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use cookies and similar tracking technologies to collect and store information about 
              your interactions with our platform. You can control cookies through your browser settings, 
              but disabling cookies may limit your ability to use certain features of our service.
            </p>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Your Rights</h2>
            <p className="text-muted-foreground">
              You may access, update, or delete your account information at any time through your 
              account settings. You may also request a copy of your personal data or request that we 
              delete your data by contacting us. Please note that we may retain certain information as 
              required by law or for legitimate business purposes.
            </p>
          </section>

          <section className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at 
              privacy@streamhub.com. We will respond to your inquiry within 30 days.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPage;
