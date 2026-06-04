# Generated Axiom Python Artifacts

These files were generated from an Axiom source graph.

- `policy_matrix.json`: capability, data, disclosure, policy, broker, and audit matrix
- `models.py`: Pydantic contract models for capabilities, data classes, and policy results
- `policy_evaluator.py`: generated deterministic policy evaluator
- `audit_contracts.py`: generated audit obligation stubs
- `axiom_report.md`: validation and generation report

Use these files as contracts for Python app code. Do not paste the full generated files into an LLM context window unless the user asks. Prefer importing `evaluate_axiom_policy` and summarizing the specific policy path being changed.

Regenerate with:

```bash
axiom generate <file.ax> --target python --out generated-python
```
