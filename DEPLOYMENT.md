# Smart Home Station — Deployment Guide (Raspberry Pi)

## Prerequisites
- Docker & Docker Compose installed
- Domain name (optional, but recommended for SSL)

## Steps

1. **Clone the repository**
   ```bash
   git clone <repo_url>
   cd smart-home
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your secrets
   nano .env
   ```

3. **Generate SSL Certificates**
   Place your certificates in `nginx/certs/fullchain.pem` and `nginx/certs/privkey.pem`.
   For local testing, you can generate self-signed certs:
   ```bash
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout nginx/certs/privkey.pem -out nginx/certs/fullchain.pem
   ```

4. **Setup MQTT Passwords**
   ```bash
   # Create initial password file
   touch mosquitto/config/password_file
   # Add your MQTT user (replace $MQTT_USER and $MQTT_PASSWORD)
   docker run --rm -v $(pwd)/mosquitto/config:/mosquitto/config eclipse-mosquitto:2 \
     mosquitto_passwd -b /mosquitto/config/password_file $MQTT_USER $MQTT_PASSWORD
   ```

5. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

## Architecture
- **Nginx**: SSL Termination and Reverse Proxy
- **Fastify Backend**: Business logic, MQTT/WS integration
- **PostgreSQL**: Persistent storage (UUIDs, history)
- **Mosquitto**: MQTT Broker for IoT devices

## Monitoring
- Logs are stored in `./logs` and accessible via `docker logs smart-home-backend`
- Database data is persisted in `postgres_data` volume.
