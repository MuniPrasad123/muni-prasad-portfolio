'use client'

import { useEffect, useRef, useState } from 'react'

export function PracticeFrame({ src, title }: { src: string; title: string }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(900)

  useEffect(() => {
    function resize(event: MessageEvent) {
      if (event.source !== frame.current?.contentWindow || event.origin !== 'null') return
      const message = event.data
      if (message?.type !== 'practice-height' || !Number.isInteger(message.height)) return
      if (message.height >= 100 && message.height <= 12000) setHeight(message.height)
    }

    window.addEventListener('message', resize)
    frame.current?.contentWindow?.postMessage('request-practice-height', '*')
    return () => window.removeEventListener('message', resize)
  }, [src])

  return <iframe
    ref={frame}
    title={title}
    src={src}
    sandbox="allow-scripts"
    onLoad={() => frame.current?.contentWindow?.postMessage('request-practice-height', '*')}
    style={{ display: 'block', width: '100%', height, border: 0, borderRadius: 14, marginTop: 16 }}
  />
}
