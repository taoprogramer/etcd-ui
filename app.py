import traceback
from flask import Flask, jsonify, request, render_template
from etcd import Client, EtcdKeyNotFound

app = Flask(__name__)

cli = Client(host='localhost', port=4001)

to_json = lambda node: dict([(attr, getattr(node, attr)) for attr in node._node_props])


@app.route('/')
def base():
    # this is the base html
    return render_template('base.html')


@app.route('/keys', methods=['GET', 'PUT', 'DELETE'])
def proxy():
    if request.method == 'GET':
        key = request.args.get('key', '')
        try:
            context = {}
            node = cli.read(key)
            context.update(to_json(node))
            context.update(children=[to_json(child) for child in node.children])
            return jsonify(**context)
        except EtcdKeyNotFound:
            return jsonify({})
 
    if request.method == 'PUT':
        key = request.get_json().get('key', '')
        value = request.get_json().get('value', '')
        ttl = request.get_json().get('ttl', '')
        dirc = True if request.get_json().get('dir', '') == 'true' else False
        try:
            cli.write(key=key, value=value, ttl=ttl, dir=dirc)
            return '', 201
        except:
            return '', 400

    if request.method == 'DELETE':
        key = request.args.get('key', '')
        dirc = True if request.args.get('dir', '') == 'true' else False
        recursive = True if dirc else False
        try:
            cli.delete(key, dir=dirc, recursive=recursive)
            return '', 201
        except:
            print traceback.format_exc()
            return '', 400


if __name__ == '__main__':
    app.run()
