/**
 * App komponenti testlari
 */
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import App from '../src/App'

// Mock context
vi.mock('../src/contexts/AppContext', () => ({
  AppProvider: ({ children }) => children,
  useApp: () => ({
    state: {
      isAuthenticated: false,
      username: '',
      token: null,
      projects: [],
      currentProject: null,
      latestReport: null,
      analysisHistory: [],
      loading: false,
      error: null,
      activeTab: 'analysis',
      sidebarOpen: true,
      theme: 'dark'
    },
    actions: {
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      loadProjects: vi.fn(),
      createProject: vi.fn(),
      setCurrentProject: vi.fn(),
      analyzeThreePoint: vi.fn(),
      uploadCSV: vi.fn(),
      setActiveTab: vi.fn(),
      toggleSidebar: vi.fn(),
      setTheme: vi.fn(),
      clearError: vi.fn()
    }
  })
}))

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByText('🔐 Kirish')).toBeInTheDocument()
  })

  it('shows login form when not authenticated', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Kirish' })).toBeInTheDocument()
  })
})