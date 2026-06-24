from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    role_id: Mapped[int | None] = mapped_column(ForeignKey("roles.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Role(Base):
    __tablename__ = "roles"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    permissions: Mapped[str] = mapped_column(Text, default="[]")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id"), index=True)
    page_number: Mapped[int] = mapped_column(Integer, default=1)
    section: Mapped[str] = mapped_column(String(255), default="General")
    text: Mapped[str] = mapped_column(Text)
    embedding_ref: Mapped[str | None] = mapped_column(String(255))


class Embedding(Base):
    __tablename__ = "embeddings"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    chunk_id: Mapped[int] = mapped_column(ForeignKey("document_chunks.id"), index=True)
    provider: Mapped[str] = mapped_column(String(80), default="local")
    vector_json: Mapped[str] = mapped_column(Text)


class Equipment(Base):
    __tablename__ = "equipment"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    asset_tag: Mapped[str] = mapped_column(String(80), index=True)
    equipment_id: Mapped[str] = mapped_column(String(120), unique=True)
    manufacturer: Mapped[str | None] = mapped_column(String(255))
    model: Mapped[str | None] = mapped_column(String(255))


class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    asset_tag: Mapped[str] = mapped_column(String(80), index=True)
    action: Mapped[str] = mapped_column(Text)
    performed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    source_document_id: Mapped[int | None] = mapped_column(Integer)


class ComplianceRecord(Base):
    __tablename__ = "compliance_records"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    regulation_id: Mapped[int | None] = mapped_column(Integer)
    asset_tag: Mapped[str] = mapped_column(String(80), index=True)
    status: Mapped[str] = mapped_column(String(80), default="unmapped")
    risk_category: Mapped[str] = mapped_column(String(80), default="medium")
    evidence_document_id: Mapped[int | None] = mapped_column(Integer)


class KnowledgeNode(Base):
    __tablename__ = "knowledge_nodes"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    node_type: Mapped[str] = mapped_column(String(80), index=True)
    label: Mapped[str] = mapped_column(String(255), index=True)
    properties_json: Mapped[str] = mapped_column(Text, default="{}")


class GraphRelationship(Base):
    __tablename__ = "graph_relationships"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    source_node_id: Mapped[int] = mapped_column(Integer, index=True)
    target_node_id: Mapped[int] = mapped_column(Integer, index=True)
    relationship_type: Mapped[str] = mapped_column(String(120), index=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.82)
    evidence: Mapped[str] = mapped_column(Text, default="")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    chat_session_id: Mapped[int] = mapped_column(Integer, index=True)
    role: Mapped[str] = mapped_column(String(40))
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AuditReport(Base):
    __tablename__ = "audit_reports"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(80), default="draft")
    summary: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
