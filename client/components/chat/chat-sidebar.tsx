"use client";

import { formatDistanceToNow } from "date-fns";
import { Plus, RotateCcw } from "lucide-react";

import { IndexStatusBadge } from "@/components/dashboard/repo-status";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useChatSessions,
  useCreateChatSession,
} from "@/hooks/use-chat";
import { useStartIndexing } from "@/hooks/use-repos";
import type { Repository } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ChatSidebar({
  repo,
  sessionId,
  onSelectSession,
  collapsed,
  onToggleCollapse,
}: {
  repo: Repository;
  sessionId: string | null;
  onSelectSession: (id: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const ready = repo.indexStatus === "READY";
  const sessionsQuery = useChatSessions(repo.id, ready);
  const createSession = useCreateChatSession(repo.id);
  const reindex = useStartIndexing();

  return (
    <aside
      className={cn(
        "flex w-full shrink-0 flex-col border-b bg-muted/10 transition-all duration-200 md:sticky md:top-0 md:h-full md:border-r md:border-b-0",
        collapsed ? "md:w-16" : "md:w-64 lg:w-72"
      )}
    >
      <div className="flex items-center justify-between gap-2 p-3 md:p-2">
        {!collapsed && (
          <div className="space-y-1 overflow-hidden">
            {/* <p className="truncate text-sm font-medium">{repo.fullName}</p> */}
            <div className="flex flex-wrap items-center gap-2">
              <IndexStatusBadge status={repo.indexStatus} />
              {repo.isPrivate && (
                <span className="text-xs text-muted-foreground">Private</span>
              )}
            </div>
          </div>
        )}

        <Button
          size="icon-sm"
          variant="ghost"
          className={cn("shrink-0", collapsed && "mx-auto")}
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "→" : "←"}
        </Button>
      </div>

      {!collapsed && (
        <>
          <div className="px-3 pb-3 pt-1">
            <div className="flex gap-2.5">
              <Button
                size="sm"
                className="flex-1"
                disabled={!ready || createSession.isPending}
                onClick={() =>
                  createSession.mutate("New chat", {
                    onSuccess: (session) => onSelectSession(session.id),
                  })
                }
              >
                <Plus data-icon="inline-start" />
                New chat
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={reindex.isPending || repo.indexStatus === "INDEXING"}
                onClick={() => reindex.mutate(repo.id)}
                aria-label="Re-index repository"
              >
                <RotateCcw />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="px-4 pb-2 pt-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground/80">
            Sessions
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-1.5 px-2 pb-4">
              {!ready && (
                <p className="px-2 text-xs text-muted-foreground">
                  Sessions unlock after indexing completes.
                </p>
              )}

              {sessionsQuery.isLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-xl" />
                ))}

              {sessionsQuery.data?.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => onSelectSession(session.id)}
                  className={cn(
                    "w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted",
                    sessionId === session.id && "bg-muted"
                  )}
                >
                  <p className="truncate text-sm font-medium">{session.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(session.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </button>
              ))}

              {ready && sessionsQuery.isSuccess && sessionsQuery.data.length === 0 && (
                <p className="px-2 text-xs text-muted-foreground">
                  No chats yet. Start one to begin.
                </p>
              )}
            </div>
          </ScrollArea>
        </>
      )}

      {collapsed && (
        <div className="flex flex-1 flex-col items-center gap-2 px-2 py-3">
          <Button
            size="icon-sm"
            variant="outline"
            className="h-9 w-9"
            disabled={!ready || createSession.isPending}
            onClick={() =>
              createSession.mutate("New chat", {
                onSuccess: (session) => onSelectSession(session.id),
              })
            }
            aria-label="New chat"
          >
            <Plus className="size-4" />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            className="h-9 w-9"
            disabled={reindex.isPending || repo.indexStatus === "INDEXING"}
            onClick={() => reindex.mutate(repo.id)}
            aria-label="Re-index repository"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      )}
    </aside>
  );
}
