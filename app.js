// ==========================
// CONFIG
// ==========================
const WHATSAPP_NUMBER = "5491112345678"; // <-- poné tu número (sin +, sin espacios)
const CURRENCY = "ARS";

// ==========================
// DATA (mock) - reemplazable por API
// ==========================
const cars = [
  {
    id: "A1001",
    titulo: "Toyota Corolla XEi",
    marca: "Toyota",
    modelo: "Corolla",
    anio: 2022,
    condicion: "usado",
    precio: 18500000,
    km: 42000,
    transmision: "Automática",
    combustible: "Nafta",
    puertas: 4,
    color: "Blanco",
    ubicacion: "Buenos Aires",
    descripcion: "Excelente estado. Service al día. Cubiertas nuevas. Posible financiación.",
    destacados: ["Financiación", "Garantía", "Único dueño"],
    imagen: "" // si querés, poné URL
  },
  {
    id: "A1002",
    titulo: "Peugeot 208 Allure",
    marca: "Peugeot",
    modelo: "208",
    anio: 2021,
    condicion: "usado",
    precio: 14900000,
    km: 61000,
    transmision: "Manual",
    combustible: "Nafta",
    puertas: 5,
    color: "Gris",
    ubicacion: "La Plata",
    descripcion: "Muy lindo, full multimedia, sensores, impecable de interior.",
    destacados: ["Permuta", "Service al día"],
    imagen: ""
  },
  {
    id: "A1003",
    titulo: "Ford Ranger XLT 4x2",
    marca: "Ford",
    modelo: "Ranger",
    anio: 2023,
    condicion: "nuevo",
    precio: 39900000,
    km: 0,
    transmision: "Automática",
    combustible: "Diésel",
    puertas: 4,
    color: "Azul",
    ubicacion: "CABA",
    descripcion: "Entrega inmediata. Oportunidad. Consultá planes de financiación.",
    destacados: ["0KM", "Financiación", "Entrega inmediata"],
    imagen: ""
  },
  {
    id: "A1004",
    titulo: "Volkswagen Golf Highline",
    marca: "Volkswagen",
    modelo: "Golf",
    anio: 2018,
    condicion: "usado",
    precio: 17500000,
    km: 88000,
    transmision: "Automática",
    combustible: "Nafta",
    puertas: 5,
    color: "Negro",
    ubicacion: "Quilmes",
    descripcion: "Highline, cuero, techo. Muy cuidado.",
    destacados: ["Premium", "Permuta"],
    imagen: ""
  },
  {
    id: "A1005",
    titulo: "Fiat Cronos Precision",
    marca: "Fiat",
    modelo: "Cronos",
    anio: 2024,
    condicion: "nuevo",
    precio: 23990000,
    km: 0,
    transmision: "Manual",
    combustible: "Nafta",
    puertas: 4,
    color: "Rojo",
    ubicacion: "Avellaneda",
    descripcion: "0KM, plan de ahorro / financiación. Consultá stock real.",
    destacados: ["0KM", "Financiación"],
    imagen: ""
  },
  {
    id: "A1006",
    titulo: "Honda HR-V EX",
    marca: "Honda",
    modelo: "HR-V",
    anio: 2020,
    condicion: "usado",
    precio: 21500000,
    km: 53000,
    transmision: "Automática",
    combustible: "Nafta",
    puertas: 5,
    color: "Plata",
    ubicacion: "CABA",
    descripcion: "SUV cómoda, impecable. Lista para transferir.",
    destacados: ["Garantía", "SUV"],
    imagen: ""
  },
];

// ==========================
// HELPERS
// ==========================
const $ = (sel) => document.querySelector(sel);

function formatMoney(n){
  try{
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: CURRENCY,
      maximumFractionDigits: 0
    }).format(n);
  }catch{
    return "$" + (n ?? 0);
  }
}

function normalize(str){
  return (str || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
}

function parseNum(v){
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/[^\d]/g,"").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function makeWhatsAppLink(message){
  const text = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

// ==========================
// UI STATE
// ==========================
let viewMode = "grid"; // grid | list
let lastFiltered = [...cars];

const modalEl = $("#carModal");
const modal = new bootstrap.Modal(modalEl);

// ==========================
// INIT SELECTS / STATS
// ==========================
function initFilters(){
  const brands = [...new Set(cars.map(c => c.marca))].sort((a,b)=>a.localeCompare(b));
  const brandSel = $("#brand");
  brands.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b;
    opt.textContent = b;
    brandSel.appendChild(opt);
  });

  const years = [...new Set(cars.map(c => c.anio))].sort((a,b)=>b-a);
  const yearSel = $("#yearMin");
  years.forEach(y => {
    const opt = document.createElement("option");
    opt.value = String(y);
    opt.textContent = String(y);
    yearSel.appendChild(opt);
  });

  // WhatsApp general
  $("#btnWhatsAppGeneral").href = makeWhatsAppLink("Hola! Quiero consultar por autos disponibles.");
}

function updateHeroStats(){
  $("#statTotal").textContent = String(cars.length);

  const prices = cars.map(c=>c.precio).filter(n=>Number.isFinite(n));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  $("#statMinMax").textContent = `${formatMoney(min)} - ${formatMoney(max)}`;
}

// ==========================
// FILTER LOGIC
// ==========================
function getFilters(){
  const q = $("#q").value.trim();
  const brand = $("#brand").value;
  const yearMin = parseNum($("#yearMin").value);
  const priceMin = parseNum($("#priceMin").value);
  const priceMax = parseNum($("#priceMax").value);
  const sort = $("#sort").value;

  const cond = document.querySelector('input[name="cond"]:checked')?.value ?? "";

  return { q, brand, yearMin, priceMin, priceMax, sort, cond };
}

function applyFilters(){
  const f = getFilters();

  let items = [...cars];

  if (f.cond){
    items = items.filter(c => c.condicion === f.cond);
  }
  if (f.brand){
    items = items.filter(c => c.marca === f.brand);
  }
  if (f.yearMin){
    items = items.filter(c => c.anio >= f.yearMin);
  }
  if (f.priceMin !== null){
    items = items.filter(c => c.precio >= f.priceMin);
  }
  if (f.priceMax !== null){
    items = items.filter(c => c.precio <= f.priceMax);
  }
  if (f.q){
    const nq = normalize(f.q);
    items = items.filter(c => {
      const blob = normalize([
        c.id, c.titulo, c.marca, c.modelo, c.anio, c.transmision,
        c.combustible, c.ubicacion, c.descripcion, (c.destacados||[]).join(" ")
      ].join(" "));
      return blob.includes(nq);
    });
  }

  // Sort
  items = sortCars(items, f.sort);

  lastFiltered = items;
  render(items);
  updateMeta(items.length);

  const empty = $("#empty");
  if (items.length === 0) empty.classList.remove("d-none");
  else empty.classList.add("d-none");
}

function sortCars(items, sort){
  const arr = [...items];
  if (sort === "price-asc") arr.sort((a,b)=>a.precio-b.precio);
  else if (sort === "price-desc") arr.sort((a,b)=>b.precio-a.precio);
  else if (sort === "year-desc") arr.sort((a,b)=>b.anio-a.anio);
  else if (sort === "km-asc") arr.sort((a,b)=>a.km-b.km);
  else {
    // "reco": nuevos primero, luego menor km, luego más nuevos
    arr.sort((a,b)=>{
      const aN = a.condicion === "nuevo" ? 1 : 0;
      const bN = b.condicion === "nuevo" ? 1 : 0;
      if (aN !== bN) return bN - aN;
      if (a.km !== b.km) return a.km - b.km;
      return b.anio - a.anio;
    });
  }
  return arr;
}

// ==========================
// RENDER
// ==========================
function render(items){
  const grid = $("#grid");
  grid.innerHTML = "";

  const wrapperClass = viewMode === "list" ? "catalog-grid list" : "catalog-grid";
  grid.className = wrapperClass;

  items.forEach(car => {
    const card = document.createElement("article");
    card.className = "card-car";
    card.innerHTML = `
      <div class="car-media">
        <div class="tag">${car.condicion === "nuevo" ? "0KM" : "Usado"}</div>
        ${
          car.imagen
            ? `<img src="${car.imagen}" alt="${car.titulo}" style="width:100%;height:100%;object-fit:cover;">`
            : `<div class="ph"><i class="bi bi-image"></i><span>Foto</span></div>`
        }
      </div>

      <div class="card-bodyx">
        <h3 class="car-title h6">${car.titulo}</h3>
        <div class="car-sub">${car.marca} • ${car.anio} • ${car.ubicacion}</div>

        <div class="d-flex align-items-center justify-content-between mt-2">
          <div class="price">${formatMoney(car.precio)}</div>
          <div class="km"><i class="bi bi-speedometer2 me-1"></i>${car.km.toLocaleString("es-AR")} km</div>
        </div>

        <div class="badges">
          <span class="badge-soft"><i class="bi bi-gear-wide-connected"></i>${car.transmision}</span>
          <span class="badge-soft"><i class="bi bi-fuel-pump"></i>${car.combustible}</span>
          <span class="badge-soft"><i class="bi bi-door-open"></i>${car.puertas}p</span>
        </div>
      </div>

      <div class="card-actions">
        <button class="btn btn-outline-light w-100" data-action="detail" data-id="${car.id}">
          <i class="bi bi-card-text me-2"></i> Ver detalle
        </button>
        <button class="btn btn-primary w-100" data-action="consult" data-id="${car.id}">
          <i class="bi bi-chat-dots me-2"></i> Consultar
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function updateMeta(count){
  $("#count").textContent = String(count);
  const prices = lastFiltered.map(c=>c.precio);
  if (count > 0){
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    $("#meta").textContent = `${formatMoney(min)} - ${formatMoney(max)}`;
  } else {
    $("#meta").textContent = "—";
  }
}

// ==========================
// MODAL DETAIL
// ==========================
function openDetail(id, focusConsult=false){
  const car = cars.find(c=>c.id === id);
  if (!car) return;

  $("#mTitle").textContent = car.titulo;
  $("#mSubtitle").textContent = `${car.marca} • ${car.anio} • ${car.ubicacion} • ID ${car.id}`;
  $("#mPrice").textContent = formatMoney(car.precio);
  $("#mCond").textContent = car.condicion === "nuevo" ? "Nuevo (0KM)" : "Usado";

  // media
  const mMedia = $("#mMedia");
  mMedia.innerHTML = car.imagen
    ? `<img src="${car.imagen}" alt="${car.titulo}" style="width:100%;height:100%;object-fit:cover;border-radius:16px;">`
    : `<div class="media-placeholder"><i class="bi bi-image"></i><span>Foto</span></div>`;

  // badges destacados
  const mBadges = $("#mBadges");
  mBadges.innerHTML = "";
  (car.destacados || []).forEach(t => {
    const el = document.createElement("span");
    el.className = "badge-soft";
    el.innerHTML = `<i class="bi bi-star-fill"></i>${t}`;
    mBadges.appendChild(el);
  });

  // specs
  const specs = [
    ["Año", car.anio],
    ["KM", `${car.km.toLocaleString("es-AR")} km`],
    ["Transmisión", car.transmision],
    ["Combustible", car.combustible],
    ["Puertas", car.puertas],
    ["Color", car.color],
    ["Ubicación", car.ubicacion],
    ["Condición", car.condicion === "nuevo" ? "Nuevo (0KM)" : "Usado"],
  ];
  const mSpecs = $("#mSpecs");
  mSpecs.innerHTML = specs.map(([k,v])=>`
    <div class="spec">
      <div class="k">${k}</div>
      <div class="v">${v}</div>
    </div>
  `).join("") + `
    <div class="spec" style="grid-column:1/-1;">
      <div class="k">Descripción</div>
      <div class="v" style="font-weight:700;">${car.descripcion}</div>
    </div>
  `;

  // lead form defaults
  $("#leadCarId").value = car.id;
  $("#leadMsg").value = `Hola! Quiero consultar por el ${car.titulo} (${car.anio}) ID ${car.id}.`;
  $("#leadOk").classList.add("d-none");

  // WhatsApp for this car
  const waMsg = `Hola! Quiero consultar por el ${car.titulo} (${car.anio}) ID ${car.id}. Precio: ${formatMoney(car.precio)}.`;
  $("#mWhatsApp").href = makeWhatsAppLink(waMsg);

  modal.show();

  if (focusConsult){
    setTimeout(()=> $("#leadName").focus(), 350);
  }
}

// ==========================
// EVENTS
// ==========================
function bindEvents(){
  // apply + clear
  $("#btnApply").addEventListener("click", applyFilters);
  $("#btnClear").addEventListener("click", () => { resetFilters(false); applyFilters(); });
  $("#btnReset").addEventListener("click", () => { resetFilters(true); applyFilters(); });
  $("#btnEmptyReset").addEventListener("click", () => { resetFilters(true); applyFilters(); });

  // search live (con debounce)
  let t = null;
  $("#q").addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(applyFilters, 160);
  });

  // quick focus filters
  $("#btnFocusFilters").addEventListener("click", () => {
    $("#filtersPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // scroll top
  $("#btnScrollTop").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // sort changes auto apply
  $("#sort").addEventListener("change", applyFilters);

  // cond/brand/year/price triggers (auto apply)
  document.querySelectorAll('input[name="cond"]').forEach(r => r.addEventListener("change", applyFilters));
  ["brand","yearMin","priceMin","priceMax"].forEach(id => {
    $("#" + id).addEventListener("change", applyFilters);
    $("#" + id).addEventListener("input", () => {
      // input sin spamear
      if (id.startsWith("price")) return;
    });
  });

  // view
  $("#viewGrid").addEventListener("click", () => setView("grid"));
  $("#viewList").addEventListener("click", () => setView("list"));

  // grid button actions (event delegation)
  $("#grid").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (action === "detail") openDetail(id, false);
    if (action === "consult") openDetail(id, true);
  });

  // lead submit (mock)
  $("#leadForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const payload = {
      carId: $("#leadCarId").value,
      name: $("#leadName").value.trim(),
      phone: $("#leadPhone").value.trim(),
      message: $("#leadMsg").value.trim(),
      createdAt: new Date().toISOString()
    };

    if (!payload.name || !payload.phone || !payload.message) return;

    // Guardar en localStorage como demo (reemplazar por fetch a API)
    const key = "leads_concesionaria";
    const prev = JSON.parse(localStorage.getItem(key) || "[]");
    prev.unshift(payload);
    localStorage.setItem(key, JSON.stringify(prev));

    $("#leadOk").classList.remove("d-none");

    // opcional: abrir whatsapp con mensaje + datos
    // window.open(makeWhatsAppLink(`${payload.message}\nNombre: ${payload.name}\nTel: ${payload.phone}`), "_blank");
  });

  // year footer
  $("#yearNow").textContent = String(new Date().getFullYear());
}

function setView(mode){
  viewMode = mode;
  $("#viewGrid").classList.toggle("active", mode === "grid");
  $("#viewList").classList.toggle("active", mode === "list");
  render(lastFiltered);
}

function resetFilters(resetSearch){
  // condición
  $("#condAll").checked = true;
  // selects
  $("#brand").value = "";
  $("#yearMin").value = "";
  // prices
  $("#priceMin").value = "";
  $("#priceMax").value = "";
  // sort
  $("#sort").value = "reco";
  // search
  if (resetSearch) $("#q").value = "";
}

// ==========================
// BOOT
// ==========================
(function boot(){
  initFilters();
  updateHeroStats();
  bindEvents();
  applyFilters(); // first render
})();
