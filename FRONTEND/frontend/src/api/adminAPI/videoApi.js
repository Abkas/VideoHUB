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

// Get video by ID
export async function getVideoById(videoId) {
  try {
    const response = await axiosInstance.get(`/admin/videos/${videoId}/details`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch video details");
  }
}

// Create video
export async function createVideo(videoData) {
  try {
    const response = await axiosInstance.post("/admin/videos", videoData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to create video");
  }
}

// Update video
export async function updateVideo(videoId, videoData) {
  try {
    const response = await axiosInstance.put(`/admin/videos/${videoId}`, videoData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to update video");
  }
}

// Delete video
export async function deleteVideo(videoId) {
  try {
    const response = await axiosInstance.delete(`/admin/videos/${videoId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to delete video");
  }
}

// Upload video file to Cloudinary
export async function uploadVideo(file, onUploadProgress) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/admin/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to upload video");
  }
}

// Upload thumbnail file to Cloudinary
export async function uploadThumbnail(file, onUploadProgress) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    // Use /admin/upload/thumbnail for thumbnails
    const response = await axiosInstance.post('/admin/upload/thumbnail', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to upload thumbnail");
  }
}

// Get full video details with statistics
export async function getVideoDetails(videoId) {
  try {
    const response = await axiosInstance.get(`/admin/videos/${videoId}/details`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch video details");
  }
}

