-- ====================================================================
-- SCRIPT SỬA LỖI 500 KHI ĐĂNG KÝ TÀI KHOẢN (TRÙNG USERNAME/ID)
-- Chạy đoạn lệnh này trong Supabase SQL Editor để khắc phục
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username text;
  final_username text;
BEGIN
  -- Lấy username từ form đăng ký hoặc từ trước chữ @ của email
  base_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  final_username := base_username;

  -- Nếu username đã tồn tại, tự động thêm 4 ký tự ngẫu nhiên phía sau để tránh lỗi Unique constraint
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username AND id != NEW.id) THEN
    final_username := base_username || '_' || substr(NEW.id::text, 1, 4);
  END IF;

  -- Thêm vào profiles với xử lý an toàn
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    final_username,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET username = EXCLUDED.username;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Bắt mọi lỗi ngoại lệ để không bao giờ làm sập tiến trình đăng ký (lỗi 500) của Supabase Auth
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    split_part(NEW.email, '@', 1) || '_' || substr(gen_random_uuid()::text, 1, 6),
    NULL
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Đảm bảo quyền truy cập cho trigger
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated, anon, service_role;
