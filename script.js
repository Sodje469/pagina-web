const fmt = v => new Intl.NumberFormat('es-CL').format(Math.round(v));

const usuarios = [
  { email: "ana@example.com", password: "Clave2025", nombre: "Ana", apellidos: "García", intentos: 0, bloqueado: false }
];

const productos = [
  { id: 1, nombre: 'Hummus Tradicional', descripcion: 'Cremoso hummus con tahini y aceite de oliva', precio: 12990, categoria: 'Aperitivos', stock: 20, imagen: 'https://buenprovecho.hn/wp-content/uploads/2022/12/Untitled-design.jpg' },
  { id: 2, nombre: 'Falafel (6 piezas)', descripcion: 'Croquetas de garbanzos fritas con especias', precio: 15500, categoria: 'Aperitivos', stock: 15, imagen: 'https://th.bing.com/th/id/R.6d095ab49b5567e43f97e0321c6f6386?rik=RtQFiNVPOn%2fGWg&riu=http%3a%2f%2fcookingtheglobe.com%2fwp-content%2fuploads%2f2016%2f02%2fhow-to-make-falafel-4.jpg&ehk=dOfF7GCgvI6fOL95jzjmE6QTdo2VOcW%2fDoM%2b0TfUeG4%3d&risl=&pid=ImgRaw&r=0' },
  { id: 3, nombre: 'Shawarma de Pollo', descripcion: 'Pollo marinado en pan pita con vegetales', precio: 18750, categoria: 'Platos Principales', stock: 10, imagen: 'https://i.blogs.es/f03b7f/shawarma/1366_2000.jpg' },
  { id: 4, nombre: 'Tabule', descripcion: 'Ensalada fresca de perejil, tomate y bulgur', precio: 14250, categoria: 'Aperitivos', stock: 12, imagen: 'https://blog.dia.es/wp-content/uploads/2021/11/tabule-receta.jpg?x90137' },
  { id: 5, nombre: 'Kebab de Cordero', descripcion: 'Brochetas de cordero con especias árabes', precio: 24900, categoria: 'Platos Principales', stock: 8, imagen: 'https://th.bing.com/th/id/R.ec35ec25cc2504678c871225529ed0d1?rik=F7yj7ohpLptNZw&pid=ImgRaw&r=0' },
  { id: 6, nombre: 'Baba Ganoush', descripcion: 'Puré de berenjenas ahumadas con tahini', precio: 13500, categoria: 'Aperitivos', stock: 14, imagen: 'https://littlesunnykitchen.com/wp-content/uploads/2014/07/Baba-Ganoush-recipe-12.jpg' },
  { id: 7, nombre: 'Mansaf', descripcion: 'Cordero en salsa de yogurt con arroz', precio: 28750, categoria: 'Platos Principales', stock: 5, imagen: 'https://www.seriouseats.com/thmb/P1mvGpryoxyKcwnoflRybvXBAd0=/1500x1125/20221208-Mansaf-Mai-Kakish-hero-ec9c515c00d24b5c9ef567854036f044.JPG' },
  { id: 8, nombre: 'Kibbeh (4 piezas)', descripcion: 'Croquetas de bulgur rellenas de carne', precio: 16250, categoria: 'Aperitivos', stock: 10, imagen: 'https://imag.bonviveur.com/kibbeh-listo-para-comer.jpg' },
  { id: 9, nombre: 'Baklava', descripcion: 'Postre de hojaldre con nueces y miel', precio: 8500, categoria: 'Postres', stock: 30, imagen: 'https://tse3.mm.bing.net/th/id/OIP.USb085NT0p5ENKGlToC2uwHaFZ?cb=ucfimg2ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3' },
  { id: 10, nombre: 'Té Árabe', descripcion: 'Té negro con cardamomo y canela', precio: 5750, categoria: 'Bebidas', stock: 40, imagen: 'https://img.freepik.com/foto-gratis/te-arabe-vasos-tetera-sobre-tela-roja_23-2148088409.jpg?size=626&ext=jpg' },
];

const pedidosDemo = [
  { numero: 101, productos: ['Hummus', 'Falafel'], cantidades: [2, 1], total: 41480 },
  { numero: 102, productos: ['Shawarma', 'Té Árabe'], cantidades: [1, 2], total: 30250 },
  { numero: 103, productos: ['Kebab', 'Baklava'], cantidades: [2, 3], total: 75300 },
  { numero: 104, productos: ['Mansaf'], cantidades: [1], total: 28750 },
  { numero: 105, productos: ['Tabule', 'Baba Ganoush'], cantidades: [1, 2], total: 41250 }
];

function iniciarSesion(usuario) {
  if (!usuario) return;
  const acceso = new Date().toLocaleString();
  localStorage.setItem("usuarioActivo", JSON.stringify(usuario));
  localStorage.setItem("ultimoMovimiento", Date.now());
  localStorage.setItem("ultimoAcceso", acceso);
  window.location.href = "index.html";
}

function mostrarMensajeGen(texto, exito = false, idOpcional = null) {
  const ids = idOpcional ? [idOpcional] : ['message', 'mensaje', 'loginMensaje'];
  let el = null;
  for (const id of ids) {
    el = document.getElementById(id);
    if (el) break;
  }
  if (!el) return;
  el.textContent = texto;
  el.className = 'mensaje' + (exito ? ' exito' : '');
}

function renderTablaUsuarios() {
  const tbody = document.querySelector("#tablaUsuarios tbody");
  if (!tbody) return;

  tbody.innerHTML = ''; 

  
  usuarios.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.email}</td>
      <td>Usuario</td> 
    `; 
    tbody.appendChild(tr);
  });
}

function initAdminUsuarios() {
  const form = document.getElementById("formCrearUsuario");
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const email = (emailInput?.value || '').trim();
    const password = (passwordInput?.value || '');

    if (!email || !password) {
      mostrarMensajeGen("Completa todos los campos", false, "mensaje");
      return;
    }

    
    if (usuarios.find(u => u.email === email)) {
      mostrarMensajeGen("El email ya está en uso", false, "mensaje");
      return;
    }

    
    const nuevoUsuario = { 
      email, 
      password, 
      nombre: "Nuevo", 
      apellidos: "Admin", 
      intentos: 0, 
      bloqueado: false 
    };
    usuarios.push(nuevoUsuario); 

    mostrarMensajeGen("Usuario creado con éxito", true, "mensaje");
    form.reset(); 

    
    renderTablaUsuarios(); 
  });
}

function initRegistro() {
  const formRegistro = document.getElementById("formRegistro");
  if (!formRegistro) return;

  formRegistro.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = (document.getElementById("email")?.value || '').trim();
    const password = document.getElementById("password")?.value || '';

    if (!email || !password) {
      mostrarMensajeGen("Completa todos los campos", false, "mensaje");
      return;
    }
    if (usuarios.find(u => u.email === email)) {
      mostrarMensajeGen("El email ya está en uso", false, "mensaje");
      return;
    }
    const regexPassword = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regexPassword.test(password)) {
      mostrarMensajeGen("La contraseña debe tener al menos 8 caracteres, una mayúscula y un número", false, "mensaje");
      return;
    }

    const nuevoUsuario = { email, password, nombre: "Nuevo", apellidos: "Usuario", intentos: 0, bloqueado: false };
    usuarios.push(nuevoUsuario);
    mostrarMensajeGen(`Registro exitoso. Redirigiendo...`, true, "mensaje");
    formRegistro.reset();
    setTimeout(() => iniciarSesion(nuevoUsuario), 1500);
  });
}

function initLogin() {
  const formLogin = document.getElementById("formLogin");
  if (!formLogin) return;

  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = (document.getElementById("loginEmail")?.value || '').trim();
    const password = document.getElementById("loginPassword")?.value || '';
    const mensajeEl = document.getElementById("loginMensaje");

    if (!email || !password) {
      if (mensajeEl) {
        mensajeEl.textContent = "Completa todos los campos";
        mensajeEl.className = 'mensaje';
      }
      return;
    }

    const usuario = usuarios.find(u => u.email === email);
    const localPass = localStorage.getItem('user_' + email);

    if (!usuario && !localPass) {
      if (mensajeEl) mensajeEl.textContent = "Usuario no encontrado";
      return;
    }

    if (usuario?.bloqueado) {
      if (mensajeEl) mensajeEl.textContent = "Cuenta temporalmente bloqueada";
      return;
    }

    if ((usuario && usuario.password === password) || (localPass && localPass === password)) {
      const userObj = usuario || { email, password, nombre: "Usuario", apellidos: "", intentos: 0, bloqueado: false };
      if (mensajeEl) {
        mensajeEl.textContent = "Ingreso exitoso. Redirigiendo...";
        mensajeEl.className = 'mensaje exito';
      }
      if (usuario) usuario.intentos = 0;
      setTimeout(() => iniciarSesion(userObj), 900);
      return;
    }

    if (usuario) {
      usuario.intentos++;
      if (usuario.intentos >= 5) {
        usuario.bloqueado = true;
        if (mensajeEl) mensajeEl.textContent = "Cuenta temporalmente bloqueada";
      } else {
        if (mensajeEl) mensajeEl.textContent = `Credenciales incorrectas (intento ${usuario.intentos}/5)`;
      }
      if (mensajeEl) mensajeEl.className = 'mensaje';
      return;
    }

    if (mensajeEl) {
      mensajeEl.textContent = "Credenciales incorrectas";
      mensajeEl.className = 'mensaje';
    }
  });
}

let tokenGenerado = null;
let tokenCreacion = null;

function initRecuperar() {
  const requestBtn = document.querySelector('#request-section button');
  const tokenBtn = document.querySelector('#token-section button');
  if (requestBtn) requestBtn.addEventListener('click', solicitarToken);
  if (tokenBtn) tokenBtn.addEventListener('click', recuperarPassword);
}

function solicitarToken() {
  const email = (document.getElementById('email')?.value || '').trim();
  if (!email) {
    mostrarMensajeGen('Ingresa un email válido', false, 'message');
    return;
  }
  tokenGenerado = Math.random().toString(36).slice(2, 8).toUpperCase();
  tokenCreacion = Date.now();
  mostrarMensajeGen('Token simulado (revisa consola): ' + tokenGenerado, true, 'message');
  console.log("Token para", email, ":", tokenGenerado);
  const req = document.getElementById('request-section');
  const tok = document.getElementById('token-section');
  if (req) req.style.display = 'none';
  if (tok) tok.style.display = 'block';
}

function recuperarPassword() {
  const tokenIngresado = (document.getElementById('token')?.value || '').trim();
  const nuevaClave = document.getElementById('new-password')?.value || '';
  const tiempoActual = Date.now();

  if (!tokenIngresado || !nuevaClave) {
    mostrarMensajeGen('Completa todos los campos', false, 'message');
    return;
  }
  const tiempoExpiracion = 20 * 60 * 1000; // 20 min
  if (tokenIngresado !== tokenGenerado) {
    mostrarMensajeGen('Token incorrecto', false, 'message');
    return;
  }
  if ((tiempoActual - tokenCreacion) > tiempoExpiracion) {
    mostrarMensajeGen('El token ha expirado', false, 'message');
    return;
  }

  const email = (document.getElementById('email')?.value || '').trim();
  localStorage.setItem('user_' + email, nuevaClave); // Guarda la nueva clave en local
  mostrarMensajeGen('Contraseña restablecida con éxito. Ahora puedes iniciar sesión.', true, 'message');
  const tok = document.getElementById('token-section');
  if (tok) tok.style.display = 'none';
}

/* ==================================
   LÓGICA DE CARRITO Y PRODUCTOS
   ================================== */

function getCarrito() {
  return JSON.parse(localStorage.getItem('carrito')) || [];
}

function saveCarrito(arr) {
  localStorage.setItem('carrito', JSON.stringify(arr));
}

function addToCartById(id) {
  const prod = productos.find(p => p.id === id);
  if (!prod) return;

  const carrito = getCarrito();
  carrito.push({ ...prod });
  saveCarrito(carrito);
  updateCartUI();
  updateCartCount();
  
}

function renderProductos() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  grid.innerHTML = '';
  
  const categorias = [];
  if (document.getElementById('cat1')?.checked) categorias.push('Platos Principales');
  if (document.getElementById('cat2')?.checked) categorias.push('Aperitivos');
  if (document.getElementById('cat3')?.checked) categorias.push('Postres');
  if (document.getElementById('cat4')?.checked) categorias.push('Bebidas');

  const filtrados = categorias.length ? productos.filter(p => categorias.includes(p.categoria)) : productos;

  filtrados.forEach((prod) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.dataset.id = prod.id; 
    card.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}">
      <div class="product-card-content">
        <h3>${prod.nombre}</h3>
        <p>${prod.descripcion}</p>
        <div class="product-card-footer">
          <span class="product-price">$${fmt(prod.precio)}</span>
          <button class="btn-add-cart" data-id="${prod.id}">Agregar</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function updateCartUI() {
  const lista = document.getElementById('carritoLista');
  const totalSpan = document.getElementById('carritoTotal');
  if (!lista || !totalSpan) return; 

  const carrito = getCarrito();
  lista.innerHTML = '';
  let total = 0;
  carrito.forEach((prod, i) => {
    const li = document.createElement('li');
    li.className = 'carrito-item';
    li.innerHTML = `
      <span class="item-name">${prod.nombre}</span>
      <span class="item-price">$${fmt(prod.precio)}</span>
      <button class="item-remove" data-index="${i}">X</button>
    `;
    lista.appendChild(li);
    total += prod.precio;
  });

  lista.querySelectorAll('.item-remove').forEach(btn => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.index);
      const carrito = getCarrito();
      carrito.splice(idx, 1);
      saveCarrito(carrito);
      updateCartUI();
      updateCartCount();
    };
  });

  if (totalSpan) totalSpan.textContent = fmt(total);
}

function updateCartCount() {
  const cantidadSpan = document.getElementById('cantidadCarrito');
  if (!cantidadSpan) return;
  const carrito = getCarrito();
  cantidadSpan.textContent = carrito.length;
}

function initGenerarPedido() {
  const contenedor = document.getElementById('productosCarrito');
  const totalEl = document.getElementById('totalCarrito');
  const mensaje = document.getElementById('mensajePago');
  const boton = document.getElementById('finalizarPago');
  const botonAnular = document.getElementById('anularPago');
  if (!contenedor || !totalEl || !boton) return;

  contenedor.innerHTML = '';
  const productosCarrito = getCarrito();
  let total = 0;
  if (productosCarrito.length === 0) {
    contenedor.innerHTML = "<p>No hay productos en el carrito.</p>";
    boton.disabled = true;
    if (botonAnular) botonAnular.style.display = 'none';
    
    totalEl.textContent = `Total: $${fmt(0)}`;
    return;
  }

  productosCarrito.forEach(p => {
    const div = document.createElement('div');
    div.className = 'producto';
    
    div.innerHTML = `<span>${p.nombre}</span> <span>$${fmt(p.precio)}</span>`;
    contenedor.appendChild(div);
    total += p.precio;
  });
  
  totalEl.textContent = `Total: $${fmt(total)}`;

  let pagoTimeout = null;
  boton.onclick = () => {
    if (mensaje) mensaje.textContent = "Procesando pago...";
    boton.disabled = true;
    if (botonAnular) botonAnular.style.display = 'inline-block';

    pagoTimeout = setTimeout(() => {
      if (mensaje) mensaje.textContent = "¡Pago exitoso! Redirigiendo...";
      if (botonAnular) botonAnular.style.display = 'none';
      saveCarrito([]); 
      updateCartCount();
      
      setTimeout(() => window.location.href = 'historialpedidos.html', 1500);
    }, 3000);
  };

  if (botonAnular) {
    botonAnular.onclick = () => {
      if (pagoTimeout) clearTimeout(pagoTimeout);
      if (mensaje) mensaje.textContent = "Compra cancelada.";
      boton.disabled = false;
      botonAnular.style.display = 'none';
    };
  }
}

function initDashboard() {
  const ctx = document.getElementById('graficoVentas');
  
  if (!ctx || typeof Chart === 'undefined') return;

  try {
    const labels = pedidosDemo.map(p => `Venta #${p.numero}`);
    const data = pedidosDemo.map(p => p.total);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Total por venta ($)', data, backgroundColor: '#ff6b00', borderRadius: 6 }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });

    const prodCount = {};
    pedidosDemo.forEach(p => p.productos.forEach((prod, idx) => prodCount[prod] = (prodCount[prod] || 0) + (p.cantidades[idx] || 0)));
    const ul = document.getElementById('productosMasVendidos');
    if (ul) {
      ul.innerHTML = '';
      Object.entries(prodCount).sort((a, b) => b[1] - a[1]).forEach(([nombre, cant]) => {
        const li = document.createElement('li');
        li.textContent = `${nombre}: ${cant} unidades`;
        ul.appendChild(li);
      });
    }
  } catch (err) {
    console.error('Error inicializando dashboard:', err);
  }
}

function initOrdenesDespacho() {
  const seccion = document.querySelector('.estado-section');
  if (!seccion) return;
  
}

function initHistorial() {
  const cont = document.getElementById('historial');
  if (!cont) return;
  
  const demo = [
    { id: 301, items: ['Hummus', 'Baklava'], total: 21490, fecha: '2025-09-01' },
    { id: 302, items: ['Shawarma'], total: 18750, fecha: '2025-09-03' }
  ];
  cont.innerHTML = '';
  demo.forEach(p => {
    const card = document.createElement('div');
    card.className = 'pedido';
    
    card.innerHTML = `<p><strong>Pedido #${p.id}</strong> - ${p.fecha}</p><p>Items: ${p.items.join(', ')}</p><p>Total: $${fmt(p.total)}</p>`;
    cont.appendChild(card);
  });
}

function initPerfil() {
  const nombreEl = document.getElementById('nombre');
  const apellidosEl = document.getElementById('apellidos');
  const emailEl = document.getElementById('email');
  const ultimoAccesoEl = document.getElementById('ultimoAcceso');
  const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo'));
  if (!usuarioActivo) return;
  if (nombreEl) nombreEl.textContent = usuarioActivo.nombre || '';
  if (apellidosEl) apellidosEl.textContent = usuarioActivo.apellidos || '';
  if (emailEl) emailEl.textContent = usuarioActivo.email || '';
  if (ultimoAccesoEl) ultimoAccesoEl.textContent = localStorage.getItem('ultimoAcceso') || '';
}


document.addEventListener('DOMContentLoaded', () => {
  try {
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.getElementById('navToggle');
    const navClose = document.getElementById('navClose');

    if (navToggle) {
      navToggle.addEventListener('click', () => navMenu.classList.add('nav-active'));
    }
    if (navClose) {
      navClose.addEventListener('click', () => navMenu.classList.remove('nav-active'));
    }

    const modal = document.getElementById('modalProducto');
    const closeModalBtn = document.getElementById('cerrarModal');
    const productGrid = document.getElementById('productsGrid');
    const btnAgregarModal = document.getElementById('agregarCarrito');

    
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
    }
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }

    
    if (btnAgregarModal) {
      btnAgregarModal.addEventListener('click', () => {
        const id = parseInt(btnAgregarModal.dataset.id);
        if (id) {
          addToCartById(id);
          modal.classList.remove('active');
        }
      });
    }

    
    if (productGrid) {
      productGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        if (!card) return;

        const id = parseInt(card.dataset.id);
        const producto = productos.find(p => p.id === id);
        if (!producto) return;

        
        if (e.target.closest('.btn-add-cart')) {
          addToCartById(id);
          return;
        }

        
        document.getElementById('nombreProducto').textContent = producto.nombre;
        document.getElementById('descripcionProducto').textContent = producto.descripcion;
        
        document.getElementById('precioProducto').textContent = fmt(producto.precio);
        document.getElementById('stockProducto').textContent = producto.stock > 0 ? `Disponible (${producto.stock})` : 'Agotado';
        
        
        btnAgregarModal.dataset.id = producto.id;
        
        modal.classList.add('active');
      });
    }

    initRegistro();
    initLogin();
    initRecuperar();

    renderTablaUsuarios(); 
    initAdminUsuarios();   
    
    renderProductos();
    
    updateCartUI();
    updateCartCount();

    ['cat1', 'cat2', 'cat3', 'cat4'].forEach(id => {
      const cb = document.getElementById(id);
      if (cb) cb.addEventListener('change', renderProductos);
    });

    const btnCarrito = document.getElementById('verCarrito');
    if (btnCarrito) {
      btnCarrito.onclick = () => window.location.href = 'generarpedido.html';
    }

    const btnPagarSidebar = document.getElementById('pagarSidebar');
    if (btnPagarSidebar) {
      btnPagarSidebar.onclick = () => window.location.href = 'generarpedido.html';
    }

    
    initGenerarPedido();

   
    initDashboard();

   
    initOrdenesDespacho();
    initHistorial();
    initPerfil();

    
    window.addEventListener('storage', (e) => {
      if (e.key === 'carrito') {
        updateCartUI();
        updateCartCount();
      }
    });

  } catch (err) {
    console.error('Error fatal inicializando la app:', err);
  }
});
