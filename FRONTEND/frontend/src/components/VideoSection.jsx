import { ChevronRight } from "lucide-react";
import VideoCard from "./VideoCard";

const VideoSection = ({ title, videos, showViewAll = false, viewAllLink = "#" }) => {
  if (!videos || videos.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        {showViewAll && (
          <a 
            href={viewAllLink}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </a>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </section>
  );
};

export default VideoSection;
