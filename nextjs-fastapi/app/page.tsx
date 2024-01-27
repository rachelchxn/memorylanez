'use client'
import { useEffect, useState } from "react";
import { supabase } from "@/db";

//mobile screen size: 430 x 932

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

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
  }, [selectedImage])

  return (
    <main className="w-[430px] h-[932px] flex justify-center items-center bg-slate-100">
      <input
        type="file"
        name="myImage"
        onChange={(event) => {
          if (event.target.files && event.target.files[0]){
            setSelectedImage(event.target.files[0]);
          }
        }}
      />
    </main>
  );
}
