from Adafruit_BME280 import *
from pin_state_control import *
import asyncio
from datetime import date, datetime
import RPi.GPIO as GPIO
import sqlite3
import time
import json
import websockets
import storage

SENSOR_1 = BME280(t_mode=BME280_OSAMPLE_8, p_mode=BME280_OSAMPLE_8, h_mode=BME280_OSAMPLE_8,address=0x76)
SENSOR_2 = BME280(t_mode=BME280_OSAMPLE_8, p_mode=BME280_OSAMPLE_8, h_mode=BME280_OSAMPLE_8,address=0x77)
GPIO.setmode(GPIO.BCM)
GPIO.setup(18, GPIO.IN, pull_up_down=GPIO.PUD_UP)

get_connection = lambda : storage.connect()
with get_connection() as conn:
    storage.create_table(conn)

def get_sensors_values():
    sensors_data = {'Temperature': ['', ''], 'Humidity': ['', ''],'Input_state':'', 'ResponseFromDB':None}
    sensors_data['Temperature'][0] = round(SENSOR_1.read_temperature(), 1)
    sensors_data['Humidity'][0] = round(SENSOR_1.read_humidity(), 1)
    sensors_data['Temperature'][1] = round(SENSOR_2.read_temperature(), 1)
    sensors_data['Humidity'][1] = round(SENSOR_2.read_humidity(), 1)
    sensors_data['Input_state'] = not GPIO.input(18)
    return sensors_data

async def save_to_db():
    while True:
        values = get_sensors_values()
        get_connection = lambda : storage.connect()
        with get_connection() as conn:
                        storage.dynamic_data_entry(conn,
                                                values['Temperature'][0],
                                                values['Humidity'][0],
                                                values['Temperature'][1],
                                                values['Humidity'][1],
                                                values['Input_state'])
                        await asyncio.sleep(1)
                        # print('value saved')                      

db_response = None         

async def message_sender(websocket):
    while True:
        global db_response
        if db_response == None:
            message_to_send = json.dumps(get_sensors_values())
        else:
            values = get_sensors_values()
            values['ResponseFromDB'] = db_response
            message_to_send = json.dumps(values)
            # print(message_to_send)
            db_response = None

        await websocket.send(message_to_send)
        await asyncio.sleep(0)
        # print(message_to_send)

async def message_receiver(websocket):
    while True:
        global db_response
        message = await websocket.recv()
        if len(message) < 17 :
            switching_diodes(message)
        else:
            print(message)
            json_to_dict = json.loads(message)
            timestamp_begin = json_to_dict.get('startDate')
            timestamp_end = json_to_dict.get('endDate')
            d_begin = timestamp_begin.replace("T", " ")
            d_end = timestamp_end.replace("T", " ")
            get_connection = lambda : storage.connect()
            with get_connection() as conn:
                            db_response = storage.dynamic_data_extraction(conn, d_begin, d_end)

async def handler(websocket, path):
    consumer_task = asyncio.ensure_future(message_receiver(websocket))
    producer_task = asyncio.ensure_future(message_sender(websocket))
    
    done, pending = await asyncio.wait(
        [consumer_task, producer_task],
        return_when=asyncio.FIRST_COMPLETED,
    )

    
    for task in pending:
        task.cancel()

start_server = websockets.serve(handler, '192.168.1.2', 8765)
loop = asyncio.get_event_loop()
loop.run_until_complete(start_server)

save_to_db_task = asyncio.ensure_future(save_to_db())
loop.run_until_complete(save_to_db_task)

loop.run_forever()
