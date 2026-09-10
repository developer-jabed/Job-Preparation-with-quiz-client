// components/modules/LearnerManagement/LearnersFilters.tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LearnersFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(
    () => searchParams.get("searchTerm") || ""
  );

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "" || value === "ALL") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      if (!("page" in updates)) params.delete("page");

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

  // Debounce: only schedule navigation — no ref writes during render
  useEffect(() => {
    const t = setTimeout(() => {
      const current = searchParams.get("searchTerm") || "";
      if (search !== current) {
        updateParams({ searchTerm: search || null });
      }
    }, 400);
    return () => clearTimeout(t);
  }, [search, searchParams, updateParams]);

  const clearAll = () => {
    setSearch("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasFilters =
    !!searchParams.get("searchTerm") ||
    !!searchParams.get("isActive") ||
    !!searchParams.get("isEmailVerified");

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-9 h-10 bg-background"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={searchParams.get("isActive") || "ALL"}
          onValueChange={(v) => updateParams({ isActive: v })}
        >
          <SelectTrigger className="w-[140px] h-10 bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("isEmailVerified") || "ALL"}
          onValueChange={(v) => updateParams({ isEmailVerified: v })}
        >
          <SelectTrigger className="w-[160px] h-10 bg-background">
            <SelectValue placeholder="Email" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All emails</SelectItem>
            <SelectItem value="true">Verified</SelectItem>
            <SelectItem value="false">Unverified</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-10 text-muted-foreground"
            onClick={clearAll}
          >
            Clear
          </Button>
        )}

        {isPending && (
          <span className="text-xs text-muted-foreground animate-pulse">
            Updating…
          </span>
        )}
      </div>
    </div>
  );
}