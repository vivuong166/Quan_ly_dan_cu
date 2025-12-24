from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Q, Sum
from django.views.decorators.csrf import csrf_exempt

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

# ==================================================
# AUTH (KHÔNG ĐỔI)
# ==================================================
def login_view(request):
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")

        # 1. kiểm tra email tồn tại
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            messages.error(request, "Email không tồn tại")
            return redirect("login")

        # 2. xác thực mật khẩu
        user = authenticate(
            request,
            username=user_obj.username,
            password=password
        )
        print(user.id)

        if user is None:
            messages.error(request, "Sai mật khẩu")
            return redirect("login")

        # 3. đảm bảo user có role
        role_obj, created = UserRole.objects.get_or_create(
            id=user.id,
        )

        # 4. login + lưu session
        login(request, user)
        request.session["user_role"] = role_obj.role

        # debug (có thể xoá)
        print("ROLE:", role_obj.role)

        return redirect("home")

    return render(request, "login.html")


def home(request):
    return render(request, "home.html", {
        "role": request.session.get("user_role", "CAN_BO")
    })


# ==================================================
# QUẢN LÝ HỘ KHẨU – NHÂN KHẨU
# ==================================================

def qlnk(request):
    search_hk = request.GET.get("searchHoKhau", "").strip()
    search_nk = request.GET.get("searchNhanKhau", "").strip()

    households = Household.objects.all()
    if search_hk:
        households = households.filter(
            Q(ma_ho_khau__icontains=search_hk) |
            Q(duong_pho__icontains=search_hk) |
            Q(phuong__icontains=search_hk) |
            Q(quan__icontains=search_hk)
        )

    persons = Person.objects.all()
    if search_nk:
        persons = persons.filter(
            Q(ho_ten__icontains=search_nk) |
            Q(cccd__icontains=search_nk)
        )

    return render(request, "qlnk.html", {
        "households": households,
        "persons": persons,
    })


# ================= HỘ KHẨU =================

def sohokhau(request):
    return render(request, "sohokhau.html", {
        "households": Household.objects.all()
    })


@csrf_exempt
def taohokhau(request, household_id=None):
    if request.method == "POST":
        ma_ho_khau = request.POST.get("ma_ho_khau")

        if Household.objects.filter(ma_ho_khau=ma_ho_khau).exists():
            messages.error(request, "Mã hộ khẩu đã tồn tại")
            return redirect("taohokhau")

        Household.objects.create(
            ma_ho_khau=ma_ho_khau,
            so_nha=request.POST.get("so_nha"),
            duong_pho=request.POST.get("duong_pho"),
            phuong=request.POST.get("phuong"),
            quan=request.POST.get("quan"),
        )
        messages.success(request, "Tạo hộ khẩu thành công")
        return redirect("sohokhau")

    return render(request, "taohokhau.html")


@csrf_exempt
def suahk(request, household_id):
    household = get_object_or_404(Household, ma_ho_khau=household_id)

    if request.method == "POST":
        household.so_nha = request.POST.get("so_nha")
        household.duong_pho = request.POST.get("duong_pho")
        household.phuong = request.POST.get("phuong")
        household.quan = request.POST.get("quan")
        household.save()

        messages.success(request, "Cập nhật hộ khẩu thành công")
        return redirect("sohokhau")

    return render(request, "suahk.html", {"household": household})


def chitiet_hk(request, household_id):
    household = get_object_or_404(Household, ma_ho_khau=household_id)
    persons = Person.objects.filter(ma_ho_khau=household_id)
    return render(request, "chitiet_hk.html", {
        "household": household,
        "persons": persons,
    })



def tachhk(request, household_id):
    household = get_object_or_404(Household, ma_ho_khau=household_id)
    return render(request, "tachhk.html", {"household": household})


# ================= NHÂN KHẨU =================

def nhankhau(request):
    return render(request, "nhankhau.html", {
        "persons": Person.objects.all()
    })


@csrf_exempt
def themnk(request):
    if request.method == "POST":
        Person.objects.create(
            ho_ten=request.POST.get("ho_ten"),
            cccd=request.POST.get("cccd"),
            ma_ho_khau=request.POST.get("ma_ho_khau"),
            ngay_sinh=request.POST.get("ngay_sinh"),
            gioi_tinh=request.POST.get("gioi_tinh"),
        )
        messages.success(request, "Thêm nhân khẩu thành công")
        return redirect("nhankhau")

    return render(request, "themnk.html")


@csrf_exempt
def suank(request, person_id):
    person = get_object_or_404(Person, ma_nhan_khau=person_id)

    if request.method == "POST":
        person.ho_ten = request.POST.get("ho_ten")
        person.cccd = request.POST.get("cccd")
        person.save()
        messages.success(request, "Cập nhật nhân khẩu thành công")
        return redirect("nhankhau")

    return render(request, "suank.html", {"person": person})


# ==================================================
# TẠM TRÚ – TẠM VẮNG
# ==================================================

def qltv_tt(request):
    return render(request, "qltv_tt.html")


@csrf_exempt
def tamtru(request):
    if request.method == "POST":
        TemporaryResidence.objects.create(
            ma_ho_khau_tam_tru=request.POST.get("ma_ho_khau"),
            ho_ten=request.POST.get("ho_ten"),
            ngay_bat_dau=request.POST.get("ngay_bat_dau"),
            ngay_ket_thuc=request.POST.get("ngay_ket_thuc"),
            ly_do=request.POST.get("ly_do"),
        )
        messages.success(request, "Đăng ký tạm trú thành công")
        return redirect("tamtru")

    return render(request, "tamtru.html", {
        "records": TemporaryResidence.objects.all()
    })


@csrf_exempt
def tamvang(request):
    if request.method == "POST":
        TemporaryAbsence.objects.create(
            ma_nhan_khau=request.POST.get("ma_nhan_khau"),
            ngay_bat_dau=request.POST.get("ngay_bat_dau"),
            ngay_ket_thuc=request.POST.get("ngay_ket_thuc"),
            ly_do=request.POST.get("ly_do"),
        )
        messages.success(request, "Đăng ký tạm vắng thành công")
        return redirect("tamvang")

    return render(request, "tamvang.html", {
        "records": TemporaryAbsence.objects.all()
    })


# ==================================================
# BIẾN ĐỘNG NHÂN KHẨU
# ==================================================
@csrf_exempt
def biendong(request):
    return render(request, "biendong.html")


@csrf_exempt
def formdoichuho(request):
    return render(request, "formdoichuho.html")


# ==================================================
# THU PHÍ – THỐNG KÊ
# ==================================================

def thuphi(request):
    fees = HygieneFee.objects.all()
    total_paid = fees.filter(
        trang_thai="Đã nộp"
    ).aggregate(total=Sum("so_tien"))["total"] or 0

    return render(request, "thuphi.html", {
        "fees": fees,
        "total_paid": total_paid
    })



def thongke_baocao(request):
    return render(request, "thongke_baocao.html")


# ==================================================
# QUẢN LÝ TRUY CẬP

def quanly_truycap(request):
    if request.method == "POST":
        username = request.POST.get("username")
        email = request.POST.get("email")
        password = request.POST.get("password")

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username đã tồn tại")
            return redirect("quanly_truycap")

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        UserRole.objects.get_or_create(
            user=user,
            defaults={"role": "CAN_BO"}
        )

        messages.success(request, "Tạo tài khoản thành công")
        return redirect("quanly_truycap")

    return render(request, "quanly_truycap.html")


# ==================================================
# ERROR
# ==================================================
def page_not_found(request):
    return render(request, "404.html", status=404)
