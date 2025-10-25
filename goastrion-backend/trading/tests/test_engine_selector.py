
import pytest
from datetime import date
from trading.models import SessionRules, TradingAsset
from trading.services.engine import compute_daily_bands
from trading.services.selector import pick_big_move_windows

@pytest.mark.django_db
def test_engine_and_selector_pipeline(db):
    sr = SessionRules.objects.create(name="NSE", tz_str="Asia/Kolkata", open_1="09:15", close_1="15:30")
    asset = TradingAsset.objects.create(id="NIFTY_50", name="NIFTY 50", kind="index", session_rules=sr)
    td = compute_daily_bands(asset, date(2025,1,2), force=True)
    assert td.bands, "bands should not be empty"
    win = pick_big_move_windows(td.bands)
    assert len(win) <= 2
