"use client";

import { supabase } from "@/db";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AddAlarmTwoTone } from "@mui/icons-material";
import orange from "../../public/circle.png";
import pink from "../../public/ROSE.png";
import Image from "next/image";
import { Button, Link } from "@nextui-org/react";

interface Track {
  id: string;
  name: string;
}

interface photoAlbum {
  id: number;
}

export default function Home() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");
  const [photoAlbum, setPhotoAlbum] = useState<photoAlbum | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function createPhotoAlbum() {
      const res = await fetch("/api/get_profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: localStorage.getItem("providerAccessToken"),
        }),
      });

      const data = await res.json();

      setUserProfile(data);

      const { data: albumData, error } = await supabase
        .from("albums")
        .upsert({
          owner: data.id,
        })
        .select()
        .single();

      setPhotoAlbum(albumData);
    }
    createPhotoAlbum();
  }, []);

  const handleCreate = async () => {
    try {
      const { data: completeData, error: completeError } = await supabase
        .from("albums")
        .upsert(
          {
            id: photoAlbum?.id,
            images: images,
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

      const visionResponse = await getVisionDescription(images);
      const valenceResponse = visionResponse.split(", ");
      await getRecommendations(parseFloat(valenceResponse[0]));

      // Update state and wait for the next render to ensure trackIds are updated
      setTitle(valenceResponse[1]);
      fetch("/api/compare_faces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userProfile.id,
          photo_album_id: photoAlbum?.id,
        }),
      });
    } catch (error) {
      console.error("Error in processing: ", error);
      return; // Early exit on error
    }

    // Use useEffect to respond to trackIds change
  };

  useEffect(() => {
    if (!photoAlbum) return;
    const uploadTrackIds = async (trackIds: string[], title: string) => {
      try {
        const { data, error } = await supabase
          .from("albums")
          .upsert(
            {
              id: photoAlbum.id,
              owner: userProfile.id,
              tracks: trackIds,
              title: title,
            },
            {}
          )
          .select()
          .single();

        if (error) throw error;

        router.push("/albums/" + data.id);
      } catch (error) {
        console.error("Error in uploading track IDs: ", error);
      }
    };
    if (tracks.length > 0) {
      const trackIds = tracks.map((track) => track.id);
      uploadTrackIds(trackIds, title);
    }
  }, [tracks, title, router, userProfile]); // Depend on trackIds

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
        limit: 3,
        min_energy: 0.0,
        max_energy: 1.0,
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

  console.log("photoAlbum", photoAlbum);
  console.log("userProfile", userProfile);

  return (
    <main className="flex justify-center bg-bgbeige min-h-screen">
      <div className="relative max-w-lg flex-col justify-center w-full h-screen bg-photoalbum px-10 py-10 overflow-hidden">
        <div className="h-[100%]">
          <Link href="/library">Back</Link>
          <div className="grid grid-cols-3 gap-4 p-4 bg-[#ede7e2] h-[50%] mb-8">
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
            className="absolute"
            multiple
            onChange={async (event) => {
              if (event.target.files && userProfile) {
                let images_uploaded = [] as string[];
                let newImages = [];
                for (let i = 0; i < event.target.files.length; i++) {
                  const file = event.target.files[i];
                  const res = await supabase.storage
                    .from(`user_uploads/${userProfile.id}/${photoAlbum?.id}`)
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
                    .from(`user_uploads/${userProfile.id}/${photoAlbum?.id}`)
                    .getPublicUrl(i.toString());
                  images_uploaded.push(pubUrlData.publicUrl);
                  newImages.push(pubUrlData.publicUrl);
                }
                setImages([...images, ...newImages]);
                console.log(images);
                const { data: completeData, error: completeError } =
                  await supabase
                    .from("albums")
                    .upsert(
                      {
                        id: photoAlbum?.id,
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

          <Button
            disabled={images.length == 0}
            className="text-lg py-6 px-6 w-[100%] mt-20 "
            onClick={handleCreate}
          >
            Create Album
          </Button>
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

        {/* <div className="-m-[64rem] -z-30">
          <Image width={2000} src={orange} alt="" />
        </div>
        <div className="-my-[105rem] ml-0 -mr-[10rem] -z-10">
          <Image width={1500} src={pink} alt="" />
        </div> */}
      </div>
    </main>
  );
}
