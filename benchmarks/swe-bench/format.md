# Benchhy Agent Benchmark — Output Format

## Submission Format

When you believe you have found and fixed all bugs, produce a summary in this exact format:

```markdown
## Bug Fix Report

### Bug 1: [Short description]
- **File**: `path/to/file.ts`
- **Line**: `42`
- **Issue**: [Description of what was wrong]
- **Fix**: [One-sentence description of the change]
- **Diff**: [If applicable, the minimal diff]

### Bug 2: [Short description]
...

[Repeat for all 20 bugs]

## Verification

- `pnpm build`: [PASS / FAIL]
- `pnpm test`: [PASS / FAIL — list any remaining failures]
- `pnpm dev`: [PASS / FAIL — describe any runtime errors]

## Notes

[Any additional observations, skipped files, or assumptions made]
```

## Scoring Criteria

Each bug is scored on:

1. **Discovery**: Did you find the bug without external hints?
2. **Fix correctness**: Is the fix minimal and correct?
3. **Verification**: Did you verify the fix with tests or runtime behavior?

## Partial Credit

If you cannot find all 20 bugs, submit what you have found. Partial credit is awarded per bug based on the criteria above. Document any bugs you attempted but could not verify.

## Constraints

- Do not modify `task.md` or `format.md`.
- Do not add comments like `// BUG` or `// FIXED` to the code.
- Keep your git history clean (one commit per bug or a single commit with all fixes).
- Do not delete test files to make tests pass.
