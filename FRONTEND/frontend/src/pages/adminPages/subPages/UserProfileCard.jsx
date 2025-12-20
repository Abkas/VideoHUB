import { User, Mail, Calendar, Shield, Ban, CheckCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserProfileCard = ({ user, formatDate }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/50 flex flex-col h-full">
      {/* Card Header with Avatar */}
      <div className="relative h-16 sm:h-24 bg-gradient-to-br from-primary/20 to-primary/5">
        <div className="absolute -bottom-8 sm:-bottom-10 left-4 sm:left-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-card border-4 border-background flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-bold text-primary">
                {user.display_name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Body - flex-1 to push button to bottom */}
      <div className="pt-12 sm:pt-14 px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col flex-1">
        <div className="flex-1">
          {/* User Info */}
          <div className="mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-lg font-semibold text-foreground mb-1 truncate">
              {user.display_name || 'Unknown User'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">@{user.username || 'unknown'}</p>
          </div>

          {/* Email */}
          <div className="flex items-center gap-2 mb-2 sm:mb-3 text-xs sm:text-sm text-muted-foreground">
            <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>

          {/* Join Date */}
          <div className="flex items-center gap-2 mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">Joined {formatDate(user.created_at)}</span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {/* Role Badge */}
            <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
              user.role === 'admin' 
                ? 'bg-purple-900/30 text-purple-300' 
                : 'bg-blue-900/30 text-blue-300'
            }`}>
              <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {user.role || 'user'}
            </span>

            {/* Status Badge */}
            <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
              user.is_banned 
                ? 'bg-red-900/30 text-red-300' 
                : 'bg-green-900/30 text-green-300'
            }`}>
              {user.is_banned ? (
                <>
                  <Ban className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  Banned
                </>
              ) : (
                <>
                  <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  Active
                </>
              )}
            </span>
          </div>
        </div>

        {/* View Details Button - always at bottom */}
        <button
          onClick={() => navigate(`/admin/users/${user._id}`)}
          className="w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground rounded-lg text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity mt-auto"
        >
          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>View</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfileCard;
