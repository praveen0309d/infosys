# Use Python image
FROM python:3.11

# Set working directory
WORKDIR /app

# Copy backend files
COPY . .

# Install dependencies
RUN pip install -r requirements.txt

# Expose Flask port
EXPOSE 5000

# Run the app
CMD ["python", "app.py"]
