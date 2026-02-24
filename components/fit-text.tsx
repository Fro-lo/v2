"use client"

import { useEffect, useRef, useCallback } from "react"

interface FitTextProps {
  children: string
  className?: string
  as?: keyof JSX.IntrinsicElements
  minFontSize?: number
  maxFontSize?: number
}

export function FitText({
  children,
  className = "",
  as: Tag = "h1",
  minFontSize = 16,
  maxFontSize = 120,
}: FitTextProps) {
  const containerRef = useRef<HTMLElement>(null)

  const resize = useCallback(() => {
    const el = containerRef.current
    if (!el) return

    const containerWidth = el.parentElement?.clientWidth ?? el.clientWidth

    let lo = minFontSize
    let hi = maxFontSize

    // Binary search for the largest font size that fits
    el.style.fontSize = `${hi}px`
    el.style.whiteSpace = "nowrap"

    while (hi - lo > 0.5) {
      const mid = (lo + hi) / 2
      el.style.fontSize = `${mid}px`
      if (el.scrollWidth <= containerWidth) {
        lo = mid
      } else {
        hi = mid
      }
    }

    el.style.fontSize = `${lo}px`
  }, [minFontSize, maxFontSize])

  useEffect(() => {
    resize()

    const observer = new ResizeObserver(() => {
      resize()
    })

    if (containerRef.current?.parentElement) {
      observer.observe(containerRef.current.parentElement)
    }

    return () => observer.disconnect()
  }, [resize, children])

  return (
    // @ts-expect-error dynamic tag
    <Tag
      ref={containerRef}
      className={className}
      style={{ whiteSpace: "nowrap", display: "block", lineHeight: 1.15 }}
    >
      {children}
    </Tag>
  )
}
