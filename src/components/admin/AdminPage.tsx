import { useState } from 'react'
import { useEffect } from 'react'
import { Faq, FaqInput } from '../../types'
import {
  createFaq,
  deleteFaq,
  listFaqsPaginated,
  updateFaq,
  QueryDocumentSnapshot,
  DocumentData,
} from '../../utils/firestore'
import { useAuth } from '../../context/AuthContext'
import { FaqForm } from './FaqForm'

export function AdminPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState<Faq | null>(null)
  const [creating, setCreating] = useState(false)

  // Giữ stack các con trỏ trang để hỗ trợ Trang trước / Trang sau
  const [cursors, setCursors] = useState<(QueryDocumentSnapshot<DocumentData> | undefined)[]>([undefined])
  const [pageIndex, setPageIndex] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  async function loadPage(index: number) {
    setLoading(true)
    const cursor = cursors[index]
    const res = await listFaqsPaginated(cursor)
    setItems(res.items)
    setHasMore(res.hasMore)
    if (res.hasMore && cursors.length === index + 1) {
      setCursors((prev) => [...prev, res.lastDoc])
    }
    setPageIndex(index)
    setLoading(false)
  }

  useEffect(() => {
    loadPage(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCreate(input: FaqInput) {
    if (!user) return
    setSubmitting(true)
    try {
      await createFaq(input, user.uid)
      setCreating(false)
      await loadPage(0)
      setCursors([undefined])
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate(input: FaqInput) {
    if (!editing) return
    setSubmitting(true)
    try {
      await updateFaq(editing.id, input)
      setEditing(null)
      await loadPage(pageIndex)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Xoá câu hỏi này?')) return
    await deleteFaq(id)
    await loadPage(pageIndex)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink mb-1">Quản trị FAQ</h1>
          <p className="text-sm text-ink/50">Thêm, sửa, xoá câu hỏi.</p>
        </div>
        {!creating && !editing && (
          <button
            onClick={() => setCreating(true)}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
          >
            + Thêm câu hỏi
          </button>
        )}
      </div>

      {creating && (
        <div className="mb-6">
          <FaqForm submitting={submitting} onSubmit={handleCreate} onCancel={() => setCreating(false)} />
        </div>
      )}

      {editing && (
        <div className="mb-6">
          <FaqForm
            initial={{ question: editing.question, answer: editing.answer, category: editing.category }}
            submitting={submitting}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {loading ? (
        <p className="text-sm text-ink/40">Đang tải…</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-accentSoft/30 text-left text-xs uppercase tracking-wide text-ink/50">
                <th className="px-4 py-3 font-medium">Câu hỏi</th>
                <th className="px-4 py-3 font-medium">Chuyên mục</th>
                <th className="px-4 py-3 font-medium">Lượt xem</th>
                <th className="px-4 py-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((f) => (
                <tr key={f.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 max-w-md">
                    <p className="line-clamp-1 font-medium text-ink">{f.question}</p>
                  </td>
                  <td className="px-4 py-3 text-ink/60">{f.category || '—'}</td>
                  <td className="px-4 py-3 text-ink/60">{f.viewCount}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditing(f)
                        setCreating(false)
                      }}
                      className="mr-3 text-accent hover:underline"
                    >
                      Sửa
                    </button>
                    <button onClick={() => handleDelete(f.id)} className="text-red-500 hover:underline">
                      Xoá
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-ink/40">
                    Chưa có câu hỏi nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-sm">
        <button
          disabled={pageIndex === 0}
          onClick={() => loadPage(pageIndex - 1)}
          className="rounded-lg border border-line px-3 py-1.5 text-ink/60 disabled:opacity-30"
        >
          ← Trang trước
        </button>
        <span className="text-ink/40">Trang {pageIndex + 1}</span>
        <button
          disabled={!hasMore}
          onClick={() => loadPage(pageIndex + 1)}
          className="rounded-lg border border-line px-3 py-1.5 text-ink/60 disabled:opacity-30"
        >
          Trang sau →
        </button>
      </div>
    </div>
  )
}
