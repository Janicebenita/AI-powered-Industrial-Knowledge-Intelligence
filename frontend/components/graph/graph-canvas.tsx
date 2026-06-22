"use client";

import ReactFlow, { Background, Controls, MiniMap, Node, Edge } from "reactflow";
import "reactflow/dist/style.css";

const nodes: Node[] = [
  { id: "P101", position: { x: 420, y: 240 }, data: { label: "Asset · P101" }, style: nodeStyle("#3B82F6") },
  { id: "WO", position: { x: 120, y: 80 }, data: { label: "WO-10877" }, style: nodeStyle("#06B6D4") },
  { id: "RCA", position: { x: 720, y: 80 }, data: { label: "RCA Draft" }, style: nodeStyle("#8B5CF6") },
  { id: "Seal", position: { x: 120, y: 310 }, data: { label: "Seal Failure" }, style: nodeStyle("#EF4444") },
  { id: "Cav", position: { x: 710, y: 320 }, data: { label: "Cavitation" }, style: nodeStyle("#F59E0B") },
  { id: "SOP", position: { x: 410, y: 20 }, data: { label: "SOP-MECH-014" }, style: nodeStyle("#22C55E") },
  { id: "NFPA", position: { x: 410, y: 470 }, data: { label: "ISO-14224" }, style: nodeStyle("#94A3B8") }
];

const edges: Edge[] = [
  { id: "e1", source: "P101", target: "WO", animated: true, label: "ASSET_HAS_DOCUMENT" },
  { id: "e2", source: "P101", target: "Seal", animated: true, label: "ASSET_FAILED_WITH" },
  { id: "e3", source: "Seal", target: "Cav", animated: true, label: "FAILURE_CAUSED_BY" },
  { id: "e4", source: "SOP", target: "P101", animated: true, label: "PROCEDURE_REFERENCES_ASSET" },
  { id: "e5", source: "RCA", target: "P101", animated: true, label: "INCIDENT_RELATED_TO" },
  { id: "e6", source: "NFPA", target: "SOP", animated: true, label: "REGULATION_APPLIES_TO" }
];

function nodeStyle(color: string) {
  return { background: `${color}22`, color: "#fff", border: `1px solid ${color}aa`, boxShadow: `0 0 26px ${color}33`, borderRadius: 12, padding: 10, width: 160 };
}

export function GraphCanvas() {
  return (
    <div className="h-[640px] overflow-hidden rounded-2xl border border-white/10 bg-[#050816]/70">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background color="rgba(148,163,184,0.18)" />
        <Controls />
        <MiniMap pannable zoomable nodeColor={(node) => String(node.style?.background || "#3B82F6")} />
      </ReactFlow>
    </div>
  );
}
