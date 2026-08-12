from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def send_curator_notification(*, subject: str, body: str) -> bool:
    settings = get_settings()
    to = settings.curator_notification_email.strip()
    if not to:
        return False

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_address}>"
    message["To"] = to
    message.set_content(body)

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as smtp:
            smtp.send_message(message)
        return True
    except Exception:  # noqa: BLE001 - notifications must never break the flow
        logger.warning("Failed to send curator notification", exc_info=True)
        return False