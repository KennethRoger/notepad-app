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
    const errorMessage = document.getElementById('error-message');

    // Clear previous error messages
    errorMessage.textContent = '';

    // Check if username is empty
    if (username === '' || username.length < 3) {
        errorMessage.textContent = 'Username should contain characters';
        return false;
    }

    // Check if email is valid
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        errorMessage.textContent = 'Please enter a valid email address.';
        return false;
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match.';
        return false;
    }

    // Check if password is strong (minimum 8 characters, at least one letter and one number)
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+={}\[\]:;"'<>,.?\/\\~-]{8,}$/;
    if (!passwordPattern.test(password)) {
        errorMessage.textContent = 'Password must be at least 8 characters long and include at least one letter and one number.';
        return false;
    }

    // If all validations pass
    return true;
}