import datetime

from flask_login import UserMixin
import sqlalchemy as sa
from werkzeug.security import generate_password_hash, check_password_hash

from .db_session import SqlAlchemyBase


class User(SqlAlchemyBase, UserMixin):
    __tablename__ = 'users'

    id = sa.Column(sa.Integer, 
                   primary_key=True, autoincrement=True)
    login = sa.Column(sa.String)
    hashed_password = sa.Column(sa.String)
    modified_date = sa.Column(sa.DateTime,
                              default=datetime.datetime.now)

    def set_password(self, password):
        self.hashed_password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.hashed_password, password)
