from flask import Flask, render_template

from sgb_parser import get_map

app = Flask(__name__)


@app.route('/map/<map_name>')
def load_map(map_name):
    return get_map(map_name)


@app.route('/index')
@app.route('/')
def index():
    return render_template('index.html', title='DoW Map Viewer', maps=[('blood_river', 'Blood River'), ('fata_morga', 'Fata Morga')])

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080)
