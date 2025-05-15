from json import dumps

from PIL import Image

GEOMETRY_HEADER = [68, 65, 84, 65, 72, 77, 65, 80, 208, 7]
GEOMETRY_END = [68, 65, 84, 65, 84, 84, 89, 80, 210, 7]


def get_map(map_name):
    with open(f'maps/{map_name}.sgb', 'rb') as map_file:
        map_data = map_file.read()
        geometry_data = list()

        is_reading = False
        p = 0

        while True:
            if not is_reading:
                if [map_data[p+i] for i in range(10)] == GEOMETRY_HEADER:
                    is_reading = True

                    p += 27

            else:
                if [map_data[p+i] for i in range(10)] == GEOMETRY_END:
                    break

                geometry_data.append(map_data[p])

            p += 1

        size = int(len(geometry_data) ** 0.5)
        
        img = Image.open(f'maps/{map_name}.tga')
        img = img.resize((size, size))

        return dumps({
            'width': size,
            'height': size,
            'height_map': geometry_data,
            'color_map': list(img.getdata())
        })


get_map('fata_morga')
