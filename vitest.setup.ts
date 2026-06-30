import '@testing-library/jest-dom'
import { vi } from 'vitest'

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
