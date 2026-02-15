document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // 1. Send login request to your API
        const response = await fetch('http://localhost:3000/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Store the token (your backend returns { token: "..." })
            localStorage.setItem('access_token', data.token);

            // 2. Fetch the profile immediately to check the role
            const profileResponse = await fetch('http://localhost:3000/users/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${data.token}`
                }
            });

            const profile = await profileResponse.json();

            if (profileResponse.ok) {
                // Ensure the role is treated in lowercase to avoid matching errors
                const role = profile.role.toLowerCase();

                // 3. ROLE-BASED REDIRECTION
                if (role === 'admin') {
                    window.location.href = 'admin.html'; // Admin Master Page
                } else if (role === 'student') {
                    window.location.href = 'dashboard.html'; // Student Dashboard
                } else if (role === 'librarian') {
                    window.location.href = 'librarian.html'; // Librarian Page
                } else {
                    alert('Unknown role: ' + profile.role);
                }
            } else {
                alert('Failed to retrieve user profile.');
            }

        } else {
            // Handle incorrect password or username
            alert('Login Failed: ' + (data.message || 'Invalid credentials'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Could not connect to the server.');
    }
});