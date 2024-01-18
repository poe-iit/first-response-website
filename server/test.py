from main import app
from fastapi.testclient import TestClient
# Instantiate the TestClient with our app
client = TestClient(app)

def test_ping():
  # Make a get request to the /ping endpoint
  response = client.get("/ping")
  # Check that the response was successful
  assert response.status_code == 200
  assert response.json() == {"ping": "pong"}
  print("ping test passed")

def test_root():
  # Make a get request to the / endpoint
  response = client.get("/")
  # Check that the response was successful
  assert response.status_code == 200
  assert response.json() == {"message": "Hello World"}
  print("root test passed")

test_ping()
test_root()

