import { axiosInstance } from "../lib/axios";

// Get all videos with filters
export async function getAllVideos(skip = 0, limit = 50, filters = {}) {
  try {
    const params = { skip, limit };
    if (filters.status) params.status = filters.status;
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    
    const response = await axiosInstance.get("/admin/videos", { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch videos");
  }
}

