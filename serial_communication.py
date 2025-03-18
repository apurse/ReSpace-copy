import serial.tools.list_ports
import serial

# dont mark from different module

class SerialCommunication:
    def __init__(self, port, baudrate, timeout=0.1):
        self.port = port
        self.baudrate = baudrate
        self.timeout = timeout
        try: # try to form a connection between serial port 
            self.connection = serial.Serial(port=self.port, baudrate=self.baudrate, timeout=self.timeout)
            print(f'Connected to {self.port} at {self.baudrate} baud.')
        except serial.SerialException as e: #print if connection failed
            print(f'Failed to connect to {self.port}: {e}')
            self.connection = None
            
    # function to read from the serial port
    def serial_read(self):
       if self.connection and self.connection.in_waiting > 0:
        return self.connection.readline().decode().strip()
