// remove the error message when the page refreshes

if (window.location.search.includes('error')) {
    const url = new URL(window.location.href);
    url.searchParams.delete('error');
    window.history.replaceState(null, '', url.toString());
}

// Registration validation

function validateForm() {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    const userError = document.getElementById('user-error');
    const emailError = document.getElementById('email-error');
    const passError = document.getElementById('pass-error');
    const conPassError = document.getElementById('con-pass-error');

    // Clear previous error messages
    userError.textContent = '';
    emailError.textContent = '';
    passError.textContent = '';
    conPassError.textContent = '';

    let isValid = true;

    // Validate username
    if (username === '' || username.length < 3 || !isNaN(username)) {
        userError.textContent = 'Username should contain more than 3 characters and cannot be a number.';
        isValid = false;
    }

    // Validate email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        emailError.textContent = 'Please enter a valid email address.';
        isValid = false;
    }

    // Validate password
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\~-]{8,}$/;
    if (!passwordPattern.test(password)) {
        passError.textContent = 'Password must be at least 8 characters long and include at least one letter and one number.';
        isValid = false;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
        conPassError.textContent = 'Passwords do not match.';
        isValid = false;
    }

    return isValid;
}

