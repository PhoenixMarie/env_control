
#!/usr/bin/env python3.6
from Adafruit_BME280 import *
import RPi.GPIO as GPIO

SENSOR_1 = BME280(t_mode=BME280_OSAMPLE_8, p_mode=BME280_OSAMPLE_8, h_mode=BME280_OSAMPLE_8,address=0x76)
SENSOR_2 = BME280(t_mode=BME280_OSAMPLE_8, p_mode=BME280_OSAMPLE_8, h_mode=BME280_OSAMPLE_8,address=0x77)

def get_sensors_values():
    sensors_data = {'Temperature': ['', ''], 'Humidity': ['', ''],'Input_state':'', 'ResponseFromDB':None}
    sensors_data['Temperature'][0] = round(SENSOR_1.read_temperature(), 1)
    sensors_data['Humidity'][0] = round(SENSOR_1.read_humidity(), 1)
    sensors_data['Temperature'][1] = round(SENSOR_2.read_temperature(), 1)
    sensors_data['Humidity'][1] = round(SENSOR_2.read_humidity(), 1)
    sensors_data['Input_state'] = not GPIO.input(18)
    return sensors_data


def gpio_prepare():
        GPIO.setwarnings(False)
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(17, GPIO.OUT)   # Set pins' mode is output
        GPIO.setup(18, GPIO.IN, pull_up_down=GPIO.PUD_UP)


def switching_diodes(message):
        if message == 'turn_on_led_17':
                GPIO.output(17, GPIO.HIGH) # Set pins to high(+3.3V) to off led
        elif message == 'turn_off_led_17':
                GPIO.output(17, GPIO.LOW) # Set pins to high(+3.3V) to off led

                
