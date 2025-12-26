from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
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
    UserRole, HouseholdDetail,
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
    return render(request, "home.html", {
        "role": request.session.get("user_role", "CAN_BO")
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
@csrf_exempt
def taohokhau(request, household_id=None):
    if request.user.role.role != "TO_TRUONG" and request.user.role.role != "TO_PHO":
        messages.error(request, "Bạn không có quyền quản lý hộ khẩu nhân khẩu")
        return redirect("home")
    if request.method == "POST":
        ma_ho_khauu = request.POST.get("ma_ho_khau")

        if Household.objects.filter(ma_ho_khau=ma_ho_khauu).exists():
            messages.error(request, "Mã hộ khẩu đã tồn tại")
            return redirect("taohokhau")

        Household.objects.create(
            ma_ho_khau=ma_ho_khauu,
            so_nha=request.POST.get("so_nha"),
            duong_pho=request.POST.get("duong_pho"),
            phuong="La Khê",
            quan="Hà Đông"
        )
        Person.objects.create(
            ma_ho_khau=ma_ho_khauu,

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

            ngay_dang_ky_thuong_tru=empty_to_none(
                request.POST.get("ngay_dang_ky_thuong_tru")
            ),
            dia_chi_truoc_khi_chuyen=empty_to_none(
                request.POST.get("dia_chi_truoc_khi_chuyen")
            ),

            quan_he_chu_ho="Chủ hộ",
            trang_thai="Thường trú",
        )

        messages.success(request, "Tạo hộ khẩu thành công")
        return redirect("sohokhau")

    return render(request, "taohokhau.html")

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


from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from .models import Household, Person, TemporaryResidence

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
    household = get_object_or_404(Household, ma_ho_khau=household_id)
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
    danh_sach_hk = Household.objects.all().values('ma_ho_khau', 'so_nha', 'duong_pho')

    if request.method == "POST":
        # Hàm xử lý giá trị ngày tháng và CCCD (nếu để trống thì lưu NULL)
        def clean_val(field):
            val = request.POST.get(field, "").strip()
            return val if val != "" else None

        try:
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
                cccd=clean_val("cccd"),
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
        "danh_sach_hk": danh_sach_hk
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
@csrf_exempt
def suank(request, person_id):
    if request.user.role.role != "TO_TRUONG" and request.user.role.role != "TO_PHO":
        messages.error(request, "Bạn không có quyền quản lý hộ khẩu nhân khẩu")
        return redirect("home")
    person = get_object_or_404(Person, ma_nhan_khau=person_id)

    if request.method == "POST":
        person.ho_ten = request.POST.get("ho_ten")
        person.cccd = request.POST.get("cccd")
        person.save()
        messages.success(request, "Cập nhật nhân khẩu thành công")
        return redirect("nhankhau")

    return render(request, "form_sua_nk.html", {"person": person})


# ==================================================
# TẠM TRÚ – TẠM VẮNG
# ==================================================

def qltv_tt(request):
    if request.user.role.role != "TO_TRUONG" and request.user.role.role != "TO_PHO":
        messages.error(request, "Bạn không có quyền quản lý tạm trú tạm vắng")
        return redirect("home")
    return render(request, "qltv_tt.html")


@csrf_exempt
def tamtru(request):
    if request.user.role.role != "TO_TRUONG" and request.user.role.role != "TO_PHO":
        messages.error(request, "Bạn không có quyền quản lý tạm trú tạm vắng")
        return redirect("home")
    # lấy danh sách CCCD đã có trong bảng tạm trú
    tamtru_cccds = TemporaryResidence.objects.values_list("cccd", flat=True)

    # lấy danh sách nhân khẩu chưa tạm trú
    persons = Person.objects.exclude(cccd__in=tamtru_cccds)

    # lấy danh sách hộ khẩu
    hokhau = Household.objects.all()#để lấy mã hộ khẩu thêm vào
    tamtruhientai=TemporaryResidence.objects.all()# hiển thị bảng đang tạm trú
    if request.method == "POST":
        TemporaryResidence.objects.create(
            ma_ho_khau_tam_tru=request.POST.get("ma_ho_khau"),
            ho_ten=request.POST.get("ho_ten"),
            nghe_nghiep=request.POST.get("nghe_nghiep"),
            cccd=request.POST.get("cccd"),
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
    if request.user.role.role != "TO_TRUONG" and request.user.role.role != "TO_PHO":
        messages.error(request, "Bạn không có quyền quản lý tạm trú tạm vắng")
        return redirect("home")
    # Lấy danh sách CCCD đã tạm vắng
    tamvang_cccds = TemporaryAbsence.objects.values_list("ma_nhan_khau", flat=True)

    # Lấy danh sách nhân khẩu được phép tạm vắng
    #    - trạng thái = thường trú
    #    - chưa có trong bảng tạm vắng
    persons = Person.objects.filter(
        trang_thai="Thường trú"
    ).exclude(
        ma_nhan_khau__in=tamvang_cccds
    )
    bangluutamvang=TemporaryAbsence.objects.all()

    if request.method == "POST":
        cccd = request.POST.get("cccd")

        # check nhân khẩu tồn tại
        if not Person.objects.filter(cccd=cccd).exists():
            messages.error(request, "Nhân khẩu không tồn tại")
            return redirect("tamvang")

        # check đã tạm vắng chưa
        if TemporaryAbsence.objects.filter(cccd=cccd).exists():
            messages.error(request, "Nhân khẩu đã đăng ký tạm vắng")
            return redirect("tamvang")

        # tạo tạm vắng
        TemporaryAbsence.objects.create(
            cccd=cccd,
            ngay_bat_dau=request.POST.get("ngay_bat_dau"),
            ngay_ket_thuc=request.POST.get("ngay_ket_thuc"),
            ly_do=request.POST.get("ly_do"),
        )

        messages.success(request, "Đăng ký tạm vắng thành công")
        return redirect("tamvang")

    return render(request, "tamvang.html", {
        "persons": persons,  # danh sách được chọn
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



def thongke_baocao(request):
    return render(request, "thongke_baocao.html")


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

    return render(request, "quanly_truycap.html")

# ==================================================
# ERROR
# ==================================================
def page_not_found(request):
    return render(request, "404.html", status=404)


