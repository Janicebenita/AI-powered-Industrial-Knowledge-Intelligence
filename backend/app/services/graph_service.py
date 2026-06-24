from __future__ import annotations

from collections import defaultdict
from typing import Any

from app.database import query


def graph_payload() -> dict[str, list[dict[str, Any]]]:
    nodes: dict[str, dict[str, Any]] = {}
    edges: list[dict[str, Any]] = []

    for asset in query("SELECT tag, name, asset_type, location, criticality, risk_score, status FROM assets"):
        node_id = f"Asset:{asset['tag']}"
        nodes[node_id] = {"id": node_id, "label": asset["tag"], "type": "Asset", "data": asset}

    for doc in query("SELECT id, filename, doc_type FROM documents"):
        node_id = f"Document:{doc['id']}"
        nodes[node_id] = {"id": node_id, "label": doc["filename"], "type": "Document", "data": doc}

    for entity in query("SELECT id, entity_type, name, document_id FROM entities"):
        node_id = f"{entity['entity_type']}:{entity['name']}"
        nodes.setdefault(node_id, {"id": node_id, "label": entity["name"], "type": entity["entity_type"], "data": entity})
        edges.append({"id": f"doc-{entity['document_id']}-{node_id}", "source": node_id, "target": f"Document:{entity['document_id']}", "label": "ASSET_HAS_DOCUMENT" if entity["entity_type"] == "Asset" else "MENTIONED_IN"})

    for rel in query("SELECT id, source_type, source_name, relationship, target_type, target_name, confidence FROM entity_relationships"):
        source = f"{rel['source_type']}:{rel['source_name']}"
        target = f"{rel['target_type']}:{rel['target_name']}"
        nodes.setdefault(source, {"id": source, "label": rel["source_name"], "type": rel["source_type"], "data": {}})
        nodes.setdefault(target, {"id": target, "label": rel["target_name"], "type": rel["target_type"], "data": {}})
        edges.append({"id": f"rel-{rel['id']}", "source": source, "target": target, "label": rel["relationship"], "confidence": rel["confidence"]})

    return {"nodes": list(nodes.values()), "edges": edges}


def neighborhood(asset_tag: str) -> dict[str, Any]:
    graph = graph_payload()
    asset_id = f"Asset:{asset_tag}"
    keep = {asset_id}
    for edge in graph["edges"]:
        if edge["source"] == asset_id or edge["target"] == asset_id:
            keep.add(edge["source"])
            keep.add(edge["target"])
    return {"nodes": [node for node in graph["nodes"] if node["id"] in keep], "edges": [edge for edge in graph["edges"] if edge["source"] in keep and edge["target"] in keep]}


def graph_stats() -> dict[str, Any]:
    graph = graph_payload()
    by_type: dict[str, int] = defaultdict(int)
    for node in graph["nodes"]:
        by_type[node["type"]] += 1
    return {"nodes": len(graph["nodes"]), "edges": len(graph["edges"]), "node_types": dict(by_type)}
