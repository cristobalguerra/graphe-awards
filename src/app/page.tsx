"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Categories from "@/components/Categories";
import Nominees from "@/components/Nominees";
import JuryPanel from "@/components/JuryPanel";
import Jury from "@/components/Jury";
import Winners from "@/components/Winners";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";

export default function Home() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <Nominees />
        <JuryPanel />
        <Jury />
        <Winners />
      </main>
      <Footer />
    </>
  );
}
