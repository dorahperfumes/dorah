"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  DBCategory,
  DBProduct,
  Gender,
  fetchAdminProducts,
  insertProduct,
  updateProduct,
  deleteProduct,
  uploadProductPhotos,
} from "@/lib/products-db";
import { AdminBottleIcon } from "./AdminBottleIcon";

function money(n: number | null) {
  return `$ ${Number(n || 0).toLocaleString("es-AR")}`;
}

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

// Accesorios no llevan género (no son perfumes)
const GENDER_CATEGORIES: DBCategory[] = ["arabes", "disenador", "decants"];

const SIMPLE_CATEGORIES: ("arabes" | "disenador" | "accesorios")[] = ["arabes", "disenador", "accesorios"];

const MAX_PHOTOS = 3;

function emptySimpleForm() {
  return { nombre: "", marca: "", precio: "", desc: "", disponible: true, gender: "" as Gender | "" };
}

function emptyDecantForm() {
  return { nombre: "", marca: "", precio5: "", precio10: "", disp5: true, disp10: true, gender: "" as Gender | "" };
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--line)",
  borderRadius: 3,
  fontFamily: "'Jost',sans-serif",
  fontSize: "0.88rem",
  background: "#fdfdfb",
  color: "var(--ink)",
};

function ImageSlots({
  existing,
  onRemoveExisting,
  previews,
  onRemoveNew,
  onAddFiles,
  disabled,
}: {
  existing: string[];
  onRemoveExisting: (i: number) => void;
  previews: string[];
  onRemoveNew: (i: number) => void;
  onAddFiles: (files: FileList | null) => void;
  disabled: boolean;
}) {
  const total = existing.length + previews.length;
  return (
    <div className="upload-box">
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        {total === 0 ? (
          <div className="upload-preview">
            <AdminBottleIcon />
          </div>
        ) : (
          <>
            {existing.map((src, i) => (
              <div key={`ex-${src}`} className="upload-preview" style={{ position: "relative" }}>
                <img src={src} alt="" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveExisting(i);
                  }}
                  style={removeBtnStyle}
                >
                  ×
                </button>
              </div>
            ))}
            {previews.map((src, i) => (
              <div key={`new-${src}`} className="upload-preview" style={{ position: "relative" }}>
                <img src={src} alt="" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveNew(i);
                  }}
                  style={removeBtnStyle}
                >
                  ×
                </button>
              </div>
            ))}
          </>
        )}
      </div>
      {total < MAX_PHOTOS
        ? "Hacé clic para subir foto/s (se ajustan y organizan solas)"
        : `Ya subiste el máximo de ${MAX_PHOTOS} fotos`}
      {total < MAX_PHOTOS && !disabled && (
        <input type="file" accept="image/*" multiple onChange={(e) => onAddFiles(e.target.files)} />
      )}
    </div>
  );
}

const removeBtnStyle: React.CSSProperties = {
  position: "absolute",
  top: -6,
  right: -6,
  width: 20,
  height: 20,
  borderRadius: "50%",
  border: "none",
  background: "#b3452f",
  color: "#fff",
  cursor: "pointer",
  fontSize: "0.7rem",
};

export default function AdminApp() {
  const [view, setView] = useState<"dashboard" | DBCategory>("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setProducts((p) => ({ ...p, [cat]: data }));
    } catch (err) {
      setError(
        "No pudimos conectar con Supabase. Revisá las variables de entorno (.env.local) y que hayas corrido el SQL."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (["arabes", "disenador", "accesorios", "decants"] as DBCategory[]).forEach((c) => loadCategory(c));
  }, [loadCategory]);

  // ---------- modal producto simple ----------
  const [modalSimpleOpen, setModalSimpleOpen] = useState(false);
  const [simpleCat, setSimpleCat] = useState<"arabes" | "disenador" | "accesorios">("arabes");
  const [simpleForm, setSimpleForm] = useState(emptySimpleForm());
  const [simpleFiles, setSimpleFiles] = useState<File[]>([]);
  const [simplePreviews, setSimplePreviews] = useState<string[]>([]);
  const [simpleExisting, setSimpleExisting] = useState<string[]>([]);
  const [editingSimpleId, setEditingSimpleId] = useState<string | null>(null);
  const [savingSimple, setSavingSimple] = useState(false);

  // ---------- modal decant ----------
  const [modalDecantOpen, setModalDecantOpen] = useState(false);
  const [decantForm, setDecantForm] = useState(emptyDecantForm());
  const [decantFiles, setDecantFiles] = useState<File[]>([]);
  const [decantPreviews, setDecantPreviews] = useState<string[]>([]);
  const [decantExisting, setDecantExisting] = useState<string[]>([]);
  const [editingDecantId, setEditingDecantId] = useState<string | null>(null);
  const [savingDecant, setSavingDecant] = useState(false);

  function openNewSimple(cat: "arabes" | "disenador" | "accesorios") {
    setSimpleCat(cat);
    setSimpleForm(emptySimpleForm());
    setSimpleFiles([]);
    setSimplePreviews([]);
    setSimpleExisting([]);
    setEditingSimpleId(null);
    setModalSimpleOpen(true);
  }

  function openEditSimple(cat: "arabes" | "disenador" | "accesorios", p: DBProduct) {
    setSimpleCat(cat);
    setSimpleForm({
      nombre: p.name,
      marca: p.brand || "",
      precio: p.price != null ? String(p.price) : "",
      desc: p.description || "",
      disponible: p.active,
      gender: p.gender || "",
    });
    setSimpleFiles([]);
    setSimplePreviews([]);
    setSimpleExisting(p.image_urls && p.image_urls.length ? p.image_urls : p.image_url ? [p.image_url] : []);
    setEditingSimpleId(p.id);
    setModalSimpleOpen(true);
  }

  function openNewDecant() {
    setDecantForm(emptyDecantForm());
    setDecantFiles([]);
    setDecantPreviews([]);
    setDecantExisting([]);
    setEditingDecantId(null);
    setModalDecantOpen(true);
  }

  function openEditDecant(p: DBProduct) {
    setDecantForm({
      nombre: p.name,
      marca: p.brand || "",
      precio5: p.price_5ml != null ? String(p.price_5ml) : "",
      precio10: p.price_10ml != null ? String(p.price_10ml) : "",
      disp5: p.active_5ml,
      disp10: p.active_10ml,
      gender: p.gender || "",
    });
    setDecantFiles([]);
    setDecantPreviews([]);
    setDecantExisting(p.image_urls && p.image_urls.length ? p.image_urls : p.image_url ? [p.image_url] : []);
    setEditingDecantId(p.id);
    setModalDecantOpen(true);
  }

  function addSimpleFiles(files: FileList | null) {
    const incoming = Array.from(files || []);
    if (!incoming.length) return;
    const room = MAX_PHOTOS - simpleExisting.length;
    const combined = [...simpleFiles, ...incoming].slice(0, Math.max(room, 0));
    setSimpleFiles(combined);
    setSimplePreviews(combined.map((f) => URL.createObjectURL(f)));
  }

  function addDecantFiles(files: FileList | null) {
    const incoming = Array.from(files || []);
    if (!incoming.length) return;
    const room = MAX_PHOTOS - decantExisting.length;
    const combined = [...decantFiles, ...incoming].slice(0, Math.max(room, 0));
    setDecantFiles(combined);
    setDecantPreviews(combined.map((f) => URL.createObjectURL(f)));
  }

  async function saveSimple() {
    if (!simpleForm.nombre.trim()) {
      alert("Poné al menos el nombre del producto.");
      return;
    }
    setSavingSimple(true);
    try {
      const newUrls = simpleFiles.length ? await uploadProductPhotos(simpleFiles) : [];
      const image_urls = [...simpleExisting, ...newUrls];
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
      } else {
        await insertProduct(payload);
      }
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
      const newUrls = decantFiles.length ? await uploadProductPhotos(decantFiles) : [];
      const image_urls = [...decantExisting, ...newUrls];
      const payload = {
        category: "decants" as DBCategory,
        name: decantForm.nombre.trim(),
        brand: decantForm.marca.trim() || null,
        price_5ml: decantForm.precio5 ? Number(decantForm.precio5) : null,
        price_10ml: decantForm.precio10 ? Number(decantForm.precio10) : null,
        active_5ml: decantForm.disp5,
        active_10ml: decantForm.disp10,
        active: true,
        gender: decantForm.gender || null,
        image_url: image_urls[0] || null,
        image_urls,
      };
      if (editingDecantId) {
        await updateProduct(editingDecantId, payload);
      } else {
        await insertProduct(payload);
      }
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
    setProducts((p) => ({
      ...p,
      [cat]: p[cat].map((item) => (item.id === product.id ? { ...item, active: !item.active } : item)),
    }));
    try {
      await updateProduct(product.id, { active: !product.active });
    } catch (err) {
      console.error(err);
      loadCategory(cat);
    }
  }

  async function removeProduct(cat: DBCategory, id: string) {
    setProducts((p) => ({ ...p, [cat]: p[cat].filter((item) => item.id !== id) }));
    try {
      await deleteProduct(id);
    } catch (err) {
      console.error(err);
      loadCategory(cat);
    }
  }

  function thumbFor(p: DBProduct) {
    const imgs = p.image_urls && p.image_urls.length ? p.image_urls : p.image_url ? [p.image_url] : [];
    if (!imgs.length) return <AdminBottleIcon />;
    return (
      <>
        <img src={imgs[0]} alt={p.name} />
        {imgs.length > 1 && (
          <span
            style={{
              position: "absolute",
              bottom: 2,
              right: 2,
              fontSize: "0.55rem",
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              borderRadius: 8,
              padding: "0 4px",
            }}
          >
            {imgs.length}
          </span>
        )}
      </>
    );
  }

  return (
    <div className="admin-root">
      <aside className="sidebar">
        <Image
          src="/dorah-logo.png"
          alt="Dorah"
          width={100}
          height={34}
          style={{ width: 100, height: "auto", marginBottom: 2 }}
        />
        <div className="tag">Perfumes &amp; Accesorios</div>
        <div className="admin-label">Panel de administración</div>
        <nav>
          <a
            href="#"
            className={view === "dashboard" ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setView("dashboard");
            }}
          >
            <span className="dot"></span> Resumen
          </a>
          {(["arabes", "disenador", "accesorios", "decants"] as DBCategory[]).map((cat) => (
            <a
              key={cat}
              href="#"
              className={view === cat ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setView(cat);
              }}
            >
              <span className="dot"></span> {CATEGORY_LABELS[cat]}
            </a>
          ))}
        </nav>
        <div className="sidebar-foot">Conectado a Supabase — los cambios ya se ven en la web.</div>
      </aside>

      <main>
        {error && (
          <div className="note-banner" style={{ borderColor: "#b3452f", color: "#b3452f" }}>
            {error}
          </div>
        )}

        {view === "dashboard" && (
          <section>
            <div className="topline">
              <div>
                <h2>Resumen</h2>
                <p className="sub">Productos cargados en la base de datos real (Supabase).</p>
              </div>
            </div>
            <div className="stats">
              {(["arabes", "disenador", "accesorios", "decants"] as DBCategory[]).map((cat) => (
                <div className="stat-card" key={cat} onClick={() => setView(cat)}>
                  <span className="eyebrow">{cat === "decants" ? "Formato" : "Categoría"}</span>
                  <div className="num">{products[cat].length}</div>
                  <div className="lbl">{CATEGORY_LABELS[cat]} cargados</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(SIMPLE_CATEGORIES as string[]).includes(view) && (
          <section>
            <div className="topline">
              <div>
                <h2>{CATEGORY_LABELS[view as DBCategory]}</h2>
                <p className="sub">
                  Productos que se muestran en la sección &quot;{CATEGORY_LABELS[view as DBCategory]}&quot; de la web.
                </p>
              </div>
              <button className="btn btn-gold" onClick={() => openNewSimple(view as "arabes" | "disenador" | "accesorios")}>
                + Nuevo producto
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading && products[view as DBCategory].length === 0 ? (
                    <tr className="empty-row">
                      <td colSpan={5}>Cargando...</td>
                    </tr>
                  ) : products[view as DBCategory].length === 0 ? (
                    <tr className="empty-row">
                      <td colSpan={5}>Todavía no cargaste productos en esta categoría.</td>
                    </tr>
                  ) : (
                    products[view as DBCategory].map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="thumb" style={{ position: "relative" }}>
                            {thumbFor(p)}
                          </div>
                        </td>
                        <td>
                          <div className="row-name">
                            {p.name}{" "}
                            {p.gender && (
                              <span className="pill on" style={{ marginLeft: 6 }}>
                                {GENDER_LABELS[p.gender]}
                              </span>
                            )}
                          </div>
                          <div className="row-brand">{p.brand}</div>
                        </td>
                        <td>{money(p.price)}</td>
                        <td>
                          <span className={`pill ${p.active ? "on" : "off"}`}>
                            <span className="dot"></span>
                            {p.active ? "Disponible" : "Pausado"}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              className="icon-btn"
                              title="Editar"
                              onClick={() => openEditSimple(view as "arabes" | "disenador" | "accesorios", p)}
                            >
                              ✎
                            </button>
                            <button className="icon-btn" title="Pausar/activar" onClick={() => toggleDisponible(view as DBCategory, p)}>
                              ⏻
                            </button>
                            <button
                              className="icon-btn btn-danger"
                              title="Eliminar"
                              onClick={() => removeProduct(view as DBCategory, p.id)}
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {view === "decants" && (
          <section>
            <div className="topline">
              <div>
                <h2>Decants</h2>
                <p className="sub">Productos con precio y disponibilidad separados por tamaño (5ml / 10ml).</p>
              </div>
              <button className="btn btn-gold" onClick={openNewDecant}>
                + Nuevo decant
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>Producto</th>
                    <th>5ml</th>
                    <th>10ml</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading && products.decants.length === 0 ? (
                    <tr className="empty-row">
                      <td colSpan={5}>Cargando...</td>
                    </tr>
                  ) : products.decants.length === 0 ? (
                    <tr className="empty-row">
                      <td colSpan={5}>Todavía no cargaste decants.</td>
                    </tr>
                  ) : (
                    products.decants.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="thumb" style={{ position: "relative" }}>
                            {thumbFor(p)}
                          </div>
                        </td>
                        <td>
                          <div className="row-name">
                            {p.name}{" "}
                            {p.gender && (
                              <span className="pill on" style={{ marginLeft: 6 }}>
                                {GENDER_LABELS[p.gender]}
                              </span>
                            )}
                          </div>
                          <div className="row-brand">{p.brand}</div>
                        </td>
                        <td>
                          {money(p.price_5ml)}{" "}
                          <span className={`pill ${p.active_5ml ? "on" : "off"}`} style={{ marginLeft: 6 }}>
                            <span className="dot"></span>
                            {p.active_5ml ? "ok" : "pausado"}
                          </span>
                        </td>
                        <td>
                          {money(p.price_10ml)}{" "}
                          <span className={`pill ${p.active_10ml ? "on" : "off"}`} style={{ marginLeft: 6 }}>
                            <span className="dot"></span>
                            {p.active_10ml ? "ok" : "pausado"}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button className="icon-btn" title="Editar" onClick={() => openEditDecant(p)}>
                              ✎
                            </button>
                            <button className="icon-btn btn-danger" title="Eliminar" onClick={() => removeProduct("decants", p.id)}>
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* Modal producto simple (árabes / diseñador / accesorios) */}
      <div
        className={`modal-overlay${modalSimpleOpen ? " show" : ""}`}
        onClick={(e) => e.target === e.currentTarget && setModalSimpleOpen(false)}
      >
        <div className="modal">
          <div className="modal-head">
            <h3>
              {editingSimpleId
                ? "Editar producto"
                : simpleCat === "arabes"
                ? "Nuevo perfume árabe"
                : simpleCat === "disenador"
                ? "Nuevo perfume de diseñador"
                : "Nuevo accesorio"}
            </h3>
            <button onClick={() => setModalSimpleOpen(false)}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="field">
              <label>Fotos del producto (hasta {MAX_PHOTOS})</label>
              <ImageSlots
                existing={simpleExisting}
                onRemoveExisting={(i) => setSimpleExisting((arr) => arr.filter((_, idx) => idx !== i))}
                previews={simplePreviews}
                onRemoveNew={(i) => {
                  const files = simpleFiles.filter((_, idx) => idx !== i);
                  setSimpleFiles(files);
                  setSimplePreviews(files.map((f) => URL.createObjectURL(f)));
                }}
                onAddFiles={addSimpleFiles}
                disabled={false}
              />
            </div>
            <div className="field">
              <label>Nombre del producto</label>
              <input
                type="text"
                placeholder="Ej: Oud Real 100ml"
                value={simpleForm.nombre}
                onChange={(e) => setSimpleForm((f) => ({ ...f, nombre: e.target.value }))}
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Marca</label>
                <input
                  type="text"
                  placeholder="Ej: Lattafa"
                  value={simpleForm.marca}
                  onChange={(e) => setSimpleForm((f) => ({ ...f, marca: e.target.value }))}
                />
              </div>
              <div className="field">
                <label>Precio (0 = &quot;Consultar stock&quot;)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={simpleForm.precio}
                  onChange={(e) => setSimpleForm((f) => ({ ...f, precio: e.target.value }))}
                />
              </div>
            </div>
            {GENDER_CATEGORIES.includes(simpleCat) && (
              <div className="field">
                <label>Género</label>
                <select
                  value={simpleForm.gender}
                  onChange={(e) => setSimpleForm((f) => ({ ...f, gender: e.target.value as Gender | "" }))}
                  style={selectStyle}
                >
                  <option value="">Sin especificar</option>
                  <option value="hombre">Hombre</option>
                  <option value="mujer">Mujer</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>
            )}
            <div className="field">
              <label>Descripción (opcional)</label>
              <textarea
                placeholder="Notas olfativas, detalles, etc."
                value={simpleForm.desc}
                onChange={(e) => setSimpleForm((f) => ({ ...f, desc: e.target.value }))}
              />
            </div>
            <div className="switch-row">
              <span>Disponible en la web</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={simpleForm.disponible}
                  onChange={(e) => setSimpleForm((f) => ({ ...f, disponible: e.target.checked }))}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn btn-ghost" onClick={() => setModalSimpleOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-gold" onClick={saveSimple} disabled={savingSimple}>
              {savingSimple ? "Guardando..." : editingSimpleId ? "Guardar cambios" : "Guardar producto"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal decant */}
      <div
        className={`modal-overlay${modalDecantOpen ? " show" : ""}`}
        onClick={(e) => e.target === e.currentTarget && setModalDecantOpen(false)}
      >
        <div className="modal">
          <div className="modal-head">
            <h3>{editingDecantId ? "Editar decant" : "Nuevo decant"}</h3>
            <button onClick={() => setModalDecantOpen(false)}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="field">
              <label>Fotos del producto (hasta {MAX_PHOTOS})</label>
              <ImageSlots
                existing={decantExisting}
                onRemoveExisting={(i) => setDecantExisting((arr) => arr.filter((_, idx) => idx !== i))}
                previews={decantPreviews}
                onRemoveNew={(i) => {
                  const files = decantFiles.filter((_, idx) => idx !== i);
                  setDecantFiles(files);
                  setDecantPreviews(files.map((f) => URL.createObjectURL(f)));
                }}
                onAddFiles={addDecantFiles}
                disabled={false}
              />
            </div>
            <div className="field">
              <label>Nombre del perfume original</label>
              <input
                type="text"
                placeholder="Ej: Bleu de Chanel"
                value={decantForm.nombre}
                onChange={(e) => setDecantForm((f) => ({ ...f, nombre: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>Marca</label>
              <input
                type="text"
                placeholder="Ej: Chanel"
                value={decantForm.marca}
                onChange={(e) => setDecantForm((f) => ({ ...f, marca: e.target.value }))}
              />
            </div>
            <div className="field">
              <label>Género</label>
              <select
                value={decantForm.gender}
                onChange={(e) => setDecantForm((f) => ({ ...f, gender: e.target.value as Gender | "" }))}
                style={selectStyle}
              >
                <option value="">Sin especificar</option>
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
            <div className="size-fields">
              <div className="field">
                <label>Precio 5ml (0 = consultar)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={decantForm.precio5}
                  onChange={(e) => setDecantForm((f) => ({ ...f, precio5: e.target.value }))}
                />
              </div>
              <div className="field">
                <label>Precio 10ml (0 = consultar)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={decantForm.precio10}
                  onChange={(e) => setDecantForm((f) => ({ ...f, precio10: e.target.value }))}
                />
              </div>
            </div>
            <div className="switch-row">
              <span>Disponible 5ml</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={decantForm.disp5}
                  onChange={(e) => setDecantForm((f) => ({ ...f, disp5: e.target.checked }))}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="switch-row">
              <span>Disponible 10ml</span>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={decantForm.disp10}
                  onChange={(e) => setDecantForm((f) => ({ ...f, disp10: e.target.checked }))}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
          <div className="modal-foot">
            <button className="btn btn-ghost" onClick={() => setModalDecantOpen(false)}>
              Cancelar
            </button>
            <button className="btn btn-gold" onClick={saveDecant} disabled={savingDecant}>
              {savingDecant ? "Guardando..." : editingDecantId ? "Guardar cambios" : "Guardar decant"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
