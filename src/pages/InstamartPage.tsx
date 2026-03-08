import { useState } from "react";
import Header from "@/components/layout/Header";
import { instamartItems, instamartCategories } from "@/data/mockData";
import { useCart } from "@/contexts/CartContext";
import { Clock, Search } from "lucide-react";

const InstamartPage = () => {
  const [activeCategory, setActiveCategory] = useState("Fruits & Vegetables");
  const [search, setSearch] = useState("");
  const { addItem, items, updateQuantity } = useCart();

  const filtered = instamartItems.filter(
    (i) => i.category === activeCategory && i.name.toLowerCase().includes(search.toLowerCase())
  );

  const getQty = (id: string) => items.find((i) => i.id === id)?.quantity || 0;

  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <main className="container max-w-6xl pb-20">
        <div className="px-4 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="font-display font-extrabold text-2xl text-foreground">Instamart</h1>
            <span className="flex items-center gap-1 text-xs text-accent font-semibold bg-accent/10 px-2 py-0.5 rounded-full">
              <Clock className="h-3 w-3" /> Delivery in 10 min
            </span>
          </div>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search groceries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="flex mt-4">
          {/* Sidebar categories */}
          <aside className="w-40 shrink-0 border-r pr-2 pl-4">
            {instamartCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeCategory === cat ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
                  }`}
              >
                {cat}
              </button>
            ))}
          </aside>

          {/* Items grid */}
          <div className="flex-1 px-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map((item) => {
                const qty = getQty(item.id);
                return (
                  <div key={item.id} className={`rounded-xl bg-card shadow-card p-3 flex flex-col ${!item.inStock ? "opacity-50" : ""}`}>
                    <img src={item.image} alt={item.name} className="w-full h-24 object-cover rounded-lg mb-2" loading="lazy" />
                    <span className="text-xs text-muted-foreground">{item.unit}</span>
                    <h4 className="font-medium text-sm text-foreground truncate">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-sm text-foreground">₹{item.price}</span>
                      {item.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">₹{item.originalPrice}</span>
                      )}
                    </div>
                    <div className="mt-auto pt-2">
                      {!item.inStock ? (
                        <span className="text-xs text-destructive font-medium">Out of stock</span>
                      ) : qty === 0 ? (
                        <button
                          onClick={() =>
                            addItem({ id: item.id, name: item.name, price: item.price, description: "", image: item.image, category: item.category, isVeg: true }, "instamart", "Instamart")
                          }
                          className="w-full text-xs font-bold text-accent border border-accent rounded-lg py-1.5 hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          ADD
                        </button>
                      ) : (
                        <div className="flex items-center justify-center bg-accent rounded-lg overflow-hidden">
                          <button onClick={() => updateQuantity(item.id, qty - 1)} className="px-3 py-1.5 text-accent-foreground text-xs font-bold">−</button>
                          <span className="px-2 text-sm font-bold text-accent-foreground">{qty}</span>
                          <button onClick={() => updateQuantity(item.id, qty + 1)} className="px-3 py-1.5 text-accent-foreground text-xs font-bold">+</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <p className="col-span-full text-center py-10 text-muted-foreground text-sm">No items found</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstamartPage;
