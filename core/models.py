from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# =====================
# HỘ KHẨU
# =====================
class Household(models.Model):
    ma_ho_khau = models.CharField(max_length=10, primary_key=True)
    so_nha = models.CharField(max_length=100)
    duong_pho = models.CharField(max_length=255)
    phuong = models.CharField(max_length=100)
    quan = models.CharField(max_length=100)

    class Meta:
        db_table = "new_ho_khau"
        managed = False

    def __str__(self):
        return self.ma_ho_khau


# =====================
# NHÂN KHẨU
# =====================
class Person(models.Model):
    ma_nhan_khau = models.AutoField(primary_key=True)
    ma_ho_khau = models.CharField(max_length=10)

    ho_ten = models.CharField(max_length=255)
    bi_danh = models.CharField(max_length=255, null=True, blank=True)
    ngay_sinh = models.DateField(null=True, blank=True)
    gioi_tinh = models.CharField(max_length=50, null=True, blank=True)
    noi_sinh = models.TextField(null=True, blank=True)
    nguyen_quan = models.TextField(null=True, blank=True)
    dan_toc = models.CharField(max_length=50, null=True, blank=True)
    nghe_nghiep = models.CharField(max_length=255, null=True, blank=True)
    noi_lam_viec = models.TextField(null=True, blank=True)
    cccd = models.CharField(max_length=20, null=True, blank=True)
    ngay_cap_cccd = models.DateField(null=True, blank=True)
    noi_cap_cccd = models.TextField(null=True, blank=True)
    ngay_dang_ky_thuong_tru = models.DateField(null=True, blank=True)
    dia_chi_truoc_khi_chuyen = models.TextField(null=True, blank=True)
    quan_he_chu_ho = models.CharField(max_length=100, null=True, blank=True)
    trang_thai = models.CharField(max_length=100, default="Thường trú")

    class Meta:
        db_table = "new_nhan_khau"
        managed = False

    def __str__(self):
        return self.ho_ten


# =====================
# PHÍ VỆ SINH
# =====================
class HygieneFee(models.Model):
    ma_phi_ve_sinh = models.AutoField(primary_key=True)
    ma_ho_khau = models.CharField(max_length=10)
    so_tien = models.DecimalField(max_digits=12, decimal_places=2)
    nam_tinh_phi = models.IntegerField(null=True, blank=True)
    trang_thai = models.CharField(max_length=100, default="Chưa nộp")

    class Meta:
        db_table = "new_phi_ve_sinh"
        managed = False


# =====================
# TẠM TRÚ
# =====================
class TemporaryResidence(models.Model):
    ma_tam_tru = models.AutoField(primary_key=True)
    ma_ho_khau_tam_tru = models.CharField(max_length=10)
    ho_ten = models.CharField(max_length=255)
    ngay_sinh = models.DateField(null=True, blank=True)
    nghe_nghiep = models.CharField(max_length=255, null=True, blank=True)
    cccd = models.CharField(max_length=20, null=True, blank=True)
    ngay_bat_dau = models.DateField()
    ngay_ket_thuc = models.DateField()
    trang_thai_hoan_thanh = models.BooleanField(default=False)
    ly_do = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "new_tam_tru"
        managed = False


# =====================
# TẠM VẮNG
# =====================
class TemporaryAbsence(models.Model):
    ma_tam_vang = models.AutoField(primary_key=True)
    ma_nhan_khau = models.IntegerField()
    ngay_bat_dau = models.DateField()
    ngay_ket_thuc = models.DateField()
    trang_thai_hoan_thanh = models.BooleanField(default=False)
    ly_do = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "new_tam_vang"
        managed = False


# =====================
# ĐỢT ĐÓNG GÓP
# =====================
class ContributionCampaign(models.Model):
    ma_dot_dong_gop = models.AutoField(primary_key=True)
    ten_dot_dong_gop = models.CharField(max_length=255, unique=True)
    ngay_bat_dau = models.DateField(null=True, blank=True)
    ngay_ket_thuc = models.DateField(null=True, blank=True)

    class Meta:
        db_table = "new_dot_dong_gop"
        managed = False

    def __str__(self):
        return self.ten_dot_dong_gop


# =====================
# KHOẢN ĐÓNG GÓP
# =====================
class Contribution(models.Model):
    ma_khoan_dong_gop = models.AutoField(primary_key=True)
    ma_dot_dong_gop = models.IntegerField()
    ma_ho_khau = models.CharField(max_length=10)
    so_tien = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = "new_khoan_dong_gop"
        managed = False


# =====================
# HỘ KHẨU ĐẦY ĐỦ
# =====================
class HouseholdDetail(models.Model):
    ma_ho_khau = models.CharField(max_length=10, primary_key=True)
    dia_chi = models.CharField(max_length=255)
    ten_chu_ho = models.CharField(max_length=255)

    class Meta:
        db_table = "v_ho_khau_day_du"
        managed = False

    def __str__(self):
        return self.ma_ho_khau
    
# =====================
# NHÂN KHẨU THƯỜNG TRÚ
# =====================
class PersonCurrent(models.Model):
    ma_nhan_khau = models.AutoField(primary_key=True)
    ma_ho_khau = models.CharField(max_length=10)
    ho_ten = models.CharField(max_length=255)
    dia_chi = models.CharField(max_length=255)
    ngay_sinh = models.DateField(null=True, blank=True)
    class Meta:
        db_table = "v_nhan_khau_thuong_tru"
        managed = False

    def __str__(self):
        return self.ho_ten


# =====================
# USER ROLE (DJANGO QUẢN LÝ)
# =====================
from django.db import models
from django.contrib.auth.models import User


class UserRole(models.Model):
    ROLE_CHOICES = [
        ("ADMIN", "Admin"),
        ("TO_TRUONG", "Tổ trưởng"),
        ("TO_PHO", "Tổ phó"),
        ("CAN_BO", "Cán bộ"),
    ]

    id = models.BigAutoField(primary_key=True)

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="role"
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES
    )

    class Meta:
        db_table = "core_userrole"
        managed = False

    def __str__(self):
        return f"{self.user.username} - {self.role}"


# =====================
# AUTO ASSIGN ROLE BY EMAIL
# =====================
def get_role_from_email(email: str):
    if not email:
        return "CAN_BO"

    email = email.lower().strip()

    if email.endswith("@admin.com"):
        return "ADMIN"
    if email.endswith("@totruong.com"):
        return "TO_TRUONG"
    if email.endswith("@topho.com"):
        return "TO_PHO"
    if email.endswith("@canbo.com"):
        return "CAN_BO"

    return "CAN_BO"


@receiver(post_save, sender=User)
def auto_assign_role(sender, instance, created, **kwargs):
    if created:
        UserRole.objects.create(
            user=instance,
            role=get_role_from_email(instance.email)
        )
from django.db import models

class Person_Change(models.Model):
    # Khớp chính xác với SERIAL PRIMARY KEY trong ảnh của bạn
    ma_thay_doi = models.AutoField(primary_key=True) 
    ma_nhan_khau = models.IntegerField()
    loai_thay_doi = models.CharField(max_length=100)
    ma_ho_khau = models.CharField(max_length=10)
    # Khớp với DEFAULT CURRENT_DATE trong DB
    ngay_thay_doi = models.DateField(
        null=True,
        blank=True
    )
    # Khớp với kiểu TEXT trong ảnh của bạn
    noi_chuyen_di = models.TextField()
    ghi_chu = models.TextField()

    class Meta:
        db_table = "new_thay_doi_nhan_khau"
        managed = False # Giữ nguyên vì bạn đã có bảng sẵn trong DB

    def __str__(self):
        # Ép kiểu string để tránh lỗi "hệ nhị phân" khi hiển thị số
        return str(self.ma_thay_doi)
# =====================
# THAY ĐỔI HỘ KHẨU
# =====================
class HouseholdChange(models.Model):
    ma_thay_doi_ho_khau = models.AutoField(primary_key=True) # SERIAL PRIMARY KEY
    ma_ho_khau = models.CharField(max_length=10)             # VARCHAR(10)
    ngay_thay_doi = models.DateField(auto_now_add=True)      # DATE
    truong_thay_doi = models.CharField(max_length=255)       # VARCHAR(255)
    noi_dung_thay_doi = models.TextField()                   # TEXT

    class Meta:
        db_table = "new_thay_doi_ho_khau" # Tên bảng thực tế trong DB của bạn
        managed = False                   # Vì bạn đã có bảng sẵn trong DB

    def __str__(self):
        return f"{self.ma_ho_khau} - {self.truong_thay_doi}"
# ============================
# SỐ NGƯỜI HỘ KHẨU TRONG THÁNG
# ============================
class HouseholdPeopleMonth(models.Model):
    ma_ho_khau = models.CharField(max_length=10)           
    thang = models.IntegerField()                         
    nam = models.IntegerField()                              
    so_nhan_khau = models.IntegerField()                        
    so_tam_tru = models.IntegerField()       

    class Meta:
        db_table = "new_so_nguoi_ho_khau_theo_thang" 
        managed = False                 

    def __str__(self):
        return f"{self.ma_ho_khau} - {self.thang}/{self.nam}"

