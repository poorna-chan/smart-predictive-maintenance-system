/*
 * Smart Predictive Maintenance System - ESP32 Sensor Node
 * 
 * Reads data from multiple sensors and sends to the backend API:
 *   - DHT22 (Temperature)
 *   - SW-420 Vibration Sensor (analog)
 *   - ZMPT101B Voltage Sensor (analog)
 *   - ACS712 Current Sensor (analog)
 *   - YF-S201 Water Flow Sensor (digital pulse)
 * 
 * Data is sent via HTTP POST to the backend every SEND_INTERVAL ms
 * 
 * Required Libraries:
 *   - ArduinoJson (bblanchon/ArduinoJson)
 *   - DHT Sensor Library (Adafruit)
 *   - HTTPClient (built-in ESP32)
 *   - WiFi (built-in ESP32)
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ---- WiFi Configuration ----
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// ---- Backend API Configuration ----
const char* API_URL = "http://192.168.1.100:5000/api/sensors/data";  // Replace with your server IP
const int PUMP_ID = 1;  // Change to match your pump ID in the database

// ---- Data Send Interval ----
const unsigned long SEND_INTERVAL = 5000;  // Send every 5 seconds

// ---- Pin Definitions ----
#define DHT_PIN       4     // DHT22 data pin
#define DHT_TYPE      DHT22
#define VIBRATION_PIN 34    // SW-420 analog pin (ADC1)
#define VOLTAGE_PIN   35    // ZMPT101B analog pin (ADC1)
#define CURRENT_PIN   32    // ACS712 analog pin (ADC1)
#define FLOW_PIN      18    // YF-S201 digital pin (interrupt)

// ---- Calibration Constants ----
#define VOLTAGE_CALIBRATION   110.0   // Adjust based on your ZMPT101B setup
#define CURRENT_OFFSET        2048    // ACS712 zero-current ADC value (~2.5V with 3.3V ref)
#define CURRENT_SENSITIVITY   0.066   // ACS712-30A: 66mV/A (adjust for your variant)
#define VIBRATION_SCALE       0.01    // Scale ADC reading to mm/s
#define FLOW_CALIBRATION      7.5     // Pulses per liter (YF-S201 = 7.5 pulses/L)

// ---- Global Objects ----
DHT dht(DHT_PIN, DHT_TYPE);

// ---- Flow Sensor ISR ----
volatile unsigned long pulseCount = 0;
unsigned long lastFlowTime = 0;
float flowRate = 0.0;

void IRAM_ATTR countPulse() {
  pulseCount++;
}

// ---- Setup ----
void setup() {
  Serial.begin(115200);
  Serial.println("\n=== Smart Pump Maintenance - ESP32 Sensor Node ===");

  // Initialize DHT22
  dht.begin();
  Serial.println("DHT22 initialized.");

  // Initialize flow sensor interrupt
  pinMode(FLOW_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(FLOW_PIN), countPulse, RISING);
  lastFlowTime = millis();

  // Connect to WiFi
  connectWiFi();
}

// ---- Main Loop ----
unsigned long lastSendTime = 0;

void loop() {
  // Reconnect WiFi if disconnected
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    connectWiFi();
  }

  unsigned long now = millis();

  // Calculate flow rate every second
  if (now - lastFlowTime >= 1000) {
    detachInterrupt(digitalPinToInterrupt(FLOW_PIN));
    flowRate = (pulseCount / FLOW_CALIBRATION) * 60.0;  // Convert to L/min
    pulseCount = 0;
    lastFlowTime = now;
    attachInterrupt(digitalPinToInterrupt(FLOW_PIN), countPulse, RISING);
  }

  // Send sensor data at configured interval
  if (now - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = now;
    readAndSendData();
  }
}

// ---- Read Sensors and Send to Backend ----
void readAndSendData() {
  // Read temperature from DHT22
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature)) {
    Serial.println("Failed to read DHT22 sensor!");
    temperature = 0.0;
  }

  // Read vibration (raw ADC -> mm/s approximation)
  int vibRaw = analogRead(VIBRATION_PIN);
  float vibration = abs(vibRaw - 2048) * VIBRATION_SCALE;  // Center at mid-ADC

  // Read voltage (ZMPT101B RMS voltage)
  float voltage = readRMSVoltage();

  // Read current (ACS712)
  float current = readCurrent();

  // Get flow rate (calculated in loop)
  float waterFlow = flowRate;

  // Print to Serial
  Serial.println("\n--- Sensor Readings ---");
  Serial.printf("Temperature: %.2f°C\n", temperature);
  Serial.printf("Humidity:    %.1f%%\n", humidity);
  Serial.printf("Vibration:   %.2f mm/s\n", vibration);
  Serial.printf("Voltage:     %.1f V\n", voltage);
  Serial.printf("Current:     %.2f A\n", current);
  Serial.printf("Water Flow:  %.2f L/min\n", waterFlow);

  // Build JSON payload
  StaticJsonDocument<256> doc;
  doc["pumpId"]     = PUMP_ID;
  doc["temperature"] = temperature;
  doc["vibration"]  = vibration;
  doc["voltage"]    = voltage;
  doc["current"]    = current;
  doc["waterFlow"]  = waterFlow;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  // Send HTTP POST
  sendHTTPPost(jsonPayload);
}

// ---- Read RMS Voltage using ZMPT101B ----
float readRMSVoltage() {
  long sumSquares = 0;
  int samples = 1000;

  for (int i = 0; i < samples; i++) {
    int raw = analogRead(VOLTAGE_PIN) - 2048;  // Subtract offset
    sumSquares += (long)raw * raw;
    delayMicroseconds(100);
  }

  float rms = sqrt((float)sumSquares / samples);
  return rms * VOLTAGE_CALIBRATION / 1024.0;
}

// ---- Read Current using ACS712 ----
float readCurrent() {
  long sum = 0;
  int samples = 500;

  for (int i = 0; i < samples; i++) {
    sum += analogRead(CURRENT_PIN);
    delayMicroseconds(200);
  }

  float avgRaw = (float)sum / samples;
  float voltage = (avgRaw / 4096.0) * 3.3;          // Convert to volts
  float current = (voltage - 1.65) / CURRENT_SENSITIVITY;  // ACS712 formula
  return abs(current);
}

// ---- Send HTTP POST to backend ----
void sendHTTPPost(String& payload) {
  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");

  Serial.print("Sending data to backend... ");
  int responseCode = http.POST(payload);

  if (responseCode > 0) {
    Serial.printf("Response: %d\n", responseCode);
    if (responseCode == 201) {
      Serial.println("✅ Data accepted by server.");
    }
  } else {
    Serial.printf("❌ HTTP Error: %s\n", http.errorToString(responseCode).c_str());
  }

  http.end();
}

// ---- Connect to WiFi ----
void connectWiFi() {
  Serial.printf("Connecting to WiFi: %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected!");
    Serial.printf("IP Address: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n❌ WiFi connection failed! Check credentials.");
  }
}
