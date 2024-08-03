const urlParams = new URLSearchParams(window.location.search);
const defaultFilter = urlParams.get('category');

if (defaultFilter) {
    filterProducts(defaultFilter);
}

function gerarQueryString(localStore) {
    const queryParams = [];
    const produtos = {};
    localStore.forEach(item => {
        produtos[item.nome] = item.count;
    });
    for (const produto in produtos) {
        if (produtos.hasOwnProperty(produto)) {
            queryParams.push(`${encodeURIComponent(produto)}=${encodeURIComponent(produtos[produto])}`);
        }
    }
    return queryParams.join('&');
}
