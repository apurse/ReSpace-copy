#include <Guppy.h>
#include <ArduinoJson.h>

Guppy guppy;

uint8_t addresses[][6] = { "00001", "00002" };

char transmission[256];

JsonDocument doc;

void setup() {
  Serial.begin(9600);
  guppy.begin();
  guppy.initRadio();
  guppy.startBackgroundServices();

  //will contain the positions the tables are in and where to move them
  JsonArray data = doc["positions"].to<JsonArray>();
  data.add(1);
  data.add(3);
  data.add(6);
  data.add(10);
  
}

void loop() {
  serializeJson(doc, transmission);
  Serial.println();
  
  guppy.lightOn();
  for (int i = 0; i < 2; i++) {
    guppy.send(transmission, addresses[i]);
  }
  delay(200);

  guppy.lightOff();
  for (int i = 0; i < 2; i++) {
    guppy.send(transmission, addresses[i]);
  }
  delay(200);
}
