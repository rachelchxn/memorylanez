from fastapi import FastAPI, HTTPException, Request
from dotenv import load_dotenv
from typing import List
from openai import OpenAI
import requests
import os
import base64
import json
from db import supabase
import io
from PIL import Image
import face_recognition
import numpy as np

load_dotenv()

client = OpenAI(api_key = os.getenv('OPENAI_API_KEY'))

client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")

app = FastAPI()

# given a album id, obtain all of the faces that belong to the album
def get_photo_album_images(user_id: str, photo_album_id: int) -> List[str]:
    photo_names = supabase.storage.from_("user_uploads").list(path=user_id + "/" + str(photo_album_id - 1))

    album_images = []
    for photo_name in photo_names:
        photo_path = user_id + "/" + str(photo_album_id - 1) + "/" + photo_name["name"]
        file = supabase.storage.from_("user_uploads").download(photo_path)
        with open("files/albums/" + photo_name["name"], "wb") as f:
            f.write(file)
            imageFileObj = open("files/albums/" + photo_name["name"], "rb")
            imageBinaryBytes = imageFileObj.read()
            imageStream = io.BytesIO(imageBinaryBytes)
            imageFile = Image.open(imageStream)
            newImageFile = imageFile.convert("RGB")

            album_images.append(newImageFile)

    return album_images


def get_faces():
    faces_names = supabase.storage.from_("user_faces").list("files")
    face_images = []
    for photo_name in faces_names:
        if photo_name["name"] == ".emptyFolderPlaceholder":
            continue
        photo_path = "files/" + photo_name["name"]
        file = supabase.storage.from_("user_faces").download(photo_path)
        with open("files/faces/" + photo_name["name"], "wb") as f:
            f.write(file)
            imageFileObj = open("files/faces/" + photo_name["name"], "rb")
            imageBinaryBytes = imageFileObj.read()
            imageStream = io.BytesIO(imageBinaryBytes)
            imageFile = Image.open(imageStream)
            newImageFile = imageFile.convert("RGB")

            face_images.append(newImageFile)
    return face_images

@app.post("/api/compare_faces")
async def compare_faces(request: Request):
    body = await request.json()

    photo_album_id = body.get("photo_album_id")
    user_id = body.get("user_id")
    # print(photo_album_id, user_id)
    album_photos = get_photo_album_images(user_id, photo_album_id)
    print("got album images")
    print("album photos", album_photos)

    faces = get_faces()
    print("got faces")

    for i, face in enumerate(faces):
        face.save("files/pil_faces/" + str(i) + ".png")
    print("saved pil faces")

    for i, album_photo in enumerate(album_photos):
        album_photo.save("files/pil_albums/" + str(i) + ".png")

    face_encodings = []
    for i, face in enumerate(faces):
        img = face_recognition.load_image_file("files/pil_faces/" + str(i) + ".png")
        encoding = face_recognition.face_encodings(img)[0]
        face_encodings.append(encoding)
    print(face_encodings)

    results = []
    for i, album in enumerate(album_photos):
        img = face_recognition.load_image_file("files/pil_albums/" + str(i) + ".png")
        encoding = face_recognition.face_encodings(img)[0]
        results = face_recognition.compare_faces(face_encodings, encoding)
    print(results)





@app.get("/api/python")
def hello_world():
    data, count = supabase.table('test').insert([{"name": "test"}]).execute()
    print(data, count)
    return {"message": "Hello World"}

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

    # Extract parameters from the request body
    limit = body.get("limit")
    min_energy = body.get("min_energy")
    max_energy = body.get("max_energy")
    target_valence = body.get("target_valence")
    genre = body.get("genre")
    track = body.get("track")

    # Extract token from the Authorization header
    token = get_token()

    # Construct the Spotify API request
    spotify_url = "https://api.spotify.com/v1/recommendations"
    params = {
        "limit": limit,
        "min_energy": min_energy,
        "max_energy": max_energy,
        "target_valence": target_valence,
        "seed_genres": genre,
        "seed_tracks": track,
    }
    headers = {"Authorization": f"Bearer {token}"}

    try:
        response = requests.get(spotify_url, headers=headers, params=params)
        response.raise_for_status()  # This will raise an HTTPError for non-200 responses
        return response.json()
    except requests.HTTPError as http_err:
        # Handle specific HTTP errors here
        raise HTTPException(status_code=response.status_code, detail=f"Error from Spotify API: {response.text}")
    except Exception as e:
        # Handle other exceptions here
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

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



@app.post("/api/vision")
async def describe_image(request: Request):
    body = await request.json()
    image_urls = body.get("image_urls")

    if not image_urls:
        raise HTTPException(status_code=400, detail="Image URLs are missing")

    if not isinstance(image_urls, list):
        raise HTTPException(status_code=400, detail="image_urls must be a list")

    # Build the content list with text and image URLs
    content_list = [{
        "type": "text",
        "text": "Rate all the images on a scale from 0.0 to 1.0 describing the positiveness conveyed in the images. The higher the more positive (e.g. happy, cheerful, euphoric), and the lower the more negative (e.g. sad, depressed, angry). Next, give the collection of images a title. Only give 1 value and 1 title for all of the images listed. Give your response in the format following this example: 0.5, A Walk in the Forest"
    }] + [{"type": "image_url", "image_url": {"url": url}} for url in image_urls]

    # Create a message with the built content list
    messages = [{"role": "user", "content": content_list}]
    print(messages)

    try:
        response = client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=messages,
            max_tokens=30,
        )
        return response.choices[0].message.content
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# # print(get_recommendations(1, 0.2, 1, 0.2, 1, "pop", get_token))
print("hi!")

print(get_token())

# # print(create_playlist("yku0io7ib9xoq0iakf7i56zjj", "testy test"))

