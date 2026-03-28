import { Link } from "react-router-dom";
import { Star, Clock } from "lucide-react";
import type { Restaurant } from "@/data/mockData";

const RestaurantCard = ({ restaurant }: { restaurant: any }) => {
  const { id, name, cuisine, rating, deliveryTime, costForTwo, image, discount, promoted, isVeg } = restaurant;

  return (
    <Link
      to={`/restaurant/${id}`}
      className="group block rounded-[2.5rem] overflow-hidden glass-card hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl shadow-premium relative"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        
        {discount && (
          <div className="absolute top-4 right-4 bg-gradient-hero text-white text-[9px] font-black px-4 py-2 rounded-xl shadow-xl uppercase tracking-widest animate-pulse">
            {discount}
          </div>
        )}
        
        {isVeg && (
          <div className="absolute top-4 left-4 p-1.5 rounded-xl glass border-emerald-500/30 flex items-center gap-2 shadow-xl">
             <div className="h-3 w-3 rounded-full bg-emerald-500 border-2 border-white/20 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
             <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest pr-1">Organic</span>
          </div>
        )}
      </div>

      <div className="p-8">
        <div className="flex items-start justify-between mb-2">
           <h3 className="font-display font-black text-xl text-foreground truncate italic uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors">{name}</h3>
           <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-lg">
              <Star className="h-3.5 w-3.5 fill-current" />
              <span className="text-[10px] font-black italic">{rating}</span>
           </div>
        </div>
        
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate mb-6">{cuisine.join(", ")}</p>
        
        <div className="flex items-center justify-between pt-6 border-t border-foreground/5">
           <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-widest">{deliveryTime}</span>
           </div>
           <p className="text-[10px] font-black text-foreground italic uppercase tracking-tighter">₹{costForTwo} <span className="text-muted-foreground text-[8px] tracking-widest ml-1">/ UNIT</span></p>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
