import { useEffect, useState } from 'react'
import { Faq, SearchStat } from '../types'
import { listMostViewed, listMostSearched } from '../utils/firestore'

export function Sidebar({ onSelectQuestion }: { onSelectQuestion: (q: string) => void }) {
  const [mostViewed, setMostViewed] = useState<Faq[]>([])
  const [mostSearched, setMostSearched] = useState<SearchStat[]>([])

  useEffect(() => {
    listMostViewed(5).then(setMostViewed).catch(() => {})
    listMostSearched(5).then(setMostSearched).catch(() => {})
  }, [])

  return (
    <aside className="space-y-6">
      <div className="rounded-xl border border-line bg-white p-4">
        <h3 className="font-display text-xs font-bold uppercase tracking-wide text-ink/50 mb-3">
          Xem nhiều nhất
        </h3>
        <ul className="space-y-2.5">
          {mostViewed.map((f, i) => (
            <li key={f.id} className="flex gap-2 text-sm">
              <span className="text-accent font-display font-bold text-xs mt-0.5">{i + 1}</span>
              <button onClick={() => onSelectQuestion(f.question)} className="text-left text-ink/70 hover:text-accent transition line-clamp-2">
                {f.question}
              </button>
            </li>
          ))}
          {mostViewed.length === 0 && <li className="text-xs text-ink/30">Chưa có dữ liệu</li>}
        </ul>
      </div>

      <div className="rounded-xl border border-line bg-white p-4">
        <h3 className="font-display text-xs font-bold uppercase tracking-wide text-ink/50 mb-3">
          Tìm kiếm nhiều nhất
        </h3>
        <ul className="space-y-2.5">
          {mostSearched.map((s, i) => (
            <li key={s.term} className="flex gap-2 text-sm">
              <span className="text-accent font-display font-bold text-xs mt-0.5">{i + 1}</span>
              <button onClick={() => onSelectQuestion(s.term)} className="text-left text-ink/70 hover:text-accent transition">
                {s.term} <span className="text-ink/30">({s.count})</span>
              </button>
            </li>
          ))}
          {mostSearched.length === 0 && <li className="text-xs text-ink/30">Chưa có dữ liệu</li>}
        </ul>
      </div>
    </aside>
  )
}
