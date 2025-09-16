for domain and skill

$ curl -s -X POST "http://127.0.0.1:8000/api/insights"   -H "Content-Type: application/json"   -d '{"datetime":"1990-11-20T17:30:00Z","lat":22.30,"lon":87.92,"tz_offset_hours":5.5}' | python -m json.tool
