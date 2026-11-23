# Циан помогает въехать

Промо мобильной главной из реальных экранов прототипа. Сценарий согласован
пользователем; финальный слоган: **«Циан помогает въехать»**.

- 15 секунд, 1920 × 1080, 16:9, 30 fps, MP4 H.264/yuv420p/BT.709, до 20 000 000 байт.
- Без озвучки. Фоновая музыка синтезирована скриптом скилла, без голоса и сэмплов;
  это временный черновой трек. Прослушивание человеком не проводилось.
- Бренд-профиль: `../brand/`; его снимок — в `brand/`.
- Готовый файл: `out/cian-home-promo.mp4`. Контактные листы — в `out/`.

## Результат проверки

Готово: 3 834 918 байт (3,83 МБ), ровно 15,000 секунды и 450 кадров.
Проверены декодирование, H.264/yuv420p, разметка BT.709, AAC 48 кГц,
громкость −15,7 LUFS и true peak −5,6 dBTP. Сцены детерминированы,
Lato загружен, последние 1,5 секунды статичны. Кадры из итогового MP4
просмотрены в контактном листе `out/cian-home-promo_sheet.jpg`.
Машиночитаемый отчёт: `out/verification.json`.

Проверки проекта: typecheck, lint, 18 тестов и production build — успешно.

## Бриф

Аудитория — пользователи мобильной главной; цель — промо; язык — русский.

| Время | Экран / действие | Промотекст |
| --- | --- | --- |
| 0–3 | `/?user=new`: поиск и категории | Найдите своё. |
| 3–7 | Прокрутка к рекомендациям, фильтр «У метро» | Выбирайте то, что подходит. |
| 7–12 | `/?user=returning` → сохранённый поиск → выдача | Продолжайте с того же места. |
| 12–15 | Главная, логотип и финальная надпись | Циан помогает въехать |

Из текущего прототипа взяты сами снимки, данные и действия; интерфейс не
перерисован. `assets/capture.json` содержит исходные URL, коммит и координаты
целей. Снимки сняты при 390 × 844 с DPR 2; объявления в прототипе вымышлены.
Переход между новым и возвращающимся пользователем — монтажная склейка.
Только рекламные надписи слева созданы для ролика, включая пояснения
«Уточняйте подборку прямо на главной» и «Ваши параметры уже на месте».

`video.html` строит каждый кадр как функцию времени. Реальные снимки страницы
и отдельно снятая фиксированная навигация компонуются в canvas; это позволяет
сохранить интерфейс при плавной прокрутке и избежать различий растеризации
CSS-слоёв при перемотке. Таймеров и записи экрана при рендере нет.

## Пересборка

Все команды из корня репозитория. Python-зависимости — в `.motion-env.local`.

```sh
# При изменении прототипа: запустить npm run dev -- --port 5175,
# затем обновить снимки реальными переходами.
.motion-env.local/bin/python motion/home-promo/capture.py --url http://127.0.0.1:5175

.motion-env.local/bin/python .agents/skills/product-motion/scripts/verify_scene.py motion/home-promo/video.html --fmt h --times 0,1,3.5,4.5,6,7.5,9.2,10.8,12.5,14.5 --json motion/home-promo/build/scene-checks.json
.motion-env.local/bin/python .agents/skills/product-motion/scripts/render.py motion/home-promo/video.html stills --fmt h --times 0.5,3.7,4.6,7.8,10.9,13.5 --out motion/home-promo/build/stills --sheet
.motion-env.local/bin/python .agents/skills/product-motion/scripts/render.py motion/home-promo/video.html video --fmt h --out motion/home-promo/build/h.mp4
.motion-env.local/bin/python .agents/skills/product-motion/scripts/music.py motion/home-promo/plan.js --out motion/home-promo/build/music-raw.wav
ffmpeg -y -v warning -i motion/home-promo/build/music-raw.wav -af loudnorm=I=-16:TP=-1.5:LRA=7 -ar 48000 motion/home-promo/build/music.wav
.motion-env.local/bin/python .agents/skills/product-motion/scripts/assemble.py --video motion/home-promo/build/h.mp4 --audio motion/home-promo/build/music.wav --out motion/home-promo/out/cian-home-promo.mp4
.motion-env.local/bin/python .agents/skills/product-motion/scripts/verify_media.py motion/home-promo/plan.js motion/home-promo/out/cian-home-promo.mp4 --sheet --times 0.5,3.7,4.6,7.8,10.9,13.5 --json motion/home-promo/build/media-checks.json
.motion-env.local/bin/python -c 'from pathlib import Path; p=Path("motion/home-promo/out/cian-home-promo.mp4"); assert p.stat().st_size < 20000000; print(p.stat().st_size)'
```

Превью: открыть `video.html?preview=1` через локальный HTTP-сервер.
`build/` и MP4 исключены из Git; сам файл остаётся на диске. Исходные снимки,
план и сцена сохранены для пересборки. Озвучка и SRT речи отсутствуют, поскольку
заказан ролик без голоса.
