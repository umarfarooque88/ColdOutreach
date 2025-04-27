// Handle Login
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
  
    if (email && password) {
      // Redirect to Dashboard.html
      window.location.href = 'Dashboard.html';
    } else {
      alert('Please fill in all fields');
    }
  });
  
  // Handle Signup
  document.getElementById('signupForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
  
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }
  
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
  
    // Redirect to Dashboard.html
    window.location.href = 'Dashboard.html';
  });
  
  // Slide Between Forms
  const showSignupBtn = document.getElementById('showSignup');
  const showLoginBtn = document.getElementById('showLogin');
  const loginForm = document.querySelector('.login-form');
  const signupForm = document.querySelector('.signup-form');
  
  showSignupBtn.addEventListener('click', () => {
    loginForm.classList.remove('active');
    signupForm.classList.add('active');
  });
  
  showLoginBtn.addEventListener('click', () => {
    signupForm.classList.remove('active');
    loginForm.classList.add('active');
  });
  