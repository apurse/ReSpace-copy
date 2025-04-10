#include <AccelStepper.h>

#define STEP    11
#define DIR     9
#define POS     A0

#define AIN1    0
#define AIN2    1
#define BIN1    2
#define BIN2    3
#define CIN1    6
#define CIN2    7

#define BEEP    18

AccelStepper stepper(AccelStepper::DRIVER, STEP, DIR);

int motorSpeed = 100;

void setup() {
  Serial.begin(115200);

  pinMode(POS, INPUT);

  pinMode(AIN1, OUTPUT);
  pinMode(AIN2, OUTPUT);
  pinMode(BIN1, OUTPUT);
  pinMode(BIN2, OUTPUT);
  pinMode(CIN1, OUTPUT);
  pinMode(CIN2, OUTPUT);
  stepper.setMaxSpeed(1000);
  stepper.setAcceleration(5000);
  
  tone(BEEP, 1000, 40);
  delay(40);
  tone(BEEP, 1500, 40);
  delay(40);
  tone(BEEP, 2000, 40);
  delay(200);
}

void loop() {
  if (Serial.available() > 0) {
    String msg = Serial.readStringUntil('\n');
    StopMotors();  // Stop motors before any new action

    // Process the incoming message (segment number)
    if (msg == "1") {
      Segment1();
    } else if (msg == "2") {
      Segment2();
    } else if (msg == "3") {
      Segment3();
    } else if (msg == "4") {
      StopMotors();  // Stop all motors for segment 4
    }
  }
}

void Segment1() {
  // Segment 1: Use Motor B and C
  analogWrite(AIN1, 0);
  analogWrite(AIN2, 0);

  analogWrite(BIN1, motorSpeed);
  analogWrite(BIN2, 0);

  analogWrite(CIN1, 0);
  analogWrite(CIN2, motorSpeed);
}

void Segment2() {
  // Segment 2: Use Motor A and C
  analogWrite(AIN1, 0);
  analogWrite(AIN2, motorSpeed);

  analogWrite(BIN1, 0);
  analogWrite(BIN2, 0);

  analogWrite(CIN1, motorSpeed);
  analogWrite(CIN2, 0);
}

void Segment3() {
  // Segment 3: Use Motor A and B
  analogWrite(AIN1, motorSpeed);
  analogWrite(AIN2, 0);

  analogWrite(BIN1, 0);
  analogWrite(BIN2, motorSpeed);

  analogWrite(CIN1, 0);
  analogWrite(CIN2, 0);
}

void StopMotors() {
  analogWrite(AIN1, 0);
  analogWrite(AIN2, 0);

  analogWrite(BIN1, 0);
  analogWrite(BIN2, 0);

  analogWrite(CIN1, 0);
  analogWrite(CIN2, 0);
}






