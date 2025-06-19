#!/bin/bash

cd server
nohup python3 hf_server.py > hf.log 2>&1 &
cd ../client
npm install
npm run dev
