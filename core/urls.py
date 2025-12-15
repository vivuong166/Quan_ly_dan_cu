from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'households', views.HouseholdViewSet)
router.register(r'persons', views.PersonViewSet)
router.register(r'payments', views.PaymentViewSet)

urlpatterns = [
    # API routes
    path("", include(router.urls)),

    # HTML pages (removed leading slash)
    path("home/", views.home, name="home"),
    path("qlhk_nk/", views.qlnk, name="qlnk"),
    path("qltv_tt/", views.qltv_tt, name="qltv_tt"),
    path("qltv_tt/tamvang/", views.tamvang, name="tamvang"),
    path("qltv_tt/tamtru/", views.tamtru, name="tamtru"),
    path("thuphi/", views.thuphi, name="thuphi"),
    path("thongke_baocao/", views.thongke_baocao, name="thongke_baocao"),
    path("quanlytruycap/", views.quanly_truycap, name="quanly_truycap"),
    path("qlhk_nk/hokhau/", views.sohokhau, name="sohokhau"),
    path("qlhk_nk/hokhau/taohokhau/", views.taohokhau, name="taohokhau"),
    path("qlhk_nk/hokhau/taohokhau/<str:household_id>/", views.taohokhau, name="taohokhau_edit"),
    path("qlhk_nk/nhankhau/", views.nhankhau, name="nhankhau"),
    path("qlhk_nk/nhankhau/themnk/", views.themnk, name="themnk"),
    path("qlhk_nk/nhankhau/suank/<int:person_id>/", views.suank, name="suank"),
    path("biendong/", views.biendong, name="biendong"),
    path("login/", views.login_view, name="login"),
    path("formdoichuho/", views.formdoichuho, name="formdoichuho"),
    path("404/", views.page_not_found, name="404"),

]
