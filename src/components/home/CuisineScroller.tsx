import { cuisineFilters } from "@/data/mockData";

interface Props {
  active: string;
  onSelect: (c: string) => void;
}

const CuisineScroller = ({ active, onSelect }: Props) => {
  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide py-8 px-6">
      {cuisineFilters.map((c) => {
        const isActive = active === c;
        return (
          <button
            key={c}
            onClick={() => onSelect(c)}
            className={`shrink-0 px-8 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              isActive
                ? "bg-primary text-white border-primary shadow-xl shadow-primary/30 scale-105"
                : "glass text-muted-foreground border-foreground/5 hover:border-foreground/20 hover:text-foreground"
            }`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
};

export default CuisineScroller;
