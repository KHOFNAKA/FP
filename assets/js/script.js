document.addEventListener('DOMContentLoaded', () => {
    async function fetchCompanies() {
        try {
            const response = await fetch('https://fakerapi.it/api/v2/companies?_quantity=10');
            if (!response.ok) {
                throw new Error('Failed to fetch companies');
            }
            const data = await response.json();
            console.log(data)
            const companies = data.data;
            const companySelect = document.getElementById('company');
            companySelect.innerHTML = '<option value="" disabled selected>Select a company</option>';
            companies.forEach(company => {
                const option = document.createElement('option');
                option.value = company.id;
                option.textContent = company.name;
                companySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching companies:', error);
            const companySelect = document.getElementById('company');
            companySelect.innerHTML = '<option value="" disabled selected>Error loading companies</option>';
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

    
    const userForm = document.getElementById('userForm');
    const userCard = document.getElementById('userCard');
    userForm.addEventListener('submit', (e) => {
        e.preventDefault();

      
        const username = document.getElementById('username').value;
        const age = document.getElementById('age').value;
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const role = document.getElementById('role').value;
        const company = document.getElementById('company').options[document.getElementById('company').selectedIndex].text;
        const birthdate = document.getElementById('birthdate').value;
        const address = document.getElementById('address').value;
        const profilePic = profilePicPreview.src || '';

       
        userForm.style.display = 'none';

      
        userCard.innerHTML = `
            <div class="card p-4">
                <img src="${profilePic}" alt="Profile Picture" class="mx-auto">
                <h3 class="card-title text-center">${username}</h3>
                <p class="card-text"><strong>Age:</strong> ${age}</p>
                <p class="card-text"><strong>Gender:</strong> ${gender}</p>
                <p class="card-text"><strong>Role:</strong> ${role}</p>
                <p class="card-text"><strong>Company:</strong> ${company}</p>
                <p class="card-text"><strong>Birthdate:</strong> ${birthdate}</p>
                <p class="card-text"><strong>Address:</strong> ${address}</p>
            </div>
        `;

        
        userCard.classList.add('visible');
    });

    fetchCompanies();
});
