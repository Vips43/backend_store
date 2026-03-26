let signupForm = document.querySelector(".signup-form");
let loginForm = document.querySelector(".login-form");

if (loginForm) {
  let lEmail = document.getElementById("lEmail");
  let lPass = document.getElementById("lPass");
  console.log(loginForm);

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const currUser = {
      name: lEmail.value,
      pass: lPass.value,
    };

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: lEmail.value,
          pass: lPass.value,
        }),
      });

      const data = await res.json();
      console.log(data);
      if (!data.success) {
        alert(data.message);
        return;
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      alert("login successful!");
      window.location.href = "../../index.html";
    } catch (error) {
      console.error(error);
      alert("server error");
    }
  });
}

if (signupForm) {
  let sName = document.getElementById("sName");
  let sEmail = document.getElementById("sEmail");
  let sPass = document.getElementById("sPass");
  let signupCred = [];

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = sPass.value.trim();
    if (sName.value && sEmail.value && sPass.value) {
      if (password.length < 5) {
        alert("Password length must be greater than 5");
        return;
      }
    } else {
      alert("all fields are required");
      console.log("all fields are required");
    }

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    const userData = {
      name: data.name,
      email: data.email,
      pass: data.pass,
    };

    signupCred.push(userData);
    console.log(signupCred);

    try {
      const res = await fetch("http://localhost:3000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      console.log(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  });
}
