import torch, os, json, firebase_admin
import numpy as np
from torch import optim, nn
from torch.utils.data import DataLoader, TensorDataset
from sklearn.model_selection import train_test_split
from deeplearning import CNN1DRegression, CNN1DRegression_gyro
from copy import deepcopy
from firebase_admin import credentials, db
from dotenv import load_dotenv


def getDataFromDB(name):
    """
    firebase에서 data를 가져와 반환
    :param name: firebase에서 가져올 data name
    :return: firebase에서 가져온 data
    """
    load_dotenv()
    print("Name is", name)

    cred = credentials.Certificate(
        {
            "type": os.environ.get("type"),
            "project_id": os.environ.get("project_id"),
            "private_key_id": os.environ.get("private_key_id"),
            "private_key": os.environ.get("private_key"),
            "client_email": os.environ.get("client_email"),
            "client_id": os.environ.get("client_id"),
            "auth_uri": os.environ.get("auth_uri"),
            "token_uri": os.environ.get("token_uri"),
            "auth_provider_x509_cert_url": os.environ.get(
                "auth_provider_x509_cert_url"
            ),
            "client_x509_cert_url": os.environ.get("client_x509_cert_url"),
            "universe_domain": os.environ.get("universe_domain"),
        }
    )
    firebase_admin.initialize_app(cred, {"databaseURL": os.environ.get("databaseURL")})

    ref = db.reference().child(name)
    data = ref.get()

    return data


def getBasedData():
    """
    based data들을 읽어 tensor로 반환
    :return: feature tensor, true tensor
    """
    X_list, y_list = [], []

    for filename in os.listdir("data"):
        if filename.endswith(".json"):
            with open(os.path.join("data", filename), "r", encoding="utf-8") as file:
                cur_data = json.load(file)
                X, y = preprocessing(cur_data)
                X_list.append(X)
                y_list.append(y)

    X_tensor = torch.cat(X_list, dim=0)
    y_tensor = torch.cat(y_list, dim=0)

    return X_tensor, y_tensor


def preprecessing_accumdata(data):
    copy = data

    del copy["name"]
    del copy["password"]

    for d in copy:
        for item in copy[d]:
            if "row" in item:
                del item["row"]
                del item["col"]

    dataset = []
    y = []

    for d in copy:
        for item in copy[d]:
            if (
                len(item["acc_x"]) < 20
                or len(item["acc_y"]) < 20
                or len(item["acc_z"]) < 20
            ):
                continue
            acc_x20 = item["acc_x"][-20:]
            acc_y20 = item["acc_y"][-20:]
            acc_z20 = item["acc_z"][-20:]
            li = [acc_x20, acc_y20, acc_z20]
            ly = [item["x"], item["y"]]
            dataset.append(li)
            y.append(ly)
    np_dataset = np.array(dataset, dtype=np.float32)
    y_dataset = np.array(y, dtype=np.float32)

    X = torch.Tensor(np_dataset)
    y = torch.Tensor(y_dataset)

    return X, y


def preprocessing(data):
    """
    데이터 전처리
    :param data: 전처리할 data
    :return: 전처리된 X_tensor, y_tensor
    """
    copy = data

    del copy["name"]
    del copy["password"]

    dataset = []
    y = []

    for d in copy:
        for item in copy[d]:
            if (
                len(item["acc_x"]) < 20
                or len(item["acc_y"]) < 20
                or len(item["acc_z"]) < 20
            ):
                continue

            acc_x20 = item["acc_x"][-20:]
            acc_y20 = item["acc_y"][-20:]
            acc_z20 = item["acc_z"][-20:]

            li = [acc_x20, acc_y20, acc_z20]
            ly = [item["x"], item["y"]]

            dataset.append(li)
            y.append(ly)

    np_dataset = np.array(dataset, dtype=np.float32)
    y_dataset = np.array(y, dtype=np.float32)

    X = torch.Tensor(np_dataset)
    y = torch.Tensor(y_dataset)

    return X, y


def preprocessingWithGyro(data):
    """
    데이터 전처리
    :param data: 전처리할 data
    :return: 전처리된 X_tensor, y_tensor
    """
    copy = data

    del copy["name"]
    del copy["password"]

    for d in copy:  # series1['0']
        for item in copy[d]:
            del item["row"]
            del item["col"]

    dataset = []
    y = []
    copy = {int(k): v for k, v in copy.items()}

    for d in copy:
        for item in copy[d]:
            if (
                len(item["acc_x"]) < 20
                or len(item["acc_y"]) < 20
                or len(item["acc_z"]) < 20
                or len(item["gyro_x"]) < 20
                or len(item["gyro_y"]) < 20
                or len(item["gyro_z"]) < 20
            ):
                continue

            acc_x20 = item["acc_x"][-20:]
            acc_y20 = item["acc_y"][-20:]
            acc_z20 = item["acc_z"][-20:]
            gyro_x20 = item["gyro_x"][-20:]
            gyro_y20 = item["gyro_y"][-20:]
            gyro_z20 = item["gyro_z"][-20:]

            li = [acc_x20, acc_y20, acc_z20, gyro_x20, gyro_y20, gyro_z20]
            ly = [item["x"], item["y"]]

            dataset.append(li)
            y.append(ly)

    np_dataset = np.array(dataset, dtype=np.float32)
    y_dataset = np.array(y, dtype=np.float32)

    X = torch.Tensor(np_dataset)
    y = torch.Tensor(y_dataset)

    return X, y


def concatData(x1, x2):
    """
    두 tensor을 합침
    :param x1: 합칠 tensor1
    :param x2: 합칠 tensor2
    :return: 합쳐진 tensor
    """
    return torch.cat([x1, x2], dim=0)


def getDataLoader(X, y):
    """
    train_loader와 valid_loader을 반환, test_size=0.2
    :param X: feature Tensor
    :param y: true Tensor
    :return: train_loader, valid_loader
    """
    X_train, X_valid, y_train, y_valid = train_test_split(X, y, test_size=0.2)

    train_dataloader = DataLoader(
        TensorDataset(X_train, y_train), batch_size=8, shuffle=True, drop_last=True
    )
    valid_dataloader = DataLoader(
        TensorDataset(X_valid, y_valid), batch_size=8, shuffle=True, drop_last=True
    )

    return train_dataloader, valid_dataloader


def pred_val(name, data):
    """
    User model이 있으면 그 model로, 없으면 base model을 가져와 pred값 반환
    :param name: user name
    :param data: 입력 data
    :return: pred_value(left: x좌표, top: y좌표)
    """
    if len(data["acc_x"]) < 20 or len(data["acc_y"]) < 20 or len(data["acc_z"]) < 20:
        return -1

    acc_x20 = data["acc_x"][-20:]
    acc_y20 = data["acc_y"][-20:]
    acc_z20 = data["acc_z"][-20:]

    li = [acc_x20, acc_y20, acc_z20]
    li = np.array(li, dtype=np.float32)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = CNN1DRegression(2).to(device)
    X = torch.Tensor(li).view([-1, 3, 20]).to(device)
    path = "./model/" + name + "_model.pth"

    if os.path.exists(path):
        model.load_state_dict(torch.load(path))
    else:
        model.load_state_dict(torch.load("./dlbestmodel.pth"))

    with torch.no_grad():
        model.eval()
        outputs = model(X)  # torch.Size([1, 2])

    result = {"left": outputs[0][0].to("cpu"), "top": outputs[0][1]}
    return result


def pred_val_with_Gyro(name, data):
    """
    User model이 있으면 그 model로, 없으면 base model을 가져와 pred값 반환
    :param name: user name
    :param data: 입력 data
    :return: pred_value(left: x좌표, top: y좌표)
    """
    if (
        len(data["acc_x"]) < 20
        or len(data["acc_y"]) < 20
        or len(data["acc_z"]) < 20
        or len(data["gyro_x"]) < 20
        or len(data["gyro_y"]) < 20
        or len(data["gyro_z"]) < 20
    ):
        return -1

    acc_x20 = data["acc_x"][-20:]
    acc_y20 = data["acc_y"][-20:]
    acc_z20 = data["acc_z"][-20:]
    gyro_x20 = data["gyro_x"][-20:]
    gyro_y20 = data["gyro_y"][-20:]
    gyro_z20 = data["gyro_z"][-20:]

    li = [acc_x20, acc_y20, acc_z20, gyro_x20, gyro_y20, gyro_z20]
    li = np.array(li, dtype=np.float32)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = CNN1DRegression_gyro(2).to(device)
    X = torch.Tensor(li).view([-1, 6, 20]).to(device)
    path = "./model/" + name + "_model.pth"

    if os.path.exists(path):
        model.load_state_dict(torch.load(path))
    else:
        model.load_state_dict(torch.load("./dlbestmodel2.pth"))

    with torch.no_grad():
        model.eval()
        outputs = model(X)  # torch.Size([1, 2])

    result = {"left": outputs[0][0].to("cpu"), "top": outputs[0][1]}
    return result


def pred_num(result):
    """
    버튼의 index값 반환
    :param result: x, y 좌표
    :return: Button Index value
    """
    # col
    try:
        if result["left"] >= 9 and result["left"] <= 175:
            col = 0
        elif result["left"] > 175 and result["left"] <= 215:
            col = 1
        elif result["left"] > 215 and result["left"] <= 381:
            col = 2
        else:
            col = -1

        # row
        if result["top"] >= 0 and result["top"] <= 336:
            row = 0
        elif result["top"] > 336 and result["top"] <= 456:
            row = 1
        elif result["top"] > 456 and result["top"] <= 636:
            row = 2
        else:
            row = -1

        if row == -1 or col == -1:
            return {"result": -1}

        return {"result": row * 3 + col}
    except TypeError:
        return -1


def makeCustomModel(name, data):
    """
    User가 서비스를 이용할동안 쌓은 data를 가져와 User Model을 만듦
    :param name: user's name
    :param data: user's data
    :return: if make custom model Successful, Success Message else Error message
    """
    user_X, user_y = preprocessing(data)
    based_X, based_y = getBasedData()
    X = concatData(based_X, user_X)
    y = concatData(based_y, user_y)
    train_dataloader, valid_dataloader = getDataLoader(X, y)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = CNN1DRegression(2).to(device)
    criterion = nn.L1Loss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    num_epochs = 1000
    best_model = None
    best_val_loss = np.inf
    patience = 100
    cur_patience = 0

    for epoch in range(1, num_epochs + 1):
        for inputs, targets in train_dataloader:
            model.train()
            inputs = inputs.to(device)
            targets = targets.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()

        with torch.no_grad():
            model.eval()
            val_loss = 0

            for inputs, targets in valid_dataloader:
                inputs = inputs.to(device)
                targets = targets.to(device)
                outputs = model(inputs)
                val_loss += criterion(outputs, targets).item()
            val_loss /= len(valid_dataloader)

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            cur_patience = 0
            best_model = deepcopy(model.state_dict())

        else:
            cur_patience += 1
            if cur_patience >= patience:
                print(f"Early stop at epoch {epoch}, loss is {best_val_loss}")
                break

    path = "./model/" + name + "_model.pth"
    torch.save(best_model, path)

    return "Modeling Completed!"
