# Axiom Verification Report

App: ReceiptArchive
Target: typescript

## Summary

- Capabilities checked: 3
- Actors checked: 2
- Data classes checked: 2
- Errors: 0
- Warnings: 0

## Diagnostics

- No diagnostics.

## Generated Contracts

### upload_receipt

- Reads: none declared
- Disclosure: none declared
- Decisions: allow, deny
- Approval path: no

### extract_receipt_fields

- Reads: receipt.image
- Disclosure: internal_processing
- Decisions: allow, deny
- Approval path: yes

### monthly_summary

- Reads: none declared
- Disclosure: summary
- Decisions: allow, deny
- Approval path: no
