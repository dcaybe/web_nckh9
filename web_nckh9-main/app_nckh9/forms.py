from django import forms
from .models import *

class LoginForm(forms.Form):
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'Email'})
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Mật khẩu'})
    )

class StudentAppealForm(forms.ModelForm):
    class Meta:
        model = StudentsReport
        fields = ['title', 'content', 'evidence', 'student', 'semester']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'content': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'evidence': forms.FileInput(attrs={'class': 'form-control'}),
            'student': forms.Select(attrs={'class': 'form-control'}),
            'semester': forms.Select(attrs={'class': 'form-control'}),
        }

class ScoreManagementForm(forms.ModelForm):
    class Meta:
        model = GVCNDanhGia
        fields = [
            'kqHocTap', 'diemNCKH', 'koDungPhao', 'koDiHocMuon', 'boThiOlympic',
            'tronHoc', 'koVPKL', 'diemCDSV', 'koThamgiaDaydu', 'koDeoTheSV',
            'koSHL', 'dongHPmuon', 'thamgiaDayDu', 'thanhtichHoatDong',
            'thamgiaTVTS', 'koThamgiaDaydu2', 'viphamVanHoaSV', 'chaphanhDang',
            'giupdoCongDong', 'gayMatDoanKet', 'dongBHYTmuon', 'thanhvienBCS',
            'caccapKhenThuong', 'BCSvotrachnghiem'
        ]
        widgets = {
            'kqHocTap': forms.NumberInput(attrs={'class': 'form-control'}),
            'diemNCKH': forms.NumberInput(attrs={'class': 'form-control'}),
            'diemCDSV': forms.NumberInput(attrs={'class': 'form-control'}),
            'thanhtichHoatDong': forms.NumberInput(attrs={'class': 'form-control'}),
            'thanhvienBCS': forms.NumberInput(attrs={'class': 'form-control'})
        }

    def clean(self):
        cleaned_data = super().clean()
        drl_tongket = self.instance.diem_tong_ket()
        if drl_tongket > 100:
            raise forms.ValidationError("Tổng điểm không được vượt quá 100")
        return cleaned_data

class UserManagementForm(forms.ModelForm):
    class Meta:
        model = AdminManage
        fields = ['tenSV', 'emailSV', 'position', 'khoa', 'status']
        widgets = {
            'tenSV': forms.TextInput(attrs={'class': 'form-control'}),
            'emailSV': forms.EmailInput(attrs={'class': 'form-control'}),
            'position': forms.Select(attrs={'class': 'form-control'}),
            'khoa': forms.TextInput(attrs={'class': 'form-control'}),
            'status': forms.Select(attrs={'class': 'form-control'})
        }

    def clean_email(self):
        email = self.cleaned_data.get('emailSV')
        if AdminManage.objects.filter(emailSV=email).exists():
            raise forms.ValidationError("Email đã tồn tại trong hệ thống")
        return email

class InfoStudentForm(forms.ModelForm):
    class Meta:
        model = InfoStudent
        fields = [
            'maSV', 'tenSV', 'lopSV', 'gender', 'dob', 'phone', 'emailSV', 'status',
            'address', 'chuyenNganh', 'khoaSV', 'nienkhoa', 'heDaoTao', 'coVanHocTap',
            'tkCoVan', 'emialCoVan', 'phoneCoVan', 'boMonCoVan', 'ketqua', 'semester'
        ]
        widgets = {
            'maSV': forms.NumberInput(attrs={'class': 'form-control'}),
            'tenSV': forms.TextInput(attrs={'class': 'form-control'}),
            'lopSV': forms.TextInput(attrs={'class': 'form-control'}),
            'gender': forms.TextInput(attrs={'class': 'form-control'}),
            'dob': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'phone': forms.NumberInput(attrs={'class': 'form-control'}),
            'emailSV': forms.EmailInput(attrs={'class': 'form-control'}),
            'status': forms.TextInput(attrs={'class': 'form-control'}),
            'address': forms.TextInput(attrs={'class': 'form-control'}),
            'chuyenNganh': forms.TextInput(attrs={'class': 'form-control'}),
            'khoaSV': forms.TextInput(attrs={'class': 'form-control'}),
            'nienkhoa': forms.TextInput(attrs={'class': 'form-control'}),
            'heDaoTao': forms.TextInput(attrs={'class': 'form-control'}),
            'coVanHocTap': forms.TextInput(attrs={'class': 'form-control'}),
            'tkCoVan': forms.TextInput(attrs={'class': 'form-control'}),
            'emialCoVan': forms.EmailInput(attrs={'class': 'form-control'}),
            'phoneCoVan': forms.NumberInput(attrs={'class': 'form-control'}),
            'boMonCoVan': forms.TextInput(attrs={'class': 'form-control'}),
            'ketqua': forms.Textarea(attrs={'class': 'form-control'}),
            'semester': forms.TextInput(attrs={'class': 'form-control'}),
        }

class SinhVienTDGForm(forms.ModelForm):
    class Meta:
        model = SinhVienTDG
        fields = [
            'maSV', 'tenSV', 'lopSV', 'dob', 'khoaSV', 'khoaHoc', 'kqHocTap', 'diemNCKH',
            'koDungPhao', 'koDiHocMuon', 'boThiOlympic', 'tronHoc', 'koVPKL', 'diemCDSV',
            'koThamgiaDaydu', 'koDeoTheSV', 'koSHL', 'dongHPmuon', 'thamgiaDayDu',
            'thanhtichHoatDong', 'thamgiaTVTS', 'koThamgiaDaydu2', 'viphamVanHoaSV',
            'chaphanhDang', 'giupdoCongDong', 'gayMatDoanKet', 'dongBHYTmuon',
            'thanhvienBCS', 'caccapKhenThuong', 'BCSvotrachnghiem',
            'anhminhchung1', 'anhminhchung2', 'anhminhchung3', 'anhminhchung4',
            'anhminhchung5', 'anhminhchung6', 'anhminhchung7',
            'ghichu1', 'ghichu2', 'ghichu3', 'ghichu4', 'ghichu5', 'ghichu6',
            'ghichu7', 'ghichu8', 'drl_tongket', 'xepLoai'
        ]
        widgets = {
            'maSV': forms.NumberInput(attrs={'class': 'form-control'}),
            'tenSV': forms.TextInput(attrs={'class': 'form-control'}),
            'lopSV': forms.TextInput(attrs={'class': 'form-control'}),
            'dob': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'khoaSV': forms.TextInput(attrs={'class': 'form-control'}),
            'khoaHoc': forms.NumberInput(attrs={'class': 'form-control'}),
            'kqHocTap': forms.NumberInput(attrs={'class': 'form-control'}),
            'diemNCKH': forms.NumberInput(attrs={'class': 'form-control'}),
            'diemCDSV': forms.NumberInput(attrs={'class': 'form-control'}),
            'thanhtichHoatDong': forms.NumberInput(attrs={'class': 'form-control'}),
            'thanhvienBCS': forms.NumberInput(attrs={'class': 'form-control'}),
            'drl_tongket': forms.NumberInput(attrs={'class': 'form-control', 'readonly': True}),
            'xepLoai': forms.TextInput(attrs={'class': 'form-control', 'readonly': True}),
            'ghichu1': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'ghichu2': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'ghichu3': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'ghichu4': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'ghichu5': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'ghichu6': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'ghichu7': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'ghichu8': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'anhminhchung1': forms.FileInput(attrs={'class': 'form-control'}),
            'anhminhchung2': forms.FileInput(attrs={'class': 'form-control'}),
            'anhminhchung3': forms.FileInput(attrs={'class': 'form-control'}),
            'anhminhchung4': forms.FileInput(attrs={'class': 'form-control'}),
            'anhminhchung5': forms.FileInput(attrs={'class': 'form-control'}),
            'anhminhchung6': forms.FileInput(attrs={'class': 'form-control'}),
            'anhminhchung7': forms.FileInput(attrs={'class': 'form-control'})
        }

class HocKyForm(forms.ModelForm):
    class Meta:
        model = HocKy
        fields = ['ma_hoc_ky', 'ten_hoc_ky', 'nam_hoc', 'hoc_ky', 'ngay_bat_dau', 
                'ngay_ket_thuc', 'ngay_bat_dau_danh_gia', 'ngay_ket_thuc_danh_gia']
        widgets = {
            'ma_hoc_ky': forms.TextInput(attrs={'class': 'form-control'}),
            'ten_hoc_ky': forms.TextInput(attrs={'class': 'form-control'}),
            'nam_hoc': forms.NumberInput(attrs={'class': 'form-control'}),
            'hoc_ky': forms.Select(attrs={'class': 'form-control'}),
            'ngay_bat_dau': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'ngay_ket_thuc': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'ngay_bat_dau_danh_gia': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'ngay_ket_thuc_danh_gia': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'})
        }

class NotificationForm(forms.ModelForm):
    class Meta:
        model = Nofitication
        fields = ['title', 'dob', 'content', 'picture1', 'picture2', 'picture3', 'picture4', 'picture5']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'dob': forms.DateTimeInput(attrs={'class': 'form-control', 'type': 'datetime-local'}),
            'content': forms.Textarea(attrs={'class': 'form-control', 'rows': 5}),
            'picture1': forms.FileInput(attrs={'class': 'form-control'}),
            'picture2': forms.FileInput(attrs={'class': 'form-control'}),
            'picture3': forms.FileInput(attrs={'class': 'form-control'}),
            'picture4': forms.FileInput(attrs={'class': 'form-control'}),
            'picture5': forms.FileInput(attrs={'class': 'form-control'})
        }

class HistoryPointForm(forms.ModelForm):
    class Meta:
        model = HistoryPoint
        fields = [
            'lopSV', 'tenSV', 'maSV',
            'hocky1', 'hocky2', 'hocky3', 'hocky4', 'hocky5',
            'hocky6', 'hocky7', 'hocky8', 'hocky9', 'hocky10',
            'hocky11', 'hocky12', 'hocky13', 'hocky14', 'hocky15',
            'hocky16', 'hocky17', 'hocky18', 'hocky19', 'hocky20'
        ]
        widgets = {
            'lopSV': forms.TextInput(attrs={'class': 'form-control'}),
            'tenSV': forms.TextInput(attrs={'class': 'form-control'}),
            'maSV': forms.NumberInput(attrs={'class': 'form-control'}),
            **{f'hocky{i}': forms.NumberInput(attrs={'class': 'form-control'}) 
               for i in range(1, 21)}
        }
