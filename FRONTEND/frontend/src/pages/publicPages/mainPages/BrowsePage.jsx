import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import NavigationBar from "../../../components/NavigationBar";

const mockVideos = [
  { id: 1, title: "Amazing sunset timelapse over the ocean waves", duration: "12:34", views: "1.2M" },
  { id: 2, title: "Urban exploration documentary part one", duration: "8:45", views: "856K" },
  { id: 3, title: "Cooking masterclass with professional chef", duration: "15:20", views: "2.1M" },
  { id: 4, title: "Travel vlog exploring hidden gems", duration: "10:11", views: "543K" },
  { id: 5, title: "Music production tutorial for beginners", duration: "22:30", views: "1.8M" },
  { id: 6, title: "Fitness workout routine at home", duration: "18:45", views: "3.2M" },
  { id: 7, title: "Nature documentary wildlife adventure", duration: "25:10", views: "987K" },
  { id: 8, title: "Tech review latest smartphone comparison", duration: "14:22", views: "2.5M" },
  { id: 9, title: "Art tutorial watercolor painting basics", duration: "11:55", views: "654K" },
  { id: 10, title: "Gaming highlights epic moments compilation", duration: "9:30", views: "4.1M" },
  { id: 11, title: "Dance choreography tutorial step by step", duration: "7:45", views: "1.5M" },
  { id: 12, title: "Photography tips for stunning portraits", duration: "13:20", views: "892K" },
];

const categories = [
  "All", "Documentary", "Music", "Sports", "Gaming", "Lifestyle", "Education", "Entertainment", "Travel", "Food"
];

const BrowsePage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />

      {/* Filters Bar */}
      <div className="sticky top-16 z-40 bg-background border-b border-border">
        <div className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            <div className="relative ml-4">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 px-4 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium"
              >
                {sortBy}
                <ChevronDown className="w-4 h-4" />
              </button>
              {sortOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                  {["Newest", "Most Viewed", "Trending"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setSortOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors ${
                        sortBy === option ? "bg-secondary text-primary" : "text-foreground"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <main className="max-w-[1280px] mx-auto px-2 sm:px-3 md:px-4 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {mockVideos.map((video) => (
            <Link key={video.id} to={`/watch/${video.id}`} className="group">
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">Thumbnail</span>
                </div>
                <div className="absolute bottom-1 right-1 bg-background/90 text-foreground text-xs px-1.5 py-0.5 rounded font-medium">
                  {video.duration}
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {video.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">{video.views} views</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BrowsePage;
