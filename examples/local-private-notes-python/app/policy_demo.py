import json
import sys
from pathlib import Path


generated_dir = Path(__file__).resolve().parents[1] / "generated-python"
sys.path.insert(0, str(generated_dir))

from policy_evaluator import evaluate_axiom_policy  # noqa: E402


CAPABILITY = "summarize_private_document"

SCENARIOS = [
    {
        "name": "local summary",
        "expected": "allow",
        "facts": {
            "owner_authenticated": True,
            "document_selected": True,
            "destination_local": True,
        },
    },
    {
        "name": "external destination",
        "expected": "require_approval",
        "facts": {
            "destination_external": True,
        },
    },
    {
        "name": "raw document request",
        "expected": "deny",
        "facts": {
            "owner_authenticated": True,
            "document_selected": True,
            "destination_local": True,
            "requests_raw_document": True,
        },
    },
]


def main() -> None:
    results = []
    for scenario in SCENARIOS:
        result = evaluate_axiom_policy(CAPABILITY, scenario["facts"])
        assert result["decision"] == scenario["expected"], result
        results.append(
            {
                "scenario": scenario["name"],
                "decision": result["decision"],
                "reasons": result["reasons"],
            }
        )

    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
