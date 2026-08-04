# ⚡ Andy's Off-Grid Cabin Power System (ESPHome)

An automated, ESPHome-based off-grid power management and telemetry system for cabin energy storage, solar charge regulation, dual-inverter management, and winter protection.

---

## 📌 Overview

This repository contains the complete **ESPHome** architecture for monitoring and controlling an off-grid solar installation. It integrates an **EEL 24V (8S) 280Ah LiFePO4 DIY Battery Box** (equipped with built-in heating pads and a **JK-PB2A16S20P Inverter BMS**), an **EPEVER Tracer 5420AN MPPT Charge Controller**, a **Victron Phoenix 24/800 Inverter** (thermostatically switched for refrigerator operation), and an **EPEVER iPower-Plus 2000W Inverter** (supplying the main cabin AC network and high-load workshop equipment), managed by a **LilyGO T3S3 V1.2 (ESP32-S3) MCU with LoRa support**.

The project is structured modularly using ESPHome `packages`, allowing flexible component configuration and seamless integration into Home Assistant or standalone ESPHome nodes.

Modbus RTU communication with the charge controller, BMS, and EPEVER inverter is handled via a **MAX13487 Auto-Flow-Control RS485 module**.

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
* **Dedicated Refrigerator Inverter:** Victron Phoenix 24/800 VE.Direct
  * **Application:** Dedicated 230 VAC power supply exclusively for the cabin refrigerator
  * **Power Control:** Thermostatically controlled via the Remote H/L port (zero standby consumption when cooling is inactive)
  * **Continuous Power:** 650 W / 800 VA @ 230 VAC (Pure Sine Wave)
  * **Peak Surge Power:** 1500 W (handles compressor start-up surges)
  * **DC Input Voltage:** 24 VDC nominal (18.4 V – 34.0 VDC operating range)
  * **Communication & Control:** VE.Direct (UART Serial interface for ESP32 telemetry) / Remote H/L Switch Port
* **Main Cabin & Workshop Inverter:** EPEVER iPower-Plus IP2000 (2000W Continuous Output)
  * **Application:** High-power 2000 W (4000 W Peak) 230 VAC pure sine wave supply for general cabin power, lighting, power tools, and heavy workshop machinery
  * **Continuous / Surge Power:** 2000 W Continuous / 4000 W Peak Surge
  * **DC Input Voltage:** 24 VDC nominal
  * **Communication & Control:** RS485 (Modbus RTU) / Remote Switch Port for automated load shedding
* **Solar Controller:** EPEVER Tracer 5420AN
  * **Type:** MPPT Solar Charge Controller (Tracer-AN Series)
  * **Max Charge Current:** 50 A
  * **System Voltage:** 24 V DC (Max PV Input Power: 1250 W @ 24V)
  * **Max PV Open Circuit Voltage ($V_{oc}$):** 200 V
  * **Communication:** RS485 / Modbus RTU (115200 baud) via RJ45
* **Battery Management System:** JK-PB2A16S20P (Inverter BMS Series)
  * **Configuration:** 8S / 24V Nominal (~7.1 kWh capacity with 280Ah cells)
  * **Continuous / Peak Current:** 200 A Continuous / 350 A Peak
  * **Active Balancer:** 2.0 A active balancing current
  * **Features (CEHMPRT Option):** CAN Bus, RS485 (Modbus), Dedicated Heating Pad Interface (`H`), Multi-Parallel support, Power Switch Port, Dry Contact Relay, NTC Temp Sensors
* **Safety & Thermal Management:**
  * Inline main battery fuse
  * Integrated BMS heating pad output control combined with physical bimetal hardware temperature cut-off switches mounted directly on heating pads
  * Automated ESP32 relay control for battery pre-heating & sub-zero charging protection

---

## ⚡ Key Features

* **ESPHome Native Project:** Fully configured via ESPHome YAML structures. No manual C++ coding required to get telemetry, automation, and sensors running.
* **Modular Package Design:** Uses `packages/` imports to separate BMS, MPPT, Inverter, and Display configurations.
* **On-Demand Refrigerator Powering (Zero Standby Loss):**
  * The Victron Phoenix 24/800 is automatically enabled via its Remote H/L port only when the refrigerator thermostat requests cooling, completely eliminating inverter idle/standby power consumption.
* **High-Power AC Management:**
  * Controls the **2000W EPEVER iPower-Plus** for heavy cabin/workshop demands (power tools, machinery, heavy appliances) with up to 4000W surge capacity, allowing remote automated power-down when not in use.
* **Seamless RS485 Auto-Flow Control:** Uses the MAX13487 Transceiver for multi-device Modbus RTU polling (Tracer MPPT, EPEVER IP2000, JK-BMS) without hardware direction control pins.
* **Multi-Protocol Telemetry:** Integrates Modbus RTU (RS485), VE.Direct (UART), and optional BLE polling for JK-BMS data retrieval.
* **Automated Low-Temperature Heating:**
  * Automatically engages internal heating pads when ambient/cell temperatures drop toward freezing (< 0°C / 32°F).
  * Safely pre-heats LiFePO4 cells to acceptable operating temperatures before allowing charge power.
* **Multi-Layer Thermal Safety Interlocks:** Combines ESPHome software logic, JK-BMS hardware heating logic, and physical bimetal temperature cutoff switches mounted directly on the heating pads to prevent thermal runaway.

---

## 📂 Repository Structure

```text
.
├── packages/                  # Modular ESPHome YAML packages
├── docs/                      # Wiring schematics, register maps & pinout references
├── andys-off-grid-cabin.yaml  # Main ESPHome entrypoint configuration
└── README.md                  # Project documentation
