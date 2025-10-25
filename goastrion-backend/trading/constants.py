
HORA_SEQUENCE = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"]
DAY_LORD = {
    0: "Moon",     # Monday
    1: "Mars",     # Tuesday
    2: "Mercury",  # Wednesday
    3: "Jupiter",  # Thursday
    4: "Venus",    # Friday
    5: "Saturn",   # Saturday
    6: "Sun",      # Sunday
}
# Rahu/Yama/Gulika slot number maps (Mon=0..Sun=6)
# These map weekday -> slot index (0..7) within sunrise->sunset eighths
RAHU_SLOT = {6: 7, 0: 1, 1: 6, 2: 4, 3: 5, 4: 3, 5: 2}
YAMA_SLOT = {6: 4, 0: 3, 1: 2, 2: 1, 3: 0, 4: 6, 5: 5}
GULIKA_SLOT = {6: 6, 0: 5, 1: 4, 2: 3, 3: 2, 4: 1, 5: 0}

ASSET_AFFINITY = {
    "BANK": {"Jupiter": 10, "Venus": 4, "Saturn": 2},
    "FIN": {"Jupiter": 10, "Venus": 4, "Saturn": 2},
    "IT": {"Mercury": 8, "Moon": 3},
    "AUTO": {"Venus": 6, "Mercury": 4},
    "FMCG": {"Venus": 6, "Moon": 4},
    "PHARMA": {"Ketu": 5, "Moon": 3, "Mercury": 2},
    "METAL": {"Mars": 8, "Saturn": 3},
    "ENERGY": {"Sun": 6, "Mars": 6, "Saturn": 2},
    "REALTY": {"Saturn": 7, "Mars": 3},
    "PSU": {"Saturn": 7, "Jupiter": 3},
    "PVTBANK": {"Jupiter": 9, "Venus": 3},
    "GOLD": {"Venus": 7, "Moon": 4, "Saturn": 2},
    "SILVER": {"Venus": 6, "Moon": 4},
    "CRUDE": {"Mars": 8, "Sun": 4},
    "NATGAS": {"Mars": 8, "Sun": 3},
    "BTC": {"Uranus": 8, "Mercury": 4, "Mars": 3},
    "INDEX": {"Sun": 4, "Jupiter": 4, "Mercury": 3, "Moon": 3},
}

BIAS_THRESH_UP = 12
BIAS_THRESH_DOWN = -12
