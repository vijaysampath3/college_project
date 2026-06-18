-- Create test users in auth.users
-- Password for all is 'password123'

INSERT INTO auth.users (id, instance_id, role, aud, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
VALUES

  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'teacher@test.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "teacher", "full_name": "Teacher Test", "teacher_id": "TCH001"}',
    now(),
    now(),
    '', '', '', ''
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'parent@test.com',
    crypt('password123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "parent", "full_name": "Parent Test"}',
    now(),
    now(),
    '', '', '', ''
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'vijaysampath054@gmail.com',
    crypt('password9848130459', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "admin", "full_name": "Admin Test"}',
    now(),
    now(),
    '', '', '', ''
  );
