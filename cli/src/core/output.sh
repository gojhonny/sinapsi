#!/bin/sh

: "${GRAPH_LOGS:=false}"

graph_stdout_is_tty() {
  command -v tty >/dev/null 2>&1 && tty -s <&1 2>/dev/null
}

if [ "${NO_COLOR+x}" != x ] && { [ "${GRAPH_FORCE_COLOR:-0}" = 1 ] || graph_stdout_is_tty; }; then
  GRAPH_COLOR_YELLOW=$(printf '\033[33m')
  GRAPH_COLOR_GREEN=$(printf '\033[32m')
  GRAPH_COLOR_RED=$(printf '\033[31m')
  GRAPH_COLOR_CYAN=$(printf '\033[36m')
  GRAPH_COLOR_DIM=$(printf '\033[2m')
  GRAPH_COLOR_ORANGE=$(printf '\033[38;5;208m')
  GRAPH_COLOR_NEON_CYAN=$(printf '\033[96m')
  GRAPH_COLOR_NEON_MAGENTA=$(printf '\033[95m')
  GRAPH_COLOR_NEON_BLUE=$(printf '\033[94m')
  GRAPH_COLOR_RESET=$(printf '\033[0m')
else
  GRAPH_COLOR_YELLOW=
  GRAPH_COLOR_GREEN=
  GRAPH_COLOR_RED=
  GRAPH_COLOR_CYAN=
  GRAPH_COLOR_DIM=
  GRAPH_COLOR_ORANGE=
  GRAPH_COLOR_NEON_CYAN=
  GRAPH_COLOR_NEON_MAGENTA=
  GRAPH_COLOR_NEON_BLUE=
  GRAPH_COLOR_RESET=
fi

GRAPH_ICON_SUCCESS='PASS'
GRAPH_ICON_WARNING='WARN'
GRAPH_ICON_ERROR='FAIL'
GRAPH_ICON_INFO='INFO'

graph_print_logo() {
  printf '%s%s%s\n' "$GRAPH_COLOR_ORANGE" ' ██████╗ ██████╗  █████╗ ██████╗ ██╗  ██╗███████╗' "$GRAPH_COLOR_RESET"
  printf '%s%s%s\n' "$GRAPH_COLOR_ORANGE" '██╔════╝ ██╔══██╗██╔══██╗██╔══██╗██║  ██║╚══███╔╝' "$GRAPH_COLOR_RESET"
  printf '%s%s%s\n' "$GRAPH_COLOR_ORANGE" '██║  ███╗██████╔╝███████║██████╔╝███████║  ███╔╝ ' "$GRAPH_COLOR_RESET"
  printf '%s%s%s\n' "$GRAPH_COLOR_ORANGE" '██║   ██║██╔══██╗██╔══██║██╔═══╝ ██╔══██║ ███╔╝  ' "$GRAPH_COLOR_RESET"
  printf '%s%s%s\n' "$GRAPH_COLOR_ORANGE" '╚██████╔╝██║  ██║██║  ██║██║     ██║  ██║███████╗' "$GRAPH_COLOR_RESET"
  printf '%s%s%s\n' "$GRAPH_COLOR_ORANGE" ' ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚══════╝' "$GRAPH_COLOR_RESET"
}

graph_print_success() {
  printf '%s%s  %s%s\n' "$GRAPH_COLOR_GREEN" "$GRAPH_ICON_SUCCESS" "$*" "$GRAPH_COLOR_RESET"
}

graph_print_warning() {
  printf '%s%s  %s%s\n' "$GRAPH_COLOR_YELLOW" "$GRAPH_ICON_WARNING" "$*" "$GRAPH_COLOR_RESET" >&2
}

graph_print_error() {
  printf '%s%s  %s%s\n' "$GRAPH_COLOR_RED" "$GRAPH_ICON_ERROR" "$*" "$GRAPH_COLOR_RESET" >&2
}

graph_print_info() {
  printf '%s%s  %s%s\n' "$GRAPH_COLOR_CYAN" "$GRAPH_ICON_INFO" "$*" "$GRAPH_COLOR_RESET"
}

graph_log() {
  [ "$GRAPH_LOGS" = true ] || return 0
  printf '%sLOG   %s%s\n' "$GRAPH_COLOR_DIM" "$*" "$GRAPH_COLOR_RESET" >&2
}
