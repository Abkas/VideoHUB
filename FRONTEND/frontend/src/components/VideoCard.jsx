import { useNavigate } from "react-router-dom";
import { Play, Clock } from "lucide-react";

const VideoCard = ({ video }) => {
  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views?.toString() || '0';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };



  const navigate = useNavigate();
  const handleCardClick = () => {
    navigate(`/watch/${video.id}`);
  };

  return (
    <div className="group block cursor-pointer p-2" onClick={handleCardClick}>
      {/* Video Thumbnail */}
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        {video.thumbnail_url ? (
          <img 
            src={video.thumbnail_url} 
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
            <Play className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(video.duration)}
        </div>
      </div>
      {/* Video Title */}
      <h3 className="mt-3 text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
        {video.title}
      </h3>
      {/* Views and Meta Info */}
      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
        <span>{formatViews(video.views)} views</span>
        <span className="mx-1">•</span>
        <span>{formatTimeAgo(video.created_at || video.published_at)}</span>
      </div>
    </div>
  );
};

export default VideoCard;
