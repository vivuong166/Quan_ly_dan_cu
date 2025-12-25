from django.contrib import admin
from django.urls import path, include
from django.urls import path, re_path
from core.views import page_not_found
urlpatterns = [
    path('admin/', admin.site.urls),
    # expose core views at the project root so URLs like `/` and `/home/` work
    path('', include('core.urls')),
    # also keep the API under /api/
    re_path(r"^.*$", page_not_found),
]
