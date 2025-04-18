import json
from flask import Flask, render_template


app = Flask(__name__)


def get_test_map():
    with open("test/map.sgb", 'rb') as f:
        heightMap = f.read()
        
        return {
            "width": int(len(heightMap) ** 0.5),
            "height": int(len(heightMap) ** 0.5),
            "heightMap": list(map(int, heightMap)),
            "colorMap": None
        }


@app.route("/test")
def test():
    gm = get_test_map()
    return render_template("index.html", width=gm["width"], height=gm["height"], gameMap=json.dumps(gm))