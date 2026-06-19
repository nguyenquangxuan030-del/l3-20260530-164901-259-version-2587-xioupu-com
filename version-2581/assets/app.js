(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        var open = panel.classList.toggle("is-open");
        document.body.classList.toggle("menu-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.textContent = open ? "×" : "☰";
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var next = hero.querySelector("[data-hero-next]");
      var prev = hero.querySelector("[data-hero-prev]");
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          start();
        });
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          start();
        });
      }

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    var searchItems = window.siteSearchItems || [];

    document.querySelectorAll(".site-search-input").forEach(function (input) {
      var holder = input.parentElement;
      var results = holder ? holder.querySelector(".search-results") : null;

      if (!results) {
        return;
      }

      function closeResults() {
        results.classList.remove("is-open");
        results.innerHTML = "";
      }

      input.addEventListener("input", function () {
        var query = normalize(input.value);

        if (query.length < 1) {
          closeResults();
          return;
        }

        var matched = searchItems.filter(function (item) {
          var haystack = normalize([
            item.title,
            item.region,
            item.year,
            item.type,
            item.category,
            item.genre,
            item.tags
          ].join(" "));
          return haystack.indexOf(query) !== -1;
        }).slice(0, 12);

        if (!matched.length) {
          results.innerHTML = '<div class="search-empty">没有找到相关内容</div>';
          results.classList.add("is-open");
          return;
        }

        results.innerHTML = matched.map(function (item) {
          var title = escapeHtml(item.title);
          var region = escapeHtml(item.region);
          var year = escapeHtml(item.year);
          var category = escapeHtml(item.category);
          var href = escapeHtml(item.href);
          var poster = escapeHtml(item.poster);

          return '<a class="search-result-item" href="' + href + '">' +
            '<img src="' + poster + '" alt="' + title + '">' +
            '<span><strong>' + title + '</strong><span>' + region + ' · ' + year + ' · ' + category + '</span></span>' +
            '</a>';
        }).join("");
        results.classList.add("is-open");
      });

      document.addEventListener("click", function (event) {
        if (!holder || holder.contains(event.target)) {
          return;
        }
        closeResults();
      });
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var list = scope.parentElement ? scope.parentElement.querySelector("[data-filter-list]") : null;
      var textInput = scope.querySelector(".filter-input");
      var yearSelect = scope.querySelector(".filter-year");

      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.children);

      function applyFilter() {
        var query = normalize(textInput ? textInput.value : "");
        var year = yearSelect ? String(yearSelect.value || "") : "";

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre")
          ].join(" "));
          var yearMatch = !year || card.getAttribute("data-year") === year;
          var textMatch = !query || haystack.indexOf(query) !== -1;
          card.classList.toggle("is-hidden", !(yearMatch && textMatch));
        });
      }

      if (textInput) {
        textInput.addEventListener("input", applyFilter);
      }

      if (yearSelect) {
        yearSelect.addEventListener("change", applyFilter);
      }
    });
  });
})();
