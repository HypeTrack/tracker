#!/bin/bash
# Starts HypeTrack in the production configuration.

BUILD_DIR=dist
if [ ! -d "$BUILD_DIR/" ]; then
  echo "HypeTrack hasn't been built yet! Run yarn build first."
  exit 1
fi

DEBUG=*,-follow-redirects,-telegraf:client,-db2 node dist/index
