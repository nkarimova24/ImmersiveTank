#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();

#define SERVO_1 14  // Servo voor de tank-body
#define SERVO_2 15  // Servo voor het kanon
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
    
    Serial.print("Received: ");
    Serial.println(command);
    
    if (command == 'E') {  //body right
      pwm.setPWM(SERVO_1, 0, SERVO_MAX);
    } else if (command == 'D') {  //body left
      pwm.setPWM(SERVO_1, 0, SERVO_MIN);
    } else if (command == 'J') {  // cannon left
      pwm.setPWM(SERVO_2, 0, SERVO_MIN);
    } else if (command == 'L') {  // cannon right
      pwm.setPWM(SERVO_2, 0, SERVO_MAX);
    }
  }
}
