from urllib import request
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Q, Sum
from datetime import date
from django.http import JsonResponse
import json
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.views import View
from django.http import JsonResponse
from django.db import transaction
from django.utils import timezone
from django.db.models import OuterRef, Subquery, Exists
from django.http import HttpResponse
from django.contrib.auth.mixins import LoginRequiredMixin
from django.utils.timezone import now


from .models import (
    Household,
    Person,
    HygieneFee,
    TemporaryResidence,
    TemporaryAbsence,
    ContributionCampaign,
    Contribution,
    UserRole, 
    HouseholdDetail,
    Person_Change,
    PersonCurrent
)

# ==================================================
# Ghi chú cho Đức Anh
# NHỚ THÊM CODE CHẶN QUYỀN (THAM KHẢO CÁC VIEW KHÁC) CHO MỖI VIEW
# ==================================================

# ==================================================
# AUTH (KHÔNG ĐỔI)
# ==================================================

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
@login_required
def qlnk(request):
    if request.user.role.role != "TO_TRUONG" and request.user.role.role != "TO_PHO":
        messages.error(request, "Bạn không có quyền quản lý hộ khẩu nhân khẩu")
        return redirect("home")
    
    ho_ten_subquery = Person.objects.filter(
        ma_ho_khau=OuterRef('ma_ho_khau'),
        quan_he_chu_ho__icontains='Chủ hộ'
    ).values('ho_ten')[:1]
    households = Household.objects.annotate(
        ho_ten=Subquery(ho_ten_subquery)).values("ma_ho_khau"
                                                 , "ho_ten"
                                                 , "so_nha"
                                                 , "duong_pho"
                                                 , "phuong"
                                                 , "quan")

    data = []
    for p in Person.objects.all():
        data.append({
            "ho_ten": p.ho_ten,
            "bi_danh": p.bi_danh,
            "ngay_sinh": p.ngay_sinh.strftime("%d/%m/%Y") if p.ngay_sinh else None,
            "ma_nhan_khau": p.ma_nhan_khau,
            "ma_ho_khau": p.ma_ho_khau,
            "gioi_tinh": p.gioi_tinh,
            "nguyen_quan": p.nguyen_quan,
            "noi_sinh": p.noi_sinh,
            "dan_toc": p.dan_toc,
            "nghe_nghiep": p.nghe_nghiep,
            "noi_lam_viec": p.noi_lam_viec,
            "cccd": p.cccd,
            "noi_cap_cccd": p.noi_cap_cccd,
            "ngay_cap_cccd": p.ngay_cap_cccd.strftime("%d/%m/%Y") if p.ngay_cap_cccd else None,
            "dia_chi_truoc_khi_chuyen": p.dia_chi_truoc_khi_chuyen,
            "ngay_dang_ky_thuong_tru": p.ngay_dang_ky_thuong_tru.strftime("%d/%m/%Y") if p.ngay_dang_ky_thuong_tru else None,
            "quan_he_chu_ho": p.quan_he_chu_ho,
            "trang_thai": p.trang_thai,
        })
    return render(request, "qlnk.html", {
        "households_json": json.dumps(list(households), ensure_ascii=False),
        "persons_json": json.dumps(list(data), ensure_ascii=False),
    })

# ================= HỘ KHẨU =================
@login_required
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

@login_required
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

@login_required
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

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db import transaction
from .models import Household, Person

from datetime import date
from .models import HouseholdChange
@login_required
def suahk(request, household_id):
    if request.user.role.role not in ["TO_TRUONG", "TO_PHO"]:
        messages.error(request, "Bạn không có quyền quản lý hộ khẩu nhân khẩu")
        return redirect("home")

    household = get_object_or_404(Household, ma_ho_khau=household_id)
    members = Person.objects.filter(ma_ho_khau=household_id)

    if request.method == "POST":
        loai_thay_doi = request.POST.get("edit_type")

        try:
            with transaction.atomic():
                if loai_thay_doi == "address":
                    old_addr = f"{household.so_nha}, {household.duong_pho}"
                    household.so_nha = request.POST.get("house_number")
                    household.duong_pho = request.POST.get("street_name")
                    household.save()

                    # Ghi lịch sử thay đổi hộ khẩu
                    new_addr = f"{household.so_nha}, {household.duong_pho}"
                    HouseholdChange.objects.create(
                        ma_ho_khau=household_id,
                        truong_thay_doi="Địa chỉ",
                        noi_dung_thay_doi=f"Thay đổi từ '{old_addr}' sang '{new_addr}'"
                    )
                    messages.success(request, "Cập nhật địa chỉ thành công")

                elif loai_thay_doi == "head":
                    new_head_id = request.POST.get("new_head")
                    new_head_person = get_object_or_404(Person, ma_nhan_khau=new_head_id)
                    
                    # Ghi lịch sử thay đổi chủ hộ
                    HouseholdChange.objects.create(
                        ma_ho_khau=household_id,
                        truong_thay_doi="Chủ hộ",
                        noi_dung_thay_doi=f"Chủ hộ mới: {new_head_person.ho_ten}"
                    )

                    # Cập nhật quan hệ cho tất cả thành viên
                    for member in members:
                        if str(member.ma_nhan_khau) == str(new_head_id):
                            member.quan_he_chu_ho = "Chủ hộ"
                        else:
                            new_rel = request.POST.get(f"relation_{member.ma_nhan_khau}")
                            if new_rel:
                                member.quan_he_chu_ho = new_rel
                        member.save()
                    
                    messages.success(request, "Thay đổi chủ hộ thành công")

                return redirect("sohokhau")
        except Exception as e:
            messages.error(request, f"Lỗi: {str(e)}")

    return render(request, "form_sua_hk.html", {
        "household": household,
        "members": members
    })

@login_required
def chitiet_hk(request, household_id):
    # 1. Kiểm tra quyền
    if not hasattr(request.user, 'role') or request.user.role.role not in ["TO_TRUONG", "TO_PHO"]:
        messages.error(request, "Bạn không có quyền quản lý hộ khẩu nhân khẩu")
        return redirect("home")
    
    # 2. Lấy dữ liệu hộ khẩu và nhân khẩu
    #lấy thông tin cơ bản
    household_detail=get_object_or_404(HouseholdDetail, ma_ho_khau=household_id)
    persons = Person.objects.filter(ma_ho_khau=household_id)
    danhsach_manhankhau=persons.ma_nhan_khau# lấy nhân khẩu của hộ
    person_change=Person_Change.objects.filter(ma_nhan_khau=danhsach_manhankhau)# danh sách thay đổi nhân khẩu
    household_change=HouseholdChange.objects.filter(ma_ho_khau=household_id) #danh sách thay đổi hộ khẩu
    # 3. Lấy dữ liệu tạm trú cho hộ này
    temp_residents = TemporaryResidence.objects.filter(ma_ho_khau_tam_tru=household_id)
    return render(request, "chitiet_hk.html")

@login_required
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
@login_required
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

@login_required
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

@login_required
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

@login_required
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
            if move_type == "update":
                person.ho_ten = request.POST.get("ho_ten")
                person.bi_danh = request.POST.get("bi_danh")
                person.ngay_sinh = request.POST.get("ngay_sinh") or None
                person.gioi_tinh = request.POST.get("gioi_tinh")
                person.noi_sinh = request.POST.get("noi_sinh")
                person.nguyen_quan = request.POST.get("nguyen_quan")
                person.quan_he_chu_ho = request.POST.get("quan_he_voi_chu_ho")
                person.cccd = request.POST.get("cccd")
                person.ngay_cap_cccd = request.POST.get("ngay_cap_cccd") or None
                person.noi_cap_cccd = request.POST.get("noi_cap_cccd")
                person.nghe_nghiep = request.POST.get("nghe_nghiep")
                person.noi_lam_viec = request.POST.get("noi_lam_viec")
                person.dan_toc = request.POST.get("dan_toc")
                
                # ten_loai = "Cập nhật thông tin"
                # ghi_chu_log = "Thay đổi thông tin nhân khẩu"

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
                ngay_thay_doi = request.POST.get("ngay_chuyen_di")

            elif move_type == "past":
                person.trang_thai = "Đã qua đời"
                ten_loai = "Qua đời"
                # noi_den = "Đã qua đời"
                ghi_chu_log = request.POST.get("ghi_chu")

            # Lưu bảng Person trước
            person.save()
            if move_type == "update":
                # Nếu chỉ cập nhật thông tin, không cần lưu lịch sử thay đổi
                messages.success(request, f"Đã cập nhật thông tin cho {person.ho_ten}!")
                return redirect("nhankhau")

            # --- PHẦN 2: LƯU VÀO PERSON_CHANGE ---
            # Sử dụng .create() để Django tự xử lý việc INSERT vào bảng ma_thay_doi
            noi_den = noi_den if 'noi_den' in locals() else None
            ngay_thay_doi = ngay_thay_doi if 'ngay_thay_doi' in locals() else None
            
            Person_Change.objects.create(
                ma_nhan_khau=int(person.ma_nhan_khau),
                loai_thay_doi=ten_loai,
                noi_chuyen_di=noi_den,
                ngay_thay_doi=ngay_thay_doi,
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
@login_required
def qltv_tt(request):
    if request.user.role.role != "TO_TRUONG" and request.user.role.role != "TO_PHO":
        messages.error(request, "Bạn không có quyền quản lý tạm trú tạm vắng")
        return redirect("home")
    tamtru_list = TemporaryResidence.objects.all().values("ho_ten", "cccd", "ngay_bat_dau", "ngay_ket_thuc", "trang_thai_hoan_thanh")

    # Format date fields to strings so json.dumps won't fail
    tamtru_data = []
    for tt in tamtru_list:
        tt_ngay_bat_dau = tt.get("ngay_bat_dau")
        tt_ngay_ket_thuc = tt.get("ngay_ket_thuc")
        tt_trang_thai_hoan_thanh = tt.get("trang_thai_hoan_thanh")
        
        tt["trang_thai_hoan_thanh"] = "Đã kết thúc" if tt_trang_thai_hoan_thanh is True else "Chưa kết thúc"
        tt["ngay_bat_dau"] = tt_ngay_bat_dau.strftime("%d/%m/%Y") if tt_ngay_bat_dau else None
        tt["ngay_ket_thuc"] = tt_ngay_ket_thuc.strftime("%d/%m/%Y") if tt_ngay_ket_thuc else None

        tamtru_data.append(tt)

    nhan_khau_subquery = Person.objects.filter(
        ma_nhan_khau=OuterRef("ma_nhan_khau")
    )

    tamvang_list = TemporaryAbsence.objects.annotate(
        ho_ten=Subquery(nhan_khau_subquery.values("ho_ten")[:1]),
        cccd=Subquery(nhan_khau_subquery.values("cccd")[:1]),
    ).values("ho_ten", "cccd", "ngay_bat_dau", "ngay_ket_thuc", "trang_thai_hoan_thanh")

    tamvang_data = []
    for tv in tamvang_list:
        tv_ngay_bat_dau = tv.get("ngay_bat_dau")
        tv_ngay_ket_thuc = tv.get("ngay_ket_thuc")
        tv_trang_thai_hoan_thanh = tv.get("trang_thai_hoan_thanh")

        tv["trang_thai_hoan_thanh"] = "Đã kết thúc" if tv_trang_thai_hoan_thanh is True else "Chưa kết thúc"
        tv["ngay_bat_dau"] = tv_ngay_bat_dau.strftime("%d/%m/%Y") if tv_ngay_bat_dau else None
        tv["ngay_ket_thuc"] = tv_ngay_ket_thuc.strftime("%d/%m/%Y") if tv_ngay_ket_thuc else None
        tamvang_data.append(tv)

    context = {
        "tamtru_json": json.dumps(tamtru_data, ensure_ascii=False),
        "tamvang_json": json.dumps(tamvang_data, ensure_ascii=False),
    }

    return render(request, "qltv_tt.html", context)

class TamTru(LoginRequiredMixin, View):
    def check_permission(self, request):
        user_role = request.session.get("user_role")
        if user_role not in ["TO_TRUONG", "TO_PHO"]:
            messages.error(request, "Bạn không có quyền truy cập")
            return False
        return True
          
    def get(self, request):
        if not self.check_permission(request):
            return redirect("home")
        
        TemporaryResidence.objects.filter(
            trang_thai_hoan_thanh=False,
            ngay_ket_thuc__lt=timezone.now().date()
        ).update(trang_thai_hoan_thanh=True)
        
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
            "ngay_sinh": request.POST.get("ngay_sinh"),
            "nghe_nghiep": request.POST.get("nghe_nghiep"),
            "cccd": request.POST.get("cccd"),
            "ngay_bat_dau": request.POST.get("ngay_den"),
            "ngay_ket_thuc": request.POST.get("han")
        }

        #already registered check
        if TemporaryResidence.objects.filter(
            ma_ho_khau_tam_tru=request.POST.get("ma_ho_khau"),
            ho_ten=request.POST.get("ten"),
            ngay_sinh=request.POST.get("ngay_sinh"),
            ngay_ket_thuc=request.POST.get("han"),
            ).exists():  
                
                return JsonResponse({"message": "Nhân khẩu đã đăng ký tạm trú"
                                     , "redirect_url": 'tamtru/'}
                                     , status=400)    
                

        TemporaryResidence.objects.create(**tamtru_data)
        Person.objects.filter(cccd=request.POST.get("cccd")).update(trang_thai="Tạm trú")
        messages.success(request, "Đăng ký tạm trú thành công")
        return redirect("tamtru")

class TamVang(LoginRequiredMixin, View):
    def check_permission(self, request):
        user_role = request.session.get("user_role")
        if user_role not in ["TO_TRUONG", "TO_PHO"]:
            messages.error(request, "Bạn không có quyền truy cập")
            return False
        return True
    
    def get(self, request):
        if not self.check_permission(request):
            return redirect("home")
        
        TemporaryAbsence.objects.filter(
            trang_thai_hoan_thanh=False,
            ngay_ket_thuc__lt=timezone.now().date()
        ).update(trang_thai_hoan_thanh=True)
        
        hoan_thanh_tam_vang_subquery=TemporaryAbsence.objects.filter(
            ma_nhan_khau=OuterRef("ma_nhan_khau"),
            trang_thai_hoan_thanh=True
        )

        Person.objects.annotate(
            da_hoan_thanh_tam_vang=Exists(hoan_thanh_tam_vang_subquery)
        ).filter(
            da_hoan_thanh_tam_vang=True,
            trang_thai="Tạm vắng"
        ).update(trang_thai="Thường trú")
        
        nhan_khau_subquery = Person.objects.filter(
            ma_nhan_khau=OuterRef("ma_nhan_khau")
        )

        nhankhauthuongtru_list = PersonCurrent.objects.all()

        tamvang_list = TemporaryAbsence.objects.annotate(
            ho_ten=Subquery(nhan_khau_subquery.values("ho_ten")[:1]),
            ngay_sinh=Subquery(nhan_khau_subquery.values("ngay_sinh")[:1]),
            ma_ho_khau=Subquery(nhan_khau_subquery.values("ma_ho_khau")[:1]),
        ).values("ho_ten", "ngay_sinh", "ma_ho_khau", "ngay_bat_dau", "ngay_ket_thuc", "trang_thai_hoan_thanh")

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
                    "trang_thai": tv.trang_thai_hoan_thanh
                })
            return JsonResponse(data, safe=False)
        context = {
            "nhankhauthuongtru_list": list(nhankhauthuongtru_list),
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
            trang_thai_hoan_thanh=False
        )

        Person.objects.filter(
            ma_nhan_khau=request.POST.get("ma_nhan_khau"),
            trang_thai="Thường trú"
        ).update(trang_thai="Tạm vắng")
                
        return JsonResponse({"success": True, "message": "Đăng ký tạm vắng thành công"})

# ==================================================
# BIẾN ĐỘNG NHÂN KHẨU
# ==================================================
@login_required
def biendong(request):
    return render(request, "biendong.html")


@login_required
def formdoichuho(request):
    return render(request, "formdoichuho.html")


# ==================================================
# THU PHÍ – THỐNG KÊ
# ==================================================
@login_required
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
    return render(request, "thongke_baocao.html")


# ==================================================
# QUẢN LÝ TRUY CẬP
@login_required
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


