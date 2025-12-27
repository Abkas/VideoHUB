import { axiosInstance } from "../lib/axios";

// Verify admin access
export async function verifyAdmin() {
  try {
    const response = await axiosInstance.get("/admin/verify");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Admin verification failed");
  }
}

// Get platform statistics
export async function getPlatformStats() {
  try {
    const response = await axiosInstance.get("/admin/stats");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch stats");
  }
}

// List all users
export async function getAllUsers(skip = 0, limit = 50) {
  try {
    const response = await axiosInstance.get("/admin/users", {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch users");
  }
}

// Get user details
export async function getUserDetails(userId) {
  try {
    const response = await axiosInstance.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch user details");
  }
}

// Ban user
export async function banUser(userId) {
  try {
    const response = await axiosInstance.put(`/admin/users/${userId}/ban`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to ban user");
  }
}

// Unban user
export async function unbanUser(userId) {
  try {
    const response = await axiosInstance.put(`/admin/users/${userId}/unban`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to unban user");
  }
}

// Promote user to admin
export async function promoteToAdmin(userId) {
  try {
    const response = await axiosInstance.put(`/admin/users/${userId}/promote`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to promote user");
  }
}

// Demote admin to regular user
export async function demoteFromAdmin(userId) {
  try {
    const response = await axiosInstance.put(`/admin/users/${userId}/demote`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to demote user");
  }
}

// Get user subscriptions
export async function getUserSubscriptions(userId) {
  try {
    const response = await axiosInstance.get(`/admin/users/${userId}/subscriptions`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch user subscriptions");
  }
}

// Update user subscription
export async function updateUserSubscription(userId, subscriptionData) {
  try {
    const response = await axiosInstance.put(`/admin/users/${userId}/subscription`, subscriptionData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to update user subscription");
  }
}
