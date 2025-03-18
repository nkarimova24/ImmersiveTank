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
    Serial.print("📡 Ontvangen: ");
    Serial.println(command);

    if (command == 'A') {  // Beweeg tank-body links
      pwm.setPWM(SERVO_1, 0, SERVO_MIN);
    } else if (command == 'D') {  // Beweeg tank-body rechts
      pwm.setPWM(SERVO_1, 0, SERVO_MAX);
    } else if (command == 'L') {  // Draai kanon naar links
      pwm.setPWM(SERVO_2, 0, SERVO_MIN);
    } else if (command == 'R') {  // Draai kanon naar rechts
      pwm.setPWM(SERVO_2, 0, SERVO_MAX);
    } else if (command == 'M') {  // Stop de tank-body
      pwm.setPWM(SERVO_1, 0, (SERVO_MIN + SERVO_MAX) / 2);
    }
  }
}
