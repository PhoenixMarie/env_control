from hardware_control import *
from connection_handler import *

def main():
    gpio_prepare()
    create_table()
    loop.run_until_complete(start_server)
    loop.run_until_complete(save_to_db_task)
    loop.run_forever()

if __name__ == "__main__":
    main()