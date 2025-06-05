import { render, screen } from '@testing-library/react'
import Footer from '../Footer'

describe('Footer', () => {
  it('renders newsletter text', () => {
    render(<Footer />)
    expect(screen.getByText('Subscribe to our newsletter')).toBeInTheDocument()
  })
})
