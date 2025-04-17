from flask import Flask, render_template


app = Flask(__name__)


def get_test_map():
    data = {
        "width": 9,
        "height": 9,
        "heightMap": [70, 30, 40, 0, 20, 0, 7, 20, 6, 70, 30, 40, 0, 20, 0, 7, 20, 6, 70, 30, 40, 0, 20, 0, 7, 20, 6, 70, 30, 40, 0, 20, 0, 7, 20, 6, 70, 30, 40, 0, 20, 0, 7, 20, 6, 70, 30, 40, 0, 20, 0, 7, 20, 6, 70, 30, 40, 0, 20, 0, 7, 20, 6, 70, 30, 40, 0, 20, 0, 7, 20, 6, 70, 30, 40, 0, 20, 0, 7, 20, 6],
        "colorMap": None
    }


@app.route("/test")
def test():
    return render_template("index.html", width="800", height="450")