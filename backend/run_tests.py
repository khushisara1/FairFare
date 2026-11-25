"""Direct Python test runner for backend unit and API integration tests."""

import sys

from tests import test_api, test_settlement


def main() -> int:
    tests = [
        ("test_odd_cent_equal_split_deterministic", test_settlement.test_odd_cent_equal_split_deterministic),
        ("test_tiny_odd_cent_split", test_settlement.test_tiny_odd_cent_split),
        ("test_subset_split_only_charges_selected_members", test_settlement.test_subset_split_only_charges_selected_members),
        ("test_custom_split_validation_and_mismatch_rejection", test_settlement.test_custom_split_validation_and_mismatch_rejection),
        ("test_circular_debt_cancels_to_zero_transfers", test_settlement.test_circular_debt_cancels_to_zero_transfers),
        ("test_greedy_simplification_at_most_n_minus_1_transfers", test_settlement.test_greedy_simplification_at_most_n_minus_1_transfers),
        ("test_health_endpoint", test_api.test_health_endpoint),
        ("test_90_minute_gate_4_people_3_expenses", test_api.test_90_minute_gate_4_people_3_expenses),
    ]

    for name, fn in tests:
        fn()
        print(f"PASS: {name}")

    print(f"\nAll {len(tests)} tests passed!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
