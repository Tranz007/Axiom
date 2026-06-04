# Local Private Notes Python Example

This is the smallest runnable Python Axiom app example.

It shows how ordinary Python code can import a generated policy evaluator before touching a sensitive action. The app code does not need to understand the whole language. It asks one question:

```text
Given this capability and these request facts, should the app allow, deny, or require approval?
```

Run:

```bash
node ./bin/axiom.mjs validate examples/local-private-notes-python/axiom.ax
node ./bin/axiom.mjs generate examples/local-private-notes-python/axiom.ax --target python --out examples/local-private-notes-python/generated-python
python3 examples/local-private-notes-python/app/policy_demo.py
```

The demo covers:

- an allowed local summary
- an external destination that requires approval
- a raw document request that is denied even when other allow facts are true

The generated Python files are checked in so agents and contributors can inspect the contract surface without rerunning generation first.
