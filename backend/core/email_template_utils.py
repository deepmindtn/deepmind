from email.mime.image import MIMEImage
from pathlib import Path
from urllib.parse import urljoin

from django.conf import settings
from django.template import Context, Template


LEGACY_LOGO_PATHS = (
    "src='/favicon_deepmind.png'",
    'src="/favicon_deepmind.png"',
)
CID_LOGO = "cid:deepmind-logo"
CONTENT_ID = "<deepmind-logo>"


def _get_logo_file_path() -> Path | None:
    candidates = [
        Path(settings.BASE_DIR) / "core" / "assets" / "favicon_deepmind.png",
        Path(settings.BASE_DIR) / "core" / "assets" / "favicon_deepmind.ico",
    ]
    for path in candidates:
        if path.exists() and path.is_file():
            return path
    return None


def _get_logo_url(context: dict | None = None) -> str:
    ctx = context or {}
    explicit = ctx.get("logoUrl")
    if explicit:
        return str(explicit)

    logo_file = _get_logo_file_path()
    if logo_file:
        return CID_LOGO

    configured = getattr(settings, "EMAIL_LOGO_URL", "")
    if configured:
        return str(configured)

    base = (getattr(settings, "FRONTEND_URL", "") or "").rstrip("/") + "/"
    return urljoin(base, "favicon_deepmind.png")


def render_email_subject_and_body(template_obj, context: dict | None = None) -> tuple[str, str]:
    """Render email subject/body and normalize legacy relative logo paths to absolute URLs."""
    ctx = dict(context or {})
    ctx.setdefault("logoUrl", _get_logo_url(ctx))

    subject = Template(template_obj.subject).render(Context(ctx))
    html_body = Template(template_obj.body).render(Context(ctx))

    for legacy in LEGACY_LOGO_PATHS:
        html_body = html_body.replace(legacy, f"src='{ctx['logoUrl']}'")

    return subject, html_body


def attach_inline_logo(email_message) -> bool:
    """Attach inline logo image to HTML email when local asset is available."""
    logo_path = _get_logo_file_path()
    if not logo_path:
        return False

    subtype = "png" if logo_path.suffix.lower() == ".png" else "octet-stream"
    with open(logo_path, "rb") as logo_file:
        img = MIMEImage(logo_file.read(), _subtype=subtype)

    img.add_header("Content-ID", CONTENT_ID)
    img.add_header("Content-Disposition", "inline", filename=logo_path.name)
    email_message.attach(img)
    return True
