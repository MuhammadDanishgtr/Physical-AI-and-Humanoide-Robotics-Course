---
sidebar_position: 1
title: "3.1 Motors and Servo Control"
description: Understanding different motor types and how to control them precisely for robotics applications
---

# Motors and Servo Control

Motors are the muscles of robots. In this lesson, we'll learn how different motors work and how to control them precisely.

## Learning Objectives

By the end of this lesson, you will be able to:

- Explain how DC, servo, and stepper motors work
- Select appropriate motors for different applications
- Implement motor control using PWM
- Control servo positions accurately
- Design motor driver circuits

## Types of Motors

### DC Motors

Simple, fast, and efficient - the workhorse of robotics.

```
DC Motor Internal Structure:

    ┌────────────────────────────────┐
    │         N Magnet               │
    │    ┌────────────────┐          │
    │    │   ┌──────┐     │          │
    │    │   │Rotor │     │  Brushes │
    │ ──►│   │ Coil │     │◄──┐      │
    │    │   └──────┘     │   │      │
    │    └────────────────┘   │      │
    │         S Magnet        │      │
    └─────────────────────────┴──────┘

Operation:
• Current flows through coil via brushes
• Magnetic field interacts with permanent magnets
• Rotor spins, brushes maintain contact
• Reverse polarity = reverse direction
```

```python
# DC Motor Control with PWM
import RPi.GPIO as GPIO
import time

class DCMotor:
    """Control a DC motor via H-bridge driver."""

    def __init__(self, in1_pin, in2_pin, pwm_pin, pwm_freq=1000):
        self.in1 = in1_pin
        self.in2 = in2_pin
        self.pwm_pin = pwm_pin

        GPIO.setmode(GPIO.BCM)
        GPIO.setup(in1_pin, GPIO.OUT)
        GPIO.setup(in2_pin, GPIO.OUT)
        GPIO.setup(pwm_pin, GPIO.OUT)

        self.pwm = GPIO.PWM(pwm_pin, pwm_freq)
        self.pwm.start(0)

    def forward(self, speed):
        """Run motor forward at given speed (0-100)."""
        GPIO.output(self.in1, GPIO.HIGH)
        GPIO.output(self.in2, GPIO.LOW)
        self.pwm.ChangeDutyCycle(speed)

    def backward(self, speed):
        """Run motor backward at given speed (0-100)."""
        GPIO.output(self.in1, GPIO.LOW)
        GPIO.output(self.in2, GPIO.HIGH)
        self.pwm.ChangeDutyCycle(speed)

    def stop(self):
        """Stop the motor."""
        GPIO.output(self.in1, GPIO.LOW)
        GPIO.output(self.in2, GPIO.LOW)
        self.pwm.ChangeDutyCycle(0)

    def brake(self):
        """Active brake (short motor terminals)."""
        GPIO.output(self.in1, GPIO.HIGH)
        GPIO.output(self.in2, GPIO.HIGH)
        self.pwm.ChangeDutyCycle(100)

    def cleanup(self):
        """Release GPIO resources."""
        self.pwm.stop()
        GPIO.cleanup([self.in1, self.in2, self.pwm_pin])


# Usage
motor = DCMotor(in1_pin=17, in2_pin=27, pwm_pin=22)

motor.forward(50)  # 50% speed forward
time.sleep(2)
motor.backward(75)  # 75% speed backward
time.sleep(2)
motor.stop()
motor.cleanup()
```

### Servo Motors

Built-in position control - perfect for precise movements.

```
Servo Motor Components:

┌─────────────────────────────────────┐
│  ┌─────────────────────┐            │
│  │   Control Circuit   │ ◄─ PWM    │
│  └─────────┬───────────┘   Signal  │
│            │                        │
│  ┌─────────▼───────────┐            │
│  │    Potentiometer    │ Position  │
│  │    (Feedback)       │ Sensor    │
│  └─────────┬───────────┘            │
│            │                        │
│  ┌─────────▼───────────┐            │
│  │      DC Motor       │            │
│  │     + Gearbox       │            │
│  └─────────────────────┘            │
└─────────────────────────────────────┘

PWM Signal (50Hz, 20ms period):
├─────────────────────────────────────┤
│                                     │
│  0.5ms │████│_________________│     │ = 0°
│  1.5ms │████████│_____________│     │ = 90°
│  2.5ms │████████████│_________│     │ = 180°
│                                     │
├─────────────────────────────────────┤
        Pulse Width determines angle
```

```python
# Servo Control Methods

# Method 1: Using RPi.GPIO PWM
import RPi.GPIO as GPIO

class ServoGPIO:
    """Direct PWM servo control."""

    def __init__(self, pin, min_pulse=0.5, max_pulse=2.5, freq=50):
        self.pin = pin
        self.min_pulse = min_pulse  # ms for 0°
        self.max_pulse = max_pulse  # ms for 180°
        self.freq = freq

        GPIO.setmode(GPIO.BCM)
        GPIO.setup(pin, GPIO.OUT)
        self.pwm = GPIO.PWM(pin, freq)
        self.pwm.start(0)

    def angle_to_duty(self, angle):
        """Convert angle (0-180) to duty cycle (%)."""
        # Pulse width in ms
        pulse = self.min_pulse + (angle / 180) * (self.max_pulse - self.min_pulse)
        # Convert to duty cycle (period = 20ms for 50Hz)
        duty = (pulse / 20) * 100
        return duty

    def set_angle(self, angle):
        """Set servo to specific angle (0-180)."""
        angle = max(0, min(180, angle))
        duty = self.angle_to_duty(angle)
        self.pwm.ChangeDutyCycle(duty)

    def detach(self):
        """Stop sending pulses (servo goes limp)."""
        self.pwm.ChangeDutyCycle(0)

    def cleanup(self):
        self.pwm.stop()
        GPIO.cleanup(self.pin)


# Method 2: Using gpiozero (easier)
from gpiozero import Servo

servo = Servo(17)  # GPIO pin 17

servo.min()    # -1 position (0°)
servo.mid()    # 0 position (90°)
servo.max()    # 1 position (180°)
servo.value = 0.5  # Specific position (-1 to 1)


# Method 3: Using pigpio (most precise)
import pigpio

pi = pigpio.pi()

def set_servo_angle(pin, angle):
    """Set servo angle using pigpio (hardware PWM)."""
    # Convert angle to pulse width (500-2500 microseconds)
    pulse_width = 500 + (angle / 180) * 2000
    pi.set_servo_pulsewidth(pin, pulse_width)

set_servo_angle(17, 90)  # Set to 90 degrees
```

### Stepper Motors

Precise positioning through discrete steps.

```
Stepper Motor Operation:

Full Step Sequence (4-step):
┌────┬────┬────┬────┬────┬────┬────┬────┐
│Step│ A+ │ A- │ B+ │ B- │Step│ A+ │ A- │
├────┼────┼────┼────┼────┼────┼────┼────┤
│  1 │ ON │    │ ON │    │  5 │ ON │    │
│  2 │    │ ON │ ON │    │  6 │    │ ON │
│  3 │    │ ON │    │ ON │  7 │    │ ON │
│  4 │ ON │    │    │ ON │  8 │ ON │    │
└────┴────┴────┴────┴────┴────┴────┴────┘

Half Step (8-step): Better resolution, less torque
Microstepping: 16, 32, 64 steps per full step
```

```python
# Stepper Motor Control

class StepperMotor:
    """Control stepper via A4988/DRV8825 driver."""

    def __init__(self, step_pin, dir_pin, enable_pin=None,
                 steps_per_rev=200, microstepping=1):
        self.step_pin = step_pin
        self.dir_pin = dir_pin
        self.enable_pin = enable_pin
        self.steps_per_rev = steps_per_rev * microstepping
        self.current_position = 0

        GPIO.setmode(GPIO.BCM)
        GPIO.setup(step_pin, GPIO.OUT)
        GPIO.setup(dir_pin, GPIO.OUT)
        if enable_pin:
            GPIO.setup(enable_pin, GPIO.OUT)
            GPIO.output(enable_pin, GPIO.LOW)  # Enable driver

    def step(self, steps, direction='cw', delay=0.001):
        """
        Move specified number of steps.

        Args:
            steps: Number of steps to move
            direction: 'cw' or 'ccw'
            delay: Delay between steps (controls speed)
        """
        # Set direction
        GPIO.output(self.dir_pin, GPIO.HIGH if direction == 'cw' else GPIO.LOW)

        for _ in range(steps):
            GPIO.output(self.step_pin, GPIO.HIGH)
            time.sleep(delay)
            GPIO.output(self.step_pin, GPIO.LOW)
            time.sleep(delay)

        # Update position
        if direction == 'cw':
            self.current_position += steps
        else:
            self.current_position -= steps

    def move_to_angle(self, angle, delay=0.001):
        """Move to specific angle."""
        target_steps = int((angle / 360) * self.steps_per_rev)
        diff = target_steps - self.current_position

        if diff > 0:
            self.step(diff, 'cw', delay)
        elif diff < 0:
            self.step(abs(diff), 'ccw', delay)

    def home(self, home_sensor_pin):
        """Move to home position using limit switch."""
        GPIO.setup(home_sensor_pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)

        while GPIO.input(home_sensor_pin) == GPIO.HIGH:
            self.step(1, 'ccw', 0.002)

        self.current_position = 0

    def disable(self):
        """Disable motor driver (releases holding torque)."""
        if self.enable_pin:
            GPIO.output(self.enable_pin, GPIO.HIGH)


# Usage
stepper = StepperMotor(step_pin=20, dir_pin=21, steps_per_rev=200, microstepping=16)

# One full revolution
stepper.step(3200, 'cw', 0.0005)  # 200 * 16 microstepping

# Move to specific angle
stepper.move_to_angle(90)
```

## Motor Selection Guide

```
┌─────────────────────────────────────────────────────────────────┐
│                    Motor Selection Guide                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Need continuous rotation at high speed?                        │
│      └── YES ──► DC Motor (with encoder for position)          │
│                                                                 │
│  Need precise positioning (< 1° accuracy)?                      │
│      └── YES ──► Stepper Motor (or Servo with encoder)         │
│                                                                 │
│  Need position control within limited range?                    │
│      └── YES ──► Servo Motor (0-180° or 0-270°)                │
│                                                                 │
│  Need holding torque when stopped?                              │
│      └── YES ──► Stepper Motor (always "locked")               │
│                                                                 │
│  Need simplest implementation?                                  │
│      └── YES ──► Servo Motor (built-in feedback)               │
│                                                                 │
│  Need highest torque-to-weight ratio?                           │
│      └── YES ──► Brushless DC Motor (BLDC)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

| Application | Motor Type | Why |
|-------------|------------|-----|
| Robot wheels | DC with encoder | Speed + position feedback |
| Robotic arm joints | Servo or stepper | Precise positioning |
| Gripper | Servo | Simple angle control |
| Pan-tilt camera | Servo | Angular positioning |
| 3D printer axes | Stepper | High precision, open-loop |
| Drone propellers | BLDC | High speed, efficiency |

## H-Bridge Motor Drivers

H-bridges allow bidirectional DC motor control.

```
H-Bridge Circuit:

     VCC            VCC
      │              │
   ┌──┴──┐        ┌──┴──┐
   │ S1  │        │ S2  │
   └──┬──┘        └──┬──┘
      │    ┌───┐    │
      └────┤ M ├────┘
           └───┘
      ┌────────────┐
   ┌──┴──┐        ┌──┴──┐
   │ S3  │        │ S4  │
   └──┬──┘        └──┬──┘
      │              │
     GND            GND

Truth Table:
S1  S2  S3  S4  │  Result
─────────────────┼──────────
ON  OFF OFF ON  │  Forward
OFF ON  ON  OFF │  Backward
OFF OFF OFF OFF │  Coast (free spin)
ON  OFF ON  OFF │  Brake (short circuit)
ON  ON  X   X   │  DANGER! Short circuit
```

### Common Motor Driver ICs

```python
# L298N Dual H-Bridge Example
class L298NDriver:
    """Control two DC motors with L298N."""

    def __init__(self, motor1_pins, motor2_pins):
        """
        Args:
            motor1_pins: (in1, in2, ena) for motor 1
            motor2_pins: (in3, in4, enb) for motor 2
        """
        self.motors = [
            DCMotor(*motor1_pins),
            DCMotor(*motor2_pins)
        ]

    def set_speeds(self, speed1, speed2):
        """Set speeds for both motors (-100 to 100)."""
        for i, speed in enumerate([speed1, speed2]):
            if speed > 0:
                self.motors[i].forward(abs(speed))
            elif speed < 0:
                self.motors[i].backward(abs(speed))
            else:
                self.motors[i].stop()

    def differential_drive(self, linear, angular):
        """
        Convert linear/angular velocity to wheel speeds.

        Args:
            linear: Forward speed (-100 to 100)
            angular: Turn rate (-100 to 100, positive = right)
        """
        left = linear + angular
        right = linear - angular

        # Normalize to -100..100
        max_val = max(abs(left), abs(right), 100)
        left = (left / max_val) * 100
        right = (right / max_val) * 100

        self.set_speeds(left, right)


# TB6612FNG - More efficient than L298N
# DRV8833 - Compact dual driver
# BTS7960 - High current (43A)
```

## PID Control for Motors

Closed-loop control for precise speed/position.

```python
class PIDController:
    """PID controller for motor control."""

    def __init__(self, kp, ki, kd, output_limits=(-100, 100)):
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.output_min, self.output_max = output_limits

        self.integral = 0
        self.prev_error = 0
        self.prev_time = None

    def compute(self, setpoint, measurement):
        """Compute PID output."""
        current_time = time.time()

        if self.prev_time is None:
            self.prev_time = current_time
            return 0

        dt = current_time - self.prev_time
        if dt <= 0:
            return 0

        # Error
        error = setpoint - measurement

        # Proportional
        p_term = self.kp * error

        # Integral (with anti-windup)
        self.integral += error * dt
        self.integral = max(min(self.integral, 50), -50)  # Clamp
        i_term = self.ki * self.integral

        # Derivative
        derivative = (error - self.prev_error) / dt
        d_term = self.kd * derivative

        # Output
        output = p_term + i_term + d_term
        output = max(min(output, self.output_max), self.output_min)

        # Update state
        self.prev_error = error
        self.prev_time = current_time

        return output

    def reset(self):
        """Reset controller state."""
        self.integral = 0
        self.prev_error = 0
        self.prev_time = None


# Speed control example
class MotorSpeedController:
    """DC motor with encoder feedback and PID control."""

    def __init__(self, motor, encoder, target_rpm):
        self.motor = motor
        self.encoder = encoder
        self.pid = PIDController(kp=0.5, ki=0.1, kd=0.05)
        self.target_rpm = target_rpm

    def update(self):
        """Update motor speed based on PID."""
        current_rpm = self.encoder.get_rpm()
        output = self.pid.compute(self.target_rpm, current_rpm)

        if output >= 0:
            self.motor.forward(output)
        else:
            self.motor.backward(abs(output))

        return current_rpm
```

---

## Knowledge Check

<details>
<summary>**Question 1**: What's the main difference between a servo and a stepper motor?</summary>

**Servo Motor:**
- Has built-in position feedback (potentiometer or encoder)
- Closed-loop control - knows its position
- Typically limited rotation (180° or 270°)
- Easy to use - just send desired position
- May drift if overloaded

**Stepper Motor:**
- Open-loop - moves in discrete steps
- No built-in feedback (unless encoder added)
- Unlimited rotation
- Precise number of steps = precise angle
- Holds position under load (holding torque)
- Can lose steps if overloaded
</details>

<details>
<summary>**Question 2**: Why do servo motors use PWM signals with a specific pulse width range?</summary>

Servo motors use PWM because:
1. **Standard interface** - All servos use same protocol (20ms period)
2. **Analog control** - Pulse width maps to position (0.5-2.5ms → 0-180°)
3. **Simple hardware** - Only needs one signal wire
4. **Built-in decoder** - Servo's internal circuit interprets pulse width

The pulse width range (typically 0.5-2.5ms) was standardized by early RC hobby servos. The internal control circuit compares this to the potentiometer position and drives the motor accordingly.
</details>

<details>
<summary>**Question 3**: When would you use microstepping with a stepper motor?</summary>

Use microstepping when you need:
1. **Smoother motion** - Reduces vibration and noise
2. **Higher resolution** - 16x microstepping = 16x more positions
3. **Better low-speed performance** - Full steps can be jerky

Trade-offs:
- Lower torque per microstep
- More complex driver
- Accuracy depends on motor quality

Common microstep settings:
- Full step: Maximum torque, coarse motion
- 1/2 step: Basic smoothing
- 1/8 step: Good balance
- 1/16 or 1/32: Very smooth, precision applications
</details>

---

## Hands-On Exercise

### Exercise 3.1: Servo Sweep with Speed Control

```python
# servo_sweep.py
"""
TODO: Implement a servo sweep with controllable speed.

Requirements:
1. Sweep servo from 0 to 180 degrees and back
2. Control sweep speed via parameter
3. Add acceleration/deceleration at endpoints
4. Display current angle in real-time
"""

import time
import math

class SmoothServo:
    """Servo with smooth motion control."""

    def __init__(self, pin):
        # TODO: Initialize servo
        self.current_angle = 0
        pass

    def move_to(self, target_angle, speed_deg_per_sec=90):
        """
        Move to target angle at specified speed.

        Args:
            target_angle: Target position (0-180)
            speed_deg_per_sec: Movement speed
        """
        # TODO: Implement smooth movement
        pass

    def sweep(self, min_angle=0, max_angle=180, speed=90, cycles=1):
        """
        Sweep between min and max angles.

        Args:
            min_angle: Minimum angle
            max_angle: Maximum angle
            speed: Degrees per second
            cycles: Number of sweep cycles
        """
        # TODO: Implement sweep with smooth transitions
        pass


# Test your implementation
if __name__ == "__main__":
    servo = SmoothServo(pin=17)

    # Slow sweep
    servo.sweep(0, 180, speed=30, cycles=2)

    # Fast sweep
    servo.sweep(0, 180, speed=120, cycles=2)

    # Move to specific positions
    servo.move_to(90, speed=45)
    servo.move_to(0, speed=45)
```

---

## Summary

In this lesson, we learned:

- **DC motors**: Simple, fast, need external control for position
- **Servo motors**: Built-in position feedback, limited range
- **Stepper motors**: Precise steps, open-loop, unlimited rotation
- **Motor drivers**: H-bridges for DC motors, drivers for steppers
- **PWM control**: Speed control for DC, position for servos
- **PID control**: Closed-loop control for precise speed/position

## Next Steps

In the next lesson, we'll learn about **Kinematics** - the mathematics of robot motion.

---

## Additional Resources

- [RobotShop Motor Guide](https://www.robotshop.com/community/tutorials/show/robot-motor-selection-guide)
- [Servo Motor Tutorial - SparkFun](https://learn.sparkfun.com/tutorials/hobby-servo-tutorial)
- [Stepper Motor Basics - All About Circuits](https://www.allaboutcircuits.com/textbook/alternating-current/chpt-13/stepper-motors/)
