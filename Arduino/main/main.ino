#include <AccelStepper.h>

#define STEP    20
#define DIR     21
#define POS     26

#define AIN1    0
#define AIN2    1
#define BIN1    2
#define BIN2    3
#define CIN1    6
#define CIN2    7

#define BEEP    18

AccelStepper stepper(AccelStepper::DRIVER, STEP, DIR);

int motorSpeed = 255;

void setup() {

  Serial.begin(9600);

  pinMode(POS, INPUT);

  pinMode(AIN1, OUTPUT);
  pinMode(AIN2, OUTPUT);
  pinMode(BIN1, OUTPUT);
  pinMode(BIN2, OUTPUT);
  pinMode(CIN1, OUTPUT);
  pinMode(CIN2, OUTPUT);

  HomeScissorLift();

  tone(BEEP, 1000, 40);
  delay(40);
  tone(BEEP, 1500, 40);
  delay(40);
  tone(BEEP, 2000, 40);
  delay(200);
}

void loop() {
  if  (Serial.available() > 0) {
    String msg = Serial.readStringUntil(';')
    StopMotors();
    if (msg == "forward") {
      MoveForward();
    } else if (msg == "backward") {
      MoveBackwards()
    } else if (msg == "up") {
      stepper.runToNewPosition(1200);
    } else if (msg == "down") {
      stepper.runToNewPosition(0);
    } else if (msg == "tleft") {
      
    }
  }
}

void HomeScissorLift() {

  stepper.setMaxSpeed(400);
  stepper.setAcceleration(5000);

  int pos = analogRead(POS);

  while (pos < 1000) {
    pos = analogRead(POS);
    stepper.moveTo(-1000000000);
    stepper.run();
  }

  stepper.setCurrentPosition(0);
  delay(400);
}

void MoveForward() {
  analogWrite(AIN1, motorSpeed);
  analogWrite(AIN2, 0);

  analogWrite(BIN1, motorSpeed);
  analogWrite(BIN2, 0);

  analogWrite(CIN1, motorSpeed);
  analogWrite(CIN2, 0);
}

void MoveBackward() {
  analogWrite(AIN1, 0);
  analogWrite(AIN2, motorSpeed);

  analogWrite(BIN1, 0);
  analogWrite(BIN2, motorSpeed);

  analogWrite(CIN1, 0);
  analogWrite(CIN2, motorSpeed);
}

void TurnLeft() {
  // Turn left by adjusting the motor directions
  analogWrite(AIN1, motorSpeed);
  analogWrite(AIN2, 0);

  analogWrite(BIN1, 0);
  analogWrite(BIN2, motorSpeed);

  analogWrite(CIN1, motorSpeed);
  analogWrite(CIN2, 0);
}

void TurnRight() {
  // Turn right by adjusting the motor directions
  analogWrite(AIN1, 0);
  analogWrite(AIN2, motorSpeed);

  analogWrite(BIN1, motorSpeed);
  analogWrite(BIN2, 0);

  analogWrite(CIN1, 0);
  analogWrite(CIN2, motorSpeed);
}


void StopMotors() {
  analogWrite(AIN1, 0);
  analogWrite(AIN2, 0);

  analogWrite(BIN1, 0);
  analogWrite(BIN2, 0);

  analogWrite(CIN1, 0);
  analogWrite(CIN2, 0);
}
