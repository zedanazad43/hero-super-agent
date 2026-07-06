# lean-ctx global policy

Prefer lean-ctx tools first to reduce token usage:
- ctx_read over raw file reads
- ctx_search over broad grep scans
- ctx_tree for structure discovery
- ctx_shell for compressed shell output

When available, run these before fallbacks.

