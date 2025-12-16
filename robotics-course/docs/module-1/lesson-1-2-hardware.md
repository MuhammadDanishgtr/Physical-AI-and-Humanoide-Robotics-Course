---
sidebar_position: 2
title: "1.2 Hardware Fundamentals"
description: Essential hardware components for robotics - microcontrollers, sensors, actuators, and how to choose them
---

# Hardware Fundamentals

In this lesson, we'll explore the essential hardware components that form the foundation of any robotic system. Understanding these components is crucial for designing and building effective Physical AI systems.

## Learning Objectives

By the end of this lesson, you will be able to:

- Compare different microcontroller platforms and choose appropriately
- Understand common sensor types and their applications
- Explain how various actuators work and when to use them
- Design basic circuit connections for robotics projects
- Evaluate hardware requirements for different project types

## Microcontrollers: The Robot's Brain

A **microcontroller** is a small computer on a single chip that serves as the brain of your robot. It reads sensors, runs your code, and controls actuators.

### Popular Platforms for Robotics

#### Arduino Family

The Arduino ecosystem is excellent for beginners and rapid prototyping.

| Board | Processor | Clock | Digital I/O | Analog In | Best For |
|-------|-----------|-------|-------------|-----------|----------|
| Arduino Uno | ATmega328P | 16 MHz | 14 | 6 | Learning, simple projects |
| Arduino Mega | ATmega2560 | 16 MHz | 54 | 16 | Complex projects, many sensors |
| Arduino Nano | ATmega328P | 16 MHz | 14 | 8 | Space-constrained projects |

```cpp
// Basic Arduino sketch structure
void setup() {
  // Runs once at startup
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  // Runs continuously
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}
```

#### Raspberry Pi Family

Raspberry Pi offers more computing power and runs Linux, enabling complex AI tasks.

| Board | Processor | RAM | GPIO | Best For |
|-------|-----------|-----|------|----------|
| Pi 4 Model B | Quad-core 1.5GHz | 2-8 GB | 40 | Computer vision, ML inference |
| Pi Zero 2 W | Quad-core 1GHz | 512 MB | 40 | Compact projects with wireless |
| Pi Pico | Dual-core RP2040 | 264 KB | 26 | Real-time control, Arduino alternative |

```python
# Basic Raspberry Pi GPIO example
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setup(18, GPIO.OUT)

while True:
    GPIO.output(18, GPIO.HIGH)
    time.sleep(1)
    GPIO.output(18, GPIO.LOW)
    time.sleep(1)
```

#### ESP32

The ESP32 combines WiFi/Bluetooth with real-time capabilities.

- Dual-core processor up to 240 MHz
- Built-in WiFi and Bluetooth
- Low power modes for battery operation
- Excellent price-to-performance ratio

### Choosing a Microcontroller

Consider these factors when selecting a microcontroller:

```
┌────────────────────────────────────────────────────────────┐
│                 Microcontroller Selection                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Real-time critical? ──► Arduino/Pi Pico                   │
│           │                                                │
│           No                                               │
│           ▼                                                │
│  Computer vision? ──► Raspberry Pi 4                       │
│           │                                                │
│           No                                               │
│           ▼                                                │
│  WiFi needed? ──► ESP32                                    │
│           │                                                │
│           No                                               │
│           ▼                                                │
│  Many I/O pins? ──► Arduino Mega                           │
│           │                                                │
│           No                                               │
│           ▼                                                │
│  Learning/Simple ──► Arduino Uno                           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Sensors: Perceiving the World

Sensors convert physical phenomena into electrical signals that your microcontroller can read.

### Distance Sensors

#### Ultrasonic Sensors (HC-SR04)

- **Range**: 2cm - 400cm
- **Accuracy**: ±3mm
- **Principle**: Sound wave time-of-flight
- **Cost**: ~$2-5

```python
# Ultrasonic sensor with Raspberry Pi
import RPi.GPIO as GPIO
import time

TRIG = 23
ECHO = 24

GPIO.setmode(GPIO.BCM)
GPIO.setup(TRIG, GPIO.OUT)
GPIO.setup(ECHO, GPIO.IN)

def get_distance():
    GPIO.output(TRIG, True)
    time.sleep(0.00001)
    GPIO.output(TRIG, False)

    while GPIO.input(ECHO) == 0:
        pulse_start = time.time()
    while GPIO.input(ECHO) == 1:
        pulse_end = time.time()

    pulse_duration = pulse_end - pulse_start
    distance = pulse_duration * 17150  # Speed of sound / 2
    return round(distance, 2)
```

#### Infrared (IR) Distance Sensors

- **Sharp GP2Y0A21**: 10-80cm range, analog output
- **VL53L0X**: Time-of-flight, 2m range, I2C digital
- **Good for**: Line following, edge detection, proximity

#### LiDAR

- **2D LiDAR**: RPLIDAR A1 (~$100), mapping and navigation
- **3D LiDAR**: Advanced applications, higher cost
- **Best for**: SLAM, autonomous navigation

### Inertial Measurement Units (IMU)

IMUs measure orientation and movement using accelerometers and gyroscopes.

#### MPU-6050 (Popular, Low-cost)

- 3-axis accelerometer
- 3-axis gyroscope
- Digital output via I2C

```python
# MPU-6050 reading with Python
from mpu6050 import mpu6050

sensor = mpu6050(0x68)

accel_data = sensor.get_accel_data()
gyro_data = sensor.get_gyro_data()

print(f"Acceleration: X={accel_data['x']:.2f}, Y={accel_data['y']:.2f}, Z={accel_data['z']:.2f}")
print(f"Gyroscope: X={gyro_data['x']:.2f}, Y={gyro_data['y']:.2f}, Z={gyro_data['z']:.2f}")
```

#### BNO055 (Advanced, Built-in Fusion)

- 9-axis (accelerometer + gyroscope + magnetometer)
- On-board sensor fusion
- Outputs quaternions directly

### Vision Sensors

#### Cameras

| Type | Resolution | FPS | Interface | Use Case |
|------|------------|-----|-----------|----------|
| Pi Camera v2 | 8MP | 30 | CSI | General vision |
| USB Webcam | 1-4MP | 30 | USB | Easy setup |
| OV7670 | 640x480 | 30 | Parallel | Arduino (limited) |
| OpenMV | 5MP | 60 | Serial | ML on camera |

#### Depth Cameras

- **Intel RealSense D435**: Stereo depth, RGB
- **Azure Kinect**: ToF depth, body tracking
- **OAK-D**: Edge AI capabilities

### Environmental Sensors

| Sensor | Measures | Interface | Example Part |
|--------|----------|-----------|--------------|
| DHT22 | Temperature, Humidity | Digital | $5 |
| BMP280 | Pressure, Altitude | I2C | $3 |
| MQ-2 | Gas, Smoke | Analog | $4 |
| Soil Moisture | Water content | Analog | $2 |

## Actuators: Affecting the World

Actuators convert electrical signals into physical motion.

### DC Motors

Simple, high-speed rotation. Require motor drivers for control.

```
DC Motor Characteristics:
├── Speed: Controlled by voltage (PWM)
├── Direction: Controlled by polarity
├── Torque: Inversely related to speed
└── Use with: H-Bridge driver (L298N, TB6612)
```

```python
# DC Motor control with L298N driver
import RPi.GPIO as GPIO
import time

# Motor pins
IN1 = 17
IN2 = 27
ENA = 22  # PWM for speed

GPIO.setmode(GPIO.BCM)
GPIO.setup(IN1, GPIO.OUT)
GPIO.setup(IN2, GPIO.OUT)
GPIO.setup(ENA, GPIO.OUT)

pwm = GPIO.PWM(ENA, 1000)  # 1kHz frequency
pwm.start(0)

def motor_forward(speed):
    GPIO.output(IN1, GPIO.HIGH)
    GPIO.output(IN2, GPIO.LOW)
    pwm.ChangeDutyCycle(speed)

def motor_backward(speed):
    GPIO.output(IN1, GPIO.LOW)
    GPIO.output(IN2, GPIO.HIGH)
    pwm.ChangeDutyCycle(speed)

def motor_stop():
    GPIO.output(IN1, GPIO.LOW)
    GPIO.output(IN2, GPIO.LOW)
    pwm.ChangeDutyCycle(0)
```

### Servo Motors

Precise position control within a limited range (typically 0-180°).

```cpp
// Arduino servo control
#include <Servo.h>

Servo myServo;

void setup() {
  myServo.attach(9);  // Servo on pin 9
}

void loop() {
  myServo.write(0);    // Move to 0 degrees
  delay(1000);
  myServo.write(90);   // Move to 90 degrees
  delay(1000);
  myServo.write(180);  // Move to 180 degrees
  delay(1000);
}
```

**Types of Servos:**
- **Standard**: 0-180° rotation, good torque
- **Continuous rotation**: Full rotation, speed control
- **Digital**: Faster response, higher holding torque
- **High-torque**: 20+ kg·cm for larger robots

### Stepper Motors

Precise positioning with discrete steps, common in 3D printers and CNC machines.

```
Stepper Motor Types:
├── NEMA 17: Most common, 1.8° step (200 steps/rev)
├── NEMA 23: Larger, more torque
└── 28BYJ-48: Small, cheap, 5V operation
```

```python
# Stepper motor control with A4988 driver
import RPi.GPIO as GPIO
import time

STEP = 20
DIR = 21

GPIO.setmode(GPIO.BCM)
GPIO.setup(STEP, GPIO.OUT)
GPIO.setup(DIR, GPIO.OUT)

def step_motor(steps, direction, delay=0.001):
    GPIO.output(DIR, direction)
    for _ in range(steps):
        GPIO.output(STEP, GPIO.HIGH)
        time.sleep(delay)
        GPIO.output(STEP, GPIO.LOW)
        time.sleep(delay)

# Move 200 steps (one revolution) clockwise
step_motor(200, GPIO.HIGH)
```

### Motor Comparison

| Motor Type | Position Control | Speed | Torque | Complexity | Cost |
|------------|-----------------|-------|--------|------------|------|
| DC | Open loop | High | Medium | Low | $ |
| Servo | Built-in (limited) | Medium | Medium | Low | $$ |
| Stepper | Steps (open loop) | Low-Med | High | Medium | $$ |
| Brushless DC | With encoder | Very High | High | High | $$$ |

## Power Systems

### Battery Types for Robotics

| Type | Voltage | Energy Density | Weight | Cost | Notes |
|------|---------|----------------|--------|------|-------|
| Alkaline AA | 1.5V | Low | Heavy | $ | Easy, disposable |
| NiMH | 1.2V | Medium | Medium | $$ | Rechargeable |
| Li-Po | 3.7V/cell | High | Light | $$$ | High discharge, fire risk |
| Li-Ion 18650 | 3.7V | High | Medium | $$ | Safe, good capacity |

### Power Distribution

```
Typical Robot Power Architecture:
                    ┌─────────────────┐
                    │    Battery      │
                    │   (11.1V LiPo)  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
        │ 5V Reg    │  │Motor Driver│  │ 3.3V Reg  │
        │ (BEC)     │  │            │  │           │
        └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
              │              │              │
        ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
        │  Servos   │  │  Motors   │  │   MCU     │
        │  Sensors  │  │           │  │  Sensors  │
        └───────────┘  └───────────┘  └───────────┘
```

:::warning Power Safety
- Never short-circuit batteries
- Use appropriate fuses or circuit breakers
- Li-Po batteries require special chargers and storage
- Keep batteries away from heat and moisture
:::

## Circuit Basics for Robotics

### Essential Components

- **Resistors**: Current limiting, voltage dividers
- **Capacitors**: Noise filtering, power smoothing
- **Diodes**: Protection, flyback suppression
- **Transistors/MOSFETs**: Switching, amplification

### Pull-up and Pull-down Resistors

Digital inputs can "float" between HIGH and LOW. Pull resistors ensure a defined state.

```
Pull-up Resistor:          Pull-down Resistor:

    VCC                        VCC
     │                          │
     ├── 10kΩ ──┐               │
     │          │               │
   Input       Button        Button
     │          │               │
     └──────────┴── GND       Input
                                │
                         10kΩ ──┤
                                │
                               GND
```

### Motor Flyback Protection

Motors generate voltage spikes when switched off. Diodes protect your circuit.

```
                   VCC
                    │
                ┌───┴───┐
                │ Motor │
                └───┬───┘
          ┌─────────┼─────────┐
          │         │         │
        Diode    MOSFET    Diode
        (flyback)  │      (flyback)
          │         │         │
          └─────────┴─────────┘
                    │
                   GND
```

---

## Knowledge Check

<details>
<summary>**Question 1**: When would you choose a Raspberry Pi over an Arduino?</summary>

Choose Raspberry Pi when you need:
- Computer vision processing
- Machine learning inference
- Linux-based software
- WiFi/Ethernet connectivity
- More computational power

Choose Arduino when you need:
- Real-time, deterministic control
- Simpler projects with less overhead
- Lower power consumption
- Direct hardware access
</details>

<details>
<summary>**Question 2**: What's the difference between a servo motor and a stepper motor?</summary>

**Servo motors:**
- Built-in position feedback (closed-loop)
- Limited rotation range (typically 0-180°)
- Hold position with power applied
- Easier to use, lower precision

**Stepper motors:**
- No feedback (open-loop, unless encoder added)
- Unlimited rotation
- Move in discrete steps (high precision)
- Can lose position under load
</details>

<details>
<summary>**Question 3**: Why do DC motors need H-bridge drivers?</summary>

DC motors:
1. Require more current than microcontroller pins can supply
2. Need bidirectional current flow for direction control
3. Require PWM for speed control at higher currents

H-bridge drivers provide:
- High current switching capability
- Bidirectional motor control
- PWM speed control
- Protection circuits
</details>

---

## Hands-On Exercise

### Exercise 1.2: Hardware Planning

You're designing a robot to navigate a room, avoid obstacles, and find a charging station.

**Task**: Create a hardware list including:

1. **Microcontroller selection** - Justify your choice
2. **Sensors needed** - What will the robot sense?
3. **Actuators required** - How will it move?
4. **Power system** - Battery type and capacity estimate
5. **Additional components** - Motor drivers, regulators, etc.

**Bonus**: Sketch a simple block diagram showing how components connect.

<details>
<summary>Example Solution</summary>

**Microcontroller**: ESP32
- Reason: Built-in WiFi for monitoring, sufficient GPIO, good balance of power/features

**Sensors**:
- 2x HC-SR04 ultrasonic sensors (front obstacle detection)
- 1x VL53L0X ToF sensor (precise docking)
- 1x MPU-6050 IMU (orientation tracking)
- 2x IR sensors (line following to dock)
- Wheel encoders (odometry)

**Actuators**:
- 2x DC gear motors (differential drive)
- 1x small servo (sensor scanning)

**Power**:
- 2x 18650 Li-Ion cells (7.4V, 5000mAh)
- Estimated runtime: 2-3 hours active

**Additional**:
- L298N motor driver
- 5V/3.3V regulators
- Charging contacts and circuit
- Power switch with LED indicator
</details>

---

## Summary

In this lesson, we covered:

- **Microcontrollers**: Arduino for real-time, Raspberry Pi for compute-heavy tasks, ESP32 for wireless
- **Sensors**: Distance (ultrasonic, IR, LiDAR), IMU, vision, environmental
- **Actuators**: DC motors (speed), servos (position), steppers (precision)
- **Power**: Battery selection and distribution
- **Circuits**: Pull resistors, flyback protection, basic safety

## Next Steps

In the next lesson, we'll set up your **development environment** with all the software tools you need to start programming your robotic systems.

---

## Additional Resources

- [SparkFun Tutorials](https://learn.sparkfun.com/) - Excellent hardware guides
- [Adafruit Learning System](https://learn.adafruit.com/) - Component tutorials
- [Arduino Reference](https://www.arduino.cc/reference/en/) - Official documentation
- [Raspberry Pi Documentation](https://www.raspberrypi.com/documentation/) - Official guides
