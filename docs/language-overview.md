# Axiom Language Overview

Axiom is written as a projection of an underlying graph.

Humans see text. Agents and compilers manipulate a structured graph of actors, capabilities, policies, data classes, effects, approvals, invariants, and proofs.

The text format is intentionally readable, but readability is not the main design goal. The main design goal is that an agent cannot erase purpose, authority, or safety constraints while generating implementation code.

## Design Principles

### 1. Intent Is Executable

An Axiom program begins with purpose.

```text
app ReceiptArchive
  intent:
    user stores receipt images privately
    user searches extracted receipt fields
    user views monthly totals
```

Intent is not a comment. It becomes part of the verification surface.

If generated code later sends receipt text to analytics, the compiler can reject it because that behavior is outside the declared intent.

### 2. Capabilities Replace Generic Access

Axiom avoids broad verbs like `get_user_data`, `search_records`, or `export_all`.

Instead, actors request named capabilities.

```text
capability use_approved_address
  purpose:
    provide address fields for one workflow

  disclosure:
    mode task_fields
    forbidden raw_profile_export
```

A capability is not a function in the normal sense. It is a constrained action contract.

### 3. Policy Is Deterministic

Models may help draft wording, summarize context, or suggest implementation plans.

Models may not decide final access.

```text
policy use_approved_address_policy
  decide:
    allow if agent_has_capability
      and destination_allowlisted
      and request_frequency_normal

    require_approval if destination_unknown
      or standing_policy_absent

    deny if schema_malformed
      or capability_scope_exceeded
      or destination_spoofed
```

The compiler must lower this to deterministic software.

### 4. Effects Are Dangerous By Default

Axiom treats side effects as authority-bearing events.

```text
effect external_disclosure
  examples:
    send_email
    submit_form
    post_to_api
    upload_file

  default:
    require explicit capability
    require audit
    require approval when sensitivity high
```

Reading a sensitive record, sending an email, charging a card, deleting data, and publishing a document are not ordinary function calls. They are effects with consequences.

### 5. Brokers Touch Sensitive Data

In Axiom, agents do not freely decrypt and inspect sensitive payloads.

They call brokers through capability contracts.

```text
broker AddressBroker
  may_decrypt:
    identity.address

  may_return:
    task_fields.address

  forbidden:
    raw_profile_export
    unrelated_identity_fields
```

The broker is a trusted execution boundary, not a convenience helper.

### 6. Approvals Are Scoped Objects

Approval is not a boolean.

```text
approval one_time_tax_identity_approval
  binds:
    request_hash
    account_id
    agent_id
    capability_key
    destination_identity
    expiry

  invalid_if:
    request_changes
    destination_changes
    agent_changes
    expired
    already_used
```

Axiom approval objects are specific, expiring, auditable, and non-transferable.

### 7. Audit Is Semantic

Axiom logs what matters, not raw secrets.

```text
audit capability_decision
  fields:
    trace_id
    actor_id
    capability_key
    destination_identity
    decision
    disclosure_mode
    data_classes
    approval_state

  forbidden:
    decrypted_payload
    raw_secret
    approval_token
    auth_header
```

Logs should help investigation without becoming a secondary leak.

## Core Constructs

### app

Defines the bounded product or service.

```text
app AgentCapabilityGateway
  intent:
    external agents perform sensitive workflows without raw secret access
```

### actor

Defines an entity that can request, approve, execute, or administer.

```text
actor ExternalAgent
  trust:
    authenticated_but_untrusted

  may:
    request capability

  may_not:
    retrieve raw records
    decide policy
```

### data_class

Defines domain, sensitivity, allowed disclosure modes, and storage posture.

```text
data_class identity.address
  domain identity
  sensitivity moderate
  allowed_disclosure:
    task_fields
    masked_summary

  forbidden:
    broad_export_to_agent
```

### capability

Defines a narrow operation.

```text
capability return_masked_payment_method
  purpose:
    let an agent confirm an approved payment method without raw credentials

  input:
    account_id
    agent_id
    payment_use_case
    destination_identity

  data:
    requires payment.method_reference

  disclosure:
    mode masked_value | tokenized_reference
```

### policy

Defines deterministic decision logic.

```text
policy masked_payment_policy
  decide:
    allow if agent_has_capability
      and destination_allowlisted
      and requested_disclosure in [masked_value, tokenized_reference]

    require_approval if destination_unknown

    deny if requests_raw_payment_credential
```

### invariant

Defines a promise the system must preserve.

```text
invariant no_generic_agent_retrieval
  forbid:
    agent_route returns raw_record
    agent_route lists all_records
    agent_route searches decrypted_payload
```

### target

Defines generated implementation outputs.

```text
target gateway_mvp
  backend:
    api_service
    typed schemas
    deterministic policy engine

  frontend:
    browser_ui
    approval_console

  tests:
    pytest policy_matrix
    adversarial_requests
```

## Syntax Philosophy

Axiom syntax should be:

- sparse
- explicit
- graph-friendly
- stable under agent editing
- easy to project into UI, tests, and policy code

It should avoid clever punctuation and hidden behavior.

The strangeness should live in the model, not in syntax tricks.
