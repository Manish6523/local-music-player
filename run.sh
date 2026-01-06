#!/bin/bash

# Navigate to dist folder
cd "$(dirname "$0")/dist"

# Port
PORT=6060

# Start server in background
python3 -m http.server $PORT >/dev/null 2>&1 &
SERVER_PID=$!

# Wait for server to be ready
until curl -s "http://localhost:$PORT" >/dev/null; do
  sleep 1
done

# Launch Zorin WebApp in background
gtk-launch WebApp-GoldenWind4974.desktop >/dev/null 2>&1 &

# KEEP THE SCRIPT RUNNING FOREVER
# So server remains alive
wait $SERVER_PID

