#include <AccelStepper.h>

const int stepXPin = 20; //X.STEP
const int dirXPin = 21; // X.DIR
const int posPin = 26;
int pos = 0;


AccelStepper stepper(AccelStepper::DRIVER, stepXPin, dirXPin);

void setup()
{  
   Serial.begin(9600);
   stepper.setMaxSpeed(1000);
}

void up() {
  while (pos > 100) {
    pos = analogRead(posPin);
    Serial.println("up");
    stepper.setSpeed(500);
    stepper.runSpeed();
  } 
}

void down() {
  while (pos < 900) {
    pos = analogRead(posPin);
    Serial.println("down");
    stepper.setSpeed(-800);
    stepper.runSpeed();
  }
}

void loop() {
  pos = analogRead(posPin);
  up();
  down();
}
