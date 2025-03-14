# Use Python 3.10 base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy only requirements file first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code, excluding unnecessary files
COPY . .

# Create .dockerignore if it doesn't exist
RUN echo "venv/\n.git/\nREADME.md\n__pycache__/\nnotebooks/" > .dockerignore

# Set Python path
ENV PYTHONPATH=/app

# Expose port 8000
EXPOSE 8000

# Run FastAPI with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]