// The Mangrove, drawn as a technical drawing: mono-weight strokes, dimension
// lines and callouts by day; the same drawing as glowing points by night.
// Ported from the hero POC (portfolio/hero-poc/scene.js). Client only, loaded
// with a dynamic import() after first paint, so three.js stays out of the
// main bundle. The React shell (HeroSection) owns the copy, the hint, the
// result labels (laid out in CSS, in the lane beside the gauge) and the
// poster; this module owns the canvas, the drawing's annotations and the
// leaders from each label to its mark on the gauge.
import * as THREE from 'three'
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'

export interface SceneLabels {
  propRoot: string
  canopy: string
  contact: string
  // Templates with a {value} placeholder.
  tide: string
  rootSpread: string
  height: string
}

export interface SceneOptions {
  // The drawing box: the canvas fills it.
  container: HTMLElement
  // Annotation layer over the canvas (absolute, inset 0, no pointer events).
  overlay: HTMLElement
  // The hero section, for scroll progress and visibility.
  hero: HTMLElement
  // The result label elements, by result index (rendered and placed by
  // React). From 900px the drawing makes room for them and draws a leader
  // from each to its mark on the gauge.
  lane: () => Array<HTMLElement | null>
  // One proof seed per result; height is 0–1 of the tallest shoot.
  results: Array<{ height: number }>
  labels: SceneLabels
  reducedMotion: boolean
  isDark: () => boolean
  onMango: () => void
  // A visitor grew a root.
  onPlant: () => void
  readStore: (key: string) => string | null
  writeStore: (key: string, value: string | null) => void
  storageKey: string
}

export interface MangroveScene {
  // Grows a result's shoot again and redraws its dimension line.
  replayProof: (index: number) => void
  reset: () => void
  setTheme: () => void
  setLabels: (labels: SceneLabels) => void
  destroy: () => void
}

type V3 = THREE.Vector3

const LANE_MIN_WIDTH = 900
// Space kept between the gauge and the lane's labels.
const LANE_GAP = 28
const TIDE = { light: 0.0, dark: 0.5 }
const GAUGE_ZERO = -0.6 // the gauge reads 0.0 m here
const ROOT_FLOOR = -0.45 // where roots disappear into the water

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeIn = (t: number) => t * t
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))
const MINUS = '−'
const fmtSigned = (v: number) => `${v < -0.05 ? MINUS : '+'}${Math.abs(v).toFixed(1)}`
const V = (x: number, y: number, z = 0) => new THREE.Vector3(x, y, z)

// Positions are flat [x1,y1,z1, x2,y2,z2, ...] segment pairs.
function polyPairs(points: V3[], closed = false): number[] {
  const out: number[] = []
  const n = points.length
  for (let i = 0; i < n - 1 + (closed ? 1 : 0); i++) {
    const a = points[i]
    const b = points[(i + 1) % n]
    out.push(a.x, a.y, a.z, b.x, b.y, b.z)
  }
  return out
}

function dashPairs(a: V3, b: V3, dash: number, gap: number, phase = 0): number[] {
  const out: number[] = []
  const len = a.distanceTo(b)
  const dir = new THREE.Vector3().subVectors(b, a).normalize()
  for (let s = -phase; s < len; s += dash + gap) {
    const s0 = Math.max(0, s)
    const s1 = Math.min(len, s + dash)
    if (s1 <= s0) continue
    out.push(a.x + dir.x * s0, a.y + dir.y * s0, a.z + dir.z * s0, a.x + dir.x * s1, a.y + dir.y * s1, a.z + dir.z * s1)
  }
  return out
}

// A root that leaves its start already angled down (a Λ at the trunk, never
// a ∩), bows outward, then dives steeply into the water.
function rootCurve(S: V3, E: V3, lift = 0.15) {
  const dx = E.x - S.x
  const dz = E.z - S.z
  const drop = S.y - E.y
  const c1 = V(S.x + dx * 0.4, S.y - drop * 0.12 + lift, S.z + dz * 0.35)
  const c2 = V(E.x - dx * 0.02, E.y + drop * 0.62, E.z - dz * 0.05)
  return new THREE.CubicBezierCurve3(S, c1, c2, E)
}

// Two parallel strokes, so a root reads as drawn wood rather than a wire.
// Interleaved (main, offset, main, ...) so a partial draw grows both.
function doubleStroke(curve: THREE.Curve<V3>, n: number, width: number): number[] {
  const pts = curve.getPoints(n)
  const off = pts.map((p, i) => {
    const t = curve.getTangent(i / n)
    return V(p.x - t.y * width, p.y + t.x * width, p.z)
  })
  const a = polyPairs(pts)
  const b = polyPairs(off)
  const out: number[] = []
  for (let i = 0; i < a.length; i += 6) out.push(...a.slice(i, i + 6), ...b.slice(i, i + 6))
  return out
}

interface Mass {
  x: number
  y: number
  z: number
  R: number
  ph: [number, number, number]
  tree: number
}

function massR(m: Mass, th: number): [number, number] {
  const wob = 1 + 0.13 * Math.sin(3 * th + m.ph[0]) + 0.08 * Math.sin(5 * th + m.ph[1]) + 0.05 * Math.sin(9 * th + m.ph[2])
  const flat = Math.sin(th) < 0 ? 0.72 : 1
  return [Math.cos(th) * m.R * 1.25 * wob, Math.sin(th) * m.R * 0.8 * wob * flat]
}

export function createScene(opts: SceneOptions): MangroveScene {
  const { container, overlay, hero, reducedMotion } = opts
  let labels = opts.labels
  const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim()
  const small = container.clientWidth < 640
  let dark = opts.isDark()
  let growHeight = 2.2
  const cleanups: Array<() => void> = []
  const listen = <K extends keyof WindowEventMap>(target: Window, type: K, fn: (e: WindowEventMap[K]) => void, o?: AddEventListenerOptions) => {
    target.addEventListener(type, fn, o)
    cleanups.push(() => target.removeEventListener(type, fn))
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2))
  const canvas = renderer.domElement
  canvas.setAttribute('aria-hidden', 'true')
  // Fades in over the poster once the first frame is drawn.
  canvas.className = 'absolute inset-0 block size-full touch-pan-y opacity-0 transition-opacity duration-400 ease-out'
  container.appendChild(canvas)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100)

  // Materials by role, recolored from the CSS tokens on theme change.
  const lineMats: LineMaterial[] = []
  const roleMats: Record<'ink' | 'muted' | 'mangrove', LineMaterial[]> = { ink: [], muted: [], mangrove: [] }
  function lmat(role: keyof typeof roleMats, width: number, opacity = 1) {
    const m = new LineMaterial({ color: 0xffffff, linewidth: width, transparent: true, opacity, depthWrite: false })
    lineMats.push(m)
    roleMats[role].push(m)
    return m
  }
  const M = {
    ink2: lmat('ink', 1.6),
    ink1: lmat('ink', 1),
    muted1: lmat('muted', 1, 0.75),
    hatch: lmat('muted', 1, 0.4),
    mangrove2: lmat('mangrove', 2),
    mangrove1: lmat('mangrove', 1.2),
  }
  function segs(pairs: number[], mat: LineMaterial) {
    const geo = new LineSegmentsGeometry()
    geo.setPositions(pairs)
    return new LineSegments2(geo, mat)
  }

  // Soft round sprite for the night points and the mango halo.
  const dot = (() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const g = c.getContext('2d')!
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.35, 'rgba(255,255,255,0.5)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(c)
  })()

  // Idle motion runs on this one uniform; the GPU does the per-point work.
  const idleUniforms = { uTime: { value: 0 } }
  // Sizes are screen pixels, so the glow stays even at every camera distance.
  const pointsMat = (size: number) => {
    const m = new THREE.PointsMaterial({
      size: size * renderer.getPixelRatio(),
      map: dot,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: false,
    })
    // Night shimmer: each point brightens and dims on its own slow phase.
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = idleUniforms.uTime
      shader.vertexShader =
        'uniform float uTime;\nvarying float vShimmer;\n' +
        shader.vertexShader.replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\n  vShimmer = 0.72 + 0.28 * sin(uTime * 1.1 + position.x * 3.1 + position.y * 2.3 + position.z * 1.7);',
        )
      shader.fragmentShader =
        'varying float vShimmer;\n' +
        shader.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n  diffuseColor.rgb *= vShimmer;')
    }
    m.customProgramCacheKey = () => 'shimmer-points'
    return m
  }

  // Night points take their colors from the tokens: mangrove, mixed a little
  // toward ink or ink-muted per point. Mixes are kept to recolor on theme change.
  const pointSets: Array<{ points: THREE.Points; mix: Float32Array }> = []
  function makePoints(list: V3[], size: number, inkShare = 0.35) {
    const pos = new Float32Array(list.length * 3)
    const col = new Float32Array(list.length * 3)
    const mix = new Float32Array(list.length * 2)
    const rnd = mulberry32(list.length)
    list.forEach((p, i) => {
      pos.set([p.x, p.y, p.z], i * 3)
      mix[i * 2] = rnd() < inkShare ? 1 : 0
      mix[i * 2 + 1] = rnd() * 0.6
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    const points = new THREE.Points(geo, pointsMat(size))
    pointSets.push({ points, mix })
    colorPoints(pointSets[pointSets.length - 1])
    return points
  }
  const cMangrove = new THREE.Color()
  const cInk = new THREE.Color()
  const cMuted = new THREE.Color()
  function colorPoints({ points, mix }: { points: THREE.Points; mix: Float32Array }) {
    const attr = points.geometry.getAttribute('color') as THREE.BufferAttribute
    const c = new THREE.Color()
    for (let i = 0; i < attr.count; i++) {
      c.copy(cMangrove).lerp(mix[i * 2] ? cInk : cMuted, mix[i * 2 + 1])
      attr.setXYZ(i, c.r, c.g, c.b)
    }
    attr.needsUpdate = true
  }
  function readColors() {
    cMangrove.set(css('mangrove'))
    cInk.set(css('ink'))
    cMuted.set(css('ink-muted'))
  }
  readColors()

  const rand = mulberry32(11)
  const dayOnly: THREE.Object3D[] = []
  const nightOnly: THREE.Object3D[] = []

  // ---- Two mangroves whose prop roots tangle together ----
  const treeXs = small ? [-1.0, 1.0] : [-1.3, 1.3]
  const rootsPerTree = small ? 4 : 5
  const lines: number[] = []
  const hatchPairs: number[] = []
  const woodCurves: Array<THREE.Curve<V3>> = []
  const attach: V3[] = []
  const landings: V3[] = []
  const masses: Mass[] = []
  let calloutRoot = V(0, 0, 0)

  treeXs.forEach((x0, ti) => {
    const z = ti % 2 ? -0.35 : 0.15
    const lean = (rand() - 0.5) * 0.3
    const baseY = 0.9 + rand() * 0.25 // the trunk ends in the air, held up by roots
    const topY = 3.5 + rand() * 0.4
    const trunkAt = (f: number) => V(x0 + lean * f, baseY + (topY - baseY) * f, z)
    const top = trunkAt(1)
    lines.push(x0 - 0.1, baseY, z, top.x - 0.05, topY, z, x0 + 0.1, baseY, z, top.x + 0.05, topY, z, x0 - 0.1, baseY, z, x0 + 0.1, baseY, z)
    woodCurves.push(new THREE.LineCurve3(trunkAt(0), top))
    for (let f = 0.15; f <= 0.75; f += 0.15) attach.push(trunkAt(f))

    // Prop roots: start on the trunk 20–60% up, bow outward and down, dive in.
    for (let k = 0; k < rootsPerTree; k++) {
      // Alternate sides so each trunk stands on roots both ways.
      const side = k % 2 ? 1 : -1
      rand()
      const f = 0.2 + rand() * 0.4
      const S = trunkAt(f)
      S.x += side * 0.07
      const reach = small ? 0.45 + rand() * 1.1 : 0.5 + rand() * 1.35
      const E = V(S.x + side * reach, ROOT_FLOOR, z + (rand() - 0.5) * 1.1)
      const curve = rootCurve(S, E, -0.05 + rand() * 0.12)
      lines.push(...doubleStroke(curve, 30, 0.045 * side))
      woodCurves.push(curve)
      landings.push(E)
      ;[0.2, 0.35, 0.5, 0.65].forEach((t) => attach.push(curve.getPoint(t)))
      if (ti === 0 && k === 0) calloutRoot = curve.getPoint(0.82)
      // Some roots branch once near the water.
      if (rand() < 0.45) {
        const B = curve.getPoint(0.7)
        const E2 = V(B.x + side * (0.3 + rand() * 0.45), ROOT_FLOOR, B.z + (rand() - 0.5) * 0.5)
        const branch = new THREE.QuadraticBezierCurve3(B, V(B.x + side * 0.28, B.y - 0.02, B.z), E2)
        lines.push(...doubleStroke(branch, 14, 0.035 * side))
        woodCurves.push(branch)
        landings.push(E2)
      }
    }

    // Canopy: two loose rows of irregular leaf masses, branches reaching in.
    const rows = small ? [2, 1] : [3, 1 + (ti % 2)]
    const slots: Array<{ dx: number; dy: number }> = []
    rows.forEach((n, row) => {
      for (let j = 0; j < n; j++) slots.push({ dx: (j - (n - 1) / 2) * 0.78, dy: row * 0.6 })
    })
    for (const slot of slots) {
      const R = 0.36 + rand() * 0.18
      const mass: Mass = {
        x: top.x + slot.dx + (rand() - 0.5) * 0.18,
        y: topY + 0.15 + slot.dy + (rand() - 0.5) * 0.15,
        z: z + 0.3,
        R,
        ph: [rand() * 6.28, rand() * 6.28, rand() * 6.28],
        tree: ti,
      }
      masses.push(mass)
      const outline: V3[] = []
      for (let i = 0; i < 64; i++) {
        const [ox, oy] = massR(mass, (i / 64) * Math.PI * 2)
        outline.push(V(mass.x + ox, mass.y + oy, mass.z))
      }
      lines.push(...polyPairs(outline, true))
      const branch = new THREE.QuadraticBezierCurve3(V(top.x, topY - 0.25, z), V((top.x + mass.x) / 2, topY + 0.05, z), V(mass.x, mass.y - R * 0.35, z))
      lines.push(...polyPairs(branch.getPoints(8)))
      woodCurves.push(branch)
      if (rand() < 0.5) {
        const hy = mass.y + R * 0.15
        const arc = new THREE.QuadraticBezierCurve3(V(mass.x - R * 0.5, hy, mass.z), V(mass.x, hy + R * 0.35, mass.z), V(mass.x + R * 0.45, hy + 0.05, mass.z))
        hatchPairs.push(...polyPairs(arc.getPoints(8)))
      }
    }
  })

  const canopyTop = Math.max(...masses.map((m) => m.y + m.R * 0.95))
  const treeLeft = Math.min(...landings.map((p) => p.x), ...masses.map((m) => m.x - m.R * 1.4))
  const treeRight = Math.max(...landings.map((p) => p.x), ...masses.map((m) => m.x + m.R * 1.4))

  // The one mango: the only filled shape, under a leaf mass of the right tree.
  const hangFrom = masses.filter((m) => m.tree === 1).sort((a, b) => a.y - b.y)[0]
  const mangoPos = V(hangFrom.x - 0.35, hangFrom.y - hangFrom.R * 0.62 - 0.26, 0.6)
  const mangoMat = new THREE.MeshBasicMaterial({ color: css('mango') })
  const mango = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 14), mangoMat)
  mango.position.copy(mangoPos)
  mango.renderOrder = 3
  scene.add(mango)
  lines.push(mangoPos.x, mangoPos.y + 0.18, 0.6, mangoPos.x - 0.03, hangFrom.y - hangFrom.R * 0.5, 0.6)
  // At night a soft halo keeps the mango readable among the points.
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: dot, color: mangoMat.color, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }),
  )
  halo.scale.setScalar(1.1)
  halo.position.copy(mangoPos)
  scene.add(halo)
  nightOnly.push(halo)
  const mangoHit = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), new THREE.MeshBasicMaterial())
  mangoHit.visible = false
  mangoHit.position.copy(mangoPos)
  scene.add(mangoHit)

  // Night points for wood and canopy, kept clear of the mango.
  const clearOfMango = (p: V3) => Math.hypot(p.x - mangoPos.x, p.y - mangoPos.y) > 0.5
  const woodPts: V3[] = []
  woodCurves.forEach((c) =>
    c.getSpacedPoints(Math.max(4, Math.round(c.getLength() / 0.035))).forEach((p) => {
      if (clearOfMango(p)) woodPts.push(p)
    }),
  )
  const leafPts: V3[] = []
  masses.forEach((m) => {
    for (let i = 0; i < (small ? 170 : 240); i++) {
      const th = rand() * Math.PI * 2
      const u = Math.sqrt(rand())
      const [ox, oy] = massR(m, th)
      const p = V(m.x + ox * u, m.y + oy * u, m.z + (rand() - 0.5) * 0.6)
      if (clearOfMango(p)) leafPts.push(p)
    }
  })

  const treeDay = new THREE.Group()
  treeDay.add(segs(lines, M.ink2), segs(hatchPairs, M.hatch))
  scene.add(treeDay)
  dayOnly.push(treeDay)
  const treeNight = new THREE.Group()
  treeNight.add(makePoints(woodPts, 3.5, 0.5), makePoints(leafPts, 3.5, 0.3))
  scene.add(treeNight)
  nightOnly.push(treeNight)

  // ---- Water: a waterline and dashed strokes, moving with the tide ----
  let tide = dark ? TIDE.dark : TIDE.light
  const water = new THREE.Group()
  const waterlineMat = lmat('mangrove', 2)
  water.add(segs([-40, 0, 0, 40, 0, 0], waterlineMat))
  const waterDash: number[] = []
  for (let i = 1; i <= 6; i++) {
    const y = -i * 0.16
    waterDash.push(...dashPairs(V(-40, y, 0), V(40, y, 0), 0.5 + i * 0.12, 0.22 + i * 0.07, (i * 0.37) % 1))
  }
  const waterDashes = segs(waterDash, M.muted1)
  water.add(waterDashes)
  dayOnly.push(waterDashes)
  scene.add(water)
  // High-water mark: a fixed dotted line.
  scene.add(segs(dashPairs(V(-40, 1.25, -1), V(40, 1.25, -1), 0.05, 0.16), M.hatch))

  // Night: faint particles in the water.
  const wp: V3[] = []
  for (let i = 0; i < (small ? 260 : 520); i++) wp.push(V(-12 + rand() * 24, -rand() * 1.6, -2 + rand() * 4.5))
  const waterPoints = makePoints(wp, 2.5, 0.2)
  ;(waterPoints.material as THREE.PointsMaterial).opacity = 0.55
  water.add(waterPoints)
  nightOnly.push(waterPoints)

  // ---- Tide gauge, right of the trees; tick labels on its left ----
  const gx = treeRight + (small ? 1.5 : 1.8)
  const gaugeZ = 0.8
  const gTop = 3.5
  const gaugeLines = [
    gx - 0.09, GAUGE_ZERO, gaugeZ, gx + 0.09, GAUGE_ZERO, gaugeZ,
    gx + 0.09, GAUGE_ZERO, gaugeZ, gx + 0.09, gTop, gaugeZ,
    gx + 0.09, gTop, gaugeZ, gx - 0.09, gTop, gaugeZ,
    gx - 0.09, gTop, gaugeZ, gx - 0.09, GAUGE_ZERO, gaugeZ,
  ]
  const gaugeTicks: number[] = []
  for (let i = 0; i <= 41; i++) {
    const y = GAUGE_ZERO + i * 0.1
    const w = i % 5 === 0 ? 0.12 : 0.06
    gaugeTicks.push(gx - 0.09, y, gaugeZ, gx - 0.09 + w, y, gaugeZ)
  }
  scene.add(segs(gaugeLines, M.ink2), segs(gaugeTicks, M.ink1))

  // Tide callout: a leader from the waterline at the gauge down-left.
  const tideCallout = segs([gx - 0.1, 0, gaugeZ, gx - 0.5, -0.95, gaugeZ, gx - 0.5, -0.95, gaugeZ, gx - 0.85, -0.95, gaugeZ], M.muted1)
  scene.add(tideCallout)

  // ---- DOM annotations, projected from 3D every frame ----
  type Align = 'left' | 'right' | 'center-above'
  interface Anno {
    el: HTMLElement
    getPos: () => V3
    align: Align
    minWidth: number
  }
  const annos: Anno[] = []
  const CALLOUT = 'absolute left-0 top-0 inline-flex items-center gap-1.5 whitespace-nowrap bg-ground/90 px-1 py-0.5 type-label text-ink-muted will-change-transform'
  const NUMBER = 'inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-ink-muted font-mono text-[11px] leading-4'
  function anno(className: string, getPos: () => V3, o: { align?: Align; minWidth?: number } = {}) {
    const el = document.createElement('div')
    el.className = className
    overlay.appendChild(el)
    const a = { el, getPos, align: o.align ?? 'left', minWidth: o.minWidth ?? 0 }
    annos.push(a)
    return a
  }
  function setCallout(el: HTMLElement, text: string, number?: number) {
    el.replaceChildren()
    if (number != null) {
      const n = document.createElement('span')
      n.className = NUMBER
      n.textContent = String(number)
      el.appendChild(n)
    }
    el.appendChild(document.createTextNode(text))
  }
  for (let i = 0; i <= 6; i++) {
    const y = GAUGE_ZERO + i * 0.5
    const a = anno('absolute left-0 top-0 whitespace-nowrap px-1 font-mono text-[11px] leading-[14px] text-ink-muted will-change-transform', () => V(gx - 0.2, y, gaugeZ), { align: 'right', minWidth: i % 2 ? 640 : 0 })
    a.el.textContent = (i * 0.5).toFixed(1)
  }
  const tideAnno = anno(CALLOUT, () => V(gx - 0.88, tide - 0.95, gaugeZ), { align: 'right', minWidth: 640 })

  // Dimensions and numbered callouts (the drawing's measurements).
  const dimLines: number[] = []
  const arrow = (p: V3, dx: number, dy: number) => {
    const s = 0.1
    dimLines.push(p.x, p.y, p.z, p.x + dx * s - dy * s * 0.5, p.y + dy * s + dx * s * 0.5, p.z)
    dimLines.push(p.x, p.y, p.z, p.x + dx * s + dy * s * 0.5, p.y + dy * s - dx * s * 0.5, p.z)
  }
  const xs = landings.map((a) => a.x)
  const spreadL = Math.min(...xs)
  const spreadR = Math.max(...xs)
  const dimY = -1.2
  dimLines.push(spreadL, dimY, 0.6, spreadR, dimY, 0.6)
  dimLines.push(spreadL, dimY - 0.08, 0.6, spreadL, -0.55, 0.6, spreadR, dimY - 0.08, 0.6, spreadR, -0.55, 0.6)
  arrow(V(spreadL, dimY, 0.6), 1, 0)
  arrow(V(spreadR, dimY, 0.6), -1, 0)
  const hx = treeRight + 0.35
  dimLines.push(hx, 0, 0, hx, canopyTop, 0, hx - 0.1, canopyTop, 0, hx + 0.1, canopyTop, 0, hx - 0.1, 0, 0, hx + 0.1, 0, 0)
  arrow(V(hx, canopyTop, 0), 0, -1)
  arrow(V(hx, 0, 0), 0, 1)
  // (1) Prop root: label on the left, leader down to a root.
  const rootLabelAt = V(treeLeft - 0.2, calloutRoot.y + 0.9, calloutRoot.z)
  dimLines.push(calloutRoot.x, calloutRoot.y, calloutRoot.z, rootLabelAt.x + 0.04, rootLabelAt.y - 0.04, rootLabelAt.z)
  // (2) Canopy: label above the trees, leader down to the right tree's top mass.
  const topMass = masses.filter((m) => m.tree === 1).sort((a, b) => b.y - a.y)[0]
  const canopyLabelAt = V(hx + 0.12, canopyTop + 0.15, 0.3)
  dimLines.push(topMass.x + topMass.R, topMass.y + topMass.R * 0.4, 0.3, canopyLabelAt.x - 0.04, canopyLabelAt.y - 0.04, 0.3)
  // Contact: a short leader from the mango out to a label clear of the leaves.
  const contactAt = V(mangoPos.x + 0.55, mangoPos.y + 0.05, 0.6)
  dimLines.push(mangoPos.x + 0.12, mangoPos.y, 0.6, contactAt.x - 0.04, contactAt.y, 0.6)
  const dims = segs(dimLines, M.muted1)
  scene.add(dims)

  const spreadAnno = anno(CALLOUT, () => V((spreadL + spreadR) / 2, dimY + 0.08, 0.6), { align: 'center-above', minWidth: 640 })
  const heightAnno = anno(`${CALLOUT} [writing-mode:vertical-rl]`, () => V(hx + 0.08, canopyTop / 2, 0), { minWidth: 640 })
  const rootAnno = anno(CALLOUT, () => rootLabelAt, { align: 'right', minWidth: 640 })
  const canopyAnno = anno(CALLOUT, () => canopyLabelAt, { minWidth: 640 })
  const contactAnno = anno(CALLOUT.replace('text-ink-muted', 'text-ink'), () => contactAt, { minWidth: 640 })
  function writeLabels() {
    setCallout(spreadAnno.el, labels.rootSpread.replace('{value}', (spreadR - spreadL).toFixed(1)))
    setCallout(heightAnno.el, labels.height.replace('{value}', canopyTop.toFixed(1)))
    setCallout(rootAnno.el, labels.propRoot, 1)
    setCallout(canopyAnno.el, labels.canopy, 2)
    setCallout(contactAnno.el, labels.contact)
    tideShown = ''
  }

  // ---- Proof seeds, between the trees and the gauge ----
  const leafPairs = (s: number) => {
    const l: number[] = []
    for (const side of [-1, 1]) {
      const pts: V3[] = []
      for (let i = 0; i <= 10; i++) {
        const t = i / 10
        pts.push(V(side * t * 0.22 * s, Math.sin(t * Math.PI) * 0.06 * s + t * 0.08 * s, 0))
      }
      for (let i = 10; i >= 0; i--) {
        const t = i / 10
        pts.push(V(side * t * 0.22 * s, -Math.sin(t * Math.PI) * 0.03 * s + t * 0.08 * s, 0))
      }
      l.push(...polyPairs(pts))
    }
    return l
  }
  const ringPairs = (r: number) => {
    const pts: V3[] = []
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2
      pts.push(V(Math.cos(a) * r, 0, Math.sin(a) * r))
    }
    return polyPairs(pts, true)
  }
  const propagule = [0, 0.02, 0, 0.07, 0.34, 0]
  const proofX = small ? [gx - 1.3, gx - 0.85, gx - 0.4] : [gx - 1.5, gx - 1.0, gx - 0.5]
  const proofZ = [2.6, 2.3, 2.7]
  const proofs = opts.results.slice(0, 3).map((def, i) => {
    const g = new THREE.Group()
    g.position.set(proofX[i], 0, proofZ[i])
    const ring = segs(ringPairs(0.22), M.mangrove2)
    const seed = segs(propagule, M.ink2)
    const stem = segs([0, 0, 0, 0, 1, 0], M.mangrove2)
    stem.scale.y = 0.001
    const tip = segs(leafPairs(1), M.mangrove1)
    tip.scale.setScalar(0.001)
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.36, 8, 6), new THREE.MeshBasicMaterial())
    hit.visible = false
    hit.userData.proof = i
    g.add(ring, seed, stem, tip, hit)
    scene.add(g)
    // Dimension line from the shoot tip across to a mark on the gauge.
    const leader = new THREE.Group()
    const dashPos = dashPairs(V(proofX[i] + 0.05, 0, proofZ[i]), V(gx - 0.1, 0, gaugeZ), 0.07, 0.06)
    const dashes = segs(dashPos, M.mangrove1)
    const mark = segs([gx - 0.16, 0, gaugeZ, gx + 0.16, 0, gaugeZ], M.mangrove2)
    leader.add(dashes, mark)
    scene.add(leader)
    // Every result starts grown (the poster already showed it); t runs 0 → 1
    // again on a replay.
    return { height: def.height, group: g, ring, stem, tip, hit, leader, dashes, mark, dashCount: dashPos.length / 6, t: 1 }
  })
  const seedHits = proofs.map((p) => p.hit)

  // Leaders from each lane label to its mark on the gauge.
  const svgNS = 'http://www.w3.org/2000/svg'
  const leaderSvg = document.createElementNS(svgNS, 'svg')
  leaderSvg.setAttribute('class', 'pointer-events-none absolute inset-0 size-full overflow-visible')
  overlay.appendChild(leaderSvg)
  const leaderPaths = proofs.map(() => {
    const p = document.createElementNS(svgNS, 'polyline')
    p.setAttribute('class', 'fill-none stroke-mangrove [stroke-dasharray:3_3]')
    p.setAttribute('stroke-width', '1')
    leaderSvg.appendChild(p)
    return p
  })

  // Reduced motion: the result is already drawn; nothing replays.
  function replayProof(i: number) {
    const p = proofs[i]
    if (!p || reducedMotion) return
    p.t = 0
    wake()
  }
  // The shoot grows over the first 60% of t, the dimension line runs to the
  // gauge over the rest.
  const growOf = (t: number) => easeOut(clamp01(t / 0.6))
  const drawOf = (t: number) => easeOut(clamp01((t - 0.5) / 0.5))

  // ---- Visitor roots: grow from the nearest trunk or root to the click ----
  const CAP = small ? 10 : 24
  interface UserRoot {
    x: number
    z: number
    group: THREE.Group
    seed: LineSegments2
    line: LineSegments2 | null
    pts: THREE.Points | null
    attach: V3[]
    t: number
  }
  const userRoots: UserRoot[] = []

  function nearestAttach(x: number, z: number) {
    let best: V3 | null = null
    let bestD = Infinity
    const consider = (p: V3) => {
      const d = Math.hypot(p.x - x, p.z - z) + Math.max(0, p.y - 1.5) * 0.3
      if (d > 0.35 && d < bestD) {
        bestD = d
        best = p
      }
    }
    attach.forEach(consider)
    userRoots.forEach((r) => r.attach.forEach(consider))
    return best as V3 | null
  }

  function plant(x: number, z: number, animate: boolean, save = true) {
    if (userRoots.length >= CAP) removeRoot(userRoots.shift()!)
    const from = nearestAttach(x, z)
    const g = new THREE.Group()
    const seed = segs(propagule, M.ink2)
    seed.position.set(x, tide, z)
    g.add(seed)
    let line: LineSegments2 | null = null
    let pts: THREE.Points | null = null
    const own: V3[] = []
    if (from) {
      const curve = rootCurve(from.clone(), V(x, ROOT_FLOOR, z), 0.12)
      line = segs(doubleStroke(curve, 32, 0.04 * Math.sign(x - from.x || 1)), M.ink2)
      pts = makePoints(curve.getSpacedPoints(Math.max(8, Math.round(curve.getLength() / 0.035))), 3.5, 0.5)
      g.add(line, pts)
      ;[0.3, 0.5].forEach((t) => own.push(curve.getPoint(t)))
    }
    scene.add(g)
    const root: UserRoot = { x, z, group: g, seed, line, pts, attach: own, t: animate && !reducedMotion ? 0 : 1 }
    userRoots.push(root)
    applyTheme(false)
    applyRootProgress(root)
    if (animate) ripple(x, z)
    if (save) saveRoots()
    wake()
  }

  function applyRootProgress(r: UserRoot) {
    const drop = clamp01(r.t / 0.3)
    const grow = easeOut(clamp01((r.t - 0.3) / 0.7))
    r.seed.position.y = tide + (1 - easeIn(drop)) * 2.2
    r.seed.visible = grow < 1
    if (r.line) (r.line.geometry as LineSegmentsGeometry).instanceCount = Math.ceil(64 * grow)
    if (r.pts) r.pts.geometry.setDrawRange(0, Math.ceil(r.pts.geometry.attributes.position.count * grow))
  }

  function disposeObject(o: THREE.Object3D) {
    o.traverse((child) => {
      const mesh = child as THREE.Mesh
      mesh.geometry?.dispose()
    })
  }
  function removeRoot(r: UserRoot) {
    scene.remove(r.group)
    if (r.pts) {
      const idx = pointSets.findIndex((s) => s.points === r.pts)
      if (idx >= 0) pointSets.splice(idx, 1)
      ;(r.pts.material as THREE.Material).dispose()
    }
    disposeObject(r.group)
  }
  function saveRoots() {
    opts.writeStore(opts.storageKey, JSON.stringify(userRoots.map((r) => [+r.x.toFixed(2), +r.z.toFixed(2)])))
  }
  function reset() {
    userRoots.splice(0).forEach(removeRoot)
    opts.writeStore(opts.storageKey, null)
    wake()
  }

  // ---- Ripple rings, drawn as lines ----
  const ripples = Array.from({ length: 6 }, () => {
    const mat = new LineMaterial({ color: 0xffffff, linewidth: 1.2, transparent: true, opacity: 0, depthWrite: false })
    lineMats.push(mat)
    const ring = segs(ringPairs(1), mat)
    ring.visible = false
    scene.add(ring)
    return { ring, mat, t: 1 }
  })
  let rippleNext = 0
  function ripple(x: number, z: number) {
    if (reducedMotion) return
    const r = ripples[rippleNext]
    rippleNext = (rippleNext + 1) % ripples.length
    r.t = 0
    r.ring.position.set(x, tide, z)
    r.ring.visible = true
  }

  // ---- Theme ----
  function applyTheme(full = true) {
    dark = opts.isDark()
    const colors = { ink: css('ink'), muted: css('ink-muted'), mangrove: css('mangrove') }
    for (const role of Object.keys(roleMats) as Array<keyof typeof roleMats>) roleMats[role].forEach((m) => m.color.set(colors[role]))
    ripples.forEach((r) => r.mat.color.set(dark ? colors.mangrove : colors.muted))
    mangoMat.color.set(css('mango'))
    mango.scale.set(1, 1.28, 0.6).multiplyScalar(dark ? 1.3 : 1)
    if (dark && full) {
      readColors()
      pointSets.forEach(colorPoints)
    }
    dayOnly.forEach((o) => (o.visible = !dark))
    nightOnly.forEach((o) => (o.visible = dark))
    userRoots.forEach((r) => {
      if (r.line) r.line.visible = !dark
      if (r.pts) r.pts.visible = dark
    })
    if (full) wake()
  }

  // ---- Camera framing and scroll ----
  // The drawing is fitted into a band of the box. From 900px the band leaves
  // a strip on the right for the results lane.
  const band = { x0: 0.03, x1: 0.97, y0: 0.04, y1: 0.96 }
  // The box size, measured on resize only (reading it per frame forces layout).
  const size = { w: 0, h: 0 }
  const drawing = { x0: 0, x1: 0, y0: 0, y1: 0 }
  const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
  const camPos = V(0, 0, 0)
  const camLook = V(0, 0, 0)
  const targetPos = V(0, 0, 0)
  const targetLook = V(0, 0, 0)
  let scrollP = 0
  const laneOn = () => window.innerWidth >= LANE_MIN_WIDTH && proofs.length > 0
  // Each label's left-middle in box pixels, measured on resize only.
  let laneAnchors: Array<{ x: number; y: number } | null> = []
  function measureLane() {
    const box = container.getBoundingClientRect()
    laneAnchors = opts.lane().map((el) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: r.left - box.left, y: r.top - box.top + r.height / 2 }
    })
  }

  function measureBand() {
    const w = container.clientWidth
    const annotated = w >= 640
    // Room on the left for the "1 Prop root" callout.
    drawing.x0 = treeLeft - (annotated ? 1.6 : 0.15)
    drawing.x1 = gx + 0.3
    drawing.y0 = annotated ? -1.45 : -0.9
    drawing.y1 = canopyTop + (annotated ? 0.45 : 0.15)
    band.x0 = annotated ? 0.03 : 0.02
    const laneX = laneOn() ? Math.min(...laneAnchors.map((a) => a?.x ?? w)) : w
    band.x1 = laneOn() && laneX < w ? Math.max(0.4, (laneX - LANE_GAP) / w) : 0.97
    band.y0 = 0.04
    band.y1 = 0.96
  }

  function frameTargets() {
    const a = camera.aspect
    const s = reducedMotion ? 0 : scrollP
    const Hh = Math.max(
      (drawing.y1 - drawing.y0) / (2 * (band.y1 - band.y0)),
      (drawing.x1 - drawing.x0) / (2 * a * (band.x1 - band.x0)),
    )
    const dist = Hh / tanHalf
    const lookX = (drawing.x0 + drawing.x1) / 2 - ((band.x0 + band.x1) / 2 - 0.5) * 2 * Hh * a
    const lookY = (drawing.y0 + drawing.y1) / 2 + ((band.y0 + band.y1) / 2 - 0.5) * 2 * Hh
    targetPos.set(lookX, lookY + 0.6 - s * 1.6, dist - s * 1.5)
    targetLook.set(lookX, lookY - s * 1.4, 0)
  }

  listen(window, 'scroll', () => {
    scrollP = clamp01(window.scrollY / Math.max(1, hero.offsetHeight))
    wake()
  }, { passive: true })

  function resize() {
    const w = container.clientWidth
    const h = container.clientHeight
    if (!w || !h) return
    size.w = w
    size.h = h
    renderer.setSize(w, h, false)
    lineMats.forEach((m) => m.resolution.set(w, h))
    growHeight = w < 900 ? 1.6 : 2.2
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    measureLane()
    measureBand()
    frameTargets()
    camPos.copy(targetPos)
    camLook.copy(targetLook)
    wake()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(container)
  cleanups.push(() => ro.disconnect())

  // ---- Pointer ----
  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  const hitPoint = V(0, 0, 0)
  const waterPlane = new THREE.Plane(V(0, 1, 0), 0)
  const lastRipple = V(1e3, 0, 1e3)
  let lastRippleAt = 0

  function setNdc(e: PointerEvent | MouseEvent) {
    const r = canvas.getBoundingClientRect()
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    raycaster.setFromCamera(ndc, camera)
  }
  const pickInteractive = () => raycaster.intersectObjects([mangoHit, ...seedHits], false)[0]?.object ?? null
  const inWater = (p: V3) => p.x > treeLeft - 4 && p.x < gx + 2 && p.z > -4 && p.z < 7

  const onPointerMove = (e: PointerEvent) => {
    setNdc(e)
    canvas.style.cursor = pickInteractive() ? 'pointer' : 'crosshair'
    if (raycaster.ray.intersectPlane(waterPlane, hitPoint) && inWater(hitPoint)) {
      const now = performance.now()
      if (now - lastRippleAt > 160 && hitPoint.distanceTo(lastRipple) > 0.5) {
        lastRippleAt = now
        lastRipple.copy(hitPoint)
        ripple(hitPoint.x, hitPoint.z)
        wake()
      }
    }
  }
  const onClick = (e: MouseEvent) => {
    setNdc(e)
    const obj = pickInteractive()
    if (obj === mangoHit) {
      opts.onMango()
      return
    }
    if (obj && obj.userData.proof !== undefined) {
      replayProof(obj.userData.proof as number)
      return
    }
    if (raycaster.ray.intersectPlane(waterPlane, hitPoint) && inWater(hitPoint)) {
      plant(hitPoint.x, hitPoint.z, true)
      opts.onPlant()
    }
  }
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('click', onClick)

  // ---- DOM placement ----
  const v3 = V(0, 0, 0)
  function project(p: V3, w: number, h: number) {
    v3.copy(p).project(camera)
    return { x: ((v3.x + 1) / 2) * w, y: ((1 - v3.y) / 2) * h, ok: v3.z < 1 && Math.abs(v3.x) < 1.15 && Math.abs(v3.y) < 1.15 }
  }
  let tideShown = ''
  // DOM writes only when a value changed: rewriting every label each frame
  // costs a style and layout pass per frame.
  const written = new WeakMap<Element, string>()
  function write(el: Element, key: 'transform' | 'points', value: string) {
    const prev = written.get(el)
    const next = `${key}:${value}`
    if (prev === next) return
    written.set(el, next)
    if (key === 'transform') (el as HTMLElement).style.transform = value
    else el.setAttribute('points', value)
  }
  function placeLabels() {
    const w = size.w
    const h = size.h
    const tideText = labels.tide.replace('{value}', fmtSigned(tide - GAUGE_ZERO))
    if (tideText !== tideShown) {
      tideAnno.el.textContent = tideText
      tideShown = tideText
    }
    for (const a of annos) {
      const p = project(a.getPos(), w, h)
      const show = p.ok && w >= a.minWidth
      if (!show) {
        a.el.hidden = true
        written.delete(a.el)
        continue
      }
      a.el.hidden = false
      const shift = a.align === 'right' ? 'translate(-100%, -50%)' : a.align === 'center-above' ? 'translate(-50%, -100%)' : 'translate(0, -50%)'
      write(a.el, 'transform', `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) ${shift}`)
    }
    dims.visible = w >= 640
    tideCallout.visible = w >= 640

    // The lane: a leader from each label (placed by React) to its mark on
    // the gauge, once the mark has landed.
    const lane = laneOn()
    leaderSvg.style.display = lane ? '' : 'none'
    if (!lane) return
    proofs.forEach((pr, i) => {
      const a = laneAnchors[i]
      const height = pr.height * growHeight * growOf(pr.t)
      const mark = project(V(gx + 0.16, tide + height, gaugeZ), w, h)
      write(
        leaderPaths[i],
        'points',
        a && pr.t >= 1 ? `${(a.x - 2).toFixed(1)},${a.y.toFixed(1)} ${(a.x - 10).toFixed(1)},${a.y.toFixed(1)} ${(mark.x + 2).toFixed(1)},${mark.y.toFixed(1)}` : '',
      )
    })
  }

  // ---- Frame update. dt is 0 under reduced motion: everything snaps to its
  // target. Returns true while something still moves; the loop stops when
  // the drawing settles, so an idle hero costs no main-thread time. ----
  function update(dt: number) {
    let busy = false
    const k = reducedMotion ? 1 : 1 - Math.exp(-dt * 4)
    frameTargets()
    camPos.lerp(targetPos, k)
    camLook.lerp(targetLook, k)
    camera.position.copy(camPos)
    camera.lookAt(camLook)
    if (camPos.distanceToSquared(targetPos) > 1e-5 || camLook.distanceToSquared(targetLook) > 1e-5) busy = true

    const tideTarget = (dark ? TIDE.dark : TIDE.light) - (reducedMotion ? 0 : scrollP * 0.7)
    tide += (tideTarget - tide) * k
    if (Math.abs(tideTarget - tide) > 1e-3) busy = true
    water.position.y = tide
    waterPlane.constant = -tide
    tideCallout.position.y = tide

    proofs.forEach((p) => {
      p.group.position.y = tide
      if (p.t < 1) {
        p.t = reducedMotion ? 1 : Math.min(1, p.t + dt / 1.4)
        busy = true
      }
      const grow = growOf(p.t)
      const draw = drawOf(p.t)
      const hgt = p.height * growHeight * grow
      p.stem.scale.y = Math.max(0.001, hgt)
      p.tip.position.y = hgt
      p.tip.scale.setScalar(Math.max(0.001, grow))
      // The dashes draw from the shoot toward the gauge; the mark lands last.
      ;(p.dashes.geometry as LineSegmentsGeometry).instanceCount = Math.ceil(p.dashCount * draw)
      p.mark.visible = draw >= 1
      p.leader.visible = draw > 0
      p.leader.position.y = tide + hgt
    })

    for (const r of userRoots) {
      if (r.t < 1) {
        r.t = Math.min(1, r.t + dt / 1.2)
        busy = true
      }
      applyRootProgress(r)
    }

    for (const r of ripples) {
      if (r.t >= 1) {
        r.ring.visible = false
        continue
      }
      r.t = Math.min(1, r.t + dt / 1.4)
      busy = true
      r.ring.scale.setScalar(0.05 + easeOut(r.t) * 1.3)
      r.ring.position.y = tide
      r.mat.opacity = 0.8 * (1 - r.t)
    }
    return busy
  }

  // ---- Idle motion: drifting water, a shimmering waterline, pulsing
  // unclicked seeds and twinkling night points. Off under reduced motion. ----
  function applyIdle(t: number) {
    idleUniforms.uTime.value = t
    waterDashes.position.x = Math.sin(t * 0.22) * 0.3
    waterlineMat.opacity = 0.82 + 0.18 * Math.sin(t * 1.3)
    proofs.forEach((p, i) => p.ring.scale.setScalar(1 + 0.08 * Math.sin(t * 2.2 + i * 1.3)))
    halo.material.opacity = 0.45 + 0.08 * Math.sin(t * 1.2)
  }

  // ---- Render loop: only while the hero is on screen and the tab visible.
  // Changes render at full rate; idle motion at ~30 fps, and only if the
  // device has headroom. ----
  const IDLE_STEP = 1 / 30
  let heroVisible = true
  let raf = 0
  let last = 0
  let busy = true
  let idleReady = false
  let idleDropped = false
  let idleClock = 0
  let idleAcc = 0
  let destroyed = false
  const probe = { time: 0, frames: 0 }
  const running = () => heroVisible && !document.hidden && !destroyed
  const idleOn = () => idleReady && !idleDropped && !reducedMotion

  // Idle-only frames (shimmer, drifting water) move nothing the labels
  // follow, so they skip the DOM entirely.
  function draw(labelsToo = true) {
    renderer.render(scene, camera)
    if (labelsToo) placeLabels()
    if (!shownOnce) {
      shownOnce = true
      canvas.classList.remove('opacity-0')
    }
  }
  let shownOnce = false

  const frameCosts: number[] = []
  function measureFrame(cost: number) {
    if (frameCosts.length >= 5) return
    frameCosts.push(cost)
    if (frameCosts.length >= 3) {
      const sorted = [...frameCosts].sort((a, b) => a - b)
      if (sorted[Math.floor(sorted.length / 2)] > 6) idleDropped = true
    }
  }

  function loop(now: number) {
    raf = 0
    if (!running()) return
    const t0 = performance.now()
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0
    last = now
    if (idleOn()) {
      idleClock += dt
      if (probe.time < 1 && dt > 0) {
        probe.time += dt
        probe.frames += 1
        if (probe.time >= 1 && probe.time / probe.frames > 0.024) idleDropped = true
      }
    }
    if (busy) {
      busy = update(dt)
      if (idleOn()) applyIdle(idleClock)
      draw()
      idleAcc = 0
    } else if (idleOn()) {
      idleAcc += dt
      if (idleAcc >= IDLE_STEP) {
        idleAcc %= IDLE_STEP
        applyIdle(idleClock)
        draw(false)
      }
    }
    measureFrame(performance.now() - t0)
    if (busy || idleOn()) raf = requestAnimationFrame(loop)
  }

  function wake() {
    busy = true
    if (raf || destroyed) return
    if (reducedMotion) {
      raf = requestAnimationFrame(() => {
        raf = 0
        update(0)
        draw()
      })
      return
    }
    if (!running()) return
    last = 0
    raf = requestAnimationFrame(loop)
  }

  // Idle motion starts once the visitor engages (pointer over the hero, a
  // touch, a key or a scroll), then waits for an idle moment. Until then the
  // drawing is still and costs nothing after its first frame, which keeps
  // the page's load (and its blocking time on slow phones) clean.
  let idleHandle = 0
  function startIdle() {
    if (reducedMotion) return
    const idle = (cb: () => void) =>
      'requestIdleCallback' in window ? window.requestIdleCallback(cb, { timeout: 3000 }) : (setTimeout(cb, 300) as unknown as number)
    const engage = () => {
      stopListening()
      idleHandle = idle(() => {
        idleReady = true
        wake()
      })
    }
    const events = ['pointerover', 'touchstart', 'keydown', 'scroll'] as const
    const stopListening = () => events.forEach((type) => (type === 'pointerover' ? hero : window).removeEventListener(type, engage))
    events.forEach((type) => (type === 'pointerover' ? hero : window).addEventListener(type, engage, { passive: true }))
    cleanups.push(stopListening)
  }

  const io = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting
    if (heroVisible) wake()
  })
  io.observe(hero)
  cleanups.push(() => io.disconnect())
  const onVisibility = () => {
    if (!document.hidden) wake()
  }
  document.addEventListener('visibilitychange', onVisibility)
  cleanups.push(() => document.removeEventListener('visibilitychange', onVisibility))

  writeLabels()
  applyTheme(false)
  if (dark) {
    readColors()
    pointSets.forEach(colorPoints)
  }

  // Restore the visitor's garden from a previous visit.
  try {
    const saved: unknown = JSON.parse(opts.readStore(opts.storageKey) || '[]')
    if (Array.isArray(saved)) {
      saved.slice(-CAP).forEach((pair) => {
        if (Array.isArray(pair) && pair.length === 2) plant(Number(pair[0]), Number(pair[1]), false, false)
      })
    }
  } catch {
    // Corrupt or blocked storage: start with an empty garden.
  }

  resize()
  wake()
  startIdle()

  function destroy() {
    destroyed = true
    if (raf) cancelAnimationFrame(raf)
    if (idleHandle && 'cancelIdleCallback' in window) window.cancelIdleCallback(idleHandle)
    cleanups.forEach((fn) => fn())
    canvas.removeEventListener('pointermove', onPointerMove)
    canvas.removeEventListener('click', onClick)
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      mesh.geometry?.dispose()
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
      else mat?.dispose()
    })
    dot.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
    canvas.remove()
    annos.forEach((a) => a.el.remove())
    leaderSvg.remove()
  }

  return {
    replayProof,
    reset,
    setTheme: () => applyTheme(true),
    setLabels(next) {
      labels = next
      writeLabels()
      wake()
    },
    destroy,
  }
}
