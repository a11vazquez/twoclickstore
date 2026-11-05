


/*======================
        HAM MENU
=========================*/
const navbar = document.getElementById("navbar");
const hamMenu = document.getElementById("ham-btn");
const hamClose = document.getElementById("ham-close");

hamMenu.addEventListener("click", () => {
    navbar.classList.add("animate", "nav-visible");
});

hamClose.addEventListener("click", () => {
    navbar.classList.remove("animate", "nav-visible");

});
/*============================================== */

/*===================
        SORT PRODUCTS
  ======================*/

import API_URL from "./config.js";
let products = []; //fetch a /products

//selecciono todas las categorias nodeList de divs con la clase .category-products_card
const categories = document.querySelectorAll(".category-products_card");

/*BTNS ORDENAR PRODUCTOS */
const sortByPrice = document.getElementById("sort-price-btn");
const sortByNormal = document.getElementById("sort-normal-btn");
const sortByLowerPrice = document.getElementById("sort-price-lower-btn");


sortByPrice.addEventListener("click", () => {
    sortProducts(2)
});

sortByNormal.addEventListener("click", () => {
    sortProducts(1)
});

sortByLowerPrice.addEventListener("click", () => {
    sortProducts(3)
});


function sortProducts(option) {
    switch (option) {
        case 1:
            products.sort((pr1, pr2) => pr1.id - pr2.id);

            break;
        case 2:
            products.sort((pr1, pr2) => pr2.price - pr1.price);
            break;
        case 3:
            products.sort((pr1, pr2) => pr1.price - pr2.price);
            break;
    }
    renderProducts(products);
}

/*=====================
        ORDER BY
===================== */

const container = document.querySelector(".container");
async function obtenerProductos() {
    try {

        let res = await fetch(`${API_URL}/api/products`); //peticion al servidor, request GET
        let data = await res.json(); //parseo de datos json a objeto js

        console.log("Total Products : ", data.message);
        products = data.products;
        renderProducts(products);
    } catch (error) {
        console.error('error obteniendo productos : ', error);
    }
}

function renderProducts(array) {
    container.innerHTML = array.map(p => `
                <div class="card-product">
                    <div class="product-image">
                            <img src="${p.img}" alt="${p.name}">
                        </div>
                        <h3 data-product-title>${p.name}</h3> 
                        <p data-product-category>${p.category}</p>
                        <span class="one-product-message"></span>
                    <div class="product-price-btn">
                        <p data-product-price>$${p.price}</p>
                        <button class="card-btn" data-id="${p.id}">Agregar</button>
                    </div>
                </div>
                `).join(""); //mapea la card por cada producto, luego join los une sin separadores, dejandolo listo para el html.
}





/*====================
FILTER CATEGORY PRODUCTS
=======================*/

//recorro las categorias agregando el evento click
function configureCategories() {
    categories.forEach(category => {
        category.addEventListener("click", () => {
            if (category.classList.contains("underline")) {
                console.log("desde el if contains:", category.dataset.category)
                return; //si ya esta seleccionada, termina el evento
            }

            addUnderline(category);
            redenderCategoryProducts(category.dataset.category);
        });
    });                 
}

function addUnderline(category) {
    categories.forEach(c => c.classList.remove("underline")); //remove underline all categories
    category.classList.add("underline"); //add underline select categorie
};

function redenderCategoryProducts(category) {
    if(category != "all"){
        let card = '';
        products.forEach(p => {
            if(p.category == category){
                card += `
                    <div class="card-product">
                            <div class="product-image">
                                    <img src="${p.img}" alt="${p.name}">
                                </div>
                                <h3 data-product-title>${p.name}</h3> 
                                <p data-product-category>${p.category}</p>
                                <span class="one-product-message"></span>
                            <div class="product-price-btn">
                                <p data-product-price>$${p.price}</p>
                                <button class="card-btn" data-id="${p.id}">Agregar</button>
                            </div>
                        </div> 
                `
            }
        });
    
        console.log("cards category : ", category);
        container.innerHTML = card;
    }else 
        renderProducts(products);
}


/*=========================
    FILTER INPUT PRODUCTS
================== */
const searchProductInput = document.getElementById("filter-input");
searchProductInput.addEventListener("keyup", filterProductInput); // Evento al terminar de presionar una tecla.

function filterProductInput() {
    if (searchProductInput.value.length) {
        let filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchProductInput.value));
        filteredProducts.length ? renderProducts(filteredProducts) : container.innerHTML = `<p>PRODUCT NOT FOUND</p>`;
    } else
        renderProducts(products);
}

/*=======================
    DOLAR API PAY SECTION
======================= */
let cart = []; //Array del carrito
/* VARIABLES */
let dolarBlue = []; // array del objeto dolar blue
///Consultar Dolar Blue mediante fetch a la api del Dolar 
async function fetchApiDolar() {
    try {
        const res = await fetch('https://dolarapi.com/v1/dolares/blue');
        dolarBlue = await res.json(); // parseo la respuesta en objeto js
        console.log("valor dolar blue para la venta: ", dolarBlue.venta);

        console.log("fecha dolar :", dolarBlue.fechaActualizacion);
        console.log(dolarBlue);
    } catch (error) {
        console.log("ERROR CAPTURADO EN DOLAR API", error, error.message);
    }
}



//buy section 
const buySection = document.querySelector(".buy-section");

// precio total de los productos del carrito.
const totalCartPrice = document.getElementById("cart-total_price");


//span precio total en pesos
const pesosPrice = document.querySelector(".pesos-price");

const dolarPrice = document.querySelector(".dolar-price");

//div contenedor pago en dolar
const paySectionDolar = document.querySelector(".pay-section_dolar");

//div contenedor pago en pesos
const paySectionPesos = document.querySelector(".pay-section_pesos");

//variable contenedora del precio dolar blue
let bluePrice = document.querySelector(".bluePrice");

const fechaActualizacion = document.querySelector(".fechaCotizacion");

const buyFormSection = document.querySelector(".buy-form-section");
const contactForm = document.querySelector(".contact-form");
const btnDolar = document.querySelector(".btn-dolar");
const btnPesos = document.querySelector(".btn-pesos");
let moneySelect = '';
btnPesos.addEventListener("click", renderPesosSection);
btnDolar.addEventListener("click", renderDolarSection);


function renderDolarSection() {
    if (paySectionPesos.classList.contains("active"))
        paySectionPesos.classList.remove("active");

    changeColorBtnsDolarAndPesos(btnDolar);
    buyFormSectionAddActiveClass(true);
    moneySelect = "Dolar";
    dolarPrice.textContent = `${obtenerTotal()}`;
    paySectionDolar.classList.add("active");
}

function obtenerTotal() {
    //remplazo output= $3800 -> 3800.trim() saco los espacios -> Number() parseo a numero.tofixed(2) con dos decimales luego del .00
    return Number(totalCartPrice.textContent.replace("$", " ").trim()).toFixed(2);
}
function getPesos() {
    //1500*3800.tofixed(2) --> 5909000.00 
    return (Number(dolarBlue.venta) * obtenerTotal()).toFixed(2);
}
function renderPesosSection() {
    // En caso de estar activa la seccion, no hace nada el evento.
    if (paySectionPesos.classList.contains("active"))
        return;

    //desactivamos la seccion pagar con dolares
    if (paySectionDolar.classList.contains("active"))
        paySectionDolar.classList.remove("active");

    changeColorBtnsDolarAndPesos(btnPesos);
    buyFormSectionAddActiveClass(true);
    moneySelect = "Pesos";
    convertDollarsToPesos();

}

function buyFormSectionAddActiveClass(bool) {
    if (bool) {
        if (buyFormSection.classList.contains("hidden")) {
            buyFormSection.classList.add("active");
            buyFormSection.classList.remove("hidden");
        }
    } else {
        buyFormSection.classList.add("hidden");
        buyFormSection.classList.remove("active");
    }
}
function changeColorBtnsDolarAndPesos(btnSelect) {
    if (btnSelect == btnDolar) {
        if (btnPesos.classList.contains("pesos-select")) {
            btnPesos.classList.remove("pesos-select");
            btnPesos.classList.add("btn-pesos");
        }
        btnDolar.classList.add("dolar-select");
        btnDolar.classList.remove("btn-dolar");
    } else if (btnSelect == btnPesos) {
        if (btnDolar.classList.contains("dolar-select")) {
            btnDolar.classList.remove("dolar-select");
            btnDolar.classList.add("btn-dolar");
        }
        btnPesos.classList.add("pesos-select");
        btnPesos.classList.remove("btn-pesos");
    }
}


function resetDolarAndPesosBtn() {
    btnPesos.classList.remove("pesos-select");
    btnPesos.classList.add("btn-pesos");

    btnDolar.classList.remove("dolar-select");
    btnDolar.classList.add("btn-dolar");

    if (moneySelect.toLowerCase() == 'dolar')
        paySectionDolar.classList.remove("active");
    else if (moneySelect.toLowerCase() == 'pesos')
        paySectionPesos.classList.remove("active");


}

function convertDollarsToPesos() {
    console.log("valor dolar blue para la venta: ", dolarBlue.venta);

    bluePrice.textContent = dolarBlue.compra;
    console.log("TOTAL PRICE : ", obtenerTotal());
    console.log("TOTAL PRICE PESOS : ", getPesos());
    console.log("Fecha act. sin split : ", dolarBlue.fechaActualizacion);
    pesosPrice.textContent = getPesos();
    fechaActualizacion.textContent = dolarBlue.fechaActualizacion.split("T")[0];
    console.log("Fecha act. con split : ", dolarBlue.fechaActualizacion.split("T")[0]);
    paySectionPesos.classList.add("active");
}

const cartCounter = document.getElementById("cart-counter"); // contador de productos del carrito

function actualizarCarrito() {
    //calcula precio total, recorriendo el carrito, sumando el precio + la cantidad de cada producto.
    totalCartPrice.textContent = `$${cart.reduce((total, p) => total + (p.price * p.quantity), 0).toFixed(2)}`;

    //changeCartCounter
    if (cart.length > 0) {
        if (!(buySection.classList.contains("active")))
            buySection.classList.add("active");

        //Actualiza el total de productos recorriendo el array del carrito, sumando la cantidad seleccionada de cada producto.
        cartCounter.textContent = cart.reduce((total, p) => total + p.quantity, 0);

        //Actualiza el precio a pagar en dolar o pesos
        //si la seccion pagar con pesos esta activa
        if (paySectionPesos.classList.contains("active"))
            pesosPrice.textContent = getPesos();
        else if (paySectionDolar.classList.contains("active"))
            dolarPrice.textContent = obtenerTotal();
    } else {
        //si el carrito no tiene productos .length = 0
        buySection.classList.remove("active");
        cartCounter.textContent = 0;
        resetDolarAndPesosBtn();
        buyFormSectionAddActiveClass(false)
        moneySelect = '';
        contactForm.reset();
    }
}



/*============================
    ADD TO CART FUNCTIONS
 ============================= */



container.addEventListener("click", (event) => { //Agrego el evento al container de las cards
    const btnAddToCart = event.target.closest(".card-btn"); //target me da los elementos del evento, closest busca si fue causado dentro o por la clase ".card-btn"

    if (!sucessfull.classList.contains("hidden"))
        sucessfull.classList.add("hidden");

    if (btnAddToCart) {//si se origino en esa clase, devuelve la etiqueta o null
        let id = Number(btnAddToCart.dataset.id); //obtengo el id del producto mediante data*- 
        addToCart(id);
    }


});

function addToCart(id) {
    if (!cart.find(p => p.id === id)) { //si el carrito no esta el producto con esa id, lo agrega
        cart.push({
            ...products.find(p => p.id === id),
            quantity: 0
        });
    }
    cart[cart.findIndex(p => p.id === id)].quantity += 1; //en caso de estar o se agrego, se suma cantidad+1 
    console.log("add To Cart Product");
    saveCartToLocalStorage();
    actualizarCarrito();
    viewCart();
}

const cartList = document.getElementById("cart-ul"); // section mostrar productos del carrito
cartList.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-action]");

    // Si no se hizo clic en un botón con data-action, salimos de inmediato
    if (!btn) return;


    if (btn.dataset.action === "delete") {

        deleteProduct(Number(btn.dataset.index));
        console.log("boton click : ", btn.dataset.action);
        console.log("boton click INDEX : ", btn.dataset.index);
    } else if (btn.dataset.action === "increasse") {
        addToCart(Number(btn.dataset.id));
        console.log("boton click : ", btn.dataset.action);
        console.log("boton click ID : ", btn.dataset.id);
    }
});



const filterInput = document.getElementById("filter-input"); // input filtro productos

let totalProducts = 0;
let elements = "";


/*Carga carrito desde local storage al entrar en la web
    si hay productos, incrementa el contador del carrito.
    muestra el carrito llamando a la funcion, donde ya maneja la validacion del length.
*/
function loadCart() {
    cart = JSON.parse(localStorage.getItem("cart-products")) || []; //si retorna algo de localStorage o array vacio.
    if (cart.length === 0) {
        cleanCart();
        console.log("load cart nada en el carrito");
    }
    
    updateStatus();
}


function viewCart() {
    elements = "";
    if (cart.length === 0) {
        elements += `
            <li>No Hay Productos En El Carrito</p>
        `
    } else {
        cart.forEach((p, i) => {
            elements += `
                <li class="cart-li">
                <div class="cart-li-info">
                    <h4>${p.name}</h4>
                    <p>$ ${p.price}</p>
                    <small>Categoría: ${p.category}</small>
                </div>

                <div class="cart-li-btns display-flex-center">
                    <div class="cart-li-btns-quantity display-flex-center">
                    <button class="display-flex-center" data-action="increasse" data-id="${p.id}">
                        <ion-icon name="add-outline"></ion-icon>
                    </button>
                    <span>${p.quantity}</span>
                    <button class="display-flex-center" data-action="delete" data-index="${i}" >
                        <ion-icon name="remove-outline"></ion-icon>
                    </button>
                    </div>
                    <button class="cart-li-btn-delete"  data-action="delete" data-index="${i}">Delete</button>
                </div>
                </li>
            `
        });
    }

    cartList.innerHTML = elements;
}

function cleanCart() {
    cart = [];
    localStorage.clear("cart-products")
    paySectionPesos.classList.remove("active");
    paySectionDolar.classList.remove("active");
    buySection.classList.remove("active");
    actualizarCarrito();
    viewCart(cart);
}

/*Elimina un producto si es el ultimo, si hay mas de uno solo resta la cantidad.
Decrementa en uno al contador y, cambia su inner.
llama la funcion Guarda el carrito actualizado en localStorage
llama la funcion muestra el carrito actualizado en el innerHTML.
*/
function deleteProduct(index) {
    console.log("index en delete product: ", index);
    if (cart[index].quantity === 1)
        cart.splice(index, 1); //eliminar producto del carrito si solo hay uno agreado.
    else if (cart[index].quantity >= 1)
        cart[index].quantity--; //si hay mas de uno, solo restar la cantidad.

    cartCounter.innerHTML = --totalProducts;
    actualizarCarrito();
    saveCartToLocalStorage();
    viewCart(cart);
}

/*Excersice 5 - Guardar en LocalStorage*/
function saveCartToLocalStorage() {
    localStorage.setItem("cart-products", JSON.stringify(cart));
    console.log(`SAVE CART Guardando carrito en local storage ${cart.length}`);
}

/*Excersice 7 - Change Status¨*/

function updateStatus() {
    //Actualiza el contador del carrito, el precio del total y, el renderizado del carrito.
    changeCartCounter();
    changeTotalPrice();
    viewCart(cart);
}

function changeTotalPrice() {
    totalCartPrice.textContent = `$${cart.reduce((total, p) => total + (p.price * p.quantity), 0)}`;
}

/*
Valida length del carrito, cambia valor al contador de productos del carrito.
*/
function changeCartCounter() {
    if (cart.length > 0)
        totalProducts = cart.reduce((total, value) => total + value.quantity, 0); // total empieza en 0, va acumulando los productos.
    else
        totalProducts = 0;

    cartCounter.innerHTML = totalProducts;
}




contactForm.addEventListener("submit", e => {
    e.preventDefault();

    // Array para guardar los ID de los productos
    let idProducts = [];

    // Importar jsPDF
    const { jsPDF } = window.jspdf;

    // Crear un PDF con ancho de 80 mm
    // La altura inicial es de 150 mm
    const doc = new jsPDF({
        unit: 'mm',
        format: [80, 150]
    });

    // Configuración del ticket
    let y = 10;
    const width = 80;
    const margin = 5;


    // ENCABEZADO
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);

    //Titulo desde la mitad, alineado al medio
    doc.text('TWO CLICK!', width / 2, y, {
        align: 'center'
    });

    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('AppleStore', width / 2, y, {
        align: 'center'
    });

    y += 5;

    doc.setFontSize(10);

    doc.text('TICKET DE COMPRA', width / 2, y, {
        align: 'center'
    });

    y += 5;

    // SEPARADOR
    doc.setLineWidth(0.3);
    doc.line(margin, y, width - margin, y);

    y += 6;

    // ENCABEZADOS DE COLUMNAS
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);

    doc.text('PRODUCTO', margin, y);

    doc.text('PRECIO', width - margin, y, {
        align: 'right'
    });

    y += 5;

    // RECORRER LOS PRODUCTOS DEL CARRITO
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    cart.forEach(p => {
        // Guardar el ID del producto
        idProducts.push(p.id);

        // Convertir el precio a número
        const price = Number(p.price * p.quantity) || 0;


        // Imprimir el nombre del producto
        doc.text(`${p.name}`, margin, y);

        // Imprimir el precio alineado a la derecha
        doc.text(
            `$ ${price.toLocaleString('es-AR')}`,
            width - margin,
            y,
            { align: 'right' }
        );

        // Imprimir la categoría debajo del nombre
        doc.setFontSize(8);
        doc.setTextColor(100);

        y += 4;
        doc.text(`Categoria: ${p.category}`, margin, y);
        y += 3;
        doc.text(`Cantidad: ${p.quantity}`, margin, y);

        // Restaurar color y tamaño
        doc.setTextColor(0);
        doc.setFontSize(8);

        // Espacio entre productos
        y += 5;
    });

    // SEPARADOR ANTES DEL TOTAL
    y += 1;

    doc.setLineWidth(0.3);
    doc.line(margin, y, width - margin, y);

    y += 6;

    // CANTIDAD DE PRODUCTOS
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    let quantity = 0;
    cart.forEach(p => {
        quantity += p.quantity;
    }
    );
    doc.text(`Cantidad: ${quantity}`, margin, y);

    y += 7;

    // TOTAL DE LA COMPRA
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);

    doc.text('TOTAL:', margin, y);
    let total;
    if(moneySelect.toLocaleLowerCase() == "pesos"){
       total = getPesos();
    }else total = obtenerTotal();

        doc.text(
            `$ ${total.toLocaleString('es-AR')}`,
            width - margin,
            y,
            { align: 'right' }
        );

    

    y += 7;

    // SEPARADOR FINAL
    doc.setLineWidth(0.3);
    doc.line(margin, y, width - margin, y);

    y += 7;

    // MENSAJE DE AGRADECIMIENTO
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    doc.text('¡Gracias por tu compra!', width / 2, y, {
        align: 'center'
    });

    y += 5;

    doc.setFontSize(9);

    doc.text('TWO CLICK! AppleStore', width / 2, y, {
        align: 'center'
    });

    y += 5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`Fecha : ${new Date().toLocaleDateString('es-AR')}`, width / 2, y, {
        align: 'center'
    });
    y += 5;
    doc.text(`Hora : ${new Date().toLocaleTimeString('es-AR')}`, width / 2, y, {
        align: 'center'
    });

    y += 8;

    doc.text(`Moneda de pago : ${moneySelect}`, margin, y);
    y += 11;
    doc.text('bY zeda dev', width / 2, y, {
        align: 'center'
    })

    // DESCARGAR EL TICKET
    doc.save('appleStore-Ticket.pdf');
    console.log("carrito de localstorage: ", cart);
    const userData = Object.fromEntries(new FormData(e.target));
    console.log("User Data : ", userData);

    registerSale(total, idProducts, userData);
    sucessfullPurchase();
    updateStatus();
});



/*============================
    SALES SECTION
=================================*/
const sucessfull = document.querySelector(".sucessfull-purchase");

function sucessfullPurchase() {
    buyFormSectionAddActiveClass(false);
    cleanCart();
    buySection.classList.remove("active");
    sucessfull.classList.remove("hidden")
}

async function registerSale(total, idProducts, userData){
    console.log("RESGISTER SALE");
    const data = {
        totalPrice: total,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        idProducts: idProducts
    };
    const response = await fetch(`${API_URL}/api/sales`,{
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if(response.ok){
        console.log("-> ok");
        console.log(result.message);
    }else{
        console.log("ERROR SALE!", result.message);
    }

}


function init() {
    obtenerProductos();
    configureCategories();
    fetchApiDolar();
    loadCart();
}

init();
