# Axiom MVP Grammar

This is the deliberately small grammar supported by the first CLI prototype.

The parser is indentation-aware but intentionally conservative. Top-level constructs start at column 1. Sections are indented by two spaces. Section items are indented by four spaces.

```text
program      = top_level*
top_level    = app | actor | data_class | capability | invariant | target

app          = "app" name sections
actor        = "actor" name sections
data_class   = "data_class" name sections
capability   = "capability" name sections
invariant    = "invariant" name sections
target       = "target" name sections

section      = "  " key ":" inline_value? item*
inline       = "  " key value
item         = "    " text
```

The current validator understands these sections:

- `intent`
- `trust`
- `may`
- `may_not`
- `allowed_disclosure`
- `data`
- `disclosure`
- `policy`
- `approval`
- `broker`
- `audit`
- `forbid`
- `require`

The current policy parser recognizes:

```text
allow if condition
require_approval if condition
deny if condition
  and condition
  or condition
```

The grammar will become stricter over time. The MVP favors clear diagnostics and useful generated contracts over language completeness.
