from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

DEMO_USERS = {
    "plant.manager@industrial.ai": {"password": "demo123", "role": "plant_manager", "name": "Plant Manager"},
    "reliability@industrial.ai": {"password": "demo123", "role": "reliability_engineer", "name": "Reliability Engineer"},
    "auditor@industrial.ai": {"password": "demo123", "role": "compliance_auditor", "name": "Compliance Auditor"},
}

ROLE_PERMISSIONS = {
    "plant_manager": {"read", "write", "admin", "audit"},
    "reliability_engineer": {"read", "write"},
    "maintenance_engineer": {"read", "write"},
    "operator": {"read"},
    "safety_officer": {"read", "write", "audit"},
    "quality_manager": {"read", "write", "audit"},
    "compliance_auditor": {"read", "audit"},
    "executive": {"read", "audit"},
}


def create_access_token(subject: str, role: str) -> str:
    settings = get_settings()
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_minutes)
    payload = {"sub": subject, "role": role, "exp": expires}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def authenticate(email: str, password: str) -> dict[str, str] | None:
    user = DEMO_USERS.get(email.lower())
    if not user or user["password"] != password:
        return None
    return {"email": email.lower(), "role": user["role"], "name": user["name"]}


def current_user(token: Annotated[str | None, Depends(oauth2_scheme)] = None) -> dict[str, str]:
    if not token:
        return {"email": "demo@industrial.ai", "role": "plant_manager", "name": "Demo User"}
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return {"email": payload["sub"], "role": payload["role"], "name": payload["sub"].split("@")[0]}
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token") from exc


def require_permission(permission: str):
    def dependency(user: Annotated[dict[str, str], Depends(current_user)]) -> dict[str, str]:
        permissions = ROLE_PERMISSIONS.get(user["role"], set())
        if permission not in permissions:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Missing permission: {permission}")
        return user

    return dependency
