from flask import Flask, render_template

app = Flask(__name__)

APP_ID = "216549914fe64df491b0fa67b0934dca"

@app.route('/')
def index():
    return render_template('index.html', app_id=APP_ID)

if __name__ == "__main__":
    app.run(debug=True)
