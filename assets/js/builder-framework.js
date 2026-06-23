jQuery(function ($) {
    "use strict";

    const CAFQueryBuilder = {
        getSearchModuleSettings($builder) {
            const $searchOutput = $builder
                .find(".caf-module-filter.caf-module-type-search .caf-filter-module-search-output")
                .first();
            if (!$searchOutput.length) {
                return {
                    keywordEnabled: true,
                    smartEnabled: false,
                    searchTrigger: "enter_icon",
                    charLimitEnabled: false,
                    charLimit: 0,
                    source: {
                        everything: true,
                        title: false,
                        descriptions: false,
                        custom_field: false
                    },
                    customField: ""
                };
            }
            return {
                keywordEnabled: String($searchOutput.attr("data-keyword-search-enabled") || "true") === "true",
                smartEnabled: false,
                searchTrigger: String($searchOutput.attr("data-search-trigger") || "enter_icon"),
                charLimitEnabled: String($searchOutput.attr("data-char-limit-enabled") || "false") === "true",
                charLimit: parseInt($searchOutput.attr("data-char-limit") || "0", 10) || 0,
                source: {
                    everything: String($searchOutput.attr("data-search-source-everything") || "false") === "true",
                    title: String($searchOutput.attr("data-search-source-title") || "false") === "true",
                    descriptions: String($searchOutput.attr("data-search-source-descriptions") || "false") === "true",
                    custom_field: false
                },
                customField: ""
            };
        },

        getSearchModuleOutput($builder) {
            return $builder
                .find(".caf-module-filter.caf-module-type-search .caf-filter-module-search-output")
                .first();
        },

        isBlockedByMinCharLimit($builder, rawKeyword) {
            const raw = typeof rawKeyword === "string"
                ? jQuery.trim(rawKeyword)
                : this.getSearchInputValue($builder);
            if (!raw) {
                return false;
            }
            const searchSettings = this.getSearchModuleSettings($builder);
            const limit = parseInt(searchSettings.charLimit || 0, 10);
            return searchSettings.charLimitEnabled && limit > 0 && raw.length < limit;
        },

        getCommittedSearchKeywordForTags($builder) {
            const raw = this.getSearchInputValue($builder);
            if (!raw || this.isBlockedByMinCharLimit($builder, raw)) {
                return "";
            }
            return raw;
        },

        commitSearchKeywordToDom($builder) {
            const $searchOutput = this.getSearchModuleOutput($builder);
            if (!$searchOutput.length) {
                return "";
            }
            const searchSettings = this.getSearchModuleSettings($builder);
            const keyword = this.getCommittedSearchKeywordForTags($builder);
            if (searchSettings.searchTrigger === "typing") {
                $searchOutput.removeAttr("data-committed-search-keyword");
            } else {
                $searchOutput.attr("data-committed-search-keyword", keyword);
            }
            return keyword;
        },

        clearCommittedSearchKeywordOnDom($builder) {
            this.getSearchModuleOutput($builder).removeAttr("data-committed-search-keyword");
        },

        getSearchKeywordForSelectedTags($builder) {
            const searchSettings = this.getSearchModuleSettings($builder);
            const $searchOutput = this.getSearchModuleOutput($builder);
            if (!$searchOutput.length) {
                return "";
            }
            if (searchSettings.searchTrigger === "typing") {
                return this.getCommittedSearchKeywordForTags($builder);
            }
            return jQuery.trim($searchOutput.attr("data-committed-search-keyword") || "");
        },

        getSearchKeywordForQuery($builder) {
            const searchSettings = this.getSearchModuleSettings($builder);
            if (!searchSettings.keywordEnabled) {
                return "";
            }
            if (searchSettings.searchTrigger === "typing") {
                return this.getCommittedSearchKeywordForTags($builder);
            }
            return this.getSearchKeywordForSelectedTags($builder);
        },

        getSearchInputValue($builder) {
            return jQuery.trim(
                $builder.find(".caf-module-filter.caf-module-type-search .caf-search-input-field").val() || ""
            );
        },

        getSearchKeyword($builder) {
            return this.getSearchKeywordForQuery($builder);
        },

        collectQueryArgs($builder, page = 1) {
            const queryArgs = {
                post_type: $builder.attr("post-type"),
                posts_per_page: $builder.attr("post-per-page"),
                paged: page,
                post_status: "publish"
            };

            const filterData = this.collectFilterData($builder);

            if (filterData.taxQuery.length) {
                queryArgs.tax_query = this.buildTaxQuery(
                    filterData.taxQuery,
                    $builder.attr("taxonomy-relation")
                );
            }

            const searchKeyword = this.getSearchKeyword($builder);
            const searchSettings = this.getSearchModuleSettings($builder);
            if (searchKeyword && searchSettings.keywordEnabled) {
                queryArgs.s = searchKeyword;
                queryArgs.caf_search_keyword = searchKeyword;
                queryArgs.caf_search_source = searchSettings.source;
            }

            return queryArgs;
        },

        collectFilterData($builder) {
            const groupedTaxByModule = {};
            const $selectedItems = this.getSelectedFilterItems($builder);

            $selectedItems.each((_, element) => {
                const $item = jQuery(element);
                const itemData = this.extractFilterItemData($item);

                if (!itemData || itemData.dataSource !== "taxonomy") {
                    return;
                }

                this.addTaxFilter(groupedTaxByModule, itemData);
            });

            return {
                taxQuery: this.moduleTaxGroupsToQueryPieces(groupedTaxByModule)
            };
        },

        getSelectedFilterItems($builder) {
            return $builder.find(
                ".caf-module-filter .caf-terms-list-item.caf-selected, " +
                ".caf-module-filter .caf-dropdown-child .caf-terms-list-item.active"
            );
        },

        extractFilterItemData($item) {
            const $list = $item.closest(".caf-terms-list");
            const $input = $item.find(".caf-taxo-input").first();

            const dataSource = $list.attr("data-source") || "";
            const filterType = $list.attr("filter-type") || "";
            const dataKey =
                $item.attr("data-key") ||
                $input.attr("data-key") ||
                $list.attr("data-key") ||
                "";

            let termId = "";
            let termValue = "";

            if ($item.closest(".caf-dropdown-child").length) {
                termId = $item.attr("term-id") || "";
                termValue = $item.attr("term-value") || termId;
            } else {
                const inputValue = $input.val();
                termId = inputValue || $item.attr("term-id") || "";
                termValue = $item.attr("term-value") || inputValue || "";
            }

            return {
                dataSource,
                filterType,
                dataKey,
                termId,
                termValue,
                moduleId: String($list.attr("module-id") || ""),
                categoryRelation: String($list.attr("category-relation") || "OR")
            };
        },

        moduleTaxGroupsToQueryPieces(groupedByModule) {
            const pieces = [];
            Object.keys(groupedByModule).forEach((moduleKey) => {
                const mod = groupedByModule[moduleKey];
                if (!mod || !mod.byTaxonomy) {
                    return;
                }
                const useAnd = String(mod.categoryRelation || "OR").toUpperCase() === "AND";
                const taxKeys = Object.keys(mod.byTaxonomy);
                const clauses = [];
                taxKeys.forEach((taxonomy) => {
                    const terms = (mod.byTaxonomy[taxonomy] || []).filter(Boolean);
                    if (!taxonomy || !terms.length) {
                        return;
                    }
                    if (terms.length === 1) {
                        clauses.push({
                            taxonomy,
                            field: "term_id",
                            terms: terms[0],
                            operator: "IN"
                        });
                    } else {
                        clauses.push({
                            taxonomy,
                            field: "term_id",
                            terms,
                            operator: useAnd ? "AND" : "IN"
                        });
                    }
                });
                if (!clauses.length) {
                    return;
                }
                if (clauses.length === 1) {
                    pieces.push(clauses[0]);
                } else {
                    const nested = { relation: useAnd ? "AND" : "OR" };
                    clauses.forEach((c, i) => {
                        nested[i] = c;
                    });
                    pieces.push(nested);
                }
            });
            return pieces;
        },

        addTaxFilter(groupedTaxByModule, itemData) {
            const taxonomy = itemData.dataKey;
            const termId = itemData.termId;

            if (!taxonomy || !termId || termId === "0" || termId === "all") {
                return;
            }

            const moduleKey =
                itemData.moduleId && itemData.moduleId !== "0"
                    ? itemData.moduleId
                    : `tax-fallback-${taxonomy}`;

            if (!groupedTaxByModule[moduleKey]) {
                groupedTaxByModule[moduleKey] = {
                    categoryRelation: itemData.categoryRelation || "OR",
                    byTaxonomy: {}
                };
            }

            if (!groupedTaxByModule[moduleKey].byTaxonomy[taxonomy]) {
                groupedTaxByModule[moduleKey].byTaxonomy[taxonomy] = [];
            }

            if (!groupedTaxByModule[moduleKey].byTaxonomy[taxonomy].includes(termId)) {
                groupedTaxByModule[moduleKey].byTaxonomy[taxonomy].push(termId);
            }
        },

        buildTaxQuery(taxQueryItems, relation = "OR") {
            if (!taxQueryItems.length) {
                return [];
            }

            if (taxQueryItems.length === 1) {
                return [...taxQueryItems];
            }

            const rel = String(relation || "OR").toUpperCase() === "AND" ? "AND" : "OR";
            const query = { relation: rel };
            taxQueryItems.forEach((item, i) => {
                query[i] = item;
            });
            return query;
        },

        updateDropdownSelectedLabel($termsList, $dropdownChild) {
            const $selectedResult = $termsList.find(".caf-selected-term-main .result .manage-text-lbl");
            const $activeItems = $dropdownChild.find(".caf-terms-list-item.active");

            if (!$activeItems.length) {
                return;
            }

            if ($activeItems.length === 1) {
                const $item = $activeItems.first();
                const termId = String($item.attr("term-id") || "");

                if (termId !== "0" && termId !== "all") {
                    const termName = $.trim($item.find(".trm-name, .cf-value-name").first().text());
                    const termIcon = $item.find("i, svg").first().prop("outerHTML") || "";
                    const finalHtml = termIcon + termName;
                    $selectedResult.html("<div class='caf-dropdown-selected-html'>" + finalHtml + "</div>");
                } else {
                    $selectedResult.html($item.html());
                }
                return;
            }

            const labels = [];
            $activeItems.each(function () {
                const $activeItem = $(this);
                const termId = String($activeItem.attr("term-id") || "");
                if (termId === "0" || termId === "all") {
                    return;
                }
                const termName = $.trim(
                    $activeItem.find(".trm-name, .cf-value-name").first().text() || $activeItem.text()
                );
                if (termName) {
                    labels.push(termName);
                }
            });
            $selectedResult.html(labels.join(", "));
        }
    };

    const CAFBuilder = {
        selectors: {
            builder: ".caf-builder-container",
            searchModule: ".caf-module-filter.caf-module-type-search .caf-search-input-field",
            loader: ".caf-builder-template-preview-loader-container",
            postLayoutInner: ".post-layout-container-inner",
            postLayout: ".post-layout-container",
            pagination: ".caf-builder-preview-pagination"
        },

        init() {
            const self = this;
            self.bindEvents();
            $(self.selectors.builder).each(function () {
                self.initializeBuilder($(this));
            });
        },

        markBuilderReady($builder) {
            if (!$builder || !$builder.length) {
                return;
            }
            window.requestAnimationFrame(() => {
                $builder.addClass("caf-is-ready");
            });
        },

        initializeBuilder($builder) {
            $builder.find(".caf-module-type-search .caf-search-input-field").each(function () {
                CAFBuilder.handleSearchInput($(this));
            });

            this.updateSearchResultUI($builder);
            this.markBuilderReady($builder);
        },

        findDropdownAllOptionItem($dropdownChild) {
            let $target = $dropdownChild.find(
                ".caf-dropdown-all-option, .caf-terms-list-item[term-id=\"0\"], .caf-terms-list-item[term-id=\"all\"]"
            ).first();
            if (!$target.length) {
                $target = $dropdownChild.find(".caf-terms-list-item").first();
            }
            return $target;
        },

        updateDropdownToggleIcon($icon, isOpen) {
            if (!$icon || !$icon.length) {
                return;
            }
            $icon.removeClass("fa-chevron-up fa-chevron-down");
            $icon.addClass(isOpen ? "fa-chevron-up" : "fa-chevron-down");
            if (!$icon.hasClass("fas")) {
                $icon.addClass("fas");
            }
        },

        setFilterDropdownOpen($dropdownChild, isOpen, $icon) {
            if (!$dropdownChild || !$dropdownChild.length) {
                return;
            }
            $dropdownChild.toggleClass("caf-enable", isOpen).toggleClass("caf-disable", !isOpen);
            if ($icon && $icon.length) {
                this.updateDropdownToggleIcon($icon, isOpen);
            }
        },

        closeOtherFilterDropdowns($exceptChild) {
            $(".caf-module-filter .caf-dropdown-child.caf-enable").each((_, el) => {
                const $open = $(el);
                if ($exceptChild && $open.is($exceptChild)) {
                    return;
                }
                const $module = $open.closest(".caf-module-filter");
                this.setFilterDropdownOpen(
                    $open,
                    false,
                    $module.find(".caf-selected-term-main .selected-icon i")
                );
            });
        },

        resetDropdownModuleToAll($module) {
            const $dropdownChild = $module.find(".caf-dropdown-child").first();
            if (!$dropdownChild.length) {
                return;
            }

            const $termsList = $dropdownChild.closest(".caf-terms-list");
            const $allOption = this.findDropdownAllOptionItem($dropdownChild);
            const $selectedMain = $module.find(".caf-selected-term-main").first();
            const $selectedLabel = $module.find(".caf-selected-term-main .result .manage-text-lbl");

            $dropdownChild.find(".caf-terms-list-item").removeClass("active caf-selected");
            if ($allOption.length) {
                $allOption.addClass("active");
                CAFQueryBuilder.updateDropdownSelectedLabel($termsList, $dropdownChild);
            } else if ($selectedLabel.length) {
                const allLabel = String($termsList.attr("data-all-option-label") || "All");
                $selectedLabel.html(
                    `<div class="manage-text-lbl"><span class="trm-name">${$("<div>").text(allLabel).html()}</span></div>`
                );
            }

            $selectedMain.addClass("caf-all-selected");
        },

        debounce(fn, delay = 400) {
            clearTimeout(this._searchTimer);
            this._searchTimer = setTimeout(fn, delay);
        },

        executeSearch($builder, options = {}) {
            if (!$builder || !$builder.length) {
                return;
            }
            const searchSettings = CAFQueryBuilder.getSearchModuleSettings($builder);
            const rawKeyword = CAFQueryBuilder.getSearchInputValue($builder);
            const belowCharLimit = CAFQueryBuilder.isBlockedByMinCharLimit($builder, rawKeyword);

            if (belowCharLimit) {
                if (searchSettings.searchTrigger === "typing") {
                    const hadActiveKeyword = String($builder.data("cafActiveSearchKeyword") || "") !== "";
                    if (hadActiveKeyword) {
                        CAFQueryBuilder.commitSearchKeywordToDom($builder);
                        this.updateSearchResultUI($builder);
                        $builder.data("cafActiveSearchKeyword", "");
                        this.buildQuery($builder, 1, { skipLoader: true });
                    }
                }
                return;
            }

            if (!rawKeyword) {
                $builder.data("cafActiveSearchKeyword", "");
                CAFQueryBuilder.commitSearchKeywordToDom($builder);
                this.updateSearchResultUI($builder);
                this.buildQuery($builder);
                return;
            }

            CAFQueryBuilder.commitSearchKeywordToDom($builder);
            $builder.data("cafActiveSearchKeyword", rawKeyword);
            this.updateSearchResultUI($builder);
            this.buildQuery($builder);
        },

        bindEvents() {
            const self = this;

            $(document).on("click", ".caf-module-filter.toggled .label-header", function () {
                self.handleLabelToggle($(this));
            });

            $(document).on("input", ".caf-module-type-search .caf-search-input-field", function () {
                const $input = $(this);
                const $builder = $input.closest(self.selectors.builder);
                const searchSettings = CAFQueryBuilder.getSearchModuleSettings($builder);

                self.handleSearchInput($input);

                if (searchSettings.searchTrigger !== "typing") {
                    const $searchOutput = $input.closest(".caf-filter-module-search-output");
                    const committed = String($searchOutput.attr("data-committed-search-keyword") || "");
                    const raw = jQuery.trim($input.val() || "");
                    if (!raw && committed) {
                        CAFQueryBuilder.clearCommittedSearchKeywordOnDom($builder);
                        $builder.data("cafActiveSearchKeyword", "");
                        self.updateSearchResultUI($builder);
                        self.buildQuery($builder);
                    }
                    return;
                }

                self.debounce(() => {
                    self.executeSearch($builder);
                });
            });

            $(document).on("keyup", ".caf-module-type-search .caf-search-input-field", function () {
                const $input = $(this);
                const $builder = $input.closest(self.selectors.builder);
                const searchSettings = CAFQueryBuilder.getSearchModuleSettings($builder);
                if (searchSettings.searchTrigger !== "typing") {
                    return;
                }
                self.debounce(() => {
                    self.executeSearch($builder);
                });
            });

            $(document).on("keydown", ".caf-module-type-search .caf-search-input-field", function (e) {
                if (e.key !== "Enter") {
                    return;
                }
                e.preventDefault();
                const $builder = $(this).closest(self.selectors.builder);
                self.executeSearch($builder);
            });

            $(document).on("click", ".caf-module-type-search .search-icon", function () {
                const $builder = $(this).closest(self.selectors.builder);
                self.executeSearch($builder);
            });

            $(document).on("focus", ".caf-module-type-search .caf-search-input-field", function () {
                $(this).closest(".caf-filter-module-search-output").addClass("caf-focused");
            });

            $(document).on("blur", ".caf-module-type-search .caf-search-input-field", function () {
                $(this).closest(".caf-filter-module-search-output").removeClass("caf-focused");
            });

            $(document).on("click", ".caf-module-type-search .clear-icon.on-type, .caf-module-type-search .clear-icon.on-always", function () {
                const $icon = $(this);
                const $module = $icon.closest(".caf-module-type-search");
                const $input = $module.find(".caf-search-input-field");
                const $builder = $icon.closest(".caf-builder-container");

                $input.val("").focus();
                $module.find(".clear-icon.on-type").hide();
                CAFQueryBuilder.clearCommittedSearchKeywordOnDom($builder);
                $builder.data("cafActiveSearchKeyword", "");
                CAFBuilder.updateSearchResultUI($builder);
                CAFBuilder.buildQuery($builder);
            });

            $(document).on("click", ".caf-module-filter .caf-selected-term-main", function (e) {
                e.stopPropagation();
                self.toggleDropdown($(this));
            });

            $(document).on("click", function (e) {
                if (!$(e.target).closest(".caf-module-filter .caf-selected-term-main, .caf-module-filter .caf-dropdown-child").length) {
                    self.closeOtherFilterDropdowns(null);
                }
            });

            $(document).on("click", ".caf-module-filter .caf-dropdown-child .caf-terms-list-item", function () {
                self.handleDropdownSelection($(this));
            });

            $(document).on("click", ".caf-module-filter .caf-terms-list-item", function (e) {
                const $item = $(this);
                if ($item.closest(".caf-dropdown-child").length) {
                    return;
                }
                e.preventDefault();
                self.handleSelectableItem($item);
            });

            $(document).on("click", ".caf-module-filter.caf-module-type-reset", function () {
                self.handleReset($(this).closest(self.selectors.builder));
            });

            $(document).on("click", ".caf-filter-slide-button", function (e) {
                e.preventDefault();
                const $builder = $(this).closest(self.selectors.builder);
                const $panel = $builder.find(".caf-builder-template-preview-filter");
                $panel.addClass("filter-open").removeClass("filter-close");
                $builder.find(".caf-builder-filter-post-overlay").addClass("filter-open");
            });

            $(document).on("click", ".caf-builder-filter-close, .caf-builder-filter-post-overlay.filter-open", function (e) {
                e.preventDefault();
                const $builder = $(this).closest(self.selectors.builder);
                const $panel = $builder.find(".caf-builder-template-preview-filter");
                $panel.removeClass("filter-open").addClass("filter-close");
                $builder.find(".caf-builder-filter-post-overlay").removeClass("filter-open");
            });

            $(document).on("click", ".caf-builder-preview-page-no", function () {
                self.buildQuery($(this).closest(self.selectors.builder), parseInt($(this).attr("page"), 10) || 1);
            });
        },

        handleLabelToggle($header) {
            const $module = $header.closest(".caf-module-filter");
            const $list = $module.find("ul.caf-terms-list");
            const $searchOutput = $module.find(".caf-filter-module-search-output");
            const $resetOutput = $module.find(".caf-filter-module-reset-output");
            const $rangeOutput = $module.find(".caf-range-slider-output");
            const $icon = $header.find("i");

            if ($list.length) {
                $list.slideToggle(() => {
                    $list.toggleClass("toggle_closed");
                    $icon.toggleClass("fa-chevron-up fa-chevron-down");
                });
            }

            if ($searchOutput.length) {
                $searchOutput.slideToggle(() => {
                    const isClosed = $searchOutput.hasClass("toggle_closed");
                    $searchOutput.toggleClass("toggle_closed");
                    $searchOutput.css("display", isClosed ? "flex" : "none");
                });
            }

            if ($resetOutput.length) {
                $resetOutput.slideToggle(() => {
                    const isClosed = $resetOutput.hasClass("toggle_closed");
                    $resetOutput.toggleClass("toggle_closed");
                    $resetOutput.css("display", isClosed ? "flex" : "none");
                });
            }

            if ($rangeOutput.length) {
                $rangeOutput.slideToggle(() => {
                    const isClosed = $rangeOutput.hasClass("toggle_closed");
                    $rangeOutput.toggleClass("toggle_closed");
                    $rangeOutput.css("display", isClosed ? "flex" : "none");
                    $icon.toggleClass("fa-chevron-up fa-chevron-down");
                });
            }
        },

        handleSearchInput($input) {
            const value = String($input.val() || "");
            const $module = $input.closest(".caf-module-type-search");
            const $onType = $module.find(".clear-icon.on-type");
            const $onAlways = $module.find(".clear-icon.on-always");

            if ($onType.length) {
                $onType.css("display", value.length > 0 ? "block" : "none");
            }
            if ($onAlways.length) {
                $onAlways.css("display", "");
            }
        },

        toggleDropdown($trigger) {
            const $module = $trigger.closest(".caf-module-filter");
            const $dropdownChild = $module.find(".caf-dropdown-child");
            const $icon = $trigger.find(".selected-icon i");
            const willOpen = $dropdownChild.hasClass("caf-disable");

            if (willOpen) {
                this.closeOtherFilterDropdowns($dropdownChild);
            }
            this.setFilterDropdownOpen($dropdownChild, willOpen, $icon);
        },

        handleDropdownSelection($item) {
            const $builder = $item.closest(this.selectors.builder);
            const $module = $item.closest(".caf-module-filter");
            const $termsList = $item.closest(".caf-terms-list");
            const $dropdownChild = $module.find(".caf-dropdown-child");
            const multipleTerm = String($termsList.attr("multiple-term") || "false") === "true";
            const termId = String($item.attr("term-id") || "");
            const wasActive = $item.hasClass("active");

            if (!multipleTerm) {
                $dropdownChild.find(".caf-terms-list-item").removeClass("active");
                $item.addClass("active");
            } else if (termId === "0" || termId === "all") {
                $dropdownChild.find(".caf-terms-list-item").removeClass("active");
                $item.addClass("active");
            } else {
                $dropdownChild.find(".caf-terms-list-item[term-id='0'], .caf-terms-list-item[term-id='all']").removeClass("active");
                if (wasActive) {
                    $item.removeClass("active");
                } else {
                    $item.addClass("active");
                }
                if (!$dropdownChild.find(".caf-terms-list-item.active").length) {
                    this.resetDropdownModuleToAll($module);
                }
            }

            const hasNonAllActive = $dropdownChild.find(".caf-terms-list-item.active").filter(function () {
                const id = String($(this).attr("term-id") || "");
                return id !== "0" && id !== "all";
            }).length > 0;
            $module.find(".caf-selected-term-main").first().toggleClass("caf-all-selected", !hasNonAllActive);

            CAFQueryBuilder.updateDropdownSelectedLabel($termsList, $dropdownChild);
            this.setFilterDropdownOpen(
                $dropdownChild,
                false,
                $module.find(".caf-selected-term-main .selected-icon i")
            );
            this.updateSearchResultUI($builder);
            this.buildQuery($builder);
        },

        handleSelectableItem($item) {
            const $builder = $item.closest(this.selectors.builder);
            const $list = $item.closest(".caf-terms-list");
            const $input = $item.find(".caf-taxo-input").first();
            const multipleTerm = String($list.attr("multiple-term")) === "true";
            const wasSelected = $item.hasClass("caf-selected");

            if (!multipleTerm) {
                $list.find(".caf-terms-list-item").removeClass("caf-selected active");
                $list.find(".caf-taxo-input").prop("checked", false);
                if (!wasSelected) {
                    $item.addClass("caf-selected active");
                    $input.prop("checked", true);
                }
            } else {
                const shouldSelect = !wasSelected;
                $item.toggleClass("caf-selected", shouldSelect);
                $item.toggleClass("active", shouldSelect);
                $input.prop("checked", shouldSelect);
            }

            this.updateSearchResultUI($builder);
            this.buildQuery($builder);
        },

        handleReset($builder) {
            const $filterLayout = $builder.find(".filter-layout-container");

            $filterLayout.find(".caf-terms-list .caf-taxo-input").each(function () {
                $(this).prop("checked", false).closest("li").removeClass("active caf-selected");
            });

            $filterLayout.find(".caf-filter-module-search-output").each(function () {
                $(this).removeAttr("data-committed-search-keyword");
            });
            $filterLayout.find(".caf-module-filter .caf-filter-module-search-output .caf-search-input-field").val("");
            $filterLayout.find(".caf-module-filter .caf-filter-module-search-output .clear-icon.on-type").hide();
            $builder.data("cafActiveSearchKeyword", "");

            $filterLayout.find(".caf-module-filter.caf-module-type-dropdown_filter").each(function () {
                CAFBuilder.resetDropdownModuleToAll($(this));
            });

            this.updateSearchResultUI($builder);
            this.buildQuery($builder);
        },

        updateSearchResultUI($builder) {
            const keyword = $.trim($builder.find(".caf-module-filter .caf-filter-module-search-output .caf-search-input-field").val() || "");
            const $searchResult = $builder.find(".caf-builder-template-preview-search-result-container");

            if (keyword) {
                $searchResult.find(".search-keyword").text(keyword);
                $searchResult.show();
            } else {
                $searchResult.find(".search-keyword").text("");
                $searchResult.hide();
            }
        },

        getDynamicCssHash($builder) {
            return String(
                $builder.attr("data-dynamic-css-hash")
                || $builder.data("cafDynamicCssHash")
                || ""
            );
        },

        setDynamicCssHash($builder, hash) {
            if (!hash) {
                return;
            }
            $builder.attr("data-dynamic-css-hash", hash);
            $builder.data("cafDynamicCssHash", hash);
        },

        buildQuery($builder, page = 1, options = {}) {
            const sortIndex = $builder.attr("caf-index");
            const loaderStatus = $builder.attr("loader-status");
            const responseMode = options.responseMode || "posts";
            const showLoader = options.skipLoader !== true && loaderStatus === "true";
            const queryArgs = CAFQueryBuilder.collectQueryArgs($builder, page);

            const queryKey = `caf-bq-${sortIndex || "0"}`;
            if (!this._buildQueryXhrs) {
                this._buildQueryXhrs = {};
            }
            const prevXhr = this._buildQueryXhrs[queryKey];
            if (prevXhr && typeof prevXhr.abort === "function") {
                prevXhr.abort();
            }

            const prevRid = $builder.data("cafBuildQueryRid") || 0;
            const requestId = prevRid + 1;
            $builder.data("cafBuildQueryRid", requestId);

            if (showLoader) {
                $builder.find(this.selectors.loader).addClass("active");
            }

            const jqXHR = $.ajax({
                url: tc_caf_ajax.ajax_url,
                type: "POST",
                dataType: "json",
                data: {
                    action: "get_caf_builder_posts",
                    nonce: tc_caf_ajax.nonce,
                    params: queryArgs,
                    selected_filters: [],
                    caf_index: sortIndex,
                    response_mode: responseMode,
                    dynamic_css_hash: this.getDynamicCssHash($builder)
                },
                success: (response) => {
                    if ($builder.data("cafBuildQueryRid") !== requestId) {
                        return;
                    }
                    if (!response || !response.success || !response.data) {
                        return;
                    }

                    const data = response.data;
                    this.updatePosts($builder, data);

                    if (data.dynamic_css_hash) {
                        this.setDynamicCssHash($builder, data.dynamic_css_hash);
                    }
                    if (data.dynamic_css) {
                        this.injectDynamicCss(data.dynamic_css);
                    }
                },
                error: (xhr, status) => {
                    if (status === "abort") {
                        return;
                    }
                },
                complete: () => {
                    if (this._buildQueryXhrs[queryKey] === jqXHR) {
                        delete this._buildQueryXhrs[queryKey];
                    }
                    if (showLoader && $builder.data("cafBuildQueryRid") === requestId) {
                        $builder.find(this.selectors.loader).removeClass("active");
                    }
                }
            });

            this._buildQueryXhrs[queryKey] = jqXHR;
        },

        updatePosts($builder, data) {
            const $postLayoutInner = $builder.find(this.selectors.postLayoutInner);

            if (typeof data.posts_data !== "undefined") {
                $postLayoutInner.html(data.posts_data);
            }

            if (typeof data.filter_top_data !== "undefined") {
                $builder.find(".caf-builder-template-preview-filter-top-wrapper").html(data.filter_top_data || "");
            }
            if (typeof data.filter_bottom_data !== "undefined") {
                $builder.find(".caf-builder-template-preview-filter-bottom-wrapper").html(data.filter_bottom_data || "");
            }
            if (typeof data.post_top_data !== "undefined") {
                $builder.find(".caf-builder-template-preview-post-top-wrapper").html(data.post_top_data || "");
            }
            if (typeof data.post_bottom_data !== "undefined") {
                $builder.find(".caf-builder-template-preview-post-bottom-wrapper").html(data.post_bottom_data || "");
            }
        },

        injectDynamicCss(css) {
            let $styleTag = $("#caf-builder-custom-ajax-style");

            if (!$styleTag.length) {
                $styleTag = $('<style id="caf-builder-custom-ajax-style"></style>');
                $("head").append($styleTag);
            }

            $styleTag.html(css);
        }
    };

    CAFBuilder.init();
});
