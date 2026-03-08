import { Link } from "react-router-dom";
import { Star, Clock } from "lucide-react";
import type { Restaurant } from "@/data/mockData";

const RestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => {
  const { id, name, cuisine, rating, deliveryTime, costForTwo, image, discount, promoted } = restaurant;

  return (
    <Link
      to={`/restaurant/${id}`}
      className="group block rounded-2xl overflow-hidden bg-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {discount && (
          <div className="absolute bottom-2 left-2 bg-gradient-hero text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-md">
            {discount}
          </div>
        )}
        {promoted && (
          <div className="absolute top-2 left-2 bg-foreground/70 text-card text-[10px] font-medium px-2 py-0.5 rounded">
            PROMOTED
          </div>
        )}
      </div>

      <div className="p-3.5">
        <h3 className="font-display font-bold text-foreground truncate">{name}</h3>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-xs font-semibold bg-accent text-accent-foreground px-1.5 py-0.5 rounded">
            <Star className="h-3 w-3 fill-current" /> {rating}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {deliveryTime}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 truncate">{cuisine.join(", ")}</p>
        <p className="text-xs text-muted-foreground">₹{costForTwo} for two</p>
      </div>
    </Link>
  );
};

export default RestaurantCard;
