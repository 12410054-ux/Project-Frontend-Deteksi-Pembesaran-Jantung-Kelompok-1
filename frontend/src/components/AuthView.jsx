import React, { useState } from 'react';
import {
  HeartPulse,
  Lock,
  User,
  Mail,
  Shield,
  Stethoscope,
  Activity,
  GraduationCap,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AuthView() {
  const { users, setCurrentUser, fetchUsers, fetchHistory } = useApp();

  // If there are no users at all, default to register tab
  const [authMode, setAuthMode] = useState(() => (users.length === 0 ? 'register' : 'login'));

  // Form states
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'radiolog',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginData.username.trim() || !loginData.password.trim()) {
      setErrorMsg('Username dan password wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal masuk.');
      }

      setSuccessMsg('Login berhasil! Menyiapkan sistem...');
      setTimeout(() => {
        setCurrentUser(data.user);
        fetchUsers();
        fetchHistory();
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (
      !registerData.username.trim() ||
      !registerData.password.trim() ||
      !registerData.name.trim() ||
      !registerData.email.trim()
    ) {
      setErrorMsg('Seluruh formulir pendaftaran wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Pendaftaran gagal.');
      }

      setSuccessMsg('Akun berhasil dibuat! Mengalihkan ke sistem...');
      setTimeout(() => {
        setCurrentUser(data.user);
        fetchUsers();
        fetchHistory();
      }, 600);
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat pendaftaran.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-box">
        {/* Logo & Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-brand-icon">
            <HeartPulse size={30} />
          </div>
          <h1 className="auth-brand-title">
            ruang<span>rontgen</span>
          </h1>
          <p className="auth-brand-subtitle">
            Sistem Analisis Citra Kardiotoraks & User Administration
          </p>
        </div>

        {/* Notice if system is completely empty */}
        {users.length === 0 && (
          <div className="empty-system-notice">
            <Sparkles size={16} />
            <span>
              Basis data sistem telah dikosongkan. Daftarkan akun pertama Anda untuk memulai sesi.
            </span>
          </div>
        )}

        {/* Tab Toggle (Login vs Register) */}
        <div className="auth-tab-row">
          <button
            type="button"
            className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
          >
            Daftar Akun Baru
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="auth-alert error">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="auth-alert success">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Login */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="auth-input-group">
              <label>Username atau Email:</label>
              <div className="input-with-icon">
                <User size={16} className="field-icon" />
                <input
                  type="text"
                  placeholder="Masukkan username atau email"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label>Kata Sandi (Password):</label>
              <div className="input-with-icon">
                <Lock size={16} className="field-icon" />
                <input
                  type="password"
                  placeholder="Masukkan kata sandi"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-auth-submit" disabled={isLoading}>
              {isLoading ? (
                'Memverifikasi Akun...'
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Form Register */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="auth-input-group">
              <label>Nama Lengkap & Gelar:</label>
              <div className="input-with-icon">
                <User size={16} className="field-icon" />
                <input
                  type="text"
                  placeholder="misal: dr. Ahmad Fauzi, Sp.Rad"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="auth-form-row">
              <div className="auth-input-group">
                <label>Username Unik:</label>
                <div className="input-with-icon">
                  <User size={16} className="field-icon" />
                  <input
                    type="text"
                    placeholder="misal: dr_ahmad"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label>Email Pengguna:</label>
                <div className="input-with-icon">
                  <Mail size={16} className="field-icon" />
                  <input
                    type="email"
                    placeholder="nama@hospital.id"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="auth-form-row">
              <div className="auth-input-group">
                <label>Kata Sandi (Password):</label>
                <div className="input-with-icon">
                  <Lock size={16} className="field-icon" />
                  <input
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label>Peran dalam Sistem:</label>
                <select
                  className="auth-select"
                  value={registerData.role}
                  onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                >
                  <option value="radiolog">Radiolog</option>
                  <option value="dokter">Dokter Spesialis</option>
                  <option value="mahasiswa">Mahasiswa / Pengguna</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-auth-submit" disabled={isLoading}>
              {isLoading ? (
                'Mendaftarkan Akun...'
              ) : (
                <>
                  <span>Daftar & Langsung Masuk</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        <div className="auth-footer-note">
          <p>
            * Sistem terenkripsi & data historis pemeriksaan otomatis tersimpan sesuai akun yang aktif.
          </p>
        </div>
      </div>
    </div>
  );
}
