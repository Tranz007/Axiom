# Compiler And Targets

Axiom does not replace ordinary runtimes.

Browsers still render HTML, CSS, and JavaScript. Servers still run Python, TypeScript, Go, Rust, or another real runtime. Databases still store data. Deployment platforms still run containers, functions, workers, and queues.

Axiom sits above those systems.

## Compilation Pipeline

```text
Axiom graph
  -> schema compiler
  -> policy compiler
  -> broker contract compiler
  -> UI contract compiler
  -> audit compiler
  -> test generator
  -> deployment manifest generator
  -> target framework code
```

## Target Artifacts

For a web application, Axiom may generate:

- TypeScript types
- Pydantic models
- FastAPI routes
- Next.js pages and components
- policy engine tables
- broker service interfaces
- SQL migrations
- audit event schemas
- pytest suites
- Playwright approval-flow tests
- Docker Compose files
- deployment manifests
- CI checks

## Source Of Truth

In an Axiom project, generated framework code is not the highest-level source of truth.

The source of truth is:

```text
app.ax
capabilities.ax
policy.ax
data.ax
audit.ax
targets.ax
```

Framework code may be generated, hand-edited in controlled regions, or written manually against generated contracts.

## Escape Hatches

Axiom must allow escape hatches because real products need custom code.

But escape hatches should be declared.

```text
manual_impl AddressBroker.execute
  file api/app/services/address_broker.py

  must_satisfy:
    broker_only_decryption
    no_raw_audit
    disclosure task_fields
```

Manual code still has to satisfy the graph.

## Frontend Target Example

Axiom:

```text
surface ApprovalRequestCard
  displays:
    agent.display_name
    capability.label
    destination.label
    destination.trust_level
    data_classes
    disclosure_mode
    expiry

  actions:
    approve
    deny

  forbid:
    approve_without_trace_id
    hide_destination_trust
```

Generated target:

- React component
- TypeScript props
- accessibility labels
- validation helper
- event handlers bound to approval API
- test that required context appears

## Backend Target Example

Axiom:

```text
capability fill_tax_identity_fields
  input:
    account_id
    agent_id
    form_type
    destination_identity
    required_fields

  disclosure:
    mode task_fields
```

Generated target:

- `FillTaxIdentityFieldsRequest` schema
- route registration
- policy invocation
- broker dispatch interface
- response schema
- audit event schema
- tests for malformed request and high-sensitivity approval

## Policy Compilation

Policy should compile to deterministic evaluation.

The first implementation can be straightforward Python:

```text
if schema_malformed:
  deny
elif not agent_has_capability:
  deny
elif destination_unknown and sensitivity_high:
  require_approval
else:
  allow
```

Later implementations could compile to:

- policy bytecode
- decision tables
- SQLite-backed rule tables
- Open Policy Agent style policies
- formally checked rules

The key rule is that model output is not the final decision engine.

## Verification Outputs

Axiom should emit a verification report:

```text
verification_report
  capabilities_checked: 5
  policies_checked: 5
  forbidden_routes_found: 0
  raw_secret_logs_found: 0
  broker_contract_violations: 0
  approval_binding_tests: pass
  audit_coverage: pass
```

This report becomes part of CI and deployment.

## Deployment Bundle

A deployable Axiom bundle should include:

```text
bundle CapabilityGatewayMVP
  graph_hash
  generated_code_hashes
  policy_manifest
  migration_manifest
  audit_schema_version
  target_runtime_versions
  verification_report
  rollback_manifest
  signature
```

Deployment systems should reject bundles that fail verification or lack required signatures.
