#!/bin/bash
cd "/Users/User/Sites/ets"
echo -e "\033[1;36m=== ETS Local Stack Logs ===\033[0m\n"
tail -f logs/*.log | grep --line-buffered "" | sed -e "s/.*hardhat.log.*/\033[0;36m[HARDHAT]\033[0m &/" \
                                                  -e "s/.*graph-node.log.*/\033[0;33m[GRAPH]\033[0m &/" \
                                                  -e "s/.*graph-node-main.log.*/\033[0;33m[GRAPH-MAIN]\033[0m &/" \
                                                  -e "s/.*graph-node-postgres.log.*/\033[0;33m[POSTGRES]\033[0m &/" \
                                                  -e "s/.*graph-node-ipfs.log.*/\033[0;33m[IPFS]\033[0m &/" \
                                                  -e "s/.*arlocal.log.*/\033[1;34m[ARLOCAL]\033[0m &/" \
                                                  -e "s/.*offchain-api.log.*/\033[0;32m[API]\033[0m &/" \
                                                  -e "s/.*oracle.log.*/\033[0;35m[ORACLE]\033[0m &/" \
                                                  -e "s/.*explorer.log.*/\033[0;33m[EXPLORER]\033[0m &/"
