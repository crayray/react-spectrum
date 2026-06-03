#!/bin/bash
# afterFileEdit hook: block raw color literals in S2 component source.
# S2 components must style via the `style` macro + Spectrum tokens, never #hex/rgb()/hsl().
set -uo pipefail

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.file_path // .tool_input.file_path // (.edits[0].file_path) // empty' 2>/dev/null || true)

# Only enforce inside S2 component source files.
case "$file" in
  *packages/@react-spectrum/s2/src/*.tsx) ;;
  *) echo '{}'; exit 0 ;;
esac

[ -f "$file" ] || { echo '{}'; exit 0; }

# Raw color literals: hex (#fff / #ffffff / #ffffffff) and rgb()/rgba()/hsl()/hsla().
matches=$(grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(' "$file" 2>/dev/null || true)

if [ -n "$matches" ]; then
  msg=$(printf 'Raw color literal(s) found in %s. S2 components must use the style macro with Spectrum tokens (e.g. style({color: '"'"'yellow-1000'"'"'})), never #hex/rgb()/hsl(). Replace the literal with a Spectrum token.\nOffending lines:\n%s' "$(basename "$file")" "$matches")
  jq -cn --arg m "$msg" '{permission:"deny", agent_message:$m, user_message:"Blocked: raw color literal in an S2 component (use a Spectrum token)."}'
  printf '%s\n' "$msg" >&2
  exit 2
fi

echo '{}'
exit 0
