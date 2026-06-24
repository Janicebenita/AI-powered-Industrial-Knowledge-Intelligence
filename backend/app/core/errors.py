from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class IndustrialBrainError(Exception):
    def __init__(self, message: str, code: str = "industrial_brain_error", status_code: int = 400) -> None:
        self.message = message
        self.code = code
        self.status_code = status_code


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(IndustrialBrainError)
    async def handle_industrial_error(_: Request, exc: IndustrialBrainError) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content={"error": exc.code, "message": exc.message})
