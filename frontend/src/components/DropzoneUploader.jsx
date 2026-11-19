import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Sparkles,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  User,
  Cpu,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function DropzoneUploader() {
  const {
    currentImage,
    setCurrentImage,
    currentImagePreview,
    setCurrentImagePreview,
    setAnalysisResult,
    currentUser,
    fetchHistory,
    fetchUsers,
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationWarning, setValidationWarning] = useState(null);
  const fileInputRef = useRef(null);

  // Patient metadata for historical logging
  const [patientId, setPatientId] = useState(() => `PX-${Math.floor(1000 + Math.random() * 9000)}`);
  const [patientName, setPatientName] = useState('Bpk. Hendra');
  const [patientAge, setPatientAge] = useState(52);
  const [patientGender, setPatientGender] = useState('Laki-laki');

  const handleFileSelection = (file) => {
    setValidationWarning(null);
    setError(null);
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setValidationWarning('Ukuran berkas melebihi batas maksimum 10 MB.');
      return;
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setValidationWarning('Format berkas tidak didukung. Harap unggah PNG, JPG, atau WEBP.');
      return;
    }

    setCurrentImage(file);
    const objectUrl = URL.createObjectURL(file);
    setCurrentImagePreview(objectUrl);
    setAnalysisResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!currentImage) return;
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', currentImage);
      if (currentUser?.id) formData.append('user_id', currentUser.id);
      formData.append('patient_id', patientId);
      formData.append('patient_name', patientName || 'Pasien Anonim');
      formData.append('patient_age', patientAge);
      formData.append('patient_gender', patientGender);

      const res = await fetch('/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Proses analisis gagal.');
      }

      setAnalysisResult(data);
      // Generate new patient ID for next scan
      setPatientId(`PX-${Math.floor(1000 + Math.random() * 9000)}`);

      // Refresh history and user scan counts
      fetchHistory();
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetImage = () => {
    setCurrentImage(null);
    setCurrentImagePreview(null);
    setAnalysisResult(null);
    setValidationWarning(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="uploader-card">
      <div className="card-header">
        <div className="header-badge-step">
          <span className="step-num">01</span>
          <div>
            <h3>Input Citra Rontgen Toraks</h3>
            <p className="step-desc">Unggah foto rontgen dada AP/PA untuk analisis</p>
          </div>
        </div>
        <span className="badge-tag">CNN Model</span>
      </div>

      {/* Patient Information Form for History Tracking */}
      <div className="patient-meta-input-box">
        <span className="meta-input-title">
          <User size={14} /> Data Pasien (Tercatat ke Data Historis):
        </span>
        <div className="patient-form-grid">
          <div>
            <label>No. RM Pasien:</label>
            <input
              type="text"
              className="input-compact"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            />
          </div>
          <div>
            <label>Nama Pasien:</label>
            <input
              type="text"
              className="input-compact"
              value={patientName}
              placeholder="Nama Pasien"
              onChange={(e) => setPatientName(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Dropzone Box */}
      <div
        className={`dropzone-box ${isDragging ? 'dragging' : ''} ${
          currentImagePreview ? 'has-image' : ''
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !currentImagePreview && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
        />

        {!currentImagePreview ? (
          <div className="dropzone-content">
            <div className="upload-icon-circle">
              <UploadCloud size={28} />
            </div>
            <div className="dropzone-text">
              <p className="drop-main">Tarik & Lepas berkas rontgen di sini</p>
              <p className="drop-sub">
                atau <span className="browse-text">telusuri berkas</span> dari perangkat
              </p>
            </div>
            <div className="file-constraints">
              <span>Format: PNG, JPG, WEBP</span>
              <span>•</span>
              <span>Maks. 10 MB</span>
            </div>
          </div>
        ) : (
          <div className="preview-container">
            <img
              src={currentImagePreview}
              alt="Pratinjau Rontgen"
              className="preview-img"
            />
            <button
              type="button"
              className="clear-image-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleResetImage();
              }}
              title="Ganti Gambar"
            >
              <RotateCcw size={14} />
              <span>Ganti Citra</span>
            </button>
            <div className="image-loaded-badge">
              <CheckCircle2 size={14} /> Citra Siap Dianalisis
            </div>
          </div>
        )}
      </div>

      {/* Validation / Error Alert */}
      {(validationWarning || error) && (
        <div className="alert-box error">
          <AlertCircle size={18} />
          <span>{validationWarning || error}</span>
        </div>
      )}

      {/* Single Model Indicator (CNN Model) */}
      <div className="active-model-indicator-badge">
        <Cpu size={16} className="text-accent" />
        <div>
          <strong>Arsitektur AI: CNN Model</strong>
          <small>4-Block Convolutional Neural Network untuk siluet kardiomegali</small>
        </div>
      </div>

      {/* Submit Button */}
      <div className="action-button-group">
        <button
          type="button"
          className="btn-primary"
          disabled={!currentImage || isLoading}
          onClick={handleAnalyze}
        >
          {isLoading ? (
            <span>Menganalisis Citra...</span>
          ) : (
            <>
              <span>Analisis Citra Rontgen</span>
              <Sparkles size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
