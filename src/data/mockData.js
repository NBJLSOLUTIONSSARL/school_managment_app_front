export const INITIAL_STUDENTS = [
  {
    id: 1,
    studentNumber: "ETU-2026-001",
    firstName: "Aya",
    lastName: "El Mansouri",
    fullName: "Aya El Mansouri",
    email: "aya.elmansouri@etudiant.academie-lumiere.ma",
    phone: "+212 6 12 34 56 78",
    class: "2ème A",
    gender: "F",
    birthDate: "2008-04-15",
    enrollmentDate: "2024-09-01",
    status: "Actif",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    grades: { math: 17.5, physics: 16.0, french: 18.0, average: 17.2 },
    attendanceRate: 98,
  },
  {
    id: 2,
    studentNumber: "ETU-2026-002",
    firstName: "Yassine",
    lastName: "Benali",
    fullName: "Yassine Benali",
    email: "yassine.benali@etudiant.academie-lumiere.ma",
    phone: "+212 6 23 45 67 89",
    class: "1ère B",
    gender: "M",
    birthDate: "2009-02-10",
    enrollmentDate: "2025-09-01",
    status: "Actif",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    grades: { math: 15.0, physics: 14.5, french: 16.0, average: 15.2 },
    attendanceRate: 94,
  },
  {
    id: 3,
    studentNumber: "ETU-2026-003",
    firstName: "Salma",
    lastName: "El Karimi",
    fullName: "Salma El Karimi",
    email: "salma.elkarimi@etudiant.academie-lumiere.ma",
    phone: "+212 6 34 56 78 90",
    class: "3ème A",
    gender: "F",
    birthDate: "2007-11-22",
    enrollmentDate: "2023-09-01",
    status: "Actif",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    grades: { math: 18.0, physics: 17.0, french: 19.0, average: 18.3 },
    attendanceRate: 99,
  },
  {
    id: 4,
    studentNumber: "ETU-2026-004",
    firstName: "Inès",
    lastName: "Belkacem",
    fullName: "Inès Belkacem",
    email: "ines.belkacem@etudiant.academie-lumiere.ma",
    phone: "+212 6 45 67 89 01",
    class: "1ère A",
    gender: "F",
    birthDate: "2009-07-04",
    enrollmentDate: "2025-09-01",
    status: "Actif",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    grades: { math: 16.0, physics: 17.0, french: 15.0, average: 16.5 },
    attendanceRate: 92,
  },
  {
    id: 5,
    studentNumber: "ETU-2026-005",
    firstName: "Mehdi",
    lastName: "Alaoui",
    fullName: "Mehdi Alaoui",
    email: "mehdi.alaoui@etudiant.academie-lumiere.ma",
    phone: "+212 6 56 78 90 12",
    class: "1ère A",
    gender: "M",
    birthDate: "2009-01-18",
    enrollmentDate: "2025-09-01",
    status: "Actif",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    grades: { math: 14.0, physics: 15.5, french: 14.0, average: 14.5 },
    attendanceRate: 96,
  },
  {
    id: 6,
    studentNumber: "ETU-2026-006",
    firstName: "Kenza",
    lastName: "Berrada",
    fullName: "Kenza Berrada",
    email: "kenza.berrada@etudiant.academie-lumiere.ma",
    phone: "+212 6 67 89 01 23",
    class: "2ème B",
    gender: "F",
    birthDate: "2008-09-30",
    enrollmentDate: "2024-09-01",
    status: "Actif",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    grades: { math: 16.5, physics: 16.0, french: 17.5, average: 16.7 },
    attendanceRate: 97,
  }
];

export const INITIAL_TEACHERS = [
  {
    id: 1,
    fullName: "Dr. Sarah Khalid",
    email: "sarah.khalid@academie-lumiere.ma",
    specialty: "Mathématiques",
    phone: "+212 6 11 22 33 44",
    status: "Actif",
    classes: ["1ère A", "2ème A"],
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    experience: "12 ans"
  },
  {
    id: 2,
    fullName: "Mr. Karim El Amrani",
    email: "karim.elamrani@academie-lumiere.ma",
    specialty: "Physique",
    phone: "+212 6 22 33 44 55",
    status: "Actif",
    classes: ["1ère B", "2ème B"],
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    experience: "8 ans"
  },
  {
    id: 3,
    fullName: "Mme. Leila Haddad",
    email: "leila.haddad@academie-lumiere.ma",
    specialty: "Français",
    phone: "+212 6 33 44 55 66",
    status: "Actif",
    classes: ["1ère A", "3ème A"],
    avatar: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=80",
    experience: "15 ans"
  },
  {
    id: 4,
    fullName: "Mr. Omar Benjelloun",
    email: "omar.benjelloun@academie-lumiere.ma",
    specialty: "SVT",
    phone: "+212 6 44 55 66 77",
    status: "Actif",
    classes: ["2ème A", "3ème A"],
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    experience: "10 ans"
  },
  {
    id: 5,
    fullName: "Mme. Nadia Chraibi",
    email: "nadia.chraibi@academie-lumiere.ma",
    specialty: "Anglais",
    phone: "+212 6 55 66 77 88",
    status: "Actif",
    classes: ["1ère A", "1ère B", "2ème A"],
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
    experience: "6 ans"
  }
];

export const INITIAL_CLASSES = [
  {
    id: 1,
    name: "1ère A",
    level: "1ère Année",
    effectif: 28,
    capacity: 30,
    mainTeacher: "Dr. Sarah Khalid",
    room: "Salle 204"
  },
  {
    id: 2,
    name: "1ère B",
    level: "1ère Année",
    effectif: 27,
    capacity: 30,
    mainTeacher: "Mr. Karim El Amrani",
    room: "Salle 205"
  },
  {
    id: 3,
    name: "2ème A",
    level: "2ème Année",
    effectif: 25,
    capacity: 30,
    mainTeacher: "Mme. Leila Haddad",
    room: "Salle 101"
  },
  {
    id: 4,
    name: "2ème B",
    level: "2ème Année",
    effectif: 26,
    capacity: 30,
    mainTeacher: "Mr. Omar Benjelloun",
    room: "Salle 102"
  },
  {
    id: 5,
    name: "3ème A",
    level: "3ème Année",
    effectif: 24,
    capacity: 28,
    mainTeacher: "Mme. Nadia Chraibi",
    room: "Labo Sciences"
  }
];

export const TIMETABLE_SCHEDULE = [
  {
    time: "08:00 - 09:00",
    lundi: { subject: "Mathématiques", color: "bg-sky-50 text-sky-700 border-sky-200" },
    mardi: { subject: "Français", color: "bg-rose-50 text-rose-700 border-rose-200" },
    mercredi: { subject: "Physique", color: "bg-blue-50 text-blue-700 border-blue-200" },
    jeudi: { subject: "Mathématiques", color: "bg-sky-50 text-sky-700 border-sky-200" },
    vendredi: { subject: "Anglais", color: "bg-amber-50 text-amber-700 border-amber-200" }
  },
  {
    time: "09:00 - 10:00",
    lundi: { subject: "Physique", color: "bg-blue-50 text-blue-700 border-blue-200" },
    mardi: { subject: "Anglais", color: "bg-amber-50 text-amber-700 border-amber-200" },
    mercredi: { subject: "Mathématiques", color: "bg-sky-50 text-sky-700 border-sky-200" },
    jeudi: { subject: "Français", color: "bg-rose-50 text-rose-700 border-rose-200" },
    vendredi: { subject: "SVT", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
  },
  {
    time: "10:15 - 11:15",
    lundi: { subject: "Français", color: "bg-rose-50 text-rose-700 border-rose-200" },
    mardi: { subject: "SVT", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    mercredi: { subject: "Anglais", color: "bg-amber-50 text-amber-700 border-amber-200" },
    jeudi: { subject: "Physique", color: "bg-blue-50 text-blue-700 border-blue-200" },
    vendredi: { subject: "Mathématiques", color: "bg-sky-50 text-sky-700 border-sky-200" }
  },
  {
    time: "11:15 - 12:15",
    lundi: { subject: "Informatique", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    mardi: { subject: "Mathématiques", color: "bg-sky-50 text-sky-700 border-sky-200" },
    mercredi: { subject: "Français", color: "bg-rose-50 text-rose-700 border-rose-200" },
    jeudi: { subject: "SVT", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    vendredi: { subject: "Anglais", color: "bg-amber-50 text-amber-700 border-amber-200" }
  },
  {
    time: "14:00 - 15:00",
    lundi: { subject: "Atelier", color: "bg-slate-100 text-slate-700 border-slate-300" },
    mardi: { subject: "Sport", color: "bg-orange-50 text-orange-700 border-orange-200" },
    mercredi: { subject: "Atelier", color: "bg-slate-100 text-slate-700 border-slate-300" },
    jeudi: { subject: "Sport", color: "bg-orange-50 text-orange-700 border-orange-200" },
    vendredi: { subject: "Arts", color: "bg-purple-50 text-purple-700 border-purple-200" }
  }
];

export const INITIAL_ABSENCES = [
  {
    id: 1,
    studentName: "Aya El Mansouri",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    class: "1ère A",
    date: "27/10/2026",
    reason: "Maladie",
    status: "Justifiée"
  },
  {
    id: 2,
    studentName: "Yassine Benali",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    class: "1ère B",
    date: "26/10/2026",
    reason: "Rendez-vous",
    status: "En attente"
  },
  {
    id: 3,
    studentName: "Salma El Karimi",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    class: "2ème A",
    date: "25/10/2026",
    reason: "Maladie",
    status: "Justifiée"
  },
  {
    id: 4,
    studentName: "Mehdi Alaoui",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    class: "1ère A",
    date: "24/10/2026",
    reason: "Voyage familial",
    status: "Justifiée"
  }
];

export const FINANCIAL_DATA = {
  kpis: {
    totalFees: 85000,
    paid: 73500,
    remaining: 11500,
    paymentRate: 86
  },
  recentPayments: [
    {
      id: 1,
      studentName: "Aya El Mansouri",
      amount: 1200,
      currency: "MAD",
      date: "27/10/2026",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      method: "Virement bancaire",
      invoiceNumber: "FAC-2026-089"
    },
    {
      id: 2,
      studentName: "Yassine Benali",
      amount: 1200,
      currency: "MAD",
      date: "26/10/2026",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      method: "Carte Bancaire",
      invoiceNumber: "FAC-2026-088"
    },
    {
      id: 3,
      studentName: "Salma El Karimi",
      amount: 1200,
      currency: "MAD",
      date: "25/10/2026",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      method: "Espèces",
      invoiceNumber: "FAC-2026-087"
    },
    {
      id: 4,
      studentName: "Inès Belkacem",
      amount: 1500,
      currency: "MAD",
      date: "24/10/2026",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      method: "Virement bancaire",
      invoiceNumber: "FAC-2026-086"
    }
  ],
  monthlyChart: [
    { month: "Sep", amount: 25 },
    { month: "Oct", amount: 38 },
    { month: "Nov", amount: 48 },
    { month: "Déc", amount: 62 },
    { month: "Jan", amount: 60 },
    { month: "Fév", amount: 73.5 }
  ]
};

export const INITIAL_MESSAGES = [
  {
    id: 1,
    subject: "Réunion pédagogique",
    sender: "Direction",
    senderRole: "Administration",
    date: "27/10/2026",
    status: "Non lu",
    preview: "Ordre du jour pour la réunion de fin de premier trimestre prévue en salle des actes.",
    content: "Chers collègues, nous vous convions à la réunion pédagogique trimestrielle ce jeudi à 14h00. Veuillez préparer vos bilans par classe.",
    folder: "inbox"
  },
  {
    id: 2,
    subject: "Résultats du trimestre",
    sender: "Scolarité",
    senderRole: "Service Scolarité",
    date: "25/10/2026",
    status: "Lu",
    preview: "Les relevés provisoires de notes sont consultables sur l'espace d'évaluation.",
    content: "Les saisies de notes pour le trimestre 1 sont désormais clôturées. Les conseils de classe débuteront dès le 12 novembre.",
    folder: "inbox"
  },
  {
    id: 3,
    subject: "Informations importantes",
    sender: "Direction",
    senderRole: "Dr. Martin",
    date: "23/10/2026",
    status: "Lu",
    preview: "Rappel concernant le protocole sanitaire et les nouvelles installations du campus.",
    content: "L'inauguration de la nouvelle aile scientifique aura lieu lundi prochain en présence des représentants académiques.",
    folder: "inbox"
  }
];

export const INITIAL_DOCUMENTS = [
  {
    id: 1,
    name: "Carte nationale",
    type: "Identité",
    status: "Approuvé",
    expirationDate: "-",
    size: "1.2 MB",
    uploadedAt: "15/09/2026"
  },
  {
    id: 2,
    name: "Certificat médical",
    type: "Santé",
    status: "En attente",
    expirationDate: "12/12/2026",
    size: "840 KB",
    uploadedAt: "26/10/2026"
  },
  {
    id: 3,
    name: "Justificatif de domicile",
    type: "Personnel",
    status: "Approuvé",
    expirationDate: "-",
    size: "2.1 MB",
    uploadedAt: "10/09/2026"
  },
  {
    id: 4,
    name: "Relevé de notes N-1",
    type: "Académique",
    status: "Approuvé",
    expirationDate: "-",
    size: "950 KB",
    uploadedAt: "01/09/2026"
  }
];

export const UPCOMING_EVENTS = [
  {
    id: 1,
    title: "Réunion pédagogique",
    time: "Aujourd'hui • 14h00",
    date: "31 Oct. 2026",
    location: "Salle des professeurs",
    type: "Réunion"
  },
  {
    id: 2,
    title: "Paiement des frais de scolarité",
    time: "Demain • Date limite",
    date: "01 Nov. 2026",
    location: "Service Comptabilité",
    type: "Finance"
  },
  {
    id: 3,
    title: "Conseil de classe",
    time: "12 Nov. 2026 • 15h30",
    date: "12 Nov. 2026",
    location: "Amphithéâtre A",
    type: "Académique"
  }
];

export const PERFORMANCE_DATA = [
  { month: "Sep", rate: 68 },
  { month: "Oct", rate: 82 },
  { month: "Nov", rate: 87 },
  { month: "Déc", rate: 92 },
  { month: "Jan", rate: 96 }
];

export const ENROLLMENT_DATA = [
  { month: "Sep", count: 22 },
  { month: "Oct", count: 18 },
  { month: "Nov", count: 28 },
  { month: "Déc", count: 24 },
  { month: "Jan", count: 27 },
  { month: "Fév", count: 34 },
  { month: "Mar", count: 31 }
];

export const SCHOOL_SETTINGS = {
  name: "Académie Lumière",
  address: "123 Avenue des Études, Casablanca",
  email: "contact@academie-lumiere.ma",
  phone: "+212 5 22 33 44 55",
  stats: {
    students: 1248,
    teachers: 124,
    admins: 12
  },
  preferences: {
    language: "Français",
    timezone: "(GMT+1) Casablanca",
    theme: "Clair",
    itemsPerPage: 25
  },
  backup: {
    lastBackup: "25/10/2026 à 02:30",
    status: "Réussie"
  }
};
