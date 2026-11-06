// Visual test only: intercepted API fixtures, never imported by the application.
import { chromium } from 'playwright'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  const user = {
    id: 104, email: 'salma.bennani@example.test', firstName: 'Salma', lastName: 'Bennani',
    phone: '+212 6 12 34 56 78', language: 'fr', photoUrl: null, active: true,
    twoFactorEnabled: false, roles: ['ROLE_TEACHER', 'ROLE_PARENT'], permissions: [],
  }
  const accessToken = `header.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.mock-signature`
  const documents = ['APPROVED', 'PENDING', 'REJECTED', 'APPROVED', 'APPROVED'].map((status, index) => ({
    id: 201 + index, documentTypeId: index + 1, documentTypeName: `Pièce justificative — exemple ${index + 1}`,
    status, uploadedAt: '2026-10-12T09:35:00', expiresAt: index === 1 ? null : '2027-10-12',
    rejectionReason: status === 'REJECTED' ? 'Document illisible' : null,
    fileKey: `mock-${index}.pdf`, downloadUrl: `/api/v1/documents/files/mock-${index}.pdf?expires=${Date.now() + 900000}&signature=mock_signature`,
    userId: user.id, userEmail: user.email,
  }))
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    if (path === '/api/v1/auth/login') return route.fulfill({ json: { success: true, data: { tokenType: 'Bearer', accessToken, expiresIn: 3600, user } } })
    if (path === '/api/v1/documents/my-documents') return route.fulfill({ json: documents })
    const document = documents.find(({ id }) => path === `/api/v1/documents/${id}`)
    if (document) return route.fulfill({ json: document })
    return route.fulfill({ status: 404, json: {} })
  })
  await page.goto(process.argv[2] || 'http://127.0.0.1:5174/')
  await page.locator('input[type=email]').fill(user.email)
  await page.locator('input[type=password]').fill('mock-preview-password')
  await page.locator('button[type=submit]').click()
  await page.getByText(documents[4].documentTypeName, { exact: true }).waitFor()
  await page.evaluate(() => document.fonts.ready)
  const captures = []
  for (const [name, width, height] of [['desktop', 1440, 900], ['laptop', 1366, 768], ['mobile', 390, 844], ['tablet', 768, 1024]]) {
    await page.setViewportSize({ width, height })
    await page.evaluate(() => scrollTo(0, 0))
    const path = fileURLToPath(new URL(`./MOCKED-${name}-${width}x${height}.png`, import.meta.url))
    await page.screenshot({ path, fullPage: true })
    const metrics = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      sidebar: document.querySelector('.profile-sidebar').getBoundingClientRect().width,
      topbarHeight: document.querySelector('.profile-topbar').getBoundingClientRect().height,
      profileCard: document.querySelector('.profile-card').getBoundingClientRect().toJSON(),
    }))
    captures.push({ name, width, height, path, ...metrics })
  }
  await page.getByRole('button', { name: 'Actualiser' }).click()
  await page.getByText(documents[4].documentTypeName, { exact: true }).waitFor()
  await page.getByRole('button', { name: `Voir ${documents[0].documentTypeName}` }).click()
  await page.getByRole('link', { name: `Ouvrir ${documents[0].documentTypeName} (nouvel onglet)` }).waitFor()
  const report = { preview: 'MOCKED DATA - not live backend integration; illustrative document categories only', errors, captures }
  await writeFile(new URL('./report.json', import.meta.url), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  if (errors.length || captures.some(({ overflow }) => overflow)) process.exitCode = 1
} finally {
  await browser.close()
}
