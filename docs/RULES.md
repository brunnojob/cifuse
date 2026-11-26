# Rule catalog

| Rule | Representative signal |
| --- | --- |
| dependency-conflict | ERESOLVE, ResolutionImpossible |
| lockfile-drift | ERR_PNPM_OUTDATED_LOCKFILE |
| missing-module | ModuleNotFoundError, Cannot find module |
| type-error | TS2322, Rust error[E0308] |
| test-failure | AssertionError, FAIL test/path |
| permission-denied | EACCES, Permission denied |
| network-failure | ECONNREFUSED, ENOTFOUND |
| disk-full | ENOSPC |
| memory-limit | JavaScript heap out of memory |
| command-missing | command not found |
| timeout | TimeoutError |
| maven-compilation | BUILD FAILURE, [ERROR] compilation failure |

Rules are evaluated in this order. Add a sanitized positive fixture, a negative example and both language messages when contributing a rule. Keep general wrapper failures visible: a final nonzero exit message may be useful even when a more specific diagnostic also appears.

## missing-module coverage

Python variants covered: `ModuleNotFoundError: No module named '…'` at the start of a line or after sentence punctuation, and `ImportError: No module named …`. Variants that are intentionally **not** matched: `ImportError: cannot import name 'X' from 'Y'` (a broken attribute, not a missing module), quoted mentions of these phrases in ordinary explanatory prose, and tracebacks where the exception line is not at a line boundary. These unsupported variants stay unclaimed rather than guessed.
