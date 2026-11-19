import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Theme state: 'dark' (Radiology Darkroom) or 'light' (Clinical Clean)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ruang_rontgen_theme') || 'dark';
  });

  // Current logged in user
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ruang_rontgen_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Active view tab: 'workspace' | 'history' | 'users'
  const [activeTab, setActiveTab] = useState('workspace');

  // Users from backend API
  const [users, setUsers] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  // History from backend API
  const [history, setHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Active analysis results (Single model: CNN Model)
  const [currentImage, setCurrentImage] = useState(null);
  const [currentImagePreview, setCurrentImagePreview] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Load users from API
  const fetchUsers = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Gagal mengambil daftar pengguna:', err);
    } finally {
      setIsUsersLoading(false);
    }
  }, []);

  // Load history from API
  const fetchHistory = useCallback(async (filters = {}) => {
    setIsHistoryLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.label && filters.label !== 'all') params.append('label', filters.label);
      if (filters.user_id) params.append('user_id', filters.user_id);

      const url = `/api/history${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Gagal mengambil data historis:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  // Persist current logged in user
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ruang_rontgen_current_user', JSON.stringify(currentUser));
      fetchUsers();
      fetchHistory();
    } else {
      localStorage.removeItem('ruang_rontgen_current_user');
      fetchUsers(); // to know if database is empty or not
    }
  }, [currentUser, fetchUsers, fetchHistory]);

  // Persist theme
  useEffect(() => {
    localStorage.setItem('ruang_rontgen_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const logout = () => {
    setCurrentUser(null);
    setAnalysisResult(null);
    setCurrentImage(null);
    setCurrentImagePreview(null);
    setActiveTab('workspace');
    localStorage.removeItem('ruang_rontgen_current_user');
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentUser,
        setCurrentUser,
        logout,
        activeTab,
        setActiveTab,
        users,
        isUsersLoading,
        fetchUsers,
        history,
        isHistoryLoading,
        fetchHistory,
        currentImage,
        setCurrentImage,
        currentImagePreview,
        setCurrentImagePreview,
        analysisResult,
        setAnalysisResult,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
