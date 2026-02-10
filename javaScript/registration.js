const eyeIcon = document.querySelector('.eye-icon');
const passwordInput = document.getElementById('password');

eyeIcon.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
});
document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevent default form submission

    // Get values from the form
    const firstName = document.getElementById('firstname').value.trim();
    const lastlame = document.getElementById('lastname').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Build the request payload
    const payload ={
        firstName,
        lastlame,
        username,
        email,
        password
    };
    try {
        const response = await fetch('http://localhost:3000/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful!'); // Or redirect user
            console.log(data);
        } else {
            alert('Error: ' + data.message); // Backend error message
        }
    } catch (error) {
        console.error('Error connecting to API:', error);
        alert('Failed to connect to server.');
    }
});