document.addEventListener("DOMContentLoaded", function () {
    const cookiePopup = document.getElementById("cookie-popup");
    const acceptButton = document.getElementById("accept-cookies");

    // Check if user has already accepted cookies
    if (!localStorage.getItem("cookiesAccepted")) {
        cookiePopup.style.display = "block"; // Show popup
    }

    acceptButton.addEventListener("click", function () {
        localStorage.setItem("cookiesAccepted", "true"); // Store in local storage
        cookiePopup.style.display = "none"; // Hide popup
    });
});
