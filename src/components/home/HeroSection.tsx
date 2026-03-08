import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden rounded-2xl mx-4 mt-4">
      <div className="relative h-48 sm:h-64 md:h-80 lg:h-[400px] xl:h-[480px] rounded-2xl overflow-hidden">
        <img
          src={heroBanner}
          alt="Delicious food spread"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/75 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 md:px-16">
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl md:text-5xl text-primary-foreground leading-tight max-w-md">
            Don't Wait,
            <br />
            <span className="text-gradient-gold">
              Grab It! ✨
            </span>
          </h1>
          <p className="mt-2 text-primary-foreground/80 text-sm sm:text-base max-w-sm">
            From your favourite restaurants, delivered to your door in minutes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
