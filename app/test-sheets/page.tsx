"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Database, RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface TestResult {
  config: {
    sheet: string
    range: string
  }
  success: boolean
  status?: number
  rowCount?: number
  firstFewRows?: string[][]
  allData?: string[][]
  error?: string
}

interface TestData {
  success: boolean
  apiKeyLength?: number
  sheetId?: string
  results?: TestResult[]
  timestamp?: string
  error?: string
}

export default function TestSheetsPage() {
  const [testData, setTestData] = useState<TestData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    runTest()
  }, [])

  const runTest = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/test-sheets")
      const data = await response.json()
      setTestData(data)
    } catch (error) {
      console.error("Error running test:", error)
      setTestData({
        success: false,
        error: error instanceof Error ? error.message : "Failed to run test",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#044BD9] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-body">Testing Google Sheets connection...</p>
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
              <h1 className="text-2xl font-bold font-heading">Google Sheets Connection Test</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={runTest}
                disabled={isLoading}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Run Test Again
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
        {testData?.error ? (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="h-6 w-6 text-red-300" />
              <h2 className="text-xl font-bold font-heading">Test Failed</h2>
            </div>
            <p className="font-body">{testData.error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* API Status */}
            <div className="bg-white/10 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="h-6 w-6" />
                <h2 className="text-xl font-bold font-heading">API Configuration</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-white/60 font-body">API Key Length:</span>
                  <span className={`ml-2 font-semibold ${testData?.apiKeyLength ? "text-green-300" : "text-red-300"}`}>
                    {testData?.apiKeyLength || "Not found"}
                  </span>
                </div>
                <div>
                  <span className="text-white/60 font-body">Sheet ID:</span>
                  <span className="ml-2 font-semibold text-white font-mono text-xs">{testData?.sheetId}</span>
                </div>
                <div>
                  <span className="text-white/60 font-body">Test Time:</span>
                  <span className="ml-2 font-semibold text-white">
                    {testData?.timestamp ? new Date(testData.timestamp).toLocaleTimeString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold font-heading">Connection Test Results</h2>

              {testData?.results?.map((result, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-6 border ${
                    result.success ? "bg-green-500/20 border-green-500/30" : "bg-red-500/20 border-red-500/30"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    {result.success ? (
                      <CheckCircle className="h-6 w-6 text-green-300" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-300" />
                    )}
                    <h3 className="text-lg font-bold font-heading">
                      {result.config.sheet}!{result.config.range}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        result.success ? "bg-green-600 text-white" : "bg-red-600 text-white"
                      }`}
                    >
                      {result.status || "ERROR"}
                    </span>
                  </div>

                  {result.success ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2 font-body">Data Summary</h4>
                          <div className="bg-black/20 rounded p-3 text-sm">
                            <p>
                              Total Rows: <span className="font-semibold">{result.rowCount}</span>
                            </p>
                            <p>
                              Booking IDs Found:{" "}
                              <span className="font-semibold">
                                {result.allData?.slice(1).filter((row) => row[0] && row[0].trim()).length || 0}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2 font-body">First Few Booking IDs</h4>
                          <div className="bg-black/20 rounded p-3 text-sm font-mono">
                            {result.allData?.slice(1, 6).map((row, i) => (
                              <div key={i} className="flex gap-2">
                                <span className="text-white/60">Row {i + 2}:</span>
                                <span className="text-white font-semibold">{row[0] || "(empty)"}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Show all booking IDs if this is the successful one */}
                      {result.rowCount && result.rowCount > 1 && (
                        <div>
                          <h4 className="font-semibold mb-2 font-body">
                            All Booking IDs ({result.allData?.slice(1).filter((row) => row[0] && row[0].trim()).length})
                          </h4>
                          <div className="bg-black/20 rounded p-3 max-h-60 overflow-y-auto">
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                              {result.allData
                                ?.slice(1)
                                .filter((row) => row[0] && row[0].trim())
                                .map((row, i) => (
                                  <div key={i} className="bg-white/10 px-2 py-1 rounded text-xs font-mono">
                                    {row[0].trim()}
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-semibold mb-2 font-body text-red-300">Error Details</h4>
                      <div className="bg-black/20 rounded p-3 text-sm font-mono text-red-200">{result.error}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="h-5 w-5 text-blue-300" />
                <h3 className="text-lg font-bold font-heading">Next Steps</h3>
              </div>
              <div className="space-y-2 text-sm font-body">
                <p>
                  1. <strong>Check the results above</strong> - Look for any successful connections
                </p>
                <p>
                  2. <strong>If no connections work:</strong> Verify your API key has Google Sheets API enabled
                </p>
                <p>
                  3. <strong>If you see booking IDs:</strong> Copy one and test it on the main tracking page
                </p>
                <p>
                  4. <strong>If the sheet name is wrong:</strong> Check your Google Sheet's actual tab names
                </p>
                <p>
                  5. <strong>If permissions error:</strong> Make sure the sheet is publicly readable or shared with your
                  API key
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
