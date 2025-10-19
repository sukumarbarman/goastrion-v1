# astro/api_daily.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .services.daily_personalizer import assemble_daily, DailyError
from .i18n import apply_i18n_daily  # ← ensure this import exists

class DailyRemediesView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []

    def post(self, request):
        try:
            payload = assemble_daily(request.data or {})
            # locale preference: explicit ?locale=xx first, then Accept-Language
            locale = request.query_params.get("locale") or None
            accept = request.headers.get("Accept-Language") or None
            payload = apply_i18n_daily(payload, locale=locale, accept_language=accept)
            return Response(payload, status=200)
        except DailyError as de:
            return Response({"error": str(de)}, status=400)
        except Exception as e:
            # Temporary debug hook: add ?debug=1 to see the traceback in the response
            if request.query_params.get("debug") == "1":
                import traceback
                return Response(
                    {"error": "internal error", "detail": str(e), "trace": traceback.format_exc()},
                    status=500,
                )
            return Response({"error": "internal error"}, status=500)
