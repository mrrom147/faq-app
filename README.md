# KDS FAQ — Website FAQ nội bộ (React + TypeScript + Firebase)

Website FAQ nội bộ: yêu cầu đăng nhập mới xem được toàn bộ site (kể cả frontend),
có khu vực quản trị để thêm/sửa/xoá câu hỏi, tìm kiếm phía frontend, thống kê
"xem nhiều nhất" và "tìm kiếm nhiều nhất". Chặn Google index ở 3 lớp (robots.txt,
meta noindex, HTTP header X-Robots-Tag) + bắt buộc đăng nhập nên crawler không
thể đọc được nội dung.

## 1. Cấu trúc dự án

```
src/
  components/
    admin/        # Form thêm/sửa FAQ, trang quản trị có phân trang
    FaqList.tsx    # Trang frontend: search + danh sách + sidebar
    FaqItem.tsx     # 1 câu hỏi dạng accordion, tự tăng viewCount khi mở
    Sidebar.tsx     # Xem nhiều nhất / Tìm kiếm nhiều nhất
    Login.tsx       # Cổng đăng nhập — chặn toàn site
    ProtectedRoute.tsx
    Layout.tsx
  context/AuthContext.tsx  # Quản lý đăng nhập + role (admin/viewer)
  utils/firestore.ts       # Toàn bộ hàm CRUD + search log + thống kê
  firebase.ts               # Khởi tạo Firebase từ biến môi trường
firestore.rules             # Security Rules: chặn đọc/ghi nếu chưa đăng nhập
vercel.json                  # Header chặn index khi deploy Vercel
public/robots.txt            # Disallow toàn bộ crawler
```

## 2. Cài đặt Firebase (miễn phí — gói Spark)

1. Vào https://console.firebase.google.com → **Add project** → đặt tên (vd `kds-faq`).
2. Vào **Build → Authentication → Sign-in method** → bật **Email/Password**.
3. Vào tab **Users** → **Add user** → tạo tài khoản cho từng nhân sự (email + mật khẩu).
   Đây là cách duy nhất để có tài khoản — site **không có trang đăng ký công khai**.
4. Vào **Build → Firestore Database** → **Create database** → chọn chế độ **Production**.
5. Vào **Project settings → General → Your apps** → bấm biểu tượng Web (`</>`) để tạo
   Web App → copy các giá trị `apiKey`, `authDomain`, `projectId`... dán vào file `.env`
   (copy từ `.env.example`).
6. Phân quyền admin: vào Firestore → tạo collection **`users`** → tạo document có
   **ID = UID** của tài khoản (lấy UID trong tab Authentication) → thêm field:
   - `email` (string)
   - `role` (string) = `admin` hoặc `viewer`

   Người có `role = admin` mới thấy menu **Quản trị** và mới được thêm/sửa/xoá FAQ.

7. Deploy Security Rules: cài Firebase CLI (`npm i -g firebase-tools`), sau đó:
   ```bash
   firebase login
   firebase init firestore   # chọn project vừa tạo, giữ nguyên tên file firestore.rules
   firebase deploy --only firestore:rules
   ```
   Rules đã viết sẵn trong `firestore.rules`: bắt buộc đăng nhập mới đọc được,
   chỉ admin mới ghi câu hỏi.

## 3. Chạy local

```bash
npm install
cp .env.example .env   # rồi điền giá trị Firebase vào
npm run dev
```

## 4. Deploy lên Vercel/Netlify (miễn phí)

**Vercel:**
```bash
npm i -g vercel
vercel
```
Khi được hỏi, thêm các biến môi trường giống file `.env` vào phần
**Environment Variables** trên dashboard Vercel (Settings → Environment Variables).
File `vercel.json` đã cấu hình sẵn header `X-Robots-Tag: noindex` cho toàn site.

**Netlify:** tương tự — `netlify deploy`, build command `npm run build`,
publish directory `dist`, và thêm biến môi trường trong Site settings → Environment.
Với Netlify, thêm file `_headers` trong `public/` với nội dung:
```
/*
  X-Robots-Tag: noindex, nofollow
```

## 5. Cơ chế chặn không cho người ngoài vào

Site áp dụng **3 lớp** theo đúng yêu cầu "khoá toàn bộ site":

1. **Bắt buộc đăng nhập toàn site** — `ProtectedRoute` bọc mọi route kể cả trang
   danh sách FAQ frontend; chưa đăng nhập sẽ bị `redirect` về `/login`.
2. **Chặn Google index** — `<meta name="robots" content="noindex,nofollow">`
   trong `index.html`, `public/robots.txt` disallow toàn bộ, và HTTP header
   `X-Robots-Tag` ở tầng hosting (`vercel.json`).
3. **Firestore Security Rules** — kể cả khi ai đó cố gọi thẳng API Firestore mà
   không qua giao diện, cũng không đọc được dữ liệu nếu chưa đăng nhập
   (rules kiểm `request.auth != null`).

Nếu muốn khoá chặt hơn nữa (vd chặn cả việc nhìn thấy trang đăng nhập), có thể
thêm Basic Auth ở tầng hosting (Vercel Password Protection — có ở gói trả phí,
hoặc dùng Cloudflare Access miễn phí đặt trước domain).

## 6. Giới hạn của gói Firebase miễn phí (Spark)

- Firestore: 50K lượt đọc / 20K lượt ghi / ngày — đủ dùng cho FAQ nội bộ vài
  chục người dùng.
- Authentication: không giới hạn số tài khoản email/password.
- Nếu sau này lượng câu hỏi lên đến hàng nghìn, nên thay phần tìm kiếm client-side
  (`listAllFaqs` rồi filter) bằng Algolia/Typesense để tránh tải hết dữ liệu mỗi lần.
