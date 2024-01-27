'use client'
import { useEffect } from "react";
import { supabase } from "@/db";

//mobile screen size: 430 x 932

export default function Home() {
  useEffect(() => {
    // supabase.from("test").insert([{
    //   name: Date.now(),
    // }]).then((res) => {
    //   console.log(res)
    // })
  }, [])
  return (
    <main className="w-[430px] h-[932px] flex justify-center items-center bg-slate-100">
    </main>
  );
}
