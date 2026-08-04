# ⚡ Andy's Off-Grid Cabin Power System

An automated, ESP32-monitored off-grid power management and telemetry system for cabin energy storage, solar charge regulation, inverter management, and winter protection.

---

## 📌 Overview

This project provides a robust, self-hosted monitoring and control architecture for an off-grid solar installation. It integrates an **EEL 24V (8S) 280Ah LiFePO4 DIY Battery Box** (equipped with built-in heating pads and a **JK-200A active balance BMS**), an **EPEVER Tracer 5420AN MPPT Charge Controller**, and a **Victron Phoenix 24/800 Inverter**, managed by a **LilyGO T3S3 V1.2 (ESP32-S3) MCU with LoRa support**.

Modbus RTU communication with the charge controller and BMS is handled via a **MAX13487 Auto-Flow-Control RS485 module**.

The system enables real-time telemetry, automated low-temperature charge management via internal heating pads, hardware thermal cut-offs, and local/long-range status monitoring.

---

## 🛠 Hardware Architecture

* **Microcontroller & Telemetry:** LilyGO T3S3 V1.2
  * **MCU:** ESP32-S3 Dual-Core (Wi-Fi, Bluetooth 5 LE)
  * **Long-Range RF:** Integrated LoRa Module (SX1262 / 868 MHz) for off-grid long-range telemetry
  * **Display:** Onboard 0.96" OLED (128x64) for real-time status UI
  * **Storage:** Integrated MicroSD card slot for offline data logging
  * **Power:** USB-C & Integrated LiPo Battery Charger with ADC voltage monitoring
* **RS485 Bus Interface:** [QCCAN RS485 Board with MAX13487](https://www.amazon.com/QCCAN-RS485-Board-MAX13487-Raspberry/dp/B0B9XT9HM8)
  * **Auto Direction Control:** No `DE/RE` pin toggling required in firmware
  * **Level Shifting:** 3.3V / 5V TTL logic compatible
  * **Protection:** Integrated TVS surge protection diodes
* **Inverter:** Victron Phoenix 24/800 VE.Direct
  * **Continuous Power:** 650 W / 800 VA @ 230 VAC (Pure Sine Wave)
  * **Peak Surge Power:** 1500 W
  * **DC Input Voltage:** 24 VDC nominal (18.4 V – 34.0 VDC operating range)
  * **Communication & Control:** VE.Direct (UART Serial interface for ESP32 telemetry) / Remote Switch Port
* **Solar Controller:** EPEVER Tracer 5420AN
  * **Type:** MPPT Solar Charge Controller (Tracer-AN Series)
  * **Max Charge Current:** 50 A
  * **System Voltage:** 24 V DC (Max PV Input Power: 1250 W @ 24V)
  * **Max PV Open Circuit Voltage ($V_{oc}$):** 200 V
  * **Communication:** RS485 / Modbus RTU (115200 baud) via RJ45
* **Battery System:** EEL 24V LiFePO4 280Ah DIY Battery Box Kit
  * **Config:** 8S / 24V Nominal Configuration (~7.1 kWh capacity)
  * **Cells:** 280Ah LiFePO4 prismatic cells
  * **BMS:** Integrated JK-BMS (200A Continuous / Active Balancer) with LCD display and Bluetooth/RS485 interface
  * **Heating:** Integrated flexible silicone heating pads inside the enclosure for sub-zero operation
* **Safety & Thermal Management:**
  * Inline main battery fuse
  * Physical bimetal hardware temperature cut-off switches mounted directly on heating pads
  * Automated ESP32 relay control for battery pre-heating & sub-zero charging protection

---

## ⚡ Key Features

* **Real-time Telemetry & LoRa Transmission:** Reads cell voltages, active balancing current, State of Charge (SoC), pack voltage, temperatures, and solar parameters, broadcasting them via LoRa for long-range off-grid monitoring.
* **Seamless RS485 Auto-Flow Control:** Uses the MAX13487 Transceiver for reliable Modbus RTU polling without hardware direction control pins.
* **EPEVER & Victron Integration:** Connects via Modbus RTU (RS485) and VE.Direct (UART) to retrieve solar yield and inverter state.
* **Automated Low-Temperature Heating:**
  * Automatically engages internal heating pads when ambient/cell temperatures drop toward freezing (< 0°C / 32°F).
  * Safely pre-heats LiFePO4 cells to acceptable operating temperatures before allowing charge power.
* **Dual Thermal Safety Interlocks:** Combines ESP32 software limits with physical bimetal temperature cutoff switches mounted directly on the heating pads to prevent thermal runaway.
* **On-Site & Remote UI:** Displays live metrics on the integrated 0.96" OLED screen while publishing telemetry data via MQTT / LoRa.

---

## 📂 Repository Structure

```text
.
├── src/                # ESP32 C++ / Arduino firmware source files
├── lib/                # Custom drivers (RS485 Modbus, VE.Direct, JK-BMS)
├── docs/               # System schematics, pinout diagrams, and documentation
├── platformio.ini      # PlatformIO environment configuration
└── README.md           # Project documentation
