/* ══════════════════════════════════════
   ASCENT — Firebase / Auth module
   Fase 2: separato da index.html
   NOTA: questo file usa ES modules (import/export)
══════════════════════════════════════ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
  import { getFirestore, doc, setDoc, getDoc, onSnapshot }
    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyDQwQ6ApBmMp3GHyTbuoTrvkhS27MG9Dpc",
    authDomain: "ascent-rpd.firebaseapp.com",
    projectId: "ascent-rpd",
    storageBucket: "ascent-rpd.firebasestorage.app",
    messagingSenderId: "195866086195",
    appId: "1:195866086195:web:377218d1dfeddd6aca8c46"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  /* ── Espone le funzioni Firebase globalmente ── */
  window._fb = { auth, db, doc, setDoc, getDoc, onSnapshot,
    createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged,
    GoogleAuthProvider, signInWithPopup };

  /* ── Salva corse su Firestore ── */
  window.fbSaveRuns = async function(runsArray) {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid, "data", "runs"), { runs: runsArray, updatedAt: new Date().toISOString() });
    } catch(e) { console.warn("fbSaveRuns error:", e); }
  };

  /* ── Salva profilo su Firestore ── */
  window.fbSaveProfile = async function(profile) {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid, "data", "profile"), { ...profile, updatedAt: new Date().toISOString() });
    } catch(e) { console.warn("fbSaveProfile error:", e); }
  };

  /* ── Carica corse da Firestore ── */
  window.fbLoadRuns = async function() {
    const user = auth.currentUser;
    if (!user) return null;
    try {
      const snap = await getDoc(doc(db, "users", user.uid, "data", "runs"));
      return snap.exists() ? snap.data().runs : null;
    } catch(e) { console.warn("fbLoadRuns error:", e); return null; }
  };

  /* ── Carica profilo da Firestore ── */
  window.fbLoadProfile = async function() {
    const user = auth.currentUser;
    if (!user) return null;
    try {
      const snap = await getDoc(doc(db, "users", user.uid, "data", "profile"));
      return snap.exists() ? snap.data() : null;
    } catch(e) { console.warn("fbLoadProfile error:", e); return null; }
  };

  /* ── Listener auth state: aggiorna UI e carica dati ── */
  /* ── Aggiorna drawer e pannello profilo ── */
  function updateDrawerAuth(user) {
    const drawerLoggedIn = document.getElementById("drawerProfileLoggedIn");
    const drawerGuest = document.getElementById("drawerProfileGuest");
    const drawerProfileBtn = document.getElementById("drawerProfileBtn");
    const drawerNameEl = document.getElementById("drawerNameLoggedIn");
    const drawerEmailEl = document.getElementById("drawerEmailLoggedIn");
    const drawerAvatarEl = document.getElementById("drawerAvatarLoggedIn");
    const drawerLoginSubtitle = document.getElementById("drawerLoginSubtitle");
    const profileGuestMsg = document.getElementById("profileGuestMsg");
    const profileLoggedInContent = document.getElementById("profileLoggedInContent");

    if (user) {
      if (drawerLoggedIn) drawerLoggedIn.style.display = "flex";
      if (drawerGuest) drawerGuest.style.display = "none";
      if (drawerProfileBtn) drawerProfileBtn.style.display = "flex";
      if (drawerLoginSubtitle) drawerLoginSubtitle.textContent = "Connesso · " + user.email;
      if (drawerEmailEl) drawerEmailEl.textContent = user.email;
      // Aggiorna nome e avatar dal profilo salvato
      const saved = JSON.parse(localStorage.getItem("ascent-profile") || "{}");
      if (drawerNameEl) drawerNameEl.textContent = saved.name || "Runner";
      if (drawerAvatarEl) {
        const initials = (saved.name || user.email).split(" ").map(v=>v[0]).join("").slice(0,2).toUpperCase();
        drawerAvatarEl.textContent = initials;
      }
      if (profileGuestMsg) profileGuestMsg.style.display = "none";
      if (profileLoggedInContent) profileLoggedInContent.style.display = "block";
    } else {
      if (drawerLoggedIn) drawerLoggedIn.style.display = "none";
      if (drawerGuest) drawerGuest.style.display = "flex";
      if (drawerProfileBtn) drawerProfileBtn.style.display = "none";
      if (drawerLoginSubtitle) drawerLoginSubtitle.textContent = "Accedi o crea un account";
      if (profileGuestMsg) profileGuestMsg.style.display = "block";
      if (profileLoggedInContent) profileLoggedInContent.style.display = "none";
    }
  }

  onAuthStateChanged(auth, async (user) => {
    window._fbUser = user || null;

    const loginStatus = document.getElementById("loginStatus");
    const cloudStatus = document.getElementById("cloudStatus");
    const fbUserEmail = document.getElementById("fbUserEmail");
    const fbLogoutBtn = document.getElementById("fbLogoutBtn");
    const fbLoginForm = document.getElementById("fbLoginForm");
    const fbRegisterForm = document.getElementById("fbRegisterForm");
    const fbUserInfo = document.getElementById("fbUserInfo");
    const fbSyncNowBtn = document.getElementById("fbSyncNowBtn");

    if (user) {
      updateDrawerAuth(user);
      if (loginStatus) loginStatus.textContent = "✓ Connesso: " + user.email;
      if (cloudStatus) cloudStatus.textContent = "✓ Sincronizzato";
      if (fbUserEmail) fbUserEmail.textContent = user.email;
      if (fbLoginForm) fbLoginForm.style.display = "none";
      if (fbRegisterForm) fbRegisterForm.style.display = "none";
      if (fbUserInfo) fbUserInfo.style.display = "block";
      if (fbLogoutBtn) fbLogoutBtn.style.display = "inline-block";
      if (fbSyncNowBtn) fbSyncNowBtn.style.display = "inline-block";

      // Carica corse dal cloud
      const cloudRuns = await window.fbLoadRuns();
      if (cloudRuns && cloudRuns.length > 0) {
        if (typeof runs !== "undefined") {
          runs.length = 0;
          cloudRuns.forEach(r => runs.push(r));
          if (typeof rebuildAll === "function") setTimeout(rebuildAll, 200);
        }
      }
      if (typeof showEmptyState === "function") showEmptyState(false);

      // Carica profilo dal cloud
      const cloudProfile = await window.fbLoadProfile();
      if (cloudProfile) {
        localStorage.setItem("ascent-profile", JSON.stringify(cloudProfile));
        const pn = document.getElementById("profileName");
        if (pn && cloudProfile.name) pn.value = cloudProfile.name;
        const pa = document.getElementById("profileAge");
        if (pa && cloudProfile.age) pa.value = cloudProfile.age;
        const pw = document.getElementById("profileWeight");
        if (pw && cloudProfile.weight) pw.value = cloudProfile.weight;
        const ph = document.getElementById("profileHeight");
        if (ph && cloudProfile.height) ph.value = cloudProfile.height;
      }
    } else {
      updateDrawerAuth(null);
      if (loginStatus) loginStatus.textContent = "Non connesso — dati solo locali";
      if (cloudStatus) cloudStatus.textContent = "Non collegato";
      if (fbLoginForm) fbLoginForm.style.display = "block";
      if (fbRegisterForm) fbRegisterForm.style.display = "none";
      if (fbUserInfo) fbUserInfo.style.display = "none";
      if (fbLogoutBtn) fbLogoutBtn.style.display = "none";
      if (fbSyncNowBtn) fbSyncNowBtn.style.display = "none";
      // Svuota dati al logout
      if (typeof runs !== "undefined") {
        runs.length = 0;
        if (typeof rebuildAll === "function") setTimeout(rebuildAll, 100);
      }
      // Ripristina placeholder suggerimenti e obiettivi
      const sg = document.getElementById("sugGrid");
      if(sg && !document.getElementById("sugLockedMsg")){
        sg.innerHTML = `<div id="sugLockedMsg" style="grid-column:1/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 24px;text-align:center;gap:14px;"><div style="font-size:36px;opacity:.5;">🤖</div><div style="font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--text);">Suggerimenti intelligenti</div><div style="font-size:14px;color:var(--text2);max-width:360px;line-height:1.7;">I consigli di allenamento vengono elaborati automaticamente in base ai tuoi dati — distanza, passo, frequenza cardiaca e progressione. Aggiungi le tue corse per attivarli.</div></div>`;
      }
      const gg = document.getElementById("goalsGrid");
      if(gg && !document.getElementById("goalsLockedMsg")){
        gg.innerHTML = `<div id="goalsLockedMsg" style="grid-column:1/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 24px;text-align:center;gap:14px;"><div style="font-size:36px;opacity:.5;">📈</div><div style="font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--text);">Obiettivi personalizzati</div><div style="font-size:14px;color:var(--text2);max-width:360px;line-height:1.7;">Gli obiettivi vengono elaborati in maniera intelligente in base ai dati che fornisci — chilometri, record, sessioni e progressione nel tempo. Carica le tue corse per vederli generare.</div></div>`;
      }
    }
  });

  /* ── Registrazione ── */
  document.addEventListener("DOMContentLoaded", () => {
    const fbRegisterBtn = document.getElementById("fbRegisterBtn");
    const fbShowRegister = document.getElementById("fbShowRegister");
    const fbShowLogin = document.getElementById("fbShowLogin");
    const fbLoginBtn = document.getElementById("fbLoginBtn");
    const fbLogoutBtn = document.getElementById("fbLogoutBtn");
    const fbSyncNowBtn = document.getElementById("fbSyncNowBtn");
    const fbAuthMsg = document.getElementById("fbAuthMsg");

    function showMsg(txt, color) {
      if (fbAuthMsg) { fbAuthMsg.textContent = txt; fbAuthMsg.style.color = color || "var(--text2)"; }
    }

    const fbGoogleBtn = document.getElementById("fbGoogleBtn");
    const fbGoogleRegBtn = document.getElementById("fbGoogleRegBtn");

    async function signInWithGoogle() {
      showMsg("Apertura Google…", "var(--text2)");
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        showMsg("✓ Accesso con Google effettuato!", "var(--green)");
      } catch(e) {
        if (e.code !== "auth/popup-closed-by-user") {
          showMsg("❌ " + e.message, "var(--accent)");
        } else {
          showMsg("", "");
        }
      }
    }

    fbGoogleBtn?.addEventListener("click", signInWithGoogle);
    fbGoogleRegBtn?.addEventListener("click", signInWithGoogle);

    fbShowRegister?.addEventListener("click", () => {
      document.getElementById("fbLoginForm").style.display = "none";
      document.getElementById("fbRegisterForm").style.display = "block";
      showMsg("", "");
    });

    fbShowLogin?.addEventListener("click", () => {
      document.getElementById("fbRegisterForm").style.display = "none";
      document.getElementById("fbLoginForm").style.display = "block";
      showMsg("", "");
    });

    fbLoginBtn?.addEventListener("click", async () => {
      const email = document.getElementById("fbEmail").value.trim();
      const pass = document.getElementById("fbPassword").value;
      if (!email || !pass) { showMsg("⚠️ Inserisci email e password.", "var(--accent)"); return; }
      showMsg("Accesso in corso…", "var(--text2)");
      try {
        await signInWithEmailAndPassword(auth, email, pass);
        showMsg("✓ Accesso effettuato!", "var(--green)");
      } catch(e) {
        showMsg("❌ " + (e.code === "auth/invalid-credential" ? "Email o password errati." : e.message), "var(--accent)");
      }
    });

    fbRegisterBtn?.addEventListener("click", async () => {
      const email = document.getElementById("fbRegEmail").value.trim();
      const pass = document.getElementById("fbRegPassword").value;
      const pass2 = document.getElementById("fbRegPassword2").value;
      if (!email || !pass) { showMsg("⚠️ Inserisci email e password.", "var(--accent)"); return; }
      if (pass !== pass2) { showMsg("⚠️ Le password non coincidono.", "var(--accent)"); return; }
      if (pass.length < 6) { showMsg("⚠️ Password minimo 6 caratteri.", "var(--accent)"); return; }
      showMsg("Creazione account…", "var(--text2)");
      try {
        await createUserWithEmailAndPassword(auth, email, pass);
        showMsg("✓ Account creato e accesso effettuato!", "var(--green)");
      } catch(e) {
        showMsg("❌ " + (e.code === "auth/email-already-in-use" ? "Email già in uso." : e.message), "var(--accent)");
      }
    });

    fbLogoutBtn?.addEventListener("click", async () => {
      await signOut(auth);
      showMsg("Disconnesso.", "var(--text2)");
    });

    fbSyncNowBtn?.addEventListener("click", async () => {
      if (!window._fbUser) { showMsg("Accedi prima.", "var(--accent)"); return; }
      showMsg("Sincronizzazione…", "var(--text2)");
      try {
        if (typeof runs !== "undefined") await window.fbSaveRuns([...runs]);
        const profile = JSON.parse(localStorage.getItem("ascent-profile") || "{}");
        await window.fbSaveProfile(profile);
        showMsg("✓ Dati sincronizzati con il cloud!", "var(--green)");
        setTimeout(() => showMsg("", ""), 4000);
      } catch(e) {
        showMsg("❌ Errore sync: " + e.message, "var(--accent)");
      }
    });
  });