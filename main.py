import json
from flask import Flask, render_template

from sgb_parser import get_map

app = Flask(__name__)


def get_test_map():
    with open('test/map.sgb', 'rb') as f:
        heightMap = f.read()
        print(len(heightMap))
        
        return {
            'width': int(len(heightMap) ** 0.5),
            'height': int(len(heightMap) ** 0.5),
            'height_map': list(map(int, heightMap)),
            'color_map': None
        }


@app.route('/map/<map_name>')
def load_map(map_name):
    return get_map(map_name)


@app.route('/index')
@app.route('/')
def index():
    return render_template('index.html', title='DoW Map Viewer', maps=[('blood_river', 'Blood River'), ('fata_morga', 'Fata Morga')])

@app.route('/test')
def test():
    gm = get_test_map()
    return render_template('map.html', width=800, height=450, gameMap=json.dumps(gm))


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080)
