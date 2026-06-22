from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.security import require_permission
from app.schemas.api import SearchRequest
from app.services.retrieval_service import retrieve

router = APIRouter(prefix="/search", tags=["search"], dependencies=[Depends(require_permission("read"))])


@router.post("")
def semantic_search(payload: SearchRequest) -> dict:
    return {"query": payload.query, "results": retrieve(payload.query, payload.limit)}
