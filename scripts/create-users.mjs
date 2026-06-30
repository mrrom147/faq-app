/**
 * Script tạo hàng loạt tài khoản đăng nhập (Firebase Authentication)
 * và document phân quyền tương ứng trong Firestore (collection "users").
 *
 * CHUẨN BỊ:
 * 1. Tải Service Account Key:
 *    Firebase Console → Project settings → Service accounts
 *    → "Generate new private key" → lưu file JSON, đặt tên là
 *    `serviceAccountKey.json` và để CÙNG THƯ MỤC với script này.
 *    File này rất nhạy cảm (toàn quyền truy cập project) — KHÔNG commit lên git,
 *    KHÔNG chia sẻ. Đã có sẵn trong .gitignore.
 *
 * 2. Cài thư viện:
 *    npm install firebase-admin --save-dev
 *
 * 3. Chuẩn bị danh sách user cần tạo:
 *    Copy file `users.example.json` thành `users.json` (cùng thư mục) rồi
 *    sửa lại email/password/role cho đúng. role chỉ nhận "admin" hoặc "viewer".
 *
 * CHẠY:
 *    node scripts/create-users.mjs
 *
 * Script sẽ:
 * - Tạo user trong Firebase Authentication (nếu email đã tồn tại sẽ bỏ qua,
 *   không ghi đè mật khẩu để tránh tạo nhầm).
 * - Tạo/ghi đè document users/{uid} trong Firestore với field email + role.
 */

import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import admin from 'firebase-admin'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json')
const usersFilePath = path.join(__dirname, 'users.json')

if (!existsSync(serviceAccountPath)) {
  console.error(
    '✗ Không tìm thấy scripts/serviceAccountKey.json.\n' +
    '  Tải file này tại: Firebase Console → Project settings → Service accounts\n' +
    '  → Generate new private key.'
  )
  process.exit(1)
}

if (!existsSync(usersFilePath)) {
  console.error(
    '✗ Không tìm thấy scripts/users.json.\n' +
    '  Copy scripts/users.example.json thành scripts/users.json rồi sửa nội dung.'
  )
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))
const usersToCreate = JSON.parse(readFileSync(usersFilePath, 'utf-8'))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const auth = admin.auth()
const db = admin.firestore()

function validate(entry) {
  const errors = []
  if (!entry.email) errors.push('thiếu email')
  if (!entry.password || entry.password.length < 6) errors.push('password phải có ít nhất 6 ký tự')
  if (!['admin', 'viewer'].includes(entry.role)) errors.push('role phải là "admin" hoặc "viewer"')
  return errors
}

async function run() {
  console.log(`Chuẩn bị tạo ${usersToCreate.length} tài khoản...\n`)

  for (const entry of usersToCreate) {
    const errors = validate(entry)
    if (errors.length > 0) {
      console.error(`✗ Bỏ qua "${entry.email ?? '(không có email)'}": ${errors.join(', ')}`)
      continue
    }

    try {
      let userRecord
      try {
        // Nếu email đã tồn tại sẵn -> dùng lại, không tạo trùng, không đổi mật khẩu
        userRecord = await auth.getUserByEmail(entry.email)
        console.log(`• ${entry.email} đã tồn tại trong Authentication, dùng lại UID hiện có.`)
      } catch {
        userRecord = await auth.createUser({
          email: entry.email,
          password: entry.password,
          emailVerified: false,
        })
        console.log(`✓ Đã tạo tài khoản: ${entry.email}`)
      }

      await db.collection('users').doc(userRecord.uid).set(
        {
          email: entry.email,
          role: entry.role,
        },
        { merge: true }
      )
      console.log(`  → Gán quyền "${entry.role}" cho ${entry.email} (uid: ${userRecord.uid})\n`)
    } catch (err) {
      console.error(`✗ Lỗi khi xử lý ${entry.email}:`, err.message, '\n')
    }
  }

  console.log('Hoàn tất.')
  process.exit(0)
}

run()
