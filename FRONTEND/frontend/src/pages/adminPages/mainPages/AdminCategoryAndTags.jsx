import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Trash2, Plus } from "lucide-react";

const initialCategories = [
  "Documentary",
  "Music",
  "Sports",
  "Gaming",
  "Lifestyle",
  "Education",
  "Entertainment",
  "Travel",
  "Food",
  "Technology",
];

const AdminCategories = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
    }
  };

const handleDeleteCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  return (
    <div className="min-h-screen bg-background">
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

      <main className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Category Management</h1>

        {/* Add Category */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <h2 className="font-medium text-foreground mb-3">Add New Category</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Category name"
              className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button 
              onClick={handleAddCategory}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Category List */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-medium text-foreground">Existing Categories ({categories.length})</h2>
          </div>
          <div className="divide-y divide-border">
            {categories.map((category) => (
              <div key={category} className="flex items-center justify-between p-4">
                <span className="text-foreground">{category}</span>
                <button 
                  onClick={() => handleDeleteCategory(category)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-sm hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminCategories;
