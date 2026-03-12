---
name: commit-message
description: Prepares commit message that follow project conventions. Use when asked to create commit message.
---

## Instructions

1. **Determine scope**: If the user didn't specify which changes the message is for, clarify before proceeding. Usually it's the work from the current conversation — check `git diff --staged` or `git diff` to gather context.

2. **Subject line** (first line):
   - Use conventional commit prefix: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`
   - Max **50 characters** (hard limit: 72)
   - Imperative mood ("add", not "added" or "adds")
   - No trailing period

3. **Body** (after blank line):
   - Wrap at **72 characters** per line
   - Focus on **WHY** the change was made, not what changed (the diff shows what)
   - Explain motivation, trade-offs, and non-obvious decisions
   - Use bullet points (`-`) for multiple distinct reasons
   - **Output Format:** The commit message MUST be plain text. Do not use Markdown link syntax `[filename](path)` for files or code symbols. If you mention a file, just type its name.
   - **Negative Constraint:** DO NOT write a file-by-file changelog (e.g., "Updated File A to do X. Extended File B to do Y"). Assume the reviewer can read the code. Instead, explain the overarching business or architectural goal that these changes combine to achieve.

4. **Goal**: The message should be useful to a reviewer now and to anyone reading `git log` months from now.

5. **Final Output Rule**: Before outputting the final commit message, you must quietly verify to yourself that no line in the body exceeds 72 characters. If one does, rewrite it thinner. Output the message inside a single `text` codeblock so it can be easily copied.