class Producto {
  constructor(id, nombre, precio, imagen, categoria = "", descuento = 0, nuevo = false) {
    this.id = id;
    this.nombre = nombre;
    this.precio = precio;
    this.imagen = imagen;
    this.categoria = categoria;
    this.descuento = descuento;
    this.nuevo = nuevo;
  }
}

class CarritoDeCompras {
  constructor() {
    this.elementos = JSON.parse(localStorage.getItem("carrito")) || [];
    if (this.elementos.length > 0) {
      setTimeout(() => alert("🛒 Se ha restaurado tu carrito anterior"), 500);
    }
  }

  agregar(producto) {
    const encontrado = this.elementos.find(el => el.id === producto.id);
    if (encontrado) {
      encontrado.cantidad++;
    } else {
      this.elementos.push({ ...producto, cantidad: 1 });
    }
    this.guardar();
  }

  eliminar(id) {
    this.elementos = this.elementos.filter(el => el.id !== id);
    this.guardar();
  }

  actualizarCantidad(id, cantidad) {
    const item = this.elementos.find(el => el.id === id);
    if (item) {
      item.cantidad += cantidad;
      if (item.cantidad <= 0) this.eliminar(id);
    }
    this.guardar();
  }

  vaciar() {
    this.elementos = [];
    this.guardar();
  }

  obtenerTotal() {
    return this.elementos.reduce((total, el) => total + el.precio * el.cantidad, 0);
  }

  guardar() {
    localStorage.setItem("carrito", JSON.stringify(this.elementos));
  }
}

const productos = [
  new Producto(1, "PlayStation 5", 2999.00, "img/ps5.png", "Consolas", 10, true),
  new Producto(2, "Monitor Gamer 27\"", 999.00, "img/monitor.png", "Monitores", 0, false),
  new Producto(3, "Laptop ASUS Ryzen 7", 3499.00, "img/laptop.png", "Laptops", 15, true),
];

const carrito = new CarritoDeCompras();

function cargarProductos(filtrados = productos) {
  const container = document.querySelector(".product-list");
  container.innerHTML = "";
  filtrados.forEach(producto => {
    const el = document.createElement("article");
    el.className = "product";
    const precioFinal = producto.precio * (1 - producto.descuento / 100);

    el.innerHTML = `
      <div class="badges">
        ${producto.descuento > 0 ? `<span class="badge descuento">-${producto.descuento}%</span>` : ""}
        ${producto.nuevo ? `<span class="badge nuevo">Nuevo</span>` : ""}
      </div>
      <img src="${producto.imagen}" alt="${producto.nombre}" class="product-image">
      <h3 class="producto-name">${producto.nombre}</h3>
      <p class="producto-price">$${precioFinal.toFixed(2)}</p>
      <button class="product-add-btn">Agregar al carrito</button>
    `;

    el.querySelector(".product-add-btn").addEventListener("click", () => {
      carrito.agregar(producto);
      actualizarContador();
      renderizarCarrito();
    });

    container.appendChild(el);
  });
}

const btnCarrito = document.getElementById("btn-carrito");
const panelCarrito = document.getElementById("carrito-panel");
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total-carrito");
const contadorCarrito = document.getElementById("contador-carrito");
const btnVaciar = document.getElementById("btn-vaciar");
const btnCheckout = document.getElementById("btn-comprar");
const filtroInput = document.getElementById("buscar");
const btnModoOscuro = document.getElementById("btnModoOscuro");

if (btnModoOscuro) {
  if (localStorage.getItem("modoOscuro") === "true") {
    document.body.classList.add("dark");
    btnModoOscuro.innerHTML = `<i class="bi bi-sun-fill"></i>`;
  } else {
    btnModoOscuro.innerHTML = `<i class="bi bi-moon-fill"></i>`;
  }

  btnModoOscuro.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const activo = document.body.classList.contains("dark");
    localStorage.setItem("modoOscuro", activo);
    btnModoOscuro.innerHTML = activo
      ? `<i class="bi bi-sun-fill"></i>`
      : `<i class="bi bi-moon-fill"></i>`;
  });
}

btnCarrito.addEventListener("click", () => {
  panelCarrito.classList.toggle("oculto");
  renderizarCarrito();
});

btnVaciar.innerHTML = '<i class="bi bi-trash"></i>';
btnVaciar.classList.add("btn-icono");
btnVaciar.addEventListener("click", () => {
  carrito.vaciar();
  renderizarCarrito();
});

btnCheckout.innerHTML = '<i class="bi bi-check2-circle"></i>';
btnCheckout.classList.add("btn-icono");
btnCheckout.addEventListener("click", () => {
  alert("✅ Gracias por tu compra. Recibirás un correo con los detalles.");
  carrito.vaciar();
  renderizarCarrito();
});

filtroInput.addEventListener("input", e => {
  const filtro = e.target.value.toLowerCase();
  const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(filtro));
  cargarProductos(filtrados);
});

function actualizarContador() {
  const totalItems = carrito.elementos.reduce((sum, el) => sum + el.cantidad, 0);
  contadorCarrito.textContent = totalItems;
}

function renderizarCarrito() {
  listaCarrito.innerHTML = "";

  if (carrito.elementos.length === 0) {
    listaCarrito.innerHTML = "<li>Carrito vacío</li>";
  } else {
    carrito.elementos.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div>
          <button class="cambiar-cantidad negro" data-id="${item.id}" data-op="-1">-</button>
          <span>${item.cantidad}</span>
          <button class="cambiar-cantidad negro" data-id="${item.id}" data-op="1">+</button>
        </div>
        <span>${item.nombre}</span>
        <span>$${(item.precio * item.cantidad).toFixed(2)}</span>
        <button class="eliminar" data-id="${item.id}">&times;</button>
      `;
      listaCarrito.appendChild(li);
    });
  }

  totalCarrito.textContent = `$${carrito.obtenerTotal().toFixed(2)}`;
  actualizarContador();


  document.querySelectorAll(".eliminar").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = parseInt(e.target.getAttribute("data-id"));
      carrito.eliminar(id);
      renderizarCarrito();
    });
  });


  document.querySelectorAll(".cambiar-cantidad").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = parseInt(e.target.getAttribute("data-id"));
      const op = parseInt(e.target.getAttribute("data-op"));
      carrito.actualizarCantidad(id, op);
      renderizarCarrito();
    });
  });
}


cargarProductos();
actualizarContador();
renderizarCarrito();
