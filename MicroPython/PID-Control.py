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
Kp = 0.8
Ki = 0.08
Kd = 0.1

# Encoder ticks per rotation
ENCODER_COUNTS = [652, 615, 617]  # Encoder counts for motors 1, 2, 3

# Target speed (in encoder ticks per second)
TARGET_SPEED = 100

# Motor state variables
encoder_count1 = 0
encoder_count2 = 0
encoder_count3 = 0

last_time = time.ticks_ms()

# Set PWM frequencies
motor_pwm1.freq(1000)
motor_pwm2.freq(1000)
motor_pwm3.freq(1000)

# PID Controller
def pid_compute(setpoint, measured_value, last_error, integral):
    error = setpoint - measured_value
    integral += error
    derivative = error - last_error
    output = Kp * error + Ki * integral + Kd * derivative
    return output, error, integral

# Function to set motor speed
def set_motor_speed(motor_pwm, speed):
    duty = int(abs(speed) * 65535 // 100)  # Scale speed to 0-100%
    duty = min(max(duty, 0), 65535)  # Clamp to the range 0-65535
    motor_pwm.duty_u16(duty)

# Encoder interrupt handlers
def encoder_isr1(pin):
    global encoder_count1
    encoder_count1 += 1

def encoder_isr2(pin):
    global encoder_count2
    encoder_count2 += 1

def encoder_isr3(pin):
    global encoder_count3
    encoder_count3 += 1

# Attach Encoder Interrupts
encoder_a1.irq(trigger=Pin.IRQ_RISING, handler=encoder_isr1)
encoder_a2.irq(trigger=Pin.IRQ_RISING, handler=encoder_isr2)
encoder_a3.irq(trigger=Pin.IRQ_RISING, handler=encoder_isr3)

# Timer to update motor speeds periodically
def update_motor_speeds(t):
    global encoder_count1, encoder_count2, encoder_count3, last_time

    # Calculate current speed (encoder ticks per second)
    current_time = time.ticks_ms()
    dt = time.ticks_diff(current_time, last_time) / 1000  # Convert to seconds
    speed1 = encoder_count1 / dt
    speed2 = encoder_count2 / dt
    speed3 = encoder_count3 / dt

    # Reset encoder counts and update last time
    encoder_count1 = 0
    encoder_count2 = 0
    encoder_count3 = 0
    last_time = current_time

    print(f"Speed1: {speed1} ticks/s, Speed2: {speed2} ticks/s, Speed3: {speed3} ticks/s")  # Debug print

    # Compute PID output for each motor
    output1, _, _ = pid_compute(TARGET_SPEED, speed1, 0, 0)
    output2, _, _ = pid_compute(TARGET_SPEED, speed2, 0, 0)
    output3, _, _ = pid_compute(TARGET_SPEED, speed3, 0, 0)

    # Adjust motor speeds
    set_motor_speed(motor_pwm1, output1)
    set_motor_speed(motor_pwm2, output2)
    set_motor_speed(motor_pwm3, output3)

# Initialize Timer
timer = Timer()
timer.init(period=100, mode=Timer.PERIODIC, callback=update_motor_speeds)

# Robot movement function to move all motors in sync
def move_all_forward():
    set_motor_speed(motor_pwm1, TARGET_SPEED)
    set_motor_speed(motor_pwm2, TARGET_SPEED)
    set_motor_speed(motor_pwm3, TARGET_SPEED)

# Main loop
while True:
    # Example: Move all motors forward for 2 seconds
    move_all_forward()
    time.sleep(2)
    stop_command = input("Enter '1' to stop motors: ")
    if stop_command.strip() == "1":
        set_motor_speed(motor_pwm1, 0)
        set_motor_speed(motor_pwm2, 0)
        set_motor_speed(motor_pwm3, 0) 
        print("Motors stopped.")
        break  # Exit the loop