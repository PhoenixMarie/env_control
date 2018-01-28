
#!/usr/bin/env python3.6
import RPi.GPIO as GPIO
import time
GPIO.setmode(GPIO.BCM)

def switching_diodes(message):
        GPIO.setup(17, GPIO.OUT)   # Set pins' mode is output
        if message == 'turn_on_led_17':
                GPIO.output(17, GPIO.HIGH) # Set pins to high(+3.3V) to off led
        elif message == 'turn_off_led_17':
                GPIO.output(17, GPIO.LOW) # Set pins to high(+3.3V) to off led

                
