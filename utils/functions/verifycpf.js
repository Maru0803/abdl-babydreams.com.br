function validarCpf(data) {
    const cpf = data.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return { status: "error", message: 'CPF inválido' }

    const cpfArray = cpf.split('').map(Number);
    const calcularDigito = (numeros, peso) => {
        let soma = 0;
        for (let i = 0; i < numeros.length; i++) {
            soma += numeros[i] * peso--;
        }
        const resto = (soma % 11);
        return resto < 2 ? 0 : 11 - resto;
    };

    const primeiro = calcularDigito(cpfArray.slice(0, 9), 10);
    const segundo = calcularDigito(cpfArray.slice(0, 10), 11);
    if (cpfArray[9] === primeiro && cpfArray[10] === segundo) {
        return { status: "success", message: 'CPF valido' }
    } else {
        return { status: "error", message: 'CPF inválido' }
    }
}

module.exports = validarCpf;