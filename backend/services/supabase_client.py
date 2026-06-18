import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def get_supabase_client() -> Client:
    # Explicitly load .env from the backend root
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    load_dotenv(dotenv_path=env_path, override=True)
    
    # Prefer production-safe key names; fall back to VITE_ prefixed for local dev
    url: str = (
        os.environ.get("SUPABASE_URL")
        or os.environ.get("VITE_SUPABASE_URL")
    )
    key: str = (
        os.environ.get("SUPABASE_SERVICE_KEY")
        or os.environ.get("SUPABASE_KEY")
        or os.environ.get("VITE_SUPABASE_ANON_KEY")
    )
    
    if not url or not key:
        raise ValueError("Supabase credentials not found in environment. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.")
        
    return create_client(url, key)
