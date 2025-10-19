from rest_framework.renderers import JSONRenderer
import json

class UTF8JSONRenderer(JSONRenderer):
    charset = "utf-8"
    def render(self, data, accepted_media_type=None, renderer_context=None):
        if data is None:
            return b""
        return json.dumps(
            data,
            ensure_ascii=False,      # <<< key: keep real “–” etc.
            separators=(",", ":"),
        ).encode("utf-8")
