import { Play, Eye, Edit2, Trash2, Tag } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VideoCard = ({ video, formatDuration, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = (e) => {
    e.stopPropagation();
    onDelete(video._id);
    setShowDeleteModal(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:ring-2 hover:ring-primary/50 flex flex-col h-full cursor-pointer" onClick={() => navigate(`/admin/videos/${video._id}`)}>
      {/* Thumbnail */}
      <div className="relative aspect-video bg-black group">
        {video.thumbnail_url ? (
          <img 
            src={video.thumbnail_url} 
            alt={video.title}
            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <Play className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Duration Badge */}
        {video.duration > 0 && (
          <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-black/90 text-white text-[10px] sm:text-xs rounded font-medium">
            {formatDuration(video.duration)}
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
          <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-medium ${
            video.status === 'published' ? 'bg-green-600/90 text-white' :
            video.status === 'flagged' ? 'bg-red-600/90 text-white' :
            video.status === 'private' ? 'bg-purple-600/90 text-white' :
            video.status === 'unlisted' ? 'bg-yellow-600/90 text-white' :
            'bg-gray-700/90 text-white'
          }`}>
            {video.status}
          </span>
        </div>

        {/* Premium & Featured Badges */}
        {(video.is_premium || video.is_featured) && (
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex gap-1">
            {video.is_premium && (
              <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-yellow-600/90 text-white text-[10px] sm:text-xs rounded font-medium">
                Premium
              </span>
            )}
            {video.is_featured && (
              <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-purple-600/90 text-white text-[10px] sm:text-xs rounded font-medium">
                ⭐
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 sm:p-3 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-medium text-xs sm:text-sm text-foreground mb-1 sm:mb-2 line-clamp-2">
          {video.title}
        </h3>
        
        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {video.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="flex items-center gap-0.5 px-1.5 py-0.5 bg-primary/20 text-primary text-[9px] sm:text-[10px] rounded">
                <Tag className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                {tag}
              </span>
            ))}
            {video.tags.length > 3 && (
              <span className="px-1.5 py-0.5 bg-secondary text-muted-foreground text-[9px] sm:text-[10px] rounded">
                +{video.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons - always at bottom */}
        <div className="flex gap-1 sm:gap-2 mt-auto pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/videos/${video._id}`);
            }}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 sm:py-1.5 bg-primary text-primary-foreground rounded text-[10px] sm:text-xs hover:opacity-90 transition-opacity"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">View</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(video);
            }}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 sm:py-1.5 bg-secondary text-foreground rounded text-[10px] sm:text-xs hover:opacity-90 transition-opacity"
          >
            <Edit2 className="w-3 h-3" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 sm:py-1.5 bg-destructive/20 text-destructive rounded text-[10px] sm:text-xs hover:bg-destructive/30 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Delete</span>
          </button>
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-card border border-border rounded-xl p-6 max-w-xs w-full shadow-xl flex flex-col items-center">
                <Trash2 className="w-8 h-8 text-destructive mb-2" />
                <h2 className="text-lg font-bold text-destructive mb-2">Delete Video?</h2>
                <p className="text-sm text-muted-foreground mb-4 text-center">Are you sure you want to delete this video? This action cannot be undone.</p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setShowDeleteModal(false); }}
                    className="flex-1 px-4 py-2 bg-secondary text-foreground rounded-lg font-semibold hover:opacity-80 transition-opacity"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
