/** Synthetic workshop fixtures. Photos are visual references, not descriptions of these offers. */
export interface Listing {
  id: string;
  rooms: number;
  area: number;
  kitchen: number;
  floor: number;
  floors: number;
  price: number;
  address: string;
  district: string;
  metro: string;
  walkMinutes: number;
  title: string;
  description: string;
  images: string[];
  badge?: string;
  seller: string;
}
const rows = [
  [
    '1',
    2,
    54,
    12,
    7,
    17,
    18400000,
    'ул. Русаковская, 12',
    'Сокольники',
    'Сокольники',
    7,
    'Светлая квартира рядом с парком',
  ],
  [
    '2',
    1,
    38,
    10,
    5,
    12,
    12900000,
    'ул. Новопесчаная, 8',
    'Сокол',
    'Сокол',
    9,
    'Тихий двор и окна на зелень',
  ],
  [
    '3',
    2,
    62,
    14,
    9,
    22,
    21900000,
    'ул. Стромынка, 14',
    'Сокольники',
    'Сокольники',
    12,
    'Большая кухня для семейных вечеров',
  ],
  [
    '4',
    3,
    84,
    18,
    12,
    19,
    28500000,
    'ул. Мосфильмовская, 17',
    'Раменки',
    'Раменки',
    8,
    'Просторная квартира с видом на город',
  ],
  [
    '5',
    0,
    29,
    7,
    4,
    16,
    9800000,
    'ул. Липецкая, 22',
    'Бирюлёво Восточное',
    'Царицыно',
    15,
    'Студия для нового начала',
  ],
  [
    '6',
    2,
    58,
    11,
    6,
    14,
    17200000,
    'Ходынский бул., 5',
    'Хорошёвский',
    'ЦСКА',
    6,
    'Парк в двух шагах от дома',
  ],
  [
    '7',
    1,
    42,
    12,
    10,
    25,
    14600000,
    'ул. Подольских Курсантов, 9',
    'Чертаново Южное',
    'Пражская',
    11,
    'Готова к переезду',
  ],
  [
    '8',
    3,
    96,
    21,
    15,
    24,
    33400000,
    'ул. Удальцова, 3',
    'Проспект Вернадского',
    'Проспект Вернадского',
    5,
    'Место для всей семьи',
  ],
] as const;
export const listings: Listing[] = rows.map(
  (
    [id, rooms, area, kitchen, floor, floors, price, address, district, metro, walkMinutes, title],
    index,
  ) => ({
    id,
    rooms,
    area,
    kitchen,
    floor,
    floors,
    price,
    address,
    district,
    metro,
    walkMinutes,
    title,
    description:
      'Светлая квартира с удобной планировкой. Отдельные комнаты, просторная кухня и много места для хранения. Окна выходят в тихий двор. Рядом парк, магазины и всё необходимое для повседневной жизни. Можно спланировать рабочее место у окна и обеденную зону для встреч с друзьями.',
    images: [
      index === 0 ? '/images/hero.jpg' : `/images/apartment-${index + 1}.webp`,
      `/images/apartment-${((index + 1) % 8) + 1}.webp`,
      `/images/apartment-${((index + 2) % 8) + 1}.webp`,
    ],
    badge: index % 3 === 0 ? 'Хорошая цена' : index % 3 === 1 ? 'Только на Циан' : undefined,
    seller: ['Анна · специалист по недвижимости', 'Алексей · собственник', 'Команда «Новый адрес»'][
      index % 3
    ],
  }),
);
export const money = (value: number) => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
export const listingLabel = (listing: Listing) =>
  `${listing.rooms === 0 ? 'Студия' : `${listing.rooms}-комн. квартира`}, ${listing.area} м², ${listing.floor}/${listing.floors} этаж`;
export function filterListings(data: Listing[], params: URLSearchParams, favorites: string[]) {
  const query = (params.get('q') || '').trim().toLocaleLowerCase('ru');
  const rooms = params.get('rooms') || '';
  const rawPrice = Number(params.get('maxPrice'));
  const maxPrice = Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : Infinity;
  const result = data.filter(
    (item) =>
      (!query ||
        `${item.title} ${item.address} ${item.district} ${item.metro} Москва`
          .toLocaleLowerCase('ru')
          .includes(query)) &&
      (!rooms || (rooms === '4' ? item.rooms >= 4 : item.rooms === Number(rooms))) &&
      item.price <= maxPrice &&
      (params.get('favorites') !== '1' || favorites.includes(item.id)),
  );
  if (params.get('sort') === 'price-asc') result.sort((a, b) => a.price - b.price);
  if (params.get('sort') === 'price-desc') result.sort((a, b) => b.price - a.price);
  if (params.get('sort') === 'area-desc') result.sort((a, b) => b.area - a.area);
  return result;
}

export function resultsLabel(count: number) {
  const mod10 = count % 10,
    mod100 = count % 100;
  const noun =
    mod10 === 1 && mod100 !== 11
      ? 'объявление'
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? 'объявления'
        : 'объявлений';
  return `Найдено ${count} ${noun}`;
}
