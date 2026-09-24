import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/format";
import type { Category } from "@/types";

export type CategoryFilter = Category | "all";

interface CategoryTabsProps {
  active: CategoryFilter;
  onChange: (filter: CategoryFilter) => void;
}

const TABS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  ...CATEGORY_ORDER.map((category) => ({
    value: category as CategoryFilter,
    label: CATEGORY_LABELS[category],
  })),
];

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter dishes by category"
      data-ocid="menu.category_tabs"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {TABS.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-ocid={`menu.category.tab.${tab.value}`}
            onClick={() => onChange(tab.value)}
            className={
              isActive
                ? "shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-warm transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                : "shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            }
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
