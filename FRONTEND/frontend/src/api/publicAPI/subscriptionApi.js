import { axiosInstance as axios } from '../../../lib/axios';

// Get current user's active subscription
export const getMyActiveSubscription = async () => {
  const response = await axios.get('/subscriptions/me');
  return response.data;
};

// Get current user's subscription history
export const getMySubscriptionHistory = async (skip = 0, limit = 20) => {
  const response = await axios.get(`/subscriptions/me/history?skip=${skip}&limit=${limit}`);
  return response.data;
};

// Get all subscriptions for current user (active and historical)
export const getAllMySubscriptions = async () => {
  const response = await axios.get('/subscriptions/me/all');
  return response.data;
};

// Update subscription settings
export const updateMySubscription = async (subscriptionId, data) => {
  const response = await axios.put(`/subscriptions/${subscriptionId}`, data);
  return response.data;
};

// Cancel subscription
export const cancelMySubscription = async (subscriptionId) => {
  const response = await axios.post(`/subscriptions/${subscriptionId}/cancel`);
  return response.data;
};

// Create subscription
export const createSubscription = async (subscriptionData) => {
  const response = await axios.post('/subscriptions/', subscriptionData);
  return response.data;
};

// Get all available subscription plans
export const getSubscriptionPlans = async () => {
  const response = await axios.get('/subscriptions/plans');
  return response.data;
};

// Get subscription statistics
export const getSubscriptionStats = async () => {
  const response = await axios.get('/subscriptions/stats');
  return response.data;
};

// Get subscription by ID
export const getSubscriptionById = async (subscriptionId) => {
  const response = await axios.get(`/subscriptions/${subscriptionId}`);
  return response.data;
};

// Get user's subscription history
export const getUserSubscriptionHistory = async (userId) => {
  const response = await axios.get(`/subscriptions/user/${userId}`);
  return response.data;
};