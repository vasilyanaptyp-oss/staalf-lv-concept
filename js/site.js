/* STAALF: izvēlne telefonā un pieprasījuma forma (mailto bez servera). */
(function () {
  "use strict";

  /* ---------- izvēlne ---------- */
  var poga = document.querySelector(".izv-poga");
  var izvelne = document.getElementById("galvenaIzvelne");
  if (poga && izvelne) {
    var aizvert = function (fokuss) {
      izvelne.classList.remove("atverta");
      poga.setAttribute("aria-expanded", "false");
      poga.setAttribute("aria-label", "Atvērt izvēlni");
      if (fokuss) poga.focus();
    };
    var atvert = function () {
      izvelne.classList.add("atverta");
      poga.setAttribute("aria-expanded", "true");
      poga.setAttribute("aria-label", "Aizvērt izvēlni");
    };
    poga.addEventListener("click", function () {
      if (izvelne.classList.contains("atverta")) aizvert(false); else atvert();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && izvelne.classList.contains("atverta")) aizvert(true);
    });
    izvelne.addEventListener("click", function (e) {
      if (e.target.closest("a")) aizvert(false);
    });
    document.addEventListener("click", function (e) {
      if (izvelne.classList.contains("atverta") && !e.target.closest(".galvene")) aizvert(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 960) aizvert(false);
    });
  }

  /* ---------- forma ---------- */
  var forma = document.getElementById("pieprasijumaForma");
  if (!forma) return;

  var ADRESE = "info@staalf.lv";
  var kopsavilkums = document.getElementById("formaKopsavilkums");

  // Iepriekš izvēlēta darbnīca no saites ?darbnica=...
  try {
    var q = new URLSearchParams(window.location.search).get("iekarta");
    var sel = forma.elements["iekarta"];
    if (q && sel) {
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].getAttribute("data-kods") === q) { sel.selectedIndex = i; break; }
      }
    }
  } catch (err) { /* nav kritiski */ }

  function lauks(nosaukums) { return forma.elements[nosaukums]; }

  function vertet(el) {
    var vertiba = (el.value || "").trim();
    var kluda = "";
    if (el.required && !vertiba) {
      kluda = el.getAttribute("data-kluda") || "Šis lauks jāaizpilda.";
    } else if (el.name === "talrunis" && vertiba) {
      var cipari = vertiba.replace(/\D/g, "");
      if (cipari.length < 8) kluda = "Ierakstiet tālruņa numuru, vismaz 8 ciparus.";
    }
    var kludasEl = document.getElementById(el.id + "-kluda");
    if (kludasEl) kludasEl.textContent = kluda;
    if (kluda) {
      el.setAttribute("aria-invalid", "true");
    } else {
      el.removeAttribute("aria-invalid");
    }
    return !kluda;
  }

  var obligati = Array.prototype.filter.call(forma.elements, function (el) {
    return el.required || el.name === "talrunis";
  });
  obligati.forEach(function (el) {
    el.addEventListener("blur", function () { if (el.hasAttribute("aria-invalid") || (el.value || "").trim()) vertet(el); });
    el.addEventListener("input", function () { if (el.hasAttribute("aria-invalid")) vertet(el); });
    el.addEventListener("change", function () { if (el.hasAttribute("aria-invalid")) vertet(el); });
  });

  forma.addEventListener("submit", function (e) {
    e.preventDefault();
    var pirmaKluda = null;
    var skaits = 0;
    obligati.forEach(function (el) {
      if (!vertet(el)) { skaits++; if (!pirmaKluda) pirmaKluda = el; }
    });
    if (pirmaKluda) {
      kopsavilkums.textContent = skaits === 1
        ? "Vēstule vēl nav gatava: jāizlabo 1 lauks."
        : "Vēstule vēl nav gatava: jāizlabo " + skaits + " lauki.";
      kopsavilkums.classList.add("redzams");
      pirmaKluda.focus();
      return;
    }
    kopsavilkums.classList.remove("redzams");
    kopsavilkums.textContent = "";

    var iek = lauks("iekarta");
    var steid = lauks("steidzamiba");
    var rindas = [
      "Iekārta: " + iek.value,
      "Kas noticis: " + lauks("noticis").value.trim(),
      "Steidzamība: " + steid.value,
      "Tālrunis: " + lauks("talrunis").value.trim()
    ];
    var vards = lauks("vards").value.trim();
    if (vards) rindas.push("Vārds, uzvārds: " + vards);
    var zina = lauks("zina").value.trim();
    if (zina) rindas.push("", "Ziņa:", zina);
    var tema = "Pieprasījums: " + iek.value;
    var saite = "mailto:" + ADRESE + "?subject=" + encodeURIComponent(tema) + "&body=" + encodeURIComponent(rindas.join("\n"));
    window.location.href = saite;
  });
})();
