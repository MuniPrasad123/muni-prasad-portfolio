document.addEventListener("DOMContentLoaded", () => {
  // Mobile Navigation Menu Toggle
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", !expanded);
      navLinks.classList.toggle("active");
    });

    // Close menu when clicking navigation links
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.setAttribute("aria-expanded", "false");
        navLinks.classList.remove("active");
      });
    });
  }

  // Header Scroll Class Modification (Shrink & blur increase)
  const header = document.getElementById("header");
  const handleHeaderScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  };
  window.addEventListener("scroll", handleHeaderScroll);
  handleHeaderScroll(); // Trigger on load in case page starts scrolled

  // Inject Current Year in Footer
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Scroll Reveal Observer (Fade Up Animations)
  const revealElements = document.querySelectorAll(".reveal-up");
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target); // Stop tracking once revealed
        }
      });
    },
    {
      threshold: 0.05,
      rootMargin: "0px 0px -40px 0px",
    }
  );
  revealElements.forEach((el) => revealObserver.observe(el));

  // Statistics Incremental Counter Animation
  const statValues = document.querySelectorAll(".stat-value[data-target]");
  const countDuration = 2000; // Animation length in ms

  const animateCount = (el) => {
    const target = parseInt(el.getAttribute("data-target"), 10);
    const start = 0;
    const increment = target / (countDuration / 16); // 16ms is ~60fps
    let current = start;

    const updateCount = () => {
      current += increment;
      if (current >= target) {
        el.textContent = target;
      } else {
        el.textContent = Math.floor(current);
        requestAnimationFrame(updateCount);
      }
    };
    requestAnimationFrame(updateCount);
  };

  const statsSection = document.querySelector(".quick-stats");
  if (statsSection) {
    const statsObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            statValues.forEach((val) => animateCount(val));
            observer.unobserve(entry.target); // Animate once
          }
        });
      },
      { threshold: 0.2 }
    );
    statsObserver.observe(statsSection);
  }

  // Timeline Scroll Tracking Bar
  const timelineContainer = document.querySelector(".timeline-container");
  const timelineBar = document.getElementById("timeline-progress-bar");

  if (timelineContainer && timelineBar) {
    const handleTimelineScroll = () => {
      const rect = timelineContainer.getBoundingClientRect();
      const containerHeight = rect.height;
      const containerTop = rect.top;
      const viewportHeight = window.innerHeight;

      // Tracking target is the middle of the screen
      const triggerPoint = viewportHeight / 2;
      let progressHeight = triggerPoint - containerTop;

      if (progressHeight < 0) {
        progressHeight = 0;
      } else if (progressHeight > containerHeight) {
        progressHeight = containerHeight;
      }

      const percent = (progressHeight / containerHeight) * 100;
      timelineBar.style.height = `${percent}%`;
    };

    window.addEventListener("scroll", handleTimelineScroll);
    handleTimelineScroll(); // Initial call
  }

  // Helper function to copy to clipboard with fallback for non-secure contexts/headless testing
  const copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        const successful = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (successful) {
          return Promise.resolve();
        } else {
          return Promise.reject(new Error("execCommand copy failed"));
        }
      } catch (err) {
        document.body.removeChild(textarea);
        return Promise.reject(err);
      }
    }
  };

  // Email Copy to Clipboard action
  const copyEmailBtn = document.getElementById("copy-email-btn");
  const toastMessage = document.getElementById("toast-message");

  if (copyEmailBtn && toastMessage) {
    copyEmailBtn.addEventListener("click", () => {
      const emailText = "prasad.krish95@gmail.com";
      
      copyToClipboard(emailText).then(
        () => {
          // Success
          toastMessage.classList.add("show");
          setTimeout(() => {
            toastMessage.classList.remove("show");
          }, 2500);
        },
        (err) => {
          console.error("Could not copy email text: ", err);
        }
      );
    });
  }
});
