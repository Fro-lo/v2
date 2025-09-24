"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Key, ExternalLink, Copy, CheckCircle, AlertTriangle, Database } from "lucide-react"

export default function SetupGuidePage() {
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      setTimeout(() => setCopiedText(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const apiKey = "AIzaSyAVEkgg7GrYaVN1IKwe5fN0e_SqQVOiRU0"

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
              <h1 className="text-2xl font-bold font-heading">Google Sheets API Setup</h1>
            </div>
            <Link
              href="/find-my-vehicle"
              className="inline-flex items-center gap-2 bg-white text-[#044BD9] px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Tracking
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Current Status */}
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-300" />
              <h2 className="text-xl font-bold font-heading">API Key Not Found</h2>
            </div>
            <p className="font-body mb-4">
              The Google Sheets API key is not configured in your environment variables. Follow the steps below to set
              it up.
            </p>
          </div>

          {/* Step 1: Vercel Setup */}
          <div className="bg-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Key className="h-6 w-6 text-blue-300" />
              <h2 className="text-xl font-bold font-heading">Step 1: Add Environment Variable in Vercel</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 font-body">1. Go to your Vercel Dashboard</h3>
                <a
                  href="https://vercel.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 underline"
                >
                  Open Vercel Dashboard <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div>
                <h3 className="font-semibold mb-2 font-body">2. Select your project</h3>
                <p className="text-white/80 text-sm font-body">Find and click on your "find-my-vehicle" project</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 font-body">3. Go to Settings → Environment Variables</h3>
                <p className="text-white/80 text-sm font-body">
                  In your project dashboard, click "Settings" then "Environment Variables"
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2 font-body">4. Add the environment variable</h3>
                <div className="bg-black/20 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Name:</label>
                    <div className="flex items-center gap-2">
                      <code className="bg-black/40 px-3 py-2 rounded text-sm font-mono flex-1">
                        GOOGLE_SHEETS_API_KEY
                      </code>
                      <button
                        onClick={() => copyToClipboard("GOOGLE_SHEETS_API_KEY")}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
                        title="Copy variable name"
                      >
                        {copiedText === "GOOGLE_SHEETS_API_KEY" ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Value:</label>
                    <div className="flex items-center gap-2">
                      <code className="bg-black/40 px-3 py-2 rounded text-sm font-mono flex-1 break-all">{apiKey}</code>
                      <button
                        onClick={() => copyToClipboard(apiKey)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
                        title="Copy API key"
                      >
                        {copiedText === apiKey ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Environment:</label>
                    <p className="text-white/80 text-sm">Select "Production, Preview, and Development"</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 font-body">5. Save and Redeploy</h3>
                <p className="text-white/80 text-sm font-body">
                  Click "Save" then redeploy your application for the changes to take effect
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: Local Development */}
          <div className="bg-white/10 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-6 w-6 text-green-300" />
              <h2 className="text-xl font-bold font-heading">Step 2: Local Development (Optional)</h2>
            </div>

            <div className="space-y-4">
              <p className="text-white/80 font-body">
                If you're running this locally, create a{" "}
                <code className="bg-black/40 px-2 py-1 rounded">.env.local</code> file in your project root:
              </p>

              <div className="bg-black/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold">.env.local</span>
                  <button
                    onClick={() => copyToClipboard(`GOOGLE_SHEETS_API_KEY=${apiKey}`)}
                    className="p-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
                    title="Copy environment variable"
                  >
                    {copiedText === `GOOGLE_SHEETS_API_KEY=${apiKey}` ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <code className="text-sm font-mono text-green-300 break-all">GOOGLE_SHEETS_API_KEY={apiKey}</code>
              </div>
            </div>
          </div>

          {/* Step 3: Verification */}
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-6 w-6 text-blue-300" />
              <h2 className="text-xl font-bold font-heading">Step 3: Verify Setup</h2>
            </div>

            <div className="space-y-3 text-sm font-body">
              <p>After setting up the environment variable and redeploying:</p>
              <div className="pl-4 space-y-2">
                <p>
                  1. Visit{" "}
                  <Link href="/test-sheets" className="text-blue-300 hover:text-blue-200 underline">
                    /test-sheets
                  </Link>{" "}
                  to test the connection
                </p>
                <p>2. You should see "API Key Length: 39" instead of "Not found"</p>
                <p>3. Look for successful connections and booking IDs</p>
                <p>
                  4. Go back to{" "}
                  <Link href="/find-my-vehicle" className="text-blue-300 hover:text-blue-200 underline">
                    the main tracking page
                  </Link>{" "}
                  and try a booking ID
                </p>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-300" />
              <h2 className="text-xl font-bold font-heading">Security Recommendation</h2>
            </div>
            <div className="space-y-2 text-sm font-body">
              <p>Since this API key was shared publicly, consider:</p>
              <div className="pl-4 space-y-1">
                <p>1. Regenerating the API key in Google Cloud Console</p>
                <p>2. Adding HTTP referrer restrictions to limit usage</p>
                <p>3. Restricting the key to only Google Sheets API</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
