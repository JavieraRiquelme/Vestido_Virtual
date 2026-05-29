from flask import Blueprint, jsonify, request
from app.services.clima import sugerir_outfit, obtener_clima

clima_bp = Blueprint('clima', __name__)

@clima_bp.route('/clima', methods=['GET'])
def get_clima():
    ciudad = request.args.get('ciudad', 'Santiago')
    datos = obtener_clima(ciudad)
    return jsonify(datos)

@clima_bp.route('/outfit', methods=['GET'])
def get_outfit():
    ciudad = request.args.get('ciudad', 'Santiago')
    ocasion = request.args.get('ocasion', 'casual')
    datos = sugerir_outfit(ciudad, ocasion)
    return jsonify(datos)