#!/usr/bin/env python3
"""
Complete application startup script for GraviLog RAG system
Starts both HF RAG service and Node.js server
"""
import subprocess
import sys
import os
import time
from threading import Thread

def start_hf_rag():
    """Start HF RAG service"""
    print("Starting HF RAG service...")
    os.chdir("server")
    subprocess.run([sys.executable, "hf_rag_server.py"])

def start_nodejs():
    """Start Node.js development server"""
    print("Starting Node.js server...")
    time.sleep(2)  # Give HF service time to start
    subprocess.run(["npm", "run", "dev"])

if __name__ == "__main__":
    # Start HF RAG service in background
    rag_thread = Thread(target=start_hf_rag, daemon=True)
    rag_thread.start()
    
    # Start Node.js server
    start_nodejs()