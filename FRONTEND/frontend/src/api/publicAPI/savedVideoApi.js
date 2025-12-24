import { axiosInstance } from '../lib/axios';

// Save a video
export const saveVideo = async (videoId) => {
  try {
    const response = await axiosInstance.post(`/saved/${videoId}`);
    return response.data;
  } catch (error) {
    console.error('Error saving video:', error);
    throw error;
  }
};

// Unsave a video
export const unsaveVideo = async (videoId) => {
  try {
    const response = await axiosInstance.delete(`/saved/${videoId}`);
    return response.data;
  } catch (error) {
    console.error('Error unsaving video:', error);
    throw error;
  }
};

// Check if video is saved
export const getSaveStatus = async (videoId) => {
  try {
    const response = await axiosInstance.get(`/saved/${videoId}/status`);
    return response.data;
  } catch (error) {
    console.error('Error getting save status:', error);
    throw error;
  }
};

// Get saved videos
export const getMySavedVideos = async (skip = 0, limit = 20) => {
  try {
    const response = await axiosInstance.get(`/saved/me?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching saved videos:', error);
    throw error;
  }
};
