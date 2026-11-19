import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  SunMedium,
  Contrast,
} from 'lucide-react';

export default function MedicalImageViewer({ imageUrl, title = 'Citra Rontgen Toraks' }) {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [zoom, setZoom] = useState(1);

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setZoom(1);
  };

  const handleZoom = (delta) => {
    setZoom((prev) => Math.min(2.5, Math.max(0.7, Math.round((prev + delta) * 10) / 10)));
  };

  const imageStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
    transform: `scale(${zoom})`,
    transition: 'filter 0.15s ease, transform 0.15s ease-out',
  };

  return (
    <div className="medical-viewer-card">
      <div className="viewer-toolbar">
        <div className="toolbar-left">
          <Eye size={17} className="toolbar-icon" />
          <span className="viewer-title">{title}</span>
          <span className="zoom-badge">{(zoom * 100).toFixed(0)}%</span>
        </div>

        <div className="toolbar-right">
          <div className="zoom-control-group">
            <button
              type="button"
              className="icon-btn"
              onClick={() => handleZoom(-0.2)}
              title="Perkecil Citra"
            >
              <ZoomOut size={16} />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => handleZoom(0.2)}
              title="Perbesar Citra"
            >
              <ZoomIn size={16} />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={resetFilters}
              title="Reset Tampilan"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="viewport-stage">
        <div className="image-canvas-wrapper">
          <img
            src={imageUrl}
            alt="Radiology Scan"
            className="xray-image-element"
            style={imageStyle}
            draggable={false}
          />
        </div>
      </div>

      {/* Adjusters */}
      <div className="viewer-adjusters">
        <div className="slider-item">
          <SunMedium size={15} />
          <label>Kecerahan ({brightness}%)</label>
          <input
            type="range"
            min="60"
            max="160"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
          />
        </div>

        <div className="slider-item">
          <Contrast size={15} />
          <label>Kontras ({contrast}%)</label>
          <input
            type="range"
            min="60"
            max="180"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
