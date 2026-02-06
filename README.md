# Hackathon Project

## 📱 Frontend (Next.js + Capacitor Android)

The frontend is built with Next.js and wrapped with Capacitor for Android.

### Setup
1. Navigate to `/frontend`:
   ```bash
   cd frontend
   npm install
   ```

### Development
- **Run in Browser**:
  ```bash
  npm run dev
  ```
- **Sync to Android**:
  ```bash
  npm run build
  npx cap sync
  npx cap open android
  ```
  (This will open Android Studio)

### Configuration
- **API URL**: Configured in `utils/api.ts`.
  - Default for Android Emulator: `http://10.0.2.2:8080`
  - For physical devices, replace `10.0.2.2` with your machine's local IP.

---

## ☕ Backend (Spring Boot)

The backend is a standard Spring Boot application.

### Setup
1. Navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Open in your IDE (IntelliJ, VS Code, etc.) or run with Maven.

### Run
```bash
mvn spring-boot:run
```
(Ensure you have Maven installed and Java 17+ configured)

## 🌉 API Contract
See [api-contract.md](./api-contract.md) for endpoint details.
