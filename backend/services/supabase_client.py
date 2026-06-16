import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

def get_supabase_client() -> Client:
    # Explicitly load .env from the backend root
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    load_dotenv(dotenv_path=env_path, override=True)
    
    url: str = os.environ.get("VITE_SUPABASE_URL") or os.environ.get("SUPABASE_URL")
    key: str = os.environ.get("VITE_SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        raise ValueError("Supabase credentials not found in environment")
        
    return create_client(url, key)
