from __future__ import annotations

from fastapi import APIRouter

from app.database.seed_demo_data import seed_demo_dataset

router = APIRouter(prefix="/demo", tags=["demo"])


@router.post("/seed")
def seed_demo() -> dict:
    return seed_demo_dataset()
