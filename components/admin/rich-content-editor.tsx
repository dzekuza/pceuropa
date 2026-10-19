'use client'

import { useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResizableImage } from '@/components/articles/resizable-image'
import { createClient } from '@/lib/supabase/client'
import { compressImageFile, imageExtension } from '@/lib/image-compression'

interface RichContentEditorProps {
  initialContent: string
  onChange: (html: string) => void
  placeholder: string
  // Storage folder inside the marketing-assets bucket for inline images
  uploadFolder: string
  onUploadError: (error: unknown) => void
}

export function RichContentEditor({
  initialContent,
  onChange,
  placeholder,
  uploadFolder,
  onUploadError,
}: RichContentEditorProps) {
  const [uploadingImage, setUploadingImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false }),
      ResizableImage,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      handleDrop: (view, event) => {
        const file = event.dataTransfer?.files?.[0]
        if (!file || !file.type.startsWith('image/')) return false
        event.preventDefault()
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos
        uploadImage(file, pos)
        return true
      },
      handlePaste: (view, event) => {
        const file = Array.from(event.clipboardData?.items ?? [])
          .find((item) => item.type.startsWith('image/'))
          ?.getAsFile()
        if (!file) return false
        event.preventDefault()
        uploadImage(file)
        return true
      },
    },
  })

  async function uploadImage(file: File, pos?: number) {
    setUploadingImage(true)
    const compressed = await compressImageFile(file)
    const supabase = createClient()
    const path = `${uploadFolder}/${Date.now()}.${imageExtension(compressed)}`
    const { error } = await supabase.storage
      .from('marketing-assets')
      .upload(path, compressed, { contentType: compressed.type })
    if (error) {
      onUploadError(error)
      setUploadingImage(false)
      return
    }
    const { data } = supabase.storage.from('marketing-assets').getPublicUrl(path)
    if (pos != null) {
      editor?.chain().focus().insertContentAt(pos, { type: 'image', attrs: { src: data.publicUrl } }).run()
    } else {
      editor?.chain().focus().setImage({ src: data.publicUrl }).run()
    }
    setUploadingImage(false)
  }

  function addLink() {
    const url = window.prompt('URL:')
    if (url) editor?.chain().focus().setLink({ href: url }).run()
  }

  const toolbarButtons = [
    {
      icon: Bold,
      action: () => editor?.chain().focus().toggleBold().run(),
      active: editor?.isActive('bold'),
    },
    {
      icon: Italic,
      action: () => editor?.chain().focus().toggleItalic().run(),
      active: editor?.isActive('italic'),
    },
    {
      icon: Heading2,
      action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor?.isActive('heading', { level: 2 }),
    },
    {
      icon: Heading3,
      action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor?.isActive('heading', { level: 3 }),
    },
    {
      icon: List,
      action: () => editor?.chain().focus().toggleBulletList().run(),
      active: editor?.isActive('bulletList'),
    },
    {
      icon: ListOrdered,
      action: () => editor?.chain().focus().toggleOrderedList().run(),
      active: editor?.isActive('orderedList'),
    },
    {
      icon: Quote,
      action: () => editor?.chain().focus().toggleBlockquote().run(),
      active: editor?.isActive('blockquote'),
    },
  ]

  return (
    <>
      <div className="border-b px-6 py-2 flex items-center gap-1 flex-wrap">
        {toolbarButtons.map(({ icon: Icon, action, active }, i) => (
          <Button
            key={i}
            variant={active ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={action}
            type="button"
          >
            <Icon className="h-3.5 w-3.5" />
          </Button>
        ))}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={addLink}
          type="button"
        >
          <Link2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          disabled={uploadingImage}
          onClick={() => imageInputRef.current?.click()}
          type="button"
        >
          {uploadingImage ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ImageIcon className="h-3.5 w-3.5" />
          )}
        </Button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) uploadImage(f)
            e.target.value = ''
          }}
        />
      </div>

      <div className="flex-1 px-6 py-4">
        <EditorContent
          editor={editor}
          className="min-h-[400px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror]:text-foreground [&_.ProseMirror_h2]:text-foreground [&_.ProseMirror_h3]:text-foreground [&_.ProseMirror_p]:text-foreground [&_.ProseMirror_img]:rounded-md [&_.ProseMirror_img]:max-w-full"
        />
      </div>
    </>
  )
}
