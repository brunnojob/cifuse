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
| generic-error | error:, fatal:, nonzero GitHub exit wrapper |

Rules are evaluated in this order. Add a sanitized positive fixture, a negative example and both language messages when contributing a rule. Keep general wrapper failures visible: a final nonzero exit message may be useful even when a more specific diagnostic also appears.
