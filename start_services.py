#!/usr/bin/env python3
"""
Startup script to run both Node.js server and Python RAG service together
"""
import subprocess
import time
import os
import signal
import sys
from threading import Thread

# Store process handles for cleanup
processes = []

def start_rag_service():
    """Start the Python RAG service"""
    print("Starting RAG service on port 8000...")
    try:
        env = os.environ.copy()
        env['RAG_PORT'] = '8000'
        process = subprocess.Popen(
            [sys.executable, "server/rag_server.py"],
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True
        )
        processes.append(process)
        
        # Print output from RAG service
        for line in iter(process.stdout.readline, ''):
            print(f"[RAG] {line.strip()}")
        
    except Exception as e:
        print(f"Failed to start RAG service: {e}")

def start_node_server():
    """Start the Node.js server"""
    print("Starting Node.js server...")
    try:
        env = os.environ.copy()
        env['RAG_SERVICE_URL'] = 'http://localhost:8000'
        process = subprocess.Popen(
            ["npm", "run", "dev"],
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True
        )
        processes.append(process)
        
        # Print output from Node.js server
        for line in iter(process.stdout.readline, ''):
            print(f"[NODE] {line.strip()}")
            
    except Exception as e:
        print(f"Failed to start Node.js server: {e}")

def cleanup_processes():
    """Clean up all processes on exit"""
    print("\nShutting down services...")
    for process in processes:
        try:
            process.terminate()
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
        except Exception:
            pass

def signal_handler(signum, frame):
    """Handle shutdown signals"""
    cleanup_processes()
    sys.exit(0)

if __name__ == "__main__":
    # Set up signal handlers for clean shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # Start RAG service in background thread
        rag_thread = Thread(target=start_rag_service, daemon=True)
        rag_thread.start()
        
        # Wait a moment for RAG service to start
        time.sleep(3)
        
        # Start Node.js server (this will block and print output)
        start_node_server()
        
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)
    except Exception as e:
        print(f"Error running services: {e}")
        cleanup_processes()
        sys.exit(1)