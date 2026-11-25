"""Level 3 low-awkwardness Nudge message generator."""

from app.schemas import NudgeResponse, NudgeTone


def format_currency(amount_cents: int, currency: str = "USD") -> str:
    """Format integer cents into a human-readable currency string."""
    whole = amount_cents // 100
    cents = amount_cents % 100
    symbol = "$" if currency.upper() == "USD" else f"{currency.upper()} "
    return f"{symbol}{whole:,}.{cents:02d}"


def generate_nudge_message(
    trip_name: str,
    currency: str,
    from_member_name: str,
    to_member_name: str,
    amount_cents: int,
    tone: NudgeTone = NudgeTone.CASUAL,
) -> NudgeResponse:
    """Generate a warm, low-awkwardness payment reminder for a debtor-to-creditor transfer."""
    formatted = format_currency(amount_cents, currency)
    debtor_first = from_member_name.split()[0]
    creditor_first = to_member_name.split()[0]

    if tone == NudgeTone.PLAYFUL:
        message = (
            f"Hey {debtor_first}! Hope you're still recovering from {trip_name} — "
            f"the trip math says {formatted} to {creditor_first} squares everything up in one go. "
            f"Whenever you get a sec, no rush!"
        )
    elif tone == NudgeTone.DIRECT:
        message = (
            f"Hi {debtor_first}, wrapping up {trip_name} expenses: "
            f"your simplified settle-up transfer to {creditor_first} is {formatted}. "
            f"Let me know once sent—thanks!"
        )
    else:
        message = (
            f"Hey {debtor_first}! Wrapping up our {trip_name} split so nobody has to track spreadsheets — "
            f"looks like {formatted} to {creditor_first} settles your whole trip share. "
            f"Whenever works for you!"
        )

    return NudgeResponse(
        trip_name=trip_name,
        from_member_name=from_member_name,
        to_member_name=to_member_name,
        amount_cents=amount_cents,
        tone=tone,
        message=message,
    )
