import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden rounded-[3rem] mx-6 mt-10 shadow-premium group">
      <div className="relative h-64 sm:h-80 md:h-[400px] lg:h-[500px] rounded-[3rem] overflow-hidden">
        <img
          src={heroBanner}
          alt="Delicious food spread"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
          loading="eager"
        />
        {/* Dynamic Theme Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-center px-12 sm:px-20 md:px-24">
          <div className="p-1 px-3 rounded-lg bg-primary/20 border border-primary/30 w-fit mb-6 animate-in slide-in-from-left duration-500">
             <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Institutional Grade Logistics</p>
          </div>
          <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-foreground leading-none max-w-2xl italic uppercase tracking-tighter">
            Don't Wait,
            <br />
            <span className="text-gradient-hero drop-shadow-[0_0_30px_rgba(255,107,53,0.3)]">
              Grab It! ✨
            </span>
          </h1>
          <p className="mt-6 text-muted-foreground text-sm sm:text-lg max-w-lg font-black leading-relaxed uppercase tracking-tight opacity-80">
            From your favorite local kitchens, delivered to your operational coordinate in minutes.
          </p>
          <div className="mt-10 flex gap-4">
             <button className="px-10 h-14 rounded-2xl bg-gradient-hero text-white font-display font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">Command Now</button>
             <button className="px-10 h-14 rounded-2xl glass text-foreground font-display font-black text-xs uppercase tracking-widest hover:bg-foreground/10 transition-all shadow-premium">Explore Sectors</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
