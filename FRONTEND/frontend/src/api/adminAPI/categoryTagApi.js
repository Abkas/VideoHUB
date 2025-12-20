import { axiosInstance } from "../lib/axios";

// Get all categories
export async function getAllCategories(activeOnly = false) {
  try {
    const response = await axiosInstance.get("/categories/", {
      params: { active_only: activeOnly }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch categories");
  }
}

// Create category
export async function createCategory(categoryData) {
  try {
    const response = await axiosInstance.post("/categories/", categoryData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to create category");
  }
}

// Update category
export async function updateCategory(categoryId, categoryData) {
  try {
    const response = await axiosInstance.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to update category");
  }
}

// Delete category
export async function deleteCategory(categoryId) {
  try {
    const response = await axiosInstance.delete(`/categories/${categoryId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to delete category");
  }
}

// Get all tags
export async function getAllTags(activeOnly = false) {
  try {
    const response = await axiosInstance.get("/tags/", {
      params: { active_only: activeOnly }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to fetch tags");
  }
}

// Create tag
export async function createTag(tagData) {
  try {
    const response = await axiosInstance.post("/tags/", tagData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to create tag");
  }
}

// Update tag
export async function updateTag(tagId, tagData) {
  try {
    const response = await axiosInstance.put(`/tags/${tagId}`, tagData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to update tag");
  }
}

// Delete tag
export async function deleteTag(tagId) {
  try {
    const response = await axiosInstance.delete(`/tags/${tagId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to delete tag");
  }
}
