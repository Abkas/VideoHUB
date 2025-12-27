import { axiosInstance as axios } from '../lib/axios';

// Get subscription statistics
export const getSubscriptionStats = async () => {
  const response = await axios.get('/admin/subscriptions/stats');
  return response.data;
};

// Get all subscription history
export const getSubscriptionHistory = async (skip = 0, limit = 20) => {
  const response = await axios.get(`/admin/subscriptions/history?skip=${skip}&limit=${limit}`);
  return response.data;
};

// Get all subscription plans
export const getSubscriptionPlans = async () => {
  const response = await axios.get('/admin/subscriptions/plans');
  return response.data;
};

// Create subscription plan
export const createSubscriptionPlan = async (planData) => {
  const response = await axios.post('/admin/subscriptions/plans', planData);
  return response.data;
};

// Update subscription plan
export const updateSubscriptionPlan = async (planId, planData) => {
  const response = await axios.put(`/admin/subscriptions/plans/${planId}`, planData);
  return response.data;
};

// Delete subscription plan
export const deleteSubscriptionPlan = async (planId) => {
  const response = await axios.delete(`/admin/subscriptions/plans/${planId}`);
  return response.data;
};

// Get subscription plan by ID
export const getSubscriptionPlanById = async (planId) => {
  const response = await axios.get(`/admin/subscriptions/plans/${planId}`);
  return response.data;
};

// Get available tags for subscription plans
export const getAvailableTags = async () => {
  const response = await axios.get('/admin/subscriptions/tags');
  return response.data;
};
