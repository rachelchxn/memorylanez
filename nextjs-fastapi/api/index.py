from fastapi import FastAPI
# from db import supabase
from dotenv import load_dotenv
from typing import List
import requests
import os
import base64
import json

load_dotenv()

client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")

app = FastAPI()

# @app.get("/api/python")
# def hello_world():
#     data, count = supabase.table('test').insert([{"name": "test"}]).execute()
#     print(data, count)
#     return {"message": "Hello World"}

@app.get("/api/token")
def get_token():
    auth_string = client_id + ":" + client_secret
    auth_bytes = auth_string.encode("utf-8")
    auth_base64 = str(base64.b64encode(auth_bytes), "utf-8")

    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": "Basic " + auth_base64,
        "Content-Type": "application/x-www-form-urlencoded"
    }

    data = {"grant_type": "client_credentials"}
    result = requests.post(url, headers=headers, data=data)
    json_result = json.loads(result.content)
    token = json_result["access_token"]
    return token

@app.get("/api/recommendations")
def get_recommendations(limit: int, min_energy: int, max_energy: int, min_danceability: int, max_danceability: int, genre: str, token: str):
    token = get_token()
    url = "https://api.spotify.com/v1/recommendations"
    headers = get_auth_header(token)
    params = {
        "limit": 1,
        "market": ["US", "CA"],
        "max_energy" : 0.3,
        "min_popularity": 88,
        "seed_genres": genre
    }

    response = requests.get(url, headers=headers, params=params)
    recommendations = response.json()
    return recommendations

@app.post("/api/create_playlist")
def create_playlist(user_id: str, token: str, name: str, public: bool = True, description: str = ""):
    url = f"https://api.spotify.com/v1/users/{user_id}/playlists"
    headers = get_auth_header(token)
    payload = {
        "name": name,
        "public": public,
        "description": description
    }

    response = requests.post(url, headers=headers, json=payload)
    return response.json()

@app.post("/api/add_tracks")
def add_tracks_to_playlist(playlist_id: str, token: str, track_uris: List[str]):
    url = f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks"
    headers = get_auth_header(token)
    payload = {
        "uris": track_uris
    }

    response = requests.post(url, headers=headers, json=payload)
    return response.json()

def get_auth_header(token):
    return {"Authorization": "Bearer " + token}

token = get_token()

print(get_recommendations(1, 0.2, 1, 0.2, 1, "pop", get_token))
