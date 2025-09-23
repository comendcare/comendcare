#!/usr/bin/env bash
# delete-bad-gh-runs.sh
# Deletes all GitHub Actions workflow runs with conclusion "skipped" or "failure".
# Usage:
#   ./delete-bad-gh-runs.sh owner/repo
#   GH_REPO=owner/repo ./delete-bad-gh-runs.sh
# Notes:
# - Requires: gh (authenticated), jq
# - Irreversible. Use at your own risk.

set -euo pipefail

# --- config ---
REPO="${1:-${GH_REPO:-}}"
if [[ -z "${REPO}" ]]; then
  echo "Error: repo not specified. Pass owner/repo as an arg or set GH_REPO."
  exit 1
fi

# Ensure gh is logged in
if ! gh auth status >/dev/null 2>&1; then
  echo "Error: gh is not authenticated. Run: gh auth login"
  exit 1
fi

echo "Target repository: ${REPO}"
echo "Collecting workflow runs with conclusion == skipped, failure, or cancelled ..."
echo

# Pull *all* runs via pagination, filter with jq, and extract IDs + a bit of context for logs
RUN_ROWS=()
while IFS=$'\n' read -r line; do
  RUN_ROWS+=("$line")
done < <(
  gh api --paginate \
    -H "Accept: application/vnd.github+json" \
    "/repos/${REPO}/actions/runs?per_page=100" \
  | jq -r '
      .workflow_runs[]
      | select(.conclusion == "skipped" or .conclusion == "failure" or .conclusion == "cancelled")
      | [(.id|tostring), .conclusion, (.name // ""), (.created_at // ""), (.event // "")]
      | @tsv
    '
)

TOTAL=${#RUN_ROWS[@]}
if (( TOTAL == 0 )); then
  echo "No runs with conclusion skipped/failure found. Nothing to delete."
  exit 0
fi

echo "Found ${TOTAL} runs to delete:"
printf '  %s\n' "${RUN_ROWS[@]}" | awk -F'\t' '{printf "  id=%s  conclusion=%s  name=%s  created_at=%s  event=%s\n",$1,$2,$3,$4,$5}'
echo
read -r -p "This will PERMANENTLY delete ${TOTAL} skipped/failure/cancelled runs. Type 'DELETE' to proceed: " CONFIRM
if [[ "${CONFIRM}" != "DELETE" ]]; then
  echo "Aborted."
  exit 1
fi

echo
echo "Deleting..."
OK=0
FAIL=0

for ROW in "${RUN_ROWS[@]}"; do
  ID="${ROW%%$'\t'*}"  # first field (run id)
  if gh api -X DELETE -H "Accept: application/vnd.github+json" "/repos/${REPO}/actions/runs/${ID}" >/dev/null 2>&1; then
    ((OK++))
    printf "  [%s/%s] deleted run %s\n" "$((OK+FAIL))" "${TOTAL}" "${ID}"
  else
    ((FAIL++))
    printf "  [%s/%s] FAILED to delete run %s\n" "$((OK+FAIL))" "${TOTAL}" "${ID}"
  fi
done

echo
echo "Done. Deleted: ${OK}, Failed: ${FAIL}."
exit 0
