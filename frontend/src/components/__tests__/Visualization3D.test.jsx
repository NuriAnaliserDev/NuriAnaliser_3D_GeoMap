/**
 * Visualization3D komponenti testlari
 */
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import Visualization3D from '../Visualization3D'

// Mock three.js va react-three-fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => <div data-testid="canvas">{children}</div>,
}))

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Grid: () => <div data-testid="grid" />,
  Text: ({ children }) => <div data-testid="text">{children}</div>,
}))

vi.mock('three', () => ({
  MathUtils: {
    degToRad: vi.fn((deg) => deg * Math.PI / 180),
  },
  Vector3: vi.fn(() => ({ 
    normalize: vi.fn(() => ({ x: 0, y: 0, z: 1 })),
    crossVectors: vi.fn(() => ({ normalize: vi.fn(() => ({ x: 0, y: 0, z: 1 })) }))
  })),
  Quaternion: vi.fn(() => ({ setFromUnitVectors: vi.fn() })),
  PlaneGeometry: vi.fn(() => ({
    translate: vi.fn(),
    applyQuaternion: vi.fn()
  })),
  DoubleSide: 'DoubleSide',
}))

describe('Visualization3D', () => {
  const mockPoints = [
    { x: 0, y: 0, z: 100 },
    { x: 10, y: 0, z: 120 },
    { x: 0, y: 10, z: 110 }
  ]

  it('renders canvas correctly', () => {
    render(
      <Visualization3D 
        points={mockPoints}
        strike={45}
        dip={30}
        dipDirection={135}
      />
    )
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument()
  })

  it('renders without points when points is null', () => {
    render(
      <Visualization3D 
        points={null}
        strike={45}
        dip={30}
        dipDirection={135}
      />
    )
    
    expect(screen.getByText('3 ta nuqta kiriting va hisoblash tugmasini bosing')).toBeInTheDocument()
  })

  it('renders with points but without strike/dip', () => {
    render(
      <Visualization3D 
        points={mockPoints}
        strike={undefined}
        dip={undefined}
        dipDirection={undefined}
      />
    )
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument()
  })

  it('has correct styling', () => {
    const { container } = render(
      <Visualization3D 
        points={mockPoints}
        strike={45}
        dip={30}
        dipDirection={135}
      />
    )
    
    const wrapper = container.firstChild
    expect(wrapper).toHaveStyle({
      height: '400px'
    })
  })
})