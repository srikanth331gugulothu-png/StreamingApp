# StreamingApp

Stream premium video content, host live watch parties, and manage your catalogue with a modern microservice architecture. The platform now ships with a production-ready admin portal, real-time chat, S3-backed adaptive streaming, and a redesigned cinematic frontend experience.

## Architecture

| Service | Port | Description |
| --- | --- | --- |
| `authService` | 3001 | User authentication, registration, JWT issuance |
| `streamingService` | 3002 | Video catalogue, S3 playback endpoints, public APIs |
| `adminService` | 3003 | Dedicated admin microservice for asset management and uploads |
| `chatService` | 3004 | Websocket + REST chat for live watch parties |
| `frontend` | 3000 | React SPA with revamped UI and integrated chat |
| `mongo` | 27017 | Shared MongoDB instance |

All backend services share common database models and utilities through `backend/common`.

## Environment Configuration

Create an `.env` for each service (or export variables before running). All services accept the standard AWS credentials for S3 access.

### Auth Service (`backend/authService/.env`)
```ini
PORT=3001
MONGO_URI=mongodb://localhost:27017/streamingapp
JWT_SECRET=changeme
CLIENT_URLS=http://localhost:3000
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
AWS_S3_BUCKET=
```

### Streaming Service (`backend/streamingService/.env`)
```ini
PORT=3002
MONGO_URI=mongodb://localhost:27017/streamingapp
JWT_SECRET=changeme
CLIENT_URLS=http://localhost:3000
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
AWS_S3_BUCKET=
AWS_CDN_URL=
STREAMING_PUBLIC_URL=http://localhost:3002
```

### Admin Service (`backend/adminService/.env`)
```ini
PORT=3003
MONGO_URI=mongodb://localhost:27017/streamingapp
JWT_SECRET=changeme
CLIENT_URLS=http://localhost:3000
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
AWS_S3_BUCKET=
```

### Chat Service (`backend/chatService/.env`)
```ini
PORT=3004
MONGO_URI=mongodb://localhost:27017/streamingapp
JWT_SECRET=changeme
CLIENT_URLS=http://localhost:3000
```

### Frontend build variables (`frontend/.env` or Docker build args)
```ini
REACT_APP_AUTH_API_URL=http://localhost:3001/api
REACT_APP_STREAMING_API_URL=http://localhost:3002/api
REACT_APP_STREAMING_PUBLIC_URL=http://localhost:3002
REACT_APP_ADMIN_API_URL=http://localhost:3003/api/admin
REACT_APP_CHAT_API_URL=http://localhost:3004/api/chat
REACT_APP_CHAT_SOCKET_URL=http://localhost:3004
```

## Running with Docker Compose

1. Populate the environment variables above (or rely on the defaults baked into `docker-compose.yml`).
2. Build and start the stack:
   ```bash
   docker-compose up --build
   ```
3. Navigate to `http://localhost:3000` for the web app.

## Kubernetes Deployment with Helm

### Prerequisites

- Docker Desktop and a running Kubernetes cluster
- `kubectl`
- Helm 3
- NGINX Ingress Controller
- Access to the required Docker Hub images

### Helm Chart Validation

Run from the repository root:

```bash
helm lint ./helm/streamingapp
```

### Install or Upgrade

```bash
helm upgrade --install streamingapp ./helm/streamingapp \
  --namespace streamingapp-helm \
  --create-namespace
```

### Verify Deployment Resources

```bash
helm status streamingapp -n streamingapp-helm

kubectl get deployments -n streamingapp-helm
kubectl get pods -n streamingapp-helm
kubectl get services -n streamingapp-helm
kubectl get ingress -n streamingapp-helm
kubectl get statefulset,pvc -n streamingapp-helm
```

### Access the Application

The configured Ingress host is `helm.streamingapp.local`.

For the local Kind environment, forward the NGINX Ingress Controller port:

```bash
kubectl port-forward -n ingress-nginx \
  service/ingress-nginx-controller 8081:80
```

Open the application:

http://helm.streamingapp.local:8081/

The URL requires the local Ingress configuration and port-forward to be running.

### Scaling and Rolling Updates

Scale the streaming deployment to four replicas:

```bash
kubectl scale deployment/streaming \
  --replicas=4 -n streamingapp-helm
```

Check rollout status:

```bash
kubectl rollout status deployment/streaming \
  -n streamingapp-helm
```

### Smoke Tests

Verify these workflows in the deployed application:

1. Register or log in.
2. Browse the video catalogue.
3. Play an available video.
4. Upload a video and thumbnail through the admin interface.
5. Verify real-time chat between browser sessions.
6. Delete a test application pod and confirm Kubernetes recreates it.

### Troubleshooting

Inspect recent events:

```bash
kubectl get events -n streamingapp-helm \
  --sort-by='.lastTimestamp'
```

Inspect deployment details:

```bash
kubectl describe deployment/streaming \
  -n streamingapp-helm
```

Inspect logs:

```bash
kubectl logs deployment/streaming \
  -n streamingapp-helm --tail=100
```

### Security

- Never commit real AWS access keys, JWT secrets or passwords.
- Supply sensitive values using a secure configuration mechanism.
- Use least-privilege permissions for AWS S3 access.
- Keep credentials out of public GitHub repositories.

## Docker Images

The application uses the following Docker Hub images:

| Service | Image |
|---|---|
| Admin | `srikanthgugulothu/streaming-admin:1.0.0` |
| Auth | `srikanthgugulothu/streaming-auth:1.0.2` |
| Chat | `srikanthgugulothu/streaming-chat:1.0.0` |
| Streaming | `srikanthgugulothu/streaming-stream:1.0.0` |
| Frontend | `srikanthgugulothu/streaming-frontend:1.0.5` |

These are the image tags used in the deployment. Verify that each image remains publicly accessible before submitting.


The compose file provisions MongoDB plus all four Node.js microservices. S3 credentials are optional for local testing—you can still browse seeded metadata, but streaming requires valid S3 objects.

## Local Development

Install dependencies for each service:

```bash
# auth service
cd backend/authService && npm install

# streaming service
cd ../streamingService && npm install

# admin service
cd ../adminService && npm install

# chat service
cd ../chatService && npm install

# frontend
cd ../../frontend && npm install
```

Run the services (in separate terminals) after starting MongoDB:

```bash
cd backend/authService && npm run dev
cd backend/streamingService && npm run dev
cd backend/adminService && npm run dev
cd backend/chatService && npm run dev
cd frontend && npm start
```

## Feature Highlights

- **S3-backed adaptive streaming** with secure signed uploads for admins.
- **Dedicated admin microservice** for video ingestion, metadata management, and featured curation.
- **Real-time chat** overlay in the player (Socket.IO + persistent message history).
- **Modern React experience** featuring cinematic hero sections, dynamic carousels, and responsive design.
- **Role-aware access control** across frontend routes and backend microservices.

## Testing

Automated tests are not yet included. Recommended smoke checks:

1. Register and log in through the web UI.
2. Upload a small video + thumbnail via the admin dashboard (requires valid S3 credentials).
3. Confirm playback from the browse page and verify that chat messages broadcast between multiple browser tabs.

## License

MIT © StreamFlix Team
