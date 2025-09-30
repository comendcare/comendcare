#!/usr/bin/env bash
# cleanup-workflow-runs.sh
# Delete ALL GitHub Actions workflow runs for a repo.
# Usage:
#   ./cleanup-workflow-runs.sh owner/repo
#   GH_REPO=owner/repo ./cleanup-workflow-runs.sh
# Requires: gh (authenticated), jq

set -euo pipefail

REPO="${1:-${GH_REPO:-}}"
if [[ -z "${REPO}" ]]; then
  echo "Error: repo not specified. Pass owner/repo or set GH_REPO." >&2
  exit 1
fi

# Ensure gh is logged in
if ! gh auth status >/dev/null 2>&1; then
  echo "Error: gh is not authenticated. Run: gh auth login" >&2
  exit 1
fi

echo "Target repository: ${REPO}"
echo "Collecting ALL workflow runs ..."

# Pull all runs; write to a temp file to avoid array/IFS quirks.
TMP_IDS="$(mktemp)"
TMP_LIST="$(mktemp)"
trap 'rm -f "$TMP_IDS" "$TMP_LIST"' EXIT

# Get a compact list for display + a plain list of IDs for deletion
gh api --paginate -H "Accept: application/vnd.github+json" "/repos/${REPO}/actions/runs?per_page=100" \
| tee >(jq -r '.workflow_runs[] | [(.id|tostring), (.status // ""), (.conclusion // ""), (.name // ""), (.created_at // ""), (.event // "")] | @tsv' >"$TMP_LIST") \
| jq -r '.workflow_runs[].id' >"$TMP_IDS"

TOTAL=$(wc -l < "$TMP_IDS" | tr -d '[:space:]')
if [[ "${TOTAL}" == "0" ]]; then
  echo "No workflow runs found. Nothing to delete."
  exit 0
fi

echo "Found ${TOTAL} runs to delete:"
awk -F'\t' '{printf "  id=%s  status=%s  conclusion=%s  name=%s  created_at=%s  event=%s\n",$1,$2,$3,$4,$5,$6}' "$TMP_LIST"

read -r -p "This will PERMANENTLY delete ALL ${TOTAL} runs. Type 'DELETE' to proceed: " CONFIRM
if [[ "${CONFIRM}" != "DELETE" ]]; then
  echo "Aborted."
  exit 1
fi

echo
echo "Deleting..."

OK=0
FAIL=0
COUNT=0

# Do NOT exit the whole script on a failed delete
set +e
while IFS= read -r ID; do
  COUNT=$((COUNT+1))
  # show the run being deleted
  printf "  [%s/%s] Deleting run %s ... " "$COUNT" "$TOTAL" "$ID"
  gh api -X DELETE -H "Accept: application/vnd.github+json" "/repos/${REPO}/actions/runs/${ID}" >/dev/null 2>&1
  if [[ $? -eq 0 ]]; then
    OK=$((OK+1))
    echo "OK"
  else
    FAIL=$((FAIL+1))
    echo "FAILED"
  fi
done < "$TMP_IDS"
set -e

echo
echo "Done. Deleted: ${OK}, Failed: ${FAIL}."
