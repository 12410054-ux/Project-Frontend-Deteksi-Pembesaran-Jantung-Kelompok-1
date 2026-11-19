import React from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import AuthView from './components/AuthView';
import DropzoneUploader from './components/DropzoneUploader';
import MedicalImageViewer from './components/MedicalImageViewer';
import DiagnosisCard from './components/DiagnosisCard';
import UserHistory from './components/UserHistory';
import UserAdministration from './components/UserAdministration';
import { Activity, ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';

function MainWorkspace() {
  const { currentImagePreview, analysisResult, setAnalysisResult, currentUser } = useApp();

  const handleReset = () => {
    setAnalysisResult(null);
  };

  return (
    <div className="workspace-grid">
      {/* Left Column: Upload & Parameters */}
      <div className="workspace-left-col">
        <DropzoneUploader />
      </div>

      {/* Right Column: Viewport & Clinical Output */}
      <div className="workspace-right-col">
        {analysisResult ? (
          <div className="analysis-output-stack">
            <MedicalImageViewer
              imageUrl={analysisResult.image_url || currentImagePreview}
              title="Hasil Analisis Radiografi Toraks"
            />
            <DiagnosisCard result={analysisResult} onReset={handleReset} />
          </div>
        ) : currentImagePreview ? (
          <div className="preview-ready-stack">
            <MedicalImageViewer
              imageUrl={currentImagePreview}
              title="Pratinjau Citra Rontgen"
            />
            <div className="ready-to-analyze-notice">
              <Sparkles size={20} className="notice-icon" />
              <div>
                <strong>Citra Siap Dianalisis</strong>
                <p>
                  Pemeriksa aktif:{' '}
                  <strong>
                    {currentUser?.name} ({currentUser?.role})
                  </strong>
                  . Klik tombol <strong>"Analisis Citra Rontgen"</strong> di panel kiri untuk
                  memulai inferensi AI.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-workspace-state">
            <div className="scanner-graphic">
              <div className="radar-circle circle-1"></div>
              <div className="radar-circle circle-2"></div>
              <HeartPulse size={36} className="center-heart" />
            </div>
            <h3>Workstation Radiologi Digital</h3>
            <p>
              Selamat datang, <strong>{currentUser?.name}</strong>. Silakan unggah citra rontgen dada
              di panel kiri untuk memulai deteksi kardiomegali.
            </p>
            <div className="guidelines-pill-row">
              <span className="guide-pill">
                <ShieldCheck size={14} /> Standar DICOM & X-Ray Toraks
              </span>
              <span className="guide-pill">
                <Activity size={14} /> Model AI: CNN Model
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const { currentUser, activeTab } = useApp();

  // If user is not authenticated, show the Login / Register screen
  if (!currentUser) {
    return <AuthView />;
  }

  return (
    <div className="app-layout">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area based on Active Tab */}
      <main className="main-content">
        {activeTab === 'workspace' && <MainWorkspace />}
        {activeTab === 'history' && <UserHistory />}
        {activeTab === 'users' && <UserAdministration />}
      </main>

      {/* Clean Global Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-left">
            <strong>RUANG RONTGEN</strong> • Sistem Analisis Kardiomegali & Manajemen Pengguna
          </div>
          <div className="footer-badges">
            <span className="footer-badge">Sesi Aktif: {currentUser.name}</span>
            <span className="footer-badge">{currentUser.role.toUpperCase()}</span>
            <span className="footer-badge">CNN Model</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
