from __future__ import annotations

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str


class SearchRequest(BaseModel):
    query: str = Field(min_length=2)
    limit: int = Field(default=8, ge=1, le=20)


class RcaRequest(BaseModel):
    asset_tag: str
    incident: str | None = None


class ReportRequest(BaseModel):
    asset_tag: str
    report_type: str = "rca"
