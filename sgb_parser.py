from json import dumps

from PIL import Image


def fetch_section(filename: str, 
                  header: list, end: list,
                  offset: int) -> list:
    
    with open(f'maps/{filename}.sgb', 'rb') as f:
        data = f.read()
        res = list()

        header_len = len(header)
        end_len = len(end)

        is_fetching = False
        p = 0

        while True:
            if not is_fetching:
                if [data[p+i] for i in range(header_len)] == header:
                    is_fetching = True

                    p += offset

            else:
                if [data[p+i] for i in range(end_len)] == end:
                    break

                res.append(data[p])

            p += 1

    return res


def get_data(filename):
    height_map = fetch_section(
        filename,
        [68, 65, 84, 65, 72, 77, 65, 80, 208, 7],
        [68, 65, 84, 65, 84, 84, 89, 80, 210, 7],
        27
    )
    passability_map = list(map(lambda x: True if x == 2 else False, fetch_section(
        filename,
        [80, 97, 115, 115, 97, 98, 105, 108, 105, 116, 121, 32, 77, 97, 112],
        [68, 65, 84, 65, 80, 82, 77, 80, 208],
        27
    )))

    size = int(len(height_map) ** 0.5)

    try:
        img = Image.open(f'maps/{filename}.tga')
        img = img.resize((size, size))

        return dumps({
            'width': size,
            'height': size,
            'height_map': height_map,
            'passability_map': passability_map,
            'color_map': list(img.getdata())
        })

    except FileNotFoundError:
        return dumps({
            'width': size,
            'height': size,
            'height_map': height_map,
            'color_map': None,
            'passability_map': passability_map,
        })
