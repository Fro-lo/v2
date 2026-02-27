import sharp from "sharp"
import { writeFileSync } from "fs"

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#081C8B" rx="80"/>
  <text x="256" y="370" font-family="Arial, sans-serif" font-size="340" font-weight="bold" text-anchor="middle" fill="white">V</text>
</svg>`

const svgBuffer = Buffer.from(svg)

const icon32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer()
const icon180 = await sharp(svgBuffer).resize(180, 180).png().toBuffer()
const icon192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer()

writeFileSync("/tmp/icon.png", icon32)
writeFileSync("/tmp/apple-icon.png", icon180)
writeFileSync("/tmp/icon-192.png", icon192)

// Copy to project using cp
import { execSync } from "child_process"
execSync("cp /tmp/icon.png /vercel/share/v0-project/app/icon.png")
execSync("cp /tmp/apple-icon.png /vercel/share/v0-project/public/apple-icon.png")
execSync("cp /tmp/icon-192.png /vercel/share/v0-project/public/icon-192.png")

console.log("All favicon files copied to project successfully")





