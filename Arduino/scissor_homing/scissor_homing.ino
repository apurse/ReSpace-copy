#include <AccelStepper.h>

#define stepPin 12
#define dirPin 13
#define limitSwitchPin 21
#define motorInterfaceType 1

int switchState;
int ms = 16;

AccelStepper stepper(motorInterfaceType, stepPin, dirPin);

void setup() {
  // put your setup code here, to run once:
  pinMode(limitSwitchPin, INPUT_PULLUP);
  stepper.setMaxSpeed(500*ms);
  stepper.setAcceleration(4000*ms);
  Serial.begin(9600);
  homing();
}

void loop() {
  // put your main code here, to run repeatedly:
  stepper.runToNewPosition(5500*ms);
  delay(2000);
  stepper.runToNewPosition(600*ms);
  delay(2000);
}

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
