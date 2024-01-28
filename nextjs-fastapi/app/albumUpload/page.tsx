"use client";

import { supabase } from "@/db";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AddAlarmTwoTone } from "@mui/icons-material";

interface Track {
  id: string;
  name: string;
}

export default function Home() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [trackIds, setTrackIds] = useState<string[]>([]);

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

  const handleCreate = () => {
    // Assuming 'images' is an array and 'getVisionDescription' handles it accordingly
    getVisionDescription(images)
      .then((data) => {
        // Assuming 'data' is a string that contains comma-separated values
        const response = data.split(", ");
        getRecommendations(parseFloat(response[0]));
        setTrackIds(tracks.map(track => track.id));
      })
      .then(() => {
        uploadTrackIds(trackIds);
      })
      .catch((error) => {
        // Always good to have a catch for any errors in the promise chain
        console.error("Error in processing: ", error);
      });
  };

  const uploadTrackIds = async(trackIds: string[]) => {
    const { data, error }= await supabase.from("albums")
      .upsert(
        {
          owner: userProfile.id,
          tracks: trackIds,
        },
        {}
      )
      .select()
      .single();
    router.push('/album/'+ data.id);
  }

  const getVisionDescription = async (imageUrls: string[]) => {
    console.log(imageUrls);
    try {
      const response = await fetch("/api/vision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_urls: imageUrls }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      return data;
    } catch (error) {
      console.error("Error fetching vision description:", error);
    }
  };

  const getRecommendations = async (valence: GLfloat) => {
    console.log(valence);
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
      <div className="grid grid-cols-3 gap-4">
        {images.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`Uploaded ${index}`}
            className="w-full h-auto object-cover"
          />
        ))}
      </div>
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
            let newImages = [];

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
              newImages.push(pubUrlData.publicUrl);
            }
            setImages([...images, ...newImages]);
            console.log(images);

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
