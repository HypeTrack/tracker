#!/bin/bash
# Starts HypeTrack in the production configuration.

BUILD_DIR=dist
if [ ! -d "$BUILD_DIR/" ]; then
  echo "HypeTrack hasn't been built yet! Run yarn build first."
  exit 1
fi

# Alternatively, you can remove the -db2 from this argument list.
# The only reason it is here is because DB2 is especially noisy.
DEBUG=*,-follow-redirects,-telegraf:client,-db2 node dist/index
