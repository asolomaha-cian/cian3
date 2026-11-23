import { Link } from 'react-router-dom';
import { Badge } from '@/ui';
import s from './ScenarioMapPage.module.css';

type Screen = {
  id: string;
  title: string;
  description: string;
  metric: string;
  to: string;
  kind: 'home' | 'search' | 'listing' | 'vertical' | 'saved';
};

const screens: Screen[] = [
  {
    id: 'home',
    title: 'Главная',
    description: 'Первый визит: поиск, пять вертикалей и рекомендации.',
    metric: 'home_scenario_screen_view · step=screen_view, screen=home',
    to: '/?user=new',
    kind: 'home',
  },
  {
    id: 'returning',
    title: 'Главная с продолжением',
    description: 'Возвращающийся пользователь видит один сохранённый поиск.',
    metric: 'home_scenario_screen_view · step=screen_view, screen=home_returning',
    to: '/?user=returning',
    kind: 'saved',
  },
  {
    id: 'search',
    title: 'Выдача',
    description: 'Результаты, фильтры, сохранение поиска и переход в карточку.',
    metric: 'home_scenario_screen_view · step=screen_view, screen=search',
    to: '/search',
    kind: 'search',
  },
  {
    id: 'listing',
    title: 'Карточка объекта',
    description: 'Детали квартиры, избранное и контакт с продавцом.',
    metric: 'home_scenario_screen_view · step=screen_view, screen=listing',
    to: '/listing/1',
    kind: 'listing',
  },
  {
    id: 'vertical',
    title: 'Вертикаль',
    description: 'Подборка по задаче: аренда, новостройки, посуточно или коммерция.',
    metric: 'home_scenario_screen_view · step=screen_view, screen=vertical',
    to: '/explore/daily',
    kind: 'vertical',
  },
];

const transitions = [
  ['home', 'search', 'home_scenario_search_submit · step=home_search'],
  ['home', 'vertical', 'home_scenario_vertical_open · step=vertical_select, vertical=daily'],
  ['home', 'listing', 'home_scenario_recommendation_open · step=recommendation_open'],
  ['returning', 'search', 'home_scenario_resume_search · step=resume_search'],
  ['search', 'listing', 'home_scenario_listing_open · step=listing_open'],
  ['listing', 'search', 'home_scenario_back_to_results · step=return_to_results'],
] as const;

function ScreenPreview({ kind }: Pick<Screen, 'kind'>) {
  return (
    <div className={`${s.preview} ${s[kind]}`} aria-hidden="true">
      <i className={s.previewHeader} />
      {kind === 'home' && (
        <>
          <i className={s.searchLine} />
          <div className={s.pills}><i /><i /><i /></div>
          <div className={s.tiles}><i /><i /></div>
          <div className={s.cards}><i /><i /></div>
        </>
      )}
      {kind === 'saved' && (
        <>
          <i className={s.searchLine} />
          <i className={s.savedSearch} />
          <div className={s.cards}><i /><i /></div>
        </>
      )}
      {kind === 'search' && (
        <>
          <div className={s.filters}><i /><i /><i /></div>
          <div className={s.resultRows}><i /><i /><i /></div>
        </>
      )}
      {kind === 'listing' && (
        <>
          <i className={s.heroPhoto} />
          <i className={s.titleLine} />
          <i className={s.textLine} />
          <i className={s.actionLine} />
        </>
      )}
      {kind === 'vertical' && (
        <>
          <i className={s.searchLine} />
          <div className={s.resultRows}><i /><i /></div>
        </>
      )}
    </div>
  );
}

export function ScenarioMapPage() {
  return (
    <main className={s.page}>
      <header className={s.header}>
        <Link to="/" className={s.back}>← К прототипу</Link>
        <Badge tone="main">Карта сценария · Метрика</Badge>
        <h1>Как пользователь находит своё место</h1>
        <p>
          Интерактивная карта мобильного сценария. Нажмите на миниатюру, чтобы открыть экран;
          на карточках и переходах — имена целей и параметр <code>step</code>.
        </p>
      </header>

      <section className={s.map} aria-labelledby="map-title">
        <div className={s.mapHeading}>
          <h2 id="map-title">Экраны и переходы</h2>
          <span>Счётчик: <code>0</code> (заглушка)</span>
        </div>
        <div className={s.flow}>
          {screens.map((screen) => (
            <article key={screen.id} className={s.screen}>
              <Link to={screen.to} className={s.screenLink} aria-label={`Открыть экран: ${screen.title}`}>
                <ScreenPreview kind={screen.kind} />
                <div>
                  <h3>{screen.title}</h3>
                  <p>{screen.description}</p>
                </div>
              </Link>
              <code>{screen.metric}</code>
            </article>
          ))}
        </div>
        <div className={s.transitionList} aria-label="Переходы сценария">
          {transitions.map(([from, to, event]) => (
            <div key={`${from}-${to}`} className={s.transition}>
              <span className={s.route}>
                <b>{screens.find((screen) => screen.id === from)?.title}</b><i>→</i><b>{screens.find((screen) => screen.id === to)?.title}</b>
              </span>
              <code>{event}</code>
            </div>
          ))}
        </div>
      </section>

      <section className={s.experiment} aria-labelledby="experiment-title">
        <div>
          <Badge tone="positive">План эксперимента</Badge>
          <h2 id="experiment-title">A/B-тест новой главной</h2>
        </div>
        <dl>
          <div>
            <dt>Гипотеза</dt>
            <dd>Если на первом экране оставить поиск, вертикали и рекомендации, новые пользователи быстрее начнут поиск, а возвращающиеся продолжат прошлый выбор.</dd>
          </div>
          <div>
            <dt>Вариант B</dt>
            <dd>Новая главная: пять понятных вертикалей, один блок продолжения вместо истории и рекомендации сразу после первого экрана.</dd>
          </div>
          <div>
            <dt>Основная метрика</dt>
            <dd>Доля сессий главной с переходом в поиск, сохранённый поиск или карточку рекомендации: <code>home_scenario_search_submit</code>, <code>home_scenario_resume_search</code>, <code>home_scenario_recommendation_open</code>.</dd>
          </div>
          <div>
            <dt>Ограничивающая метрика</dt>
            <dd>Доля отказов с главной. Не запускаем вариант B, если она вырастет более чем на 1 п.п.</dd>
          </div>
          <div>
            <dt>Объём и срок</dt>
            <dd>По 20 000 уникальных пользователей в A и B (40 000 всего), минимум 14 полных дней. Решение — после набора выборки и проверки 95% доверительного интервала.</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
