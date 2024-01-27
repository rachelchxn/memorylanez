from fastapi import FastAPI, HTTPException, Request
# from db import supabase
from dotenv import load_dotenv
from typing import List
import requests
import os
import base64
import json

from openai import OpenAI

load_dotenv()

client = OpenAI(api_key = os.getenv('OPENAI_API_KEY'))

client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")

app = FastAPI()

# @app.get("/api/python")
# def hello_world():
#     data, count = supabase.table('test').insert([{"name": "test"}]).execute()
#     print(data, count)
#     return {"message": "Hello World"}

@app.post("/api/get_profile")
async def get_profile(request: Request):
    body = await request.json()
    token = body.get("token")
    if not token:
        raise HTTPException(status_code=400, detail="Token is missing")

    url = "https://api.spotify.com/v1/me"
    headers = {
        "Authorization": "Bearer " + token
    }
    result = requests.get(url, headers=headers)
    json_result = json.loads(result.content)
    return json_result

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

@app.post("/api/recommendations")
async def get_recommendations(request: Request):
    body = await request.json()
    token = body.get("token")
    print("token", token)
    if not token:
        raise HTTPException(status_code=400, detail="Token is missing")

    url = "https://api.spotify.com/v1/recommendations?seed_artists=4NHQUGzhtTLFvgF5SZesLK&seed_genres=classical%2Ccountry&seed_tracks=0c6xIDDpzE81m2q797ordA"
    headers = {
        "Authorization": "Bearer " + token
    }
    result = requests.get(url, headers=headers)
    json_result = json.loads(result.content)
    return json_result

@app.post("/api/create_playlist")
def create_playlist(user_id: str, playlist_name: str):
    token = "BQBvA2Zfoqpzc5m9fK0y8kqG_J58pf7mCtk8t-W8gbqV0qzh_eZoacUqgQ1tm7xNFM9-djp3WLEIKBBIRNnZLO3nXINJdaEqeB-Ua5cPxMsNRJB5WY9boJr9pczD_zmAbKXt4wejvbKMhM18inG4NGuez-008GqVEwgtoIiJ8FQft2Em2VCGLK4k7Y1tAGCw4EctViIj4MxokZ8o0T7Ioqu6PKhwbUG5-xGyJ3qbzn2XMF-3zm14R5GvD0omKTY1jca_dmTP4Ulhnr207IA"
    url = f"https://api.spotify.com/v1/users/{user_id}/playlists"
    headers = get_auth_header(token)
    payload = {"name": playlist_name, "public": True}  # Example payload

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

# #     response = requests.get(url, headers=headers, params=params)
# #     recommendations = response.json()
# #     return recommendations

# # @app.post("/api/create_playlist")
# # def create_playlist(user_id: str, token: str, name: str, public: bool = True, description: str = ""):
# #     url = f"https://api.spotify.com/v1/users/{user_id}/playlists"
# #     headers = get_auth_header(token)
# #     payload = {
# #         "name": name,
# #         "public": public,
# #         "description": description
# #     }

# #     response = requests.post(url, headers=headers, json=payload)
# #     return response.json()


# @app.post("/api/vision")
# def describe_image(image_url):
#     response = client.chat.completions.create(
#     model="gpt-4-vision-preview",
#     messages=[
#         {
#         "role": "user",
#         "content": [
#             {"type": "text", "text": "Rate the image on a scale from 0.0 to 1.0 describing the positiveness conveyed by the image. The higher the more positive (e.g. happy, cheerful, euphoric), and the lower themore negative (e.g. sad, depressed, angry). Only answer with the number rating, no other words or punctuation."},
#             {
#             "type": "image_url",
#             "image_url": {
#                 "url": image_url,
#             },
#             },
#         ],
#         }
#     ],
#     max_tokens=300,
#     )

    return(response.choices[0])

# token = get_token()

# print(describe_image("https://media.cntraveler.com/photos/60e612ae0a709e97d73d9c60/1:1/w_3840,h_3840,c_limit/Beach%20Vacation%20Packing%20List-2021_GettyImages-1030311160.jpg"))
# print(describe_image("https://media.cntraveler.com/photos/60e612ae0a709e97d73d9c60/1:1/w_3840,h_3840,c_limit/Beach%20Vacation%20Packing%20List-2021_GettyImages-1030311160.jpg"))

# # print(get_recommendations(1, 0.2, 1, 0.2, 1, "pop", get_token))

# # print(token)

# # print(create_playlist("yku0io7ib9xoq0iakf7i56zjj", "testy test"))

# print(add_tracks_to_playlist("4ADsGrKrtqZhdvbE5YBWpB", "BQBvA2Zfoqpzc5m9fK0y8kqG_J58pf7mCtk8t-W8gbqV0qzh_eZoacUqgQ1tm7xNFM9-djp3WLEIKBBIRNnZLO3nXINJdaEqeB-Ua5cPxMsNRJB5WY9boJr9pczD_zmAbKXt4wejvbKMhM18inG4NGuez-008GqVEwgtoIiJ8FQft2Em2VCGLK4k7Y1tAGCw4EctViIj4MxokZ8o0T7Ioqu6PKhwbUG5-xGyJ3qbzn2XMF-3zm14R5GvD0omKTY1jca_dmTP4Ulhnr207IA", ["spotify:track:7CyPwkp0oE8Ro9Dd5CUDjW"]))

