// Pin assignments for motors (adjust these pins)
const int motor1Pin1 = 3;  // Motor 1 forward
const int motor1Pin2 = 4;  // Motor 1 backward

const int motor2Pin1 = 5;  // Motor 2 forward
const int motor2Pin2 = 6;  // Motor 2 backward

const int motor3Pin1 = 9;  // Motor 3 forward
const int motor3Pin2 = 10; // Motor 3 backward

// Speed variable
int speed = 255;  // Full speed (255 is max PWM)

// Setup function to initialize motor pins
void setup() {
  // Set motor pins as outputs
  pinMode(motor1Pin1, OUTPUT);
  pinMode(motor1Pin2, OUTPUT);
  
  pinMode(motor2Pin1, OUTPUT);
  pinMode(motor2Pin2, OUTPUT);
  
  pinMode(motor3Pin1, OUTPUT);
  pinMode(motor3Pin2, OUTPUT);
}

// Function to move the robot forward
void moveForward() {
  // Forward direction for all motors
  analogWrite(motor1Pin1, speed);
  analogWrite(motor1Pin2, 0);

  analogWrite(motor2Pin1, speed);
  analogWrite(motor2Pin2, 0);

  analogWrite(motor3Pin1, speed);
  analogWrite(motor3Pin2, 0);
}

// Function to move the robot backward
void moveBackward() {
  // Reverse direction for all motors
  analogWrite(motor1Pin1, 0);
  analogWrite(motor1Pin2, speed);

  analogWrite(motor2Pin1, 0);
  analogWrite(motor2Pin2, speed);

  analogWrite(motor3Pin1, 0);
  analogWrite(motor3Pin2, speed);
}

// Function to move the robot left
void moveLeft() {
  // Left direction for motors
  analogWrite(motor1Pin1, 0);
  analogWrite(motor1Pin2, speed);

  analogWrite(motor2Pin1, 0);
  analogWrite(motor2Pin2, speed);

  analogWrite(motor3Pin1, speed);
  analogWrite(motor3Pin2, 0);
}

// Function to move the robot right
void moveRight() {
  // Right direction for motors
  analogWrite(motor1Pin1, speed);
  analogWrite(motor1Pin2, 0);

  analogWrite(motor2Pin1, speed);
  analogWrite(motor2Pin2, 0);

  analogWrite(motor3Pin1, 0);
  analogWrite(motor3Pin2, speed);
}

// Function to turn the robot
void turnLeft() {
  // Turn left by adjusting the motor directions
  analogWrite(motor1Pin1, speed);
  analogWrite(motor1Pin2, 0);

  analogWrite(motor2Pin1, 0);
  analogWrite(motor2Pin2, speed);

  analogWrite(motor3Pin1, speed);
  analogWrite(motor3Pin2, 0);
}

void turnRight() {
  // Turn right by adjusting the motor directions
  analogWrite(motor1Pin1, 0);
  analogWrite(motor1Pin2, speed);

  analogWrite(motor2Pin1, speed);
  analogWrite(motor2Pin2, 0);

  analogWrite(motor3Pin1, 0);
  analogWrite(motor3Pin2, speed);
}

void stopMotors() {
  // Stop all motors
  analogWrite(motor1Pin1, 0);
  analogWrite(motor1Pin2, 0);

  analogWrite(motor2Pin1, 0);
  analogWrite(motor2Pin2, 0);

  analogWrite(motor3Pin1, 0);
  analogWrite(motor3Pin2, 0);
}

void loop() {
  // Test each movement function
  moveForward();
  delay(2000);  // Move forward for 2 seconds

  stopMotors();
  delay(1000);  // Stop for 1 second

  moveBackward();
  delay(2000);  // Move backward for 2 seconds

  stopMotors();
  delay(1000);  // Stop for 1 second

  moveLeft();
  delay(2000);  // Move left for 2 seconds

  stopMotors();
  delay(1000);  // Stop for 1 second

  moveRight();
  delay(2000);  // Move right for 2 seconds

  stopMotors();
  delay(1000);  // Stop for 1 second

  turnLeft();
  delay(2000);  // Turn left for 2 seconds

  stopMotors();
  delay(1000);  // Stop for 1 second

  turnRight();
  delay(2000);  // Turn right for 2 seconds

  stopMotors();
  delay(1000);  // Stop for 1 second
}

