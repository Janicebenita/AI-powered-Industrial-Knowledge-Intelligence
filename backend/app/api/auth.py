from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.core.security import authenticate, create_access_token
from app.schemas.api import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
    user = authenticate(payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return TokenResponse(access_token=create_access_token(user["email"], user["role"]), role=user["role"], name=user["name"])
