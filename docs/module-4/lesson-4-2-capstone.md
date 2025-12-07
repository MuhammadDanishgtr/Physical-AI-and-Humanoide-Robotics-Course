---
sidebar_position: 2
title: "4.2 Capstone Project"
description: Apply your skills to build a complete robotic system from concept to demonstration
---

# Capstone Project

Congratulations on reaching the capstone! In this project, you'll design, build, and demonstrate a complete robotic system that showcases everything you've learned.

## Project Overview

Choose one of three project tracks based on your interests and available hardware:

### Track A: Autonomous Navigator

Build a mobile robot that can navigate autonomously in an indoor environment.

**Requirements:**
- Map a room using distance sensors
- Plan and execute paths to goal locations
- Avoid obstacles (static and dynamic)
- Return to a home/charging position

### Track B: Object Manipulator

Build a robot arm system that can identify, grasp, and sort objects.

**Requirements:**
- Detect objects using computer vision
- Calculate grasp positions using inverse kinematics
- Pick and place objects to sorted locations
- Handle different object shapes/sizes

### Track C: Line-Following Competitor

Build a fast, accurate line-following robot optimized for a track.

**Requirements:**
- Follow complex line patterns (curves, intersections)
- Optimize for speed while maintaining accuracy
- Handle line interruptions gracefully
- Implement adjustable speed modes

## Project Phases

### Phase 1: Planning and Design (Week 7, Part 1)

#### Deliverables:
1. **System Architecture Document**
   - Block diagram of all components
   - Data flow between sensors, processing, and actuators
   - Software module organization

2. **Bill of Materials**
   - All hardware components with sources
   - Estimated costs
   - Backup alternatives

3. **Risk Assessment**
   - Potential failure points
   - Mitigation strategies
   - Fallback plans

```markdown
## Example System Architecture (Track A)

### Hardware
- Raspberry Pi 4 (main controller)
- Arduino Nano (real-time motor control)
- 2x DC motors with encoders
- 3x HC-SR04 ultrasonic sensors
- 1x MPU-6050 IMU
- L298N motor driver
- 7.4V LiPo battery

### Software Modules
1. Sensor Manager - Read and filter all sensors
2. Localization - Track robot position
3. Mapping - Build occupancy grid
4. Path Planner - A* pathfinding
5. Motion Controller - Follow planned paths
6. Behavior Manager - State machine for high-level control

### Data Flow
Sensors → Sensor Manager → Localization/Mapping → Path Planner → Motion Controller → Motors
```

### Phase 2: Implementation (Week 7, Part 2)

Build your system incrementally:

#### Day 1-2: Hardware Assembly
- Assemble mechanical components
- Wire all electronics
- Test power distribution
- Verify all connections

#### Day 3-4: Low-Level Software
- Implement sensor reading
- Test motor control
- Calibrate sensors
- Verify encoder readings

#### Day 5-6: Core Algorithms
- Implement main control loop
- Add navigation/manipulation/following algorithms
- Test in controlled conditions
- Debug and refine

#### Day 7: Integration
- Combine all modules
- Implement state machine
- Add safety features
- Full system testing

### Phase 3: Testing and Optimization (Week 8, Part 1)

#### Testing Checklist:

```python
# test_robot.py
"""
Capstone Project Test Suite
"""

class TestSuite:
    def __init__(self, robot):
        self.robot = robot
        self.results = []

    def test_sensors(self):
        """Test all sensors are reading valid data."""
        print("Testing sensors...")
        tests = [
            ("Distance sensors", self._test_distance_sensors),
            ("IMU", self._test_imu),
            ("Encoders", self._test_encoders),
        ]
        for name, test_fn in tests:
            try:
                result = test_fn()
                self.results.append((name, "PASS" if result else "FAIL"))
            except Exception as e:
                self.results.append((name, f"ERROR: {e}"))

    def test_motors(self):
        """Test motor control in all directions."""
        print("Testing motors...")
        # Test forward, backward, turn left, turn right
        # Check encoder feedback matches commands
        pass

    def test_safety_stop(self):
        """Test emergency stop functionality."""
        print("Testing safety stop...")
        # Verify robot stops immediately on command
        # Verify obstacle triggers stop
        pass

    def test_navigation(self):
        """Test navigation to waypoints."""
        print("Testing navigation...")
        waypoints = [(50, 0), (50, 50), (0, 50), (0, 0)]
        for wp in waypoints:
            # Command robot to waypoint
            # Verify arrival within tolerance
            pass

    def run_all(self):
        """Run all tests and report results."""
        self.test_sensors()
        self.test_motors()
        self.test_safety_stop()
        self.test_navigation()

        print("\n=== Test Results ===")
        for name, result in self.results:
            status = "✓" if result == "PASS" else "✗"
            print(f"{status} {name}: {result}")
```

### Phase 4: Documentation and Demo (Week 8, Part 2)

#### Documentation Requirements:

1. **README** - Project overview, setup instructions
2. **User Manual** - How to operate the robot
3. **Technical Report** - Design decisions, challenges, solutions
4. **Demo Video** - 2-3 minute video showing capabilities

#### Demo Day Presentation:

```
Demo Structure (5-7 minutes):

1. Introduction (30 sec)
   - Project name and goal
   - Team member(s)

2. System Overview (1 min)
   - Show hardware
   - Explain key components

3. Live Demonstration (3-4 min)
   - Show robot performing main task
   - Highlight key features
   - Demonstrate edge cases/recovery

4. Technical Highlights (1 min)
   - Most interesting algorithm/solution
   - Biggest challenge overcome

5. Q&A (1-2 min)
```

## Evaluation Criteria

| Category | Weight | Criteria |
|----------|--------|----------|
| **Functionality** | 30% | Does it work? Reliably? |
| **Technical Depth** | 25% | Sophistication of algorithms/implementation |
| **Integration** | 20% | How well do components work together? |
| **Documentation** | 15% | Clear, complete, professional? |
| **Presentation** | 10% | Demo quality, communication |

### Grading Rubric:

**A (90-100)**: Fully functional, sophisticated implementation, handles edge cases, excellent documentation

**B (80-89)**: Functional with minor issues, good technical depth, adequate documentation

**C (70-79)**: Basic functionality, limited technical depth, minimal documentation

**D (60-69)**: Partially functional, significant issues, poor documentation

**F (below 60)**: Non-functional or incomplete

## Resources and Support

### Starter Code

```python
# capstone_base.py
"""
Capstone project base class - customize for your project.
"""

from abc import abstractmethod
import time

class CapstoneRobot:
    """Base class for capstone projects."""

    def __init__(self, project_name: str):
        self.name = project_name
        self.running = False
        self.mode = "manual"
        self._setup_hardware()
        self._setup_logging()

    @abstractmethod
    def _setup_hardware(self):
        """Initialize all hardware components."""
        pass

    def _setup_logging(self):
        """Configure logging for debugging."""
        import logging
        self.logger = logging.getLogger(self.name)
        self.logger.setLevel(logging.INFO)

    @abstractmethod
    def sense(self) -> dict:
        """Read all sensors and return as dictionary."""
        pass

    @abstractmethod
    def plan(self, sensor_data: dict) -> dict:
        """Process sensor data and plan next action."""
        pass

    @abstractmethod
    def act(self, commands: dict):
        """Execute planned commands."""
        pass

    def run_autonomous(self):
        """Main autonomous control loop."""
        self.running = True
        self.mode = "autonomous"
        self.logger.info("Starting autonomous mode")

        try:
            while self.running:
                loop_start = time.time()

                data = self.sense()
                commands = self.plan(data)
                self.act(commands)

                # 20Hz control loop
                elapsed = time.time() - loop_start
                if elapsed < 0.05:
                    time.sleep(0.05 - elapsed)

        except KeyboardInterrupt:
            self.logger.info("Interrupted by user")
        finally:
            self.stop()

    def stop(self):
        """Emergency stop."""
        self.running = False
        self.mode = "stopped"
        self.act({'motors': 'stop'})
        self.logger.info("Robot stopped")

    def run_tests(self):
        """Run self-diagnostic tests."""
        print(f"=== {self.name} Self-Test ===")
        # Override in subclass to add specific tests
```

### Getting Help

- **Office Hours**: Weekly Q&A sessions
- **Discord**: Real-time help from TAs and peers
- **Documentation**: Course resources and external links
- **Peer Review**: Share progress with classmates

## Timeline Summary

| Week | Day | Milestone |
|------|-----|-----------|
| 7 | 1-2 | Planning complete, BOM finalized |
| 7 | 3-4 | Hardware assembled, basic software |
| 7 | 5-7 | Core algorithms implemented |
| 8 | 1-3 | Testing and optimization |
| 8 | 4-5 | Documentation complete |
| 8 | 6-7 | Demo day! |

---

## Knowledge Check

<details>
<summary>**Question 1**: What should you do if you're behind schedule on the capstone?</summary>

1. **Prioritize core functionality** - Get basics working before adding features
2. **Simplify scope** - Cut nice-to-have features, focus on requirements
3. **Ask for help early** - Don't wait until the last day
4. **Use existing libraries** - Don't reinvent the wheel
5. **Document what you have** - Partial credit for documented attempts
</details>

<details>
<summary>**Question 2**: How should you approach debugging an integrated system?</summary>

1. **Isolate components** - Test each module independently
2. **Add logging** - Print statements at key points
3. **Check data flow** - Verify sensor data reaches algorithms
4. **Simplify inputs** - Use known/controlled test cases
5. **Binary search** - Narrow down where the problem occurs
6. **Rubber duck debugging** - Explain the problem out loud
</details>

---

## Summary

The capstone project is your opportunity to:

- **Apply** everything learned in the course
- **Integrate** sensors, actuators, and algorithms
- **Solve** real engineering problems
- **Document** professional-quality work
- **Present** your accomplishments

Good luck, and have fun building your robot!

## Next Steps

After the capstone, continue to the final lesson on **Next Steps and Advanced Topics** to learn where to go from here.
