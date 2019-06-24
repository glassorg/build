#!/bin/bash

# lifted from: https://serverfault.com/questions/367185/calculating-total-file-size-by-extension-in-shell

ftypes=$(find . -type f | grep -E ".*\.[a-zA-Z0-9]*$" | sed -e 's/.*\(\.[a-zA-Z0-9]*\)$/\1/' | sort | uniq)

for ft in $ftypes
do
    echo -n "$ft "
    find . -name "*${ft}" -exec ls -l {} \; | awk '{total += $5} END {print total}'
done
