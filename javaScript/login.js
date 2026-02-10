document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop page refresh

    // 1. Get values from the inputs
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // 2. Send data to your API
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

        // 3. Handle the response
        if (response.ok) {
            alert('Login Successful!');
            // Store token if your API sends one
            localStorage.setItem('token', data.token); 
            // Redirect to dashboard
            window.location.href = 'dashboard.html'; 
        } else {
            alert('Login Failed: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Could not connect to the server.');
    }
});