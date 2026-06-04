#!/bin/bash
# afterFileEdit hook: remind the agent to co-locate a story + test for new S2 components.
# CONTRIBUTING.md requires a Storybook story per visual state and a testing-library test.
# Non-blocking nudge (exit 0).
set -uo pipefail

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.file_path // .tool_input.file_path // (.edits[0].file_path) // empty' 2>/dev/null || true)

# Only check S2 component source files.
case "$file" in
  *packages/@react-spectrum/s2/src/*.tsx) ;;
  *) echo '{}'; exit 0 ;;
esac

base=$(basename "$file" .tsx)

# Only PascalCase component files, skip helpers like progress-utils / dnd-utils.
case "$base" in
  [A-Z]*) ;;
  *) echo '{}'; exit 0 ;;
esac
case "$base" in
  *utils|*-utils) echo '{}'; exit 0 ;;
esac

# Reconstruct the S2 package root from the edited file path.
root="${file%%packages/@react-spectrum/s2/src/*}packages/@react-spectrum/s2"
story="$root/stories/$base.stories.tsx"
test_unit="$root/test/$base.test.tsx"
test_browser="$root/test/$base.browser.test.tsx"

missing=""
[ -f "$story" ] || missing="$missing"$'\n'"  - missing story: stories/$base.stories.tsx"
{ [ -f "$test_unit" ] || [ -f "$test_browser" ]; } || missing="$missing"$'\n'"  - missing test: test/$base.test.tsx"

if [ -n "$missing" ]; then
  msg=$(printf 'Co-location reminder for %s: CONTRIBUTING.md requires a Storybook story per visual state and a react-testing-library test.%s' "$base" "$missing")
  jq -cn --arg m "$msg" '{agent_message:$m, user_message:"Reminder: add a story + test for this component."}'
  printf '%s\n' "$msg" >&2
  exit 0
fi

echo '{}'
exit 0
