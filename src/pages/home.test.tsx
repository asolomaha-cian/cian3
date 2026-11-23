import { render, screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from '@/App';
import { readSearches, saveSearch, sampleSearch } from '@/data/home';

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});
function open(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}
it('gives new users all five verticals and filters recommendations by real criteria', async () => {
  open('/?user=new');
  const nav = screen.getByRole('navigation', { name: 'Недвижимость по задачам' });
  expect(within(nav).getAllByRole('link')).toHaveLength(5);
  expect(screen.queryByText('ВАШ СОХРАНЁННЫЙ ПОИСК')).not.toBeInTheDocument();
  const feed = screen.getByRole('region', { name: 'Вам может подойти' });
  expect(within(feed).getAllByRole('article')).toHaveLength(8);
  await userEvent.click(screen.getByRole('button', { name: 'До 15 млн ₽' }));
  expect(within(feed).getAllByRole('article')).toHaveLength(3);
  expect(within(feed).queryByText('18 400 000 ₽')).not.toBeInTheDocument();
});
it('resumes a saved search with its filters after leaving and reopening the app', async () => {
  open('/search?q=Сокольники&rooms=2&maxPrice=20000000');
  await screen.findByText('Найдено 1 объявление');
  await userEvent.click(screen.getByRole('button', { name: 'Сохранить поиск' }));
  expect(readSearches()).toHaveLength(1);
  cleanup();
  open();
  expect(screen.getByText('ВАШ СОХРАНЁННЫЙ ПОИСК')).toBeVisible();
  await userEvent.click(screen.getByRole('link', { name: /ВАШ СОХРАНЁННЫЙ ПОИСК/ }));
  expect(await screen.findByText('Найдено 1 объявление')).toBeVisible();
  expect(screen.getByLabelText('Комнатность')).toHaveValue('2');
  expect(screen.getByLabelText('Цена до, ₽')).toHaveValue(20000000);
});
it('opens the right vertical, handles empty search, and returns from a preview', async () => {
  open();
  await userEvent.click(screen.getByRole('link', { name: 'Посуточно' }));
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Снять посуточно');
  await userEvent.click(screen.getByRole('button', { name: /5 200 ₽/ }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Бронирование');
  await userEvent.click(screen.getByRole('button', { name: 'Вернуться к вариантам' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  await userEvent.type(screen.getByLabelText('Район или метро'), 'Несуществующий район');
  await userEvent.click(screen.getByRole('button', { name: 'Показать варианты' }));
  expect(screen.getByText(/Ничего не нашли/)).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Сбросить запрос' }));
  expect(screen.getByText('Вариантов: 2')).toBeVisible();
  await userEvent.click(screen.getByRole('link', { name: '← На главную' }));
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Найдите своё.');
});
it('offers an empty saved-search state and deduplicates saved searches', async () => {
  open();
  await userEvent.click(screen.getByRole('button', { name: 'Мои поиски' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Сохраните параметры');
  expect(saveSearch(sampleSearch)).toBe(true);
  saveSearch(sampleSearch);
  expect(readSearches()).toHaveLength(1);
});
it('returns from a recommended listing to the same home state', async () => {
  open('/?user=returning');
  await userEvent.click(screen.getByRole('link', { name: /18\s400\s000 ₽/ }));
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('54 м²');
  await userEvent.click(screen.getByRole('link', { name: '← На главную' }));
  expect(screen.getByText('ВАШ СОХРАНЁННЫЙ ПОИСК')).toBeVisible();
});
it('ignores malformed saved data and stays usable when storage cannot be written', () => {
  localStorage.setItem('cian3:saved-searches:v1', '{broken');
  expect(readSearches()).toEqual([]);
  localStorage.setItem(
    'cian3:saved-searches:v1',
    JSON.stringify([{ ...sampleSearch, url: '//external.example' }]),
  );
  expect(readSearches()).toEqual([]);
  const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Storage unavailable');
  });
  expect(saveSearch(sampleSearch)).toBe(false);
  spy.mockRestore();
});
