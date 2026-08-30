"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, File, Folder, GitBranch } from "lucide-react";
import { api, TreeNode } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { RepositoryTree3D } from "@/components/dashboard/repository-tree-3d"
import { Button } from "@/components/ui/button";

type ViewMode = "2d" | "3d";

interface TreeNodeProps {
  node: TreeNode;
  level: number;
}

function TreeNodeItem({ node, level }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isDirectory = node.type === "DIRECTORY";
  const hasChildren = isDirectory && node.children && node.children.length > 0;

  return (
    <div>
      <div className={cn("flex items-center py-1", `ml-${level * 4}`)}>
        {isDirectory && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-0 h-6 w-6 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
            aria-label={isOpen ? "Collapse" : "Expand"}
          >
            {hasChildren ? (
              isOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            ) : (
              <div className="w-4" />
            )}
          </button>
        )}
        {!isDirectory && <div className="w-6" />}
        {isDirectory ? (
          <Folder className="w-4 h-4 mr-2 shrink-0 text-blue-500" />
        ) : (
          <File className="w-4 h-4 mr-2 shrink-0 text-gray-500" />
        )}
        <span className="text-sm truncate select-none">{node.name}</span>
      </div>
      {isOpen && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeItem
              key={`${child.name}-${child.type}`}
              node={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function RepositoryTree({ repositoryId }: { repositoryId: string }) {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("2d");

  useEffect(() => {
    const loadTree = async () => {
      try {
        setIsLoading(true);
        const treeData = await api.getRepositoryTree(repositoryId);
        setTree(treeData);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load repository tree"
        );
        setTree(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadTree();
  }, [repositoryId]);

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-6 w-24" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg">
        <p className="text-sm text-red-700">
          <span className="font-semibold">Error:</span> {error}
        </p>
      </div>
    );
  }

  if (!tree) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No repository tree available</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden w-full h-full">
      {/* View Toggle */}
      <div className="flex gap-2 p-2 pb-0">
        <Button
          variant={viewMode === "2d" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("2d")}
        >
          <Folder className="w-4 h-4 mr-2" /> 2D Tree
        </Button>
        <Button
          variant={viewMode === "3d" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("3d")}
        >
          <GitBranch className="w-4 h-4 mr-2" /> 3D Visualization
        </Button>
      </div>

      {/* View Content */}
      {viewMode === "2d" ? (
        <div className="p-4 max-h-[calc(100vh-180px)] overflow-y-auto">
          <h3 className="font-semibold text-sm mb-4 flex items-center">
            <Folder className="w-4 h-4 mr-2" /> Repository Structure
          </h3>
          <TreeNodeItem node={tree} level={0} />
        </div>
      ) : (
        <div className="w-full h-[calc(100vh-150px)] min-h-155">
          <RepositoryTree3D tree={tree} />
        </div>
      )}
    </div>
  );
}