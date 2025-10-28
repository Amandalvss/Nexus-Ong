import { Validator } from "./validator.js";

export function initForm() {
    const form = document.getElementById("form-cadastro");
    const msg = document.getElementById("form-mensagem");

    if (!form) return;

    form.addEventListener("submit", e => {
        e.preventDefault();
        msg.innerHTML = "";

        if (!Validator.validateForm(form)) {
            msg.innerHTML = '<div class="validation-error">Corrija os campos destacados!</div>';
            return;
        }

        const data = Object.fromEntries(new FormData(form));
        Validator.saveToLocalStorage("nexus_registros", data);

        msg.innerHTML = '<div class="success">Cadastro enviado com sucesso!</div>';
        form.reset();
    });
}
