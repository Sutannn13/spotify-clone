"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Search } from "lucide-react";

export default function SearchPage() {
  return (
    <MainLayout>
      <div className="min-h-screen px-4 md:px-8 py-12 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center">
          <Search className="w-7 h-7 text-text-muted" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-semibold text-text-primary tracking-tight">
            Search
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Search for songs, albums, and artists
          </p>
        </div>
        <p className="text-xs text-text-muted mt-4">
          Search functionality coming in the next version
        </p>
      </div>
    </MainLayout>
  );
}