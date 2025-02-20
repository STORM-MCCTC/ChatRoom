from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base
import json

app = FastAPI()

# Database setup
DATABASE_URL = "sqlite:///./chat.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Chat message model
class ChatMessage(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    message = Column(String)

Base.metadata.create_all(bind=engine)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    db = SessionLocal()

    try:
        # Send all past messages to the new user
        stored_messages = db.query(ChatMessage).all()
        for msg in stored_messages:
            await websocket.send_text(f"{msg.username} - {msg.message}")

        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            username = message_data.get("username", "Anonymous")
            message = message_data.get("message", "")

            formatted_message = f"{username} - {message}"

            # Save message to database
            db_message = ChatMessage(username=username, message=message)
            db.add(db_message)
            db.commit()

            # Broadcast message to all clients
            await manager.broadcast(formatted_message)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    finally:
        db.close()
