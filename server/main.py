from fastapi import FastAPI

app = FastAPI()


@app.get("/ping")
async def ping():
  return {"ping": "pong"}

@app.get("/")
async def root():
  return {"message": "Hello World"}