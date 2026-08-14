'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface RichTextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function RichTextField({ label, value, onChange }: RichTextFieldProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit.configure({ heading: false, bulletList: false, orderedList: false, blockquote: false, codeBlock: false })],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="rounded-md border">
        <div className="border-b px-2 py-1 flex items-center gap-1">
          <Button
            type="button"
            variant={editor?.isActive('bold') ? 'secondary' : 'ghost'}
            size="icon-xs"
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold />
          </Button>
          <Button
            type="button"
            variant={editor?.isActive('italic') ? 'secondary' : 'ghost'}
            size="icon-xs"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic />
          </Button>
        </div>
        <EditorContent
          editor={editor}
          className="px-3 py-2 text-sm min-h-[80px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[64px]"
        />
      </div>
    </div>
  )
}
