import { Fragment, useState, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { Button, Icon, Input, Modal } from '@/ui';
import { FavoriteButton } from '@/components/Realty';
import { listings, money } from '@/data/listings';
import {
  readLastSearch,
  readSearches,
  rememberSearch,
  sampleSearch,
  saveSearch,
  verticals,
} from '@/data/home';
import { usePrototype } from '@/hooks/prototype-context';
import s from './MobileHomePage.module.css';

function Drawing({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    home: (
      <>
        <path d="m3 12 9-8 9 8M6 10v11h12V10" />
        <path d="M10 21v-7h4v7" />
      </>
    ),
    key: (
      <>
        <circle cx="8" cy="9" r="5" />
        <path d="m12 13 8 8m-4-4 3-3m-6 0 3-3" />
      </>
    ),
    building: (
      <>
        <path d="M4 21V7h8v14M12 21V3h8v18M2 21h20M7 11h2m-2 4h2m6-8h2m-2 4h2m-2 4h2" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M7 3v4m10-4v4M3 10h18m-13 5h2m4 0h2" />
      </>
    ),
    case: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="3" />
        <path d="M8 7V4h8v3M3 13c5 3 13 3 18 0m-9 0v4" />
      </>
    ),
    bookmark: <path d="M6 3h12v18l-6-4-6 4z" />,
  };
  return (
    <svg
      aria-hidden="true"
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name] || paths.home}
    </svg>
  );
}

export function MobileHomePage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { favorites, showDemo } = usePrototype();
  const [savedOpen, setSavedOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [filter, setFilter] = useState('Для вас');
  const [query, setQuery] = useState('');
  const saved = readSearches();
  const returning = params.get('user') === 'returning';
  const fresh = params.get('user') === 'new';
  const searches = fresh ? [] : saved.length ? saved : returning ? [sampleSearch] : [];
  const last = fresh ? undefined : readLastSearch();
  const resume = searches[0] || last;
  const visible = listings.filter((item) =>
    filter === 'У метро'
      ? item.walkMinutes <= 8
      : filter === 'До 15 млн ₽'
        ? item.price <= 15000000
        : filter === 'Просторные'
          ? item.area >= 60
          : true,
  );
  function search() {
    const url = query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search';
    rememberSearch({ label: query.trim() || 'Квартиры в Москве', detail: 'Покупка квартиры', url });
    navigate(url);
  }
  return (
    <div className={s.stage}>
      <div className={s.app}>
        <a className="skip-link" href="#main">
          К содержимому
        </a>
        <header className={s.header}>
          <img src="/images/logo.svg" alt="Циан" width="96" height="26" />
          <button className={s.city} onClick={() => setRegionOpen(true)}>
            <Icon name="MapLocation16" size={16} /> Москва <span>⌄</span>
          </button>
        </header>
        <main id="main">
          <section className={s.intro} aria-label="Поиск недвижимости">
            <div className={s.headline}>
              <div>
                <p className={s.eyebrow}>У КАЖДОГО СВОЁ МЕСТО</p>
                <h1>
                  Найдите <span>своё.</span>
                </h1>
              </div>
              <div className={s.brandMark} aria-hidden="true">
                <span />
                <i />
              </div>
            </div>
            <form
              className={s.search}
              onSubmit={(event) => {
                event.preventDefault();
                search();
              }}
            >
              <Icon name="ActionSearch16" size={22} />
              <label className="sr-only" htmlFor="home-query">
                Город, район или метро
              </label>
              <input
                id="home-query"
                placeholder="Район, метро или адрес"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button type="submit" aria-label="Найти квартиру">
                <Icon name="ActionArrowUpRight16" size={22} />
              </button>
            </form>
            <nav className={s.verticals} aria-label="Недвижимость по задачам">
              {verticals.map((v) => (
                <Link key={v.id} to={v.id === 'buy' ? '/search' : `/explore/${v.id}`}>
                  <span className={`${s.verticalIcon} ${s[v.id]}`}>
                    <Drawing name={v.icon} />
                  </span>
                  <span>{v.label}</span>
                </Link>
              ))}
            </nav>
            {resume && (
              <Link className={s.resume} to={resume.url}>
                <span className={s.resumeIcon}>
                  <Drawing name="bookmark" />
                </span>
                <span>
                  <small>{searches.length ? 'ВАШ СОХРАНЁННЫЙ ПОИСК' : 'ВЫ НЕДАВНО ИСКАЛИ'}</small>
                  <strong>{resume.label}</strong>
                  <span>{resume.detail}</span>
                </span>
                <Icon name="ActionChevronRight16" />
              </Link>
            )}
          </section>
          <section className={s.feed} aria-labelledby="recommendations-title">
            <div className={s.sectionTitle}>
              <div>
                <p className={s.eyebrow}>
                  {resume ? 'ПРОДОЛЖАЙТЕ ВЫБИРАТЬ' : 'ВАШ НОВЫЙ АДРЕС — ГДЕ-ТО ЗДЕСЬ'}
                </p>
                <h2 id="recommendations-title">Вам может подойти</h2>
              </div>
              <span className={s.spark} aria-hidden="true">
                ✳
              </span>
            </div>
            <div className={s.chips} aria-label="Подборки рекомендаций">
              {['Для вас', 'У метро', 'До 15 млн ₽', 'Просторные'].map((label) => (
                <button
                  key={label}
                  aria-pressed={filter === label}
                  onClick={() => setFilter(label)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className={s.cards}>
              {visible.map((item, index) => (
                <Fragment key={item.id}>
                  <article className={s.card}>
                    <div className={s.photo}>
                      <Link
                        to={`/listing/${item.id}`}
                        state={{ from: '/' + (params.size ? `?${params}` : '') }}
                        tabIndex={-1}
                        aria-hidden="true"
                      >
                        <img src={item.images[0]} alt="" loading={index < 2 ? 'eager' : 'lazy'} />
                      </Link>
                      <FavoriteButton listing={item} />
                      {index === 0 && <span className={s.photoLabel}>Хорошая цена</span>}
                    </div>
                    <Link
                      className={s.cardLink}
                      to={`/listing/${item.id}`}
                      state={{ from: '/' + (params.size ? `?${params}` : '') }}
                    >
                      <strong>{money(item.price)}</strong>
                      <span>
                        {item.rooms || 'Студия'}
                        {item.rooms ? '-комн.' : ''} · {item.area} м² · {item.floor}/{item.floors}{' '}
                        эт.
                      </span>
                      <span className={s.metro}>
                        <b>м</b> {item.metro} <small>· {item.walkMinutes} мин.</small>
                      </span>
                      <small>{item.address}</small>
                    </Link>
                  </article>
                  {index === 3 && (
                    <aside className={s.ad} aria-label="Рекламное размещение">
                      <div>
                        <span className={s.adLabel}>Реклама · Демо</span>
                        <h3>
                          Ближе к парку.
                          <br />
                          Ближе к своему.
                        </h3>
                        <p>Откройте квартиры в Сокольниках</p>
                        <Link to="/search?q=Сокольники">
                          Посмотреть <Icon name="ActionArrowUpRight16" size={16} />
                        </Link>
                      </div>
                      <div className={s.adArt} aria-hidden="true">
                        <i />
                        <i />
                        <i />
                        <span />
                      </div>
                    </aside>
                  )}
                </Fragment>
              ))}
            </div>
            <Link className={s.allResults} to="/search">
              Больше квартир в Москве <Icon name="ActionChevronRight16" size={16} />
            </Link>
          </section>
          <section className={s.collections}>
            <p className={s.eyebrow}>НЕДВИЖИМОСТЬ ДЛЯ ЖИЗНИ</p>
            <h2>А если сменить обстановку?</h2>
            <Link className={s.collection} to="/explore/daily">
              <img
                src="/images/apartment-4.webp"
                alt="Светлая гостиная с большими окнами"
                loading="lazy"
              />
              <span>
                <small>НА ВЫХОДНЫЕ ИЛИ ЧУТЬ ДОЛЬШЕ</small>
                <strong>Пожить по-новому</strong>
                <span>
                  Квартиры посуточно <Icon name="ActionArrowUpRight16" size={18} />
                </span>
              </span>
            </Link>
          </section>
          <footer className={s.demoTools}>
            <p>Кликабельный прототип · объявления вымышлены</p>
            <fieldset>
              <legend>Состояние главной</legend>
              <button aria-pressed={!resume} onClick={() => setParams({ user: 'new' })}>
                Первый визит
              </button>
              <button aria-pressed={!!resume} onClick={() => setParams({ user: 'returning' })}>
                Есть сохранённый поиск
              </button>
            </fieldset>
          </footer>
        </main>
        <nav className={s.tabbar} aria-label="Навигация приложения">
          <Link to="/" aria-current="page">
            <Drawing name="home" />
            <span>Главная</span>
          </Link>
          <Link to="/search?favorites=1" aria-label={`Избранное: ${favorites.length}`}>
            <Icon name="Heart" size={24} />
            <span>Избранное{favorites.length > 0 ? ` · ${favorites.length}` : ''}</span>
          </Link>
          <button onClick={() => setSavedOpen(true)}>
            <Drawing name="bookmark" />
            <span>Мои поиски</span>
          </button>
          <button onClick={() => showDemo('Сообщения')}>
            <Icon name="Message" size={24} />
            <span>Сообщения</span>
          </button>
        </nav>
        <Modal open={savedOpen} title="Мои поиски" onClose={() => setSavedOpen(false)}>
          <div className="stack">
            {searches.length ? (
              searches.map((item) => (
                <Link key={item.url} className={s.savedItem} to={item.url}>
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                  <span>Открыть объявления →</span>
                </Link>
              ))
            ) : (
              <>
                <p>
                  Сохраните параметры на странице поиска, чтобы новые варианты всегда были под
                  рукой.
                </p>
                <Button
                  onClick={() => {
                    setSavedOpen(false);
                    navigate('/search');
                  }}
                >
                  Найти квартиру
                </Button>
              </>
            )}
          </div>
        </Modal>
        <Modal open={regionOpen} title="Ваш город — Москва" onClose={() => setRegionOpen(false)}>
          <div className="stack">
            <p>В этом прототипе доступны демонстрационные объявления Москвы.</p>
            <Button onClick={() => setRegionOpen(false)}>Всё верно</Button>
          </div>
        </Modal>
      </div>
      <aside className={s.reviewPanel}>
        <span>ЦИАН / НОВАЯ ГЛАВНАЯ</span>
        <h2>
          Сначала —<br />
          ваше место.
        </h2>
        <p>
          Мобильный прототип
          <br />
          Поиск, рекомендации и возвращение к выбору.
        </p>
        <fieldset>
          <legend>Посмотреть состояние</legend>
          <button aria-pressed={!resume} onClick={() => setParams({ user: 'new' })}>
            Новый пользователь <span>↗</span>
          </button>
          <button aria-pressed={!!resume} onClick={() => setParams({ user: 'returning' })}>
            Возвращающийся <span>↗</span>
          </button>
        </fieldset>
        <small>Макет приложения · прокрутите ленту</small>
      </aside>
    </div>
  );
}

const previews: Record<
  string,
  { title: string; price: string; description: string; image: number }[]
> = {
  rent: [
    {
      title: '2-комн. квартира, 54 м²',
      price: '85 000 ₽/мес.',
      description: 'Сокольники · 7 минут до метро',
      image: 1,
    },
    {
      title: '1-комн. квартира, 38 м²',
      price: '65 000 ₽/мес.',
      description: 'Сокол · 9 минут до метро',
      image: 2,
    },
  ],
  new: [
    {
      title: 'ЖК «Зелёный квартал»',
      price: 'от 12,9 млн ₽',
      description: 'Сокол · сдача в 2027 году',
      image: 3,
    },
    {
      title: 'ЖК «Парк у дома»',
      price: 'от 18,4 млн ₽',
      description: 'Сокольники · дом сдан',
      image: 6,
    },
  ],
  daily: [
    {
      title: 'Квартира для выходных, 42 м²',
      price: '5 200 ₽/сутки',
      description: 'Пражская · до 2 гостей',
      image: 4,
    },
    {
      title: 'Светлая студия, 29 м²',
      price: '3 800 ₽/сутки',
      description: 'Царицыно · до 2 гостей',
      image: 5,
    },
  ],
  business: [
    {
      title: 'Офис с отдельным входом, 84 м²',
      price: '126 000 ₽/мес.',
      description: 'Раменки · помещение свободно',
      image: 8,
    },
    {
      title: 'Офис у метро, 62 м²',
      price: '93 000 ₽/мес.',
      description: 'Сокольники · помещение свободно',
      image: 7,
    },
  ],
};
export function ExplorePage() {
  const { vertical = '' } = useParams();
  const category = verticals.find((item) => item.id === vertical);
  const [params, setParams] = useSearchParams();
  const [details, setDetails] = useState<number | null>(null);
  const { notify } = usePrototype();
  const items = previews[vertical] || [];
  const query = (params.get('q') || '').toLocaleLowerCase('ru').trim();
  const found = items.filter(
    (item) =>
      !query || `${item.title} ${item.description} Москва`.toLocaleLowerCase('ru').includes(query),
  );
  const title = category?.title || 'Недвижимость';
  const selected = details !== null ? found[details] : undefined;
  return (
    <div className={s.explore}>
      <Link className={s.back} to="/">
        ← На главную
      </Link>
      <p className={s.eyebrow}>МОСКВА · ДЕМОНСТРАЦИОННАЯ ПОДБОРКА</p>
      <h1>{title}</h1>
      <form
        className="stack"
        key={vertical + params.toString()}
        onSubmit={(e) => {
          e.preventDefault();
          const q = String(new FormData(e.currentTarget).get('q') || '').trim();
          const next = new URLSearchParams(q ? { q } : {});
          setParams(next);
          rememberSearch({
            label: title,
            detail: q || 'Москва',
            url: `/explore/${vertical}${q ? `?${next}` : ''}`,
          });
        }}
      >
        <Input
          label="Район или метро"
          name="q"
          defaultValue={params.get('q') || ''}
          placeholder="Например, Сокольники"
        />
        <Button type="submit">Показать варианты</Button>
      </form>
      <button
        className={s.saveButton}
        onClick={() => {
          const ok = saveSearch({
            label: title,
            detail: query || 'Москва',
            url: `/explore/${vertical}${params.size ? `?${params}` : ''}`,
          });
          notify(
            ok
              ? 'Поиск сохранён — он появится на главной'
              : 'Не удалось сохранить поиск: хранилище недоступно',
          );
        }}
      >
        Сохранить поиск
      </button>
      <p className="muted">
        {found.length
          ? `Вариантов: ${found.length}`
          : 'Ничего не нашли. Попробуйте другой район или сбросьте запрос.'}
      </p>
      {!found.length && (
        <Button theme="main_secondary" onClick={() => setParams({})}>
          Сбросить запрос
        </Button>
      )}
      {found.map((item, index) => (
        <button key={item.title} className={s.previewCard} onClick={() => setDetails(index)}>
          <img src={`/images/apartment-${item.image}.webp`} alt="" />
          <span>
            <strong>{item.price}</strong>
            <b>{item.title}</b>
            <span>{item.description}</span>
          </span>
        </button>
      ))}
      <p className={s.disclaimer}>
        Учебные примеры, не реальные предложения. Фото — иллюстрации интерьера; изображения ЖК и
        офисов не представлены.
      </p>
      <Modal open={!!selected} title={selected?.title || ''} onClose={() => setDetails(null)}>
        {selected && (
          <div className="stack">
            <img src={`/images/apartment-${selected.image}.webp`} alt="Иллюстрация интерьера" />
            <h2>{selected.price}</h2>
            <p>{selected.description}</p>
            <p>
              Это демонстрационная карточка. Бронирование, связь с владельцем и реальные сделки в
              прототипе недоступны.
            </p>
            <Button onClick={() => setDetails(null)}>Вернуться к вариантам</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
