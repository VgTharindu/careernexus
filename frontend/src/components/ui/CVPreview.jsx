import React, { useState } from "react";
import { X, Download, FileText, ExternalLink } from "lucide-react";

function buildUrl(u) {
  if (!u) return null;
  if (u.startsWith("http")) return u;
  if (u.startsWith("/uploads/")) return "http://localhost:5000" + u;
  const fn = u.replace(/\\/g, "/").split("/").pop();
  return "http://localhost:5000/uploads/" + fn;
}

export default function CVPreview({ cvUrl, onClose, studentName }) {
  const [google, setGoogle] = useState(true);
  if (!cvUrl) return null;

  const url   = buildUrl(cvUrl);
  const gurl  = "https://docs.google.com/viewer?url=" + encodeURIComponent(url) + "&embedded=true";
  const src   = google ? gurl : url;
  const label = studentName ? studentName + " CV" : "CV Preview";
  const fname = (studentName || "CV").replace(/\s+/g, "_") + "_CV.pdf";

  async function handleDownload() {
    try {
      const res  = await fetch(url);
      const blob = await res.blob();
      const a    = document.createElement("a");
      a.href     = URL.createObjectURL(blob);
      a.download = fname;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch(e) {
      window.open(url, "_blank");
    }
  }

  const ov  = { position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", padding:"16px" };
  const md  = { width:"100%", maxWidth:"900px", maxHeight:"90vh", display:"flex", flexDirection:"column", borderRadius:"16px", overflow:"hidden", background:"var(--color-bg-card)", border:"1px solid var(--color-border)" };
  const hd  = { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px", borderBottom:"1px solid var(--color-border)" };
  const rw  = { display:"flex", alignItems:"center", gap:"8px" };
  const b1  = { padding:"6px 12px", borderRadius:"8px", fontSize:"12px", fontWeight:"500", cursor:"pointer", border:"none", background:"rgba(0,123,255,0.1)", color:"#007BFF" };
  const b2  = { padding:"6px 12px", borderRadius:"8px", fontSize:"12px", fontWeight:"500", cursor:"pointer", border:"none", display:"flex", alignItems:"center", gap:"4px", background:"linear-gradient(135deg,#007BFF,#00CCCC)", color:"white" };
  const lk  = { padding:"6px 12px", borderRadius:"8px", fontSize:"12px", fontWeight:"500", textDecoration:"none", display:"flex", alignItems:"center", gap:"4px", background:"rgba(0,123,255,0.1)", color:"#007BFF" };
  const bx  = { padding:"6px", borderRadius:"8px", border:"none", cursor:"pointer", background:"transparent", color:"var(--color-text-muted)" };
  const fr  = { flex:1, minHeight:"580px", border:"none", display:"block", background:"#111" };
  const ft  = { padding:"8px 20px", borderTop:"1px solid var(--color-border)", fontSize:"12px", color:"var(--color-text-muted)" };

  return (
    <div onClick={onClose} style={ov}>
      <div onClick={e => e.stopPropagation()} style={md}>
        <div style={hd}>
          <div style={rw}>
            <FileText size={18} color="#007BFF" />
            <span style={{ fontWeight:600, fontSize:"14px", color:"var(--color-text-primary)" }}>{label}</span>
          </div>
          <div style={rw}>
            <button onClick={() => setGoogle(!google)} style={b1}>
              {google ? "Direct View" : "Google Viewer"}
            </button>
            <a href={url} target="_blank" rel="noreferrer" style={lk}>
              <ExternalLink size={12} />
              Open Tab
            </a>
            <button onClick={handleDownload} style={b2}>
              <Download size={12} />
              Download CV
            </button>
            <button onClick={onClose} style={bx}>
              <X size={18} />
            </button>
          </div>
        </div>
        <iframe key={src} src={src} title="CV" style={fr} />
        <div style={ft}>If blank, click Google Viewer or Open Tab above.</div>
      </div>
    </div>
  );
}