from urllib import request
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Q, Sum
from django.views.decorators.csrf import csrf_exempt
from datetime import date
from django.http import JsonResponse
import json
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.views import View
from django.http import JsonResponse
from django.db import transaction
from django.utils import timezone
from django.db.models import OuterRef, Subquery
from django.http import HttpResponse



from .models import (
    Household,
    Person,
    HygieneFee,
    TemporaryResidence,
    TemporaryAbsence,
    ContributionCampaign,
    Contribution,
    UserRole, HouseholdDetail,Person_Change
)

# ==================================================
# Ghi chú cho Đức Anh
# NHỚ THÊM CODE CHẶN QUYỀN (THAM KHẢO CÁC VIEW KHÁC) CHO MỖI VIEW
# ==================================================

# ==================================================
# AUTH (KHÔNG ĐỔI)
# ==================================================

@csrf_exempt   # ⚠️ nên bỏ khi đã có csrf_token
def login_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if user is None:
            messages.error(request, "Sai username hoặc mật khẩu")
            return redirect("login")

        login(request, user)

        # lấy role đã tồn tại (do signal tạo)
        request.session["user_role"] = user.role.role

        return redirect("home")

    return render(request, "login.html")

@login_required
def home(request):
    print(request.user.is_authenticated)
    household_count = Household.objects.count()
    person_count = Person.objects.count()
    fee_count = HygieneFee.objects.count() + Contribution.objects.count()

    return render(request, "home.html", {
        "role": request.session.get("user_role", "CAN_BO"),
        "household_count": household_count,
        "person_count": person_count,
        "fee_count": fee_count
    })

def logout_view(request):
    logout(request)
    return redirect("login")


# ==================================================
# QUẢN LÝ HỘ KHẨU – NHÂN KHẨU
# ==================================================
# không search trả mã hộ khẩu
def qlnk(request):
    if request.user.role.role != "TO_TRUONG" and request.user.role.role != "TO_PHO":
        messages.error(request, "Bạn không có quyền quản lý hộ khẩu nhân khẩu")
        return redirect("home")
    households = Household.objects.all()
    persons = Person.objects.all()
    return render(request, "qlnk.html", {
        "households": households,
        "persons": persons,
    })


# ================= HỘ KHẨU =================

def sohokhau(request):
    if request.user.role.role != "TO_TRUONG" and request.user.role.role != "TO_PHO":
        messages.error(request, "Bạn không có quyền quản lý hộ khẩu nhân khẩu")
        return redirect("home")
    HouseholdDetails=HouseholdDetail.objects.all() #dùng để lấy thông tin chủ hộ
    return render(request, "sohokhau.html", {
        "HouseholdDetails":HouseholdDetail.objects.all(),
        "households": Household.objects.all()
    })

def empty_to_none(value):
    return value if value not in ("", None) else None

#CHỈ CẦN SO NHA ĐƯỜNG PHỐ, TỰ THÊM LA KHÊ , HÀ ĐÔNG

def empty_to_none(value):
    if value is None or str(value).strip() == "":
        return None
    return value

@csrf_exempt
def taohokhau(request, household_id=None):
    # Kiểm tra quyền (giữ nguyên logic của bạn)
    role = getattr(request.user.role, 'role', None)
    if role not in ["TO_TRUONG", "TO_PHO"]:
        return JsonResponse({"status": "error", "message": "Bạn không có quyền!"}, status=403)

    if request.method == "POST":
        ma_ho = request.POST.get("ma_ho_khau", "").strip()

        # 1. Kiểm tra tồn tại mã hộ khẩu
        if Household.objects.filter(ma_ho_khau=ma_ho).exists():
            return JsonResponse({
                "status": "error", 
                "message": f"Mã hộ khẩu '{ma_ho}' đã tồn tại trong hệ thống!"
            }, status=400)

        try:
            # 2. Tạo Hộ Khẩu (Table: new_ho_khau)
            Household.objects.create(
                ma_ho_khau=ma_ho,
                so_nha=request.POST.get("so_nha"),
                duong_pho=request.POST.get("duong_pho"),
                phuong="La Khê",
                quan="Hà Đông"
            )

            # 3. Tạo Nhân Khẩu cho Chủ hộ (Table: new_nhan_khau)
            Person.objects.create(
                ma_ho_khau=ma_ho,
                ho_ten=empty_to_none(request.POST.get("ho_ten")),
                bi_danh=empty_to_none(request.POST.get("bi_danh")),
                ngay_sinh=empty_to_none(request.POST.get("ngay_sinh")),
                gioi_tinh=empty_to_none(request.POST.get("gioi_tinh")),
                noi_sinh=empty_to_none(request.POST.get("noi_sinh")),
                nguyen_quan=empty_to_none(request.POST.get("nguyen_quan")),
                dan_toc=empty_to_none(request.POST.get("dan_toc")),
                nghe_nghiep=empty_to_none(request.POST.get("nghe_nghiep")),
                noi_lam_viec=empty_to_none(request.POST.get("noi_lam_viec")),
                cccd=empty_to_none(request.POST.get("cccd")),
                ngay_cap_cccd=empty_to_none(request.POST.get("ngay_cap_cccd")),
                noi_cap_cccd=empty_to_none(request.POST.get("noi_cap_cccd")),
                ngay_dang_ky_thuong_tru=empty_to_none(request.POST.get("ngay_dang_ky_thuong_tru")),
                dia_chi_truoc_khi_chuyen=empty_to_none(request.POST.get("dia_chi_truoc_khi_chuyen")),
                quan_he_chu_ho="Chủ hộ",
                trang_thai="Thường trú",
            )
            return JsonResponse({"status": "success", "message": "Tạo hộ khẩu thành công!"})

        except Exception as e:
            return JsonResponse({"status": "error", "message": f"Lỗi Database: {str(e)}"}, status=500)

    return render(request, "taohokhau.html", {
        "today": date.today().isoformat()
    })

def quan_ly_ho_khau(request):
    if request.user.role.role != "TO_TRUONG" and request.user.role.role != "TO_PHO":
        messages.error(request, "Bạn không có quyền quản lý hộ khẩu nhân khẩu")
        return redirect("home")
    households = Household.objects.all()
    
    # 1. Lấy danh sách mã hộ khẩu hiện có
    ma_hk_list = [hk.ma_ho_khau for hk in households]
    
    # 2. Lấy tất cả những người là 'Chủ hộ' của các mã hộ khẩu đó trong 1 lần truy vấn
    # Chuyển thành một dictionary để tra cứu cực nhanh: { 'MA_HK': 'Tên Chủ Hộ' }
    chu_ho_dict = {
        p.ma_ho_khau: p.ho_ten 
        for p in Person.objects.filter(
            ma_ho_khau__in=ma_hk_list, 
            quan_he_chu_ho__icontains='Chủ hộ'
        )
    }

    # 3. Gán tên vào từng hộ khẩu
    for hk in households:
        hk.ten_chu_ho = chu_ho_dict.get(hk.ma_ho_khau, "Chưa xác định")

    return render(request, 'sohokhau.html', {'households': households})
@csrf_exempt
def suahk(request, household_id):
    if request.user.role.role != "TO_TRUONG" and request.user.role.role != "TO_PHO":
        messages.error(request, "Bạn không có quyền quản lý hộ khẩu nhân khẩu")
        return redirect("home")
    household = get_object_or_404(Household, ma_ho_khau=household_id) #lấy ra hộ khẩu có mã hộ khẩu
    person=get_object_or_404(Person, ma_ho_khau=household_id)#lấy danh sách nhân khẩu trong hộ khẩu
    loai_thay_doi=request.POST.get("edit_type")#chọn loại thay đổi
    if(loai_thay_doi=="address"):
        if request.method == "POST":
            household.so_nha = request.POST.get("so_nha")
            household.duong_pho = request.POST.get("duong_pho")
            household.save()
    else:
        if request.method == "POST":
            #chỉnh sửa thông tin nhân khẩu
            messages.success(request, "Cập nhật hộ khẩu thành công")
            return redirect("sohokhau")



    return render(request, "form_sua_hk.html", {"household": household})

def chitiet_hk(request, household_id):
    # 1. Kiểm tra quyền
    if not hasattr(request.user, 'role') or request.user.role.role not in ["TO_TRUONG", "TO_PHO"]:
        messages.error(request, "Bạn không có quyền quản lý hộ khẩu nhân khẩu")
        return redirect("home")
    
    # 2. Lấy dữ liệu hộ khẩu và nhân khẩu
    household = get_object_or_404(Household, ma_ho_khau=household_id)
    persons = Person.objects.filter(ma_ho_khau=household_id)
    
    # 3. Lấy dữ liệu tạm trú cho hộ này
    # Lưu ý: Model của bạn dùng ma_ho_khau_tam_tru
    temp_residents = TemporaryResidence.objects.filter(ma_ho_khau_tam_tru=household_id)
    
    # 4. Xác định tên chủ hộ cho phần Header
    head_of_household = persons.filter(quan_he_chu_ho="Chủ hộ").first()
    head_name = head_of_household.ho_ten if head_of_household else "Chưa xác định"

    return render(request, "chitiet_hk.html", {
        "household": household,
        "persons": persons,
        "temp_residents": temp_residents,
        "head_name": head_name,
        "ma_ho_khau": household_id
    })



def tachhk(request, household_id):
    if request.user.role.role != "TO_TRUONG" and request.user.role.role != "TO_PHO":
        messages.error(request, "Bạn không có quyền quản lý hộ khẩu nhân khẩu")
        return redirect("home")
    #lấy toàn bộ nk của toàn bộ hk
    household_detail=HouseholdDetail.objects.filter(ma_ho_khau=household_id) # hiển thị thông tin mhk, chủ hộ hiện , địa chỉ
    person=get_object_or_404(Person, ma_ho_khau=household_id) #CHỌN NHÂN KHẨU TRONG CHỦ HỘ
    person=person.objects.exclude(quan_he_chu_ho__in="Chủ hộ")# lấy trừ chủ hộ
    household = get_object_or_404(Household, ma_ho_khau=household_id)# CHỌN HỘ KHẨU
    return render(request, "form_tach_hk.html", {"household": household})


# ================= NHÂN KHẨU =================

def nhankhau(request):
    if request.user.role.role != "TO_TRUONG" and request.user.role.role != "TO_PHO":
        messages.error(request, "Bạn không có quyền quản lý hộ khẩu nhân khẩu")
        return redirect("home")
    return render(request, "nhankhau.html", {
        "persons": Person.objects.all()
    })


# @csrf_exempt
# def themnk(request):
#     persons=Person.objects.all()#lấy thông tin bảng nhân khẩu
#     #thêm lại đầy đủ thông tin trong bảng nhân khẩu
#     if request.method == "POST":
#         Person.objects.create(
#             ho_ten=request.POST.get("ho_ten"),
#             bi_danh=request.POST.get("bi_danh"),
#             ngay_sinh=request.POST.get("ngay_sinh"),
#             gioi_tinh=request.POST.get("gioi_tinh"),
#             noi_sinh=request.POST.get("noi_sinh"),
#             nguyen_quan=request.POST.get("nguyen_quan"),
#             dan_toc=request.POST.get("dan_toc"),
#             nghe_nghiep=request.POST.get("nghe_nghiep"),
#             noi_lam_viec=request.POST.get("noi_lam_viec"),
#             cccd=request.POST.get("cccd"),
#             ngay_cap_cccd=request.POST.get("ngay_cap_cccd"),
#             noi_cap_cccd=request.POST.get("noi_cap_cccd"),
#             ngay_dang_ky_thuong_tru=request.POST.get("ngay_dang_ky_thuong_tru"),
#             dia_chi_truoc_khi_chuyen=request.POST.get("dia_chi_truoc_khi_chuyen"),
#             quan_he_chu_ho=request.POST.get("quan_he_chu_ho"),
#         )
#         messages.success(request, "Thêm nhân khẩu thành công")
#         return redirect("nhankhau")

#     return render(request, "themnk.html")

def themnk(request):
    if request.user.role.role != "TO_TRUONG" and request.user.role.role != "TO_PHO":
        messages.error(request, "Bạn không có quyền quản lý hộ khẩu nhân khẩu")
        return redirect("home")
    # 1. Lấy danh sách mã hộ khẩu từ bảng Household (new_ho_khau)
    # Vì Model của bạn không có tên chủ hộ, ta lấy Mã và Địa chỉ để người dùng dễ nhận biết
    danh_sach_hk = HouseholdDetail.objects.all()

    if request.method == "POST":
        # Hàm xử lý giá trị ngày tháng và CCCD (nếu để trống thì lưu NULL)
        def clean_val(field):
            val = request.POST.get(field, "").strip()
            return val if val != "" else None

        try:
            cccd_val = clean_val("cccd")
            if cccd_val is not None:
                trung_cccd = Person.objects.filter(cccd=cccd_val).exists()
                if trung_cccd:
                    messages.error(
                        request,
                        f"Lỗi: Số CCCD {cccd_val} đã được sử dụng!"
                    )
                    return render(
                        request,
                        "themnk.html",
                        {"danh_sach_hk": danh_sach_hk}
                    )
            # 2. Thực hiện lưu vào bảng new_nhan_khau thông qua Model Person
            Person.objects.create(
                ma_ho_khau=request.POST.get("ma_ho_khau"), # Model Person dùng CharField cho ma_ho_khau
                ho_ten=request.POST.get("ho_ten"),
                bi_danh=request.POST.get("bi_danh"),
                ngay_sinh=clean_val("ngay_sinh"),
                gioi_tinh=request.POST.get("gioi_tinh"),
                noi_sinh=request.POST.get("noi_sinh"),
                nguyen_quan=request.POST.get("nguyen_quan"),
                dan_toc=request.POST.get("dan_toc"),
                nghe_nghiep=request.POST.get("nghe_nghiep"),
                noi_lam_viec=request.POST.get("noi_lam_viec"),
                cccd=cccd_val,
                ngay_cap_cccd=clean_val("ngay_cap_cccd"),
                noi_cap_cccd=request.POST.get("noi_cap_cccd"),
                ngay_dang_ky_thuong_tru=clean_val("ngay_dang_ky_thuong_tru"),
                dia_chi_truoc_khi_chuyen=request.POST.get("dia_chi_truoc_khi_chuyen"),
                quan_he_chu_ho=request.POST.get("quan_he_chu_ho"),
                trang_thai="Thường trú"
            )
            messages.success(request, "Thêm nhân khẩu thành công!")
            danh_sach_hk = Household.objects.all().values('ma_ho_khau', 'so_nha', 'duong_pho')
            return render(request, "themnk.html", {"danh_sach_hk": danh_sach_hk})
            
        except Exception as e:
            messages.error(request, f"Lỗi: {e}")
            return render(request, "themnk.html", {"danh_sach_hk": danh_sach_hk})

    # 3. Trả dữ liệu sang HTML
    return render(request, "themnk.html", {
        "danh_sach_hk": danh_sach_hk,
        "today": date.today().isoformat()
    })

def nhankhau(request):
    if request.user.role.role != "TO_TRUONG" and request.user.role.role != "TO_PHO":
        messages.error(request, "Bạn không có quyền quản lý hộ khẩu nhân khẩu")
        return redirect("home")
    # Lấy danh sách nhân khẩu, sắp xếp mã mới nhất lên đầu
    # Thay 'id' bằng 'ma_nhan_khau' để tránh lỗi FieldError
    nhankhau_data = Person.objects.all().order_by('-ma_nhan_khau')
    
    return render(request, "nhankhau.html", {
        "nhankhau_list": nhankhau_data
    })
from django.db import IntegrityError
from django.db.models import Q # Thêm Q để tìm kiếm điều kiện phức tạp

from django.db import IntegrityError
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
from .models import Person, Household, Person_Change

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from .models import Person, HouseholdDetail, Person_Change
from datetime import datetime

def suank(request, person_id):
    # 1. Kiểm tra quyền truy cập
    if request.user.role.role not in ["TO_TRUONG", "TO_PHO"]:
        messages.error(request, "Bạn không có quyền thực hiện thao tác này.")
        return redirect("nhankhau")

    person = get_object_or_404(Person, ma_nhan_khau=person_id)
    households = HouseholdDetail.objects.exclude(ma_ho_khau=person.ma_ho_khau)

    if request.method == "POST":
        move_type = request.POST.get("move_type")
        
        try:
            # --- PHẦN 1: XỬ LÝ DỮ LIỆU PERSON ---
            FIELD_LABELS = {
                "ho_ten": "Họ tên",
                "bi_danh": "Bí danh",
                "ngay_sinh": "Ngày sinh",
                "gioi_tinh": "Giới tính",
                "noi_sinh": "Nơi sinh",
                "nguyen_quan": "Nguyên quán",
                "quan_he_chu_ho": "Quan hệ với chủ hộ",
                "cccd": "CCCD",
                "ngay_cap_cccd": "Ngày cấp CCCD",
                "noi_cap_cccd": "Nơi cấp CCCD",
                "ngay_dang_ky_thuong_tru": "Ngày đăng ký thường trú",
                "dia_chi_truoc_khi_chuyen": "Địa chỉ trước khi chuyển",
                "nghe_nghiep": "Nghề nghiệp",
                "noi_lam_viec": "Nơi làm việc",
            }
            if move_type == "update":
                changed_fields = []

                def check_change(field_name, new_value):
                    old_value = getattr(person, field_name)
                    if old_value != new_value:
                        changed_fields.append(FIELD_LABELS[field_name])
                        setattr(person, field_name, new_value)

                check_change("ho_ten", request.POST.get("ho_ten"))
                check_change("bi_danh", request.POST.get("bi_danh"))
                check_change("ngay_sinh", request.POST.get("ngay_sinh") or None)
                check_change("gioi_tinh", request.POST.get("gioi_tinh"))
                check_change("noi_sinh", request.POST.get("noi_sinh"))
                check_change("nguyen_quan", request.POST.get("nguyen_quan"))
                check_change("quan_he_chu_ho", request.POST.get("quan_he_voi_chu_ho"))
                check_change("cccd", request.POST.get("cccd"))
                check_change("ngay_cap_cccd", request.POST.get("ngay_cap_cccd") or None)
                check_change("noi_cap_cccd", request.POST.get("noi_cap_cccd"))
                check_change("ngay_dang_ky_thuong_tru", request.POST.get("ngay_dang_ky_thuong_tru") or None)
                check_change("dia_chi_truoc_khi_chuyen", request.POST.get("dia_chi_truoc_khi_chuyen"))
                check_change("nghe_nghiep", request.POST.get("nghe_nghiep"))
                check_change("noi_lam_viec", request.POST.get("noi_lam_viec"))

                person.save()

                ten_loai = "Cập nhật thông tin"

                if changed_fields:
                    ghi_chu_log = "Thay đổi thông tin: " + ", ".join(changed_fields)
                else:
                    ghi_chu_log = "Không có thay đổi thông tin"

            elif move_type == "transfer":
                dest_type = request.POST.get("transfer_destination_type")
                if dest_type == "household":
                    ma_ho_moi = request.POST.get("new_household")
                    person.ma_ho_khau = ma_ho_moi
                    person.quan_he_chu_ho = request.POST.get("newHouseholdRelation")
                    noi_den = f"Chuyển sang hộ {ma_ho_moi}"
                else:
                    noi_den = request.POST.get("noi_chuyen_den") or "Chuyển vùng khác"
                    person.trang_thai = "Đã chuyển đi"
                
                ten_loai = "Chuyển đi"
                ghi_chu_log = request.POST.get("transfer_note") or "Thay đổi nơi cư trú"

            elif move_type == "past":
                person.trang_thai = "Đã qua đời"
                ten_loai = "Qua đời"
                noi_den = "Đã qua đời"
                ghi_chu_log = request.POST.get("ghi_chu")

            # Lưu bảng Person trước
            person.save()

            # --- PHẦN 2: LƯU VÀO PERSON_CHANGE ---
            # Sử dụng .create() để Django tự xử lý việc INSERT vào bảng ma_thay_doi
            Person_Change.objects.create(
                ma_nhan_khau=int(person.ma_nhan_khau),
                loai_thay_doi=ten_loai,
                noi_chuyen_den=noi_den,
                ghi_chu=ghi_chu_log
                # ngay_chuyen_di tự động lấy theo auto_now_add
            )

            messages.success(request, f"Đã cập nhật thông tin và lưu lịch sử cho {person.ho_ten}!")
            return redirect("nhankhau")

        except Exception as e:
            # Hiển thị lỗi cụ thể nếu DB vẫn chặn (ví dụ lỗi NOT NULL)
            messages.error(request, f"Lỗi hệ thống không thể lưu lịch sử: {str(e)}")

    return render(request, "form_sua_nk.html", {
        "person": person,
        "household": households,
        "today": date.today().isoformat()
    })

# ==================================================
# TẠM TRÚ – TẠM VẮNG
# ==================================================

def qltv_tt(request):
    if request.user.role.role != "TO_TRUONG" and request.user.role.role != "TO_PHO":
        messages.error(request, "Bạn không có quyền quản lý tạm trú tạm vắng")
        return redirect("home")
    tamtru_list = list(TemporaryResidence.objects.all())
    tamvang_list = list(TemporaryAbsence.objects.all())
    context = {
        "tamtru_list": tamtru_list,
        "tamvang_list": tamvang_list,
    }

    return render(request, "qltv_tt.html", context)

class TamTru(View):
    def check_permission(self, request):
        user_role = request.session.get("user_role")
        if user_role not in ["TO_TRUONG", "TO_PHO"]:
            messages.error(request, "Bạn không có quyền truy cập")
            return False
        return True
        
    
    def get(self, request):
        subquery = Person.objects.filter(
            ma_ho_khau=OuterRef("ma_ho_khau"),
            quan_he_chu_ho="Chủ hộ"
            ).values("ho_ten")[:1]
        
        hokhau_list = Household.objects.annotate(
            ten_chu_ho=Subquery(subquery)
            ).values("ma_ho_khau", "ten_chu_ho")
        
        tamtru_list = TemporaryResidence.objects.all().order_by("-ma_tam_tru")

        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            tt_list = TemporaryResidence.objects.all().order_by("-ma_tam_tru")

            data = []
            for tt in tt_list:
                data.append({
                    "id": tt.ma_tam_tru,
                    "ho_ten": tt.ho_ten,
                    "ngay_sinh": tt.ngay_sinh.strftime("%d/%m/%Y") if tt.ngay_sinh else "",
                    "ma_ho_khau": tt.ma_ho_khau_tam_tru,
                    "ngay_bat_dau": tt.ngay_bat_dau.strftime("%d/%m/%Y"),
                    "ngay_ket_thuc": tt.ngay_ket_thuc.strftime("%d/%m/%Y"),
                    "trang_thai": tt.trang_thai_hoan_thanh
                })
            return JsonResponse(data, safe=False)

        if not self.check_permission(request):
            return redirect("home")

        context = {
            "hokhau_list": list(hokhau_list),
            "records": tamtru_list,
        }
        return render(request, "tamtru.html", context)       
    
    def post(self, request):
        if not self.check_permission(request):
            return redirect("home")
        
        tamtru_data = {
            "ma_ho_khau_tam_tru": request.POST.get("ma_ho_khau"),
            "ho_ten": request.POST.get("ten"),
            "ngay_sinh": request.POST.get("ns"),
            "nghe_nghiep": request.POST.get("ngheNghiep"),
            "cccd": request.POST.get("cccd"),
            "ngay_bat_dau": timezone.now().date(),
            "ngay_ket_thuc": request.POST.get("han")
        }

        
        #already registered check
        if TemporaryResidence.objects.filter(
            ma_ho_khau_tam_tru=request.POST.get("ma_ho_khau"),
            ho_ten=request.POST.get("ten"),
            ngay_sinh=request.POST.get("ns"),
            ngay_ket_thuc=request.POST.get("han"),
            ).exists():  
                
                return JsonResponse({"message": "Nhân khẩu đã đăng ký tạm trú"
                                     , "redirect_url": 'tamtru/'}
                                     , status=400)    
                

        TemporaryResidence.objects.create(**tamtru_data)
        Person.objects.filter(cccd=request.POST.get("cccd")).update(trang_thai="Tạm trú")
        messages.success(request, "Đăng ký tạm trú thành công")
        return redirect("tamtru")
    
class TamVang(View):
    def check_permission(self, request):
        user_role = request.session.get("user_role")
        if user_role not in ["TO_TRUONG", "TO_PHO"]:
            messages.error(request, "Bạn không có quyền truy cập")
            return False
        return True
    
    def get(self, request):
        if not self.check_permission(request):
            return redirect("home")
        
        nhankhau_list = Person.objects.all().values("ma_nhan_khau", "ho_ten", "ngay_sinh", "ma_ho_khau")
        
        nhan_khau_subquery = Person.objects.filter(
            ma_nhan_khau=OuterRef("ma_nhan_khau")
        )

        tamvang_list = TemporaryAbsence.objects.annotate(
            ho_ten=Subquery(nhan_khau_subquery.values("ho_ten")[:1]),
            ngay_sinh=Subquery(nhan_khau_subquery.values("ngay_sinh")[:1]),
            ma_ho_khau=Subquery(nhan_khau_subquery.values("ma_ho_khau")[:1]),
        ).values("ho_ten", "ngay_sinh", "ma_ho_khau", "ngay_bat_dau", "ngay_ket_thuc")

        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            tv_list = TemporaryAbsence.objects.all().order_by("-ma_tam_vang")
            data = []
            for tv in tv_list:
                person = Person.objects.filter(ma_nhan_khau=tv.ma_nhan_khau).first()
                data.append({
                    "ho_ten": person.ho_ten if person else "",
                    "ngay_sinh": person.ngay_sinh.strftime("%d/%m/%Y") if person and person.ngay_sinh else "",
                    "ngay_bat_dau": tv.ngay_bat_dau.strftime("%d/%m/%Y"),
                    "ngay_ket_thuc": tv.ngay_ket_thuc.strftime("%d/%m/%Y"),
                })
            return JsonResponse(data, safe=False)
        context = {
            "nhankhau_list": list(nhankhau_list),
            "records": tamvang_list,
        }
        return render(request, "tamvang.html", context)

    def post(self, request):
        if not self.check_permission(request):
            return JsonResponse({"error": "Không có quyền"}, status=403)
        
        TemporaryAbsence.objects.create(
            ma_nhan_khau=request.POST.get("ma_nhan_khau"),
            ngay_bat_dau=request.POST.get("ngayDi"),
            ngay_ket_thuc=request.POST.get("han"),
            ly_do=request.POST.get("lyDo"),
        )

        person = Person.objects.get(ma_nhan_khau=request.POST.get("ma_nhan_khau"))
        person.trang_thai = "Tạm vắng"
        person.save()
        
        return JsonResponse({"success": True, "message": "Đăng ký tạm vắng thành công"})

    



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

from django.shortcuts import render, redirect
from django.contrib import messages
from .models import ContributionCampaign, Contribution, HouseholdDetail

def thuphi(request):
    # Kiểm tra quyền
    if not hasattr(request.user, 'role') or request.user.role.role != "CAN_BO":
        messages.error(request, "Bạn không có quyền quản lý thu phí đóng góp")
        return redirect("home")

    if request.method == "POST":
        action = request.POST.get("action")
        print(f"Action nhận được: {action}") # Dòng này để bạn kiểm tra trong terminal/cmd

        if action == "create_campaign":
            ten = request.POST.get("ten_dot_dong_gop")
            # Kiểm tra trùng tên
            if ContributionCampaign.objects.filter(ten_dot_dong_gop=ten).exists():
                messages.error(request, f"Tên đợt '{ten}' đã tồn tại!")
            else:
                ContributionCampaign.objects.create(
                    ten_dot_dong_gop=ten,
                    ngay_bat_dau=request.POST.get("ngay_bat_dau") or None,
                    ngay_ket_thuc=request.POST.get("ngay_ket_thuc") or None
                )
                messages.success(request, f"Đã tạo đợt '{ten}' thành công!")
            
            return redirect("thuphi")

        # TRƯỜNG HỢP 2: GHI NHẬN TIỀN ĐÓNG GÓP
        elif action == "record_donation":
            ma_dot = request.POST.get("ma_dot_dong_gop")
            ma_ho = request.POST.get("ma_ho_khau")
            so_tien = request.POST.get("so_tien")

            if ma_dot and ma_ho and so_tien:
                Contribution.objects.create(
                    ma_dot_dong_gop=int(ma_dot),
                    ma_ho_khau=ma_ho,
                    so_tien=so_tien
                )
                messages.success(request, f"Đã ghi nhận đóng góp cho hộ {ma_ho}")
            else:
                messages.error(request, "Vui lòng nhập đầy đủ thông tin!")
            return redirect("thuphi")

    # Lấy dữ liệu hiển thị
    campaigns = ContributionCampaign.objects.all().order_by('-ma_dot_dong_gop')
    # Lấy danh sách hộ khẩu từ View HouseholdDetail
    households = HouseholdDetail.objects.all()
    # Lấy danh sách đóng góp (JOIN thủ công hoặc query)
    recent_contributions = Contribution.objects.all().order_by('-ma_khoan_dong_gop')[:10]

    return render(request, "thuphi.html", {
        "campaigns": campaigns,
        "households": households,
        "recent_contributions": recent_contributions
    })


@login_required
def thongke_baocao(request):
    today = date.today()

    # 1. XỬ LÝ LỌC THEO THÁNG (Nếu người dùng chọn tháng trên giao diện)
    month_filter = request.GET.get('month')  # Định dạng 'YYYY-MM'
    if month_filter:
        try:
            year_part, month_part = map(int, month_filter.split('-'))
            target_date = date(year_part, month_part, 1)
            # Dùng ngày cuối tháng để thống kê chính xác hơn
            import calendar
            last_day = calendar.monthrange(year_part, month_part)[1]
            ref_date = date(year_part, month_part, last_day)
        except:
            ref_date = today
    else:
        ref_date = today

    current_year = ref_date.year

    # ======================
    # 1. THỐNG KÊ NHÂN KHẨU
    # ======================
    persons = Person.objects.exclude(ngay_sinh__isnull=True)

    def count_by_age(min_age=None, max_age=None):
        qs = persons
        if min_age is not None:
            # Sinh trước hoặc vào năm (năm hiện tại - tuổi tối thiểu)
            qs = qs.filter(ngay_sinh__lte=date(current_year - min_age, 12, 31))
        if max_age is not None:
            # Sinh sau hoặc vào năm (năm hiện tại - tuổi tối đa)
            qs = qs.filter(ngay_sinh__gte=date(current_year - max_age, 1, 1))
        return qs

    def gender_stat(qs):
        return {
            "total": qs.count(),
            "nam": qs.filter(gioi_tinh__iexact="Nam").count(),
            "nu": qs.filter(gioi_tinh__iexact="Nữ").count(),
        }

    nhankhau_stats = [
        ("Mầm non", gender_stat(count_by_age(0, 5))),
        ("Cấp 1", gender_stat(count_by_age(6, 10))),
        ("Cấp 2", gender_stat(count_by_age(11, 14))),
        ("Cấp 3", gender_stat(count_by_age(15, 17))),
        ("Độ tuổi lao động", gender_stat(count_by_age(18, 60))),
        ("Nghỉ hưu", gender_stat(count_by_age(61, None))),
    ]

    tong_nk = gender_stat(persons)

    # ======================
    # 2. TẠM TRÚ / TẠM VẮNG (Dùng ref_date để lọc theo tháng đã chọn)
    # ======================
    tamtru_dang_o = TemporaryResidence.objects.filter(ngay_bat_dau__lte=ref_date, ngay_ket_thuc__gte=ref_date)
    tamtru_qua_han = TemporaryResidence.objects.filter(ngay_ket_thuc__lt=ref_date, trang_thai_hoan_thanh=False)

    tamvang_dang_o = TemporaryAbsence.objects.filter(ngay_bat_dau__lte=ref_date, ngay_ket_thuc__gte=ref_date)
    tamvang_qua_han = TemporaryAbsence.objects.filter(ngay_ket_thuc__lt=ref_date, trang_thai_hoan_thanh=False)

    # ======================
    # 3. ĐÓNG GÓP & TRA CỨU AJAX
    # ======================
    # Nếu là yêu cầu tìm kiếm từ JS (AJAX)
    keyword = request.GET.get('keyword')
    if keyword:
        results = Contribution.objects.filter(
            Q(ma_ho_khau__icontains=keyword) |
            Q(ma_ho_khau__chu_ho__ho_ten__icontains=keyword)  # Giả sử có relation chu_ho
        ).values('ma_ho_khau', 'ma_dot_dong_gop__ten_dot_dong_gop', 'so_tien')

        return JsonResponse(list(results), safe=False)

    # Tính toán campaign bình thường cho trang chủ report
    total_households = Household.objects.count()
    campaigns_data = []
    campaigns = ContributionCampaign.objects.all().order_by('-ngay_bat_dau')

    for c in campaigns:
        contributions = Contribution.objects.filter(ma_dot_dong_gop=c.ma_dot_dong_gop)
        so_ho_da_dong = contributions.values("ma_ho_khau").distinct().count()
        tong_tien = contributions.aggregate(total=Sum("so_tien"))["total"] or 0
        chua_dong = max(0, total_households - so_ho_da_dong)
        ti_le = round((so_ho_da_dong / total_households * 100), 1) if total_households else 0

        campaigns_data.append({
            "ten": c.ten_dot_dong_gop,
            "bat_dau": c.ngay_bat_dau,
            "ket_thuc": c.ngay_ket_thuc,
            "da_dong": so_ho_da_dong,
            "chua_dong": chua_dong,
            "ti_le": ti_le,
            "tong_tien": "{:,.0f}".format(tong_tien)  # Định dạng tiền 10,000,000
        })

    context = {
        "nhankhau_stats": nhankhau_stats,
        "tong_nk": tong_nk,
        "tamtru_dang_o": tamtru_dang_o,
        "tamtru_qua_han": tamtru_qua_han,
        "tamvang_dang_o": tamvang_dang_o,
        "tamvang_qua_han": tamvang_qua_han,
        "campaigns": campaigns_data,
        "selected_month": month_filter,
    }

    return render(request, "thongke_baocao.html", context)

# ==================================================
# QUẢN LÝ TRUY CẬP
def quanly_truycap(request):
    if request.user.role.role != "TO_TRUONG":
        messages.error(request, "Bạn không có quyền tạo tài khoản")
        return redirect("home")

    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        role = request.POST.get("role")

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username đã tồn tại")
            return redirect("quanly_truycap")

        user = User.objects.create_user(
            username=username,
            password=password
        )

        user.role.role = role
        user.role.save()

        messages.success(request, "Tạo tài khoản thành công")
        return redirect("quanly_truycap")
    users = User.objects.select_related('role').all()
    
    context = {
        'users': users,
    }
    return render(request, "quanly_truycap.html", context)

# ==================================================
# ERROR
# ==================================================
def page_not_found(request):
    return render(request, "404.html", status=404)


