-- Function to handle new user creation automatically
-- This runs with SECURITY DEFINER to bypass RLS on the profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_username TEXT;
  base_username TEXT;
  retry_count INTEGER := 0;
  max_retries INTEGER := 5;
  success BOOLEAN := FALSE;
BEGIN
  -- 1. Determine initial Username
  -- Try to get it from metadata
  base_username := NEW.raw_user_meta_data->>'username';
  
  -- If no username in metadata, generate a default one based on ID
  IF base_username IS NULL OR base_username = '' THEN
    base_username := 'User-' || substr(NEW.id::text, 1, 8);
  END IF;

  new_username := base_username;

  -- 2. Insert into profiles with retry logic for unique username constraints
  WHILE retry_count < max_retries AND NOT success LOOP
    BEGIN
      INSERT INTO public.profiles (
        id, 
        username, 
        email, 
        avatar_url,
        gems,
        premium_status,
        created_at,
        updated_at
      )
      VALUES (
        NEW.id,
        new_username,
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        0,
        FALSE,
        NOW(),
        NOW()
      );
      
      success := TRUE;
    EXCEPTION WHEN unique_violation THEN
      -- If username taken, append random suffix and retry
      retry_count := retry_count + 1;
      new_username := base_username || '-' || floor(random() * 10000)::text;
    END;
  END LOOP;

  -- If still failed (extremely unlikely), try one last time with UUID suffix
  IF NOT success THEN
      INSERT INTO public.profiles (
        id, username, email, gems, premium_status, created_at, updated_at
      )
      VALUES (
        NEW.id,
        base_username || '-' || substr(md5(random()::text), 1, 6),
        NEW.email,
        0,
        FALSE,
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO NOTHING; -- Should not happen
  END IF;

  -- 3. Create user_settings entry
  INSERT INTO public.user_settings (user_id, updated_at)
  VALUES (NEW.id, NOW())
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

