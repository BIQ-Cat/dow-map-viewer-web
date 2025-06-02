from json import dumps

from PIL import Image

OBJECT_DATA_HEADER_RAW = [68, 65, 84, 65, 
                          69, 66, 80, 84]
OBJECT_ROOT_RAW = [100, 97, 116, 97, 
                   58, 97, 116, 116, 
                   114, 105, 98]
CUT_FLAG_RAW = [115, 116, 114, 97, 
                116, 101, 103, 105, 
                99, 95, 112, 111, 
                105, 110, 116, 95, 
                102, 108, 97, 103]
CUT_RELIC_RAW = [114, 101, 108, 
                 105, 99, 95, 
                 115, 116, 114, 
                 117, 99, 116]
CUT_CRIT_RAW = [115, 116, 114, 97, 116, 
                101, 103, 105, 99, 95, 
                111, 98, 106, 101, 99, 
                116, 105, 118, 101, 95, 
                115, 116, 114, 117, 99, 116]
CUT_SLAG_RAW = [115, 108, 97, 103, 95, 100, 
                101, 112, 111, 115, 
                105, 116, 46, 114, 103, 100]
CUT_SPAWN_RAW = [115, 116, 97, 114, 
                 116, 105, 110, 103, 
                 95, 112, 111, 115, 
                 105, 116, 105, 111, 110]
ENTITY_DATA_HEADER_RAW = [70, 79, 76, 68, 
                          69, 78, 84, 76]
ENTITY_HEADER_RAW = [68, 65, 84, 65, 
                     69, 78, 84, 73]
ENTITY_DATA_END_RAW = [68, 65, 84, 65, 
                       83, 66, 80, 84]


def bfloat16_to_int(sgb_byte1: int, sgb_byte2: int) -> float:
    bfloat16_raw = ('0' * 8 + bin(sgb_byte2)[2:])[-8:] + \
        ('0' * 8 + bin(sgb_byte1)[2:])[-8:]
    
    sign = (-1) ** int(bfloat16_raw[0])
    exponent = int(bfloat16_raw[1:9], 2) - 127
    mantissa = bfloat16_raw[9:]

    if exponent > 0:
        if exponent > len(mantissa):
            exp_zeros = exponent - len(mantissa)

        else:
            exp_zeros = 0

        integer = int('1' + mantissa[:exponent] + '0' * exp_zeros, 2)
        fraction_raw = mantissa[exponent:]

    elif exponent < 0:
        integer = 0
        fraction_raw = '0' * (-1 * exponent) + mantissa

    else:
        integer = 1
        fraction_raw = mantissa

    fraction = 0
    for i in range(len(fraction_raw)):
        fraction += int(fraction_raw[i]) * 2 ** (-i-1)

    return sign * (integer + fraction)


def fetch_points(filename: str):
    res = dict()

    with open(f'maps/{filename}.sgb', 'rb') as f:
        data = f.read()

        obj_i = -1

        flag_i = -1
        relic_i = -1
        crit_i = -1
        slag_i = -1
        spawn_i = -1

        is_fetching_objects = False
        is_fetching_entities = False
        p = 0

        while True:
            if not is_fetching_objects:
                if [data[p+i] for i in range(8)] == OBJECT_DATA_HEADER_RAW:
                    is_fetching_objects = True

                    p += 8

            elif not is_fetching_entities:
                fetch_raw = [data[p+i] for i in range(26)]

                if fetch_raw[:11] == OBJECT_ROOT_RAW:
                    obj_i += 1

                    p += 11

                elif fetch_raw[:20] == CUT_FLAG_RAW:
                    flag_i = obj_i

                    res['flag'] = list()

                    p += 20

                elif fetch_raw[:12] == CUT_RELIC_RAW:
                    relic_i = obj_i

                    res['relic'] = list()

                    p += 12

                elif fetch_raw[:26] == CUT_CRIT_RAW:
                    crit_i = obj_i

                    res['crit'] = list()

                    p += 26

                elif fetch_raw[:16] == CUT_SLAG_RAW:
                    slag_i = obj_i

                    res['slag'] = list()

                    p += 16

                elif fetch_raw[:17] == CUT_SPAWN_RAW:
                    spawn_i = obj_i

                    res['spawn'] = list()

                    p += 17

                elif fetch_raw[:8] == ENTITY_DATA_HEADER_RAW:
                    is_fetching_entities = True

                    p += 8

            else:
                fetch_raw = [data[p+i] for i in range(8)]

                if fetch_raw == ENTITY_DATA_END_RAW:
                    break

                if fetch_raw == ENTITY_HEADER_RAW:
                    if data[p+24] == flag_i:
                        res['flag'].append([
                            int(bfloat16_to_int(data[p+66], data[p+67])),
                            int(bfloat16_to_int(data[p+74], data[p+75]))
                        ])

                    elif data[p+24] == relic_i:
                        res['relic'].append([
                            int(bfloat16_to_int(data[p+66], data[p+67])),
                            int(bfloat16_to_int(data[p+74], data[p+75]))
                        ])

                    elif data[p+24] == crit_i:
                        res['crit'].append([
                            int(bfloat16_to_int(data[p+66], data[p+67])),
                            int(bfloat16_to_int(data[p+74], data[p+75]))
                        ])

                    elif data[p+24] == slag_i:
                        res['slag'].append([
                            int(bfloat16_to_int(data[p+66], data[p+67])),
                            int(bfloat16_to_int(data[p+74], data[p+75]))
                        ])

                    elif data[p+24] == spawn_i:
                        res['spawn'].append([
                            int(bfloat16_to_int(data[p+66], data[p+67])),
                            int(bfloat16_to_int(data[p+74], data[p+75]))
                        ])

                    p += 76

            p += 1

    return res


def fetch_section(filename: str, 
                  header: list, end: list,
                  offset: int) -> list:
    res = list()
    
    with open(f'maps/{filename}.sgb', 'rb') as f:
        data = f.read()

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
            'color_map': list(img.getdata()),
            'points': fetch_points(filename)
        })

    except FileNotFoundError:
        return dumps({
            'width': size,
            'height': size,
            'height_map': height_map,
            'passability_map': passability_map,
            'points': fetch_points(filename)
        })
    
