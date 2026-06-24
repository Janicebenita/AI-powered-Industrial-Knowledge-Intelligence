from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse

from app.core.security import require_permission
from app.services.report_service import generate_rca_pdf, generate_report_pdf

router = APIRouter(prefix="/reports", tags=["reports"], dependencies=[Depends(require_permission("read"))])


@router.post("/rca/{asset_tag}")
def export_rca(asset_tag: str) -> FileResponse:
    path = generate_rca_pdf(asset_tag)
    return FileResponse(path, filename=path.name, media_type="application/pdf")


@router.get("/download/{report_type}")
def download_report(report_type: str, asset_tag: str = "P-101") -> FileResponse:
    try:
        path = generate_report_pdf(report_type, asset_tag=asset_tag)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return FileResponse(path, filename=path.name, media_type="application/pdf")
