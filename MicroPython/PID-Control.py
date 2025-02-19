from machine import Pin, PWM, Timer
import time

class Motor:
    def __init__(self, pwm_pin_forward, pwm_pin_reverse, encoder_pin_a, encoder_pin_b,
                 ticks_per_rev=620, Kp=1500, Ki=900, Kd=0.1, freq=1000, timer_period=10):
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
        
        # Attach the interrupt handler to encoder pin A.
        # When encoder_pin_a sees a rising edge, _encoder_isr is called.
        self.encoder_pin_a.irq(trigger=Pin.IRQ_RISING, handler=self._encoder_isr)
        
        # Setup a timer to call update_motor_speed periodically.
        # Note: Timer(-1) creates a virtual timer (if supported by your board)
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
        A positive speed rotates in one direction and a negative speed in the other.
        """
        # Limit the PWM duty cycle to within the valid 16-bit range.
        if speed > 65535:
            speed = 65535
        if speed < -65535:
            speed = -65535
        
        if speed == 0:
            self.motor_pwm1.duty_u16(0)
            self.motor_pwm2.duty_u16(0)
        elif speed > 0:
            self.motor_pwm1.duty_u16(0)
            self.motor_pwm2.duty_u16(int(speed))
        else:  # speed < 0
            self.motor_pwm1.duty_u16(int(-speed))
            self.motor_pwm2.duty_u16(0)
    
    def update_motor_speed(self, t):
        """
        Called periodically by the Timer.
        Reads the encoder count, computes the actual RPM,
        calculates the PID error, and adjusts the motor PWM accordingly.
        """
        current_time = time.ticks_ms()
        dt = time.ticks_diff(current_time, self.last_time) / 1000.0  # Convert to seconds
        # Calculate measured RPM based on encoder counts.
        rpm = (self.encoder_count * 60 / self.ticks_per_rev) / dt if dt > 0 else 0
        
        # Reset encoder count and update the last time measurement.
        self.encoder_count = 0
        self.last_time = current_time
        
        # Compute error between target and actual RPM.
        error = self.target_rpm - rpm
        
        self.integral = self.integral + error * dt
        
        # A simple proportional control (you can extend this to full PID using Ki and Kd)
        output = (self.Kp * error) + (self.Ki * self.integral)
        
        # For debugging, print out the values.
#         print("Target RPM: {:0.2f}, Measured RPM: {:.2f}, Error: {:.2f}, Output: {:.2f}".format(self.target_rpm, rpm, error, output))
        print("Target RPM: {:0.2f}, Measured RPM: {:.2f}".format(self.target_rpm, rpm))
        
        # Set motor speed with the computed output.
        self.set_motor_speed(output)




motor1 = Motor(pwm_pin_forward=0, pwm_pin_reverse=1, encoder_pin_a=11, encoder_pin_b=10)
motor2 = Motor(pwm_pin_forward=2, pwm_pin_reverse=3, encoder_pin_a=13, encoder_pin_b=12)


while True:
    motor1.target_rpm = -120
    motor2.target_rpm = -120
    time.sleep(3)
    motor1.target_rpm = 0
    motor2.target_rpm = 0
    time.sleep(5)
    motor1.target_rpm = 120
    motor2.target_rpm = 120
    time.sleep(3)
    motor1.target_rpm = 0
    motor2.target_rpm = 0
    time.sleep(5)

