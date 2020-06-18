from app import db

class Dataset(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), index=True, unique=True)
    first_row = db.Column(db.String(200))

    def __repr__(self):
        return '<Dataset {}>'.format(self.name)





