---
sidebar_position: 2
title: "2.2 Data Acquisition & Processing"
description: Reading sensor data reliably, filtering noise, and fusing multiple sensor inputs
---

# Data Acquisition & Processing

Raw sensor data is rarely usable directly. In this lesson, we'll learn how to read sensors reliably, filter out noise, and combine multiple sensors for better results.

## Learning Objectives

By the end of this lesson, you will be able to:

- Implement reliable sensor reading techniques
- Apply common filtering algorithms to reduce noise
- Understand and implement sensor calibration
- Fuse data from multiple sensors
- Design robust data acquisition systems

## The Reality of Sensor Data

Real sensor data is noisy, inconsistent, and sometimes wrong.

```
Ideal vs Real Sensor Data:

Ideal (what we want):        Real (what we get):
    │                           │
100 ┤────────────────       100 ┤  ∙ ∙   ∙ ∙ ∙    ∙
    │                           │ ∙   ∙ ∙     ∙ ∙∙
 50 ┤                        50 ┤
    │                           │
  0 ┼────────────────         0 ┼────────────────
    └───────────────►           └───────────────►
           Time                        Time

Problems:
• Random noise (electrical, thermal)
• Spikes/outliers (interference)
• Drift (temperature, age)
• Quantization (ADC resolution)
• Missing readings (communication errors)
```

## Reliable Sensor Reading

### Basic Reading Pattern

```python
import time
from typing import Optional, List
from dataclasses import dataclass
from datetime import datetime

@dataclass
class SensorReading:
    """Structured sensor reading with metadata."""
    value: float
    timestamp: datetime
    is_valid: bool
    quality: float  # 0-1 confidence score

class SensorReader:
    """Robust sensor reading with error handling."""

    def __init__(self, sensor, valid_range: tuple, timeout: float = 1.0):
        self.sensor = sensor
        self.min_val, self.max_val = valid_range
        self.timeout = timeout
        self.last_valid_reading: Optional[SensorReading] = None
        self.consecutive_failures = 0

    def read(self) -> SensorReading:
        """Read sensor with validation and error handling."""
        try:
            # Attempt to read sensor
            raw_value = self._read_with_timeout()

            # Validate range
            if not self.min_val <= raw_value <= self.max_val:
                return self._handle_invalid("Out of range")

            # Create valid reading
            reading = SensorReading(
                value=raw_value,
                timestamp=datetime.now(),
                is_valid=True,
                quality=self._calculate_quality(raw_value)
            )
            self.last_valid_reading = reading
            self.consecutive_failures = 0
            return reading

        except TimeoutError:
            return self._handle_invalid("Timeout")
        except Exception as e:
            return self._handle_invalid(f"Error: {e}")

    def _read_with_timeout(self) -> float:
        """Read sensor with timeout protection."""
        start = time.time()
        while time.time() - start < self.timeout:
            try:
                return self.sensor.read()
            except:
                time.sleep(0.01)
        raise TimeoutError("Sensor read timeout")

    def _handle_invalid(self, reason: str) -> SensorReading:
        """Handle invalid reading gracefully."""
        self.consecutive_failures += 1
        quality = max(0, 1 - self.consecutive_failures * 0.2)

        # Return last valid if available
        if self.last_valid_reading:
            return SensorReading(
                value=self.last_valid_reading.value,
                timestamp=datetime.now(),
                is_valid=False,
                quality=quality
            )

        # No valid reading available
        return SensorReading(
            value=float('nan'),
            timestamp=datetime.now(),
            is_valid=False,
            quality=0
        )

    def _calculate_quality(self, value: float) -> float:
        """Calculate reading quality based on various factors."""
        # Example: Lower quality near range limits
        range_size = self.max_val - self.min_val
        distance_from_center = abs(value - (self.min_val + range_size/2))
        return max(0.5, 1 - (distance_from_center / range_size))
```

### Multiple Sample Averaging

```python
def read_averaged(sensor, num_samples: int = 5, delay: float = 0.01) -> float:
    """Read multiple samples and return average."""
    samples = []
    for _ in range(num_samples):
        try:
            samples.append(sensor.read())
        except:
            pass
        time.sleep(delay)

    if not samples:
        raise RuntimeError("No valid samples")

    return sum(samples) / len(samples)


def read_median(sensor, num_samples: int = 5, delay: float = 0.01) -> float:
    """Read multiple samples and return median (robust to outliers)."""
    samples = []
    for _ in range(num_samples):
        try:
            samples.append(sensor.read())
        except:
            pass
        time.sleep(delay)

    if not samples:
        raise RuntimeError("No valid samples")

    samples.sort()
    mid = len(samples) // 2
    if len(samples) % 2 == 0:
        return (samples[mid-1] + samples[mid]) / 2
    return samples[mid]
```

## Filtering Techniques

### Moving Average Filter

The simplest noise reduction technique - average recent readings.

```python
class MovingAverageFilter:
    """Simple moving average filter."""

    def __init__(self, window_size: int = 5):
        self.window_size = window_size
        self.values: List[float] = []

    def update(self, value: float) -> float:
        """Add new value and return filtered result."""
        self.values.append(value)

        # Keep only window_size values
        if len(self.values) > self.window_size:
            self.values.pop(0)

        return sum(self.values) / len(self.values)

    def reset(self):
        """Clear filter state."""
        self.values.clear()


# Usage example
filter = MovingAverageFilter(window_size=10)

# Simulate noisy readings
import random
true_value = 100
noisy_readings = [true_value + random.gauss(0, 5) for _ in range(50)]

filtered = [filter.update(r) for r in noisy_readings]
print(f"Raw std dev: {np.std(noisy_readings):.2f}")
print(f"Filtered std dev: {np.std(filtered[10:]):.2f}")  # After initial fill
```

### Exponential Moving Average (EMA)

Gives more weight to recent readings - faster response than simple average.

```python
class ExponentialMovingAverage:
    """Exponential moving average filter."""

    def __init__(self, alpha: float = 0.3):
        """
        Args:
            alpha: Smoothing factor (0-1).
                   Higher = faster response, less smoothing
                   Lower = slower response, more smoothing
        """
        self.alpha = alpha
        self.value: Optional[float] = None

    def update(self, measurement: float) -> float:
        """Update filter with new measurement."""
        if self.value is None:
            self.value = measurement
        else:
            self.value = self.alpha * measurement + (1 - self.alpha) * self.value
        return self.value

    def reset(self):
        """Reset filter state."""
        self.value = None


# Comparison of different alpha values
alphas = [0.1, 0.3, 0.5, 0.9]
filters = {a: ExponentialMovingAverage(a) for a in alphas}

# Step response test
step_input = [0]*20 + [100]*30

results = {a: [] for a in alphas}
for val in step_input:
    for a in alphas:
        results[a].append(filters[a].update(val))

# alpha=0.1: Slow, smooth
# alpha=0.9: Fast, responsive
```

### Low-Pass Filter

Removes high-frequency noise while preserving the underlying signal.

```python
class LowPassFilter:
    """Simple first-order low-pass filter."""

    def __init__(self, cutoff_freq: float, sample_rate: float):
        """
        Args:
            cutoff_freq: Cutoff frequency in Hz
            sample_rate: Sampling rate in Hz
        """
        dt = 1.0 / sample_rate
        rc = 1.0 / (2 * np.pi * cutoff_freq)
        self.alpha = dt / (rc + dt)
        self.value: Optional[float] = None

    def update(self, measurement: float) -> float:
        if self.value is None:
            self.value = measurement
        else:
            self.value += self.alpha * (measurement - self.value)
        return self.value


# Usage: Filter out noise above 5Hz from 100Hz sampled data
lpf = LowPassFilter(cutoff_freq=5.0, sample_rate=100.0)
```

### Kalman Filter (1D)

The gold standard for sensor filtering - optimal estimation with prediction.

```python
class KalmanFilter1D:
    """Simple 1D Kalman filter for sensor smoothing."""

    def __init__(self, process_variance: float, measurement_variance: float,
                 initial_estimate: float = 0, initial_error: float = 1):
        """
        Args:
            process_variance: How much we expect the value to change (Q)
            measurement_variance: How noisy the sensor is (R)
            initial_estimate: Starting estimate
            initial_error: Initial uncertainty
        """
        self.Q = process_variance      # Process noise
        self.R = measurement_variance  # Measurement noise
        self.x = initial_estimate      # State estimate
        self.P = initial_error         # Error estimate

    def update(self, measurement: float) -> float:
        """Update filter with new measurement and return estimate."""
        # Prediction step
        # (In 1D with constant model, prediction = previous estimate)
        self.P = self.P + self.Q

        # Update step
        K = self.P / (self.P + self.R)  # Kalman gain
        self.x = self.x + K * (measurement - self.x)
        self.P = (1 - K) * self.P

        return self.x

    def get_estimate(self) -> tuple:
        """Get current estimate and uncertainty."""
        return self.x, self.P


# Example: Noisy distance sensor
# Sensor noise: ~3cm standard deviation
# Object might move: ~1cm between readings
kf = KalmanFilter1D(
    process_variance=1.0,      # Expected change variance
    measurement_variance=9.0,  # Sensor variance (3cm std dev squared)
    initial_estimate=100
)

# Simulate stationary object with noisy sensor
true_distance = 100
measurements = [true_distance + random.gauss(0, 3) for _ in range(50)]
estimates = [kf.update(m) for m in measurements]

print(f"Measurement noise std: {np.std(measurements):.2f} cm")
print(f"Estimate noise std: {np.std(estimates[10:]):.2f} cm")
```

### Outlier Rejection

Remove obviously wrong readings before filtering.

```python
class OutlierRejector:
    """Reject outliers based on deviation from recent values."""

    def __init__(self, window_size: int = 10, threshold_sigma: float = 3.0):
        self.window_size = window_size
        self.threshold_sigma = threshold_sigma
        self.values: List[float] = []

    def is_outlier(self, value: float) -> bool:
        """Check if value is an outlier."""
        if len(self.values) < 3:
            return False

        mean = np.mean(self.values)
        std = np.std(self.values)

        if std == 0:
            return value != mean

        z_score = abs(value - mean) / std
        return z_score > self.threshold_sigma

    def update(self, value: float) -> Optional[float]:
        """Process value, return None if outlier."""
        if self.is_outlier(value):
            return None

        self.values.append(value)
        if len(self.values) > self.window_size:
            self.values.pop(0)

        return value


# Combined filtering pipeline
class FilterPipeline:
    """Combine outlier rejection with smoothing."""

    def __init__(self):
        self.outlier_rejector = OutlierRejector(threshold_sigma=2.5)
        self.filter = KalmanFilter1D(
            process_variance=0.5,
            measurement_variance=4.0
        )
        self.last_valid = None

    def process(self, measurement: float) -> float:
        """Process measurement through pipeline."""
        # Check for outlier
        valid = self.outlier_rejector.update(measurement)

        if valid is None:
            # Use prediction only (no measurement update)
            return self.last_valid if self.last_valid else measurement

        # Apply Kalman filter
        estimate = self.filter.update(valid)
        self.last_valid = estimate
        return estimate
```

## Sensor Calibration

Calibration corrects systematic errors in sensor readings.

### Linear Calibration

Most sensors can be calibrated with a linear model: `actual = scale * raw + offset`

```python
class LinearCalibration:
    """Linear sensor calibration."""

    def __init__(self):
        self.scale = 1.0
        self.offset = 0.0

    def calibrate(self, raw_values: List[float], actual_values: List[float]):
        """
        Calibrate using known reference values.

        Args:
            raw_values: Sensor readings
            actual_values: True values (measured independently)
        """
        # Linear regression: actual = scale * raw + offset
        raw = np.array(raw_values)
        actual = np.array(actual_values)

        # Least squares fit
        A = np.vstack([raw, np.ones(len(raw))]).T
        self.scale, self.offset = np.linalg.lstsq(A, actual, rcond=None)[0]

        # Calculate fit quality
        predicted = self.apply(raw)
        residuals = actual - predicted
        r_squared = 1 - (np.sum(residuals**2) / np.sum((actual - np.mean(actual))**2))

        print(f"Calibration: actual = {self.scale:.4f} * raw + {self.offset:.4f}")
        print(f"R² = {r_squared:.4f}")

    def apply(self, raw_value):
        """Apply calibration to raw reading."""
        return self.scale * np.array(raw_value) + self.offset

    def save(self, filename: str):
        """Save calibration to file."""
        import json
        with open(filename, 'w') as f:
            json.dump({'scale': self.scale, 'offset': self.offset}, f)

    def load(self, filename: str):
        """Load calibration from file."""
        import json
        with open(filename, 'r') as f:
            data = json.load(f)
            self.scale = data['scale']
            self.offset = data['offset']


# Calibration example
calibrator = LinearCalibration()

# Calibration data (raw sensor vs actual measured distance)
raw_readings = [102, 205, 297, 403, 498]    # Raw ADC values
actual_distances = [10, 20, 30, 40, 50]      # cm (measured with ruler)

calibrator.calibrate(raw_readings, actual_distances)

# Use calibration
new_raw = 350
actual = calibrator.apply(new_raw)
print(f"Raw {new_raw} -> {actual:.1f} cm")
```

### Multi-Point Calibration (Lookup Table)

For non-linear sensors, use a lookup table with interpolation.

```python
class LookupTableCalibration:
    """Non-linear calibration using lookup table."""

    def __init__(self):
        self.raw_values = []
        self.actual_values = []

    def add_point(self, raw: float, actual: float):
        """Add calibration point."""
        self.raw_values.append(raw)
        self.actual_values.append(actual)
        # Keep sorted by raw value
        pairs = sorted(zip(self.raw_values, self.actual_values))
        self.raw_values, self.actual_values = zip(*pairs)
        self.raw_values = list(self.raw_values)
        self.actual_values = list(self.actual_values)

    def apply(self, raw: float) -> float:
        """Apply calibration using linear interpolation."""
        return np.interp(raw, self.raw_values, self.actual_values)


# Sharp IR sensor calibration (non-linear response)
ir_cal = LookupTableCalibration()
ir_cal.add_point(2.7, 10)   # 2.7V -> 10cm
ir_cal.add_point(1.9, 15)   # 1.9V -> 15cm
ir_cal.add_point(1.3, 20)   # 1.3V -> 20cm
ir_cal.add_point(1.0, 30)   # 1.0V -> 30cm
ir_cal.add_point(0.7, 40)   # 0.7V -> 40cm
ir_cal.add_point(0.5, 60)   # 0.5V -> 60cm
ir_cal.add_point(0.4, 80)   # 0.4V -> 80cm

# Convert voltage reading to distance
voltage = 1.5
distance = ir_cal.apply(voltage)
print(f"{voltage}V -> {distance:.1f}cm")
```

## Sensor Fusion

Combining multiple sensors for better results than any single sensor.

### Complementary Filter

Combines sensors with different characteristics (e.g., gyro + accelerometer).

```python
class ComplementaryFilter:
    """
    Combine gyroscope (fast, drifts) and accelerometer (slow, noisy).

    Gyro: Good for fast changes, accumulates drift over time
    Accel: Good for absolute reference, noisy in short term
    """

    def __init__(self, alpha: float = 0.98):
        """
        Args:
            alpha: Weight for gyro data (0.98 = 98% gyro, 2% accel)
        """
        self.alpha = alpha
        self.angle = 0
        self.last_time = None

    def update(self, gyro_rate: float, accel_angle: float) -> float:
        """
        Update filter with new readings.

        Args:
            gyro_rate: Angular velocity from gyroscope (deg/s)
            accel_angle: Absolute angle from accelerometer (deg)
        """
        current_time = time.time()

        if self.last_time is None:
            self.last_time = current_time
            self.angle = accel_angle
            return self.angle

        dt = current_time - self.last_time
        self.last_time = current_time

        # Integrate gyro for angle change
        gyro_angle = self.angle + gyro_rate * dt

        # Complementary filter
        self.angle = self.alpha * gyro_angle + (1 - self.alpha) * accel_angle

        return self.angle


# Usage for roll angle estimation
comp_filter = ComplementaryFilter(alpha=0.98)

def calculate_accel_roll(ax, ay, az):
    """Calculate roll from accelerometer."""
    return np.degrees(np.arctan2(ay, az))

# In sensor loop:
# roll = comp_filter.update(gyro_x, calculate_accel_roll(ax, ay, az))
```

### Weighted Average Fusion

Combine multiple distance sensors.

```python
class WeightedFusion:
    """Fuse multiple sensors using weighted average."""

    def __init__(self, sensor_configs: List[dict]):
        """
        Args:
            sensor_configs: List of {'name': str, 'weight': float, 'valid_range': tuple}
        """
        self.configs = sensor_configs

    def fuse(self, readings: dict) -> Optional[float]:
        """
        Fuse readings from multiple sensors.

        Args:
            readings: Dict of sensor_name -> value
        """
        weighted_sum = 0
        weight_sum = 0

        for config in self.configs:
            name = config['name']
            if name not in readings or readings[name] is None:
                continue

            value = readings[name]
            min_val, max_val = config['valid_range']

            # Only use if in valid range
            if min_val <= value <= max_val:
                weighted_sum += config['weight'] * value
                weight_sum += config['weight']

        if weight_sum == 0:
            return None

        return weighted_sum / weight_sum


# Example: Fuse ultrasonic and IR sensors
fusion = WeightedFusion([
    {'name': 'ultrasonic', 'weight': 1.0, 'valid_range': (2, 400)},
    {'name': 'ir_front', 'weight': 0.8, 'valid_range': (10, 80)},
    {'name': 'ir_side', 'weight': 0.5, 'valid_range': (10, 80)},
])

# Fuse readings
distance = fusion.fuse({
    'ultrasonic': 45.2,
    'ir_front': 44.8,
    'ir_side': 46.1
})
print(f"Fused distance: {distance:.1f} cm")
```

---

## Knowledge Check

<details>
<summary>**Question 1**: Why is median filtering often better than average filtering for sensor data?</summary>

Median filtering is better at handling outliers:
- Average is affected by extreme values (one spike can drastically change the result)
- Median ignores outliers as long as they're not more than half the samples
- Example: Values [10, 11, 10, 100, 11]
  - Average: 28.4 (wrong due to spike)
  - Median: 11 (correct, ignores outlier)

Trade-off: Median requires sorting, which is computationally more expensive.
</details>

<details>
<summary>**Question 2**: What does the alpha parameter in an exponential moving average control?</summary>

Alpha controls the trade-off between responsiveness and smoothing:

- **Higher alpha (e.g., 0.9)**: More weight on new readings
  - Faster response to changes
  - Less noise smoothing
  - Good for tracking fast-changing values

- **Lower alpha (e.g., 0.1)**: More weight on history
  - Slower response to changes
  - More noise smoothing
  - Good for stable measurements

Formula: `filtered = alpha * new_value + (1 - alpha) * previous_filtered`
</details>

<details>
<summary>**Question 3**: When would you use sensor fusion instead of just picking the "best" sensor?</summary>

Use sensor fusion when:
1. **Different sensors have complementary strengths**
   - IMU: Gyro (fast, drifts) + Accelerometer (slow, stable reference)

2. **Redundancy improves reliability**
   - Multiple distance sensors reduce failure risk

3. **Combined information exceeds individual sensors**
   - Camera + LiDAR = depth AND color

4. **Coverage of different conditions**
   - Ultrasonic (glass) + IR (soft surfaces)

Single sensor is OK when:
- One sensor clearly dominates in your application
- Simplicity is more important than accuracy
- Cost/complexity of fusion isn't justified
</details>

---

## Hands-On Exercise

### Exercise 2.2: Building a Filter Pipeline

**Task**: Implement a complete sensor processing pipeline

```python
# starter_code.py
import numpy as np
import matplotlib.pyplot as plt

class YourFilterPipeline:
    """
    TODO: Implement a complete sensor processing pipeline.

    Requirements:
    1. Outlier rejection (>3 sigma from recent mean)
    2. Kalman filtering for smoothing
    3. Calibration support
    """

    def __init__(self):
        # TODO: Initialize your components
        pass

    def calibrate(self, raw_values, actual_values):
        """Calibrate the sensor."""
        # TODO: Implement linear calibration
        pass

    def process(self, raw_reading):
        """Process a raw sensor reading through the full pipeline."""
        # TODO: Implement pipeline
        # 1. Apply calibration
        # 2. Check for outlier
        # 3. Apply Kalman filter
        # 4. Return filtered value
        pass


# Test your implementation
def test_pipeline():
    pipeline = YourFilterPipeline()

    # Calibration data
    raw_cal = [100, 200, 300, 400, 500]
    actual_cal = [10, 20, 30, 40, 50]
    pipeline.calibrate(raw_cal, actual_cal)

    # Generate test data
    np.random.seed(42)
    true_values = np.concatenate([
        np.ones(50) * 250,  # Constant
        np.linspace(250, 350, 30),  # Ramp
        np.ones(50) * 350  # Constant
    ])

    # Add noise and outliers
    noise = np.random.normal(0, 10, len(true_values))
    raw_data = true_values + noise
    # Add outliers
    raw_data[20] = 600
    raw_data[60] = 100
    raw_data[100] = 800

    # Process through pipeline
    filtered = [pipeline.process(r) for r in raw_data]

    # Plot results
    plt.figure(figsize=(12, 6))
    plt.plot(true_values / 10, 'g-', label='True (cm)', linewidth=2)
    plt.plot(raw_data / 10, 'r.', alpha=0.3, label='Raw (cm)')
    plt.plot(filtered, 'b-', label='Filtered (cm)', linewidth=2)
    plt.xlabel('Sample')
    plt.ylabel('Distance (cm)')
    plt.legend()
    plt.title('Sensor Processing Pipeline Test')
    plt.savefig('filter_test.png')
    plt.show()

    # Calculate metrics
    raw_error = np.abs(raw_data/10 - true_values/10)
    filtered_error = np.abs(np.array(filtered) - true_values/10)

    print(f"Raw MAE: {np.mean(raw_error):.2f} cm")
    print(f"Filtered MAE: {np.mean(filtered_error[10:]):.2f} cm")  # Skip initial


if __name__ == "__main__":
    test_pipeline()
```

**Deliverables**:
1. Complete the `YourFilterPipeline` class
2. Plot showing raw vs filtered data
3. Calculate and report Mean Absolute Error improvement

---

## Summary

In this lesson, we learned:

- **Reliable reading**: Error handling, validation, timeout protection
- **Filtering techniques**: Moving average, EMA, low-pass, Kalman
- **Outlier rejection**: Statistical methods to detect bad readings
- **Calibration**: Linear and lookup table approaches
- **Sensor fusion**: Combining multiple sensors for better results

## Next Steps

In the next lesson, we'll explore **Computer Vision Basics** - using cameras as sensors for robotics applications.

---

## Additional Resources

- [Kalman Filter Tutorial - bzarg](https://www.bzarg.com/p/how-a-kalman-filter-works-in-pictures/)
- [Sensor Fusion - Phil's Lab (YouTube)](https://www.youtube.com/watch?v=6M6wSLD-8M8)
- [Digital Filter Design - SciPy Documentation](https://docs.scipy.org/doc/scipy/reference/signal.html)
