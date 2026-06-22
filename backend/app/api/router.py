from __future__ import annotations

from fastapi import APIRouter

from app.api import agents, auth, demo, reports, search

api_router = APIRouter(prefix="/api")
api_router.include_router(auth.router)
api_router.include_router(demo.router)
api_router.include_router(search.router)
api_router.include_router(agents.router)
api_router.include_router(reports.router)
