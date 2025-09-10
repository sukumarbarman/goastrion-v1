
pytest -q
pytest -s -q astro/tests/test_chart_api.py

By default, pytest hides print unless the test fails.

To always see it, run pytest with the -s flag.

pytest -q astro/tests/test_houses_e2e.py
