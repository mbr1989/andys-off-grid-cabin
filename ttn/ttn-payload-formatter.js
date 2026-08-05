function decodeUplink(input) {
  var bytes = input.bytes;
  var data = {};

  if (bytes.length < 26) {
    return {
      errors: ["Payload to short! Expected at least 26 bytes."],
      data: {}
    };
  }

  // --- Hilfsfunktionen für Little-Endian Lesen ---
  function readUint16LE(offset) {
    return (bytes[offset + 1] << 8) | bytes[offset];
  }

  function readInt16LE(offset) {
    var val = readUint16LE(offset);
    return (val & 0x8000) ? val - 0x10000 : val;
  }

  function readUint32LE(offset) {
    return ((bytes[offset + 3] << 24) >>> 0) +
           (bytes[offset + 2] << 16) +
           (bytes[offset + 1] << 8) +
           bytes[offset];
  }

  // ==========================================
  // 1. MESSWERTE & CORE-SENSOREN (Bytes 0-11)
  // ==========================================
  
  // Bytes 0-3: EPEver Daily Generated Energy (0.01 kWh -> kWh)
  data.mppt_generated_charge_today_kwh = readUint32LE(0) / 100.0;

  // Bytes 4-7: EPEver Charging Power (0.01 W -> W)
  data.mppt_charging_power_w = readUint32LE(4) / 100.0;

  // Byte 8: JK-BMS State of Charge (%)
  data.jkbms_battery_soc_pct = bytes[8];

  // Bytes 9-10: JK-BMS Heating Current (0.01 A -> A, Vorzeichenbehaftet)
  data.jkbms_heating_current_a = readInt16LE(9) / 100.0;

  // Byte 11: Einbrucherkennung (0 = OK, 1 = Alarm)
  data.intrusion_detected = bytes[11] === 1;


  // ==========================================
  // 2. JK-BMS ALARM BITMASK (Bytes 12-15)
  // ==========================================
  var jkAlarms = readUint32LE(12);
  data.jkbms_alarms = {
    raw: jkAlarms,
    low_capacity: Boolean(jkAlarms & (1 << 0)),
    mosfet_overtemp: Boolean(jkAlarms & (1 << 1)),
    charge_overvoltage: Boolean(jkAlarms & (1 << 2)),
    discharge_undervoltage: Boolean(jkAlarms & (1 << 3)),
    battery_overtemp: Boolean(jkAlarms & (1 << 4)),
    charge_overcurrent: Boolean(jkAlarms & (1 << 5)),
    discharge_overcurrent: Boolean(jkAlarms & (1 << 6)),
    cell_pressure_difference: Boolean(jkAlarms & (1 << 7)),
    battery_box_overtemp: Boolean(jkAlarms & (1 << 8)),
    battery_undertemp: Boolean(jkAlarms & (1 << 9)),
    cell_overvoltage: Boolean(jkAlarms & (1 << 10)),
    cell_undervoltage: Boolean(jkAlarms & (1 << 11))
  };


  // ==========================================
  // 3. EPEVER CHARGER STATUS (Bytes 16-17)
  // Register 0x3201
  // ==========================================
  var mpptStatus = readUint16LE(16);
  var runningState = mpptStatus & 0x0003; // Bits 0-1
  var mpptStateText = "Standby";
  if (runningState === 1) mpptStateText = "Float";
  else if (runningState === 2) mpptStateText = "Boost/Bulk";
  else if (runningState === 3) mpptStateText = "Equalization";

  data.mppt_status = {
    raw: mpptStatus,
    charging_state: mpptStateText,
    is_charging: (runningState > 0),
    pv_input_short: Boolean(mpptStatus & (1 << 4)),
    load_overcurrent: Boolean(mpptStatus & (1 << 8)),
    load_short: Boolean(mpptStatus & (1 << 9)),
    pv_overcurrent: Boolean(mpptStatus & (1 << 10)),
    pv_overvoltage: Boolean(mpptStatus & (1 << 11)),
    pv_polarity_reversed: Boolean(mpptStatus & (1 << 14))
  };


  // ==========================================
  // 4. IP-PLUS INVERTER STATUS (Bytes 18-19)
  // Register 0x3202
  // ==========================================
  var ipStatus = readUint16LE(18);
  var ipOutputState = (ipStatus >> 4) & 0x0003; // Bits 4-5
  var ipOutputText = "Normal";
  if (ipOutputState === 1) ipOutputText = "Overload";
  else if (ipOutputState === 2) ipOutputText = "Short Circuit";

  data.ip_plus_status = {
    raw: ipStatus,
    output_state: ipOutputText,
    low_voltage_alarm: Boolean(ipStatus & (1 << 0)),
    over_voltage_alarm: Boolean(ipStatus & (1 << 1)),
    over_temp_alarm: Boolean(ipStatus & (1 << 2)),
    inverter_fault: Boolean(ipStatus & (1 << 3))
  };


  // ==========================================
  // 5. VICTRON PHOENIX STATUS (Bytes 20-25)
  // Nach VE.Direct Protocol v3.34 Specs
  // ==========================================
  var warnCode = readUint16LE(20);
  var offReason = readUint32LE(22);

  data.victron = {
    warning_code_raw: warnCode,
    warnings: {
      low_voltage: Boolean(warnCode & (1 << 0)),      // Low Battery Voltage
      high_voltage: Boolean(warnCode & (1 << 1)),     // High Battery Voltage
      low_soc: Boolean(warnCode & (1 << 2)),         // Low SOC
      high_temperature: Boolean(warnCode & (1 << 6)),// High Temperature
      overload: Boolean(warnCode & (1 << 8)),         // Overload
      dc_ripple: Boolean(warnCode & (1 << 10))        // High DC Ripple
    },
    off_reason_raw: offReason,
    off_reasons: {
      no_input_power: Boolean(offReason & (1 << 0)),        // No Input DC
      physical_switch_off: Boolean(offReason & (1 << 1)),  // Toggle Switch OFF
      software_off: Boolean(offReason & (1 << 2)),         // Register/Soft OFF
      remote_input_off: Boolean(offReason & (1 << 3)),     // Remote/BMS Port
      low_battery_cutoff: Boolean(offReason & (1 << 4)),   // Low Battery Cutoff
      thermal_shutdown: Boolean(offReason & (1 << 5)),     // Overtemperature
      overload_shutdown: Boolean(offReason & (1 << 6)),    // Overload Shutdown
      dc_ripple_shutdown: Boolean(offReason & (1 << 7)),   // High Ripple Cutoff
      bms_lockout: Boolean(offReason & (1 << 8))           // BMS Interlock
    }
  };

  return {
    data: data,
    warnings: []
  };
}
