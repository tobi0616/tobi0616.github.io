/* ==========================================================================
   KyoAni Archive — 站点交互
   导航 / 滚动显现 / 首页花瓣 / 作品筛选与搜索 / 回到顶部
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  /* ---------------------------------------------------------- 移动端导航 */
  function initNav() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav__toggle");
    if (!header) return;

    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = header.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    document.addEventListener("click", function (e) {
      if (!header.classList.contains("is-open")) return;
      if (header.contains(e.target)) return;
      header.classList.remove("is-open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && header.classList.contains("is-open")) {
        header.classList.remove("is-open");
        if (toggle) {
          toggle.setAttribute("aria-expanded", "false");
          toggle.focus();
        }
      }
    });

    var onScroll = function () {
      if (window.scrollY > 12) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------------------------------------------------- 滚动显现 */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add("is-in");
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    for (var k = 0; k < items.length; k++) io.observe(items[k]);
  }

  /* ---------------------------------------------------------- 首页花瓣 */
  function initPetals() {
    var hero = document.querySelector(".hero");
    if (!hero || reduceMotion) return;
    var count = window.innerWidth < 760 ? 9 : 16;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var petal = document.createElement("span");
      petal.className = "hero__petal";
      var size = 5 + Math.random() * 6;
      petal.style.width = size.toFixed(1) + "px";
      petal.style.height = (size * 0.82).toFixed(1) + "px";
      petal.style.left = (Math.random() * 100).toFixed(2) + "%";
      petal.style.animationDuration = (15 + Math.random() * 16).toFixed(1) + "s";
      petal.style.animationDelay = (-Math.random() * 26).toFixed(1) + "s";
      petal.style.opacity = "0";
      frag.appendChild(petal);
    }
    hero.appendChild(frag);
  }

  /* ---------------------------------------------------------- 筛选 / 搜索 */
  function initFilter() {
    var list = document.querySelector("[data-works]");
    if (!list) return;

    var chips = Array.prototype.slice.call(
      document.querySelectorAll("[data-filter]")
    );
    var input = document.getElementById("works-search");
    var wrap = document.querySelector(".search");
    var reset = document.querySelector(".search__reset");
    var count = document.getElementById("result-count");
    var series = Array.prototype.slice.call(
      document.querySelectorAll("[data-series]")
    );
    var works = Array.prototype.slice.call(list.querySelectorAll("[data-work]"));

    var state = { era: "all", q: "" };

    function apply() {
      var visible = 0;
      var lastVisible = null;
      var q = state.q.trim().toLowerCase();

      works.forEach(function (work) {
        var eraOk = state.era === "all" || work.getAttribute("data-era") === state.era;
        var key = (work.getAttribute("data-key") || "").toLowerCase();
        var qOk = !q || key.indexOf(q) !== -1;
        var show = eraOk && qOk;
        work.hidden = !show;
        if (show) {
          visible++;
          lastVisible = work;
        }
      });

      works.forEach(function (work) {
        work.classList.toggle("is-last-visible", work === lastVisible);
      });

      var firstVisible = null;
      series.forEach(function (section) {
        var any = section.querySelector("[data-work]:not([hidden])");
        section.hidden = !any;
        if (any && !firstVisible) firstVisible = section;
      });

      series.forEach(function (section) {
        section.classList.toggle("is-first-visible", section === firstVisible);
      });

      if (count) count.textContent = visible;

      if (wrap) {
        wrap.classList.toggle("has-value", !!(input && input.value.length));
      }
      list.classList.toggle("is-empty", visible === 0);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          c.classList.remove("is-active");
          c.setAttribute("aria-pressed", "false");
        });
        chip.classList.add("is-active");
        chip.setAttribute("aria-pressed", "true");
        state.era = chip.getAttribute("data-filter");
        apply();
      });
    });

    if (input) {
      input.addEventListener("input", function () {
        state.q = input.value;
        apply();
      });
      input.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          input.value = "";
          state.q = "";
          apply();
          input.blur();
        }
      });
    }

    if (reset && input) {
      reset.addEventListener("click", function () {
        input.value = "";
        state.q = "";
        apply();
        input.focus();
      });
    }

    apply();
  }

  /* ---------------------------------------------------------- 回到顶部 */
  function initToTop() {
    var btn = document.querySelector(".to-top");
    if (!btn) return;

    var onScroll = function () {
      btn.classList.toggle("is-visible", window.scrollY > 700);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    btn.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    });
  }

  /* ---------------------------------------------------------- 页脚年份 */
  function initYear() {
    var nodes = document.querySelectorAll("[data-year]");
    var year = new Date().getFullYear();
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = year > 2026 ? String(year) : "2026";
    }
  }

  function boot() {
    initNav();
    initReveal();
    initPetals();
    initFilter();
    initToTop();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
