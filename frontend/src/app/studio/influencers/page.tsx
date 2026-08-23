"use client";

import { useState } from "react";
import { CircleHelp, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewInfluencerModal } from "@/components/studio/new-influencer-modal";
import { GENDER_OPTIONS } from "@/components/studio/influencer-data";
import { useInfluencers } from "@/lib/hooks/use-influencers";

export default function StudioInfluencersPage() {
  const { influencers, add, remove, ready } = useInfluencers();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">AI Influencers</h1>
        <CircleHelp className="h-4 w-4 text-[var(--studio-muted)]" />
      </div>

      <div className="mt-6 flex min-h-[calc(100dvh-10rem)] flex-1 flex-col rounded-[1.75rem] border border-[var(--studio-border)] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">My Influencers</h2>
          <Button
            className="rounded-full bg-neutral-900 text-white hover:bg-black"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Influencer
          </Button>
        </div>

        {!ready ? (
          <div className="flex flex-1 items-center justify-center text-sm text-[var(--studio-muted)]">
            Loading…
          </div>
        ) : influencers.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <Users className="h-7 w-7 text-[var(--studio-muted)]" />
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-tight">
              Create your first AI influencer
            </h3>
            <p className="mt-2 max-w-md text-sm text-[var(--studio-muted)]">
              Build a reusable character, then generate images and videos from
              the same persona.
            </p>
            <Button
              className="mt-6 rounded-full bg-neutral-900 text-white hover:bg-black"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              New Influencer
            </Button>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {influencers.map((influencer) => {
              const genderLabel =
                GENDER_OPTIONS.find((option) => option.value === influencer.gender)
                  ?.label ?? influencer.gender;
              return (
                <li
                  key={influencer.id}
                  className="overflow-hidden rounded-2xl border border-[var(--studio-border)] bg-[var(--studio-canvas)]"
                >
                  <div className="aspect-[3/4] bg-neutral-200">
                    {influencer.portraitUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={influencer.portraitUrl}
                        alt={influencer.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{influencer.name}</p>
                        <p className="mt-1 text-xs text-[var(--studio-muted)]">
                          {genderLabel} · {influencer.age}
                          {influencer.ethnicity
                            ? ` · ${influencer.ethnicity}`
                            : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Delete ${influencer.name}`}
                        className="rounded-full p-1.5 text-[var(--studio-muted)] hover:bg-white hover:text-red-600"
                        onClick={() => remove(influencer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[var(--studio-muted)]">
                      {influencer.appearancePrompt}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <NewInfluencerModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={add}
      />
    </div>
  );
}
