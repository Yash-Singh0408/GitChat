"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { TreeNode } from "@/lib/api";

interface NodeLayout {
  id: string;
  name: string;
  parentId: string | null;
  x: number;
  y: number;
  type: "FILE" | "DIRECTORY";
  isFile: boolean;
}

function getNodeId(path: string, name: string) {
  return path ? `${path}/${name}` : name;
}

function layoutTree(
  node: TreeNode,
  depth = 0,
  parentId: string | null = null,
  path = "",
  expandedMap: Record<string, boolean>,
  y = 180
): NodeLayout[] {
  const id = getNodeId(path, node.name);
  const children = node.type === "DIRECTORY" ? node.children ?? [] : [];
  const isExpanded = node.type === "DIRECTORY" ? expandedMap[id] ?? true : false;

  const nodes: NodeLayout[] = [
    {
      id,
      name: node.name,
      parentId,
      x: depth * 180 + 90,
      y,
      type: node.type,
      isFile: node.type === "FILE",
    },
  ];

  if (node.type === "DIRECTORY" && children.length > 0 && isExpanded) {
    const startY = y - ((children.length - 1) * 42) / 2;
    children.forEach((child, index) => {
      const childPath = id;
      const childY = startY + index * 42;
      const childNodes = layoutTree(
        child,
        depth + 1,
        id,
        childPath,
        expandedMap,
        childY
      );
      nodes.push(...childNodes);
    });
  }

  return nodes;
}

export function RepositoryTree3D({ tree }: { tree: TreeNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragState = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const dragDistanceRef = useRef(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>(() => ({
    [tree.name]: true,
  }));
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visibleNodes = useMemo(() => {
    const rootId = tree.name;
    const rootExpanded = expandedMap[rootId] ?? true;

    if (!rootExpanded) {
      return [
        {
          id: rootId,
          name: tree.name,
          parentId: null,
          x: 90,
          y: 180,
          type: tree.type,
          isFile: tree.type === "FILE",
        },
      ];
    }

    return layoutTree(tree, 0, null, "", expandedMap, 180);
  }, [tree, expandedMap]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.offsetWidth || 1400;
    const height = canvas.offsetHeight || 900;
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);

    const map = new Map(visibleNodes.map((node) => [node.id, node]));

    ctx.strokeStyle = "rgba(148, 163, 184, 0.9)";
    ctx.lineWidth = 1.5;

    visibleNodes.forEach((node) => {
      if (!node.parentId) return;
      const parent = map.get(node.parentId);
      if (!parent) return;

      const fromX = parent.x + pan.x;
      const fromY = parent.y + pan.y;
      const toX = node.x + pan.x;
      const toY = node.y + pan.y;

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
    });

    visibleNodes.forEach((node) => {
      const radius = node.isFile ? 8 : 12;
      const isSelected = selectedId === node.id;
      const px = node.x + pan.x;
      const py = node.y + pan.y;

      ctx.beginPath();
      ctx.fillStyle = isSelected
        ? "#2563eb"
        : node.isFile
          ? "#9ca3af"
          : "#60a5fa";
      ctx.shadowColor = isSelected
        ? "rgba(37, 99, 235, 0.5)"
        : "rgba(96, 165, 250, 0.25)";
      ctx.shadowBlur = isSelected ? 18 : 10;
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = "#0f172a";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(node.name, px, py - radius - 10);
    });
  }, [visibleNodes, selectedId, pan]);

  const handleCanvasClick = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (dragDistanceRef.current > 6) {
      dragDistanceRef.current = 0;
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left - pan.x;
    const clickY = event.clientY - rect.top - pan.y;

    const clickedNode = visibleNodes.find((node) => {
      const dx = clickX - node.x;
      const dy = clickY - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= (node.isFile ? 12 : 18);
    });

    if (!clickedNode) return;

    setSelectedId(clickedNode.id);

    if (clickedNode.type === "DIRECTORY") {
      setExpandedMap((prev) => ({
        ...prev,
        [clickedNode.id]: !(prev[clickedNode.id] ?? true),
      }));
    }
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    dragState.current = {
      active: true,
      startX: event.clientX - rect.left,
      startY: event.clientY - rect.top,
      originX: pan.x,
      originY: pan.y,
    };
    dragDistanceRef.current = 0;
    canvas.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!dragState.current || !dragState.current.active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    dragDistanceRef.current = Math.max(
      dragDistanceRef.current,
      Math.abs(x - dragState.current.startX) + Math.abs(y - dragState.current.startY)
    );

    setPan({
      x: dragState.current.originX + (x - dragState.current.startX),
      y: dragState.current.originY + (y - dragState.current.startY),
    });
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="w-full h-full border-0 rounded cursor-grab active:cursor-grabbing"
      style={{ background: "#f8fafc" }}
    />
  );
}