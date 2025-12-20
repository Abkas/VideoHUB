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
