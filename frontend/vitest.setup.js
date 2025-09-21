import { expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

// Bu barcha testlarda expect global bo'lishini ta'minlaydi
expect.extend(matchers)
