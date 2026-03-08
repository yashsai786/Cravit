import { useParams, Link } from "react-router-dom";
import { Star, Clock, ArrowLeft, Plus, Minus } from "lucide-react";
import { restaurants } from "@/data/mockData";
import { useCart } from "@/contexts/CartContext";
import Header from "@/components/layout/Header";
import { useState } from "react";

const RestaurantPage = () => {
  const { id } = useParams<{ id: string }>();
  const restaurant = restaurants.find((r) => r.id === id);
  const { items, addItem, updateQuantity } = useCart();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-transparent">
        <Header />
        <div className="container max-w-4xl py-20 text-center">
          <p className="text-lg text-muted-foreground">Restaurant not found</p>
          <Link to="/" className="text-primary font-medium mt-4 inline-block">Go back home</Link>
        </div>
      </div>
    );
  }

  const categories = [...new Set(restaurant.menu.map((m) => m.category))];
  const displayCategory = activeCategory || categories[0];

  const getCartQty = (itemId: string) => items.find((i) => i.id === itemId)?.quantity || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="w-full max-w-[1280px] mx-auto pb-20 px-4">
        {/* Hero */}
        <div className="relative h-48 sm:h-64 mt-4 rounded-2xl overflow-hidden mx-4">
          <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
          <Link to="/" className="absolute top-4 left-4 h-8 w-8 rounded-full bg-card/80 flex items-center justify-center backdrop-blur-sm">
            <ArrowLeft className="h-4 w-4 text-foreground" />
          </Link>
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-primary-foreground">{restaurant.name}</h1>
            <p className="text-primary-foreground/80 text-sm mt-1">{restaurant.cuisine.join(", ")}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1 text-xs font-semibold bg-accent text-accent-foreground px-2 py-0.5 rounded">
                <Star className="h-3 w-3 fill-current" /> {restaurant.rating}
              </span>
              <span className="flex items-center gap-1 text-xs text-primary-foreground/80">
                <Clock className="h-3 w-3" /> {restaurant.deliveryTime}
              </span>
              <span className="text-xs text-primary-foreground/80">₹{restaurant.costForTwo} for two</span>
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-4 px-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${displayCategory === cat ? "bg-foreground text-card" : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu items */}
        <section className="px-4 space-y-3">
          {restaurant.menu
            .filter((m) => m.category === displayCategory)
            .map((item) => {
              const qty = getCartQty(item.id);
              return (
                <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-card shadow-card animate-fade-in">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`h-4 w-4 rounded border-2 flex items-center justify-center text-[8px] font-bold ${item.isVeg ? "border-accent text-accent" : "border-destructive text-destructive"}`}>
                        ●
                      </span>
                      {item.isBestseller && (
                        <span className="text-[10px] font-bold text-primary">★ BESTSELLER</span>
                      )}
                    </div>
                    <h3 className="font-display font-semibold text-foreground mt-1">{item.name}</h3>
                    <p className="font-bold text-foreground text-sm">₹{item.price}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                    {item.customizations && (
                      <p className="text-[10px] text-muted-foreground mt-1">customizable</p>
                    )}
                  </div>
                  <div className="relative shrink-0 w-28">
                    <img src={item.image} alt={item.name} className="w-28 h-24 object-cover rounded-xl" loading="lazy" />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                      {qty === 0 ? (
                        <button
                          onClick={() => addItem(item, restaurant.id, restaurant.name)}
                          className="bg-card text-accent font-bold text-sm border border-accent rounded-lg px-5 py-1.5 shadow-card hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          ADD
                        </button>
                      ) : (
                        <div className="flex items-center bg-accent rounded-lg overflow-hidden shadow-card">
                          <button onClick={() => updateQuantity(item.id, qty - 1)} className="px-2.5 py-1.5 text-accent-foreground hover:bg-accent/80">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-sm font-bold text-accent-foreground">{qty}</span>
                          <button onClick={() => updateQuantity(item.id, qty + 1)} className="px-2.5 py-1.5 text-accent-foreground hover:bg-accent/80">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </section>
      </main>
    </div>
  );
};

export default RestaurantPage;
