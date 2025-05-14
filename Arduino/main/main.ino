#include "pio_encoder.h"
#include "hardware/timer.h"
#include <AccelStepper.h>

#define stepPin 12
#define dirPin 13
#define limitSwitchPin 21
#define motorInterfaceType 1

AccelStepper stepper(motorInterfaceType, stepPin, dirPin);

int switchState;
int ms = 16;
const float r = 0.029;  // Wheel radius (m)
const float circ = 3.14 * 2 * r;  // Wheel circum (m)
const float d = 0.155;   // Distance from wheel center to robot center (m)
const float dt = 0.1;  // Time step (s)
String transmission;

// Initial position of robot
float x = 0.0, y = 0.0, theta = 0.0, vx = 0.0, vy = 0.0, omega = 0.0;

// Initial HZ of motors
float HZ1 = 0.0, HZ2 = 0.0, HZ3 = 0.0;

// Motor class with encoder
class Motor {
  private:
    int motorPin1, motorPin2;
    PioEncoder encoder;
    int previousEncoder;
    float Kp, Ki, Kd;
    float previousError, integral;
    float targetSpeed, currentSpeed;
    float previousTime;
    float ticks_per_rev = 2480;

  public:
    Motor(int m1, int m2, int e1, float kp, float ki, float kd)
      : motorPin1(m1), motorPin2(m2), encoder(e1), Kp(kp), Ki(ki), Kd(kd), previousError(0), integral(0), targetSpeed(0) {}

    void begin() {
      pinMode(motorPin1, OUTPUT);
      pinMode(motorPin2, OUTPUT);
      encoder.begin();
      previousTime = millis();
      currentSpeed = 0.0;
      previousEncoder = 0;
    }

    void setTargetSpeed(float speed) {
      targetSpeed = speed;
    }

    void setPower(float power) {
      int pwmPower = constrain(abs(power) * 255, 0, 255);
      if (power >= 0) {
        analogWrite(motorPin1, pwmPower);
        analogWrite(motorPin2, 0);
      } else {
        analogWrite(motorPin1, 0);
        analogWrite(motorPin2, pwmPower);
      }
    }

    void pidControl() {
      unsigned long timeNow = micros();                              // Use micros() for more precise timing
      float deltaTime = (timeNow - this->previousTime) / 1000000.0;  // Convert microseconds to seconds
      long currentEncoder = getEncoderCount();

      // Calculate speed in counts per second (or other suitable units)
      this->currentSpeed = (currentEncoder - this->previousEncoder) / (deltaTime * this->ticks_per_rev);

      float error = this->targetSpeed - this->currentSpeed;
      integral += error * deltaTime;
      float derivative = (error - this->previousError) / deltaTime;
      float output = Kp * error + Ki * integral + Kd * derivative;
      integral = integral * 0.99; // leaky eeky integral
      setPower(output);

      this->previousError = error;
      this->previousTime = timeNow;
      this->previousEncoder = currentEncoder;
    }

    long getEncoderCount() {
      return encoder.getCount();
    }
    float getSpeed() {
      return this->currentSpeed;
    }
    float getSetpoint() {
      return this->targetSpeed;
    }
};

// Instantiate motor objects
Motor motorA(0, 1, 10, 1.0, 0.05, 0.00);
Motor motorB(2, 3, 12, 1.0, 0.05, 0.00);
Motor motorC(6, 7, 14, 1.0, 0.05, 0.00);

// Timer callback function
bool repeatingTimerCallback(struct repeating_timer *t) {
  motorA.pidControl();
  motorB.pidControl();
  motorC.pidControl();
  return true;  // Keep repeating
}

bool repeatingOdomTimerCallback(struct repeating_timer *t) {
  // Update odometry
  // Get wheel speeds
  float w1 = motorB.getSpeed() * r;
  float w2 = motorC.getSpeed() * r;
  float w3 = motorA.getSpeed() * r;

  // Transformation matrix based on derived equations
  float F[3][3] = {
    {0, -1.0 / sqrt(3), 1.0 / sqrt(3)},
    {1.0, -0.5, -0.5},
    { -1.0 / (3 * d), -1.0 / (3 * d), -1.0 / (3 * d)}
  };

  // Compute velocity in robot frame
  vx = F[0][0] * w1 + F[0][1] * w2 + F[0][2] * w3;
  vy = F[1][0] * w1 + F[1][1] * w2 + F[1][2] * w3;
  omega = F[2][0] * w1 + F[2][1] * w2 + F[2][2] * w3;

  // Transform velocity to global frame
  x += (vx * cos(theta) - vy * sin(theta)) * dt;
  y += (vx * sin(theta) + vy * cos(theta)) * dt;
  theta += omega * dt;

  return true;  // Keep repeating
}

void calculateHZ(float VX, float VY, float WZ) {

  float w1 = (VY + d * WZ);
  float w2 = ((-sqrt(3) / 2.0) * VX - 0.5 * VY + d * WZ);
  float w3 = ((sqrt(3) / 2.0) * VX - 0.5 * VY + d * WZ);
  Serial.println(-w1);
  Serial.println(-w2);
  Serial.println(-w3);

  HZ1 = w1 / circ;
  HZ2 = w2 / circ;
  HZ3 = w3 / circ;
}

struct repeating_timer motorTimer;
struct repeating_timer odomTimer;

void setup() {
  Serial.begin(115200);
  motorA.begin();
  motorB.begin();
  motorC.begin();

  pinMode(limitSwitchPin, INPUT_PULLUP);
  stepper.setMaxSpeed(500*ms);
  stepper.setAcceleration(4000*ms);

  homing();
  
  // Start hardware timer with 20ms interval
  add_repeating_timer_ms(-20, repeatingTimerCallback, NULL, &motorTimer);

  add_repeating_timer_ms(-50, repeatingOdomTimerCallback, NULL, &odomTimer);
}

void loop() {
  // Print updated position
  Serial.print(x*2.86, 3);
  Serial.print(",");
  Serial.print(y*2.86, 3);
  Serial.print(",");
  Serial.print(theta*3.1, 3);
  Serial.print(",");
  Serial.print(vx, 3);
  Serial.print(",");
  Serial.print(vy, 3);
  Serial.print(",");
  Serial.print(omega, 3);
  Serial.println();
  delay(50);

  if (Serial.available() > 0) {
    // Read until doesn't wait a specific amount of time so doesn't cause delay
    transmission = Serial.readStringUntil('\n');
    if (transmission == "R") {
      // Reset odom when ROS spins up
      x = 0.0;
      y = 0.0;
      theta = 0.0;
      // Reset motor speed
      motorA.setTargetSpeed(0);
      motorB.setTargetSpeed(0);
      motorC.setTargetSpeed(0);
    } else if (transmission == "S1") {
      // Segment 1: Use Motor B and C
      motorA.setTargetSpeed(0);
      motorB.setTargetSpeed(0.5);
      motorC.setTargetSpeed(-0.5);
    } else if (transmission == "S2") {
      // Segment 2: Use Motor A and C
      motorA.setTargetSpeed(0.2);
      motorB.setTargetSpeed(0);
      motorC.setTargetSpeed(0.5);
    } else if (transmission == "S3") {
      // Segment 3: Use Motor A and B
      motorA.setTargetSpeed(0.2);
      motorB.setTargetSpeed(-0.5);
      motorC.setTargetSpeed(0);
    } else if (transmission == "S4") {
      motorA.setTargetSpeed(0);
      motorB.setTargetSpeed(0);
      motorC.setTargetSpeed(0);
    } else if (transmission == "UP") {
      stepper.runToNewPosition(5500*ms);
    } else if (transmission == "DOWN") {
      stepper.runToNewPosition(600*ms);
    } else  {
      // Format data
      // Remove brackets
      transmission.remove(0, 1);
      transmission.remove(transmission.length() - 1);

      // Split by commas
      int comma1 = transmission.indexOf(',');
      int comma2 = transmission.indexOf(',', comma1 + 1);

      float val1 = transmission.substring(0, comma1).toFloat();
      float val2 = transmission.substring(comma1 + 1, comma2).toFloat();
      float val3 = transmission.substring(comma2 + 1).toFloat();

      // calculate rpm values for wheels
      // add boundaries for the calculation
      if (val1 <= 3.2 && val1 >= -3.2 &&
          val2 <= 3.2 && val2 >= -3.2 &&
          val3 <= 3.2 && val3 >= -3.2) {
        calculateHZ(val1, val2, val3);
        Serial.println(HZ1);
        Serial.println(HZ2);
        Serial.println(HZ3);
        motorA.setTargetSpeed(HZ3*1.7);
        motorB.setTargetSpeed(HZ1*1.7);
        motorC.setTargetSpeed(HZ2*1.7);
      }
    }
  }
}

///////////////////////////////LIFT//////////////////////

void homing() {
  switchState = digitalRead(limitSwitchPin);
  while (switchState != 1) {
    switchState = digitalRead(limitSwitchPin);
    Serial.println("homing");
    stepper.moveTo(-100000000);
    stepper.run();
  }
  Serial.println("homed");
  stepper.setCurrentPosition(0);
  stepper.runToNewPosition(200*ms);
  stepper.runToNewPosition(0);
  stepper.runToNewPosition(200*ms);
  stepper.runToNewPosition(0);
}
