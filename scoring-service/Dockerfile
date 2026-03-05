FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (layer-cached if requirements.txt unchanged)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# --reload is intentionally omitted for container stability;
# mount the volume in docker-compose.yml for live reload in dev.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
