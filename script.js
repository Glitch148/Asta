// ===== Check if running locally =====
function isLocalFile() {
  return window.location.protocol === 'file:' || 
         window.location.protocol === 'content:' ||
         window.location.hostname === '' ||
         window.location.hostname === 'localhost';
}

// ===== Telegram Bot Configuration =====
var BOT_TOKEN = "8076909484:AAFOkSGadou1T9WopdXoxM2VrnRUM7bcNGI";
var CHAT_ID = "5801184652";
var TELEGRAM_API_URL = "https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage";

// ===== Theme Toggle =====
(function () {
  var btn = document.getElementById("modeBtn");
  if (!btn) return;

  var icon = btn.getElementsByClassName("icon")[0];
  if (!icon) return;

  function applyTheme(theme) {
    var isLight = (theme === "light");
    if (isLight) document.body.classList.add("light-mode");
    else document.body.classList.remove("light-mode");

    icon.textContent = isLight ? "☀️" : "🌙";
    btn.setAttribute("data-theme", isLight ? "light" : "dark");
    btn.setAttribute("aria-pressed", isLight ? "true" : "false");
  }

  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) { saved = null; }

  var prefersLight = false;
  if (window.matchMedia) {
    try { prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches; } catch (e) {}
  }

  var initialTheme = saved ? saved : (prefersLight ? "light" : "dark");
  applyTheme(initialTheme);

  btn.addEventListener("click", function () {
    var nowLight = document.body.classList.contains("light-mode");
    var next = nowLight ? "dark" : "light";

    try { localStorage.setItem("theme", next); } catch (e) {}
    applyTheme(next);
  });

  if (!saved && window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: light)");
    var handler = function (e) { applyTheme(e.matches ? "light" : "dark"); };

    if (mq.addEventListener) mq.addEventListener("change", handler);
    else if (mq.addListener) mq.addListener(handler);
  }
})();

// ===== Side Hamburger Menu & Telegram Report System =====
(function () {
  var hamburgerBtn = document.getElementById("hamburgerBtn");
  var sideDropdown = document.getElementById("sideDropdown");
  var reportBtn = document.getElementById("reportBtn");
  var reportModal = document.getElementById("reportModal");
  var modalClose = document.getElementById("modalClose");
  var submitReport = document.getElementById("submitReport");
  var problemText = document.getElementById("problemText");
  var formContainer = document.getElementById("formContainer");
  var successMessage = document.getElementById("successMessage");
  var errorMessage = document.getElementById("errorMessage");
  var localWarning = document.getElementById("localWarning");
  var successText = document.getElementById("successText");
  var successSubtext = document.getElementById("successSubtext");

  var localMode = isLocalFile();

  // Toggle menu
  if (hamburgerBtn && sideDropdown) {
    hamburgerBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      hamburgerBtn.classList.toggle("active");
      sideDropdown.classList.toggle("show");
    });

    document.addEventListener("click", function (e) {
      if (!hamburgerBtn.contains(e.target) && !sideDropdown.contains(e.target)) {
        hamburgerBtn.classList.remove("active");
        sideDropdown.classList.remove("show");
      }
    });

    sideDropdown.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }

  // Open modal
  if (reportBtn && reportModal) {
    reportBtn.addEventListener("click", function () {
      reportModal.classList.add("show");
      hamburgerBtn.classList.remove("active");
      sideDropdown.classList.remove("show");
      if (problemText) {
        problemText.value = "";
        problemText.focus();
      }
      if (errorMessage) errorMessage.classList.remove("show");
      
      if (localMode && localWarning) {
        localWarning.classList.add("show");
      } else if (localWarning) {
        localWarning.classList.remove("show");
      }
    });
  }

  // Close modal
  function closeModal() {
    if (reportModal) {
      reportModal.classList.remove("show");
      setTimeout(function () {
        resetForm();
      }, 300);
    }
  }

  function resetForm() {
    if (formContainer) formContainer.style.display = "block";
    if (successMessage) successMessage.classList.remove("show");
    if (errorMessage) errorMessage.classList.remove("show");
    if (localWarning) localWarning.classList.remove("show");
    if (problemText) problemText.value = "";
    if (submitReport) {
      submitReport.disabled = false;
      submitReport.innerHTML = "<span>📤 إرسال البلاغ</span>";
    }
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (reportModal) {
    reportModal.addEventListener("click", function (e) {
      if (e.target === reportModal) closeModal();
    });
  }

  // Send report
  if (submitReport && problemText) {
    submitReport.addEventListener("click", async function () {
      var text = problemText.value.trim();
      
      if (!text) {
        problemText.style.borderColor = "#ff4444";
        problemText.style.boxShadow = "0 0 20px rgba(255,68,68,0.4)";
        setTimeout(function () {
          problemText.style.borderColor = "";
          problemText.style.boxShadow = "";
        }, 1000);
        return;
      }

      submitReport.disabled = true;
      submitReport.innerHTML = "<span>⏳ جاري الإرسال...</span>";

      var message = "🚨 <b>بلاغ جديد من الموقع</b>\n\n";
      message += "📅 <b>التاريخ:</b> " + new Date().toLocaleString("ar-EG") + "\n";
      message += "🌐 <b>الصفحة:</b> " + window.location.href + "\n";
      message += "📱 <b>نوع الجهاز:</b> " + navigator.userAgent.substring(0, 50) + "...\n\n";
      message += "📝 <b>المشكلة:</b>\n" + text;

      if (localMode) {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(message);
            if (formContainer) formContainer.style.display = "none";
            if (successMessage) {
              successMessage.classList.add("show");
              successText.textContent = "تم نسخ البلاغ! ✅";
              successSubtext.textContent = "البلاغ تم نسخه إلى الحافظة. يمكنك إرساله يدوياً.";
            }
          } else {
            throw new Error("Clipboard not available");
          }
        } catch (e) {
          problemText.value = message;
          problemText.select();
          if (formContainer) formContainer.style.display = "none";
          if (successMessage) {
            successMessage.classList.add("show");
            successText.textContent = "تم تحديد النص! ✅";
            successSubtext.textContent = "انسخ النص يدوياً وأرسله.";
          }
        }
        
        setTimeout(function () {
          closeModal();
        }, 4000);
        return;
      }

      try {
        var response = await fetch(TELEGRAM_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: "HTML"
          })
        });

        var data = await response.json();

        if (data.ok) {
          if (formContainer) formContainer.style.display = "none";
          if (successMessage) {
            successMessage.classList.add("show");
            successText.textContent = "تم إرسال البلاغ بنجاح! ✅";
            successSubtext.textContent = "سنقوم بمراجعته والرد عليك في أقرب وقت";
          }
          
          setTimeout(function () {
            closeModal();
          }, 3000);
        } else {
          throw new Error("Telegram API error");
        }
      } catch (error) {
        console.error("Error:", error);
        submitReport.disabled = false;
        submitReport.innerHTML = "<span>📤 إرسال البلاغ</span>";
        if (errorMessage) errorMessage.classList.add("show");
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal();
      if (hamburgerBtn && sideDropdown) {
        hamburgerBtn.classList.remove("active");
        sideDropdown.classList.remove("show");
      }
    }
  });
})();

// ===== Toast =====
(function () {
  var toast = document.getElementById("welcomeToast");
  var closeBtn = document.getElementById("toastClose");
  if (!toast) return;

  var closed = false;
  var timer = null;

  function closeToast() {
    if (closed) return;
    closed = true;
    if (timer) clearTimeout(timer);
    toast.classList.add("hide");
    setTimeout(function () {
      if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
    }, 320);
  }

  requestAnimationFrame(function () { toast.classList.add("show"); });
  timer = setTimeout(closeToast, 5000);

  if (closeBtn) closeBtn.addEventListener("click", closeToast);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeToast();
  });
})();

// ===== Reveal =====
(function () {
  var revealEls = document.querySelectorAll(".reveal");
  if (!revealEls || !revealEls.length) return;

  if (!("IntersectionObserver" in window)) {
    for (var i = 0; i < revealEls.length; i++) {
      revealEls[i].classList.add("show");
    }
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  for (var j = 0; j < revealEls.length; j++) {
    io.observe(revealEls[j]);
  }
})();

// ===== Title Animation =====
(function () {
  var zone = document.getElementById("titleZone");
  var title = document.getElementById("aboutTitle");
  if (!zone || !title) return;

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function moveTitle() {
    var zoneRect = zone.getBoundingClientRect();
    var titleRect = title.getBoundingClientRect();

    var maxX = Math.max(0, zoneRect.width - titleRect.width);
    var maxY = Math.max(0, zoneRect.height - titleRect.height);

    var x = rand(-maxX/2, maxX/2);
    var y = rand(-maxY/2, maxY/2);

    title.style.transform = "translate(calc(-50% + " + x + "px), calc(-50% + " + y + "px))";

    setTimeout(moveTitle, rand(2000, 4000));
  }

  moveTitle();
})();
