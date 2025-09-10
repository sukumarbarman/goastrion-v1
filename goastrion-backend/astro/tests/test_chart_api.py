# astro/tests/test_chart_api.py
import json
from django.urls import reverse

def test_chart_returns_vimshottari(client):
    url = reverse("chart")
    print("DEBUG: Chart API URL is", url)
    payload = {
        "datetime": "1990-11-20T17:30:00Z",  # UTC of 1990-11-20 23:00 IST
        "lat": 22.30,
        "lon": 87.92,
        "tz_offset_hours": 5.5,
    }
    resp = client.post(url, data=json.dumps(payload), content_type="application/json")
    assert resp.status_code == 200, resp.content

    data = resp.json()
    assert "meta" in data and "vimshottari" in data["meta"], "vimshottari missing in response meta"

    v = data["meta"]["vimshottari"]
    assert isinstance(v.get("mahadashas"), list) and len(v["mahadashas"]) > 0

    first = v["mahadashas"][0]
    # Expect Ketu first, starting exactly at the birth UTC instant
    assert first["lord"] == "Ketu"
    assert first["start"].startswith("1990-11-20T17:30:00"), first["start"]

    # Optional: debug info present & coherent
    dbg = data["meta"].get("vimshottari_debug", {})
    assert dbg.get("ayanamsa") == "lahiri"
    assert dbg.get("start_md_lord") == "Ketu"
