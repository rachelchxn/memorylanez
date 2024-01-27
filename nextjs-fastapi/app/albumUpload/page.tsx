"use client";

import { supabase } from "@/db";
import { useEffect, useState } from "react";

interface Track {
  id: string;
  name: string;
}

export default function Home() {
  const [userProfile, setUserProfile] = useState<any>(null);

  const [tracks, setTracks] = useState<Track[]>([]);

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

  console.log(userProfile);

  const handleCreate = () => {
    const imageUrl =
      "https://wallpapers.com/images/featured/sad-boi-pictures-p17bwxvlc2ci55gw.jpg";
    getVisionDescription(imageUrl).then((description) => {
      getRecommedations(description.message.content as GLfloat);
    });
  };

  const getVisionDescription = async (imageUrl: string) => {
    try {
      const response = await fetch("/api/vision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_url: imageUrl }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching vision description:", error);
    }
  };

  const getRecommedations = async (valence: GLfloat) => {
    console.log("hi!");

    const token = localStorage.getItem("providerAccessToken");

    fetch("/api/recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
      },
      body: JSON.stringify({
        limit: "3",
        min_energy: "0.0",
        max_energy: "1.0",
        target_valence: valence,
        genre: "pop",
        track: "2tHiZQ0McWbtuWaax3dh4P",
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setTracks(data.tracks);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  return (
    <main className="w-[430px] h-[932px] flex flex-col justify-center items-center bg-slate-100">
      <input
        type="file"
        name="userUpload"
        multiple
        onChange={async (event) => {
          if (event.target.files && userProfile) {
            const { data, error } = await supabase
              .from("albums")
              .upsert(
                {
                  owner: userProfile.id,
                },
                {}
              )
              .select()
              .single();

            let images_uploaded = [] as string[];

            for (let i = 0; i < event.target.files.length; i++) {
              const file = event.target.files[i];
              const res = await supabase.storage
                .from(`user_uploads/${userProfile.id}/${data.id}`)
                .upload(i.toString(), file, {
                  cacheControl: "3600",
                  upsert: false,
                });
              if (res.error) {
                console.log(res.error);
                return;
              }
              console.log("Uploaded file to object storage:", res);
              const { data: pubUrlData } = await supabase.storage
                .from(`user_uploads/${userProfile.id}/${data.id}`)
                .getPublicUrl(i.toString());
              images_uploaded.push(pubUrlData.publicUrl);
              // await supabase
              //   .from("albums")
              //   .upsert({
              //     face_image: "face_images/" + userProfile.id + ".png",
              //     spotify_username: userProfile.id,
              //   })
            }
            console.log(images_uploaded);

            const { data: completeData, error: completeError } = await supabase
              .from("albums")
              .upsert(
                {
                  images: images_uploaded,
                  owner: userProfile.id,
                },
                {}
              )
              .select()
              .single();

            if (completeError) {
              console.log(completeError);
              return;
            }
          }
        }}
      />

      <button onClick={handleCreate}>Create Album</button>

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
    </main>
  );
}
