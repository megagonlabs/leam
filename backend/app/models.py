from app import db

class Dataset(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), index=True, unique=True)
    type = db.Column(db.String(10))
    num_rows = db.Column(db.Integer)
    version = db.Column(db.Integer)
    header = db.Column(db.String)

    def to_json(self):
      json_dataset = {
        'name': self.name,
        'header': self.header,
        'num_rows': self.num_rows
      }
      return json_dataset

    def __repr__(self):
        return '<Dataset {}>'.format(self.name)





