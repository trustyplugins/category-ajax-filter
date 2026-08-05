jQuery(function ($) {
    "use strict";

    function cafAnalyticsDebug(label, payload) {
        if (typeof tc_caf_ajax === "undefined" || !tc_caf_ajax.caf_analytics_debug) {
            return;
        }
        console.log("[CAF Analytics]", label, payload);
    }

    const CAF_RANGE_SLIDER_MODULE_SELECTOR =
        ".caf-module-filter.caf-module-type-range_slider";

    function cafGetRangeSliderModules($root) {
        if ($root.is(CAF_RANGE_SLIDER_MODULE_SELECTOR)) {
            return $root;
        }
        return $root.find(CAF_RANGE_SLIDER_MODULE_SELECTOR);
    }

    /** Min / max (or sole) jQuery UI slider handles â€” stable hooks for CSS. */
    function cafTagRangeSliderHandleClasses($slider, rangeType) {
        if (!$slider || !$slider.length) {
            return;
        }
        const $handles = $slider.find(".ui-slider-handle");
        $handles.removeClass("caf-ui-slider-left caf-ui-slider-right");
        const rt = String(rangeType || "double").toLowerCase();
        if (rt === "single") {
            $handles.first().addClass("caf-ui-slider-left");
            return;
        }
        $handles.eq(0).addClass("caf-ui-slider-left");
        if ($handles.length > 1) {
            $handles.eq(1).addClass("caf-ui-slider-right");
        }
    }

    const CAFSmartFilterSearch = {
        stopWords: new Set(["with", "and", "or", "in", "on", "at", "the", "a", "an", "of", "to", "for", "by", "than"]),
        contextStopWords: new Set([
            "with", "and", "or", "in", "on", "at", "the", "a", "an", "of", "to", "for", "by", "than",
            "less", "more", "under", "over", "below", "above", "around", "about", "from", "between",
            "minimum", "maximum", "min", "max", "least", "most", "approx", "approximately", "near"
        ]),
        numberWordValues: {
            zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
            ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
            twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90
        },
        numberWordScales: {
            hundred: 100,
            thousand: 1000,
            lakh: 100000,
            lakhs: 100000,
            million: 1000000,
            crore: 10000000,
            crores: 10000000,
            billion: 1000000000
        },
        isNumberWordToken(token) {
            if (!token) {
                return false;
            }
            return token === "and" || Object.prototype.hasOwnProperty.call(this.numberWordValues, token) || Object.prototype.hasOwnProperty.call(this.numberWordScales, token);
        },
        parseNumberWordChunk(tokens) {
            if (!Array.isArray(tokens) || !tokens.length) {
                return null;
            }
            let total = 0;
            let current = 0;
            let hasNumber = false;
            tokens.forEach((token) => {
                if (token === "and") {
                    return;
                }
                if (Object.prototype.hasOwnProperty.call(this.numberWordValues, token)) {
                    current += this.numberWordValues[token];
                    hasNumber = true;
                    return;
                }
                if (token === "hundred") {
                    current = (current || 1) * 100;
                    hasNumber = true;
                    return;
                }
                if (Object.prototype.hasOwnProperty.call(this.numberWordScales, token)) {
                    const scale = this.numberWordScales[token];
                    if (scale >= 1000) {
                        current = current || 1;
                        total += current * scale;
                        current = 0;
                    } else {
                        current = (current || 1) * scale;
                    }
                    hasNumber = true;
                }
            });
            if (!hasNumber) {
                return null;
            }
            return total + current;
        },
        normalizeNumberWords(value) {
            const base = String(value || "")
                .toLowerCase()
                .replace(/-/g, " ")
                .replace(/[^a-z0-9\s]/g, " ")
                .replace(/\s+/g, " ")
                .trim();
            if (!base) {
                return "";
            }
            const tokens = base.split(" ").filter(Boolean);
            const output = [];
            let chunk = [];
            const flushChunk = () => {
                if (!chunk.length) {
                    return;
                }
                const numericValue = this.parseNumberWordChunk(chunk);
                if (numericValue === null) {
                    output.push(...chunk);
                } else {
                    output.push(String(numericValue));
                }
                chunk = [];
            };

            tokens.forEach((token) => {
                if (this.isNumberWordToken(token)) {
                    chunk.push(token);
                    return;
                }
                flushChunk();
                output.push(token);
            });
            flushChunk();
            return output.join(" ");
        },
        normalize(value) {
            return this.normalizeNumberWords(value)
                .replace(/[^a-z0-9\s-]/g, " ")
                .replace(/\s+/g, " ")
                .replace(/-+/g, " ");
        },
        singularize(word) {
            if (!word || word.length <= 2) {
                return word;
            }
            if (word.endsWith("ss")) {
                return word;
            }
            if (word.endsWith("ies") && word.length > 4) {
                return `${word.slice(0, -3)}y`;
            }
            if (word.endsWith("es") && word.length > 4) {
                return word.slice(0, -2);
            }
            if (word.endsWith("s") && word.length > 3) {
                return word.slice(0, -1);
            }
            return word;
        },
        tokenize(value) {
            const normalized = this.normalize(value);
            if (!normalized) {
                return [];
            }
            return normalized
                .split(" ")
                .map((token) => this.singularize(token))
                .filter((token) => token && !this.stopWords.has(token));
        },
        levenshtein(a, b) {
            const m = a.length;
            const n = b.length;
            if (!m) return n;
            if (!n) return m;
            const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
            for (let i = 0; i <= m; i += 1) dp[i][0] = i;
            for (let j = 0; j <= n; j += 1) dp[0][j] = j;
            for (let i = 1; i <= m; i += 1) {
                for (let j = 1; j <= n; j += 1) {
                    const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                    dp[i][j] = Math.min(
                        dp[i - 1][j] + 1,
                        dp[i][j - 1] + 1,
                        dp[i - 1][j - 1] + cost
                    );
                }
            }
            return dp[m][n];
        },
        isTokenMatch(queryToken, termToken) {
            if (!queryToken || !termToken) {
                return false;
            }
            const queryIsNumeric = /^\d+(?:\.\d+)?$/.test(queryToken);
            const termIsNumeric = /^\d+(?:\.\d+)?$/.test(termToken);
            if (queryIsNumeric || termIsNumeric) {
                // Numeric tokens should be strict to avoid 601 matching 600.
                return queryIsNumeric && termIsNumeric && queryToken === termToken;
            }
            if (queryToken === termToken) {
                return true;
            }
            if (queryToken.length >= 4 && termToken.startsWith(queryToken)) {
                return true;
            }
            if (termToken.length >= 4 && queryToken.startsWith(termToken)) {
                return true;
            }
            const maxLen = Math.max(queryToken.length, termToken.length);
            if (maxLen <= 4) {
                return false;
            }
            const distance = this.levenshtein(queryToken, termToken);
            return maxLen <= 6 ? distance <= 1 : distance <= 2;
        },
        isNumericToken(token) {
            return /^\d+(?:\.\d+)?$/.test(String(token || ""));
        },
        getContextTokens(value) {
            return this.tokenize(value).filter((token) => {
                if (!token || this.isNumericToken(token)) {
                    return false;
                }
                return !this.contextStopWords.has(token);
            });
        },
        extractContextValuePairs(value) {
            const normalized = this.normalize(value);
            if (!normalized) {
                return [];
            }
            const rawTokens = normalized.split(" ").filter(Boolean);
            const tokens = rawTokens.map((token) => this.singularize(token));
            const pairs = [];

            for (let i = 0; i < tokens.length; i += 1) {
                const token = tokens[i];
                if (!this.isNumericToken(token)) {
                    continue;
                }
                const numericValue = parseFloat(token);
                if (Number.isNaN(numericValue)) {
                    continue;
                }

                // Prefer context words after the number ("2 beds", "1 bedroom").
                let forwardMatched = false;
                for (let j = i + 1; j <= Math.min(i + 3, tokens.length - 1); j += 1) {
                    const ctx = tokens[j];
                    // Stop forward scanning once another number starts.
                    if (!ctx) {
                        continue;
                    }
                    if (this.isNumericToken(ctx)) {
                        break;
                    }
                    if (this.contextStopWords.has(ctx)) {
                        continue;
                    }
                    pairs.push({ context: ctx, value: numericValue });
                    forwardMatched = true;
                    break;
                }

                // Also support context before the number ("price under 35").
                if (!forwardMatched) {
                    for (let j = i - 1; j >= Math.max(i - 3, 0); j -= 1) {
                        const ctx = tokens[j];
                        if (!ctx) {
                            continue;
                        }
                        if (this.isNumericToken(ctx)) {
                            break;
                        }
                        if (this.contextStopWords.has(ctx)) {
                            continue;
                        }
                        pairs.push({ context: ctx, value: numericValue });
                        break;
                    }
                }
            }

            return pairs;
        },
        extractNumericMeta(value) {
            const originalRaw = String(value || "").toLowerCase();
            const raw = this.normalizeNumberWords(value);
            const numbers = [];
            const ranges = [];
            const matches = raw.match(/\d+(?:\.\d+)?/g) || [];
            matches.forEach((item) => {
                const parsed = parseFloat(item);
                if (!Number.isNaN(parsed)) {
                    numbers.push(parsed);
                }
            });

            const rangeRegex = /(\d+(?:\.\d+)?)\s*(?:-|â€“|â€”|to)\s*(\d+(?:\.\d+)?)/g;
            let rangeMatch = rangeRegex.exec(raw);
            while (rangeMatch !== null) {
                const start = parseFloat(rangeMatch[1]);
                const end = parseFloat(rangeMatch[2]);
                if (!Number.isNaN(start) && !Number.isNaN(end)) {
                    ranges.push({
                        min: Math.min(start, end),
                        max: Math.max(start, end)
                    });
                }
                rangeMatch = rangeRegex.exec(raw);
            }

            let comparator = "";
            const hasPlusThreshold = /\b\d+(?:\.\d+)?\s*\+/.test(originalRaw);
            if (/less than|under|below|at most|maximum|max|<=|</.test(raw)) {
                comparator = "lt";
            } else if (hasPlusThreshold || /more than|over|above|at least|minimum|min|>=|>/.test(raw)) {
                comparator = "gt";
            } else if (/around|about|approx|approximately|near/.test(raw)) {
                comparator = "eq";
            } else if (ranges.length > 0) {
                comparator = "range";
            }

            const exactIntent = /\b(exact|exactly|only|just|equal|equals)\b/.test(raw) ||
                /\b(?:is|at)\s+\d+(?:\.\d+)?\b/.test(raw) ||
                /\=\s*\d+(?:\.\d+)?\b/.test(raw);

            return { numbers, comparator, ranges, exactIntent };
        },
        scoreNumericMatch(queryMeta, termMeta) {
            if (!queryMeta || !termMeta || !queryMeta.numbers.length || !termMeta.numbers.length) {
                if (!queryMeta || !termMeta || !queryMeta.numbers.length || !termMeta.ranges || !termMeta.ranges.length) {
                    return 0;
                }
            }
            let best = 0;
            const queryNumbers = queryMeta.numbers || [];
            const termNumbers = termMeta.numbers || [];
            const queryRanges = Array.isArray(queryMeta.ranges) ? queryMeta.ranges : [];
            const termRanges = Array.isArray(termMeta.ranges) ? termMeta.ranges : [];

            // Discrete value intent (e.g. "2 beds"): for plain numeric terms,
            // require exact value match to avoid selecting neighboring options.
            if (
                (!queryMeta.comparator || queryMeta.comparator === "eq") &&
                queryNumbers.length === 1 &&
                (!termMeta.comparator || termMeta.comparator === "eq") &&
                termNumbers.length === 1 &&
                !termRanges.length
            ) {
                return queryNumbers[0] === termNumbers[0] ? 160 : 0;
            }

            // Strong range intent handling: from X to Y / X-Y.
            if (queryMeta.comparator === "range" && queryRanges.length) {
                // Prefer range terms only for range-intent queries.
                if (!termRanges.length) {
                    return 0;
                }

                queryRanges.forEach((qRange) => {
                    termRanges.forEach((tRange) => {
                        let score = 0;
                        const exactRange = qRange.min === tRange.min && qRange.max === tRange.max;
                        const contains = tRange.min <= qRange.min && tRange.max >= qRange.max;
                        const overlaps = !(tRange.max < qRange.min || tRange.min > qRange.max);

                        if (exactRange) {
                            score = 180;
                        } else if (contains) {
                            score = 130;
                        } else if (overlaps) {
                            score = 80;
                        }

                        if (score > best) {
                            best = score;
                        }
                    });
                });
                return Math.max(0, best);
            }

            if (queryNumbers.length && Array.isArray(termMeta.ranges) && termMeta.ranges.length) {
                queryNumbers.forEach((qNum) => {
                    termMeta.ranges.forEach((range) => {
                        if (qNum >= range.min && qNum <= range.max) {
                            best = Math.max(best, 120);
                        }
                    });
                });
            }

            if (!queryNumbers.length || !termNumbers.length) {
                return Math.max(0, best);
            }

            queryMeta.numbers.forEach((qNum) => {
                termMeta.numbers.forEach((tNum) => {
                    if (termMeta.comparator === "range") {
                        const inAnyRange = Array.isArray(termMeta.ranges) && termMeta.ranges.some((range) => (
                            qNum >= range.min && qNum <= range.max
                        ));
                        if (!inAnyRange) {
                            return;
                        }
                    }
                    // Hard compatibility gates for range intent.
                    if (queryMeta.comparator === "gt") {
                        if (termMeta.comparator === "lt") {
                            return;
                        }
                        if (termMeta.comparator === "eq" && tNum < qNum) {
                            return;
                        }
                    }
                    if (queryMeta.comparator === "lt") {
                        if (termMeta.comparator === "gt") {
                            return;
                        }
                        // "less than X" should be strict (<), not <=.
                        if (termMeta.comparator === "eq" && tNum >= qNum) {
                            return;
                        }
                    }
                    if (queryMeta.comparator === "gt") {
                        // "more than X" should be strict (>), not >=.
                        if (termMeta.comparator === "eq" && tNum <= qNum) {
                            return;
                        }
                    }
                    if (!queryMeta.comparator || queryMeta.comparator === "eq") {
                        if (termMeta.comparator === "lt" && !(qNum <= tNum)) {
                            return;
                        }
                        if (termMeta.comparator === "gt" && !(qNum >= tNum)) {
                            return;
                        }
                    }

                    let score = 0;
                    // Plain numeric query should still match threshold terms by condition,
                    // even when absolute distance is large (e.g. 200 should match "<300").
                    if (!queryMeta.comparator || queryMeta.comparator === "eq") {
                        if (termMeta.comparator === "lt" && qNum <= tNum) {
                            score += 80;
                        } else if (termMeta.comparator === "gt" && qNum >= tNum) {
                            score += 80;
                        }
                    }

                    const diff = Math.abs(qNum - tNum);
                    if (diff === 0) {
                        score += 70;
                    } else if (diff <= 2) {
                        score += 35;
                    } else if (diff <= 5) {
                        score += 15;
                    }

                    if (queryMeta.comparator) {
                        if (termMeta.comparator && queryMeta.comparator === termMeta.comparator) {
                            score += 25;
                        } else if (termMeta.comparator && queryMeta.comparator !== termMeta.comparator) {
                            score -= 20;
                        }
                    } else if (diff === 0) {
                        score += 10;
                    }

                    if (score > best) {
                        best = score;
                    }
                });
            });
            return Math.max(0, best);
        }
    };

    const CAFQueryBuilder = {
        getSearchModuleSettings($builder) {
            const $searchOutput = $builder
                .find(".caf-module-filter.caf-module-type-search .caf-filter-module-search-output")
                .first();
            if (!$searchOutput.length) {
                return {
                    keywordEnabled: true,
                    smartEnabled: true,
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
                smartEnabled: String($searchOutput.attr("data-smart-search-enabled") || "true") === "true",
                searchTrigger: String($searchOutput.attr("data-search-trigger") || "enter_icon"),
                charLimitEnabled: String($searchOutput.attr("data-char-limit-enabled") || "false") === "true",
                charLimit: parseInt($searchOutput.attr("data-char-limit") || "0", 10) || 0,
                source: {
                    everything: String($searchOutput.attr("data-search-source-everything") || "false") === "true",
                    title: String($searchOutput.attr("data-search-source-title") || "false") === "true",
                    descriptions: String($searchOutput.attr("data-search-source-descriptions") || "false") === "true",
                    custom_field: String($searchOutput.attr("data-search-source-custom-field") || "false") === "true"
                },
                customField: String($searchOutput.attr("data-search-custom-field") || "")
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
            const canSearchPosts = searchSettings.keywordEnabled || searchSettings.smartEnabled;
            if (!canSearchPosts) {
                return "";
            }
            if (searchSettings.searchTrigger === "typing") {
                return this.getCommittedSearchKeywordForTags($builder);
            }
            return this.getSearchKeywordForSelectedTags($builder);
        },
        parsePostsPerPage($builder) {
            const raw = $builder.attr("post-per-page");
            if (raw === undefined || raw === null || raw === "") {
                return -1;
            }
            const postsPerPage = parseInt(raw, 10);
            if (Number.isNaN(postsPerPage)) {
                return -1;
            }
            if (-1 === postsPerPage) {
                return -1;
            }
            return postsPerPage > 0 ? postsPerPage : -1;
        },
        collectQueryArgs($builder, page = 1) {
            const queryArgs = {
                post_type: $builder.attr("post-type"),
                posts_per_page: this.parsePostsPerPage($builder),
                paged: page,
                post_status: "publish"
            };

            const isQueryOnlyMode = String($builder.attr("data-caf-query-only") || "") === "1";
            const queryOnlyPreset = this.collectQueryOnlyPreset($builder);
            const filterData = this.collectFilterData($builder);

            if (isQueryOnlyMode) {
                if (queryOnlyPreset.taxQuery) {
                    queryArgs.tax_query = queryOnlyPreset.taxQuery;
                }
            } else if (filterData.taxQuery.length) {
                queryArgs.tax_query = this.buildTaxQuery(
                    filterData.taxQuery,
                    $builder.attr("taxonomy-relation")
                );
            }

            if (filterData.metaQuery.length) {
                queryArgs.meta_query = this.buildMetaQuery(
                    filterData.metaQuery,
                    $builder.attr("meta-relation")
                );
            } else if (queryOnlyPreset.metaQuery) {
                queryArgs.meta_query = queryOnlyPreset.metaQuery;
            }

            const searchKeyword = this.getSearchKeyword($builder);
            const hasSmartMatches = parseInt($builder.data("cafSmartMatchedTermsCount") || 0, 10) > 0;
            if (searchKeyword && !hasSmartMatches) {
                queryArgs.s = searchKeyword;
                const searchSettings = this.getSearchModuleSettings($builder);
                const allowKeywordFallback = searchSettings.keywordEnabled || searchSettings.smartEnabled;
                if (allowKeywordFallback) {
                    queryArgs.caf_search_keyword = searchKeyword;
                    queryArgs.caf_search_source = searchSettings.source;
                    if (searchSettings.source.custom_field) {
                        queryArgs.caf_search_custom_field = searchSettings.customField || "";
                    }
                }
            }

            const sorting = this.resolveSortingData($builder);

            if (sorting.orderby && sorting.orderby !== "0") {
                queryArgs.orderby = sorting.orderby;
            }

            if (sorting.order && sorting.order !== "0") {
                queryArgs.order = sorting.order;
            }
            return queryArgs;
        },

        collectQueryOnlyPreset($builder) {
            const preset = { taxQuery: null, metaQuery: null };
            if (String($builder.attr("data-caf-query-only") || "") !== "1") {
                return preset;
            }

            const parsePreset = (raw) => {
                if (!raw) {
                    return null;
                }
                try {
                    const parsed = JSON.parse(raw);
                    if (!parsed) {
                        return null;
                    }
                    if (Array.isArray(parsed)) {
                        return parsed.length ? parsed : null;
                    }
                    return Object.keys(parsed).length ? parsed : null;
                } catch (error) {
                    return null;
                }
            };

            preset.taxQuery = parsePreset($builder.attr("data-caf-query-tax"));
            preset.metaQuery = parsePreset($builder.attr("data-caf-query-meta"));
            return preset;
        },

        collectFilterData($builder) {
            const groupedTaxByModule = {};
            const groupedMeta = {};
            const rangeMetaQuery = [];

            const $selectedItems = this.getSelectedFilterItems($builder);

            $selectedItems.each((_, element) => {
                const $item = jQuery(element);
                const itemData = this.extractFilterItemData($item);

                if (!itemData || !itemData.dataSource) {
                    return;
                }

                if (itemData.dataSource === "taxonomy") {
                    this.addTaxFilter(groupedTaxByModule, itemData);
                }

                if (itemData.dataSource === "custom_field") {
                    this.addMetaFilter(groupedMeta, itemData);
                }
            });

            this.collectRangeSliderMeta($builder).forEach((item) => {
                rangeMetaQuery.push(item);
            });

            return {
                taxQuery: this.moduleTaxGroupsToQueryPieces(groupedTaxByModule),
                metaQuery: [...Object.values(groupedMeta), ...rangeMetaQuery]
            };
        },

        collectRangeSliderMeta($builder) {
            const clauses = [];

            $builder.find(".caf-module-filter.caf-module-type-range_slider .caf-range-slider-ui").each((_, element) => {
                const $slider = $(element);
                const key = String($slider.attr("data-meta-key") || "").trim();
                if (!key || key === "0") {
                    return;
                }

                const rangeType = String($slider.attr("data-range-type") || "double").toLowerCase();
                const rangeMinBound = Number($slider.attr("data-min"));
                const rangeMaxBound = Number($slider.attr("data-max"));
                const minVal = Number($slider.attr("data-current-min"));
                const maxVal = Number($slider.attr("data-current-max"));
                const safeMin = Number.isFinite(minVal) ? minVal : rangeMinBound;
                const safeMax = Number.isFinite(maxVal) ? maxVal : rangeMaxBound;
                if (!Number.isFinite(safeMin) || !Number.isFinite(safeMax)) {
                    return;
                }

                // Skip only when the slider is at the neutral "full span" (no narrowing). Comparing to
                // data-start-* wrongly omitted the query on first load when default values were enabled
                // and start_min/start_max were a real sub-range (current === start).
                if (rangeType === "single") {
                    if (Number.isFinite(rangeMaxBound) && safeMax === rangeMaxBound) {
                        return;
                    }
                } else if (
                    Number.isFinite(rangeMinBound) &&
                    Number.isFinite(rangeMaxBound) &&
                    safeMin === rangeMinBound &&
                    safeMax === rangeMaxBound
                ) {
                    return;
                }

                if (rangeType === "single") {
                    clauses.push({
                        key,
                        value: safeMax,
                        compare: "<=",
                        type: "NUMERIC"
                    });
                    return;
                }

                clauses.push({
                    key,
                    value: [safeMin, safeMax],
                    compare: "BETWEEN",
                    type: "NUMERIC"
                });
            });

            return clauses;
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
                categoryRelation: String($list.attr("category-relation") || "OR"),
                metaCompare: $list.attr("meta-operator") || "=",
                metaType: $list.attr("meta-type") || "CHAR"
            };
        },

        /**
         * One tax_query piece per filter module: terms grouped by taxonomy, combined with module category_relation.
         */
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
                    // Plain object so jQuery.param + PHP keep `relation` (Array + .relation often drops on POST).
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

        addMetaFilter(groupedMeta, itemData) {
            const key = itemData.dataKey;
            const value = itemData.termValue;

            if (!key || !value || value === "0" || value === "all") {
                return;
            }

            if (!groupedMeta[key]) {
                groupedMeta[key] = {
                    key,
                    value: [],
                    compare: itemData.metaCompare,
                    type: itemData.metaType
                };
            }

            if (!groupedMeta[key].value.includes(value)) {
                groupedMeta[key].value.push(value);
            }
        },

        /**
         * Leaf tax clauses for analytics (walks module pieces and nested { relation, 0, 1, ... } groups).
         */
        flattenTaxQueryLeaves(taxPieces) {
            const leaves = [];
            const visit = (node) => {
                if (!node || typeof node !== "object") {
                    return;
                }
                if (Array.isArray(node)) {
                    node.forEach(visit);
                    return;
                }
                if (
                    typeof node.taxonomy === "string" &&
                    node.taxonomy &&
                    node.terms != null &&
                    typeof node.field === "string"
                ) {
                    const t = node.terms;
                    const ids = Array.isArray(t) ? t : [t];
                    leaves.push({
                        taxonomy: node.taxonomy,
                        terms: ids.map((v) => String(v))
                    });
                    return;
                }
                Object.keys(node).forEach((k) => {
                    if (k === "relation") {
                        return;
                    }
                    visit(node[k]);
                });
            };

            if (!taxPieces) {
                return leaves;
            }

            if (Array.isArray(taxPieces)) {
                taxPieces.forEach(visit);
            } else if (typeof taxPieces === "object") {
                visit(taxPieces);
            }

            return leaves;
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

        buildMetaQuery(metaQueryItems, relation = "OR") {
            if (!metaQueryItems.length) {
                return [];
            }

            if (metaQueryItems.length === 1) {
                return [...metaQueryItems];
            }

            const rel = String(relation || "OR").toUpperCase() === "AND" ? "AND" : "OR";
            const query = { relation: rel };
            metaQueryItems.forEach((item, i) => {
                query[i] = item;
            });
            return query;
        },

        getSearchInputValue($builder) {
            return jQuery.trim(
                $builder.find(".caf-module-filter.caf-module-type-search .caf-search-input-field").val() || ""
            );
        },
        getSearchKeyword($builder) {
            return this.getSearchKeywordForQuery($builder);
        },

        getSortingData($builder) {
            const $sortingContainer = $builder.find(".caf-builder-template-preview-sorting-container");

            const order = $sortingContainer
                .find(".caf-builder-template-preview-sorting-content-dropdown-order-type")
                .attr("data-value") || "0";

            const orderby = $sortingContainer
                .find(".caf-builder-template-preview-sorting-content-dropdown-order-by")
                .attr("data-value") || "0";

            return {
                orderby,
                order
            };
        },

        getDefaultSortingData($builder) {
            const orderby = String($builder.attr("data-default-orderby") || "title").toLowerCase();
            const order = String($builder.attr("data-default-order") || "ASC").toUpperCase();

            return {
                orderby,
                order
            };
        },

        resolveSortingData($builder) {
            const sorting = this.getSortingData($builder);
            const defaults = this.getDefaultSortingData($builder);
            let orderby = sorting.orderby && sorting.orderby !== "0" ? sorting.orderby : "";
            let order = sorting.order && sorting.order !== "0" ? sorting.order : "";

            if ((!orderby || !order) && typeof CAFUrlState !== "undefined" && CAFUrlState.isEnabled($builder)) {
                const urlState = CAFUrlState.read($builder) || {};
                if (!orderby && urlState.orderby && urlState.orderby !== "0") {
                    orderby = String(urlState.orderby).toLowerCase();
                }
                if (!order && urlState.order && urlState.order !== "0") {
                    order = String(urlState.order).toUpperCase();
                }
            }

            return {
                orderby: orderby || defaults.orderby,
                order: order || defaults.order
            };
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

    const CAFUrlState = {
        getBuilderIndex($builder) {
            return String($builder.attr("caf-index") || "0");
        },

        getReadablePrefix($builder) {
            return `caf_${this.getBuilderIndex($builder)}_`;
        },

        getLegacyBlobParamName($builder) {
            return `caf_filter_${this.getBuilderIndex($builder)}`;
        },

        isEnabled($builder) {
            const raw = $builder.attr("data-caf-filter-urls");
            if (raw === undefined || raw === null || raw === "") {
                return false;
            }
            return String(raw) === "1";
        },

        isSchemaEnabled($builder) {
            const raw = $builder.attr("data-caf-schema-enabled");
            if (raw === undefined || raw === null || raw === "") {
                return false;
            }
            return String(raw) === "1";
        },

        encodeBase64Url(value) {
            try {
                return btoa(
                    encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_, hex) =>
                        String.fromCharCode(parseInt(hex, 16))
                    )
                )
                    .replace(/\+/g, "-")
                    .replace(/\//g, "_")
                    .replace(/=+$/g, "");
            } catch (error) {
                return "";
            }
        },

        decodeBase64Url(raw) {
            try {
                let base64 = String(raw || "").replace(/-/g, "+").replace(/_/g, "/");
                const pad = base64.length % 4;
                if (pad) {
                    base64 += "=".repeat(4 - pad);
                }
                const json = decodeURIComponent(
                    Array.prototype.map
                        .call(atob(base64), (char) => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2))
                        .join("")
                );
                const parsed = JSON.parse(json);
                return parsed && typeof parsed === "object" ? parsed : null;
            } catch (error) {
                return null;
            }
        },

        hasFrontendSortingUI($builder) {
            return Boolean(
                $builder &&
                    $builder.length &&
                    $builder.find(".caf-builder-template-preview-sorting-container").length
            );
        },

        packQueryArgs(queryArgs) {
            const state = {};
            if (!queryArgs || typeof queryArgs !== "object") {
                return state;
            }

            const taxQuery = queryArgs.tax_query;
            if (Array.isArray(taxQuery) && taxQuery.length) {
                state.tax_query = taxQuery;
            } else if (taxQuery && typeof taxQuery === "object" && !Array.isArray(taxQuery)) {
                state.tax_query = taxQuery;
            }

            const metaQuery = queryArgs.meta_query;
            if (Array.isArray(metaQuery) && metaQuery.length) {
                state.meta_query = metaQuery;
            } else if (metaQuery && typeof metaQuery === "object" && !Array.isArray(metaQuery)) {
                state.meta_query = metaQuery;
            }
            if (queryArgs.s) {
                state.s = queryArgs.s;
            }
            if (queryArgs.caf_search_keyword) {
                state.caf_search_keyword = queryArgs.caf_search_keyword;
            }
            if (queryArgs.caf_search_source) {
                state.caf_search_source = queryArgs.caf_search_source;
            }
            if (queryArgs.caf_search_custom_field) {
                state.caf_search_custom_field = queryArgs.caf_search_custom_field;
            }
            if (queryArgs.orderby && queryArgs.orderby !== "0") {
                state.orderby = queryArgs.orderby;
            }
            if (queryArgs.order && queryArgs.order !== "0") {
                state.order = queryArgs.order;
            }

            return state;
        },

        serializeFromBuilder($builder) {
            const queryArgs = CAFQueryBuilder.collectQueryArgs($builder, 1);

            if (!this.hasFrontendSortingUI($builder)) {
                delete queryArgs.orderby;
                delete queryArgs.order;
            } else {
                const sorting = CAFQueryBuilder.getSortingData($builder);
                if (!sorting.orderby || sorting.orderby === "0") {
                    delete queryArgs.orderby;
                } else {
                    queryArgs.orderby = sorting.orderby;
                }
                if (!sorting.order || sorting.order === "0") {
                    delete queryArgs.order;
                } else {
                    queryArgs.order = sorting.order;
                }
            }

            return this.packQueryArgs(queryArgs);
        },

        parseRangeToken(metaKey, value) {
            const raw = String(value || "").trim();
            if (!metaKey || !raw) {
                return null;
            }

            const between = raw.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/);
            if (between) {
                return {
                    key: metaKey,
                    value: [parseFloat(between[1]), parseFloat(between[2])],
                    compare: "BETWEEN",
                    type: "NUMERIC"
                };
            }

            const lte = raw.match(/^<=(.+)$/);
            if (lte) {
                return {
                    key: metaKey,
                    value: parseFloat(lte[1]),
                    compare: "<=",
                    type: "NUMERIC"
                };
            }

            return {
                key: metaKey,
                value: raw,
                compare: "=",
                type: "CHAR"
            };
        },

        parseReadableParams($builder) {
            const prefix = this.getReadablePrefix($builder);
            const params = new URLSearchParams(window.location.search);
            const taxGroups = {};
            const metaItems = [];
            const state = {};
            const reserved = new Set(["s", "orderby", "order", "tax", "term"]);

            params.forEach((value, key) => {
                if (!key.startsWith(prefix)) {
                    return;
                }

                const suffix = key.slice(prefix.length);
                const cleanValue = String(value || "").trim();
                if (!suffix || !cleanValue) {
                    return;
                }

                if (suffix === "s") {
                    state.s = cleanValue;
                    state.caf_search_keyword = cleanValue;
                    return;
                }

                if (suffix === "orderby") {
                    state.orderby = cleanValue;
                    return;
                }

                if (suffix === "order") {
                    state.order = cleanValue;
                    return;
                }

                if (suffix.startsWith("cf_")) {
                    metaItems.push({
                        key: suffix.slice(3),
                        value: cleanValue,
                        compare: "=",
                        type: "CHAR"
                    });
                    return;
                }

                if (suffix.startsWith("range_")) {
                    const clause = this.parseRangeToken(suffix.slice(6), cleanValue);
                    if (clause) {
                        metaItems.push(clause);
                    }
                    return;
                }

                if (reserved.has(suffix)) {
                    return;
                }

                const tokens = cleanValue.split(",").map((token) => token.trim()).filter(Boolean);
                if (!tokens.length) {
                    return;
                }

                taxGroups[suffix] = (taxGroups[suffix] || []).concat(tokens);
            });

            const taxLeaves = Object.keys(taxGroups).map((taxonomy) => ({
                taxonomy,
                field: "term_id",
                terms: taxGroups[taxonomy],
                operator: "IN"
            }));

            if (taxLeaves.length === 1) {
                state.tax_query = taxLeaves;
            } else if (taxLeaves.length > 1) {
                state.tax_query = [{ relation: "AND" }, ...taxLeaves];
            }

            if (metaItems.length === 1) {
                state.meta_query = metaItems;
            } else if (metaItems.length > 1) {
                state.meta_query = [{ relation: "AND" }, ...metaItems];
            }

            return state;
        },

        readLegacyTermParams($builder) {
            const index = this.getBuilderIndex($builder);
            const params = new URLSearchParams(window.location.search);
            const scopedTerm = params.get(`caf_${index}_term`);
            const scopedTax = params.get(`caf_${index}_tax`);
            const globalTerm = index === "0" ? params.get("caf_term") : null;
            const globalTax = index === "0" ? params.get("caf_tax") : null;
            const term = scopedTerm || globalTerm;
            const tax = scopedTax || globalTax;

            if (!term || !tax) {
                return null;
            }

            return {
                tax_query: [
                    {
                        taxonomy: tax,
                        field: "term_id",
                        terms: [term],
                        operator: "IN"
                    }
                ]
            };
        },

        read($builder) {
            const readable = this.parseReadableParams($builder);
            if (readable && Object.keys(readable).length) {
                return readable;
            }

            const legacyTerm = this.readLegacyTermParams($builder);
            if (legacyTerm) {
                return legacyTerm;
            }

            const params = new URLSearchParams(window.location.search);
            const raw = params.get(this.getLegacyBlobParamName($builder));
            if (!raw) {
                return null;
            }

            return this.decodeBase64Url(raw);
        },

        clearBuilderParams(url, $builder) {
            const prefix = this.getReadablePrefix($builder);
            const index = this.getBuilderIndex($builder);
            const keysToDelete = [];

            url.searchParams.forEach((_, key) => {
                if (key.startsWith(prefix) || key === this.getLegacyBlobParamName($builder)) {
                    keysToDelete.push(key);
                }
            });

            keysToDelete.push(`caf_${index}_term`, `caf_${index}_tax`);
            if (index === "0") {
                keysToDelete.push("caf_term", "caf_tax");
            }

            [...new Set(keysToDelete)].forEach((key) => url.searchParams.delete(key));
        },

        getTermTokenFromItem($item) {
            const slug = String($item.attr("term-slug") || "").trim();
            if (slug) {
                return slug;
            }
            const termId = String($item.attr("term-id") || "").trim();
            if (termId) {
                return termId;
            }
            return String($item.find(".caf-taxo-input").val() || "").trim();
        },

        getTermSlugFromBuilder($builder, taxonomy, termId) {
            const $item = this.resolveTermItem($builder, taxonomy, termId);
            if ($item.length) {
                return this.getTermTokenFromItem($item);
            }
            return String(termId);
        },

        buildReadableParams($builder, state) {
            const prefix = this.getReadablePrefix($builder);
            const entries = [];
            const taxTokensByKey = {};

            CAFQueryBuilder.flattenTaxQueryLeaves(state.tax_query || []).forEach((leaf) => {
                const tokens = (leaf.terms || [])
                    .map((termId) => this.getTermSlugFromBuilder($builder, leaf.taxonomy, termId))
                    .filter(Boolean);

                if (!tokens.length || !leaf.taxonomy) {
                    return;
                }

                if (!taxTokensByKey[leaf.taxonomy]) {
                    taxTokensByKey[leaf.taxonomy] = [];
                }

                taxTokensByKey[leaf.taxonomy].push(...tokens);
            });

            Object.keys(taxTokensByKey).forEach((taxonomy) => {
                const merged = [...new Set(taxTokensByKey[taxonomy])].filter(Boolean);
                if (merged.length) {
                    entries.push([`${prefix}${taxonomy}`, merged.join(",")]);
                }
            });

            this.flattenMetaQueryLeaves(state.meta_query || []).forEach((clause) => {
                if (!clause || !clause.key) {
                    return;
                }

                if (clause.compare === "BETWEEN" && Array.isArray(clause.value) && clause.value.length >= 2) {
                    entries.push([`${prefix}range_${clause.key}`, `${clause.value[0]}-${clause.value[1]}`]);
                    return;
                }

                if (clause.compare === "<=" && clause.value != null) {
                    entries.push([`${prefix}range_${clause.key}`, `<=${clause.value}`]);
                    return;
                }

                if (clause.compare === "=" || clause.compare === "IN") {
                    const values = Array.isArray(clause.value) ? clause.value : [clause.value];
                    values.forEach((value) => {
                        if (value != null && String(value) !== "") {
                            entries.push([`${prefix}cf_${clause.key}`, String(value)]);
                        }
                    });
                }
            });

            const keyword = String(state.s || state.caf_search_keyword || "").trim();
            if (keyword) {
                entries.push([`${prefix}s`, keyword]);
            }

            if (state.orderby && state.orderby !== "0") {
                entries.push([`${prefix}orderby`, String(state.orderby)]);
            }

            if (state.order && state.order !== "0") {
                entries.push([`${prefix}order`, String(state.order)]);
            }

            return entries;
        },

        updateHistory($builder, replace = true) {
            if (!this.isEnabled($builder)) {
                return;
            }

            const state = this.serializeFromBuilder($builder);
            const url = new URL(window.location.href);

            this.clearBuilderParams(url, $builder);

            // Filter changes should return to page 1 (theme pretty pagination / ?paged=).
            if (typeof CAFBuilder !== "undefined" && CAFBuilder.isMainQueryListing($builder)) {
                url.pathname = url.pathname.replace(/\/page\/\d+\/?(?=$|\?|#)/i, "/");
                url.pathname = url.pathname.replace(/\/{2,}/g, "/");
                url.searchParams.delete("paged");
                url.searchParams.delete("product-page");
                url.searchParams.delete("product_page");
            }

            if (state && Object.keys(state).length) {
                this.buildReadableParams($builder, state).forEach(([key, value]) => {
                    url.searchParams.set(key, value);
                });
            }

            const method = replace ? "replaceState" : "pushState";
            window.history[method]({ cafBuilderFilter: true }, "", url.toString());
        },

        flattenMetaQueryLeaves(metaPieces) {
            const leaves = [];
            const visit = (node) => {
                if (!node || typeof node !== "object") {
                    return;
                }
                if (Array.isArray(node)) {
                    node.forEach(visit);
                    return;
                }
                if (typeof node.key === "string" && node.key && node.compare) {
                    leaves.push({
                        key: node.key,
                        value: node.value,
                        compare: node.compare,
                        type: node.type || "CHAR"
                    });
                    return;
                }
                Object.keys(node).forEach((k) => {
                    if (k === "relation") {
                        return;
                    }
                    visit(node[k]);
                });
            };

            if (!metaPieces) {
                return leaves;
            }

            if (Array.isArray(metaPieces)) {
                metaPieces.forEach(visit);
            } else if (typeof metaPieces === "object") {
                visit(metaPieces);
            }

            return leaves;
        },

        clearFilterSelections($builder) {
            $builder.find(".caf-module-filter .caf-terms-list-item").removeClass("caf-selected active");
            $builder.find(".caf-module-filter .caf-taxo-input").prop("checked", false);
            $builder.find(".caf-module-filter.caf-module-type-dropdown_filter").each(function () {
                CAFBuilder.resetDropdownModuleToAll($(this));
            });
            $builder.find(".caf-module-filter .caf-search-input-field").val("");
            $builder.find(".caf-module-filter .clear-icon.on-type").hide();
            $builder.data("cafSmartMatchedTermsCount", 0);
        },

        selectTaxTerm($builder, taxonomy, termId) {
            const id = String(termId);
            if (!taxonomy || !id || id === "0" || id === "all") {
                return;
            }

            const $item = this.resolveTermItem($builder, taxonomy, id);
            if (!$item.length) {
                return;
            }

            const $list = $item.closest(".caf-terms-list");
            const multipleTerm = String($list.attr("multiple-term") || "false") === "true";
            const $dropdownChild = $item.closest(".caf-dropdown-child");

            if ($dropdownChild.length) {
                if (!multipleTerm) {
                    $dropdownChild.find(".caf-terms-list-item").removeClass("active caf-selected");
                }
                $item.addClass("active");
                $item.closest(".caf-module-filter").find(".caf-selected-term-main").removeClass("caf-all-selected");
                CAFQueryBuilder.updateDropdownSelectedLabel($list, $dropdownChild);
                return;
            }

            if (!multipleTerm) {
                $list.find(".caf-terms-list-item").removeClass("caf-selected active");
                $list.find(".caf-taxo-input").prop("checked", false);
            }
            $item.addClass("caf-selected active");
            $item.find(".caf-taxo-input").prop("checked", true);
        },

        resolveTermItem($builder, taxonomy, token) {
            const t = String(token || "").trim();
            if (!taxonomy || !t) {
                return $();
            }

            let $item = $builder
                .find(`.caf-terms-list-item[taxonomy="${taxonomy}"][term-id="${t}"], .caf-terms-list-item[taxonomy="${taxonomy}"][term-slug="${t}"]`)
                .first();

            if (!$item.length) {
                $item = $builder
                    .find(`.caf-terms-list-item[data-key="${taxonomy}"][term-id="${t}"], .caf-terms-list-item[data-key="${taxonomy}"][term-slug="${t}"]`)
                    .first();
            }

            if (!$item.length) {
                $builder.find(`.caf-terms-list-item[taxonomy="${taxonomy}"], .caf-terms-list-item[data-key="${taxonomy}"]`).each(function () {
                    const $candidate = $(this);
                    const inputVal = String($candidate.find(".caf-taxo-input").val() || "");
                    if (inputVal === t) {
                        $item = $candidate;
                        return false;
                    }
                });
            }

            return $item;
        },

        selectMetaValue($builder, key, value) {
            const metaKey = String(key || "");
            const metaValue = String(value == null ? "" : value);
            if (!metaKey || !metaValue) {
                return;
            }

            let $item = $builder.find(
                `.caf-terms-list-item[data-key="${metaKey}"][term-id="${metaValue}"], ` +
                `.caf-terms-list-item[data-key="${metaKey}"][term-value="${metaValue}"]`
            ).first();

            if (!$item.length) {
                return;
            }

            const $list = $item.closest(".caf-terms-list");
            const multipleTerm = String($list.attr("multiple-term") || "false") === "true";
            const $dropdownChild = $item.closest(".caf-dropdown-child");

            if ($dropdownChild.length) {
                if (!multipleTerm) {
                    $dropdownChild.find(".caf-terms-list-item").removeClass("active caf-selected");
                }
                $item.addClass("active");
                $item.closest(".caf-module-filter").find(".caf-selected-term-main").removeClass("caf-all-selected");
                CAFQueryBuilder.updateDropdownSelectedLabel($list, $dropdownChild);
                return;
            }

            if (!multipleTerm) {
                $list.find(".caf-terms-list-item").removeClass("caf-selected active");
                $list.find(".caf-taxo-input").prop("checked", false);
            }
            $item.addClass("caf-selected active");
            $item.find(".caf-taxo-input").prop("checked", true);
        },

        applyRangeMeta($builder, clause) {
            if (!clause || !clause.key) {
                return;
            }

            const $slider = $builder.find(`.caf-range-slider-ui[data-meta-key="${clause.key}"]`).first();
            if (!$slider.length) {
                return;
            }

            if (clause.compare === "BETWEEN" && Array.isArray(clause.value) && clause.value.length >= 2) {
                $slider.attr("data-current-min", String(clause.value[0]));
                $slider.attr("data-current-max", String(clause.value[1]));
            } else if (clause.compare === "<=" && clause.value != null) {
                $slider.attr("data-current-max", String(clause.value));
            }
        },

        applySearchState($builder, state) {
            const keyword = String(state.s || state.caf_search_keyword || "");
            const $input = $builder.find(".caf-module-filter.caf-module-type-search .caf-search-input-field").first();
            if (!$input.length) {
                return;
            }
            $input.val(keyword);
            if (keyword) {
                $builder.find(".caf-module-filter .clear-icon.on-type").show();
            }
        },

        applySortState($builder, state) {
            const $sorting = $builder.find(".caf-builder-template-preview-sorting-container");
            if (!$sorting.length) {
                return;
            }

            if (state.orderby) {
                $sorting.find(".caf-builder-template-preview-sorting-content-dropdown-order-by").attr("data-value", state.orderby);
            }
            if (state.order) {
                $sorting.find(".caf-builder-template-preview-sorting-content-dropdown-order-type").attr("data-value", state.order);
            }
        },

        collectUrlMetaKeys(state) {
            const keys = new Set();
            this.flattenMetaQueryLeaves((state && state.meta_query) || []).forEach((clause) => {
                if (clause && clause.key) {
                    keys.add(String(clause.key));
                }
            });
            return keys;
        },

        collectUrlTaxonomies(state) {
            const taxonomies = new Set();
            CAFQueryBuilder.flattenTaxQueryLeaves((state && state.tax_query) || []).forEach((leaf) => {
                if (leaf && leaf.taxonomy) {
                    taxonomies.add(String(leaf.taxonomy));
                }
            });
            return taxonomies;
        },

        isPredefinedFilterItemSelected($item) {
            if (!$item || !$item.length) {
                return false;
            }
            if ($item.closest(".caf-dropdown-child").length) {
                return $item.hasClass("active");
            }
            return $item.hasClass("caf-selected") || $item.hasClass("active");
        },

        isPredefinedSelectionBlockedByUrl($item, $list, urlMetaKeys, urlTaxonomies) {
            const multipleTerm = String($list.attr("multiple-term") || "false") === "true";
            if (multipleTerm) {
                return false;
            }

            const dataSource = String($list.attr("data-source") || "");
            const isWooVirtual = String($item.attr("data-woo-virtual") || "") === "1";
            const metaKey = String($item.attr("data-key") || "");
            const taxonomy = String($item.attr("taxonomy") || $item.attr("data-key") || "");

            if (
                dataSource === "custom_field" ||
                dataSource === "woo_rating" ||
                dataSource === "woo_meta" ||
                isWooVirtual
            ) {
                return metaKey && urlMetaKeys.has(metaKey);
            }

            return taxonomy && urlTaxonomies.has(taxonomy);
        },

        applyPredefinedSelections($builder, state) {
            state = state && typeof state === "object" ? state : {};
            const urlMetaKeys = this.collectUrlMetaKeys(state);
            const urlTaxonomies = this.collectUrlTaxonomies(state);

            $builder.find('.caf-module-filter .caf-terms-list-item[predefine="true"]').each(function () {
                const $item = $(this);
                if (CAFUrlState.isPredefinedFilterItemSelected($item)) {
                    return;
                }

                const $list = $item.closest(".caf-terms-list");
                if (!$list.length) {
                    return;
                }

                if (CAFUrlState.isPredefinedSelectionBlockedByUrl($item, $list, urlMetaKeys, urlTaxonomies)) {
                    return;
                }

                const dataSource = String($list.attr("data-source") || "");
                const isWooVirtual = String($item.attr("data-woo-virtual") || "") === "1";
                const metaKey = String($item.attr("data-key") || "");
                const taxonomy = String($item.attr("taxonomy") || $item.attr("data-key") || "");
                const termValue = String(
                    $item.attr("term-id") ||
                        $item.attr("term-value") ||
                        CAFBuilder.getFilterItemInput($item).val() ||
                        ""
                );

                if (
                    dataSource === "custom_field" ||
                    dataSource === "woo_rating" ||
                    dataSource === "woo_meta" ||
                    isWooVirtual
                ) {
                    if (metaKey && termValue) {
                        CAFUrlState.selectMetaValue($builder, metaKey, termValue);
                    }
                    return;
                }

                if (taxonomy && termValue) {
                    CAFUrlState.selectTaxTerm($builder, taxonomy, termValue);
                }
            });
        },

        applyState($builder, state) {
            if (!state || typeof state !== "object") {
                return;
            }

            this.clearFilterSelections($builder);

            CAFQueryBuilder.flattenTaxQueryLeaves(state.tax_query || []).forEach((leaf) => {
                (leaf.terms || []).forEach((termId) => {
                    this.selectTaxTerm($builder, leaf.taxonomy, termId);
                });
            });

            this.flattenMetaQueryLeaves(state.meta_query || []).forEach((clause) => {
                if (clause.compare === "=" || clause.compare === "IN" || clause.compare === ">=") {
                    const values = Array.isArray(clause.value) ? clause.value : [clause.value];
                    values.forEach((value) => {
                        this.selectMetaValue($builder, clause.key, value);
                    });
                    return;
                }
                this.applyRangeMeta($builder, clause);
            });

            this.applySearchState($builder, state);
            this.applySortState($builder, state);
            this.applyPredefinedSelections($builder, state);
        },

        bindPopState() {
            if (CAFUrlState._popBound) {
                return;
            }
            CAFUrlState._popBound = true;

            $(window).on("popstate.cafBuilderFilterUrl", () => {
                $(CAFBuilder.selectors.builder).each(function () {
                    const $builder = $(this);
                    if (!CAFUrlState.isEnabled($builder)) {
                        return;
                    }
                    const state = CAFUrlState.read($builder);
                    CAFUrlState.applyState($builder, state || {});
                    CAFBuilder.syncSelectedTagsUI($builder);
                    CAFBuilder.initRangeSliders($builder.find(".filter-layout-container").length
                        ? $builder.find(".filter-layout-container")
                        : $builder);
                    CAFBuilder.buildQuery($builder, 1, { skipUrlUpdate: true });
                });
            });
        }
    };


    const CAFBuilder = {
        selectors: {
            builder: ".caf-builder-container",
            selectedTagsContainer: ".caf-builder-template-preview-selected-tags-container",
            selectedTagsList: ".caf-builder-template-preview-selected-tags-container",
            searchModule: ".caf-module-filter.caf-module-type-search .caf-search-input-field",
            loader: ".caf-builder-template-preview-loader-container",
            postLayoutInner: ".post-layout-container-inner",
            postLayout: ".post-layout-container",
            pagination: ".caf-builder-preview-pagination",
            resultCount: ".caf-builder-template-preview-result-count-container",
        },
        isSmartSearchEnabled($builder) {
            const value = String(
                $builder
                    .find(".caf-module-filter.caf-module-type-search .caf-filter-module-search-output")
                    .first()
                    .attr("data-smart-search-enabled") || "true"
            );
            return value === "true";
        },
        getInteractionState($builder) {
            return $builder.data("cafAnalyticsInteraction") || null;
        },
        setInteractionState($builder, interaction) {
            cafAnalyticsDebug("setInteractionState", {
                builder_index: $builder.attr("caf-index"),
                interaction
            });
            $builder.data("cafAnalyticsInteraction", interaction || null);
        },
        clearInteractionState($builder) {
            cafAnalyticsDebug("clearInteractionState", {
                builder_index: $builder.attr("caf-index")
            });
            $builder.removeData("cafAnalyticsInteraction");
        },
        resetRangeSlidersToInitial($root, mode = "initial") {
            const $modules = cafGetRangeSliderModules($root);

            $modules.each(function () {
                const $module = $(this);
                $module.find(".caf-range-slider-ui").each((_, el) => {
                const $slider = $(el);
                const boundMin = Number($slider.attr("data-min"));
                const boundMax = Number($slider.attr("data-max"));
                const startMin = Number($slider.attr("data-start-min"));
                const startMax = Number($slider.attr("data-start-max"));
                const useFullBounds = mode === "full";
                const safeMin = useFullBounds
                    ? (Number.isFinite(boundMin) ? boundMin : 0)
                    : (Number.isFinite(startMin) ? startMin : (Number.isFinite(boundMin) ? boundMin : 0));
                const safeMax = useFullBounds
                    ? (Number.isFinite(boundMax) ? boundMax : 100)
                    : (Number.isFinite(startMax) ? startMax : (Number.isFinite(boundMax) ? boundMax : 100));
                const rangeType = String($slider.attr("data-range-type") || "double").toLowerCase();

                if (useFullBounds) {
                    $slider.attr("data-user-neutral", "true");
                } else {
                    $slider.removeAttr("data-user-neutral");
                }

                $slider.attr("data-current-min", String(safeMin));
                $slider.attr("data-current-max", String(safeMax));

                if ($slider.data("cafRangeReady") && typeof $slider.slider === "function" && $slider.hasClass("ui-slider")) {
                    if (rangeType === "single") {
                        $slider.slider("value", safeMax);
                    } else {
                        $slider.slider("values", [safeMin, safeMax]);
                    }
                }

                const $output = $slider.closest(".caf-range-slider-output");
                const prefixEnabled = String($slider.attr("data-prefix-enable") || "false") === "true";
                const suffixEnabled = String($slider.attr("data-suffix-enable") || "false") === "true";
                const prefixText = prefixEnabled ? String($slider.attr("data-prefix-text") || "") : "";
                const suffixText = suffixEnabled ? String($slider.attr("data-suffix-text") || "") : "";
                const formattedMax = `${prefixText}${safeMax}${suffixText}`;
                if (rangeType === "single") {
                    $output.find(".caf-range-slider-min").text(formattedMax);
                } else {
                    $output.find(".caf-range-slider-min").text(`${prefixText}${safeMin}${suffixText}`);
                    $output.find(".caf-range-slider-max").text(formattedMax);
                }
                });
            });
        },
        clearSmartSearchSelections($builder) {
            $builder.find(".caf-module-filter .caf-terms-list[data-source='taxonomy'], .caf-module-filter .caf-terms-list[data-source='custom_field']").each((_, listEl) => {
                const $list = $(listEl);
                const filterType = String($list.attr("filter-type") || "");
                if (filterType === "dropdown") {
                    const $module = $list.closest(".caf-module-filter");
                    CAFBuilder.resetDropdownModuleToAll($module);
                    return;
                }
                $list.find(".caf-taxo-input").prop("checked", false);
                $list.find(".caf-terms-list-item").removeClass("active caf-selected");
            });

            this.resetRangeSlidersToInitial($builder, "full");
        },
        resolveSmartTermMatches($builder, keyword) {
            const queryNorm = CAFSmartFilterSearch.normalize(keyword);
            const queryTokens = CAFSmartFilterSearch.tokenize(keyword);
            const queryNumericMeta = CAFSmartFilterSearch.extractNumericMeta(keyword);
            const queryContextTokens = CAFSmartFilterSearch.getContextTokens(keyword);
            const queryContextValuePairs = CAFSmartFilterSearch.extractContextValuePairs(keyword);
            const queryRawLower = String(keyword || "").toLowerCase();
            const queryHasPlusThreshold = /\b\d+(?:\.\d+)?\s*\+/.test(queryRawLower);
            if (!queryNorm) {
                return [];
            }
            const matches = [];
            $builder.find(".caf-module-filter .caf-terms-list[data-source='taxonomy'], .caf-module-filter .caf-terms-list[data-source='custom_field']").each((_, listEl) => {
                const $list = $(listEl);
                const dataSource = String($list.attr("data-source") || "");
                const filterType = String($list.attr("filter-type") || "");
                const isDropdown = filterType === "dropdown";
                const $items = isDropdown
                    ? $list.find(".caf-dropdown-child .caf-terms-list-item")
                    : $list.find(".caf-terms-list-item");
                const listContextTokens = new Set();

                const taxonomyKey = String($list.attr("data-key") || "").trim();
                CAFSmartFilterSearch.getContextTokens(taxonomyKey.replace(/[_-]+/g, " ")).forEach((token) => {
                    listContextTokens.add(token);
                });
                // Use taxonomy identity from term nodes.
                $items.each((__, contextEl) => {
                    const $contextItem = $(contextEl);
                    const itemTaxKey = String($contextItem.attr("data-key") || $contextItem.attr("taxonomy") || "").trim();
                    CAFSmartFilterSearch.getContextTokens(itemTaxKey.replace(/[_-]+/g, " ")).forEach((token) => {
                        listContextTokens.add(token);
                    });
                });
                // Also include visible module label text so renamed labels (e.g. Beds => Bench)
                // can drive numeric intent matching in smart search.
                const listLabelText = $.trim(
                    $list
                        .closest(".caf-module-filter")
                        .find(".caf-filter-label-common .caf-builder-filter-label, .caf-filter-label-common .caf-builder-custom-field-label-inner")
                        .first()
                        .text() || ""
                );
                if (listLabelText) {
                    CAFSmartFilterSearch.getContextTokens(listLabelText).forEach((token) => {
                        listContextTokens.add(token);
                    });
                }

                const requiresNumericContext = queryNumericMeta.numbers.length > 0 && queryContextTokens.length > 0;
                const hasListContextTokens = listContextTokens.size > 0;
                const contextMatched = !requiresNumericContext || queryContextTokens.some((queryToken) => {
                    for (const listToken of listContextTokens) {
                        if (CAFSmartFilterSearch.isTokenMatch(queryToken, listToken)) {
                            return true;
                        }
                    }
                    return false;
                });

                $items.each((__, itemEl) => {
                    const $item = $(itemEl);
                    const termId = String(
                        isDropdown
                            ? ($item.attr("term-id") || "")
                            : ($item.find(".caf-taxo-input").first().val() || "")
                    );
                    if (!termId || termId === "0" || termId === "all") {
                        return;
                    }
                    const rawTermLabel =
                        isDropdown
                            ? $.trim($item.find(".trm-name").first().text() || $item.text())
                            : $.trim($item.find(".caf-term-label").first().text() || $item.text());
                    const termLabel = CAFSmartFilterSearch.normalize(rawTermLabel);
                    if (!termLabel) {
                        return;
                    }
                    let textScore = 0;
                    const termTextTokens = CAFSmartFilterSearch.getContextTokens(rawTermLabel);
                    if (termLabel && termTextTokens.length && queryNorm.includes(termLabel)) {
                        textScore += 110;
                    }
                    if (queryContextTokens.length && termTextTokens.length) {
                        let overlapCount = 0;
                        queryContextTokens.forEach((queryToken) => {
                            const matched = termTextTokens.some((termToken) =>
                                CAFSmartFilterSearch.isTokenMatch(queryToken, termToken)
                            );
                            if (matched) {
                                overlapCount += 1;
                            }
                        });
                        if (overlapCount > 0) {
                            textScore += overlapCount * 45;
                            if (contextMatched || !hasListContextTokens) {
                                textScore += 15;
                            }
                        }
                    }
                    const termNumericMeta = CAFSmartFilterSearch.extractNumericMeta(rawTermLabel);
                    const termRawLower = String(rawTermLabel || "").toLowerCase();
                    const termHasPlusThreshold = /\b\d+(?:\.\d+)?\s*\+/.test(termRawLower);
                    // Bind numeric values to specific contexts (e.g. "3 bed with 2 bath").
                    const constrainedNumbers = queryContextValuePairs
                        .filter((pair) => {
                            for (const listToken of listContextTokens) {
                                if (CAFSmartFilterSearch.isTokenMatch(pair.context, listToken)) {
                                    return true;
                                }
                            }
                            return false;
                        })
                        .map((pair) => pair.value);
                    const uniqueConstrainedNumbers = Array.from(new Set(constrainedNumbers));
                    const numericMetaForList = uniqueConstrainedNumbers.length
                        ? {
                            ...queryNumericMeta,
                            numbers: uniqueConstrainedNumbers,
                            comparator: "eq",
                            ranges: []
                        }
                        : queryNumericMeta;
                    const numericScore = CAFSmartFilterSearch.scoreNumericMatch(numericMetaForList, termNumericMeta);

                    // Numeric query with explicit context (e.g. "300 calories"):
                    // ignore unrelated numeric taxonomies/lists (e.g. time ranges).
                    // If a list has no usable context tokens (pure numeric labels), allow numeric scoring.
                    if (requiresNumericContext && hasListContextTokens && !contextMatched && termNumericMeta.numbers.length > 0) {
                        return;
                    }

                    // For explicit range queries ("from X to Y"), only range terms should match.
                    // Prevent plain token overlap (e.g. "600") from selecting threshold terms like ">600".
                    if (
                        termNumericMeta.numbers.length > 0 &&
                        queryNumericMeta.comparator === "range" &&
                        termNumericMeta.comparator !== "range"
                    ) {
                        textScore = 0;
                    }
                    const score = textScore + numericScore;
                    let adjustedScore = score;

                    // When user clearly asks for threshold intent like "5+",
                    // prioritize terms that explicitly carry "+" and suppress plain numeric terms.
                    if (queryHasPlusThreshold && termNumericMeta.numbers.length > 0) {
                        if (termHasPlusThreshold) {
                            adjustedScore += 180;
                        } else {
                            adjustedScore -= 160;
                        }
                    }

                    if (adjustedScore <= 0) {
                        return;
                    }

                    matches.push({
                        score: adjustedScore,
                        termId,
                        filterType,
                        dataSource,
                        taxonomy: String($item.attr("data-key") || $item.attr("taxonomy") || $list.attr("data-key") || ""),
                        termHasNumeric: termNumericMeta.numbers.length > 0,
                        requiresNumericContext,
                        hasListContextTokens,
                        contextMatched,
                        constrainedNumbers: uniqueConstrainedNumbers,
                        $list,
                        $item
                    });
                });
            });

            // --- Range slider matching ---
            if (queryNumericMeta.numbers.length > 0) {
                cafGetRangeSliderModules($builder).each((_, moduleEl) => {
                    const $module = $(moduleEl);
                    const $slider = $module.find(".caf-range-slider-ui").first();
                    if (!$slider.length) { return; }
                    const metaKey = String($slider.attr("data-meta-key") || "").trim();
                    if (!metaKey || metaKey === "0") { return; }

                    const sliderContextTokens = new Set();
                    CAFSmartFilterSearch.getContextTokens(metaKey.replace(/[_-]+/g, " ")).forEach((t) => sliderContextTokens.add(t));
                    const labelText = $.trim($module.find(".caf-filter-label-common .caf-builder-filter-label, .caf-filter-label-common .caf-builder-custom-field-label-inner").first().text() || "");
                    if (labelText) {
                        CAFSmartFilterSearch.getContextTokens(labelText).forEach((t) => sliderContextTokens.add(t));
                    }

                    if (!sliderContextTokens.size) { return; }

                    const contextMatched = queryContextTokens.some((queryToken) => {
                        for (const sliderToken of sliderContextTokens) {
                            if (CAFSmartFilterSearch.isTokenMatch(queryToken, sliderToken)) {
                                return true;
                            }
                        }
                        return false;
                    });

                    if (!contextMatched) { return; }

                    matches.push({
                        score: 200,
                        isRangeSlider: true,
                        $slider,
                        $module,
                        metaKey,
                        comparator: queryNumericMeta.comparator,
                        exactIntent: Boolean(queryNumericMeta.exactIntent),
                        numbers: queryContextValuePairs
                            .filter((pair) => {
                                for (const sliderToken of sliderContextTokens) {
                                    if (CAFSmartFilterSearch.isTokenMatch(pair.context, sliderToken)) {
                                        return true;
                                    }
                                }
                                return false;
                            })
                            .map((pair) => pair.value),
                        fallbackNumbers: queryNumericMeta.numbers,
                        ranges: queryNumericMeta.ranges
                    });
                });
            }

            return matches;
        },
        applySmartFilterSearch($builder) {
            if (!this.isSmartSearchEnabled($builder)) {
                $builder.data("cafSmartMatchedTermsCount", 0);
                return;
            }
            const keyword = CAFQueryBuilder.getSearchInputValue($builder);
            const queryNumericMeta = CAFSmartFilterSearch.extractNumericMeta(keyword);
            const queryContextTokens = CAFSmartFilterSearch.getContextTokens(keyword);
            const normalizedKeyword = CAFSmartFilterSearch.normalize(keyword);
            const isBareNumericQuery = /^\d+(?:\.\d+)?$/.test(String(normalizedKeyword || "").trim());
            this.clearSmartSearchSelections($builder);
            $builder.data("cafSmartMatchedTermsCount", 0);
            if (!keyword) {
                return;
            }
            // For plain numeric-only queries like "5", prefer post keyword search fallback.
            // Smart auto-selection for such ambiguous input can over-filter results.
            if (
                isBareNumericQuery &&
                queryNumericMeta.numbers.length > 0 &&
                !queryNumericMeta.comparator &&
                (!Array.isArray(queryNumericMeta.ranges) || !queryNumericMeta.ranges.length) &&
                queryContextTokens.length === 0
            ) {
                return;
            }
            const matches = this.resolveSmartTermMatches($builder, keyword);
            if (!matches.length) {
                return;
            }

            const rangeSliderMatches = matches.filter((entry) => entry.isRangeSlider);
            const termMatches = matches.filter((entry) => !entry.isRangeSlider);

            // --- Apply range slider matches ---
            let rangeSliderMatchCount = 0;
            rangeSliderMatches.forEach((entry) => {
                const $slider = entry.$slider;
                const sliderMin = Number($slider.attr("data-min"));
                const sliderMax = Number($slider.attr("data-max"));
                const safeSliderMin = Number.isFinite(sliderMin) ? sliderMin : 0;
                const safeSliderMax = Number.isFinite(sliderMax) ? sliderMax : 100;
                const rangeType = String($slider.attr("data-range-type") || "double").toLowerCase();
                const chosenNumbers = entry.numbers.length ? entry.numbers : (entry.fallbackNumbers || []);
                const queryNum = chosenNumbers.length ? chosenNumbers[0] : null;

                let newMin = safeSliderMin;
                let newMax = safeSliderMax;

                if (entry.exactIntent && queryNum !== null) {
                    const exactValue = Math.max(safeSliderMin, Math.min(queryNum, safeSliderMax));
                    if (rangeType === "single") {
                        newMin = safeSliderMin;
                        newMax = exactValue;
                    } else {
                        newMin = exactValue;
                        newMax = exactValue;
                    }
                } else if (entry.comparator === "lt" && queryNum !== null) {
                    if (queryNum <= safeSliderMin) {
                        return;
                    }
                    newMin = safeSliderMin;
                    newMax = Math.min(queryNum, safeSliderMax);
                } else if (entry.comparator === "gt" && queryNum !== null) {
                    if (queryNum >= safeSliderMax) {
                        return;
                    }
                    newMin = Math.max(queryNum, safeSliderMin);
                    newMax = safeSliderMax;
                } else if (entry.comparator === "range" && entry.ranges.length) {
                    newMin = Math.max(entry.ranges[0].min, safeSliderMin);
                    newMax = Math.min(entry.ranges[0].max, safeSliderMax);
                } else if (entry.comparator === "eq" && queryNum !== null) {
                    const tolerance = (safeSliderMax - safeSliderMin) * 0.1;
                    newMin = Math.max(queryNum - tolerance, safeSliderMin);
                    newMax = Math.min(queryNum + tolerance, safeSliderMax);
                } else if (!entry.comparator && queryNum !== null) {
                    newMin = safeSliderMin;
                    newMax = Math.min(queryNum, safeSliderMax);
                } else {
                    return;
                }

                // Always respect slider configured bounds.
                if (rangeType === "single") {
                    newMin = safeSliderMin;
                    newMax = Math.max(safeSliderMin, Math.min(newMax, safeSliderMax));
                } else {
                    newMin = Math.max(safeSliderMin, Math.min(newMin, safeSliderMax));
                    newMax = Math.max(safeSliderMin, Math.min(newMax, safeSliderMax));
                    if (newMin > newMax) {
                        return;
                    }
                }

                $slider.attr("data-current-min", String(newMin));
                $slider.attr("data-current-max", String(newMax));

                if (typeof $slider.slider === "function" && $slider.hasClass("ui-slider")) {
                    if (rangeType === "single") {
                        $slider.slider("value", newMax);
                    } else {
                        $slider.slider("values", [newMin, newMax]);
                    }
                }

                const $output = $slider.closest(".caf-range-slider-output");
                const prefixEnabled = String($slider.attr("data-prefix-enable") || "false") === "true";
                const suffixEnabled = String($slider.attr("data-suffix-enable") || "false") === "true";
                const prefixText = prefixEnabled ? String($slider.attr("data-prefix-text") || "") : "";
                const suffixText = suffixEnabled ? String($slider.attr("data-suffix-text") || "") : "";
                if (rangeType === "single") {
                    $output.find(".caf-range-slider-min").text(`${prefixText}${newMax}${suffixText}`);
                } else {
                    $output.find(".caf-range-slider-min").text(`${prefixText}${newMin}${suffixText}`);
                    $output.find(".caf-range-slider-max").text(`${prefixText}${newMax}${suffixText}`);
                }
                rangeSliderMatchCount += 1;
            });

            // --- Apply term matches (existing logic) ---
            const hasExplicitNumericContextMatch = termMatches.some((entry) =>
                entry.termHasNumeric &&
                entry.requiresNumericContext &&
                entry.hasListContextTokens &&
                entry.contextMatched
            );
            const hasNumericContextIntent = termMatches.some((entry) => entry.requiresNumericContext && entry.termHasNumeric);
            const effectiveMatchPool = hasExplicitNumericContextMatch
                ? termMatches.filter((entry) => {
                    if (!entry.termHasNumeric) {
                        return true;
                    }
                    if (!(entry.requiresNumericContext)) {
                        return true;
                    }
                    return entry.hasListContextTokens && entry.contextMatched;
                })
                : hasNumericContextIntent
                    ? termMatches.filter((entry) => {
                        if (!entry.termHasNumeric) {
                            return true;
                        }
                        if (!entry.requiresNumericContext) {
                            return true;
                        }
                        return entry.hasListContextTokens && entry.contextMatched;
                    })
                : termMatches;
            const selectedTermIds = new Set();
            $builder.find(".caf-module-filter .caf-terms-list[data-source='taxonomy'], .caf-module-filter .caf-terms-list[data-source='custom_field']").each((_, listEl) => {
                const $list = $(listEl);
                const filterType = String($list.attr("filter-type") || "");
                const multipleTerm = String($list.attr("multiple-term") || "false") === "true";
                const listMatches = effectiveMatchPool.filter((entry) => entry.$list.is($list)).sort((a, b) => b.score - a.score);
                if (!listMatches.length) {
                    return;
                }

                if (filterType === "dropdown") {
                    const $module = $list.closest(".caf-module-filter");
                    const $dropdownChild = $list.find(".caf-dropdown-child");
                    if (!multipleTerm) {
                        const chosen = listMatches[0];
                        $dropdownChild.find(".caf-terms-list-item").removeClass("active");
                        chosen.$item.addClass("active");
                        const chosenTermId = String(chosen.$item.attr("term-id") || "");
                        $module.find(".caf-selected-term-main").first().toggleClass(
                            "caf-all-selected",
                            chosenTermId === "0" || chosenTermId === "all"
                        );
                        CAFQueryBuilder.updateDropdownSelectedLabel($list, $dropdownChild);
                        selectedTermIds.add(chosen.termId);
                        return;
                    }

                    const entriesToSelect = listMatches;
                    $dropdownChild.find(".caf-terms-list-item[term-id='0'], .caf-terms-list-item[term-id='all']").removeClass("active");
                    entriesToSelect.forEach((entry) => {
                        entry.$item.addClass("active");
                        selectedTermIds.add(entry.termId);
                    });
                    const hasNonAllActive = $dropdownChild.find(".caf-terms-list-item.active").filter(function () {
                        const id = String($(this).attr("term-id") || "");
                        return id !== "0" && id !== "all";
                    }).length > 0;
                    $module.find(".caf-selected-term-main").first().toggleClass("caf-all-selected", !hasNonAllActive);
                    CAFQueryBuilder.updateDropdownSelectedLabel($list, $dropdownChild);
                    return;
                }

                if (!multipleTerm) {
                    const chosen = listMatches[0];
                    $list.find(".caf-terms-list-item").removeClass("active caf-selected");
                    $list.find(".caf-taxo-input").prop("checked", false);
                    chosen.$item.addClass("active caf-selected");
                    chosen.$item.find(".caf-taxo-input").first().prop("checked", true);
                    selectedTermIds.add(chosen.termId);
                    return;
                }

                const singleNumericValueIntent = queryNumericMeta.numbers.length === 1 && (!queryNumericMeta.comparator || queryNumericMeta.comparator === "eq");
                const constrainedListNumber = Array.isArray(listMatches[0].constrainedNumbers) && listMatches[0].constrainedNumbers.length === 1;
                const entriesToSelect = (singleNumericValueIntent || constrainedListNumber) ? [listMatches[0]] : listMatches;

                entriesToSelect.forEach((entry) => {
                    entry.$item.addClass("active caf-selected");
                    entry.$item.find(".caf-taxo-input").first().prop("checked", true);
                    selectedTermIds.add(entry.termId);
                });
            });
            $builder.data("cafSmartMatchedTermsCount", selectedTermIds.size + rangeSliderMatchCount);
        },
        buildInteractionFromItem($item, eventType = "click") {
            const itemData = CAFQueryBuilder.extractFilterItemData($item);
            if (!itemData || itemData.dataSource !== "taxonomy") {
                cafAnalyticsDebug("buildInteractionFromItem skipped (non-taxonomy)", { itemData });
                return null;
            }

            const termId = parseInt(itemData.termId || "0", 10);
            if (!itemData.dataKey || !termId || termId <= 0) {
                cafAnalyticsDebug("buildInteractionFromItem skipped (invalid term)", { itemData, termId });
                return null;
            }

            const $builder = $item.closest(".caf-builder-container");
            const keyword = $builder.length ? CAFQueryBuilder.getSearchKeyword($builder) : "";
            const filterData = $builder.length ? CAFQueryBuilder.collectFilterData($builder) : { taxQuery: [] };
            const selectedTermTokens = [];
            const selectedTaxonomies = [];

            CAFQueryBuilder.flattenTaxQueryLeaves(filterData.taxQuery || []).forEach((taxItem) => {
                const taxonomy = String(taxItem.taxonomy || "").trim();
                const termIds = Array.isArray(taxItem.terms) ? taxItem.terms : [];
                if (!taxonomy || !termIds.length) {
                    return;
                }

                selectedTaxonomies.push(taxonomy);
                termIds.forEach((termIdRaw) => {
                    const parsed = parseInt(termIdRaw, 10);
                    if (!parsed || parsed <= 0) {
                        return;
                    }
                    selectedTermTokens.push(`${taxonomy}___${parsed}`);
                });
            });

            const interaction = {
                event_type: eventType,
                taxonomy: itemData.dataKey,
                term_id: termId
            };

            const meta = {
                interaction_type: eventType
            };

            if (keyword) {
                meta.search_keyword = keyword;
            }
            if (selectedTaxonomies.length) {
                meta.tax = selectedTaxonomies.join(",");
            }
            if (selectedTermTokens.length) {
                meta.term = selectedTermTokens.join(",");
                meta.term_token = selectedTermTokens[0];
            }

            interaction.meta = meta;
            cafAnalyticsDebug("buildInteractionFromItem", interaction);
            return interaction;
        },
        buildInteractionFromRangeSlider($slider, eventType = "click") {
            if (!$slider || !$slider.length) {
                return null;
            }
            const $builder = $slider.closest(".caf-builder-container");
            if (!$builder.length) {
                return null;
            }

            let rangeKey = String($slider.attr("data-meta-key") || "").trim();
            if (!rangeKey) {
                const labelText = $.trim(
                    $slider
                        .closest(".caf-module-filter")
                        .find(".caf-filter-label-common .caf-builder-filter-label")
                        .first()
                        .text() || ""
                );
                if (labelText) {
                    rangeKey = labelText;
                }
            }
            const rangeType = String($slider.attr("data-range-type") || "double").toLowerCase();
            const minVal = Number($slider.attr("data-current-min"));
            const maxVal = Number($slider.attr("data-current-max"));
            const keyword = CAFQueryBuilder.getSearchKeyword($builder);
            const filterData = CAFQueryBuilder.collectFilterData($builder);
            const selectedTermTokens = [];
            const selectedTaxonomies = [];

            CAFQueryBuilder.flattenTaxQueryLeaves(filterData.taxQuery || []).forEach((taxItem) => {
                const taxonomy = String(taxItem.taxonomy || "").trim();
                const termIds = Array.isArray(taxItem.terms) ? taxItem.terms : [];
                if (!taxonomy || !termIds.length) {
                    return;
                }
                selectedTaxonomies.push(taxonomy);
                termIds.forEach((termIdRaw) => {
                    const parsed = parseInt(termIdRaw, 10);
                    if (!parsed || parsed <= 0) {
                        return;
                    }
                    selectedTermTokens.push(`${taxonomy}___${parsed}`);
                });
            });

            const interaction = {
                event_type: eventType,
                meta: {
                    interaction_type: "range_slider",
                    range_key: rangeKey,
                    range_type: rangeType,
                    range_min: Number.isFinite(minVal) ? String(minVal) : "",
                    range_max: Number.isFinite(maxVal) ? String(maxVal) : ""
                }
            };

            if (keyword) {
                interaction.meta.search_keyword = keyword;
            }
            if (selectedTaxonomies.length) {
                interaction.meta.tax = selectedTaxonomies.join(",");
            }
            if (selectedTermTokens.length) {
                interaction.meta.term = selectedTermTokens.join(",");
                interaction.meta.term_token = selectedTermTokens[0];
            }

            cafAnalyticsDebug("buildInteractionFromRangeSlider", interaction);
            return interaction;
        },
        buildInteractionFromSearch($builder, eventType = "search") {
            const keyword = $.trim(
                $builder.find(".caf-module-filter.caf-module-type-search .caf-search-input-field").val() || ""
            );

            if (!keyword) {
                cafAnalyticsDebug("buildInteractionFromSearch skipped (empty keyword)", {});
                return null;
            }

            const filterData = CAFQueryBuilder.collectFilterData($builder);
            const selectedTermTokens = [];
            const selectedTaxonomies = [];
            let primaryTaxonomy = "";
            let primaryTermId = 0;

            CAFQueryBuilder.flattenTaxQueryLeaves(filterData.taxQuery || []).forEach((taxItem) => {
                const taxonomy = String(taxItem.taxonomy || "").trim();
                const termIds = Array.isArray(taxItem.terms) ? taxItem.terms : [];

                if (!taxonomy || !termIds.length) {
                    return;
                }

                selectedTaxonomies.push(taxonomy);

                termIds.forEach((termIdRaw) => {
                    const parsed = parseInt(termIdRaw, 10);
                    if (!parsed || parsed <= 0) {
                        return;
                    }

                    selectedTermTokens.push(`${taxonomy}___${parsed}`);

                    if (!primaryTermId) {
                        primaryTaxonomy = taxonomy;
                        primaryTermId = parsed;
                    }
                });
            });

            const interaction = {
                event_type: eventType,
                meta: {
                    interaction_type: "search",
                    search_keyword: keyword
                }
            };

            if (selectedTaxonomies.length) {
                interaction.meta.tax = selectedTaxonomies.join(",");
            }

            if (selectedTermTokens.length) {
                interaction.meta.term = selectedTermTokens.join(",");
                interaction.meta.term_token = selectedTermTokens[0];
            }

            if (primaryTaxonomy && primaryTermId > 0) {
                interaction.taxonomy = primaryTaxonomy;
                interaction.term_id = primaryTermId;
            }

            cafAnalyticsDebug("buildInteractionFromSearch", interaction);
            return interaction;
        },
        buildInteractionFromPostClick($builder, $link, eventType = "post_click") {
            if (!$builder || !$builder.length || !$link || !$link.length) {
                return null;
            }

            const $postArea = $link.closest(".caf-builder-post-area");
            let postId = 0;

            if ($postArea.length) {
                postId = parseInt($postArea.attr("data-post-id") || "0", 10) || 0;
                if (!postId) {
                    const cls = String($postArea.attr("class") || "");
                    const match = cls.match(/post-id-(\d+)/);
                    if (match && match[1]) {
                        postId = parseInt(match[1], 10) || 0;
                    }
                }
            }

            if (!postId) {
                const href = String($link.attr("href") || "");
                const byQuery = href.match(/[?&]p=(\d+)/);
                if (byQuery && byQuery[1]) {
                    postId = parseInt(byQuery[1], 10) || 0;
                }
            }

            const filterData = CAFQueryBuilder.collectFilterData($builder);
            const selectedTermTokens = [];
            const selectedTaxonomies = [];
            const keyword = CAFQueryBuilder.getSearchKeyword($builder);

            CAFQueryBuilder.flattenTaxQueryLeaves(filterData.taxQuery || []).forEach((taxItem) => {
                const taxonomy = String(taxItem.taxonomy || "").trim();
                const termIds = Array.isArray(taxItem.terms) ? taxItem.terms : [];
                if (!taxonomy || !termIds.length) {
                    return;
                }

                selectedTaxonomies.push(taxonomy);
                termIds.forEach((termIdRaw) => {
                    const parsed = parseInt(termIdRaw, 10);
                    if (!parsed || parsed <= 0) {
                        return;
                    }
                    selectedTermTokens.push(`${taxonomy}___${parsed}`);
                });
            });

            const interaction = {
                event_type: eventType,
                meta: {
                    interaction_type: "post_click",
                    selected_terms_count: selectedTermTokens.length,
                    selected_taxonomies_count: selectedTaxonomies.length,
                    has_search_query: keyword ? "yes" : "no",
                    search_keyword: keyword || "",
                    post_id: postId > 0 ? postId : "",
                    clicked_url: String($link.attr("href") || ""),
                    clicked_text: $.trim($link.text() || "")
                }
            };

            if (selectedTaxonomies.length) {
                interaction.meta.tax = selectedTaxonomies.join(",");
            }
            if (selectedTermTokens.length) {
                interaction.meta.term = selectedTermTokens.join(",");
                interaction.meta.term_token = selectedTermTokens[0];
            }

            cafAnalyticsDebug("buildInteractionFromPostClick", interaction);
            return interaction;
        },
        trackAnalyticsEvent($builder, eventType, interaction = null, options = {}) {
            if (typeof tc_caf_ajax === "undefined") {
                return;
            }

            const analyticsEnabled = String($builder.attr("data-caf-analytics-enabled") || "0").trim();
            if (analyticsEnabled !== "1") {
                return;
            }

            const builderIndexRaw = String($builder.attr("caf-index") || "").trim();
            if (builderIndexRaw === "" || !/^\d+$/.test(builderIndexRaw)) {
                return;
            }

            const payload = {
                action: "tc_caf_track_analytics_event",
                nonce: tc_caf_ajax.nonce,
                filter_id: builderIndexRaw,
                builder_mode: "1",
                event_type: eventType
            };

            if (interaction && interaction.taxonomy && interaction.term_id) {
                payload.taxonomy = interaction.taxonomy;
                payload.term_id = interaction.term_id;
            }
            if (interaction && interaction.meta && typeof interaction.meta === "object") {
                payload.meta = interaction.meta;
            }

            cafAnalyticsDebug("trackAnalyticsEvent payload", payload);

            // Use beacon/keepalive for navigational clicks (e.g. post links).
            if (options && options.useBeacon === true) {
                if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
                    const formData = new FormData();
                    Object.keys(payload).forEach((key) => {
                        const value = payload[key];
                        if (value && typeof value === "object") {
                            Object.keys(value).forEach((metaKey) => {
                                formData.append(`meta[${metaKey}]`, value[metaKey]);
                            });
                        } else {
                            formData.append(key, value);
                        }
                    });
                    navigator.sendBeacon(tc_caf_ajax.ajax_url, formData);
                    return;
                }

                if (typeof fetch === "function") {
                    const bodyParams = new URLSearchParams();
                    Object.keys(payload).forEach((key) => {
                        const value = payload[key];
                        if (value && typeof value === "object") {
                            Object.keys(value).forEach((metaKey) => {
                                bodyParams.append(`meta[${metaKey}]`, value[metaKey]);
                            });
                        } else {
                            bodyParams.append(key, value);
                        }
                    });
                    fetch(tc_caf_ajax.ajax_url, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                        },
                        body: bodyParams.toString(),
                        keepalive: true
                    }).catch(() => { /* no-op */ });
                    return;
                }
            }

            $.ajax({
                url: tc_caf_ajax.ajax_url,
                type: "POST",
                data: payload,
                success: (response) => {
                    cafAnalyticsDebug("trackAnalyticsEvent response", response);
                },
                error: (_, __, errorThrown) => {
                    cafAnalyticsDebug("trackAnalyticsEvent error", errorThrown);
                }
            });
        },

        init() {
            const self = this;

            self.bindEvents();
            self.initRangeSliders($(document));
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

            if (this.isMainQueryListing($builder)) {
                this.resolveMainQueryPostsPerPage($builder);
                this.resolveMainQueryProductsClass($builder);
            }

            if (CAFUrlState.isEnabled($builder)) {
                CAFUrlState.bindPopState();
                const urlState = CAFUrlState.read($builder);
                const urlApplied = String($builder.attr("data-caf-url-applied") || "0") === "1";

                if (urlState && Object.keys(urlState).length) {
                    CAFUrlState.applyState($builder, urlState);
                    this.initRangeSliders($builder.find(".filter-layout-container").length
                        ? $builder.find(".filter-layout-container")
                        : $builder);
                    if (!urlApplied) {
                        this.buildQuery($builder, 1, { skipUrlUpdate: true, skipScroll: true });
                    }
                }
            }

            this.syncSelectedTagsUI($builder);
            this.updateSearchResultUI($builder);
            this.scheduleMasonryForBuilder($builder);
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

        updateSortingDropdownCaret($wrapper, isOpen) {
            $wrapper.find(".caf-dropdown-arrow i").each(function () {
                const $icon = $(this);
                $icon.removeClass("fa-caret-up fa-caret-down");
                $icon.addClass(isOpen ? "fa-caret-up" : "fa-caret-down");
                if (!$icon.hasClass("fas")) {
                    $icon.addClass("fas");
                }
            });
        },

        setSortingDropdownValue($wrapper, value, labelText) {
            if (!$wrapper || !$wrapper.length) {
                return;
            }

            const normalizedValue = String(value || "0");
            const displayText = String(labelText || "");
            const $selectbox = $wrapper.find(".caf-selectbox").first();

            $wrapper.attr("data-value", normalizedValue);
            $wrapper.find(".caf-sorting-placeholder").text(displayText);

            if (normalizedValue === "0") {
                $selectbox.removeClass("caf-item-selected").addClass("caf-placeholder-selected");
            } else {
                $selectbox.removeClass("caf-placeholder-selected").addClass("caf-item-selected");
            }

            $wrapper.find(".caf-dropdown-opt-list-item").removeClass("active");
            if (normalizedValue === "0") {
                $wrapper.find(".caf-dropdown-opt-list-item.order-plc").addClass("active");
                return;
            }

            const compareValue = $wrapper.hasClass("caf-builder-template-preview-sorting-content-dropdown-order-type")
                ? normalizedValue.toUpperCase()
                : normalizedValue.toLowerCase();

            $wrapper.find(".caf-dropdown-opt-list-item").each(function () {
                const $option = $(this);
                if ($option.hasClass("order-plc")) {
                    return;
                }
                const optionValue = String($option.attr("data-value") || $.trim($option.text()) || "");
                const normalizedOptionValue = $wrapper.hasClass("caf-builder-template-preview-sorting-content-dropdown-order-type")
                    ? optionValue.toUpperCase()
                    : optionValue.toLowerCase();
                if (normalizedOptionValue === compareValue) {
                    $option.addClass("active");
                }
            });
        },

        applyGridDefaultSortingDropdown($wrapper, $builder) {
            if (!$wrapper || !$wrapper.length) {
                return;
            }

            const defaults = CAFQueryBuilder.getDefaultSortingData($builder);
            const isOrderType = $wrapper.hasClass("caf-builder-template-preview-sorting-content-dropdown-order-type");
            const value = isOrderType ? defaults.order : defaults.orderby;
            const compareValue = isOrderType ? value.toUpperCase() : value.toLowerCase();
            let labelText = value;

            $wrapper.find(".caf-dropdown-opt-list-item").each(function () {
                const $option = $(this);
                if ($option.hasClass("order-plc")) {
                    return;
                }
                const optionValue = String($option.attr("data-value") || $.trim($option.text()) || "");
                const normalizedOptionValue = isOrderType
                    ? optionValue.toUpperCase()
                    : optionValue.toLowerCase();
                if (normalizedOptionValue === compareValue) {
                    labelText = $.trim($option.text());
                    return false;
                }
            });

            this.setSortingDropdownValue($wrapper, value, labelText);
        },

        resetSortingDropdowns($builder) {
            const $sorting = $builder.find(".caf-builder-template-preview-sorting-container");
            if (!$sorting.length) {
                return;
            }

            $sorting.find(".caf-custom-dropdown-wrapper").each((_, wrapperEl) => {
                this.applyGridDefaultSortingDropdown($(wrapperEl), $builder);
            });
        },

        captureSortingUiState($builder) {
            const $sorting = $builder.find(".caf-builder-template-preview-sorting-container");
            if (!$sorting.length) {
                return null;
            }

            const state = {};

            $sorting.find(".caf-custom-dropdown-wrapper").each(function () {
                const $wrapper = $(this);
                const key = $wrapper.hasClass("caf-builder-template-preview-sorting-content-dropdown-order-type")
                    ? "order"
                    : "orderby";

                state[key] = {
                    value: String($wrapper.attr("data-value") || "0"),
                    label: $.trim($wrapper.find(".caf-sorting-placeholder").text())
                };
            });

            return state;
        },

        restoreSortingUiState($builder, state) {
            if (!state) {
                return;
            }

            const $sorting = $builder.find(".caf-builder-template-preview-sorting-container");
            if (!$sorting.length) {
                return;
            }

            $sorting.find(".caf-custom-dropdown-wrapper").each((_, wrapperEl) => {
                const $wrapper = $(wrapperEl);
                const key = $wrapper.hasClass("caf-builder-template-preview-sorting-content-dropdown-order-type")
                    ? "order"
                    : "orderby";
                const saved = state[key];

                if (!saved) {
                    return;
                }

                this.setSortingDropdownValue($wrapper, saved.value, saved.label);
            });
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

        removeDropdownSelectionByValue($module, value) {
            const $dropdownChild = $module.find(".caf-dropdown-child").first();
            if (!$dropdownChild.length) {
                return;
            }

            const $termsList = $dropdownChild.closest(".caf-terms-list");
            const multipleTerm = String($termsList.attr("multiple-term") || "false") === "true";
            const $dropdownItems = $dropdownChild.find(".caf-terms-list-item");

            if (!multipleTerm) {
                this.resetDropdownModuleToAll($module);
                return;
            }

            $dropdownItems.each(function () {
                const $item = $(this);
                if (String($item.attr("term-id") || "") === value) {
                    $item.removeClass("active caf-selected");
                }
            });

            if (!$dropdownItems.filter(".active").length) {
                this.resetDropdownModuleToAll($module);
                return;
            }

            $module.find(".caf-selected-term-main").first().removeClass("caf-all-selected");
            CAFQueryBuilder.updateDropdownSelectedLabel($termsList, $dropdownChild);
        },
        debounce(fn, delay = 400) {
            clearTimeout(this._searchTimer);
            this._searchTimer = setTimeout(fn, delay);
        },
        executeSearch($builder, options = {}) {
            if (!$builder || !$builder.length) {
                return;
            }
            const shouldTrack = options.track !== false;
            const searchSettings = CAFQueryBuilder.getSearchModuleSettings($builder);
            const rawKeyword = CAFQueryBuilder.getSearchInputValue($builder);
            const belowCharLimit = CAFQueryBuilder.isBlockedByMinCharLimit($builder, rawKeyword);
            if (belowCharLimit) {
                const hadSmartMatches = parseInt($builder.data("cafSmartMatchedTermsCount") || 0, 10) > 0;
                const hadActiveKeyword = String($builder.data("cafActiveSearchKeyword") || "") !== "";
                if (hadSmartMatches) {
                this.clearSmartSearchSelections($builder);
                $builder.data("cafSmartMatchedTermsCount", 0);
                }
                if (searchSettings.searchTrigger === "typing" && (hadSmartMatches || hadActiveKeyword)) {
                    CAFQueryBuilder.commitSearchKeywordToDom($builder);
                this.updateSearchResultUI($builder);
                    this.syncSelectedTagsUI($builder);
                    $builder.data("cafActiveSearchKeyword", "");
                    this.buildQuery($builder, 1, { skipLoader: true });
                }
                return;
            }
            if (!rawKeyword) {
                this.clearSmartSearchSelections($builder);
                $builder.data("cafSmartMatchedTermsCount", 0);
                $builder.data("cafActiveSearchKeyword", "");
                CAFQueryBuilder.commitSearchKeywordToDom($builder);
                this.updateSearchResultUI($builder);
                this.syncSelectedTagsUI($builder);
                this.buildQuery($builder);
                return;
            }
            if (this.isSmartSearchEnabled($builder)) {
                this.applySmartFilterSearch($builder);
            } else {
                $builder.data("cafSmartMatchedTermsCount", 0);
            }
            CAFQueryBuilder.commitSearchKeywordToDom($builder);
            $builder.data("cafActiveSearchKeyword", rawKeyword);
            this.updateSearchResultUI($builder);
            if (shouldTrack) {
                this.setInteractionState($builder, this.buildInteractionFromSearch($builder, "search"));
            }
            this.buildQuery($builder);
        },
        bindEvents() {
            const self = this;

            // Toggle label header
            $(document).on("click", ".caf-module-filter.toggled .label-header", function () {
                self.handleLabelToggle($(this));
            });

            // Search input clear button
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
                        $builder.data("cafSmartMatchedTermsCount", 0);
                        $builder.data("cafActiveSearchKeyword", "");
                        self.clearSmartSearchSelections($builder);
                        self.updateSearchResultUI($builder);
                        self.syncSelectedTagsUI($builder);
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
                // Clear should only reset search keyword, not other active filters.
                CAFQueryBuilder.clearCommittedSearchKeywordOnDom($builder);
                $builder.data("cafSmartMatchedTermsCount", 0);
                $builder.data("cafActiveSearchKeyword", "");
                CAFBuilder.updateSearchResultUI($builder);
                CAFBuilder.syncSelectedTagsUI($builder);
                CAFBuilder.buildQuery($builder);
            });

            $(document).on("click", ".caf-module-type-search .voice-icon", function () {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SpeechRecognition) {
                    return;
                }
                const $module = $(this).closest(".caf-module-type-search");
                const $input = $module.find(".caf-search-input-field");
                const $searchOutput = $module.find(".caf-filter-module-search-output").first();
                const $builder = $module.closest(self.selectors.builder);
                const originalPlaceholder = String($input.attr("placeholder") || "");
                const voicePlaceholder = String($searchOutput.attr("data-voice-placeholder") || "").trim();

                $input.val("").focus();
                $module.find(".clear-icon.on-type").hide();
                CAFQueryBuilder.clearCommittedSearchKeywordOnDom($builder);
                $builder.data("cafSmartMatchedTermsCount", 0);
                $builder.data("cafActiveSearchKeyword", "");
                CAFBuilder.updateSearchResultUI($builder);
                CAFBuilder.syncSelectedTagsUI($builder);
                CAFBuilder.buildQuery($builder);

                const recognition = new SpeechRecognition();
                recognition.lang = "en-US";
                recognition.interimResults = false;
                recognition.maxAlternatives = 1;
                recognition.onstart = function () {
                    if (voicePlaceholder) {
                        $input.attr("placeholder", voicePlaceholder);
                    }
                };
                recognition.onresult = function (event) {
                    const transcript = event.results && event.results[0] && event.results[0][0]
                        ? String(event.results[0][0].transcript || "")
                        : "";
                    $input.val($.trim(transcript));
                    self.handleSearchInput($input);
                    self.executeSearch($builder);
                };
                recognition.onerror = function () {
                    $input.attr("placeholder", originalPlaceholder);
                };
                recognition.onend = function () {
                    $input.attr("placeholder", originalPlaceholder);
                };
                try {
                    recognition.start();
                } catch (_err) {
                    $input.attr("placeholder", originalPlaceholder);
                }
            });
            // Dropdown open/close
            $(document).on("click", ".caf-module-filter .caf-selected-term-main", function (e) {
                e.stopPropagation();
                self.toggleDropdown($(this));
            });
            $(document).on("click", ".caf-builder-template-preview-sorting-container .caf-selectbox", function (e) {
                e.stopPropagation();

                const $wrapper = $(this).closest(".caf-custom-dropdown-wrapper");

                $(".caf-custom-dropdown-wrapper").not($wrapper).each(function () {
                    $(this).removeClass("active");
                    self.updateSortingDropdownCaret($(this), false);
                });

                $wrapper.toggleClass("active");
                self.updateSortingDropdownCaret($wrapper, $wrapper.hasClass("active"));
            });
            $(document).on("click", function (e) {
                $(".caf-custom-dropdown-wrapper.active").each(function () {
                    $(this).removeClass("active");
                    self.updateSortingDropdownCaret($(this), false);
                });
                if (!$(e.target).closest(".caf-module-filter .caf-selected-term-main, .caf-module-filter .caf-dropdown-child").length) {
                    self.closeOtherFilterDropdowns(null);
                }
            });
            $(document).on("click", ".caf-builder-template-preview-sorting-container .caf-dropdown-opt-list-item", function (e) {
                e.stopPropagation();

                const $item = $(this);
                const $wrapper = $item.closest(".caf-custom-dropdown-wrapper");
                const $builder = $item.closest(".caf-builder-container");

                if ($item.hasClass("order-plc")) {
                    self.setSortingDropdownValue($wrapper, "0", $.trim($item.text()));
                    $wrapper.removeClass("active");
                    self.updateSortingDropdownCaret($wrapper, false);
                    CAFBuilder.buildQuery($builder);
                    return;
                }

                const text = $.trim($item.text());
                let value = $item.attr("data-value") || text;

                // Normalize values
                if ($wrapper.hasClass("caf-builder-template-preview-sorting-content-dropdown-order-type")) {
                    value = value.toUpperCase(); // ASC / DESC
                }

                if ($wrapper.hasClass("caf-builder-template-preview-sorting-content-dropdown-order-by")) {
                    value = value.toLowerCase(); // date, title, etc
                }

                // Update UI
                self.setSortingDropdownValue($wrapper, value, text);

                $wrapper.removeClass("active");
                self.updateSortingDropdownCaret($wrapper, false);

                // Trigger query
                CAFBuilder.buildQuery($builder);
            });
            // Dropdown select
            $(document).on("click", ".caf-module-filter .caf-dropdown-child .caf-terms-list-item", function () {
                self.handleDropdownSelection($(this));
            });

            // Checkbox / button / generic terms click
            $(document).on("click", ".caf-module-filter .caf-terms-list-item", function (e) {
                const $item = $(this);

                // dropdown items have their own handler
                if ($item.closest(".caf-dropdown-child").length) {
                    return;
                }

                e.preventDefault();
                self.handleSelectableItem($item);
            });

            $(document).on("cafRangeSliderChanged", ".caf-range-slider-ui", function () {
                const $builder = $(this).closest(self.selectors.builder);
                if (!$builder.length) {
                    return;
                }
                self.setInteractionState($builder, self.buildInteractionFromRangeSlider($(this), "click"));
                self.buildQuery($builder);
            });

            // Reset
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

            // Remove selected tag
            $(document).on("click", ".caf-builder-template-preview-selected-tag-close-btn", function (e) {
                e.preventDefault();
                e.stopPropagation();
                self.handleSelectedTagRemove($(this).closest(".caf-builder-template-preview-selected-tag-single-item"));
            });

            // Sorting
            $(document).on(
                "change",
                ".caf-builder-template-preview-sorting-content-dropdown-order-by, .caf-builder-template-preview-sorting-content-dropdown-order-type",
                function () {
                    self.buildQuery($(this).closest(self.selectors.builder));
                }
            );

            // Pagination
            $(document).on("click", ".caf-builder-preview-page-no", function () {
                self.buildQuery($(this).closest(self.selectors.builder), parseInt($(this).attr("page"), 10) || 1);
            });

            $(document).on("click", ".caf-builder-preview-prev-btn, .caf-builder-preview-next-btn", function () {
                const $builder = $(this).closest(self.selectors.builder);
                const $pagination = $builder.find(".caf-builder-preview-pagination");
                const $paginationContainer = $builder.find(".caf-builder-preview-pagination-container");
                const $activePage = $pagination.find(".caf-builder-preview-page-no.active");
                const $pagesContainer = $pagination.find(".caf-builder-preview-pages");
                const currentFromContainer = parseInt($paginationContainer.attr("data-current-page"), 10);
                const currentFromAttr = parseInt($pagesContainer.attr("data-current-page"), 10);
                let page = $activePage.length
                    ? parseInt($activePage.attr("page"), 10)
                    : (Number.isFinite(currentFromContainer)
                        ? currentFromContainer
                        : (Number.isFinite(currentFromAttr) ? currentFromAttr : 1));

                if ($(this).attr("type") === "prev") {
                    page -= 1;
                } else if ($(this).attr("type") === "next") {
                    page += 1;
                }

                self.buildQuery($builder, page);
            });

            $(document).on(
                "click",
                ".caf-builder-preview-pagination .load-more-btn, .caf-builder-preview-pagination-container .caf-builder-preview-load-more-btn",
                function () {
                const $builder = $(this).closest(self.selectors.builder);
                const currentPage = parseInt($(this).attr("page"), 10) || 1;
                self.buildQuery($builder, currentPage + 1);
            });

            // Post click analytics (store filter/search context on post interactions)
            $(document).on("click", ".post-layout-container a[href]", function () {
                const $link = $(this);
                const $builder = $link.closest(self.selectors.builder);
                if (!$builder.length) {
                    return;
                }
                if ($link.closest(".caf-builder-preview-pagination").length) {
                    return;
                }
                const interaction = self.buildInteractionFromPostClick($builder, $link, "post_click");
                if (!interaction) {
                    return;
                }
                self.trackAnalyticsEvent($builder, "post_click", interaction, { useBeacon: true });
            });

            $(document).on(
                "click.cafMainQueryPagination",
                [
                    "nav.woocommerce-pagination a",
                    ".woocommerce-pagination a",
                    ".woocommerce nav.woocommerce-pagination a",
                    ".ast-woocommerce-pagination a",
                    ".ast-pagination a.page-numbers",
                    "nav.elementor-pagination a",
                    ".elementor-pagination a",
                    ".elementor-widget-loop-grid .elementor-pagination a",
                    ".wp-block-query-pagination a",
                    ".wp-block-query-pagination-numbers a",
                    ".wp-block-query-pagination-next",
                    ".wp-block-query-pagination-previous",
                    ".wc-block-pagination a",
                    ".wc-block-components-pagination a",
                    "ul.page-numbers a.page-numbers",
                    "a.page-numbers"
                ].join(", "),
                function (e) {
                    self.handleMainQueryPaginationClick(e, $(this));
                }
            );

            $(document).on(
                "change.cafMainQueryOrdering",
                "form.woocommerce-ordering select.orderby, form.woocommerce-ordering select[name='orderby']",
                function (e) {
                    self.handleMainQueryOrderingChange(e, $(this));
                }
            );
            $(document).on(
                "submit.cafMainQueryOrdering",
                "form.woocommerce-ordering",
                function (e) {
                    self.handleMainQueryOrderingSubmit(e, $(this));
                }
            );

            $(window).on("resize.cafMasonry", () => {
                self.debounce(() => {
                    $(self.selectors.builder).each(function () {
                        self.scheduleMasonryForBuilder($(this));
                    });
                }, 200);
            });
        },
        initRangeSliders($scope) {
            const $root = $scope && $scope.length ? $scope : $(document);

            const formatRangeText = ($slider, value) => {
                const prefixEnabled = String($slider.attr("data-prefix-enable") || "false") === "true";
                const suffixEnabled = String($slider.attr("data-suffix-enable") || "false") === "true";
                const prefixText = prefixEnabled ? String($slider.attr("data-prefix-text") || "") : "";
                const suffixText = suffixEnabled ? String($slider.attr("data-suffix-text") || "") : "";
                return `${prefixText}${value}${suffixText}`;
            };

            $root.find(".caf-range-slider-ui").each(function () {
                const $slider = $(this);
                if ($slider.data("cafRangeReady")) {
                    return;
                }
                if (typeof $slider.slider !== "function") {
                    return;
                }

                const min = Number($slider.attr("data-min"));
                const max = Number($slider.attr("data-max"));
                const step = Number($slider.attr("data-step"));
                const startMin = Number($slider.attr("data-start-min"));
                const startMax = Number($slider.attr("data-start-max"));
                const rangeType = String($slider.attr("data-range-type") || "double").toLowerCase();
                const placement = String($slider.attr("data-placement") || "horizontal").toLowerCase();

                const safeMin = Number.isFinite(min) ? min : 0;
                const safeMax = Number.isFinite(max) ? max : 100;
                const safeStep = Number.isFinite(step) && step > 0 ? step : 1;
                const isUserNeutral = String($slider.attr("data-user-neutral") || "false") === "true";
                let v0 = isUserNeutral
                    ? safeMin
                    : (Number.isFinite(startMin) ? startMin : safeMin);
                let v1 = isUserNeutral
                    ? safeMax
                    : (Number.isFinite(startMax) ? startMax : safeMax);
                if (rangeType === "single") {
                    v1 = Math.max(safeMin, Math.min(v1, safeMax));
                } else {
                    v0 = Math.max(safeMin, Math.min(v0, safeMax));
                    v1 = Math.max(safeMin, Math.min(v1, safeMax));
                    if (v0 > v1) {
                        v1 = v0;
                    }
                }
                const values = [v0, v1];

                if ($slider.hasClass("ui-slider")) {
                    $slider.slider("destroy");
                }

                const $output = $slider.closest(".caf-range-slider-output");
                const $minText = $output.find(".caf-range-slider-min");
                const $maxText = $output.find(".caf-range-slider-max");
                $slider.attr("data-current-min", String(values[0]));
                $slider.attr("data-current-max", String(values[1]));

                $slider.slider({
                    range: rangeType === "single" ? "min" : true,
                    min: safeMin,
                    max: safeMax,
                    step: safeStep,
                    orientation: placement === "vertical" ? "vertical" : "horizontal",
                    ...(rangeType === "single" ? { value: values[1] } : { values }),
                    create() {
                        cafTagRangeSliderHandleClasses($slider, rangeType);
                    },
                    slide: function (_event, ui) {
                        $slider.attr("data-user-neutral", "false");
                        if (rangeType === "single") {
                            $minText.text(formatRangeText($slider, ui.value));
                            $slider.attr("data-current-min", String(safeMin));
                            $slider.attr("data-current-max", String(ui.value));
                            return;
                        }
                        $minText.text(formatRangeText($slider, ui.values[0]));
                        $maxText.text(formatRangeText($slider, ui.values[1]));
                        $slider.attr("data-current-min", String(ui.values[0]));
                        $slider.attr("data-current-max", String(ui.values[1]));
                    },
                    stop: function () {
                        $slider.trigger("cafRangeSliderChanged");
                    }
                });

                if (rangeType === "single") {
                    $minText.text(formatRangeText($slider, values[1]));
                } else {
                    $minText.text(formatRangeText($slider, values[0]));
                    $maxText.text(formatRangeText($slider, values[1]));
                }

                $slider.data("cafRangeReady", true);
            });
        },

        // renderInitialSelectedTags($builder) {
        //     const self = this;

        //     // Dropdown selected items
        //     $builder.find(".caf-module-filter.caf-module-type-dropdown_filter .caf-dropdown-child .caf-terms-list-item.active").each(function () {
        //         self.addSelectedTagFromItem($(this), $builder, "dropdown");
        //     });

        //     // Checkbox selected items
        //     $builder.find(".caf-module-filter.checkbox_filter .caf-terms-list-item.active").each(function () {
        //         self.addSelectedTagFromItem($(this), $builder, "input");
        //     });
        // },

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
            this.setInteractionState($builder, this.buildInteractionFromItem($item, "click"));
            this.updateSearchResultUI($builder);
            this.syncSelectedTagsUI($builder);
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
            //this.syncSelectedTagsForList($builder, $list);
            this.setInteractionState($builder, this.buildInteractionFromItem($item, "click"));
            this.updateSearchResultUI($builder);
            this.buildQuery($builder);
        },

        handleReset($builder) {
            const $filterLayout = $builder.find(".filter-layout-container");
            // Reset checkbox/button inputs
            $filterLayout.find(".caf-terms-list .caf-taxo-input").each(function () {
                $(this).prop("checked", false).closest("li").removeClass("active caf-selected");
            });
            // Reset search
            $filterLayout.find(".caf-filter-module-search-output").each(function () {
                $(this).removeAttr("data-committed-search-keyword");
            });
            $filterLayout.find(".caf-module-filter .caf-filter-module-search-output .caf-search-input-field").val("");
            $filterLayout.find(".caf-module-filter .caf-filter-module-search-output .clear-icon.on-type").hide();
            $builder.data("cafSmartMatchedTermsCount", 0);
            $builder.data("cafActiveSearchKeyword", "");
            // Reset dropdown
            $filterLayout.find(".caf-module-filter.caf-module-type-dropdown_filter").each(function () {
                CAFBuilder.resetDropdownModuleToAll($(this));
            });
            this.clearInteractionState($builder);
            this.resetRangeSlidersToInitial($filterLayout, "full");
            this.resetSortingDropdowns($builder);
            this.updateSearchResultUI($builder);
            CAFUrlState.applyPredefinedSelections($builder, {});
            this.syncSelectedTagsUI($builder);
            this.buildQuery($builder);
        },
        handleSelectedTagRemove($tag) {
            let $builder = $tag.closest(this.selectors.builder);
            if (!$builder.length) {
                $builder = $tag.closest(".post-layout-container, .caf-builder-preview-template-container").closest(this.selectors.builder);
            }
            if (!$builder.length) {
                return;
            }
            const value = String($tag.attr("data-value") || "");
            const rowId = String($tag.attr("data-row-id") ?? "");
            const columnId = String($tag.attr("data-column-id") ?? "");
            const moduleId = String($tag.attr("data-module-id") ?? "");
            const dataSource = String($tag.attr("data-source") || "");

            if (rowId === "" || columnId === "" || moduleId === "") {
                return;
            }

            let $module = $builder.find(".filter-layout-container").find(
                `.caf-module-filter[data-row-id="${rowId}"][data-column-id="${columnId}"][data-module-id="${moduleId}"]`
            ).first();

            if (!$module.length) {
                $module = $builder.find(
                    `.caf-module-filter[data-row-id="${rowId}"][data-column-id="${columnId}"][data-module-id="${moduleId}"]`
                ).first();
            }

            if (!$module.length) {
                return;
            }

            if (dataSource === "search") {
                $module.find(".caf-search-input-field").val("");
                $module.find(".clear-icon.on-type").hide();
                CAFQueryBuilder.clearCommittedSearchKeywordOnDom($builder);
                $builder.data("cafSmartMatchedTermsCount", 0);
                $builder.data("cafActiveSearchKeyword", "");
                this.updateSearchResultUI($builder);
                this.syncSelectedTagsUI($builder);
                this.buildQuery($builder);
                return;
            }

            if (dataSource === "range_slider" || String($tag.attr("data-filter-type") || "") === "range_slider") {
                this.resetRangeSlidersToInitial($module, "full");
                this.clearInteractionState($builder);
                this.updateSearchResultUI($builder);
                this.syncSelectedTagsUI($builder);
                this.buildQuery($builder);
                return;
            }

            if ($module.find(".caf-dropdown-child").length) {
                this.removeDropdownSelectionByValue($module, value);
            } else {
            $module.find(".caf-terms-list-item .caf-taxo-input").each(function () {
                const $input = $(this);
                const inputValue = String($input.val() || "");

                if (inputValue === value) {
                    $input.prop("checked", false);
                    $input.closest(".caf-terms-list-item").removeClass("active caf-selected");
                }
            });
            }

            this.updateSearchResultUI($builder);
            this.syncSelectedTagsUI($builder);
            this.buildQuery($builder);
        },

        updateSearchResultUI($builder) {
            const keyword = $.trim($builder.find(".caf-module-filter .caf-filter-module-search-output .caf-search-input-field").val() || "");
            const $searchResult = $builder.find(".caf-builder-template-preview-search-result-container");
            const selectedTagEnabled = String($builder.attr("selected-tag") || "false") === "true";

            if (selectedTagEnabled) {
                $searchResult.find(".search-keyword").text("");
                $searchResult.hide();
                return;
            }

            if (keyword) {
                $searchResult.find(".search-keyword").text(keyword);
                $searchResult.show();
            } else {
                $searchResult.find(".search-keyword").text("");
                $searchResult.hide();
            }
        },

        syncSelectedTagsUI($builder) {
            if (String($builder.attr("selected-tag") || "false") !== "true") {
                return;
            }

            const $container = $builder.find(this.selectors.selectedTagsContainer).first();
            if (!$container.length) {
                return;
            }

            const closeStatus = String($container.attr("data-close-button") || "false");
            const tags = this.collectSelectedTagsData($builder);

            $container.empty();

            tags.forEach((tag) => {
                const closeIcon = closeStatus === "true"
                    ? '<span class="caf-builder-template-preview-selected-tag-close-btn" role="button" tabindex="0" aria-label="Remove selected filter"><i class="fa fa-times" aria-hidden="true"></i></span>'
                    : "";
                const html = `
                    <li class="caf-builder-template-preview-selected-tag-single-item"
                        data-value="${tag.value}"
                        data-row-id="${tag.row_id}"
                        data-column-id="${tag.column_id}"
                        data-module-id="${tag.module_id}"
                        data-unique-id="${tag.unique_id}"
                        data-source="${tag.data_source}"
                        data-filter-type="${tag.filter_type}">
                        ${closeIcon}<span class="caf-builder-template-preview-selected-tag-term-name">${tag.label}</span>
                    </li>
                `;
                $container.append(html);
            });
        },

        // syncSelectedTagsForList($builder, $list) {
        //     this.removeTagsForModule($builder, $list);
        //     //console.log($list);
        //     $list.find(".caf-terms-list-item.caf-selected, .caf-terms-list-item.active").each((_, el) => {
        //         this.addSelectedTagFromItem($(el), $builder, "input");
        //     });
        // },

        // removeTagsForModule($builder, $list) {
        //     const rowId = $list.attr("row-id");
        //     const columnId = $list.attr("column-id");
        //     const moduleId = $list.attr("module-id");

        //     $builder.find(`${this.selectors.selectedTagsList} li`).filter(function () {
        //         return (
        //             $(this).attr("row-id") === rowId &&
        //             $(this).attr("column-id") === columnId &&
        //             $(this).attr("module-id") === moduleId
        //         );
        //     }).remove();
        // },

        // addSelectedTagFromItem($item, $builder, mode = "input") {
        //     if ($builder.attr("selected-tag") !== "true") {
        //         return;
        //     }
        //     const tagData = this.getTagData($item, mode);
        //     //console.log(tagData);
        //     if (!tagData || !tagData.value || tagData.value === "0" || tagData.value === "all") {
        //         return;
        //     }
        //     const $list = $builder.find(this.selectors.selectedTagsList);
        //     //console.log($list);
        //     if (!$list.length) {
        //         return;
        //     }
        //     if ($list.find(`li[unique-id="${tagData.uniqueId}"]`).length) {
        //         return;
        //     }
        //     const closeBtnStatus = $builder.find(this.selectors.selectedTagsContainer).attr("close-status");
        //     const closeIcon = closeBtnStatus === "true"
        //         ? '<span class="caf-builder-template-preview-selected-tag-close-btn"><i class="fa fa-times" aria-hidden="true"></i></span>'
        //         : "";
        //     const html = `
        //         <li class="caf-builder-template-preview-selected-tag-single-item"
        //             unique-id="${tagData.uniqueId}"
        //             data-source="${tagData.dataSource}"
        //             value="${tagData.value}"
        //             filter-type="${tagData.filterType}"
        //             row-id="${tagData.rowId}"
        //             column-id="${tagData.columnId}"
        //             module-id="${tagData.moduleId}">
        //             ${closeIcon}${tagData.termName}
        //         </li>
        //     `;
        //     // console.log(html);
        //     $list.append(html);
        // },
        collectSelectedTagsData($builder) {
            const selectedTags = [];

            $builder.find(
                ".caf-module-filter .caf-terms-list-item.caf-selected, " +
                ".caf-module-filter .caf-dropdown-child .caf-terms-list-item.active"
            ).each((_, el) => {
                const $item = $(el);
                const isDropdown = $item.closest(".caf-dropdown-child").length > 0;
                const tagData = this.getTagData($item, isDropdown ? "dropdown" : "input");

                if (!tagData || !tagData.value || tagData.value === "0" || tagData.value === "all") {
                    return;
                }

                selectedTags.push({
                    row_id: tagData.rowId,
                    column_id: tagData.columnId,
                    module_id: tagData.moduleId,
                    data_source: tagData.dataSource,
                    filter_type: tagData.filterType,
                    value: tagData.value,
                    label: tagData.termName,
                    unique_id: tagData.uniqueId
                });
            });

            cafGetRangeSliderModules($builder).each((_, moduleEl) => {
                const $module = $(moduleEl);
                const $slider = $module.find(".caf-range-slider-ui").first();
                if (!$slider.length) {
                    return;
                }

                const rangeType = String($slider.attr("data-range-type") || "double").toLowerCase();
                const minBound = Number($slider.attr("data-min"));
                const maxBound = Number($slider.attr("data-max"));
                const currentMin = Number($slider.attr("data-current-min"));
                const currentMax = Number($slider.attr("data-current-max"));
                const safeCurrentMin = Number.isFinite(currentMin) ? currentMin : minBound;
                const safeCurrentMax = Number.isFinite(currentMax) ? currentMax : maxBound;

                if (!Number.isFinite(safeCurrentMin) || !Number.isFinite(safeCurrentMax)) {
                    return;
                }

                const isNeutralSingle =
                    rangeType === "single" &&
                    Number.isFinite(maxBound) &&
                    safeCurrentMax === maxBound;
                const isNeutralDouble =
                    rangeType !== "single" &&
                    Number.isFinite(minBound) &&
                    Number.isFinite(maxBound) &&
                    safeCurrentMin === minBound &&
                    safeCurrentMax === maxBound;

                if (isNeutralSingle || isNeutralDouble) {
                    return;
                }

                const valueLabel = rangeType === "single"
                    ? `${safeCurrentMax}`
                    : `${safeCurrentMin} - ${safeCurrentMax}`;
                const moduleLabel = $.trim(
                    $module.find(".caf-filter-label-common .caf-builder-filter-label, .caf-filter-label-common .caf-builder-custom-field-label-inner").first().text() || ""
                );
                const tagLabel = `${moduleLabel || "Range Slider"}: ${valueLabel}`;

                const rowId = String($module.attr("data-row-id") || "");
                const columnId = String($module.attr("data-column-id") || "");
                const moduleId = String($module.attr("data-module-id") || "");
                if (!rowId || !columnId || !moduleId) {
                    return;
                }

                selectedTags.push({
                    row_id: rowId,
                    column_id: columnId,
                    module_id: moduleId,
                    data_source: "range_slider",
                    filter_type: "range_slider",
                    value: valueLabel,
                    label: tagLabel,
                    unique_id: `${rowId}-${columnId}-${moduleId}-range-${valueLabel}`
                });
            });

            const selectedTagEnabled = String($builder.attr("selected-tag") || "false") === "true";
            const searchKeyword = CAFQueryBuilder.getSearchKeywordForSelectedTags($builder);
            const searchSettings = CAFQueryBuilder.getSearchModuleSettings($builder);
            const hasSmartMatches = parseInt($builder.data("cafSmartMatchedTermsCount") || 0, 10) > 0;
            const shouldSkipSearchTag = searchSettings.smartEnabled && hasSmartMatches;
            if (selectedTagEnabled && searchKeyword && !shouldSkipSearchTag) {
                const $searchModule = $builder.find(".caf-module-filter.caf-module-type-search .caf-filter-module-search-output").first();
                const searchRowId = String($searchModule.attr("row-id") || "");
                const searchColumnId = String($searchModule.attr("column-id") || "");
                const searchModuleId = String($searchModule.attr("module-id") || "");
                if (searchRowId && searchColumnId && searchModuleId) {
                    selectedTags.push({
                        row_id: searchRowId,
                        column_id: searchColumnId,
                        module_id: searchModuleId,
                        data_source: "search",
                        filter_type: "search",
                        value: searchKeyword,
                        label: `Search: ${searchKeyword}`,
                        unique_id: `${searchRowId}-${searchColumnId}-${searchModuleId}-search-${searchKeyword}`
                    });
                }
            }

            return selectedTags;
        },

        getTagData($item, mode = "input") {
            const $list = $item.closest(".caf-terms-list");

            let value = "";

            if (mode === "dropdown") {
                value = $item.attr("term-id");
            } else {
                const $input = $item.find(".caf-taxo-input");
                value =
                    $input.val() ||
                    $item.attr("term-value") ||
                    $item.attr("term-id") ||
                    "";
            }

            const termName = this.resolveSelectedTagTermLabel($item);

            const rowId = $list.attr("row-id");
            const columnId = $list.attr("column-id");
            const moduleId = $list.attr("module-id");

            return {
                rowId,
                columnId,
                moduleId,
                dataSource: $list.attr("data-source"),
                filterType: $list.attr("filter-type"),
                value,
                termName,
                uniqueId: `${rowId}-${columnId}-${moduleId}-${value}`
            };
        },

        /**
         * Label for selected-filter chips — never include facet counts
         * (color swatches often hide .trm-name, so $item.text() used to pick up .count-span).
         */
        resolveSelectedTagTermLabel($item) {
            const $name = $item.find(".trm-name, .caf-term-label").first();
            if ($name.length) {
                return $.trim($name.text());
            }

            const $tooltip = $item.find(".caf-term-tooltip").first();
            if ($tooltip.length) {
                return $.trim($tooltip.text());
            }

            const attrLabel = String(
                $item.attr("data-caf-term-label")
                || $item.attr("data-caf-tooltip")
                || $item.attr("title")
                || ""
            ).trim();
            if (attrLabel) {
                return attrLabel;
            }

            const $clone = $item.clone();
            $clone.find(
                ".count-span, .caf-term-tooltip, input, .caf-checkbox-box, .caf-term-swatch, svg, img, i"
            ).remove();
            return $.trim($clone.text());
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
            if (this.isMainQueryListing($builder)) {
                this.buildMainQueryFragment($builder, page, options);
                return;
            }

            const sortIndex = $builder.attr("caf-index");
            const loaderStatus = $builder.attr("loader-status");
            const paginationType = $builder.attr("pagination-type");
            const responseMode = options.responseMode || "posts";
            const showLoader = options.skipLoader !== true && loaderStatus === "true";
            const appendPosts = paginationType === "load-more" && page > 1;
            const queryArgs = CAFQueryBuilder.collectQueryArgs($builder, page);
            const selectedFilters = this.collectSelectedTagsData($builder);
            cafAnalyticsDebug("buildQuery selectedFilters", selectedFilters);
            cafAnalyticsDebug("buildQuery queryArgs", queryArgs);

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
                    selected_filters: selectedFilters,
                    caf_index: sortIndex,
                    response_mode: responseMode,
                    dynamic_css_hash: this.getDynamicCssHash($builder),
                    schema_append: appendPosts ? "1" : "0"
                },
                success: (response) => {
                    if ($builder.data("cafBuildQueryRid") !== requestId) {
                        return;
                    }
                    cafAnalyticsDebug("buildQuery ajax response", response);
                    if (!response || !response.success || !response.data) {
                        this.clearInteractionState($builder);
                        return;
                    }

                    const data = response.data;
                    this.updatePosts($builder, data, appendPosts);

                    if (!options.skipScroll && !appendPosts) {
                        this.scrollToPostContainer($builder);
                    }

                    if (!options.skipUrlUpdate && CAFUrlState.isEnabled($builder)) {
                        CAFUrlState.updateHistory($builder, true);
                    }

                    if (data.dynamic_css_hash) {
                        this.setDynamicCssHash($builder, data.dynamic_css_hash);
                    }
                    if (data.dynamic_css) {
                        this.injectDynamicCss(data.dynamic_css);
                    }

                    const interaction = this.getInteractionState($builder);
                    if (interaction) {
                        const foundPostsRaw = (data && typeof data.found_posts !== "undefined") ? data.found_posts : 0;
                        const foundPosts = parseInt(foundPostsRaw, 10) || 0;
                        interaction.meta = interaction.meta || {};
                        interaction.meta.results_total = foundPosts;
                        interaction.meta.zero_results = foundPosts <= 0 ? "yes" : "no";

                        if (interaction.event_type === "search") {
                            interaction.meta.search_results_total = foundPosts;
                            interaction.meta.search_zero_results = foundPosts <= 0 ? "yes" : "no";
                        }
                        this.trackAnalyticsEvent($builder, interaction.event_type || "click", interaction);
                    }
                    this.clearInteractionState($builder);
                },
                error: (xhr, status) => {
                    if (status === "abort") {
                        return;
                    }
                    this.clearInteractionState($builder);
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

        isMainQueryListing($builder) {
            return String($builder.attr("data-caf-listing-target") || "caf") === "main_query";
        },

        getMainQueryBuilder() {
            return $(this.selectors.builder)
                .filter((_, el) => this.isMainQueryListing($(el)))
                .first();
        },

        /**
         * Page number from current location (/page/N/ or ?paged=N).
         */
        getMainQueryPageFromLocation(loc = window.location) {
            try {
                const href = typeof loc === "string" ? loc : String(loc.href || "");
                const url = new URL(href, window.location.href);
                const pretty = url.pathname.match(/\/page\/(\d+)\/?/i);
                if (pretty && pretty[1]) {
                    return Math.max(1, parseInt(pretty[1], 10) || 1);
                }
                const q =
                    url.searchParams.get("paged") ||
                    url.searchParams.get("product-page") ||
                    url.searchParams.get("product_page");
                if (q) {
                    return Math.max(1, parseInt(q, 10) || 1);
                }
            } catch (err) {
                // no-op
            }
            return 1;
        },

        /**
         * Intercept theme pagination so filters stay mounted (no full reload).
         */
        handleMainQueryPaginationClick(e, $link) {
            const $builder = this.getMainQueryBuilder();
            if (!$builder.length) {
                return;
            }

            if (!$link || !$link.length) {
                return;
            }

            // Ignore CAF's own pager / links inside the filter UI.
            if ($link.closest(".caf-builder-container").length) {
                return;
            }

            // Current page indicator (Woo/Astra use .current / aria-current).
            if (
                $link.hasClass("current") ||
                $link.attr("aria-current") === "page" ||
                $link.parent().hasClass("current")
            ) {
                e.preventDefault();
                return;
            }

            const href = String($link.attr("href") || "").trim();
            if (!href || href === "#" || href.toLowerCase().indexOf("javascript:") === 0) {
                return;
            }

            let targetUrl;
            try {
                targetUrl = new URL(href, window.location.href);
            } catch (err) {
                return;
            }

            if (targetUrl.origin !== window.location.origin) {
                return;
            }

            // Only treat shop / product-archive style paths (or same path family).
            const isPagedPath = /\/page\/\d+\/?/i.test(targetUrl.pathname);
            const hasPagedQuery =
                targetUrl.searchParams.has("paged") ||
                targetUrl.searchParams.has("product-page") ||
                targetUrl.searchParams.has("product_page");
            if (!isPagedPath && !hasPagedQuery && !$link.hasClass("page-numbers") && !$link.closest(".woocommerce-pagination, .elementor-pagination, .wp-block-query-pagination, .ast-pagination, .ast-woocommerce-pagination").length) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            // Keep active CAF filter query params on the paged URL only when Filter URLs are on.
            const preserveOrderby = targetUrl.searchParams.get("orderby") || "";
            const preserveOrder = targetUrl.searchParams.get("order") || "";
            CAFUrlState.clearBuilderParams(targetUrl, $builder);
            if (CAFUrlState.isEnabled($builder)) {
                const state = CAFUrlState.serializeFromBuilder($builder);
                if (state && Object.keys(state).length) {
                    CAFUrlState.buildReadableParams($builder, state).forEach(([key, value]) => {
                        targetUrl.searchParams.set(key, value);
                    });
                }
            }
            if (preserveOrderby) {
                targetUrl.searchParams.set("orderby", preserveOrderby);
            }
            if (preserveOrder) {
                targetUrl.searchParams.set("order", preserveOrder);
            }

            const next = `${targetUrl.pathname}${CAFUrlState.toSeoSearchString(targetUrl)}${targetUrl.hash}`;
            window.history.pushState(
                { cafBuilderFilter: true, cafMainQueryPagination: true },
                "",
                next
            );

            this.buildMainQueryFragment($builder, this.getMainQueryPageFromLocation(targetUrl), {
                skipUrlUpdate: true,
                skipScroll: false
            });
        },

        /**
         * Intercept WooCommerce catalog sorting so filters stay mounted (no full reload).
         */
        handleMainQueryOrderingChange(e, $select) {
            const $builder = this.getMainQueryBuilder();
            if (!$builder.length || !$select || !$select.length) {
                return;
            }
            if ($select.closest(".caf-builder-container").length) {
                return;
            }

            if (e && typeof e.preventDefault === "function") {
                e.preventDefault();
            }
            if (e && typeof e.stopImmediatePropagation === "function") {
                e.stopImmediatePropagation();
            } else if (e && typeof e.stopPropagation === "function") {
                e.stopPropagation();
            }

            this.applyMainQueryOrderingValue($builder, String($select.val() || "").trim());
        },

        handleMainQueryOrderingSubmit(e, $form) {
            const $builder = this.getMainQueryBuilder();
            if (!$builder.length || !$form || !$form.length) {
                return;
            }
            if ($form.closest(".caf-builder-container").length) {
                return;
            }

            if (e && typeof e.preventDefault === "function") {
                e.preventDefault();
            }
            if (e && typeof e.stopImmediatePropagation === "function") {
                e.stopImmediatePropagation();
            } else if (e && typeof e.stopPropagation === "function") {
                e.stopPropagation();
            }

            const value = String(
                $form.find("select.orderby, select[name='orderby']").first().val() || ""
            ).trim();
            this.applyMainQueryOrderingValue($builder, value);
        },

        applyMainQueryOrderingValue($builder, value) {
            let url;
            try {
                url = new URL(window.location.href);
            } catch (err) {
                return;
            }

            // Sort change returns to page 1.
            url.pathname = url.pathname.replace(/\/page\/\d+\/?(?=$|\?|#)/i, "/");
            url.pathname = url.pathname.replace(/\/{2,}/g, "/");
            url.searchParams.delete("paged");
            url.searchParams.delete("product-page");
            url.searchParams.delete("product_page");

            if (value) {
                url.searchParams.set("orderby", value);
            } else {
                url.searchParams.delete("orderby");
            }

            const next = `${url.pathname}${CAFUrlState.toSeoSearchString(url)}${url.hash}`;
            window.history.pushState(
                { cafBuilderFilter: true, cafMainQuerySort: true },
                "",
                next
            );

            this.buildMainQueryFragment($builder, 1, {
                skipUrlUpdate: true,
                skipScroll: false
            });
        },

        /**
         * Re-init Elementor frontend handlers after Main Query DOM swaps.
         * Avoid runReadyTrigger on Products/Archive widget roots â€” some Elementor
         * versions re-render from cached widget settings and undo the filtered HTML.
         */
        refreshElementorFrontend($builder) {
            try {
                const frontend = window.elementorFrontend;
                if (!frontend || typeof frontend.elementsHandler !== "object") {
                    return;
                }

                // Nested / loop scopes only â€” not the Products widget root.
                const scopes = [
                    ".elementor-widget-loop-grid",
                    ".elementor-loop-container"
                ];

                scopes.forEach((selector) => {
                    $(selector).each((_, el) => {
                        if ($builder && $builder.length && $.contains($builder[0], el)) {
                            return;
                        }
                        try {
                            if (typeof frontend.elementsHandler.runReadyTrigger === "function") {
                                frontend.elementsHandler.runReadyTrigger(el);
                            }
                        } catch (err) {
                            // no-op â€” Elementor versions differ.
                        }
                    });
                });

                // Re-bind Woo add-to-cart on swapped product cards.
                if (typeof $(document.body).trigger === "function") {
                    $(document.body).trigger("wc_fragments_loaded");
                }
            } catch (err) {
                // no-op
            }
        },

        getMainQueryResultsSelectors($builder) {
            const custom = String($builder.attr("data-caf-results-selector") || "").trim();
            // Classic Woo + Divi Shop + Elementor Archive/Loop + block themes.
            // Prefer .woocommerce wrappers so count/order/grid swap together.
            const defaults = [
                ".elementor-widget-woocommerce-products .woocommerce",
                ".elementor-widget-wc-archive-products .woocommerce",
                ".elementor-wc-products .woocommerce",
                ".et_pb_shop .woocommerce",
                ".et_pb_shop ul.products",
                ".elementor-wc-products ul.products",
                ".elementor-widget-wc-archive-products ul.products",
                ".elementor-widget-woocommerce-products ul.products",
                ".elementor-widget-loop-grid .elementor-loop-container",
                ".elementor-loop-container",
                "ul.products",
                ".woocommerce ul.products",
                ".wp-block-woocommerce-product-collection",
                "ul.wc-block-product-template",
                ".wc-block-product-template",
                ".caf-results"
            ];
            if (custom) {
                // Keep custom first, but still try Elementor wrappers before generic ul.
                const rest = defaults.filter((item) => item !== custom);
                return [custom].concat(rest);
            }
            return defaults;
        },

        /**
         * Empty-state nodes that replace the product grid when zero results.
         */
        getMainQueryEmptySelectors() {
            return [
                ".woocommerce-no-products-found",
                ".elementor-products-nothing-found",
                ".elementor-nothing-found.elementor-products-nothing-found",
                ".wc-block-product-collection-no-results",
                ".woocommerce-info"
            ];
        },

        /**
         * Shop chrome outside the product grid (count / sort / pagination).
         * Swapped separately because TT5 / block themes keep these as sibling blocks.
         */
        getMainQueryCompanionSelectors() {
            return [
                // Leaf companions only ? avoid broad :has() parents that can wrap CAF too.
                ".wp-block-woocommerce-product-results-count",
                ".wc-block-product-results-count",
                "p.woocommerce-result-count",
                ".woocommerce-result-count",
                ".wp-block-woocommerce-catalog-sorting",
                ".wc-block-catalog-sorting",
                "form.woocommerce-ordering",
                ".woocommerce-ordering",
                "nav.woocommerce-pagination",
                ".woocommerce-pagination",
                ".ast-woocommerce-pagination",
                ".ast-pagination",
                "nav.elementor-pagination",
                ".elementor-pagination",
                ".wp-block-query-pagination",
                ".wc-block-pagination",
                ".wc-block-components-pagination"
            ];
        },

        findExternalResultsNode($root, selectors) {
            // Prefer a real Element root â€” $(document).find() is unreliable in some jQuery builds.
            let $scope;
            if ($root && $root.length) {
                const node = $root[0];
                if (node && node.nodeType === 9 && node.documentElement) {
                    $scope = $($root[0].documentElement);
                } else {
                    $scope = $root;
                }
            } else if (typeof document !== "undefined" && document.documentElement) {
                $scope = $(document.documentElement);
            } else {
                $scope = $(document);
            }
            const list = Array.isArray(selectors) ? selectors : [selectors];

            for (let i = 0; i < list.length; i += 1) {
                const selector = String(list[i] || "").trim();
                if (!selector) {
                    continue;
                }
                try {
                    const $match = $scope.find(selector).filter(function () {
                        const $el = $(this);
                        // Never touch CAF itself, or a wrapper that contains CAF.
                        if ($el.closest(".caf-builder-container").length) {
                            return false;
                        }
                        if ($el.find(".caf-builder-container").length) {
                            return false;
                        }
                        // Generic .woocommerce-info must not wipe checkout/cart notices.
                        if (selector === ".woocommerce-info") {
                            if ($el.closest(".woocommerce-notices-wrapper, .woocommerce-checkout, .woocommerce-cart").length) {
                                return false;
                            }
                            // Prefer only empty-state infos near a products region / Elementor shop widget.
                            if (
                                !$el.closest(
                                    ".et_pb_shop, .elementor-wc-products, .elementor-widget-wc-archive-products, .elementor-widget-woocommerce-products, .woocommerce"
                                ).length
                            ) {
                                return false;
                            }
                        }
                        return true;
                    }).first();
                    if ($match.length) {
                        return { $node: $match, selector };
                    }
                } catch (err) {
                    // Invalid user selector ? skip.
                }
            }
            return { $node: $(), selector: "" };
        },

        /**
         * Swap product grid ? empty-state when one side has no matching node.
         */
        syncMainQueryListingZone($builder, $remoteDoc) {
            const productSelectors = this.getMainQueryResultsSelectors($builder);
            const emptySelectors = this.getMainQueryEmptySelectors();

            const liveProducts = this.findExternalResultsNode($(document), productSelectors);
            const remoteProducts = this.findExternalResultsNode($remoteDoc, productSelectors);
            const liveEmpty = this.findExternalResultsNode($(document), emptySelectors);
            const remoteEmpty = this.findExternalResultsNode($remoteDoc, emptySelectors);

            const canReplace = ($node) =>
                $node && $node.length && !$node.find(".caf-builder-container").length;

            // Normal: products â†’ products.
            if (liveProducts.$node.length && remoteProducts.$node.length) {
                if (canReplace(liveProducts.$node)) {
                    const html = remoteProducts.$node[0] && remoteProducts.$node[0].outerHTML
                        ? remoteProducts.$node[0].outerHTML
                        : "";
                    if (html) {
                        const $new = this.replaceListingNode(liveProducts.$node, html);
                        return { $node: $new, selector: remoteProducts.selector || liveProducts.selector };
                    }
                    const $clone = remoteProducts.$node.clone(true, true);
                    liveProducts.$node.replaceWith($clone);
                    return { $node: $clone, selector: remoteProducts.selector || liveProducts.selector };
                }
                return liveProducts;
            }

            // Products â†’ empty.
            if (liveProducts.$node.length && remoteEmpty.$node.length && !remoteProducts.$node.length) {
                if (canReplace(liveProducts.$node)) {
                    const html = remoteEmpty.$node[0] && remoteEmpty.$node[0].outerHTML
                        ? remoteEmpty.$node[0].outerHTML
                        : "";
                    if (html) {
                        const $new = this.replaceListingNode(liveProducts.$node, html);
                        return { $node: $new, selector: remoteEmpty.selector || liveProducts.selector };
                    }
                    const $clone = remoteEmpty.$node.clone(true, true);
                    liveProducts.$node.replaceWith($clone);
                    return { $node: $clone, selector: remoteEmpty.selector || liveProducts.selector };
                }
                return { $node: $(), selector: liveProducts.selector };
            }

            // Empty â†’ products.
            if (liveEmpty.$node.length && remoteProducts.$node.length && !liveProducts.$node.length) {
                if (canReplace(liveEmpty.$node)) {
                    const html = remoteProducts.$node[0] && remoteProducts.$node[0].outerHTML
                        ? remoteProducts.$node[0].outerHTML
                        : "";
                    if (html) {
                        const $new = this.replaceListingNode(liveEmpty.$node, html);
                        return { $node: $new, selector: remoteProducts.selector || liveEmpty.selector };
                    }
                    const $clone = remoteProducts.$node.clone(true, true);
                    liveEmpty.$node.replaceWith($clone);
                    return { $node: $clone, selector: remoteProducts.selector || liveEmpty.selector };
                }
                return remoteProducts;
            }

            // Empty â†’ empty (refresh message).
            if (liveEmpty.$node.length && remoteEmpty.$node.length) {
                if (canReplace(liveEmpty.$node)) {
                    const html = remoteEmpty.$node[0] && remoteEmpty.$node[0].outerHTML
                        ? remoteEmpty.$node[0].outerHTML
                        : "";
                    if (html) {
                        const $new = this.replaceListingNode(liveEmpty.$node, html);
                        return { $node: $new, selector: remoteEmpty.selector || liveEmpty.selector };
                    }
                    const $clone = remoteEmpty.$node.clone(true, true);
                    liveEmpty.$node.replaceWith($clone);
                    return { $node: $clone, selector: remoteEmpty.selector || liveEmpty.selector };
                }
                return remoteEmpty;
            }

            return { $node: $(), selector: "" };
        },

        /**
         * Replace results count / sorting / pagination companions from fetched HTML.
         */
        syncMainQueryCompanions($remoteDoc) {
            const selectors = this.getMainQueryCompanionSelectors();
            const skippedInside = [];

            selectors.forEach((selector) => {
                const live = this.findExternalResultsNode($(document), [selector]);
                if (!live.$node.length) {
                    return;
                }

                // Skip nodes already replaced via a parent companion.
                if (
                    skippedInside.some(($ancestor) =>
                        $ancestor.length &&
                        ($.contains($ancestor[0], live.$node[0]) || $ancestor[0] === live.$node[0])
                    )
                ) {
                    return;
                }

                const remote = this.findExternalResultsNode($remoteDoc, [selector]);
                if (!remote.$node.length) {
                    // Remove orphan companions when remote has zero results (no pager/count).
                    if (
                        live.$node.is(
                            "nav.woocommerce-pagination, .woocommerce-pagination, .ast-woocommerce-pagination, .ast-pagination, nav.elementor-pagination, .elementor-pagination, .wp-block-query-pagination, .wc-block-pagination, .wc-block-components-pagination, p.woocommerce-result-count, .woocommerce-result-count, .wp-block-woocommerce-product-results-count, .wc-block-product-results-count"
                        )
                    ) {
                        live.$node.remove();
                        return;
                    }
                    return;
                }

                const $replacement = remote.$node.clone(true, true);
                live.$node.replaceWith($replacement);
                skippedInside.push($replacement);
            });
        },

        /**
         * Build the Main Query fragment request URL from live filter state.
         * Keeps theme page path + catalog orderby; injects filter params for the AJAX GET only
         * (when Filter URLs are off, the address bar stays clean via updateHistory noop).
         */
        getMainQueryRequestUrl($builder) {
            let url;
            try {
                url = new URL(window.location.href);
            } catch (err) {
                return window.location.href;
            }

            const preserveOrderby = url.searchParams.get("orderby") || "";
            const preserveOrder = url.searchParams.get("order") || "";

            CAFUrlState.clearBuilderParams(url, $builder);

            const state = CAFUrlState.serializeFromBuilder($builder);
            if (state && Object.keys(state).length) {
                CAFUrlState.buildReadableParams($builder, state).forEach(([key, value]) => {
                    url.searchParams.set(key, value);
                });
            }

            if (preserveOrderby) {
                url.searchParams.set("orderby", preserveOrderby);
            } else {
                url.searchParams.delete("orderby");
            }
            if (preserveOrder) {
                url.searchParams.set("order", preserveOrder);
            } else {
                url.searchParams.delete("order");
            }

            // Fragment flag as query arg (header may be stripped) + cache bust.
            url.searchParams.set("_caf_fragment", "1");
            url.searchParams.set("_caf_t", String(Date.now()));

            return url.toString();
        },

        /**
         * Parse a listing HTML chunk into a DOM element (avoids jQuery HTML-vs-selector pitfalls).
         */
        parseListingHtml(html) {
            const raw = String(html || "").trim();
            if (!raw) {
                return $();
            }
            try {
                if (typeof document !== "undefined" && "content" in document.createElement("template")) {
                    const tpl = document.createElement("template");
                    tpl.innerHTML = raw;
                    const el = tpl.content.firstElementChild;
                    return el ? $(el) : $();
                }
            } catch (err) {
                // fall through
            }
            return $(raw);
        },

        /**
         * Replace a live listing node with incoming HTML; returns the new jQuery node.
         */
        replaceListingNode($live, html) {
            if (!$live || !$live.length) {
                return $();
            }
            const $incoming = this.parseListingHtml(html);
            if (!$incoming.length) {
                return $();
            }
            $live.replaceWith($incoming);
            return $incoming;
        },

        buildMainQueryFragment($builder, page = 1, options = {}) {
            const loaderStatus = $builder.attr("loader-status");
            const showLoader = options.skipLoader !== true && loaderStatus === "true";
            const queryKey = `caf-mq-${$builder.attr("caf-index") || "0"}`;

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

            if (!options.skipUrlUpdate && CAFUrlState.isEnabled($builder)) {
                CAFUrlState.updateHistory($builder, true);
            }

            if (showLoader) {
                $builder.find(this.selectors.loader).addClass("active");
            }

            // Prefer admin-ajax listing (reliable on Elementor/Divi custom pages).
            if (typeof tc_caf_ajax !== "undefined" && tc_caf_ajax.ajax_url) {
                const jqXHR = this.fetchMainQueryListingAjax($builder, page, requestId, options);
                this._buildQueryXhrs[queryKey] = jqXHR;
                if (jqXHR && typeof jqXHR.always === "function") {
                    jqXHR.always(() => {
                        if (this._buildQueryXhrs[queryKey] === jqXHR) {
                            delete this._buildQueryXhrs[queryKey];
                        }
                        if (showLoader && $builder.data("cafBuildQueryRid") === requestId) {
                            $builder.find(this.selectors.loader).removeClass("active");
                        }
                    });
                }
                return;
            }

            // Fallback: full-page JSON fragment GET.
            this.fetchMainQueryPageFragment($builder, page, requestId, options, queryKey, showLoader);
        },

        /**
         * Resolve and lock Main Query posts-per-page (Elementor/Divi/Woo/WP).
         * Never reuse the currently visible product count after filtering.
         */
        resolveMainQueryPostsPerPage($builder) {
            const locked = parseInt(
                $builder.data("cafMqPerPage") || $builder.attr("data-caf-mq-per-page") || "0",
                10
            );
            if (locked > 0) {
                return locked;
            }

            const $doc = $(document);
            const $ul = this.findExternalResultsNode(
                $doc,
                this.getMainQueryResultsSelectors($builder).concat(["ul.products"])
            ).$node;
            const $grid = $ul.filter("ul.products").length
                ? $ul.filter("ul.products")
                : $ul.find("ul.products").first();
            const $target = $grid.length ? $grid : $ul;
            const $woo = $target.closest(".woocommerce, .elementor-wc-products, .et_pb_shop").length
                ? $target.closest(".woocommerce, .elementor-wc-products, .et_pb_shop")
                : $doc;

            let perPage = 0;

            // 1) Woo result count range: "Showing 1-16 of 27 results"
            const resultText = String($woo.find(".woocommerce-result-count").first().text() || "")
                .replace(/\u00a0/g, " ")
                .replace(/&ndash;|&mdash;/gi, "-")
                .trim();
            const rangeMatch = resultText.match(/showing\s+(\d+)\s*[–\-\u2013\u2014]\s*(\d+)\s+of\s+(\d+)/i);
            if (rangeMatch) {
                const from = parseInt(rangeMatch[1], 10);
                const to = parseInt(rangeMatch[2], 10);
                if (to >= from && from > 0) {
                    perPage = to - from + 1;
                }
            }

            // 2) Elementor Products widget: columns * rows from data-settings
            if (perPage <= 0) {
                const $widget = $target
                    .closest(".elementor-widget-woocommerce-products, .elementor-wc-products")
                    .add($doc.find(".elementor-widget-woocommerce-products").first())
                    .first();
                if ($widget.length) {
                    let settings = {};
                    try {
                        settings = $widget.data("settings") || JSON.parse($widget.attr("data-settings") || "{}") || {};
                    } catch (err) {
                        settings = {};
                    }
                    const widgetClass = String($widget.attr("class") || "");
                    const gridMatch = widgetClass.match(/elementor-grid-(\d+)/);
                    const columns = gridMatch
                        ? parseInt(gridMatch[1], 10)
                        : parseInt(settings.columns || "0", 10) || 0;
                    const rows = parseInt(settings.rows || settings.paginate_rows || "0", 10) || 0;
                    if (columns > 0 && rows > 0) {
                        perPage = columns * rows;
                    }
                }
            }

            // 3) Full first page only: product LI count when pagination has a next page
            if (perPage <= 0 && $target.length && $target.is("ul.products")) {
                const count = $target.children("li.product").length;
                const $pager = $woo.find(".woocommerce-pagination, nav.woocommerce-pagination").first();
                const hasNext = $pager.find("a.next, .next.page-numbers").length > 0;
                if (count > 0 && hasNext) {
                    perPage = count;
                }
            }

            // 4) Localized Woo/WP catalog default from PHP
            if (perPage <= 0 && typeof tc_caf_ajax !== "undefined") {
                perPage = parseInt(tc_caf_ajax.main_query_per_page || "0", 10) || 0;
            }

            // 5) Last resort
            if (perPage <= 0) {
                perPage = 16;
            }

            $builder.data("cafMqPerPage", perPage);
            $builder.attr("data-caf-mq-per-page", String(perPage));
            return perPage;
        },

        /**
         * Prefer the real product UL (never the .woocommerce wrapper).
         * Replacing .woocommerce with a bare UL destroys Elementor column layout.
         */
        findMainQueryProductsUl($builder) {
            const prefer = [
                ".elementor-widget-woocommerce-products ul.products",
                ".elementor-widget-wc-archive-products ul.products",
                ".elementor-wc-products ul.products",
                ".et_pb_shop ul.products",
                ".woocommerce ul.products",
                "ul.products"
            ];
            const custom = String($builder.attr("data-caf-results-selector") || "").trim();
            const selectors = custom ? [custom].concat(prefer) : prefer;
            const found = this.findExternalResultsNode($(document), selectors);
            let $node = found.$node;
            if ($node.length && !$node.is("ul.products")) {
                const $inner = $node.find("ul.products").first();
                if ($inner.length) {
                    $node = $inner;
                }
            }
            if ($node.length && $node.is("ul.products")) {
                return $node;
            }
            return $();
        },

        /**
         * Shop / Elementor products scope (wrapper that holds count + UL + pager).
         */
        findMainQueryProductsScope($builder) {
            const $ul = this.findMainQueryProductsUl($builder);
            if ($ul.length) {
                const $scope = $ul.closest(
                    ".elementor-widget-woocommerce-products, .elementor-widget-wc-archive-products, .elementor-wc-products, .et_pb_shop, .woocommerce"
                );
                if ($scope.length) {
                    return $scope;
                }
            }
            const scopeFound = this.findExternalResultsNode($(document), [
                ".elementor-widget-woocommerce-products .woocommerce",
                ".elementor-widget-wc-archive-products .woocommerce",
                ".elementor-wc-products .woocommerce",
                ".et_pb_shop .woocommerce",
                ".elementor-widget-woocommerce-products",
                ".et_pb_shop"
            ]);
            return scopeFound.$node;
        },

        /**
         * Lock Elementor/Woo UL classes once (elementor-grid + columns-N).
         */
        resolveMainQueryProductsClass($builder) {
            const locked = String(
                $builder.data("cafMqProductsClass") || $builder.attr("data-caf-mq-products-class") || ""
            ).trim();
            if (locked) {
                return locked;
            }

            const $ul = this.findMainQueryProductsUl($builder);
            let className = $ul.length ? String($ul.attr("class") || "").trim() : "";
            if (!className || className.indexOf("products") === -1) {
                className = "products elementor-grid columns-4";
            }
            if (className.indexOf("elementor-grid") === -1) {
                const $widget = $ul.closest(
                    ".elementor-widget-woocommerce-products, .elementor-wc-products, .elementor-products-grid"
                );
                if ($widget.length) {
                    className = (className + " elementor-grid").replace(/\s+/g, " ").trim();
                }
            }

            $builder.data("cafMqProductsClass", className);
            $builder.attr("data-caf-mq-products-class", className);
            return className;
        },

        /**
         * Snapshot Elementor/Divi product grid meta for AJAX re-render.
         */
        getMainQueryListingMeta($builder) {
            const $target = this.findMainQueryProductsUl($builder);
            const limit = this.resolveMainQueryPostsPerPage($builder);
            const className = this.resolveMainQueryProductsClass($builder);

            let columns = 4;
            const colMatch = className.match(/columns-(\d+)/);
            if (colMatch && colMatch[1]) {
                columns = parseInt(colMatch[1], 10) || 4;
            } else {
                const parentClass = ($target.closest(
                    ".elementor-widget-woocommerce-products, .elementor-wc-products"
                ).attr("class") || "");
                const pg = parentClass.match(/elementor-grid-(\d+)/);
                if (pg && pg[1]) {
                    columns = parseInt(pg[1], 10) || 4;
                }
            }

            return {
                limit,
                columns,
                products_class: className
            };
        },

        /**
         * Admin-ajax Main Query listing (primary path).
         */
        fetchMainQueryListingAjax($builder, page, requestId, options = {}) {
            const meta = this.getMainQueryListingMeta($builder);
            const sortIndex = $builder.attr("caf-index") || "0";
            const queryArgs = CAFQueryBuilder.collectQueryArgs($builder, page || 1);
            const selectedFilters = this.collectSelectedTagsData($builder);

            // Base URL for pagination links (current filters, no product-page).
            let baseUrl = window.location.href;
            try {
                const u = new URL(window.location.href);
                u.searchParams.delete("product-page");
                u.searchParams.delete("product_page");
                u.searchParams.delete("paged");
                u.hash = "";
                baseUrl = u.toString();
            } catch (err) {
                // keep href
            }

            return $.ajax({
                url: tc_caf_ajax.ajax_url,
                type: "POST",
                dataType: "json",
                data: {
                    action: "get_caf_main_query_listing",
                    nonce: tc_caf_ajax.nonce,
                    caf_index: sortIndex,
                    params: queryArgs,
                    selected_filters: selectedFilters,
                    page: page || 1,
                    limit: meta.limit,
                    columns: meta.columns,
                    products_class: meta.products_class,
                    base_url: baseUrl
                },
                success: (response) => {
                    if ($builder.data("cafBuildQueryRid") !== requestId) {
                        return;
                    }
                    if (!response || !response.success || !response.data) {
                        this.fetchMainQueryPageFragment($builder, page, requestId, options);
                        return;
                    }
                    const listing = this.applyMainQueryAjaxListing($builder, response.data);
                    if (!listing.$node || !listing.$node.length) {
                        this.fetchMainQueryPageFragment($builder, page, requestId, options);
                        return;
                    }
                    this.afterMainQueryFragmentSwap($builder, listing, options);
                },
                error: () => {
                    if ($builder.data("cafBuildQueryRid") !== requestId) {
                        return;
                    }
                    this.fetchMainQueryPageFragment($builder, page, requestId, options);
                }
            });
        },

        /**
         * Apply admin-ajax listing payload.
         * Only touch ul.products — never replace the .woocommerce / Elementor wrapper.
         */
        applyMainQueryAjaxListing($builder, data) {
            const productsInner = String((data && data.products_inner) || "");
            const productsHtml = String((data && data.products) || "");
            const emptyHtml = String((data && data.empty) || "");
            const resultCountHtml = String((data && data.result_count_html) || "");
            const productsClass = this.resolveMainQueryProductsClass($builder);

            const canReplace = ($node) =>
                $node && $node.length && !$node.find(".caf-builder-container").length;

            const removeNearbyEmptyNotices = ($scope) => {
                if (!$scope || !$scope.length) {
                    return;
                }
                $scope.find(
                    ".woocommerce-no-products-found, .elementor-products-nothing-found, p.woocommerce-info.woocommerce-no-products-found"
                ).each(function () {
                    const $el = $(this);
                    if (canReplace($el)) {
                        $el.remove();
                    }
                });
            };

            let listing = { $node: $(), selector: "" };
            let $ul = this.findMainQueryProductsUl($builder);
            const $scope = this.findMainQueryProductsScope($builder);

            if (productsInner || productsHtml) {
                removeNearbyEmptyNotices($scope);

                // Empty-state may have replaced the UL — restore a UL shell in-scope.
                if (!$ul.length && $scope.length && canReplace($scope)) {
                    const $placeholder = $scope
                        .find(".woocommerce-no-products-found, .elementor-products-nothing-found, p.woocommerce-info")
                        .filter(function () {
                            return canReplace($(this));
                        })
                        .first();
                    const shell = `<ul class="${productsClass.replace(/"/g, "")}"></ul>`;
                    if ($placeholder.length) {
                        $ul = this.replaceListingNode($placeholder, shell);
                    } else {
                        const $woo = $scope.is(".woocommerce") ? $scope : $scope.find(".woocommerce").first();
                        const $anchor = $woo.length ? $woo : $scope;
                        $anchor.append(shell);
                        $ul = $anchor.children("ul.products").last();
                    }
                }

                if ($ul.length && canReplace($ul)) {
                    // Re-apply locked Elementor/Woo classes every time (columns stay intact).
                    $ul.attr("class", productsClass);
                    if (productsInner) {
                        $ul.html(productsInner);
                    } else if (productsHtml) {
                        const $parsed = this.parseListingHtml(productsHtml);
                        if ($parsed.is("ul")) {
                            $ul.html($parsed.html());
                            const parsedClass = String($parsed.attr("class") || "").trim();
                            if (parsedClass.indexOf("products") !== -1) {
                                $ul.attr("class", parsedClass);
                                $builder.data("cafMqProductsClass", parsedClass);
                            }
                        } else {
                            $ul.html(productsHtml);
                        }
                    }
                    $ul.show();
                    listing = { $node: $ul, selector: "ul.products" };
                }
            } else if (emptyHtml) {
                // Replace only the UL (keep .woocommerce / Elementor column wrappers).
                if ($ul.length && canReplace($ul)) {
                    listing = {
                        $node: this.replaceListingNode($ul, emptyHtml),
                        selector: data.empty_selector || "ul.products"
                    };
                } else if ($scope.length && canReplace($scope)) {
                    const $woo = $scope.is(".woocommerce") ? $scope : $scope.find(".woocommerce").first();
                    const $anchor = $woo.length ? $woo : $scope;
                    $anchor.find("ul.products").remove();
                    $anchor.append(emptyHtml);
                    listing = {
                        $node: $anchor.find(".woocommerce-no-products-found, p.woocommerce-info").first(),
                        selector: data.empty_selector || ".woocommerce-no-products-found"
                    };
                }
            }

            // Update result count companions (scoped when possible).
            const countRoot = $scope.length ? $scope : $(document);
            if (resultCountHtml) {
                ["p.woocommerce-result-count", ".woocommerce-result-count"].forEach((sel) => {
                    const $count = countRoot.find(sel).filter(function () {
                        return canReplace($(this));
                    }).first();
                    if ($count.length) {
                        this.replaceListingNode($count, resultCountHtml);
                    } else if ($scope.length) {
                        const $woo = $scope.is(".woocommerce") ? $scope : $scope.find(".woocommerce").first();
                        const $target = $woo.length ? $woo : $scope;
                        const $order = $target.find("form.woocommerce-ordering").first();
                        if ($order.length) {
                            $order.before(resultCountHtml);
                        } else {
                            $target.prepend(resultCountHtml);
                        }
                    }
                });
            } else if (emptyHtml) {
                countRoot.find("p.woocommerce-result-count, .woocommerce-result-count").each(function () {
                    if (canReplace($(this))) {
                        $(this).remove();
                    }
                });
            }

            // Sync Woo/Elementor pagination (product-page links).
            this.syncMainQueryAjaxPagination($builder, data, canReplace);

            return listing;
        },

        /**
         * Replace / insert / remove .woocommerce-pagination after Main Query AJAX.
         */
        syncMainQueryAjaxPagination($builder, data, canReplace) {
            const paginationHtml = String((data && data.pagination_html) || "");
            const pagerSelectors = [
                "nav.woocommerce-pagination",
                ".woocommerce-pagination",
                "nav.elementor-pagination",
                ".elementor-pagination"
            ];
            const livePager = this.findExternalResultsNode($(document), pagerSelectors);

            if (paginationHtml) {
                if (livePager.$node.length && canReplace(livePager.$node)) {
                    this.replaceListingNode(livePager.$node, paginationHtml);
                    return;
                }
                // Insert after products / result area when pager was missing (e.g. first filter).
                const $ul = this.findExternalResultsNode(
                    $(document),
                    this.getMainQueryResultsSelectors($builder).concat(["ul.products"])
                ).$node;
                let $anchor = $ul;
                if ($ul.length && !$ul.is("ul.products")) {
                    const inner = $ul.find("ul.products").first();
                    if (inner.length) {
                        $anchor = inner;
                    }
                }
                const $woo = $anchor.closest(".woocommerce");
                if ($woo.length) {
                    $woo.append($(paginationHtml));
                } else if ($anchor.length) {
                    $anchor.after($(paginationHtml));
                }
                return;
            }

            // No pages left â€” drop stale pager from previous unfiltered state.
            if (livePager.$node.length && canReplace(livePager.$node)) {
                livePager.$node.remove();
            }
        },

        /**
         * Legacy full-page fragment GET (fallback).
         */
        fetchMainQueryPageFragment($builder, page = 1, requestId, options = {}, queryKey = "", showLoader = false) {
            const fetchUrl = this.getMainQueryRequestUrl($builder);

            const controllers = typeof AbortController !== "undefined" ? new AbortController() : null;
            const abortProxy = {
                abort: () => {
                    if (controllers) {
                        controllers.abort();
                    }
                }
            };
            if (queryKey) {
                this._buildQueryXhrs[queryKey] = abortProxy;
            }

            const fetchOptions = {
                method: "GET",
                credentials: "same-origin",
                cache: "no-store",
                headers: {
                    "X-CAF-Fragment": "1",
                    "X-CAF-Apply-Filters": "1",
                    Accept: "application/json, text/html"
                }
            };
            if (controllers) {
                fetchOptions.signal = controllers.signal;
            }

            fetch(fetchUrl, fetchOptions)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Fragment fetch failed: ${response.status}`);
                    }
                    return response.text().then((text) => {
                        const ct = String(response.headers.get("content-type") || "").toLowerCase();
                        const trimmed = String(text || "").trim();
                        const looksJson =
                            ct.indexOf("application/json") !== -1 ||
                            trimmed.charAt(0) === "{";
                        if (looksJson) {
                            try {
                                const start = trimmed.indexOf("{");
                                const end = trimmed.lastIndexOf("}");
                                const slice =
                                    start >= 0 && end > start
                                        ? trimmed.slice(start, end + 1)
                                        : trimmed;
                                return { kind: "json", json: JSON.parse(slice) };
                            } catch (err) {
                                return { kind: "html", html: text };
                            }
                        }
                        return { kind: "html", html: text };
                    });
                })
                .then((payload) => {
                    if ($builder.data("cafBuildQueryRid") !== requestId) {
                        return;
                    }

                    let listing = { $node: $(), selector: "" };

                    if (
                        payload.kind === "json" &&
                        payload.json &&
                        payload.json.success &&
                        payload.json.data
                    ) {
                        const chunkData = payload.json.data;
                        if (!chunkData.products && !chunkData.empty) {
                            return this.fetchMainQueryFullHtmlFallback($builder, requestId, options);
                        }
                        listing = this.applyMainQueryFragmentChunks($builder, chunkData);
                        if (!listing.$node || !listing.$node.length) {
                            return this.fetchMainQueryFullHtmlFallback($builder, requestId, options);
                        }
                    } else if (payload.kind === "html") {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(payload.html, "text/html");
                        const $remote = $(doc);
                        listing = this.syncMainQueryListingZone($builder, $remote);
                        this.syncMainQueryCompanions($remote);
                    } else {
                        return this.fetchMainQueryFullHtmlFallback($builder, requestId, options);
                    }

                    this.afterMainQueryFragmentSwap($builder, listing, options);
                })
                .catch((err) => {
                    if (err && err.name === "AbortError") {
                        return;
                    }
                    if (typeof console !== "undefined" && typeof console.warn === "function") {
                        console.warn("[CAF] Main Query fragment failed", err);
                    }
                    this.clearInteractionState($builder);
                })
                .finally(() => {
                    if (queryKey && this._buildQueryXhrs[queryKey] === abortProxy) {
                        delete this._buildQueryXhrs[queryKey];
                    }
                    if (showLoader && $builder.data("cafBuildQueryRid") === requestId) {
                        $builder.find(this.selectors.loader).removeClass("active");
                    }
                });
        },

        /**
         * Apply server JSON chunks (products / empty / companions) to the live DOM.
         */
        applyMainQueryFragmentChunks($builder, data) {
            const productsHtml = String((data && data.products) || "");
            const emptyHtml = String((data && data.empty) || "");
            const companions = data && data.companions && typeof data.companions === "object"
                ? data.companions
                : {};

            // Prefer the selector the server used for extraction so wrapper vs ul stays in sync.
            const productSelectors = [];
            if (data && data.products_selector) {
                productSelectors.push(String(data.products_selector));
            }
            productSelectors.push(...this.getMainQueryResultsSelectors($builder));

            const emptySelectors = [];
            if (data && data.empty_selector) {
                emptySelectors.push(String(data.empty_selector));
            }
            emptySelectors.push(...this.getMainQueryEmptySelectors());

            const liveProducts = this.findExternalResultsNode($(document), productSelectors);
            const liveEmpty = this.findExternalResultsNode($(document), emptySelectors);

            const canReplace = ($node) =>
                $node && $node.length && !$node.find(".caf-builder-container").length;

            let listing = { $node: $(), selector: "" };
            let swappedWrapper = false;

            if (productsHtml) {
                if (liveProducts.$node.length && canReplace(liveProducts.$node)) {
                    const $new = this.replaceListingNode(liveProducts.$node, productsHtml);
                    listing = {
                        $node: $new,
                        selector: data.products_selector || liveProducts.selector
                    };
                    swappedWrapper = /\.woocommerce\s*$/.test(String(listing.selector || ""))
                        || ($new.length && $new.is(".woocommerce"));
                } else if (liveEmpty.$node.length && canReplace(liveEmpty.$node)) {
                    const $new = this.replaceListingNode(liveEmpty.$node, productsHtml);
                    listing = {
                        $node: $new,
                        selector: data.products_selector || ""
                    };
                    swappedWrapper = $new.length && $new.is(".woocommerce");
                }
            } else if (emptyHtml) {
                if (liveProducts.$node.length && canReplace(liveProducts.$node)) {
                    const $new = this.replaceListingNode(liveProducts.$node, emptyHtml);
                    listing = {
                        $node: $new,
                        selector: data.empty_selector || liveProducts.selector
                    };
                } else if (liveEmpty.$node.length && canReplace(liveEmpty.$node)) {
                    const $new = this.replaceListingNode(liveEmpty.$node, emptyHtml);
                    listing = {
                        $node: $new,
                        selector: data.empty_selector || liveEmpty.selector
                    };
                }
            }

            // Companions from JSON (skip when already inside a swapped .woocommerce wrapper).
            if (!swappedWrapper) {
                Object.keys(companions).forEach((selector) => {
                    const html = companions[selector];
                    if (!html) {
                        return;
                    }
                    const live = this.findExternalResultsNode($(document), [selector]);
                    if (!live.$node.length || !canReplace(live.$node)) {
                        return;
                    }
                    this.replaceListingNode(live.$node, html);
                });
            }

            // Drop orphan pager/count when remote sent none.
            const pagerKeys = [
                "nav.woocommerce-pagination",
                ".woocommerce-pagination",
                ".ast-woocommerce-pagination",
                ".ast-pagination",
                "nav.elementor-pagination",
                ".elementor-pagination",
                ".wp-block-query-pagination",
                ".wc-block-pagination",
                ".wc-block-components-pagination"
            ];
            const hasRemotePager = pagerKeys.some((key) => !!companions[key]);
            if (!hasRemotePager && emptyHtml && !productsHtml) {
                const livePager = this.findExternalResultsNode($(document), pagerKeys);
                if (livePager.$node.length && canReplace(livePager.$node)) {
                    livePager.$node.remove();
                }
            }

            return listing;
        },

        /**
         * Fallback: GET current shop URL as full HTML (no fragment header) and swap via DOM parse.
         */
        fetchMainQueryFullHtmlFallback($builder, requestId, options = {}) {
            let fallbackUrl;
            try {
                const url = new URL(this.getMainQueryRequestUrl($builder));
                url.searchParams.delete("_caf_fragment");
                fallbackUrl = url.toString();
            } catch (err) {
                fallbackUrl = this.getMainQueryRequestUrl($builder);
            }

            return fetch(fallbackUrl, {
                method: "GET",
                credentials: "same-origin",
                cache: "no-store",
                headers: {
                    "X-CAF-Apply-Filters": "1",
                    Accept: "text/html"
                }
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`Full HTML fallback failed: ${response.status}`);
                    }
                    return response.text();
                })
                .then((html) => {
                    if ($builder.data("cafBuildQueryRid") !== requestId) {
                        return;
                    }
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, "text/html");
                    const $remote = $(doc);
                    const listing = this.syncMainQueryListingZone($builder, $remote);
                    this.syncMainQueryCompanions($remote);
                    this.afterMainQueryFragmentSwap($builder, listing, options);
                });
        },

        afterMainQueryFragmentSwap($builder, listing, options = {}) {
            this.refreshElementorFrontend($builder);

            if ($builder.length && $.contains(document.documentElement, $builder[0])) {
                $builder.addClass("caf-is-ready");
            }

            if (typeof this.isDynamicTermCountsEnabled === "function" && this.isDynamicTermCountsEnabled($builder) && typeof this.fetchFacetCounts === "function") {
                this.fetchFacetCounts($builder, { skipLoader: true });
            }

            const interaction = this.getInteractionState($builder);
            if (interaction) {
                interaction.meta = interaction.meta || {};
                this.trackAnalyticsEvent($builder, interaction.event_type || "click", interaction);
            }
            this.clearInteractionState($builder);

            if (!options.skipScroll) {
                const afterSelectors = listing && listing.selector
                    ? [listing.selector].concat(this.getMainQueryEmptySelectors())
                    : this.getMainQueryResultsSelectors($builder).concat(
                          this.getMainQueryEmptySelectors()
                      );
                const after = this.findExternalResultsNode($(document), afterSelectors);
                if (after.$node.length && typeof after.$node[0].scrollIntoView === "function") {
                    try {
                        after.$node[0].scrollIntoView({ behavior: "smooth", block: "start" });
                    } catch (err) {
                        // no-op
                    }
                }
            }
        },

        updatePosts($builder, data, appendPosts = false) {
            const $postLayoutInner = $builder.find(this.selectors.postLayoutInner);
            const sortingUiState = !appendPosts && typeof data.post_top_data !== "undefined"
                ? this.captureSortingUiState($builder)
                : null;

            if (appendPosts) {
                $postLayoutInner.append(data.posts_data);

                // Only update pagination zone
                if (typeof data.post_bottom_data !== "undefined") {
                    $builder.find(".caf-builder-template-preview-post-bottom-wrapper").html(data.post_bottom_data);
                }
            } else {
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
                    this.restoreSortingUiState($builder, sortingUiState);
                }
                if (typeof data.post_bottom_data !== "undefined") {
                $builder.find(".caf-builder-template-preview-post-bottom-wrapper").html(data.post_bottom_data || "");
            }
            }

            const filtersRefreshed = typeof data.filter_top_data !== "undefined"
                || typeof data.filter_bottom_data !== "undefined";

            if (filtersRefreshed) {
                const $filterLayout = $builder.find(".filter-layout-container");
                this.initRangeSliders($filterLayout.length ? $filterLayout : $builder);
            }

            if (CAFUrlState.isSchemaEnabled($builder)) {
                if (typeof data.itemlist_json_ld !== "undefined") {
                    this.updateItemListSchema($builder, data.itemlist_json_ld, appendPosts);
                }
            } else {
                this.updateItemListSchema($builder, "", appendPosts);
            }

            this.syncSelectedTagsUI($builder);
            this.scheduleMasonryForBuilder($builder);
        },

        isMasonryEnabled($builder) {
            return String($builder.attr("data-caf-masonry") || "0") === "1";
        },

        resizeMasonryItem(item, grid) {
            if (!item || !grid) {
                return;
            }

            const styles = window.getComputedStyle(grid);
            const rowHeight = parseInt(styles.getPropertyValue("grid-auto-rows"), 10) || 10;
            const rowGap = parseInt(styles.rowGap, 10) || parseInt(styles.gap, 10) || 0;
            const itemHeight = item.getBoundingClientRect().height;
            const rowSpan = Math.max(
                1,
                Math.ceil((itemHeight + rowGap) / (rowHeight + rowGap))
            );

            item.style.setProperty("--row-span", String(rowSpan));
        },

        clearMasonryItemSpans($grid) {
            if (!$grid || !$grid.length) {
                return;
            }

            $grid[0].querySelectorAll(".caf-builder-post-area").forEach((item) => {
                item.style.removeProperty("--row-span");
            });
        },

        applyMasonryLayout($grid) {
            if (!$grid || !$grid.length) {
                return;
            }

            const grid = $grid[0];
            grid.querySelectorAll(".caf-builder-post-area").forEach((item) => {
                this.resizeMasonryItem(item, grid);
            });
        },

        scheduleMasonryForBuilder($builder) {
            if (!$builder || !$builder.length) {
                return;
            }

            const $grid = $builder.find(this.selectors.postLayoutInner);
            if (!this.isMasonryEnabled($builder) || !$grid.hasClass("caf-masonary-enable")) {
                this.clearMasonryItemSpans($grid);
                return;
            }

            const run = () => this.applyMasonryLayout($grid);
            run();
            window.requestAnimationFrame(run);
            window.setTimeout(run, 60);
            window.setTimeout(run, 300);

            $grid.find("img").each(function () {
                if (!this.complete) {
                    this.addEventListener("load", run, { once: true });
                }
            });
        },

        getScrollConfig($builder) {
            const $postLayout = $builder.find(this.selectors.postLayout).first();
            if (!$postLayout.length) {
                return null;
            }

            const raw = String($postLayout.attr("data-caf-scroll") || "").trim();
            if (!raw) {
                return null;
            }

            try {
                const parsed = JSON.parse(raw);
                return parsed && typeof parsed === "object" ? parsed : null;
            } catch (error) {
                return null;
            }
        },

        resolveScrollDevice() {
            const width = window.innerWidth || document.documentElement.clientWidth || 0;
            if (width <= 767) {
                return "mobile";
            }
            if (width <= 1024) {
                return "tablet";
            }
            return "desktop";
        },

        getScrollDeviceSettings(config, device) {
            const scroll = config || {};
            const read = (targetDevice, key) => {
                const value = scroll?.[targetDevice]?.[key];
                return typeof value === "undefined" || value === null || value === "" ? undefined : value;
            };

            if (device === "mobile") {
                return {
                    is_enable: read("mobile", "is_enable") ?? read("tablet", "is_enable") ?? read("desktop", "is_enable") ?? "false",
                    position: read("mobile", "position") ?? read("tablet", "position") ?? read("desktop", "position") ?? "-100"
                };
            }

            if (device === "tablet") {
                return {
                    is_enable: read("tablet", "is_enable") ?? read("desktop", "is_enable") ?? "false",
                    position: read("tablet", "position") ?? read("desktop", "position") ?? "-100"
                };
            }

            return {
                is_enable: read("desktop", "is_enable") ?? "false",
                position: read("desktop", "position") ?? "-100"
            };
        },

        scrollToPostContainer($builder) {
            if (!$builder || !$builder.length) {
                return;
            }

            const config = this.getScrollConfig($builder);
            if (!config) {
                return;
            }

            const device = this.resolveScrollDevice();
            const settings = this.getScrollDeviceSettings(config, device);
            if (String(settings.is_enable) !== "true") {
                return;
            }

            const $target = $builder.find(this.selectors.postLayout).first();
            if (!$target.length || typeof $target.offset !== "function") {
                return;
            }

            const offset = $target.offset();
            if (!offset || typeof offset.top !== "number") {
                return;
            }

            const scrollOffset = parseInt(settings.position, 10);
            const safeOffset = Number.isFinite(scrollOffset) ? scrollOffset : 0;
            const scrollTop = Math.max(0, offset.top - safeOffset);

            $("html, body").stop(true).animate({ scrollTop }, 600);
        },

        updateItemListSchema($builder, schemaHtml, appendSchema = false) {
            const $postLayout = $builder.find(this.selectors.postLayout);
            if (!$postLayout.length) {
                return;
            }

            const $existing = $postLayout.find("script.caf-builder-itemlist-json-ld").first();
            const html = typeof schemaHtml === "string" ? schemaHtml.trim() : "";

            if (!html) {
                $existing.remove();
                return;
            }

            if (appendSchema && $existing.length) {
                try {
                    const current = JSON.parse($existing.text());
                    const incoming = JSON.parse($(html).text());
                    const currentItems = Array.isArray(current.itemListElement) ? current.itemListElement : [];
                    const incomingItems = Array.isArray(incoming.itemListElement) ? incoming.itemListElement : [];
                    const merged = {
                        ...incoming,
                        itemListElement: currentItems.concat(incomingItems),
                    };
                    if (typeof incoming.numberOfItems !== "undefined") {
                        merged.numberOfItems = incoming.numberOfItems;
                    }
                    const mergedHtml = `<script type="application/ld+json" class="caf-builder-itemlist-json-ld">${JSON.stringify(merged)}</script>`;
                    $existing.replaceWith(mergedHtml);
                    return;
                } catch (error) {
                    // Fall through to replace when merge fails.
                }
            }

            if ($existing.length) {
                $existing.replaceWith(html);
                return;
            }

            $postLayout.find(this.selectors.postLayoutInner).after(html);
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

    /* Body-ported term label tooltips (immune to Design CSS overflow). */
    (function initCafTermLabelTooltips() {
        const PORTAL_ID = "caf-term-tooltip-portal";
        const SELECTOR = ".caf-has-term-tooltip";

        function ensurePortal() {
            let el = document.getElementById(PORTAL_ID);
            if (!el) {
                el = document.createElement("div");
                el.id = PORTAL_ID;
                el.className = "caf-term-tooltip-portal";
                el.setAttribute("role", "tooltip");
                document.body.appendChild(el);
            }
            return el;
        }

        function readLabel(trigger) {
            if (!trigger) {
                return "";
            }
            const fromData = trigger.getAttribute("data-caf-tooltip");
            if (fromData && String(fromData).trim()) {
                return String(fromData).trim();
            }
            const nested = trigger.querySelector(".caf-term-tooltip");
            return nested ? String(nested.textContent || "").trim() : "";
        }

        function hidePortal() {
            const el = document.getElementById(PORTAL_ID);
            if (!el) {
                return;
            }
            el.classList.remove("is-visible", "is-flipped");
            el.textContent = "";
        }

        function showPortal(trigger) {
            const label = readLabel(trigger);
            if (!label) {
                hidePortal();
                return;
            }
            const tip = ensurePortal();
            tip.textContent = label;
            tip.classList.remove("is-flipped");
            tip.classList.add("is-visible");

            const rect = trigger.getBoundingClientRect();
            const tipWidth = tip.offsetWidth || 0;
            const tipHeight = tip.offsetHeight || 0;
            let left = rect.left + rect.width / 2;
            let top = rect.top;
            const pad = 8;

            left = Math.max(
                pad + tipWidth / 2,
                Math.min(left, window.innerWidth - pad - tipWidth / 2)
            );

            if (top - tipHeight - 12 < pad) {
                tip.classList.add("is-flipped");
                top = rect.bottom;
            }

            tip.style.left = left + "px";
            tip.style.top = top + "px";
        }

        $(document)
            .on("mouseenter.cafTermTip focusin.cafTermTip", SELECTOR, function () {
                showPortal(this);
            })
            .on("mouseleave.cafTermTip focusout.cafTermTip", SELECTOR, function () {
                hidePortal();
            });

        $(window).on("scroll.cafTermTip resize.cafTermTip", function () {
            hidePortal();
        });
    })();
});