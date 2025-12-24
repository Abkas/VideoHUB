import { axiosInstance } from '../lib/axios';

// Create a new comment
export const createComment = async (videoId, text, parentCommentId = null) => {
  try {
    const response = await axiosInstance.post('/comments/', {
      video_id: videoId,
      text: text,
      parent_comment_id: parentCommentId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
};

// Get comments for a video
export const getVideoComments = async (videoId, skip = 0, limit = 50) => {
  try {
    const response = await axiosInstance.get(`/comments/video/${videoId}?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

// Get comment by ID
export const getCommentById = async (commentId) => {
  try {
    const response = await axiosInstance.get(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching comment:', error);
    throw error;
  }
};

// Get replies to a comment
export const getCommentReplies = async (commentId, skip = 0, limit = 50) => {
  try {
    const response = await axiosInstance.get(`/comments/${commentId}/replies?skip=${skip}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching replies:', error);
    throw error;
  }
};

// Update a comment
export const updateComment = async (commentId, text) => {
  try {
    const response = await axiosInstance.put(`/comments/${commentId}`, { text });
    return response.data;
  } catch (error) {
    console.error('Error updating comment:', error);
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (commentId) => {
  try {
    const response = await axiosInstance.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};
