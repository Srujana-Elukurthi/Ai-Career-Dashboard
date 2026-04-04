import os
import asyncio
from pymongo import MongoClient
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# MongoDB Configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/")
mongo_client = MongoClient(MONGO_URL)
db = mongo_client["career_db"]
users_collection = db["users"]

# Supabase Configuration (NEEDS SERVICE ROLE KEY FOR AUTH CREATION)
SUPABASE_URL = os.getenv("SUPABASE_URL")
# IMPORTANT: Use SERVICE_ROLE_KEY, not ANON_KEY for migration
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY or SUPABASE_SERVICE_KEY == "YOUR_SERVICE_ROLE_KEY":
    print("❌ ERROR: Missing Supabase Credentials!")
    print("Please go to your Supabase Dashboard -> Settings -> API.")
    print("1. Set SUPABASE_URL")
    print("2. Set SUPABASE_SERVICE_ROLE_KEY (use the 'service_role' key, NOT 'anon' key)")
    print("Add these to your .env file inside the 'backend' folder.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async def migrate_users():
    print("🚀 Starting migration from MongoDB to Supabase...")
    
    users = list(users_collection.find())
    print(f"📦 Found {len(users)} users in MongoDB.")
    
    for user in users:
        email = user.get("email")
        username = user.get("username")
        
        print(f"👤 Migrating: {email} ({username})...")
        
        try:
            # Create user in Supabase Auth
            # NOTE: We set a temporary password because we cannot extract the original from bcrypt hash
            temp_password = "MigrationTemp123!"
            
            res = supabase.auth.admin.create_user({
                "email": email,
                "password": temp_password,
                "user_metadata": {"username": username},
                "email_confirm": True # Auto-confirm email
            })
            
            print(f" ✅ Success: Created {email}")
            
        except Exception as e:
            if "User already registered" in str(e):
                print(f" ℹ️ Already Exists: {email}")
            else:
                print(f" ❌ Failed: {email} - {str(e)}")

    print("\n🏁 Migration task finished.")
    print("📢 NOTE: Migrated users will need to reset their passwords or use the temporary: MigrationTemp123!")

if __name__ == "__main__":
    asyncio.run(migrate_users())
