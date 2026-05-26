from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(50), nullable=False)
    apellido = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(100), nullable=False)
    prendas = db.relationship('Prenda', backref='dueno', lazy=True)

class Prenda(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    imagen_path = db.Column(db.String(255), nullable=False)
    temperatura = db.Column(db.Float)
    humedad = db.Column(db.Float)
    user_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)