---
sidebar_position: 2
title: "3.2 Kinematics Fundamentals"
description: Understanding robot motion through forward and inverse kinematics
---

# Kinematics Fundamentals

Kinematics is the study of motion without considering forces. For robotics, it's essential for controlling where our robot's end effector (gripper, tool, etc.) goes.

## Learning Objectives

By the end of this lesson, you will be able to:

- Understand the difference between forward and inverse kinematics
- Apply transformation matrices for robot positioning
- Implement forward kinematics for simple robot arms
- Solve inverse kinematics for 2-DOF systems
- Work with differential drive mobile robot kinematics

## Forward vs Inverse Kinematics

```
Forward Kinematics (FK):
Joint angles → End effector position

Given: θ1 = 30°, θ2 = 45°
Find: Where is the gripper?

    θ1, θ2, θ3... → [x, y, z]


Inverse Kinematics (IK):
End effector position → Joint angles

Given: Gripper needs to be at (x=50, y=30)
Find: What joint angles achieve this?

    [x, y, z] → θ1, θ2, θ3...
```

### Why Both Matter

- **FK**: Easy to compute, used for simulation and visualization
- **IK**: What we usually need - "move the gripper HERE"
- **FK is unique**: One set of angles = one position
- **IK may have multiple solutions or none**

## Coordinate Frames and Transformations

### Homogeneous Transformation Matrices

We represent position and orientation in a single 4x4 matrix.

```
Transformation Matrix T:
┌                           ┐
│  R11  R12  R13  │  Tx    │
│  R21  R22  R23  │  Ty    │  = [Rotation | Translation]
│  R31  R32  R33  │  Tz    │    [   0     |     1      ]
│   0    0    0   │   1    │
└                           ┘

Where:
• R (3x3): Rotation matrix
• T (3x1): Translation vector
```

```python
import numpy as np

def translation_matrix(tx, ty, tz):
    """Create translation matrix."""
    return np.array([
        [1, 0, 0, tx],
        [0, 1, 0, ty],
        [0, 0, 1, tz],
        [0, 0, 0, 1]
    ])

def rotation_z(theta):
    """Rotation around Z axis."""
    c, s = np.cos(theta), np.sin(theta)
    return np.array([
        [c, -s, 0, 0],
        [s,  c, 0, 0],
        [0,  0, 1, 0],
        [0,  0, 0, 1]
    ])

def rotation_x(theta):
    """Rotation around X axis."""
    c, s = np.cos(theta), np.sin(theta)
    return np.array([
        [1, 0,  0, 0],
        [0, c, -s, 0],
        [0, s,  c, 0],
        [0, 0,  0, 1]
    ])

def rotation_y(theta):
    """Rotation around Y axis."""
    c, s = np.cos(theta), np.sin(theta)
    return np.array([
        [ c, 0, s, 0],
        [ 0, 1, 0, 0],
        [-s, 0, c, 0],
        [ 0, 0, 0, 1]
    ])

# Chain transformations by multiplication
# T_total = T1 @ T2 @ T3 (order matters!)
T = rotation_z(np.pi/4) @ translation_matrix(1, 0, 0) @ rotation_z(np.pi/4)
```

## Forward Kinematics: 2-Link Planar Arm

Let's implement FK for a simple 2-joint arm in 2D.

```
2-Link Planar Arm:

         L2
    ●────────────● End Effector (x, y)
   θ2
   ●
   │
   │ L1
   │
   θ1
   ●───── Base (0, 0)

Forward Kinematics:
x = L1·cos(θ1) + L2·cos(θ1 + θ2)
y = L1·sin(θ1) + L2·sin(θ1 + θ2)
```

```python
import numpy as np
import matplotlib.pyplot as plt

class TwoLinkArm:
    """2-DOF planar robot arm."""

    def __init__(self, L1, L2):
        """
        Args:
            L1: Length of first link
            L2: Length of second link
        """
        self.L1 = L1
        self.L2 = L2

    def forward_kinematics(self, theta1, theta2):
        """
        Calculate end effector position from joint angles.

        Args:
            theta1: First joint angle (radians)
            theta2: Second joint angle (radians)

        Returns:
            (x, y) position of end effector
        """
        # Joint 1 position (elbow)
        x1 = self.L1 * np.cos(theta1)
        y1 = self.L1 * np.sin(theta1)

        # End effector position
        x = x1 + self.L2 * np.cos(theta1 + theta2)
        y = y1 + self.L2 * np.sin(theta1 + theta2)

        return np.array([x, y])

    def get_joint_positions(self, theta1, theta2):
        """Get positions of all joints for visualization."""
        base = np.array([0, 0])
        elbow = np.array([
            self.L1 * np.cos(theta1),
            self.L1 * np.sin(theta1)
        ])
        end = self.forward_kinematics(theta1, theta2)
        return [base, elbow, end]

    def plot(self, theta1, theta2, target=None):
        """Visualize the arm configuration."""
        joints = self.get_joint_positions(theta1, theta2)

        plt.figure(figsize=(8, 8))
        plt.axis('equal')

        # Draw links
        x_coords = [j[0] for j in joints]
        y_coords = [j[1] for j in joints]
        plt.plot(x_coords, y_coords, 'b-', linewidth=3, label='Arm')

        # Draw joints
        plt.plot(x_coords, y_coords, 'ko', markersize=10)

        # Draw target if provided
        if target is not None:
            plt.plot(target[0], target[1], 'r*', markersize=15, label='Target')

        # Draw workspace circle
        workspace_radius = self.L1 + self.L2
        theta = np.linspace(0, 2*np.pi, 100)
        plt.plot(workspace_radius * np.cos(theta),
                 workspace_radius * np.sin(theta),
                 'g--', alpha=0.3, label='Workspace')

        plt.grid(True)
        plt.legend()
        plt.title(f'θ1={np.degrees(theta1):.1f}°, θ2={np.degrees(theta2):.1f}°')
        plt.xlabel('X')
        plt.ylabel('Y')
        plt.show()


# Example usage
arm = TwoLinkArm(L1=1.0, L2=0.8)

# Forward kinematics
theta1 = np.radians(45)
theta2 = np.radians(30)
end_pos = arm.forward_kinematics(theta1, theta2)
print(f"End effector at: ({end_pos[0]:.3f}, {end_pos[1]:.3f})")

arm.plot(theta1, theta2)
```

## Inverse Kinematics: 2-Link Planar Arm

Now the harder problem - given a target, find the angles.

```python
class TwoLinkArmIK(TwoLinkArm):
    """2-DOF arm with inverse kinematics."""

    def inverse_kinematics(self, x, y, elbow='up'):
        """
        Calculate joint angles to reach target position.

        Args:
            x, y: Target position
            elbow: 'up' or 'down' for elbow configuration

        Returns:
            (theta1, theta2) or None if unreachable
        """
        # Check if target is reachable
        dist = np.sqrt(x**2 + y**2)
        if dist > self.L1 + self.L2:
            print(f"Target ({x:.2f}, {y:.2f}) is outside workspace")
            return None
        if dist < abs(self.L1 - self.L2):
            print(f"Target ({x:.2f}, {y:.2f}) is inside inner workspace")
            return None

        # Law of cosines for theta2
        cos_theta2 = (x**2 + y**2 - self.L1**2 - self.L2**2) / (2 * self.L1 * self.L2)

        # Clamp to avoid numerical errors
        cos_theta2 = np.clip(cos_theta2, -1, 1)

        if elbow == 'up':
            theta2 = np.arccos(cos_theta2)
        else:
            theta2 = -np.arccos(cos_theta2)

        # Calculate theta1
        k1 = self.L1 + self.L2 * np.cos(theta2)
        k2 = self.L2 * np.sin(theta2)
        theta1 = np.arctan2(y, x) - np.arctan2(k2, k1)

        return theta1, theta2

    def move_to(self, x, y, elbow='up'):
        """Calculate and visualize move to target."""
        result = self.inverse_kinematics(x, y, elbow)
        if result is None:
            return None

        theta1, theta2 = result
        print(f"Moving to ({x:.2f}, {y:.2f})")
        print(f"Joint angles: θ1={np.degrees(theta1):.1f}°, θ2={np.degrees(theta2):.1f}°")

        # Verify with forward kinematics
        actual = self.forward_kinematics(theta1, theta2)
        error = np.linalg.norm(actual - np.array([x, y]))
        print(f"Position error: {error:.6f}")

        self.plot(theta1, theta2, target=(x, y))
        return theta1, theta2


# Example usage
arm = TwoLinkArmIK(L1=1.0, L2=0.8)

# Reach a target
arm.move_to(1.2, 0.8, elbow='up')
arm.move_to(1.2, 0.8, elbow='down')  # Different configuration, same target

# Unreachable target
arm.move_to(3.0, 0.0)  # Too far
```

## Differential Drive Kinematics

For wheeled mobile robots, we need different kinematics.

```
Differential Drive Robot:

     ┌─────────────────┐
     │                 │
  ◄──┤      Robot      ├──►
 ωL  │                 │  ωR
     │        ●────────┤───► x (forward)
     │     (center)    │
     └─────────────────┘
           ▲
           │
           │ L (wheel base)

ωL, ωR: Left and right wheel angular velocities
v = r·(ωR + ωL) / 2       # Linear velocity
ω = r·(ωR - ωL) / L        # Angular velocity
```

```python
import numpy as np

class DifferentialDriveRobot:
    """Differential drive mobile robot kinematics."""

    def __init__(self, wheel_radius, wheel_base):
        """
        Args:
            wheel_radius: Radius of wheels (m)
            wheel_base: Distance between wheels (m)
        """
        self.r = wheel_radius
        self.L = wheel_base

        # Robot state: [x, y, theta]
        self.x = 0
        self.y = 0
        self.theta = 0

    def forward_kinematics(self, omega_left, omega_right, dt):
        """
        Update robot position based on wheel velocities.

        Args:
            omega_left: Left wheel angular velocity (rad/s)
            omega_right: Right wheel angular velocity (rad/s)
            dt: Time step (s)
        """
        # Calculate velocities
        v = self.r * (omega_right + omega_left) / 2  # Linear
        omega = self.r * (omega_right - omega_left) / self.L  # Angular

        # Update position (simple Euler integration)
        if abs(omega) < 1e-6:
            # Straight line motion
            self.x += v * np.cos(self.theta) * dt
            self.y += v * np.sin(self.theta) * dt
        else:
            # Arc motion
            self.x += (v/omega) * (np.sin(self.theta + omega*dt) - np.sin(self.theta))
            self.y += (v/omega) * (-np.cos(self.theta + omega*dt) + np.cos(self.theta))
            self.theta += omega * dt

        # Normalize theta to [-pi, pi]
        self.theta = np.arctan2(np.sin(self.theta), np.cos(self.theta))

        return self.get_pose()

    def inverse_kinematics(self, v, omega):
        """
        Calculate wheel velocities for desired motion.

        Args:
            v: Desired linear velocity (m/s)
            omega: Desired angular velocity (rad/s)

        Returns:
            (omega_left, omega_right) wheel velocities
        """
        omega_right = (2*v + omega*self.L) / (2*self.r)
        omega_left = (2*v - omega*self.L) / (2*self.r)
        return omega_left, omega_right

    def get_pose(self):
        """Get current pose as (x, y, theta)."""
        return np.array([self.x, self.y, self.theta])

    def reset(self):
        """Reset to origin."""
        self.x = 0
        self.y = 0
        self.theta = 0

    def simulate_trajectory(self, commands, dt=0.1):
        """
        Simulate a trajectory given velocity commands.

        Args:
            commands: List of (v, omega) tuples
            dt: Time step per command

        Returns:
            List of poses
        """
        self.reset()
        trajectory = [self.get_pose().copy()]

        for v, omega in commands:
            omega_l, omega_r = self.inverse_kinematics(v, omega)
            self.forward_kinematics(omega_l, omega_r, dt)
            trajectory.append(self.get_pose().copy())

        return np.array(trajectory)


# Example usage
robot = DifferentialDriveRobot(wheel_radius=0.05, wheel_base=0.2)

# Drive in a square
commands = []
for _ in range(4):
    # Go straight
    commands.extend([(0.5, 0)] * 20)  # 2 seconds forward
    # Turn 90 degrees
    commands.extend([(0, np.pi/2)] * 10)  # 1 second turn

trajectory = robot.simulate_trajectory(commands, dt=0.1)

# Plot trajectory
plt.figure(figsize=(10, 10))
plt.plot(trajectory[:, 0], trajectory[:, 1], 'b-')
plt.plot(trajectory[0, 0], trajectory[0, 1], 'go', markersize=10, label='Start')
plt.plot(trajectory[-1, 0], trajectory[-1, 1], 'ro', markersize=10, label='End')
plt.axis('equal')
plt.grid(True)
plt.legend()
plt.title('Differential Drive Square Trajectory')
plt.xlabel('X (m)')
plt.ylabel('Y (m)')
plt.show()
```

## Workspace Analysis

Understanding where your robot can reach.

```python
def analyze_workspace(arm, resolution=100):
    """
    Generate workspace visualization.

    Args:
        arm: TwoLinkArm instance
        resolution: Number of angle samples
    """
    theta1_range = np.linspace(-np.pi, np.pi, resolution)
    theta2_range = np.linspace(-np.pi, np.pi, resolution)

    points = []
    for t1 in theta1_range:
        for t2 in theta2_range:
            x, y = arm.forward_kinematics(t1, t2)
            points.append([x, y, t1, t2])

    points = np.array(points)

    plt.figure(figsize=(10, 10))
    plt.scatter(points[:, 0], points[:, 1], c=points[:, 2],
                cmap='hsv', s=1, alpha=0.5)
    plt.colorbar(label='θ1 (rad)')
    plt.axis('equal')
    plt.grid(True)
    plt.title('Reachable Workspace')
    plt.xlabel('X')
    plt.ylabel('Y')
    plt.show()

    return points


# Analyze workspace
arm = TwoLinkArm(L1=1.0, L2=0.8)
workspace = analyze_workspace(arm)
```

---

## Knowledge Check

<details>
<summary>**Question 1**: Why might inverse kinematics have multiple solutions?</summary>

Multiple solutions exist because:

1. **Redundancy**: The robot has more DOF than needed for the task
2. **Configuration options**: Same end position, different joint arrangements

For a 2-link planar arm reaching a point:
- "Elbow up" configuration
- "Elbow down" configuration

Both place the end effector at the same (x, y), but with different θ1, θ2 values.

More complex robots may have many more solutions (e.g., 6-DOF arm has up to 8 solutions).
</details>

<details>
<summary>**Question 2**: What determines the workspace of a robot arm?</summary>

Workspace is determined by:

1. **Link lengths**: Longer links = larger workspace
2. **Joint limits**: Physical stops reduce reachable area
3. **Joint types**: Revolute vs prismatic affects shape
4. **Number of joints**: More joints = more flexibility

For a 2-link arm:
- Outer boundary: circle of radius L1 + L2
- Inner boundary: circle of radius |L1 - L2| (if L1 ≠ L2)
- The "doughnut" shaped area between is fully reachable
</details>

<details>
<summary>**Question 3**: For a differential drive robot, what wheel velocities produce pure rotation in place?</summary>

For pure rotation (v = 0, ω ≠ 0):

Using the inverse kinematics equations:
- ω_right = (0 + ω·L) / (2r) = ω·L / (2r)
- ω_left = (0 - ω·L) / (2r) = -ω·L / (2r)

The wheels spin at **equal speeds in opposite directions**.

For clockwise rotation: left forward, right backward
For counter-clockwise: left backward, right forward
</details>

---

## Hands-On Exercise

### Exercise 3.2: Arm Trajectory Planner

```python
# trajectory_planner.py
"""
TODO: Implement a trajectory planner for the 2-link arm.

Requirements:
1. Linear interpolation between start and end positions
2. Handle unreachable targets gracefully
3. Smooth joint motion (no sudden jumps)
4. Animation of the movement
"""

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation

class TrajectoryPlanner:
    """Plan and execute trajectories for 2-link arm."""

    def __init__(self, arm):
        self.arm = arm

    def plan_linear(self, start_pos, end_pos, num_points=50):
        """
        Plan a straight-line trajectory in Cartesian space.

        Args:
            start_pos: (x, y) start position
            end_pos: (x, y) end position
            num_points: Number of waypoints

        Returns:
            List of (theta1, theta2) for each waypoint
        """
        # TODO: Implement
        # 1. Generate interpolated points
        # 2. Calculate IK for each point
        # 3. Handle unreachable points
        # 4. Return joint trajectory
        pass

    def plan_joint_space(self, start_angles, end_angles, num_points=50):
        """
        Plan trajectory in joint space (smoother but curved path).
        """
        # TODO: Implement
        pass

    def animate(self, joint_trajectory, interval=50):
        """
        Animate the arm following a trajectory.
        """
        # TODO: Implement using matplotlib animation
        pass


# Test your implementation
if __name__ == "__main__":
    arm = TwoLinkArmIK(L1=1.0, L2=0.8)
    planner = TrajectoryPlanner(arm)

    # Plan linear trajectory
    trajectory = planner.plan_linear(
        start_pos=(0.5, 0.5),
        end_pos=(1.0, 1.0)
    )

    # Animate
    planner.animate(trajectory)
```

---

## Summary

In this lesson, we learned:

- **Forward kinematics**: Joint angles → end effector position
- **Inverse kinematics**: End effector position → joint angles
- **Transformation matrices**: Represent position and orientation
- **2-link arm kinematics**: Practical FK and IK implementation
- **Differential drive**: Mobile robot kinematics
- **Workspace analysis**: Understanding robot capabilities

## Next Steps

In the next lesson, we'll explore **Motion Planning** - how to plan collision-free paths for robots.

---

## Additional Resources

- [Robotics Toolbox for Python](https://github.com/petercorke/robotics-toolbox-python)
- [Modern Robotics (Free textbook)](http://hades.mech.northwestern.edu/index.php/Modern_Robotics)
- [MIT OpenCourseWare - Intro to Robotics](https://ocw.mit.edu/courses/mechanical-engineering/2-12-introduction-to-robotics-fall-2005/)
