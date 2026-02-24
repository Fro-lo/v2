import { readFileSync, writeFileSync } from "fs"
import { resolve } from "path"

const lockfilePath = resolve("/vercel/share/v0-project/package-lock.json")
let content = readFileSync(lockfilePath, "utf-8")

const before = (content.match(/15\.2\.4/g) || []).length
content = content.replaceAll("15.2.4", "15.2.6")
const after = (content.match(/15\.2\.6/g) || []).length

writeFileSync(lockfilePath, content, "utf-8")
console.log(`Replaced ${before} occurrences of 15.2.4 → 15.2.6 (now ${after} occurrences of 15.2.6)`)
