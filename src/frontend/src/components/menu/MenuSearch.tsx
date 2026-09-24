import { Search, X } from "lucide-react";

interface MenuSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function MenuSearch({ value, onChange }: MenuSearchProps) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <label htmlFor="menu-search" className="sr-only">
        Search the menu
      </label>
      <input
        id="menu-search"
        type="search"
        data-ocid="menu.search_input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search dishes…"
        autoComplete="off"
        className="h-11 w-full rounded-full border border-input bg-card pl-10 pr-10 text-sm text-foreground shadow-warm transition-smooth placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value.length > 0 && (
        <button
          type="button"
          data-ocid="menu.search_clear_button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-2.5 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
