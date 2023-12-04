from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, Path
from starlette.middleware.cors import CORSMiddleware
from typing import List
from datetime import datetime
from util import pred_val, pred_num, getDataFromDB, makeCustomModel
import json, random, argparse

app = FastAPI()

# CORS
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConnectionManager:
    """
    WebSocket Class
    """

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):  # 웹소켓 연결 대기
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):  # 특정 웹소켓 해제
        self.active_connections.remove(websocket)

    async def send_message(self, message: str, websocket: WebSocket):  # 특정 웹소켓에 메시지 전달
        await websocket.send_text(message)


manager = ConnectionManager()


@app.get("/")
async def main():
    return "Hello World!"


@app.websocket("/ws/{client_id}")
async def websocket_endpoint2(websocket: WebSocket, client_id):
    await manager.connect(websocket)
    print(websocket)
    now = datetime.now()
    cur_time = now.strftime("%H:%M")
    try:
        while True:
            data = await websocket.receive_text()
            if type(data) == str:
                print(data)
                if data[0] == "{":
                    result = pred_val(client_id, json.loads(data))
                    print(result)
                    result = pred_num(result)
                    print(result)
                    await manager.send_message(json.dumps((result)), websocket)
                else:
                    print("good")
            else:
                message = {"time": cur_time, "clientId": client_id, "message": data}
                try:
                    await manager.send_message(json.dumps(message), websocket)
                except json.decoder.JSONDecodeError as e:
                    print(e)

    except WebSocketDisconnect:
        try:
            await manager.send_message(json.dumps(message), websocket)
            message = {"time": cur_time, "clientId": client_id, "message": "Offline"}
            manager.disconnect(websocket)
        except:  # 서버에서 firbase에서 가져와 머신러닝 돌리기
            # 비동기 처리를 위해 따로 모델링 서버가 필요
            # print("WebSocket Disconnect... Modeling")
            # data = getDataFromDB(client_id)
            # makeCustomModel(client_id, data)


def argparser():
    parser = argparse.ArgumentParser()
    parser.add_argument("--https", required=True)
    config = parser.parse_args()
    return config


if __name__ == "__main__":
    import uvicorn

    config = argparser()
    print(config.https)
    if config.https == "True":
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8000,
            ssl_keyfile="./mainServerKey/server.key",
            ssl_certfile="./mainServerKey/server.crt",
        )
    else:
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8001,
        )
