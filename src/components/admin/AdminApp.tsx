"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  DBCategory,
  DBProduct,
  Gender,
  deleteProduct,
  fetchAdminProducts,
  insertProduct,
  updateProduct,
  uploadProductPhotos,
} from "@/lib/products-db";
import { AdminBottleIcon } from "./AdminBottleIcon";

const CATEGORY_LABELS: Record<DBCategory, string> = {
  arabes: "Perfumes Árabes",
  disenador: "Perfumes de Diseñador",
  accesorios: "Accesorios",
  decants: "Decants",
};

const GENDER_LABELS: Record<Gender, string> = {
  hombre: "Hombre",
  mujer: "Mujer",
  unisex: "Unisex",
};

const CATEGORIES: DBCategory[] = ["arabes", "disenador", "accesorios", "decants"];
const GENDER_CATEGORIES: DBCategory[] = ["arabes", "disenador", "decants"];
const SIMPLE_CATEGORIES: ("arabes" | "disenador" | "accesorios")[] = [
  "arabes",
  "disenador",
  "accesorios",
];
const MAX_PHOTOS = 3;

type StatusFilter = "all" | "active" | "paused";
type GenderFilter = "all" | Gender | "none";
type SortBy = "newest" | "oldest" | "name" | "brand";

type PhotoItem =
  | { id: string; kind: "existing"; url: string }
  | { id: string; kind: "new"; file: File; preview: string };

function money(n: number | null) {
  if (!n || Number(n) === 0) return "Consultar";
  return `$ ${Number(n).toLocaleString("es-AR")}`;
}

function emptySimpleForm() {
  return {
    nombre: "",
    marca: "",
    precio: "",
    desc: "",
    disponible: true,
    gender: "" as Gender | "",
  };
}

function emptyDecantForm() {
  return {
    nombre: "",
    marca: "",
    precio5: "",
    precio10: "",
    disp5: true,
    disp10: true,
    disponible: true,
    desc: "",
    gender: "" as Gender | "",
  };
}

function photoItemsFromProduct(p: DBProduct): PhotoItem[] {
  const urls = p.image_urls?.length ? p.image_urls : p.image_url ? [p.image_url] : [];
  return urls.slice(0, MAX_PHOTOS).map((url) => ({
    id: crypto.randomUUID(),
    kind: "existing" as const,
    url,
  }));
}

function revokeNewPhoto(item: PhotoItem) {
  if (item.kind === "new") URL.revokeObjectURL(item.preview);
}

async function uploadPhotosInOrder(items: PhotoItem[]): Promise<string[]> {
  const newItems = items.filter(
    (item): item is Extract<PhotoItem, { kind: "new" }> => item.kind === "new"
  );
  const uploaded = newItems.length
    ? await uploadProductPhotos(newItems.map((item) => item.file))
    : [];
  const uploadedById = new Map<string, string>();
  newItems.forEach((item, index) => uploadedById.set(item.id, uploaded[index]));

  return items
    .map((item) => (item.kind === "existing" ? item.url : uploadedById.get(item.id) || ""))
    .filter(Boolean);
}

function ImageSlots({
  items,
  onChange,
}: {
  items: PhotoItem[];
  onChange: (items: PhotoItem[]) => void;
}) {
  function addFiles(files: FileList | null) {
    const incoming = Array.from(files || []).slice(0, Math.max(0, MAX_PHOTOS - items.length));
    if (!incoming.length) return;
    const next: PhotoItem[] = incoming.map((file) => ({
      id: crypto.randomUUID(),
      kind: "new",
      file,
      preview: URL.createObjectURL(file),
    }));
    onChange([...items, ...next].slice(0, MAX_PHOTOS));
  }

  function remove(index: number) {
    revokeNewPhoto(items[index]);
    onChange(items.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="photo-manager">
      {items.length === 0 ? (
        <div className="photo-empty">
          <div className="photo-empty-icon"><AdminBottleIcon /></div>
          <strong>Sin fotos todavía</strong>
          <span>Podés subir hasta {MAX_PHOTOS} imágenes.</span>
        </div>
      ) : (
        <div className="photo-slots">
          {items.map((item, index) => (
            <div className="photo-slot" key={item.id}>
              <div className="photo-number">{index + 1}</div>
              <img
                src={item.kind === "existing" ? item.url : item.preview}
                alt={`Foto ${index + 1}`}
              />
              <div className="photo-controls">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Mover foto a la izquierda"
                  title="Mover a la izquierda"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label="Mover foto a la derecha"
                  title="Mover a la derecha"
                >
                  →
                </button>
                <button
                  type="button"
                  className="remove-photo"
                  onClick={() => remove(index)}
                  aria-label="Eliminar foto"
                  title="Eliminar foto"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length < MAX_PHOTOS && (
        <label className="photo-add">
          <span className="photo-add-plus">＋</span>
          <span>
            <strong>Agregar foto</strong>
            <small>JPG, PNG o imagen del celular</small>
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              addFiles(event.target.files);
              event.currentTarget.value = "";
            }}
          />
        </label>
      )}
      {items.length > 1 && (
        <p className="photo-help">La foto Nº 1 será la principal del catálogo.</p>
      )}
    </div>
  );
}

export default function AdminApp() {
  const [view, setView] = useState<"dashboard" | DBCategory>("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");

  const [products, setProducts] = useState<Record<DBCategory, DBProduct[]>>({
    arabes: [],
    disenador: [],
    accesorios: [],
    decants: [],
  });

  const loadCategory = useCallback(async (cat: DBCategory) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminProducts(cat);
      setProducts((previous) => ({ ...previous, [cat]: data }));
    } catch (err) {
      setError("No pudimos conectar con Supabase. Revisá la conexión y volvé a intentar.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    CATEGORIES.forEach((cat) => loadCategory(cat));
  }, [loadCategory]);

  useEffect(() => {
    setQuery("");
    setStatusFilter("all");
    setGenderFilter("all");
    setSortBy("newest");
  }, [view]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2600);
  }

  function productIsActive(cat: DBCategory, product: DBProduct) {
    if (cat === "decants") {
      return product.active && (product.active_5ml || product.active_10ml);
    }
    return product.active;
  }

  const allProducts = useMemo(
    () => CATEGORIES.flatMap((cat) => products[cat].map((product) => ({ cat, product }))),
    [products]
  );

  const dashboardTotals = useMemo(() => {
    const total = allProducts.length;
    const active = allProducts.filter(({ cat, product }) => productIsActive(cat, product)).length;
    return { total, active, paused: total - active };
  }, [allProducts]);

  function filteredProducts(cat: DBCategory) {
    const normalized = query.trim().toLocaleLowerCase("es");
    return [...products[cat]]
      .filter((product) => {
        if (normalized) {
          const haystack = `${product.name} ${product.brand || ""}`.toLocaleLowerCase("es");
          if (!haystack.includes(normalized)) return false;
        }

        const active = productIsActive(cat, product);
        if (statusFilter === "active" && !active) return false;
        if (statusFilter === "paused" && active) return false;

        if (GENDER_CATEGORIES.includes(cat) && genderFilter !== "all") {
          if (genderFilter === "none" && product.gender) return false;
          if (genderFilter !== "none" && product.gender !== genderFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name, "es");
        if (sortBy === "brand") return (a.brand || "").localeCompare(b.brand || "", "es");
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        return sortBy === "oldest" ? aTime - bTime : bTime - aTime;
      });
  }

  function categoryTotals(cat: DBCategory) {
    const total = products[cat].length;
    const active = products[cat].filter((product) => productIsActive(cat, product)).length;
    return { total, active, paused: total - active };
  }

  // ---------- modal producto simple ----------
  const [modalSimpleOpen, setModalSimpleOpen] = useState(false);
  const [simpleCat, setSimpleCat] = useState<"arabes" | "disenador" | "accesorios">("arabes");
  const [simpleForm, setSimpleForm] = useState(emptySimpleForm());
  const [simplePhotos, setSimplePhotos] = useState<PhotoItem[]>([]);
  const [editingSimpleId, setEditingSimpleId] = useState<string | null>(null);
  const [savingSimple, setSavingSimple] = useState(false);

  // ---------- modal decant ----------
  const [modalDecantOpen, setModalDecantOpen] = useState(false);
  const [decantForm, setDecantForm] = useState(emptyDecantForm());
  const [decantPhotos, setDecantPhotos] = useState<PhotoItem[]>([]);
  const [editingDecantId, setEditingDecantId] = useState<string | null>(null);
  const [savingDecant, setSavingDecant] = useState(false);

  function clearPhotoItems(items: PhotoItem[]) {
    items.forEach(revokeNewPhoto);
  }

  function closeSimpleModal() {
    clearPhotoItems(simplePhotos);
    setModalSimpleOpen(false);
  }

  function closeDecantModal() {
    clearPhotoItems(decantPhotos);
    setModalDecantOpen(false);
  }

  function openNewSimple(cat: "arabes" | "disenador" | "accesorios") {
    clearPhotoItems(simplePhotos);
    setSimpleCat(cat);
    setSimpleForm(emptySimpleForm());
    setSimplePhotos([]);
    setEditingSimpleId(null);
    setModalSimpleOpen(true);
  }

  function openEditSimple(cat: "arabes" | "disenador" | "accesorios", p: DBProduct) {
    clearPhotoItems(simplePhotos);
    setSimpleCat(cat);
    setSimpleForm({
      nombre: p.name,
      marca: p.brand || "",
      precio: p.price != null ? String(p.price) : "",
      desc: p.description || "",
      disponible: p.active,
      gender: p.gender || "",
    });
    setSimplePhotos(photoItemsFromProduct(p));
    setEditingSimpleId(p.id);
    setModalSimpleOpen(true);
  }

  function openNewDecant() {
    clearPhotoItems(decantPhotos);
    setDecantForm(emptyDecantForm());
    setDecantPhotos([]);
    setEditingDecantId(null);
    setModalDecantOpen(true);
  }

  function openEditDecant(p: DBProduct) {
    clearPhotoItems(decantPhotos);
    setDecantForm({
      nombre: p.name,
      marca: p.brand || "",
      precio5: p.price_5ml != null ? String(p.price_5ml) : "",
      precio10: p.price_10ml != null ? String(p.price_10ml) : "",
      disp5: p.active_5ml,
      disp10: p.active_10ml,
      disponible: p.active,
      desc: p.description || "",
      gender: p.gender || "",
    });
    setDecantPhotos(photoItemsFromProduct(p));
    setEditingDecantId(p.id);
    setModalDecantOpen(true);
  }

  async function saveSimple() {
    if (!simpleForm.nombre.trim()) {
      alert("Poné al menos el nombre del producto.");
      return;
    }
    setSavingSimple(true);
    try {
      const image_urls = await uploadPhotosInOrder(simplePhotos);
      const payload = {
        category: simpleCat,
        name: simpleForm.nombre.trim(),
        brand: simpleForm.marca.trim() || null,
        price: simpleForm.precio ? Number(simpleForm.precio) : null,
        description: simpleForm.desc.trim() || null,
        active: simpleForm.disponible,
        gender: simpleForm.gender || null,
        image_url: image_urls[0] || null,
        image_urls,
      };

      if (editingSimpleId) {
        await updateProduct(editingSimpleId, payload);
        showNotice("Producto actualizado correctamente.");
      } else {
        await insertProduct(payload);
        showNotice("Producto creado correctamente.");
      }
      clearPhotoItems(simplePhotos);
      setModalSimpleOpen(false);
      await loadCategory(simpleCat);
    } catch (err) {
      alert("No se pudo guardar el producto. Revisá tu conexión a Supabase.");
      console.error(err);
    } finally {
      setSavingSimple(false);
    }
  }

  async function saveDecant() {
    if (!decantForm.nombre.trim()) {
      alert("Poné al menos el nombre del perfume.");
      return;
    }
    setSavingDecant(true);
    try {
      const image_urls = await uploadPhotosInOrder(decantPhotos);
      const payload = {
        category: "decants" as DBCategory,
        name: decantForm.nombre.trim(),
        brand: decantForm.marca.trim() || null,
        price_5ml: decantForm.precio5 ? Number(decantForm.precio5) : null,
        price_10ml: decantForm.precio10 ? Number(decantForm.precio10) : null,
        active_5ml: decantForm.disp5,
        active_10ml: decantForm.disp10,
        active: decantForm.disponible,
        description: decantForm.desc.trim() || null,
        gender: decantForm.gender || null,
        image_url: image_urls[0] || null,
        image_urls,
      };

      if (editingDecantId) {
        await updateProduct(editingDecantId, payload);
        showNotice("Decant actualizado correctamente.");
      } else {
        await insertProduct(payload);
        showNotice("Decant creado correctamente.");
      }
      clearPhotoItems(decantPhotos);
      setModalDecantOpen(false);
      await loadCategory("decants");
    } catch (err) {
      alert("No se pudo guardar el decant. Revisá tu conexión a Supabase.");
      console.error(err);
    } finally {
      setSavingDecant(false);
    }
  }

  async function toggleDisponible(cat: DBCategory, product: DBProduct) {
    const nextActive = !product.active;
    setProducts((previous) => ({
      ...previous,
      [cat]: previous[cat].map((item) =>
        item.id === product.id ? { ...item, active: nextActive } : item
      ),
    }));
    try {
      await updateProduct(product.id, { active: nextActive });
      showNotice(nextActive ? "Producto activado." : "Producto pausado.");
    } catch (err) {
      console.error(err);
      loadCategory(cat);
    }
  }

  async function duplicateProduct(cat: DBCategory, product: DBProduct) {
    try {
      const { id: _id, created_at: _createdAt, ...copy } = product;
      await insertProduct({
        ...copy,
        name: `${product.name} (copia)`,
        active: false,
        ...(cat === "decants" ? { active_5ml: false, active_10ml: false } : {}),
      });
      await loadCategory(cat);
      showNotice("Copia creada en estado pausado.");
    } catch (err) {
      console.error(err);
      alert("No se pudo duplicar el producto.");
    }
  }

  async function removeProduct(cat: DBCategory, product: DBProduct) {
    const accepted = window.confirm(
      `¿Eliminar definitivamente “${product.name}”?\n\nEsta acción no se puede deshacer.`
    );
    if (!accepted) return;

    setProducts((previous) => ({
      ...previous,
      [cat]: previous[cat].filter((item) => item.id !== product.id),
    }));
    try {
      await deleteProduct(product.id);
      showNotice("Producto eliminado.");
    } catch (err) {
      console.error(err);
      loadCategory(cat);
      alert("No se pudo eliminar el producto.");
    }
  }

  function thumbFor(p: DBProduct) {
    const imgs = p.image_urls?.length ? p.image_urls : p.image_url ? [p.image_url] : [];
    if (!imgs.length) return <AdminBottleIcon />;
    return (
      <>
        <img src={imgs[0]} alt={p.name} />
        {imgs.length > 1 && <span className="photo-count">{imgs.length}</span>}
      </>
    );
  }

  function FilterBar({ cat }: { cat: DBCategory }) {
    const totals = categoryTotals(cat);
    const visible = filteredProducts(cat).length;
    return (
      <div className="admin-filters">
        <div className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre o marca..."
            aria-label="Buscar productos"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Limpiar búsqueda">×</button>
          )}
        </div>

        <div className="filter-group" aria-label="Filtrar por estado">
          <button className={statusFilter === "all" ? "selected" : ""} onClick={() => setStatusFilter("all")}>Todos</button>
          <button className={statusFilter === "active" ? "selected" : ""} onClick={() => setStatusFilter("active")}>Activos</button>
          <button className={statusFilter === "paused" ? "selected" : ""} onClick={() => setStatusFilter("paused")}>Pausados</button>
        </div>

        {GENDER_CATEGORIES.includes(cat) && (
          <select
            className="filter-select"
            value={genderFilter}
            onChange={(event) => setGenderFilter(event.target.value as GenderFilter)}
            aria-label="Filtrar por género"
          >
            <option value="all">Todos los géneros</option>
            <option value="hombre">Hombre</option>
            <option value="mujer">Mujer</option>
            <option value="unisex">Unisex</option>
            <option value="none">Sin especificar</option>
          </select>
        )}

        <select
          className="filter-select"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as SortBy)}
          aria-label="Ordenar productos"
        >
          <option value="newest">Más recientes</option>
          <option value="oldest">Más antiguos</option>
          <option value="name">Nombre A–Z</option>
          <option value="brand">Marca A–Z</option>
        </select>

        <div className="filter-result">
          <strong>{visible}</strong> de {totals.total}
        </div>
      </div>
    );
  }

  function EmptyState({ cat }: { cat: DBCategory }) {
    const total = products[cat].length;
    if (loading && total === 0) return <div className="empty-state">Cargando productos...</div>;
    if (total === 0) return <div className="empty-state">Todavía no cargaste productos en esta categoría.</div>;
    return <div className="empty-state">No hay productos que coincidan con estos filtros.</div>;
  }

  function SimpleProductList({ cat }: { cat: "arabes" | "disenador" | "accesorios" }) {
    const visible = filteredProducts(cat);
    if (!visible.length) return <EmptyState cat={cat} />;

    return (
      <div className="product-admin-list">
        {visible.map((p) => (
          <article className="product-admin-row" key={p.id}>
            <div className="product-primary">
              <div className="thumb">{thumbFor(p)}</div>
              <div className="product-copy">
                <div className="row-name">{p.name}</div>
                <div className="row-brand">{p.brand || "Sin marca"}</div>
                <div className="mobile-pills">
                  {p.gender && <span className="pill neutral">{GENDER_LABELS[p.gender]}</span>}
                  <span className={`pill ${p.active ? "on" : "off"}`}>
                    <span className="dot" />{p.active ? "Disponible" : "Pausado"}
                  </span>
                </div>
              </div>
            </div>

            <div className="row-cell price-cell">
              <span className="cell-label">Precio</span>
              <strong>{money(p.price)}</strong>
            </div>

            <div className="row-cell gender-cell">
              <span className="cell-label">Género</span>
              {p.gender ? <span className="pill neutral">{GENDER_LABELS[p.gender]}</span> : <span className="muted">—</span>}
            </div>

            <div className="row-cell status-cell">
              <span className="cell-label">Estado</span>
              <span className={`pill ${p.active ? "on" : "off"}`}>
                <span className="dot" />{p.active ? "Disponible" : "Pausado"}
              </span>
            </div>

            <div className="row-actions">
              <button className="icon-btn" title="Editar" aria-label={`Editar ${p.name}`} onClick={() => openEditSimple(cat, p)}>✎</button>
              <button className="icon-btn" title="Duplicar" aria-label={`Duplicar ${p.name}`} onClick={() => duplicateProduct(cat, p)}>⧉</button>
              <button className="icon-btn" title={p.active ? "Pausar" : "Activar"} aria-label={p.active ? `Pausar ${p.name}` : `Activar ${p.name}`} onClick={() => toggleDisponible(cat, p)}>⏻</button>
              <button className="icon-btn danger-icon" title="Eliminar" aria-label={`Eliminar ${p.name}`} onClick={() => removeProduct(cat, p)}>🗑</button>
            </div>
          </article>
        ))}
      </div>
    );
  }

  function DecantProductList() {
    const visible = filteredProducts("decants");
    if (!visible.length) return <EmptyState cat="decants" />;

    return (
      <div className="product-admin-list">
        {visible.map((p) => (
          <article className="product-admin-row decant-row" key={p.id}>
            <div className="product-primary">
              <div className="thumb">{thumbFor(p)}</div>
              <div className="product-copy">
                <div className="row-name">{p.name}</div>
                <div className="row-brand">{p.brand || "Sin marca"}</div>
                <div className="mobile-pills">
                  {p.gender && <span className="pill neutral">{GENDER_LABELS[p.gender]}</span>}
                  <span className={`pill ${productIsActive("decants", p) ? "on" : "off"}`}>
                    <span className="dot" />{productIsActive("decants", p) ? "Disponible" : "Pausado"}
                  </span>
                </div>
              </div>
            </div>

            <div className="row-cell decant-price-cell">
              <span className="cell-label">5 ml</span>
              <strong>{money(p.price_5ml)}</strong>
              <span className={`mini-status ${p.active_5ml ? "ok" : "off"}`}>{p.active_5ml ? "activo" : "pausado"}</span>
            </div>

            <div className="row-cell decant-price-cell">
              <span className="cell-label">10 ml</span>
              <strong>{money(p.price_10ml)}</strong>
              <span className={`mini-status ${p.active_10ml ? "ok" : "off"}`}>{p.active_10ml ? "activo" : "pausado"}</span>
            </div>

            <div className="row-cell status-cell">
              <span className="cell-label">Producto</span>
              <span className={`pill ${p.active ? "on" : "off"}`}>
                <span className="dot" />{p.active ? "Visible" : "Pausado"}
              </span>
            </div>

            <div className="row-actions">
              <button className="icon-btn" title="Editar" aria-label={`Editar ${p.name}`} onClick={() => openEditDecant(p)}>✎</button>
              <button className="icon-btn" title="Duplicar" aria-label={`Duplicar ${p.name}`} onClick={() => duplicateProduct("decants", p)}>⧉</button>
              <button className="icon-btn" title={p.active ? "Pausar" : "Activar"} aria-label={p.active ? `Pausar ${p.name}` : `Activar ${p.name}`} onClick={() => toggleDisponible("decants", p)}>⏻</button>
              <button className="icon-btn danger-icon" title="Eliminar" aria-label={`Eliminar ${p.name}`} onClick={() => removeProduct("decants", p)}>🗑</button>
            </div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="admin-root">
      {notice && <div className="admin-toast">✓ {notice}</div>}

      <aside className="sidebar">
        <div className="sidebar-brand">
          <Image src="/dorah-logo.png" alt="Dorah" width={100} height={34} />
          <div>
            <div className="tag">Perfumes &amp; Accesorios</div>
            <div className="admin-label">Panel de administración</div>
          </div>
        </div>

        <nav>
          <button className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}>
            <span className="dot" /> Resumen
          </button>
          {CATEGORIES.map((cat) => (
            <button key={cat} className={view === cat ? "active" : ""} onClick={() => setView(cat)}>
              <span className="dot" /> {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">Conectado a Supabase — los cambios se reflejan en la web.</div>
      </aside>

      <main>
        {error && <div className="note-banner error-banner">{error}</div>}

        {view === "dashboard" && (
          <section>
            <div className="topline dashboard-title">
              <div>
                <span className="section-kicker">DORAH · ADMIN V2</span>
                <h2>Resumen</h2>
                <p className="sub">Estado general de tu catálogo.</p>
              </div>
            </div>

            <div className="overview-cards">
              <div className="overview-card main-overview">
                <span>Total productos</span>
                <strong>{dashboardTotals.total}</strong>
              </div>
              <div className="overview-card active-overview">
                <span>Activos</span>
                <strong>{dashboardTotals.active}</strong>
              </div>
              <div className="overview-card paused-overview">
                <span>Pausados</span>
                <strong>{dashboardTotals.paused}</strong>
              </div>
            </div>

            <div className="stats">
              {CATEGORIES.map((cat) => {
                const totals = categoryTotals(cat);
                return (
                  <button className="stat-card" key={cat} onClick={() => setView(cat)}>
                    <span className="eyebrow">{cat === "decants" ? "Formato" : "Categoría"}</span>
                    <div className="stat-main">
                      <div className="num">{totals.total}</div>
                      <span>productos</span>
                    </div>
                    <div className="lbl">{CATEGORY_LABELS[cat]}</div>
                    <div className="stat-breakdown">
                      <span><b>{totals.active}</b> activos</span>
                      <span><b>{totals.paused}</b> pausados</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {SIMPLE_CATEGORIES.includes(view as "arabes" | "disenador" | "accesorios") && view !== "dashboard" && (
          <section>
            <div className="topline">
              <div>
                <span className="section-kicker">GESTIÓN DE CATÁLOGO</span>
                <h2>{CATEGORY_LABELS[view as DBCategory]}</h2>
                <p className="sub">Buscá, filtrá, duplicá, pausá o editá productos.</p>
              </div>
              <button className="btn btn-gold" onClick={() => openNewSimple(view as "arabes" | "disenador" | "accesorios")}>
                + Nuevo producto
              </button>
            </div>
            <FilterBar cat={view as DBCategory} />
            <SimpleProductList cat={view as "arabes" | "disenador" | "accesorios"} />
          </section>
        )}

        {view === "decants" && (
          <section>
            <div className="topline">
              <div>
                <span className="section-kicker">GESTIÓN DE CATÁLOGO</span>
                <h2>Decants</h2>
                <p className="sub">Controlá precios y disponibilidad de 5 ml y 10 ml.</p>
              </div>
              <button className="btn btn-gold" onClick={openNewDecant}>+ Nuevo decant</button>
            </div>
            <FilterBar cat="decants" />
            <DecantProductList />
          </section>
        )}
      </main>

      {/* Modal producto simple */}
      <div className={`modal-overlay${modalSimpleOpen ? " show" : ""}`} onClick={(e) => e.target === e.currentTarget && closeSimpleModal()}>
        <div className="modal" role="dialog" aria-modal="true" aria-label={editingSimpleId ? "Editar producto" : "Nuevo producto"}>
          <div className="modal-head">
            <div>
              <span className="modal-kicker">{CATEGORY_LABELS[simpleCat]}</span>
              <h3>{editingSimpleId ? "Editar producto" : "Nuevo producto"}</h3>
            </div>
            <button onClick={closeSimpleModal} aria-label="Cerrar">×</button>
          </div>
          <div className="modal-body">
            <div className="field">
              <label>Fotos del producto</label>
              <ImageSlots items={simplePhotos} onChange={setSimplePhotos} />
            </div>

            <div className="field">
              <label>Nombre del producto</label>
              <input type="text" placeholder="Ej: Fakhar Silver" value={simpleForm.nombre} onChange={(e) => setSimpleForm((f) => ({ ...f, nombre: e.target.value }))} />
            </div>

            <div className="field-row">
              <div className="field">
                <label>Marca</label>
                <input type="text" placeholder="Ej: Lattafa" value={simpleForm.marca} onChange={(e) => setSimpleForm((f) => ({ ...f, marca: e.target.value }))} />
              </div>
              <div className="field">
                <label>Precio (0 = consultar)</label>
                <input type="number" inputMode="decimal" placeholder="0" value={simpleForm.precio} onChange={(e) => setSimpleForm((f) => ({ ...f, precio: e.target.value }))} />
              </div>
            </div>

            {GENDER_CATEGORIES.includes(simpleCat) && (
              <div className="field">
                <label>Género</label>
                <select value={simpleForm.gender} onChange={(e) => setSimpleForm((f) => ({ ...f, gender: e.target.value as Gender | "" }))}>
                  <option value="">Sin especificar</option>
                  <option value="hombre">Hombre</option>
                  <option value="mujer">Mujer</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
            )}

            <div className="field">
              <label>Descripción (opcional)</label>
              <textarea placeholder="Notas olfativas, detalles, presentación..." value={simpleForm.desc} onChange={(e) => setSimpleForm((f) => ({ ...f, desc: e.target.value }))} />
            </div>

            <div className="switch-row">
              <div>
                <strong>Disponible en la web</strong>
                <small>Si lo pausás, seguirá visible solo en el administrador.</small>
              </div>
              <label className="switch">
                <input type="checkbox" checked={simpleForm.disponible} onChange={(e) => setSimpleForm((f) => ({ ...f, disponible: e.target.checked }))} />
                <span className="slider" />
              </label>
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn btn-ghost" onClick={closeSimpleModal}>Cancelar</button>
            <button className="btn btn-gold" onClick={saveSimple} disabled={savingSimple}>{savingSimple ? "Guardando..." : editingSimpleId ? "Guardar cambios" : "Guardar producto"}</button>
          </div>
        </div>
      </div>

      {/* Modal decant */}
      <div className={`modal-overlay${modalDecantOpen ? " show" : ""}`} onClick={(e) => e.target === e.currentTarget && closeDecantModal()}>
        <div className="modal" role="dialog" aria-modal="true" aria-label={editingDecantId ? "Editar decant" : "Nuevo decant"}>
          <div className="modal-head">
            <div>
              <span className="modal-kicker">Decants</span>
              <h3>{editingDecantId ? "Editar decant" : "Nuevo decant"}</h3>
            </div>
            <button onClick={closeDecantModal} aria-label="Cerrar">×</button>
          </div>
          <div className="modal-body">
            <div className="field">
              <label>Fotos del producto</label>
              <ImageSlots items={decantPhotos} onChange={setDecantPhotos} />
            </div>

            <div className="field">
              <label>Nombre del perfume original</label>
              <input type="text" placeholder="Ej: Bleu de Chanel" value={decantForm.nombre} onChange={(e) => setDecantForm((f) => ({ ...f, nombre: e.target.value }))} />
            </div>

            <div className="field-row">
              <div className="field">
                <label>Marca</label>
                <input type="text" placeholder="Ej: Chanel" value={decantForm.marca} onChange={(e) => setDecantForm((f) => ({ ...f, marca: e.target.value }))} />
              </div>
              <div className="field">
                <label>Género</label>
                <select value={decantForm.gender} onChange={(e) => setDecantForm((f) => ({ ...f, gender: e.target.value as Gender | "" }))}>
                  <option value="">Sin especificar</option>
                  <option value="hombre">Hombre</option>
                  <option value="mujer">Mujer</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
            </div>

            <div className="size-fields">
              <div className="size-card">
                <strong>5 ml</strong>
                <div className="field">
                  <label>Precio</label>
                  <input type="number" inputMode="decimal" placeholder="0" value={decantForm.precio5} onChange={(e) => setDecantForm((f) => ({ ...f, precio5: e.target.value }))} />
                </div>
                <div className="mini-switch-row">
                  <span>Disponible</span>
                  <label className="switch"><input type="checkbox" checked={decantForm.disp5} onChange={(e) => setDecantForm((f) => ({ ...f, disp5: e.target.checked }))} /><span className="slider" /></label>
                </div>
              </div>

              <div className="size-card">
                <strong>10 ml</strong>
                <div className="field">
                  <label>Precio</label>
                  <input type="number" inputMode="decimal" placeholder="0" value={decantForm.precio10} onChange={(e) => setDecantForm((f) => ({ ...f, precio10: e.target.value }))} />
                </div>
                <div className="mini-switch-row">
                  <span>Disponible</span>
                  <label className="switch"><input type="checkbox" checked={decantForm.disp10} onChange={(e) => setDecantForm((f) => ({ ...f, disp10: e.target.checked }))} /><span className="slider" /></label>
                </div>
              </div>
            </div>

            <div className="field">
              <label>Descripción (opcional)</label>
              <textarea placeholder="Notas olfativas, detalles, presentación..." value={decantForm.desc} onChange={(e) => setDecantForm((f) => ({ ...f, desc: e.target.value }))} />
            </div>

            <div className="switch-row">
              <div>
                <strong>Producto visible en la web</strong>
                <small>Podés pausar todo el decant sin borrar sus precios.</small>
              </div>
              <label className="switch"><input type="checkbox" checked={decantForm.disponible} onChange={(e) => setDecantForm((f) => ({ ...f, disponible: e.target.checked }))} /><span className="slider" /></label>
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn btn-ghost" onClick={closeDecantModal}>Cancelar</button>
            <button className="btn btn-gold" onClick={saveDecant} disabled={savingDecant}>{savingDecant ? "Guardando..." : editingDecantId ? "Guardar cambios" : "Guardar decant"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
