import { COOKIE_CONSENT } from './constants.js';

// Cookies
export const cookieOptions = document.querySelector(".cookieConsent");

export function checkCookieConsent() {
    let consent = getCookie("consent");
    if (consent != "yes") {
        cookieOptions.style.opacity = 1;
    }
}

export function nextGame() {
    let gamePlay = getCookie("gameplay");
    if (gamePlay == "" || gamePlay == "[]") {
        setCookie("gameplay", JSON.stringify([]), COOKIE_CONSENT);
        return 0;
    } else {
        let game = 0;
        let sortGamePlayArray = JSON.parse(gamePlay).sort((a, b) => { return a - b });
        if (sortGamePlayArray.length > 29) {
            return 0;
        }
        // Return first missed game
        for (let i = 0; i < sortGamePlayArray.length; i++) {
            if (sortGamePlayArray[i] != game) {
                return i;
            }
            game++;
        }
        // Return last game in array
        return sortGamePlayArray.slice(-1)[0] + 1;
    }
}

export function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export function setCookie(cname, cvalue, exdays) {
    let d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export function acceptCookies() {
    setCookie('consent', 'yes', COOKIE_CONSENT);
    // Hide Cookie warning
    cookieOptions.style.opacity = 0;
}