import asyncio
from services.supabase_client import get_supabase_client

def delete_student():
    supabase = get_supabase_client()
    
    # 1. Find the student in profiles or student_profiles
    # In seed.sql, the email was student@test.com and student_id was STU001
    
    # Let's search by email in auth.users
    print("Deleting test student...")
    users = supabase.auth.admin.list_users()
    
    student_auth_id = None
    for u in users:
        if hasattr(u, 'email') and u.email == 'student@test.com':
            student_auth_id = u.id
            break
        elif hasattr(u, 'user_metadata') and u.user_metadata.get('student_id') == 'STU001':
            student_auth_id = u.id
            break
            
    if student_auth_id:
        print(f"Found student auth user with id {student_auth_id}. Deleting...")
        # Since auth.users cascades to public.profiles, this should be enough
        # But let's also manually delete from student_profiles just in case
        supabase.table('teacher_student_assignments').delete().eq('student_id', student_auth_id).execute()
        supabase.table('student_profiles').delete().eq('user_id', student_auth_id).execute()
        
        # Delete from profiles (though it's cascade)
        supabase.table('profiles').delete().eq('id', student_auth_id).execute()
        
        # Delete auth user
        supabase.auth.admin.delete_user(student_auth_id)
        print("Test student deleted successfully.")
    else:
        print("Test student not found in auth.users.")
        
    # Also attempt to delete by student_id STU001 in student_profiles
    res = supabase.table('student_profiles').select('*').eq('student_id', 'STU001').execute()
    for s in res.data:
        print(f"Deleting leftover student_profiles entry: {s['id']}")
        supabase.table('teacher_student_assignments').delete().eq('student_id', s['id']).execute()
        supabase.table('student_profiles').delete().eq('id', s['id']).execute()
        if s.get('user_id'):
            supabase.auth.admin.delete_user(s['user_id'])
            
if __name__ == "__main__":
    delete_student()
