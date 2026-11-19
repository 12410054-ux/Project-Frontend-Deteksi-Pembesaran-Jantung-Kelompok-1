import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Calendar,
  User,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  X,
  HeartPulse,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function UserHistory() {
  const { history, isHistoryLoading, fetchHistory, users, setCurrentImagePreview, setActiveTab } =
    useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [activeDetail, setActiveDetail] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered history list
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchSearch =
        !searchTerm ||
        item.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.clinical_note && item.clinical_note.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchLabel =
        selectedLabel === 'all' || item.label.toLowerCase() === selectedLabel.toLowerCase();

      const matchUser =
        !selectedUserId || (item.user_id && item.user_id.toString() === selectedUserId.toString());

      return matchSearch && matchLabel && matchUser;
    });
  }, [history, searchTerm, selectedLabel, selectedUserId]);

  // Statistics
  const stats = useMemo(() => {
    const total = history.length;
    const cardioCount = history.filter((h) => h.label === 'Kardiomegali').length;
    const normalCount = history.filter((h) => h.label === 'Normal').length;
    const avgConfidence =
      total > 0
        ? (history.reduce((acc, h) => acc + (h.confidence || 0), 0) / total).toFixed(1)
        : 0;

    return { total, cardioCount, normalCount, avgConfidence };
  }, [history]);

  const handleDeleteItem = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Hapus rekaman historis pemeriksaan ini?')) return;

    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchHistory();
        if (activeDetail && activeDetail.id === id) {
          setActiveDetail(null);
        }
      }
    } catch (err) {
      alert('Gagal menghapus rekaman.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Peringatan: Kosongkan SELURUH data historis pemeriksaan?')) return;
    try {
      const res = await fetch('/api/history', { method: 'DELETE' });
      if (res.ok) {
        fetchHistory();
        setActiveDetail(null);
      }
    } catch (err) {
      alert('Gagal mengosongkan riwayat.');
    }
  };

  const handleExportCSV = () => {
    if (filteredHistory.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    const headers = [
      'No. Pemeriksaan',
      'ID Pasien',
      'Nama Pasien',
      'Usia',
      'Gender',
      'Pemeriksa (User)',
      'Diagnosis',
      'Keyakinan (%)',
      'Prob. Kardiomegali (%)',
      'Prob. Normal (%)',
      'Model AI',
      'Waktu Pemeriksaan',
    ];

    const rows = filteredHistory.map((h) => [
      h.id,
      h.patient_id,
      `"${h.patient_name.replace(/"/g, '""')}"`,
      h.patient_age,
      h.patient_gender,
      `"${(h.user_name || 'Umum').replace(/"/g, '""')}"`,
      h.label,
      h.confidence,
      h.cardiomegaly_probability,
      h.normal_probability,
      `"${h.model_name}"`,
      h.created_at,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data_historis_rontgen_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="history-page-container">
      {/* Header Banner */}
      <div className="section-header-banner">
        <div>
          <h2>Data Historis Pengguna</h2>
          <p>
            Pusat arsip dan rekam data digital hasil pemeriksaan citra rontgen toraks oleh pengguna
            dan tenaga medis.
          </p>
        </div>
        <div className="banner-action-buttons">
          <button type="button" className="btn-secondary" onClick={() => fetchHistory()}>
            <RefreshCw size={15} className={isHistoryLoading ? 'animate-spin' : ''} />
            <span>Segarkan</span>
          </button>
          <button type="button" className="btn-primary" onClick={handleExportCSV}>
            <FileSpreadsheet size={16} />
            <span>Ekspor ke CSV</span>
          </button>
          {history.length > 0 && (
            <button type="button" className="btn-danger-outline" onClick={handleClearAll}>
              <Trash2 size={15} />
              <span>Kosongkan</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">TOTAL PEMERIKSAAN</span>
          <div className="kpi-value-row">
            <span className="kpi-number">{stats.total}</span>
            <span className="kpi-icon-pill blue">
              <History size={18} />
            </span>
          </div>
          <small className="kpi-hint">Tersimpan dalam basis data sistem</small>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">KASUS KARDIOMEGALI</span>
          <div className="kpi-value-row">
            <span className="kpi-number text-warning">{stats.cardioCount}</span>
            <span className="kpi-icon-pill red">
              <AlertTriangle size={18} />
            </span>
          </div>
          <small className="kpi-hint">
            {stats.total > 0
              ? `${((stats.cardioCount / stats.total) * 100).toFixed(0)}% dari total pemeriksaan`
              : 'Belum ada data'}
          </small>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">KASUS NORMAL</span>
          <div className="kpi-value-row">
            <span className="kpi-number text-success">{stats.normalCount}</span>
            <span className="kpi-icon-pill green">
              <CheckCircle2 size={18} />
            </span>
          </div>
          <small className="kpi-hint">
            {stats.total > 0
              ? `${((stats.normalCount / stats.total) * 100).toFixed(0)}% dari total pemeriksaan`
              : 'Belum ada data'}
          </small>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">RATA-RATA KEYAKINAN</span>
          <div className="kpi-value-row">
            <span className="kpi-number">{stats.avgConfidence}%</span>
            <span className="kpi-icon-pill cyan">
              <ShieldCheck size={18} />
            </span>
          </div>
          <small className="kpi-hint">Skor keyakinan inferensi model</small>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-toolbar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Cari ID Pasien (PX-...), Nama Pasien, atau Catatan..."
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
              value={selectedLabel}
              onChange={(e) => setSelectedLabel(e.target.value)}
            >
              <option value="all">Semua Diagnosis</option>
              <option value="Normal">Normal</option>
              <option value="Kardiomegali">Kardiomegali</option>
            </select>
          </div>

          <div className="select-wrap">
            <User size={14} className="filter-icon" />
            <select
              className="filter-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">Semua Pemeriksa</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="table-responsive-card">
        {filteredHistory.length === 0 ? (
          <div className="empty-table-state">
            <History size={36} className="empty-icon" />
            <h4>Tidak Ada Data Historis Ditemukan</h4>
            <p>
              {searchTerm || selectedLabel !== 'all' || selectedUserId
                ? 'Tidak ada data yang cocok dengan kriteria filter saat ini.'
                : 'Belum ada rekaman riwayat pemeriksaan. Lakukan analisis citra di menu Analisis Rontgen.'}
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Pasien / No. RM</th>
                <th>Waktu Scan</th>
                <th>Pemeriksa</th>
                <th>Diagnosis AI</th>
                <th>Keyakinan</th>
                <th>Model</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((row) => {
                const isCardio = row.label === 'Kardiomegali';
                return (
                  <tr
                    key={row.id}
                    onClick={() => setActiveDetail(row)}
                    className="clickable-row"
                  >
                    <td>
                      <div className="patient-cell">
                        <img
                          src={row.image_url}
                          alt="Thumbnail"
                          className="table-thumb"
                        />
                        <div>
                          <strong>{row.patient_name}</strong>
                          <span className="patient-sub-id">
                            {row.patient_id} • {row.patient_age} th ({row.patient_gender})
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <Calendar size={13} />
                        <span>{row.created_at}</span>
                      </div>
                    </td>
                    <td>
                      <div className="user-cell">
                        <span className="user-name-text">
                          {row.user_name || 'Pemeriksa Tamu'}
                        </span>
                        {row.user_role && (
                          <span className={`role-badge-sm ${row.user_role}`}>
                            {row.user_role}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`diagnosis-pill ${isCardio ? 'cardio' : 'normal'}`}>
                        {isCardio ? (
                          <AlertTriangle size={13} />
                        ) : (
                          <CheckCircle2 size={13} />
                        )}
                        <span>{row.label}</span>
                      </span>
                    </td>
                    <td>
                      <div className="conf-progress-cell">
                        <span className="conf-pct-num">{row.confidence}%</span>
                        <div className="conf-track-mini">
                          <div
                            className={`conf-bar-mini ${isCardio ? 'cardio' : 'normal'}`}
                            style={{ width: `${row.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="model-chip">{row.model_name}</span>
                    </td>
                    <td className="text-right">
                      <div
                        className="row-action-btns"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="table-icon-btn view"
                          onClick={() => setActiveDetail(row)}
                          title="Lihat Detail Riwayat"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          className="table-icon-btn delete"
                          onClick={(e) => handleDeleteItem(row.id, e)}
                          title="Hapus Rekaman Ini"
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

      {/* Detail Modal */}
      {activeDetail && (
        <div className="modal-backdrop" onClick={() => setActiveDetail(null)}>
          <div className="modal-card detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <HeartPulse size={20} className="text-accent" />
                <div>
                  <h3>Detail Rekam Historis Pemeriksaan</h3>
                  <p>No. RM: {activeDetail.patient_id} • Waktu: {activeDetail.created_at}</p>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveDetail(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body detail-modal-body">
              <div className="detail-preview-col">
                <div className="detail-img-box">
                  <img
                    src={activeDetail.image_url}
                    alt="Radiograf Rontgen"
                    className="detail-xray-img"
                  />
                  <span className="img-badge">Chest X-Ray AP/PA</span>
                </div>
              </div>

              <div className="detail-info-col">
                <div className="detail-patient-box">
                  <h4>Informasi Pasien</h4>
                  <div className="detail-meta-grid">
                    <div>
                      <span>Nama Pasien:</span>
                      <strong>{activeDetail.patient_name}</strong>
                    </div>
                    <div>
                      <span>No. Rekam Medis:</span>
                      <strong>{activeDetail.patient_id}</strong>
                    </div>
                    <div>
                      <span>Usia / Gender:</span>
                      <strong>
                        {activeDetail.patient_age} Tahun / {activeDetail.patient_gender}
                      </strong>
                    </div>
                    <div>
                      <span>Pemeriksa:</span>
                      <strong>{activeDetail.user_name || 'Umum'}</strong>
                    </div>
                  </div>
                </div>

                <div className="detail-result-box">
                  <div
                    className={`detail-diag-banner ${
                      activeDetail.label === 'Kardiomegali' ? 'cardio' : 'normal'
                    }`}
                  >
                    <div>
                      <span>DIAGNOSIS AI</span>
                      <h2>{activeDetail.label}</h2>
                    </div>
                    <div className="detail-conf-badge">
                      <span>{activeDetail.confidence}%</span>
                      <small>Keyakinan</small>
                    </div>
                  </div>

                  <div className="detail-prob-bars">
                    <div className="prob-item">
                      <span>Probabilitas Kardiomegali</span>
                      <strong>{activeDetail.cardiomegaly_probability}%</strong>
                    </div>
                    <div className="prob-item">
                      <span>Probabilitas Normal</span>
                      <strong>{activeDetail.normal_probability}%</strong>
                    </div>
                  </div>

                  <div className="detail-notes">
                    <strong>Catatan Klinis:</strong>
                    <p>{activeDetail.clinical_note}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-danger-outline"
                onClick={(e) => handleDeleteItem(activeDetail.id, e)}
              >
                <Trash2 size={15} />
                <span>Hapus Rekaman</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setActiveDetail(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
