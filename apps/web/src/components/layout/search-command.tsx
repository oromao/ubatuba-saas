"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Command as CommandPrimitive } from "cmdk";
import { CornerDownLeft, Search, Map, FileText } from "lucide-react";
import { getFlatNavItemsByRole } from "@/components/layout/nav-config";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

type SearchResult = {
  id: string;
  title: string;
  description?: string;
  category: "parcela" | "page";
  href?: string;
};

export function SearchCommand() {
  const router = useRouter();
  const pathname = usePathname();
  const { userRole } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const flatNavItems = React.useMemo(() => getFlatNavItemsByRole(userRole), [userRole]);

  // Search function that calls backend
  const performSearch = React.useCallback(async (q: string) => {
    setQuery(q);
    if (!q || q.trim().length < 2) {
      setResults(flatNavItems.map((item) => ({
        id: item.href,
        title: item.label,
        description: item.section,
        category: "page" as const,
        href: item.href,
      })));
      return;
    }

    setIsSearching(true);
    try {
      // Search parcels by SQLU, inscription, or address
      const parcels = await apiFetch<any[]>("/ctm/parcels?q=" + encodeURIComponent(q));
      const parcelResults: SearchResult[] = (parcels || []).slice(0, 5).map((p) => ({
        id: p._id,
        title: `${p.sqlu}${p.inscricaoImobiliaria ? ` - ${p.inscricaoImobiliaria}` : ""}`,
        description: p.mainAddress || p.enderecoPrincipal?.logradouro || "Lote/Imóvel",
        category: "parcela" as const,
        href: `/app/ctm/parcelas/${p._id}`,
      }));

      // Combine with page results
      const pageResults = flatNavItems.filter((item) =>
        `${item.label} ${item.section} ${(item.keywords ?? []).join(" ")}`.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 5).map((item) => ({
        id: item.href,
        title: item.label,
        description: item.section,
        category: "page" as const,
        href: item.href,
      }));

      setResults([...parcelResults, ...pageResults]);
    } catch (error) {
      // Fallback to page search if API fails
      const pageResults = flatNavItems.filter((item) =>
        `${item.label} ${item.section} ${(item.keywords ?? []).join(" ")}`.toLowerCase().includes(q.toLowerCase())
      ).map((item) => ({
        id: item.href,
        title: item.label,
        description: item.section,
        category: "page" as const,
        href: item.href,
      }));
      setResults(pageResults);
    } finally {
      setIsSearching(false);
    }
  }, [flatNavItems]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
        if (!open) setResults(flatNavItems.map((item) => ({
          id: item.href,
          title: item.label,
          description: item.section,
          category: "page" as const,
          href: item.href,
        })));
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, flatNavItems]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="global-search-open"
        className="relative flex h-9 w-full items-center rounded-lg bg-cloud pl-9 pr-16 text-sm text-on-surface-muted outline-none transition-colors hover:bg-haze focus:ring-1 focus:ring-primary"
        aria-label="Abrir busca global"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <span className="truncate">Buscar parcelas, telas e modulos...</span>
        <span className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-md border border-outline bg-surface-elevated px-1.5 py-0.5 text-[11px] font-semibold text-on-surface-muted md:inline">
          Ctrl + K
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-md border border-outline bg-surface-elevated shadow-3">
            <CommandPrimitive
              label="Busca global"
              className="flex h-full w-full flex-col"
              onClick={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                if (event.key === "Escape") setOpen(false);
              }}
            >
              <div className="flex items-center gap-2 border-b border-outline px-3">
                <Search className="h-4 w-4 text-on-surface-muted" />
                <CommandPrimitive.Input
                  autoFocus
                  data-testid="global-search-input"
                  placeholder="Buscar lotes, imóveis ou navegación..."
                  value={query}
                  onValueChange={performSearch}
                  className="h-12 w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-muted"
                />
                {isSearching && <div className="text-xs text-on-surface-muted animate-pulse">Buscando...</div>}
              </div>
              <CommandPrimitive.List className="max-h-[52vh] overflow-y-auto p-2">
                {!query || query.length < 2 ? (
                  <div className="px-3 py-4 text-center text-xs text-on-surface-muted">
                    Digite pelo menos 2 caracteres para buscar lotes, imóveis, telas...
                  </div>
                ) : results.length === 0 ? (
                  <CommandPrimitive.Empty className="px-3 py-8 text-center text-sm text-on-surface-muted">
                    Nenhum resultado encontrado.
                  </CommandPrimitive.Empty>
                ) : (
                  results.map((result) => (
                    <CommandPrimitive.Item
                      key={result.id}
                      value={`${result.title} ${result.description || ""}`}
                      onSelect={() => {
                        setOpen(false);
                        setQuery("");
                        if (result.href) router.push(result.href);
                      }}
                      className="group flex cursor-pointer items-center justify-between rounded-sm px-3 py-2.5 text-sm text-on-surface outline-none transition-colors data-[selected=true]:bg-cloud data-[selected=true]:text-on-surface"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        {result.category === "parcela" ? (
                          <Map className="h-4 w-4 shrink-0 text-orange-500" />
                        ) : (
                          <FileText className="h-4 w-4 shrink-0 text-on-surface-muted" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium">{result.title}</p>
                          <p className="truncate text-xs text-on-surface-muted">{result.description}</p>
                        </div>
                      </div>
                    </CommandPrimitive.Item>
                  ))
                )}
              </CommandPrimitive.List>
              <div className="flex items-center justify-between border-t border-outline px-3 py-2 text-[11px] text-on-surface-muted">
                <span>Use as setas para navegar</span>
                <span className="inline-flex items-center gap-1">
                  Enter
                  <CornerDownLeft className="h-3.5 w-3.5" />
                </span>
              </div>
            </CommandPrimitive>
          </div>
        </div>
      )}
    </>
  );
}
