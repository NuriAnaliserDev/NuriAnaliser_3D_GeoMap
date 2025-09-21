/**
 * API Service Layer - Backend bilan aloqa
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Authorization header yaratish
   */
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * HTTP so'rov yuborish
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      // JSON response tekshirish
      if (response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.detail || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return data;
      } else {
        // Non-JSON response (masalan, file download)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response;
      }
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // === AUTHENTICATION ===
  
  /**
   * Foydalanuvchini ro'yxatdan o'tkazish
   */
  async register(username, password) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  /**
   * Foydalanuvchini kirish
   */
  async login(username, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  // === PROJECTS ===
  
  /**
   * Loyiha yaratish
   */
  async createProject(name, description = '') {
    return this.request('/api/projects/create', {
      method: 'POST',
      body: JSON.stringify({ name, description })
    });
  }

  /**
   * Loyihalarni olish
   */
  async getProjects() {
    return this.request('/api/projects/list');
  }

  // === ANALYSIS ===
  
  /**
   * 3-nuqta geologik tahlili
   */
  async analyzeThreePoint(projectId, points) {
    return this.request('/api/analyze/three-point', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        points: points.map(p => ({ x: p.x, y: p.y, z: p.z }))
      })
    });
  }

  /**
   * CSV fayl yuklash
   */
  async uploadCSV(file, projectId = 'default') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', projectId);

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/api/analyze/upload-csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Strukturaviy elementlarni tahlil qilish
   */
  async analyzeStructuralElements(projectId, points) {
    return this.request('/api/analyze/structural-elements', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        points: points.map(p => ({ x: p.x, y: p.y, z: p.z }))
      })
    });
  }

  /**
   * Geologik kesma yaratish
   */
  async createGeologicalSection(projectId, points, sectionAzimuth = 0) {
    return this.request('/api/analyze/geological-section', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        points: points.map(p => ({ x: p.x, y: p.y, z: p.z })),
        section_azimuth: sectionAzimuth
      })
    });
  }

  /**
   * Stratigrafik tahlil
   */
  async analyzeStratigraphy(projectId, layers) {
    return this.request('/api/analyze/stratigraphic', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        layers: layers
      })
    });
  }

  // === RESULTS ===
  
  /**
   * Natijalarni olish
   */
  async getResults(projectId = null) {
    const params = projectId ? `?project_id=${projectId}` : '';
    return this.request(`/api/results${params}`);
  }

  /**
   * Natijalarni eksport qilish
   */
  async exportResults(format = 'csv', projectId = null) {
    const params = projectId ? `?project_id=${projectId}` : '';
    return this.request(`/api/results/export/${format}${params}`);
  }

  // === HEALTH CHECK ===
  
  /**
   * API holatini tekshirish
   */
  async healthCheck() {
    return this.request('/api/health');
  }
}

// Singleton instance
const apiService = new ApiService();
export default apiService;

