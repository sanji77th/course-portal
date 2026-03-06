-- Enable RLS
-- Profiles Table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ DEFAULT NOW()
);

-- Articles Table
CREATE TABLE articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title_si TEXT NOT NULL,
    content_si TEXT NOT NULL,
    image_url TEXT,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Text Courses
CREATE TABLE text_courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title_si TEXT NOT NULL,
    description_si TEXT NOT NULL,
    thumbnail_url TEXT,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Text Modules
CREATE TABLE text_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES text_courses ON DELETE CASCADE,
    title_si TEXT NOT NULL,
    content_si TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Courses
CREATE TABLE video_courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title_si TEXT NOT NULL,
    description_si TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    thumbnail_url TEXT,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Modules
CREATE TABLE video_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES video_courses ON DELETE CASCADE,
    title_si TEXT NOT NULL,
    description_si TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Access Codes
CREATE TABLE access_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    course_id UUID REFERENCES video_courses ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_activated BOOLEAN DEFAULT FALSE,
    activated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User IP Tracking
CREATE TABLE user_ips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    ip_address TEXT NOT NULL,
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollment Requests
CREATE TABLE enrollment_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES video_courses ON DELETE CASCADE,
    phone TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE text_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE text_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollment_requests ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified for now, will refine as needed)
-- Profiles: Users can view their own profile, anyone can view (if public info?), admin can view all.
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User IPs: Users can insert, update and view their own ips.
CREATE POLICY "Users can view own IPs" ON user_ips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own IPs" ON user_ips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own IPs" ON user_ips FOR UPDATE USING (auth.uid() = user_id);

-- Articles: Anyone can read, only admin can write.
CREATE POLICY "Anyone can read articles" ON articles FOR SELECT USING (true);

-- Courses: Anyone can read, only admin can write.
CREATE POLICY "Anyone can read text_courses" ON text_courses FOR SELECT USING (true);
CREATE POLICY "Anyone can read text_modules" ON text_modules FOR SELECT USING (true);
CREATE POLICY "Anyone can read video_courses" ON video_courses FOR SELECT USING (true);
CREATE POLICY "Anyone can read video_modules" ON video_modules FOR SELECT USING (true);

-- Access Codes: Only admin or the assigned user can see their codes.
CREATE POLICY "Users can see their own activated codes" ON access_codes FOR SELECT USING (auth.uid() = user_id);

-- Helper function for Admin check (This assumes you set is_admin in the database)
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT is_admin FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin Policies (Example for articles)
CREATE POLICY "Admins can do everything on articles" ON articles FOR ALL USING (is_admin());
CREATE POLICY "Admins can do everything on text_courses" ON text_courses FOR ALL USING (is_admin());
CREATE POLICY "Admins can do everything on text_modules" ON text_modules FOR ALL USING (is_admin());
CREATE POLICY "Admins can do everything on video_courses" ON video_courses FOR ALL USING (is_admin());
CREATE POLICY "Admins can do everything on video_modules" ON video_modules FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage access_codes" ON access_codes FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage profiles" ON profiles FOR ALL USING (is_admin());

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
