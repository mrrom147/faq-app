import { FormEvent, useEffect, useState } from 'react'
import { FaqInput } from '../../types'
import { RichTextEditor } from './RichTextEditor'

interface Props {
  initial?: FaqInput
  submitting?: boolean
  onSubmit: (input: FaqInput) => void
  onCancel: () => void
}

export function FaqForm({ initial, submitting, onSubmit, onCancel }: Props) {
  const [question, setQuestion] = useState(initial?.question ?? '')
  const [answer, setAnswer] = useState(initial?.answer ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [error, setError] = useState('')

  useEffect(() => {
    setQuestion(initial?.question ?? '')
    setAnswer(initial?.answer ?? '')
    setCategory(initial?.category ?? '')
  }, [initial])

  function isAnswerEmpty(html: string) {
    return html.replace(/<[^>]*>/g, '').trim().length === 0
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isAnswerEmpty(answer)) {
      setError('Vui lòng nhập nội dung câu trả lời.')
      return
    }
    setError('')
    onSubmit({ question: question.trim(), answer, category: category.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-line bg-white p-5">
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/60">Chuyên mục</label>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="VD: Tài khoản, Thanh toán…"
          className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/60">Câu hỏi</label>
        <input
          required
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink/60">Câu trả lời</label>
        <RichTextEditor value={answer} onChange={setAnswer} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Đang lưu…' : 'Lưu'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink/60 hover:bg-accentSoft/40 transition"
        >
          Huỷ
        </button>
      </div>
    </form>
  )
}
