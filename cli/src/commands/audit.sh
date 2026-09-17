#!/bin/sh
set -eu
. "$GRAPH_CLI_DIR/core/common.sh"

case "${1:-}" in
  --help|-h)
    [ "$#" -eq 1 ] || graph_die 'Audit help does not accept additional arguments.' 2
    printf 'Usage: graph audit\n'
    exit 0
    ;;
  '') [ "$#" -eq 0 ] || graph_die 'Audit does not accept arguments.' 2 ;;
  *) graph_die "Unknown audit option: $1" 2 ;;
esac

found=false
LC_ALL=C
export LC_ALL
for audit_file in "$GRAPH_PROJECT_ROOT"/.audits/*.audit.sh; do
  [ -f "$audit_file" ] || continue
  found=true
  printf '\n==> %s\n' "$(graph_rel "$audit_file")"
  /bin/sh "$audit_file"
done

[ "$found" = true ] || graph_die 'No audits were found under .audits/.'
printf '\nAll Sinapsi audits passed.\n'
