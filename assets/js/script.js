document.addEventListener('DOMContentLoaded', () => {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let editingUserId = null;

    async function fetchCompanies() {
        try {
            const response = await fetch('https://fakerapi.it/api/v2/companies?_quantity=10');
            if (!response.ok) {
                throw new Error('خطا در دریافت شرکت‌ها');
            }
            const data = await response.json();
            const companies = data.data;
            const companySelect = document.getElementById('company');
            companySelect.innerHTML = '<option value="" disabled selected>یک شرکت انتخاب کنید</option>';
            companies.forEach(company => {
                const option = document.createElement('option');
                option.value = company.id;
                option.textContent = company.name;
                companySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error:', error);
            const companySelect = document.getElementById('company');
            companySelect.innerHTML = '<option value="" disabled selected>خطا در بارگذاری شرکت‌ها</option>';
            Toastify({
                text: 'خطا در دریافت شرکت‌ها!',
                duration: 3000,
                backgroundColor: 'linear-gradient(to right, #dc3545, #b02a37)',
            }).showToast();
        }
    }

    const profilePicInput = document.getElementById('profilePic');
    const profilePicPreview = document.getElementById('profilePicPreview');
    profilePicInput.addEventListener('change', () => {
        const file = profilePicInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePicPreview.src = e.target.result;
                profilePicPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            profilePicPreview.style.display = 'none';
        }
    });

    function validateForm() {
        let isValid = true;
        const fields = [
            { id: 'profilePic', errorId: 'profilePicError', check: () => profilePicInput.files[0] },
            { id: 'username', errorId: 'usernameError', check: () => document.getElementById('username').value.trim() },
            { id: 'age', errorId: 'ageError', check: () => {
                const age = document.getElementById('age').value;
                return age && age >= 1 && age <= 150;
            }},
            { id: 'gender', errorId: 'genderError', check: () => document.querySelector('input[name="gender"]:checked') },
            { id: 'role', errorId: 'roleError', check: () => document.getElementById('role').value },
            { id: 'company', errorId: 'companyError', check: () => document.getElementById('company').value },
            { id: 'birthdate', errorId: 'birthdateError', check: () => document.getElementById('birthdate').value },
            { id: 'address', errorId: 'addressError', check: () => document.getElementById('address').value.trim() },
        ];

        fields.forEach(field => {
            const errorElement = document.getElementById(field.errorId);
            if (!field.check()) {
                errorElement.style.display = 'block';
                isValid = false;
            } else {
                errorElement.style.display = 'none';
            }
        });

        if (!isValid) {
            Toastify({
                text: 'لطفاً تمام فیلدهای ضروری را پر کنید!',
                duration: 3000,
                backgroundColor: 'linear-gradient(to right, #dc3545, #b02a37)',
            }).showToast();
        }

        return isValid;
    }

    function renderUsers() {
        const userCard = document.getElementById('userCard');
        userCard.innerHTML = '';
        users.forEach((user, index) => {
            const card = document.createElement('div');
            card.className = 'card p-4';
            card.innerHTML = `
                <img src="${user.profilePic}" alt="تصویر پروفایل" class="mx-auto">
                <h3 class="card-title text-center text-warning">${user.username}</h3>
                <p class="card-text"><strong>سن:</strong> ${user.age}</p>
                <p class="card-text"><strong>جنسیت:</strong> ${user.gender}</p>
                <p class="card-text"><strong>نقش:</strong> ${user.role}</p>
                <p class="card-text"><strong>شرکت:</strong> ${user.company}</p>
                <p class="card-text"><strong>تاریخ تولد:</strong> ${user.birthdate}</p>
                <p class="card-text"><strong>آدرس:</strong> ${user.address}</p>
                <button class="btn btn-danger w-100 mt-2 btn-glow delete-btn" data-id="${index}">حذف</button>
                <button class="btn btn-primary w-100 mt-2 btn-glow edit-btn" data-id="${index}">ویرایش</button>
            `;
            userCard.appendChild(card);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                users.splice(id, 1);
                localStorage.setItem('users', JSON.stringify(users));
                renderUsers();
                Toastify({
                    text: "کاربر با موفقیت حذف شد!",
                    duration: 3000,
                    backgroundColor: "linear-gradient(to right, #28a745, #218838)",
                }).showToast();
            });
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                editingUserId = id;
                const user = users[id];
                document.getElementById('username').value = user.username;
                document.getElementById('age').value = user.age;
                document.querySelector(`input[name="gender"][value="${user.gender}"]`).checked = true;
                document.getElementById('role').value = user.role;
                document.getElementById('company').value = user.companyId;
                document.getElementById('birthdate').value = user.birthdate;
                document.getElementById('address').value = user.address;
                profilePicPreview.src = user.profilePic;
                profilePicPreview.style.display = 'block';
                document.getElementById('submitBtn').textContent = 'به‌روزرسانی';
                document.getElementById('cancelEditBtn').style.display = 'block';
            });
        });
    }

    const userForm = document.getElementById('userForm');
    userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const username = document.getElementById('username').value;
        const age = document.getElementById('age').value;
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const role = document.getElementById('role').value;
        const companyId = document.getElementById('company').value;
        const company = document.getElementById('company').options[document.getElementById('company').selectedIndex].text;
        const birthdate = document.getElementById('birthdate').value;
        const address = document.getElementById('address').value;
        const profilePic = profilePicPreview.src || '';

        const user = { username, age, gender, role, company, companyId, birthdate, address, profilePic };

        if (editingUserId !== null) {
            users[editingUserId] = user;
            localStorage.setItem('users', JSON.stringify(users));
            Toastify({
                text: "کاربر با موفقیت به‌روزرسانی شد!",
                duration: 3000,
                backgroundColor: "linear-gradient(to right, #28a745, #218838)",
            }).showToast();
            editingUserId = null;
            document.getElementById('submitBtn').textContent = 'ثبت';
            document.getElementById('cancelEditBtn').style.display = 'none';
        } else {
            users.push(user);
            localStorage.setItem('users', JSON.stringify(users));
            Toastify({
                text: "کاربر با موفقیت اضافه شد!",
                duration: 3000,
                backgroundColor: "linear-gradient(to right, #28a745, #218838)",
            }).showToast();
        }

        userForm.reset();
        profilePicPreview.style.display = 'none';
        renderUsers();
    });

    document.getElementById('cancelEditBtn').addEventListener('click', () => {
        editingUserId = null;
        userForm.reset();
        profilePicPreview.style.display = 'none';
        document.getElementById('submitBtn').textContent = 'ثبت';
        document.getElementById('cancelEditBtn').style.display = 'none';
    });

    fetchCompanies();
    renderUsers();
});
