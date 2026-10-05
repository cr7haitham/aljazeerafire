(() => {
  const SECTORS = {
    All: { en: "All", ar: "الكل" },
    Industrial: { en: "Industrial", ar: "صناعي" },
    Commercial: { en: "Commercial", ar: "تجاري" },
    Infrastructure: { en: "Infrastructure", ar: "بنية تحتية" },
    Healthcare: { en: "Healthcare", ar: "صحي" },
    Hospitality: { en: "Hospitality", ar: "ضيافة" },
    Education: { en: "Education", ar: "تعليمي" },
  };

  const clean = (value) => {
    if (value == null) return "";
    const text = String(value).trim();
    if (!text || text === "undefined" || text === "null") return "";
    return text;
  };

  const getLang = () => {
    try {
      return localStorage.getItem("site-lang") === "en" ? "en" : "ar";
    } catch (e) {
      return document.documentElement.getAttribute("data-lang") === "en" ? "en" : "ar";
    }
  };

  const applyLang = (lang) => {
    const next = lang === "en" ? "en" : "ar";
    try {
      localStorage.setItem("site-lang", next);
    } catch (e) {}
    const root = document.documentElement;
    root.setAttribute("lang", next);
    root.setAttribute("data-lang", next);
    root.setAttribute("dir", next === "ar" ? "rtl" : "ltr");
    document.body.classList.toggle("is-en", next === "en");
    document.body.classList.toggle("is-ar", next === "ar");
    document.querySelectorAll(".lang-switch [data-lang]").forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === next));
    });
    const title = document.querySelector("title");
    if (title) {
      title.textContent =
        next === "ar"
          ? "إطفاء الجزيرة | أنظمة السلامة والحماية من الحريق"
          : "Itfa Al Jazeera | Safety and fire protection systems";
    }
    return next;
  };

  window.applySiteLang = applyLang;

  let currentSector = "All";
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  const modal = document.getElementById("modal");
  const modalBody = document.getElementById("modal-body");
  const closeBtn = document.querySelector(".modal-close");

  applyLang(getLang());

  document.addEventListener("click", (e) => {
    const langBtn = e.target.closest(".lang-switch [data-lang]");
    if (langBtn) {
      e.preventDefault();
      applyLang(langBtn.getAttribute("data-lang"));
      renderProjects(currentSector);
      return;
    }
    if (e.target.closest(".nav-toggle")) {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    }
    if (e.target.closest(".nav a")) {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".nav a[href^='#']")];
  const setActive = () => {
    const y = window.scrollY + 90;
    let current = sections[0]?.id;
    for (const s of sections) {
      if (s.offsetTop <= y) current = s.id;
    }
    navLinks.forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === `#${current}`);
    });
  };
  window.addEventListener("scroll", setActive, { passive: true });
  setActive();

  const openModal = (html) => {
    modalBody.innerHTML = html;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    closeBtn.focus();
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  closeBtn?.addEventListener("click", closeModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  document.querySelectorAll("[data-lightbox]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-src") || "";
      const lang = getLang();
      const title = clean(
        lang === "ar"
          ? btn.getAttribute("data-title-ar") || btn.getAttribute("data-title")
          : btn.getAttribute("data-title-en") || btn.getAttribute("data-title")
      );
      const download = btn.hasAttribute("data-download");
      const dl = lang === "ar" ? "تحميل المستند" : "Download document";
      openModal(`
        ${title ? `<h3 id="modal-title">${title}</h3>` : `<h3 id="modal-title" class="visually-hidden">${lang === "ar" ? "عرض" : "Preview"}</h3>`}
        <img src="${src}" alt="${title}">
        ${download ? `<p><a class="btn btn-primary" href="${src}" download>${dl}</a></p>` : ""}
      `);
    });
  });

  const projectData = window.PROJECTS || [];
  const grid = document.getElementById("project-grid");
  const filters = document.getElementById("project-filters");

  const labelOf = (p, lang) => clean(lang === "ar" ? p.nameAr || p.name : p.name || p.nameAr);
  const sectorOf = (key, lang) => (SECTORS[key] ? SECTORS[key][lang] : clean(key));

  const renderProjects = (sector = "All") => {
    if (!grid) return;
    currentSector = sector || "All";
    const lang = getLang();
    const list =
      currentSector === "All" ? projectData : projectData.filter((p) => p.sector === currentSector);
    grid.innerHTML = list
      .map(
        (p) => `
      <article class="project-card">
        <h3>${labelOf(p, lang)}</h3>
        <div class="tag">${sectorOf(p.sector, lang)}</div>
      </article>`
      )
      .join("");

    if (filters && !filters.dataset.bound) {
      const keys = ["All", ...[...new Set(projectData.map((p) => p.sector).filter(Boolean))]];
      filters.innerHTML = keys
        .map(
          (s, i) =>
            `<button class="filter-btn" type="button" data-sector="${s}" aria-pressed="${i === 0}"><span lang="ar">${sectorOf(s, "ar")}</span><span lang="en">${sectorOf(s, "en")}</span></button>`
        )
        .join("");
      filters.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-sector]");
        if (!btn) return;
        filters.querySelectorAll(".filter-btn").forEach((b) => b.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
        renderProjects(btn.getAttribute("data-sector"));
      });
      filters.dataset.bound = "true";
    }
  };

  window.renderProjects = renderProjects;
  renderProjects("All");
})();
