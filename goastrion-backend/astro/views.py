# goastrion-backend/astro/views.py
from rest_framework import generics, permissions
from rest_framework.exceptions import APIException
from django.db.models.functions import Round

from .models import Chart
from .serializers import ChartSerializer

# --- tiny helper + API error (kept here to avoid new files) ---
class DuplicateChart(APIException):
    status_code = 409
    default_code = "duplicate"
    default_detail = "A matching chart already exists."

_TZ_ALIASES = {"IST": "Asia/Kolkata", "UTC": "UTC", "GMT": "Etc/GMT"}
def _norm_tz(s: str | None) -> str:
    s = (s or "").strip()
    return _TZ_ALIASES.get(s, s)


class ChartListCreateView(generics.ListCreateAPIView):
    serializer_class = ChartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Chart.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        user = self.request.user
        data = serializer.validated_data

        # normalize inputs for dupe check
        tz = _norm_tz(data.get("timezone"))
        dt = data["birth_datetime"].replace(microsecond=0)
        lat4 = round(float(data["latitude"]), 4)
        lon4 = round(float(data["longitude"]), 4)

        # check existing by rounded lat/lon + same dt/tz/user
        existing = (
            Chart.objects.filter(user=user, birth_datetime=dt, timezone=tz)
            .annotate(lat4=Round("latitude", 4), lon4=Round("longitude", 4))
            .filter(lat4=lat4, lon4=lon4)
            .order_by("-created_at")
            .first()
        )

        # allow client to bypass with force=true
        force = bool(data.get("force")) or str(self.request.data.get("force")).lower() in ("1", "true", "yes")

        if existing and not force:
            # 409 with existing chart payload so UX can show “Use existing / Save anyway”
            payload = ChartSerializer(existing).data
            raise DuplicateChart(detail={"message": "Duplicate chart", "existing": payload})

        # save (force or no duplicate)
        serializer.save(user=user, timezone=tz)


class ChartDeleteView(generics.DestroyAPIView):
    serializer_class = ChartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Chart.objects.filter(user=self.request.user)
