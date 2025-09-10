import pprint
import pytest
from rest_framework.test import APIClient

@pytest.mark.django_db
def test_planets_in_houses_for_1990_11_20_23_00_ist_snapshot():
    """
    Snapshot for:
      Date  : 1990-11-20
      Time  : 23:00 IST  => 1990-11-20T17:30:00Z
      Lat/Lon: 22.30, 87.92

    Expected houses (as seen in your frontend):
      1  -> Jupiter, Ketu
      5  -> Sun, Mercury, Venus
      6  -> Moon, Saturn
      7  -> Rahu
      11 -> Mars
      All others empty.
    """
    client = APIClient()
    payload = {
        "datetime": "1990-11-20T17:30:00Z",  # 23:00 IST => 17:30 UTC
        "lat": 22.30,
        "lon": 87.92,
        "tz_offset_hours": 5.5,
    }

    resp = client.post("/api/chart", payload, format="json")
    assert resp.status_code == 200, f"Bad status: {resp.status_code}, body={resp.data}"

    meta = resp.data.get("meta", {})
    bins = meta.get("planets_in_houses", {})
    assert isinstance(bins, dict), f"Missing bins in meta: {meta}"

    # Helpful debug print (see with: pytest -q -s)
    print("\n--- Planets in Houses (raw JSON) ---")
    pprint.pprint(bins)

    # Helper: get a set of occupants for a house (handles JSON keys as str)
    def occupants(house_num: int) -> set[str]:
        return set(bins.get(str(house_num), [])) or set(bins.get(house_num, []))

    # Expected non-empty houses
    expected = {
        1: {"Jupiter", "Ketu"},
        5: {"Sun", "Mercury", "Venus"},
        6: {"Moon", "Saturn"},
        7: {"Rahu"},
        11: {"Mars"},
    }

    # Assert expected houses match exactly
    for h, expected_set in expected.items():
        got = occupants(h)
        assert got == expected_set, f"House {h}: expected {expected_set}, got {got}"

    # Assert all remaining houses are empty
    all_houses = set(range(1, 13))
    empty_houses = all_houses - set(expected.keys())
    for h in sorted(empty_houses):
        got = occupants(h)
        assert got == set(), f"House {h} should be empty; got {got}"
