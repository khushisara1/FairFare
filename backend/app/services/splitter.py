"""Remainder-safe integer-cent expense splitting service."""

from typing import Optional

from app.models import SplitMode
from app.schemas import CustomSplitInput


def distribute_equal_cents(amount_cents: int, participant_ids: list[int]) -> dict[int, int]:
    """Split amount_cents evenly across participants, distributing remainder cents deterministically."""
    if amount_cents <= 0:
        raise ValueError("Expense amount must be greater than 0 cents.")
    unique_ids = sorted(set(participant_ids))
    if not unique_ids:
        raise ValueError("At least one participant is required to split an expense.")

    count = len(unique_ids)
    base_share = amount_cents // count
    remainder = amount_cents % count
    shares = {
        member_id: base_share + (1 if idx < remainder else 0)
        for idx, member_id in enumerate(unique_ids)
    }
    assert sum(shares.values()) == amount_cents
    return shares


def calculate_splits(
    amount_cents: int,
    split_mode: SplitMode,
    trip_member_ids: set[int],
    participant_ids: Optional[list[int]] = None,
    custom_splits: Optional[list[CustomSplitInput]] = None,
) -> dict[int, int]:
    """Compute and validate per-member integer-cent shares for equal, subset, or custom splits."""
    if amount_cents <= 0:
        raise ValueError("Expense amount must be greater than 0 cents.")
    if not trip_member_ids:
        raise ValueError("Trip must have at least one member before logging expenses.")

    if split_mode == SplitMode.EQUAL:
        return distribute_equal_cents(amount_cents, list(trip_member_ids))

    if split_mode == SplitMode.SUBSET:
        if not participant_ids:
            raise ValueError("Subset split requires at least one selected participant.")
        invalid_ids = set(participant_ids) - trip_member_ids
        if invalid_ids:
            raise ValueError(f"Participants {sorted(invalid_ids)} do not belong to this trip.")
        return distribute_equal_cents(amount_cents, participant_ids)

    if split_mode == SplitMode.CUSTOM:
        if not custom_splits:
            raise ValueError("Custom split requires explicit per-member share amounts.")
        seen_ids: set[int] = set()
        shares: dict[int, int] = {}
        for item in custom_splits:
            if item.member_id not in trip_member_ids:
                raise ValueError(f"Member {item.member_id} does not belong to this trip.")
            if item.member_id in seen_ids:
                raise ValueError(f"Duplicate member_id {item.member_id} in custom splits.")
            if item.share_cents < 0:
                raise ValueError("Custom share cannot be negative.")
            seen_ids.add(item.member_id)
            shares[item.member_id] = item.share_cents

        total_custom = sum(shares.values())
        if total_custom != amount_cents:
            diff = amount_cents - total_custom
            raise ValueError(
                f"Custom split total ({total_custom} cents) must equal expense amount "
                f"({amount_cents} cents); difference is {diff} cents."
            )
        return shares

    raise ValueError(f"Unsupported split mode: {split_mode}")
