#!/bin/bash

set -xeuo pipefail

ts-node lib/plugin-map/generate.ts > data/plugin-map.json
tsc
pkg -t node18 build