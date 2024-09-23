var touchEvent = 'ontouchstart' in window ? 'ontouchstart' : 'onclick';
var stock;
var menuside = false;
var sidebar = false;
var updateCartTotal = updateCartTotal;
var adicionarAoCarrinho = adicionarAoCarrinho;

if(window.location.pathname === "/checkout") window.addEventListener('load', () => {
    displayCartItems()
});

function openMenu() {
    if (menuside === false) {
        document.getElementById("menuSidebar").style.width = "400px";
        menuside = true
        if(sidebar) {
            sidebar = false
            document.getElementById("cartSidebar").style.width = "0";
        }
    } else {
        document.getElementById("menuSidebar").style.width = "0";
        menuside = false
    }
}

function openCart() {
    if (sidebar === false) {
        document.getElementById("cartSidebar").style.width = "400px";
        displayCartItems();
        sidebar = true
        if(menuside) {
            menuside = false
            document.getElementById("menuSidebar").style.width = "0";
        }
    } else {
        document.getElementById("cartSidebar").style.width = "0";
        sidebar = false
    }
}

window.addEventListener('load', () => {
    fetch(`/apis/getdatabasestock`, {
        method: 'GET',
    }).then(response => {
        return response.json();
    })
    .then(data => {
       stock = data
    })
    .catch(error => {
        console.log("[CART FUNCTIONS]", error)
    });
});

function adicionarAoCarrinho(nomeProduto, precoProduto) {
    let carrinhoDeCompras = carregarCarrinhoDoLocalStorage();
    const index = carrinhoDeCompras.findIndex(item => item.nome === nomeProduto);
    const count = index === -1 ? 0 : carrinhoDeCompras[index].count
    if (stock[nomeProduto] > count) {
        if (index !== -1) {
            carrinhoDeCompras[index].count++;
        } else {
            carrinhoDeCompras.push({
                nome: nomeProduto,
                preco: precoProduto,
                count: 1
            });
        }
        updateCartTotal();
        salvarCarrinhoNoLocalStorage(carrinhoDeCompras);
        let modal = document.getElementById("addModal");
        modal.style.display = "block";
  
        if (sidebar === true) {
            document.getElementById("cartSidebar").style.width = "400px";
            displayCartItems();
        }
        window[touchEvent] = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    } else {
        let modal = document.getElementById("limitModal");
        modal.style.display = "block";
        window[touchEvent] = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }
}
  
function increaseQuantity(itemId) {
    let cartItems = JSON.parse(localStorage.getItem("carrinhoDeCompras"));
    if (itemId !== -1) {
        if (stock[cartItems[itemId].nome] > cartItems[itemId].count) { 
            cartItems[itemId].count++;
            localStorage.setItem("carrinhoDeCompras", JSON.stringify(cartItems));
            displayCartItems();
        } else {
            let modal = document.getElementById("limitModal");
            modal.style.display = "block";
            window[touchEvent] = function (event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
        }
    }
}

function decreaseQuantity(itemId) {
    let cartItems = JSON.parse(localStorage.getItem("carrinhoDeCompras"));
    if (itemId !== -1 && cartItems[itemId].count > 1) {
        cartItems[itemId].count--;
        localStorage.setItem("carrinhoDeCompras", JSON.stringify(cartItems));
        displayCartItems();
    }
}
function salvarCarrinhoNoLocalStorage(carrinho) {
    localStorage.setItem('carrinhoDeCompras', JSON.stringify(carrinho));
}

function carregarCarrinhoDoLocalStorage() {
    const carrinhoSalvo = localStorage.getItem('carrinhoDeCompras');
    return carrinhoSalvo ? JSON.parse(carrinhoSalvo) : [];
}

function deleteItem(itemId) {
    let cartItems = JSON.parse(localStorage.getItem("carrinhoDeCompras"));
    let updatedCartItems = cartItems.filter((item, index) => index !== itemId);
    localStorage.setItem("carrinhoDeCompras", JSON.stringify(updatedCartItems));
    displayCartItems();
}

function updateCartTotal(data, type, fretetype) {
    let cartTotal = 0;
    if (data && type === "gift") {
        let desconto = data;
        document.getElementById("cartGift").textContent = desconto.toFixed(2);
    }
    if (data && type === "frete") {
        let add = data;
        document.getElementById("cartFrete").textContent = Number(add).toFixed(2);
        document.getElementById("cartFrete").setAttribute('data-type', fretetype);
    }
    let cartItems = JSON.parse(localStorage.getItem("carrinhoDeCompras"));
    if (cartItems && cartItems.length > 0) {
        cartItems.forEach(function (item) {
            cartTotal += (item.preco * item.count);
        });
    }
    document.getElementById("cartProduto").textContent = (cartTotal).toFixed(2)
    let desconto = parseFloat(document.getElementById("cartGift").textContent);
    let frete = parseFloat(document.getElementById("cartFrete").textContent);
    document.getElementById("cartTotal").textContent = (cartTotal + frete - desconto).toFixed(2);
}

async function displayCartItems() {
    updateCartTotal();
    const { produtos } = await fetch('/apis/getproducts').then(r => r.json())
    let cartItems = JSON.parse(localStorage.getItem("carrinhoDeCompras"));
    let cartItemsContainer = document.getElementById("cartItems");
    cartItemsContainer.innerHTML = "";

    if (cartItems && cartItems.length > 0) {
        cartItems.forEach((i, index) => {
            var item = produtos[i.nome]
            let itemElement = document.createElement("div");
            itemElement.classList.add("cart-item");
            itemElement.innerHTML = `
                <img src="${item.image[0]}" alt="${item.description}">
                <div class="item-details">
                    <p>${item.names[0]}</p>
                    <p>R$ ${item.price} - ${item.count[0]}</p>
                </div>
                <div class="item-quantity">
                    <button class="btn-add" onclick="decreaseQuantity(${index})">-</button>
                    <span>${i.count}</span>
                    <button class="btn-add" onclick="increaseQuantity(${index})">+</button>
                    <button class="delete-button" onclick="deleteItem(${index})">x</button>
                </div>
                
            `;
            cartItemsContainer.appendChild(itemElement);
        });
        updateCartTotal();
    } else {
        cartItemsContainer.innerHTML = "<p>Nenhum item no carrinho</p>";
    }
}
