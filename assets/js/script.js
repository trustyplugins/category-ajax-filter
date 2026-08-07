/**
 * CAF frontend filter AJAX.
 * Refreshes nonce via uncached admin-ajax before requests so full-page caches
 * with a stale localized nonce still work.
 */
function cafRefreshNonce() {
    return jQuery.ajax({
        url: tc_caf_ajax.ajax_url,
        type: "post",
        dataType: "json",
        cache: false,
        data: { action: "tc_caf_refresh_nonce" },
    }).done(function (res) {
        if (res && res.success && res.data && res.data.nonce) {
            tc_caf_ajax.nonce = res.data.nonce;
        }
    });
}

function cafIsNonceFailure(xhr) {
    if (!xhr) {
        return false;
    }
    var body = (xhr.responseText || "").toString().trim();
    return body === "-1" || body === "0";
}

function get_posts(t, isRetry) {
    var a = jQuery.noConflict(),
        e = t["data-target-div"],
        n = a(e).find("#manage-ajax-response"),
        s = a(e).find(".status"),
        retried = !!isRetry;

    a(s).html('<i class="fa fa-spinner fa-spin"></i>').addClass("active");
    a(n).addClass("loading");

    a.ajax({
        url: tc_caf_ajax.ajax_url,
        data: { action: "get_filter_posts", nonce: tc_caf_ajax.nonce, params: t },
        type: "post",
        dataType: "json",
        cache: false,
        success: function (t) {
            a(n).removeClass("loading");
            if (200 === t.status || 201 === t.status || 404 === t.status) {
                a(n).html(t.content);
            } else {
                a(s).html(t.message);
            }
        },
        error: function (xhr, statusText) {
            if (!retried && cafIsNonceFailure(xhr)) {
                cafRefreshNonce()
                    .done(function () {
                        get_posts(t, true);
                    })
                    .fail(function () {
                        a(n).removeClass("loading");
                        a(s).text("Please refresh the page and try again.");
                    });
                return;
            }
            a(n).removeClass("loading");
            a(s).text("Please refresh the page and try again.");
        },
        complete: function (xhr, statusText) {
            // Skip overwrite while a nonce retry is in progress.
            if (!retried && cafIsNonceFailure(xhr)) {
                return;
            }
            if ("success" === statusText && xhr.responseJSON && typeof xhr.responseJSON.found !== "undefined") {
                a(s).text("Posts found: " + xhr.responseJSON.found);
            }
        },
    });
}

jQuery(function (t) {
    function buildParams(page, targetDiv) {
        // Legacy behavior: params["data-target-div"] must include the leading "."
        // so get_posts() can use it as a jQuery selector.
        var sel = "." + String(targetDiv || "").replace(/^\./, "");
        return {
            page: page,
            tax: t(sel).attr("data-tax"),
            "post-type": t(sel).attr("data-post-type"),
            term: t(sel).attr("data-terms"),
            "per-page": t(sel).attr("data-per-page"),
            "filter-id": t(sel).attr("data-filter-id"),
            "caf-post-layout": t(sel).attr("data-post-layout"),
            "data-target-div": sel,
        };
    }

    function initFilters() {
        t(".caf-post-layout-container").each(function (index) {
            // Preserve legacy behavior: load the first shortcode instance on page load.
            if (0 === index) {
                get_posts(buildParams(1, t(this).attr("data-target-div")));
            }
        });
    }

    // Always get a fresh nonce first (fixes stale nonce in cached HTML).
    cafRefreshNonce().always(function () {
        initFilters();
    });

    t("ul.dropdown li a").click(function () {
        var label = t(this).text();
        t("ul.dropdown span.result").html(label);
    });

    t(".caf-post-layout-container").on("click", ".caf-filter-container li a, .caf-pagination a", function (e) {
        var targetDiv = e.currentTarget.getAttribute("data-target-div");
        var page;
        if ("flt" == e.currentTarget.getAttribute("data-main-id")) {
            t("." + targetDiv + " .caf-filter-layout ul li a").each(function () {
                t(this).removeClass("active");
            });
            var termId = t(this).attr("data-id");
            t(this).addClass("active");
            t("." + targetDiv).attr("data-terms", termId);
            page = "1";
        } else {
            targetDiv = e.delegateTarget.getAttribute("data-target-div");
            page = parseInt(t(this).attr("href").replace(/\D/g, ""), 10);
        }
        get_posts(buildParams(page, targetDiv));
        e.preventDefault();
    });
});

jQuery(document).ready(function (t) {
    t("ul.dropdown").on("click", ".init", function () {
        t("ul.dropdown li ul").toggle();
        t("ul.dropdown li").toggleClass("activss");
    });
});
