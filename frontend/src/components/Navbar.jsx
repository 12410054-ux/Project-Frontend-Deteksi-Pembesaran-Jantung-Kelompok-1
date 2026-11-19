import React from 'react';
import {
  Activity,
  History,
  Users,
  Sun,
  Moon,
  HeartPulse,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const {
    theme,
    toggleTheme,
    activeTab,
    setActiveTab,
    history,
    users,
    currentUser,
    logout,
  } = useApp();

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <div className="brand-group" onClick={() => setActiveTab('workspace')}>
          <div className="brand-icon-wrapper">
            <HeartPulse className="brand-pulse-icon" size={22} />
          </div>
          <div className="brand-text">
            <div className="brand-title">
              ruang<span>rontgen</span>
            </div>
            <div className="brand-subtitle">Sistem Analisis Citra Kardiotoraks</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'workspace' ? 'active' : ''}`}
            onClick={() => setActiveTab('workspace')}
          >
            <Activity size={16} />
            <span>Analisis Rontgen</span>
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={16} />
            <span>Data Historis Pengguna</span>
            {history.length > 0 && <span className="tab-count-badge">{history.length}</span>}
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} />
            <span>User Administration</span>
            {users.length > 0 && <span className="tab-count-badge">{users.length}</span>}
          </button>
        </nav>

        {/* Right Tools, Logged-in User Pill & Logout Button */}
        <div className="nav-actions">
          {currentUser && (
            <div
              className="active-profile-pill"
              onClick={() => setActiveTab('users')}
              title="Buka User Administration untuk melihat profil akun Anda"
            >
              <img
                src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`}
                alt="Avatar"
                className="profile-pill-avatar"
              />
              <div className="profile-pill-info">
                <span className="profile-pill-name">{currentUser.name}</span>
                <span className={`profile-pill-role ${currentUser.role}`}>
                  {currentUser.role}
                </span>
              </div>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap Radiologi'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Logout Button */}
          <button
            type="button"
            className="logout-nav-btn"
            onClick={logout}
            title="Keluar dari akun Anda"
          >
            <LogOut size={16} />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
