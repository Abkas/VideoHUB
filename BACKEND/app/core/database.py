import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pathlib import Path


env_path = Path(__file__).parent.parent / '.env' 
load_dotenv(dotenv_path=env_path)

url = os.getenv("MONGODB_CONNECTION")
print("MongoDB connection string:", url)  # Debug print
client = MongoClient(url)

try:
    client.admin.command('ping')
    print("✅ Connected to MongoDB!")
except Exception as e:
    print("❌ Could not connect to MongoDB:", e)

