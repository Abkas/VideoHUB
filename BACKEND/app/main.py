from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from app.core.database import client

# Import routers
from app.routes.user import user_routes, payment_transaction_routes, subscription_routes, watch_history_routes, follower_routes, saved_video_routes
from app.routes.utility import playlist_routes, category_routes, tag_routes
from app.routes.video import comment_routes, like_routes, video_routes, view_routes
from app.routes.admin import admin_routes
# Note: Old admin subscription routes removed - using new time-based system

load_dotenv()

app = FastAPI(
    title="VideoHUB API",
    description="Video streaming platform API",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Specific origins for credentials
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Welcome to VideoHUB API",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Health check
@app.get("/health")
def health_check():
    return {"status": "healthy"}


# Register routers
# User routes
app.include_router(user_routes.router)
app.include_router(payment_transaction_routes.router)
app.include_router(subscription_routes.router)
app.include_router(watch_history_routes.router)
app.include_router(follower_routes.router)
app.include_router(saved_video_routes.router)

# Utility routes
app.include_router(playlist_routes.router)
app.include_router(category_routes.router)
app.include_router(tag_routes.router)

# Video routes
app.include_router(comment_routes.router)
app.include_router(like_routes.router)
app.include_router(video_routes.router)
app.include_router(view_routes.router)

# Admin routes
app.include_router(admin_routes.router)
from app.routes.admin import subscription_routes as admin_subscription_routes
app.include_router(admin_subscription_routes.router)
