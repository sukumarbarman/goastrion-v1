from __future__ import annotations
from typing import Dict, List

ZODIAC_SIGNS = [
    "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
    "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces",
]

_ROMAN = {1:"I",2:"II",3:"III",4:"IV",5:"V",6:"VI",7:"VII",8:"VIII",9:"IX",10:"X",11:"XI",12:"XII"}
def to_roman(n: int) -> str: return _ROMAN.get(n, str(n))

def render_north_indian_chart_svg(
    *, lagna_deg: float, lagna_sign: str,
    planets_in_houses: Dict[int, List[str]], size: int = 400
) -> str:
    cx = cy = size / 2
    house_coords = {
        1:(cx,cy-150),2:(cx-100,cy-175),3:(cx-175,cy-125),4:(cx-105,cy-20),
        5:(cx-160,cy+75),6:(cx-100,cy+150),7:(cx,cy+75),8:(cx+100,cy+150),
        9:(cx+160,cy+75),10:(cx+105,cy-20),11:(cx+160,cy-125),12:(cx+100,cy-175)
    }
    sign_coords = {
        1:(cx,cy-25),2:(cx-100,cy-125),3:(cx-125,cy-100),4:(cx-25,cy),
        5:(cx-125,cy+100),6:(cx-100,cy+125),7:(cx,cy+35),8:(cx+100,cy+125),
        9:(cx+125,cy+100),10:(cx+25,cy),11:(cx+125,cy-100),12:(cx+100,cy-125)
    }

    lagna_sign_index = ZODIAC_SIGNS.index(lagna_sign) + 1
    groups = []
    for house, (x,y) in house_coords.items():
        planets = planets_in_houses.get(house, [])
        sign_number = (lagna_sign_index + house - 1) % 12 or 12
        sign_name = ZODIAC_SIGNS[sign_number - 1]

        if house == 1:          data_role = "lagna"
        elif any(p.lower()=="sun" for p in planets):  data_role = "sun"
        elif any(p.lower()=="moon" for p in planets): data_role = "moon"
        else:                   data_role = f"house-{house}"

        lines = [f'<text x="{x}" y="{y}" font-size="14" text-anchor="middle" fill="lightgray" opacity="0.6">{to_roman(house)}</text>']
        cy_text = y + 30
        if house == 1:
            lines.append(f'<text x="{x}" y="{cy_text}" font-size="12" text-anchor="middle">As</text>')
            cy_text += 15
        for planet in planets:
            lines.append(f'<text x="{x}" y="{cy_text}" font-size="15" text-anchor="middle">{planet}</text>')
            cy_text += 15

        sx, sy = sign_coords[house]
        lines.append(f'<text x="{sx}" y="{sy}" font-size="11" font-weight="bold" fill="#444" text-anchor="middle">{sign_number}</text>')
        groups.append(f'<g id="house-{house}" data-role="{data_role}" data-sign="{sign_name}">' + "".join(lines) + "</g>")

    houses_svg = "\n".join(groups)
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">
  <rect x="0" y="0" width="{size}" height="{size}" stroke="black" fill="white" stroke-width="2" />
  <line x1="0" y1="0" x2="{size}" y2="{size}" stroke="black" />
  <line x1="{size}" y1="0" x2="0" y2="{size}" stroke="black" />
  <polygon points="{cx},0 {size},{cy} {cx},{size} 0,{cy}" stroke="black" fill="none" />
  {houses_svg}
</svg>"""
