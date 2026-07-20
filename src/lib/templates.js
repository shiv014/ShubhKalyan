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

const generatedTemplates = [];
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
        tagline: category === 'Royal' ? 'CORDIALLY INVITED TO CELEBRATE' : 'SAVE THE DATE FOR THE WEDDING OF'
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
