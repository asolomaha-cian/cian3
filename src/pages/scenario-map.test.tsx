import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import App from '@/App';

it('shows the scenario map, metric goals and A/B test plan', () => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  render(<MemoryRouter initialEntries={['/map']}><App /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: 'Как пользователь находит своё место' })).toBeVisible();
  expect(screen.getAllByText(/home_scenario_search_submit/).length).toBeGreaterThan(0);
  expect(screen.getByRole('heading', { name: 'A/B-тест новой главной' })).toBeVisible();
  expect(screen.getByRole('link', { name: 'Открыть экран: Главная' })).toHaveAttribute('href', '/?user=new');
});
