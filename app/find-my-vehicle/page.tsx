"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Car, Calendar, DollarSign, Package, CheckCircle, Clock, Truck, AlertCircle } from "lucide-react"

type OrderStatus = "Pending" | "Confirmed" | "Picked Up" | "In Transit" | "Delivered" | "Cancelled"

interface Order {
  id: string
  booking_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  pickup_address: string
  pickup_city: string
  pickup_state: string
  delivery_address: string
  delivery_city: string
  delivery_state: string
  vehicle_model: string
  transport_type: string
  vehicle_condition: string
  pickup_date: string
  delivery_date: string
  total_price: string
  status: string
  order_status: OrderStatus
  created_at: string
  special_instructions: string
}

const STATUS_STEPS: { key: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { key: "Pending", label: "Order Placed", icon: <Clock className="w-5 h-5" /> },
  { key: "Confirmed", label: "Confirmed", icon: <CheckCircle className="w-5 h-5" /> },
  { key: "Picked Up", label: "Picked Up", icon: <Package className="w-5 h-5" /> },
  { key: "In Transit", label: "In Transit", icon: <Truck className="w-5 h-5" /> },
  { key: "Delivered", label: "Delivered", icon: <CheckCircle className="w-5 h-5" /> },
]

function getStatusIndex(status: OrderStatus): number {
  if (status === "Cancelled") return -1
  return STATUS_STEPS.findIndex((s) => s.key === status)
}

function StatusTimeline({ status }: { status: OrderStatus }) {
  const currentIndex = getStatusIndex(status)

  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <span className="text-red-700 font-medium">This order has been cancelled</span>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Progress bar */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200">
        <div
          className="h-full bg-[#081C8B] transition-all duration-500"
          style={{ width: currentIndex === 0 ? "0%" : `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
        />
      </div>

      <div className="relative flex justify-between">
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          return (
            <div key={step.key} className="flex flex-col items-center gap-2">
              <div
          <div className="w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all
                  ${isCompleted ? "bg-[#081C8B] text-white" : ""}
                  ${isCurrent ? "bg-[#081C8B] text-white ring-4 ring-blue-100" : ""}
                  ${!isCompleted && !isCurrent ? "bg-white border-2 border-gray-200 text-gray-400" : ""}
                `}
              >
                {step.icon}
              </div>
              <span
                className={`text-xs font-medium text-center max-w-[70px] leading-tight
                  ${isCurrent ? "text-[#081C8B]" : isCompleted ? "text-[#081C8B]" : "text-gray-400"}
                `}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  const orderStatus = (order.order_status || order.status || "Pending") as OrderStatus

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-[#081C8B] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-blue-200 text-xs font-medium uppercase tracking-wider">Booking ID</p>
          <p className="text-white text-xl font-bold">{order.booking_id}</p>
        </div>
        <div className="text-right">
          <p className="text-blue-200 text-xs">Placed on</p>
          <p className="text-white text-sm font-medium">
            {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Status Timeline */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Shipment Status</h3>
          <StatusTimeline status={orderStatus} />
        </div>

        <div className="border-t border-gray-100 pt-6 grid md:grid-cols-2 gap-6">
          {/* Route */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Route</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Pickup</p>
                  <p className="text-sm text-gray-800 font-medium">
                    {order.pickup_city && order.pickup_state
                      ? `${order.pickup_city}, ${order.pickup_state}`
                      : order.pickup_address || "—"}
                  </p>
                  {order.pickup_date && (
                    <p className="text-xs text-gray-400 mt-0.5">{order.pickup_date}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-vehicler-blue" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Delivery</p>
                  <p className="text-sm text-gray-800 font-medium">
                    {order.delivery_city && order.delivery_state
                      ? `${order.delivery_city}, ${order.delivery_state}`
                      : order.delivery_address || "—"}
                  </p>
                  {order.delivery_date && (
                    <p className="text-xs text-gray-400 mt-0.5">Est. {order.delivery_date}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle & Price */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Details</h3>
            <div className="space-y-2">
              {order.vehicle_model && (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Car className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Vehicle</p>
                    <p className="text-sm text-gray-800 font-medium">{order.vehicle_model}</p>
                  </div>
                </div>
              )}
              {order.transport_type && (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Transport</p>
                    <p className="text-sm text-gray-800 font-medium">{order.transport_type}</p>
                  </div>
                </div>
              )}
              {order.total_price && (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Total Price</p>
                    <p className="text-sm text-gray-800 font-bold">{order.total_price}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Special instructions */}
        {order.special_instructions && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Special Instructions</p>
            <p className="text-sm text-gray-600">{order.special_instructions}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FindMyVehiclePage() {
  const [searchValue, setSearchValue] = useState("")
  const [searchType, setSearchType] = useState<"bookingId" | "email">("bookingId")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchValue.trim()) return

    setLoading(true)
    setError(null)
    setOrders([])
    setSearched(true)

    const params = new URLSearchParams()
    params.set(searchType, searchValue.trim())

    try {
      const res = await fetch(`/api/track-order?${params.toString()}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
      } else {
        setOrders(data.orders)
      }
    } catch {
      setError("Failed to connect. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <div className="bg-[#081C8B] py-12 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 text-balance">
              Track Your Shipment
            </h1>
            <p className="text-blue-200 text-base md:text-lg">
              Enter your booking ID or email to check your order status
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto px-4 -mt-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            {/* Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
              <button
                onClick={() => { setSearchType("bookingId"); setSearchValue(""); }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  searchType === "bookingId"
                    ? "bg-white text-[#081C8B] shadow-sm font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Booking ID
              </button>
              <button
                onClick={() => { setSearchType("email"); setSearchValue(""); }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  searchType === "email"
                    ? "bg-white text-[#081C8B] shadow-sm font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Email Address
              </button>
            </div>

            <form onSubmit={handleSearch} className="flex gap-3">
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={searchType === "bookingId" ? "e.g. #AB1X2Y" : "e.g. john@example.com"}
                className="flex-1 h-11 border-gray-200 focus:border-[#081C8B] focus:ring-[#081C8B]"
              />
              <Button
                type="submit"
                disabled={loading || !searchValue.trim()}
                className="bg-[#081C8B] hover:bg-[#044BD9] text-white h-11 px-6"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && searched && orders.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-gray-700 font-semibold text-lg">No orders found</p>
              <p className="text-gray-400 text-sm mt-1">
                Check your {searchType === "bookingId" ? "booking ID" : "email address"} and try again
              </p>
            </div>
          )}

          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}

          {orders.length > 0 && (
            <p className="text-center text-xs text-gray-400 pt-2">
              Showing {orders.length} order{orders.length > 1 ? "s" : ""}. Need help?{" "}
              <a href="tel:+18554227872" className="text-[#081C8B] hover:underline font-medium">
                Call (855) 422-7872
              </a>
            </p>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
