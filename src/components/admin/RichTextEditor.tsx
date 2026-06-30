import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'

interface Props {
  value: string
  onChange: (html: string) => void
}

// Bảng màu chữ cố định — đủ dùng cho nhấn mạnh nội dung, tránh để tự do quá
// nhiều màu gây loè loẹt mất nhất quán.
const COLORS = [
  { label: 'Mặc định', value: '' },
  { label: 'Đỏ', value: '#DC2626' },
  { label: 'Cam', value: '#EA580C' },
  { label: 'Xanh lá', value: '#16A34A' },
  { label: 'Xanh dương', value: '#2563EB' },
  { label: 'Tím', value: '#7C3AED' },
  { label: 'Xám', value: '#6B7280' },
]

function ToolbarButton({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean
  onClick: () => void
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-md px-2 py-1 text-sm transition ${
        active ? 'bg-accent text-white' : 'text-ink/60 hover:bg-accentSoft/60'
      }`}
    >
      {children}
    </button>
  )
}

export function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: 'Nhập nội dung câu trả lời…' }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'faq-editor-content min-h-[160px] px-3 py-2 text-sm outline-none',
      },
    },
  })

  if (!editor) return null

  function setLink() {
    const prev = editor!.getAttributes('link').href as string | undefined
    const url = window.prompt('Nhập URL liên kết:', prev ?? 'https://')
    if (url === null) return
    if (url === '') {
      editor!.chain().focus().unsetLink().run()
      return
    }
    editor!.chain().focus().setLink({ href: url }).run()
  }

  return (
    <div className="rounded-lg border border-line bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-line px-2 py-1.5">
        <ToolbarButton title="In đậm" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton title="In nghiêng" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton title="Gạch chân" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <span className="underline">U</span>
        </ToolbarButton>
        <ToolbarButton title="Gạch ngang" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <span className="line-through">S</span>
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-line" />

        <ToolbarButton title="Tiêu đề lớn" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </ToolbarButton>
        <ToolbarButton title="Tiêu đề nhỏ" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          H3
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-line" />

        <ToolbarButton title="Danh sách dấu chấm" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          ••
        </ToolbarButton>
        <ToolbarButton title="Danh sách số" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1.
        </ToolbarButton>
        <ToolbarButton title="Trích dẫn" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          ❝
        </ToolbarButton>
        <ToolbarButton title="Chèn liên kết" active={editor.isActive('link')} onClick={setLink}>
          🔗
        </ToolbarButton>

        <span className="mx-1 h-5 w-px bg-line" />

        {/* Bảng chọn màu chữ */}
        <div className="flex items-center gap-1">
          {COLORS.map((c) => (
            <button
              key={c.label}
              type="button"
              title={c.label}
              onClick={() =>
                c.value
                  ? editor.chain().focus().setColor(c.value).run()
                  : editor.chain().focus().unsetColor().run()
              }
              className="h-5 w-5 rounded-full border border-line"
              style={{ backgroundColor: c.value || '#FFFFFF' }}
            />
          ))}
        </div>

        <span className="mx-1 h-5 w-px bg-line" />

        <ToolbarButton title="Xoá định dạng" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
          ✕
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}
