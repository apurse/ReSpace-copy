from machine import Pin, PWM, ADC
import time

# Pin definitions
STEP = Pin(20, Pin.OUT)
DIR = Pin(21, Pin.OUT)
POS = ADC(Pin(26))

AIN1 = machine.Pin(0, machine.Pin.OUT)
AIN2 = machine.Pin(1, machine.Pin.OUT) 
BIN1 = PWM(Pin(2))
BIN2 = PWM(Pin(3))
CIN1 = PWM(Pin(6))
CIN2 = PWM(Pin(7))

BEEP = PWM(Pin(18))

# encoder pins
ENC_A = Pin(10, Pin.IN, Pin.PULL_UP)  # Pin 10 for Encoder A
ENC_B = Pin(11, Pin.IN, Pin.PULL_UP)  # Pin 11 for Encoder B

# Variables for tracking encoder values
encoder_position = 0
last_A = 0

# Motor settings
motor_speed = 255  # Duty cycle (0-255 for MicroPython)



def encoder_callback(pin):
    global encoder_position, last_A
    A_state = ENC_A.value()
    B_state = ENC_B.value()

    if A_state != last_A:  # Detect a change in state
        if A_state == B_state:
            encoder_position += 1  # Clockwise
        else:
            encoder_position -= 1  # Counter-clockwise
    last_A = A_state
    
def setup_encoder():
    ENC_A.irq(trigger=Pin.IRQ_RISING | Pin.IRQ_FALLING, handler=encoder_callback)


# Home Scissor Lift function
def home_scissor_lift():
    max_speed = 400
    acceleration = 5000

    pos = POS.read_u16()  # Read analog input
    while pos < 1000:
        pos = POS.read_u16()
        DIR.off()  # Set direction
        STEP.on()
        time.sleep_us(100)  # Adjust for step timing
        STEP.off()
        time.sleep_us(100)

    # Set position to zero
    print("Scissor lift homed.")
    time.sleep(0.4)

# Buzzer tone function
def tone(pin, frequency, duration):
    pin.freq(frequency)
    pin.duty_u16(32768)  # 50% duty cycle
    time.sleep_ms(duration)
    pin.duty_u16(0)

# Motor movement functions
def move_forward():
    AIN1.value(0)
    AIN2.value(1)
    BIN1.duty_u16(0)
    BIN2.duty_u16(motor_speed * 256)
    CIN1.duty_u16(0)
    CIN2.duty_u16(0)

def move_backward():
    AIN1.duty_u16(0)
    AIN2.duty_u16(motor_speed * 256)
    BIN1.duty_u16(motor_speed * 256)
    BIN2.duty_u16(0)
    CIN1.duty_u16(0)
    CIN2.duty_u16(0)

def turn_left():
    AIN1.duty_u16(motor_speed * 256)
    AIN2.duty_u16(0)
    BIN1.duty_u16(0)
    BIN2.duty_u16(motor_speed * 256)
    CIN1.duty_u16(motor_speed * 256)
    CIN2.duty_u16(0)

def turn_right():
    AIN1.duty_u16(0)
    AIN2.duty_u16(motor_speed * 256)
    BIN1.duty_u16(motor_speed * 256)
    BIN2.duty_u16(0)
    CIN1.duty_u16(0)
    CIN2.duty_u16(motor_speed * 256)

def stop_motors():
    AIN1.value(0)
    AIN2.value(0)
    BIN1.duty_u16(0)
    BIN2.duty_u16(0)
    CIN1.duty_u16(0)
    CIN2.duty_u16(0)

# Main loop
def main():
    print("Initializing system...")
    home_scissor_lift()

    # Play startup tones
    tone(BEEP, 1000, 40)
    time.sleep_ms(40)
    tone(BEEP, 1500, 40)
    time.sleep_ms(40)
    tone(BEEP, 2000, 40)
    time.sleep_ms(200)

    while True:
        # Simulate serial input (replace this with actual UART input handling)
        msg = input("Enter command (forward, backward, raise, lower, left, right): ")
        stop_motors()

        if msg == "forward":
            move_forward()
        elif msg == "backward": 
            move_backward()
        elif msg == "stop":
            stop_motors()
        elif msg == "raise":
            print("Raising scissor lift...")
            # Add stepper motor raise logic here
        elif msg == "lower":
            print("Lowering scissor lift...")
            # Add stepper motor lower logic here
        elif msg == "left":
            turn_left()
        elif msg == "right":
            turn_right()
        else:
            print("Invalid command.")
        time.sleep(1)  # Pause for a short duration

# Run the main function
# main()

def main2():
    import time  # Ensure the time module is imported
    
    time.sleep(5)  # Initial delay for setup
    setup_encoder()  # Initialize encoder
    
    print("Encoder initialized. Turning Motor A one revolution...")

    # Define pulses per revolution for motor A
    PULSES_PER_REVOLUTION = 2630

    # Reset the encoder position
    global encoder_position
    encoder_position = 0

    # Set motor A to rotate forward
    AIN1.value(0)
    AIN2.value(1)

    try:
        # Rotate until close to one full revolution
        while abs(encoder_position) < PULSES_PER_REVOLUTION:
            print(f"Encoder Position: {encoder_position}")
            time.sleep(0.05)  # Small delay for readability

        # Fine-tune the stop to match PULSES_PER_REVOLUTION exactly
        AIN1.value(0)
        AIN2.value(0)

        # Wait for the encoder to stabilize (if necessary)
        time.sleep(0.1)

        # Adjust encoder position if it's slightly off
        while abs(encoder_position) > PULSES_PER_REVOLUTION:
            print(f"Adjusting encoder position: {encoder_position}")
            # Reverse motor briefly to correct overshoot
            AIN1.value(1)
            AIN2.value(0)
            time.sleep(0.02)  # Short burst of reverse motion
            AIN1.value(0)
            AIN2.value(0)

        print(f"Final Encoder Position: {encoder_position}")
        print("Motor A completed one revolution.")
    except KeyboardInterrupt:
        # Gracefully stop the motor if the program is interrupted
        AIN1.value(0)
        AIN2.value(0)
        print("\nMotor A stopped manually. Exiting program.")





def main3():
    import time  # Ensure the time module is imported
    
    time.sleep(5)  # Initial delay for setup
    setup_encoder()  # Initialize encoder
    
    print("Encoder initialized. Monitoring encoder position...")

    # Reset the encoder position
    global encoder_position
    encoder_position = 0

    try:
        # Continuously print the encoder position every 0.5 seconds
        while True:
            print(f"Encoder Position: {encoder_position}")
            time.sleep(0.5)  # Delay for readability
    except KeyboardInterrupt:
        # Gracefully exit the program
        print("\nExiting program.")

# Run the main function
main2()
