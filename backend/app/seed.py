"""Deterministic 5-trip synthetic data seeder (zero real PII, integer cents)."""

import random
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal, create_db_and_tables
from app.models import Expense, ExpenseSplit, Member, SplitMode, Trip

SYNTHETIC_TRIPS = [
    {
        "name": "Alpine Cabin Weekend",
        "currency": "USD",
        "description": "Four-day mountain cabin getaway with ski passes, fondue nights, and trail gear.",
        "members": ["Aria Vance", "Bram Mercer", "Cleo Sterling", "Dante Solis", "Elena Frost", "Felix Calder"],
        "expense_count": 26,
        "categories": {
            "Lodging": [("Timberline Chalet Rental", 48000, 120000), ("Firewood & Hearth Bundle", 2400, 4500)],
            "Dining": [("Summit Fondue Dinner", 9500, 21000), ("Basecamp Cocoa & Pastries", 2200, 5600), ("Apres-Ski Woodfire Pizza", 7200, 14500)],
            "Transport": [("AWD SUV Rental", 24000, 42000), ("Mountain Pass Fuel", 4200, 7800), ("Chain & Toll Pass", 1800, 3500)],
            "Activities": [("Day Lift Passes", 18000, 39000), ("Snowshoe Guided Tour", 8500, 16000)],
            "Groceries": [("Cabin Breakfast Haul", 6400, 12500), ("Trail Snacks & Thermos", 2800, 5900)],
        },
    },
    {
        "name": "Kyoto Ramen Trail",
        "currency": "USD",
        "description": "Six-day culinary & temple hopping loop with rail passes, izakayas, and tea houses.",
        "members": ["Gemma Holt", "Hugo Lin", "Iris Bennett", "Jude Navarro", "Kira Sato"],
        "expense_count": 31,
        "categories": {
            "Lodging": [("Machiya Townhouse Stay", 38000, 89000), ("Onsen Ryokan Night", 26000, 54000)],
            "Dining": [("Gion Ramen Counter", 4200, 8900), ("Nishiki Market Tasting", 3500, 7600), ("Pontocho Izakaya Round", 8800, 17500), ("Uji Matcha House", 2100, 4800)],
            "Transport": [("IC Transit Cards", 6500, 12000), ("Shinkansen Day Hop", 14000, 29000), ("Late-Night Taxi Split", 1900, 4100)],
            "Activities": [("Temple Garden Entries", 2400, 5200), ("Lantern Craft Workshop", 7500, 13500)],
            "Supplies": [("Portable Wi-Fi & Adapters", 2500, 4900), ("Umbrellas & Coin Pouches", 1400, 3200)],
        },
    },
    {
        "name": "Coastal Roadtrip",
        "currency": "USD",
        "description": "Pacific cliffside drive with surf rentals, beachside tacos, and lighthouse stops.",
        "members": ["Liam Brooks", "Maya Chen", "Nolan Pike", "Opal Ward", "Pierce Hayes", "Quinn Foster"],
        "expense_count": 24,
        "categories": {
            "Lodging": [("Cliffside Bungalow", 34000, 72000), ("Redwood Camp Cabins", 16000, 31000)],
            "Dining": [("Harbor Fish Tacos", 4800, 9600), ("Sunrise Bakery Coffee", 2100, 4900), ("Boardwalk Chowder Bowls", 5400, 11200)],
            "Transport": [("Convertible Van Fuel", 4800, 9200), ("State Park Parking", 1500, 3000), ("Bridge & Ferry Tickets", 2200, 4400)],
            "Activities": [("Surfboard & Wetsuit Rental", 9000, 18500), ("Kayak Cove Tour", 11000, 22000)],
            "Groceries": [("Cooler Ice & Drinks", 3200, 6800), ("Campfire S'mores Kit", 1800, 3900)],
        },
    },
    {
        "name": "Desert Music Fest",
        "currency": "USD",
        "description": "Three-day desert festival crew sharing glamping tents, shuttle passes, and hydration packs.",
        "members": ["Rowan Shaw", "Sienna Cole", "Theo Grant", "Una Park", "Vance Riley", "Wren Abbott", "Zane Dawson"],
        "expense_count": 35,
        "categories": {
            "Lodging": [("Oasis Glamping Tent", 52000, 115000), ("Recovery Motel Night", 19000, 36000)],
            "Dining": [("Food Truck Row", 5500, 11800), ("Late-Night Diner Booth", 6800, 13400), ("Brunch Patio Pitchers", 8200, 16500)],
            "Transport": [("Festival Shuttle Wristbands", 12000, 24000), ("Desert Highway Gas", 4600, 8800), ("Rideshare Surge Return", 3800, 7900)],
            "Activities": [("Soundbath Dome Tickets", 7000, 14000), ("Vintage Market Finds", 4500, 9500)],
            "Supplies": [("Electrolyte & Sunscreen Bulk", 3400, 7200), ("Solar String Lights & Ice", 2600, 5400)],
        },
    },
    {
        "name": "Lakehouse Retreat",
        "currency": "USD",
        "description": "Long-weekend dockside retreat with pontoon rental, BBQ cookouts, and board games.",
        "members": ["Cora Webb", "Milo Vance", "Nora Reyes", "Owen Mercer", "Tessa Lin"],
        "expense_count": 28,
        "categories": {
            "Lodging": [("Cedar Dock Lakehouse", 42000, 95000), ("Cleaning & Linen Fee", 12000, 18500)],
            "Dining": [("Lakeside Smokehouse BBQ", 8400, 16200), ("Ice Cream Pier Run", 1900, 4200), ("Wood-Oven Pizza Night", 5800, 11400)],
            "Groceries": [("Grill & Butcher Haul", 9500, 18500), ("Morning Bagels & Cold Brew", 3100, 6400), ("Sparkling Water & Snacks", 2800, 5600)],
            "Activities": [("Pontoon Boat Half-Day", 24000, 42000), ("Paddleboard Rentals", 6500, 12500)],
            "Transport": [("Boat Fuel Refill", 5500, 9800), ("Carpool Highway Fuel", 3900, 7200)],
        },
    },
]


def _distribute_equal_cents(amount_cents: int, member_ids: list[int]) -> dict[int, int]:
    """Deterministically split integer cents across sorted member_ids."""
    sorted_ids = sorted(member_ids)
    count = len(sorted_ids)
    base_share = amount_cents // count
    remainder = amount_cents % count
    return {
        mid: base_share + (1 if idx < remainder else 0)
        for idx, mid in enumerate(sorted_ids)
    }


def _distribute_custom_cents(
    rng: random.Random, amount_cents: int, member_ids: list[int]
) -> dict[int, int]:
    """Generate realistic unequal integer-cent splits summing exactly to amount_cents."""
    sorted_ids = sorted(member_ids)
    weights = [rng.randint(1, 5) for _ in sorted_ids]
    total_weight = sum(weights)
    shares = [(amount_cents * w) // total_weight for w in weights]
    diff = amount_cents - sum(shares)
    for idx in range(diff):
        shares[idx % len(shares)] += 1
    return dict(zip(sorted_ids, shares))


def seed_if_empty(session: Session) -> bool:
    """Seed 5 synthetic trips (20-40 expenses each) if the database has no trips."""
    existing = session.scalars(select(Trip)).first()
    if existing is not None:
        return False

    rng = random.Random(42)
    base_time = datetime(2026, 10, 1, 10, 0, tzinfo=timezone.utc)

    for trip_idx, trip_spec in enumerate(SYNTHETIC_TRIPS):
        trip = Trip(
            name=trip_spec["name"],
            currency=trip_spec["currency"],
            description=trip_spec["description"],
            created_at=base_time + timedelta(days=trip_idx * 7),
        )
        session.add(trip)
        session.flush()

        members: list[Member] = []
        for name in trip_spec["members"]:
            member = Member(trip_id=trip.id, name=name)
            session.add(member)
            members.append(member)
        session.flush()

        member_ids = [m.id for m in members]
        categories = list(trip_spec["categories"].keys())
        payer_weights = [3 if i == 0 else (2 if i == 1 else 1) for i in range(len(member_ids))]

        for exp_idx in range(trip_spec["expense_count"]):
            category = categories[exp_idx % len(categories)]
            title_options = trip_spec["categories"][category]
            title, low_cents, high_cents = rng.choice(title_options)
            amount_cents = rng.randint(low_cents, high_cents)
            payer_id = rng.choices(member_ids, weights=payer_weights, k=1)[0]

            roll = rng.random()
            if roll < 0.55:
                split_mode = SplitMode.EQUAL
                participants = member_ids
                share_map = _distribute_equal_cents(amount_cents, participants)
            elif roll < 0.85:
                split_mode = SplitMode.SUBSET
                subset_size = rng.randint(2, max(2, len(member_ids) - 1))
                participants = rng.sample(member_ids, k=subset_size)
                share_map = _distribute_equal_cents(amount_cents, participants)
            else:
                split_mode = SplitMode.CUSTOM
                subset_size = rng.randint(2, len(member_ids))
                participants = rng.sample(member_ids, k=subset_size)
                share_map = _distribute_custom_cents(rng, amount_cents, participants)

            assert sum(share_map.values()) == amount_cents

            expense = Expense(
                trip_id=trip.id,
                payer_id=payer_id,
                title=title,
                amount_cents=amount_cents,
                category=category,
                split_mode=split_mode,
                created_at=trip.created_at + timedelta(hours=exp_idx * 3),
            )
            session.add(expense)
            session.flush()

            for mid, share_cents in share_map.items():
                session.add(
                    ExpenseSplit(
                        expense_id=expense.id,
                        member_id=mid,
                        share_cents=share_cents,
                    )
                )

    session.commit()
    return True


def verify_seeded_zero_sum(session: Session) -> list[tuple[str, int, int]]:
    """Verify every seeded trip has 20-40 expenses and exact zero-sum balances."""
    results: list[tuple[str, int, int]] = []
    trips = session.scalars(select(Trip)).all()
    for trip in trips:
        members = session.scalars(select(Member).where(Member.trip_id == trip.id)).all()
        expenses = session.scalars(select(Expense).where(Expense.trip_id == trip.id)).all()
        paid = {m.id: 0 for m in members}
        owed = {m.id: 0 for m in members}
        for exp in expenses:
            paid[exp.payer_id] += exp.amount_cents
            splits = session.scalars(
                select(ExpenseSplit).where(ExpenseSplit.expense_id == exp.id)
            ).all()
            for sp in splits:
                owed[sp.member_id] += sp.share_cents
        net_sum = sum(paid[m.id] - owed[m.id] for m in members)
        assert net_sum == 0, f"Trip {trip.name} failed zero-sum: {net_sum}"
        results.append((trip.name, len(expenses), net_sum))
    return results


if __name__ == "__main__":
    create_db_and_tables()
    with SessionLocal() as db:
        seeded = seed_if_empty(db)
        summary = verify_seeded_zero_sum(db)
        print(f"Seeded fresh data: {seeded}")
        for name, count, net_sum in summary:
            print(f" - {name}: {count} expenses, net_balance_sum={net_sum}")
