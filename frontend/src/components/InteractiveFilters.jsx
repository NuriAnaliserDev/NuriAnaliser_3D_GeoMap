import React, { useState, useEffect } from 'react';

export default function InteractiveFilters({ 
  onFilterChange, 
  onProjectionChange,
  onColorSchemeChange,
  initialFilters = {}
}) {
  const [filters, setFilters] = useState({
    strikeRange: { min: 0, max: 360 },
    dipRange: { min: 0, max: 90 },
    dipDirectionRange: { min: 0, max: 360 },
    pointSize: 0.1,
    showStrikeLine: true,
    showDipLine: true,
    showNormal: true,
    showGrid: true,
    showAxes: true,
    ...initialFilters
  });

  const [projection, setProjection] = useState('perspective');
  const [colorScheme, setColorScheme] = useState('geological');

  const colorSchemes = {
    geological: {
      name: 'Geological',
      colors: {
        strike: '#ff4444',
        dip: '#44ff44', 
        normal: '#ffff44',
        plane: '#4444ff',
        points: ['#ff0000', '#00ff00', '#0000ff']
      }
    },
    monochrome: {
      name: 'Monochrome',
      colors: {
        strike: '#ffffff',
        dip: '#cccccc',
        normal: '#999999',
        plane: '#666666',
        points: ['#ffffff', '#cccccc', '#999999']
      }
    },
    rainbow: {
      name: 'Rainbow',
      colors: {
        strike: '#ff0000',
        dip: '#00ff00',
        normal: '#0000ff',
        plane: '#ffff00',
        points: ['#ff0000', '#00ff00', '#0000ff']
      }
    }
  };

  const projections = [
    { value: 'perspective', label: 'Perspective', description: '3D perspective view' },
    { value: 'orthographic', label: 'Orthographic', description: '2D orthographic projection' },
    { value: 'isometric', label: 'Isometric', description: 'Isometric projection' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange && onFilterChange(newFilters);
  };

  const handleProjectionChange = (newProjection) => {
    setProjection(newProjection);
    onProjectionChange && onProjectionChange(newProjection);
  };

  const handleColorSchemeChange = (newScheme) => {
    setColorScheme(newScheme);
    onColorSchemeChange && onColorSchemeChange(colorSchemes[newScheme]);
  };

  const resetFilters = () => {
    const defaultFilters = {
      strikeRange: { min: 0, max: 360 },
      dipRange: { min: 0, max: 90 },
      dipDirectionRange: { min: 0, max: 360 },
      pointSize: 0.1,
      showStrikeLine: true,
      showDipLine: true,
      showNormal: true,
      showGrid: true,
      showAxes: true
    };
    setFilters(defaultFilters);
    onFilterChange && onFilterChange(defaultFilters);
  };

  return (
    <div className="interactive-filters">
      <h3>🎛️ Interactive Controls</h3>
      
      {/* Strike Range Filter */}
      <div className="filter-group">
        <label className="filter-label">
          Strike Range: {filters.strikeRange.min}° - {filters.strikeRange.max}°
        </label>
        <div className="range-inputs">
          <input
            type="range"
            min="0"
            max="360"
            value={filters.strikeRange.min}
            onChange={(e) => handleFilterChange('strikeRange', { 
              ...filters.strikeRange, 
              min: parseInt(e.target.value) 
            })}
            className="range-slider"
          />
          <input
            type="range"
            min="0"
            max="360"
            value={filters.strikeRange.max}
            onChange={(e) => handleFilterChange('strikeRange', { 
              ...filters.strikeRange, 
              max: parseInt(e.target.value) 
            })}
            className="range-slider"
          />
        </div>
      </div>

      {/* Dip Range Filter */}
      <div className="filter-group">
        <label className="filter-label">
          Dip Range: {filters.dipRange.min}° - {filters.dipRange.max}°
        </label>
        <div className="range-inputs">
          <input
            type="range"
            min="0"
            max="90"
            value={filters.dipRange.min}
            onChange={(e) => handleFilterChange('dipRange', { 
              ...filters.dipRange, 
              min: parseInt(e.target.value) 
            })}
            className="range-slider"
          />
          <input
            type="range"
            min="0"
            max="90"
            value={filters.dipRange.max}
            onChange={(e) => handleFilterChange('dipRange', { 
              ...filters.dipRange, 
              max: parseInt(e.target.value) 
            })}
            className="range-slider"
          />
        </div>
      </div>

      {/* Point Size */}
      <div className="filter-group">
        <label className="filter-label">
          Point Size: {filters.pointSize.toFixed(2)}
        </label>
        <input
          type="range"
          min="0.05"
          max="0.5"
          step="0.05"
          value={filters.pointSize}
          onChange={(e) => handleFilterChange('pointSize', parseFloat(e.target.value))}
          className="range-slider"
        />
      </div>

      {/* Visibility Toggles */}
      <div className="filter-group">
        <label className="filter-label">Visibility</label>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.showStrikeLine}
              onChange={(e) => handleFilterChange('showStrikeLine', e.target.checked)}
            />
            Strike Line
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.showDipLine}
              onChange={(e) => handleFilterChange('showDipLine', e.target.checked)}
            />
            Dip Line
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.showNormal}
              onChange={(e) => handleFilterChange('showNormal', e.target.checked)}
            />
            Normal Vector
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.showGrid}
              onChange={(e) => handleFilterChange('showGrid', e.target.checked)}
            />
            Grid
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.showAxes}
              onChange={(e) => handleFilterChange('showAxes', e.target.checked)}
            />
            Axes
          </label>
        </div>
      </div>

      {/* Projection Selection */}
      <div className="filter-group">
        <label className="filter-label">Projection</label>
        <div className="projection-buttons">
          {projections.map(proj => (
            <button
              key={proj.value}
              className={`projection-btn ${projection === proj.value ? 'active' : ''}`}
              onClick={() => handleProjectionChange(proj.value)}
              title={proj.description}
            >
              {proj.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color Scheme Selection */}
      <div className="filter-group">
        <label className="filter-label">Color Scheme</label>
        <div className="color-scheme-buttons">
          {Object.entries(colorSchemes).map(([key, scheme]) => (
            <button
              key={key}
              className={`color-scheme-btn ${colorScheme === key ? 'active' : ''}`}
              onClick={() => handleColorSchemeChange(key)}
              title={scheme.name}
            >
              <div className="color-preview">
                <div 
                  className="color-dot" 
                  style={{ backgroundColor: scheme.colors.strike }}
                ></div>
                <div 
                  className="color-dot" 
                  style={{ backgroundColor: scheme.colors.dip }}
                ></div>
                <div 
                  className="color-dot" 
                  style={{ backgroundColor: scheme.colors.normal }}
                ></div>
              </div>
              {scheme.name}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <div className="filter-group">
        <button 
          className="reset-btn"
          onClick={resetFilters}
        >
          🔄 Reset Filters
        </button>
      </div>

      {/* Filter Summary */}
      <div className="filter-summary">
        <h4>Active Filters</h4>
        <div className="summary-item">
          <span>Strike:</span> {filters.strikeRange.min}° - {filters.strikeRange.max}°
        </div>
        <div className="summary-item">
          <span>Dip:</span> {filters.dipRange.min}° - {filters.dipRange.max}°
        </div>
        <div className="summary-item">
          <span>Projection:</span> {projections.find(p => p.value === projection)?.label}
        </div>
        <div className="summary-item">
          <span>Colors:</span> {colorSchemes[colorScheme].name}
        </div>
      </div>
    </div>
  );
}
