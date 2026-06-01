# Axiom Verification Report

App: AgentCapabilityGateway
Target: typescript

## Summary

- Capabilities checked: 3
- Actors checked: 2
- Data classes checked: 3
- Errors: 0
- Warnings: 0

## Diagnostics

- No diagnostics.

## Generated Contracts

### use_approved_address

- Reads: identity.address
- Disclosure: task_fields
- Decisions: allow, require_approval, deny
- Approval path: yes

### fill_tax_identity_fields

- Reads: tax.identity
- Disclosure: task_fields
- Decisions: allow, require_approval, deny
- Approval path: yes

### return_masked_payment_method

- Reads: payment.method_reference
- Disclosure: masked_value, tokenized_reference
- Decisions: allow, require_approval, deny
- Approval path: yes

