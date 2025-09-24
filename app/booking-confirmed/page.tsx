"use client"

import { Suspense } from "react"
import BookingConfirmedContent from "./BookingConfirmedContent"

export default function BookingConfirmedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingConfirmedContent />
    </Suspense>
  )
}