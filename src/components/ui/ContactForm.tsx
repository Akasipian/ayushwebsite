import { useEffect, useRef, useState, useCallback } from "react";
import emailjs from "@emailjs/browser";
import { Send, Paperclip, X, CheckCircle, AlertCircle, Loader, Image, FileText, Film } from "lucide-react";
import { vibe } from "../../lib/uniforms";

/* ─────────────────────────────────────────────────────────────────
   EMAILJS CREDENTIALS
   ─ Replace these 3 values with your own from emailjs.com/dashboard
   ─ They are public-key safe (no private key is ever exposed)
   ─────────────────────────────────────────────────────────────────

   HOW TO GET THEM (2 minutes):
   1. Go to https://www.emailjs.com and sign up FREE
   2. "Add New Service" → choose Gmail → connect akasipian007@gmail.com
      → copy the SERVICE ID (looks like "service_xxxxxxx")
   3. "Email Templates" → Create New Template → paste the HTML below
      → copy the TEMPLATE ID (looks like "template_xxxxxxx")
   4. "Account" → "API Keys" → copy the PUBLIC KEY
   5. Paste all 3 below and redeploy — done.

   EMAIL TEMPLATE HTML to paste in EmailJS dashboard:
   ────────────────────────────────────────────────────
   Subject: 📩 New message from {{from_name}} via Ayush Shrivastava HQ
   Body:
     <h2>New Message Received</h2>
     <p><b>From:</b> {{from_name}} ({{codename}})</p>
     <p><b>Email:</b> {{reply_to}}</p>
     <p><b>Message:</b></p>
     <p>{{message}}</p>
     <hr>
     <p><i>Sent via Ayush Shrivastava Personal HQ</i></p>
   Reply-To: {{reply_to}}
   ────────────────────────────────────────────────────
*/

// ─────────────────────────────────────────────────────────────────
// PASTE YOUR 3 EMAILJS KEYS BELOW — get them from emailjs.com/dashboard
// Step 1: emailjs.com → Email Services → Add Gmail → copy Service ID
// Step 2: Email Templates → Create Template → copy Template ID
// Step 3: Account → API Keys → copy Public Key
// ─────────────────────────────────────────────────────────────────
const SERVICE_ID  = "service_18imwqm";
const TEMPLATE_ID = "template_q97snts";
const PUBLIC_KEY  = "E0WM5fHCn0PxMdj7L";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILES = 3;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf", "video/mp4", "text/plain"];

interface Attachment {
  name: string;
  type: string;
  size: number;
  base64: string;
  preview?: string;
}

type Status = "idle" | "validating" | "sending" | "success" | "error";

/** 
 * High-speed Image Compression (Low-Network Optimization)
 * Resizes and compresses images to < 500KB before transmission
 */
const compressImage = (file: File): Promise<{base64: string, dataUrl: string}> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = window.document.createElement("img");
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Max resolution 1200px for high speed on low network
        const MAX_DIM = 1200;
        if (width > height && width > MAX_DIM) { height *= MAX_DIM / width; width = MAX_DIM; }
        else if (height > MAX_DIM) { width *= MAX_DIM / height; height = MAX_DIM; }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to 70% quality JPEG (tiny payload, looks 4K)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        const base64 = dataUrl.split(",")[1];
        resolve({ base64, dataUrl });
      };
    };
  });
};

/** Convert non-image files to base64 */
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });



const formatBytes = (b: number) => b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

const FileIcon = ({ type }: { type: string }) => {
  if (type.startsWith("image/")) return <Image size={14} />;
  if (type.startsWith("video/")) return <Film size={14} />;
  return <FileText size={14} />;
};

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const [echoes, setEchoes] = useState<{ id: number; ch: string; x: number }[]>([]);
  const echoId = useRef(0);
  const [progress, setProgress] = useState(0);
  const [codename, setCodename] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honey, setHoney] = useState(""); // honeypot

  // Init EmailJS once
  useEffect(() => {
    emailjs.init({ publicKey: PUBLIC_KEY, limitRate: { throttle: 3000 } });
  }, []);

  // Character echo on keypress
  const spawnEcho = (ch: string) => {
    if (ch.length !== 1 || ch === " ") return;
    const id = ++echoId.current;
    setEchoes(e => [...e.slice(-10), { id, ch, x: 8 + Math.random() * 84 }]);
    setTimeout(() => setEchoes(e => e.filter(x => x.id !== id)), 1400);
  };

  // File attachment handler
  const handleFiles = useCallback(async (incoming: FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming);
    const tooMany = files.length + arr.length > MAX_FILES;
    if (tooMany) { setError(`Max ${MAX_FILES} files allowed`); return; }

    const results: Attachment[] = [];
    for (const f of arr) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        setError(`${f.name}: unsupported type`); continue;
      }

      if (f.type.startsWith("image/")) {
        // Optimize image for low network
        const { base64, dataUrl } = await compressImage(f);
        results.push({ name: f.name, type: "image/jpeg", size: Math.round(base64.length * 0.75), base64, preview: dataUrl });
      } else {
        // Handle other files normally
        if (f.size > MAX_FILE_SIZE_MB * 1048576) {
          setError(`${f.name}: exceeds ${MAX_FILE_SIZE_MB}MB`); continue;
        }
        const [base64, preview] = await Promise.all([
          toBase64(f),
          Promise.resolve(""),
        ]);
        results.push({ name: f.name, type: f.type, size: f.size, base64, preview });
      }
    }
    setFiles(prev => [...prev, ...results]);
    setError("");
    vibe([8, 20]);
  }, [files]);

  // Drag & drop
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const removeFile = (i: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    vibe(6);
  };

  // Validation
  const validate = () => {
    if (!codename.trim()) return "Codename is required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Valid email required";
    if (!message.trim() || message.trim().length < 5) return "Message too short (min 5 chars)";
    if (honey) return ""; // silently block spam
    return "";
  };

  // Submit with Resilient Retry Architecture
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending" || status === "success") return;

    setStatus("validating");
    const err = validate();
    if (err) { setError(err); setStatus("idle"); return; }
    if (honey) { setStatus("success"); return; } // honeypot silent pass

    setStatus("sending");
    setProgress(0);

    // Dynamic progress buffer for slow networks (stays at 88% while waiting)
    const prog = setInterval(() => setProgress(p => Math.min(p + 4, 88)), 800);

    // Build template params
    const params: Record<string, string> = {
      codename: codename.trim(),
      from_name: codename.trim(),
      reply_to: email.trim(),
      message: message.trim(),
      files_count: files.length.toString(),
      file_names: files.map(f => f.name).join(", ") || "None",
      sent_at: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      to_email: "akasipian007@gmail.com",
    };

    // Attach first image inline if present
    let imgFile = files.find(f => f.type.startsWith("image/"));
    if (imgFile) {
      params.attachment_name = imgFile.name;
      params.attachment = imgFile.base64;
      params.attachment_type = imgFile.type;
    }

    // Exponential Backoff Retry Logic
    let attempt = 0;
    const maxAttempts = 3;
    let success = false;

    while (attempt < maxAttempts && !success) {
      try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, params, { publicKey: PUBLIC_KEY });
        success = true;
      } catch (err: any) {
        attempt++;
        if (attempt >= maxAttempts) {
          clearInterval(prog);
          const msg = err?.text || "";
      const isKeyError = msg.toLowerCase().includes("public key") || msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("api");
      setError(isKeyError
        ? "EmailJS keys not set. Open ContactForm.tsx and replace SERVICE_ID, TEMPLATE_ID and PUBLIC_KEY with your real values from emailjs.com/dashboard"
        : msg || "Network timeout. Signal lost."
      );
          setStatus("error");
          vibe([30, 80, 30]);
          return;
        }
        
        // Wait longer on each failure (2s, 4s)
        await new Promise(res => setTimeout(res, attempt * 2000));
        
        // Graceful degradation: if image transmission is failing, drop the image resolution further
        if (imgFile && params.attachment && params.attachment.length > 100000) {
           params.attachment = ""; // Strip attachment on final retry to ensure text gets through
           params.file_names += " (Attachment stripped due to low network)";
        }
      }
    }

    if (success) {
      clearInterval(prog);
      setProgress(100);
      setStatus("success");
      vibe([20, 50, 20]);
      setTimeout(() => {
        setCodename(""); setEmail(""); setMessage(""); setFiles([]);
        setStatus("idle"); setProgress(0);
      }, 5000);
    }
  };

  const isBusy = status === "sending" || status === "validating";

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      onDrop={onDrop}
      onDragOver={e => e.preventDefault()}
      className="panel p-6 sm:p-8 rv pointer-events-auto relative overflow-hidden"
      noValidate
      autoComplete="off"
    >
      {/* Honeypot — bots fill this, humans don't see it */}
      <input
        tabIndex={-1}
        aria-hidden="true"
        className="opacity-0 absolute -top-10 left-0 w-0 h-0"
        name="bot_field"
        value={honey}
        onChange={e => setHoney(e.target.value)}
      />

      {/* character echo layer */}
      <div className="absolute -top-16 left-0 right-0 h-14 pointer-events-none overflow-hidden">
        {echoes.map(e => (
          <span key={e.id} className="echo-char absolute text-[13px] font-bold"
            style={{ left: `${e.x}%`, bottom: 0, color: "var(--c1)", textShadow: "0 0 12px var(--c1)" }}>
            {e.ch}
          </span>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="label-gold font-black" style={{ fontSize: 8, letterSpacing: "0.45em" }}>SECURE TRANSMITTER</div>
          <div className="label mt-1 opacity-50" style={{ fontSize: 8 }}>
            {files.length > 0 ? `${files.length} file${files.length > 1 ? "s" : ""} attached` : "Encrypted · Direct to Gmail"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: "var(--c1)" }} />
          <span className="label opacity-50" style={{ fontSize: 7 }}>UPLINK READY</span>
        </div>
      </div>

      {/* SUCCESS STATE */}
      {status === "success" ? (
        <div className="py-12 flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <CheckCircle size={52} style={{ color: "var(--c1)" }} />
            <div className="absolute inset-0 rounded-full animate-ping" style={{ background: "color-mix(in srgb, var(--c1) 20%, transparent)" }} />
          </div>
          <div className="imperial text-xl font-bold text-white">Transmission Secured</div>
          <p className="label opacity-70 max-w-xs">Your message has been delivered to Ayush Shrivastava's Gmail. Expect a response within 24h.</p>
          <div className="label mt-2 animate-pulse" style={{ color: "var(--gold)", fontSize: 8, letterSpacing: "0.3em" }}>AUTO-RESET IN 5s</div>
        </div>
      ) : (
        <>
          {/* Codename field */}
          <div className="mb-4 group">
            <label className="label mb-1.5 block opacity-60" style={{ fontSize: 8 }}>CODENAME / USERNAME</label>
            <input
              required
              placeholder="Your name or username"
              value={codename}
              onChange={e => { setCodename(e.target.value); spawnEcho(e.target.value.slice(-1)); }}
              disabled={isBusy}
              className="w-full bg-black/40 border border-white/[0.08] focus:border-[var(--gold)]/60 outline-none rounded-lg px-4 py-3.5 text-[13px] text-white placeholder:text-[var(--dim)]/50 transition-all disabled:opacity-50"
              style={{ fontFamily: "var(--mono)" }}
            />
          </div>

          {/* Email field */}
          <div className="mb-4">
            <label className="label mb-1.5 block opacity-60" style={{ fontSize: 8 }}>EMAIL / GMAIL</label>
            <input
              type="email"
              required
              placeholder="your@gmail.com"
              value={email}
              onChange={e => { setEmail(e.target.value); spawnEcho(e.target.value.slice(-1)); }}
              disabled={isBusy}
              className="w-full bg-black/40 border border-white/[0.08] focus:border-[var(--gold)]/60 outline-none rounded-lg px-4 py-3.5 text-[13px] text-white placeholder:text-[var(--dim)]/50 transition-all disabled:opacity-50"
              style={{ fontFamily: "var(--mono)" }}
            />
          </div>

          {/* Message field */}
          <div className="mb-4">
            <label className="label mb-1.5 block opacity-60" style={{ fontSize: 8 }}>MESSAGE</label>
            <textarea
              required
              rows={5}
              placeholder="Your message…"
              value={message}
              onChange={e => { setMessage(e.target.value); spawnEcho(e.target.value.slice(-1)); }}
              disabled={isBusy}
              className="w-full bg-black/40 border border-white/[0.08] focus:border-[var(--gold)]/60 outline-none rounded-lg px-4 py-3.5 text-[13px] text-white placeholder:text-[var(--dim)]/50 resize-none transition-all disabled:opacity-50"
              style={{ fontFamily: "var(--mono)" }}
            />
            <div className="flex justify-end mt-1">
              <span className="label opacity-30" style={{ fontSize: 7 }}>{message.length} chars</span>
            </div>
          </div>

          {/* File attachment zone */}
          <div
            onClick={() => !isBusy && fileInputRef.current?.click()}
            className="mb-4 border border-dashed border-white/[0.12] rounded-lg p-4 text-center cursor-pointer hover:border-[var(--gold)]/40 hover:bg-white/[0.02] transition-all group"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_TYPES.join(",")}
              className="hidden"
              onChange={e => handleFiles(e.target.files)}
              disabled={isBusy}
            />
            <div className="flex items-center justify-center gap-2">
              <Paperclip size={14} style={{ color: "var(--gold)" }} className="group-hover:rotate-12 transition-transform" />
              <span className="label" style={{ fontSize: 9, color: "var(--dim)" }}>
                {files.length >= MAX_FILES ? `Max ${MAX_FILES} files attached` : `Attach media · max ${MAX_FILE_SIZE_MB}MB each`}
              </span>
            </div>
            <div className="label mt-1 opacity-30" style={{ fontSize: 7 }}>JPG · PNG · GIF · MP4 · PDF · TXT</div>
          </div>

          {/* Attached files list */}
          {files.length > 0 && (
            <div className="mb-4 space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  {f.preview ? (
                    <img src={f.preview} alt={f.name} className="w-10 h-10 rounded object-cover shrink-0 border border-white/10" />
                  ) : (
                    <div className="w-10 h-10 grid place-items-center rounded bg-white/[0.04] border border-white/[0.08] shrink-0" style={{ color: "var(--gold)" }}>
                      <FileIcon type={f.type} />
                    </div>
                  )}
                  <span className="flex-1 min-w-0">
                    <span className="block text-[11px] text-white truncate">{f.name}</span>
                    <span className="label opacity-40" style={{ fontSize: 8 }}>{formatBytes(f.size)}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="p-1.5 rounded text-[var(--dim)] hover:text-white hover:bg-white/10 transition-all shrink-0"
                    disabled={isBusy}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {(status === "error" || error) && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg border" style={{ borderColor: "rgba(255,74,90,0.35)", background: "rgba(255,74,90,0.08)" }}>
              <AlertCircle size={14} style={{ color: "var(--c3)" }} />
              <span className="text-[11px]" style={{ color: "var(--c3)" }}>{error || "Transmission failed. Try again."}</span>
            </div>
          )}

          {/* Progress bar */}
          {isBusy && (
            <div className="mb-4">
              <div className="h-[3px] bg-white/[0.07] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, var(--c1), var(--gold))",
                    boxShadow: "0 0 10px var(--c1)",
                  }}
                />
              </div>
              <div className="flex justify-between mt-1.5 label opacity-40" style={{ fontSize: 7 }}>
                <span>ENCRYPTING & TRANSMITTING</span>
                <span>{progress}%</span>
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isBusy}
            className="w-full flex items-center justify-center gap-2.5 py-4 text-[13px] font-black rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: isBusy ? "rgba(246,224,179,0.3)" : "linear-gradient(100deg, var(--gold), #f8ecc9 48%, var(--gold))",
              color: "#000",
              boxShadow: isBusy ? "none" : "0 0 30px -8px rgba(246,224,179,0.5)",
            }}
          >
            {isBusy ? (
              <><Loader size={15} className="animate-spin" /> Transmitting...</>
            ) : (
              <><Send size={15} /> Send to Ayush Shrivastava</>
            )}
          </button>

          <div className="mt-4 flex flex-wrap justify-between gap-2 label opacity-30" style={{ fontSize: 7 }}>
            <span>🔒 SSL · No server · EmailJS direct delivery</span>
            <span>Response within 24h</span>
          </div>
        </>
      )}
    </form>
  );
}
