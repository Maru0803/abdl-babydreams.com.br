var touchEvent = 'ontouchstart' in window ? 'ontouchstart' : 'onclick';

document.addEventListener("DOMContentLoaded", async () => { 
    await fetch('/payment/intent').then((r) => r.json());
    const { publishableKey } = await fetch('/apis/public').then((r) => r.json());
    const { clientSecret } = await fetch('/apis/secret').then(r => r.json());
    const stripe = Stripe(publishableKey, {
        apiVersion: "2020-08-27",
    });

    const elements = stripe.elements({ clientSecret });
    const paymentElement = elements.create("payment");
    paymentElement.mount("#payment-element");

    const linkAuthenticationElement = elements.create("linkAuthentication");
    linkAuthenticationElement.mount("#link-authentication-element");

    const shippingAddressElement = elements.create("address", { mode: 'billing', allowedCountries: ['BR']});
    shippingAddressElement.mount("#shipping-address-element");
    
    let submitted = false;
    const form = document.getElementById("payment-form");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (submitted) {
            return;
        }
        submitted = true;
        form.querySelector("button").disabled = true;

        const { error: stripeError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/payment/success`,
            },
        });

        if (stripeError) {
            addMessage();
            submitted = false;
            form.querySelector("button").disabled = false;
            return;
        }
    });
});

const addMessage = () => {
    let modal = document.getElementById("payModal");
    modal.style.display = "block";
    window[touchEvent] = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
};

window.addEventListener('load', () => {
    display()
});

function display() {
    fetch(`/apis/verifycartdata`, {
        method: 'GET',
    }).then(response => {
        return response.json();
    })
    .then(async data => {
        if(data.status === "outstock") {
            let modal = document.getElementById("stockNull");
            modal.style.display = "block";
            window[touchEvent] = function (event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                    localStorage.clear()
                    window.location.href = '/';
                }
            }
        } else if(data.status === "success") {
            const { produtos } = await fetch('/apis/getproducts').then(r => r.json())
            let cartItems = data.cart
            let cartItemsContainer = document.getElementById("cartItems");
            cartItemsContainer.innerHTML = "";

            document.getElementById("payProduto").textContent = (data.info.total - data.info.value + (!data.info.desconto  || [0, "null"].includes(data.info.desconto)  ? 0 : data.info.desconto)).toFixed(2);
            document.getElementById("payFrete").textContent = `${data.info.value.toFixed(2)} - ` + "Tipo de envio: " + data.info.type;
            document.getElementById("payGift").textContent = `-${ (!data.info.desconto  || [0, "null"].includes(data.info.desconto) ? 0.00 : data.info.desconto) + ".00"} - Cupom utilizado ${data.info.cupom === "null" || !data.info.cupom ? "Nenhum" : data.info.cupom}` 
            document.getElementById("payTotal").textContent = data.info.total

            Object.entries(cartItems).forEach(([a, b], i) => {
                if(["cupom", "total"].includes(a)) return;
                let item = produtos[a]
                if (b > 0) {
                    let itemElement = document.createElement("div");
                    itemElement.classList.add("cart-item");
                    itemElement.innerHTML = `
                            <img src="${item.image}" alt="${item.description}">
                            <div class="item-details">
                            <p>${item.name}</p>
                            <p>R$ ${item.price}</p>
                            </div>
                            <div class="item-quantity">
                            <span>${b}</span>
                            </div>
                        `;
                    cartItemsContainer.appendChild(itemElement);
                }
            })
            if (!Object.entries(cartItems)) cartItemsContainer.innerHTML = "<p>Nenhum item no carrinho</p>";
        } else {
            addMessage()
        }
    })
    .catch(error => {
        console.log("[PAYMENT PAGE]", error)
        addMessage()
    })
}