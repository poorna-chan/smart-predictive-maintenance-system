# Smart Predictive Maintenance System for Agricultural Water Pumps 💧

A modern full-stack IoT monitoring and predictive maintenance platform for agricultural water pumps. Monitor pump health in real-time, receive automated alerts, and predict failures before they occur using ML-based analysis.

![Dashboard Preview](docs/screenshots/dashboard.png)

---

## 🌟 Features

### 📊 Real-Time Dashboard
- Live sensor monitoring: Temperature, Vibration, Voltage, Current, Water Flow
- Pump status indicators: 🟢 Normal / 🟡 Warning / 🔴 Critical
- Real-time charts with Socket.IO WebSocket updates
- Multi-pump overview cards

### 🤖 Predictive Analytics
- Rule-based + statistical ML health prediction engine
- Health score (0–100) with visual gauge
- Fault type detection: Motor Overheating, Bearing Failure, Dry Run, Voltage Fluctuation
- Estimated time-to-failure with recommended maintenance actions

### 🔔 Intelligent Alert System
- Automatic threshold-based alerts with deduplication
- Severity levels: Warning and Critical
- Real-time push notifications via WebSocket
- Alert history with date range and severity filtering

### ⚙️ Remote Pump Control
- ON/OFF toggle with confirmation dialogs
- Visual feedback and status tracking
- Simulated relay integration

### 📈 Historical Data Analysis
- Daily (hourly), Weekly, and Monthly views
- Multi-parameter comparison charts
- Custom date range picker
- CSV export functionality

### 👤 User Management
- JWT-based authentication (7-day tokens)
- Role-based access: Admin (full access) / Farmer (view assigned pumps)
- Password hashing with bcrypt
- Protected routes

### 🎨 Modern UI
- Dark mode by default with light mode toggle
- Professional IoT dashboard aesthetic
- Fully mobile responsive
- Animated real-time indicators

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Charts | Recharts |
| Real-time | Socket.IO Client |
| HTTP Client | Axios |
| Backend | Node.js + Express.js |
| WebSocket | Socket.IO |
| Database | MySQL 8.x |
| ORM | Sequelize 6 |
| Auth | JWT + bcryptjs |
| IoT | ESP32 (Arduino) |

---

## 📁 Project Structure

```
smart-predictive-maintenance-system/
├── backend/                   # Node.js + Express API server
│   ├── config/db.js           # MySQL + Sequelize connection
│   ├── controllers/           # Request handlers
│   ├── models/                # Sequelize database models
│   ├── routes/                # Express API routes
│   ├── middleware/            # JWT auth middleware
│   ├── services/              # Business logic (ML predictions, alerts)
│   ├── utils/                 # Sensor simulator, database seeder
│   ├── server.js              # Express + Socket.IO entry point
│   └── .env.example           # Environment variable template
├── frontend/                  # React + Vite frontend
│   └── src/
│       ├── components/        # UI components (Dashboard, Alerts, etc.)
│       ├── context/           # React contexts (Auth, Theme)
│       ├── hooks/             # Custom React hooks
│       ├── services/          # API client + Socket.IO client
│       └── styles/            # Global CSS
├── iot/
│   └── esp32_sensor_code.ino  # ESP32 Arduino sensor sketch
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.x
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/poorna-chan/smart-predictive-maintenance-system.git
cd smart-predictive-maintenance-system
```

### 2. Database Setup
```sql
CREATE DATABASE pump_maintenance;
```

### 3. Backend Setup
```bash
cd backend
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your MySQL credentials

# Seed the database with sample data
npm run seed

# Start the development server
npm run dev
```

Backend will run on **http://localhost:5000**

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend will run on **http://localhost:5173**

---

## ⚙️ Environment Configuration

Create `backend/.env` with the following variables:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=pump_maintenance
DB_PORT=3306
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

---

## 🔑 Demo Credentials

After running `npm run seed` in the backend:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pumpsystem.com | admin123 |
| Farmer | farmer@pumpsystem.com | farmer123 |

---

## 📡 API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/profile` | Get current user profile |

### Pumps
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pumps` | List all pumps |
| POST | `/api/pumps` | Add a new pump |
| GET | `/api/pumps/:id` | Get pump details |
| PUT | `/api/pumps/:id` | Update pump info |
| DELETE | `/api/pumps/:id` | Delete pump (admin only) |
| POST | `/api/pumps/:id/control` | Send ON/OFF command |

### Sensor Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sensors/data` | Ingest sensor data |
| GET | `/api/sensors/data/:pumpId` | Get sensor readings |
| GET | `/api/sensors/data/:pumpId/latest` | Get latest reading |
| GET | `/api/sensors/data/:pumpId/history` | Get historical data |

### Alerts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | Get all alerts |
| GET | `/api/alerts/:pumpId` | Get pump alerts |
| PUT | `/api/alerts/:id/acknowledge` | Acknowledge alert |

### Predictions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/predictions/:pumpId` | Get predictions |
| POST | `/api/predictions/:pumpId/analyze` | Trigger analysis |

---

## 📊 Alert Thresholds

| Parameter | Warning | Critical |
|-----------|---------|----------|
| Temperature | > 80°C | > 95°C |
| Vibration | > 4.5 mm/s | > 7.0 mm/s |
| Voltage | < 200V or > 250V | < 180V or > 260V |
| Current | > 15A | > 20A |
| Water Flow | < 5 L/min (pump ON) | < 1 L/min |

---

## 🔌 ESP32 IoT Setup

1. Install **Arduino IDE** with ESP32 board support
2. Install required libraries:
   - `ArduinoJson` by bblanchon
   - `DHT Sensor Library` by Adafruit
3. Open `iot/esp32_sensor_code.ino`
4. Update configuration:
   - `WIFI_SSID` and `WIFI_PASSWORD`
   - `API_URL` (your backend server IP)
   - `PUMP_ID` (matching the database pump ID)
5. Wire sensors:
   - DHT22 → GPIO 4
   - Vibration sensor → GPIO 34
   - Voltage sensor → GPIO 35
   - Current sensor (ACS712) → GPIO 32
   - Flow sensor (YF-S201) → GPIO 18
6. Flash to ESP32 and monitor Serial output

---

## 🎮 Sensor Simulator

The backend includes a built-in sensor simulator that runs automatically:
- Generates realistic sensor readings every **5 seconds**
- Simulates occasional anomalies (10% probability)
- Supports multiple pumps simultaneously
- Pushes data through the complete alert + prediction pipeline

The simulator starts automatically with the server. No configuration needed for demo use.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
