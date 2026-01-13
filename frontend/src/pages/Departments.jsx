import React, { useEffect, useState, useMemo } from "react";
import ReactDOM from "react-dom";
import {
  // UI Icons
  Plus, Search, Edit2, Trash2, X, Download, AlertTriangle, // Added AlertTriangle
  // Department Icons
  Layers, Users, Briefcase, DollarSign, Code, Megaphone, Shield, Activity, 
  PenTool, Truck, Coffee, Home, Settings, Database, Cloud, Server, 
  Smartphone, Monitor, Cpu, Globe, Anchor, Archive, Award, BarChart, 
  Battery, Bell, Book, Box, Calendar, Camera, Cast, CheckCircle, 
  Clipboard, Clock, Compass, CreditCard, Flag, Folder, Gift, Heart, 
  Image, Key, Lock, Map, Mic, Music, Package, PieChart, Play, 
  Power, Printer, Radio, Save, Scissors, Send, ShoppingBag, 
  ShoppingCart, Smile, Star, Sun, Tag, Terminal, Umbrella, 
  Video, Voicemail, Wifi, Zap,
  Wrench
} from "lucide-react";

// -----------------------
// 1. EXPANDED ICON LIBRARY
// -----------------------
const ICON_MAP = {
  Layers, Users, Briefcase, DollarSign, Code, Megaphone, Shield, Activity, 
  PenTool, Truck, Coffee, Home, Settings, Database, Cloud, Server, 
  Smartphone, Monitor, Cpu, Globe, Anchor, Archive, Award, BarChart, 
  Battery, Bell, Book, Box, Calendar, Camera, Cast, CheckCircle, 
  Clipboard, Clock, Compass, CreditCard, Flag, Folder, Gift, Heart, 
  Image, Key, Lock, Map, Mic, Music, Package, PieChart, Play, 
  Power, Printer, Radio, Save, Scissors, Send, ShoppingBag, 
  ShoppingCart, Smile, Star, Sun, Tag, Terminal, Umbrella, 
  Video, Voicemail, Wifi, Zap,
  Wrench
};

// Helper to render icon dynamically
const DynamicIcon = ({ name, size = 20, color }) => {
  const IconComponent = ICON_MAP[name] || Layers; 
  return <IconComponent size={size} color={color} />;
};

// -----------------------
// Style Helpers
// -----------------------
const card = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 16 };
const button = { display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 500 };
const primary = { ...button, background: "#4f46e5", borderColor: "#4f46e5", color: "#fff" };
const dangerBtn = { ...button, background: "#ef4444", borderColor: "#ef4444", color: "#fff" }; // Red button
const input = { height: 40, borderRadius: 10, border: "1px solid #e5e7eb", padding: "0 12px", outline: "none", width: "100%", boxSizing: "border-box", transition: "border 0.2s" };

// -----------------------
// MODAL COMPONENT
// -----------------------
function Modal({ open, title, onClose, children, actions }) {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "grid", placeItems: "center", zIndex: 9999, padding: 16 }} onClick={onClose}>
      <div style={{ ...card, maxWidth: 520, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{title}</h3>
          <button style={{ ...button, padding: 6, border: "none" }} onClick={onClose}><X size={20} color="#64748b" /></button>
        </div>
        <div>{children}</div>
        {actions && <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 24, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>{actions}</div>}
      </div>
    </div>,
    document.body
  );
}

// -----------------------
// MAIN COMPONENT
// -----------------------
export default function Departments() {
  const API_BASE = "http://localhost:8080";
  const access = localStorage.getItem("access");
  const authHeader = access ? { Authorization: `Bearer ${access}` } : {};

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  
  // Create/Edit Modal State
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: "", description: "", icon: "Layers" });
  const [submitting, setSubmitting] = useState(false);
  
  // Icon Search State
  const [iconSearch, setIconSearch] = useState("");

  // 👇 DELETE MODAL STATE
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchDepartments() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/departments/`, { headers: { "Content-Type": "application/json", ...authHeader } });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setRows(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }

  useEffect(() => { fetchDepartments(); }, []);

  // Filter department list
  const filtered = rows.filter(r => r.name.toLowerCase().includes(q.toLowerCase()));

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    return Object.keys(ICON_MAP).filter(key => 
      key.toLowerCase().includes(iconSearch.toLowerCase())
    );
  }, [iconSearch]);

  // Handle CSV Export
  async function handleExportCSV() {
    try {
      const res = await fetch(`${API_BASE}/api/departments/export/`, {
        method: "GET",
        headers: { ...authHeader },
      });
      if (!res.ok) throw new Error("Failed to download CSV");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "departments.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Error exporting CSV: " + e.message);
    }
  }

  async function handleSubmit() {
    if(!formData.name) return alert("Department Name is required");
    setSubmitting(true);
    try {
        const url = isEditing ? `${API_BASE}/api/departments/${formData.id}/` : `${API_BASE}/api/departments/`;
        const method = isEditing ? "PUT" : "POST";
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json", ...authHeader },
            body: JSON.stringify({ 
                name: formData.name, 
                description: formData.description,
                icon: formData.icon 
            })
        });
        if(!res.ok) throw new Error("Operation failed");
        await fetchDepartments();
        setOpen(false);
        setFormData({ id: null, name: "", description: "", icon: "Layers" });
        setIconSearch(""); 
    } catch(e) { alert(e.message); } finally { setSubmitting(false); }
  }

  // 👇 Open Delete Confirmation Modal
  const confirmDelete = (id) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  // 👇 Execute Delete
  async function handleDelete() {
      if (!deleteId) return;
      setDeleting(true);
      try {
          const res = await fetch(`${API_BASE}/api/departments/${deleteId}/`, { method: "DELETE", headers: { ...authHeader } });
          if (!res.ok) throw new Error("Failed to delete");
          setRows(rows.filter(r => r.id !== deleteId));
          setDeleteOpen(false);
      } catch(e) { alert(e.message); } 
      finally { 
        setDeleting(false); 
        setDeleteId(null);
      }
  }

  const openCreate = () => { 
    setIsEditing(false); 
    setFormData({ id: null, name: "", description: "", icon: "Layers" }); 
    setIconSearch(""); 
    setOpen(true); 
  };
  
  const openEdit = (dept) => { 
    setIsEditing(true); 
    setFormData({ id: dept.id, name: dept.name, description: dept.description, icon: dept.icon || "Layers" }); 
    setIconSearch(""); 
    setOpen(true); 
  };

  return (
    <div className="p-4" style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 60 }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1e293b", margin: 0, display:'flex', alignItems:'center', gap: 12 }}>
                <div style={{background: "#e0e7ff", padding: 8, borderRadius: 12, display:"flex"}}>
                  <Layers color="#4f46e5" size={28} />
                </div>
                Departments
            </h1>
            <p style={{ color: "#64748b", margin: "8px 0 0 0", fontSize: 15 }}>Manage your company's organizational structure</p>
        </div>
        
        {/* Buttons Group */}
        <div style={{ display: "flex", gap: 12 }}>
            <button style={button} onClick={handleExportCSV}>
                <Download size={18} /> Export CSV
            </button>
            <button style={primary} onClick={openCreate}>
                <Plus size={18} /> Add Department
            </button>
        </div>
      </div>

      {/* Main Search Toolbar */}
      <div style={{ ...card, marginBottom: 24, display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input style={{ ...input, paddingLeft: 40, height: 44 }} placeholder="Search departments..." value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {/* Grid Display */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>Loading departments...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {filtered.map((r) => (
            <div key={r.id} style={{ ...card, display: "flex", flexDirection: "column", gap: 16, transition: "transform 0.2s, box-shadow 0.2s" }} 
                 onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)"; }}
                 onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f8fafc", display: "grid", placeItems: "center", border: "1px solid #f1f5f9" }}>
                    <DynamicIcon name={r.icon} size={24} color="#334155" />
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{r.name}</h3>
                    <span style={{ fontSize: 12, background: "#f1f5f9", color: "#64748b", padding: "2px 8px", borderRadius: 99 }}>Active</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                   <button style={{ ...button, padding: 8, border: "none", color: "#64748b" }} onClick={() => openEdit(r)}><Edit2 size={16} /></button>
                   {/* 👇 Trigger the delete modal */}
                   <button style={{ ...button, padding: 8, border: "none", color: "#ef4444" }} onClick={() => confirmDelete(r.id)}><Trash2 size={16} /></button>
                </div>
              </div>

              <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.5, flex: 1 }}>
                {r.description || "No description provided."}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ----------------- */}
      {/* CREATE/EDIT MODAL */}
      {/* ----------------- */}
      <Modal open={open} title={isEditing ? "Edit Department" : "New Department"} onClose={() => setOpen(false)}
        actions={
            <>
                <button style={button} onClick={() => setOpen(false)}>Cancel</button>
                <button style={primary} onClick={handleSubmit} disabled={submitting}>{submitting ? "Saving..." : "Save Department"}</button>
            </>
        }>
        <div style={{ display: "grid", gap: 20 }}>
            {/* ICON PICKER WITH SEARCH */}
            <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14, color: "#334155" }}>Choose Icon</label>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ padding: "8px 12px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", display:"flex", alignItems:"center", gap: 8 }}>
                    <Search size={14} color="#64748b"/>
                    <input style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, width: "100%" }} placeholder="Search icons..." value={iconSearch} onChange={(e) => setIconSearch(e.target.value)} />
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: 12, maxHeight: 180, overflowY: "auto", background: "#fff" }}>
                      {filteredIcons.length === 0 && <div style={{ width: "100%", padding: 10, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>No icons found</div>}
                      {filteredIcons.map(iconKey => (
                          <div key={iconKey} onClick={() => setFormData({ ...formData, icon: iconKey })}
                              style={{ cursor: "pointer", width: 40, height: 40, borderRadius: 8, display: "grid", placeItems: "center", background: formData.icon === iconKey ? "#4f46e5" : "#fff", color: formData.icon === iconKey ? "#fff" : "#64748b", border: formData.icon === iconKey ? "1px solid #4f46e5" : "1px solid #e2e8f0", transition: "all 0.2s" }} title={iconKey}>
                              <DynamicIcon name={iconKey} size={20} color="currentColor" />
                          </div>
                      ))}
                  </div>
                </div>
            </div>
            <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14, color: "#334155" }}>Department Name</label>
                <input style={input} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Engineering" />
            </div>
            <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14, color: "#334155" }}>Description</label>
                <textarea style={{ ...input, height: 100, paddingTop: 10, fontFamily: "inherit" }} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the team's responsibilities..." />
            </div>
        </div>
      </Modal>

      {/* ----------------- */}
      {/* DELETE MODAL      */}
      {/* ----------------- */}
      <Modal 
        open={deleteOpen} 
        title="Confirm Deletion" 
        onClose={() => setDeleteOpen(false)}
        actions={
            <>
                <button style={button} onClick={() => setDeleteOpen(false)}>Cancel</button>
                <button style={dangerBtn} onClick={handleDelete} disabled={deleting}>
                    {deleting ? "Deleting..." : "Yes, Delete"}
                </button>
            </>
        }
      >
        <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ background: "#fee2e2", width: 60, height: 60, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <AlertTriangle size={32} color="#dc2626" />
            </div>
            <h4 style={{ margin: "0 0 8px", fontSize: 18, color: "#1f2937" }}>Are you sure?</h4>
            <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
                This action cannot be undone. This will permanently delete the department.
            </p>
        </div>
      </Modal>
    </div>
  );
}