'use client'

import { useRef, useState } from 'react'
import TiptapImage from '@tiptap/extension-image'
import { ReactNodeViewRenderer, NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react'
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

type ImageAlign = 'left' | 'center' | 'right'

const ALIGN_WRAPPER_CLASS: Record<ImageAlign, string> = {
  left: 'float-left mr-4 mb-2',
  right: 'float-right ml-4 mb-2',
  center: 'mx-auto mb-2',
}

export const ResizableImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.style.width || element.getAttribute('width'),
        renderHTML: (attributes) => (attributes.width ? { style: `width: ${attributes.width}` } : {}),
      },
      align: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align') || 'center',
        renderHTML: (attributes) => ({ 'data-align': attributes.align ?? 'center' }),
      },
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView)
  },
})

function ResizableImageView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [resizing, setResizing] = useState(false)
  const align: ImageAlign = node.attrs.align ?? 'center'

  function startResize(e: React.PointerEvent, direction: 1 | -1) {
    e.preventDefault()
    e.stopPropagation()
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const startX = e.clientX
    const startWidth = wrapper.getBoundingClientRect().width
    setResizing(true)

    function onMove(moveEvent: PointerEvent) {
      const delta = (moveEvent.clientX - startX) * direction
      const newWidth = Math.max(80, Math.round(startWidth + delta))
      updateAttributes({ width: `${newWidth}px` })
    }
    function onUp() {
      setResizing(false)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  return (
    <NodeViewWrapper
      as="div"
      className={`relative inline-block group ${ALIGN_WRAPPER_CLASS[align]}`}
      style={{ width: node.attrs.width || 'auto', maxWidth: '100%' }}
    >
      <div ref={wrapperRef} className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          className={`block w-full h-auto rounded-md ${selected ? 'ring-2 ring-primary' : ''}`}
          draggable={false}
        />

        {/* Align controls */}
        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-background/90 border p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {(['left', 'center', 'right'] as const).map((a) => {
            const Icon = a === 'left' ? AlignLeft : a === 'right' ? AlignRight : AlignCenter
            return (
              <button
                key={a}
                type="button"
                onClick={() => updateAttributes({ align: a })}
                className={`h-6 w-6 flex items-center justify-center rounded-sm ${
                  align === a ? 'bg-secondary' : 'hover:bg-muted'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            )
          })}
        </div>

        {/* Resize handles */}
        <div
          onPointerDown={(e) => startResize(e, -1)}
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-2 rounded-full bg-primary cursor-ew-resize opacity-0 group-hover:opacity-100 ${
            resizing ? 'opacity-100' : ''
          }`}
        />
        <div
          onPointerDown={(e) => startResize(e, 1)}
          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-8 w-2 rounded-full bg-primary cursor-ew-resize opacity-0 group-hover:opacity-100 ${
            resizing ? 'opacity-100' : ''
          }`}
        />
      </div>
    </NodeViewWrapper>
  )
}
