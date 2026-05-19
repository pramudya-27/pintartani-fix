FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Set environment variables if needed
# ENV DATABASE_URL=...
# ENV GEMINI_API_KEY=...
# ENV QWEN_API_KEY=...
# ENV DEEPSEEK_API_KEY=...

# Expose the default port used by Hugging Face Spaces
EXPOSE 7860

# Run Background Scheduler and FastAPI Web Server
CMD ["python", "start_app.py"]
