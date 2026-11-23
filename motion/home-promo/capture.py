#!/usr/bin/env python3
"""Снимки реального прототипа; запуск из корня репозитория.

.motion-env.local/bin/python motion/home-promo/capture.py --url http://127.0.0.1:5175
Не меняет код приложения. Панель навигации снимается отдельно для сохранения
её фиксированного положения при детерминированной прокрутке снимка страницы.
"""
import argparse
import json
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--url', default='http://127.0.0.1:5175')
    a = ap.parse_args()
    assets = ROOT / 'assets'
    assets.mkdir(exist_ok=True)
    meta = {'base_url': a.url, 'viewport': [390, 844], 'device_scale_factor': 2,
            'source_commit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip(),
            'screens': {}, 'errors': []}
    with sync_playwright() as p:
        browser = p.chromium.launch(args=['--force-color-profile=srgb', '--hide-scrollbars'])
        context = browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2,
                                      reduced_motion='reduce')
        page = context.new_page()
        page.on('pageerror', lambda e: meta['errors'].append(str(e)))

        def settle():
            page.evaluate('document.fonts.ready')
            page.locator('img').evaluate_all("els => els.forEach(i => i.loading = 'eager')")
            page.locator('img').evaluate_all("els => Promise.all(els.map(i => i.decode().catch(() => {})))")

        def capture(name, tabbar=True):
            settle()
            info = {'url': page.url, 'scroll_y': page.evaluate('scrollY')}
            if tabbar:
                nav = page.get_by_role('navigation', name='Навигация приложения')
                info['tabbar'] = nav.bounding_box()
                nav.screenshot(path=str(assets / (name + '-nav.png')), animations='disabled')
                # Только слой прокрутки: фиксированная навигация взята отдельным снимком выше.
                hidden_nav = page.add_style_tag(content='nav[aria-label="Навигация приложения"]{visibility:hidden!important}')
            page.screenshot(path=str(assets / (name + '.jpg')), full_page=True, quality=96,
                            animations='disabled')
            if tabbar:
                hidden_nav.evaluate('(el) => el.remove()')
            meta['screens'][name] = info

        page.goto(a.url + '/?user=new', wait_until='networkidle')
        page.evaluate('localStorage.clear()')
        page.reload(wait_until='networkidle')
        capture('home-new')
        button = page.get_by_role('button', name='У метро', exact=True)
        meta['filter_target'] = button.bounding_box()
        button.click()
        assert button.get_attribute('aria-pressed') == 'true'
        page.evaluate('scrollTo(0,0)')
        capture('home-metro')

        page.goto(a.url + '/?user=returning', wait_until='networkidle')
        resume = page.get_by_role('link').filter(has_text='ВАШ СОХРАНЁННЫЙ ПОИСК')
        meta['resume_target'] = resume.bounding_box()
        capture('home-returning')
        resume.click()
        page.wait_for_url('**/search?**')
        page.get_by_role('heading', name='Продажа квартир в Москве', exact=True).wait_for()
        page.locator('[aria-label="Объявления"] article').first.wait_for()
        page.get_by_role('status', name='Загрузка объявлений').wait_for(state='hidden')
        settle()
        page.evaluate('scrollTo(0,0)')
        capture('search-results', tabbar=False)
        assert 'q=%D0%A1%D0%BE%D0%BA%D0%BE%D0%BB%D1%8C%D0%BD%D0%B8%D0%BA%D0%B8' in page.url or 'q=Сокольники' in page.url
        assert 'rooms=2' in page.url and 'maxPrice=20000000' in page.url
        meta['result_heading'] = page.get_by_role('heading', level=1).inner_text()
        meta['result_badge'] = page.get_by_text('Сокольники · Комнат: 2 · До 20\u00a0000\u00a0000 ₽', exact=False).all_text_contents()
        browser.close()
    (assets / 'capture.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2) + '\n')
    (assets / 'capture.js').write_text('window.CAPTURE = ' + json.dumps(meta, ensure_ascii=False) + ';\n')
    assert not meta['errors'], meta['errors']
    print(json.dumps(meta, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
