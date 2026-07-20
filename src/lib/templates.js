// Programmatic database of 120 wedding/event templates with high-fidelity mockup previews

const CATEGORIES = ['Royal', 'Minimalist', 'Floral', 'Vintage'];

const PALETTES = [
  {
    name: 'Royal Crimson & Gold',
    primary: '#7c2230',
    secondary: '#d4af37',
    bg: '#fbf9f5',
    text: '#1a1a1a',
    accent: '#f3e6c9',
    bgImage: 'https://images.unsplash.com/photo-1543157145-f78c636d023d?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Emerald & Warm Gold',
    primary: '#0f4c3a',
    secondary: '#e5c158',
    bg: '#fafaf6',
    text: '#111e17',
    accent: '#dceee0',
    bgImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Midnight Navy & Silver',
    primary: '#112233',
    secondary: '#a0aab5',
    bg: '#f4f6f9',
    text: '#0d131a',
    accent: '#d9e2ec',
    bgImage: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Blush Pink & Rose Gold',
    primary: '#c97d80',
    secondary: '#e0b0b4',
    bg: '#fffbfb',
    text: '#3a2223',
    accent: '#faebeb',
    bgImage: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Forest Green & Champagne',
    primary: '#1e382d',
    secondary: '#dfceac',
    bg: '#fbfaf8',
    text: '#222825',
    accent: '#e6ebd8',
    bgImage: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Peach & Sage Green',
    primary: '#e38b75',
    secondary: '#8fa89b',
    bg: '#f9f6f0',
    text: '#2c2523',
    accent: '#f1ded9',
    bgImage: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Warm Ochre & Terracotta',
    primary: '#ab5436',
    secondary: '#dca658',
    bg: '#faf6f2',
    text: '#301d17',
    accent: '#f4e9de',
    bgImage: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Lavender & White Gold',
    primary: '#6b5e85',
    secondary: '#c8b68a',
    bg: '#fafafd',
    text: '#1d1926',
    accent: '#eeeaf4',
    bgImage: 'https://images.unsplash.com/photo-1508973379184-7517410fb0bc?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Classic Monochrome',
    primary: '#1e1e1e',
    secondary: '#888888',
    bg: '#ffffff',
    text: '#121212',
    accent: '#f0f0f0',
    bgImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Orchid Pink & Charcoal',
    primary: '#ac5579',
    secondary: '#5c646b',
    bg: '#fff9fb',
    text: '#281a20',
    accent: '#f7ebf0',
    bgImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80'
  }
];

const FONTS = [
  {
    name: 'Calligraphy Romantic',
    title: 'var(--font-playfair)',
    body: 'var(--font-inter)',
    names: 'var(--font-great-vibes)'
  },
  {
    name: 'Elegant Serif',
    title: 'var(--font-playfair)',
    body: 'var(--font-playfair)',
    names: 'var(--font-playfair)'
  },
  {
    name: 'Clean Modernist',
    title: 'var(--font-inter)',
    body: 'var(--font-inter)',
    names: 'var(--font-inter)'
  }
];

const COUPLE_NAMES = [
  { bride: 'Jenny', groom: 'Jason' },
  { bride: 'Caleb', groom: 'Amaya' },
  { bride: 'Maggie', groom: 'Bryan' },
  { bride: 'Eden', groom: 'Rose' },
  { bride: 'Charlotte', groom: 'William' },
  { bride: 'Olivia', groom: 'Liam' },
  { bride: 'Emma', groom: 'Noah' },
  { bride: 'Sophia', groom: 'James' },
  { bride: 'Mia', groom: 'Lucas' },
  { bride: 'Isabella', groom: 'Benjamin' },
  { bride: 'Ava', groom: 'Oliver' },
  { bride: 'Amelia', groom: 'Alexander' },
  { bride: 'Harper', groom: 'Henry' },
  { bride: 'Evelyn', groom: 'Jack' }
];

const LAYOUT_MAP = {
  Royal: 'royal',
  Minimalist: 'minimalist',
  Floral: 'floral',
  Vintage: 'vintage'
};

const WEDDING_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1543157145-f78c636d023d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1508973379184-7517410fb0bc?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519225495810-7512c696af05?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1507504038482-7621c51871f8?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1520854221256-17451cc35d53?auto=format&fit=crop&w=400&q=80'
];

const SIGNATURE_TEMPLATES = [
  {
    id: 'tpl-sig-1',
    name: 'Rajputana Palace',
    category: 'Royal',
    layout: 'royal',
    subLayout: 'rajputana',
    primaryColor: '#7c2230',
    secondaryColor: '#d4af37',
    bgColor: '#fbf9f5',
    textColor: '#1a1a1a',
    accentColor: '#f3e6c9',
    fontTitle: 'var(--font-playfair)',
    fontBody: 'var(--font-inter)',
    fontNames: 'var(--font-great-vibes)',
    cardStyle: 'border-double',
    coupleNames: 'Priya & Shivendra',
    bgImage: 'https://images.unsplash.com/photo-1598977123418-45f04b01fe14?auto=format&fit=crop&w=1200&q=80',
    tagline: 'CORDIALLY INVITED TO CELEBRATE THE WEDDING OF',
    isSignature: true
  },
  {
    id: 'tpl-sig-2',
    name: 'Ethereal Glassmorphism',
    category: 'Minimalist',
    layout: 'minimalist',
    subLayout: 'glassmorphism',
    primaryColor: '#605878',
    secondaryColor: '#ffffff',
    bgColor: '#f5f4f8',
    textColor: '#2a2035',
    accentColor: '#e8e6f0',
    fontTitle: 'var(--font-inter)',
    fontBody: 'var(--font-inter)',
    fontNames: 'var(--font-inter)',
    cardStyle: 'border-none-shadow-sm',
    coupleNames: 'Caleb & Amaya',
    bgImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    tagline: 'SAVE THE DATE FOR THE WEDDING OF',
    isSignature: true
  },
  {
    id: 'tpl-sig-3',
    name: 'Boho Botanical',
    category: 'Floral',
    layout: 'floral',
    subLayout: 'boho',
    primaryColor: '#ab5436',
    secondaryColor: '#8fa89b',
    bgColor: '#faf6f2',
    textColor: '#301d17',
    accentColor: '#f4e9de',
    fontTitle: 'var(--font-playfair)',
    fontBody: 'var(--font-inter)',
    fontNames: 'var(--font-great-vibes)',
    cardStyle: 'border-rounded-soft',
    coupleNames: 'Maggie & Bryan',
    bgImage: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80',
    tagline: 'WE WOULD LOVE FOR YOU TO JOIN US',
    isSignature: true
  },
  {
    id: 'tpl-sig-4',
    name: 'Celestial Midnight',
    category: 'Vintage',
    layout: 'vintage',
    subLayout: 'celestial',
    primaryColor: '#1a2b4c',
    secondaryColor: '#d4af37',
    bgColor: '#0f172a',
    textColor: '#f8fafc',
    accentColor: '#1e293b',
    fontTitle: 'var(--font-playfair)',
    fontBody: 'var(--font-inter)',
    fontNames: 'var(--font-great-vibes)',
    cardStyle: 'border-classic-double',
    coupleNames: 'Aarav & Diya',
    bgImage: 'https://images.unsplash.com/photo-1507504038482-7621c51871f8?auto=format&fit=crop&w=1200&q=80',
    tagline: 'SAVE THE DATE UNDER THE STARS',
    isSignature: true
  },
  {
    id: 'tpl-sig-5',
    name: 'Vintage Victorian',
    category: 'Royal',
    layout: 'royal',
    subLayout: 'victorian',
    primaryColor: '#5c1d24',
    secondaryColor: '#c8b68a',
    bgColor: '#faf8f5',
    textColor: '#2c1a1c',
    accentColor: '#f5efe6',
    fontTitle: 'var(--font-playfair)',
    fontBody: 'var(--font-playfair)',
    fontNames: 'var(--font-great-vibes)',
    cardStyle: 'border-double',
    coupleNames: 'Charlotte & William',
    bgImage: 'https://images.unsplash.com/photo-1543157145-f78c636d023d?auto=format&fit=crop&w=1200&q=80',
    tagline: 'CORDIALLY SHARE IN THE JOY OF THE WEDDING OF',
    isSignature: true
  },
  {
    id: 'tpl-sig-6',
    name: 'Haldi / Mehendi Festivity',
    category: 'Vintage',
    layout: 'vintage',
    subLayout: 'haldi',
    primaryColor: '#d97706',
    secondaryColor: '#059669',
    bgColor: '#fef3c7',
    textColor: '#451a03',
    accentColor: '#fde68a',
    fontTitle: 'var(--font-playfair)',
    fontBody: 'var(--font-inter)',
    fontNames: 'var(--font-great-vibes)',
    cardStyle: 'border-classic-double',
    coupleNames: 'Rohan & Anjali',
    bgImage: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    tagline: 'JOIN US FOR A VIBRANT CELEBRATION',
    isSignature: true
  },
  {
    id: 'tpl-sig-7',
    name: 'Art Deco Glamour',
    category: 'Royal',
    layout: 'royal',
    subLayout: 'artdeco',
    primaryColor: '#121212',
    secondaryColor: '#dfbe6b',
    bgColor: '#1c1c1c',
    textColor: '#f5f5f5',
    accentColor: '#2b2b2b',
    fontTitle: 'var(--font-playfair)',
    fontBody: 'var(--font-inter)',
    fontNames: 'var(--font-great-vibes)',
    cardStyle: 'border-double',
    coupleNames: 'Vikram & Meera',
    bgImage: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    tagline: 'CORDIALLY REQUEST THE HONOR OF YOUR PRESENCE',
    isSignature: true
  },
  {
    id: 'tpl-sig-8',
    name: 'Minimalist Zen',
    category: 'Minimalist',
    layout: 'minimalist',
    subLayout: 'zen',
    primaryColor: '#2e3a2f',
    secondaryColor: '#a89a7a',
    bgColor: '#fafaf9',
    textColor: '#1c1f1c',
    accentColor: '#f1f1ee',
    fontTitle: 'var(--font-inter)',
    fontBody: 'var(--font-inter)',
    fontNames: 'var(--font-inter)',
    cardStyle: 'border-none-shadow-sm',
    coupleNames: 'Liam & Olivia',
    bgImage: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
    tagline: 'SAVE THE DATE',
    isSignature: true
  },
  {
    id: 'tpl-sig-9',
    name: 'Enchanted Forest',
    category: 'Floral',
    layout: 'floral',
    subLayout: 'enchanted',
    primaryColor: '#1a3328',
    secondaryColor: '#dfbe6b',
    bgColor: '#f4f7f5',
    textColor: '#11221b',
    accentColor: '#e2eae5',
    fontTitle: 'var(--font-playfair)',
    fontBody: 'var(--font-inter)',
    fontNames: 'var(--font-great-vibes)',
    cardStyle: 'border-rounded-soft',
    coupleNames: 'Lucas & Mia',
    bgImage: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80',
    tagline: 'IN THE HEART OF THE FOREST, WE SAY I DO',
    isSignature: true
  },
  {
    id: 'tpl-sig-10',
    name: 'Coastal Riviera',
    category: 'Minimalist',
    layout: 'minimalist',
    subLayout: 'coastal',
    primaryColor: '#1a365d',
    secondaryColor: '#e2e8f0',
    bgColor: '#f7fafc',
    textColor: '#2d3748',
    accentColor: '#edf2f7',
    fontTitle: 'var(--font-playfair)',
    fontBody: 'var(--font-inter)',
    fontNames: 'var(--font-great-vibes)',
    cardStyle: 'border-rounded-soft',
    coupleNames: 'Emma & Noah',
    bgImage: 'https://images.unsplash.com/photo-1520854221256-17451cc35d53?auto=format&fit=crop&w=1200&q=80',
    tagline: 'SAVE THE DATE BY THE OCEAN',
    isSignature: true
  }
];

const generatedTemplates = [...SIGNATURE_TEMPLATES];
let index = 1;

for (const category of CATEGORIES) {
  for (const palette of PALETTES) {
    for (const font of FONTS) {
      const couple = COUPLE_NAMES[index % COUPLE_NAMES.length];
      
      generatedTemplates.push({
        id: `tpl-${index}`,
        name: `${palette.name} (${font.name})`,
        category,
        layout: LAYOUT_MAP[category],
        primaryColor: palette.primary,
        secondaryColor: palette.secondary,
        bgColor: palette.bg,
        textColor: palette.text,
        accentColor: palette.accent,
        fontTitle: font.title,
        fontBody: font.body,
        fontNames: font.names,
        cardStyle: category === 'Royal' 
          ? 'border-double' 
          : category === 'Minimalist' 
          ? 'border-none-shadow-sm' 
          : category === 'Floral' 
          ? 'border-rounded-soft' 
          : 'border-classic-double',
        coupleNames: `${couple.bride} & ${couple.groom}`,
        bgImage: WEDDING_IMAGES[index % WEDDING_IMAGES.length],
        tagline: category === 'Royal' ? 'CORDIALLY INVITED TO CELEBRATE' : 'SAVE THE DATE FOR THE WEDDING OF',
        isSignature: false
      });
      index++;
    }
  }
}

export function getTemplates() {
  return generatedTemplates;
}

export function getTemplateById(id) {
  return generatedTemplates.find(t => t.id === id) || null;
}

export function searchTemplates(query = '', category = 'All') {
  let filtered = [...generatedTemplates];
  if (category && category !== 'All') {
    filtered = filtered.filter(t => t.category.toLowerCase() === category.toLowerCase());
  }
  if (query && query.trim() !== '') {
    const q = query.toLowerCase();
    filtered = filtered.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.category.toLowerCase().includes(q)
    );
  }
  return filtered;
}

