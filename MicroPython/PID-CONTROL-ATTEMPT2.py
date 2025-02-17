from machine import Pin, PWM, Timer
import time

# Encoder and motor setup
encoder_a1 = Pin(10, Pin.IN, Pin.PULL_UP)
encoder_b1 = Pin(11, Pin.IN, Pin.PULL_UP)

encoder_a2 = Pin(12, Pin.IN, Pin.PULL_UP)
encoder_b2 = Pin(13, Pin.IN, Pin.PULL_UP)

encoder_a3 = Pin(14, Pin.IN, Pin.PULL_UP)
encoder_b3 = Pin(15, Pin.IN, Pin.PULL_UP)

# Motor setup (initialized)
motor_pwm1 = PWM(Pin(0))
motor_direction1 = Pin(1, Pin.OUT)

motor_pwm2 = PWM(Pin(2))
motor_direction2 = Pin(3, Pin.OUT)

motor_pwm3 = PWM(Pin(6))
motor_direction3 = Pin(7, Pin.OUT)

# PID Constants
Kp = 1.0
Ki = 0.0
Kd = 0.1

# Target speed (in encoder ticks per second)
TARGET_SPEED = 100

# Motor and Encoder Setup
class Motor:
    def __init__(self, pwm_pin, dir_pin, encoder_a_pin, encoder_b_pin):
        self.pwm = pwm_pin
        self.dir = dir_pin
        self.encoder_a = encoder_a_pin
        self.encoder_b = encoder_b_pin
        self.encoder_count = 0
        self.last_time = time.ticks_ms()
        self.speed = 0

    def set_speed(self, speed):
        if speed >= 0:
            self.dir.value(0)  # Forward
        else:
            self.dir.value(1)  # Backward
        self.pwm.duty_u16(abs(speed) * 65535 // 100)  # Scale speed to 0-100%

    def update_encoder(self, pin):
        self.encoder_count += 1

# Initialize Motors with encoder A and B for each motor
motor1 = Motor(motor_pwm1, motor_direction1, encoder_a1, encoder_b1)
motor2 = Motor(motor_pwm2, motor_direction2, encoder_a2, encoder_b2)
motor3 = Motor(motor_pwm3, motor_direction3, encoder_a3, encoder_b3)

# Attach Encoder Interrupts
motor1.encoder_a.irq(trigger=Pin.IRQ_RISING, handler=motor1.update_encoder)
motor2.encoder_a.irq(trigger=Pin.IRQ_RISING, handler=motor2.update_encoder)
motor3.encoder_a.irq(trigger=Pin.IRQ_RISING, handler=motor3.update_encoder)

# PID Controller
class PID:
    def __init__(self, Kp, Ki, Kd):
        self.Kp = Kp
        self.Ki = Ki
        self.Kd = Kd
        self.last_error = 0
        self.integral = 0

    def compute(self, setpoint, measured_value):
        error = setpoint - measured_value
        self.integral += error
        derivative = error - self.last_error
        output = self.Kp * error + self.Ki * self.integral + self.Kd * derivative
        self.last_error = error
        return output

# Initialize PID Controllers for Each Motor
pid1 = PID(Kp, Ki, Kd)
pid2 = PID(Kp, Ki, Kd)
pid3 = PID(Kp, Ki, Kd)

# Function to Update Motor Speeds
def update_motor_speeds():
    global motor1, motor2, motor3

    # Calculate current speed (encoder ticks per second)
    current_time = time.ticks_ms()
    dt = time.ticks_diff(current_time, motor1.last_time) / 1000  # Convert to seconds
    motor1.speed = motor1.encoder_count / dt
    motor2.speed = motor2.encoder_count / dt
    motor3.speed = motor3.encoder_count / dt

    # Reset encoder counts and update last time
    motor1.encoder_count = 0
    motor2.encoder_count = 0
    motor3.encoder_count = 0
    motor1.last_time = current_time
    motor2.last_time = current_time
    motor3.last_time = current_time

    # Compute PID outputs
    output1 = pid1.compute(TARGET_SPEED, motor1.speed)
    output2 = pid2.compute(TARGET_SPEED, motor2.speed)
    output3 = pid3.compute(TARGET_SPEED, motor3.speed)

    # Adjust motor speeds
    motor1.set_speed(output1)
    motor2.set_speed(output2)
    motor3.set_speed(output3)

# Timer to Update Motor Speeds Periodically
timer = Timer()
timer.init(period=100, mode=Timer.PERIODIC, callback=lambda t: update_motor_speeds())

# Robot Movement Functions
def move_forward():
    motor1.set_speed(TARGET_SPEED)
    motor2.set_speed(TARGET_SPEED)
    motor3.set_speed(TARGET_SPEED)

def move_backward():
    motor1.set_speed(-TARGET_SPEED)
    motor2.set_speed(-TARGET_SPEED)
    motor3.set_speed(-TARGET_SPEED)

def turn_left():
    motor1.set_speed(-TARGET_SPEED)
    motor2.set_speed(TARGET_SPEED)
    motor3.set_speed(TARGET_SPEED)

def turn_right():
    motor1.set_speed(TARGET_SPEED)
    motor2.set_speed(-TARGET_SPEED)
    motor3.set_speed(TARGET_SPEED)

# Main Loop
while True:
    # Example: Move forward for 2 seconds, then turn left
    move_forward()
    time.sleep(2)
    turn_left()
    time.sleep(1)



