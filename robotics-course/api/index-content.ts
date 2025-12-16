/**
 * Index Content API Endpoint
 * Creates Qdrant collection and indexes course content
 * Run once to populate the vector database
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const COHERE_API_KEY = process.env.COHERE_API_KEY;
const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const COLLECTION_NAME = process.env.QDRANT_COLLECTION_NAME || 'course_content';

// Course content to index
const courseContent = [
  {
    id: 'intro',
    title: 'Course Introduction',
    moduleId: 'intro',
    content: `Welcome to Physical AI & Humanoid Robotics Course. This course covers the fundamentals of robotics, from hardware basics to advanced AI integration. You will learn about sensors, actuators, kinematics, motion planning, and how to build complete robotic systems. The course is designed for beginners to intermediate learners who want to understand how physical AI and humanoid robots work.`
  },
  {
    id: 'lesson-1-1',
    title: 'Introduction to Physical AI',
    moduleId: 'module-1',
    content: `Physical AI refers to artificial intelligence systems that interact with the physical world through sensors and actuators. Unlike pure software AI, physical AI must deal with real-world constraints like physics, noise, and uncertainty. Key concepts include embodied intelligence, sensor fusion, real-time control, and human-robot interaction. Physical AI is used in robotics, autonomous vehicles, drones, and industrial automation.`
  },
  {
    id: 'lesson-1-2',
    title: 'Hardware Basics for Robotics',
    moduleId: 'module-1',
    content: `Essential hardware components for robotics include microcontrollers (Arduino, Raspberry Pi, ESP32), sensors (distance, IMU, cameras), actuators (DC motors, servo motors, stepper motors), power systems (batteries, voltage regulators), and communication modules (WiFi, Bluetooth, I2C, SPI). Understanding electronics basics like voltage, current, resistance, and digital vs analog signals is crucial for building robots.`
  },
  {
    id: 'lesson-1-3',
    title: 'Software Setup and Development Environment',
    moduleId: 'module-1',
    content: `Setting up a robotics development environment involves installing Python, Arduino IDE, ROS (Robot Operating System), and necessary libraries like NumPy, OpenCV, and PySerial. Version control with Git is essential for managing code. Simulation tools like Gazebo and Webots allow testing before deploying to real hardware. IDE choices include VS Code, PyCharm, and Arduino IDE.`
  },
  {
    id: 'lesson-2-1',
    title: 'Sensor Types and Selection',
    moduleId: 'module-2',
    content: `Sensors are the eyes and ears of robots. Common types include: Distance sensors (ultrasonic, infrared, LiDAR), IMU (accelerometer, gyroscope, magnetometer), cameras (RGB, depth, thermal), touch sensors, force/torque sensors, and environmental sensors (temperature, humidity). Sensor selection depends on accuracy, range, cost, and application requirements. Sensor fusion combines multiple sensors for better perception.`
  },
  {
    id: 'lesson-2-2',
    title: 'Data Acquisition and Processing',
    moduleId: 'module-2',
    content: `Data acquisition involves reading sensor data through ADC (Analog-to-Digital Conversion), I2C, SPI, or UART protocols. Signal processing techniques include filtering (low-pass, high-pass, Kalman filter), calibration, and noise reduction. Real-time data processing requires efficient algorithms and sometimes dedicated hardware. Python libraries like NumPy and SciPy are commonly used for data processing.`
  },
  {
    id: 'lesson-2-3',
    title: 'Computer Vision Basics',
    moduleId: 'module-2',
    content: `Computer vision enables robots to understand visual information. Key concepts include image processing (filtering, edge detection, thresholding), feature detection (corners, blobs, lines), object detection and recognition, color tracking, and depth perception. OpenCV is the most popular library for computer vision. Machine learning approaches like CNNs have revolutionized object recognition and detection.`
  },
  {
    id: 'lesson-3-1',
    title: 'Motors and Servo Control',
    moduleId: 'module-3',
    content: `Actuators convert electrical signals into physical motion. DC motors provide continuous rotation and are controlled via PWM. Servo motors provide precise angular positioning. Stepper motors offer precise step-by-step movement. Motor drivers (H-bridge, motor shields) interface between microcontrollers and motors. PID control is commonly used for precise motor control. Understanding torque, speed, and power requirements is essential for motor selection.`
  },
  {
    id: 'lesson-3-2',
    title: 'Kinematics Fundamentals',
    moduleId: 'module-3',
    content: `Kinematics studies motion without considering forces. Forward kinematics calculates end-effector position from joint angles. Inverse kinematics finds joint angles for a desired end-effector position. Denavit-Hartenberg parameters describe robot arm geometry. Transformation matrices represent position and orientation in 3D space. Understanding kinematics is essential for robot arm control and walking robots.`
  },
  {
    id: 'lesson-3-3',
    title: 'Motion Planning',
    moduleId: 'module-3',
    content: `Motion planning finds collision-free paths for robots. Path planning algorithms include A*, Dijkstra, RRT (Rapidly-exploring Random Trees), and potential fields. Trajectory planning adds timing to paths, considering velocity and acceleration limits. Obstacle avoidance uses sensor data to navigate around objects. Motion planning is crucial for autonomous navigation and manipulation tasks.`
  },
  {
    id: 'lesson-4-1',
    title: 'System Integration',
    moduleId: 'module-4',
    content: `System integration combines sensors, actuators, and software into a working robot. Key aspects include architecture design, communication protocols, state machines, error handling, and testing. ROS provides a framework for robot software integration. Modular design allows easier debugging and upgrades. Integration challenges include timing, resource management, and handling edge cases.`
  },
  {
    id: 'lesson-4-2',
    title: 'Capstone Project',
    moduleId: 'module-4',
    content: `The capstone project applies all course concepts to build a complete robot. Project ideas include line-following robot, obstacle-avoiding robot, robotic arm, autonomous drone, or humanoid robot. Steps include requirements definition, design, prototyping, testing, and iteration. Documentation and presentation skills are important for showcasing your work.`
  },
  {
    id: 'lesson-4-3',
    title: 'Advanced Topics and Next Steps',
    moduleId: 'module-4',
    content: `Advanced robotics topics include machine learning for robotics, reinforcement learning, SLAM (Simultaneous Localization and Mapping), humanoid locomotion, soft robotics, and swarm robotics. Career paths include robotics engineer, AI researcher, automation specialist, and drone developer. Continued learning through research papers, competitions (FIRST, RoboCup), and open-source projects is essential for growth.`
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning in Robotics',
    moduleId: 'advanced',
    content: `Machine learning enables robots to learn from data and improve over time. Supervised learning is used for object recognition and classification. Reinforcement learning teaches robots to make decisions through trial and error. Neural networks, especially CNNs and RNNs, are used for perception and control. Transfer learning allows using pre-trained models for robotics applications. Machine learning requires quality training data and significant computational resources.`
  }
];

// Generate embeddings using Cohere
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await fetch('https://api.cohere.ai/v1/embed', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${COHERE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      texts,
      model: 'embed-english-v3.0',
      input_type: 'search_document',
      truncate: 'END',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cohere API error: ${error}`);
  }

  const data = await response.json();
  return data.embeddings;
}

// Create Qdrant collection
async function createCollection(): Promise<void> {
  // Check if collection exists
  const checkResponse = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, {
    headers: {
      'api-key': QDRANT_API_KEY!,
    },
  });

  if (checkResponse.ok) {
    // Collection exists, delete it first
    await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, {
      method: 'DELETE',
      headers: {
        'api-key': QDRANT_API_KEY!,
      },
    });
  }

  // Create new collection
  const createResponse = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}`, {
    method: 'PUT',
    headers: {
      'api-key': QDRANT_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      vectors: {
        size: 1024, // Cohere embed-english-v3.0 dimension
        distance: 'Cosine',
      },
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    throw new Error(`Failed to create collection: ${error}`);
  }
}

// Upsert points to Qdrant
async function upsertPoints(points: any[]): Promise<void> {
  const response = await fetch(`${QDRANT_URL}/collections/${COLLECTION_NAME}/points`, {
    method: 'PUT',
    headers: {
      'api-key': QDRANT_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      points,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upsert points: ${error}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check for required environment variables
  if (!COHERE_API_KEY) {
    return res.status(500).json({ error: 'COHERE_API_KEY not configured' });
  }
  if (!QDRANT_URL) {
    return res.status(500).json({ error: 'QDRANT_URL not configured' });
  }
  if (!QDRANT_API_KEY) {
    return res.status(500).json({ error: 'QDRANT_API_KEY not configured' });
  }

  try {
    // Step 1: Create collection
    await createCollection();

    // Step 2: Generate embeddings for all content
    const texts = courseContent.map(c => `${c.title}\n\n${c.content}`);
    const embeddings = await generateEmbeddings(texts);

    // Step 3: Prepare points for Qdrant
    const points = courseContent.map((content, index) => ({
      id: index + 1,
      vector: embeddings[index],
      payload: {
        lessonId: content.id,
        moduleId: content.moduleId,
        title: content.title,
        content: content.content,
        createdAt: new Date().toISOString(),
      },
    }));

    // Step 4: Upsert points to Qdrant
    await upsertPoints(points);

    return res.status(200).json({
      success: true,
      message: `Successfully indexed ${courseContent.length} documents`,
      collection: COLLECTION_NAME,
      documentsIndexed: courseContent.length,
    });
  } catch (error: any) {
    console.error('Indexing error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to index content',
    });
  }
}
