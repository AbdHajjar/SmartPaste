# SmartPaste Python Library Docker Image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt* ./
RUN pip install --no-cache-dir -r requirements.txt || echo "No requirements.txt found"

# Copy library source
COPY . .

# Install the library
RUN pip install -e .

# Default command
CMD ["python", "-c", "import smartpaste_lib; print('SmartPaste Library loaded successfully')"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import smartpaste_lib" || exit 1

# Labels
LABEL maintainer="SmartPaste Team"
LABEL description="SmartPaste Python Library"
LABEL version="1.0.0"