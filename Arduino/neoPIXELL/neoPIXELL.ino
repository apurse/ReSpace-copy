#include <Adafruit_NeoPixel.h>

#define PIN1 14
#define NUMPIXELS1 28

#define PIN2 15
#define NUMPIXELS2 28

#define PIN3 16
#define NUMPIXELS3 27

Adafruit_NeoPixel strip1(NUMPIXELS1, PIN1, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel strip2(NUMPIXELS2, PIN2, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel strip3(NUMPIXELS3, PIN3, NEO_GRB + NEO_KHZ800);


// Move these function DEFINITIONS above loop()
void turnOffAllStrips(int wait = 0) {
  for (int i = 0; i < NUMPIXELS1; i++) strip1.setPixelColor(i, 0);
  for (int i = 0; i < NUMPIXELS2; i++) strip2.setPixelColor(i, 0);
  for (int i = 0; i < NUMPIXELS3; i++) strip3.setPixelColor(i, 0);

  strip1.show();
  strip2.show();
  strip3.show();

  if (wait > 0) delay(wait);
}

void redYellowChase(int cycles, int delayTime) {
  strip1.setBrightness(75);
  strip2.setBrightness(75);
  strip3.setBrightness(75);
  for (int offset = 0; offset < NUMPIXELS1 + cycles; offset++) {
    for (int i = 0; i < NUMPIXELS1; i++) {
      uint32_t color = ((i + offset) % 2 == 0) ? strip1.Color(255, 0, 0) : strip1.Color(255, 255, 0);
      strip1.setPixelColor(i, color);
    }
    for (int i = 0; i < NUMPIXELS2; i++) {
      uint32_t color = ((i + offset) % 2 == 0) ? strip2.Color(255, 0, 0) : strip2.Color(255, 255, 0);
      strip2.setPixelColor(i, color);
    }
    for (int i = 0; i < NUMPIXELS3; i++) {
      uint32_t color = ((i + offset) % 2 == 0) ? strip3.Color(255, 0, 0) : strip3.Color(255, 255, 0);
      strip3.setPixelColor(i, color);
    }
    strip1.show();
    strip2.show();
    strip3.show();
    delay(delayTime);
  }
}
void pulsatingGreen(int cycles = 3, int delayTime = 10) {
  for (int c = 0; c < cycles; c++) {
    // Fade in
    for (int brightness = 0; brightness <= 255; brightness++) {
      uint32_t color = strip1.Color(0, brightness, 0);  // Green with variable brightness
      for (int i = 0; i < NUMPIXELS1; i++) strip1.setPixelColor(i, color);
      for (int i = 0; i < NUMPIXELS2; i++) strip2.setPixelColor(i, color);
      for (int i = 0; i < NUMPIXELS3; i++) strip3.setPixelColor(i, color);
      strip1.show();
      strip2.show();
      strip3.show();
      delay(delayTime);
    }

    // Fade out
    for (int brightness = 255; brightness >= 0; brightness--) {
      uint32_t color = strip1.Color(0, brightness, 0);
      for (int i = 0; i < NUMPIXELS1; i++) strip1.setPixelColor(i, color);
      for (int i = 0; i < NUMPIXELS2; i++) strip2.setPixelColor(i, color);
      for (int i = 0; i < NUMPIXELS3; i++) strip3.setPixelColor(i, color);
      strip1.show();
      strip2.show();
      strip3.show();
      delay(delayTime);
    }
  }
}

//Blue and white operation
void blueWhiteChase(int cycles, int delayTime) {
  strip1.setBrightness(75);
  strip2.setBrightness(75);
  strip3.setBrightness(75);
  for (int offset = 0; offset < cycles; offset++) {
    for (int i = 0; i < NUMPIXELS1; i++) {
      uint32_t color = ((i + offset) % 2 == 0) ? strip1.Color(0, 0, 255) : strip1.Color(255, 255, 255);  // Blue or White
      strip1.setPixelColor(i, color);
    }
    for (int i = 0; i < NUMPIXELS2; i++) {
      uint32_t color = ((i + offset) % 2 == 0) ? strip2.Color(0, 0, 255) : strip2.Color(255, 255, 255);
      strip2.setPixelColor(i, color);
    }
    for (int i = 0; i < NUMPIXELS3; i++) {
      uint32_t color = ((i + offset) % 2 == 0) ? strip3.Color(0, 0, 255) : strip3.Color(255, 255, 255);
      strip3.setPixelColor(i, color);
    }

    strip1.show();
    strip2.show();
    strip3.show();
    delay(delayTime);
  }
}


void flashAllRed(int flashes = 3, int delayTime = 300) {
  for (int i = 0; i < flashes; i++) {
    // Turn all pixels red
    for (int j = 0; j < NUMPIXELS1; j++) strip1.setPixelColor(j, strip1.Color(255, 0, 0));
    for (int j = 0; j < NUMPIXELS2; j++) strip2.setPixelColor(j, strip2.Color(255, 0, 0));
    for (int j = 0; j < NUMPIXELS3; j++) strip3.setPixelColor(j, strip3.Color(255, 0, 0));
    strip1.show();
    strip2.show();
    strip3.show();

    delay(delayTime);

    // Turn all pixels off
    for (int j = 0; j < NUMPIXELS1; j++) strip1.setPixelColor(j, 0);
    for (int j = 0; j < NUMPIXELS2; j++) strip2.setPixelColor(j, 0);
    for (int j = 0; j < NUMPIXELS3; j++) strip3.setPixelColor(j, 0);
    strip1.show();
    strip2.show();
    strip3.show();

    delay(delayTime);
  }
}

void greenCircularChaseMultiple(int delayTime, int cycles, int trailLength = 3) {
  int totalPixels = NUMPIXELS1 + NUMPIXELS2 + NUMPIXELS3;

  for (int c = 0; c < cycles; c++) {
    for (int head = 0; head < totalPixels; head++) {
      turnOffAllStrips();

      // Light up the "trail" of green LEDs
      for (int t = 0; t < trailLength; t++) {
        int pos = (head - t + totalPixels) % totalPixels;

        if (pos < NUMPIXELS1) {
          strip1.setPixelColor(pos, strip1.Color(0, 255, 0));
        } else if (pos < NUMPIXELS1 + NUMPIXELS2) {
          strip2.setPixelColor(pos - NUMPIXELS1, strip2.Color(0, 255, 0));
        } else {
          strip3.setPixelColor(pos - NUMPIXELS1 - NUMPIXELS2, strip3.Color(0, 255, 0));
        }
      }

      strip1.show();
      strip2.show();
      strip3.show();

      delay(delayTime);
    }
  }
}



void setup() {
  strip1.begin();
  strip2.begin();
  strip3.begin();

  strip1.show();
  strip2.show();
  strip3.show();
}

void loop() {
 
  //redYellowChase(60, 100);
  //flashAllRed(3,250);
  //delay(1000);
  //blueWhiteChase(60, 100);
  //delay(1000);
  //pulsatingGreen(3,15);
  //delay(1000);
  //turnOffAllStrips(1000);
  //blueWhiteChase(10,10);
  greenCircularChaseMultiple(25,10,10);
}