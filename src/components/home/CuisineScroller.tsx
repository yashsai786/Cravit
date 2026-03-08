import { cuisineFilters } from "@/data/mockData";

interface Props {
  active: string;
  onSelect: (c: string) => void;
}

const CuisineScroller = ({ active, onSelect }: Props) => {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-4 px-4">
      {cuisineFilters.map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            active === c
              ? "bg-foreground text-card"
              : "bg-secondary text-secondary-foreground hover:bg-muted"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
};

export default CuisineScroller;
