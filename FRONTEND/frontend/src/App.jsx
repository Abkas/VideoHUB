import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthorizerProvider } from "./Auth/Authorizer";
import HomePage from "./pages/publicPages/mainPages/HomePage";
import BrowsePage from "./pages/publicPages/mainPages/BrowsePage";
import VideoPreviewPage from "./pages/publicPages/mainPages/VideoPreviewPage";
import LoginPage from "./pages/publicPages/mainPages/LoginPage";
import RegisterPage from "./pages/publicPages/mainPages/RegisterPage";
import ProfilePage from "./pages/publicPages/mainPages/ProfilePage";
import PublicUserProfilePage from "./pages/publicPages/mainPages/PublicUserProfilePage";
import UserAccountSetting from "./pages/publicPages/mainPages/UserAccountSetting";
import UserSubscriptionsPage from "./pages/publicPages/mainPages/UserSubscriptionsPage";
import Guidelines from "./pages/publicPages/subPages/Guidelines";
import Terms from "./pages/publicPages/subPages/Terms";
import PrivacyPage from "./pages/publicPages/subPages/PrivacyPage";
import ReportPage from "./pages/publicPages/subPages/ReportPage";
import AdminDashboard from "./pages/adminPages/mainPages/AdminDashboard";
import AdminVideoManagement from "./pages/adminPages/mainPages/AdminVideoManagement";
import AdminUserManagement from "./pages/adminPages/mainPages/AdminUserManagement";
import AdminReportManagement from "./pages/adminPages/mainPages/AdminReportManagement";
import AdminCategoryAndTags from "./pages/adminPages/mainPages/AdminCategoryAndTags";
import UserDetailPage from "./pages/adminPages/subPages/UserDetailPage";
import VideoDetailPage from "./pages/adminPages/subPages/VideoDetailPage";
import SubscriptionManagementPage from "./pages/adminPages/mainPages/SubscriptionManagementPage";import SubscriptionDetailPage from "./pages/adminPages/subPages/SubscriptionDetailPage";
import PricingPage from "./pages/publicPages/subPages/PricingPage";

const App = () => (
  <AuthorizerProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/watch/:id" element={<VideoPreviewPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/subscriptions" element={<UserSubscriptionsPage />} />
        <Route path="/user/:id" element={<PublicUserProfilePage />} />
        <Route path="/settings" element={<UserAccountSetting />} />
        <Route path="/guidelines" element={<Guidelines />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/videos" element={<AdminVideoManagement />} />
        <Route path="/admin/videos/:videoId" element={<VideoDetailPage />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/admin/users/:userId" element={<UserDetailPage />} />
        <Route path="/admin/reports" element={<AdminReportManagement />} />
        <Route path="/admin/categories" element={<AdminCategoryAndTags />} />
        <Route path="/admin/subscriptions" element={<SubscriptionManagementPage />} />
        <Route path="/admin/subscriptions/:subscriptionId" element={<SubscriptionDetailPage />} />
      </Routes>
    </BrowserRouter>
  </AuthorizerProvider>
);

export default App;
