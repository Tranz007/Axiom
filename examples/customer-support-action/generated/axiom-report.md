# Axiom Verification Report

App: CustomerSupportAction
Target: typescript

## Summary

- Capabilities checked: 2
- Actors checked: 2
- Data classes checked: 3
- Errors: 0
- Warnings: 0

## Diagnostics

- No diagnostics.

## Generated Contracts

### draft_customer_reply

- Reads: customer.profile, support.ticket
- Disclosure: summary, masked_contact, task_fields
- Decisions: allow, require_approval, deny
- Approval path: yes

### issue_refund_credit

- Reads: customer.profile, billing.refund_method
- Disclosure: masked_value, tokenized_reference
- Decisions: allow, require_approval, deny
- Approval path: yes
