# Axiom And Vault

Vault is the best first application for Axiom because Vault already needs the exact discipline Axiom is designed to enforce.

Vault's core product thesis:

```text
Agents can act, but they cannot freely know.
```

Axiom's core programming thesis:

```text
Every action must declare purpose, authority, data class, destination, disclosure mode, approval posture, broker behavior, and audit impact before code exists.
```

Those fit together directly.

## Current Vault Shape

Vault is a policy-enforced sensitive action layer for AI agents.

It should:

- expose capabilities, not raw secret retrieval
- treat agents as authenticated but untrusted
- use deterministic policy for allow / deny / require_approval
- keep broad decryption inside the broker boundary
- return minimal disclosure
- require scoped approval for high-risk operations
- audit all decisions

Axiom would make these rules executable.

## What Axiom Adds

### 1. Executable Capability Catalog

Today, capabilities are described in docs and implemented in code.

With Axiom, capabilities become source.

```text
capability use_approved_address
  purpose:
    provide address fields for one workflow without broad identity export

  input:
    vault_id
    agent_id
    address_type: mailing | billing | business
    destination_identity
    workflow_label

  data:
    requires identity.address
    sensitivity moderate

  disclosure:
    mode task_fields
    forbidden raw_profile_export
    forbidden unrelated_identity_fields

  approval:
    may_skip if destination_allowlisted and standing_policy_matches
    require if destination_unknown or workflow_high_risk

  audit:
    invocation
    policy_decision
    broker_execution
```

From that, Axiom can generate:

- API request schema
- API response schema
- policy tests
- broker contract
- audit event shape
- approval UI requirements

### 2. Anti-Drift Enforcement

Vault's largest architectural risk is convenience drift.

Dangerous examples:

```text
GET /vault/records
POST /agent/search
GET /vault/export
POST /debug/decrypt
```

Axiom should reject these at build time when they cross the agent boundary.

```text
violation generic_agent_retrieval
  route: GET /vault/records
  reason:
    exposes broad vault contents to agent boundary
    bypasses capability model
    bypasses broker disclosure rules
```

### 3. Policy Matrix Generation

Vault needs policy tests for each capability.

Axiom can generate a matrix:

```text
capability: fill_tax_identity_fields

cases:
  allow:
    known_agent
    capability_enabled
    allowlisted_destination
    standing_policy_matches

  require_approval:
    known_agent
    capability_enabled
    destination_unknown
    high_sensitivity_data

  deny:
    malformed_schema
    agent_missing_capability
    requested_field_outside_capability
    destination_spoofed
```

This maps naturally to pytest.

### 4. Broker Contracts

Vault's broker is where sensitive data can be decrypted and transformed.

Axiom should define broker limits:

```text
broker TaxIdentityBroker
  may_decrypt:
    tax.identity
    business.identity
    identity.legal_name
    identity.address

  may_return:
    task_fields

  forbidden:
    full_profile
    unrelated_identity_fields
    raw_payload_to_audit
    raw_payload_to_agent_when_brokered_fill_possible
```

The implementation must satisfy this contract.

### 5. Approval UI Generation

Approval is security-critical.

Axiom can require each approval screen to show:

- requesting agent
- capability
- workflow reason
- destination identity
- destination trust level
- data classes
- disclosure mode
- whether raw values are exposed
- expiry
- one-time binding

If the UI omits destination trust or data classes, the build should fail.

### 6. Semantic Audit Coverage

Axiom should ensure every path emits audit events:

- allowed
- denied
- malformed
- approval required
- approval approved
- approval denied
- broker executed
- broker failed
- token expired
- replay rejected

Audit must not contain raw decrypted values.

## First Vault Slice With Axiom

The right first slice is narrow:

1. Model the five MVP capabilities in Axiom.
2. Generate request and response schemas.
3. Generate policy matrix tests.
4. Compare generated contracts to current FastAPI implementation.
5. Add a build check that fails on generic agent retrieval routes.
6. Add audit coverage checks.

Do not try to rewrite Vault all at once.

## MVP Capability Set

Initial Axiom files should cover:

- `use_approved_address`
- `fill_tax_identity_fields`
- `return_masked_payment_method`
- `request_medical_member_summary`
- `create_approval_request`

The initial implementation should avoid:

- generic record search
- broad export
- production real-data storage
- autonomous approval
- standing approval beyond narrow test models

## Axiom As Vault's Constitution

Vault's ordinary code can be FastAPI, Next.js, SQLite/Postgres, Redis, Docker, and whatever else is practical.

Axiom is not there to make the stack exotic.

It is there to preserve the architecture:

```text
capability-not-retrieval
deterministic-policy-not-model-judgment
brokered-disclosure-not-raw-export
scoped-approval-not-blanket-trust
semantic-audit-not-secret-logging
```

That is the heart of Vault.

