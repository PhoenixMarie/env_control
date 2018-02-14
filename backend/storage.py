import json
import sqlite3
from hardware_control import *
import asyncio

def connect():
    db_connection = sqlite3.connect('logger.db')
    return db_connection

def create_table(db_connection=connect()):
    with db_connection:
                db_connection.execute("""CREATE TABLE IF NOT EXISTS 
                                sensors_data(unix_timestamp  INT DEFAULT (strftime('%s','now'))  PRIMARY KEY,
                                            inside_temperature REAL,
                                            inside_humidity REAL,
                                            outside_temperature REAL,
                                            outside_humidity REAL,
                                            input_state INT)""")

def dynamic_data_entry(inside_temperature,
                       inside_humidity,
                       outside_temperature,
                       outside_humidity,
                       input_state,db_connection=connect()):
        """Сохраняет данные с датчиков в базу данных"""
        with db_connection:
            db_cursor = db_connection.execute("""INSERT INTO 
                            sensors_data(inside_temperature,
                                        inside_humidity,
                                        outside_temperature,
                                        outside_humidity,
                                        input_state) VALUES (?,?,?,?,?)""",
                                        (
                                        inside_temperature,
                                        inside_humidity,
                                        outside_temperature,
                                        outside_humidity,
                                        input_state))

async def save_to_db():
    while True:
        values = get_sensors_values()
        dynamic_data_entry(values['Temperature'][0],
                           values['Humidity'][0],
                           values['Temperature'][1],
                           values['Humidity'][1],
                           values['Input_state'])
        await asyncio.sleep(1)
        # print('value saved')                      


def dynamic_data_extraction(d_begin, d_end, db_connection=connect()):
    """Извлекает данные датчиков из базы данных за выбранный отрезок"""
    with db_connection:
        db_cursor = db_connection.execute(
            """SELECT 
                datetime (unix_timestamp , 'unixepoch', 'localtime'),
                inside_temperature,
                inside_humidity,
                outside_temperature,
                outside_humidity
                FROM sensors_data 
                WHERE unix_timestamp 
                BETWEEN (CAST(strftime('%s', ?) AS INT)) 
                AND (CAST(strftime('%s', ?) AS INT))""",(d_begin,d_end))
        rows = db_cursor.fetchall()
        rowarray_list = []
        for row in rows:
            temp_dict_to_json = {'timestamp': '', 'temperature': ['', ''], 'humidity': ['', '']}
            temp_dict_to_json['timestamp'] = row[0]
            temp_dict_to_json['temperature'][0] = row[1]
            temp_dict_to_json['humidity'][0] = row[2]
            temp_dict_to_json['temperature'][1] = row[3]
            temp_dict_to_json['humidity'][1] = row[4]

            rowarray_list.append(temp_dict_to_json)
        # final_json = json.dumps(rowarray_list)
        # sensor_data['db_response'] = final_json
        # print(final_json)
        # print(rows)
        return rowarray_list
    
