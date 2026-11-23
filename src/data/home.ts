export const verticals = [
  { id: 'buy', label: 'Купить', title: 'Купить квартиру', icon: 'home' },
  { id: 'rent', label: 'Снять', title: 'Снять надолго', icon: 'key' },
  { id: 'new', label: 'Новостройки', title: 'Новостройки', icon: 'building' },
  { id: 'daily', label: 'Посуточно', title: 'Снять посуточно', icon: 'calendar' },
  { id: 'business', label: 'Коммерческая', title: 'Коммерческая недвижимость', icon: 'case' },
] as const;
export type SavedSearch = { label: string; detail: string; url: string };
const key = 'cian3:saved-searches:v1';
export const sampleSearch: SavedSearch = {
  label: 'Двухкомнатная у парка',
  detail: 'Сокольники · 2 комнаты · до 20 млн ₽',
  url: '/search?q=Сокольники&rooms=2&maxPrice=20000000',
};
export function readSearches(): SavedSearch[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value)
      ? value.filter(
          (item): item is SavedSearch =>
            !!item &&
            typeof item.label === 'string' &&
            typeof item.detail === 'string' &&
            typeof item.url === 'string' &&
            /^\/(search|explore)(\?|\/|$)/.test(item.url),
        )
      : [];
  } catch {
    return [];
  }
}
export function saveSearch(search: SavedSearch) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(
        [search, ...readSearches().filter((item) => item.url !== search.url)].slice(0, 5),
      ),
    );
    return true;
  } catch {
    return false;
  }
}
export function rememberSearch(search: SavedSearch) {
  try {
    localStorage.setItem('cian3:last-search:v1', JSON.stringify(search));
  } catch {
    /* Storage is optional. */
  }
}
export function readLastSearch(): SavedSearch | undefined {
  try {
    const item = JSON.parse(localStorage.getItem('cian3:last-search:v1') || 'null');
    return item &&
      typeof item.label === 'string' &&
      typeof item.detail === 'string' &&
      typeof item.url === 'string' &&
      /^\/(search|explore)(\?|\/|$)/.test(item.url)
      ? item
      : undefined;
  } catch {
    return undefined;
  }
}
