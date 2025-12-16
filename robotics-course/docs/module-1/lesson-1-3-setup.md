---
sidebar_position: 3
title: "1.3 Software Environment Setup"
description: Setting up your development environment for robotics programming with Python, Arduino, and simulation tools
---

# Software Environment Setup

In this lesson, we'll set up all the software tools you need to start programming robots. We'll cover Python, Arduino IDE, simulation environments, and essential libraries.

## Learning Objectives

By the end of this lesson, you will be able to:

- Install and configure Python with robotics libraries
- Set up Arduino IDE for microcontroller programming
- Install and run robot simulations
- Configure VS Code for robotics development
- Verify your setup with test programs

## Python Environment Setup

Python is the primary language for high-level robotics programming, computer vision, and machine learning.

### Step 1: Install Python

#### Windows

1. Download Python 3.10+ from [python.org](https://www.python.org/downloads/)
2. **Important**: Check "Add Python to PATH" during installation
3. Verify installation:

```bash
python --version
pip --version
```

#### macOS

```bash
# Using Homebrew (recommended)
brew install python@3.11

# Verify
python3 --version
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv

# Verify
python3 --version
```

### Step 2: Create a Virtual Environment

Virtual environments isolate project dependencies. Always use them!

```bash
# Create project directory
mkdir robotics-course
cd robotics-course

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Your prompt should now show (venv)
```

### Step 3: Install Robotics Libraries

```bash
# Core scientific computing
pip install numpy scipy matplotlib

# Computer vision
pip install opencv-python

# Serial communication (Arduino)
pip install pyserial

# GPIO (Raspberry Pi only)
# pip install RPi.GPIO gpiozero

# Robotics frameworks
pip install roboticstoolbox-python

# Jupyter for interactive development
pip install jupyter notebook

# Save your dependencies
pip freeze > requirements.txt
```

### Verify Python Setup

Create a test file `test_setup.py`:

```python
#!/usr/bin/env python3
"""Test robotics environment setup."""

import sys

def test_imports():
    """Test that all required libraries are installed."""
    libraries = [
        ('numpy', 'np'),
        ('scipy', None),
        ('matplotlib.pyplot', 'plt'),
        ('cv2', None),
        ('serial', None),
    ]

    results = []
    for lib, alias in libraries:
        try:
            if alias:
                exec(f"import {lib} as {alias}")
            else:
                exec(f"import {lib}")
            results.append((lib, "OK"))
        except ImportError as e:
            results.append((lib, f"FAILED: {e}"))

    return results

def main():
    print("=" * 50)
    print("Robotics Environment Test")
    print("=" * 50)
    print(f"\nPython version: {sys.version}")
    print("\nLibrary Status:")
    print("-" * 50)

    results = test_imports()
    all_ok = True

    for lib, status in results:
        status_icon = "✓" if status == "OK" else "✗"
        print(f"  {status_icon} {lib}: {status}")
        if status != "OK":
            all_ok = False

    print("-" * 50)
    if all_ok:
        print("\n✓ All libraries installed successfully!")
    else:
        print("\n✗ Some libraries are missing. Run:")
        print("  pip install -r requirements.txt")

    return 0 if all_ok else 1

if __name__ == "__main__":
    sys.exit(main())
```

Run the test:

```bash
python test_setup.py
```

## Arduino IDE Setup

Arduino IDE is essential for programming microcontrollers like Arduino boards and ESP32.

### Step 1: Download and Install

1. Download from [arduino.cc/software](https://www.arduino.cc/en/software)
2. Install for your operating system
3. Launch Arduino IDE

### Step 2: Install Board Support

**For Arduino boards:**
- Most are supported out of the box

**For ESP32:**
1. Go to `File > Preferences`
2. Add to "Additional Board Manager URLs":
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Go to `Tools > Board > Boards Manager`
4. Search "esp32" and install "ESP32 by Espressif Systems"

**For Raspberry Pi Pico:**
1. Add to "Additional Board Manager URLs":
   ```
   https://github.com/earlephilhower/arduino-pico/releases/download/global/package_rp2040_index.json
   ```
2. Install "Raspberry Pi Pico/RP2040" from Boards Manager

### Step 3: Install Essential Libraries

Go to `Tools > Manage Libraries` and install:

- **Servo** - Servo motor control
- **Stepper** - Stepper motor control
- **Wire** - I2C communication (usually pre-installed)
- **Adafruit Sensor** - Unified sensor library
- **NewPing** - Ultrasonic sensor library

### Verify Arduino Setup

1. Connect your Arduino board via USB
2. Select board: `Tools > Board > Arduino Uno` (or your board)
3. Select port: `Tools > Port > COMx` (Windows) or `/dev/ttyUSBx` (Linux)

Upload the blink test:

```cpp
// Built-in LED blink test
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Arduino ready!");
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  Serial.println("LED ON");
  delay(1000);

  digitalWrite(LED_BUILTIN, LOW);
  Serial.println("LED OFF");
  delay(1000);
}
```

If the built-in LED blinks and you see output in Serial Monitor (`Tools > Serial Monitor`), your setup is working!

## VS Code Setup

Visual Studio Code provides a powerful development environment for both Python and Arduino.

### Step 1: Install VS Code

Download from [code.visualstudio.com](https://code.visualstudio.com/)

### Step 2: Install Extensions

Search and install these extensions:

| Extension | Purpose |
|-----------|---------|
| Python | Python language support |
| Pylance | Python IntelliSense |
| Arduino | Arduino development |
| C/C++ | C++ support for Arduino |
| Jupyter | Interactive notebooks |
| GitLens | Git integration |

### Step 3: Configure Python

1. Open your robotics project folder
2. Press `Ctrl+Shift+P` (Cmd on Mac)
3. Select "Python: Select Interpreter"
4. Choose your virtual environment

### Step 4: Configure Arduino

1. Press `Ctrl+Shift+P`
2. Search "Arduino: Board Config"
3. Set your board type
4. Set your serial port

### VS Code Settings

Add to your workspace `.vscode/settings.json`:

```json
{
  "python.analysis.typeCheckingMode": "basic",
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "files.autoSave": "afterDelay",
  "arduino.path": "C:/Program Files/Arduino IDE",
  "arduino.commandPath": "arduino-cli"
}
```

## Simulation Environments

Simulations let you develop and test code without physical hardware.

### Webots (Recommended for Beginners)

Webots is a free, open-source robot simulator.

**Installation:**

1. Download from [cyberbotics.com](https://cyberbotics.com/)
2. Install for your OS
3. Launch Webots

**Your First Simulation:**

1. Open Webots
2. `File > Open Sample World`
3. Navigate to `robots/e-puck/e-puck.wbt`
4. Press the play button to run

**Python Controller Example:**

```python
# e-puck controller
from controller import Robot

robot = Robot()
timestep = int(robot.getBasicTimeStep())

# Get motors
left_motor = robot.getDevice('left wheel motor')
right_motor = robot.getDevice('right wheel motor')

# Set to velocity mode
left_motor.setPosition(float('inf'))
right_motor.setPosition(float('inf'))

# Get distance sensors
sensors = []
for i in range(8):
    sensor = robot.getDevice(f'ps{i}')
    sensor.enable(timestep)
    sensors.append(sensor)

# Main loop
while robot.step(timestep) != -1:
    # Read sensors
    values = [s.getValue() for s in sensors]

    # Simple obstacle avoidance
    if values[0] > 80 or values[7] > 80:
        # Obstacle ahead, turn
        left_motor.setVelocity(-2.0)
        right_motor.setVelocity(2.0)
    else:
        # Go forward
        left_motor.setVelocity(5.0)
        right_motor.setVelocity(5.0)
```

### Gazebo (ROS Integration)

Gazebo is powerful for ROS-based projects.

**Installation (Ubuntu):**

```bash
# For ROS 2 Humble
sudo apt install ros-humble-gazebo-ros-pkgs

# Standalone
sudo apt install gazebo
```

### Tinkercad Circuits (Browser-based)

[Tinkercad Circuits](https://www.tinkercad.com/circuits) provides free Arduino simulation in your browser - perfect for learning without hardware!

## Version Control with Git

Version control is essential for any serious project.

### Install Git

```bash
# Windows: Download from git-scm.com

# macOS
brew install git

# Linux
sudo apt install git
```

### Basic Git Setup

```bash
# Configure your identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Initialize your project
cd robotics-course
git init

# Create .gitignore
echo "venv/
__pycache__/
*.pyc
.DS_Store
build/
*.o" > .gitignore

# First commit
git add .
git commit -m "Initial robotics course setup"
```

---

## Knowledge Check

<details>
<summary>**Question 1**: Why should you use virtual environments for Python projects?</summary>

Virtual environments:
- Isolate project dependencies from system Python
- Allow different projects to use different library versions
- Make it easy to reproduce your environment on other machines
- Prevent conflicts between package requirements
- Keep your system Python clean
</details>

<details>
<summary>**Question 2**: What's the difference between the Arduino IDE and VS Code for Arduino development?</summary>

**Arduino IDE:**
- Purpose-built for Arduino
- Simpler interface
- Built-in board management
- Good for beginners

**VS Code with Arduino extension:**
- More powerful editor features
- Better code navigation and IntelliSense
- Integrated terminal
- Better for larger projects
- Same workflow as Python development
</details>

<details>
<summary>**Question 3**: When would you use a simulator instead of real hardware?</summary>

Use simulators when:
- Learning concepts before buying hardware
- Testing dangerous or expensive scenarios
- Rapid prototyping and debugging
- Consistent, repeatable testing
- Hardware isn't available
- Parallelizing development (test code while building hardware)
</details>

---

## Hands-On Exercise

### Exercise 1.3: Environment Verification

Complete these tasks to verify your setup is working:

#### Part A: Python Test

Create and run this program:

```python
# environment_test.py
import numpy as np
import cv2
import matplotlib.pyplot as plt

# NumPy test
arr = np.array([1, 2, 3, 4, 5])
print(f"NumPy array: {arr}")
print(f"Mean: {np.mean(arr)}")

# OpenCV test
img = np.zeros((200, 200, 3), dtype=np.uint8)
cv2.circle(img, (100, 100), 50, (0, 255, 0), -1)
cv2.putText(img, "OpenCV OK", (40, 180),
            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

# Save image (display requires GUI)
cv2.imwrite("test_output.png", img)
print("OpenCV image saved to test_output.png")

# Matplotlib test
plt.figure(figsize=(8, 4))
plt.subplot(1, 2, 1)
plt.plot([1, 2, 3, 4], [1, 4, 2, 3])
plt.title("Matplotlib Test")
plt.subplot(1, 2, 2)
plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
plt.title("OpenCV Image")
plt.savefig("matplotlib_test.png")
print("Matplotlib plot saved to matplotlib_test.png")

print("\n✓ Python environment test complete!")
```

#### Part B: Arduino Test

Upload this to your Arduino (if you have one):

```cpp
// sensor_test.ino
void setup() {
  Serial.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);

  Serial.println("=== Arduino Sensor Test ===");
  Serial.println("Reading analog pin A0...");
  Serial.println("(Connect a potentiometer or leave floating)");
}

void loop() {
  int sensorValue = analogRead(A0);
  float voltage = sensorValue * (5.0 / 1023.0);

  Serial.print("Raw: ");
  Serial.print(sensorValue);
  Serial.print(" | Voltage: ");
  Serial.print(voltage);
  Serial.println("V");

  // Blink LED based on sensor value
  int blinkDelay = map(sensorValue, 0, 1023, 50, 500);
  digitalWrite(LED_BUILTIN, HIGH);
  delay(blinkDelay);
  digitalWrite(LED_BUILTIN, LOW);
  delay(blinkDelay);
}
```

#### Part C: Simulation Test

If using Webots:
1. Open the e-puck sample world
2. Run the simulation
3. Try modifying the controller to change the robot's behavior

**Deliverables:**
- Screenshot of successful Python test output
- Screenshot of Arduino Serial Monitor (if applicable)
- Brief notes on any issues encountered and how you resolved them

---

## Summary

In this lesson, we set up:

- **Python environment** with virtual environments and robotics libraries
- **Arduino IDE** for microcontroller programming
- **VS Code** as a unified development environment
- **Simulators** for hardware-free development
- **Git** for version control

## Next Steps

Congratulations on completing Module 1! You now have:
- Understanding of Physical AI concepts
- Knowledge of hardware components
- A fully configured development environment

In **Module 2**, we'll dive into sensors - learning how robots perceive their environment.

---

## Troubleshooting

### Common Issues

**Python: "pip not recognized"**
- Ensure Python is in PATH
- Try `python -m pip` instead

**Arduino: "Port not found"**
- Install USB drivers for your board
- Try a different USB cable (data cable, not charge-only)
- Check Device Manager (Windows) or `ls /dev/tty*` (Linux/Mac)

**VS Code: "Python interpreter not found"**
- Reload VS Code after creating virtual environment
- Manually select interpreter via Command Palette

**Webots: Slow performance**
- Reduce simulation speed in preferences
- Close other applications
- Check graphics driver is up to date

---

## Additional Resources

- [Python Packaging Guide](https://packaging.python.org/guides/)
- [Arduino Troubleshooting](https://support.arduino.cc/hc/en-us/articles/360016495679)
- [Webots User Guide](https://cyberbotics.com/doc/guide/index)
- [VS Code Python Tutorial](https://code.visualstudio.com/docs/python/python-tutorial)
