import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Stethoscope,
  GraduationCap,
  Activity,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Search,
  Filter,
  X,
  UserCheck,
  Check,
  Mail,
  User,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function UserAdministration() {
  const { users, isUsersLoading, fetchUsers, currentUser, logout } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form state for add/edit (roles: 'dokter', 'radiolog', 'mahasiswa')
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'radiolog',
    status: 'active',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !searchTerm ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole =
        selectedRoleFilter === 'all' || u.role.toLowerCase() === selectedRoleFilter.toLowerCase();

      return matchSearch && matchRole;
    });
  }, [users, searchTerm, selectedRoleFilter]);

  // KPI stats
  const stats = useMemo(() => {
    const total = users.length;
    const dokterCount = users.filter((u) => u.role === 'dokter').length;
    const radiologCount = users.filter((u) => u.role === 'radiolog').length;
    const studentCount = users.filter((u) => u.role === 'mahasiswa').length;
    const activeCount = users.filter((u) => u.status === 'active').length;

    return { total, dokterCount, radiologCount, studentCount, activeCount };
  }, [users]);

  // Open add modal
  const handleOpenAdd = () => {
    setFormData({
      username: '',
      password: '123',
      name: '',
      email: '',
      role: 'radiolog',
      status: 'active',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role === 'admin' ? 'dokter' : user.role,
      status: user.status,
    });
    setFormError('');
  };

  // Submit Add User
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.username.trim() || !formData.name.trim() || !formData.email.trim()) {
      setFormError('Semua kolom wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan pengguna.');

      fetchUsers();
      setIsAddModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit User
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Nama lengkap dan email tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui pengguna.');

      fetchUsers();
      setEditingUser(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle user status active/inactive
  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          role: user.role === 'admin' ? 'dokter' : user.role,
          status: newStatus,
        }),
      });
      fetchUsers();
    } catch (err) {
      alert('Gagal mengubah status pengguna.');
    }
  };

  // Delete user
  const handleDeleteUser = async (user) => {
    if (user.id === currentUser?.id) {
      alert('Tidak dapat menghapus akun Anda sendiri yang sedang digunakan saat ini.');
      return;
    }

    if (!window.confirm(`Hapus akun pengguna "${user.name}" (${user.username})?`)) return;

    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      alert('Gagal menghapus pengguna.');
    }
  };

  // Role badge helper
  const renderRoleBadge = (role) => {
    switch (role) {
      case 'dokter':
        return (
          <span className="role-tag dokter">
            <Stethoscope size={12} /> Dokter Spesialis
          </span>
        );
      case 'radiolog':
        return (
          <span className="role-tag radiolog">
            <Activity size={12} /> Radiolog
          </span>
        );
      default:
        return (
          <span className="role-tag mahasiswa">
            <GraduationCap size={12} /> Mahasiswa / Pengguna
          </span>
        );
    }
  };

  return (
    <div className="users-page-container">
      {/* Header Banner */}
      <div className="section-header-banner">
        <div>
          <h2>User Administration</h2>
          <p>
            Manajemen profil pengguna, peran sistem, dan sinkronisasi otorisasi akun yang login.
          </p>
        </div>
        <div className="banner-action-buttons">
          <button type="button" className="btn-primary" onClick={handleOpenAdd}>
            <UserPlus size={16} />
            <span>Tambah Pengguna Baru</span>
          </button>
        </div>
      </div>

      {/* Logged-In User Profile Banner */}
      <div className="current-user-account-card">
        <div className="account-card-left">
          <img
            src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username}`}
            alt="Avatar"
            className="account-card-avatar"
          />
          <div className="account-card-text">
            <div className="account-name-row">
              <h3>{currentUser?.name}</h3>
              <span className="current-user-badge">
                <CheckCircle2 size={13} /> Akun Login Aktif
              </span>
            </div>
            <p className="account-meta">
              Username: <code>@{currentUser?.username}</code> • Email: {currentUser?.email} • Peran:{' '}
              <strong>{currentUser?.role.toUpperCase()}</strong>
            </p>
          </div>
        </div>

        <button type="button" className="btn-logout-account" onClick={logout}>
          <LogOut size={15} />
          <span>Keluar Sesi</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">TOTAL PENGGUNA TERDAFTAR</span>
          <div className="kpi-value-row">
            <span className="kpi-number">{stats.total}</span>
            <span className="kpi-icon-pill blue">
              <Users size={18} />
            </span>
          </div>
          <small className="kpi-hint">Pengguna terdaftar di sistem</small>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">DOKTER SPESIALIS</span>
          <div className="kpi-value-row">
            <span className="kpi-number text-accent">{stats.dokterCount}</span>
            <span className="kpi-icon-pill cyan">
              <Stethoscope size={18} />
            </span>
          </div>
          <small className="kpi-hint">Spesialis Jantung / Toraks</small>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">TENAGA RADIOLOG</span>
          <div className="kpi-value-row">
            <span className="kpi-number text-success">{stats.radiologCount}</span>
            <span className="kpi-icon-pill green">
              <Activity size={18} />
            </span>
          </div>
          <small className="kpi-hint">Tenaga Radiografer & Analis</small>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">MAHASISWA / PRAKTIKAN</span>
          <div className="kpi-value-row">
            <span className="kpi-number text-purple">{stats.studentCount}</span>
            <span className="kpi-icon-pill purple">
              <GraduationCap size={18} />
            </span>
          </div>
          <small className="kpi-hint">Peserta kelas frontend & pengguna</small>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-toolbar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Cari nama, username, atau email pengguna..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-dropdowns">
          <div className="select-wrap">
            <Filter size={14} className="filter-icon" />
            <select
              className="filter-select"
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
            >
              <option value="all">Semua Peran</option>
              <option value="dokter">Dokter</option>
              <option value="radiolog">Radiolog</option>
              <option value="mahasiswa">Mahasiswa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Users Table */}
      <div className="table-responsive-card">
        {filteredUsers.length === 0 ? (
          <div className="empty-table-state">
            <Users size={36} className="empty-icon" />
            <h4>Tidak Ada Pengguna Ditemukan</h4>
            <p>Belum ada pengguna lain yang terdaftar dalam sistem.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>Username</th>
                <th>Peran</th>
                <th>Status Akun</th>
                <th>Total Scan</th>
                <th>Tanggal Registrasi</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isCurrent = currentUser?.id === u.id;
                const isActive = u.status === 'active';

                return (
                  <tr key={u.id} className={isCurrent ? 'current-user-row' : ''}>
                    <td>
                      <div className="user-profile-cell">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                          alt="Avatar"
                          className="user-avatar-img"
                        />
                        <div>
                          <div className="name-with-current-pill">
                            <strong>{u.name}</strong>
                            {isCurrent && <span className="you-pill">Anda</span>}
                          </div>
                          <span className="user-email-text">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code className="username-code">@{u.username}</code>
                    </td>
                    <td>{renderRoleBadge(u.role)}</td>
                    <td>
                      <span className={`status-pill ${isActive ? 'active' : 'inactive'}`}>
                        {isActive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        <span>{isActive ? 'Aktif' : 'Nonaktif'}</span>
                      </span>
                    </td>
                    <td>
                      <span className="scan-count-badge">{u.total_scans || 0} scan</span>
                    </td>
                    <td>
                      <span className="text-muted text-sm">{u.created_at}</span>
                    </td>
                    <td className="text-right">
                      <div className="row-action-btns">
                        <button
                          type="button"
                          className={`table-icon-btn toggle ${isActive ? 'deactivate' : 'activate'}`}
                          onClick={() => handleToggleStatus(u)}
                          title={isActive ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                        >
                          {isActive ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
                        </button>
                        <button
                          type="button"
                          className="table-icon-btn edit"
                          onClick={() => handleOpenEdit(u)}
                          title="Edit Data Pengguna"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          className="table-icon-btn delete"
                          onClick={() => handleDeleteUser(u)}
                          title="Hapus Pengguna"
                          disabled={isCurrent}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-card form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <UserPlus size={20} className="text-accent" />
                <div>
                  <h3>Tambah Pengguna Baru</h3>
                  <p>Mendaftarkan akun baru ke dalam sistem</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-body form-body">
                {formError && <div className="form-alert error">{formError}</div>}

                <div className="form-group">
                  <label>Username (ID Unik):</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="misal: dr_fauzi"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Kata Sandi (Password Awal):</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Minimal 3 karakter"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Nama Lengkap & Gelar:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="misal: dr. Ahmad Fauzi, Sp.Rad"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Pengguna:</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="misal: ahmad.fauzi@hospital.id"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Peran:</label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="radiolog">Radiolog</option>
                      <option value="dokter">Dokter Spesialis</option>
                      <option value="mahasiswa">Mahasiswa / Pengguna</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status Akun:</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Nonaktif</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-backdrop" onClick={() => setEditingUser(null)}>
          <div className="modal-card form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Edit2 size={20} className="text-accent" />
                <div>
                  <h3>Edit Data Pengguna</h3>
                  <p>Memperbarui informasi untuk @{editingUser.username}</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditingUser(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body form-body">
                {formError && <div className="form-alert error">{formError}</div>}

                <div className="form-group">
                  <label>Username (Permanen):</label>
                  <input
                    type="text"
                    className="form-input disabled"
                    value={formData.username}
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label>Nama Lengkap & Gelar:</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Pengguna:</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label>Peran:</label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="radiolog">Radiolog</option>
                      <option value="dokter">Dokter Spesialis</option>
                      <option value="mahasiswa">Mahasiswa / Pengguna</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status Akun:</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Nonaktif</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingUser(null)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
