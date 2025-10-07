#!/bin/bash
cd "$1"
echo -e "\033[1;36m=== ETS Stack Logs ===\033[0m\n"
# Use proper escaping for ANSI color codes
tail -f logs/*.log | grep --line-buffered "" |
  sed -e $'s/.*hardhat.log.*/\033[0;36m[HARDHAT]\033[0m &/' \
      -e $'s/.*deploy.log.*/\033[0;32m[DEPLOY]\033[0m &/' \
      -e $'s/.*temporal-processor.log.*/\033[0;35m[TEMPORAL-PROCESSOR]\033[0m &/' \
      -e $'s/.*temporal-worker.log.*/\033[1;34m[TEMPORAL-WORKER]\033[0m &/' \
      -e $'s/.*explorer.log.*/\033[0;33m[EXPLORER]\033[0m &/'
