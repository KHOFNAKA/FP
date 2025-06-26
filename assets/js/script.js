document.addEventListener('DOMContentLoaded', () => {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let editingUserId = null;
    let currentUsers = [...users];

    const formSection = document.getElementById('formSection');
    const statsSection = document.getElementById('statsSection');
    const showStatsBtn = document.getElementById('showStatsBtn');
    const backToFormBtn = document.getElementById('backToFormBtn');
    const searchInput = document.getElementById('searchInput');
    const genderFilter = document.getElementById('genderFilter');
    const roleFilter = document.getElementById('roleFilter');

    showStatsBtn.addEventListener('click', () => {
        formSection.style.display = 'none';
        statsSection.style.display = 'block';
        renderStats();
        renderUsers();
    });

    backToFormBtn.addEventListener('click', () => {
        formSection.style.display = 'block';
        statsSection.style.display = 'none';
    });

    async function fetchCompanies() {
        try {
            const response = await fetch('https://fakerapi.it/api/v2/companies?_quantity=10');
            if (!response.ok) throw new Error('خطا در دریافت شرکت‌ها');
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
            document.getElementById('company').innerHTML = '<option value="" disabled selected>خطا در بارگذاری شرکت‌ها</option>';
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

    function getSeason(birthdate) {
        const date = new Date(birthdate);
        const month = date.getMonth() + 1;
        if (month >= 1 && month <= 3) return 'بهار';
        if (month >= 4 && month <= 6) return 'تابستان';
        if (month >= 7 && month <= 9) return 'پاییز';
        return 'زمستان';
    }

    function calculateStats() {
        if (!users.length) return null;

        const ages = users.map(u => parseInt(u.age));
        const youngest = users.reduce((min, u) => parseInt(u.age) < parseInt(min.age) ? u : min, users[0]);
        const oldest = users.reduce((max, u) => parseInt(u.age) > parseInt(max.age) ? u : max, users[0]);
        const averageAge = (ages.reduce((sum, age) => sum + age, 0) / ages.length).toFixed(1);

        const rolesCount = {
            مدیر: { total: 0, مرد: 0, زن: 0 },
            معاون: { total: 0, مرد: 0, زن: 0 },
            کارمند: { total: 0, مرد: 0, زن: 0 },
        };

        const seasons = { بهار: 0, تابستان: 0, پاییز: 0, زمستان: 0 };
        users.forEach(user => {
            rolesCount[user.role].total++;
            rolesCount[user.role][user.gender]++;
            seasons[getSeason(user.birthdate)]++;
        });

        const seasonPercentages = {};
        for (const season in seasons) {
            seasonPercentages[season] = ((seasons[season] / users.length) * 100).toFixed(1);
        }

        return { youngest, oldest, averageAge, rolesCount, seasonPercentages };
    }

    function renderStats() {
        const statsCards = document.getElementById('statsCards');
        const stats = calculateStats();
        if (!stats) {
            statsCards.innerHTML = '<div class="col-12"><p class="text-center text-muted">هیچ کاربری وجود ندارد.</p></div>';
            return;
        }

        statsCards.innerHTML = `
            <div class="col-md-4">
                <div class="card p-3 text-center animate__animated animate__fadeInUp">
                    <h3 class="text-warning">جوان‌ترین</h3>
                    <p>${stats.youngest.username} (${stats.youngest.age} سال)</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card p-3 text-center animate__animated animate__fadeInUp">
                    <h3 class="text-warning">مسن‌ترین</h3>
                    <p>${stats.oldest.username} (${stats.oldest.age} سال)</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card p-3 text-center animate__animated animate__fadeInUp">
                    <h3 class="text-warning">میانگین سنی</h3>
                    <p>${stats.averageAge} سال</p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card p-3 text-center animate__animated animate__fadeInUp">
                    <h3 class="text-warning">تعداد نقش‌ها</h3>
                    <p>مدیر: ${stats.rolesCount.مدیر.total}</p>
                    <p>معاون: ${stats.rolesCount.معاون.total}</p>
                    <p>کارمند: ${stats.rolesCount.کارمند.total}</p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card p-3 text-center animate__animated animate__fadeInUp">
                    <h3 class="text-warning">تفکیک جنسیتی</h3>
                    <p>مدیر: ${stats.rolesCount.مدیر.مرد} مرد، ${stats.rolesCount.مدیر.زن} زن</p>
                    <p>معاون: ${stats.rolesCount.معاون.مرد} مرد، ${stats.rolesCount.معاون.زن} زن</p>
                    <p>کارمند: ${stats.rolesCount.کارمند.مرد} مرد، ${stats.rolesCount.کارمند.زن} زن</p>
                </div>
            </div>
            <div class="col-12">
                <div class="card p-3 text-center animate__animated animate__fadeInUp">
                    <h3 class="text-warning">تولد در فصل‌ها</h3>
                    <p>بهار: ${stats.seasonPercentages.بهار}%</p>
                    <p>تابستان: ${stats.seasonPercentages.تابستان}%</p>
                    <p>پاییز: ${stats.seasonPercentages.پاییز}%</p>
                    <p>زمستان: ${stats.seasonPercentages.زمستان}%</p>
                </div>
            </div>
        `;
    }

    function renderUsers() {
        const userCards = document.getElementById('userCards');
        userCards.innerHTML = '';
        currentUsers.forEach((user, index) => {
            const card = document.createElement('div');
            card.className = 'col-md-6';
            card.innerHTML = `
                <div class="card p-3 animate__animated animate__fadeInUp">
                    <img src="${user.profilePic}" alt="تصویر پروفایل" class="mx-auto">
                    <h5 class="card-title text-center text-warning">${user.username}</h5>
                    <p class="card-text"><strong>سن:</strong> ${user.age}</p>
                    <p class="card-text"><strong>جنسیت:</strong> ${user.gender}</p>
                    <p class="card-text"><strong>نقش:</strong> ${user.role}</p>
                    <p class="card-text"><strong>شرکت:</strong> ${user.company}</p>
                    <p class="card-text"><strong>تاریخ تولد:</strong> ${user.birthdate}</p>
                    <p class="card-text"><strong>آدرس:</strong> ${user.address}</p>
                    <button class="btn btn-danger w-100 mt-2 btn-glow delete-btn" data-id="${index}">حذف</button>
                    <button class="btn btn-primary w-100 mt-2 btn-glow edit-btn" data-id="${index}">ویرایش</button>
                </div>
            `;
            userCards.appendChild(card);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                users.splice(id, 1);
                currentUsers = [...users];
                localStorage.setItem('users', JSON.stringify(users));
                resetFilters();
                renderUsers();
                renderStats();
                Toastify({
                    text: 'کاربر با موفقیت حذف شد!',
                    duration: 3000,
                    backgroundColor: 'linear-gradient(to right, #28a745, #218838)',
                }).showToast();
            });
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                formSection.style.display = 'block';
                statsSection.style.display = 'none';
                document.getElementById('submitBtn').textContent = 'به‌روزرسانی';
                document.getElementById('cancelEditBtn').style.display = 'block';
                const id = parseInt(e.target.dataset.id);
                editingUserId = id;
                const user = users[id];
                profilePicPreview.src = user.profilePic;
                document.getElementById('username').value = user.username;
                document.getElementById('age').value = user.age;
                document.querySelector(`input[name="gender"][value="${user.gender}"]`).checked = true;
                document.getElementById('role').value = user.role;
                document.getElementById('company').value = user.companyId;
                document.getElementById('birthdate').value = user.birthdate;
                document.getElementById('address').value = user.address;
                profilePicPreview.style.display = 'block';
            });
        });
    }

    function resetFilters() {
        searchInput.value = '';
        genderFilter.value = '';
        roleFilter.value = '';
        currentUsers = [...users];
    }

    function filterAndSortUsers() {
        let filteredUsers = [...users];
        const searchQuery = searchInput.value.trim().toLowerCase();
        const gender = genderFilter.value;
        const role = roleFilter.value;

        if (searchQuery) {
            filteredUsers = filteredUsers.filter(user => user.username.toLowerCase().includes(searchQuery));
        }
        if (gender) {
            filteredUsers = filteredUsers.filter(user => user.gender === gender);
        }
        if (role) {
            filteredUsers = filteredUsers.filter(user => user.role === role);
        }

        currentUsers = filteredUsers;
        renderUsers();
    }

    searchInput.addEventListener('input', filterAndSortUsers);
    genderFilter.addEventListener('change', filterAndSortUsers);
    roleFilter.addEventListener('change', filterAndSortUsers);

    document.getElementById('sortByAgeAsc').addEventListener('click', () => {
        currentUsers.sort((a, b) => parseInt(a.age) - parseInt(b.age));
        renderUsers();
    });

    document.getElementById('sortByAgeDesc').addEventListener('click', () => {
        currentUsers.sort((a, b) => parseInt(b.age) - parseInt(a.age));
        renderUsers();
    });

    document.getElementById('sortByName').addEventListener('click', () => {
        currentUsers.sort((a, b) => a.username.localeCompare(b.username));
        renderUsers();
    });

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
            Toastify({
                text: 'کاربر با موفقیت به‌روزرسانی شد!',
                duration: 3000,
                backgroundColor: 'linear-gradient(to right, #28a745, #218838)',
            }).showToast();
            editingUserId = null;
            document.getElementById('submitBtn').textContent = 'ثبت';
            document.getElementById('cancelEditBtn').style.display = 'none';
        } else {
            users.push(user);
            Toastify({
                text: 'کاربر با موفقیت اضافه شد!',
                duration: 3000,
                backgroundColor: 'linear-gradient(to right, #28a745, #218838)',
            }).showToast();
        }

        localStorage.setItem('users', JSON.stringify(users));
        resetFilters();
        renderUsers();
        renderStats();
        userForm.reset();
        profilePicPreview.style.display = 'none';
        formSection.style.display = 'none';
        statsSection.style.display = 'block';
    });

    document.getElementById('cancelEditBtn').addEventListener('click', () => {
        document.getElementById('cancelEditBtn').style.display = 'none';
        editingUserId = null;
        userForm.reset();
        profilePicPreview.style.display = 'none';
        document.getElementById('submitBtn').textContent = 'ثبت';
    });

    fetchCompanies();
    renderStats();
    renderUsers();
});