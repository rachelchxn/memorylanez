from fastapi import FastAPI
from db import supabase

app = FastAPI()

@app.get("/api/python")
def hello_world():
    data, count = supabase.table('test').insert([{"name": "test"}]).execute()
    print(data, count)
    return {"message": "Hello World"}
