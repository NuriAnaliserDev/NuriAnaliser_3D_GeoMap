import React, { useState } from "react";
import "./styles.css";
import { AppProvider, useApp } from "./contexts/AppContext";
import InputForm from "./components/InputForm";
import ResultCard from "./components/ResultCard";
import HistoryList from "./components/HistoryList";
import DownloadButtons from "./components/DownloadButtons";
import LoginForm from "./components/LoginForm";
import Visualization3D from "./components/Visualization3D";
import EnhancedVisualization3D from "./components/EnhancedVisualization3D";
import InteractiveFilters from "./components/InteractiveFilters";
import CSVUpload from "./components/CSVUpload";
import ProjectManager from "./components/ProjectManager";

// Main App Component with Context
function AppContent() {
  const { state, actions } = useApp();
  const [filters, setFilters] = useState({});
  const [projection, setProjection] = useState('perspective');
  const [colorScheme, setColorScheme] = useState('geological');
  const [activeTab, setActiveTab] = useState('analysis');

  // Handle login
  const handleLogin = async (loginData) => {
    try {
      await actions.login(loginData.username, loginData.password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  // Handle register
  const handleRegister = async (registerData) => {
    try {
      await actions.register(registerData.username, registerData.password);
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    actions.logout();
  };

  // Handle CSV upload
  const handleCSVUpload = async (uploadData) => {
    try {
      await actions.uploadCSV(uploadData.file, state.currentProject?.id || 'default');
    } catch (error) {
      console.error('CSV upload error:', error);
    }
  };

  // Handle point click in 3D visualization
  const handlePointClick = (index, point) => {
    console.log(`Point ${index + 1} clicked:`, point);
    // Bu yerda point ma'lumotlarini ko'rsatish yoki boshqa amallar bajarish mumkin
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle projection changes
  const handleProjectionChange = (newProjection) => {
    setProjection(newProjection);
  };

  // Handle color scheme changes
  const handleColorSchemeChange = (newColorScheme) => {
    setColorScheme(newColorScheme);
  };

  // If not authenticated, show login form
  if (!state.isAuthenticated) {
    return (
      <div className="app">
        <LoginForm 
          onLogin={handleLogin} 
          onRegister={handleRegister}
          loading={state.loading}
          error={state.error}
        />
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1>🗻 NuriSection 3D GeoAnalyser</h1>
          <span className="version">v1.0</span>
        </div>
        <div className="header-right">
          <span className="username">👤 {state.username}</span>
          <button 
            className="logout-btn"
            onClick={handleLogout}
            title="Chiqish"
          >
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          🔬 Analysis
        </button>
        <button 
          className={`tab-btn ${activeTab === 'visualization' ? 'active' : ''}`}
          onClick={() => setActiveTab('visualization')}
        >
          🎯 3D Visualization
        </button>
        <button 
          className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          📁 Projects
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📊 History
        </button>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="tab-content">
            <div className="analysis-section">
              <h2>🔬 Geologik Tahlil</h2>
              <InputForm 
                onSubmit={actions.analyzeThreePoint}
                loading={state.loading}
                error={state.error}
              />
              
              <CSVUpload 
                onUpload={handleCSVUpload}
                loading={state.loading}
                error={state.error}
              />
              
              {state.latestReport && (
                <ResultCard 
                  report={state.latestReport}
                  onClear={() => actions.setLatestReport(null)}
                />
              )}
              
              <DownloadButtons />
            </div>
          </div>
        )}

        {/* Visualization Tab */}
        {activeTab === 'visualization' && (
          <div className="tab-content">
            <div className="visualization-section">
              <h2>🎯 3D Vizualizatsiya</h2>
              
              <div className="viz-container">
                <div className="viz-controls-panel">
                  <InteractiveFilters
                    onFilterChange={handleFilterChange}
                    onProjectionChange={handleProjectionChange}
                    onColorSchemeChange={handleColorSchemeChange}
                    initialFilters={filters}
                  />
                </div>
                
                <div className="viz-canvas-panel">
                  {state.latestReport ? (
                    <EnhancedVisualization3D
                      points={state.latestReport.points || [
                        { x: 0, y: 0, z: 100 },
                        { x: 10, y: 0, z: 120 },
                        { x: 0, y: 10, z: 110 }
                      ]}
                      strike={state.latestReport.strike}
                      dip={state.latestReport.dip}
                      dipDirection={state.latestReport.dip_direction}
                      onPointClick={handlePointClick}
                      filters={filters}
                      projection={projection}
                      colorScheme={colorScheme}
                    />
                  ) : (
                    <div className="no-data-message">
                      <h3>📊 Ma'lumot yo'q</h3>
                      <p>3D vizualizatsiya uchun avval tahlil qiling</p>
                      <button 
                        className="goto-analysis-btn"
                        onClick={() => setActiveTab('analysis')}
                      >
                        Tahlil qilish
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="tab-content">
            <div className="projects-section">
              <h2>📁 Loyihalar</h2>
              <ProjectManager 
                projects={state.projects}
                currentProject={state.currentProject}
                onProjectSelect={actions.setCurrentProject}
                onProjectCreate={actions.createProject}
                onProjectLoad={actions.loadProjects}
                loading={state.loading}
                error={state.error}
              />
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="tab-content">
            <div className="history-section">
              <h2>📊 Tahlil Tarixi</h2>
              <HistoryList 
                history={state.analysisHistory}
                onClear={() => actions.clearHistory()}
              />
            </div>
          </div>
        )}
      </main>

      {/* Error Display */}
      {state.error && (
        <div className="error-toast">
          <span>❌ {state.error}</span>
          <button 
            className="close-error-btn"
            onClick={actions.clearError}
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {state.loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Yuklanmoqda...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// App with Provider
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}