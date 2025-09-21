import React, { useState, useEffect } from 'react';

export default function ProjectManager({ 
  projects, 
  currentProject, 
  onProjectSelect, 
  onProjectCreate, 
  onProjectLoad,
  loading,
  error 
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    // Load projects when component mounts
    onProjectLoad && onProjectLoad();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    try {
      await onProjectCreate(newProject.name, newProject.description);
      setNewProject({ name: '', description: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Project creation error:', error);
    }
  };

  const handleProjectClick = (project) => {
    onProjectSelect && onProjectSelect(project);
  };

  return (
    <div className="project-manager">
      {/* Header */}
      <div className="project-header">
        <h3>Loyihalar</h3>
        <button 
          className="create-project-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          ➕ Yangi Loyiha
        </button>
      </div>

      {/* Create Project Form */}
      {showCreateForm && (
        <div className="create-project-form">
          <h4>Yangi Loyiha Yaratish</h4>
          <form onSubmit={handleCreateProject}>
            <div className="form-group">
              <label htmlFor="project-name">Loyiha nomi:</label>
              <input
                id="project-name"
                type="text"
                value={newProject.name}
                onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Loyiha nomini kiriting"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="project-description">Tavsif:</label>
              <textarea
                id="project-description"
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Loyiha haqida qisqacha ma'lumot"
                rows="3"
              />
            </div>
            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? '⏳ Yaratilmoqda...' : '✅ Yaratish'}
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowCreateForm(false)}
              >
                ❌ Bekor qilish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Current Project Info */}
      {currentProject && (
        <div className="current-project">
          <h4>Joriy Loyiha</h4>
          <div className="project-card active">
            <h5>{currentProject.name}</h5>
            <p>{currentProject.description || 'Tavsif yo\'q'}</p>
            <div className="project-meta">
              <span>ID: {currentProject.id}</span>
              <span>Yaratilgan: {new Date(currentProject.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="projects-list">
        <h4>Barcha Loyihalar ({projects.length})</h4>
        
        {loading && (
          <div className="loading-message">
            <div className="spinner"></div>
            <span>Loyihalar yuklanmoqda...</span>
          </div>
        )}

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="empty-state">
            <p>📁 Hech qanday loyiha yo'q</p>
            <p>Yangi loyiha yarating va boshlang!</p>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <div className="projects-grid">
            {projects.map((project) => (
              <div 
                key={project.id}
                className={`project-card ${currentProject?.id === project.id ? 'selected' : ''}`}
                onClick={() => handleProjectClick(project)}
              >
                <div className="project-header">
                  <h5>{project.name}</h5>
                  {currentProject?.id === project.id && (
                    <span className="current-badge">Joriy</span>
                  )}
                </div>
                <p className="project-description">
                  {project.description || 'Tavsif yo\'q'}
                </p>
                <div className="project-meta">
                  <span className="project-id">ID: {project.id}</span>
                  <span className="project-date">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="project-actions">
                  <button 
                    className="select-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProjectClick(project);
                    }}
                  >
                    {currentProject?.id === project.id ? '✅ Tanlangan' : '👆 Tanlash'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Statistics */}
      {projects.length > 0 && (
        <div className="project-stats">
          <h4>📊 Statistika</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{projects.length}</span>
              <span className="stat-label">Jami loyihalar</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {projects.filter(p => p.created_at > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()).length}
              </span>
              <span className="stat-label">Oxirgi 7 kun</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {currentProject ? '1' : '0'}
              </span>
              <span className="stat-label">Faol loyiha</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
