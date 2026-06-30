import { useState } from 'react'
import { Faq } from '../types'
import { incrementViewCount } from '../utils/firestore'

export function FaqItem({ faq }: { faq: Faq }) {
  const [open, setOpen] = useState(false)
  const [viewCount, setViewCount] = useState(faq.viewCount)

  function toggle() {
    const next = !open
    setOpen(next)
    if (next) {
      setViewCount((c) => c + 1)
      incrementViewCount(faq.id).catch(() => {})
    }
  }

  return (
    <div className="rounded-xl border border-line bg-white overflow-hidden">
      <button
        onClick={toggle}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
      >
        <div className="flex items-start gap-3">
          <span className="font-display text-accent font-bold text-sm mt-0.5">Q</span>
          <span className="font-medium text-ink text-sm leading-relaxed">{faq.question}</span>
        </div>
        <span className={`shrink-0 text-ink/30 transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
      </button>
      {open && (
        <div className="border-t border-line bg-accentSoft/40 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="font-display text-ink/40 font-bold text-sm mt-0.5">A</span>
            <p className="text-sm leading-relaxed text-ink/80 whitespace-pre-wrap">{faq.answer}</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between px-5 pb-3 pt-1 text-[11px] text-ink/30">
        <span>{faq.category || 'Chung'}</span>
        <span>{viewCount} lượt xem</span>
      </div>
    </div>
  )
}
