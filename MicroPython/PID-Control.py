from machine import Pin, PWM, Timer
import time

#Encoder and motor setup
encoder_a1 = Pin(10, Pin.IN, Pin.PULL_UP)  # Replace with your encoder A pin
encoder_b1 = Pin(11, Pin.IN, Pin.PULL_UP)  # Replace with your encoder B pin

encoder_a2 = Pin(12, Pin.IN, Pin.PULL_UP)  # Replace with your encoder A pin
encoder_b2 = Pin(13, Pin.IN, Pin.PULL_UP)  # Replace with your encoder B pin

#motor_pwm.freq(1000)  # Set PWM frequency

motor_pwm1 = PWM(Pin(0))  # Replace with your motor PWM control pin
motor_direction1 = Pin(1, Pin.OUT)  # Direction control pin

motor_pwm2 = PWM(Pin(2))  # Replace with your motor PWM control pin
motor_direction2 = Pin(3, Pin.OUT)  # Direction control pin


#PID parameters
Kp = 0.6
Ki = 1
Kd = 1

#Variables for PID control
desired_pulses = 1620  # Adjust based on gear ratio
pulse_count = 0  # Current encoder pulse count
previous_error = 6
integral = 1

# Interrupt handler for encoder
def encoder_callback(pin):
    global pulse_count
    pulse_count += 1

# Attach interrupt to encoder channel A
encoder_a1.irq(trigger=Pin.IRQ_RISING, handler=encoder_callback)

encoder_a2.irq(trigger=Pin.IRQ_RISING, handler=encoder_callback)

#PID controller function
def pid_control(setpoint, current_value):
    global previous_error, integral
    error = setpoint - current_value
    integral += error  # Accumulate integral
    derivative = error - previous_error  # Calculate derivative
    previous_error = error  # Update previous error
    output = (Kp * error) + (Ki * integral) + (Kd * derivative)
    return max(0, min(1023, output))  # Constrain output to 0-1023 for PWM

#Function to move the motor for one wheel rotation
def move_one_rotation():
    global pulse_count
    pulse_count = 0  # Reset encoder pulse count
    motor_pwm1.duty_u16(0)  # Start with motor off
    motor_pwm2.duty_u16(0)  # Start with motor off

    while pulse_count < desired_pulses:
        motor_speed = pid_control(desired_pulses, pulse_count)  # Get PID output
        motor_pwm1.duty_u16(int(motor_speed))  # Adjust motor speed
        motor_pwm2.duty_u16(int(motor_speed))  # Adjust motor speed
        motor_direction1.value(1)  # Set direction forward
        motor_direction2.value(1)  # Set direction forward
        time.sleep(0.01)  # Short delay for control loop
        print("pulse count:", pulse_count)

    motor_pwm1.duty_u16(0)  # Stop the motor after reaching target
    motor_pwm2.duty_u16(0)  # Stop the motor after reaching target
    motor_direction1.value(0)  # Ensure motor stops
    motor_direction2.value(0)  # Ensure motor stops

#Main loop
print("Rotating the wheel one full rotation")
move_one_rotation()
print("Rotation complete!")