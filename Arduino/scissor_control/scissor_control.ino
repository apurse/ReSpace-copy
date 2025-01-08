#include <AccelStepper.h>

const int enPin=8;
const int stepXPin = 2; //X.STEP
const int dirXPin = 5; // X.DIR
const int posPin = A0;
int pos = 0;


AccelStepper stepper(AccelStepper::DRIVER, stepXPin, dirXPin);

void setup()
{  
   Serial.begin(9600);
   pinMode(enPin, OUTPUT);
   digitalWrite(enPin, LOW); // Enable the stepper driver
   stepper.setMaxSpeed(1000);
}

void loop() {
  pos = analogRead(posPin);
  while (pos > 70) {
    pos = analogRead(posPin);
    Serial.println(pos);
    stepper.setSpeed(-800);
    stepper.runSpeed();
  } 
  while (pos < 950) {
    pos = analogRead(posPin);
    Serial.println(pos);
    stepper.setSpeed(800);
    stepper.runSpeed();
  }
}
