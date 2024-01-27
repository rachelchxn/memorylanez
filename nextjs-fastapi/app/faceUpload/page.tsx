"use client";

import { supabase } from "@/db";
import { useEffect, useState } from "react";

interface Track {
  id: string;
  name: string;
}

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    console.log("hi!");
    const queryParams = new URLSearchParams({
      limit: "3",
      min_energy: "0.5",
      max_energy: "0.8",
      target_valence: "0.7",
      genre: "pop",
      track: "2tHiZQ0McWbtuWaax3dh4P",
    });

    const token = localStorage.getItem("providerAccessToken");
    console.log("TOKEN " + token);

    fetch(`/api/recommendations?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
      },
      body: JSON.stringify({
        token: localStorage.getItem("providerAccessToken"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setTracks(data.tracks);
      });
  }, []);

  const [userProfile, setUserProfile] = useState<any>(null);
  useEffect(() => {
    console.log(localStorage.getItem("providerAccessToken"));
    fetch("/api/get_profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: localStorage.getItem("providerAccessToken"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setUserProfile(data);
      });
  }, []);

  return (
    <main className="w-[430px] h-[932px] flex justify-center items-center bg-slate-100">
      <input
        type="file"
        name="faceImage"
        onChange={(event) => {
          if (event.target.files && event.target.files[0] && userProfile) {
            supabase.storage
              .from("face_images")
              .upload(userProfile.id, event.target.files[0], {
                cacheControl: "3600",
                upsert: false,
              })
              .then((response) => {
                if (response.error) {
                  console.log(response.error);
                  return;
                }
                console.log("Uploaded file to object storage:", response);
                supabase
                  .from("users")
                  .upsert({
                    face_image: "face_images/" + userProfile.id + ".png",
                    spotify_username: userProfile.id,
                  })
                  .then((response: any) => {
                    if (response.error) {
                      console.log(response.error);
                      return;
                    }
                    console.log("Updated user profile with face image");
                  });
              });
          }
        }}
      />
      {tracks.map((track) => (
        <iframe
          key={track.id}
          src={`https://open.spotify.com/embed/track/${track.id}`}
          width="300"
          height="80"
          frameBorder="0"
          allow="encrypted-media"
        ></iframe>
      ))}
    </main>
  );
}
