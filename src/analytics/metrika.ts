/**
 * Единая точка интеграции с Яндекс Метрикой для прототипа.
 * Замените значение на настоящий ID счётчика при подключении аналитики.
 */
export const METRIKA_COUNTER_ID = 0;

type GoalParams = Record<string, string | number | boolean | undefined> & { step: string };

declare global {
  interface Window {
    ym?: (counterId: number, action: 'reachGoal', goal: string, params?: GoalParams) => void;
  }
}

export function reachMetrikaGoal(goal: string, params: GoalParams) {
  // В учебном прототипе ym не подключён. Вызов останется рабочим после установки счётчика.
  window.ym?.(METRIKA_COUNTER_ID, 'reachGoal', goal, params);
}

export function trackScenarioScreen(screen: string) {
  reachMetrikaGoal('home_scenario_screen_view', { step: 'screen_view', screen });
}
