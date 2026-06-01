# Receipt Archive Example

This example models a private receipt archive where image plaintext must stay inside a trusted storage and extraction boundary.

Run:

```bash
npm run axiom -- validate examples/receipt-archive/axiom.ax
npm run axiom -- simulate examples/receipt-archive/axiom.ax --capability monthly_summary --fact user_authenticated=true
npm run axiom -- generate examples/receipt-archive/axiom.ax --target typescript --out examples/receipt-archive/generated
```
