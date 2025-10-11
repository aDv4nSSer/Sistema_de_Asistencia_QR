from fastapi.testclient import TestClient
from main import app  # ajusta el import a tu estructura

client = TestClient(app)

def test_login():
    login_data = {
        "username": "usuario_prueba",
        "password": "contraseña_prueba"
    }
    response = client.post("/token", data=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
