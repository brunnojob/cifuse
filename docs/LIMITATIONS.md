# Scope and limitations

CIFuse 0.1 is an initial release. Its checks cover illustrative fixtures; no precision, recall, time-savings or adoption benchmark is claimed.

- Rules detect line-level text patterns, not causality. They can produce false positives and miss unsupported formats. A clean report is not a successful build.
- One line is assigned to the first matching rule. Specific patterns precede the fallback. Repeated groups are not necessarily separate root causes.
- Signatures remove timestamps, normalize numeric tokens and whitespace, and preserve the remaining text. This can merge messages that differ only in numbers. Source location changes usually preserve a signature, but absolute path changes or wording changes may create a new one.
- Baseline comparison is set comparison of signatures, not an incident history. “Resolved” means absent from the provided logs, not verified fixed. Compare equivalent jobs and log coverage. The UI reports a resolved count, not the old evidence.
- Redaction covers common GitHub tokens, AWS access IDs, bearer tokens, named secret assignments, URL passwords and selected query parameters. Arbitrary credentials, private keys, personal data and secrets split across lines may remain. Review exports and job summaries before sharing.
- Up to 100 UTF-8 text logs and 5 MiB combined; 10 retained locations and 1,200 characters per evidence/context line. Counts still include all matched lines.
- Browser logs are held in memory, with language preference in localStorage. No analytics, remote fonts, application API calls or log uploads. Static hosting still receives ordinary page requests. Browser extensions and the hosting environment are outside this boundary.
- Node.js 22+ is required. The composite Action runs a separate Node child process with argument arrays and does not execute content from the logs. It changes the job's Node version to 22 using setup-node. The CLI accepts regular files and stdin; it does not traverse directories or unpack archives.
- The project is independent of GitHub. GitHub Pro and Developer Program membership do not imply endorsement or additional capabilities in this tool.
