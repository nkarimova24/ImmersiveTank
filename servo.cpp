//kopieer en plak de inhoud in de Arduino IDE en upload het naar je Arduino :)


#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();

#define SERVO_1 14  //tank body
#define SERVO_2 15  //kanon
#define SERVO_MIN 102 
#define SERVO_MAX 512  
#define SERVO_MID 307  

int currentPos1 = SERVO_MID;
int currentPos2 = SERVO_MID;

int targetPos1 = SERVO_MID;
int targetPos2 = SERVO_MID;


const int MOVE_STEP = 3;

unsigned long lastUpdateTime = 0;
const int UPDATE_INTERVAL = 10;  

void setup() {
  Serial.begin(115200);
  pwm.begin();
  pwm.setPWMFreq(50);  
  
  resetServos();
  Serial.println("Arduino initialized, servos at center position");
}

void loop() {

    if (Serial.available()) {

    String command = Serial.readStringUntil('\n');
    command.trim();  
    
    Serial.print("Received command: ");
    Serial.println(command);
    
    if (command.startsWith("POS:")) {

        int firstColon = command.indexOf(':');
      int secondColon = command.indexOf(':', firstColon + 1);
      
      if (firstColon != -1 && secondColon != -1) {
        String tankXStr = command.substring(firstColon + 1, secondColon);
        String gunAngleStr = command.substring(secondColon + 1);
        
        int tankX = tankXStr.toInt();
        int gunAngle = gunAngleStr.toInt();
        
        targetPos1 = map(tankX, 0, 180, SERVO_MAX, SERVO_MIN); 
        targetPos2 = map(gunAngle, 0, 180, SERVO_MAX, SERVO_MIN); 
        
        Serial.print("Tank X: ");
        Serial.print(tankX);
        Serial.print(", Gun Angle: ");
        Serial.println(gunAngle);
      }
    } else if (command == "RESET") {
      resetServos();
      Serial.println("Resetting servos to center position");
    }
  }
  
  updateServoPositions();
}

void updateServoPositions() {

    unsigned long currentTime = millis();
  if (currentTime - lastUpdateTime < UPDATE_INTERVAL) {
    return;  
  }
  

  lastUpdateTime = currentTime;
  
  // Update servo 1 position
  if (currentPos1 < targetPos1) {
    currentPos1 = min(currentPos1 + MOVE_STEP, targetPos1);
    pwm.setPWM(SERVO_1, 0, currentPos1);
  } else if (currentPos1 > targetPos1) {
    currentPos1 = max(currentPos1 - MOVE_STEP, targetPos1);
    pwm.setPWM(SERVO_1, 0, currentPos1);
  }
  
  //update servo 2 position
  if (currentPos2 < targetPos2) {
    currentPos2 = min(currentPos2 + MOVE_STEP, targetPos2);
    pwm.setPWM(SERVO_2, 0, currentPos2);
  } else if (currentPos2 > targetPos2) {
    currentPos2 = max(currentPos2 - MOVE_STEP, targetPos2);
    pwm.setPWM(SERVO_2, 0, currentPos2);
  }
}

//function to reset both servos to center position
void resetServos() {

  targetPos1 = SERVO_MID;
  targetPos2 = SERVO_MID;
}