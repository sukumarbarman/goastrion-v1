for domain and skill

$ curl -s -X POST "http://127.0.0.1:8000/api/insights"   -H "Content-Type: application/json"   -d '{"datetime":"1990-11-20T17:30:00Z","lat":22.30,"lon":87.92,"tz_offset_hours":5.5}' | python -m json.tool


1 sudip
curl -s -X POST "http://127.0.0.1:8000/api/insights"   -H "Content-Type: application/json"   -d '{"datetime":"1990-11-20T17:30:00Z","lat":22.30,"lon":87.92,"tz_offset_hours":5.5}' | python -m json.tool



# Barack Obama — 1961-08-05 05:24:00Z, Honolulu 21.3069, −157.8583
curl -s -X POST "http://127.0.0.1:8000/api/insights" -H "Content-Type: application/json" -d '{"datetime":"1961-08-05T05:24:00Z","lat":21.3069,"lon":-157.8583,"tz_offset_hours":0}' | python -m json.tool

# Donald Trump (1946-06-14 10:54 EDT → 14:54:00Z) — Queens, NYC
curl -s -X POST "http://127.0.0.1:8000/api/insights" -H "Content-Type: application/json" -d '{"datetime":"1946-06-14T14:54:00Z","lat":40.7128,"lon":-74.0060,"tz_offset_hours":0}' | python -m json.tool


# Prince William (1982-06-21 21:03 BST → 20:03:00Z) — London
curl -s -X POST "http://127.0.0.1:8000/api/insights" -H "Content-Type: application/json" -d '{"datetime":"1982-06-21T20:03:00Z","lat":51.5074,"lon":-0.1278,"tz_offset_hours":0}' | python -m json.tool


# Steve Jobs
curl -s -X POST "http://127.0.0.1:8000/api/insights" -H "Content-Type: application/json" -d '{"datetime":"1955-02-25T03:15:00Z","lat":37.7749,"lon":-122.4194,"tz_offset_hours":0}' | python -m json.tool
# Princess Diana
curl -s -X POST "http://127.0.0.1:8000/api/insights" -H "Content-Type: application/json" -d '{"datetime":"1961-07-01T19:45:00Z","lat":52.8286,"lon":0.5150,"tz_offset_hours":0}' | python -m json.tool
# Bill Gates
curl -s -X POST "http://127.0.0.1:8000/api/insights" -H "Content-Type: application/json" -d '{"datetime":"1955-10-28T20:58:00Z","lat":47.6062,"lon":-122.3321,"tz_offset_hours":0}' | python -m json.tool
# Nikola Tesla
curl -s -X POST "http://127.0.0.1:8000/api/insights" -H "Content-Type: application/json" -d '{"datetime":"1856-07-10T00:00:00Z","lat":44.5600,"lon":15.2700,"tz_offset_hours":0}' | python -m json.tool


# Mahatma Gandhi
curl -s -X POST "http://127.0.0.1:8000/api/insights" -H "Content-Type: application/json" -d '{"datetime":"1869-10-02T03:06:19Z","lat":21.6417,"lon":69.6293,"tz_offset_hours":0}' | python -m json.tool


# saturn 

 curl -sS -X POST "http://127.0.0.1:8000/api/v1/saturn/overview"   -H "Content-Type: application/json"   -d '{"datetime":"1990-11-20T17:30:00Z","lat":22.30,"lon":87.92,"tz":"Asia/Kolkata","anchor":"birth","horizon_years":100}' | python -m json.tool

# subhdin
curl -sS -X POST "http://127.0.0.1:8000/api/v1/shubhdin/run"   -H "Content-Type: application/json"   -d '{"datetime":"1990-11-20T17:30:00Z","lat":22.30,"lon":87.92,"tz":"Asia/Kolkata","horizon_months":18}' | python -m json.tool

