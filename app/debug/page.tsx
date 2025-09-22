"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Database, RefreshCw, Search, Copy, CheckCircle } from "lucide-react"

interface SheetData {
  sheetName: string
  headers: string[]
  totalRows: number
  sampleRows: string[][]
  allBookingIds: string[]
}

interface DebugData {
  hasApiKey: boolean
  sheetsFound: number
  sheetData: SheetData[]
  timestamp: string
  error?: string
}

export default function DebugPage() {
  const [debugData, setDebugData] = useState<DebugData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchDebugData()
  }, [])

  const fetchDebugData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/debug-spreadsheet")
      const data = await response.json()
      setDebugData(data)
    } catch (error) {
      console.error("Error fetching debug data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(text)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const filteredBookingIds = debugData?.sheetData
    .flatMap((sheet) => sheet.allBookingIds)
    .filter((id) => id.toLowerCase().includes(searchTerm.toLowerCase()))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#044BD9] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-body">Loading spreadsheet debug info...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#044BD9] text-white">
      {/* Header */}
      <header className="py-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/find-my-vehicle">
                <img
                  src="/images/vehicler-logo-white.png"
                  alt="Vehicler"
                  className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                />
              </Link>
              <h1 className="text-2xl font-bold font-heading">Spreadsheet Debug</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchDebugData}
                disabled={isLoading}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <Link
                href="/find-my-vehicle"
                className="inline-flex items-center gap-2 bg-white text-[#044BD9] px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Tracking
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {debugData?.error ? (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-2 font-heading">Error</h2>
            <p className="font-body">{debugData.error}</p>
            <p className="text-sm text-white/80 mt-2 font-body">
              API Key Available: {debugData.hasApiKey ? "Yes" : "No"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* API Status */}
            <div className="bg-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6" />
                <h2 className="text-xl font-bold font-heading">API Status</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-white/60 font-body">API Key:</span>
                  <span className={`ml-2 font-semibold ${debugData?.hasApiKey ? "text-green-300" : "text-red-300"}`}>
                    {debugData?.hasApiKey ? "Available" : "Missing"}
                  </span>
                </div>
                <div>
                  <span className="text-white/60 font-body">Sheets Found:</span>
                  <span className="ml-2 font-semibold text-white">{debugData?.sheetsFound || 0}</span>
                </div>
                <div>
                  <span className="text-white/60 font-body">Last Updated:</span>
                  <span className="ml-2 font-semibold text-white">
                    {debugData?.timestamp ? new Date(debugData.timestamp).toLocaleTimeString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Sheet Data */}
            {debugData?.sheetData?.map((sheet, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4 font-heading">Sheet: {sheet.sheetName}</h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Headers */}
                  <div>
                    <h4 className="font-semibold mb-2 font-body">Column Headers ({sheet.headers.length})</h4>
                    <div className="bg-black/20 rounded p-3 text-sm font-mono max-h-40 overflow-y-auto">
                      {sheet.headers.map((header, i) => (
                        <div key={i} className="flex">
                          <span className="text-white/60 w-8">{String.fromCharCode(65 + i)}:</span>
                          <span className="text-white">{header || "(empty)"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sample Data */}
                  <div>
                    <h4 className="font-semibold mb-2 font-body">Sample Data ({sheet.totalRows} total rows)</h4>
                    <div className="bg-black/20 rounded p-3 text-sm font-mono max-h-40 overflow-y-auto">
                      {sheet.sampleRows.slice(0, 5).map((row, i) => (
                        <div key={i} className="mb-1 border-b border-white/10 pb-1">
                          <span className="text-white/60">Row {i + 1}:</span>
                          <div className="pl-2">
                            {row.slice(0, 4).map((cell, j) => (
                              <div key={j} className="truncate">
                                <span className="text-white/60">{String.fromCharCode(65 + j)}:</span>{" "}
                                <span className="text-white">{cell || "(empty)"}</span>
                              </div>
                            ))}
                            {row.length > 4 && <div className="text-white/40">... and {row.length - 4} more</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Booking IDs */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-2 font-body">Available Booking IDs ({sheet.allBookingIds.length})</h4>
                  <div className="mb-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search booking IDs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-60 overflow-y-auto">
                    {(filteredBookingIds || sheet.allBookingIds).slice(0, 50).map((id, i) => (
                      <button
                        key={i}
                        onClick={() => copyToClipboard(id)}
                        className="flex items-center justify-between bg-black/20 hover:bg-black/30 px-3 py-2 rounded text-sm font-mono transition-colors group"
                        title="Click to copy"
                      >
                        <span className="truncate">{id}</span>
                        {copiedId === id ? (
                          <CheckCircle className="h-3 w-3 text-green-400 ml-1 flex-shrink-0" />
                        ) : (
                          <Copy className="h-3 w-3 text-white/40 group-hover:text-white/60 ml-1 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                  {(filteredBookingIds || sheet.allBookingIds).length > 50 && (
                    <p className="text-sm text-white/60 mt-2 font-body">
                      Showing first 50 of {(filteredBookingIds || sheet.allBookingIds).length} booking IDs
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Instructions */}
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-3 font-heading">How to Use This Debug Info</h3>
              <div className="space-y-2 text-sm font-body">
                <p>
                  1. <strong>Check API Status:</strong> Make sure the API key is available and sheets are found
                </p>
                <p>
                  2. <strong>Verify Column Headers:</strong> Ensure your spreadsheet has the expected column structure
                </p>
                <p>
                  3. <strong>Find Booking IDs:</strong> Click any booking ID above to copy it, then test tracking
                </p>
                <p>
                  4. <strong>Check Sample Data:</strong> Verify that your data is in the expected format
                </p>
                <p>
                  5. <strong>Test Tracking:</strong> Use a copied booking ID to test the tracking system
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
