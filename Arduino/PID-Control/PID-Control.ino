#include "pio_encoder.h"
#include "hardware/timer.h"

const float r = 0.058;  // Wheel radius (m)
const float d = 0.155;   // Distance from wheel center to robot center (m)
const float dt = 0.1;  // Time step (s)

// Initial position of robot
float x = 0.0, y = 0.0, theta = 0.0;
 
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
  float w1 = motorA.getSpeed() * r;
  float w2 = motorB.getSpeed() * r;
  float w3 = motorC.getSpeed() * r;
    
  // Transformation matrix
  float vx = (2.0 / 3.0) * (w1 - 0.5 * (w2 + w3));
  float vy = (sqrt(3) / 3.0) * (w2 - w3);
  float omega = (w1 + w2 + w3) / (3 * d);
    
  // Transform velocity to global frame
  x += (vx * cos(theta) - vy * sin(theta)) * dt;
  y += (vx * sin(theta) + vy * cos(theta)) * dt;
  theta += omega * dt;

  return true;  // Keep repeating
}
 
struct repeating_timer motorTimer;
struct repeating_timer odomTimer;
 
void setup() {
  Serial.begin(9600);
  // while (!Serial)
  //   ;
  motorA.begin();
  motorB.begin();
  motorC.begin();
 
  // Start hardware timer with 20ms interval
  add_repeating_timer_ms(-20, repeatingTimerCallback, NULL, &motorTimer);

  add_repeating_timer_ms(-30, repeatingOdomTimerCallback, NULL, &odomTimer);
}
 
void loop() {
//  motorA.setTargetSpeed(1.0);
//  motorB.setTargetSpeed(0.0);
//  motorC.setTargetSpeed(-1.0);

//  Serial.print("MotorA setpoint: ");
//  Serial.print(motorA.getSetpoint());
//  Serial.print(" MotorA speed: ");
//  Serial.print(motorA.getSpeed());
//  Serial.print(" MotorA encoder: ");
//  Serial.print(motorA.getEncoderCount());
    
  // Print updated position
  Serial.print(x, 3);
  Serial.print(" ");
  Serial.print(y, 3);
  Serial.print(" ");
  Serial.print(theta, 3);
 
  Serial.println();
  // Serial.print("Motor B: ");
  // Serial.println(motorB.getSpeed());
  // Serial.print("Motor C: ");
  // Serial.println(motorC.getSpeed());
  // motorA.setPower(127);
}
