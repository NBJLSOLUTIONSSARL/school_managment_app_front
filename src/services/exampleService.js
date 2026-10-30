import { axiosClient } from './api/axiosClient'
import { extractApiData, normalizePagination, parseApiError } from '@/utils/apiHelpers'

/**
 * Service d'exemple démontrant :
 * 1. Normalisation transparente de Spring Data Page<T>
 * 2. Normalisation transparente de PageResponse<T>
 * 3. Extraction systématique des données via extractApiData
 * 4. Gestion unifiée des erreurs ProblemDetail (invalidParams) et IA ({ code, message })
 *
 * Tous les retours suivent le contrat uniforme :
 * {
 *   success: boolean,
 *   data: NormalizedPage<T> | T | null,
 *   error: ParsedApiError | null
 * }
 */
export const exampleService = {
  /**
   * Exemple 1 : Récupération depuis un endpoint Spring Boot (Page<Student>)
   * Format natif backend : { content: [...], totalElements: 42, number: 0, size: 10, ... }
   *
   * @param {Object} [params]
   * @param {number} [params.page=1] - 1-indexed UI page
   * @param {number} [params.size=10]
   * @param {string} [params.search='']
   * @returns {Promise<{ success: boolean, data: import('@/utils/apiHelpers').NormalizedPage|null, error: any }>}
   */
  async getStudentsSpringPage({ page = 1, size = 10, search = '' } = {}) {
    try {
      // Conversion UI (1-indexed) vers Spring Data (0-indexed)
      const springPage = Math.max(0, page - 1)
      let res

      try {
        res = await axiosClient.get('/students', {
          params: { page: springPage, size, search },
        })
      } catch (err) {
        // Fallback avec mock Spring Page pour tester sans backend actif
        if (err?.code === 'ERR_NETWORK' || err?.response?.status === 404) {
          const mockStudents = generateMockStudents(42)
          const start = springPage * size
          const content = mockStudents.slice(start, start + size)

          res = {
            data: {
              success: true,
              message: 'Étudiants récupérés',
              data: {
                content,
                totalElements: mockStudents.length,
                totalPages: Math.ceil(mockStudents.length / size),
                number: springPage,
                size,
                first: springPage === 0,
                last: start + size >= mockStudents.length,
                empty: content.length === 0,
                numberOfElements: content.length,
              },
            },
          }
        } else {
          throw err
        }
      }

      const extracted = extractApiData(res)
      const normalized = normalizePagination(extracted, { defaultPageSize: size })

      return {
        success: true,
        data: normalized,
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: parseApiError(error),
      }
    }
  },

  /**
   * Exemple 2 : Récupération depuis un microservice de facturation (PageResponse<Invoice>)
   * Format natif backend : { items: [...], total: 18, page: 1, pageSize: 5, totalPages: 4 }
   *
   * @param {Object} [params]
   * @param {number} [params.page=1]
   * @param {number} [params.size=5]
   * @param {string} [params.status='']
   * @returns {Promise<{ success: boolean, data: import('@/utils/apiHelpers').NormalizedPage|null, error: any }>}
   */
  async getInvoicesPageResponse({ page = 1, size = 5, status = '' } = {}) {
    try {
      let res
      try {
        res = await axiosClient.get('/invoices', {
          params: { page, size, status },
        })
      } catch (err) {
        // Fallback avec mock PageResponse
        if (err?.code === 'ERR_NETWORK' || err?.response?.status === 404) {
          const mockInvoices = generateMockInvoices(18)
          const start = (page - 1) * size
          const items = mockInvoices.slice(start, start + size)

          res = {
            data: {
              items,
              total: mockInvoices.length,
              page,
              pageSize: size,
              totalPages: Math.ceil(mockInvoices.length / size),
              hasNext: page * size < mockInvoices.length,
              hasPrevious: page > 1,
            },
          }
        } else {
          throw err
        }
      }

      const extracted = extractApiData(res)
      const normalized = normalizePagination(extracted, { defaultPageSize: size })

      return {
        success: true,
        data: normalized,
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: parseApiError(error),
      }
    }
  },

  /**
   * Exemple 3 : Création d'un étudiant avec gestion d'erreur RFC 7807 ProblemDetail
   * Démontre la capture des erreurs fines de validation (invalidParams).
   *
   * @param {Object} studentData
   * @returns {Promise<{ success: boolean, data: any, error: any }>}
   */
  async createStudentWithValidation(studentData) {
    try {
      // Validation côté client pour simulation si nécessaire
      const invalidParams = []
      if (!studentData.email || !studentData.email.includes('@')) {
        invalidParams.push({
          name: 'email',
          reason: "L'adresse email institutionnelle est invalide",
        })
      }
      if (!studentData.firstName || studentData.firstName.trim().length < 2) {
        invalidParams.push({
          name: 'firstName',
          reason: 'Le prénom doit contenir au moins 2 caractères',
        })
      }
      if (!studentData.matricule || !studentData.matricule.startsWith('STU-')) {
        invalidParams.push({
          name: 'matricule',
          reason: 'Le matricule doit respecter le format STU-XXXX',
        })
      }

      if (invalidParams.length > 0) {
        // Simule un retour 400 ProblemDetail standard Spring Boot
        const problemError = {
          response: {
            status: 400,
            data: {
              type: 'https://school.edu/errors/validation-failed',
              title: 'Échec de validation des données étudiant',
              status: 400,
              detail: 'Plusieurs champs du formulaire contiennent des valeurs non conformes.',
              instance: '/api/students',
              invalidParams,
            },
          },
        }
        throw problemError
      }

      // Si valide, effectue l'appel ou renvoie le mock
      const newStudent = {
        id: `stu_${Date.now()}`,
        ...studentData,
        createdAt: new Date().toISOString(),
        status: 'Active',
      }

      return {
        success: true,
        data: newStudent,
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: parseApiError(error),
      }
    }
  },

  /**
   * Exemple 4 : Appel au service IA avec gestion d'erreur dédiée ({ code, message })
   *
   * @param {string} prompt
   * @param {boolean} [simulateError=false]
   * @returns {Promise<{ success: boolean, data: any, error: any }>}
   */
  async generateStudentReportAi(prompt, simulateError = false) {
    try {
      if (simulateError || !prompt || prompt.toLowerCase().includes('erreur')) {
        const aiError = {
          response: {
            status: 429,
            data: {
              error: {
                code: 'AI_RATE_LIMIT_EXCEEDED',
                message:
                  'Quota horaire de génération de bulletins IA atteint pour votre établissement.',
                details: { retryAfterSeconds: 60 },
              },
            },
          },
        }
        throw aiError
      }

      return {
        success: true,
        data: {
          summary: `Rapport généré avec succès pour : "${prompt}". L'élève présente d'excellents résultats en mathématiques et une participation active.`,
          model: 'school-eval-gpt-v4',
          generatedAt: new Date().toISOString(),
        },
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: parseApiError(error),
      }
    }
  },
}

// Données fictives pour les tests
function generateMockStudents(count) {
  const firstNames = [
    'Lucas',
    'Emma',
    'Thomas',
    'Léa',
    'Hugo',
    'Chloé',
    'Maxime',
    'Inès',
    'Alexandre',
    'Sarah',
  ]
  const lastNames = [
    'Bernard',
    'Dubois',
    'Petit',
    'Moreau',
    'Laurent',
    'Simon',
    'Michel',
    'Garcia',
    'David',
    'Bertrand',
  ]
  const classes = ['Terminale S1', 'Première A', 'Seconde B', '3ème C', '6ème A']
  const statuses = ['Active', 'Draft', 'Pending', 'Suspended']

  return Array.from({ length: count }, (_, i) => {
    const fn = firstNames[i % firstNames.length]
    const ln = lastNames[i % lastNames.length]
    const num = String(i + 1).padStart(4, '0')
    return {
      id: `stu_${i + 1}`,
      matricule: `STU-2026-${num}`,
      firstName: fn,
      lastName: ln,
      fullName: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@school.edu`,
      className: classes[i % classes.length],
      status: statuses[i % statuses.length],
      enrollmentDate: '2026-09-01',
      averageGrade: Number((11 + (i % 8) * 1.1).toFixed(1)),
    }
  })
}

function generateMockInvoices(count) {
  const statuses = ['Draft', 'Submitted', 'Paid', 'Overdue', 'Cancelled']
  const students = ['Lucas Bernard', 'Emma Dubois', 'Thomas Petit', 'Léa Moreau', 'Hugo Laurent']

  return Array.from({ length: count }, (_, i) => {
    const num = String(i + 1).padStart(4, '0')
    return {
      id: `inv_${i + 1}`,
      invoiceNumber: `INV-2026-${num}`,
      studentName: students[i % students.length],
      amount: 450 + (i % 5) * 120,
      dueDate: '2026-11-15',
      status: statuses[i % statuses.length],
      paymentMethod: i % 2 === 0 ? 'Virement bancaire' : 'Carte bancaire',
    }
  })
}

export default exampleService
