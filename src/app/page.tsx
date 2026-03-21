import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Categories from "@/components/Categories";
import Nominees from "@/components/Nominees";
import Jury from "@/components/Jury";
import Winners from "@/components/Winners";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Categories />
        <Nominees />
        <Jury />
        <Winners />
      </main>
      <Footer />
    </>
  );
}
