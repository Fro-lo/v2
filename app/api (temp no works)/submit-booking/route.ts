import { type NextRequest, NextResponse } from "next/server"
import {OAuth2Client} from "google-auth-library"
import key from "../../../credentials/key.json"
import crypto from "crypto"
import { google } from 'googleapis';

export async function GET() {
  console.log("=== API Route GET Test ===")
  console.log("All environment variables containing 'GOOGLE':")

  return NextResponse.json({
    message: "API route is working!",
    timestamp: new Date().toISOString(),
    hasToken: !!process.env.GOOGLE_SHEETS_ACCESS_TOKEN,
    tokenPreview: process.env.GOOGLE_SHEETS_ACCESS_TOKEN
      ? `${process.env.GOOGLE_SHEETS_ACCESS_TOKEN.substring(0, 20)}...`
      : "No token found",
    spreadsheetId: "1xd9wUqiLfJVjer9ocWC-ez8U1NNT8mK8TqZekeeKLLo",
  })
}

export async function POST(request: NextRequest) {
  console.log("=== API Route POST Called ===")

  try {
    const bookingData = await request.json()
    console.log("Received booking data:", bookingData)

    // Check if environment variable exists
    if (!process.env.GOOGLE_SHEETS_ACCESS_TOKEN) {
      console.error("Missing GOOGLE_SHEETS_ACCESS_TOKEN environment variable")
      return NextResponse.json(
        {
          success: false,
          error: "Missing API token - GOOGLE_SHEETS_ACCESS_TOKEN not found",
          hasToken: false,
        },
        { status: 500 },
      )
    }

    console.log("Environment token exists:", !!process.env.GOOGLE_SHEETS_ACCESS_TOKEN)

    // Your Google Sheets details
    const SPREADSHEET_ID = "1xd9wUqiLfJVjer9ocWC-ez8U1NNT8mK8TqZekeeKLLo"
    // const client=new OAuth2Client({
    //   clientId: key.web.client_id,
    //   clientSecret: key.web.client_secret,
    //   redirectUri: key.web.redirect_uris[0]
    // });
    const now = Math.floor(Date.now() / 1000);
const scopes = [
  "https://www.googleapis.com/auth/spreadsheets",
].join(" ");

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: key.client_email,
    scope: scopes,
    aud: key.token_uri,
    iat: now,
    exp: now + 3600, // 1 hour
    // For domain-wide delegation, include: sub: "user@yourdomain.com"
  };
  const privateKey = key.private_key.includes("\\n") ? key.private_key.replace(/\\n/g, "\n") : key.private_key;
  const assertion = signJwtRS256(header, payload, key.private_key);
    const params = new URLSearchParams();
// params.append("client_id", key.client_id);
// params.append("client_secret", key.private_key);
params.append("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer"); // или "client_credentials", в зависимости от сценария
params.append("assertion", assertion);

const response = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: params.toString(),
});

const token = await response.json();
const ti = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`);
    const tiJson = await ti.json();
const auth = new google.auth.JWT({
    email: key.client_email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'], // or .../spreadsheets.readonly
  });

  const sheets = google.sheets({ version: 'v4', auth });


    // First, let's try to get sheet information
    console.log("Getting spreadsheet metadata...")
    // const metadataResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}`, {
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    // })
    const metadataResponse = await sheets.spreadsheets.get({
    spreadsheetId:SPREADSHEET_ID,
    // Add fields to limit payload (faster & cheaper)
    fields: 'spreadsheetId,properties.title,sheets(properties(sheetId,title,gridProperties))',
  });
  const metadata = metadataResponse.data

    if (metadataResponse.ok && !!metadata.sheets) {
      
      console.log("📊 Spreadsheet title:", metadata.properties?.title)
      console.log("📋 Available sheets:")
      metadata.sheets?.forEach((sheet: any) => {
        console.log(`- ${sheet.properties.title} (ID: ${sheet.properties.sheetId})`)
      })

      // Use the first sheet name we find
      const firstSheetName = metadata.sheets[0].properties?.title
      console.log("🎯 Using sheet:", firstSheetName)

      const RANGE = `${firstSheetName}!A:R`

      // Prepare the row data
      const rowData = [
        bookingData.bookingId || "",
        bookingData.customerName || "",
        bookingData.customerEmail || "",
        bookingData.customerPhone || "",
        bookingData.customerNotes || "",
        bookingData.pickupAddress || "",
        bookingData.pickupAddressType || "",
        bookingData.deliveryAddress || "",
        bookingData.deliveryAddressType || "",
        bookingData.vehicle || "",
        bookingData.pickupDate || "",
        bookingData.estimatedDelivery || "",
        bookingData.transportType || "",
        bookingData.totalPrice || "",
        bookingData.contactName || "",
        bookingData.contactPhone || "",
        bookingData.specialInstructions || "",
        bookingData.submissionTime || new Date().toISOString(),
      ]

      console.log("📝 Data to append:", rowData)
      console.log("📍 Range:", RANGE)
              const response=await sheets.spreadsheets.values.append({
    spreadsheetId:SPREADSHEET_ID, 
    range: RANGE,          // match your columns
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [rowData] },
  });
      console.log("!!!")
  console.log (response)

      // Use Google Sheets API to append the data
      const appendResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}:append?valueInputOption=RAW`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: [rowData],
          }),
        },
      )

      console.log("Google Sheets API append response status:", appendResponse.status)
      console.log("Google Sheets API append response statusText:", appendResponse.statusText)


      if (appendResponse.ok) {
        const result = await appendResponse.json()
        console.log("✅ Successfully added row to Google Sheets:", result)
        return NextResponse.json({
          success: true,
          message: "Booking data successfully added to Google Sheets",
          updatedRows: result.updates?.updatedRows || 1,
          sheetName: firstSheetName,
          range: result.updates?.updatedRange,
        })
      } else {
        const errorText = await appendResponse.text()
        console.error("❌ Google Sheets API Append Error:")
        console.error("- Status:", appendResponse.status)
        console.error("- Status Text:", appendResponse.statusText)
        console.error("- Error Body:", errorText)

        return NextResponse.json(
          {
            success: false,
            error: `Google Sheets API append error: ${appendResponse.status} ${appendResponse.statusText}`,
            details: errorText,
            sheetName: firstSheetName,
          },
          { status: appendResponse.status },
        )
      }
    } else {
      const metadataError = await metadataResponse.text()
      console.error("❌ Failed to get spreadsheet metadata:")
      console.error("- Status:", metadataResponse.status)
      console.error("- Error:", metadataError)

      return NextResponse.json(
        {
          success: false,
          error: `Failed to access spreadsheet: ${metadataResponse.status}`,
          details: metadataError,
        },
        { status: metadataResponse.status },
      )
    }
  } catch (error) {
    console.error("❌ Error in API route:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit data to Google Sheets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function base64url(input: Buffer | string) {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function signJwtRS256(header: object, payload: object, privateKeyPem: string) {
  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const data = `${headerB64}.${payloadB64}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(data);
  signer.end();
  const signature = signer.sign(privateKeyPem);
  return `${data}.${base64url(signature)}`;
}