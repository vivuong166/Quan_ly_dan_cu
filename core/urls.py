from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('get-contribution-detail/', views.get_contribution_detail, name='get_contribution_detail'),
    path('search-household-contribution/', views.search_household_contribution, name='search_household_contribution'),
    path('get-nhankhau-in-month/', views.get_nhankhau_in_month, name='get_nhankhau_in_month'),
    path('get-household-monthly-data/', views.get_household_monthly_data, name='get_household_monthly_data'),
    
    # =====================
    # AUTH
    # =====================
    path("", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("home/", views.home, name="home"),

    # =====================
    # QUẢN LÝ HỘ KHẨU – NHÂN KHẨU
    # =====================
    path("qlhk_nk/", views.qlnk, name="qlnk"),

    # Hộ khẩu
    path("qlhk_nk/hokhau/", views.sohokhau, name="sohokhau"),
    path("qlhk_nk/hokhau/taohokhau/", views.taohokhau, name="taohokhau"),
    path(
        "qlhk_nk/hokhau/taohokhau/<str:household_id>/",
        views.taohokhau,
        name="taohokhau_edit",
    ),
    path(
        "qlhk_nk/hokhau/suahk/<str:household_id>/",
        views.suahk,
        name="suahk",
    ),
    path(
        "qlhk_nk/hokhau/chitiet/<str:household_id>/",
        views.chitiet_hk,
        name="chitiet_hk",
    ),
    path(
        "qlhk_nk/hokhau/tachhk/<str:household_id>/",
        views.tachhk,
        name="tachhk",
    ),

    # Nhân khẩu
    path("qlhk_nk/nhankhau/", views.nhankhau, name="nhankhau"),
    path("qlhk_nk/nhankhau/themnk/", views.themnk, name="themnk"),
    path(
        "qlhk_nk/nhankhau/suank/<int:person_id>/",
        views.suank,
        name="suank",
    ),

    # =====================
    # TẠM TRÚ – TẠM VẮNG
    # =====================
    path("qltv_tt/", views.qltv_tt, name="qltv_tt"),
    # path("tamvang/", views.tamvang, name="tamvang"),
    # path("tamtru/", views.tamtru, name="tamtru"),
    path("qltv_tt/tamtru/", views.TamTru.as_view(), name="tamtru"),
    path("qltv_tt/tamvang/", views.TamVang.as_view(), name="tamvang"),

    # =====================
    # BIẾN ĐỘNG NHÂN KHẨU
    # =====================
    path("biendong/", views.biendong, name="biendong"),
    path("formdoichuho/", views.formdoichuho, name="formdoichuho"),

    # =====================
    # THU PHÍ – THỐNG KÊ
    # =====================
    path("thuphi/", views.thuphi, name="thuphi"),
    path("thongke_baocao/", views.thongke_baocao, name="thongke_baocao"),

    # =====================
    # QUẢN LÝ TRUY CẬP
    # =====================
    path("quanlytruycap/", views.quanly_truycap, name="quanly_truycap"),

    # =====================
    # ERROR
    # =====================
    path("404/", views.page_not_found, name="404"),
]

if not settings.DEBUG:
    urlpatterns += static(
        settings.STATIC_URL,
        document_root=settings.STATIC_ROOT
    )
