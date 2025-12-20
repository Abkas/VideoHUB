import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, Trash2, Plus, Edit2, Save, X } from "lucide-react";
import { useAuthorizer } from "../../../Auth/Authorizer";
import { 
  getAllCategories, createCategory, updateCategory, deleteCategory,
  getAllTags, createTag, updateTag, deleteTag 
} from "../../../api/adminAPI/categoryTagApi";
import toast, { Toaster } from 'react-hot-toast';

const AdminCategoryAndTags = () => {
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", slug: "", description: "", color: "#FF6B35" });
  const [newTag, setNewTag] = useState({ name: "", slug: "" });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingTag, setEditingTag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'tags'
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [showAddTagForm, setShowAddTagForm] = useState(false);
  const { isAdmin, isAuthenticated } = useAuthorizer();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, isAdmin, navigate]);

  const fetchData = async () => {
    try {
      const [categoriesData, tagsData] = await Promise.all([
        getAllCategories(),
        getAllTags()
      ]);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (error) {
      toast.error(error.message, {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(0 72% 51%)'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim() || !newCategory.slug.trim()) {
      toast.error('Name and slug are required', {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(0 72% 51%)'
        }
      });
      return;
    }

    try {
      await createCategory(newCategory);
      toast.success('Category created successfully', {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(142 76% 36%)'
        }
      });
      setNewCategory({ name: "", slug: "", description: "", color: "#FF6B35" });
      setShowAddCategoryForm(false);
      fetchData();
    } catch (error) {
      toast.error(error.message, {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(0 72% 51%)'
        }
      });
    }
  };

  const handleUpdateCategory = async (categoryId, data) => {
    try {
      await updateCategory(categoryId, data);
      toast.success('Category updated successfully', {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(142 76% 36%)'
        }
      });
      setEditingCategory(null);
      fetchData();
    } catch (error) {
      toast.error(error.message, {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(0 72% 51%)'
        }
      });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await deleteCategory(categoryId);
      toast.success('Category deleted successfully', {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(142 76% 36%)'
        }
      });
      fetchData();
    } catch (error) {
      toast.error(error.message, {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(0 72% 51%)'
        }
      });
    }
  };

  const handleAddTag = async () => {
    if (!newTag.name.trim() || !newTag.slug.trim()) {
      toast.error('Name and slug are required', {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(0 72% 51%)'
        }
      });
      return;
    }

    try {
      await createTag(newTag);
      toast.success('Tag created successfully', {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(142 76% 36%)'
        }
      });
      setNewTag({ name: "", slug: "" });
      setShowAddTagForm(false);
      fetchData();
    } catch (error) {
      toast.error(error.message, {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(0 72% 51%)'
        }
      });
    }
  };

  const handleUpdateTag = async (tagId, data) => {
    try {
      await updateTag(tagId, data);
      toast.success('Tag updated successfully', {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(142 76% 36%)'
        }
      });
      setEditingTag(null);
      fetchData();
    } catch (error) {
      toast.error(error.message, {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(0 72% 51%)'
        }
      });
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) return;
    
    try {
      await deleteTag(tagId);
      toast.success('Tag deleted successfully', {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(142 76% 36%)'
        }
      });
      fetchData();
    } catch (error) {
      toast.error(error.message, {
        style: {
          background: 'hsl(0 0% 11%)',
          color: 'hsl(0 0% 95%)',
          border: '1px solid hsl(0 72% 51%)'
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold text-foreground">Admin Panel</span>
            </div>
            <Link 
              to="/admin/dashboard"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4 py-6 space-y-8">
        {/* Tab Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 bg-card border border-border rounded-lg p-1">
            <button
              onClick={() => {
                setActiveTab('categories');
                setShowAddCategoryForm(false);
                setShowAddTagForm(false);
              }}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'categories'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Categories ({categories.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('tags');
                setShowAddCategoryForm(false);
                setShowAddTagForm(false);
              }}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'tags'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Tags ({tags.length})
            </button>
          </div>
          
          {activeTab === 'categories' && (
            <button
              onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          )}
          
          {activeTab === 'tags' && (
            <button
              onClick={() => setShowAddTagForm(!showAddTagForm)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span>Add Tag</span>
            </button>
          )}
        </div>

        {/* Categories Section */}
        {activeTab === 'categories' && (
          <section>
            {/* Add Category Form */}
            {showAddCategoryForm && (
              <div className="bg-card border border-border rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-medium text-foreground">Add New Category</h2>
                  <button
                    onClick={() => {
                      setShowAddCategoryForm(false);
                      setNewCategory({ name: "", slug: "", description: "", color: "#FF6B35" });
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Category name"
                    className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                    placeholder="Slug (e.g., technology)"
                    className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Description (optional)"
                    className="md:col-span-2 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                      className="w-12 h-10 bg-secondary border border-border rounded-lg cursor-pointer"
                    />
                    <button 
                      onClick={handleAddCategory}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Category List */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-medium text-foreground">All Categories ({categories.length})</h2>
              </div>
              <div className="divide-y divide-border">
                {categories.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No categories yet. Add your first category above.
                  </div>
                ) : (
                  categories.map((category) => (
                    <div key={category.id} className="p-4">
                      {editingCategory && editingCategory.id === category.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={editingCategory.name}
                              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                              placeholder="Category name"
                              className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <input
                              type="text"
                              value={editingCategory.slug}
                              onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                              placeholder="Slug"
                              className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={editingCategory.description || ''}
                              onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                              placeholder="Description"
                              className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <input
                              type="color"
                              value={editingCategory.color || '#FF6B35'}
                              onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                              className="w-12 h-10 bg-secondary border border-border rounded-lg cursor-pointer"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button 
                            onClick={() => handleUpdateCategory(editingCategory.id, editingCategory)}
                              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
                            >
                              <Save className="w-4 h-4" />
                              <span>Save</span>
                            </button>
                            <button 
                              onClick={() => setEditingCategory(null)}
                              className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors"
                            >
                              <X className="w-4 h-4" />
                              <span>Cancel</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div 
                              className="w-8 h-8 rounded-lg flex-shrink-0 mt-1" 
                              style={{ backgroundColor: category.color || '#FF6B35' }}
                            ></div>
                            <div className="flex-1">
                              <h3 className="font-medium text-foreground">{category.name}</h3>
                              <p className="text-sm text-muted-foreground">{category.slug}</p>
                              {category.description && (
                                <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">{category.video_count || 0} videos</p>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button 
                              onClick={() => setEditingCategory(category)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button 
                            onClick={() => handleDeleteCategory(category.id)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-sm hover:bg-destructive/20 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {/* Tags Section */}
        {activeTab === 'tags' && (
          <section>
            {/* Add Tag Form */}
            {showAddTagForm && (
              <div className="bg-card border border-border rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-medium text-foreground">Add New Tag</h2>
                  <button
                    onClick={() => {
                      setShowAddTagForm(false);
                      setNewTag({ name: "", slug: "" });
                    }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag.name}
                    onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                    placeholder="Tag name"
                    className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={newTag.slug}
                    onChange={(e) => setNewTag({ ...newTag, slug: e.target.value })}
                    placeholder="Slug (e.g., web-development)"
                    className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button 
                    onClick={handleAddTag}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            )}

          {/* Tag List */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-medium text-foreground">All Tags ({tags.length})</h2>
            </div>
            <div className="divide-y divide-border">
              {tags.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No tags yet. Add your first tag above.
                </div>
              ) : (
                tags.map((tag) => (
                  <div key={tag.id} className="p-4">
                    {editingTag && editingTag.id === tag.id ? (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingTag.name}
                            onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                            placeholder="Tag name"
                            className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <input
                            type="text"
                            value={editingTag.slug}
                            onChange={(e) => setEditingTag({ ...editingTag, slug: e.target.value })}
                            placeholder="Slug"
                            className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdateTag(editingTag.id, editingTag)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
                          >
                            <Save className="w-4 h-4" />
                            <span>Save</span>
                          </button>
                          <button 
                            onClick={() => setEditingTag(null)}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{tag.name}</h3>
                          <p className="text-sm text-muted-foreground">{tag.slug}</p>
                          <p className="text-xs text-muted-foreground mt-1">{tag.video_count || 0} videos</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setEditingTag(tag)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-foreground rounded-lg text-sm hover:bg-secondary/80 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteTag(tag.id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-sm hover:bg-destructive/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
        )}
      </main>
    </div>
  );
};

export default AdminCategoryAndTags;
