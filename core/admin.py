from django.contrib import admin
from .models import (
    Household,
    Person,
    HygieneFee,
    TemporaryResidence,
    TemporaryAbsence,
    ContributionCampaign,
    Contribution,
    UserRole,
)

# =====================
# HỘ KHẨU – NHÂN KHẨU
# =====================
@admin.register(Household)
class HouseholdAdmin(admin.ModelAdmin):
    list_display = ("ma_ho_khau", "so_nha", "duong_pho", "phuong", "quan")
    search_fields = ("ma_ho_khau", "duong_pho", "phuong", "quan")


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):
    list_display = ("ma_nhan_khau", "ho_ten", "cccd", "ma_ho_khau", "trang_thai")
    search_fields = ("ho_ten", "cccd")
    list_filter = ("trang_thai",)


# =====================
# PHÍ VỆ SINH
# =====================
@admin.register(HygieneFee)
class HygieneFeeAdmin(admin.ModelAdmin):
    list_display = ("ma_phi_ve_sinh", "ma_ho_khau", "so_tien", "nam_tinh_phi", "trang_thai")
    list_filter = ("nam_tinh_phi", "trang_thai")


# =====================
# TẠM TRÚ
# =====================
@admin.register(TemporaryResidence)
class TemporaryResidenceAdmin(admin.ModelAdmin):
    list_display = (
        "ma_tam_tru",
        "ho_ten",
        "ma_ho_khau_tam_tru",
        "ngay_bat_dau",
        "ngay_ket_thuc",
        "trang_thai_hoan_thanh",
    )
    search_fields = ("ho_ten", "cccd")


# =====================
# TẠM VẮNG
# =====================
@admin.register(TemporaryAbsence)
class TemporaryAbsenceAdmin(admin.ModelAdmin):
    list_display = (
        "ma_tam_vang",
        "ma_nhan_khau",
        "ngay_bat_dau",
        "ngay_ket_thuc",
        "trang_thai_hoan_thanh",
    )


# =====================
# ĐỢT ĐÓNG GÓP
# =====================
@admin.register(ContributionCampaign)
class ContributionCampaignAdmin(admin.ModelAdmin):
    list_display = ("ma_dot_dong_gop", "ten_dot_dong_gop", "ngay_bat_dau", "ngay_ket_thuc")
    search_fields = ("ten_dot_dong_gop",)


# =====================
# KHOẢN ĐÓNG GÓP
# =====================
@admin.register(Contribution)
class ContributionAdmin(admin.ModelAdmin):
    list_display = ("ma_khoan_dong_gop", "ma_dot_dong_gop", "ma_ho_khau", "so_tien")


# =====================
# USER ROLE
# =====================
@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ("user", "role")
    list_filter = ("role",)
