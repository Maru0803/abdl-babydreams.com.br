const addToCartButtons = document.querySelectorAll('.add-to-cart');

addToCartButtons.forEach((button, index) => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        let informations = button.closest('.produto').querySelector('h3')
        let datainfo = JSON.parse(informations.getAttribute('data-info'));
        const produto = {
            nome: datainfo.nome,
            preco: datainfo.preco
        };
       
        adicionarAoCarrinho(produto.nome, produto.preco);
    });
});

const giftButton = document.querySelector('.giftcode-section button');
const giftInput = document.querySelector('.giftcode-section input');
let successMessage = document.querySelector('.giftcode-section .success-message');
let errorMessage = document.querySelector('.giftcode-section .error-message');

const shippingButton = document.querySelector('.shipping-section button');
const shippingInput = document.querySelector('.shipping-section input');
let shippingSuccessMessage = document.querySelector('.shipping-section .shippingsuccess-message');
let shippingErrorMessage = document.querySelector('.shipping-section .shippingerror-message');

giftButton.addEventListener('click', () => {
    const cupom = giftInput.value;
  
    fetch(`/apis/verifygift?gift=${cupom}`, {
        method: 'GET'
    }).then(response => {
        return response.json();  
    })
    .then(data => {
        if(data.status === "invalid") throw new Error("invalid")
        if(data.status === "used") throw new Error("used")
        updateCartTotal(data.value, "gift");
        if (!successMessage) {
            successMessage = document.createElement('p');
            successMessage.className = 'success-message';
            giftButton.parentNode.appendChild(successMessage);
        }
        successMessage.textContent = 'Cupom aplicado com sucesso';
        successMessage.style.color = 'green';

        if (errorMessage) {
            errorMessage.remove();
            errorMessage = null;
        }
    })
    .catch(error => {
        console.log(error)
        let message = error.message === "used" ? "Cupom ja utilizado" : "Cupom invalido" 
        if (!errorMessage) {
            errorMessage = document.createElement('p');
            errorMessage.className = 'error-message';
            giftButton.parentNode.appendChild(errorMessage);
        }
        errorMessage.textContent = message;
        errorMessage.style.color = 'red';

        if (successMessage) {
            successMessage.remove();
            successMessage = null;
        }
    });
});

shippingButton.addEventListener('click', () => {
    const cep = shippingInput.value;
    let cartItems = JSON.parse(localStorage.getItem("carrinhoDeCompras"));
    let cart = {}
    if(localStorage.length > 0) cartItems.forEach(x => cart[x.nome] = x.count)
    if(Object.keys(cart).length === 0) {
        let message = "Carrinho vazio" 
        if (!shippingErrorMessage) {
            shippingErrorMessage = document.createElement('p');
            shippingErrorMessage.className = 'shippingerror-message';
            shippingButton.parentNode.appendChild(shippingErrorMessage);
        }
        let fretediv = document.querySelector('#displayFrete fieldset');
        let freteforms = document.querySelectorAll('#shippingForms label');
        if(fretediv) fretediv.remove()
        if(freteforms) freteforms.forEach(x => x.remove())
        if(shippingSuccessMessage) shippingSuccessMessage.remove();
        shippingSuccessMessage = null;
        shippingErrorMessage.textContent = message;
        shippingErrorMessage.style.color = 'red';
        return;
    }

    
    fetch(`/apis/verifyshippingcart?${gerarQueryData({cep: cep, cart: JSON.stringify(cart)})}`, {
        method: 'GET'
    }).then(response => {
        return response.json();  
    })
    .then(data => {
        if(data.status === "invalid") throw new Error("invalid")
        var html = []
        data.fretes.forEach((x, i) => {
           html.push(`<div><input type="radio" name="frete" id="${x.name}" ${i === 0 ? "checked" : ""} data-price="${x.price}" data-type="${x.name}"><label for="${x.name}">${x.name} - Valor R$${x.price} - Prazo ${x.custom_delivery_time} Dias uteis</label></div>`)
        })
        updateCartTotal(data.fretes[0].price, "frete", data.fretes[0].name);
        if (!shippingSuccessMessage) {
            shippingSuccessMessage = document.createElement('div');
            shippingSuccessMessage.className = 'shippingsuccess-message';
            shippingButton.parentNode.appendChild(shippingSuccessMessage);
        }
        shippingSuccessMessage.textContent = 'Frete calculado com sucesso';
        shippingSuccessMessage.style.color = 'green';
        var fretediv = document.getElementById('displayFrete')
        fretediv.innerHTML = `<fieldset>${html.join('')}</fieldset>`;
        if(window.location.pathname === "/checkout") {

            fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, "").lenght === 9 ? cep.slice(0, -1) : cep.replace(/\D/g, "")}/json/`, {
                method: 'GET'
            }).then(response => {
                return response.json();  
            })
            .then(data => {
                const forms = document.getElementById('shippingForms')
                forms.innerHTML = `
                <label id="spancompletname"><input type="text" id="completname" maxlength="40" placeholder="Nome Completo"></label>
                <label id="spancpf"><input type="text" id="cpf" maxlength="14" placeholder="CPF"></label>
                <label id="spanrua"><input type="text" id="rua" maxlength="10" placeholder="Rua" value="${!data.logradouro ? "" : data.logradouro}"></label>
                <label id="spannumero"><input type="text" id="numero" maxlength="20" placeholder="Numero"></label>
                <label id="spancomplemento"><input type="text" id="complemento" maxlength="40" placeholder="Complemento"></label>
                <label id="spanbairro"><input type="text" id="bairro" maxlength="20" placeholder="Bairro" value="${!data.bairro ? "" : data.bairro}"></label>
                <label id="spancidade"><input type="text" id="cidade" maxlength="20" placeholder="Cidade" value="${!data.localidade ? "" : data.localidade}" ${!data.localidade ? "" : "readonly"}>v
                <label id="spanuf"><input type="text" id="uf" maxlength="2" placeholder="UF" value="${!data.uf ? "" : data.uf}" ${!data.uf ? "" : "readonly"}></label>
                <label><input type="text" id="locale" value="Brasil" readonly>
                `
            })
        } 
              
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('click', (clicked) => {
                let freteprice = clicked.target.getAttribute('data-price')
                let fretetype = clicked.target.getAttribute('data-type')
                updateCartTotal(freteprice, "frete", fretetype);
            });
        });

        if (shippingErrorMessage) {
            shippingErrorMessage.remove();
            shippingErrorMessage = null;
        }
    })
    .catch(error => { 
        let message = "CEP invalido" 
        if (!shippingErrorMessage) {
            shippingErrorMessage = document.createElement('p');
            shippingErrorMessage.className = 'shippingerror-message';
            shippingButton.parentNode.appendChild(shippingErrorMessage);
        }
        shippingErrorMessage.textContent = message;
        shippingErrorMessage.style.color = 'red';

        if (shippingSuccessMessage) {
            let fretediv = document.querySelector('#displayFrete fieldset');
            let freteforms = document.querySelectorAll('#shippingForms label');
            fretediv.remove()
            freteforms.forEach(x => x.remove())
            shippingSuccessMessage.remove();
            shippingSuccessMessage = null;
        }
    });
});

if(window.location.pathname === "/checkout") window.addEventListener('load', () => {
    
    const nextButton = document.querySelector('.next-section button');

    nextButton.addEventListener('click', function () {
        const cupom = giftInput.value;
        let frete = parseFloat(document.getElementById("cartFrete").textContent);
        let total = parseFloat(document.getElementById("cartTotal").textContent);
        let fretetype = document.getElementById("cartFrete").getAttribute('data-type')

        if(!frete || frete === 0) {
            let message = "CEP invalido" 
            if (!shippingErrorMessage) {
                shippingErrorMessage = document.createElement('p');
                shippingErrorMessage.className = 'shippingerror-message';
                shippingButton.parentNode.appendChild(shippingErrorMessage);
            }
            shippingErrorMessage.textContent = message;
            shippingErrorMessage.style.color = 'red';
            return;
        }
        let cartItems = JSON.parse(localStorage.getItem("carrinhoDeCompras"));
        let cart = {}
        cartItems.forEach(x => cart[x.nome] = x.count)
        
        if(Object.keys(cart).length === 0) { 
            let modal = document.getElementById("nullCart");
            modal.style.display = "block";
            window[touchEvent] = function (event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
            return;
        }

        var adress = FormsVerify()   
        if(!adress) return;

        let fretedata = {
            type: fretetype,
            value: frete,
            address: adress
        }

        let data = {
            cart: JSON.stringify(cart),
            cupom: cupom,
            total: total,
            frete: JSON.stringify(fretedata),
        }
        
        fetch(`/apis/verifytopayment?` + gerarQueryData(data), {
            method: 'GET',
        }).then(response => {
            return response.json();
        })
        .then(res => {
            if(res.status === "success") {
                window.location.href = '/payment'; 
            } else if(res.status === "outstock") {
                let modal = document.getElementById("outModal");
                modal.style.display = "block";
                window[touchEvent] = function (event) {
                    if (event.target == modal) {
                        modal.style.display = "none";
                    }
                }
            } else if(res.status === "error") {
                const cep = shippingInput.value;
                fetch(`/apis/verifyshippingcart?${gerarQueryData({cep: cep, cart: JSON.stringify(cart)})}`, {
                    method: 'GET'
                }).then(response => {
                    return response.json();  
                })
                .then(data => {
                    if(Object.keys(cart).length === 0) throw new Error("cart")
                    if(data.status === "invalid") throw new Error("invalid")
                    var html = []
                    data.fretes.forEach((x, i) => {
                       html.push(`<div><input type="radio" name="frete" id="${x.name}" ${i === 0 ? "checked" : ""} data-price="${x.price}" data-type="${x.name}"><label for="${x.name}">${x.name} - Valor R$${x.price} - Prazo ${x.custom_delivery_time} Dias uteis</label></div>`)
                    })
                    updateCartTotal(data.fretes[0].price, "frete", data.fretes[0].name);
                    if (!shippingSuccessMessage) {
                        shippingSuccessMessage = document.createElement('div');
                        shippingSuccessMessage.className = 'shippingsuccess-message';
                        shippingButton.parentNode.appendChild(shippingSuccessMessage);
                    }
                    shippingSuccessMessage.textContent = 'Frete calculado com sucesso';
                    shippingSuccessMessage.style.color = 'green';
                    var fretediv = document.getElementById('displayFrete')
                    fretediv.innerHTML = `<fieldset>${html.join('')}</fieldset>`;
                }).catch(error => { 
                    let message = error.message === "cart" ? "Carrinho Vazio" : "CEP invalido" 
                    if (!shippingErrorMessage) {
                        shippingErrorMessage = document.createElement('p');
                        shippingErrorMessage.className = 'shippingerror-message';
                        shippingButton.parentNode.appendChild(shippingErrorMessage);
                    }
                    shippingErrorMessage.textContent = message;
                    shippingErrorMessage.style.color = 'red';
            
                    if (shippingSuccessMessage) {
                        let fretediv = document.querySelector('#displayFrete fieldset');
                        let freteforms = document.querySelectorAll('#shippingForms label');
                        fretediv.remove()
                        freteforms.forEach(x => x.remove())
                        shippingSuccessMessage.remove();
                        shippingSuccessMessage = null;
                    }
                });

                let modal = document.getElementById("shippingError");
                modal.style.display = "block";
                window[touchEvent] = function (event) {
                    if (event.target == modal) {
                        modal.style.display = "none";
                    }
                }
            } else {
                let modal = document.getElementById("errModal");
                modal.style.display = "block";
                window[touchEvent] = function (event) {
                    if (event.target == modal) {
                        modal.style.display = "none";
                    }
                }
            }
        })
        .catch(error => {
            let modal = document.getElementById("errModal");
            modal.style.display = "block";
            window[touchEvent] = function (event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
            console.log("[CHECKOUT PAGE]", error)
        });
    });

});

function gerarQueryData(produtos) {
    const queryParams = []
    for (const produto in produtos) {
        if (produtos.hasOwnProperty(produto)) {
            queryParams.push(`${encodeURIComponent(produto)}=${encodeURIComponent(produtos[produto])}`);
        }
    }
    return queryParams.join('&');
}

function verifycart() {
    let cartItems = JSON.parse(localStorage.getItem("carrinhoDeCompras"));
    if (!cartItems || cartItems.length === 0) {
        let modal = document.getElementById("nullCart");
        modal.style.display = "block";
        window[touchEvent] = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
        return true
    }
    return false
}

function validarCpf(data) {
    const cpf = data.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

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
        return true
    } else {
        return false
    }
}

function FormsVerify () {
    var completed = true;

    var nameinput = verifyInput("spancompletname", ".name-message", "#completname", "Digite seu Nome") 
    if(!nameinput) completed = false;
    
    var cpfinput = verifyInput("spancpf", ".cpf-message", "#cpf", "Digite seu CPF")
    if(!cpfinput) completed = false;
    
    var ruainput = verifyInput("spanrua", ".rua-message", "#rua", "Digite o nome da rua")
    if(!ruainput) completed = false;

    var numeroinput = verifyInput("spannumero", ".numero-message", "#numero", "Digite o numero")
    if(!numeroinput) completed = false;

    var bairroinput = verifyInput("spanbairro", ".bairro-message", "#bairro", "Digite o bairro")
    if(!bairroinput) completed = false;

    var cidadeinput = verifyInput("spancidade", ".cidade-message", "#cidade", "Digite a cidade")
    if(!cidadeinput ) completed = false;

    var ufinput = verifyInput("spanuf", ".uf-message", "#uf", "Digite o estado")
    if(!ufinput ) completed = false;
    
    if(cpfinput) {
        const span = document.getElementById("spancpf");
        let err = document.querySelector(`#shippingForms .cpf-message`);
        var valid = validarCpf(document.querySelector("#cpf").value)
        if (!valid) {
            if (!err) {
                err = document.createElement('p');
                err.className = `inputErr cpf-message`;
                span.appendChild(err);
            }
            err.textContent = "CPF Invalido"
            err.style.color = 'red';
            completed = false
        } else {
            if(err) err.remove();
        }
    } 

    if(completed) {
        return {
            nome: document.querySelector("#completname").value,
            cpf: document.querySelector("#cpf").value.replace(/\D/g, ''),
            rua: document.querySelector("#rua").value,
            numero: document.querySelector("#numero").value,
            complemento: !document.querySelector("#complemento") || !document.querySelector("#complemento").value.trim() ? "null" : document.querySelector("#complemento").value,
            bairro: document.querySelector("#bairro").value,
            cidade: document.querySelector("#cidade").value,
            estado: document.querySelector("#uf").value,
        }
    } else {
        return completed
    }
    
}

function verifyInput(spanname, errname, classe, text) {
    const span = document.getElementById(spanname);
    let err = document.querySelector(`#shippingForms ${errname}`);
    var input = document.querySelector(classe)
    if (!input || !input.value.trim()) {
        if (!err) {
            err = document.createElement('p');
            err.className = `inputErr ${errname.replace('.', "")}`;
            span.appendChild(err);
        }
        err.textContent = text
        err.style.color = 'red';
        return false
    } else {
        if(err) err.remove();
        return true
    }
}