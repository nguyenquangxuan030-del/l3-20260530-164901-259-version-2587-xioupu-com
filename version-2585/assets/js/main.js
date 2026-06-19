(function () {
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileMenu = document.getElementById("mobile-menu");
    if (menuButton && mobileMenu) {
      menuButton.addEventListener("click", function () {
        var isOpen = mobileMenu.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    document.querySelectorAll(".search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }
    }

    var next = document.querySelector("[data-next-slide]");
    var prev = document.querySelector("[data-prev-slide]");
    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        startTimer();
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        startTimer();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-go-slide")) || 0);
        startTimer();
      });
    });
    showSlide(0);
    startTimer();

    document.querySelectorAll(".movie-filter").forEach(function (input) {
      var scope = input.closest(".section-block");
      var list = scope ? scope.querySelector(".filter-scope") : null;
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card, .rank-item")) : [];
      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = card.textContent.toLowerCase();
          var matched = !keyword || text.indexOf(keyword) !== -1;
          card.classList.toggle("is-filter-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });
        var empty = list ? list.querySelector(".empty-state") : null;
        if (list && !empty) {
          empty = document.createElement("div");
          empty.className = "empty-state";
          empty.textContent = "没有找到匹配的剧集";
          list.appendChild(empty);
        }
        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      });
    });
  });
})();
