# backend/gunicorn.conf.py
# Purpose: Production-grade Gunicorn configuration file for FastAPI (ASGI) application.
# Configures optimal worker count, binds, logging, and hooks.

import multiprocessing
import os

# 1. Bind Address & Port
# Binds Gunicorn to listen on port 8000 across all network interfaces
bind = os.getenv("BIND", "0.0.0.0:8000")

# 2. Worker Settings & Concurrency
# For ASGI applications like FastAPI, we must use Uvicorn's worker class
worker_class = "uvicorn.workers.UvicornWorker"

# Recommended formula: (2 * CPU cores) + 1
workers = int(os.getenv("WEB_CONCURRENCY", multiprocessing.cpu_count() * 2 + 1))

# Maximum number of simultaneous clients per worker
worker_connections = 1000

# Keep-alive timeout for connections (in seconds)
keepalive = 120

# 3. Timeout & Process Management
# Time in seconds before an inactive worker is killed and restarted
timeout = 30
graceful_timeout = 30

# 4. Logging & Diagnostics
# Log level: info, debug, warning, error, critical
loglevel = os.getenv("LOG_LEVEL", "info")

# Redirect stdout/stderr to the log files
capture_output = True

# Access and Error logs setup
accesslog = "-"  # "-" means stdout in Docker/Cloud deployments
errorlog = "-"   # "-" means stderr in Docker/Cloud deployments

# 5. Security & Process Naming
proc_name = "fastapi-inventory-backend"
limit_request_line = 4094
limit_request_fields = 100
limit_request_field_size = 8190
