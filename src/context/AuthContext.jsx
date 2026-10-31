import React, { createContext, useContext, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const USERS_CATALOG = {
  admin: {
    id: 100,
    firstName: 'Dr.',
    lastName: 'Martin',
    fullName: 'Dr. Martin',
    email: 'direction@academie-lumiere.ma',
    role: 'ADMIN',
    roleTitle: 'Directeur Général',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  student: {
    id: 4,
    firstName: 'Inès',
    lastName: 'Belkacem',
    fullName: 'Inès Belkacem',
    email: 'ines.belkacem@etudiant.academie-lumiere.ma',
    role: 'STUDENT',
    roleTitle: 'Élève - 1ère A',
    class: '1ère A',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    average: 16.5,
    attendance: '92%',
    pendingHomework: 3,
  },
  teacher: {
    id: 1,
    firstName: 'Dr. Sarah',
    lastName: 'Khalid',
    fullName: 'Dr. Sarah Khalid',
    email: 'sarah.khalid@academie-lumiere.ma',
    role: 'TEACHER',
    roleTitle: 'Professeur de Mathématiques',
    specialty: 'Mathématiques',
    avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=150&auto=format&fit=crop&q=80',
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(USERS_CATALOG.admin);
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Nouvelle candidature en ligne', time: 'Il y a 10 min', unread: true },
    { id: 2, title: 'Rapport mensuel généré', time: 'Il y a 1 heure', unread: true },
    { id: 3, title: 'Paiement reçu : 1 200 MAD', time: 'Il y a 2 heures', unread: true },
  ]);

  const selectUser = (type) => {
    if (type === 'student') {
      setCurrentUser(USERS_CATALOG.student);
      setActiveView('student-portal');
    } else if (type === 'teacher') {
      setCurrentUser(USERS_CATALOG.teacher);
      setActiveView('grades');
    } else if (type === 'guest') {
      setCurrentUser(null);
      setActiveView('landing');
    } else {
      setCurrentUser(USERS_CATALOG.admin);
      setActiveView('dashboard');
    }
  };

  const loginAs = (email) => {
    if (email.toLowerCase().includes('ines')) {
      selectUser('student');
    } else if (email.toLowerCase().includes('sarah')) {
      selectUser('teacher');
    } else {
      selectUser('admin');
    }
  };

  const logout = () => {
    api.logout();
    setCurrentUser(null);
    setActiveView('login');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeView,
        setActiveView,
        searchQuery,
        setSearchQuery,
        notifications,
        setNotifications,
        selectUser,
        loginAs,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
