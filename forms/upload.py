from flask_wtf import FlaskForm
from flask_wtf.file import FileRequired, FileField, FileAllowed
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired


class UploadForm(FlaskForm):
    name = StringField('Map name', validators=[DataRequired()])
    sgb_file = FileField('SGB file', validators=[FileRequired(), FileAllowed(['sgb'], 'SGB files only')])
    tga_file = FileField('TGA file (NOT MM, NOT LOGO)', validators=[FileAllowed(['tga'], 'TGA files only')])
    submit = SubmitField('Upload')

