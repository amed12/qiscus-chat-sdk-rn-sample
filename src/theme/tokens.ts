// ─── Qiscus Brand Color System (2026) ────────────────────────────────────────
// Source: Qiscus Brand Guidelines (Figma)
// Build against semantic tokens below, not raw palette values.
// Color names follow Indonesian nature words (see brand guidelines).

// ─── Raw palette ─────────────────────────────────────────────────────────────

export const palette = {
  // Kapas (cotton) — white
  kapas: '#FFFFFF',

  // Arang (charcoal) — near-black
  arang: '#14181B',

  // Samudra (ocean) — deep navy, hero brand
  samudra50:  '#EEF7FF',
  samudra100: '#DBEEFF',
  samudra200: '#BADEFF',
  samudra300: '#98C8F4',
  samudra400: '#78ADDD',
  samudra500: '#5C93C3',
  samudra600: '#4379A8',
  samudra700: '#2D608B',
  samudra800: '#01416C', // ← core
  samudra900: '#103553',

  // Telaga (lake) — primary/button blue
  telaga50:  '#F0F6FF',
  telaga100: '#DFECFF',
  telaga200: '#C2DBFF',
  telaga300: '#9DC5FF',
  telaga400: '#6DA9FF',
  telaga500: '#3C8BFA',
  telaga600: '#1F70DD', // ← core
  telaga700: '#0056BB',
  telaga800: '#004292',
  telaga900: '#002F6D',

  // Kabut (mist) → Arang — neutral scale
  kabut50:  '#F5F5F2', // ← core (Kabut)
  kabut100: '#E6ECF2',
  kabut200: '#D4DADF',
  kabut300: '#BDC3C9',
  kabut400: '#A3A8AE',
  kabut500: '#898E93',
  kabut600: '#70757A',
  kabut700: '#585D62',
  kabut800: '#42474C',
  kabut900: '#14181B', // ← Arang

  // Pandan (pandan leaf) — success green
  pandan50:  '#E8FDE2',
  pandan100: '#D4F7CC',
  pandan200: '#B7EAAB',
  pandan300: '#95D786',
  pandan400: '#74C162', // ← core (Pandan)
  pandan500: '#57A345',
  pandan600: '#3D8929',
  pandan700: '#336228', // = Suji
  pandan800: '#165500',
  pandan900: '#0E3E00',

  // Mangga (mango) — warning
  mangga50:  '#FFF4E5',
  mangga100: '#FFE7C6',
  mangga200: '#FFD18D',
  mangga300: '#FBB439', // ← core (Mangga)
  mangga400: '#DC9919',
  mangga500: '#BC8000',
  mangga600: '#9B6900',
  mangga700: '#7C5300',
  mangga800: '#5F3F00',
  mangga900: '#462D00',

  // Merah (red) — error/alert
  merah50:  '#FFF2F1',
  merah100: '#FFE4E1',
  merah200: '#FFCAC5',
  merah300: '#FFA8A0',
  merah400: '#FF7870',
  merah500: '#FF4949', // ← core (Merah)
  merah600: '#D71627',
  merah700: '#AF0019',
  merah800: '#880011',
  merah900: '#65000A',

  // Langit (sky) — cyan accent
  langit300: '#56CCF2', // ← core

  // Jahe (ginger) — orange accent
  jahe500: '#F26A1E', // ← core

  // Kunyit (turmeric) — gold highlight
  kunyit200: '#FFD97C', // ← core
} as const;

// ─── Semantic tokens ──────────────────────────────────────────────────────────
// Always use these in components, never raw palette values.

export const colors = {
  // Surfaces
  bg:           palette.kapas,        // page background
  surface:      palette.kabut50,      // cards, sheets
  surface2:     palette.kabut100,     // insets, secondary panels
  border:       palette.kabut200,     // hairlines
  borderStrong: palette.kabut300,     // dividers

  // Primary / action (Telaga)
  primary:        palette.telaga600,  // button, interactive
  primaryHover:   palette.telaga700,
  primaryActive:  palette.telaga800,
  primarySubtle:  palette.telaga50,   // tinted bg
  onPrimary:      palette.kapas,      // text/icon on primary button
  focusRing:      palette.telaga500,

  // Deep brand (Samudra)
  accentDeep:      palette.samudra800,
  accentDeepHover: palette.samudra900,
  onAccentDeep:    palette.kapas,

  // Text (Kabut scale)
  text:            palette.kabut900,  // body, APCA 105
  textMuted:       palette.kabut700,  // secondary
  textSubtle:      palette.kabut600,  // captions/labels
  textPlaceholder: palette.kabut500,
  textDisabled:    palette.kabut400,

  // Link
  link:      palette.telaga700,
  linkHover: palette.telaga800,

  // Feedback states — border / text / solid
  successBorder: palette.pandan200,
  successText:   '#266E0F',           // Pandan scale, between 700–800
  successSolid:  palette.pandan600,

  warningBorder: palette.mangga200,
  warningText:   palette.mangga800,
  warningSolid:  palette.mangga300,

  errorBorder:   palette.merah200,
  errorText:     palette.merah700,
  errorSolid:    palette.merah600,

  infoBorder:    palette.telaga200,
  infoText:      palette.telaga700,
  infoSolid:     palette.telaga600,

  // Chat-specific
  messageIn:  palette.kabut100,       // incoming bubble
  messageOut: palette.kapas,          // outgoing bubble

  // Misc
  online:  palette.pandan400,         // online presence dot
  overlay: 'rgba(20,24,27,0.4)',      // modal scrim (Arang-based)

  // Gradients (start/end — use with LinearGradient)
  gradientFajarStart: '#EAF4FF',
  gradientFajarEnd:   '#E5F7FE',
  gradientSamudraStart: palette.samudra800,
  gradientSamudraEnd:   palette.samudra900,
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const spacing = {
  xs:      4,
  sm:      8,
  md:      12,
  lg:      16,
  xl:      24,
  xxl:     32,
  toolbar: 48,
} as const;

// ─── Border radius ────────────────────────────────────────────────────────────

export const radius = {
  sm:   4,
  md:   8,
  lg:   12,
  full: 9999,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const fontSize = {
  xs:   10,
  sm:   11,
  md:   13,
  base: 14,
  lg:   16,
  xl:   20,
} as const;

// ─── Shadow ───────────────────────────────────────────────────────────────────

export const shadow = {
  light: {
    shadowColor: palette.kabut300,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: palette.arang,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
} as const;
