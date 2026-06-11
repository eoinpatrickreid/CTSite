// Sample placeholder content for Eoin & Cristina's planning dashboard.

const TODAY = new Date();
const TODAY_ISO = TODAY.toISOString().slice(0, 10);
const TOGETHER_SINCE = '2022-08-14'; // change anytime

function isoOffset(days) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const MEALS = [
  {
    id: 'm1', type: 'meal', title: 'Meal A',
    subtitle: 'Creamy pasta · ~25 min',
    color: '#FFB3D9',
    ingredients: ['200g pasta', '1 cup cream', '2 garlic cloves', 'Parmesan', 'Lemon zest', 'Black pepper', 'Olive oil', 'Fresh basil'],
    steps: ['Boil pasta until al dente.', 'Sauté garlic in olive oil.', 'Add cream, reduce 3 min.', 'Toss pasta, finish with lemon & parmesan.'],
  },
  {
    id: 'm2', type: 'meal', title: 'Meal B',
    subtitle: 'Sheet-pan veg · ~35 min',
    color: '#D4A5F9',
    ingredients: ['1 sweet potato', '1 head broccoli', '1 red onion', 'Chickpeas, drained', 'Tahini', 'Lemon', 'Cumin, paprika', 'Salt & pepper'],
    steps: ['Heat oven to 220°C.', 'Toss veg with spices + oil.', 'Roast 25–30 min.', 'Drizzle tahini-lemon dressing.'],
  },
  {
    id: 'm3', type: 'meal', title: 'Meal C',
    subtitle: 'Tacos night · ~20 min',
    color: '#FFC9DE',
    ingredients: ['Corn tortillas', 'Black beans', 'Avocado', 'Lime', 'Red cabbage', 'Cilantro', 'Cotija cheese', 'Hot sauce'],
    steps: ['Warm tortillas.', 'Mash avocado with lime.', 'Stack beans, slaw, avocado.', 'Top with cheese and hot sauce.'],
  },
  {
    id: 'm4', type: 'meal', title: 'Meal D',
    subtitle: 'Cozy ramen · ~30 min',
    color: '#B8E0F5',
    ingredients: ['Ramen noodles', 'Miso paste', 'Soft-boiled egg', 'Scallions', 'Mushrooms', 'Soy sauce', 'Ginger', 'Sesame oil'],
    steps: ['Simmer ginger + mushrooms in broth.', 'Whisk in miso off heat.', 'Cook noodles separately.', 'Assemble with egg + scallions.'],
  },
  {
    id: 'm5', type: 'meal', title: 'Meal E',
    subtitle: 'Brunch board · ~15 min',
    color: '#FFE0B3',
    ingredients: ['Sourdough', 'Goat cheese', 'Honey', 'Strawberries', 'Prosciutto', 'Almonds', 'Mint', 'Olive oil'],
    steps: ['Toast sourdough.', 'Arrange on a wooden board.', 'Drizzle honey on cheese.', 'Garnish with mint.'],
  },
  {
    id: 'm6', type: 'meal', title: 'Gochujang chicken',
    subtitle: 'Sticky Korean · ~35 min',
    color: '#FF8A6B',
    ingredients: [
      '600g boneless chicken thighs',
      '3 tbsp gochujang',
      '2 tbsp soy sauce',
      '1 tbsp honey',
      '1 tbsp brown sugar',
      '1 tbsp rice vinegar',
      '1 tbsp sesame oil',
      '4 garlic cloves, grated',
      '2 tsp grated ginger',
      'Scallions, sliced',
      'Toasted sesame seeds',
      'Steamed rice, to serve',
    ],
    steps: [
      'Whisk gochujang, soy, honey, sugar, vinegar, sesame oil, garlic and ginger.',
      'Pat chicken dry, cut into bite-size pieces, toss with half the marinade. Rest 15 min.',
      'Sear chicken in a hot pan (no extra oil) skin-side first, ~4 min per side until charred.',
      'Pour in remaining sauce, bubble 2–3 min until glossy and sticky.',
      'Serve over rice, top with scallions and sesame seeds.',
    ],
  },
  {
    id: 'm7', type: 'meal', title: 'Gluten-free lasagne',
    subtitle: 'Beef ragù · ~1h 30',
    color: '#E08A6B',
    ingredients: [
      '500g beef mince',
      '1 onion, finely chopped',
      '2 carrots, finely chopped',
      '2 celery sticks, finely chopped',
      '3 garlic cloves, minced',
      '2 tbsp tomato purée',
      '400g tin chopped tomatoes',
      '200ml red wine',
      '1 tsp dried oregano',
      'Gluten-free lasagne sheets',
      '50g GF flour',
      '50g butter',
      '600ml milk',
      'Pinch of nutmeg',
      '150g grated mozzarella',
      '50g grated parmesan',
      'Olive oil, salt, pepper',
    ],
    steps: [
      'Soften onion, carrot and celery in olive oil 8–10 min. Add garlic, cook 1 min.',
      'Add mince, brown well. Stir in tomato purée, cook 2 min.',
      'Pour in wine, reduce by half. Add tomatoes, oregano, season. Simmer 40 min until thick.',
      'For the béchamel: melt butter, whisk in GF flour, cook 1 min. Slowly whisk in milk, simmer until thick. Season with nutmeg, salt and pepper.',
      'Heat oven to 190°C. Layer ragù, GF sheets, béchamel — repeat 3 times. Top with mozzarella and parmesan.',
      'Bake 30–35 min until golden and bubbling. Rest 10 min before slicing.',
    ],
  },
];

const RESTAURANTS = [
  { id: 'r1', type: 'restaurant', title: 'Restaurant A', subtitle: 'Italian · 12 min away', color: '#FFB3D9', url: 'https://example.com/restaurant-a', neighborhood: 'Old Town', price: '€€', city: 'Dublin', lat: 53.3456, lng: -6.2630 },
  { id: 'r2', type: 'restaurant', title: 'Restaurant B', subtitle: 'Ramen · East side', color: '#D4A5F9', url: 'https://example.com/restaurant-b', neighborhood: 'East side', price: '€€', city: 'Dublin', lat: 53.3389, lng: -6.2384 },
  { id: 'r3', type: 'restaurant', title: 'Restaurant C', subtitle: 'Brunch spot · Cozy', color: '#FFE0B3', url: 'https://example.com/restaurant-c', neighborhood: 'North', price: '€', city: 'Dublin', lat: 53.3595, lng: -6.2720 },
  { id: 'r4', type: 'restaurant', title: 'Restaurant D', subtitle: 'Wine bar · Date night', color: '#FFC9DE', url: 'https://example.com/restaurant-d', neighborhood: 'River', price: '€€€', city: 'Dublin', lat: 53.3487, lng: -6.2467 },
  { id: 'r5', type: 'restaurant', title: 'Restaurant E', subtitle: 'Tapas · Weekend pick', color: '#B8E0F5', url: 'https://example.com/restaurant-e', neighborhood: 'Old Town', price: '€€', city: 'Dublin', lat: 53.3442, lng: -6.2665 },
  { id: 'r6', type: 'restaurant', title: 'Trattoria Roma', subtitle: 'Roman cuisine · Trastevere', color: '#FFB3D9', url: 'https://example.com/trattoria', neighborhood: 'Trastevere', price: '€€', city: 'Rome', lat: 41.8827, lng: 12.4700 },
  { id: 'r7', type: 'restaurant', title: 'Osteria del Sole', subtitle: 'Pasta & wine · Centro', color: '#D4A5F9', url: 'https://example.com/osteria', neighborhood: 'Centro Storico', price: '€€€', city: 'Rome', lat: 41.8986, lng: 12.4769 },
  { id: 'r8', type: 'restaurant', title: 'Bar Cañete', subtitle: 'Tapas bar · El Raval', color: '#FFE0B3', url: 'https://example.com/canete', neighborhood: 'El Raval', price: '€€', city: 'Barcelona', lat: 41.3809, lng: 2.1700 },
  { id: 'r9', type: 'restaurant', title: 'La Pepita', subtitle: 'Creative tapas · Gràcia', color: '#FFC9DE', url: 'https://example.com/pepita', neighborhood: 'Gràcia', price: '€', city: 'Barcelona', lat: 41.4025, lng: 2.1560 },
];

const ACTIVITIES = [
  { id: 'a1', type: 'activity', title: 'Activity A', subtitle: 'Pottery class · Saturdays', color: '#D4A5F9', url: 'https://example.com/activity-a', duration: '2h', city: 'Dublin', lat: 53.3508, lng: -6.2850 },
  { id: 'a2', type: 'activity', title: 'Activity B', subtitle: 'Botanical gardens', color: '#C8E6D0', url: 'https://example.com/activity-b', duration: 'half day', city: 'Dublin', lat: 53.3714, lng: -6.2698 },
  { id: 'a3', type: 'activity', title: 'Activity C', subtitle: 'Sunset hike', color: '#FFE0B3', url: 'https://example.com/activity-c', duration: '3h', city: 'Dublin', lat: 53.3876, lng: -6.0648 },
  { id: 'a4', type: 'activity', title: 'Activity D', subtitle: 'Cinema double-feature', color: '#FFB3D9', url: 'https://example.com/activity-d', duration: '4h', city: 'Dublin', lat: 53.3267, lng: -6.2635 },
  { id: 'a5', type: 'activity', title: 'Activity E', subtitle: 'Farmers market', color: '#FFC9DE', url: 'https://example.com/activity-e', duration: '2h', city: 'Dublin', lat: 53.2937, lng: -6.1344 },
  { id: 'a6', type: 'activity', title: 'Colosseum tour', subtitle: 'Guided history walk', color: '#D4A5F9', url: 'https://example.com/colosseum', duration: '3h', city: 'Rome', lat: 41.8902, lng: 12.4922 },
  { id: 'a7', type: 'activity', title: 'Cooking class', subtitle: 'Pasta & tiramisu', color: '#FFE0B3', url: 'https://example.com/cooking-rome', duration: '4h', city: 'Rome', lat: 41.8955, lng: 12.4823 },
  { id: 'a8', type: 'activity', title: 'Park Güell', subtitle: 'Gaudí garden walk', color: '#C8E6D0', url: 'https://example.com/parkguell', duration: '2h', city: 'Barcelona', lat: 41.4145, lng: 2.1527 },
  { id: 'a9', type: 'activity', title: 'Sagrada Família', subtitle: 'Interior visit', color: '#FFB3D9', url: 'https://example.com/sagrada', duration: '2h', city: 'Barcelona', lat: 41.4036, lng: 2.1744 },
  { id: 'a10', type: 'activity', title: 'Wine country day trip', subtitle: 'Penedès vineyards', color: '#FFC9DE', url: 'https://example.com/wine-bcn', duration: 'full day', city: 'Barcelona', lat: 41.3480, lng: 1.7924 },
];

const WATCHLIST = [
  { id: 'w1', type: 'watch', title: 'Movie A', subtitle: 'Drama · 2h 12m', color: '#D4A5F9', url: 'https://example.com/movie-a', kind: 'Movie' },
  { id: 'w2', type: 'watch', title: 'Series B', subtitle: 'Comedy · 1 season', color: '#FFB3D9', url: 'https://example.com/series-b', kind: 'Series' },
  { id: 'w3', type: 'watch', title: 'Movie C', subtitle: 'Romance · 1h 48m', color: '#FFC9DE', url: 'https://example.com/movie-c', kind: 'Movie' },
  { id: 'w4', type: 'watch', title: 'Series D', subtitle: 'Mystery · 8 eps', color: '#B8E0F5', url: 'https://example.com/series-d', kind: 'Series' },
  { id: 'w5', type: 'watch', title: 'Movie E', subtitle: 'Animated · 1h 36m', color: '#FFE0B3', url: 'https://example.com/movie-e', kind: 'Movie' },
];

const ALL_ITEMS = [...MEALS, ...RESTAURANTS, ...ACTIVITIES, ...WATCHLIST];
const ITEM_BY_ID = Object.fromEntries(ALL_ITEMS.map((i) => [i.id, i]));

const INITIAL_EVENTS = [
  { id: 'e1', itemId: 'm1', date: TODAY_ISO, time: '19:30' },
  { id: 'e2', itemId: 'r4', date: isoOffset(2), time: '20:00', important: true },
  { id: 'e3', itemId: 'w2', date: isoOffset(1), time: '21:00' },
  { id: 'e4', itemId: 'a3', date: isoOffset(4), time: '17:00', important: true },
  { id: 'e5', itemId: 'm4', date: isoOffset(-2), time: '19:00' },
  { id: 'e6', itemId: 'a5', date: isoOffset(6), time: '10:00' },
];

const TYPE_META = {
  meal:       { label: 'meals',       icon: '◐', accent: '#FFB3D9' },
  restaurant: { label: 'restaurants', icon: '◇', accent: '#D4A5F9' },
  activity:   { label: 'activities',  icon: '◑', accent: '#C8E6D0' },
  watch:      { label: 'watchlist',   icon: '◈', accent: '#FFE0B3' },
  holiday:    { label: 'holiday',     icon: '✈', accent: '#B8E0F5' },
};

// ── Sample holiday data ─────────────────────────────────────────────────────
const HOLIDAYS = [
  {
    id: 'h1',
    title: 'Rome getaway',
    destination: 'Rome',
    city: 'Rome',
    color: '#B8E0F5',
    startDate: isoOffset(45),
    endDate: isoOffset(52),
    status: 'planning', // planning | booked | completed
    budget: { total: 2000, spent: 650 },
    flights: [
      { id: 'f1', direction: 'outbound', from: 'DUB', to: 'FCO', date: isoOffset(45), time: '08:30', airline: 'Airline A', cost: 180, booked: true },
      { id: 'f2', direction: 'return',   from: 'FCO', to: 'DUB', date: isoOffset(52), time: '16:45', airline: 'Airline A', cost: 195, booked: true },
    ],
    accommodation: { name: 'Hotel A', cost: 120, perNight: true, nights: 7, booked: false, url: 'https://example.com/hotel-a' },
    itinerary: [
      { day: 1, date: isoOffset(45), title: 'Arrive & settle in', notes: 'Check in, explore neighbourhood, find a good dinner spot' },
      { day: 2, date: isoOffset(46), title: 'City centre', notes: 'Walking tour, lunch at the market, museum in the afternoon' },
      { day: 3, date: isoOffset(47), title: 'Day trip', notes: 'Rent a car, drive to the coast, beach picnic' },
      { day: 4, date: isoOffset(48), title: 'Cooking class', notes: 'Morning class, free afternoon for shopping' },
      { day: 5, date: isoOffset(49), title: 'Adventure day', notes: 'Hiking or kayaking, decide based on weather' },
      { day: 6, date: isoOffset(50), title: 'Relax & wander', notes: 'Sleep in, brunch, bookshops, sunset drinks' },
      { day: 7, date: isoOffset(51), title: 'Last full day', notes: 'Revisit favourite spots, farewell dinner' },
    ],
    activities: [
      { title: 'Walking tour', cost: 0, booked: false },
      { title: 'Cooking class', cost: 80, booked: true },
      { title: 'Kayak rental', cost: 45, booked: false },
    ],
    packingList: ['Passports', 'Chargers', 'Sunscreen', 'Comfortable shoes', 'Camera', 'Travel adapter'],
  },
  {
    id: 'h2',
    title: 'Barcelona weekend',
    destination: 'Barcelona',
    city: 'Barcelona',
    color: '#D4A5F9',
    startDate: isoOffset(90),
    endDate: isoOffset(94),
    status: 'planning',
    budget: { total: 1200, spent: 0 },
    flights: [
      { id: 'f3', direction: 'outbound', from: 'DUB', to: 'BCN', date: isoOffset(90), time: '06:15', airline: 'Airline B', cost: 95, booked: false },
      { id: 'f4', direction: 'return',   from: 'BCN', to: 'DUB', date: isoOffset(94), time: '19:30', airline: 'Airline B', cost: 110, booked: false },
    ],
    accommodation: { name: 'Airbnb B', cost: 85, perNight: true, nights: 4, booked: false, url: 'https://example.com/airbnb-b' },
    itinerary: [
      { day: 1, date: isoOffset(90), title: 'Arrival day', notes: 'Drop bags, tapas crawl' },
      { day: 2, date: isoOffset(91), title: 'Beach & culture', notes: 'Morning at the beach, afternoon architecture tour' },
      { day: 3, date: isoOffset(92), title: 'Wine country', notes: 'Day trip to vineyards' },
      { day: 4, date: isoOffset(93), title: 'Free day', notes: 'Whatever we feel like' },
    ],
    activities: [
      { title: 'Architecture tour', cost: 25, booked: false },
      { title: 'Wine tasting', cost: 60, booked: false },
    ],
    packingList: ['Passports', 'Swimwear', 'Light jacket'],
  },
];

Object.assign(window, {
  MEALS, RESTAURANTS, ACTIVITIES, WATCHLIST, HOLIDAYS,
  ALL_ITEMS, ITEM_BY_ID, INITIAL_EVENTS, TYPE_META,
  TODAY, TODAY_ISO, TOGETHER_SINCE, isoOffset,
});
