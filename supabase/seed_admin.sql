-- ====================================================================
-- HƯỚNG DẪN TẠO TÀI KHOẢN ADMIN CHUẨN 100% KHÔNG BỊ LỖI
-- Tài khoản test: admin1@gmail.com | Mật khẩu: 123456
-- ====================================================================

-- BƯỚC 1: Đăng ký tài khoản trên giao diện web
-- Bạn hãy vào trang Đăng Ký (http://localhost:3000/register) và tạo tài khoản:
-- Email: admin1@gmail.com
-- Mật khẩu: 123456
-- (Việc đăng ký qua web giúp Supabase tự động tạo chuẩn xác các bảng hệ thống auth.users và auth.identities)

-- BƯỚC 2: Chạy câu lệnh SQL dưới đây trong Supabase SQL Editor để nâng cấp thành Admin VIP Pro:

UPDATE public.profiles
SET 
  role = 'admin', 
  is_vip = true, 
  username = 'Admin VIP Pro'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin1@gmail.com'
);

-- Kiểm tra lại tài khoản sau khi nâng cấp:
SELECT * FROM public.profiles WHERE role = 'admin';
