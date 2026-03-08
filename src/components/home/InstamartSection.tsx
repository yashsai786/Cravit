import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { instamartItems } from "@/data/mockData";
import { useCart } from "@/contexts/CartContext";

const InstamartSection = () => {
  const { addItem } = useCart();
  const featured = instamartItems.filter((i) => i.inStock).slice(0, 4);

  return (
    <section className="px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-xl text-foreground">Instamart</h2>
            <span className="flex items-center gap-1 text-xs text-accent font-semibold bg-accent/10 px-2 py-0.5 rounded-full">
              <Clock className="h-3 w-3" /> 10 min delivery
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Everyday essentials, delivered fast</p>
        </div>
        <Link to="/instamart" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          See all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {featured.map((item) => (
          <div key={item.id} className="rounded-xl bg-card shadow-card p-3 flex flex-col">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-24 object-cover rounded-lg mb-2"
              loading="lazy"
            />
            <span className="text-xs text-muted-foreground">{item.unit}</span>
            <h4 className="font-medium text-sm text-foreground truncate">{item.name}</h4>
            <div className="flex items-center justify-between mt-auto pt-2">
              <span className="font-bold text-sm text-foreground">₹{item.price}</span>
              <button
                onClick={() =>
                  addItem(
                    { id: item.id, name: item.name, price: item.price, description: "", image: item.image, category: item.category, isVeg: true },
                    "instamart",
                    "Instamart"
                  )
                }
                className="text-xs font-bold text-accent border border-accent rounded-lg px-3 py-1 hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                ADD
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default InstamartSection;
