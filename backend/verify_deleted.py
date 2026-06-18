import asyncio
from services.supabase_client import get_supabase_client

def verify_deleted():
    supabase = get_supabase_client()
    
    res = supabase.table('student_profiles').select('*').eq('student_id', 'STU001').execute()
    print("student_profiles STU001:", res.data)
    
    res2 = supabase.table('profiles').select('*').eq('student_id', 'STU001').execute()
    print("profiles STU001:", res2.data)

if __name__ == "__main__":
    verify_deleted()
