---
sidebar_position: 3
title: "3.3 Motion Planning"
description: Planning collision-free paths and trajectories for robot motion
---

# Motion Planning

How does a robot navigate from point A to point B without hitting obstacles? Motion planning answers this question. This lesson covers the fundamental algorithms for path and trajectory planning.

## Learning Objectives

By the end of this lesson, you will be able to:

- Understand configuration space and obstacles
- Implement grid-based pathfinding (A*, Dijkstra)
- Understand sampling-based planners (RRT, PRM)
- Generate smooth trajectories from paths
- Apply motion planning to mobile robots

## Configuration Space

The configuration space (C-space) represents all possible robot configurations.

```
Physical Space vs Configuration Space:

Physical Space:              Configuration Space:
┌─────────────────────┐      ┌─────────────────────┐
│      ┌───┐          │      │ ████████            │
│      │Obs│          │      │ ████████            │
│      └───┘   ●      │  →   │ ████████      ●    │
│        Robot        │      │                     │
│  (position only)    │      │   C-obstacle        │
└─────────────────────┘      └─────────────────────┘

• Point robot → C-space = Physical space
• Circular robot → Obstacles grow by robot radius
• Robot with rotation → C-space has extra dimension (θ)
```

```python
import numpy as np
import matplotlib.pyplot as plt

def create_cspace(world_map, robot_radius):
    """
    Expand obstacles by robot radius to create configuration space.

    Args:
        world_map: Binary occupancy grid (1 = obstacle)
        robot_radius: Robot radius in grid cells

    Returns:
        Configuration space (1 = blocked)
    """
    from scipy.ndimage import binary_dilation

    # Create circular structuring element
    y, x = np.ogrid[-robot_radius:robot_radius+1, -robot_radius:robot_radius+1]
    kernel = x**2 + y**2 <= robot_radius**2

    # Dilate obstacles
    cspace = binary_dilation(world_map, structure=kernel)
    return cspace.astype(int)


# Example
world = np.zeros((100, 100))
world[30:50, 40:60] = 1  # Rectangle obstacle

cspace = create_cspace(world, robot_radius=5)

plt.figure(figsize=(12, 5))
plt.subplot(1, 2, 1)
plt.imshow(world, cmap='gray_r')
plt.title('Physical Space')
plt.subplot(1, 2, 2)
plt.imshow(cspace, cmap='gray_r')
plt.title('Configuration Space (r=5)')
plt.show()
```

## Grid-Based Path Planning

### Dijkstra's Algorithm

Finds the shortest path by exploring all directions equally.

```python
import heapq
from typing import List, Tuple, Optional

def dijkstra(grid, start, goal):
    """
    Find shortest path using Dijkstra's algorithm.

    Args:
        grid: 2D numpy array (0 = free, 1 = obstacle)
        start: (row, col) starting position
        goal: (row, col) goal position

    Returns:
        List of (row, col) positions forming the path, or None
    """
    rows, cols = grid.shape
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1),
                  (-1, -1), (-1, 1), (1, -1), (1, 1)]

    # Priority queue: (cost, row, col)
    pq = [(0, start[0], start[1])]
    visited = set()
    came_from = {start: None}
    cost_so_far = {start: 0}

    while pq:
        cost, r, c = heapq.heappop(pq)

        if (r, c) == goal:
            # Reconstruct path
            path = []
            current = goal
            while current is not None:
                path.append(current)
                current = came_from[current]
            return path[::-1]

        if (r, c) in visited:
            continue
        visited.add((r, c))

        for dr, dc in directions:
            nr, nc = r + dr, c + dc

            # Check bounds and obstacles
            if 0 <= nr < rows and 0 <= nc < cols and grid[nr, nc] == 0:
                # Diagonal moves cost sqrt(2)
                move_cost = 1.414 if (dr != 0 and dc != 0) else 1
                new_cost = cost + move_cost

                if (nr, nc) not in cost_so_far or new_cost < cost_so_far[(nr, nc)]:
                    cost_so_far[(nr, nc)] = new_cost
                    heapq.heappush(pq, (new_cost, nr, nc))
                    came_from[(nr, nc)] = (r, c)

    return None  # No path found
```

### A* Algorithm

Dijkstra + heuristic = faster pathfinding.

```python
def heuristic(a, b, method='euclidean'):
    """
    Estimate distance between two points.

    Args:
        a, b: (row, col) positions
        method: 'euclidean', 'manhattan', or 'diagonal'
    """
    dr, dc = abs(a[0] - b[0]), abs(a[1] - b[1])

    if method == 'euclidean':
        return np.sqrt(dr**2 + dc**2)
    elif method == 'manhattan':
        return dr + dc
    elif method == 'diagonal':
        return max(dr, dc) + 0.414 * min(dr, dc)


def astar(grid, start, goal):
    """
    Find shortest path using A* algorithm.

    Args:
        grid: 2D numpy array (0 = free, 1 = obstacle)
        start: (row, col) starting position
        goal: (row, col) goal position

    Returns:
        List of (row, col) positions forming the path, or None
    """
    rows, cols = grid.shape
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1),
                  (-1, -1), (-1, 1), (1, -1), (1, 1)]

    # Priority queue: (f_score, g_score, row, col)
    pq = [(heuristic(start, goal), 0, start[0], start[1])]
    visited = set()
    came_from = {start: None}
    g_score = {start: 0}

    while pq:
        f, g, r, c = heapq.heappop(pq)

        if (r, c) == goal:
            # Reconstruct path
            path = []
            current = goal
            while current is not None:
                path.append(current)
                current = came_from[current]
            return path[::-1]

        if (r, c) in visited:
            continue
        visited.add((r, c))

        for dr, dc in directions:
            nr, nc = r + dr, c + dc

            if 0 <= nr < rows and 0 <= nc < cols and grid[nr, nc] == 0:
                move_cost = 1.414 if (dr != 0 and dc != 0) else 1
                new_g = g + move_cost

                if (nr, nc) not in g_score or new_g < g_score[(nr, nc)]:
                    g_score[(nr, nc)] = new_g
                    f_score = new_g + heuristic((nr, nc), goal)
                    heapq.heappush(pq, (f_score, new_g, nr, nc))
                    came_from[(nr, nc)] = (r, c)

    return None


# Compare algorithms
def visualize_planning(grid, start, goal, path, visited=None):
    """Visualize path planning result."""
    plt.figure(figsize=(10, 10))
    plt.imshow(grid, cmap='gray_r')

    if path:
        path = np.array(path)
        plt.plot(path[:, 1], path[:, 0], 'b-', linewidth=2, label='Path')

    plt.plot(start[1], start[0], 'go', markersize=15, label='Start')
    plt.plot(goal[1], goal[0], 'ro', markersize=15, label='Goal')
    plt.legend()
    plt.title(f'Path length: {len(path) if path else "No path"}')
    plt.show()
```

## Sampling-Based Planning

For high-dimensional spaces where grid methods are impractical.

### Rapidly-exploring Random Tree (RRT)

```python
class RRT:
    """Rapidly-exploring Random Tree path planner."""

    def __init__(self, start, goal, grid, step_size=5, max_iter=5000):
        self.start = np.array(start)
        self.goal = np.array(goal)
        self.grid = grid
        self.step_size = step_size
        self.max_iter = max_iter

        self.nodes = [self.start]
        self.parents = {tuple(self.start): None}

    def is_collision_free(self, from_point, to_point):
        """Check if path between two points is collision-free."""
        # Sample points along the line
        dist = np.linalg.norm(to_point - from_point)
        n_samples = int(dist / 0.5) + 1

        for t in np.linspace(0, 1, n_samples):
            point = from_point + t * (to_point - from_point)
            r, c = int(point[0]), int(point[1])

            if r < 0 or r >= self.grid.shape[0] or c < 0 or c >= self.grid.shape[1]:
                return False
            if self.grid[r, c] == 1:
                return False

        return True

    def nearest_node(self, point):
        """Find nearest node in tree to given point."""
        distances = [np.linalg.norm(node - point) for node in self.nodes]
        return self.nodes[np.argmin(distances)]

    def steer(self, from_node, to_point):
        """Generate new node by stepping from from_node toward to_point."""
        direction = to_point - from_node
        dist = np.linalg.norm(direction)

        if dist < self.step_size:
            return to_point

        return from_node + (direction / dist) * self.step_size

    def plan(self):
        """Run RRT algorithm to find path."""
        goal_threshold = self.step_size * 2

        for i in range(self.max_iter):
            # Bias toward goal occasionally
            if np.random.random() < 0.1:
                random_point = self.goal
            else:
                random_point = np.array([
                    np.random.randint(0, self.grid.shape[0]),
                    np.random.randint(0, self.grid.shape[1])
                ])

            # Find nearest node and steer toward random point
            nearest = self.nearest_node(random_point)
            new_node = self.steer(nearest, random_point)

            # Check for collision
            if self.is_collision_free(nearest, new_node):
                self.nodes.append(new_node)
                self.parents[tuple(new_node)] = tuple(nearest)

                # Check if we can reach the goal
                if np.linalg.norm(new_node - self.goal) < goal_threshold:
                    if self.is_collision_free(new_node, self.goal):
                        self.nodes.append(self.goal)
                        self.parents[tuple(self.goal)] = tuple(new_node)
                        return self.extract_path()

        return None  # Failed to find path

    def extract_path(self):
        """Extract path from tree."""
        path = []
        current = tuple(self.goal)

        while current is not None:
            path.append(np.array(current))
            current = self.parents.get(current)

        return path[::-1]


# Example usage
grid = np.zeros((100, 100))
grid[20:80, 40:60] = 1  # Obstacle

rrt = RRT(start=(10, 10), goal=(90, 90), grid=grid)
path = rrt.plan()

if path:
    visualize_planning(grid, (10, 10), (90, 90), [(p[0], p[1]) for p in path])
```

## Trajectory Generation

Paths are discrete waypoints. Trajectories add timing and smoothness.

### Path Smoothing

```python
def smooth_path(path, grid, iterations=100):
    """
    Smooth a path using gradient descent.

    Args:
        path: List of (row, col) waypoints
        grid: Occupancy grid
        iterations: Number of smoothing iterations

    Returns:
        Smoothed path
    """
    path = [np.array(p, dtype=float) for p in path]
    weight_smooth = 0.5
    weight_data = 0.1

    for _ in range(iterations):
        for i in range(1, len(path) - 1):
            # Original position pull
            data_pull = weight_data * (np.array(path[i]) - path[i])

            # Smoothness pull (toward average of neighbors)
            smooth_pull = weight_smooth * (path[i-1] + path[i+1] - 2*path[i])

            new_pos = path[i] + data_pull + smooth_pull

            # Only accept if collision-free
            r, c = int(new_pos[0]), int(new_pos[1])
            if 0 <= r < grid.shape[0] and 0 <= c < grid.shape[1] and grid[r, c] == 0:
                path[i] = new_pos

    return [(int(p[0]), int(p[1])) for p in path]
```

### Velocity Profile (Trapezoidal)

```python
class TrapezoidalProfile:
    """Generate trapezoidal velocity profile for smooth motion."""

    def __init__(self, max_vel, max_accel):
        self.max_vel = max_vel
        self.max_accel = max_accel

    def generate(self, distance, dt=0.01):
        """
        Generate velocity profile for given distance.

        Returns:
            times, positions, velocities, accelerations
        """
        # Calculate times
        t_accel = self.max_vel / self.max_accel
        d_accel = 0.5 * self.max_accel * t_accel**2

        if 2 * d_accel > distance:
            # Triangular profile (can't reach max velocity)
            t_accel = np.sqrt(distance / self.max_accel)
            t_cruise = 0
            t_total = 2 * t_accel
            v_peak = self.max_accel * t_accel
        else:
            # Trapezoidal profile
            d_cruise = distance - 2 * d_accel
            t_cruise = d_cruise / self.max_vel
            t_total = 2 * t_accel + t_cruise
            v_peak = self.max_vel

        # Generate profile
        times = np.arange(0, t_total, dt)
        positions = np.zeros_like(times)
        velocities = np.zeros_like(times)
        accelerations = np.zeros_like(times)

        for i, t in enumerate(times):
            if t < t_accel:
                # Accelerating
                accelerations[i] = self.max_accel
                velocities[i] = self.max_accel * t
                positions[i] = 0.5 * self.max_accel * t**2
            elif t < t_accel + t_cruise:
                # Cruising
                accelerations[i] = 0
                velocities[i] = v_peak
                positions[i] = d_accel + v_peak * (t - t_accel)
            else:
                # Decelerating
                t_decel = t - t_accel - t_cruise
                accelerations[i] = -self.max_accel
                velocities[i] = v_peak - self.max_accel * t_decel
                positions[i] = d_accel + v_peak * t_cruise + \
                               v_peak * t_decel - 0.5 * self.max_accel * t_decel**2

        return times, positions, velocities, accelerations


# Example
profile = TrapezoidalProfile(max_vel=1.0, max_accel=0.5)
t, pos, vel, acc = profile.generate(distance=5.0)

plt.figure(figsize=(12, 4))
plt.subplot(1, 3, 1)
plt.plot(t, pos)
plt.xlabel('Time')
plt.ylabel('Position')
plt.title('Position')

plt.subplot(1, 3, 2)
plt.plot(t, vel)
plt.xlabel('Time')
plt.ylabel('Velocity')
plt.title('Velocity')

plt.subplot(1, 3, 3)
plt.plot(t, acc)
plt.xlabel('Time')
plt.ylabel('Acceleration')
plt.title('Acceleration')

plt.tight_layout()
plt.show()
```

---

## Knowledge Check

<details>
<summary>**Question 1**: Why do we expand obstacles in configuration space?</summary>

We expand obstacles by the robot's radius so that:
1. The robot can be treated as a point in C-space
2. Path planning only needs to check single points, not robot geometry
3. Collision detection becomes simpler (point vs obstacle, not shape vs obstacle)

The expansion ensures any path found in C-space is actually traversable by the real robot.
</details>

<details>
<summary>**Question 2**: When would you use RRT instead of A*?</summary>

Use RRT when:
1. **High-dimensional spaces**: Robot arms (6+ DOF) where grids are impractical
2. **Complex obstacle shapes**: Irregular boundaries
3. **Large search spaces**: Finding any path quickly matters more than optimal
4. **Dynamic replanning**: Need to adapt quickly

Use A* when:
1. **Low dimensions**: 2D navigation
2. **Optimal path needed**: A* guarantees shortest path
3. **Grid-based map available**: Already have occupancy grid
4. **Consistent environment**: Map doesn't change frequently
</details>

<details>
<summary>**Question 3**: What is the purpose of a trapezoidal velocity profile?</summary>

Trapezoidal velocity profiles ensure:
1. **Bounded acceleration**: Prevents jerky motion
2. **Smooth starts and stops**: No instantaneous velocity changes
3. **Predictable motion**: Easy to calculate timing
4. **Motor protection**: Limits torque demands

The "trapezoidal" shape comes from: accelerate → cruise → decelerate
For short distances, it becomes "triangular" (no cruise phase).
</details>

---

## Hands-On Exercise

### Exercise 3.3: Complete Motion Planner

Build a complete pipeline from map to motion:

```python
# motion_planner.py
"""
TODO: Implement a complete motion planning pipeline.

Requirements:
1. Load/create occupancy grid
2. Generate C-space
3. Plan path using A*
4. Smooth the path
5. Generate velocity profile
6. Animate the motion
"""

class MotionPlanner:
    """Complete motion planning pipeline."""

    def __init__(self, grid, robot_radius):
        self.grid = grid
        self.robot_radius = robot_radius
        self.cspace = None
        self.path = None
        self.trajectory = None

    def plan(self, start, goal):
        """
        Plan complete trajectory from start to goal.

        Returns:
            trajectory: List of (time, x, y, vx, vy) tuples
        """
        # TODO: Implement
        # 1. Generate C-space
        # 2. Find path using A*
        # 3. Smooth path
        # 4. Generate trajectory with velocity profile
        pass

    def visualize(self):
        """Visualize the planning result."""
        # TODO: Implement
        pass

    def animate(self):
        """Animate robot following trajectory."""
        # TODO: Implement
        pass


# Test
if __name__ == "__main__":
    # Create test environment
    grid = np.zeros((100, 100))
    grid[30:70, 20:30] = 1
    grid[30:70, 50:60] = 1
    grid[30:70, 80:90] = 1

    planner = MotionPlanner(grid, robot_radius=3)
    trajectory = planner.plan(start=(50, 5), goal=(50, 95))

    planner.visualize()
    planner.animate()
```

---

## Summary

In this lesson, we learned:

- **Configuration space**: Simplify collision checking
- **Grid-based planning**: Dijkstra and A* algorithms
- **Sampling-based planning**: RRT for complex spaces
- **Path smoothing**: Make paths more natural
- **Trajectory generation**: Add timing with velocity profiles

## Next Steps

You've completed Module 3! You now understand how robots:
- Control motors and actuators
- Calculate positions using kinematics
- Plan collision-free paths

In **Module 4**, we'll bring everything together in **System Integration** and your **Capstone Project**.

---

## Additional Resources

- [PathPlanning on GitHub](https://github.com/zhm-real/PathPlanning) - Algorithm implementations
- [MoveIt (ROS)](https://moveit.ros.org/) - Industrial motion planning
- [OMPL (Open Motion Planning Library)](https://ompl.kavrakilab.org/) - Research library
