from flask import Flask, request, jsonify
from models import db, Usuario, Prenda
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///datos.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/uploads'

db.init_app(app)
@app.route('/subir_prenda', methods=['POST'])
def subir_prenda():

    if 'file' not in request.files:
        return jsonify({"error": "No hay archivo"}), 400
    
    file = request.files['file']
    user_id = request.form.get('user_id')
    
    if file:
        filename = secure_filename(file.filename)
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])
            
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        nueva_prenda = Prenda(
            imagen_path=filepath, 
            user_id=user_id,
            temperatura=request.form.get('temp'),
            humedad=request.form.get('hum')
        )
        db.session.add(nueva_prenda)
        db.session.commit()
        
        return jsonify({"message": "¡Prenda guardada!", "ruta": filepath}), 201
if __name__ == '__main__':
    app.run(debug=True)
