# Local Private Notes Example

This is the smallest runnable Axiom app example.

It shows how ordinary implementation code can import a generated policy evaluator before touching a sensitive action. The app code does not need to understand the whole language. It asks one question:

```text
Given this capability and these request facts, should the app allow, deny, or require approval?
```

Run:

```bash
npm run axiom -- validate examples/local-private-notes/axiom.ax
npm run axiom -- generate examples/local-private-notes/axiom.ax --target typescript --out examples/local-private-notes/generated
node examples/local-private-notes/app/policy-demo.mjs
```

The demo covers:

- an allowed local summary
- an external destination that requires approval
- a raw note request that is denied even when other allow facts are true
