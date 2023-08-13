from flask import Flask, render_template
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('join')
def handle_join(data):
    room = data['room']
    socketio.join_room(room)
    socketio.emit('peer_joined', room=room, broadcast=True)

@socketio.on('offer')
def handle_offer(data):
    socketio.emit('answer', data['sdp'], room=data['room'], broadcast=True)

@socketio.on('ice_candidate')
def handle_ice_candidate(data):
    socketio.emit('ice_candidate', data, room=data['room'], broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)
