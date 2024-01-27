"use client";

import { supabase } from "@/db";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import { Button } from "@nextui-org/react";

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

    fetch(`/api/recommendations?${queryParams}`, {
      method: "POST",
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

  const router = useRouter();
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

  console.log(tracks)

  return (
    <main className="flex justify-center bg-bgbeige min-h-screen">
      <div className="relative max-w-lg flex-col justify-center w-full h-screen bg-photoalbum px-10 py-10">
        <div className="flex justify-center">
          <Button className="w-64 h-64 bg-placeholder rounded-full mb-5">
            <div className="flex justify-center p-28">
              <AddIcon className="text-burnt"/>
            </div>
          </Button>
        </div>
        <input
          id="upload"
          type="file"
          name="faceImage"
          className="bg-burnt text-white outline-none p-3 file:mr-5 w-full font-bold rounded-md"
          onChange={async (event) => {
            if (event.target.files && event.target.files[0] && userProfile) {
              const response = await supabase.storage
                .from("face_images")
                .upload(userProfile.id, event.target.files[0], {
                  cacheControl: "3600",
                  upsert: false,
                });

              if (response.error) {
                console.log(response.error);
                return;
              }

              const { data } = supabase.storage.from("face_images").getPublicUrl(userProfile.id);
              await supabase.from("users").upsert({
                face_image_path: "face_images" + "/" + userProfile.id,
                face_image: data.publicUrl,
                spotify_username: userProfile.id,
              });
              router.push("/albumUpload");
            }
          }}
        />
        <p className="text-center m-5">Please upload a photo of yourself.</p>
        <div className="flex flex-col justify-center items-center gap-2">
          {tracks &&
            tracks.map((track) => (
              <iframe
                key={track.id}
                src={`https://open.spotify.com/embed/track/${track.id}`}
                width="300"
                height="80"
                allow="encrypted-media"
              ></iframe>
            ))}
        </div>
      </div>
    </main>
  );
}
