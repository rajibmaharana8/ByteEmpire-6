
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Leaf, Shield, Activity, Globe, Zap, Database,
  ArrowRight, MapPin, AlertTriangle, TrendingUp, Users, Clock
} from "lucide-react";

const Home = () => {
  const [scrollY, setScrollY] = useState(0);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fade, setFade] = useState(true);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80",
      title: "NEURAL DEFORESTATION MONITORING",
      subtitle: "Tracking vegetation loss and soil damage in real-time using spectral AI"
    },
    {
      image: "https://images.unsplash.com/photo-1532300481631-0bc14f3b7699?auto=format&fit=crop&q=80",
      title: "ILLEGAL DUMPING SURVEILLANCE",
      subtitle: "Identifying unregulated industrial waste hotspots before they spread"
    },
    {
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80",
      title: "SUSTAINABLE LAND MANAGEMENT",
      subtitle: "AI-driven insights for municipal environmental protection"
    }
  ];

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);

    const slideInterval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setFade(true);
      }, 800);
    }, 6000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(slideInterval);
    };
  }, []);

  const stats = [
    { number: "98.4%", label: "Detection Accuracy" },
    { number: "24/7", label: "Neural Monitoring" },
    { number: "< 2s", label: "Inference Time" },
    { number: "SDG 15", label: "Life on Land" },
  ];

  const features = [
    {
      icon: <AlertTriangle className="w-6 h-6" />,
      title: "Illegal Dumping",
      desc: "AI-powered detection of unauthorized waste piles using YOLOv8 models.",
      bg: "rgba(16, 185, 129, 0.1)"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Satellite Vision",
      desc: "Multispectral analysis from planetary data to track land cover changes.",
      bg: "rgba(5, 150, 105, 0.1)"
    },
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "Forest Defense",
      desc: "Vegetation index tracking to quantify deforestation and urban sprawl.",
      bg: "rgba(4, 120, 87, 0.1)"
    }
  ];

  return (
    <div className="min-h-screen bg-bg-dark text-white overflow-hidden">
      {/* Hero Section with Parallax Slider */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${fade ? 'opacity-40' : 'opacity-0'}`}
          style={{
            backgroundImage: `url(${slides[currentSlide].image})`,
            transform: `scale(${1 + scrollY * 0.0005}) translateY(${scrollY * 0.2}px)`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-dark/20 via-bg-dark/60 to-bg-dark" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black tracking-[0.2em] uppercase mb-8">
            <Shield className="w-3 h-3" /> Earth Surveillance Protocol 04
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none animate-fade-in">
            {slides[currentSlide].title.split(' ').map((word, i) => (
              <span key={i} className={i % 2 !== 0 ? 'text-gradient block' : 'block'}>{word} </span>
            ))}
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-muted mb-12 mx-auto leading-relaxed">
            {slides[currentSlide].subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/landfill" className="glow-button px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3">
              Initiate Scan <ArrowRight className="w-4 h-4" />
            </Link>
            {user && (user.role === 'OFFICIAL' || user.role === 'ADMIN') && (
              <Link to="/gov-dashboard" className="bg-white/5 hover:bg-white/10 border border-white/10 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3">
                Intelligence Hub
              </Link>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="glass-panel p-6 border-white/5 hover:border-primary/30 transition-all group">
                <div className="text-3xl font-black text-white group-hover:text-primary mb-1">{stat.number}</div>
                <div className="text-[10px] text-muted font-bold tracking-widest uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto border-t border-white/5">
        <div className="flex flex-col md:flex-row gap-20 items-center mb-32">
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
              AUTONOMOUS <br />
              <span className="text-gradient">PERSPECTIVE</span> <br />
              ENGINEERING
            </h2>
            <p className="text-muted text-lg mb-10 leading-relaxed">
              EcoGuard Pro leverages a unique dual-mode inference engine. Our proprietary
              ResNet50 architecture analyzes satellite spectral data while YOLOv8 processes
              ground-level drone footage for unprecedented accuracy.
            </p>

            <div className="grid sm:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div key={i} className="glass-panel p-6 border-white/5 group hover:border-primary/20 transition-all">
                  <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4 group-hover:bg-primary/20 transition-all">
                    {f.icon}
                  </div>
                  <h4 className="font-bold text-sm mb-2">{f.title}</h4>
                  <p className="text-[11px] text-muted leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto mt-20">
          {/* Deforestation Card */}
          <div className="group relative bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-500/30 rounded-[2.5rem] p-10 hover:border-green-500 transition-all duration-500 hover:transform hover:scale-[1.02] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-green-500/30 transition shadow-[0_0_20px_rgba(0,255,136,0.2)]">
                <Leaf className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-3xl font-black mb-6">Forest Cover Indexing</h3>
              <p className="text-white/60 mb-8 text-sm leading-relaxed">
                Monitor vegetation loss, track forest degradation, and analyze land cover changes over time using proprietary spectral bands.
              </p>
              <ul className="space-y-3 mb-12 flex-grow">
                {["Temporal Comparison", "Neural Heatmapping", "Severity Scoring"].map((item, i) => (
                  <li key={i} className="flex items-center text-xs font-bold text-white/80 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 shadow-[0_0_8px_var(--primary)]" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/deforestation" className="w-full bg-green-500 hover:bg-green-400 text-bg-dark font-black py-5 rounded-2xl transition-all text-center uppercase tracking-widest text-xs">
                Analyze Deforestation
              </Link>
            </div>
          </div>

          {/* Landfill Card */}
          <div className="group relative bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-[2.5rem] p-10 hover:border-primary transition-all duration-500 hover:transform hover:scale-[1.02] overflow-hidden">
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-primary/30 transition shadow-[0_0_20px_rgba(0,242,255,0.2)]">
                <AlertTriangle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-3xl font-black mb-6">Landfill Identification</h3>
              <p className="text-white/60 mb-8 text-sm leading-relaxed">
                Identify illegal dumping sites and soil contamination hotspots using computer vision models trained on tactical imagery.
              </p>
              <ul className="space-y-3 mb-12 flex-grow">
                {["Tactical AI Detection", "Contamination Mapping", "Response Dispatch"].map((item, i) => (
                  <li key={i} className="flex items-center text-xs font-bold text-white/80 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 shadow-[0_0_8px_var(--primary)]" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/landfill" className="w-full bg-primary hover:bg-primary/80 text-bg-dark font-black py-5 rounded-2xl transition-all text-center uppercase tracking-widest text-xs">
                Detect Landfills
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-white/5 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 rounded-full blur-[120px] -z-10" />
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <span className="text-2xl font-black font-mono tracking-tighter">ECOGUARD PRO</span>
        </div>
        <p className="text-[10px] text-muted uppercase tracking-[0.5em] font-bold">Hackathon 2026 Edition // Advanced Agentic AI</p>
      </footer>
    </div>
  );
};

export default Home;
