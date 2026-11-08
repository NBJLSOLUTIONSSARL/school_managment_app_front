import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Progress,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Skeleton,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Separator,
  RoleBasedUserStats,
} from '@/components/ui'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

vi.mock('@/hooks/useI18n', () => ({
  useI18n: vi.fn(() => ({
    t: (key, fallback) => fallback || key,
    language: 'fr',
  })),
}))

let mockUser = { id: 1, name: 'Admin User', role: 'admin' }
let mockHasRole = vi.fn((roles) => {
  if (Array.isArray(roles)) {
    return roles.includes('ROLE_ADMIN') || roles.includes('admin')
  }
  return roles === 'ROLE_ADMIN' || roles === 'admin'
})

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: mockUser,
    hasRole: mockHasRole,
    isAuthenticated: true,
  })),
}))

vi.mock('@/features/dashboard/api/statsService', () => ({
  statsService: {
    getAdminStats: vi.fn().mockResolvedValue({
      totalStudents: 1250,
      totalTeachers: 80,
      totalStaff: 30,
      totalDepartments: 12,
      totalApplications: 45,
      totalInvoiced: 100000,
      totalPaid: 85000,
      totalUnpaid: 15000,
      paymentRate: 85,
      recentEvents: [],
    }),
    getTeacherStats: vi.fn().mockResolvedValue({
      totalStudents: 140,
      totalExams: 18,
      upcomingExams: [{}],
      departmentName: 'Mathématiques',
      specialization: 'Sciences',
      contractType: 'Titulaire',
      events: [],
    }),
    getStudentStats: vi.fn().mockResolvedValue({
      generalAverage: 16.5,
      termTitle: 'Semestre 1',
      rank: 2,
      mention: 'Très Bien',
      submissionsCount: 14,
      upcomingExams: [{}],
      studentNumber: 'STU-2026-001',
      status: 'ACTIVE',
      events: [],
    }),
    getParentStats: vi.fn().mockResolvedValue({
      children: [
        {
          id: 101,
          firstName: 'Léo',
          lastName: 'Dubois',
          average: 15.2,
          term: 'T1',
          mention: 'Bien',
          studentNumber: 'STU-101',
        },
      ],
      events: [],
    }),
    getStaffStats: vi.fn().mockResolvedValue({
      totalApplications: 50,
      pendingApplications: 12,
      acceptedApplications: 35,
      totalStudents: 1250,
      unpaidInvoicesCount: 8,
      totalUnpaidAmount: 4200,
      paidInvoicesCount: 120,
      totalPaidAmount: 95000,
      recentEvents: [],
    }),
  },
}))

describe('shadcn/ui Compact Components & RoleBasedUserStats', () => {
  let container = null
  let root = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
    container = null
  })

  describe('Card & Subcomponents', () => {
    it('renders card with header, title, description, content and footer', () => {
      act(() => {
        root.render(
          <Card className="custom-card">
            <CardHeader>
              <CardTitle>Statistiques Annuelles</CardTitle>
              <CardDescription>Données consolidées</CardDescription>
            </CardHeader>
            <CardContent>
              <p>4,200 inscrits</p>
            </CardContent>
            <CardFooter>
              <button type="button">Détails</button>
            </CardFooter>
          </Card>
        )
      })

      expect(container.querySelector('.custom-card')).not.toBeNull()
      expect(container.textContent).toContain('Statistiques Annuelles')
      expect(container.textContent).toContain('Données consolidées')
      expect(container.textContent).toContain('4,200 inscrits')
      expect(container.textContent).toContain('Détails')
    })
  })

  describe('Badge', () => {
    it('renders badge variants correctly', () => {
      act(() => {
        root.render(
          <div>
            <Badge variant="default">Admin</Badge>
            <Badge variant="success">Actif</Badge>
            <Badge variant="destructive">Retard</Badge>
            <Badge variant="blue">Nouveau</Badge>
          </div>
        )
      })

      expect(container.textContent).toContain('Admin')
      expect(container.textContent).toContain('Actif')
      expect(container.textContent).toContain('Retard')
      expect(container.textContent).toContain('Nouveau')
    })
  })

  describe('Progress', () => {
    it('renders progress bar with appropriate value clamp', () => {
      act(() => {
        root.render(<Progress value={75} max={100} />)
      })

      const pb = container.querySelector('[role="progressbar"]')
      expect(pb).not.toBeNull()
      expect(pb.getAttribute('aria-valuenow')).toBe('75')
    })
  })

  describe('Table', () => {
    it('renders compact table structure with header and cells', () => {
      act(() => {
        root.render(
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matière</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Mathématiques</TableCell>
                <TableCell>18/20</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )
      })

      expect(container.textContent).toContain('Matière')
      expect(container.textContent).toContain('Note')
      expect(container.textContent).toContain('Mathématiques')
      expect(container.textContent).toContain('18/20')
    })
  })

  describe('Tabs', () => {
    it('switches tabs correctly', () => {
      act(() => {
        root.render(
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Général</TabsTrigger>
              <TabsTrigger value="tab2">Avancé</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Contenu Général</TabsContent>
            <TabsContent value="tab2">Contenu Avancé</TabsContent>
          </Tabs>
        )
      })

      expect(container.textContent).toContain('Contenu Général')
      expect(container.textContent).not.toContain('Contenu Avancé')

      const trigger = container.querySelectorAll('button')[1]
      act(() => {
        trigger.click()
      })

      expect(container.textContent).toContain('Contenu Avancé')
      expect(container.textContent).not.toContain('Contenu Général')
    })
  })

  describe('Skeleton & Separator & Tooltip', () => {
    it('renders Skeleton, Separator and Tooltip', () => {
      act(() => {
        root.render(
          <div>
            <Skeleton className="h-4 w-12" />
            <Separator />
            <Tooltip>
              <TooltipTrigger>Aide</TooltipTrigger>
              <TooltipContent>Info utile</TooltipContent>
            </Tooltip>
          </div>
        )
      })

      expect(container.querySelector('.animate-pulse')).not.toBeNull()
      expect(container.querySelector('[role="none"]')).not.toBeNull()
      expect(container.textContent).toContain('Aide')
    })
  })

  describe('RoleBasedUserStats', () => {
    it('renders Admin statistics dynamically', async () => {
      mockHasRole = vi.fn((roles) => roles.includes('ROLE_ADMIN') || roles.includes('admin'))

      await act(async () => {
        root.render(<RoleBasedUserStats />)
      })

      expect(container.textContent).toContain('Directeur / Admin')
      expect(container.textContent).toContain('Élèves Inscrits')
      expect(container.textContent).toMatch(/1[\s\u202F]?250/)
      expect(container.textContent).toContain('Corps Professoral')
      expect(container.textContent).toContain('80')
      expect(container.textContent).toContain('Taux de Recouvrement')
      expect(container.textContent).toContain('85%')
    })

    it('renders Teacher statistics dynamically', async () => {
      mockHasRole = vi.fn((roles) => roles.includes('ROLE_TEACHER') || roles.includes('teacher'))

      await act(async () => {
        root.render(<RoleBasedUserStats />)
      })

      expect(container.textContent).toContain('Professeur')
      expect(container.textContent).toContain('Élèves Encadrés')
      expect(container.textContent).toContain('140')
      expect(container.textContent).toContain('Évaluations Programmées')
      expect(container.textContent).toContain('18')
      expect(container.textContent).toContain('Mathématiques')
    })

    it('renders Student statistics dynamically', async () => {
      mockHasRole = vi.fn((roles) => roles.includes('ROLE_STUDENT') || roles.includes('student'))

      await act(async () => {
        root.render(<RoleBasedUserStats />)
      })

      expect(container.textContent).toContain('Élève')
      expect(container.textContent).toContain('Moyenne Générale')
      expect(container.textContent).toContain('16.50/20')
      expect(container.textContent).toContain('Très Bien')
      expect(container.textContent).toContain('Devoirs & Travaux Rendus')
      expect(container.textContent).toContain('14')
    })

    it('renders Parent statistics dynamically', async () => {
      mockHasRole = vi.fn((roles) => roles.includes('ROLE_PARENT') || roles.includes('parent'))

      await act(async () => {
        root.render(<RoleBasedUserStats />)
      })

      expect(container.textContent).toContain('Parent / Tuteur')
      expect(container.textContent).toContain('Enfants Suivis')
      expect(container.textContent).toContain('1')
      expect(container.textContent).toContain('15.20/20')
    })

    it('renders Staff statistics dynamically', async () => {
      mockHasRole = vi.fn((roles) => roles.includes('ROLE_STAFF') || roles.includes('staff'))

      await act(async () => {
        root.render(<RoleBasedUserStats />)
      })

      expect(container.textContent).toContain('Secrétariat Scolaire')
      expect(container.textContent).toContain('Candidatures d’Admission')
      expect(container.textContent).toContain('50')
      expect(container.textContent).toContain('Factures Scolaires Impayées')
      expect(container.textContent).toContain('8')
    })
  })
})
