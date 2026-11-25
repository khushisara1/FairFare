"""Run all backend tests for Phases 2 & 4 without pytest discovery traversing parent dirs."""
import sys
import os
import types
import traceback

# Ensure backend/ is on PYTHONPATH
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# ── collect test modules ──────────────────────────────────────────────────────
from tests import test_settlement, test_api, test_phase4_qa  # noqa: E402

MODULES = [test_settlement, test_api, test_phase4_qa]

# ── minimal runner ────────────────────────────────────────────────────────────
passed = []
failed = []

for mod in MODULES:
    for name in dir(mod):
        if not name.startswith("test_"):
            continue
        fn = getattr(mod, name)
        if not callable(fn):
            continue
        label = f"{mod.__name__}.{name}"
        try:
            fn()
            passed.append(label)
            print(f"  PASS  {label}")
        except Exception as exc:  # noqa: BLE001
            failed.append((label, exc))
            print(f"  FAIL  {label}")
            traceback.print_exc()

print()
print(f"Results: {len(passed)} passed, {len(failed)} failed out of {len(passed)+len(failed)} tests")

if failed:
    print("\nFailed tests:")
    for lbl, exc in failed:
        print(f"  ✗ {lbl}: {exc}")
    sys.exit(1)
else:
    print("All tests passed ✓")
    sys.exit(0)
