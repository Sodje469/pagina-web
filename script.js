
// ====== Usuarios simulados ======
const usuarios = [
  { email: "ana@example.com", password: "Clave2025", nombre: "Ana", apellidos: "García", intentos: 0, bloqueado: false }
];

// ====== Función: guardar sesión ======
function iniciarSesion(usuario) {
  const acceso = new Date().toLocaleString();
  localStorage.setItem("usuarioActivo", JSON.stringify(usuario));
  localStorage.setItem("ultimoMovimiento", Date.now());
  localStorage.setItem("ultimoAcceso", acceso);
  window.location.href = "index.html";
}

// ====== Registro ======
const formRegistro = document.getElementById("formRegistro");
if (formRegistro) {
  formRegistro.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const mensaje = document.getElementById("mensaje");

    if (usuarios.find(u => u.email === email)) {
      mensaje.textContent = "El email ya está en uso";
      mensaje.classList.remove("exito");
      return;
    }

    const regexPassword = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regexPassword.test(password)) {
      mensaje.textContent = "La contraseña no cumple los requisitos";
      mensaje.classList.remove("exito");
      return;
    }

    const nuevoUsuario = { email, password, nombre: "Nuevo", apellidos: "Usuario", intentos: 0, bloqueado: false };
    usuarios.push(nuevoUsuario);

    mensaje.classList.add("exito");
    mensaje.innerHTML = `
      Registro exitoso!<br>
      Email: <strong>${nuevoUsuario.email}</strong><br>
      Contraseña: <strong>${nuevoUsuario.password}</strong><br>
      Redirigiendo a la página principal...
    `;

    formRegistro.reset();
    setTimeout(() => iniciarSesion(nuevoUsuario), 2000);
  });
}

// ====== Login ======
const formLogin = document.getElementById("formLogin");
if (formLogin) {
  formLogin.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const mensaje = document.getElementById("loginMensaje");

    const usuario = usuarios.find(u => u.email === email);
    const localPass = localStorage.getItem('user_' + email);

    if (!usuario && !localPass) {
      mensaje.textContent = "Usuario no encontrado";
      return;
    }

    if (usuario && usuario.bloqueado) {
      mensaje.textContent = "Cuenta temporalmente bloqueada";
      return;
    }

    if (usuario && usuario.password === password) {
      usuario.intentos = 0;
      mensaje.textContent = "Ingreso exitoso. Redirigiendo...";
      mensaje.classList.add("exito");
      setTimeout(() => iniciarSesion(usuario), 1500);
      return;
    }

    if (localPass && localPass === password) {
      const userObj = usuario || { email, password, nombre: "Usuario", apellidos: "", intentos: 0, bloqueado: false };
      mensaje.textContent = "Ingreso exitoso. Redirigiendo...";
      mensaje.classList.add("exito");
      setTimeout(() => iniciarSesion(userObj), 1500);
      return;
    }

    if (usuario) {
      usuario.intentos++;
      if (usuario.intentos >= 5) {
        usuario.bloqueado = true;
        mensaje.textContent = "Cuenta temporalmente bloqueada";
      } else {
        mensaje.textContent = `Credenciales incorrectas (intento ${usuario.intentos}/5)`;
      }
      mensaje.classList.remove("exito");
      return;
    }

    mensaje.textContent = "Credenciales incorrectas";
    mensaje.classList.remove("exito");
  });
}

// ====== Recuperar contraseña ======
let tokenGenerado = null;
let tokenCreacion = null;

function solicitarToken() {
  const email = document.getElementById('email').value;
  if (!email) {
    mostrarMensaje('Ingresa un email válido', false);
    return;
  }
  tokenGenerado = 'ABC123';
  tokenCreacion = new Date().getTime();
  mostrarMensaje('Token enviado a tu correo (simulado)', true);
  document.getElementById('request-section').style.display = 'none';
  document.getElementById('token-section').style.display = 'block';
}

function recuperarPassword() {
  const tokenIngresado = document.getElementById('token').value;
  const nuevaClave = document.getElementById('new-password').value;
  const tiempoActual = new Date().getTime();

  if (!tokenIngresado || !nuevaClave) {
    mostrarMensaje('Completa todos los campos', false);
    return;
  }

  const tiempoExpiracion = 20 * 60 * 1000;
  if (tokenIngresado !== tokenGenerado) {
    mostrarMensaje('Token incorrecto', false);
  } else if ((tiempoActual - tokenCreacion) > tiempoExpiracion) {
    mostrarMensaje('El enlace ha expirado', false);
  } else {
    const email = document.getElementById('email').value;
    localStorage.setItem('user_' + email, nuevaClave);
    mostrarMensaje('Contraseña restablecida con éxito. Ahora puedes iniciar sesión.', true);
    document.getElementById('token-section').style.display = 'none';
  }
}

function mostrarMensaje(texto, exito) {
  const msgDiv = document.getElementById('message');
  msgDiv.innerText = texto;
  msgDiv.className = 'mensaje' + (exito ? ' exito' : '');
}

// ====== Renderizado de productos ======
if (typeof productos !== "undefined") {
  productos.forEach(p => p.stock = Math.floor(Math.random() * 20) + 1); // stock aleatorio

  function renderProductos() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const categorias = [];
    ['cat1', 'cat2', 'cat3', 'cat4'].forEach(id => {
      const checkbox = document.getElementById(id);
      if (checkbox && checkbox.checked) {
        const nombreCat = checkbox.dataset.nombre || checkbox.value;
        categorias.push(nombreCat);
      }
    });

    const filtrados = categorias.length > 0
      ? productos.filter(p => categorias.includes(p.categoria))
      : productos;

    filtrados.forEach(producto => {
      const card = document.createElement('div');
      card.classList.add('product-card');
      card.innerHTML = `
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <h3>${producto.nombre}</h3>
        <p>$${producto.precio.toFixed(2)}</p>
      `;
      card.addEventListener('click', () => abrirModal(producto));
      grid.appendChild(card);
    });
  }

  function abrirModal(producto) {
    document.getElementById('modalNombre').textContent = producto.nombre;
    document.getElementById('modalDescripcion').textContent = producto.descripcion;
    document.getElementById('modalPrecio').textContent = producto.precio.toFixed(2);
    document.getElementById('modalStock').textContent = producto.stock;
    document.getElementById('productModal').style.display = 'block';
  }

  const modal = document.getElementById('productModal');
  const closeBtn = document.querySelector('.close');
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  renderProductos();
  ['cat1', 'cat2', 'cat3', 'cat4'].forEach(id => {
    const checkbox = document.getElementById(id);
    if (checkbox) checkbox.addEventListener('change', renderProductos);
  });
}

// ====== Dashboard / Reporte de ventas ======
const pedidos = [
  { numero: 101, productos: ['Hummus', 'Falafel'], cantidades: [2, 1], total: 40.99 },
  { numero: 102, productos: ['Shawarma', 'Té Árabe'], cantidades: [1, 2], total: 30.50 },
  { numero: 103, productos: ['Kebab', 'Baklava'], cantidades: [2, 3], total: 70.25 },
  { numero: 104, productos: ['Mansaf'], cantidades: [1], total: 28.75 },
  { numero: 105, productos: ['Tabule', 'Baba Ganoush'], cantidades: [1, 2], total: 42.25 }
];

const ctx = document.getElementById('graficoVentas');
if (ctx) {
  const labels = pedidos.map(p => `Venta #${p.numero}`);
  const data = pedidos.map(p => p.total);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Total por venta ($)',
        data,
        backgroundColor: '#ff6600',
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: { top: 10, bottom: 10 } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 10 } } }
    }
  });

  const prodCount = {};
  pedidos.forEach(p => {
    p.productos.forEach((prod, idx) => {
      const cantidad = p.cantidades[idx];
      prodCount[prod] = (prodCount[prod] || 0) + cantidad;
    });
  });

  const prodList = Object.entries(prodCount).sort((a, b) => b[1] - a[1]);
  const ul = document.getElementById('productosMasVendidos');
  if (ul) {
    prodList.forEach(([nombre, cant]) => {
      const li = document.createElement('li');
      li.textContent = `${nombre}: ${cant} unidades`;
      ul.appendChild(li);
    });
  }

  const volverBtn = document.getElementById('volverReporte');
  if (volverBtn) {
    volverBtn.addEventListener('click', () => window.location.href = 'reporteVentas.html');
  }
}
