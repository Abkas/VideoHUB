import { axiosInstance } from '../lib/axios';

// Like or dislike a video
export const likeVideo = async (videoId, likeType = 'like') => {
  try {
    const response = await axiosInstance.post('/likes/', {
      video_id: videoId,
      like_type: likeType
    });
    return response.data;
  } catch (error) {
    console.error('Error liking video:', error);
    throw error;
  }
};

// Remove like/dislike from video
export const removeLike = async (videoId) => {
  try {
    const response = await axiosInstance.delete(`/likes/${videoId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing like:', error);
    throw error;
  }
};

// Get like status for a video
export const getLikeStatus = async (videoId) => {
  try {
    const response = await axiosInstance.get(`/likes/video/${videoId}/status`);
    return response.data;
  } catch (error) {
    console.error('Error getting like status:', error);
    throw error;
  }
};

// Get videos liked by current user
export const getMyLikedVideos = async (skip = 0, limit = 20) => {
  try {
    const response = await axiosInstance.get(`/likes/me?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching liked videos:', error);
    throw error;
  }
};

// Get all likes for a video
export const getVideoLikes = async (videoId, skip = 0, limit = 100) => {
  try {
    const response = await axiosInstance.get(`/likes/video/${videoId}?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching video likes:', error);
    throw error;
  }
};
