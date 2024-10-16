var touchEvent = 'ontouchstart' in window ? 'ontouchstart' : 'onclick';

document.addEventListener('DOMContentLoaded', async () => {
    window.onload = function() {
        let url = window.location.toString();
        if (url.indexOf("?") > 0) {
            let clean_url = url.substring(0, url.indexOf("?"));
            window.history.replaceState({}, document.title, clean_url);
        }
    };
    
    const { publishableKey } = await fetch('/apis/public').then((r) => r.json());
    const { clientSecret } = await fetch('/apis/secret').then(r => r.json());
    const stripe = Stripe(publishableKey, {
        apiVersion: "2020-08-27",
    });
    const { error, paymentIntent } = await stripe.retrievePaymentIntent(
        clientSecret
    );
    
    if(error) {
        let modal = document.getElementById("errorModal");
        modal.style.display = "block";
        window[touchEvent] = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    } else {
        fetch(`/apis/saveorder?dataid=${paymentIntent.id}`, {
            method: 'GET',
        }).then(response => {
            return response.json();
        }).then(async data => {
            localStorage.clear();
            const { produtos } = await fetch('/apis/getproducts').then(r => r.json())

            let cartItems = data.cart
            let cartItemsContainer = document.getElementById("cartItems");
            cartItemsContainer.innerHTML = "";
            document.getElementById("orderid").textContent = data.info.orderid
            document.getElementById("payProduto").textContent = (data.info.total - data.info.value + (!data.info.desconto  || [0, "null"].includes(data.info.desconto)  ? 0 : data.info.desconto)).toFixed(2);
            document.getElementById("payFrete").textContent = `${data.info.value.toFixed(2)} - ` + "Tipo de envio: " + data.info.type;
            document.getElementById("payGift").textContent = `-${ (!data.info.desconto  || [0, "null"].includes(data.info.desconto) ? 0.00 : data.info.desconto) + ".00"} - ${data.info.cupom === "null" || !data.info.cupom ? "Nenhum cupom uitlizado" : "Cupom utilizado: "+data.info.cupom}` 
            document.getElementById("payTotal").textContent = data.info.total

            Object.entries(cartItems).forEach(([a, b], i) => {
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
            let modal = document.getElementById("successModal");
            modal.style.display = "block";
            window[touchEvent] = function (event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
        })
        .catch(error => {
            console.log("[SUCCESS PAGE]", error);
            let modal = document.getElementById("errModal");
            modal.style.display = "block";
            window[touchEvent] = function (event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
        });  
    }
});
