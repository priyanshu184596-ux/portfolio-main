/* ============================================
   Preloader - Modern Implementation
   ============================================ */
const preloader = document.getElementById("preloader");
const preloaderStartedAt = performance.now();

function hidePreloader() {
  if (!preloader) return;

  const minimumDisplayTime = 700;
  const elapsed = performance.now() - preloaderStartedAt;
  const delay = Math.max(0, minimumDisplayTime - elapsed);

  setTimeout(() => {
    preloader.classList.add("hidden");
    preloader.addEventListener("transitionend", () => preloader.remove(), {
      once: true,
    });
  }, delay);
}

if (document.readyState === "complete") {
  hidePreloader();
} else {
  window.addEventListener("load", hidePreloader, { once: true });
}

/* ============================================
   Theme Toggle
   ============================================ */
const themeToggle = document.querySelector(".theme-toggle");
const html = document.documentElement;
const themeIcon = themeToggle?.querySelector("i");

function getPreferredTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    return savedTheme;
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function setTheme(theme) {
  html.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  if (themeIcon) {
    themeIcon.className = theme === "dark" ? "fas fa-moon" : "fas fa-sun";
  }
}

// Initialize theme
setTheme(getPreferredTheme());

themeToggle?.addEventListener("click", () => {
  const currentTheme = html.getAttribute("data-theme");
  setTheme(currentTheme === "dark" ? "light" : "dark");
});

/* ============================================
   Mobile Menu
   ============================================ */
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");
let isMenuOpen = false;

// Create mobile menu
const mobileMenu = document.createElement("div");
mobileMenu.className = "mobile-menu";
const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach((link) => {
  const clone = link.cloneNode(true);
  clone.addEventListener("click", () => {
    closeMenu();
  });
  mobileMenu.appendChild(clone);
});
document.querySelector(".navbar").appendChild(mobileMenu);

function toggleMenu() {
  isMenuOpen = !isMenuOpen;
  mobileMenu.classList.toggle("active");
  menuToggle.querySelector("i").className = isMenuOpen
    ? "fas fa-times"
    : "fas fa-bars";
  document.body.style.overflow = isMenuOpen ? "hidden" : "";
}

function closeMenu() {
  isMenuOpen = false;
  mobileMenu.classList.remove("active");
  if (menuToggle) {
    menuToggle.querySelector("i").className = "fas fa-bars";
  }
  document.body.style.overflow = "";
}

menuToggle?.addEventListener("click", toggleMenu);

/* ============================================
   Navbar Scroll Effect
   ============================================ */
const navbar = document.querySelector(".navbar");
let lastScroll = 0;

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;

  // Add/remove scrolled class
  if (currentScroll > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }

  // Hide/show navbar on scroll
  if (currentScroll > lastScroll && currentScroll > 200) {
    navbar.style.transform = "translateY(-100%)";
  } else {
    navbar.style.transform = "translateY(0)";
  }

  lastScroll = currentScroll;
});

/* ============================================
   Active Navigation Link
   ============================================ */
const sections = document.querySelectorAll("section[id]");
const allNavLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 200;
    if (window.pageYOffset >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  allNavLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

/* ============================================
   Counter Animation
   ============================================ */
const counters = document.querySelectorAll(".stat-number");

function animateCounter(counter) {
  const target = parseInt(counter.getAttribute("data-target"));
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const updateCounter = () => {
    current += step;
    if (current < target) {
      counter.textContent = Math.floor(current) + "+";
      requestAnimationFrame(updateCounter);
    } else {
      counter.textContent = target + "+";
    }
  };

  updateCounter();
}

// Intersection Observer for counters
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 },
);

counters.forEach((counter) => counterObserver.observe(counter));

/* ============================================
   Skill Bars Animation
   ============================================ */
const skillBars = document.querySelectorAll(".skill-progress");

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.style.width;
        bar.style.width = "0%";

        setTimeout(() => {
          bar.style.width = width;
        }, 100);

        skillObserver.unobserve(bar);
      }
    });
  },
  { threshold: 0.5 },
);

skillBars.forEach((bar) => {
  skillObserver.observe(bar);
  // Store the original width
  const originalWidth = bar.style.width;
  bar.style.width = "0%";
  bar.dataset.originalWidth = originalWidth;
});

// Re-animate on scroll for better UX
window.addEventListener("scroll", () => {
  skillBars.forEach((bar) => {
    const rect = bar.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

    if ((isVisible && bar.style.width === "0%") || bar.style.width === "0px") {
      setTimeout(() => {
        bar.style.width = bar.dataset.originalWidth || "0%";
      }, 200);
    }
  });
});

/* ============================================
   Project Filter
   ============================================ */
const filterBtns = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Update active button
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;

    projectCards.forEach((card) => {
      const category = card.dataset.category;

      if (filter === "all" || category === filter) {
        card.style.display = "block";
        card.style.animation = "fadeInUp 0.6s ease forwards";
      } else {
        card.style.display = "none";
      }
    });
  });
});

/* ============================================
   Contact Form
   ============================================ */
const contactForm = document.getElementById("contactForm");

contactForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get form data
  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData);

  // Simple validation
  let isValid = true;
  const inputs = contactForm.querySelectorAll(
    "input[required], textarea[required]",
  );

  inputs.forEach((input) => {
    if (!input.value.trim()) {
      isValid = false;
      input.style.borderColor = "#ff6584";
    } else {
      input.style.borderColor = "";
    }
  });

  if (isValid) {
    const submitBtn = contactForm.querySelector(".btn-primary");
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
    submitBtn.disabled = true;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to send your message.");
      }

      submitBtn.innerHTML = 'Message Sent! <i class="fas fa-check"></i>';
      contactForm.reset();
    } catch (error) {
      submitBtn.innerHTML =
        'Try Again <i class="fas fa-exclamation-circle"></i>';
      console.error(error);
    } finally {
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 3000);
    }
  }
});

/* ============================================
   Scroll Reveal Animations
   ============================================ */
const revealElements = document.querySelectorAll(
  ".skill-category, .project-card, .testimonial-card, .contact-card, .about-content > *",
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }, index * 100);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 },
);

revealElements.forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(30px)";
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  revealObserver.observe(el);
});

/* ============================================
   Smooth Scroll for Anchor Links
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      const headerOffset = 70;
      const elementPosition = target.offsetTop;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  });
});

/* ============================================
   Custom Cursor Effect (Optional)
   ============================================ */
const cursor = document.createElement("div");
cursor.className = "custom-cursor";
document.body.appendChild(cursor);

const cursorFollower = document.createElement("div");
cursorFollower.className = "cursor-follower";
document.body.appendChild(cursorFollower);

// Add custom cursor styles
const cursorStyles = document.createElement("style");
cursorStyles.textContent = `
    .custom-cursor {
        width: 8px;
        height: 8px;
        background: var(--primary);
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        transition: width 0.2s, height 0.2s, background 0.2s;
    }
    
    .cursor-follower {
        width: 40px;
        height: 40px;
        border: 2px solid var(--primary);
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        z-index: 9998;
        transform: translate(-50%, -50%);
        transition: all 0.15s ease;
        opacity: 0.5;
    }
    
    .custom-cursor.hover {
        width: 12px;
        height: 12px;
        background: var(--accent);
    }
    
    .cursor-follower.hover {
        width: 60px;
        height: 60px;
        border-color: var(--accent);
        opacity: 0.3;
    }
    
    @media (max-width: 768px) {
        .custom-cursor,
        .cursor-follower {
            display: none;
        }
    }
`;
document.head.appendChild(cursorStyles);

document.addEventListener("mousemove", (e) => {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";

  setTimeout(() => {
    cursorFollower.style.left = e.clientX + "px";
    cursorFollower.style.top = e.clientY + "px";
  }, 50);
});

// Add hover effect on interactive elements
document.querySelectorAll("a, button, input, textarea").forEach((el) => {
  el.addEventListener("mouseenter", () => {
    cursor.classList.add("hover");
    cursorFollower.classList.add("hover");
  });

  el.addEventListener("mouseleave", () => {
    cursor.classList.remove("hover");
    cursorFollower.classList.remove("hover");
  });
});

/* ============================================
   Console Welcome Message
   ============================================ */
console.log(
  "%c Portfolio Website ",
  "background: linear-gradient(135deg, #6c63ff, #ff6584); color: white; font-size: 20px; font-weight: bold; padding: 10px 20px; border-radius: 5px;",
);
console.log(
  "%c Built with ❤️ using HTML, CSS & JavaScript ",
  "color: #6c63ff; font-size: 14px;",
);
