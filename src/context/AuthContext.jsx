import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { communicationService } from '../services/communicationService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => authService.getStoredUser());
  const [activeView, setActiveView] = useState(() => {
    const user = authService.getStoredUser();
    if (!user) return 'landing';
    if (user.roles?.includes('ROLE_ADMIN')) return 'dashboard';
    if (user.roles?.includes('ROLE_STAFF')) return 'staff-dashboard';
    if (user.roles?.includes('ROLE_LIBRARIAN')) return 'librarian-dashboard';
    if (user.roles?.includes('ROLE_TEACHER')) return 'teacher-dashboard';
    if (user.roles?.includes('ROLE_STUDENT')) return 'student-dashboard';
    if (user.roles?.includes('ROLE_PARENT')) return 'parent-dashboard';
    return 'dashboard';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [language, setLanguage] = useState(() => localStorage.getItem('academie_lang') || 'FR');

  useEffect(() => {
    document.documentElement.lang = language.toLowerCase();
    document.documentElement.dir = language === 'AR' ? 'rtl' : 'ltr';
    localStorage.setItem('academie_lang', language);
  }, [language]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setCurrentUser(null);
      setActiveView('login');
      setNotifications([]);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const refreshNotifications = async () => {
    if (!currentUser?.id) return;
    try {
      const res = await communicationService.getNotifications(currentUser.id, { page: 0, size: 10 });
      const items = res.content || (Array.isArray(res) ? res : []);
      setNotifications(items);
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      refreshNotifications();
    } else {
      setNotifications([]);
    }
  }, [currentUser?.id]);

  const login = async (email, password) => {
    const { user } = await authService.login(email, password);
    setCurrentUser(user);
    if (user.roles?.includes('ROLE_ADMIN')) {
      setActiveView('dashboard');
    } else if (user.roles?.includes('ROLE_STAFF')) {
      setActiveView('staff-dashboard');
    } else if (user.roles?.includes('ROLE_LIBRARIAN')) {
      setActiveView('librarian-dashboard');
    } else if (user.roles?.includes('ROLE_TEACHER')) {
      setActiveView('teacher-dashboard');
    } else if (user.roles?.includes('ROLE_STUDENT')) {
      setActiveView('student-dashboard');
    } else if (user.roles?.includes('ROLE_PARENT')) {
      setActiveView('parent-dashboard');
    } else {
      setActiveView('dashboard');
    }
    return user;
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setActiveView('login');
    setNotifications([]);
  };

  const hasRole = (role) => {
    if (!currentUser?.roles) return false;
    return currentUser.roles.includes(role);
  };

  const hasAnyRole = (roles = []) => {
    if (!currentUser?.roles) return false;
    return roles.some((r) => currentUser.roles.includes(r));
  };

  const hasPermission = (permission) => {
    if (!currentUser?.permissions) return false;
    return currentUser.permissions.includes(permission);
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
        refreshNotifications,
        language,
        setLanguage,
        login,
        logout,
        hasRole,
        hasAnyRole,
        hasPermission,
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
