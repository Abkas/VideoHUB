
import { axiosInstance } from "../lib/axios";

// Signup: POST /users/register
export async function signup({ username, email, password, display_name }) {
  try {
    const payload = {
      username,
      email,
      password
    };
    
    // Only include display_name if it has a value
    if (display_name && display_name.trim()) {
      payload.display_name = display_name.trim();
    }
    
    console.log('Signup payload being sent:', payload);
    const response = await axiosInstance.post("users/register", payload);
    return response.data;
  } catch (error) {
    console.error('Signup error:', error.response?.data);
    console.error('Full error detail:', JSON.stringify(error.response?.data, null, 2));
    throw new Error(error.response?.data?.detail || error.message || "Signup failed");
  }
}

// Login: POST /login
export async function login({ email, password }) {
  try {
    const response = await axiosInstance.post("users/login", {
      email,
      password
    });
    if (response.data && response.data.access_token) {
      localStorage.setItem("access_token", response.data.access_token);
      return response.data;
    } else {
      throw new Error("Login failed: No access token received");
    }
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message || "Login failed");
  }
}

// Logout: Remove token from localStorage and clear user session
export function logout() {
  localStorage.removeItem("access_token");
  // Clear any other stored user data
  sessionStorage.clear();
  // Force reload user state
  window.dispatchEvent(new Event('storage'));
  // Reload the page
  window.location.reload();
}

// Verify token with backend and get user data
export async function verifyToken() {
  const token = localStorage.getItem("access_token");
  if (!token) return { isValid: false, error: "No token found" };

  try {
    const response = await axiosInstance.get("/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return {
      isValid: true,
      user: response.data
    };
  } catch (error) {
    // If token is invalid, clear it from storage
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
    }
    return {
      isValid: false,
      error: error.response?.data?.detail || "Token verification failed"
    }
  }
}

// Upload avatar
export async function uploadAvatar(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to upload avatar');
  }
}

// Delete avatar
export async function deleteAvatar() {
  try {
    const response = await axiosInstance.delete('/users/me/avatar');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to delete avatar');
  }
}

// Update user profile
export async function updateUserProfile(data) {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("No token found");
  try {
    const response = await axiosInstance.put(
      "/users/me",
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || error.message || "Update failed");
  }
}