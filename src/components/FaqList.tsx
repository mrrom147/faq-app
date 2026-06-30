import { useEffect, useMemo, useState } from 'react'
import { Faq } from '../types'
import { listAllFaqs, logSearchTerm } from '../utils/firestore'
import { FaqItem } from './FaqItem'
import { Sidebar } from './Sidebar'

export function FaqList() {
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    listAllFaqs()
      .then(setFaqs)
      .finally(() => setLoading(false))
  }, [])

  // Ghi log từ khoá tìm kiếm sau khi người dùng dừng gõ 600ms (tránh log từng ký tự)
  useEffect(() => {
    if (!keyword.trim()) return
    const t = setTimeout(() => {
      logSearchTerm(keyword).catch(() => {})
    }, 600)
    return () => clearTimeout(t)
  }, [keyword])

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    if (!k) return faqs
    return faqs.filter(
      (f) => f.question.toLowerCase().includes(k) || f.answer.toLowerCase().includes(k) || f.category.toLowerCase().includes(k)
    )
  }, [faqs, keyword])

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_280px]">
      <div>
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-ink mb-1">Câu hỏi thường gặp</h1>
          <p className="text-sm text-ink/50">Tìm câu trả lời nhanh cho các thắc mắc nội bộ.</p>
        </div>

        <div className="relative mb-6">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo câu hỏi, nội dung trả lời, hoặc chuyên mục…"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 pl-10 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30">⌕</span>
        </div>

        {loading && <p className="text-sm text-ink/40">Đang tải…</p>}

        {!loading && filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-line py-12 text-center text-sm text-ink/40">
            Không tìm thấy câu hỏi phù hợp.
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((faq) => (
            <FaqItem key={faq.id} faq={faq} />
          ))}
        </div>
      </div>

      <Sidebar onSelectQuestion={setKeyword} />
    </div>
  )
}
