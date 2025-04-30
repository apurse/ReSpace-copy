
#include <Adafruit_NeoPixel.h>

#define PIN1 5            // Data pin for first NeoPixel strip
#define NUMPIXELS1 28    // Number of pixels in first strip

#define PIN2 6            // Data pin for second NeoPixel strip
#define NUMPIXELS2 28     // Number of pixels in second strip (change as needed)

#define PIN3 4
#define NUMPIXELS3 30
Adafruit_NeoPixel strip1(NUMPIXELS1, PIN1, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel strip2(NUMPIXELS2, PIN2, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel strip3(NUMPIXELS3, PIN3, NEO_GRB + NEO_KHZ800);


void setup() {
  strip1.begin();  // Initialize first NeoPixel strip
  strip2.begin();  // Initialize second NeoPixel strip
  strip3.begin();  // Initialize Third NeoPixel strip
}


void loop() {
  // Light up strip 1 in green, one by one
  for (int i = 0; i < NUMPIXELS1; i++) {
    strip1.setPixelColor(i, strip1.Color(0, 0, 255));  // Green

    delay(10);


  }

  // Light up strip 2 in blue, one by one
  for (int i = 0; i < NUMPIXELS2; i++) {
    strip2.setPixelColor(i, strip2.Color(255, 0, 0)); // Blue
    


    delay(10);

  }
  
  for (int i = 0; i < NUMPIXELS3; i++) {
    strip3.setPixelColor(i, strip3.Color(0, 255, 0)); // Blue

    delay(10);
  }

  strip1.show();

  strip2.show();



  strip3.show();



  delay(5000);

  // Turn off strip 1
  for (int i = 0; i < NUMPIXELS1; i++) {
    strip1.setPixelColor(i, strip1.Color(0, 0, 0));
  }
  strip1.show();

  // Turn off strip 2
  for (int i = 0; i < NUMPIXELS2; i++) {
    strip2.setPixelColor(i, strip2.Color(0, 0, 0));
  }
  strip2.show();

  // Turn off strip 2
  for (int i = 0; i < NUMPIXELS3; i++) {
    strip3.setPixelColor(i, strip3.Color(0, 0, 0));
  }
  strip3.show();

  delay(1000);
}
