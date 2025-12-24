import { axiosInstance } from '../lib/axios';

// Get all videos with filters
export const getAllVideos = async (skip = 0, limit = 20, search = '', category = '', tags = '', sortBy = 'created_at') => {
  try {
    const params = new URLSearchParams();
    if (skip) params.append('skip', skip);
    if (limit) params.append('limit', limit);
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (tags) params.append('tags', tags);
    if (sortBy) params.append('sort_by', sortBy);

    const response = await axiosInstance.get(`/videos/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

// Get trending videos
export const getTrendingVideos = async (limit = 20) => {
  try {
    const response = await axiosInstance.get(`/videos/trending?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    throw error;
  }
};

// Get featured videos
export const getFeaturedVideos = async (limit = 20) => {
  try {
    const response = await axiosInstance.get(`/videos/featured?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching featured videos:', error);
    throw error;
  }
};

// Get hot videos (high engagement)
export const getHotVideos = async (limit = 20) => {
  try {
    const response = await axiosInstance.get(`/videos/hot?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching hot videos:', error);
    throw error;
  }
};

// Get videos from following users
export const getFollowingVideos = async (limit = 20) => {
  try {
    const response = await axiosInstance.get(`/videos/following?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching following videos:', error);
    throw error;
  }
};

// Get recommended videos
export const getRecommendedVideos = async (limit = 20) => {
  try {
    const response = await axiosInstance.get(`/videos/recommended?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recommended videos:', error);
    throw error;
  }
};

// Get video by ID
export const getVideoById = async (videoId) => {
  try {
    const response = await axiosInstance.get(`/videos/${videoId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching video:', error);
    throw error;
  }
};

// Get user videos
export const getUserVideos = async (userId, skip = 0, limit = 20) => {
  try {
    const response = await axiosInstance.get(`/videos/user/${userId}?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user videos:', error);
    throw error;
  }
};

// Increment video view
export const incrementVideoView = async (videoId) => {
  try {
    const response = await axiosInstance.post(`/videos/${videoId}/view`);
    return response.data;
  } catch (error) {
    console.error('Error incrementing view:', error);
    throw error;
  }
};
