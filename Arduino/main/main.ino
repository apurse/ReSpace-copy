#include "pio_encoder.h"
#include "hardware/timer.h"
#include <AccelStepper.h>

int motorSpeed = 100;

#define stepPin 11
#define dirPin 9
#define switchPin1 7
#define switchPin2 8 
#define motorInterfaceType 1

AccelStepper stepper(motorInterfaceType, stepPin, dirPin);



const float r = 0.029;  // Wheel radius (m)
const float d = 0.155;   // Distance from wheel center to robot center (m)
const float dt = 0.1;  // Time step (s)
String transmission;

// Initial position of robot
float x = 0.0, y = 0.0, theta = 0.0, vx = 0.0, vy = 0.0, omega = 0.0;

// Initial rpm of motors
float rpm1 = 0.0, rpm2 = 0.0, rpm3 = 0.0;

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

  // Transformation matrix
  vx = (2.0 / 3.0) * (w1 - 0.5 * (w2 + w3));
  vy = (sqrt(3) / 3.0) * (w2 - w3);
  omega = (w1 + w2 + w3) / (3 * d);

  // Transform velocity to global frame
  x += (vx * sin(theta) + vy * cos(theta)) * dt;
  y += (vx * cos(theta) - vy * sin(theta)) * dt;
  theta += omega * dt;

  return true;  // Keep repeating
}

void calculateRPM(float VX, float VY, float WZ) {

  float w1 = (VY + d * WZ) / r;
  float w2 = ((-sqrt(3) / 2.0) * VX - 0.5 * VY + d * WZ) / r;
  float w3 = ((sqrt(3) / 2.0) * VX - 0.5 * VY + d * WZ) / r;

  rpm1 = w1 * 60.0 / (2.0 * PI);
  rpm2 = w2 * 60.0 / (2.0 * PI);
  rpm3 = w3 * 60.0 / (2.0 * PI);

  Serial.print(-rpm3);
  Serial.print(-rpm1);
  Serial.print(-rpm2);
  Serial.println(' ');
}

struct repeating_timer motorTimer;
struct repeating_timer odomTimer;

//void Segment1() {
//  // Segment 1: Use Motor B and C
//  analogWrite(AIN1, 0);
//  analogWrite(AIN2, 0);
//
//  analogWrite(BIN1, motorSpeed);
//  analogWrite(BIN2, 0);
//
//  analogWrite(CIN1, 0);
//  analogWrite(CIN2, motorSpeed);
//}
//
//void Segment2() {
//  // Segment 2: Use Motor A and C
//  analogWrite(AIN1, 0);
//  analogWrite(AIN2, motorSpeed);
//
//  analogWrite(BIN1, 0);
//  analogWrite(BIN2, 0);
//
//  analogWrite(CIN1, motorSpeed);
//  analogWrite(CIN2, 0);
//}
//
//void Segment3() {
//  // Segment 3: Use Motor A and B
//  analogWrite(AIN1, motorSpeed);
//  analogWrite(AIN2, 0);
//
//  analogWrite(BIN1, 0);
//  analogWrite(BIN2, motorSpeed);
//
//  analogWrite(CIN1, 0);
//  analogWrite(CIN2, 0);
//}
//
//void StopMotors() {
//  analogWrite(AIN1, 0);
//  analogWrite(AIN2, 0);
//
//  analogWrite(BIN1, 0);
//  analogWrite(BIN2, 0);
//
//  analogWrite(CIN1, 0);
//  analogWrite(CIN2, 0);
//}

void setup() {
  Serial.begin(115200);
  motorA.begin();
  motorB.begin();
  motorC.begin();


  pinMode(switchPin1, INPUT_PULLUP); 
  pinMode(switchPin2, INPUT_PULLUP);

  stepper.setMaxSpeed(1000);
  stepper.setAcceleration(5000);

  // Start hardware timer with 20ms interval
  add_repeating_timer_ms(-20, repeatingTimerCallback, NULL, &motorTimer);

  add_repeating_timer_ms(-50, repeatingOdomTimerCallback, NULL, &odomTimer);
}

void loop() {
  // Print updated position
  Serial.print(x, 3);
  Serial.print(",");
  Serial.print(y, 3);
  Serial.print(",");
  Serial.print(theta, 3);
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
    } else if (transmission == "ActateUP") {
      homeForward();

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

      Serial.println(val1);
      Serial.println(val2);
      Serial.println(val3);

      // calculate rpm values for wheels
      // add boundaries for the calculation
      if (val1 <= 1.0 && val1 >= -1.0 &&
          val2 <= 1.0 && val2 >= -1.0 &&
          val3 <= 1.0 && val3 >= -1.0) {
        calculateRPM(val1, val2, val3);
        //set wheel rpms
        rpm1 = map(rpm1, -285.17, 285.17, -1.0, 1.0);
        rpm2 = map(rpm2, -285.17, 285.17, -1.0, 1.0);
        rpm3 = map(rpm3, -285.17, 285.17, -1.0, 1.0);
        Serial.println(rpm1);
        Serial.println(rpm2);
        Serial.println(rpm3);
        motorA.setTargetSpeed(-rpm3);
        motorB.setTargetSpeed(-rpm1);
        motorC.setTargetSpeed(-rpm2);
      }
    }
  }
}






///////////////////////////////LIFT//////////////////////

void homeForward() {
  // Command a large forward move
  stepper.moveTo(100000);       

  while (digitalRead(switchPin1) == HIGH) {
    stepper.run();               
  }
  Serial.println("stopping stepper");
  stepper.stop();
  stepper.setCurrentPosition(0);                
  Serial.println("Homing forward complete.");
}

void homeBackward() {
  // Command a large backward move
  stepper.moveTo(-100000);       
  // Run until switch 2 is pressed
  while (digitalRead(switchPin2) == HIGH) {
    stepper.run();               
  }
  stepper.stop();
  stepper.setCurrentPosition(0);                
  Serial.println("Homing backward complete.");
}
