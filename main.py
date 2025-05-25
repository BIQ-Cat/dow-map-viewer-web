import os

from flask import Flask, render_template, request
from flask.helpers import redirect
from werkzeug.utils import secure_filename
from flask_login import LoginManager, current_user, login_required, login_user, logout_user

from data import db_session
from data.user import User
from data.map import Map

from forms.upload import UploadForm
from forms.user import LoginForm

from sgb_parser import get_data

app = Flask(__name__)
app.config['SECRET_KEY'] = 'LapplandTheDecaJessica'

db_session.global_init('db/userdata.db')

login_manager = LoginManager()
login_manager.init_app(app)

DEFAULT_NAMES = {'fata_morga', 'blood_river'}


@login_manager.user_loader
def load_user(user_id):
    db_sess = db_session.create_session()
    return db_sess.query(User).get(user_id)


@app.route('/map/<map_name>')
def load_map(map_name):
    uid = int(request.args.get("id", "-1"))
    if uid == -1:
        return get_data(map_name)
    else:
        return get_data(f'{uid}/{map_name}')


@login_required
@app.route('/map_new', methods=['GET', 'POST'])
def upload_map():
    form = UploadForm()
    if form.validate_on_submit():
        sgb = form.sgb_file.data
        
        filename_sgb = os.path.splitext(secure_filename(sgb.filename))[0]
        if filename_sgb in DEFAULT_NAMES:
            return render_template('form.html', title='Upload map', form=form, header='Dummy, we Already have That One')

        path_to_maps = os.path.join(app.root_path, 'maps', str(current_user.id)) 
        if not os.path.exists(path_to_maps):
            os.mkdir(path_to_maps)

        sgb.save(os.path.join(path_to_maps, filename_sgb + '.sgb'))

        tga = form.tga_file.data
        if tga is not None:
            tga.save(os.path.join(path_to_maps, filename_sgb + '.tga'))
        
        db_sess = db_session.create_session()
        
        possible_map = db_sess.query(Map).filter(Map.user_id == current_user.id, Map.map_name == form.name.data).first()
        if possible_map:
            possible_map.map_file = filename_sgb
        else:
            new_map = Map(map_name=form.name.data, map_file=filename_sgb, user_id=current_user.id)
            db_sess.add(new_map)
        
        db_sess.commit()
        return redirect('/')

    return render_template('form.html', title='Upload map', header='Add your Map, Heretic', form=form, enctype='multipart/form-data')


@app.route('/sing_up', methods=['GET', 'POST'])
def sing_up():
    form = LoginForm()
    if form.validate_on_submit():
        db_sess = db_session.create_session()
        if db_sess.query(User).filter(User.login == form.name.data).first():
            return render_template('form.html', title='Sing up', form=form, enctype='application/x-www-form-urlencoded', header='Holy Emperror! Such account already Exists')
        
        user = User(login=form.name.data)
        user.set_password(form.password.data)

        db_sess.add(user)
        db_sess.commit()
        return redirect('/log_in')
        
    return render_template('form.html', title='Sing up', header='Imperium Registration Service', form=form, enctype='application/x-www-form-urlencoded')


@app.route('/log_in', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        db_sess = db_session.create_session()
        user = db_sess.query(User).filter(User.login == form.name.data).first()
        if user and user.check_password(form.password.data):
            login_user(user, remember=True)
            return redirect("/")
        return render_template('form.html',
                               header='Do. Not. Try. To. Decieve. Me.',
                               form=form,
                               enctype='application/x-www-form-urlencoded')
    return render_template('form.html', title='Log in', header='Name Yourself, sinner', form=form, enctype='application/x-www-form-urlencoded')


@login_required
@app.route('/log_out')
def log_out():
    logout_user()
    return redirect('/')


@app.route('/index')
@app.route('/')
def index():
    maps = [('blood_river', 'Blood River', -1), ('fata_morga', 'Fata Morga', -1)]
    if current_user.is_authenticated:
        db_sess = db_session.create_session()
        maps.extend(map(lambda x: (x.map_file, x.map_name, x.user_id), db_sess.query(Map).filter(Map.user_id == current_user.id)))

    return render_template('index.html', title='DoW Map Viewer', maps=maps, show_map_menu=True)


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080)
