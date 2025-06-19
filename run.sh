#!/bin/bash
# Start backend
cd server
nohup python3 hf_server.py > backend.log 2>&1 &

# Start frontend
cd ../client
npm install
npm run dev
