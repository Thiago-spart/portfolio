import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock window.matchMedia for ThemeToggle tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Three.js requires a canvas with WebGL — mock it for jsdom
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  getExtension: vi.fn(),
  getParameter: vi.fn(),
  createBuffer: vi.fn(),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  viewport: vi.fn(),
  clearColor: vi.fn(),
  clear: vi.fn(),
  useProgram: vi.fn(),
  createShader: vi.fn(),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  getShaderParameter: vi.fn(() => true),
  createProgram: vi.fn(),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  getProgramParameter: vi.fn(() => true),
  getUniformLocation: vi.fn(),
  getAttribLocation: vi.fn(() => -1),
  uniform1i: vi.fn(),
  uniformMatrix4fv: vi.fn(),
  drawArrays: vi.fn(),
  drawElements: vi.fn(),
})) as unknown as typeof HTMLCanvasElement.prototype.getContext

// Embla (shadcn Carousel) uses ResizeObserver internally — mock it for jsdom
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver
