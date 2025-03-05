from machine import Pin, PWM, Timer
import time

class Motor:
    def __init__(self, pwm_pin_forward, pwm_pin_reverse, encoder_pin_a, encoder_pin_b,
                 ticks_per_rev=620, Kp=160, Ki=90, Kd=0.05, freq=1000, timer_period=10):
        # Initialize encoder pins
        self.encoder_pin_a = Pin(encoder_pin_a, Pin.IN)
        self.encoder_pin_b = Pin(encoder_pin_b, Pin.IN)
        
        # Initialize motor PWM pins
        self.motor_pwm1 = PWM(Pin(pwm_pin_forward))
        self.motor_pwm2 = PWM(Pin(pwm_pin_reverse))
        self.motor_pwm1.freq(freq)
        self.motor_pwm2.freq(freq)
        
        # PID and encoder parameters
        self.ticks_per_rev = ticks_per_rev
        self.Kp = Kp
        self.Ki = Ki
        self.Kd = Kd
        self.target_rpm = 0
        
        self.encoder_count = 0
        self.last_time = time.ticks_ms()
        self.last_error = 0
        self.integral = 0
        self.rpm = 0  # Store the current RPM
        
        # Attach the interrupt handler to encoder pin A.
        self.encoder_pin_a.irq(trigger=Pin.IRQ_RISING, handler=self._encoder_isr)
        
        # Setup a timer to call update_motor_speed periodically.
        self.timer = Timer(-1)
        self.timer.init(period=timer_period, mode=Timer.PERIODIC, callback=self.update_motor_speed)
    
    def _encoder_isr(self, pin):
        """
        Encoder interrupt handler.
        Checks the value of encoder_pin_b to determine rotation direction.
        """
        if self.encoder_pin_b.value() == 1:
            self.encoder_count += 1  # Forward rotation
        else:
            self.encoder_count -= 1  # Reverse rotation

    def set_motor_speed(self, speed):
        """
        Sets the motor speed and direction by adjusting the PWM duty cycle.
        """
        speed = max(min(speed, 65535), -65535)  # Limit the PWM duty cycle
        
        if speed == 0:
            self.motor_pwm1.duty_u16(0)
            self.motor_pwm2.duty_u16(0)
        elif speed > 0:
            self.motor_pwm1.duty_u16(0)
            self.motor_pwm2.duty_u16(int(speed))
        else:
            self.motor_pwm1.duty_u16(int(-speed))
            self.motor_pwm2.duty_u16(0)
    
    def update_motor_speed(self, t):
        """
        Called periodically by the Timer.
        Computes the actual RPM, calculates PID error, and adjusts the motor PWM.
        """
        current_time = time.ticks_ms()
        dt = time.ticks_diff(current_time, self.last_time) / 1000.0  # Convert to seconds
        
        # Calculate RPM
        if dt > 0:
            self.rpm = (self.encoder_count * 60 / self.ticks_per_rev) / dt
        else:
            self.rpm = 0
        
        # Reset encoder count and update the last time measurement.
        self.encoder_count = 0
        self.last_time = current_time
        
        # Compute error
        error = self.target_rpm - self.rpm

        # Integral term with decay when target RPM is zero
        if self.target_rpm == 0:
            self.integral *= 0.9  # Decay integral when not in use
        else:
            self.integral += error * dt  # Normal integral
            
        derivative = (error - self.last_error) / dt if dt > 0 else 0

        # Compute PID output
        output = (self.Kp * error) + (self.Ki * self.integral) + (self.Kd * derivative)
        
        self.last_error = error  
        
        # Debug output
#         print("Target RPM: {:0.2f}, Measured RPM: {:.2f}, Error: {:.2f}, Integral: {:.2f}, Output: {:.2f}"
#               .format(self.target_rpm, self.rpm, error, self.integral, output))
        
        # Set motor speed
        self.set_motor_speed(output)
    
    def get_rpm(self):
        """
        Returns the current measured RPM.
        """
        return self.rpm


# Initialize Motors
motor1 = Motor(pwm_pin_forward=0, pwm_pin_reverse=1, encoder_pin_a=11, encoder_pin_b=10)
motor2 = Motor(pwm_pin_forward=2, pwm_pin_reverse=3, encoder_pin_a=13, encoder_pin_b=12)
motor3 = Motor(pwm_pin_forward=6, pwm_pin_reverse=7, encoder_pin_a=15, encoder_pin_b=14)

# Movement Functions
def reverse():
    motor1.target_rpm = -50 
    motor3.target_rpm = 50

def forward():
    motor1.target_rpm = 50 
    motor3.target_rpm = -50

def rotateR():
    motor1.target_rpm = 50
    motor2.target_rpm = 50
    motor3.target_rpm = 50

def rotateL():
    motor1.target_rpm = -50
    motor2.target_rpm = -50
    motor3.target_rpm = -50

def stop():
    motor1.target_rpm = 0
    motor2.target_rpm = 0
    motor3.target_rpm = 0

# Directional Movements
def forwardR():
    motor2.target_rpm = -50 
    motor3.target_rpm = 50

def reverseR():
    motor2.target_rpm = 50 
    motor3.target_rpm = -50

def forwardL():
    motor2.target_rpm = -50 
    motor1.target_rpm = 50

def reverseL():
    motor2.target_rpm = 50 
    motor1.target_rpm = -50


# Main Loop
while True:
    motor1.target_rpm = 50
    motor3.target_rpm = -50
    motor2.target_rpm = 0
    print("Motor1 RPM:", motor1.get_rpm(), "Motor2 RPM:", motor2.get_rpm(), "Motor3 RPM:", motor3.get_rpm())
    time.sleep(0.1)