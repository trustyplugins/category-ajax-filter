/** Shared smart search engine (mirrors builder-framework.js CAFSmartFilterSearch). */
export const CAFSmartFilterSearch = {
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

            const rangeRegex = /(\d+(?:\.\d+)?)\s*(?:-|–|—|to)\s*(\d+(?:\.\d+)?)/g;
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
        },
        /**
         * Price / cost range sliders (e.g. Woo _price) can match comparator
         * queries like "Heels under 100" without the word "price" in the query.
         */
        isPriceLikeMetaKey(metaKey) {
            const key = String(metaKey || "")
                .toLowerCase()
                .replace(/^_+/, "");
            if (!key) {
                return false;
            }
            return (
                key === "price" ||
                key === "regular_price" ||
                key === "sale_price" ||
                key.endsWith("_price") ||
                key.includes("price")
            );
        },
        isPriceLikeSlider(metaKey, labelText, sliderContextTokens) {
            if (this.isPriceLikeMetaKey(metaKey)) {
                return true;
            }
            const priceTokens = new Set([
                "price",
                "cost",
                "amount",
                "budget",
                "mrp",
                "fee",
                "fare",
            ]);
            if (sliderContextTokens && typeof sliderContextTokens[Symbol.iterator] === "function") {
                for (const token of sliderContextTokens) {
                    if (priceTokens.has(String(token || ""))) {
                        return true;
                    }
                }
            }
            const labelNorm = this.normalize(labelText || "");
            return /\b(price|cost|amount|budget|mrp)\b/.test(labelNorm);
        },
        /**
         * Range sliders normally require a context word ("price under 100").
         * Allow price-like sliders when the query has a clear numeric comparator
         * even if other words (category/color) consumed the context tokens.
         * When the layout has only one range slider, unbound comparator queries
         * may target that lone slider even if it is not price-like.
         */
        canMatchRangeSlider(
            contextMatched,
            queryNumericMeta,
            metaKey,
            labelText,
            sliderContextTokens,
            loneSlider = false
        ) {
            if (contextMatched) {
                return true;
            }
            if (!queryNumericMeta || !Array.isArray(queryNumericMeta.numbers) || !queryNumericMeta.numbers.length) {
                return false;
            }
            const hasComparator = Boolean(queryNumericMeta.comparator);
            const hasRanges =
                Array.isArray(queryNumericMeta.ranges) && queryNumericMeta.ranges.length > 0;
            if (!hasComparator && !hasRanges) {
                return false;
            }
            if (this.isPriceLikeSlider(metaKey, labelText, sliderContextTokens)) {
                return true;
            }
            return Boolean(loneSlider);
        },
        /**
         * Explicit phrase commands (voice/NLP shortcuts) — evaluated before fuzzy
         * term matching. Does not change normal search when no phrase matches.
         *
         * Reset: whole-query only (safe; avoids "reset button" product titles).
         * Stock / rating: bounded phrases; stripped from remainder so NLP can continue.
         */
        SEARCH_COMMAND_STOCK_META_KEY: "_stock_status",
        SEARCH_COMMAND_RATING_META_KEY: "_wc_average_rating",
        normalizeCommandText(value) {
            return String(value || "")
                .toLowerCase()
                .replace(/[-_]+/g, " ")
                .replace(/[^a-z0-9\s]/g, " ")
                .replace(/\s+/g, " ")
                .trim();
        },
        clampSearchCommandRating(value) {
            const n = parseInt(value, 10);
            if (!Number.isFinite(n) || n < 1) {
                return null;
            }
            return Math.min(5, n);
        },
        extractSearchCommandRating(workingText) {
            let working = String(workingText || "");
            let rating = null;
            if (!working) {
                return { working, rating };
            }

            const starTail = "(?:star\\s+ratings?|stars?|ratings?)";
            const take = (regex, compare) => {
                if (rating || !working) {
                    return;
                }
                const match = working.match(regex);
                if (!match) {
                    return;
                }
                const stars = this.clampSearchCommandRating(match[1]);
                if (!stars) {
                    return;
                }
                rating = { value: String(stars), compare };
                working = working.replace(regex, " ");
            };

            // Explicit compares before plain "N star".
            take(
                new RegExp(
                    `\\b(?:up\\s+to|under|below|at\\s+most|maximum|max)\\s+(\\d+)\\s*\\+?\\s*${starTail}\\b`
                ),
                "<="
            );
            take(
                new RegExp(
                    `\\b(?:at\\s+least|over|above|minimum|min)\\s+(\\d+)\\s*\\+?\\s*${starTail}\\b`
                ),
                ">="
            );
            take(
                new RegExp(`\\b(?:exactly|exact)\\s+(\\d+)\\s*\\+?\\s*${starTail}\\b`),
                "="
            );
            take(new RegExp(`\\b(\\d+)\\s*\\+\\s*${starTail}\\b`), ">=");
            take(new RegExp(`\\b(\\d+)\\s+plus\\s+${starTail}\\b`), ">=");
            take(/\b(\d+)\s*stars?\s+(?:and|&)\s+up\b/, ">=");
            take(new RegExp(`\\b(\\d+)\\s*${starTail}(?:\\s+products?)?\\b`), null);
            take(/\b(?:rated|rating(?:\s+of)?)\s+(\d+)\b/, null);

            working = working.replace(/\s+/g, " ").trim();
            return { working, rating };
        },
        parseSearchCommands(value) {
            const raw = String(value || "").trim();
            const empty = {
                matched: false,
                reset: false,
                stockStatuses: [],
                rating: null,
                remainder: raw,
                exclusive: false,
            };
            if (!raw) {
                return empty;
            }

            const forMatch = this.normalizeCommandText(
                this.normalizeNumberWords(
                    String(raw || "").replace(/(\d+)\s*\+/g, "$1 plus ")
                ) || String(raw || "").replace(/(\d+)\s*\+/g, "$1 plus ")
            );
            if (!forMatch) {
                return empty;
            }

            const resetPatterns = [
                /^reset$/,
                /^reset\s+filters?$/,
                /^clear\s+filters?$/,
                /^clear\s+all$/,
                /^reset\s+all$/,
            ];
            if (resetPatterns.some((pattern) => pattern.test(forMatch))) {
                return {
                    matched: true,
                    reset: true,
                    stockStatuses: [],
                    rating: null,
                    remainder: "",
                    exclusive: true,
                };
            }

            // Match "out of stock" before "in stock" so phrases do not overlap wrongly.
            const stockStatuses = [];
            let working = forMatch;
            const strippedOut = working.replace(/\bout(?:\s+of)?\s+stock\b|\boutofstock\b/g, " ");
            if (strippedOut !== working) {
                stockStatuses.push("outofstock");
                working = strippedOut;
            }
            const strippedIn = working.replace(/\bin\s+stock\b|\binstock\b/g, " ");
            if (strippedIn !== working) {
                stockStatuses.push("instock");
                working = strippedIn;
            }

            const ratingExtract = this.extractSearchCommandRating(working);
            working = ratingExtract.working;
            const rating = ratingExtract.rating;

            if (!stockStatuses.length && !rating) {
                return empty;
            }

            const remainder = String(working || "").replace(/\s+/g, " ").trim();
            return {
                matched: true,
                reset: false,
                stockStatuses: Array.from(new Set(stockStatuses)),
                rating,
                remainder,
                exclusive: remainder === "",
            };
        },
    };