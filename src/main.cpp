#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();

#define SERVO_1 15  // Servo voor de tank-body
#define SERVO_2 14  // Servo voor het kanon

#define SERVO_MIN 102  // Pulsbreedte voor 0°
#define SERVO_MAX 512  // Pulsbreedte voor 180°

void setup() {
  Serial.begin(115200);
  pwm.begin();
  pwm.setPWMFreq(50);
}

void loop() {
  if (Serial.available()) {
    char command = Serial.read();
    Serial.print("📩 Ontvangen: ");
    Serial.println(command);  // Debug print

    if (command == 'A') {
      pwm.setPWM(SERVO_1, 0, SERVO_MIN);
      Serial.println("🚀 Tank beweegt naar links (A)");
    } else if (command == 'D') {
      pwm.setPWM(SERVO_1, 0, SERVO_MAX);
      Serial.println("🚀 Tank beweegt naar rechts (D)");
    } else if (command == 'L') {
      pwm.setPWM(SERVO_2, 0, SERVO_MIN);
      Serial.println("🎯 Kanon draait naar links (L)");
    } else if (command == 'R') {
      pwm.setPWM(SERVO_2, 0, SERVO_MAX);
      Serial.println("🎯 Kanon draait naar rechts (R)");
    }
  }
}

