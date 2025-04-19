from fastapi import APIRouter
from app.api.routers import auth
from app.api.routers import admin
from app.api.routers import user
from app.api.routers import reports

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(user.router, prefix="/user", tags=["user"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])