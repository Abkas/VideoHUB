import { useState } from "react";
import NavigationBar from "../../../components/NavigationBar";

const UserAccountSetting = () => {
  const [username, setUsername] = useState("JohnDoe123");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [privateProfile, setPrivateProfile] = useState(false);
  const [showActivity, setShowActivity] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      <main className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Account Settings</h1>

        <div className="space-y-6">
          {/* Change Username */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Change Username</h2>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
              Update Username
            </button>
          </div>

          {/* Change Password */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground mb-2">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-2">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <button className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
              Update Password
            </button>
          </div>

          {/* Privacy Settings */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Privacy Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">Private Profile</p>
                  <p className="text-sm text-muted-foreground">Only approved followers can see your content</p>
                </div>
                <button
                  onClick={() => setPrivateProfile(!privateProfile)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    privateProfile ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-foreground rounded-full transition-transform ${
                      privateProfile ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">Show Activity Status</p>
                  <p className="text-sm text-muted-foreground">Let others see when you're online</p>
                </div>
                <button
                  onClick={() => setShowActivity(!showActivity)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    showActivity ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-foreground rounded-full transition-transform ${
                      showActivity ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <Link 
            to="/login"
            className="block w-full py-3 bg-destructive text-destructive-foreground rounded-lg font-semibold text-center hover:opacity-90 transition-opacity"
          >
            Logout
          </Link>
        </div>
      </main>
    </div>
  );
};

export default UserAccountSetting;
