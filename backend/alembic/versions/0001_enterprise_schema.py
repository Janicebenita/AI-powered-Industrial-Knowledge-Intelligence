"""enterprise schema

Revision ID: 0001_enterprise_schema
Revises:
Create Date: 2026-06-22
"""

from alembic import op
import sqlalchemy as sa

revision = "0001_enterprise_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table("roles", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("name", sa.String(100), unique=True), sa.Column("permissions", sa.Text(), nullable=False))
    op.create_table("users", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("email", sa.String(255), unique=True), sa.Column("full_name", sa.String(255)), sa.Column("role_id", sa.Integer(), sa.ForeignKey("roles.id")), sa.Column("created_at", sa.DateTime()))
    op.create_table("document_chunks", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("document_id", sa.Integer(), index=True), sa.Column("page_number", sa.Integer()), sa.Column("section", sa.String(255)), sa.Column("text", sa.Text()), sa.Column("embedding_ref", sa.String(255)))
    op.create_table("embeddings", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("chunk_id", sa.Integer(), index=True), sa.Column("provider", sa.String(80)), sa.Column("vector_json", sa.Text()))
    op.create_table("equipment", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("asset_tag", sa.String(80), index=True), sa.Column("equipment_id", sa.String(120), unique=True), sa.Column("manufacturer", sa.String(255)), sa.Column("model", sa.String(255)))
    op.create_table("maintenance_records", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("asset_tag", sa.String(80), index=True), sa.Column("action", sa.Text()), sa.Column("performed_at", sa.DateTime()), sa.Column("source_document_id", sa.Integer()))
    op.create_table("compliance_records", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("regulation_id", sa.Integer()), sa.Column("asset_tag", sa.String(80), index=True), sa.Column("status", sa.String(80)), sa.Column("risk_category", sa.String(80)), sa.Column("evidence_document_id", sa.Integer()))
    op.create_table("knowledge_nodes", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("node_type", sa.String(80), index=True), sa.Column("label", sa.String(255), index=True), sa.Column("properties_json", sa.Text()))
    op.create_table("graph_relationships", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("source_node_id", sa.Integer(), index=True), sa.Column("target_node_id", sa.Integer(), index=True), sa.Column("relationship_type", sa.String(120), index=True), sa.Column("confidence", sa.Float()), sa.Column("evidence", sa.Text()))
    op.create_table("chat_messages", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("chat_session_id", sa.Integer(), index=True), sa.Column("role", sa.String(40)), sa.Column("content", sa.Text()), sa.Column("created_at", sa.DateTime()))
    op.create_table("audit_reports", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("title", sa.String(255)), sa.Column("status", sa.String(80)), sa.Column("summary", sa.Text()), sa.Column("created_at", sa.DateTime()))


def downgrade() -> None:
    for table in ["audit_reports", "chat_messages", "graph_relationships", "knowledge_nodes", "compliance_records", "maintenance_records", "equipment", "embeddings", "document_chunks", "users", "roles"]:
        op.drop_table(table)
