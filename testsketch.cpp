#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();

#define SERVO_BODY 14  
#define SERVO_GUN  15  

#define SERVO_MIN 102
#define SERVO_MAX 512
#define SERVO_MID ((SERVO_MIN + SERVO_MAX) / 2)

void setup() {
    Serial.begin(115200);
    pwm.begin();
    pwm.setPWMFreq(50);
    delay(10);

    Serial.println("🔧 Servo Test Start");
    pwm.setPWM(SERVO_BODY, 0, SERVO_MID);
    pwm.setPWM(SERVO_GUN, 0, SERVO_MID);
}

void loop() {
    Serial.println("🚀 Beweegt naar links...");
    pwm.setPWM(SERVO_BODY, 0, SERVO_MIN);
    delay(2000);

    Serial.println("🚀 Beweegt naar rechts...");
    pwm.setPWM(SERVO_BODY, 0, SERVO_MAX);
    delay(2000);

    Serial.println("🎯 Kanon naar links...");
    pwm.setPWM(SERVO_GUN, 0, SERVO_MIN);
    delay(2000);

    Serial.println("🎯 Kanon naar rechts...");
    pwm.setPWM(SERVO_GUN, 0, SERVO_MAX);
    delay(2000);

    Serial.println("🏁 Terug naar midden...");
    pwm.setPWM(SERVO_BODY, 0, SERVO_MID);
    pwm.setPWM(SERVO_GUN, 0, SERVO_MID);
    delay(2000);
}
