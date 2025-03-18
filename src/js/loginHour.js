
document.addEventListener('DOMContentLoaded', function () {
    var loginOverlay = document.getElementById('loginOverlay');


    var currentHour = new Date().getHours();

    if (currentHour < 12 || currentHour >= 14) {
        loginOverlay.style.display = 'flex';
    } else {
        loginOverlay.style.display = 'none';
    }
});
