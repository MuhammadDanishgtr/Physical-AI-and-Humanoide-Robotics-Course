---
sidebar_position: 3
title: "2.3 Computer Vision Basics"
description: Using cameras for robot perception - image processing, object detection, and visual navigation
---

# Computer Vision Basics

Cameras are among the richest sensors available to robots. In this lesson, we'll learn the fundamentals of using vision for robotic perception.

## Learning Objectives

By the end of this lesson, you will be able to:

- Capture and process images using OpenCV
- Apply basic image processing techniques
- Detect colors, edges, and shapes
- Implement simple object tracking
- Understand camera calibration basics

## Getting Started with OpenCV

OpenCV (Open Source Computer Vision) is the standard library for computer vision in robotics.

```python
import cv2
import numpy as np

# Read an image
image = cv2.imread('robot.jpg')

# Images are NumPy arrays
print(f"Shape: {image.shape}")  # (height, width, channels)
print(f"Data type: {image.dtype}")  # uint8 (0-255)

# Display image
cv2.imshow('Image', image)
cv2.waitKey(0)  # Wait for key press
cv2.destroyAllWindows()

# Save image
cv2.imwrite('output.jpg', image)
```

### Working with Video

```python
# Capture from camera
cap = cv2.VideoCapture(0)  # 0 = default camera

if not cap.isOpened():
    raise RuntimeError("Cannot open camera")

# Set resolution
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Process frame here
    cv2.imshow('Camera', frame)

    # Press 'q' to quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

## Color Spaces

Different color spaces are useful for different tasks.

```
Common Color Spaces:

BGR (OpenCV default):
┌─────────┐
│ Blue    │ - Good for: Display, file I/O
│ Green   │
│ Red     │
└─────────┘

HSV (Hue, Saturation, Value):
┌─────────┐
│ Hue     │ - Good for: Color detection
│ Sat     │   (color is separated from lighting)
│ Value   │
└─────────┘

Grayscale:
┌─────────┐
│ Gray    │ - Good for: Edge detection, feature matching
└─────────┘
```

```python
# Color space conversions
image = cv2.imread('colored_objects.jpg')

# Convert to different color spaces
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # For matplotlib

# HSV ranges for common colors
color_ranges = {
    'red_low':    ([0, 100, 100], [10, 255, 255]),
    'red_high':   ([160, 100, 100], [180, 255, 255]),
    'green':      ([35, 100, 100], [85, 255, 255]),
    'blue':       ([100, 100, 100], [130, 255, 255]),
    'yellow':     ([20, 100, 100], [35, 255, 255]),
    'orange':     ([10, 100, 100], [20, 255, 255]),
}
```

## Color Detection and Tracking

### Detecting Colored Objects

```python
import cv2
import numpy as np

def detect_color(image, color_name='blue'):
    """Detect objects of a specific color."""
    # Convert to HSV
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    # Define color ranges
    color_ranges = {
        'red': ([0, 100, 100], [10, 255, 255]),
        'green': ([35, 100, 100], [85, 255, 255]),
        'blue': ([100, 100, 100], [130, 255, 255]),
    }

    lower = np.array(color_ranges[color_name][0])
    upper = np.array(color_ranges[color_name][1])

    # Create mask
    mask = cv2.inRange(hsv, lower, upper)

    # Clean up mask with morphology
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)  # Remove noise
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)  # Fill holes

    # Find contours
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    return mask, contours


def track_largest_object(frame, color='blue'):
    """Track the largest object of a specific color."""
    mask, contours = detect_color(frame, color)

    if not contours:
        return None, mask

    # Find largest contour
    largest = max(contours, key=cv2.contourArea)

    # Get bounding circle
    (x, y), radius = cv2.minEnclosingCircle(largest)

    if radius > 10:  # Minimum size threshold
        center = (int(x), int(y))

        # Draw on frame
        cv2.circle(frame, center, int(radius), (0, 255, 0), 2)
        cv2.circle(frame, center, 5, (0, 0, 255), -1)  # Center dot

        return {'center': center, 'radius': radius, 'area': cv2.contourArea(largest)}, mask

    return None, mask


# Main tracking loop
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Track blue objects
    result, mask = track_largest_object(frame, 'blue')

    if result:
        cx, cy = result['center']
        # Calculate position relative to frame center
        frame_center_x = frame.shape[1] // 2
        offset_x = cx - frame_center_x
        print(f"Object at ({cx}, {cy}), offset from center: {offset_x}")

    cv2.imshow('Frame', frame)
    cv2.imshow('Mask', mask)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

## Edge Detection

Edges are boundaries between regions - essential for shape detection.

```python
def detect_edges(image, method='canny'):
    """Detect edges in an image."""
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    if method == 'canny':
        # Canny edge detector (most common)
        edges = cv2.Canny(blurred, 50, 150)

    elif method == 'sobel':
        # Sobel gradients
        sobel_x = cv2.Sobel(blurred, cv2.CV_64F, 1, 0, ksize=3)
        sobel_y = cv2.Sobel(blurred, cv2.CV_64F, 0, 1, ksize=3)
        edges = np.sqrt(sobel_x**2 + sobel_y**2)
        edges = np.uint8(edges / edges.max() * 255)

    elif method == 'laplacian':
        # Laplacian (second derivative)
        edges = cv2.Laplacian(blurred, cv2.CV_64F)
        edges = np.uint8(np.abs(edges))

    return edges


# Canny with automatic threshold
def auto_canny(image, sigma=0.33):
    """Apply Canny with automatic threshold calculation."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Compute median
    median = np.median(blurred)

    # Calculate thresholds
    lower = int(max(0, (1.0 - sigma) * median))
    upper = int(min(255, (1.0 + sigma) * median))

    return cv2.Canny(blurred, lower, upper)
```

## Shape Detection

### Detecting Lines (Hough Transform)

```python
def detect_lines(image, method='probabilistic'):
    """Detect lines in an image."""
    edges = auto_canny(image)

    if method == 'standard':
        # Standard Hough Transform
        lines = cv2.HoughLines(edges, 1, np.pi/180, 150)
        if lines is not None:
            for line in lines:
                rho, theta = line[0]
                a, b = np.cos(theta), np.sin(theta)
                x0, y0 = a * rho, b * rho
                pt1 = (int(x0 + 1000*(-b)), int(y0 + 1000*(a)))
                pt2 = (int(x0 - 1000*(-b)), int(y0 - 1000*(a)))
                cv2.line(image, pt1, pt2, (0, 0, 255), 2)

    else:
        # Probabilistic Hough Transform (usually better)
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, 50,
                                 minLineLength=50, maxLineGap=10)
        if lines is not None:
            for line in lines:
                x1, y1, x2, y2 = line[0]
                cv2.line(image, (x1, y1), (x2, y2), (0, 255, 0), 2)

    return image, lines
```

### Detecting Circles

```python
def detect_circles(image, min_radius=10, max_radius=100):
    """Detect circles in an image."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (9, 9), 2)

    circles = cv2.HoughCircles(
        blurred,
        cv2.HOUGH_GRADIENT,
        dp=1,
        minDist=50,
        param1=100,
        param2=30,
        minRadius=min_radius,
        maxRadius=max_radius
    )

    detected = []
    if circles is not None:
        circles = np.uint16(np.around(circles))
        for circle in circles[0, :]:
            x, y, r = circle
            cv2.circle(image, (x, y), r, (0, 255, 0), 2)
            cv2.circle(image, (x, y), 2, (0, 0, 255), 3)
            detected.append({'center': (x, y), 'radius': r})

    return image, detected
```

### Detecting Contours and Shapes

```python
def detect_shapes(image):
    """Detect and classify basic shapes."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)

    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    shapes = []
    for contour in contours:
        # Skip small contours
        if cv2.contourArea(contour) < 100:
            continue

        # Approximate contour to polygon
        peri = cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, 0.04 * peri, True)
        vertices = len(approx)

        # Get bounding box
        x, y, w, h = cv2.boundingRect(approx)

        # Classify shape
        if vertices == 3:
            shape = "triangle"
        elif vertices == 4:
            aspect_ratio = w / float(h)
            shape = "square" if 0.95 <= aspect_ratio <= 1.05 else "rectangle"
        elif vertices == 5:
            shape = "pentagon"
        elif vertices == 6:
            shape = "hexagon"
        else:
            shape = "circle"

        shapes.append({
            'shape': shape,
            'vertices': vertices,
            'contour': contour,
            'center': (x + w//2, y + h//2),
            'area': cv2.contourArea(contour)
        })

        # Draw on image
        cv2.drawContours(image, [approx], -1, (0, 255, 0), 2)
        cv2.putText(image, shape, (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

    return image, shapes
```

## Line Following for Robots

A classic robotics application - following a line on the ground.

```python
class LineFollower:
    """Simple line following using vision."""

    def __init__(self, target_color='black'):
        self.target_color = target_color

    def find_line(self, frame):
        """Find line position in frame."""
        # Get bottom portion of frame (where line is closer)
        height = frame.shape[0]
        roi = frame[int(height * 0.6):, :]  # Bottom 40%

        # Convert to grayscale
        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)

        # Threshold to find dark line
        if self.target_color == 'black':
            _, binary = cv2.threshold(gray, 60, 255, cv2.THRESH_BINARY_INV)
        else:
            _, binary = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY)

        # Find contours
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        if not contours:
            return None, binary

        # Find largest contour (the line)
        largest = max(contours, key=cv2.contourArea)

        # Get centroid using moments
        M = cv2.moments(largest)
        if M['m00'] == 0:
            return None, binary

        cx = int(M['m10'] / M['m00'])
        cy = int(M['m01'] / M['m00'])

        return (cx, cy), binary

    def calculate_steering(self, frame):
        """Calculate steering correction based on line position."""
        position, mask = self.find_line(frame)

        if position is None:
            return 0, 'lost', mask  # Line not found

        cx, cy = position
        frame_center = frame.shape[1] // 2

        # Error from center (-1 to 1)
        error = (cx - frame_center) / frame_center

        # Determine direction
        if abs(error) < 0.1:
            direction = 'straight'
        elif error < 0:
            direction = 'left'
        else:
            direction = 'right'

        return error, direction, mask


# Usage example
follower = LineFollower()
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    error, direction, mask = follower.calculate_steering(frame)

    # Display info
    cv2.putText(frame, f"Direction: {direction}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    cv2.putText(frame, f"Error: {error:.2f}", (10, 60),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

    # Draw center line
    center = frame.shape[1] // 2
    cv2.line(frame, (center, 0), (center, frame.shape[0]), (255, 0, 0), 2)

    cv2.imshow('Frame', frame)
    cv2.imshow('Mask', mask)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

## Camera Calibration Basics

Real cameras have distortion that affects measurements.

```
Types of Distortion:

Barrel Distortion:     Pincushion Distortion:
   ┌──────────┐            ┌──────────┐
   │  ╭────╮  │            │  ╰────╯  │
   │ ╭      ╮ │            │ ╰      ╯ │
   │ │      │ │            │ │      │ │
   │ ╰      ╯ │            │ ╭      ╮ │
   │  ╰────╯  │            │  ╭────╮  │
   └──────────┘            └──────────┘
   Lines bow out          Lines bow in
```

```python
import cv2
import numpy as np
import glob

def calibrate_camera(image_folder, pattern_size=(9, 6), square_size=0.025):
    """
    Calibrate camera using chessboard images.

    Args:
        image_folder: Folder containing chessboard images
        pattern_size: Number of inner corners (cols, rows)
        square_size: Size of squares in meters
    """
    # Prepare object points
    objp = np.zeros((pattern_size[0] * pattern_size[1], 3), np.float32)
    objp[:, :2] = np.mgrid[0:pattern_size[0], 0:pattern_size[1]].T.reshape(-1, 2)
    objp *= square_size

    obj_points = []  # 3D points in real world
    img_points = []  # 2D points in image

    images = glob.glob(f"{image_folder}/*.jpg")
    gray_shape = None

    for fname in images:
        img = cv2.imread(fname)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray_shape = gray.shape[::-1]

        # Find chessboard corners
        ret, corners = cv2.findChessboardCorners(gray, pattern_size, None)

        if ret:
            obj_points.append(objp)
            # Refine corner locations
            corners2 = cv2.cornerSubPix(
                gray, corners, (11, 11), (-1, -1),
                (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.001)
            )
            img_points.append(corners2)

    # Calibrate
    ret, camera_matrix, dist_coeffs, rvecs, tvecs = cv2.calibrateCamera(
        obj_points, img_points, gray_shape, None, None
    )

    print(f"Calibration RMS error: {ret:.4f}")
    print(f"Camera matrix:\n{camera_matrix}")
    print(f"Distortion coefficients: {dist_coeffs.flatten()}")

    return camera_matrix, dist_coeffs


def undistort_image(image, camera_matrix, dist_coeffs):
    """Remove distortion from image."""
    h, w = image.shape[:2]
    new_matrix, roi = cv2.getOptimalNewCameraMatrix(
        camera_matrix, dist_coeffs, (w, h), 1, (w, h)
    )
    undistorted = cv2.undistort(image, camera_matrix, dist_coeffs, None, new_matrix)

    # Crop to valid region
    x, y, w, h = roi
    undistorted = undistorted[y:y+h, x:x+w]

    return undistorted


# Save/load calibration
def save_calibration(filename, camera_matrix, dist_coeffs):
    np.savez(filename, camera_matrix=camera_matrix, dist_coeffs=dist_coeffs)

def load_calibration(filename):
    data = np.load(filename)
    return data['camera_matrix'], data['dist_coeffs']
```

---

## Knowledge Check

<details>
<summary>**Question 1**: Why do we convert to HSV color space for color detection instead of using BGR directly?</summary>

In HSV (Hue, Saturation, Value):
- **Hue** represents the color itself (0-180 in OpenCV)
- **Saturation** represents color intensity
- **Value** represents brightness

Benefits over BGR:
1. Color (hue) is separated from lighting (value)
2. Easier to define color ranges that work under varying lighting
3. More intuitive - "red" is a range of hue values regardless of brightness

In BGR, the same color under different lighting has very different R, G, B values, making thresholding difficult.
</details>

<details>
<summary>**Question 2**: What preprocessing steps should you apply before edge detection?</summary>

Typical preprocessing pipeline:
1. **Convert to grayscale** - Edge detection works on intensity, not color
2. **Apply Gaussian blur** - Reduce noise that causes false edges
3. **Adjust contrast/brightness** (optional) - Enhance edges

Why blur before edge detection:
- Noise creates many tiny "edges" that aren't real boundaries
- Blurring averages out noise while preserving real edges
- Common kernel size: 3x3 or 5x5

Without preprocessing, you'll get noisy, fragmented edges that are hard to use.
</details>

<details>
<summary>**Question 3**: How does the Hough Transform detect lines?</summary>

The Hough Transform works by:
1. Representing each line as (rho, theta) instead of (m, b)
   - rho: Distance from origin to nearest point on line
   - theta: Angle of that distance vector

2. For each edge pixel, calculate all possible lines through it
   - This creates a "vote" in parameter space

3. Peaks in the voting space indicate lines
   - Many edge pixels voting for same (rho, theta) = a line

Advantages:
- Works even with gaps in lines (missing edge pixels still vote)
- Robust to noise
- Can detect multiple lines simultaneously

The probabilistic variant (HoughLinesP) is faster and returns line segments with endpoints.
</details>

---

## Hands-On Exercise

### Exercise 2.3: Color-Based Object Tracker

Build a complete object tracking system:

```python
# object_tracker.py
import cv2
import numpy as np
from collections import deque

class ObjectTracker:
    """
    TODO: Implement a color-based object tracker with:
    1. HSV color detection
    2. Morphological cleaning
    3. Contour finding
    4. Trail visualization
    """

    def __init__(self, color='green', trail_length=50):
        self.trail = deque(maxlen=trail_length)
        self.color = color
        # TODO: Define HSV ranges for your target color
        self.lower = None
        self.upper = None

    def detect(self, frame):
        """
        Detect object and return its center.
        Returns: (center_x, center_y) or None
        """
        # TODO: Implement detection
        pass

    def update(self, frame):
        """
        Update tracker with new frame.
        Returns: Annotated frame with tracking visualization
        """
        center = self.detect(frame)

        if center:
            self.trail.append(center)

        # TODO: Draw trail
        # TODO: Draw current position

        return frame


def main():
    tracker = ObjectTracker(color='green')
    cap = cv2.VideoCapture(0)

    # Create trackbars for HSV tuning
    cv2.namedWindow('Controls')
    cv2.createTrackbar('H Low', 'Controls', 35, 180, lambda x: None)
    cv2.createTrackbar('H High', 'Controls', 85, 180, lambda x: None)
    cv2.createTrackbar('S Low', 'Controls', 100, 255, lambda x: None)
    cv2.createTrackbar('S High', 'Controls', 255, 255, lambda x: None)
    cv2.createTrackbar('V Low', 'Controls', 100, 255, lambda x: None)
    cv2.createTrackbar('V High', 'Controls', 255, 255, lambda x: None)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # TODO: Read trackbar values
        # TODO: Update tracker HSV range

        result = tracker.update(frame.copy())

        cv2.imshow('Tracker', result)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
```

**Requirements**:
1. Detect colored objects using HSV thresholding
2. Track object center across frames
3. Draw a trailing path showing movement history
4. Include HSV trackbars for real-time tuning
5. Handle cases where object is not visible

**Bonus**: Add velocity estimation (pixels/frame)

---

## Summary

In this lesson, we learned:

- **OpenCV basics**: Reading, displaying, and saving images/video
- **Color spaces**: BGR, HSV, grayscale and when to use each
- **Color detection**: HSV thresholding for object detection
- **Edge detection**: Canny, Sobel, and preprocessing
- **Shape detection**: Lines, circles, and contour analysis
- **Line following**: A practical robotics application
- **Camera calibration**: Removing lens distortion

## Next Steps

You've completed Module 2! You now understand:
- Different sensor types and how to choose them
- Data processing techniques for reliable sensing
- Basic computer vision for visual perception

In **Module 3**, we'll explore **Actuators** - learning how robots interact with the physical world.

---

## Additional Resources

- [OpenCV Documentation](https://docs.opencv.org/)
- [OpenCV-Python Tutorials](https://docs.opencv.org/master/d6/d00/tutorial_py_root.html)
- [PyImageSearch Blog](https://pyimagesearch.com/) - Excellent tutorials
- [Learn OpenCV](https://learnopencv.com/) - In-depth articles
