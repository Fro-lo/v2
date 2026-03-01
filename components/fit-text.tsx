"use client"

import React, { useEffect, useRef, useCallback, useState } from "react"

interface FitTextProps {
  children: string
  className?: string
  as?: keyof React.JSX.IntrinsicElements
  minFontSize?: number
  maxFontSize?: number
  /** Below this viewport width, allow text to wrap naturally (no fit-to-width) */
  mobileBreakpoint?: number
}

export function FitText({
  children,
  className = "",
  as: Tag = "h1",
  minFontSize = 16,
  maxFontSize = 120,
  mobileBreakpoint = 640,
}: FitTextProps) {
  const containerRef = useRef<HTMLElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < mobileBreakpoint)
  }, [mobileBreakpoint])

  const resize = useCallback(() => {
    const el = containerRef.current
    if (!el) return

    // On mobile — let text wrap naturally at a fixed size
    if (window.innerWidth < mobileBreakpoint) {
      el.style.fontSize = ""
      el.style.whiteSpace = ""
      return
    }

    const containerWidth = el.parentElement?.clientWidth ?? el.clientWidth

    let lo = minFontSize
    let hi = maxFontSize

    el.style.whiteSpace = "nowrap"
    el.style.fontSize = `${hi}px`

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
  }, [minFontSize, maxFontSize, mobileBreakpoint])

  useEffect(() => {
    checkMobile()
    resize()

    const handleResize = () => {
      checkMobile()
      resize()
    }

    window.addEventListener("resize", handleResize)
    const observer = new ResizeObserver(handleResize)

    if (containerRef.current?.parentElement) {
      observer.observe(containerRef.current.parentElement)
    }

    return () => {
      window.removeEventListener("resize", handleResize)
      observer.disconnect()
    }
  }, [resize, checkMobile, children])

  return (
    // @ts-expect-error dynamic tag
    <Tag
      ref={containerRef}
      className={className}
      style={{
        display: "block",
        lineHeight: 1.15,
        whiteSpace: isMobile ? "normal" : "nowrap",
      }}
    >
      {children}
    </Tag>
  )
}
