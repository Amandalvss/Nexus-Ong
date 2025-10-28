const hamburger = document.querySelector(".hamburger");
const header = document.querySelector("header");

if (hamburger && header) {
    hamburger.addEventListener("click", () => {
        header.classList.toggle("open");
    });
}
