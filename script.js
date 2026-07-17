/* ==========================================================================
   UNI FLOW — script.js
   All interactivity: nav, reveal animations, WhatsApp order form validation,
   floating elements and utility UI animations.
   ========================================================================== */

const WHATSAPP_NUMBER = "94719608054"; // ඔබේ නව දුරකථන අංකය ඇතුලත් කරන ලදී (No + or leading 0)

document.addEventListener("DOMContentLoaded", () => {

  /* ---------------------------------------------------------------------
     1. PRELOADER
     --------------------------------------------------------------------- */
  const preloader = document.getElementById("preloader");
  window.addEventListener("load", () => {
    setTimeout(() => preloader && preloader.classList.add("hidden"), 400);
  });
  setTimeout(() => preloader && preloader.classList.add("hidden"), 2500);

  /* ---------------------------------------------------------------------
     2. STICKY HEADER + ACTIVE LINK HIGHLIGHT
     --------------------------------------------------------------------- */
  const header = document.getElementById("siteHeader");
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  const backToTop = document.getElementById("backToTop");

  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 40);

    let current = "hero";
    const scrollPos = window.scrollY + window.innerHeight * 0.35;
    sections.forEach((sec) => {
      if (scrollPos >= sec.offsetTop) current = sec.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle("active-link", link.dataset.section === current);
    });

    if (backToTop) {
      backToTop.classList.toggle("visible", window.scrollY > 500);
    }
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------------
     3. MOBILE HAMBURGER MENU
     --------------------------------------------------------------------- */
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navMenu = document.getElementById("navMenu");

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      hamburgerBtn.classList.toggle("open", isOpen);
      hamburgerBtn.setAttribute("aria-expanded", isOpen);
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        hamburgerBtn.classList.remove("open");
        hamburgerBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------------------
     4. SCROLL REVEAL ANIMATIONS
     --------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------------------------------------------------------------------
     5. ANIMATED COUNTERS
     --------------------------------------------------------------------- */
  const counters = document.querySelectorAll(".stat-number");
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || "";
        const duration = 1600;
        const startTime = performance.now();

        function tick(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => counterObserver.observe(el));

  /* ---------------------------------------------------------------------
     6. FAQ ACCORDION
     --------------------------------------------------------------------- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const question = item.querySelector(".faq-question");
    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((openItem) => {
        openItem.classList.remove("open");
        openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        question.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------------------------------------------------------------------
     7. ORDER FORM — VALIDATION + WHATSAPP SUBMISSION
     --------------------------------------------------------------------- */
  const orderForm = document.getElementById("orderForm");

  function setFieldError(id, isInvalid) {
    const field = document.getElementById(id);
    if (field) {
      const group = field.closest(".form-group");
      if (group) group.classList.toggle("invalid", isInvalid);
    }
  }

  function validateOrderForm(data) {
    let valid = true;

    if (!data.custName || data.custName.trim().length < 2) {
      setFieldError("custName", true); valid = false;
    } else setFieldError("custName", false);

    if (!data.custAddress || data.custAddress.trim().length < 5) {
      setFieldError("custAddress", true); valid = false;
    } else setFieldError("custAddress", false);

    const qty = Number(data.custQty);
    if (!data.custQty || !Number.isInteger(qty) || qty < 1) {
      setFieldError("custQty", true); valid = false;
    } else setFieldError("custQty", false);

    const phoneDigits = data.custPhone.replace(/\D/g, "");
    const phoneValid = /^[0-9]{9,10}$/.test(phoneDigits);
    if (!phoneValid) {
      setFieldError("custPhone", true); valid = false;
    } else setFieldError("custPhone", false);

    return valid;
  }

  if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = {
        custName: document.getElementById("custName").value,
        custAddress: document.getElementById("custAddress").value,
        custQty: document.getElementById("custQty").value,
        custPhone: document.getElementById("custPhone").value,
        custCalc: document.getElementById("custCalc").value
      };

      if (!validateOrderForm(data)) {
        showToast("Please fill in all details correctly.", true);
        return;
      }

      // WhatsApp Message Setup
      const message =
        `-----------------------------------------\n` +
        `🛒 NEW ORDER - UNI FLOW\n\n` +
        `👤 Name: ${data.custName.trim()}\n` +
        `📍 Address: ${data.custAddress.trim()}\n` +
        `📦 Quantity: ${data.custQty}\n` +
        `🧮 Calculator: ${data.custCalc.trim()}\n` +
        `📞 Phone: ${data.custPhone.trim()}\n` +
        `-----------------------------------------`;

      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener");

      showToast("Order ready! Opening WhatsApp...");
      orderForm.reset();
      // Keep selected calculator read-only text default
      document.getElementById("custCalc").value = "Casio FX-991ES Plus 2nd Edition";
    });

    // Clear error style live on input
    ["custName", "custAddress", "custQty", "custPhone"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", (e) => {
          e.target.closest(".form-group").classList.remove("invalid");
        });
      }
    });

    // Block non-digits in quantity
    document.getElementById("custQty").addEventListener("keypress", (e) => {
      if (!/[0-9]/.test(e.key)) e.preventDefault();
    });

    // Limit characters for phone number
    document.getElementById("custPhone").addEventListener("keypress", (e) => {
      if (!/[0-9+\-\s]/.test(e.key)) e.preventDefault();
    });
  }

  /* ---------------------------------------------------------------------
     8. TOAST NOTIFICATIONS
     --------------------------------------------------------------------- */
  const toast = document.getElementById("toast");
  let toastTimeout;
  function showToast(msg, isError = false) {
    if (!toast) return;
    clearTimeout(toastTimeout);
    toast.textContent = msg;
    toast.classList.toggle("error", isError);
    toast.classList.add("show");
    toastTimeout = setTimeout(() => toast.classList.remove("show"), 3200);
  }

  /* ---------------------------------------------------------------------
     9. BACK TO TOP BUTTON
     --------------------------------------------------------------------- */
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

});