import { useTranslation } from '#/i18n/useTranslation'

// The poster: the Figma "Hero drawing" (19:1096, Idle, 1440 frame) as one
// inline SVG. It is server-rendered, shown until the 3D scene is ready and
// kept when WebGL is missing. Colors come from the tokens, so it follows the
// theme by itself: line art by day; by night the same strokes become dotted
// "points" in mangrove and the mango gets its halo.
//
// Coordinates are the Figma drawing's (827.2 × 451.2). Each part keeps its
// Figma offset; flipped prop roots mirror around their own box.

const W = 827.2
const H = 451.2

const ROOT_LONG = 'M1.88 1.88C31.96 20.68 90.24 48.88 110.92 148.52M83.66 76.14C90.24 101.52 90.24 127.84 84.6 148.52'
const ROOT_SHORT = 'M1.88 1.88C11.28 15.04 24.44 37.6 31.96 92.12'
const ROOT_MID = 'M1.88 1.88C24.44 18.8 52.64 37.6 67.68 120.32'

const CANOPY_A = {
  stroke:
    'M13.63 40.42C8.61667 37.412 6.486 34.592 7.238 31.96C7.99 29.2027 11.468 27.0407 17.672 25.474C17.4213 22.278 20.21 20.2413 26.038 19.364C25.85 15.228 28.388 12.8153 33.652 12.126C36.5347 9.306 41.1407 8.33467 47.47 9.212C51.1673 6.64267 55.8987 6.32933 61.664 8.272C66.4893 4.44933 71.2833 3.76 76.046 6.204C81.874 4.57467 86.6993 5.23267 90.522 8.178C96.0367 8.11533 100.079 9.682 102.648 12.878C108.601 13.254 112.518 14.8833 114.398 17.766C119.474 19.1447 122.106 21.432 122.294 24.628C126.931 26.6333 129.187 29.1087 129.062 32.054C131.255 34.6233 130.159 37.412 125.772 40.42C128.341 43.24 128.153 45.8407 125.208 48.222C127.401 50.29 126.618 51.8253 122.858 52.828C123.171 55.5227 120.351 57.2773 114.398 58.092C111.515 59.7213 106.753 60.4733 100.11 60.348C98.6687 63.544 95.3787 65.2047 90.24 65.33C86.7933 67.962 81.968 68.1813 75.764 65.988C70.8133 69.3093 65.894 69.9047 61.006 67.774C54.9273 69.3407 50.102 68.6827 46.53 65.8C41.5793 65.4867 38.3207 63.732 36.754 60.536C29.61 60.9747 25.38 60.0033 24.064 57.622C18.236 56.7447 14.4133 55.272 12.596 53.204C9.024 52.1387 7.92733 50.6033 9.306 48.598C8.24067 46.0287 9.682 43.3027 13.63 40.42Z',
  hatch:
    'M78.584 54.144C81.216 55.7107 83.9107 55.7733 86.668 54.332C83.9733 52.7653 81.2787 52.7027 78.584 54.144ZM62.886 33.464C66.2073 34.3413 69.2153 33.746 71.91 31.678C68.5887 30.8007 65.5807 31.396 62.886 33.464ZM58.468 41.454C61.0373 43.3967 63.826 43.8353 66.834 42.77C64.2647 40.8273 61.476 40.3887 58.468 41.454ZM93.154 39.01C95.2847 41.9553 98.1673 43.5847 101.802 43.898C99.6713 40.9527 96.7887 39.3233 93.154 39.01ZM76.704 40.984C80.088 42.488 83.472 42.488 86.856 40.984C83.472 39.48 80.088 39.48 76.704 40.984Z',
}
const CANOPY_B = {
  stroke:
    'M11.656 35.72C8.02133 32.6493 6.89333 29.8293 8.272 27.26C7.332 23.8133 9.024 21.15 13.348 19.27C14.0373 15.886 17.4527 13.9433 23.594 13.442C26.2887 11.1233 30.4873 10.2147 36.19 10.716C38.6967 6.392 42.582 5.076 47.846 6.768C52.4207 3.196 56.9953 2.632 61.57 5.076C66.646 4.136 70.4687 5.922 73.038 10.434C78.8033 9.74467 82.3753 11.1547 83.754 14.664C89.206 15.3533 92.7153 17.0767 94.282 19.834C96.7887 22.0273 97.3527 24.7847 95.974 28.106C101.238 30.4247 103.807 32.9627 103.682 35.72C105.374 38.728 103.682 41.4227 98.606 43.804C99.922 45.9347 98.6687 47.4387 94.846 48.316C93.906 50.6973 89.9893 51.8567 83.096 51.794C81.5293 54.3007 78.0513 55.366 72.662 54.99C70.3433 58.3113 66.364 58.844 60.724 56.588C56.588 59.8467 52.4207 59.9407 48.222 56.87C42.8327 58.6873 38.9473 57.998 36.566 54.802C30.8007 55.366 26.8213 54.5827 24.628 52.452C18.424 52.2013 14.8833 50.854 14.006 48.41C10.6847 47.4073 9.55667 45.8407 10.622 43.71C7.86467 41.3287 8.20933 38.6653 11.656 35.72Z',
  hatch:
    'M63.262 36.472C66.7713 36.848 69.8107 35.814 72.38 33.37C68.8707 32.994 65.8313 34.028 63.262 36.472ZM65.424 26.132C68.3693 26.0693 70.5 24.722 71.816 22.09C68.8707 22.1527 66.74 23.5 65.424 26.132ZM78.208 43.522C81.216 45.214 84.318 45.402 87.514 44.086C84.506 42.394 81.404 42.206 78.208 43.522ZM40.89 45.778C44.1487 45.4647 46.5613 43.9293 48.128 41.172C44.932 41.4227 42.5193 42.958 40.89 45.778Z',
}
const CANOPY_C = {
  stroke:
    'M10.246 29.14C7.426 26.2573 7.52 23.7193 10.528 21.526C9.588 18.0793 10.81 15.416 14.194 13.536C15.9487 10.716 20.1473 9.71333 26.79 10.528C28.9833 6.64267 32.618 5.29533 37.694 6.486C41.8927 4.29267 46.0913 4.7 50.29 7.708C55.93 5.70267 60.066 6.23533 62.698 9.306C68.4007 9.18067 71.4713 10.998 71.91 14.758C76.422 16.1367 78.5213 18.3613 78.208 21.432C81.78 23.8133 83.3153 26.3827 82.814 29.14C84.506 31.4587 83.4093 33.5267 79.524 35.344C79.524 37.6627 76.61 39.198 70.782 39.95C69.842 42.5193 67.022 43.9607 62.322 44.274C59.5647 46.4047 55.5227 46.8747 50.196 45.684C45.9347 48.4413 41.7047 48.974 37.506 47.282C31.9287 48.6607 28.0433 47.7207 25.85 44.462C20.7113 44.3367 17.954 42.8327 17.578 39.95C13.066 38.9473 10.8727 37.2867 10.998 34.968C7.614 33.276 7.36333 31.3333 10.246 29.14Z',
  hatch:
    'M58.844 39.856C60.912 42.0493 63.3873 42.8013 66.27 42.112C64.202 39.9187 61.7267 39.1667 58.844 39.856ZM30.644 27.354C33.1507 30.362 36.3153 32.054 40.138 32.43C37.694 29.422 34.5293 27.73 30.644 27.354ZM44.18 26.79C45.9347 29.3593 48.3787 30.644 51.512 30.644C49.7573 28.012 47.3133 26.7273 44.18 26.79ZM63.638 26.884C67.3353 27.3227 70.6567 26.32 73.602 23.876C69.842 23.4373 66.5207 24.44 63.638 26.884Z',
}

const TRUNK_1 = {
  stroke:
    'M25.38 38.3051C23.5 94.7051 22.56 141.705 21.62 188.705M31.02 38.3051C31.96 94.7051 33.84 141.705 34.78 188.705M26.32 40.1851C20.68 24.2051 13.16 11.9851 5.64 0.705075M30.08 40.1851C35.72 27.0251 43.24 13.8651 52.64 2.58507M28.2 38.3051V4.46507',
  hatch: 'M26.32 113.505C28.2 111.625 30.08 111.625 31.96 113.505M25.38 151.105C27.26 149.225 30.08 149.225 32.9 151.105',
}
const TRUNK_2 = {
  stroke:
    'M21.573 32.5593C19.975 80.4993 19.176 120.449 18.377 160.399M26.367 32.5593C27.166 80.4993 28.764 120.449 29.563 160.399M22.372 34.1573C17.578 20.5743 11.186 10.1873 4.794 0.599314M25.568 34.1573C30.362 22.9713 36.754 11.7853 44.744 2.19731M23.97 32.5593V3.79531',
  hatch: 'M22.372 96.4793C23.97 94.8813 25.568 94.8813 27.166 96.4793M21.573 128.439C23.171 126.841 25.568 126.841 27.965 128.439',
}

const WATER_MARKS =
  'M0.705 0.705H11.0854M48.4548 0.705H67.1395M96.2046 0.705H112.813M143.954 0.705H155.373M191.704 0.705H217.655M239.454 0.705H257.101M287.204 0.705H306.927M334.954 0.705H353.638M382.703 0.705H402.426M430.453 0.705H446.024M478.203 0.705H492.736M525.953 0.705H549.828M573.703 0.705H587.197M621.452 0.705H639.099M669.202 0.705H691.001M716.952 0.705H742.903M764.702 0.705H782.348M18.3517 10.105H30.8081M75.4438 10.105H89.9764M132.536 10.105H156.411M189.628 10.105H211.427M246.72 10.105H267.481M303.812 10.105H323.535M360.905 10.105H375.437M417.997 10.105H434.605M475.089 10.105H500.002M532.181 10.105H542.561M589.273 10.105H602.768M646.365 10.105H667.126M703.458 10.105H727.332M760.55 10.105H770.93M35.9983 19.505H53.645M102.433 19.505H129.422M168.867 19.505H188.59M235.302 19.505H247.758M301.736 19.505H323.535M368.171 19.505H396.198M434.605 19.505H451.214M501.04 19.505H528.029M567.474 19.505H577.855M633.909 19.505H657.784M700.343 19.505H726.294M766.778 19.505H794.805'

const TICKS =
  'M0.3525 180.832H7.8725M0.3525 165.793H4.1125M0.3525 150.752H7.8725M0.3525 135.713H4.1125M0.3525 120.672H7.8725M0.3525 105.632H4.1125M0.3525 90.5925H7.8725M0.3525 75.5525H4.1125M0.3525 60.5125H7.8725M0.3525 45.4725H4.1125M0.3525 30.4325H7.8725M0.3525 15.3925H4.1125M0.3525 0.3525H7.8725'

// Ink strokes: line art by day, dotted mangrove "points" by night.
const DRAW =
  'fill-none stroke-ink [stroke-width:1.41] [stroke-linejoin:round] [stroke-linecap:round] dark:stroke-mangrove dark:[stroke-dasharray:0_3.4] dark:[stroke-width:2.2]'
// Hatching and leaf marks: day only.
const HATCH = 'fill-none stroke-ink-muted [stroke-width:0.705] [stroke-linecap:round] dark:hidden'
// Dimension and leader lines, thin and muted in both themes.
const DIM = 'fill-none stroke-ink-muted [stroke-width:0.705] [stroke-linecap:round]'
const TEXT = 'fill-ink-muted font-mono font-medium uppercase [paint-order:stroke] stroke-ground [stroke-width:4px] [stroke-linejoin:round]'

function Root({ x, y, w, d, flip = false }: { x: number; y: number; w: number; d: string; flip?: boolean }) {
  return <path d={d} className={DRAW} transform={flip ? `translate(${x + w} ${y}) scale(-1 1)` : `translate(${x} ${y})`} />
}

function Canopy({ x, y, shape }: { x: number; y: number; shape: { stroke: string; hatch: string } }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={shape.stroke} className={DRAW} />
      <path d={shape.hatch} className={HATCH} />
    </g>
  )
}

function Seed({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 278.24)`}>
      <ellipse
        cx="18.8"
        cy="22.56"
        rx="15.04"
        ry="4.23"
        className="fill-none stroke-mangrove [stroke-width:1.41] dark:[stroke-dasharray:0_3.4] dark:[stroke-linecap:round] dark:[stroke-width:2.2]"
      />
      <path d="M18.8 22.56V11.28" className={DRAW} />
      <path d="M18.8 14.1C15.04 11.28 13.16 8.46 13.16 5.64" className={HATCH} />
    </g>
  )
}

function Callout({ x, y, label, number }: { x: number; y: number; label: string; number?: number }) {
  const textX = number != null ? x + 24.44 : x + 3.76
  return (
    <g>
      {number != null && (
        <>
          <circle cx={x + 11.28} cy={y + 9.4} r="7.05" className="fill-ground stroke-ink-muted [stroke-width:0.94]" />
          <text x={x + 11.28} y={y + 12.3} textAnchor="middle" fontSize="8.46" className="fill-ink-muted font-mono font-medium">
            {number}
          </text>
        </>
      )}
      <text x={textX} y={y + 13} fontSize="10.34" letterSpacing="0.62" className={TEXT}>
        {label}
      </text>
    </g>
  )
}

export function MangrovePoster({ className }: { className?: string }) {
  const { t } = useTranslation()
  const ticks = ['3.0', '2.5', '2.0', '1.5', '1.0', '0.5', '0.0']

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMinYMid meet"
      overflow="visible"
      className={className}
      data-testid="hero-poster"
    >
      <defs>
        <radialGradient id="mango-halo">
          <stop offset="0" stopColor="var(--mango)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--mango)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Waterline and water marks, running on past the sheet's right edge. */}
      <g transform="translate(0 298.2)">
        <path
          d="M0.705 0.705H3000"
          className="fill-none stroke-mangrove [stroke-width:1.41] [stroke-linecap:round] dark:[stroke-dasharray:0_3.4] dark:[stroke-width:2.2]"
        />
        <path d={WATER_MARKS} className={`${DIM} dark:[stroke-dasharray:0_4]`} />
        <path d={WATER_MARKS} transform="translate(827 0)" className={`${DIM} dark:[stroke-dasharray:0_4]`} />
      </g>

      {/* Tide gauge: ticks and labels left of the post. */}
      <g transform="translate(545.2 118.44)">
        <rect x="45.12" y="3.76" width="7.52" height="180.48" className={DRAW} />
        <path d={TICKS} transform="translate(-0.35 -0.36)" className="fill-none stroke-ink [stroke-width:0.705] [stroke-linecap:round] dark:stroke-mangrove" />
        {ticks.map((label, i) => (
          <text key={label} x="16.92" y={i * 30.08 + 7.6} fontSize="10.34" letterSpacing="0.62" className="fill-ink-muted font-mono font-medium">
            {label}
          </text>
        ))}
      </g>

      {/* Tree 1 */}
      <path d={TRUNK_1.stroke} transform="translate(188 55.7)" className={DRAW} />
      <path d={TRUNK_1.hatch} transform="translate(188 55.7)" className={HATCH} />
      <Root x={219.96} y={182.36} w={114.68} d={ROOT_LONG} />
      <Root x={219.02} y={219.96} w={37.6} d={ROOT_SHORT} />
      <Root x={141} y={191.76} w={71.44} d={ROOT_MID} flip />
      <Root x={98.7} y={210.56} w={114.68} d={ROOT_LONG} flip />

      {/* Tree 2 */}
      <path d={TRUNK_2.stroke} transform="translate(329 93.4)" className={DRAW} />
      <path d={TRUNK_2.hatch} transform="translate(329 93.4)" className={HATCH} />
      <Root x={355.32} y={199.28} w={114.68} d={ROOT_LONG} />
      <Root x={354.38} y={227.48} w={37.6} d={ROOT_SHORT} />
      <Root x={281.06} y={206.8} w={71.44} d={ROOT_MID} flip />

      {/* Canopy: separate leaf masses with gaps. */}
      <Canopy x={127.84} y={13.16} shape={CANOPY_A} />
      <Canopy x={212.44} y={0} shape={CANOPY_B} />
      <Canopy x={159.8} y={54.52} shape={CANOPY_C} />
      <Canopy x={300.8} y={37.6} shape={CANOPY_B} />
      <Canopy x={374.12} y={62.04} shape={CANOPY_C} />

      {/* The one mango: the only filled shape. Halo at night. */}
      <g transform="translate(285.76 86.48)">
        <circle cx="20.68" cy="28.2" r="22" fill="url(#mango-halo)" className="hidden dark:inline" />
        <path d="M20.68 13.16C20.68 9.4 22.56 6.58 25.38 5.64" className={DRAW} />
        <ellipse cx="20.68" cy="28.2" rx="6.58" ry="8.46" className="fill-mango" />
      </g>

      {/* The three marked seeds at the waterline. */}
      <Seed x={441.8} />
      <Seed x={475.64} />
      <Seed x={509.48} />

      {/* Annotations: dimensions and callouts, off on phones. */}
      <g className="max-sm:hidden">
        <g transform="translate(413.25 6.57)">
          <path
            d="M5.9925 0.956103V237.956M5.9925 0.956103H0.3525M5.9925 0.956103H11.6325M5.9925 0.956103L3.1725 8.0661M5.9925 0.956103L8.8125 8.0661M5.9925 237.956H0.3525M5.9925 237.956H11.6325M5.9925 237.956L3.1725 230.846M5.9925 237.956L8.8125 230.846"
            className={DIM}
          />
        </g>
        <text
          transform="translate(403 182) rotate(90)"
          textAnchor="middle"
          fontSize="10.34"
          letterSpacing="0.62"
          className={TEXT}
        >
          {t('hero.drawing.height').replace('{value}', '4.6')}
        </text>
        <path
          d="M1.40978 5.9925H365.41M1.40978 5.9925V0.3525M1.40978 5.9925V11.6325M1.40978 5.9925L12.3298 3.1725M1.40978 5.9925L12.3298 8.8125M365.41 5.9925V0.3525M365.41 5.9925V11.6325M365.41 5.9925L354.49 3.1725M365.41 5.9925L354.49 8.8125"
          transform="translate(101.05 379.41)"
          className={DIM}
        />
        <text x={284.35} y={376} textAnchor="middle" fontSize="10.34" letterSpacing="0.62" className={TEXT}>
          {t('hero.drawing.rootSpread').replace('{value}', '6.5')}
        </text>

        <g transform="translate(155.1 198) scale(-1 1)">
          <path d="M0.352519 54.5925L41.5925 0.352519" className={DIM} />
          <circle cx="2.23252" cy="56.4725" r="1.88" className="fill-ink-muted" />
        </g>
        <Callout x={18.8} y={188} number={1} label={t('hero.drawing.propRoot')} />

        <g transform="translate(401.97 12.81)">
          <path d="M0.352584 41.5926L19.5926 0.352584" className={DIM} />
          <circle cx="2.23258" cy="43.4726" r="1.88" className="fill-ink-muted" />
        </g>
        <Callout x={424.88} y={5.64} number={2} label={t('hero.drawing.canopy')} />
        <Callout x={330.88} y={99.64} label={t('hero.drawing.contact')} />
      </g>
    </svg>
  )
}
