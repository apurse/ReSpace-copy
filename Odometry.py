from machine import Pin, Timer

# Encoder and motor setup
encoder_a = Pin(10, Pin.IN, Pin.PULL_UP)  # Replace with your encoder A pin
encoder_b = Pin(11, Pin.IN, Pin.PULL_UP)  # Replace with your encoder B pin
motor_pin1 = machine.Pin(0, machine.Pin.OUT)
motor_pin2 = machine.Pin(1, machine.Pin.OUT) 

pulse_count = 0  # To track encoder pulses
desired_pulses = 1620  # Adjust based on gear ratio

# Interrupt handler for encoder
def encoder_callback(pin):
    global pulse_count
    pulse_count += 1

# Attach interrupt to encoder channel A
encoder_a.irq(trigger=Pin.IRQ_RISING, handler=encoder_callback)

# Function to move the motor for one wheel rotation
def move_one_rotation():
    global pulse_count
    pulse_count = 0
    motor_pin1.value(0) # Turn motor on
    motor_pin2.value(1) # Turn motor on


    while pulse_count < desired_pulses:
        pass  # Wait until the desired pulse count is reached

    motor_pin1.value(0) # Turn motor on
    motor_pin2.value(0) # Turn motor on

# Main loop
print("Rotating the wheel one full rotation...")
move_one_rotation()
print("Rotation complete!")
