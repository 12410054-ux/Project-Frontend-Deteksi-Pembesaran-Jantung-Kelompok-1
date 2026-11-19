import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  History,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function DiagnosisCard({ result, onReset }) {
  const { setActiveTab } = useApp();

  if (!result) return null;

  const isPositive = result.label === 'Kardiomegali';
  const confidence = result.confidence || 0;
  const cardioProb = result.cardiomegaly_probability || 0;
  const normalProb = result.normal_probability || 0;

  // Circular gauge calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <div className={`diagnosis-card ${isPositive ? 'is-warning' : 'is-success'}`}>
      <div className="card-header">
        <div className="header-badge-step">
          <span className="step-num">02</span>
          <div>
            <h3>Hasil Analisis Model AI</h3>
            <p className="step-desc">Inferensi otomatis berbasis Computer Vision</p>
          </div>
        </div>
        <span className="badge-tag">
          {result.model_name || 'CNN Custom (4-Block)'}
        </span>
      </div>

      {/* Primary Diagnosis Banner */}
      <div className="diagnosis-banner">
        <div className="banner-left">
          <span className="diagnosis-eyebrow">DIAGNOSIS KLINIS AWAL</span>
          <div className="diagnosis-title-row">
            {isPositive ? (
              <AlertTriangle className="status-icon warning" size={28} />
            ) : (
              <CheckCircle2 className="status-icon success" size={28} />
            )}
            <h2 className="diagnosis-title">{result.label}</h2>
          </div>
          <span className="clinical-badge-pill">
            {isPositive ? 'Terdeteksi Pembesaran Jantung' : 'Siluet Jantung Normal'}
          </span>
        </div>

        {/* Circular Confidence Meter */}
        <div className="banner-right">
          <div className="circular-meter">
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="meter-track"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r={radius}
                className={`meter-indicator ${isPositive ? 'warning' : 'success'}`}
                strokeWidth="7"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 48 48)"
              />
            </svg>
            <div className="meter-label">
              <span className="meter-value">{confidence.toFixed(1)}%</span>
              <small>Keyakinan</small>
            </div>
          </div>
        </div>
      </div>

      {/* Class Probabilities Distribution */}
      <div className="probability-distribution">
        <div className="prob-header">
          <span className="prob-title">Distribusi Probabilitas Kelas</span>
          <span className="prob-threshold">Ambang Batas: 50.0%</span>
        </div>

        {/* Normal Bar */}
        <div className="prob-row">
          <div className="prob-info">
            <span className="prob-name">Normal (Sehat)</span>
            <strong className="prob-pct">{normalProb.toFixed(1)}%</strong>
          </div>
          <div className="prob-track">
            <div
              className="prob-fill normal-fill"
              style={{ width: `${Math.max(4, normalProb)}%` }}
            ></div>
          </div>
        </div>

        {/* Cardiomegaly Bar */}
        <div className="prob-row">
          <div className="prob-info">
            <span className="prob-name">Kardiomegali (Positif)</span>
            <strong className="prob-pct">{cardioProb.toFixed(1)}%</strong>
          </div>
          <div className="prob-track">
            <div
              className="prob-fill cardio-fill"
              style={{ width: `${Math.max(4, cardioProb)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Clinical Notes Box */}
      <div className="clinical-note-box">
        <div className="note-header">
          <ShieldCheck size={16} />
          <strong>Catatan & Anjuran Klinis</strong>
        </div>
        <p className="note-body">{result.clinical_note}</p>
        <div className="disclaimer-text">
          * Hasil otomatis tercatat ke dalam <strong>Data Historis Pengguna</strong>.
        </div>
      </div>

      {/* Action Footer */}
      <div className="diagnosis-actions">
        <button
          type="button"
          className="btn-action report-btn"
          onClick={() => setActiveTab('history')}
        >
          <History size={16} />
          <span>Buka Data Historis Pengguna</span>
        </button>

        <button type="button" className="btn-action reset-btn" onClick={onReset}>
          <RotateCcw size={15} />
          <span>Analisis Citra Baru</span>
        </button>
      </div>
    </div>
  );
}
