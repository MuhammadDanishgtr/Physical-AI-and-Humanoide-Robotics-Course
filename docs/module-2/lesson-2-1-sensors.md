---
sidebar_position: 1
title: "2.1 Sensor Types and Selection"
description: Understanding different sensor types, their characteristics, and how to choose the right sensor for your application
---

# Sensor Types and Selection

Sensors are the eyes and ears of robotic systems. In this lesson, we'll explore the various types of sensors used in robotics and learn how to select the right sensor for different applications.

## Learning Objectives

By the end of this lesson, you will be able to:

- Classify sensors by their measurement type and output
- Understand key sensor specifications and what they mean
- Compare different sensor technologies for common tasks
- Select appropriate sensors for specific robotics applications
- Evaluate trade-offs in sensor selection

## Sensor Classification

Sensors can be classified in multiple ways:

### By Information Type

```
Sensor Classification by Information Type:

┌─────────────────────────────────────────────────────────────┐
│                    PROPRIOCEPTIVE                           │
│            (Internal state - about the robot)               │
├─────────────────────────────────────────────────────────────┤
│  • Joint encoders - Position, velocity                      │
│  • IMU - Orientation, acceleration                          │
│  • Motor current sensors - Torque, load                     │
│  • Battery monitors - Power state                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    EXTEROCEPTIVE                            │
│            (External state - about the world)               │
├─────────────────────────────────────────────────────────────┤
│  • Distance sensors - Obstacle detection                    │
│  • Cameras - Visual perception                              │
│  • Touch sensors - Contact detection                        │
│  • Microphones - Sound localization                         │
└─────────────────────────────────────────────────────────────┘
```

### By Output Type

| Output Type | Description | Example Sensors |
|-------------|-------------|-----------------|
| **Analog** | Continuous voltage level | Potentiometer, photoresistor |
| **Digital** | Binary on/off | Limit switches, IR proximity |
| **PWM** | Pulse width modulated | Some distance sensors |
| **Serial** | Data protocol (I2C, SPI, UART) | IMUs, advanced distance sensors |

### By Physical Principle

```python
# Sensor types by physical principle
sensor_principles = {
    "Resistive": ["Potentiometer", "Strain gauge", "Photoresistor"],
    "Capacitive": ["Touch sensor", "Proximity sensor", "Humidity sensor"],
    "Inductive": ["Metal detector", "LVDT position sensor"],
    "Piezoelectric": ["Accelerometer", "Force sensor", "Microphone"],
    "Optical": ["Photodiode", "Camera", "LiDAR", "IR sensor"],
    "Magnetic": ["Hall effect sensor", "Magnetometer", "Encoder"],
    "Ultrasonic": ["Distance sensor", "Flow sensor"],
}
```

## Key Sensor Specifications

Understanding specifications is crucial for sensor selection.

### Resolution

The smallest change a sensor can detect.

```
Example: 10-bit ADC with 5V reference
Resolution = 5V / 2^10 = 5V / 1024 ≈ 4.88 mV

A 12-bit ADC with same reference:
Resolution = 5V / 2^12 = 5V / 4096 ≈ 1.22 mV
```

### Accuracy vs Precision

```
Target analogy:

High Accuracy,         Low Accuracy,          High Accuracy,
High Precision:        High Precision:        Low Precision:
    ┌───┐                  ┌───┐                  ┌───┐
    │•••│                  │   │•••              │ • │
    │•••│                  │   │                  │  •│
    │ ⊕ │                  │ ⊕ │                  │• ⊕│
    └───┘                  └───┘                  └───┘
    (Ideal)              (Biased)              (Scattered)
```

- **Accuracy**: How close to the true value
- **Precision**: How repeatable the measurements are

### Range and Sensitivity

- **Range**: Min to max measurable values
- **Sensitivity**: Output change per unit input change

```python
# Example: Calculating sensor output
class DistanceSensor:
    def __init__(self, min_range, max_range, output_min, output_max):
        self.min_range = min_range  # cm
        self.max_range = max_range  # cm
        self.output_min = output_min  # V
        self.output_max = output_max  # V
        self.sensitivity = (output_max - output_min) / (max_range - min_range)

    def voltage_to_distance(self, voltage):
        return self.min_range + (voltage - self.output_min) / self.sensitivity

# Sharp GP2Y0A21 IR sensor (approximately)
ir_sensor = DistanceSensor(
    min_range=10,   # 10 cm minimum
    max_range=80,   # 80 cm maximum
    output_min=0.4, # 0.4V at max distance
    output_max=3.1  # 3.1V at min distance
)

print(f"Sensitivity: {ir_sensor.sensitivity:.4f} V/cm")
```

### Response Time and Bandwidth

- **Response time**: How quickly sensor reacts to changes
- **Bandwidth**: Range of frequencies sensor can measure

```
Application requirements:

Slow (< 10 Hz):    Temperature, humidity
Medium (10-100 Hz): Distance for navigation
Fast (> 100 Hz):    Motor control, vibration
Very fast (> 1kHz): Audio, high-speed control
```

## Distance Sensors Deep Dive

Distance sensors are fundamental to robotics. Let's compare the major types:

### Ultrasonic Sensors

**Principle**: Time-of-flight of sound waves

```
         Transmit                    Receive
            │                           │
    ┌───────▼───────┐           ┌───────▼───────┐
    │   )))))))     │    ◄──    │     (((((((   │
    │   Ultrasonic  │  Reflected│   Ultrasonic  │
    │   Transmitter │    wave   │   Receiver    │
    └───────────────┘           └───────────────┘
                    │           │
                    ▼           │
              ┌─────────────┐   │
              │   Object    │───┘
              └─────────────┘

Distance = (Time × Speed of Sound) / 2
         = (Time × 343 m/s) / 2
```

**Characteristics:**
- Range: 2cm - 400cm typical
- Accuracy: ±3mm
- Beam angle: 15-30°
- Cost: $2-10
- Issues: Soft/angled surfaces, temperature sensitivity

```python
# Ultrasonic distance calculation
import time

def measure_ultrasonic_distance(trigger_pin, echo_pin, gpio):
    """Measure distance using HC-SR04 ultrasonic sensor."""
    # Send trigger pulse
    gpio.output(trigger_pin, True)
    time.sleep(0.00001)  # 10 microseconds
    gpio.output(trigger_pin, False)

    # Wait for echo start
    pulse_start = time.time()
    timeout = pulse_start + 0.1  # 100ms timeout

    while gpio.input(echo_pin) == 0:
        pulse_start = time.time()
        if pulse_start > timeout:
            return None  # Timeout

    # Wait for echo end
    pulse_end = time.time()
    while gpio.input(echo_pin) == 1:
        pulse_end = time.time()
        if pulse_end > timeout:
            return None  # Timeout

    # Calculate distance
    pulse_duration = pulse_end - pulse_start
    distance_cm = (pulse_duration * 34300) / 2  # Speed of sound: 343 m/s

    return distance_cm
```

### Infrared (IR) Distance Sensors

**Principle**: Triangulation or time-of-flight

```
Triangulation Principle:

    IR LED ──────────────────►  ┌─────────┐
        \                        │ Object  │
         \  Angle varies with    └────┬────┘
          \  distance                  │
           \                          │
            \◄────────────────────────┘
        IR Detector              Reflected
                                   light
```

**Types:**

| Sensor | Principle | Range | Output | Use Case |
|--------|-----------|-------|--------|----------|
| Sharp GP2Y0A21 | Triangulation | 10-80cm | Analog | General purpose |
| Sharp GP2Y0A02 | Triangulation | 20-150cm | Analog | Longer range |
| VL53L0X | Time-of-flight | 0-200cm | I2C | High accuracy |
| VL53L1X | Time-of-flight | 0-400cm | I2C | Extended range |

```python
# VL53L0X time-of-flight sensor example
import board
import adafruit_vl53l0x

# Initialize I2C and sensor
i2c = board.I2C()
sensor = adafruit_vl53l0x.VL53L0X(i2c)

# Configure measurement
sensor.measurement_timing_budget = 200000  # 200ms for better accuracy

def read_distance():
    """Read distance in millimeters."""
    distance_mm = sensor.range
    if distance_mm > 8000:  # Out of range
        return None
    return distance_mm

# Continuous reading
while True:
    dist = read_distance()
    if dist:
        print(f"Distance: {dist} mm ({dist/10:.1f} cm)")
    else:
        print("Out of range")
    time.sleep(0.1)
```

### LiDAR Sensors

**Principle**: Time-of-flight of laser light

```
LiDAR Scanning:

        ┌─────────────────────────────────┐
        │         Scanning LiDAR          │
        │    ┌───┐                        │
        │    │ ╲ │ ◄── Rotating mirror    │
        │    └───┘                        │
        └─────────────────────────────────┘
               │ │ │ │ │ │ │
               ▼ ▼ ▼ ▼ ▼ ▼ ▼
          ┌───┐   ┌───┐   ┌───┐
          │   │   │   │   │   │
          │   │   │   │   │   │
          └───┘   └───┘   └───┘
         Objects detected with
         distance and angle
```

**Popular 2D LiDAR sensors:**

| Sensor | Range | Points/sec | Accuracy | Price |
|--------|-------|------------|----------|-------|
| RPLIDAR A1 | 12m | 8000 | ±1% | ~$100 |
| RPLIDAR A2 | 18m | 8000 | &lt;1% | ~$300 |
| YDLIDAR X4 | 10m | 5000 | ±2% | ~$80 |
| Hokuyo URG-04LX | 4m | 36000 | ±3cm | ~$1000 |

```python
# RPLIDAR example using rplidar library
from rplidar import RPLidar

lidar = RPLidar('/dev/ttyUSB0')

def get_scan():
    """Get one complete 360° scan."""
    for scan in lidar.iter_scans():
        # scan is list of (quality, angle, distance)
        measurements = []
        for (quality, angle, distance) in scan:
            if quality > 0 and distance > 0:
                measurements.append({
                    'angle': angle,
                    'distance': distance,
                    'quality': quality
                })
        return measurements

# Get and process scan
scan_data = get_scan()
print(f"Got {len(scan_data)} points")

# Find closest obstacle
if scan_data:
    closest = min(scan_data, key=lambda x: x['distance'])
    print(f"Closest: {closest['distance']:.0f}mm at {closest['angle']:.1f}°")

lidar.stop()
lidar.disconnect()
```

### Distance Sensor Comparison

```
                    Range       Accuracy    Speed    Cost    Best For
Ultrasonic       ├────────────┤  Medium     Medium   Low     General navigation
IR Triangulation ├────────┤      Medium     Fast     Low     Close range
IR Time-of-Flight├───────────┤   High       Fast     Medium  Precise measurement
2D LiDAR        ├─────────────────┤High      Fast     High    Mapping, SLAM
3D LiDAR        ├─────────────────┤High      Fast     V.High  Autonomous vehicles

                 0cm   50cm   1m    5m    10m   50m   100m
```

## Inertial Measurement Units (IMU)

IMUs measure motion and orientation.

### Components

```
IMU Internal Structure:

┌─────────────────────────────────────────────────────┐
│                      IMU                            │
├─────────────────┬─────────────────┬─────────────────┤
│  Accelerometer  │   Gyroscope     │  Magnetometer   │
│   (3-axis)      │   (3-axis)      │   (3-axis)      │
├─────────────────┼─────────────────┼─────────────────┤
│ Measures:       │ Measures:       │ Measures:       │
│ Linear accel.   │ Angular rate    │ Magnetic field  │
│ + Gravity       │ (rotation)      │ (heading)       │
├─────────────────┼─────────────────┼─────────────────┤
│ Outputs:        │ Outputs:        │ Outputs:        │
│ ax, ay, az      │ gx, gy, gz      │ mx, my, mz      │
│ (m/s² or g)     │ (°/s or rad/s)  │ (µT or Gauss)   │
└─────────────────┴─────────────────┴─────────────────┘
         │                 │                 │
         └────────────┬────┴────────┬────────┘
                      │             │
              ┌───────▼───────┐     │
              │ Sensor Fusion │◄────┘
              │  Algorithm    │
              └───────┬───────┘
                      │
              ┌───────▼───────┐
              │ Roll, Pitch,  │
              │    Yaw        │
              └───────────────┘
```

### Popular IMU Sensors

| Sensor | Axes | Features | Interface | Price |
|--------|------|----------|-----------|-------|
| MPU-6050 | 6 (Accel+Gyro) | DMP, cheap | I2C | $3-5 |
| MPU-9250 | 9 (+ Magnetometer) | DMP | I2C/SPI | $10-15 |
| BNO055 | 9 | Built-in fusion | I2C | $25-35 |
| ICM-20948 | 9 | Low power | I2C/SPI | $15-20 |
| BMI270 | 6 | Wearables | I2C/SPI | $10 |

```python
# MPU-6050 reading with sensor fusion
import numpy as np
from mpu6050 import mpu6050
import time

sensor = mpu6050(0x68)

class ComplementaryFilter:
    """Simple sensor fusion using complementary filter."""

    def __init__(self, alpha=0.98):
        self.alpha = alpha  # Weight for gyro data
        self.pitch = 0
        self.roll = 0
        self.last_time = time.time()

    def update(self, accel, gyro):
        # Calculate time delta
        current_time = time.time()
        dt = current_time - self.last_time
        self.last_time = current_time

        # Accelerometer angles (reference)
        accel_pitch = np.arctan2(accel['y'],
                                  np.sqrt(accel['x']**2 + accel['z']**2))
        accel_roll = np.arctan2(-accel['x'], accel['z'])

        # Integrate gyroscope (in radians)
        gyro_pitch = self.pitch + np.radians(gyro['x']) * dt
        gyro_roll = self.roll + np.radians(gyro['y']) * dt

        # Complementary filter
        self.pitch = self.alpha * gyro_pitch + (1 - self.alpha) * accel_pitch
        self.roll = self.alpha * gyro_roll + (1 - self.alpha) * accel_roll

        return {
            'pitch': np.degrees(self.pitch),
            'roll': np.degrees(self.roll)
        }

# Usage
filter = ComplementaryFilter()

while True:
    accel = sensor.get_accel_data()
    gyro = sensor.get_gyro_data()

    orientation = filter.update(accel, gyro)
    print(f"Pitch: {orientation['pitch']:.1f}° Roll: {orientation['roll']:.1f}°")

    time.sleep(0.02)  # 50 Hz update rate
```

## Sensor Selection Framework

### Decision Process

```
Sensor Selection Framework:

1. DEFINE REQUIREMENTS
   ├── What physical quantity to measure?
   ├── Required range?
   ├── Required accuracy/resolution?
   ├── Required update rate?
   └── Environmental conditions?

2. IDENTIFY CANDIDATES
   ├── List sensor types that measure quantity
   ├── Filter by range requirements
   └── Filter by accuracy requirements

3. EVALUATE CONSTRAINTS
   ├── Cost budget
   ├── Size/weight limits
   ├── Power consumption
   ├── Interface compatibility
   └── Availability

4. PROTOTYPE AND TEST
   ├── Order samples
   ├── Test in actual conditions
   ├── Verify specifications
   └── Assess integration effort

5. FINAL SELECTION
   ├── Document trade-offs
   ├── Plan for failure modes
   └── Consider backup options
```

### Example: Obstacle Detection Sensor Selection

**Requirements:**
- Detect obstacles 5cm to 2m away
- 10 Hz minimum update rate
- Indoor environment
- Budget: < $20

**Analysis:**

| Sensor | Range Match | Speed | Cost | Verdict |
|--------|-------------|-------|------|---------|
| HC-SR04 | 2cm-4m ✓ | 40Hz ✓ | $3 ✓ | **Good choice** |
| Sharp IR | 10-80cm ✗ | Fast ✓ | $12 ✓ | Too short range |
| VL53L0X | 0-2m ✓ | 50Hz ✓ | $10 ✓ | **Best choice** |
| RPLIDAR | 0-12m ✓ | Fast ✓ | $100 ✗ | Over budget |

**Decision**: VL53L0X - meets all requirements with digital interface advantage.

---

## Knowledge Check

<details>
<summary>**Question 1**: What's the difference between proprioceptive and exteroceptive sensors?</summary>

**Proprioceptive sensors** measure the robot's internal state:
- Joint positions, velocities
- Orientation (IMU)
- Motor currents, battery voltage

**Exteroceptive sensors** measure the external environment:
- Distance to objects
- Visual information (cameras)
- Contact with objects (touch sensors)
- Environmental conditions (temperature, humidity)
</details>

<details>
<summary>**Question 2**: Why might you choose an IR ToF sensor over ultrasonic for distance measurement?</summary>

Choose IR Time-of-Flight (like VL53L0X) when:
- You need higher accuracy (±1mm vs ±3mm)
- Measuring small or angled objects (narrow beam)
- Need faster response time
- Working with soft/absorbing materials (ultrasonic issues)
- Need digital I2C interface vs analog

Choose ultrasonic when:
- Cost is primary concern
- Need longer range (>2m)
- Working in dusty environments (light scatter issues)
- Detecting transparent objects (glass)
</details>

<details>
<summary>**Question 3**: What are the three components of a 9-axis IMU and what does each measure?</summary>

1. **Accelerometer** (3 axes): Measures linear acceleration including gravity
   - Used for: Tilt detection, motion detection, step counting

2. **Gyroscope** (3 axes): Measures angular velocity (rotation rate)
   - Used for: Rotation tracking, stabilization, dead reckoning

3. **Magnetometer** (3 axes): Measures magnetic field (compass)
   - Used for: Heading/yaw reference, absolute orientation

Together they enable full 3D orientation tracking (roll, pitch, yaw).
</details>

---

## Hands-On Exercise

### Exercise 2.1: Sensor Comparison

**Part A: Research**
Choose ONE of these scenarios and research the best sensor solution:

1. **Line-following robot**: Detecting a black line on white surface
2. **Robotic arm gripper**: Detecting when object is grasped
3. **Balancing robot**: Maintaining upright position
4. **Outdoor robot**: Navigating in variable lighting

For your chosen scenario:
- List 3 candidate sensors
- Compare specifications in a table
- Recommend one with justification

**Part B: Simulation/Prototyping**
Using Tinkercad Circuits or real hardware:
- Wire up an ultrasonic sensor (HC-SR04) to Arduino
- Write code to read and display distance
- Test accuracy at different distances (measure with ruler)
- Document findings

**Part C: Analysis**
Answer these questions about your sensor:
1. What is the minimum reliable distance it can measure?
2. How does angle of the object affect readings?
3. What happens with soft vs hard surfaces?

---

## Summary

In this lesson, we learned:

- **Sensor classification**: By information type, output type, and physical principle
- **Key specifications**: Resolution, accuracy, precision, range, response time
- **Distance sensors**: Ultrasonic, IR, LiDAR - each with trade-offs
- **IMU sensors**: Accelerometer + gyroscope + magnetometer for orientation
- **Selection framework**: Systematic approach to choosing the right sensor

## Next Steps

In the next lesson, we'll learn about **Data Acquisition and Processing** - how to read sensors reliably, filter noise, and fuse multiple sensor inputs.

---

## Additional Resources

- [Sensor Selection Guide - SparkFun](https://learn.sparkfun.com/tutorials/sensor-selection-guide)
- [Understanding Sensor Specifications - National Instruments](https://www.ni.com/en-us/innovations/white-papers/sensor-specifications.html)
- [IMU Guide - Adafruit](https://learn.adafruit.com/adafruit-sensorlab-gyroscope-calibration)
