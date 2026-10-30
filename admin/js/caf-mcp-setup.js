(function () {
  const cfg = window.cafMcpSetup || {};
  const onEl = document.getElementById("caf-mcp-on");
  const offEl = document.getElementById("caf-mcp-off");
  const killEl = document.getElementById("caf-mcp-kill");
  const promptEl = document.getElementById("caf-mcp-prompt");
  const manualEl = document.getElementById("caf-mcp-manual");
  const manualWrap = document.getElementById("caf-mcp-manual-wrap");
  const errorEl = document.getElementById("caf-mcp-error");
  const ackEl = document.getElementById("caf-mcp-ack");
  const generateEl = document.getElementById("caf-mcp-generate");
  const copyEl = document.getElementById("caf-mcp-copy");
  const copyTestEl = document.getElementById("caf-mcp-copy-test");
  const manualLink = document.getElementById("caf-mcp-manual-link");
  let testPrompt = "";
  let client = "claude-code";

  function post(action, extra) {
    const body = new URLSearchParams();
    body.set("action", action);
    body.set("_ajax_nonce", cfg.nonce || "");
    Object.keys(extra || {}).forEach(function (key) {
      body.set(key, extra[key]);
    });
    return fetch(cfg.ajax, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body: body.toString(),
    }).then(function (res) {
      return res.json();
    });
  }

  function showError(msg) {
    if (!errorEl) return;
    errorEl.hidden = !msg;
    errorEl.textContent = msg || "";
  }

  function setEnabledUi(on) {
    if (onEl) onEl.hidden = !on;
    if (offEl) offEl.hidden = !!on;
    if (killEl) killEl.hidden = !on;
  }

  function syncGenerate() {
    if (!generateEl) return;
    generateEl.disabled = !(ackEl && ackEl.checked);
  }

  document.querySelectorAll(".caf-mcp-setup__tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      client = tab.getAttribute("data-client") || "claude-code";
      document.querySelectorAll(".caf-mcp-setup__tab").forEach(function (el) {
        el.classList.toggle("is-active", el === tab);
      });
      document.querySelectorAll(".caf-mcp-setup__panel").forEach(function (panel) {
        panel.classList.toggle("is-active", panel.getAttribute("data-panel") === client);
      });
    });
  });

  document.querySelectorAll(".caf-mcp-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const on = btn.getAttribute("data-enable") === "1";
      post("caf_mcp_set_enabled", { enabled: on ? "1" : "0" }).then(function (json) {
        const enabled = !!(json && json.success && json.data && json.data.enabled);
        setEnabledUi(enabled);
      });
    });
  });

  if (ackEl) {
    ackEl.addEventListener("change", syncGenerate);
    syncGenerate();
  }

  if (generateEl) {
    generateEl.addEventListener("click", function () {
      showError("");
      if (!ackEl || !ackEl.checked) {
        showError((cfg.i18n && cfg.i18n.ack) || "");
        return;
      }
      generateEl.disabled = true;
      post("caf_mcp_generate_prompt", { client: client }).then(function (json) {
        syncGenerate();
        if (!json || !json.success || !json.data) {
          showError((json && json.data && json.data.message) || (cfg.i18n && cfg.i18n.failed) || "");
          return;
        }
        if (promptEl) promptEl.value = json.data.prompt || "";
        if (manualEl) manualEl.textContent = json.data.manual || "";
        testPrompt = json.data.test_prompt || "";
        if (copyEl) copyEl.hidden = false;
        if (copyTestEl) copyTestEl.hidden = false;
        if (json.data.connections_html) {
          const wrap = document.getElementById("caf-mcp-connections-wrap");
          if (wrap) wrap.innerHTML = json.data.connections_html;
        }
      }).catch(function () {
        syncGenerate();
        showError((cfg.i18n && cfg.i18n.failed) || "");
      });
    });
  }

  if (manualLink && manualWrap) {
    manualLink.addEventListener("click", function (event) {
      event.preventDefault();
      manualWrap.hidden = !manualWrap.hidden;
      if (!manualWrap.hidden) {
        manualWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }

  function copyText(text, button, label) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(function () {
      const prev = button.textContent;
      button.textContent = label;
      setTimeout(function () {
        button.textContent = prev;
      }, 1600);
    });
  }

  if (copyEl) {
    copyEl.addEventListener("click", function () {
      copyText(promptEl ? promptEl.value : "", copyEl, (cfg.i18n && cfg.i18n.copied) || "Copied");
    });
  }
  if (copyTestEl) {
    copyTestEl.addEventListener("click", function () {
      copyText(testPrompt, copyTestEl, (cfg.i18n && cfg.i18n.copied) || "Copied");
    });
  }

  function setConnectionsHtml(html) {
    const wrap = document.getElementById("caf-mcp-connections-wrap");
    if (wrap && typeof html === "string") {
      wrap.innerHTML = html;
    }
  }

  const connectionsEl = document.getElementById("caf-mcp-connections");
  if (connectionsEl) {
    connectionsEl.addEventListener("click", function (event) {
      const target = event.target.closest ? event.target : event.target.parentElement;
      if (!target || !target.closest) return;
      const revoke = target.closest(".caf-mcp-revoke");
      const revokeAll = target.closest("#caf-mcp-revoke-all");
      if (revoke) {
        event.preventDefault();
        if (!window.confirm((cfg.i18n && cfg.i18n.revoke) || "")) {
          return;
        }
        post("caf_mcp_revoke_connection", {
          user_id: revoke.getAttribute("data-user") || "",
          uuid: revoke.getAttribute("data-uuid") || "",
        }).then(function (json) {
          if (json && json.success && json.data && json.data.html) {
            setConnectionsHtml(json.data.html);
            return;
          }
          window.alert((cfg.i18n && cfg.i18n.revokeFail) || "");
        }).catch(function () {
          window.alert((cfg.i18n && cfg.i18n.revokeFail) || "");
        });
        return;
      }
      if (revokeAll) {
        event.preventDefault();
        if (!window.confirm((cfg.i18n && cfg.i18n.revokeAll) || "")) {
          return;
        }
        post("caf_mcp_revoke_all_connections", {}).then(function (json) {
          if (json && json.success && json.data && json.data.html) {
            setConnectionsHtml(json.data.html);
            return;
          }
          window.alert((cfg.i18n && cfg.i18n.revokeFail) || "");
        }).catch(function () {
          window.alert((cfg.i18n && cfg.i18n.revokeFail) || "");
        });
      }
    });
  }
})();
