import Navbar from "@/components/Navbar";
import Link from "next/link";
import { BookOpen, Video, FileText, ArrowRight, Sparkles, ShieldCheck, GraduationCap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass bg-white/5 border-white/10 text-indigo-400 text-sm font-semibold mb-8 backdrop-blur-md animate-pulse-slow">
            <Sparkles size={16} />
            අලුත් Generation එකේ Learning Experience එක
          </div>

          <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tight font-outfit text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 leading-tight">
            ඔබේ Learning Journey එක <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500">
              අදම Start කරන්න
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl mb-12 leading-relaxed">
            උසස් තත්ත්වයේ courses සහ technical updates ලබාගන්න.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/video-courses"
              className="w-full sm:w-auto px-10 py-5 rounded-3xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] shadow-white/20 active:scale-95 flex items-center justify-center gap-3"
            >
              අදම එක්වන්න <ArrowRight size={20} />
            </Link>
            <Link
              href="/articles"
              className="w-full sm:w-auto px-10 py-5 rounded-3xl glass text-white font-bold text-lg hover:bg-white/10 transition-all active:scale-95 border border-white/10 flex items-center justify-center gap-3"
            >
              විස්තර බලන්න
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full -z-10 animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 blur-[120px] rounded-full -z-10 animate-pulse-slow delay-75" />
      </section>

      {/* Categories Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Articles",
              desc: "තාක්ෂණය සහ වෘත්තීය දියුණුව පිළිබඳ articles රාශියක්.",
              icon: FileText,
              color: "from-blue-500 to-cyan-400",
              href: "/articles",
            },
            {
              title: "Text Courses",
              desc: "ඕනෑම වේලාවක කියවා අවබෝධ කරගත හැකි Text Courses.",
              icon: BookOpen,
              color: "from-indigo-500 to-blue-600",
              href: "/text-courses",
            },
            {
              title: "Video Courses",
              desc: "ඉහළ ගුණාත්මක Video මගින් ප්‍රායෝගිකව ඉගෙන ගන්න.",
              icon: Video,
              color: "from-violet-600 to-fuchsia-500",
              href: "/video-courses",
            },
          ].map((cat, i) => {
            const Icon = cat.icon;
            return (
              <Link
                key={i}
                href={cat.href}
                className="group p-8 rounded-[2rem] glass-card flex flex-col items-start gap-4"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 ${cat.color}`}>
                  <Icon className="text-white" size={32} />
                </div>
                <h3 className="text-2xl font-bold font-outfit mt-4 text-white">{cat.title}</h3>
                <p className="text-gray-400 leading-relaxed">{cat.desc}</p>
                <div className="mt-auto pt-6 flex items-center gap-2 text-indigo-400 font-semibold group-hover:gap-4 transition-all">
                  දැන්ම බලන්න <ArrowRight size={18} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto py-12 glass rounded-[3rem] border-white/5 flex flex-wrap items-center justify-center gap-12 md:gap-24 text-gray-400 px-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-indigo-400" />
            <span className="font-semibold text-white/80">Secured Payments</span>
          </div>
          <div className="flex items-center gap-3">
            <GraduationCap className="text-violet-400" />
            <span className="font-semibold text-white/80">Verified Courses</span>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="text-blue-400" />
            <span className="font-semibold text-white/80">Continuous Updates</span>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/5 text-center text-gray-500 text-sm glass mt-auto">
        <p>© 2026 Latent Learning Spaze (Sri Lanka). All Rights Reserved.</p>
        <div className="mt-4 flex justify-center gap-6">
          <Link href="#" className="hover:text-white transition-colors">Terms and Conditions</Link>
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
