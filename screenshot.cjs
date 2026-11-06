const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

const OUT = 'C:\\Users\\UNT\\AppData\\Local\\Temp\\opencode\\screenshots'
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true })

const viewports = [
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'laptop-1366x768', width: 1366, height: 768 },
  { name: 'mobile-390x844', width: 390, height: 844 },
]

async function main() {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height })
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(OUT, `${vp.name}.png`), fullPage: true })
    console.log(`saved ${vp.name}.png`)
  }

  await browser.close()
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
