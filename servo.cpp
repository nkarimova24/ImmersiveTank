#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver();

#define SERVO_1 14  // Servo for tank body
#define SERVO_2 15  // Servo for cannon
#define SERVO_MIN 102  // Pulse width for 0°
#define SERVO_MAX 512  // Pulse width for 180°
#define SERVO_MID 307  // Pulse width for 90° (middle position)

// Current positions
int currentPos1 = SERVO_MID;
int currentPos2 = SERVO_MID;

// Target positions
int targetPos1 = SERVO_MID;
int targetPos2 = SERVO_MID;

// Movement speed (lower = smoother but slower)
const int MOVE_STEP = 3;  // How many units to move per update

// Timer for smooth updates
unsigned long lastUpdateTime = 0;
const int UPDATE_INTERVAL = 10;  // milliseconds between position updates

void setup() {
  Serial.begin(115200);
  pwm.begin();
  pwm.setPWMFreq(50);  // Standard frequency for servo motors
  
  // Initialize servos to center position
  resetServos();
  Serial.println("Arduino initialized, servos at center position");
}

void loop() {
  // Handle incoming commands
  if (Serial.available()) {
    // Read entire command until newline
    String command = Serial.readStringUntil('\n');
    command.trim();  // Remove any whitespace
    
    // Print confirmation for debugging
    Serial.print("Received command: ");
    Serial.println(command);
    
    // Check if it's a position command (POS:tankX:gunAngle)
    if (command.startsWith("POS:")) {
      // Extract the two position values
      int firstColon = command.indexOf(':');
      int secondColon = command.indexOf(':', firstColon + 1);
      
      if (firstColon != -1 && secondColon != -1) {
        String tankXStr = command.substring(firstColon + 1, secondColon);
        String gunAngleStr = command.substring(secondColon + 1);
        
        int tankX = tankXStr.toInt();
        int gunAngle = gunAngleStr.toInt();
        
        // Map from 0-180 to servo pulse range (inverted for first servo)
        targetPos1 = map(tankX, 0, 180, SERVO_MAX, SERVO_MIN); // Reversed to match game
        targetPos2 = map(gunAngle, 0, 180, SERVO_MAX, SERVO_MIN); // Double reversed for gun angle
        
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
  
  // Update servo positions gradually toward targets
  updateServoPositions();
}

void updateServoPositions() {
  // Check if it's time to update positions
  unsigned long currentTime = millis();
  if (currentTime - lastUpdateTime < UPDATE_INTERVAL) {
    return;  // Not time yet
  }
  
  // Update time
  lastUpdateTime = currentTime;
  
  // Update servo 1 position (tank body)
  if (currentPos1 < targetPos1) {
    currentPos1 = min(currentPos1 + MOVE_STEP, targetPos1);
    pwm.setPWM(SERVO_1, 0, currentPos1);
  } else if (currentPos1 > targetPos1) {
    currentPos1 = max(currentPos1 - MOVE_STEP, targetPos1);
    pwm.setPWM(SERVO_1, 0, currentPos1);
  }
  
  // Update servo 2 position (cannon)
  if (currentPos2 < targetPos2) {
    currentPos2 = min(currentPos2 + MOVE_STEP, targetPos2);
    pwm.setPWM(SERVO_2, 0, currentPos2);
  } else if (currentPos2 > targetPos2) {
    currentPos2 = max(currentPos2 - MOVE_STEP, targetPos2);
    pwm.setPWM(SERVO_2, 0, currentPos2);
  }
}

// Function to reset both servos to center position
void resetServos() {
  // Set target positions to center
  targetPos1 = SERVO_MID;
  targetPos2 = SERVO_MID;
}