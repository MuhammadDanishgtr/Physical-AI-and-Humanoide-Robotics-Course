---
sidebar_position: 1
title: "4.1 System Integration Patterns"
description: Combining sensors, actuators, and algorithms into a working robotic system
---

# System Integration Patterns

Building a complete robotic system requires more than understanding individual components. This lesson covers patterns and best practices for integrating everything into a reliable, maintainable system.

## Learning Objectives

By the end of this lesson, you will be able to:

- Design robot software architecture
- Implement the sensor-process-actuate loop
- Handle concurrent operations safely
- Implement state machines for robot behavior
- Debug and test integrated systems

## Robot Software Architecture

### The Sense-Plan-Act Architecture

The classic robotics paradigm organizes code into three layers.

```
┌─────────────────────────────────────────────────────────────┐
│                    SENSE-PLAN-ACT                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │    SENSE     │───►│    PLAN      │───►│    ACT       │  │
│  │              │    │              │    │              │  │
│  │ • Read sensors│   │ • Make decisions│ │ • Send commands│
│  │ • Filter data │   │ • Update state │  │ • Drive motors │
│  │ • Detect objects│ │ • Plan path   │  │ • Activate tools│
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         ▲                                       │          │
│         └───────────────────────────────────────┘          │
│                    (Feedback Loop)                          │
└─────────────────────────────────────────────────────────────┘
```

```python
import time
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, Any, Optional

@dataclass
class SensorData:
    """Container for all sensor readings."""
    timestamp: float
    distances: Dict[str, float]  # Name -> distance (cm)
    imu: Dict[str, float]  # roll, pitch, yaw
    encoders: Dict[str, int]  # wheel encoder counts
    battery_voltage: float

@dataclass
class RobotState:
    """Current robot state."""
    position: tuple  # (x, y, theta)
    velocity: tuple  # (linear, angular)
    mode: str  # 'idle', 'navigating', 'following', etc.
    target: Optional[tuple] = None

@dataclass
class MotorCommands:
    """Commands to send to motors."""
    left_speed: float  # -100 to 100
    right_speed: float  # -100 to 100
    servo_angles: Dict[str, float] = None


class RobotBase(ABC):
    """Abstract base class for robot control."""

    def __init__(self, update_rate: float = 50):
        self.update_rate = update_rate
        self.period = 1.0 / update_rate
        self.state = RobotState(
            position=(0, 0, 0),
            velocity=(0, 0),
            mode='idle'
        )
        self.running = False

    @abstractmethod
    def sense(self) -> SensorData:
        """Read all sensors and return data."""
        pass

    @abstractmethod
    def plan(self, sensor_data: SensorData) -> MotorCommands:
        """Process sensor data and decide on actions."""
        pass

    @abstractmethod
    def act(self, commands: MotorCommands):
        """Execute motor commands."""
        pass

    def run(self):
        """Main control loop."""
        self.running = True
        last_time = time.time()

        try:
            while self.running:
                loop_start = time.time()

                # Sense-Plan-Act cycle
                sensor_data = self.sense()
                commands = self.plan(sensor_data)
                self.act(commands)

                # Maintain loop timing
                elapsed = time.time() - loop_start
                sleep_time = self.period - elapsed
                if sleep_time > 0:
                    time.sleep(sleep_time)
                else:
                    print(f"Warning: Loop overrun by {-sleep_time*1000:.1f}ms")

        except KeyboardInterrupt:
            print("Stopping...")
        finally:
            self.stop()

    def stop(self):
        """Emergency stop."""
        self.running = False
        self.act(MotorCommands(left_speed=0, right_speed=0))
```

### Behavior-Based Architecture

For more complex behaviors, use a behavior arbitration system.

```python
from abc import ABC, abstractmethod
from typing import List, Tuple

class Behavior(ABC):
    """Base class for robot behaviors."""

    def __init__(self, priority: int = 0):
        self.priority = priority
        self.active = False

    @abstractmethod
    def calculate(self, sensor_data: SensorData, state: RobotState) -> Tuple[bool, MotorCommands]:
        """
        Calculate behavior output.

        Returns:
            (wants_control, commands) - True if behavior wants to take control
        """
        pass


class ObstacleAvoidance(Behavior):
    """Avoid obstacles detected by distance sensors."""

    def __init__(self, threshold: float = 30):
        super().__init__(priority=10)  # High priority
        self.threshold = threshold

    def calculate(self, sensor_data: SensorData, state: RobotState):
        front_dist = sensor_data.distances.get('front', 999)

        if front_dist < self.threshold:
            # Obstacle detected! Take control
            # Turn away from obstacle
            return True, MotorCommands(left_speed=30, right_speed=-30)

        return False, None


class GoToGoal(Behavior):
    """Navigate toward a goal position."""

    def __init__(self):
        super().__init__(priority=5)

    def calculate(self, sensor_data: SensorData, state: RobotState):
        if state.target is None:
            return False, None

        # Calculate direction to goal
        dx = state.target[0] - state.position[0]
        dy = state.target[1] - state.position[1]
        distance = np.sqrt(dx**2 + dy**2)

        if distance < 5:  # Close enough
            return False, None

        # Calculate heading error
        target_heading = np.arctan2(dy, dx)
        heading_error = target_heading - state.position[2]

        # Normalize to [-pi, pi]
        heading_error = np.arctan2(np.sin(heading_error), np.cos(heading_error))

        # Proportional control
        angular = 50 * heading_error
        linear = 30 * min(1, distance / 50)

        # Differential drive
        left = linear - angular
        right = linear + angular

        return True, MotorCommands(left_speed=left, right_speed=right)


class BehaviorArbitrator:
    """Arbitrate between multiple behaviors."""

    def __init__(self):
        self.behaviors: List[Behavior] = []

    def add_behavior(self, behavior: Behavior):
        self.behaviors.append(behavior)
        # Sort by priority (higher priority first)
        self.behaviors.sort(key=lambda b: -b.priority)

    def arbitrate(self, sensor_data: SensorData, state: RobotState) -> MotorCommands:
        """Get commands from highest priority behavior that wants control."""
        for behavior in self.behaviors:
            wants_control, commands = behavior.calculate(sensor_data, state)
            if wants_control:
                behavior.active = True
                return commands
            else:
                behavior.active = False

        # No behavior wants control - stop
        return MotorCommands(left_speed=0, right_speed=0)
```

## State Machines

State machines provide clear control over robot modes and transitions.

```python
from enum import Enum, auto
from typing import Callable, Dict, Tuple

class State(Enum):
    """Robot operational states."""
    IDLE = auto()
    SEARCHING = auto()
    APPROACHING = auto()
    GRASPING = auto()
    RETURNING = auto()
    ERROR = auto()


class Event(Enum):
    """Events that trigger state transitions."""
    START = auto()
    OBJECT_FOUND = auto()
    OBJECT_LOST = auto()
    REACHED_OBJECT = auto()
    GRASP_SUCCESS = auto()
    GRASP_FAILED = auto()
    REACHED_HOME = auto()
    ERROR_DETECTED = auto()
    RESET = auto()


class StateMachine:
    """Finite state machine for robot behavior."""

    def __init__(self):
        self.state = State.IDLE
        self.transitions: Dict[Tuple[State, Event], State] = {}
        self.state_handlers: Dict[State, Callable] = {}
        self.on_enter: Dict[State, Callable] = {}
        self.on_exit: Dict[State, Callable] = {}

        self._setup_transitions()

    def _setup_transitions(self):
        """Define valid state transitions."""
        self.transitions = {
            (State.IDLE, Event.START): State.SEARCHING,
            (State.SEARCHING, Event.OBJECT_FOUND): State.APPROACHING,
            (State.SEARCHING, Event.ERROR_DETECTED): State.ERROR,
            (State.APPROACHING, Event.OBJECT_LOST): State.SEARCHING,
            (State.APPROACHING, Event.REACHED_OBJECT): State.GRASPING,
            (State.GRASPING, Event.GRASP_SUCCESS): State.RETURNING,
            (State.GRASPING, Event.GRASP_FAILED): State.SEARCHING,
            (State.RETURNING, Event.REACHED_HOME): State.IDLE,
            (State.ERROR, Event.RESET): State.IDLE,
        }

    def register_handler(self, state: State, handler: Callable):
        """Register function to call while in state."""
        self.state_handlers[state] = handler

    def register_on_enter(self, state: State, callback: Callable):
        """Register function to call when entering state."""
        self.on_enter[state] = callback

    def register_on_exit(self, state: State, callback: Callable):
        """Register function to call when exiting state."""
        self.on_exit[state] = callback

    def trigger(self, event: Event) -> bool:
        """
        Attempt to trigger a state transition.

        Returns:
            True if transition occurred
        """
        key = (self.state, event)
        if key in self.transitions:
            old_state = self.state
            new_state = self.transitions[key]

            # Call exit handler
            if old_state in self.on_exit:
                self.on_exit[old_state]()

            self.state = new_state
            print(f"Transition: {old_state.name} --{event.name}--> {new_state.name}")

            # Call enter handler
            if new_state in self.on_enter:
                self.on_enter[new_state]()

            return True

        print(f"Invalid transition: {self.state.name} + {event.name}")
        return False

    def update(self, sensor_data: SensorData) -> MotorCommands:
        """Call current state handler and return commands."""
        if self.state in self.state_handlers:
            return self.state_handlers[self.state](sensor_data)
        return MotorCommands(left_speed=0, right_speed=0)


# Usage example
class ObjectFinderRobot(RobotBase):
    """Robot that searches for and retrieves objects."""

    def __init__(self):
        super().__init__()
        self.sm = StateMachine()
        self._setup_state_handlers()

    def _setup_state_handlers(self):
        self.sm.register_handler(State.IDLE, self._handle_idle)
        self.sm.register_handler(State.SEARCHING, self._handle_searching)
        self.sm.register_handler(State.APPROACHING, self._handle_approaching)
        # ... etc

    def _handle_idle(self, sensor_data):
        return MotorCommands(left_speed=0, right_speed=0)

    def _handle_searching(self, sensor_data):
        # Rotate in place looking for object
        # If camera detects object, trigger OBJECT_FOUND
        return MotorCommands(left_speed=20, right_speed=-20)

    def _handle_approaching(self, sensor_data):
        # Move toward detected object
        # If close enough, trigger REACHED_OBJECT
        return MotorCommands(left_speed=30, right_speed=30)

    def plan(self, sensor_data):
        return self.sm.update(sensor_data)
```

## Concurrent Operations

Robots often need to do multiple things simultaneously.

```python
import threading
from queue import Queue
from typing import Optional

class SensorThread(threading.Thread):
    """Background thread for sensor reading."""

    def __init__(self, sensor, rate: float = 100):
        super().__init__(daemon=True)
        self.sensor = sensor
        self.period = 1.0 / rate
        self.data_queue = Queue(maxsize=10)
        self.running = False

    def run(self):
        self.running = True
        while self.running:
            start = time.time()

            try:
                reading = self.sensor.read()
                if self.data_queue.full():
                    self.data_queue.get()  # Discard old data
                self.data_queue.put(reading)
            except Exception as e:
                print(f"Sensor error: {e}")

            elapsed = time.time() - start
            if elapsed < self.period:
                time.sleep(self.period - elapsed)

    def get_latest(self) -> Optional[float]:
        """Get most recent reading, non-blocking."""
        latest = None
        while not self.data_queue.empty():
            latest = self.data_queue.get()
        return latest

    def stop(self):
        self.running = False


class AsyncRobot:
    """Robot with concurrent sensor reading and control."""

    def __init__(self):
        self.sensor_threads = {}
        self.command_lock = threading.Lock()
        self.current_commands = MotorCommands(0, 0)

    def add_sensor(self, name: str, sensor, rate: float = 100):
        """Add a sensor with its own reading thread."""
        thread = SensorThread(sensor, rate)
        self.sensor_threads[name] = thread
        thread.start()

    def get_sensor_data(self) -> Dict[str, Any]:
        """Collect latest data from all sensors."""
        data = {}
        for name, thread in self.sensor_threads.items():
            data[name] = thread.get_latest()
        return data

    def set_commands(self, commands: MotorCommands):
        """Thread-safe command update."""
        with self.command_lock:
            self.current_commands = commands

    def shutdown(self):
        """Stop all threads."""
        for thread in self.sensor_threads.values():
            thread.stop()
```

## Debugging Integrated Systems

### Logging

```python
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.FileHandler(f'robot_{datetime.now():%Y%m%d_%H%M%S}.log'),
        logging.StreamHandler()
    ]
)

class LoggedRobot(RobotBase):
    """Robot with comprehensive logging."""

    def __init__(self):
        super().__init__()
        self.logger = logging.getLogger('Robot')
        self.data_logger = logging.getLogger('RobotData')

    def sense(self):
        data = super().sense()
        self.data_logger.debug(f"Sensors: {data}")
        return data

    def plan(self, sensor_data):
        commands = super().plan(sensor_data)
        self.logger.debug(f"Commands: L={commands.left_speed:.1f} R={commands.right_speed:.1f}")
        return commands

    def act(self, commands):
        if abs(commands.left_speed) > 80 or abs(commands.right_speed) > 80:
            self.logger.warning(f"High speed command: {commands}")
        super().act(commands)
```

### Data Recording for Analysis

```python
import csv

class DataRecorder:
    """Record robot data for offline analysis."""

    def __init__(self, filename: str):
        self.file = open(filename, 'w', newline='')
        self.writer = None
        self.start_time = time.time()

    def record(self, sensor_data: SensorData, commands: MotorCommands):
        """Record a single timestep."""
        row = {
            'time': time.time() - self.start_time,
            'left_speed': commands.left_speed,
            'right_speed': commands.right_speed,
            **{f'dist_{k}': v for k, v in sensor_data.distances.items()},
            **{f'imu_{k}': v for k, v in sensor_data.imu.items()},
        }

        if self.writer is None:
            self.writer = csv.DictWriter(self.file, fieldnames=row.keys())
            self.writer.writeheader()

        self.writer.writerow(row)

    def close(self):
        self.file.close()
```

---

## Knowledge Check

<details>
<summary>**Question 1**: Why use a behavior-based architecture instead of a simple if-else control?</summary>

Behavior-based architecture offers:
1. **Modularity**: Each behavior is independent and reusable
2. **Scalability**: Easy to add new behaviors without changing existing code
3. **Priority handling**: Clear arbitration when behaviors conflict
4. **Robustness**: One failing behavior doesn't crash the system
5. **Testability**: Behaviors can be tested in isolation
</details>

<details>
<summary>**Question 2**: What are the benefits of using a state machine for robot control?</summary>

State machines provide:
1. **Explicit states**: Clear understanding of what robot is doing
2. **Defined transitions**: Only valid state changes are allowed
3. **Debugging**: Easy to log and track state changes
4. **Safety**: Can ensure proper sequencing (e.g., don't grasp before approaching)
5. **Recovery**: Clear path back to safe states on error
</details>

---

## Summary

In this lesson, we learned:

- **Sense-Plan-Act**: Fundamental control loop organization
- **Behavior-based systems**: Modular behavior arbitration
- **State machines**: Managing complex sequences
- **Concurrent operations**: Threading for real-time performance
- **Debugging**: Logging and data recording

## Next Steps

In the next lesson, you'll apply everything you've learned in the **Capstone Project**.
