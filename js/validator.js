export const Validator = {
    validateForm(form) {
        let valid = true;

        form.querySelectorAll("input[required]").forEach(input => {
            input.classList.remove("invalid");
            if (!input.value.trim()) {
                input.classList.add("invalid");
                valid = false;
            }
        });

        // Telefone simples
        const telefone = form.querySelector("input[name=telefone]");
        if (telefone && !/^\+?\d{8,15}$/.test(telefone.value.trim())) {
            telefone.classList.add("invalid");
            valid = false;
        }

        // Email format
        const email = form.querySelector("input[name=email]");
        if (email) {
            const v = email.value.trim();
            if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
                email.classList.add('invalid');
                valid = false;
            }
        }

        // CPF simples
        const cpf = form.querySelector("input[name=cpf]");
        if (cpf && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf.value.trim())) {
            cpf.classList.add("invalid");
            valid = false;
        }

        // Senha e confirmação
        const senha = form.querySelector("input[name=senha]");
        const senha_confirm = form.querySelector("input[name=senha_confirm]");
        if (senha && senha_confirm && senha.value !== senha_confirm.value) {
            senha.classList.add("invalid");
            senha_confirm.classList.add("invalid");
            valid = false;
        }

        // senha mínimo 6
        if (senha && senha.value && senha.value.length < 6) {
            senha.classList.add('invalid');
            valid = false;
        }

        return valid;
    },

    saveToLocalStorage(key, data) {
        const registros = JSON.parse(localStorage.getItem(key) || "[]");
        registros.push(data);
        localStorage.setItem(key, JSON.stringify(registros));
    }
};
