"""Run the whole study end to end."""
import subprocess, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
STEPS = [
    ("screen_signals.py", "screen candidate signals for edge"),
    ("reversal_study.py", "the reversal idea that was tested and rejected"),
    ("longrun_regime.py", "156-year out-of-sample regime test"),
    ("robustness.py",     "parameter, cost, sub-sample and randomisation checks"),
    ("daily_validation.py", "daily-frequency validation on 486 S&P names"),
    ("pine_parity.py",    "verify the Pine script implements the tested rule"),
    ("make_charts.py",    "render figures"),
]

for script, desc in STEPS:
    print(f"\n{'='*78}\n{script} — {desc}\n{'='*78}")
    r = subprocess.run([sys.executable, os.path.join(HERE, script)], cwd=HERE)
    if r.returncode != 0:
        sys.exit(f"{script} failed")
print("\nall steps complete")
