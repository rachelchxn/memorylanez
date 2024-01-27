"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/db";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

//mobile screen size: 430 x 932

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const searchParams = useSearchParams();

  const router = useRouter();

  async function signInWithSpotify() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "spotify",
    });
  }

  useEffect(() => {
    // getUser()

    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = urlParams.get("access_token");
    const providerAccessToken = urlParams.get("provider_token");
    if (accessToken && providerAccessToken && router) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("providerAccessToken", providerAccessToken);
      router.push("/home");
    }
  }, [router]);

  useEffect(() => {
    if (!selectedImage) return;
    // image upload snippet
    // supabase.storage.from("imageslol").upload("my-image.png", selectedImage, {
    //   cacheControl: "3600",
    //   upsert: false,
    // }).then((response) => {
    //   if (response.error) {
    //     console.log(response.error);
    //   }
    //   console.log("Uploaded file to object storage:", response);
    // });
  }, [selectedImage]);

  return (
    <main className="w-[430px] h-[932px] flex justify-center items-center bg-slate-100">
      <input
        type="file"
        name="myImage"
        onChange={(event) => {
          if (event.target.files && event.target.files[0]) {
            setSelectedImage(event.target.files[0]);
          }
        }}
      />
      <button onClick={signInWithSpotify}>Sign in with Spotify</button>
    </main>
  );
}
