from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models.functions import TruncMonth
from django.db.models import Sum
from .models import Household, Person, Payment,UserRole
from .serializers import HouseholdSerializer, PersonSerializer, PaymentSerializer
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
import json

class HouseholdViewSet(viewsets.ModelViewSet):
    queryset = Household.objects.all().order_by('code')
    serializer_class = HouseholdSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['code','head_name','address']

class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.select_related('household').all()
    serializer_class = PersonSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['full_name','id_number']

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-created_at')
    serializer_class = PaymentSerializer

    @action(detail=False, methods=['get'])
    def summary_by_month(self, request):
        qs = Payment.objects.filter(status='PAID').annotate(month=TruncMonth('created_at')).values('month').annotate(total=Sum('amount')).order_by('month')
        return Response(list(qs))

def home(request):
    role = request.session.get("user_role", "CAN_BO")
    return render(request, "home.html", {"role": role})


from django.shortcuts import render
from django.db.models import Q
from .models import Household

from django.shortcuts import render
from django.db.models import Q
from .models import Household, Person

from django.shortcuts import render
from django.db.models import Q
from .models import Household

from django.shortcuts import render
from django.db.models import Q
from .models import Household, Person  # Person là model nhân khẩu

from django.shortcuts import render
from django.db.models import Q
from .models import Household, Person

from django.shortcuts import render
from django.db.models import Q
from .models import Household, Person

def qlnk(request):
    # ===== 1. Lấy từ khóa tìm kiếm =====
    search_query_hk = request.GET.get('searchHoKhau', '').strip()
    search_query_nk = request.GET.get('search_nk', '').strip()

    # ====================================
    # 2. TÌM KIẾM HỘ KHẨU
    # ====================================
    households = Household.objects.all()
    if search_query_hk:
        households = households.filter(
            Q(code__icontains=search_query_hk) |
            Q(head_name__icontains=search_query_hk) |
            Q(address__icontains=search_query_hk)
        )
    households = households.order_by('code')

    household_list = [
        {
            'id': h.id,
            'code': h.code,
            'head_name': h.head_name,
            'address': h.address,
            'person_count': h.members.count() if hasattr(h, 'members') else 0,
        }
        for h in households
    ]

    # ====================================
    # 3. TÌM KIẾM NHÂN KHẨU
    # ====================================
    persons = Person.objects.select_related('household').all()
    if search_query_nk:
        persons = persons.filter(
            Q(full_name__icontains=search_query_nk) |
            Q(id_number__icontains=search_query_nk) |
            Q(dob__icontains=search_query_nk)
        )
    persons = persons.order_by('full_name')

    person_list = [
        {
            'id': p.id,
            'full_name': p.full_name,
            # 'dob': p.dob,
            'dob': p.dob.strftime('%Y-%m-%d') if p.dob else '',
            'id_number': p.id_number,
            'gender': p.get_gender_display(),
            'household_code': p.household.code if p.household else '',
            'is_head': p.is_head,
            'relation_to_head': p.relation_to_head,
        }
        for p in persons
    ]

    # ====================================
    # 4. TRẢ DỮ LIỆU SANG TEMPLATE
    # ====================================
    context = {
        'households': household_list,
        'household_count': len(household_list),
        'searchHoKhau': search_query_hk,
        'persons': person_list,
        'person_count': len(person_list),
        'search_query_nk': search_query_nk,
        
        'households_json': json.dumps(household_list, ensure_ascii=False),
        'persons_json': json.dumps(person_list, ensure_ascii=False)
    }
    return render(request, 'qlnk.html', context)

from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.db.models import Q
from .models import Household, Person, TemporaryRecord
from datetime import datetime
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def qltv_tt(request):

    # ------------------------------
    # 1) Nếu người dùng nhấn "Thêm tạm vắng" → POST
    # ------------------------------
    if request.method == "POST":
        household_input = request.POST.get("household", "").strip()   # nhập mã hộ khẩu / tên chủ hộ / nhân khẩu
        from_date = request.POST.get("from_date", "")
        to_date = request.POST.get("to_date", "")
        destination = request.POST.get("destination", "")
        reason = request.POST.get("reason", "")

        # Tìm hộ khẩu theo code hoặc tên chủ hộ
        household = Household.objects.filter(
            Q(code__iexact=household_input) |
            Q(head_name__icontains=household_input)
        ).first()

        if household is None:
            return render(request, "qltv_tt.html", {
                "error": "Không tìm thấy hộ khẩu",
                "records": TemporaryRecord.objects.filter(rec_type="TEMP_OUT")
            })

        # Tạo bản ghi tạm vắng
        TemporaryRecord.objects.create(
            household=household,
            person=None,                      # frontend không cho chọn nhân khẩu → để None
            rec_type="TEMP_OUT",
            from_date=datetime.strptime(from_date, "%Y-%m-%d"),
            to_date=datetime.strptime(to_date, "%Y-%m-%d") if to_date else None,
            destination=destination,
            reason=reason
        )

        return HttpResponseRedirect(reverse("qltv_tt"))

    # ------------------------------
    # 2) Xử lý tìm kiếm danh sách tạm vắng → GET
    # ------------------------------
    search = request.GET.get("search", "").strip()

    records = TemporaryRecord.objects.filter(rec_type="TEMP_OUT").order_by("-from_date")

    if search:
        records = records.filter(
            Q(household__code__icontains=search) |
            Q(household__head_name__icontains=search) |
            Q(destination__icontains=search)
        )

    # ------------------------------
    # 3) Trả dữ liệu cho template
    # ------------------------------
    print(records);
    print(search);
    return render(request, "qltv_tt.html", {
        "records": records,
        "search": search
    })

def tamvang(request):
    # View riêng cho tạm vắng - giữ nguyên logic như qltv_tt
    if request.method == "POST":
        household_input = request.POST.get("household", "").strip()
        from_date = request.POST.get("from_date", "")
        to_date = request.POST.get("to_date", "")
        destination = request.POST.get("destination", "")
        reason = request.POST.get("reason", "")

        household = Household.objects.filter(
            Q(code__iexact=household_input) |
            Q(head_name__icontains=household_input)
        ).first()

        if household is None:
            return render(request, "tamvang.html", {
                "error": "Không tìm thấy hộ khẩu",
                "records": TemporaryRecord.objects.filter(rec_type="TEMP_OUT")
            })

        TemporaryRecord.objects.create(
            household=household,
            person=None,
            rec_type="TEMP_OUT",
            from_date=datetime.strptime(from_date, "%Y-%m-%d"),
            to_date=datetime.strptime(to_date, "%Y-%m-%d") if to_date else None,
            destination=destination,
            reason=reason
        )

        return HttpResponseRedirect(reverse("tamvang"))

    search = request.GET.get("search", "").strip()
    records = TemporaryRecord.objects.filter(rec_type="TEMP_OUT").order_by("-from_date")

    if search:
        records = records.filter(
            Q(household__code__icontains=search) |
            Q(household__head_name__icontains=search) |
            Q(destination__icontains=search)
        )

    return render(request, "tamvang.html", {
        "records": records,
        "search": search
    })

def tamtru(request):
    # View riêng cho tạm trú - logic tương tự
    return render(request, "tamtru.html")

def thuphi(request):

    return render(request, "thuphi.html")

def thongke_baocao(request):

    return render(request, "thongke_baocao.html")

def quanly_truycap(request):
    if request.method == "POST":
        username = request.POST.get("username")
        email = request.POST.get("email")          # <-- Lấy email
        password = request.POST.get("password")
        is_staff = "is_staff" in request.POST

        # Kiểm tra username trùng
        if User.objects.filter(username=username).exists():
            messages.error(request, "Tên đăng nhập đã tồn tại!")
            return redirect("quanly_truycap")

        # Kiểm tra email trùng
        if User.objects.filter(email=email).exists():
            messages.error(request, "Email đã được sử dụng!")
            return redirect("quanly_truycap")

        # Tạo user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        user.is_staff = is_staff
        user.save()

        messages.success(request, "Tạo tài khoản FULL QUYỀN thành công!")
        return redirect("quanly_truycap")

    return render(request, "quanly_truycap.html")

from django.db.models import Q

from django.shortcuts import render
from django.db.models import Q
from .models import Household

from django.shortcuts import render
from django.db.models import Q
from .models import Household

# views.py
from django.shortcuts import render
from .models import Household

from django.shortcuts import render
from .models import Household, Person
from django.db.models import Q

def sohokhau(request):
    return render(request, 'sohokhau.html')

def nhankhau(request):

    return render(request, "nhankhau.html")

def themnk(request):
    return render(request, "themnk.html")

def suank(request, person_id):
    return render(request, "form_sua_nk.html", {"person_id": person_id})

def suahk(request, household_id):
    return render(request, "form_sua_hk.html", {"household_id": household_id})

def chitiet_hk(request, household_id):
    return render(request, "chitiet_hk.html", {"household_id": household_id})

from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.contrib import messages
def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        # Tìm user bằng email
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            messages.error(request, "Email không tồn tại!")
            return render(request, 'login.html')

        # Authenticate bằng username
        user = authenticate(request, username=user_obj.username, password=password)

        if user is not None:
            login(request, user)

            # ===== LẤY ROLE NGƯỜI DÙNG =====
            try:
                role = user.role.role
            except UserRole.DoesNotExist:
                role = "CAN_BO"    # nếu chưa có role thì gán mặc định

            # Lưu role vào session
            print(role);
            request.session['user_role'] = role

            return redirect('home')
        else:
            messages.error(request, "Mật khẩu không chính xác!")

    return render(request, 'login.html')
def taohokhau(request, household_id=None):
    """View cho trang tạo/cập nhật hộ khẩu"""

    if request.method == 'POST':
        try:
            # Parse JSON từ request
            data = json.loads(request.body)

            # Extract form data
            household_code = data.get('householdCode', '').strip()
            creation_date = data.get('creationDate')
            creation_reason = data.get('creationReason')

            # Address information
            house_number = data.get('houseNumber', '').strip()
            street_name = data.get('streetName', '').strip()
            ward_name = data.get('wardName')
            district_name = data.get('districtName')
            province_name = data.get('provinceName')
            full_address = data.get('fullAddress', '')

            # Head of household information
            head_full_name = data.get('headFullName', '').strip()
            head_alias = data.get('headAlias', '').strip()
            head_dob = data.get('headDob')
            head_gender = data.get('headGender')
            head_id_number = data.get('headIdNumber', '').strip()
            head_occupation = data.get('headOccupation', '').strip()
            head_ethnicity = data.get('headEthnicity', 'Kinh')
            head_religion = data.get('headReligion', '')
            head_education = data.get('headEducation', '')

            # Other information
            household_notes = data.get('householdNotes', '').strip()

            # Auto-generate household code if blank
            if not household_code:
                from datetime import datetime
                import random
                year = datetime.now().year
                random_num = random.randint(100, 999)
                household_code = f"HK-{year}{random_num}"

            # === EDIT MODE ===
            if household_id:
                try:
                    household = Household.objects.get(code=household_id)
                    household.code = household_code
                    household.head_name = head_full_name
                    household.address = full_address
                    household.save()

                    return JsonResponse({
                        'status': 'success',
                        'message': 'Cập nhật hộ khẩu thành công!',
                        'household_code': household_code
                    })
                except Household.DoesNotExist:
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Không tìm thấy hộ khẩu cần cập nhật!'
                    })

            # === CREATE MODE ===
            else:
                if Household.objects.filter(code=household_code).exists():
                    return JsonResponse({
                        'status': 'error',
                        'message': 'Mã hộ khẩu đã tồn tại!'
                    })

                # Create household
                household = Household.objects.create(
                    code=household_code,
                    head_name=head_full_name,
                    address=full_address,
                    created_at=creation_date
                )

                # Create head of household (Person)
                Person.objects.create(
                    household=household,
                    full_name=head_full_name,
                    alias=head_alias,
                    dob=head_dob,
                    gender=head_gender,
                    id_number=head_id_number,
                    occupation=head_occupation,

                    # NEW FIELDS (CHUẨN)
                    relation_to_head='Chủ hộ',
                    is_head=True
                )

                return JsonResponse({
                    'status': 'success',
                    'message': 'Tạo hộ khẩu thành công!',
                    'household_code': household_code
                })

        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Dữ liệu không hợp lệ!'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Có lỗi xảy ra: {str(e)}'})

    # === GET request ===
    context = {}
    if household_id:
        try:
            household = Household.objects.get(code=household_id)
            head_person = Person.objects.filter(household=household, is_head=True).first()

            context = {
                'is_edit': True,
                'household': household,
                'head_person': head_person
            }

        except Household.DoesNotExist:
            from django.contrib import messages
            messages.error(request, 'Không tìm thấy hộ khẩu!')
            return redirect('sohokhau')

    return render(request, 'taohokhau.html', context)

def biendong(request):
    """View cho trang cập nhật biến động nhân khẩu"""
    if request.method == 'POST':
        # Xử lý form submission
        try:
            # Lấy dữ liệu từ form
            nhankhau_id = request.POST.get('nhankhau_id')
            change_type = request.POST.get('change_type')
            
            # Xử lý theo loại biến động
            if change_type == 'chuyen_di':
                # Xử lý chuyển đi
                new_address = request.POST.get('new_address')
                move_date = request.POST.get('move_date')
                move_reason = request.POST.get('move_reason')
                move_note = request.POST.get('move_note', '')
                
                # Lưu vào database (implement later)
                # BiendongRecord.objects.create(...)
                
            elif change_type == 'qua_doi':
                # Xử lý qua đời
                death_date = request.POST.get('death_date')
                death_place = request.POST.get('death_place', '')
                death_cause = request.POST.get('death_cause')
                death_certificate = request.POST.get('death_certificate', '')
                death_note = request.POST.get('death_note', '')
                
                # Lưu vào database (implement later)
                
            elif change_type == 'doi_chu':
                # Xử lý đổi chủ hộ
                new_head = request.POST.get('new_head')
                change_date = request.POST.get('change_date')
                change_reason = request.POST.get('change_reason')
                approval_doc = request.POST.get('approval_doc', '')
                change_note = request.POST.get('change_note', '')
                
                # Lưu vào database (implement later)
            
            # Trả về JSON response cho AJAX
            return JsonResponse({
                'status': 'success',
                'message': 'Cập nhật biến động thành công!'
            })
            
        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': f'Có lỗi xảy ra: {str(e)}'
            })
    
    # GET request - hiển thị form
    return render(request, 'biendong.html')
def formdoichuho(request):
    return render(request, "formdoichuho.html")

def page_not_found(request):
    return render(request, "404.html")