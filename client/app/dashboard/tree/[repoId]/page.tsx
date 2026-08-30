"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader } from "lucide-react";

import { RepositoryTree } from "@/components/dashboard/repository-tree";
import { Button } from "@/components/ui/button";
import { api, Repository } from "@/lib/api";

export default function RepositoryTreePage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = use(params);
  const router = useRouter();
  const [repo, setRepo] = useState<Repository | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRepo = async () => {
      try {
        setIsLoading(true);
        const repoData = await api.getRepo(repoId);
        setRepo(repoData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load repository");
        setRepo(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadRepo();
  }, [repoId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading repository...</p>
        </div>
      </div>
    );
  }

  if (error || !repo) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Error Loading Repository</h1>
          <p className="mt-2 text-muted-foreground">{error || "Repository not found"}</p>
        </div>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/40 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground mb-3"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
              <h1 className="text-2xl font-bold">{repo.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {repo.owner} • {repo.defaultBranch}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-4">Repository Structure</h2>
              <RepositoryTree repositoryId={repoId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
