"""
Supabase client singleton for VidyaMitra.
All routers import `supabase` from this module.
"""
import os
from typing import Optional
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

supabase: Optional[Client] = None

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[⚠️  Supabase] SUPABASE_URL or SUPABASE_KEY not set — database features disabled.")
else:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print(f"[✅ Supabase] Connected to {SUPABASE_URL}")
