import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS
} from '../data/mockData';

const BASE_URL = '/api/v1';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('academie_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('academie_token', token);
    } else {
      localStorage.removeItem('academie_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn(`Backend call failed on ${endpoint}:`, err.message);
      throw err;
    }
  }

  async login(email, password) {
    try {
      const res = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.data?.accessToken) {
        this.setToken(res.data.accessToken);
        return res.data;
      }
    } catch {
      const isStudent = email.includes('ines') || email.includes('etudiant');
      const isTeacher = email.includes('sarah') || email.includes('prof');
      const user = isStudent
        ? {
            id: 4,
            firstName: 'Inès',
            lastName: 'Belkacem',
            email: 'ines.belkacem@etudiant.academie-lumiere.ma',
            roles: ['ROLE_STUDENT'],
            roleName: 'Élève',
            class: '1ère A',
            photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
          }
        : isTeacher
        ? {
            id: 1,
            firstName: 'Sarah',
            lastName: 'Khalid',
            email: 'sarah.khalid@academie-lumiere.ma',
            roles: ['ROLE_TEACHER'],
            roleName: 'Enseignant',
            photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          }
        : {
            id: 100,
            firstName: 'Dr.',
            lastName: 'Martin',
            email: 'directeur@academie-lumiere.ma',
            roles: ['ROLE_ADMIN'],
            roleName: 'Directeur',
            photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          };

      const mockToken = 'mock-jwt-token-academie-2026';
      this.setToken(mockToken);
      return {
        accessToken: mockToken,
        user,
      };
    }
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
    } finally {
      this.setToken(null);
    }
  }

  async submitApplication(applicationData) {
    try {
      return await this.request('/public/applications', {
        method: 'POST',
        body: JSON.stringify(applicationData),
      });
    } catch {
      return { success: true, message: 'Candidature enregistrée avec succès (mode démo).' };
    }
  }

  async getStudents() {
    try {
      const res = await this.request('/students');
      return res.data?.content || res.data || INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  }

  async getTeachers() {
    try {
      const res = await this.request('/teachers');
      return res.data?.content || res.data || INITIAL_TEACHERS;
    } catch {
      return INITIAL_TEACHERS;
    }
  }
}

export const api = new ApiService();
