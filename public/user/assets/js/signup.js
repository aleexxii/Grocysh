let isValid = {
  firstName: false,
  email: false,
  password: false,
  confirmPassword: false
};

function nameValidation() {
  const firstNameInput = document.getElementById("formSignupfname");
  const firstname = firstNameInput.value.trim();
  const firstNameError = document.getElementById("firstNameError");

  if (firstname === "") {
    firstNameError.innerHTML = "Please enter First Name.";
    isValid.firstName = false;
  } else if (!/^[a-zA-Z]+$/.test(firstname)) {
    firstNameError.innerHTML = "First name can only contain letters.";
    isValid.firstName = false;
  } else {
    firstNameError.innerHTML = "";
    isValid.firstName = true;
  }
}

function emailValidation() {
  const emailInput = document.getElementById("formSignupEmail");
  const email = emailInput.value.trim();
  const emailPattern = /^[^\s@]+@(gmail|yahoo|hotmail|outlook|aol|icloud|protonmail|mail|yandex|zoho)\.(com|in|org|net|edu|gov|mil|biz|info|name|coop|aero|eu|int|pro|museum|arpa|[a-z]{2})$/;
  const errorMessage = document.getElementById("errorMessage");

  if (!emailPattern.test(email)) {
    errorMessage.innerHTML = "Please enter a valid Email address";
    document.getElementById("getOTP").disabled = true;
    isValid.email = false;
  } else {
    errorMessage.innerHTML = "";
    document.getElementById("getOTP").disabled = false;
    isValid.email = true;
  }
}

document.getElementById("getOTP").addEventListener("click", async function () {
  const email = document.getElementById("formSignupEmail").value.trim();
  document.getElementById("getOTP").disabled = true;

  try {
    const emailOtpResponse = await fetch(`/generate-otp?email=${email}`, {
      method: "POST",
    });

    if (emailOtpResponse.ok) {
      resetTimer();
    } else {
      document.getElementById("errorMessage").innerHTML = "Failed to generate OTP. Please try again.";
      document.getElementById("getOTP").disabled = false;
    }
  } catch (error) {
    console.error(error);
    document.getElementById("errorMessage").innerHTML = "An unexpected error occurred. Please try again later.";
    document.getElementById("getOTP").disabled = false;
  }
});

function resetTimer() {
  let secondsLeft = 60;
  const timerInterval = setInterval(() => {
    secondsLeft--;
    if (secondsLeft <= 0) {
      document.getElementById("getOTP").disabled = false;
      document.getElementById("getOTP").innerText = "Resend OTP";
      clearInterval(timerInterval);
    } else {
      document.getElementById("getOTP").innerText = `Resend OTP (${secondsLeft}s)`;
      document.getElementById("getOTP").disabled = true;
    }
  }, 1000);
}

function isStrong() {
  const password = document.getElementById("formSignupPassword").value;
  const passwordMessage = document.getElementById("passwordMessage");

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;

  if (passwordRegex.test(password)) {
    passwordMessage.innerHTML = "Strong";
    passwordMessage.classList.remove("text-danger");
    passwordMessage.classList.add("text-success");
    isValid.password = true;
  } else {
    passwordMessage.innerHTML = "Password must be at least 8 characters long and contain at least one uppercase letter, one digit, and one symbol.";
    passwordMessage.classList.remove("text-success");
    passwordMessage.classList.add("text-danger");
    isValid.password = false;
  }
}

function confirmPasswordChecking() {
  const password = document.getElementById("formSignupPassword").value;
  const confirmPassword = document.getElementById("formConfirmPassword").value;
  const confirmPasswordFalse = document.getElementById("confirmPasswordFalse");

  if (password !== confirmPassword) {
    confirmPasswordFalse.innerHTML = "Password and Confirm Password do not match";
    confirmPasswordFalse.classList.remove("text-success");
    confirmPasswordFalse.classList.add("text-danger");
    isValid.confirmPassword = false;
  } else {
    confirmPasswordFalse.innerHTML = "Matches";
    confirmPasswordFalse.classList.remove("text-danger");
    confirmPasswordFalse.classList.add("text-success");
    isValid.confirmPassword = true;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("signupForm").addEventListener("submit", function (event) {
    event.preventDefault();
    
    // Validate all fields before submission
    nameValidation();
    emailValidation();
    isStrong();
    confirmPasswordChecking();
    
    if (Object.values(isValid).every(field => field === true)) {
      const firstname = document.getElementById("formSignupfname").value;
      const lastname = document.getElementById("formSignuplname").value;
      const email = document.getElementById("formSignupEmail").value;
      const password = document.getElementById("formSignupPassword").value;
      const otp = document.getElementById("formOTP").value;

      const formData = {
        firstname,
        lastname,
        email,
        password,
        otp,
      };

      fetch("/signup", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      })
        .then(response => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then(data => {
          if (data.emailError) {
            document.getElementById("error-message").innerHTML = data.emailError;
          } else if (data.otpError) {
            document.getElementById('otpError').innerHTML = data.otpError;
          } else {
            window.location.href = "/login";
          }
        })
        .catch(error => {
          console.error("Error:", error);
        });
    }
  });
});