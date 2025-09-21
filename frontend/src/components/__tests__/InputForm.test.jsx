/**
 * InputForm komponenti testlari
 */
import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import InputForm from '../InputForm'

describe('InputForm', () => {
  const mockOnSubmit = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders input form correctly', () => {
    render(<InputForm onSubmit={mockOnSubmit} loading={false} error="" />)
    
    expect(screen.getByText('🔎 Hisoblash')).toBeInTheDocument()
    expect(screen.getAllByPlaceholderText('X')).toHaveLength(3)
    expect(screen.getAllByPlaceholderText('Y')).toHaveLength(3)
    expect(screen.getAllByPlaceholderText('Z')).toHaveLength(3)
  })

  it('handles input changes correctly', () => {
    render(<InputForm onSubmit={mockOnSubmit} loading={false} error="" />)
    
    const xInputs = screen.getAllByPlaceholderText('X')
    fireEvent.change(xInputs[0], { target: { value: '10' } })
    
    expect(xInputs[0].value).toBe('10')
  })

  it('shows loading state correctly', () => {
    render(<InputForm onSubmit={mockOnSubmit} loading={true} error="" />)
    
    const button = screen.getByRole('button', { name: /hisoblanmoqda/i })
    expect(button).toBeDisabled()
  })

  it('shows error message correctly', () => {
    const errorMessage = 'Xatolik yuz berdi'
    render(<InputForm onSubmit={mockOnSubmit} loading={false} error={errorMessage} />)
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })
})