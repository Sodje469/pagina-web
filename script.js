const API_URL = 'http://127.0.0.1:5000/api';

const fmt = v => new Intl.NumberFormat('es-CL').format(Math.round(v));

let productos = [];

/**
 * Obtiene los encabezados de autenticación para las peticiones a la API.
 * @returns {HeadersInit} Encabezados con el token JWT si existe.
 */
function getAuthHeaders() {
  const token = localStorage.getItem('tokenAuth');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
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


function initRegistro() {
  const formRegistro = document.getElementById("formRegistro");
  if (!formRegistro) return;

  formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;

    try {
      
      const resRegistro = await fetch(`${API_URL}/auth/registrar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, password })
      });

      const dataRegistro = await resRegistro.json();

      if (!resRegistro.ok) {
        mostrarMensajeGen(dataRegistro.mensaje, false, "mensaje");
        return;
      }

      
      mostrarMensajeGen("Registro exitoso. Iniciando sesión...", true, "mensaje");
      
      const resLogin = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, password })
      });

      const dataLogin = await resLogin.json();

      if (!resLogin.ok) {
        
        mostrarMensajeGen("Registro exitoso. Por favor, inicia sesión.", true, "mensaje");
        setTimeout(() => window.location.href = 'login.html', 1500);
      } else {
       
        localStorage.setItem("tokenAuth", dataLogin.token);
        localStorage.setItem("usuarioActivo", JSON.stringify(dataLogin.usuario));
        localStorage.setItem("ultimoAcceso", new Date().toLocaleString());
        window.location.href = "index.html";
      }

    } catch (error) {
      console.error('Error en el registro:', error);
      mostrarMensajeGen("Error de conexión con el servidor.", false, "mensaje");
    }
  });
}

function initLogin() {
  const formLogin = document.getElementById("formLogin");
  if (!formLogin) return;

  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail")?.value.trim();
    const password = document.getElementById("loginPassword")?.value;

    if (!email || !password) {
      mostrarMensajeGen("Completa todos los campos", false, "loginMensaje");
      return;
    }

    try {
      const respuesta = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, password })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        mostrarMensajeGen(datos.mensaje, false, "loginMensaje");
      } else {
        localStorage.setItem("tokenAuth", datos.token);
        localStorage.setItem("usuarioActivo", JSON.stringify(datos.usuario));
        localStorage.setItem("ultimoAcceso", new Date().toLocaleString());
        
        mostrarMensajeGen("Ingreso exitoso. Redirigiendo...", true, "loginMensaje");
        setTimeout(() => window.location.href = 'index.html', 900);
      }
    } catch (error) {
      console.error('Error de red:', error);
      mostrarMensajeGen("Error de conexión con el servidor.", false, "loginMensaje");
    }
  });
}


async function solicitarToken() {
  const email = document.getElementById('email')?.value.trim();
  if (!email) {
    mostrarMensajeGen('Ingresa un email válido', false, 'message');
    return;
  }

  try {
    const respuesta = await fetch(`${API_URL}/auth/recuperar/solicitar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email })
    });
    
    const datos = await respuesta.json();
    
    if (!respuesta.ok) {
      mostrarMensajeGen(datos.mensaje, false, 'message');
    } else {
      
      mostrarMensajeGen(`Token simulado (revisa consola): ${datos.token_simulado}`, true, 'message');
      console.log("Token para", email, ":", datos.token_simulado);
      
      document.getElementById('request-section').style.display = 'none';
      document.getElementById('token-section').style.display = 'block';
    }
  } catch (error) {
    mostrarMensajeGen('Error de conexión con el servidor.', false, 'message');
  }
}
window.solicitarToken = solicitarToken; 


async function recuperarPassword() {
  const email = document.getElementById('email')?.value.trim();
  const tokenIngresado = document.getElementById('token')?.value.trim();
  const nuevaClave = document.getElementById('new-password')?.value;

  if (!tokenIngresado || !nuevaClave || !email) {
    mostrarMensajeGen('Completa todos los campos', false, 'message');
    return;
  }

  try {
    const respuesta = await fetch(`${API_URL}/auth/recuperar/validar`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, token: tokenIngresado, nueva_clave: nuevaClave })
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      mostrarMensajeGen(datos.mensaje, false, 'message');
    } else {
      mostrarMensajeGen('Contraseña restablecida con éxito. Ahora puedes iniciar sesión.', true, 'message');
      document.getElementById('token-section').style.display = 'none';
    }
  } catch (error) {
    mostrarMensajeGen('Error de conexión con el servidor.', false, 'message');
  }
}
window.recuperarPassword = recuperarPassword; 


function getCarrito() {
  return JSON.parse(localStorage.getItem('carrito')) || [];
}

function saveCarrito(arr) {
  localStorage.setItem('carrito', JSON.stringify(arr));
}


async function cargarProductos() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return; 

  try {
    const respuesta = await fetch(`${API_URL}/productos`);
    if (!respuesta.ok) throw new Error('No se pudieron cargar los productos');
    
    productos = await respuesta.json(); 
    renderProductos(); 
  } catch (error) {
    console.error('Error al cargar productos:', error);
    grid.innerHTML = '<p>Error al cargar productos. Intenta recargar la página.</p>';
  }
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


function addToCartById(id) {
  const prod = productos.find(p => p.id === id); 
  if (!prod) return;

  const carrito = getCarrito();
  carrito.push({ ...prod });
  saveCarrito(carrito);
  updateCartUI();
  updateCartCount();
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


let pagoController = null;


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

  boton.onclick = async () => {
    mensaje.textContent = "Procesando pago...";
    boton.disabled = true;
    if (botonAnular) botonAnular.style.display = 'inline-block';

    const itemsAgrupados = {};
    getCarrito().forEach(p => {
      itemsAgrupados[p.id] = (itemsAgrupados[p.id] || 0) + 1;
    });
    const itemsParaAPI = Object.keys(itemsAgrupados).map(id => ({ 
      id: parseInt(id), 
      cantidad: itemsAgrupados[id] 
    }));

    
    pagoController = new AbortController();
    const signal = pagoController.signal;

    try {
      const respuesta = await fetch(`${API_URL}/pedidos/crear`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ items: itemsParaAPI }),
        signal: signal 
      });
      
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        
        mostrarMensajeGen(datos.mensaje, false, "mensajePago");
        boton.disabled = false;
        if (botonAnular) botonAnular.style.display = 'none';
      } else {
        
        mostrarMensajeGen("¡Pago exitoso! Redirigiendo...", true, "mensajePago");
        if (botonAnular) botonAnular.style.display = 'none';
        saveCarrito([]); 
        updateCartCount();
        
        setTimeout(() => window.location.href = 'historialpedidos.html', 1500);
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        
        mostrarMensajeGen("Compra cancelada.", false, "mensajePago");
      } else {
        console.error('Error al crear pedido:', error);
        mostrarMensajeGen("Error de conexión. Intente de nuevo.", false, "mensajePago");
      }
      boton.disabled = false;
      if (botonAnular) botonAnular.style.display = 'none';
    }
  };

  
  if (botonAnular) {
    botonAnular.onclick = () => {
      if (pagoController) {
        pagoController.abort(); 
      }
      boton.disabled = false;
      botonAnular.style.display = 'none';
    };
  }
}


async function initDashboard() {
  const ctx = document.getElementById('graficoVentas');
  const ul = document.getElementById('productosMasVendidos');
  if (!ctx || !ul || typeof Chart === 'undefined') return;

  try {
    const respuesta = await fetch(`${API_URL}/admin/metricas`, { headers: getAuthHeaders() });
    if (!respuesta.ok) throw new Error('No autorizado o error del servidor');
    
    const datos = await respuesta.json();

    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: datos.ventas_por_pedido.labels,
        datasets: [{ 
          label: 'Total por venta ($)', 
          data: datos.ventas_por_pedido.data, 
          backgroundColor: '#ff6b00', 
          borderRadius: 6 
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });

    
    ul.innerHTML = '';
    datos.productos_mas_vendidos.forEach(texto => {
      const li = document.createElement('li');
      li.textContent = texto;
      ul.appendChild(li);
    });

  } catch (err) {
    console.error('Error inicializando dashboard:', err);
    document.querySelector('.metricas-content').innerHTML = "<p>Error al cargar métricas. Verifique su sesión.</p>";
  }
}


async function initOrdenesDespacho() {
  const seccion = document.querySelector('.estado-section');
  const tablaBody = document.querySelector('#tablaOrdenes tbody');
  if (!seccion || !tablaBody) return;

  try {
    const respuesta = await fetch(`${API_URL}/admin/ordenes-despacho`, { headers: getAuthHeaders() });
    if (!respuesta.ok) throw new Error('No autorizado o error del servidor');
    
    const datos = await respuesta.json();

    
    const { tarjetas_estado, tabla_ordenes } = datos;
    const ulPendientes = document.querySelector('#pendientes ul');
    const ulPreparacion = document.querySelector('#preparacion ul');
    const ulCamino = document.querySelector('#camino ul');
    const ulEntregadas = document.querySelector('#entregadas ul');

    ulPendientes.innerHTML = tarjetas_estado.pendientes.map(txt => `<li>${txt}</li>`).join('');
    ulPreparacion.innerHTML = tarjetas_estado.preparacion.map(txt => `<li>${txt}</li>`).join('');
    ulCamino.innerHTML = tarjetas_estado.camino.map(txt => `<li>${txt}</li>`).join('');
    ulEntregadas.innerHTML = tarjetas_estado.entregadas.map(txt => `<li>${txt}</li>`).join('');
    
    tablaBody.innerHTML = '';
    tabla_ordenes.forEach(orden => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${orden.cliente}</td>
        <td>${orden.ubicacion}</td>
        <td>${fmt(orden.total)}</td>
        <td>${orden.estado}</td>
      `;
      tablaBody.appendChild(tr);
    });

  } catch (err) {
    console.error('Error cargando órdenes:', err);
    seccion.innerHTML = "<p>Error al cargar órdenes. Verifique su sesión.</p>";
  }
}

async function initHistorial() {
  const cont = document.getElementById('historial');
  if (!cont) return;

  try {
    const respuesta = await fetch(`${API_URL}/usuario/historial-pedidos`, { headers: getAuthHeaders() });
    if (!respuesta.ok) throw new Error('No autorizado o error del servidor');

    const historial = await respuesta.json();
    cont.innerHTML = '';

    if (historial.length === 0) {
      cont.innerHTML = '<p>Aún no has realizado ningún pedido.</p>';
      return;
    }

    historial.forEach(p => {
      const card = document.createElement('div');
      card.className = 'pedido';
      card.innerHTML = `
        <p><strong>Pedido #${p.id}</strong> - ${p.fecha}</p>
        <p>Items: ${p.items.join(', ')}</p>
        <p>Total: $${fmt(p.total)}</p>
      `;
      cont.appendChild(card);
    });

  } catch (err) {
    console.error('Error cargando historial:', err);
    cont.innerHTML = "<p>Error al cargar tu historial. Inicia sesión de nuevo.</p>";
  }
}


async function initPerfil() {
  const nombreEl = document.getElementById('nombre');
  if (!nombreEl) return; 

  try {
    const respuesta = await fetch(`${API_URL}/usuario/perfil`, { headers: getAuthHeaders() });
    if (!respuesta.ok) throw new Error('No autorizado o error del servidor');

    const perfil = await respuesta.json();
    
    document.getElementById('nombre').textContent = perfil.nombre || '';
    document.getElementById('apellidos').textContent = perfil.apellidos || '';
    document.getElementById('email').textContent = perfil.email || '';
    document.getElementById('ultimoAcceso').textContent = localStorage.getItem('ultimoAcceso') || '';

  } catch (err) {
    console.error('Error cargando perfil:', err);
    document.querySelector('.perfil-info').innerHTML = "<p>Error al cargar tu perfil. Inicia sesión de nuevo.</p>";
  }
}


async function renderTablaUsuarios() {
  const tbody = document.querySelector("#tablaUsuarios tbody");
  if (!tbody) return;

  try {
    const respuesta = await fetch(`${API_URL}/admin/usuarios`, { headers: getAuthHeaders() });
    if (!respuesta.ok) throw new Error('No autorizado o error del servidor');
    
    const usuarios = await respuesta.json();
    
    tbody.innerHTML = '';
    usuarios.forEach(user => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${user.email}</td>
        <td>${user.rol}</td> 
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('Error cargando usuarios:', err);
    tbody.innerHTML = '<tr><td colspan="2">Error al cargar usuarios.</td></tr>';
  }
}

function initAdminUsuarios() {
  const form = document.getElementById("formCrearUsuario");
  if (!form) return;

  
  renderTablaUsuarios(); 

  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const email = (emailInput?.value || '').trim();
    const password = (passwordInput?.value || '');

    if (!email || !password) {
      mostrarMensajeGen("Completa todos los campos", false, "mensaje");
      return;
    }

    try {
      const respuesta = await fetch(`${API_URL}/admin/usuarios/crear`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, password })
      });
      
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        mostrarMensajeGen(datos.mensaje, false, "mensaje");
      } else {
        mostrarMensajeGen("Usuario creado con éxito", true, "mensaje");
        form.reset();
        renderTablaUsuarios(); 
      }
    } catch (error) {
      console.error('Error creando usuario:', error);
      mostrarMensajeGen("Error de conexión al crear usuario.", false, "mensaje");
    }
  });
}


document.addEventListener('DOMContentLoaded', () => {
  
  
  const token = localStorage.getItem('tokenAuth');
  const paginaActual = window.location.pathname.split('/').pop();
  const paginasPublicas = ['login.html', 'registro.html', 'recuperarcontraseña.html', 'index.html', 'productos.html', ''];

  
  if (!token && !paginasPublicas.includes(paginaActual)) {
    window.location.href = 'login.html';
    return; 
  }
  
  
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

    
    const btnCerrarSesion = document.getElementById('cerrarSesion');
    if (btnCerrarSesion) {
      btnCerrarSesion.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('tokenAuth');
        localStorage.removeItem('usuarioActivo');
        localStorage.removeItem('ultimoAcceso');
        localStorage.removeItem('carrito'); 
        window.location.href = 'login.html';
      });
    }

  
    initRegistro();
    initLogin();
    initAdminUsuarios();
    initGenerarPedido();

    
    cargarProductos(); 
    initDashboard();
    initOrdenesDespacho();
    initHistorial();
    initPerfil();
    
    
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
    
    
    window.addEventListener('storage', (e) => {
      if (e.key === 'carrito') {
        updateCartUI();
        updateCartCount();
      }
      if (e.key === 'tokenAuth' && !e.newValue) {
        
        window.location.href = 'login.html';
      }
    });

  } catch (err) {
    console.error('Error fatal inicializando la app:', err);
  }
});
