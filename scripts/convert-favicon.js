import sharp from "sharp"
import { copyFileSync } from "fs"

// Copy and resize to standard favicon sizes
await sharp("/vercel/share/v0-project/app/favicon.jpg")
  .resize(32, 32)
  .png()
  .toFile("/vercel/share/v0-project/app/icon.png")

await sharp("/vercel/share/v0-project/app/favicon.jpg")
  .resize(180, 180)
  .png()
  .toFile("/vercel/share/v0-project/public/apple-icon.png")

await sharp("/vercel/share/v0-project/app/favicon.jpg")
  .resize(192, 192)
  .png()
  .toFile("/vercel/share/v0-project/public/icon-192.png")

console.log("Favicon files generated successfully")
