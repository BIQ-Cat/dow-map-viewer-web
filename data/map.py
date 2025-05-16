import datetime

import sqlalchemy as sa
from .db_session import SqlAlchemyBase


class Map(SqlAlchemyBase):
    __tablename__ = 'maps'

    id = sa.Column(sa.Integer, 
                   primary_key=True, autoincrement=True)
    map_file = sa.Column(sa.String)
    map_name = sa.Column(sa.String)
    user_id = sa.Column(sa.Integer, 
                        sa.ForeignKey('users.id'))
    modified_date = sa.Column(sa.DateTime,
                              default=datetime.datetime.now)
    