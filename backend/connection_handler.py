import websockets
import asyncio
from storage import *

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
            db_response = dynamic_data_extraction(d_begin, d_end)

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
save_to_db_task = asyncio.ensure_future(save_to_db())
