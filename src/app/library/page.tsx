"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { SongList } from "@/components/music/SongList";
import { songs } from "@/data/songs";

export default function LibraryPage() {
  return (
    <MainLayout>
      <div className="min-h-screen px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Your Library
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {songs.length} songs in your collection
            </p>
          </div>
        </div>

        <div className="border-b border-border pb-4 mb-6">
          <SongList songs={songs} />
        </div>

        <div className="h-8" />
      </div>
    </MainLayout>
  );
}