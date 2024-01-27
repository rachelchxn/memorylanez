"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/db";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import orange from "../public/circle.png";
import pink from "../public/ROSE.png";
import Image from "next/image";

import { Button } from "@nextui-org/react";
import spotify from "../public/spotify.png"
//mobile screen size: 430 x 932

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const searchParams = useSearchParams();

  const router = useRouter();

  async function signInWithSpotify() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "spotify",
      options: {
        scopes:
          "playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public",
      },
    });
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = urlParams.get("access_token");
    const providerAccessToken = urlParams.get("provider_token");
    if (accessToken && providerAccessToken && router) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("providerAccessToken", providerAccessToken);

      router.push("/faceUpload");
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
    <main className="flex justify-center bg-bgbeige min-h-screen">
        <div className="relative max-w-lg flex-col w-full h-screen bg-photoalbum px-10 py-[24rem] overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-5xl font-serif font-bold my-5 text-center">Memory Lanez</h1>
            <div className="flex justify-center">
              <div className="relative z-10 overflow-hidden">
                <Button 
                  startContent={<Image src={spotify} height={50} width={50} alt="Spotify"/>}
                  onClick={signInWithSpotify}
                  className="bg-burnt rounded-md font-medium text-white tracking-widest"
                >
                  SIGN IN WITH SPOTIFY
                </Button>
              </div>
            </div>
          </div>
          <div className="-m-[32rem] -z-20">
              <Image width={2000} src={orange} alt=""/>
          </div>
          <div className="-my-[80rem] ml-0 -mr-[30rem] -z-10">
              <Image width={1500} src={pink} alt=""/>
          </div>
        </div>
      </main>
  );
}
