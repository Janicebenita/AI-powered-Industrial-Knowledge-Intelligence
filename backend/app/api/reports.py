from __future__ import annotations

from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse

from app.core.security import require_permission
from app.services.report_service import generate_rca_pdf

router = APIRouter(prefix="/reports", tags=["reports"], dependencies=[Depends(require_permission("read"))])


@router.post("/rca/{asset_tag}")
def export_rca(asset_tag: str) -> FileResponse:
    path = generate_rca_pdf(asset_tag)
    return FileResponse(path, filename=path.name, media_type="application/pdf")
