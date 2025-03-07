#include "pio_encoder.h"
#include "hardware/timer.h"
 
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
  float ticks_per_rev = 620.0*4.0;
 
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
 
struct repeating_timer motorTimer;
 
void setup() {
  Serial.begin(9600);
  // while (!Serial)
  //   ;
  motorA.begin();
  motorB.begin();
  motorC.begin();
 
  // Start hardware timer with 10ms interval
  add_repeating_timer_ms(-20, repeatingTimerCallback, NULL, &motorTimer);
}
 
void loop() {
  motorA.setTargetSpeed(1.0);
  motorB.setTargetSpeed(0.0);
  motorC.setTargetSpeed(-1.0);
  delay(100);
  Serial.print("MotorA setpoint: ");
  Serial.print(motorA.getSetpoint());
  Serial.print(" MotorA speed: ");
  Serial.print(motorA.getSpeed());
  Serial.print(" MotorA encoder: ");
  Serial.print(motorA.getEncoderCount());
 
 
  Serial.println();
  // Serial.print("Motor B: ");
  // Serial.println(motorB.getSpeed());
  // Serial.print("Motor C: ");
  // Serial.println(motorC.getSpeed());
  // motorA.setPower(127);
}
