import json
from flask import Flask, render_template


app = Flask(__name__)


def get_test_map():
    with open("test/map.sgb", 'rb') as f:
        heightMap = f.read()
        print(len(heightMap))
        
        return {
            "width": int(len(heightMap) ** 0.5),
            "height": int(len(heightMap) ** 0.5),
            "height_map": list(map(int, heightMap)),
            "color_map": None
        }


@app.route("/test")
def test():
    gm = get_test_map()
    return render_template("index.html", width=800, height=450, gameMap=json.dumps(gm))


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080)
