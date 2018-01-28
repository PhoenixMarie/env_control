# env_control
Environmental conditions (humidity,temperature later may be more) realtime data viewer and logger, with web interface for raspberry pi, with possibility to control some external equipment.This is my first learning project and nothing new in itself, but the technologies used may be found intresting: from backend - python asyncio, websockets, sqlite3 as database; from frontend- great js library for data visualization - D3.js.
Hardware used in project: raspberry pi 1 (version 3 board also works), two BME280 sensors connected using i2c to board,RGB LED to emulate switching on and off external equipment, and two wires (i`m bit lazy man to buy normal switch) to emulate input on pins.
Websocket connection used to connect page to server and get realtime data in JSON format, and to make request to database.

![Alt text](https://github.com/PhoenixMarie/env_control/blob/master/screenshots/screenshot_1.png "Screenshot 1")
![Alt text](https://github.com/PhoenixMarie/env_control/blob/master/screenshots/screenshot_2.png "Screenshot 2")
![Alt text](https://github.com/PhoenixMarie/env_control/blob/master/screenshots/screenshot_3.png "Screenshot 3")
![Alt text](https://github.com/PhoenixMarie/env_control/blob/master/screenshots/RPI_BME280_RGB_LED.png "Equipment")

