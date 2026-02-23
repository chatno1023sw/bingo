# Workflow Orchestration

## 1. Plan Node Default

- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately – don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

## 2. Subagent Strategy

- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One tack per subagent for focused execution

## 3. Self-Improvement Loop

- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

## 4. Verification Before Done

- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

## 5. Demand Elegance (Balanced)

- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes – don't over-engineer
- Challenge your own work before presenting it

## 6. Autonomous Bug Fizing

- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests – then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimat Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

## Commit

- Commit when implementation is complete for each **feature/unit** of work.
- For commit titles, **add a primary-purpose prefix** such as `fix:` or
  `refactor:`, and **write the title in Japanese**.
- In the commit description/body, describe what you did in **Japanese**.
- When committing regression test results/evidence, split commits by **screen**
  (for example, one commit for `start`, one for `setting`, one for `game`, or
  equivalent screen units in other projects).

## Test

- When performing tests, create a test specification document and a test
  report.
- For Playwright UI interaction tests, **take screenshots** and attach them to
  the test results. For complex interactions, record a video.
  - Embed screenshots and videos into the corresponding test results in the
    test report.
- Each test defect must be fixed in a separate commit.

## Coding

- Before implementing, review the diff, the staging area, and the commit
  history to detect any changes made by the user.
- Implement TSDoc.
- Leave comments for complex logic.
- After completing each task, run Biome's format, lint, and react-router type
  checks, and fix any errors.

## Regression Testing

### When a feature/fix/test changes behavior

1. Perform an impact analysis to identify which screens/functions may be
   affected.
2. Execute regression tests for the affected functionality.
3. Document the results in Markdown files split by **screen + UI function
   (button/control) unit**.
4. Do not group multiple UI functions into one file when separate controls are
   tested.
5. When recording/committing regression results, keep artifacts grouped by
   screen so each screen's regression output can be reviewed independently.

### File split rules (important)

- Use **one Markdown file per tested UI function/control**.
- File path:
  `test/regression/{screen_name}/{function_name}.md`
- `{function_name}` should describe the specific control/feature, not a whole
  screen summary.
- Prefer stable, descriptive names that can be reused across projects:
  - Examples: `saveButton`, `deleteButton`, `importCsv`, `searchFilter`,
    `confirmDialogPrimaryAction`
- Examples:
  - `test/regression/dashboard/saveButton.md`
  - `test/regression/users/deleteButton.md`
  - `test/regression/catalog/importCsv.md`
  - `test/regression/search/searchFilter.md`
- Avoid broad files such as:
  - `test/regression/{screen_name}/all-functions.md`
  - `test/regression/{screen_name}/smoke.md`

### Output requirements (the Markdown file content)

- Include:
  - Execution date (YYYY-MM-DD)
  - Brief explanation of what was tested (scope/intent)
  - Target screen and target UI function/control name
  - Test data information (when data preparation is required)
  - Step-by-step actions performed for that function
- Test data information (required when applicable):
  - Record which test data was used (file name / fixture name / generated data
    summary)
  - Record where the test data is stored in the repository
  - Store regression test data files under `test/regression/data/`
  - If data was generated during the test, save the source data used for the
    test as a file under `test/regression/data/` and reference it in the report
  - The report must make it possible for another engineer to rerun the same
    test with the same data without guessing
- Definition of “Step” / “Action”:
  - 1 step = 1 click
  - A single function test may require multiple steps/clicks
  - Example: an import flow may require 2+ steps (open dialog, choose file,
    confirm)
  - Write a concise description of what you clicked/did
  - Embed exactly 1 screenshot per step (one screenshot for each click)
- Report format:
  - Date: `{YYYY-MM-DD hh:mm:ss}`
  - Summary:
    `{Brief explanation of what you tested and why (based on impact analysis).}`
  - Target:
    `{screen_name} / {function_name}`
  - Test Data (when applicable):
    - Source: `{fixture/generated/manual}`
    - Name: `{file_or_fixture_name}`
    - Path: `test/regression/data/{file_name}` (or subdirectory under it)
    - Notes: `{what the data contains / why it was used}`
  - Steps table template:

    ```md
    | # | Action (1 click) | Expected Result | Actual Result | Screenshot |
    |---|------------------|-----------------|---------------|------------|
    | 1 | {action_1} | {expected_1} | {actual_1} | ![]({screenshot_1}) |
    | 2 | {action_2} | {expected_2} | {actual_2} | ![]({screenshot_2}) |
    ```

  - Add one row per click/step. Do not combine multiple clicks into one row.
  - If the tested function needs 2 clicks, the report must have at least 2 rows.
- Inputs you will be given:
  - Change summary (what was added/changed/fixed)
  - `{screen_name}`
  - `{function_name}`
  - Optional test data metadata (source/name/path/notes)
  - A list of regression test steps (each step is a single click) with
    expected/actual results and screenshot paths
- Generate:
  - The complete Markdown content for
    `test/regression/{screen_name}/{function_name}.md` that complies with all
    requirements above.
  - If multiple controls/functions are tested, generate multiple files (one per
    function), not one combined file.
  - If test data is used, include the test data section and ensure the data file
    itself is preserved in the repository or committed artifacts.
  - Prefer storing data at `test/regression/data/{screen_name}/{function_name}/`
    when multiple data files are needed.

### Commit rules for regression results

- Commit regression results/evidence by **screen**.
- A regression-result commit should include only one screen's related files when
  practical:
  - `test/regression/{screen_name}/*`
  - test data files used by that screen's regression (fixtures/artifacts)
  - related screenshot assets for that screen
  - related Playwright evidence output for that screen (if committed)
- Do not bundle multiple screens' regression result updates into one commit
  unless explicitly requested.
