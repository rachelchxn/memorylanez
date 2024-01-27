"use client";

import { supabase } from "@/db";
import { useEffect, useState } from "react";

export default function Home() {
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

  console.log(userProfile);

  const handleCreate = () => {
    const imageUrl =
      "https://wallpapers.com/images/featured/sad-boi-pictures-p17bwxvlc2ci55gw.jpg";
    getVisionDescription(imageUrl).then((description) => {
      console.log(description.message.content);
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

  return (
    <main className="w-[430px] h-[932px] flex justify-center items-center bg-slate-100">
      <input
        type="file"
        name="userUpload"
        multiple
        onChange={async (event) => {
          if (event.target.files && userProfile) {
            const {data, error} = await supabase.from("albums").upsert({
              owner: userProfile.id,
            }, {}).select().single();

            let images_uploaded = [] as string[]

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
              const {data: pubUrlData} = await supabase.storage.from(`user_uploads/${userProfile.id}/${data.id}`).getPublicUrl(i.toString())
              images_uploaded.push(pubUrlData.publicUrl);
              // await supabase
              //   .from("albums")
              //   .upsert({
              //     face_image: "face_images/" + userProfile.id + ".png",
              //     spotify_username: userProfile.id,
              //   })
            }
            console.log(images_uploaded)

            const {data: completeData, error: completeError} = await supabase.from("albums").upsert({
              images: images_uploaded,
              owner: userProfile.id,
            }, {}).select().single();

            if (completeError) {
              console.log(completeError);
              return;
            }
          }}}
      />

      <button onClick={handleCreate}>Create Album</button>
    </main>
  );
}
