<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once TC_CAF_PATH . 'includes/admin/class-caf-builder-custom-fonts.php';
require_once TC_CAF_PATH . 'includes/builder/class-caf-builder-tier.php';
require_once TC_CAF_PATH . 'includes/admin/class-caf-builder-import-library.php';
add_action( 'wp_ajax_get_caf_builder_posts', 'get_caf_builder_posts' );
add_action( 'wp_ajax_nopriv_get_caf_builder_posts', 'get_caf_builder_posts' );
add_filter( 'posts_search', 'caf_builder_apply_keyword_source_search', 10, 2 );
function clean_query_args( $args ) {
	if ( isset( $args['meta_query'] ) && is_array( $args['meta_query'] ) ) {
		$meta_clause_count = 0;
		foreach ( $args['meta_query'] as $key => $value ) {
			if ( 'relation' === $key ) {
				continue;
			}
			if ( is_array( $value ) && ! empty( $value ) ) {
				++$meta_clause_count;
			}
		}
		if ( 0 === $meta_clause_count ) {
			unset( $args['meta_query'] );
		}
		// Keep meta_query['relation'] — WP_Query needs AND/OR when multiple clauses exist (AJAX + nested groups).
	}

	if ( isset( $args['tax_query'] ) && is_array( $args['tax_query'] ) ) {
		$tax_clause_count = 0;
		foreach ( $args['tax_query'] as $key => $value ) {
			if ( 'relation' === $key ) {
				continue;
			}
			if ( is_array( $value ) && ! empty( $value ) ) {
				++$tax_clause_count;
			}
		}
		if ( 0 === $tax_clause_count ) {
			unset( $args['tax_query'] );
		}
		// Keep tax_query['relation'] — required for OR/AND between modules and for nested tax groups from the frontend.
	}
	return $args;
}

/**
 * Validate and normalize query args for builder runtime safety.
 *
 * @param mixed $args Query args.
 * @return array
 */
function caf_builder_validate_query_args( $args ) {
	if ( ! is_array( $args ) ) {
		$args = array();
	}

	if ( isset( $args['posts_per_page'] ) ) {
		$ppp                  = (int) $args['posts_per_page'];
		$args['posts_per_page'] = ( -1 === $ppp ) ? -1 : max( 1, absint( $ppp ) );
	}

	if ( isset( $args['paged'] ) ) {
		$args['paged'] = max( 1, absint( $args['paged'] ) );
	}

	if ( isset( $args['order'] ) ) {
		$order         = strtoupper( sanitize_text_field( (string) $args['order'] ) );
		$args['order'] = in_array( $order, array( 'ASC', 'DESC' ), true ) ? $order : 'DESC';
	}

	if ( isset( $args['orderby'] ) && ! is_array( $args['orderby'] ) ) {
		$args['orderby'] = sanitize_key( (string) $args['orderby'] );
	}

	if ( isset( $args['tax_query'] ) && ! is_array( $args['tax_query'] ) ) {
		unset( $args['tax_query'] );
	}

	if ( isset( $args['meta_query'] ) && ! is_array( $args['meta_query'] ) ) {
		unset( $args['meta_query'] );
	}

	return $args;
}

/**
 * Meta keys Free public AJAX may honor in meta_query (null = no clamp / Pro).
 *
 * Free range slider uses Woo `_price` only. Arbitrary custom-field meta stays Pro.
 *
 * @return array<int, string>|null
 */
function caf_builder_tier_allowed_ajax_meta_keys() {
	if ( ! class_exists( 'CAF_Builder_Tier' ) || CAF_Builder_Tier::is_pro() ) {
		return null;
	}

	if (
		CAF_Builder_Tier::can_use_feature( 'filter_custom_field' )
		|| CAF_Builder_Tier::can_use_feature( 'range_slider_custom_fields' )
	) {
		return null;
	}

	$keys = array( '_price' );
	if ( class_exists( 'CAF_Free_Woo' ) ) {
		$keys = array( CAF_Free_Woo::WOO_PRICE_META_KEY );
	}

	/**
	 * Filter Free-allowed AJAX meta_query keys.
	 *
	 * @param array<int, string> $keys Allowed meta keys.
	 */
	$keys = apply_filters( 'caf_builder_free_ajax_allowed_meta_keys', $keys );

	return is_array( $keys ) ? array_values( array_filter( array_map( 'strval', $keys ) ) ) : array( '_price' );
}

/**
 * Whether a meta_query node is a leaf clause (has key/meta_key).
 *
 * @param array $node Meta query node.
 * @return bool
 */
function caf_builder_meta_query_node_is_clause( $node ) {
	return is_array( $node ) && ( isset( $node['key'] ) || isset( $node['meta_key'] ) );
}

/**
 * Drop meta_query clauses whose meta key is not allowlisted.
 *
 * @param mixed             $meta_query   Meta query tree.
 * @param array<int, string> $allowed_keys Allowed keys.
 * @return array
 */
function caf_builder_filter_meta_query_by_allowed_keys( $meta_query, array $allowed_keys ) {
	if ( ! is_array( $meta_query ) ) {
		return array();
	}

	$allowed_lookup = array_fill_keys( $allowed_keys, true );

	if ( caf_builder_meta_query_node_is_clause( $meta_query ) ) {
		$meta_key = isset( $meta_query['key'] )
			? (string) $meta_query['key']
			: (string) $meta_query['meta_key'];

		return isset( $allowed_lookup[ $meta_key ] ) ? $meta_query : array();
	}

	$out          = array();
	$clause_count = 0;

	foreach ( $meta_query as $key => $value ) {
		if ( 'relation' === $key || ! is_array( $value ) ) {
			continue;
		}

		if ( caf_builder_meta_query_node_is_clause( $value ) ) {
			$meta_key = isset( $value['key'] ) ? (string) $value['key'] : (string) $value['meta_key'];
			if ( isset( $allowed_lookup[ $meta_key ] ) ) {
				$out[] = $value;
				++$clause_count;
			}
			continue;
		}

		$nested = caf_builder_filter_meta_query_by_allowed_keys( $value, $allowed_keys );
		if ( empty( $nested ) ) {
			continue;
		}
		$out[] = $nested;
		++$clause_count;
	}

	if ( 0 === $clause_count ) {
		return array();
	}

	if ( $clause_count > 1 && isset( $meta_query['relation'] ) ) {
		$relation = strtoupper( trim( (string) $meta_query['relation'] ) );
		$out['relation'] = ( 'AND' === $relation ) ? 'AND' : 'OR';
	}

	return $out;
}

/**
 * Clamp public AJAX query args so Free cannot honor Pro-only meta/sort via crafted POST.
 *
 * Preserves Free filtering: tax_query, search, pagination, and `_price` range-slider meta.
 *
 * @param array       $args         Query args.
 * @param object|null $data_handler Layout data handler (unused; reserved for layout-aware clamps).
 * @return array
 */
function caf_builder_clamp_public_ajax_args_for_tier( $args, $data_handler = null ) {
	unset( $data_handler );

	if ( ! is_array( $args ) ) {
		return array();
	}

	if ( ! class_exists( 'CAF_Builder_Tier' ) || CAF_Builder_Tier::is_pro() ) {
		return $args;
	}

	$allowed_meta_keys = caf_builder_tier_allowed_ajax_meta_keys();
	if ( is_array( $allowed_meta_keys ) ) {
		if ( isset( $args['meta_query'] ) ) {
			$filtered = caf_builder_filter_meta_query_by_allowed_keys( $args['meta_query'], $allowed_meta_keys );
			if ( empty( $filtered ) ) {
				unset( $args['meta_query'] );
			} else {
				if (
					is_array( $filtered )
					&& isset( $filtered['relation'] )
					&& ! CAF_Builder_Tier::can_use_feature( 'meta_relation' )
				) {
					// Free wrapper always emits OR-equivalent; ignore crafted AND.
					$filtered['relation'] = 'OR';
				}
				$args['meta_query'] = $filtered;
			}
		}
	}

	// Sorting UI / misc sorting is Pro-only on Free — ignore client orderby overrides.
	if ( ! CAF_Builder_Tier::can_use_feature( 'sorting' ) ) {
		unset(
			$args['orderby'],
			$args['order'],
			$args['meta_key'],
			$args['meta_value'],
			$args['meta_compare'],
			$args['meta_type']
		);
	}

	if ( ! CAF_Builder_Tier::can_use_feature( 'search_custom_field' ) ) {
		unset( $args['caf_search_custom_field'] );
	}

	return $args;
}

/**
 * Lock security-sensitive WP_Query keys for public builder AJAX.
 *
 * Keeps tax_query / Free-allowed meta_query / search / paged intact so filtering still works.
 * Forces publish + layout post_type + layout posts_per_page (including -1 "show all").
 * Free tier: clamps meta keys + strips Pro-only client sort (see clamp helper).
 *
 * @param array       $args         Query args.
 * @param object|null $data_handler Layout data handler (CAF_Builder_Data or compatible).
 * @return array
 */
function caf_builder_harden_public_ajax_query_args( $args, $data_handler = null ) {
	if ( ! is_array( $args ) ) {
		$args = array();
	}

	$strip_keys = array(
		'author',
		'author_name',
		'author__in',
		'author__not_in',
		'perm',
		'has_password',
		'post_password',
	);
	foreach ( $strip_keys as $key ) {
		unset( $args[ $key ] );
	}

	$args['post_status'] = 'publish';

	if ( is_object( $data_handler ) && method_exists( $data_handler, 'get_post_type' ) ) {
		$layout_post_type = sanitize_key( (string) $data_handler->get_post_type() );
		if ( '' !== $layout_post_type ) {
			$args['post_type'] = $layout_post_type;
		}
	}

	$layout_ppp = null;
	if ( is_object( $data_handler ) && method_exists( $data_handler, 'get_misc_pagination' ) ) {
		$misc = $data_handler->get_misc_pagination();
		$raw  = ( is_object( $misc ) && isset( $misc->settings->posts_per_page ) )
			? $misc->settings->posts_per_page
			: -1;

		if ( class_exists( 'CAF_Builder_Query' ) && method_exists( 'CAF_Builder_Query', 'normalize_posts_per_page_setting' ) ) {
			$layout_ppp = CAF_Builder_Query::normalize_posts_per_page_setting( $raw );
		} else {
			$layout_ppp = (int) $raw;
			if ( -1 !== $layout_ppp && $layout_ppp < 1 ) {
				$layout_ppp = -1;
			}
		}
	}

	if ( null !== $layout_ppp ) {
		$args['posts_per_page'] = $layout_ppp;
	} elseif ( isset( $args['posts_per_page'] ) ) {
		$ppp                    = (int) $args['posts_per_page'];
		$args['posts_per_page'] = ( -1 === $ppp ) ? -1 : max( 1, absint( $ppp ) );
	}

	return caf_builder_clamp_public_ajax_args_for_tier( $args, $data_handler );
}

/**
 * Whether a layout post type can safely be queried on this site.
 *
 * @param string $post_type Post type slug.
 * @return bool
 */
function caf_builder_layout_post_type_is_queryable( $post_type ) {
	$post_type = sanitize_key( (string) $post_type );
	if ( '' === $post_type ) {
		return false;
	}

	return post_type_exists( $post_type );
}

/**
 * User-facing message when a layout CPT is not registered (e.g. WooCommerce off).
 *
 * @param string $post_type   Post type slug.
 * @param bool   $for_visitor Softer copy for public visitors.
 * @return string
 */
function caf_builder_missing_post_type_message( $post_type, $for_visitor = false ) {
	$post_type = sanitize_key( (string) $post_type );

	if ( $for_visitor ) {
		return __( 'This filter is temporarily unavailable.', 'category-ajax-filter' );
	}

	if ( 'product' === $post_type ) {
		return __( 'This layout uses Products, but WooCommerce is not active. Activate WooCommerce or change the layout post type in Plugin settings.', 'category-ajax-filter' );
	}

	if ( '' === $post_type ) {
		return __( 'This layout has no valid post type. Open Plugin settings and choose a post type.', 'category-ajax-filter' );
	}

	return sprintf(
		/* translators: %s: post type slug */
		__( 'This layout uses the post type "%s", which is not registered on this site. Activate the plugin that provides it, or change the layout post type in Plugin settings.', 'category-ajax-filter' ),
		$post_type
	);
}

/**
 * Append a disabled option for a saved CPT that is no longer registered.
 *
 * @param array  $results           Post type options.
 * @param string $current_post_type Saved layout post type.
 * @return array
 */
function caf_builder_append_unavailable_post_type_option( $results, $current_post_type ) {
	$current_post_type = sanitize_key( (string) $current_post_type );
	if ( '' === $current_post_type || '0' === $current_post_type ) {
		return $results;
	}

	if ( ! is_array( $results ) ) {
		$results = array();
	}

	foreach ( $results as $row ) {
		if ( is_array( $row ) && isset( $row['value'] ) && (string) $row['value'] === $current_post_type ) {
			return $results;
		}
	}

	if ( caf_builder_layout_post_type_is_queryable( $current_post_type ) ) {
		return $results;
	}

	if ( 'product' === $current_post_type ) {
		$label = __( 'Products (unavailable — activate WooCommerce)', 'category-ajax-filter' );
	} else {
		$label = sprintf(
			/* translators: %s: post type slug */
			__( '%s (unavailable)', 'category-ajax-filter' ),
			$current_post_type
		);
	}

	$results[] = array(
		'value'       => $current_post_type,
		'label'       => $label,
		'disabled'    => true,
		'unavailable' => true,
	);

	return $results;
}

/**
 * Restrict keyword search to selected source fields.
 *
 * @param string $keyword Raw keyword.
 * @return string
 */
function caf_builder_normalize_number_words_in_text( $keyword ) {
	$keyword = strtolower( (string) $keyword );
	$keyword = str_replace( '-', ' ', $keyword );
	$keyword = preg_replace( '/[^a-z0-9\s]/', ' ', $keyword );
	$keyword = preg_replace( '/\s+/', ' ', $keyword );
	$keyword = trim( (string) $keyword );

	if ( '' === $keyword ) {
		return '';
	}

	$tokens = array_values( array_filter( explode( ' ', $keyword ), 'strlen' ) );
	$output = array();
	$chunk  = array();

	$flush_chunk = static function () use ( &$chunk, &$output ) {
		if ( empty( $chunk ) ) {
			return;
		}
		$number_value = caf_builder_parse_number_word_tokens( $chunk );
		if ( null === $number_value ) {
			$output = array_merge( $output, $chunk );
		} else {
			$output[] = (string) $number_value;
		}
		$chunk = array();
	};

	foreach ( $tokens as $token ) {
		if ( caf_builder_is_number_word_token( $token ) ) {
			$chunk[] = $token;
			continue;
		}
		$flush_chunk();
		$output[] = $token;
	}

	$flush_chunk();

	return trim( implode( ' ', $output ) );
}

/**
 * Check whether token is a number-word token.
 *
 * @param string $token Token.
 * @return bool
 */
function caf_builder_is_number_word_token( $token ) {
	static $number_words = array(
		'zero'      => true,
		'one'       => true,
		'two'       => true,
		'three'     => true,
		'four'      => true,
		'five'      => true,
		'six'       => true,
		'seven'     => true,
		'eight'     => true,
		'nine'      => true,
		'ten'       => true,
		'eleven'    => true,
		'twelve'    => true,
		'thirteen'  => true,
		'fourteen'  => true,
		'fifteen'   => true,
		'sixteen'   => true,
		'seventeen' => true,
		'eighteen'  => true,
		'nineteen'  => true,
		'twenty'    => true,
		'thirty'    => true,
		'forty'     => true,
		'fifty'     => true,
		'sixty'     => true,
		'seventy'   => true,
		'eighty'    => true,
		'ninety'    => true,
		'hundred'   => true,
		'thousand'  => true,
		'lakh'      => true,
		'lakhs'     => true,
		'million'   => true,
		'crore'     => true,
		'crores'    => true,
		'billion'   => true,
		'and'       => true,
	);

	return isset( $number_words[ $token ] );
}

/**
 * Convert number-word token chunk to integer.
 *
 * @param array $tokens Tokens.
 * @return int|null
 */
function caf_builder_parse_number_word_tokens( $tokens ) {
	if ( ! is_array( $tokens ) || empty( $tokens ) ) {
		return null;
	}

	$values = array(
		'zero'      => 0,
		'one'       => 1,
		'two'       => 2,
		'three'     => 3,
		'four'      => 4,
		'five'      => 5,
		'six'       => 6,
		'seven'     => 7,
		'eight'     => 8,
		'nine'      => 9,
		'ten'       => 10,
		'eleven'    => 11,
		'twelve'    => 12,
		'thirteen'  => 13,
		'fourteen'  => 14,
		'fifteen'   => 15,
		'sixteen'   => 16,
		'seventeen' => 17,
		'eighteen'  => 18,
		'nineteen'  => 19,
		'twenty'    => 20,
		'thirty'    => 30,
		'forty'     => 40,
		'fifty'     => 50,
		'sixty'     => 60,
		'seventy'   => 70,
		'eighty'    => 80,
		'ninety'    => 90,
	);
	$scales = array(
		'thousand' => 1000,
		'lakh'     => 100000,
		'lakhs'    => 100000,
		'million'  => 1000000,
		'crore'    => 10000000,
		'crores'   => 10000000,
		'billion'  => 1000000000,
	);

	$total      = 0;
	$current    = 0;
	$has_number = false;

	foreach ( $tokens as $token ) {
		if ( 'and' === $token ) {
			continue;
		}

		if ( isset( $values[ $token ] ) ) {
			$current   += (int) $values[ $token ];
			$has_number = true;
			continue;
		}

		if ( 'hundred' === $token ) {
			$current    = max( 1, $current ) * 100;
			$has_number = true;
			continue;
		}

		if ( isset( $scales[ $token ] ) ) {
			$scale      = (int) $scales[ $token ];
			$current    = max( 1, $current );
			$total     += $current * $scale;
			$current    = 0;
			$has_number = true;
		}
	}

	if ( ! $has_number ) {
		return null;
	}

	return (int) ( $total + $current );
}

/**
 * Build keyword variants for numeric-intent search.
 *
 * @param string $keyword Raw keyword.
 * @return array
 */
function caf_builder_get_keyword_variants( $keyword ) {
	$variants = array();
	$keyword  = trim( (string) $keyword );
	if ( '' === $keyword ) {
		return $variants;
	}

	$variants[] = $keyword;
	$normalized = caf_builder_normalize_number_words_in_text( $keyword );
	if ( '' !== $normalized ) {
		$variants[] = $normalized;
	}

	return array_values( array_unique( array_filter( array_map( 'trim', $variants ), 'strlen' ) ) );
}

/**
 * Restrict keyword search to selected source fields.
 *
 * @param string   $search   Existing search SQL.
 * @param WP_Query $wp_query Current query.
 * @return string
 */
function caf_builder_apply_keyword_source_search( $search, $wp_query ) {
	if ( ! ( $wp_query instanceof WP_Query ) ) {
		return $search;
	}

	$keyword = trim( (string) $wp_query->get( 'caf_search_keyword' ) );
	if ( '' === $keyword ) {
		return $search;
	}

	$source = $wp_query->get( 'caf_search_source' );
	if ( ! is_array( $source ) ) {
		$source = array();
	}

	$everything   = isset( $source['everything'] ) && 'true' === (string) $source['everything'];
	$title        = isset( $source['title'] ) && 'true' === (string) $source['title'];
	$descriptions = isset( $source['descriptions'] ) && 'true' === (string) $source['descriptions'];
	$custom_field = isset( $source['custom_field'] ) && 'true' === (string) $source['custom_field'];

	// "Everything" should still use source-aware search logic.
	if ( $everything ) {
		$title        = true;
		$descriptions = true;
	}

	if ( ! $title && ! $descriptions && ! $custom_field ) {
		return $search;
	}

	global $wpdb;
	$keywords = caf_builder_get_keyword_variants( $keyword );
	if ( empty( $keywords ) ) {
		return $search;
	}
	$clauses = array();

	if ( $title ) {
		$title_clauses = array();
		foreach ( $keywords as $search_keyword ) {
			$like            = '%' . $wpdb->esc_like( $search_keyword ) . '%';
			$title_clauses[] = $wpdb->prepare( "{$wpdb->posts}.post_title LIKE %s", $like );
		}
		if ( ! empty( $title_clauses ) ) {
			$clauses[] = '( ' . implode( ' OR ', $title_clauses ) . ' )';
		}
	}
	if ( $descriptions ) {
		$description_clauses = array();
		foreach ( $keywords as $search_keyword ) {
			$like                  = '%' . $wpdb->esc_like( $search_keyword ) . '%';
			$description_clauses[] = $wpdb->prepare( "{$wpdb->posts}.post_content LIKE %s", $like );
		}
		if ( ! empty( $description_clauses ) ) {
			$clauses[] = '( ' . implode( ' OR ', $description_clauses ) . ' )';
		}
	}
	if ( $custom_field && ( ! class_exists( 'CAF_Builder_Tier' ) || CAF_Builder_Tier::can_use_feature( 'search_custom_field' ) ) ) {
		$custom_field_key = trim( (string) $wp_query->get( 'caf_search_custom_field' ) );
		if ( '' !== $custom_field_key && '0' !== $custom_field_key ) {
			$meta_clauses = array();
			foreach ( $keywords as $search_keyword ) {
				$like           = '%' . $wpdb->esc_like( $search_keyword ) . '%';
				$meta_clauses[] = $wpdb->prepare(
					"EXISTS (
						SELECT 1
						FROM {$wpdb->postmeta} caf_meta
						WHERE caf_meta.post_id = {$wpdb->posts}.ID
						  AND caf_meta.meta_key = %s
						  AND caf_meta.meta_value LIKE %s
					)",
					$custom_field_key,
					$like
				);
			}
			if ( ! empty( $meta_clauses ) ) {
				$clauses[] = '( ' . implode( ' OR ', $meta_clauses ) . ' )';
			}
		}
	}

	if ( empty( $clauses ) ) {
		return $search;
	}

	$search_sql = ' AND (' . implode( ' OR ', $clauses ) . ')';
	if ( ! is_user_logged_in() ) {
		$search_sql .= " AND ({$wpdb->posts}.post_password = '')";
	}
 
	return $search_sql;
}
function get_caf_builder_posts() {
	if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'tc_caf_ajax_nonce' ) ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'Security check failed.', 'category-ajax-filter' ),
			)
		);
	}
	$args             = isset( $_POST['params'] ) && is_array( $_POST['params'] ) ? wp_unslash( $_POST['params'] ) : array(); // phpcs:ignore WordPress.Security.NonceVerification.Missing
	$shortindex       = isset( $_POST['caf_index'] ) ? absint( $_POST['caf_index'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Missing
	$selected_filters = isset( $_POST['selected_filters'] ) && is_array( $_POST['selected_filters'] ) ? wp_unslash( $_POST['selected_filters'] ) : array();
	$response_mode    = isset( $_POST['response_mode'] ) ? sanitize_key( wp_unslash( $_POST['response_mode'] ) ) : 'posts'; // phpcs:ignore WordPress.Security.NonceVerification.Missing
	$client_css_hash  = isset( $_POST['dynamic_css_hash'] ) ? sanitize_text_field( wp_unslash( $_POST['dynamic_css_hash'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing
	if ( empty( $args ) ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'Invalid request.', 'category-ajax-filter' ),
			)
		);
	}
	load_builder_ajax_dependencies();
	$layout_bundle = CAF_Builder_Ajax_Performance::get_layout_bundle( $shortindex );
	if ( empty( $layout_bundle ) ) {
		wp_send_json_error(
			array(
				'message' => esc_html__( 'Layout does not exist or is not published.', 'category-ajax-filter' ),
			)
		);
	}
	$builder_data = $layout_bundle['builder_data'];
	$args         = clean_query_args( $args );
	$data_handler = new CAF_Builder_Data( $builder_data, $shortindex );
	$layout_post_type = $data_handler->get_post_type();
	if ( ! caf_builder_layout_post_type_is_queryable( $layout_post_type ) ) {
		wp_send_json_error(
			array(
				'message'   => caf_builder_missing_post_type_message( $layout_post_type ),
				'code'      => 'missing_post_type',
				'post_type' => $layout_post_type,
			)
		);
	}
	$args         = $data_handler->strip_placeholder_sort_from_query_args( $args );
	$args         = $data_handler->apply_default_sort_to_query_args( $args );
	$args         = caf_builder_apply_filters(
		'caf_builder_ajax_query_args',
		$args,
		array(
			'builder_index'    => $shortindex,
			'is_ajax'          => true,
			'selected_filters' => $selected_filters,
			'response_mode'    => $response_mode,
		)
	);
	$args = caf_builder_validate_query_args( $args );
	$args = caf_builder_harden_public_ajax_query_args( $args, $data_handler );
	if ( ! CAF_Builder_Ajax_Performance::query_needs_found_rows( $data_handler ) ) {
		$args['no_found_rows'] = true;
	}
	$query             = new WP_Query( $args );
	$css_builder       = new CAF_Builder_Css();
	$style_generator   = new CAF_Builder_Style_Generator();
	$query_builder     = new CAF_Builder_Query( $data_handler );
	$query_builder->set_query_args( $args );
	$post_renderer     = new CAF_Builder_Post_Renderer(
		$data_handler,
		$css_builder,
		$query,
		$style_generator
	);
	$builder_renderer  = new CAF_Builder_Renderer(
		$data_handler,
		$query_builder,
		$css_builder,
		$style_generator
	);
	$post_count_per_page = isset( $args['posts_per_page'] ) ? absint( $args['posts_per_page'] ) : 10;
	$current_page        = isset( $args['paged'] ) ? absint( $args['paged'] ) : 1;
	$found_posts           = (int) $query->found_posts;
	$response_mode         = CAF_Builder_Ajax_Performance::normalize_response_mode( $response_mode );
	$skip_css_collection   = ( 'posts' === $response_mode );

	if ( $skip_css_collection ) {
		$css_builder->disable_collection();
	}

	$zones = ( 'full' === $response_mode )
		? $builder_renderer->get_ajax_misc_zones(
			$query,
			$post_count_per_page,
			$current_page,
			$found_posts,
			$selected_filters
		)
		: $builder_renderer->get_ajax_posts_zones(
			$query,
			$post_count_per_page,
			$current_page,
			$found_posts,
			$selected_filters
		);
	if ( $skip_css_collection ) {
		$css_payload      = CAF_Builder_Ajax_Performance::resolve_ajax_css_payload( $shortindex, $client_css_hash );
		$dynamic_css      = $css_payload['css'];
		$dynamic_css_hash = $css_payload['hash'];
	} else {
		$dynamic_css      = $css_builder->get_unique_css();
		$dynamic_css_hash = CAF_Builder_Ajax_Performance::get_dynamic_css_hash( $dynamic_css );
		CAF_Builder_Ajax_Performance::set_layout_css_snapshot( $shortindex, $dynamic_css );
	}

	$response = array(
		'posts_data'       => $post_renderer->render(),
		'dynamic_css_hash' => $dynamic_css_hash,
		'found_posts'      => $found_posts,
		'response_mode'    => $response_mode,
		'message'          => esc_html__( 'Data fetched successfully.', 'category-ajax-filter' ),
	) + $zones;

	if ( '' !== $dynamic_css && ( $skip_css_collection || '' === $client_css_hash || $client_css_hash !== $dynamic_css_hash ) ) {
		$response['dynamic_css'] = $dynamic_css;
	}
	$response = caf_builder_apply_filters(
		'caf_builder_ajax_response',
		$response,
		array(
			'builder_index'    => $shortindex,
			'is_ajax'          => true,
			'selected_filters' => $selected_filters,
			'query_args'       => $args,
			'found_posts'      => $found_posts,
			'response_mode'    => $response_mode,
			'dynamic_css_hash' => $dynamic_css_hash,
		),
		$query
	);

	wp_send_json_success( $response );
}
/**
 * Load builder AJAX dependencies.
 *
 * @return void
 */
function load_builder_ajax_dependencies() {
	$base = TC_CAF_PATH . 'includes/frontend/';
	require_once $base . 'class-caf-builder-ajax-performance.php';
	require_once $base . 'class-caf-builder-data.php';
	require_once $base . 'class-caf-builder-css.php';
	require_once $base . 'class-caf-builder-style-generator.php';
	require_once $base . 'class-caf-builder-query.php';
	require_once $base . 'caf-builder-uploaded-icon.php';
	require_once $base . 'modules/filters/class-caf-filter-base-module.php';
	require_once $base . 'modules/filters/class-caf-filter-search-module.php';
	require_once $base . 'modules/filters/class-caf-filter-reset-module.php';
	require_once $base . 'modules/filters/class-caf-filter-custom-text-module.php';
	require_once $base . 'modules/filters/class-caf-filter-checkbox-module.php';
	require_once $base . 'modules/filters/class-caf-filter-dropdown-module.php';
	if ( file_exists( $base . 'modules/filters/class-caf-filter-range-slider-module.php' ) ) {
		require_once $base . 'modules/filters/class-caf-filter-range-slider-module.php';
	}
	require_once $base . 'modules/filters/class-caf-filter-module-factory.php';
	require_once $base . 'renderers/class-caf-builder-filter-renderer.php';
	require_once $base . 'renderers/class-caf-builder-post-renderer.php';
	require_once $base . 'renderers/class-caf-builder-pagination-renderer.php';
	require_once $base . 'renderers/class-caf-builder-misc-renderer.php';
	require_once $base . 'class-caf-builder-framework.php';
	require_once $base . 'class-caf-builder-renderer.php';
}
/* Start Filter Layout Api Functions*/
add_action( 'rest_api_init', 'caf_post_filter_init_fun' );
function caf_post_filter_init_fun() {
	register_rest_route(
		'caf-custom-builder/v1',
		'/add-filter-options/',
		array(
			'methods'             => 'GET',
			'callback'            => 'caf_add_rest_option_filter',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/filter-layouts/',
		array(
			'methods'             => 'GET',
			'callback'            => 'caf_get_filter_layouts',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/delete-filter-options/',
		array(
			'methods'             => 'GET',
			'callback'            => 'caf_delete_filter_rest_option',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/get-taxonomy/',
		array(
			'methods'             => 'GET',
			'callback'            => 'caf_get_taxonomy',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/save-filter-layout/',
		array(
			'methods'             => 'POST',
			'callback'            => 'caf_save_filter_rest_option',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/get-filter-options/',
		array(
			'methods'             => 'GET',
			'callback'            => 'caf_get_filter_option',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/rename-filter-layout-label/',
		array(
			'methods'             => 'POST',
			'callback'            => 'caf_rename_rest_filter_layout',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/verify-taxonomy-terms/',
		array(
			'methods'             => 'GET',
			'callback'            => 'caf_verify_taxonomy_terms',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/get-customfields/',
		array(
			'methods'             => 'GET',
			'callback'            => 'caf_get_custom_fields',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
}

function caf_get_custom_fields( $data ) {
	if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_use_feature( 'filter_custom_field' ) ) {
		return array(
				'status'        => 'success',
				'custom_fields' => array(),
			);
	}

	$post_type = $data['post-type'];
	$query     = new WP_Query(
		array(
			'post_type'     => $post_type,
			'post_status'   => 'publish',
			'post_per_page' => -1,
		)
	);
	$results   = array();
	while ( $query->have_posts() ) {
		global $post;
		$query->the_post();
		$post_id     = get_the_ID();
		$meta_fields = get_post_custom( $post_id );
		$meta_fields = caf_filter_builder_meta_fields( $meta_fields );
		if ( $meta_fields ) {
			foreach ( $meta_fields as $custom_field => $csVal ) {
				$fieldObj  = get_field_object( $custom_field );
				$results[] = array(
					'key'  => $custom_field,
					'data' => $fieldObj,
				);
			}
		}

		break;
	}
	wp_reset_postdata();
	return array(
			'status'        => 'success',
			'custom_fields' => $results,
		);
}

function caf_verify_taxonomy_terms( $data ) {
	$taxonomy     = json_decode( $data['taxonomy'] );
	$taxonomyData = array();
	foreach ( $taxonomy as $key => $value ) {
		$terms     = get_terms(
			array(
				'taxonomy'   => $value,
				'hide_empty' => false,
			)
		);
		$terms_ids = array();
		if ( $terms ) {
			foreach ( $terms as $term ) {
				array_push( $terms_ids, $term->term_id );
			}
			$taxonomyData[ $value ] = $terms_ids;
		} else {
			$taxonomyData[ $value ] = array();
		}
	}
	return array(
			'status'        => 'success',
			'taxonomy_data' => $taxonomyData,
		);
}
function caf_rename_rest_filter_layout( $data ) {
	$index     = $data['index'];
	$new_label = $data['title'];
	$options   = get_option( 'caf_custom_post_filter_layout' );
	if ( $options[ $index ] ) {
		$options[ $index ]['label'] = $new_label;
		update_option( 'caf_custom_post_filter_layout', $options );
		$updated_option = get_option( 'caf_custom_post_filter_layout' );
		return array(
				'status' => 'success',
				'title'  => $updated_option[ $index ],
			);
	}
}
function caf_get_filter_option( $data ) {
	$filter_layouts = get_option( 'caf_custom_post_filter_layout' );
	$index          = $data['builder_index'];
	$title          = $filter_layouts[ $index ]['key'];
	$filter_opt     = 'caf_fl_' . $title . '_' . $index;
	if ( get_option( $filter_opt ) ) {
		return array(
				'status'      => 'success',
				'filter_data' => get_option( $filter_opt ),
			);
	} else {
		return array(
				'status'      => 'success',
				'filter_data' => null,
			);
	}
}
function caf_save_filter_rest_option( $data ) {
	$data_layouts = json_decode( $data['json_data'] );
	$extra_data   = json_decode( $data['extraData'] );
	$alldata      = array(
		'filter_layout' => $data_layouts,
		'extra_data'    => $extra_data,
	);
	$opt          = 'caf_custom_post_filter_layout';
	$index        = $data['index'];
	$layouts      = get_option( $opt );
	$title        = $layouts[ $index ]['key'];
	$filter_opt   = 'caf_fl_' . $title . '_' . $index;
	if ( get_option( $filter_opt ) ) {
		update_option( $filter_opt, $alldata );
	} else {
		update_option( $filter_opt, $alldata );
	}
	return array(
			'status'      => 'success',
			'filter_data' => get_option( $filter_opt ),
		);
}

function StyledTermData( $out, $taxo ) {

	$dom = new DOMDocument();
	$dom->loadHTML( $out );

	$xpath = new DOMXPath( $dom );

	// Select all <li> elements
	$liElements = $xpath->query( '//li' );

	foreach ( $liElements as $li ) {
		// Get the text content of the <a> tag
		$termName = $xpath->query( './/a', $li )->item( 0 )->nodeValue;
		if ( $termName == 'undefined' || $termName == '' ) {
			return '0';
		}
		$classValue   = $li->getAttribute( 'class' );
		$numericValue = intval( preg_replace( '/[^0-9]/', '', $classValue ) );

		// Get the count from the "(0)" span
		$count = $xpath->query( './/span', $li )->item( 0 )->nodeValue;

		// Create the new div element
		$newDiv = $dom->createElement( 'div' );
		$newDiv->setAttribute( 'class', 'trusty-manage-bar-sec-label' );

		// Create the label element
		$label = $dom->createElement( 'label' );
		$label->setAttribute( 'for', 'category-list-id' . $numericValue );

		// Create the input element
		$input = $dom->createElement( 'input' );
		$input->setAttribute( 'class', 'category-list check' );
		$input->setAttribute( 'type', 'checkbox' );
		$input->setAttribute( 'term-name', $termName );
		$input->setAttribute( 'name', $taxo . '[]' );
		$input->setAttribute( 'value', $taxo . '___' . $numericValue );
		$input->setAttribute( 'id', 'category-list-id' . $numericValue );

		// Append elements
		$label->appendChild( $input );
		$label->appendChild( $dom->createTextNode( $termName . ' ' . $count ) );
		$newDiv->appendChild( $label );

		// Create the font-awesome icon
		$icon = $dom->createElement( 'i' );
		$icon->setAttribute( 'class', 'fa fa-cog caf-term-setting' );
		$icon->setAttribute( 'aria-hidden', 'true' );
		$li->setAttribute( 'count', $count );
		// Append the icon to the div
		$newDiv->appendChild( $icon );
		$li->setAttribute( 'term-id', $numericValue );
		$ulElements = $xpath->query( './/ul', $li );
		if ( $ulElements->length > 0 ) {
			$li->setAttribute( 'class', $li->getAttribute( 'class' ) . ' tc-caf-has-child' );
			if ( strpos( $li->getAttribute( 'class' ), 'tc-caf-has-child' ) !== false ) {
				// Append the iconPlus element
				$iconPlus = $dom->createElement( 'i' );
				$iconPlus->setAttribute( 'class', 'fa fa-plus caf-plus' );
				$iconPlus->setAttribute( 'aria-hidden', 'true' );
				$newDiv->appendChild( $iconPlus );
			}
		}

		// Replace the original <li> content with the new div
		// $li->nodeValue = '';
		// $li->appendChild($newDiv);
		// $li->insertBefore($newDiv,$xpath->query('.//a', $li));
		$li->insertBefore( $newDiv, $li->getElementsByTagName( 'a' )->item( 0 ) );
	}

	// Output the modified HTML
	// echo $dom->saveHTML();
	$res = $dom->saveHTML();

	$stripped_html = strip_tags( $res, '<li><input><a><ul><div><label><i><span>' );
	return $stripped_html;
}
function caf_get_taxonomy( $data ) {
	$post_type      = $data['post-type'];
	$taxonomy_names = get_object_taxonomies( $post_type );
	$taxoData       = array();
	foreach ( $taxonomy_names as $taxo ) {
		$data1  = '';
		$data1 .= "<ul class='each-tax-data $taxo' data-name='$taxo'>";
		$data1 .= "<div class='caf-term-title-main'>";
		$data1 .= "<h2 style='display:inline-block;width:100%;font-weight: 600;text-transform: capitalize;padding: 0;margin: 0;font-size:22px'>" . $taxo . "</h2>
        <div class='caf-terms-cat-btn'>
            <a class='select-all-btn' href='' style='color:rgb(0, 0, 0); text-decoration: none;'>Select All</a>
            <div class='caf-btn-bdr'>|</div>
            <a class='deselect-btn' href='' style='color:rgb(0, 0, 0); text-decoration: none;'>Select None</a>
        </div>
        </div>
        <hr style='margin-top:0'>";
		$data1 .= '<div class="trusty-separate-bars"><div class="trusty-separate-bar tr-name">Name</div><div class="trusty-separate-bar tr-sett">Setting</div><div class="trusty-separate-bar tr-icon">Icon</div><div class="trusty-separate-bar tr-parent">Parent Dropdown <i class="fa fa-info-circle" aria-hidden="true"></i><span>This feature will only work if you use parent child category filter layout.</span></div></div>';
		$out    = wp_list_categories(
			array(
				'echo'               => '0',
				'show_count'         => true,
				'use_desc_for_title' => false,
				'hide_empty'         => false,
				'taxonomy'           => $taxo,
				'order'              => 'ASC',
				'orderby'            => 'name',
				'title_li'           => '',
				'style'              => 'list',
			)
		);
		$res    = StyledTermData( $out, $taxo );
		if ( $res != '0' ) {
			$data1 .= $res;
		} else {
			$data1 .= $out;
		}
		$data1 .= '</ul>';

		$taxoData[] = array(
			'key'       => $taxo,
			'label'     => $taxo,
			'term_data' => $data1,
			'post_type' => $post_type,
		);
	}

	$response = array(
		'status'        => 'success',
		'taxonomy_list' => $taxoData,
	);
	return $response;
}


function caf_add_rest_option_filter( $data ) {
	$opt   = 'caf_custom_post_filter_layout';
	$title = $data['title'];
	$key   = $data['title'];
	$key   = strtolower( str_replace( ' ', '', $key ) );
	if ( get_option( $opt ) ) {
		$custom_layouts   = get_option( $opt );
		$custom_layouts[] = array(
			'key'   => $key,
			'label' => $title,
		);
		update_option( $opt, $custom_layouts );
	} else {
		$custom_layouts[] = array(
			'key'   => $key,
			'label' => $title,
		);
		update_option( $opt, $custom_layouts );
	}
	return array(
			'status'         => 'success',
			'filter_layouts' => get_option( $opt ),
		);
}
function caf_get_filter_layouts( $data ) {
	$layouts = array();
	if ( get_option( 'caf_custom_post_filter_layout' ) ) {
		$layouts      = get_option( 'caf_custom_post_filter_layout' );
		$filter_saved = array();
		foreach ( $layouts as $key => $filter ) {
			$title = $filter['key'];
			$title = 'caf_fl_' . $title . '_' . $key;
			if ( get_option( $title ) ) {
				$filter_saved[ $key ] = true;
			} else {
				$filter_saved[ $key ] = false;
			}
		}
	}
	return array(
			'status'         => 'success',
			'filter_layouts' => $layouts,
			'filter_saved'   => $filter_saved,
		);
}

function caf_delete_filter_rest_option( $data ) {
	$index   = $data['index'];
	$options = get_option( 'caf_custom_post_filter_layout' );
	if ( $options[ $index ] ) {
		$layout = $options[ $index ]['key'];
		$title  = 'caf_fl_' . $layout . '_' . $index;
		unset( $options[ $index ] );
		delete_option( $title );
		update_option( 'caf_custom_post_filter_layout', $options );
		return array(
				'status'         => 'success',
				'filter_layouts' => get_option( 'caf_custom_post_filter_layout' ),
			);
	}
}


/* Start New Look Builder Layout Api Functions*/

add_action( 'rest_api_init', 'caf_builder_layout_init_fun' );

function caf_builder_layout_init_fun() {
	register_rest_route(
		'caf-custom-builder/v1',
		'/get-layouts-list/',
		array(
			'methods'             => 'GET',
			'callback'            => 'caf_get_layouts_list',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/get-post-types/',
		array(
			'methods'             => 'GET',
			'callback'            => 'caf_get_post_types_list',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	if ( class_exists( 'CAF_Builder_Tier' ) && CAF_Builder_Tier::can_use_feature( 'custom_fonts' ) && class_exists( 'CAF_Builder_Custom_Fonts' ) ) {
		register_rest_route(
			'caf-custom-builder/v1',
			'/custom-fonts/',
			array(
				'methods'             => 'GET',
				'callback'            => array( 'CAF_Builder_Custom_Fonts', 'rest_list_fonts' ),
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			)
		);
		register_rest_route(
			'caf-custom-builder/v1',
			'/custom-fonts/',
			array(
				'methods'             => 'POST',
				'callback'            => array( 'CAF_Builder_Custom_Fonts', 'rest_upload_font' ),
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
				'args'                => array(
					'family' => array(
						'required'          => false,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					),
				),
			)
		);
		register_rest_route(
			'caf-custom-builder/v1',
			'/custom-fonts/(?P<slug>[a-z0-9\-]+)',
			array(
				'methods'             => 'DELETE',
				'callback'            => array( 'CAF_Builder_Custom_Fonts', 'rest_delete_font' ),
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
				'args'                => array(
					'slug' => array(
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);
	}
	register_rest_route(
		'caf-custom-builder/v1',
		'/delete-layout/',
		array(
			'methods'             => 'POST',
			'callback'            => 'caf_delete_layout_permissions',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/clone-layout/',
		array(
			'methods'             => 'POST',
			'callback'            => 'caf_clone_layout',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/export-default-layout/',
		array(
			'methods'             => 'POST',
			'callback'            => 'caf_export_default_layout',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/export-builder-layout/',
		array(
			'methods'             => 'POST',
			'callback'            => 'caf_export_builder_layout',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/clone-builder-layout/',
		array(
			'methods'             => 'GET',
			'callback'            => 'caf_clone_builder_layout',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/restore-layout/',
		array(
			'methods'             => 'POST',
			'callback'            => 'caf_restore_layout',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/delete-layout-permanent/',
		array(
			'methods'             => 'POST',
			'callback'            => 'caf_delete_layout_permanent',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/save-builder-layout/',
		array(
			'methods'             => 'POST',
			'callback'            => 'caf_save_builder_layout_option',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/delete-builder-layout/',
		array(
			'methods'             => 'GET',
			'callback'            => 'caf_delete_builder_layout',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/delete-builder-layout-permanent/',
		array(
			'methods'             => 'GET',
			'callback'            => 'caf_delete_builder_layout_permanent',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/restore-builder-layout/',
		array(
			'methods'             => 'GET',
			'callback'            => 'caf_restore_builder_layout',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/get-posts-list/',
		array(
			'methods'             => 'GET',
			'callback'            => 'caf_get_posts_list',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
			'args'                => array(
				'post_type' => array(
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_key',
				),
			),
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/get-layout-data/',
		array(
			'methods'             => 'POST',
			'callback'            => 'caf_get_layout_data',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/move-to-trash/',
		array(
			'methods'             => 'POST',
			'callback'            => 'caf_move_to_trash',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/bulk-layouts-restore/',
		array(
			'methods'             => 'POST',
			'callback'            => 'caf_bulk_layouts_restore',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/bulk-layouts-delete-permanent/',
		array(
			'methods'             => 'POST',
			'callback'            => 'caf_bulk_layouts_delete_permanent',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/rename-builder-layout-label/',
		array(
			'methods'             => 'POST',
			'callback'            => 'caf_rename_builder_layout_label',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/update-builder-layout/',
		array(
			'methods'             => 'POST',
			'callback'            => 'caf_update_builder_layout_option',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/get-preview-posts/',
		array(
			'methods'             => array( 'GET', 'POST' ),
			'callback'            => 'caf_get_preview_posts',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/get-trash-layouts-list/',
		array(
			'methods'             => 'GET',
			'callback'            => 'caf_get_trash_layouts_list',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/get-content-length/',
		array(
			'methods'             => 'POST',
			'callback'            => 'caf_get_content_length',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/get-date/',
		array(
			'methods'             => 'GET',
			'callback'            => 'caf_get_date',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/get-taxo-data-with-recursive-method',
		array(
			'methods'             => 'GET',
			'callback'            => 'caf_get_taxo_data_with_recursive_method',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/get-cf-field-value/',
		array(
			'methods'             => 'POST',
			'callback'            => 'caf_get_cf_field_value',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
	register_rest_route(
		'caf-custom-builder/v1',
		'/get-cf-list/',
		array(
			'methods'             => 'POST',
			'callback'            => 'caf_get_cf_field_list',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
}
function caf_get_cf_field_list( $request ) {
	$post_type = sanitize_key( (string) $request->get_param( 'post_type' ) );

	if ( '' === $post_type ) {
		return array( 'success' => false, 'data' => 'post_type is required' );
	}

	$meta_keys = caf_get_builder_custom_field_keys_for_post_type( $post_type );

	return array( 'success' => true, 'data' => array(
			'meta_keys' => array_values( $meta_keys ),
		) );
}

/**
 * Collect ACF field names from a fields array (including sub fields).
 *
 * @param array $fields Field definitions.
 * @param array $names  Collected names (by reference).
 * @return void
 */
function caf_collect_acf_field_names( $fields, &$names ) {
	if ( ! is_array( $fields ) ) {
		return;
	}

	foreach ( $fields as $field ) {
		if ( empty( $field['name'] ) ) {
			continue;
		}

		$type = isset( $field['type'] ) ? (string) $field['type'] : '';

		if ( in_array( $type, array( 'tab', 'accordion', 'message' ), true ) ) {
			if ( ! empty( $field['sub_fields'] ) ) {
				caf_collect_acf_field_names( $field['sub_fields'], $names );
			}
			continue;
		}

		if ( in_array( $type, array( 'group', 'repeater', 'flexible_content', 'clone' ), true ) ) {
			if ( ! empty( $field['sub_fields'] ) ) {
				caf_collect_acf_field_names( $field['sub_fields'], $names );
			}
			continue;
		}

		$names[] = (string) $field['name'];

		if ( ! empty( $field['sub_fields'] ) ) {
			caf_collect_acf_field_names( $field['sub_fields'], $names );
		}
	}
}

/**
 * Get ACF field names assigned to a post type.
 *
 * @param string $post_type Post type slug.
 * @return array
 */
function caf_get_acf_field_keys_for_post_type( $post_type ) {
	if ( ! function_exists( 'acf_get_field_groups' ) || ! function_exists( 'acf_get_fields' ) ) {
		return array();
	}

	$field_keys = array();
	$groups     = acf_get_field_groups(
		array(
			'post_type' => $post_type,
		)
	);

	if ( ! is_array( $groups ) ) {
		return array();
	}

	foreach ( $groups as $group ) {
		if ( empty( $group['key'] ) ) {
			continue;
		}

		$fields = acf_get_fields( $group['key'] );
		caf_collect_acf_field_names( $fields, $field_keys );
	}

	return array_values( array_unique( $field_keys ) );
}

/**
 * Get custom field keys allowed in builder dropdowns for a post type.
 *
 * Prefers ACF field groups for the post type. Falls back to distinct post meta keys
 * for that post type when ACF is unavailable or has no matching groups.
 *
 * @param string $post_type Post type slug.
 * @return array
 */
function caf_get_builder_custom_field_keys_for_post_type( $post_type ) {
	$post_type = sanitize_key( (string) $post_type );

	if ( '' === $post_type ) {
		return array();
	}

	$acf_keys = caf_get_acf_field_keys_for_post_type( $post_type );

	if ( ! empty( $acf_keys ) ) {
		$keys = caf_filter_builder_meta_keys( $acf_keys );
	} else {
		global $wpdb;

		$meta_keys = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT DISTINCT pm.meta_key
				FROM {$wpdb->postmeta} pm
				INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
				WHERE p.post_type = %s
				AND p.post_status IN ('publish', 'draft', 'pending', 'private')
				AND pm.meta_key NOT LIKE %s",
				$post_type,
				$wpdb->esc_like( '_' ) . '%'
			)
		);

		$keys = caf_filter_builder_meta_keys( is_array( $meta_keys ) ? $meta_keys : array() );
	}

	if ( 'product' === $post_type && class_exists( 'CAF_Free_Woo' ) ) {
		$keys = array_values(
			array_unique(
				array_merge( $keys, CAF_Free_Woo::get_range_slider_meta_keys() )
			)
		);
	}

	return $keys;
}

/**
 * Build meta_fields payload for builder preview using post-type field allowlist.
 *
 * @param int    $post_id   Post ID.
 * @param string $post_type Post type slug.
 * @return array
 */
function caf_build_post_meta_fields_for_builder( $post_id, $post_type ) {
	$allowed_keys = caf_get_builder_custom_field_keys_for_post_type( $post_type );
	$post_meta    = caf_filter_builder_meta_fields( get_post_custom( $post_id ) );
	$meta_fields  = array();

	foreach ( $allowed_keys as $key ) {
		$meta_fields[ $key ] = isset( $post_meta[ $key ] ) ? $post_meta[ $key ] : array( '' );
	}

	return $meta_fields;
}

/**
 * Determine whether a custom-field meta key should be hidden in builder dropdowns.
 *
 * @param string $meta_key Meta key.
 * @return bool
 */
function caf_is_excluded_builder_meta_key( $meta_key ) {
	$meta_key = (string) $meta_key;
	if ( '' === $meta_key ) {
		return true;
	}

	if ( class_exists( 'CAF_Free_Woo' ) && CAF_Free_Woo::is_allowed_builder_meta_key( $meta_key ) ) {
		return false;
	}

	$meta_key_lc = strtolower( $meta_key );
	$exact_keys  = caf_builder_apply_filters(
		'caf_pro_builder_excluded_meta_keys',
		array(
			'_edit_lock',
			'_edit_last',
			'_wp_old_slug',
		)
	);
	$prefixes    = caf_builder_apply_filters(
		'caf_pro_builder_excluded_meta_key_prefixes',
		array(
			'_',
			'wpseo_',
			'_wpseo_',
			'yoast_',
			'_yoast_',
			'rank_math_',
			'_rank_math_',
			'aioseo_',
			'_aioseo_',
			'seopress_',
			'_seopress_',
			'_elementor_',
			'elementor_',
			'shipping_',
			'billing_',
			'wc_',
			'_wc_',
		)
	);
	foreach ( $exact_keys as $exact_key ) {
		if ( $meta_key_lc === strtolower( (string) $exact_key ) ) {
			return true;
		}
	}
	foreach ( $prefixes as $prefix ) {
		$prefix = strtolower( (string) $prefix );
		if ( '' !== $prefix && 0 === strpos( $meta_key_lc, $prefix ) ) {
			return true;
		}
	}
	return false;
}

/**
 * Filter associative post meta array by key.
 *
 * @param array $meta_fields Post meta fields (key => value[]).
 * @return array
 */
function caf_filter_builder_meta_fields( $meta_fields ) {
	if ( ! is_array( $meta_fields ) ) {
		return array();
	}
	$filtered_fields = array();
	foreach ( $meta_fields as $key => $value ) {
		if ( caf_is_excluded_builder_meta_key( $key ) ) {
			continue;
		}
		$filtered_fields[ $key ] = $value;
	}
	return $filtered_fields;
}

/**
 * Filter flat meta key list.
 *
 * @param array $meta_keys Meta key list.
 * @return array
 */
function caf_filter_builder_meta_keys( $meta_keys ) {
	if ( ! is_array( $meta_keys ) ) {
		return array();
	}
	$filtered_keys = array();
	foreach ( $meta_keys as $meta_key ) {
		if ( caf_is_excluded_builder_meta_key( $meta_key ) ) {
			continue;
		}
		$filtered_keys[] = $meta_key;
	}
	return $filtered_keys;
}

function caf_get_cf_field_value( $request ) {
	$post_id    = $request->get_param( 'post_id' );
	$field_name = $request->get_param( 'field_name' );

	// -------------------------
	// HELPER: Get all image sizes
	// -------------------------
	function get_custom_image_sizes( $attachment_id ) {

		// Only these sizes are required
		$required_sizes = array( 'thumbnail', 'medium', 'medium_large', 'large' );

		$sizes = array();

		foreach ( $required_sizes as $size ) {
			$img = wp_get_attachment_image_src( $attachment_id, $size );

			$sizes[ $size ] = $img ? esc_url( $img[0] ) : '';
		}

		return $sizes;
	}

	// -------------------------
	// 1️⃣ TRY ACF FIELD FIRST
	// -------------------------
	$acf_field = false;

	if ( function_exists( 'get_field_object' ) ) {
		$acf_field = get_field_object( $field_name, $post_id );
	}

	if ( $acf_field ) {

		$type  = $acf_field['type'];
		$value = $acf_field['value'];

		// IMAGE FIELD (ACF)
		if ( $type === 'image' ) {

				$image_id = 0;

				// CASE 1: Return format = URL
			if ( is_string( $value ) && filter_var( $value, FILTER_VALIDATE_URL ) ) {
				$image_id = attachment_url_to_postid( $value );
			}

				// CASE 2: Return format = ID
			elseif ( is_numeric( $value ) ) {
				$image_id = $value;
			}

				// CASE 3: Return format = Array
			elseif ( is_array( $value ) && isset( $value['ID'] ) ) {
				$image_id = $value['ID'];
			}

			if ( ! $image_id ) {
				return array( 'success' => false, 'data' => 'Image ID not found' );
			}

				// Get main image URL
				$image_url = wp_get_attachment_url( $image_id );

				// CALL YOUR FUNCTION here 👍
				$sizes = get_custom_image_sizes( $image_id );

				return array( 'success' => true, 'data' => array(
						'source' => 'acf',
						'value'  => $image_url,
						'sizes'  => $sizes,
					) );
		}

		// FILE FIELD (ACF)
		if ( $type === 'file' ) {

			$url = '';

			if ( is_array( $value ) && isset( $value['url'] ) ) {
				$url = $value['url'];
			}
			if ( is_numeric( $value ) ) {
				$url = wp_get_attachment_url( $value );
			}

			return array( 'success' => true, 'data' => array(
					'source' => 'acf',
					'type'   => 'file',
					'value'  => $url,
					'sizes'  => array(), // file has no sizes
				) );
		}

		// TEXT / TEXTAREA (ACF)
		if ( $type === 'text' || $type === 'textarea' ) {

			return array( 'success' => true, 'data' => array(
					'source' => 'acf',
					'type'   => $type,
					'value'  => (string) $value,
					'sizes'  => array(),
				) );
		}
	} else {
		// -------------------------
		// 2️⃣ NORMAL META FIELD
		// -------------------------
		$raw = get_post_meta( $post_id, $field_name, true );

		// If normal meta contains numeric attachment ID
		if ( is_numeric( $raw ) && get_post_mime_type( $raw ) ) {

			return array( 'success' => true, 'data' => array(
					'source' => 'meta',
					'type'   => 'image_or_file',
					'value'  => wp_get_attachment_url( $raw ),
					'sizes'  => get_all_image_sizes_list( $raw ),
				) );
		}

		// Normal text meta
		return array( 'success' => true, 'data' => array(
				'source' => 'meta',
				'type'   => 'meta_text',
				'value'  => $raw,
				'sizes'  => array(),
			) );
	}

	// if (!$post_id) {
	// return array("status" => "error", "excerpt" => "", "message" => "Required Parameters are Missing");
	// }
	// if ($status === true) {
	// $desc = get_html_excerpt_without_divi_shortcodes($post_id, $length);
	// return array("status" => "success", "excerpt" => $desc);
	// } else {
	// $text = get_excerpt_by_words($post_id, $length);
	// return array("status" => "success", "excerpt" => $text);
	// }
}


function caf_get_date( $data ) {
	$id      = $data['id'];
	$format  = $data['format'];
	$results = array();
	$dt      = get_the_date( $format, $id );
	$results = array( 'date' => $dt );
	return array(
			'status'  => 'success',
			'results' => $results,
		);
}

function get_excerpt_by_words( $post_id = null, $word_count = 20 ) {
	// if (!$post_id) {
	// $post_id = get_the_ID();
	// }

	// $post = get_post($post_id);
	// if (!$post) return '';

	// // Use excerpt if available, otherwise content
	// $text = $post->post_excerpt ? $post->post_excerpt : $post->post_content;

	// //  Remove Divi shortcodes like [et_pb_section] but keep inner content
	// $text = preg_replace('/\[(\/?et_pb_[^\]]+)\]/', '', $text);

	// //  Optionally remove all shortcodes (if others exist too)
	// $text = strip_shortcodes($text);

	// //  Remove all HTML tags (you wanted pure text)
	// $text = wp_strip_all_tags($text);

	// //  Limit by word count
	// $words = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);

	// if (count($words) > $word_count) {
	// $words = array_slice($words, 0, $word_count);
	// $text = implode(' ', $words) . '...';
	// }

	// return trim($text);

		$excerpt = wp_strip_all_tags( get_the_excerpt( $post_id ) );
		$excerpt = wp_trim_words( $excerpt, $word_count, '...' );
		return $excerpt;
}

function get_html_excerpt_without_divi_shortcodes( $post_id = null, $word_limit = 20 ) {
	if ( ! $post_id ) {
		$post_id = get_the_ID();
	}

	$post = get_post( $post_id );
	if ( ! $post ) {
		return '';
	}
	$content = $post->post_content;
	// get divi post content
	if ( ! defined( 'ONLY_ONCE_ap3_divi_do_shortcodes' ) && function_exists( 'et_builder_init_global_settings' ) && function_exists( 'et_builder_add_main_elements' ) ) {
		define( 'ONLY_ONCE_ap3_divi_do_shortcodes', true );
		et_builder_add_main_elements();
	}
	ET_Builder_Element::clean_internal_modules_styles();
	$content   = et_core_intentionally_unescaped( apply_filters( 'the_content', $content ), 'html' );
	$words     = 0;
	$output    = '';
	$open_tags = array();

	// Tokenize HTML + text
	preg_match_all( '/(<[^>]+?>|[^<>\s]+|\s+)/u', $content, $tokens );

	foreach ( $tokens[0] as $token ) {
		if ( preg_match( '/<[^>]+>/', $token ) ) {
			$output .= $token;
			if ( preg_match( '/^<(\w+)(?![^>]*\/)>$/', $token, $matches ) ) {
				$open_tags[] = $matches[1];
			} elseif ( preg_match( '/^<\/(\w+)>$/', $token, $matches ) ) {
				array_pop( $open_tags );
			}
		} elseif ( trim( $token ) === '' ) {
			$output .= $token;
		} else {
			$output .= $token;
			++$words;
			if ( $words >= $word_limit ) {
				break;
			}
		}
	}

	while ( ! empty( $open_tags ) ) {
		$output .= '</' . array_pop( $open_tags ) . '>';
	}

	return trim( $output );
}


function caf_get_content_length( $request ) {
	$post_id = $request->get_param( 'post_id' );
	$length  = $request->get_param( 'length' );
	$status  = $request->get_param( 'status' );
	if ( ! $post_id ) {
		return array(
				'status'  => 'error',
				'excerpt' => '',
				'message' => 'Required Parameters are Missing',
			);
	}
	if ( $status === true ) {
		$desc = get_html_excerpt_without_divi_shortcodes( $post_id, $length );
		return array(
				'status'  => 'success',
				'excerpt' => $desc,
			);
	} else {
		$text = get_excerpt_by_words( $post_id, $length );
		return array(
				'status'  => 'success',
				'excerpt' => $text,
			);
	}
}
function caf_resolve_preview_query_data( $request ) {
	if ( ! $request instanceof WP_REST_Request ) {
		return is_array( $request ) ? $request : array();
	}

	$raw = $request->get_param( 'query_data' );
	if ( is_string( $raw ) ) {
		$decoded = json_decode( $raw, true );
		return is_array( $decoded ) ? $decoded : array();
	}
	if ( is_array( $raw ) ) {
		return $raw;
	}

	$json = $request->get_json_params();
	if ( is_array( $json ) && isset( $json['query_data'] ) ) {
		$inner = $json['query_data'];
		if ( is_string( $inner ) ) {
			$decoded = json_decode( $inner, true );
			return is_array( $decoded ) ? $decoded : array();
		}
		return is_array( $inner ) ? $inner : array();
	}

	return array();
}

/**
 * @param array<string, mixed> $payload Response payload.
 * @return WP_REST_Response
 */
function caf_preview_posts_rest_response( $payload ) {
	if ( ob_get_length() ) {
		ob_end_clean();
	}

	return new WP_REST_Response( $payload, 200 );
}

function caf_get_preview_posts( $request ) {
	ob_start();
	$query_data = caf_resolve_preview_query_data( $request );
	$query_args = isset( $query_data['query'] ) && is_array( $query_data['query'] ) ? $query_data['query'] : array();

	if ( empty( $query_args['orderby'] ) || '0' === (string) $query_args['orderby'] ) {
		unset( $query_args['orderby'] );
	}

	if ( empty( $query_args['order'] ) || '0' === (string) $query_args['order'] ) {
		unset( $query_args['order'] );
	}

	$query_args = clean_query_args( $query_args );
	$query_args = caf_builder_validate_query_args( $query_args );

	$query      = new WP_Query( $query_args );
	$posts_list = array();
	$post_type  = isset( $query_args['post_type'] ) ? $query_args['post_type'] : 'post';
	$taxo       = get_object_taxonomies( $post_type );
	while ( $query->have_posts() ) {
		global $post;
		$query->the_post();
		$post_id     = get_the_ID();
		$excerpt     = get_the_excerpt();
		$post_url    = get_permalink();
		$imageurl    = get_the_post_thumbnail_url();
		$meta_fields = caf_build_post_meta_fields_for_builder( $post_id, $post_type );

		$trms = array();
		if ( $taxo ) {
			foreach ( $taxo as $tax ) {
				$terms        = wp_get_post_terms( $post_id, $tax );
				$trms[ $tax ] = $terms;
			}
		}
		$image_array  = array( 'sizes' => get_intermediate_image_sizes() );
		$thumbnail_id = get_post_thumbnail_id( $post_id );
		foreach ( $image_array['sizes'] as $size ) {
			$thumbnail_url       = wp_get_attachment_image_src( $thumbnail_id, $size );
			$image_array[ $size ] = ( is_array( $thumbnail_url ) && ! empty( $thumbnail_url[0] ) )
				? esc_url( $thumbnail_url[0] )
				: '';
		}
		$post_entry = array(
			'label'         => get_the_title(),
			'value'         => $post_id,
			'id'            => $post_id,
			'key'           => $post_id,
			'title'         => get_the_title(),
			'description'   => get_the_content(),
			'excerpt'       => $excerpt,
			'url'           => $post_url,
			'image'         => $imageurl,
			'imageArray'    => $image_array,
			'taxonomies'    => $taxo,
			'categories'    => $trms,
			'author'        => get_the_author(),
			'date'          => get_the_date( 'd-m-y' ),
			'post_date'     => get_post() ? get_post()->post_date : '',
			'meta_fields'   => $meta_fields,
			'customtext'    => 'Custom text',
			'commentcount'  => get_comments_number(),
			'author_avatar' => get_author_avatar_url( $post_id ),
		);

		$entry_post_type = get_post_type( $post_id );
		if ( 'product' === $entry_post_type && class_exists( 'CAF_Free_Woo' ) ) {
			$post_entry['product']    = CAF_Free_Woo::get_preview_data( $post_id );
			$post_entry['price_data'] = CAF_Free_Woo::get_price_data( $post_id );
		}

		$posts_list[] = $post_entry;
	}
	wp_reset_postdata();

	$current_page  = isset( $query_args['paged'] ) ? absint( $query_args['paged'] ) : 1;
	$prev          = $current_page > 1;
	$nextbtn       = (int) $query->max_num_pages > $current_page;
	$post_per_page = isset( $query_args['posts_per_page'] ) ? absint( $query_args['posts_per_page'] ) : 10;
	$start         = ( $current_page - 1 ) * $post_per_page + 1;
	$end           = min( $current_page * $post_per_page, (int) $query->found_posts );
	if ( 0 === (int) $query->found_posts ) {
		$start = '0';
	}

	$results_count = array(
		'start'         => $start,
		'end'           => $end,
		'total_results' => (int) $query->found_posts,
	);

	$payload = array(
		'status'        => 'success',
		'posts_list'    => $posts_list,
		'next'          => $nextbtn,
		'load_more'     => $nextbtn,
		'current_page'  => $current_page,
		'prev'          => $prev,
		'total_page'    => (int) $query->max_num_pages,
		'results_count' => $results_count,
	);

	$pagination_type = isset( $query_data['pagination_type'] ) ? (string) $query_data['pagination_type'] : '';
	if ( in_array( $pagination_type, array( 'number', 'number2', 'button' ), true ) ) {
		$payload['query'] = $query_args;
	}

	return caf_preview_posts_rest_response( $payload );
}
function caf_update_builder_layout_option( $data ) {
	$layout_data  = caf_normalize_builder_layout_data( json_decode( $data['layout_data'] ) );
	$title        = $data['layout_key'];
	$layout_index = $data['layout_index'];
	$status       = $layout_data->common_data->layout_publish;
	$opt          = 'caf_builder_layouts_list';
	if ( get_option( $opt ) ) {
		$layouts                                 = get_option( $opt );
		$valid_index                             = ( '' !== (string) $layout_index && is_numeric( $layout_index ) );
		if ( $valid_index ) {
			$layout_index = (int) $layout_index;
			if ( isset( $layouts[ $layout_index ] ) && is_array( $layouts[ $layout_index ] ) ) {
				$layouts[ $layout_index ]['post_status'] = $status;
				update_option( $opt, $layouts );
			}
		}
	}
	update_option( $title, $layout_data );
	if ( isset( $data['layout_index'] ) && is_numeric( $data['layout_index'] ) ) {
		caf_builder_invalidate_layout_cache( (int) $data['layout_index'] );
	}
	return array(
			'status'      => 'success',
			'layout_data' => get_option( $title ),
		);
}
/**
 * Normalize builder layout data for backward compatibility.
 *
 * Ensures required branches exist so new keys added in future releases
 * do not break older saved layouts.
 */
function caf_walk_filter_layout_modules( $initial_data, $callback ) {
	if ( ! is_array( $initial_data ) || ! is_callable( $callback ) ) {
		return;
	}

	foreach ( $initial_data as $row ) {
		$row = is_object( $row ) ? $row : (object) $row;
		if ( empty( $row->data ) || ! is_array( $row->data ) ) {
			continue;
		}

		foreach ( $row->data as $column ) {
			$column = is_object( $column ) ? $column : (object) $column;
			if ( empty( $column->data ) || ! is_array( $column->data ) ) {
				continue;
			}

			foreach ( $column->data as $module ) {
				$module = is_object( $module ) ? $module : (object) $module;
				$callback( $module );
			}
		}
	}
}

/**
 * Remove post modules that are not allowed on the current tier.
 *
 * @param array<int, mixed> $initial_data Post layout initial_data tree.
 * @return array<int, mixed>
 */
function caf_filter_post_layout_modules_by_tier( $initial_data ) {
	if ( ! is_array( $initial_data ) || ! class_exists( 'CAF_Builder_Tier' ) ) {
		return is_array( $initial_data ) ? $initial_data : array();
	}

	foreach ( $initial_data as $row_index => $row ) {
		$row = is_object( $row ) ? $row : (object) $row;
		if ( empty( $row->data ) || ! is_array( $row->data ) ) {
			continue;
		}

		foreach ( $row->data as $column_index => $column ) {
			$column = is_object( $column ) ? $column : (object) $column;
			if ( empty( $column->data ) || ! is_array( $column->data ) ) {
				continue;
			}

			$column->data = array_values(
				array_filter(
					$column->data,
					static function ( $module ) {
						$module = is_object( $module ) ? $module : (object) $module;
						if ( empty( $module->key ) ) {
							return true;
						}

						return CAF_Builder_Tier::can_use_post_module( (string) $module->key );
					}
				)
			);

			$row->data[ $column_index ] = $column;
		}

		$initial_data[ $row_index ] = $row;
	}

	return $initial_data;
}

/**
 * Remove filter modules that are not allowed on the current tier.
 *
 * @param array<int, mixed> $initial_data Filter layout initial_data tree.
 * @param string|null       $post_type    Layout post type (Free Range Slider needs product).
 * @return array<int, mixed>
 */
function caf_filter_filter_layout_modules_by_tier( $initial_data, $post_type = null ) {
	if ( ! is_array( $initial_data ) || ! class_exists( 'CAF_Builder_Tier' ) ) {
		return is_array( $initial_data ) ? $initial_data : array();
	}

	foreach ( $initial_data as $row_index => $row ) {
		$row = is_object( $row ) ? $row : (object) $row;
		if ( empty( $row->data ) || ! is_array( $row->data ) ) {
			continue;
		}

		foreach ( $row->data as $column_index => $column ) {
			$column = is_object( $column ) ? $column : (object) $column;
			if ( empty( $column->data ) || ! is_array( $column->data ) ) {
				continue;
			}

			$column->data = array_values(
				array_filter(
					$column->data,
					static function ( $module ) use ( $post_type ) {
						$module = is_object( $module ) ? $module : (object) $module;
						if ( empty( $module->key ) ) {
							return true;
						}

						return CAF_Builder_Tier::can_use_filter_module( (string) $module->key, $post_type );
					}
				)
			);

			$row->data[ $column_index ] = $column;
		}

		$initial_data[ $row_index ] = $row;
	}

	return $initial_data;
}

/**
 * Keep only the first occurrence of tier-limited filter modules (search only).
 *
 * @param array<int, mixed> $initial_data Filter layout initial_data tree.
 * @return array<int, mixed>
 */
function caf_enforce_single_instance_filter_modules( $initial_data ) {
	if ( ! is_array( $initial_data ) ) {
		return array();
	}

	$limited_keys = array( 'search' );

	$seen         = array();

	foreach ( $initial_data as $row_index => $row ) {
		$row = is_object( $row ) ? $row : (object) $row;
		if ( empty( $row->data ) || ! is_array( $row->data ) ) {
			continue;
		}

		foreach ( $row->data as $column_index => $column ) {
			$column = is_object( $column ) ? $column : (object) $column;
			if ( empty( $column->data ) || ! is_array( $column->data ) ) {
				continue;
			}

			$column->data = array_values(
				array_filter(
					$column->data,
					static function ( $module ) use ( &$seen, $limited_keys ) {
						$module = is_object( $module ) ? $module : (object) $module;
						$key    = isset( $module->key ) ? (string) $module->key : '';

						if ( ! in_array( $key, $limited_keys, true ) ) {
							return true;
						}

						if ( isset( $seen[ $key ] ) ) {
							return false;
						}

						$seen[ $key ] = true;
						return true;
					}
				)
			);

			$row->data[ $column_index ] = $column;
		}

		$initial_data[ $row_index ] = $row;
	}

	return $initial_data;
}

/**
 * Strip Pro-only label icons from filter module settings on free tier saves.
 *
 * @param object $settings Module settings object.
 * @return object
 */
function caf_strip_filter_label_icons( $settings ) {
	if ( ! is_object( $settings ) ) {
		return $settings;
	}

	if ( ! class_exists( 'CAF_Builder_Tier' ) || CAF_Builder_Tier::can_use_feature( 'label_show_icon' ) ) {
		return $settings;
	}

	if ( ! isset( $settings->label ) || ! is_object( $settings->label ) ) {
		$settings->label = new stdClass();
	}

	$settings->label->icons = (object) array(
		'visibility' => false,
		'icon'       => '',
		'type'       => 'icon',
		'position'   => 'before-label',
	);

	return $settings;
}

/**
 * Strip Pro-only label collapse settings from filter module settings on free tier saves.
 *
 * @param object $settings Module settings object.
 * @return object
 */
function caf_strip_filter_label_collapse( $settings ) {
	if ( ! is_object( $settings ) ) {
		return $settings;
	}

	if ( ! class_exists( 'CAF_Builder_Tier' ) || CAF_Builder_Tier::can_use_feature( 'filter_label_collapse' ) ) {
		return $settings;
	}

	$settings->enable_toggle = 'false';
	$settings->close_toggle  = 'false';

	return $settings;
}

/**
 * Strip Pro-only search module settings on free tier saves.
 *
 * @param object $settings Search module settings object.
 * @return object
 */
function caf_sanitize_free_search_module_settings( $settings ) {
	if ( ! is_object( $settings ) ) {
		$settings = new stdClass();
	}

	if ( ! class_exists( 'CAF_Builder_Tier' ) ) {
		return $settings;
	}

	if ( ! CAF_Builder_Tier::can_use_feature( 'smart_ai_search' ) ) {
		$settings->smart_ai_search = (object) array(
			'is_enable' => 'false',
		);
		if ( ! isset( $settings->keyword_search ) || ! is_object( $settings->keyword_search ) ) {
			$settings->keyword_search = new stdClass();
		}
		$settings->keyword_search->is_enable = 'true';
	}

	if ( ! CAF_Builder_Tier::can_use_feature( 'search_custom_field' ) ) {
		if ( ! isset( $settings->source ) || ! is_object( $settings->source ) ) {
			$settings->source = new stdClass();
		}
		$settings->source->custom_field = false;
		$settings->custom_field         = '0';
	}

	if ( ! CAF_Builder_Tier::can_use_feature( 'voice_search' ) ) {
		if ( ! isset( $settings->voice_icon ) || ! is_object( $settings->voice_icon ) ) {
			$settings->voice_icon = new stdClass();
		}
		$settings->voice_icon->is_enable = 'false';
	}

	if ( ! CAF_Builder_Tier::can_use_feature( 'search_show_icon' ) ) {
		if ( ! isset( $settings->search_icon ) || ! is_object( $settings->search_icon ) ) {
			$settings->search_icon = new stdClass();
		}
		$settings->search_icon->is_enable = 'false';
	}

	if ( ! CAF_Builder_Tier::can_use_feature( 'search_clear_input' ) ) {
		if ( ! isset( $settings->clear_icon ) || ! is_object( $settings->clear_icon ) ) {
			$settings->clear_icon = new stdClass();
		}
		$settings->clear_icon->is_enable = 'false';
	}

	$settings = caf_strip_filter_label_icons( $settings );
	return caf_strip_filter_label_collapse( $settings );
}

/**
 * Strip Pro-only term defaults/icons from taxonomy term trees on free tier.
 * When stripping icons, color swatch values are preserved (FA/SVG only cleared).
 *
 * @param array<int, mixed> $term_data Term tree.
 * @param bool              $strip_default Remove default/predefine flags.
 * @param bool              $strip_icons   Remove term FA/SVG icons (keep color).
 * @return array<int, mixed>
 */
function caf_strip_locked_filter_term_features( $term_data, $strip_default, $strip_icons ) {
	if ( ! is_array( $term_data ) ) {
		return array();
	}

	foreach ( $term_data as $index => $term ) {
		$term = is_object( $term ) ? $term : (object) $term;

		if ( $strip_default && isset( $term->predefine ) ) {
			$term->predefine = 'false';
		}
		if ( $strip_icons ) {
			$icons    = ( isset( $term->icons ) && is_object( $term->icons ) ) ? $term->icons : new stdClass();
			$color    = '';
			$position = isset( $icons->position ) ? (string) $icons->position : 'before';

			if ( isset( $icons->color ) && is_string( $icons->color ) && '' !== trim( $icons->color ) ) {
				$color = trim( $icons->color );
			} elseif (
				isset( $icons->type ) && 'color' === (string) $icons->type
				&& isset( $icons->icon ) && is_string( $icons->icon ) && '' !== trim( $icons->icon )
			) {
				$color = trim( $icons->icon );
			}

			if ( '' !== $color ) {
				$term->icons = (object) array(
					'type'     => 'color',
					'icon'     => $color,
					'color'    => $color,
					'position' => $position ? $position : 'before',
				);
			} else {
				$term->icons = (object) array(
					'icon'     => '',
					'type'     => 'icon',
					'position' => 'before',
				);
			}
		}
		if ( isset( $term->children_data ) && is_array( $term->children_data ) ) {
			$term->children_data = caf_strip_locked_filter_term_features(
				$term->children_data,
				$strip_default,
				$strip_icons
			);
		}

		$term_data[ $index ] = $term;
	}

	return $term_data;
}

/**
 * Strip Pro-only checkbox/dropdown filter settings on free tier saves.
 *
 * @param object $settings Module settings object.
 * @return object
 */
function caf_sanitize_free_checkbox_dropdown_module_settings( $settings ) {
	if ( ! is_object( $settings ) ) {
		$settings = new stdClass();
	}

	if ( ! class_exists( 'CAF_Builder_Tier' ) ) {
		return $settings;
	}

	if ( ! CAF_Builder_Tier::can_use_feature( 'filter_custom_field' ) ) {
		$settings->data_source        = 'taxonomy';
		$settings->custom_field_data  = array();
		$settings->cf_predefined_terms = array();
	}

	if ( ! CAF_Builder_Tier::can_use_feature( 'filter_show_icon' ) ) {
		// Free: keep show_icon when term_visual is color (color swatch unlocked on product layouts).
		$is_color_swatch = (
			isset( $settings->show_icon ) && 'true' === (string) $settings->show_icon
			&& isset( $settings->term_visual ) && 'color' === (string) $settings->term_visual
		);
		if ( ! $is_color_swatch ) {
			$settings->show_icon = 'false';
		} else {
			$settings->term_visual = 'color';
		}
		if ( isset( $settings->dropdown_data ) && is_object( $settings->dropdown_data ) ) {
			if ( ! isset( $settings->dropdown_data->all_option ) || ! is_object( $settings->dropdown_data->all_option ) ) {
				$settings->dropdown_data->all_option = new stdClass();
			}
			$settings->dropdown_data->all_option->icons = (object) array(
				'visibility' => false,
				'icon'       => '',
				'type'       => 'icon',
			);
		}
	}

	if ( ! CAF_Builder_Tier::can_use_feature( 'filter_term_show_more' ) ) {
		$settings->term_show_more = 'false';
	}

	$strip_default = ! CAF_Builder_Tier::can_use_feature( 'filter_term_default' );
	$strip_icons   = ! CAF_Builder_Tier::can_use_feature( 'filter_term_icon' );

	if ( $strip_default ) {
		$settings->predefined_terms = array();
	}

	if ( ( $strip_default || $strip_icons ) && isset( $settings->taxonomy_data ) && is_array( $settings->taxonomy_data ) ) {
		foreach ( $settings->taxonomy_data as $index => $taxonomy_row ) {
			$taxonomy_row = is_object( $taxonomy_row ) ? $taxonomy_row : (object) $taxonomy_row;
			if ( isset( $taxonomy_row->term_data ) && is_array( $taxonomy_row->term_data ) ) {
				$taxonomy_row->term_data = caf_strip_locked_filter_term_features(
					$taxonomy_row->term_data,
					$strip_default,
					$strip_icons
				);
			}
			$settings->taxonomy_data[ $index ] = $taxonomy_row;
		}
	}

	if ( ! CAF_Builder_Tier::can_use_feature( 'filter_custom_field' ) && isset( $settings->custom_field_data ) ) {
		$settings->custom_field_data = array();
	}

	$settings = caf_strip_filter_label_icons( $settings );
	return caf_strip_filter_label_collapse( $settings );
}

/**
 * Strip Pro-only range slider settings on free tier saves (WooCommerce `_price` only).
 *
 * @param object $settings Range slider module settings object.
 * @return object
 */
function caf_sanitize_free_range_slider_module_settings( $settings ) {
	if ( ! is_object( $settings ) ) {
		$settings = new stdClass();
	}

	if ( ! class_exists( 'CAF_Builder_Tier' ) ) {
		return $settings;
	}

	$settings->data_source = 'custom_field';

	if ( ! CAF_Builder_Tier::can_use_feature( 'range_slider_custom_fields' ) ) {
		$settings->custom_field_data = array(
			(object) array(
				'custom_field_key'        => '_price',
				'custom_field_value_list' => array(),
				'compare_operator'        => 'BETWEEN',
				'meta_type'               => 'NUMERIC',
			),
		);
	}

	$settings = caf_strip_filter_label_icons( $settings );
	return caf_strip_filter_label_collapse( $settings );
}

/**
 * Strip Pro-only reset module settings on free tier saves.
 *
 * @param object $settings Module settings object.
 * @return object
 */
function caf_sanitize_free_reset_module_settings( $settings ) {
	if ( ! is_object( $settings ) ) {
		$settings = new stdClass();
	}

	if ( ! class_exists( 'CAF_Builder_Tier' ) ) {
		return $settings;
	}

	if ( ! CAF_Builder_Tier::can_use_feature( 'reset_module_icon' ) ) {
		$settings->icons = (object) array(
			'visibility' => false,
			'icon'       => '',
			'type'       => 'icon',
		);
	}

	$settings = caf_strip_filter_label_icons( $settings );
	return caf_strip_filter_label_collapse( $settings );
}

/**
 * Strip Pro-only custom text module icon settings on free tier saves.
 *
 * @param object $settings Module settings object.
 * @return object
 */
function caf_sanitize_free_customtext_module_settings( $settings ) {
	if ( ! is_object( $settings ) ) {
		$settings = new stdClass();
	}

	if ( ! class_exists( 'CAF_Builder_Tier' ) ) {
		return $settings;
	}

	if ( ! CAF_Builder_Tier::can_use_feature( 'customtext_module_icon' ) ) {
		$settings->icons = (object) array(
			'visibility' => false,
			'icon'       => '',
			'type'       => 'icon',
			'position'   => 'before-customtext',
		);
	}

	return $settings;
}

/**
 * Strip Pro-only post module settings on free tier saves.
 *
 * @param string $module_key Post module key slug.
 * @param object $settings   Module settings object.
 * @return object
 */
function caf_sanitize_free_post_module_settings( $module_key, $settings ) {
	if ( ! is_object( $settings ) ) {
		$settings = new stdClass();
	}

	if ( ! class_exists( 'CAF_Builder_Tier' ) ) {
		return $settings;
	}

	if ( 'image' === (string) $module_key && ! CAF_Builder_Tier::can_use_feature( 'post_image_custom_field' ) ) {
		$settings->image_source = 'featured_image';
		$settings->custom_field = '0';
	}

	if ( ! CAF_Builder_Tier::can_use_feature( 'post_link_custom_field' ) ) {
		if ( ! isset( $settings->link ) || ! is_object( $settings->link ) ) {
			$settings->link = new stdClass();
		}
		if ( isset( $settings->link->type ) && 'custom-url' === (string) $settings->link->type ) {
			$settings->link->type = 'post-url';
		}
		$settings->link->custom_field = '0';
	}

	// Prefix/suffix is unlocked for product_price on free (icons still stripped by the tier sanitizer below).
	$normalized_module_key = CAF_Builder_Tier::normalize_post_module_key( $module_key );
	if ( 'product_price' !== $normalized_module_key && ! CAF_Builder_Tier::can_use_feature( 'post_prefix_suffix' ) ) {
		$settings->prefix = (object) array(
			'is_enable' => 'false',
			'meta_type' => 'text',
			'meta_text' => '',
		);
		$settings->suffix = (object) array(
			'is_enable' => 'false',
			'meta_type' => 'text',
			'meta_text' => '',
		);
	}

	if ( ! CAF_Builder_Tier::can_use_feature( 'label_show_icon' ) ) {
		$settings->icons = (object) array(
			'visibility' => false,
			'icon'       => '',
			'type'       => 'icon',
			'position'   => '',
		);
	}

	return CAF_Builder_Tier::sanitize_post_module_settings( $module_key, $settings );
}

/**
 * Flatten a stored CSS gradient string to its first solid stop (free tier).
 *
 * @param mixed  $value    Color value.
 * @param string $fallback Fallback solid color.
 * @return mixed
 */
function caf_flatten_gradient_color_value( $value, $fallback = '#000000' ) {
	if ( ! is_string( $value ) || false === stripos( $value, 'gradient(' ) ) {
		return $value;
	}

	if ( preg_match( '/(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8})/', $value, $matches ) ) {
		return $matches[1];
	}

	return $fallback;
}

/**
 * Recursively replace gradient color strings in layout JSON.
 *
 * @param mixed $node Layout node.
 * @return void
 */
function caf_walk_and_flatten_gradient_colors( &$node ) {
	if ( is_array( $node ) ) {
		foreach ( $node as &$child ) {
			caf_walk_and_flatten_gradient_colors( $child );
		}
		return;
	}

	if ( is_object( $node ) ) {
		foreach ( get_object_vars( $node ) as $key => &$value ) {
			if ( is_string( $value ) && false !== stripos( $value, 'gradient(' ) ) {
				$value = caf_flatten_gradient_color_value( $value );
			} else {
				caf_walk_and_flatten_gradient_colors( $value );
			}
		}
	}
}

/**
 * Default loader used on free tier (simple spinner, no overlay).
 *
 * @return object
 */
function caf_get_free_preview_loader_defaults() {
	return (object) array(
		'is_enable'    => 'true',
		'loader_type'  => 'true',
		'loader_text'  => 'Loading...',
		'overlay'      => 'false',
		'custom_class' => '',
		'icon_data'    => (object) array(
			'source' => 'list',
			'icon'   => 'fa fa-spinner fa-pulse',
			'url'    => '',
			'upload' => '',
			'style'  => (object) array(
				'desktop' => (object) array(
					'default' => (object) array(
						'fontSize' => '14px',
						'overlay'  => 'rgba(255,255,255,0)',
					),
					'hover'   => new stdClass(),
				),
				'tablet'  => (object) array(
					'default' => new stdClass(),
					'hover'   => new stdClass(),
				),
				'mobile'  => (object) array(
					'default' => new stdClass(),
					'hover'   => new stdClass(),
				),
			),
		),
	);
}

/**
 * Strip Pro-only layout preview settings on free tier saves.
 *
 * @param object $layout_data Layout data object.
 * @return object
 */
function caf_sanitize_free_preview_template_data( $layout_data ) {
	if ( ! is_object( $layout_data ) || ! class_exists( 'CAF_Builder_Tier' ) ) {
		return $layout_data;
	}

	if ( ! isset( $layout_data->common_data ) || ! is_object( $layout_data->common_data ) ) {
		return $layout_data;
	}
	if ( ! isset( $layout_data->common_data->preview_template_data ) || ! is_object( $layout_data->common_data->preview_template_data ) ) {
		return $layout_data;
	}

	$preview = $layout_data->common_data->preview_template_data;
	if ( ! isset( $preview->misc_preview_data ) || ! is_object( $preview->misc_preview_data ) ) {
		$preview->misc_preview_data = new stdClass();
	}

	$misc = $preview->misc_preview_data;

	if ( ! CAF_Builder_Tier::can_use_feature( 'floating_filter' ) ) {
		if ( ! isset( $misc->extra ) || ! is_object( $misc->extra ) ) {
			$misc->extra = new stdClass();
		}
		foreach ( array( 'desktop', 'tablet', 'mobile' ) as $device ) {
			if ( ! isset( $misc->extra->$device ) || ! is_object( $misc->extra->$device ) ) {
				$misc->extra->$device = new stdClass();
			}
			$misc->extra->$device->filterPosition = 'inline';
		}
	}

	if ( ! CAF_Builder_Tier::can_use_feature( 'preview_loader_settings' ) ) {
		$misc->loader = caf_get_free_preview_loader_defaults();
	}

	if ( isset( $misc->dnd_column_data ) ) {
		$misc->dnd_column_data = caf_sanitize_free_dnd_column_data( $misc->dnd_column_data );
	}

	return $layout_data;
}

/**
 * Map layout-control DnD item keys to tier feature slugs.
 *
 * @param string $item_key DnD misc item key.
 * @return string|null
 */
function caf_get_dnd_misc_item_feature( $item_key ) {
	$map = array(
		'sorting'      => 'sorting',
		'result_count' => 'result_counter',
		'selected'     => 'active_filters',
	);

	$item_key = (string) $item_key;

	return isset( $map[ $item_key ] ) ? $map[ $item_key ] : null;
}

/**
 * Disable Pro-only layout control items on free tier saves.
 *
 * @param mixed $dnd_column_data DnD column array from misc preview data.
 * @return mixed
 */
function caf_sanitize_free_dnd_column_data( $dnd_column_data ) {
	if ( ! is_array( $dnd_column_data ) || ! class_exists( 'CAF_Builder_Tier' ) ) {
		return $dnd_column_data;
	}

	foreach ( $dnd_column_data as $column ) {
		if ( ! is_object( $column ) || ! isset( $column->data ) || ! is_array( $column->data ) ) {
			continue;
		}

		foreach ( $column->data as $item ) {
			if ( ! is_object( $item ) || ! isset( $item->key ) ) {
				continue;
			}

			$item_key = (string) $item->key;
			if ( 'pagination' === $item_key ) {
				if ( ! isset( $item->settings ) || ! is_object( $item->settings ) ) {
					$item->settings = new stdClass();
				}
				$pagination_type = isset( $item->settings->pagination_type )
					? (string) $item->settings->pagination_type
					: 'number2';
				if (
					'number2' === $pagination_type
					&& ! CAF_Builder_Tier::can_use_feature( 'pagination_number2' )
				) {
					$item->settings->pagination_type = 'number';
					$pagination_type                  = 'number';
				}
				if (
					'button' === $pagination_type
					&& ! CAF_Builder_Tier::can_use_feature( 'pagination_button' )
				) {
					$item->settings->pagination_type = 'number';
				}
				if (
					'load-more' === $pagination_type
					&& ! CAF_Builder_Tier::can_use_feature( 'pagination_load_more' )
				) {
					$item->settings->pagination_type = 'number';
				}
				continue;
			}

			$feature = caf_get_dnd_misc_item_feature( $item_key );
			if ( $feature && ! CAF_Builder_Tier::can_use_feature( $feature ) ) {
				if ( ! isset( $item->settings ) || ! is_object( $item->settings ) ) {
					$item->settings = new stdClass();
				}
				$item->settings->is_enable = 'false';
			}
		}
	}

	return $dnd_column_data;
}

function caf_normalize_builder_layout_data( $layout_data ) {
	if ( ! is_object( $layout_data ) ) {
		$layout_data = new stdClass();
	}

	if ( ! isset( $layout_data->common_data ) || ! is_object( $layout_data->common_data ) ) {
		$layout_data->common_data = new stdClass();
	}
	if ( ! isset( $layout_data->common_data->layout_schema_version ) ) {
		$layout_data->common_data->layout_schema_version = 1;
	}
	if ( ! isset( $layout_data->common_data->analytics_enabled ) ) {
		$layout_data->common_data->analytics_enabled = false;
	}
	if ( ! isset( $layout_data->common_data->filter_url_enabled ) ) {
		$layout_data->common_data->filter_url_enabled = true;
	}
	if ( ! isset( $layout_data->common_data->schema_enabled ) ) {
		$layout_data->common_data->schema_enabled = true;
	}

	if ( ! isset( $layout_data->filter_layout_data ) || ! is_object( $layout_data->filter_layout_data ) ) {
		$layout_data->filter_layout_data = new stdClass();
	}
	if ( ! isset( $layout_data->filter_layout_data->extra_data ) || ! is_object( $layout_data->filter_layout_data->extra_data ) ) {
		$layout_data->filter_layout_data->extra_data = new stdClass();
	}
	if ( ! isset( $layout_data->filter_layout_data->breadcrumb_data ) || ! is_object( $layout_data->filter_layout_data->breadcrumb_data ) ) {
		$layout_data->filter_layout_data->breadcrumb_data = new stdClass();
	}
	if ( ! isset( $layout_data->filter_layout_data->initial_data ) || ! is_array( $layout_data->filter_layout_data->initial_data ) ) {
		$layout_data->filter_layout_data->initial_data = array();
	}
	if ( ! isset( $layout_data->filter_layout_data->filter_query_data ) || ! is_object( $layout_data->filter_layout_data->filter_query_data ) ) {
		$layout_data->filter_layout_data->filter_query_data = new stdClass();
	}
	if ( ! isset( $layout_data->filter_layout_data->filter_query_data->data_source ) || ! is_object( $layout_data->filter_layout_data->filter_query_data->data_source ) ) {
		$layout_data->filter_layout_data->filter_query_data->data_source = new stdClass();
	}
	if ( ! isset( $layout_data->filter_layout_data->filter_query_data->taxonomy_data ) || ! is_array( $layout_data->filter_layout_data->filter_query_data->taxonomy_data ) ) {
		$layout_data->filter_layout_data->filter_query_data->taxonomy_data = array();
	}
	if ( ! isset( $layout_data->filter_layout_data->filter_query_data->custom_field_data ) || ! is_array( $layout_data->filter_layout_data->filter_query_data->custom_field_data ) ) {
		$layout_data->filter_layout_data->filter_query_data->custom_field_data = array();
	}

	if ( ! isset( $layout_data->post_layout_data ) || ! is_object( $layout_data->post_layout_data ) ) {
		$layout_data->post_layout_data = new stdClass();
	}
	if ( ! isset( $layout_data->post_layout_data->extra_data ) || ! is_object( $layout_data->post_layout_data->extra_data ) ) {
		$layout_data->post_layout_data->extra_data = new stdClass();
	}
	if ( ! isset( $layout_data->post_layout_data->breadcrumb_data ) || ! is_object( $layout_data->post_layout_data->breadcrumb_data ) ) {
		$layout_data->post_layout_data->breadcrumb_data = new stdClass();
	}
	if ( ! isset( $layout_data->post_layout_data->initial_data ) || ! is_array( $layout_data->post_layout_data->initial_data ) ) {
		$layout_data->post_layout_data->initial_data = array();
	}

	$layout_post_type = '';
	if ( isset( $layout_data->common_data ) && is_object( $layout_data->common_data ) && isset( $layout_data->common_data->post_type ) ) {
		$layout_post_type = (string) $layout_data->common_data->post_type;
	}

	$layout_data->filter_layout_data->initial_data = caf_filter_filter_layout_modules_by_tier(
		$layout_data->filter_layout_data->initial_data,
		$layout_post_type
	);

	$layout_data->filter_layout_data->initial_data = caf_enforce_single_instance_filter_modules(
		$layout_data->filter_layout_data->initial_data
	);

	$layout_data->post_layout_data->initial_data = caf_filter_post_layout_modules_by_tier(
		$layout_data->post_layout_data->initial_data
	);

	if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_use_feature( 'elementor_loop' ) ) {
		if (
			isset( $layout_data->post_layout_data->extra_data->layout_source )
			&& 'elementor_loop' === (string) $layout_data->post_layout_data->extra_data->layout_source
		) {
			$layout_data->post_layout_data->extra_data->layout_source  = 'caf_builder';
			$layout_data->post_layout_data->extra_data->loop_template_id = '';
		}
	}

	if ( class_exists( 'CAF_Builder_Tier' ) ) {
		if ( ! CAF_Builder_Tier::can_use_feature( 'analytics' ) ) {
			$layout_data->common_data->analytics_enabled = false;
		}
		if ( ! CAF_Builder_Tier::can_use_feature( 'filter_url' ) ) {
			$layout_data->common_data->filter_url_enabled = false;
		}
		if ( ! CAF_Builder_Tier::can_use_feature( 'schema' ) ) {
			$layout_data->common_data->schema_enabled = false;
		}
		if ( ! CAF_Builder_Tier::can_use_feature( 'meta_relation' ) ) {
			$layout_data->filter_layout_data->extra_data->meta_relation = 'IN';
			if ( isset( $layout_data->filter_layout_data->filter_query_data ) && is_object( $layout_data->filter_layout_data->filter_query_data ) ) {
				$layout_data->filter_layout_data->filter_query_data->meta_relation = 'IN';
			}
		}
		if ( ! CAF_Builder_Tier::can_use_feature( 'dynamic_term_counts' ) ) {
			$layout_data->filter_layout_data->extra_data->dynamic_term_counts = 'false';
		}
		if ( ! CAF_Builder_Tier::can_use_feature( 'query_restriction' ) ) {
			$layout_data->filter_layout_data->extra_data->query_restriction = (object) array(
				'enabled' => 'false',
				'include' => (object) array(
					'by'        => '',
					'taxonomy'  => '',
					'term_data' => array(),
				),
				'exclude' => (object) array(
					'by'        => '',
					'taxonomy'  => '',
					'term_data' => array(),
					'post_data' => array(),
				),
			);
		}
		if ( ! CAF_Builder_Tier::can_use_feature( 'filter_custom_field' ) ) {
			if ( isset( $layout_data->filter_layout_data->filter_query_data ) && is_object( $layout_data->filter_layout_data->filter_query_data ) ) {
				$layout_data->filter_layout_data->filter_query_data->custom_field_data = array();
			}
		}
	}

	caf_walk_filter_layout_modules(
		$layout_data->filter_layout_data->initial_data,
		static function ( $module ) {
			if ( ! isset( $module->key ) ) {
				return;
			}

			$module_key = (string) $module->key;
			if ( ! isset( $module->settings ) || ! is_object( $module->settings ) ) {
				$module->settings = new stdClass();
			}

			if ( 'search' === $module_key ) {
				$module->settings = caf_sanitize_free_search_module_settings( $module->settings );
				return;
			}

			if ( in_array( $module_key, array( 'checkbox_filter', 'dropdown_filter' ), true ) ) {
				$module->settings = caf_sanitize_free_checkbox_dropdown_module_settings( $module->settings );
				return;
			}

			if ( 'reset' === $module_key ) {
				$module->settings = caf_sanitize_free_reset_module_settings( $module->settings );
				return;
			}

			if ( 'customtext' === $module_key ) {
				$module->settings = caf_sanitize_free_customtext_module_settings( $module->settings );
				return;
			}

			if ( 'range_slider' === $module_key ) {
				$module->settings = caf_sanitize_free_range_slider_module_settings( $module->settings );
			}
		}
	);

	caf_walk_filter_layout_modules(
		$layout_data->post_layout_data->initial_data,
		static function ( $module ) {
			if ( ! isset( $module->key ) ) {
				return;
			}

			if ( ! isset( $module->settings ) || ! is_object( $module->settings ) ) {
				$module->settings = new stdClass();
			}

			$module->settings = caf_sanitize_free_post_module_settings(
				(string) $module->key,
				$module->settings
			);
		}
	);

	$layout_data = caf_sanitize_free_preview_template_data( $layout_data );

	if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_use_feature( 'gradient_colors' ) ) {
		caf_walk_and_flatten_gradient_colors( $layout_data );
	}

	return $layout_data;
}

function caf_rename_builder_layout_label( $data ) {
	$index     = $data['index'];
	$new_label = $data['label'];
	$options   = get_option( 'caf_builder_layouts_list' );

	if ( $options[ $index ] ) {
		$options[ $index ]['label'] = $new_label;
		update_option( 'caf_builder_layouts_list', $options );
		$updated_option = get_option( 'caf_builder_layouts_list' );
		$title          = 'caf_' . $options[ $index ]['key'] . '_' . $index;
		if ( get_option( $title ) ) {
			$newlayoutData                           = get_option( $title );
			$newlayoutData->common_data->layout_name = $updated_option[ $index ]['label'];
			update_option( $title, $newlayoutData );
			return array(
					'status' => 'success',
					'label'  => $updated_option[ $index ]['label'],
				);
		} else {
			return array(
					'status' => 'error',
					'msg'    => 'Data Not Updated',
				);
		}
	}
}
function caf_get_layout_data( $data ) {
	// ob_start();
	$layout_key = $data['layout_key'];
	if ( get_option( $layout_key ) ) {
		$normalized_layout = caf_normalize_builder_layout_data( get_option( $layout_key ) );
		return array(
				'status'      => 'success',
				'layout_data' => $normalized_layout,
			);
	} else {
		return array(
				'status'      => 'error',
				'layout_data' => array(),
				'message'     => 'No Result Found',
			);
	}
}
function caf_move_to_trash( $data ) {
	$postIds     = json_decode( $data['post_ids'] );
	$oldPanel    = array();
	$builderPost = array();
	if ( ! empty( $postIds ) ) {
		foreach ( $postIds as $pid ) {
			if ( str_contains( $pid, 'bl_' ) ) {
				array_push( $builderPost, preg_replace( '/\D/', '', $pid ) );
			} else {
				array_push( $oldPanel, $pid );
			}
		}

		if ( ! empty( $oldPanel ) ) {
			foreach ( $oldPanel as $post_id ) {
				$post_id = absint( $post_id );
				if ( $post_id && 'caf_posts' === get_post_type( $post_id ) && get_post_status( $post_id ) ) {
					wp_trash_post( $post_id );
				}
			}
		}

		if ( ! empty( $builderPost ) ) {
			foreach ( $builderPost as $index ) {
				$opt                                   = 'caf_builder_layouts_list';
				$savedLayouts                          = get_option( $opt );
				$savedLayouts[ $index ]['post_status'] = 'trash';
				update_option( $opt, $savedLayouts );
			}
		}
		return array(
				'status'  => 'success',
				'message' => 'Filters Trash Successfully',
			);
	} else {
		return array(
				'status'  => 'error',
				'message' => "Something went's Wrong",
			);
	}
}
function caf_bulk_layouts_restore( $data ) {
	$postIds     = json_decode( $data['post_ids'] );
	$oldPanel    = array();
	$builderPost = array();
	if ( ! empty( $postIds ) ) {
		foreach ( $postIds as $pid ) {
			if ( str_contains( $pid, 'bl_' ) ) {
				array_push( $builderPost, preg_replace( '/\D/', '', $pid ) );
			} else {
				array_push( $oldPanel, $pid );
			}
		}

		if ( ! empty( $oldPanel ) ) {
			foreach ( $oldPanel as $post_id ) {
				$post_id = absint( $post_id );
				if ( $post_id && 'caf_posts' === get_post_type( $post_id ) && get_post_status( $post_id ) ) {
					wp_untrash_post( $post_id );
				}
			}
		}

		if ( ! empty( $builderPost ) ) {
			foreach ( $builderPost as $index ) {
				$opt                                   = 'caf_builder_layouts_list';
				$savedLayouts                          = get_option( $opt );
				$savedLayouts[ $index ]['post_status'] = 'draft';
				update_option( $opt, $savedLayouts );
			}
		}
		return array(
				'status'  => 'success',
				'message' => 'Filters Restored Successfully',
			);
	} else {
		return array(
				'status'  => 'error',
				'message' => "Something went's Wrong",
			);
	}
}
function caf_bulk_layouts_delete_permanent( $data ) {
	$postIds     = json_decode( $data['post_ids'] );
	$oldPanel    = array();
	$builderPost = array();
	if ( ! empty( $postIds ) ) {
		foreach ( $postIds as $pid ) {
			if ( str_contains( $pid, 'bl_' ) ) {
				array_push( $builderPost, preg_replace( '/\D/', '', $pid ) );
			} else {
				array_push( $oldPanel, $pid );
			}
		}

		if ( ! empty( $oldPanel ) ) {
			foreach ( $oldPanel as $post_id ) {
				$post_id = absint( $post_id );
				if ( $post_id && 'caf_posts' === get_post_type( $post_id ) && get_post_status( $post_id ) ) {
					wp_delete_post( $post_id, true );
				}
			}
		}

		if ( ! empty( $builderPost ) ) {
			$options = get_option( 'caf_builder_layouts_list' );
			foreach ( $builderPost as $index ) {
				if ( $options[ $index ] ) {
					$layout = $options[ $index ]['key'];
					$title  = 'caf_' . $layout . '_' . $index;
					unset( $options[ $index ] );
					delete_option( $title );
				}
			}
			update_option( 'caf_builder_layouts_list', $options );
		}
		return array(
				'status'  => 'success',
				'message' => 'Filters Deleted Successfully',
			);
	} else {
		return array(
				'status'  => 'error',
				'message' => "Something went's Wrong",
			);
	}
}

function caf_delete_layout_permissions( $request ) {
	$post_id = absint( $request['post_id'] );
	if ( $post_id && 'caf_posts' === get_post_type( $post_id ) && get_post_status( $post_id ) ) {
		wp_trash_post( $post_id );
		return array(
				'status'  => 'success',
				'message' => 'Post deleted successfully.',
			);
	} else {
		return array(
				'status'  => 'error',
				'message' => 'Failed to delete post.',
			);
	}
}

function caf_generate_unique_title( $original_title, $post_type ) {

	// Remove existing " _(Copy)" or " _(Copy X)"
	$clean_title = preg_replace( '/\s_\((Copy)(\s\d+)?\)$/', '', $original_title );

	$count = 0;

	while ( true ) {

		if ( $count === 0 ) {
			$title = $clean_title . ' _(Copy)';
		} else {
			$title = $clean_title . ' _(Copy' . $count . ')';
		}

		$query = new WP_Query(
			array(
				'post_type'      => $post_type,
				'post_status'    => 'any',
				'title'          => $title,
				'posts_per_page' => 1,
				'fields'         => 'ids',
			)
		);

		if ( ! $query->have_posts() ) {
			break;
		}

		++$count;
	}

	return $title;
}




function duplicate_post( $post_id ) {
	$post = get_post( $post_id );
	if ( ! $post ) {
		return;
	}

	// Base copy title
	// $base_title = $post->post_title . ' -(Copy)';

	// Generate unique title
	$unique_title = caf_generate_unique_title( $post->post_title, $post->post_type );

	$new_post = array(
		'post_title'    => $unique_title,
		'post_content'  => $post->post_content,
		'post_status'   => 'draft',
		'post_author'   => $post->post_author,
		'post_type'     => $post->post_type,
		'post_excerpt'  => $post->post_excerpt,
		'post_category' => wp_get_post_categories( $post_id ),
	);

	$new_post_id = wp_insert_post( $new_post );

	// Copy post meta
	$post_meta = get_post_meta( $post_id );
	foreach ( $post_meta as $key => $value ) {
		update_post_meta( $new_post_id, $key, maybe_unserialize( $value[0] ) );
	}

	// Copy featured image
	$thumbnail_id = get_post_thumbnail_id( $post_id );
	if ( $thumbnail_id ) {
		set_post_thumbnail( $new_post_id, $thumbnail_id );
	}

	// Copy taxonomies
	$taxonomies = get_object_taxonomies( $post->post_type );
	foreach ( $taxonomies as $taxonomy ) {
		$terms = wp_get_post_terms( $post_id, $taxonomy );
		wp_set_post_terms( $new_post_id, wp_list_pluck( $terms, 'term_id' ), $taxonomy );
	}

	return $new_post_id;
}

function caf_clone_layout( $request ) {
	$post_id     = intval( $request['post_id'] );
	$new_post_id = duplicate_post( $post_id );
	if ( $new_post_id ) {
		return array(
				'status'  => 'success',
				'message' => 'Filter Clone successfully.',
			);
	} else {
		return array(
				'status'  => 'error',
				'message' => 'Failed to clone filter.',
			);
	}
}
// phpcs:disable
function caf_export_default_layout($request)
{
    $post_id = intval($request['post_id']);
    $result = array( 'result' => '' );
    if ($post_id) {
        $meta = get_post_meta($post_id);
        $meta['result'] = 'success';
        $json = json_encode($meta);
        $file_path = TC_CAF_PATH . "admin/json/general.json";
        $file_url = TC_CAF_URL . "admin/json/general.json";
        $fh = fopen($file_path, 'w');
        if ($fh) {
            fwrite($fh, $json);
            fclose($fh);
            $result['result'] = 'success';
            $result['file'] = $file_url;
            $result['filename'] = "caf-{$post_id}.json";
            return $result;
        } else {
            return array('result' => 'error', 'message' => 'Cannot write to file.');
        }
    } else {
        return array('result' => 'error', 'message' => 'Invalid post ID.');
    }
}
// phpcs:enable
function caf_export_builder_layout( $request ) {
	$index   = intval( $request['index'] );
	$options = get_option( 'caf_builder_layouts_list' );
	if ( $options[ $index ] ) {
		$layout       = $options[ $index ]['key'];
		$layout_label = $options[ $index ]['label'];
		$title        = 'caf_' . $layout . '_' . $index;
		if ( get_option( $title ) ) {
			$base_layout_data = caf_normalize_builder_layout_data( get_option( $title ) );
			$json_data        = wp_json_encode( $base_layout_data, JSON_PRETTY_PRINT );
			nocache_headers();
			header( 'Content-Type: application/json; charset=utf-8' );
			header(
				'Content-Disposition: attachment; filename="' . sanitize_file_name( $layout_label ) . '.json"'
			);
			// JSON file download; payload is already encoded.
			echo $json_data; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			exit;
		} else {
			return array(
				'success' => false,
				'data'    => array(
					'message' => __( 'Failed to export filter.', 'category-ajax-filter' ),
				),
			);
		}
	} else {
		return array(
			'success' => false,
			'data'    => array(
				'message' => __( 'Index id not found.', 'category-ajax-filter' ),
			),
		);
	}
}
function caf_generate_unique_layout_name( $base_name ) {

	$layouts = get_option( 'caf_builder_layouts_list', array() );
	$labels  = wp_list_pluck( $layouts, 'label' );

	// Remove _Copy, _Copy1, _Copy2 etc (case-insensitive)
	$clean_name = preg_replace( '/_Copy\d*$/i', '', $base_name );

	// First try: _Copy
	if ( ! in_array( $clean_name . '_Copy', $labels, true ) ) {
		return $clean_name . '_Copy';
	}

	// Then try: _Copy1, _Copy2, _Copy3...
	$count = 1;
	while ( true ) {
		$new_name = $clean_name . '_Copy' . $count;

		if ( ! in_array( $new_name, $labels, true ) ) {
			return $new_name;
		}

		++$count;
	}
}

function caf_clone_builder_layout( $request ) {
	$index   = intval( $request['index'] );
	$options = get_option( 'caf_builder_layouts_list' );
	if ( $options[ $index ] ) {
		$layout       = $options[ $index ]['key'];
		$layout_label = $options[ $index ]['label'];

		$title = 'caf_' . $layout . '_' . $index;
		if ( get_option( $title ) ) {
			$baseLayoutData = caf_normalize_builder_layout_data( get_option( $title ) );
			// $copy_suffix = "_Copy";
			// $new_layout_name = $layout_label . $copy_suffix;
			$new_layout_name = caf_generate_unique_layout_name( $layout_label );
			// return ;
			$layout_key = save_new_layout_list( $new_layout_name );

			$prifix                                      = 'caf_';
			$new_layout_key                              = $prifix . $layout_key['key'];
			$baseLayoutData->common_data->layout_key     = $new_layout_key;
			$baseLayoutData->common_data->layout_name    = $new_layout_name;
			$baseLayoutData->common_data->layout_publish = 'draft';
			$baseLayoutData->common_data->layout_index   = $layout_key['index'];

			update_option( $new_layout_key, $baseLayoutData );
			if ( isset( $layout_key['index'] ) && is_numeric( $layout_key['index'] ) ) {
				caf_builder_invalidate_layout_cache( (int) $layout_key['index'] );
			}
			return array(
					'status'  => 'success',
					'message' => 'Filter Clone successfully.',
				);
		} else {
			return array(
					'status'  => 'error',
					'message' => 'Failed to clone filter.',
				);
		}
	} else {
		return array(
				'status'  => 'error',
				'message' => 'Index id Not Found.',
			);
	}
}

function caf_delete_layout_permanent( $request ) {
	$post_id = absint( $request['post_id'] );
	if ( $post_id && 'caf_posts' === get_post_type( $post_id ) && wp_delete_post( $post_id, true ) ) {
		return array(
				'status'  => 'success',
				'message' => 'Post deleted successfully.',
			);
	} else {
		return array(
				'status'  => 'error',
				'message' => 'Failed to delete post.',
			);
	}
}

function caf_restore_layout( $request ) {
	$post_id = absint( $request['post_id'] );
	if ( $post_id && 'caf_posts' === get_post_type( $post_id ) && get_post_status( $post_id ) ) {
		wp_untrash_post( $post_id );
		return array(
				'status'  => 'success',
				'message' => 'Post Restore successfully.',
			);
	} else {
		return array(
				'status'  => 'error',
				'message' => 'Failed to Restore Post.',
			);
	}
}

function caf_get_post_types_list( $request = null ) {
	$results    = array();
	$post_types = get_post_types( array( 'public' => true ), 'objects' );
	$excluded_post_types = caf_builder_apply_filters(
		'caf_pro_builder_excluded_post_types',
		array(
			'attachment',
			'product',
		)
	);
	if ( ! empty( $excluded_post_types ) ) {
		foreach ( $excluded_post_types as $excluded_post_type ) {
			unset( $post_types[ $excluded_post_type ] );
		}
	}
	foreach ( $post_types  as  $post_type ) {
		$results[] = array(
			'value' => $post_type->name,
			'label' => $post_type->label,
		);
	}

	$current_post_type = '';
	if ( $request instanceof WP_REST_Request ) {
		$current_post_type = sanitize_key( (string) $request->get_param( 'current_post_type' ) );
	}
	if ( '' === $current_post_type && isset( $_GET['current_post_type'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$current_post_type = sanitize_key( wp_unslash( $_GET['current_post_type'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	}
	$results = caf_builder_append_unavailable_post_type_option( $results, $current_post_type );

	return array(
			'status'             => 'success',
			'post_types'         => $results,
			'woocommerce_active' => class_exists( 'WooCommerce', false ),
		);
}
/**
 * Get unserialized option data
 */
function caf_get_unserialized_option_data($option_name) {
    
    $optionData = get_option($option_name);

    if ( empty($optionData) ) {
        return [];
    }

    // Automatically unserialize if serialized
    return maybe_unserialize($optionData);
}
function caf_get_layouts_list( $data ) {
	$args           = array(
		'post_type'      => 'caf_posts',
		'posts_per_page' => -1,
		'post_status'    => array( 'publish', 'draft' ),
	);
	$posts          = get_posts( $args );
	$opt            = 'caf_builder_layouts_list';
	$blList         = get_option( $opt );
	$filteredBlList = array();
	if ( ! empty( $blList ) ) {
		$filteredBlList = array_filter(
			$blList,
			function ( $item ) {
				return ( ! isset( $item['post_status'] ) || $item['post_status'] !== 'trash' );
			}
		);
	}
	$results = array();
	if ( ! empty( $posts ) ) {
		foreach ( $posts as $post ) {
			$post->shortcode     = "[caf_filter id='" . $post->ID . "']";
			$post->layout_source = 'Old Panel';
			$post->list_index    = '';
			$results[]           = $post;
		}
	}
	if ( ! empty( $filteredBlList ) ) {
		foreach ( $filteredBlList as $key => $layout ) {
			$title = 'caf_' . $layout['key'] . '_' . $key;
			if ( get_option(trim($title)) ) {
				$layout['layout_data'] = caf_get_unserialized_option_data($title);
			}
			// $post_status ="false";
			// if(get_option($title)){
			// $layoutData = get_option($title);
			// $post_status = $layoutData->common_data->layout_publish;
			// }
			$layout['shortcode']     = "[caf_filter id='caf_" . $key . "']";
			$layout['layout_source'] = 'Builder';
			$layout['list_index']    = $key;
			$layout['ID']            = 'caf_' . $layout['key'] . '_' . $key;
			$layout['post_title']    = $layout['label'];
			// $layout['post_status']=$post_status;
			$results[] = $layout;
		}
	}
	usort(
		$results,
		function ( $a, $b ) {
	
			$dateA = is_object( $a )
				? strtotime( $a->post_date ?? '' )
				: strtotime( $a['post_date'] ?? '' );

			$dateB = is_object( $b )
				? strtotime( $b->post_date ?? '' )
				: strtotime( $b['post_date'] ?? '' );
	
			return $dateB - $dateA; // DESC (newest first)
		}
	);

	if (isset($data['search']) && !empty($data['search'])) {
		$search = $data['search'];
	
		$results = array_filter($results, function($item) use ($search) {
	
			// object or array both handle 
			$title = is_object($item)
				? ($item->post_title ?? '')
				: ($item['post_title'] ?? '');
	
			return !empty($title) && stripos($title, $search) !== false;
		});
	}

	if ( count( $results ) > 0 ) {
		$perPage          = isset( $data['perPage'] ) ? (int) $data['perPage'] : 10;
		$currentPage      = isset( $data['page'] ) ? (int) $data['page'] : 1;
		$startIndex       = ( $currentPage - 1 ) * $perPage;
		$paginatedResults = array_slice( $results, $startIndex, $perPage );
		$totalItems       = count( $results );
		$totalPages       = ceil( $totalItems / $perPage );
		// REST callbacks must return data (not echo) so WP can send headers cleanly.
		return array(
			'status'        => 'success',
			'layouts_list'  => $paginatedResults,
			'current_page'  => $currentPage,
			'total_page'    => $totalPages,
			'total_filters' => $totalItems,
		);
	}

	$currentPage = isset( $data['page'] ) ? (int) $data['page'] : 1;
	return array(
		'status'        => 'success',
		'layouts_list'  => $results,
		'current_page'  => $currentPage,
		'total_page'    => 1,
		'total_filters' => 0,
	);
}
function caf_get_trash_layouts_list( $data ) {
	$args           = array(
		'post_type'      => 'caf_posts',
		'posts_per_page' => -1,
		'post_status'    => array( 'trash' ),
	);
	$posts          = get_posts( $args );
	$opt            = 'caf_builder_layouts_list';
	$blList         = get_option( $opt );
	$filteredBlList = array();
	if ( ! empty( $blList ) ) {
		$filteredBlList = array_filter(
			$blList,
			function ( $item ) {
				return ( $item['post_status'] == 'trash' );
			}
		);
	}
	$results = array();
	if ( ! empty( $posts ) ) {
		foreach ( $posts as $post ) {
			$post->shortcode     = "[caf_filter id='" . $post->ID . "']";
			$post->layout_source = 'Old Panel';
			$post->list_index    = '';
			$results[]           = $post;
		}
	}
	if ( ! empty( $filteredBlList ) ) {
		foreach ( $filteredBlList as $key => $layout ) {
			$title = 'caf_' . $layout['key'] . '_' . $key;
			// $post_status ="false";
			// if(get_option($title)){
			// $layoutData = get_option($title);
			// $post_status = $layoutData->common_data->layout_publish;
			// }
			$layout['shortcode']     = "[caf_filter id='caf_" . $key . "']";
			$layout['layout_source'] = 'Builder';
			$layout['list_index']    = $key;
			$layout['ID']            = 'caf_' . $layout['key'] . '_' . $key;
			$layout['post_title']    = $layout['label'];
			// $layout['post_status']=$post_status;
			$results[] = $layout;
		}
	}
		usort(
			$results,
			function ( $a, $b ) {
		
				$dateA = is_object( $a )
					? strtotime( $a->post_date ?? '' )
					: strtotime( $a['post_date'] ?? '' );

				$dateB = is_object( $b )
					? strtotime( $b->post_date ?? '' )
					: strtotime( $b['post_date'] ?? '' );
		
				return $dateB - $dateA; // DESC (newest first)
			}
		);

		if (isset($data['search']) && !empty($data['search'])) {
			$search = $data['search'];
		
			$results = array_filter($results, function($item) use ($search) {
		
				// object or array both handle 
				$title = is_object($item)
					? ($item->post_title ?? '')
					: ($item['post_title'] ?? '');
		
				return !empty($title) && stripos($title, $search) !== false;
			});
		}

	if ( count( $results ) > 0 ) {
		$perPage          = isset( $data['perPage'] ) ? (int) $data['perPage'] : 10;
		$currentPage      = isset( $data['page'] ) ? (int) $data['page'] : 1;
		$startIndex       = ( $currentPage - 1 ) * $perPage;
		$paginatedResults = array_slice( $results, $startIndex, $perPage );
		$totalItems       = count( $results );
		$totalPages       = ceil( $totalItems / $perPage );
		// REST callbacks must return data (not echo) so WP can send headers cleanly.
		return array(
			'status'              => 'success',
			'layouts_list'        => $paginatedResults,
			'current_page'        => $currentPage,
			'total_page'          => $totalPages,
			'total_trash_filters' => $totalItems,
		);
	}

	$currentPage = isset( $data['page'] ) ? (int) $data['page'] : 1;
	return array(
		'status'              => 'success',
		'layouts_list'        => $results,
		'current_page'        => $currentPage,
		'total_page'          => 1,
		'total_trash_filters' => 0,
	);
}
function caf_save_builder_layout_option( $data ) {
	$layout_data                            = caf_normalize_builder_layout_data( json_decode( $data['layout_data'] ) );
	$layout_name                            = $layout_data->common_data->layout_name;
	$layout_key                             = save_new_layout_list( $layout_name );
	if ( is_wp_error( $layout_key ) ) {
		return array(
				'status'  => 'error',
				'message' => $layout_key->get_error_message(),
			);
	}
	$prifix                                 = 'caf_';
	$title                                  = $prifix . $layout_key['key'];
	$layout_data->common_data->layout_key   = $title;
	$layout_data->common_data->layout_index = $layout_key['index'];
	update_option( $title, $layout_data );
	if ( isset( $layout_key['index'] ) && is_numeric( $layout_key['index'] ) ) {
		caf_builder_invalidate_layout_cache( (int) $layout_key['index'] );
	}
	return array(
			'status'       => 'success',
			'layout_data'  => get_option( $title ),
			'layout_key'   => $title,
			'layout_index' => $layout_key['index'],
		);
}
/**
 * Clear cached layout bundle/CSS after builder save or delete.
 *
 * @param int $shortindex Layout shortcode index.
 * @return void
 */
function caf_builder_invalidate_layout_cache( $shortindex ) {
	if ( ! class_exists( 'CAF_Builder_Ajax_Performance' ) ) {
		return;
	}
	require_once TC_CAF_PATH . 'includes/frontend/class-caf-builder-ajax-performance.php';
	CAF_Builder_Ajax_Performance::invalidate_layout_cache( $shortindex );
}
function save_new_layout_list( $layout_name ) {
	ob_start();
	if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_create_layout() ) {
		return new WP_Error(
			'caf_layout_limit',
			__( 'Free version allows a limited number of builder layouts. Upgrade to CAF Pro for unlimited layouts.', 'category-ajax-filter' )
		);
	}
	$opt   = 'caf_builder_layouts_list';
	$title = $layout_name;
	$key   = $layout_name;
	$key   = strtolower( trim( $key ) );
	$key   = str_replace( ' ', '', $key );
	if ( get_option( $opt ) ) {
		$layouts   = get_option( $opt );
		$layouts[] = array(
			'key'         => $key,
			'label'       => $title,
			'post_status' => 'draft',
			'post_date' => current_time('mysql'),
		);
		update_option( $opt, $layouts );
	} else {
		$layouts[] = array(
			'key'         => $key,
			'label'       => $title,
			'post_status' => 'draft',
			'post_date' => current_time('mysql'),
		);
		update_option( $opt, $layouts );
	}
	$layoutsList = get_option( $opt );
	$lastIndex   = array_key_last( $layoutsList );
	return array(
		'key'   => $key . '_' . $lastIndex,
		'index' => $lastIndex,
	);
	// $lastIndex = array_key_last($layoutsList);
	// return $lastIndex;
}
function caf_delete_builder_layout( $data ) {
	$index   = $data['index'];
	$options = get_option( 'caf_builder_layouts_list' );
	if ( $options[ $index ] ) {
		$options[ $index ]['post_status'] = 'trash';
		update_option( 'caf_builder_layouts_list', $options );
		return array(
				'status'  => 'success',
				'message' => 'Layout Trashed Successfully',
			);
	} else {
		return array(
				'status' => 'success',
				'error'  => 'Layout Not Found',
			);
	}
}
function caf_delete_builder_layout_permanent( $data ) {
	$index   = $data['index'];
	$options = get_option( 'caf_builder_layouts_list' );
	if ( $options[ $index ] ) {
		$layout = $options[ $index ]['key'];
		$title  = 'caf_' . $layout . '_' . $index;
		unset( $options[ $index ] );
		delete_option( $title );
		update_option( 'caf_builder_layouts_list', $options );
		caf_builder_invalidate_layout_cache( (int) $index );
		return array(
				'status'  => 'success',
				'message' => 'Layout Deleted Successfully',
			);
	} else {
		return array(
				'status' => 'success',
				'error'  => 'Layout Not Found',
			);
	}
}
function caf_restore_builder_layout( $data ) {
	$index   = $data['index'];
	$options = get_option( 'caf_builder_layouts_list' );
	if ( $options[ $index ] ) {
		$options[ $index ]['post_status'] = 'draft';
		update_option( 'caf_builder_layouts_list', $options );
		return array(
				'status'  => 'success',
				'message' => 'Layout Restored Successfully',
			);
	} else {
		return array(
				'status' => 'success',
				'error'  => 'Layout Not Found',
			);
	}
}
function caf_add_term_links( $terms ) {

	if ( empty( $terms ) || is_wp_error( $terms ) ) {
		return $terms;
	}

	foreach ( $terms as &$term ) {

		$term_link = get_term_link( $term );

		if ( ! is_wp_error( $term_link ) ) {
			$term->term_link = $term_link;
		} else {
			$term->term_link = '#';
		}
	}
	unset( $term );
	return $terms;
}
function caf_get_posts_list( $data ) {
	$post_type = '';
	if ( is_object( $data ) && method_exists( $data, 'get_param' ) ) {
		$post_type = sanitize_key( (string) $data->get_param( 'post_type' ) );
	} elseif ( is_array( $data ) && isset( $data['post_type'] ) ) {
		$post_type = sanitize_key( (string) $data['post_type'] );
	}

	if ( '' === $post_type ) {
		return new WP_REST_Response(
			array(
				'status'  => 'error',
				'message' => 'Post type is required.',
			),
			400
		);
	}

	$query      = new WP_Query(
		array(
			'post_type'      => $post_type,
			'post_status'    => 'publish',
			'posts_per_page' => -1,
		)
	);
	$postsList  = array();
	$taxo       = get_object_taxonomies( $post_type, 'objects' );
	$imageArray = array();
	while ( $query->have_posts() ) {
		global $post;
		$query->the_post();
		$post_id               = get_the_ID();
		$excerpt               = get_the_excerpt();
		$content               = get_post_type_object( $post_type );
		$post_url              = get_permalink();
		$imageurl              = get_the_post_thumbnail_url();
		$filterd_custom_fields = caf_build_post_meta_fields_for_builder( $post_id, $post_type );

		$trms = array();
		if ( $taxo ) {
			foreach ( $taxo as $tax ) {
				$terms              = wp_get_post_terms( $post_id, $tax->name );
				$trms[ $tax->name ] = caf_add_term_links( $terms );
			}
		}

		// $imageArray = ["sizes" => get_intermediate_image_sizes()];
		$imageArray   = array( 'sizes' => array( 'thumbnail', 'medium', 'medium_large', 'large' ) );
		$thumbnail_id = get_post_thumbnail_id( $post_id );
		foreach ( $imageArray['sizes'] as $size ) {
			$thumbnail_url       = wp_get_attachment_image_src( $thumbnail_id, $size );
			$imageArray[ $size ] = ( is_array( $thumbnail_url ) && ! empty( $thumbnail_url[0] ) )
				? esc_url( $thumbnail_url[0] )
				: '';
		}
		$postsList[] = array(
			'label'         => get_the_title(),
			'value'         => $post_id,
			'id'            => $post_id,
			'key'           => $post_id,
			'title'         => get_the_title(),
			'description'   => get_the_content(),
			'excerpt'       => $excerpt,
			'url'           => $post_url,
			'image'         => $imageurl,
			'imageArray'    => $imageArray,
			'taxonomies'    => $taxo,
			'categories'    => $trms,
			'author'        => get_the_author(),
			'author_avatar' => get_author_avatar_url( $post_id ),
			'date'          => get_the_date( 'd-m-y' ),
			'post_date'     => get_post() ? get_post()->post_date : '',
			'meta_fields'   => $filterd_custom_fields,
			'customtext'    => 'Custom text',
			'commentcount'  => get_comments_number(),
			'product'       => ( 'product' === $post_type && class_exists( 'CAF_Free_Woo' ) )
				? CAF_Free_Woo::get_preview_data( $post_id )
				: null,
			'price_data'    => ( 'product' === $post_type && class_exists( 'CAF_Free_Woo' ) )
				? CAF_Free_Woo::get_price_data( $post_id )
				: array(),
		);
	}
	wp_reset_postdata();
	$resultsCount = array(
		'start'         => '1',
		'end'           => $query->found_posts,
		'total_results' => $query->found_posts,
	);
	return new WP_REST_Response(
		array(
			'status'        => 'success',
			'posts_list'    => $postsList,
			'results_count' => $resultsCount,
		),
		200
	);
}
/**
 * Builder taxonomy picker label (Woo attributes use the admin label, not "Product …").
 *
 * @param WP_Taxonomy|string $taxonomy Taxonomy object or registered name.
 * @return string
 */
function caf_get_builder_taxonomy_label( $taxonomy ) {
	if ( is_string( $taxonomy ) ) {
		$taxonomy = get_taxonomy( $taxonomy );
	}

	if ( ! $taxonomy || empty( $taxonomy->name ) ) {
		return '';
	}

	if ( 0 === strpos( $taxonomy->name, 'pa_' ) && function_exists( 'wc_attribute_label' ) ) {
		$attribute_label = wc_attribute_label( $taxonomy->name );
		if ( is_string( $attribute_label ) && '' !== $attribute_label ) {
			return $attribute_label;
		}
	}

	return isset( $taxonomy->label ) ? (string) $taxonomy->label : '';
}

function caf_get_taxo_data_with_recursive_method( $request ) {
	$post_type = $request['post-type'];
	if ( ! empty( $post_type ) ) {
		$taxonomies    = get_object_taxonomies( $post_type, 'objects' );
		$taxonomy_tree = array();
		if ( ! empty( $taxonomies ) ) {
			foreach ( $taxonomies as $taxonomy ) {
				$terms = get_terms(
					array(
						'taxonomy'   => $taxonomy->name,
						'hide_empty' => false,
					)
				);

				if ( ! empty( $terms ) ) {
					$term_data = build_term_tree_with_counts( $terms, $taxonomy->name ,$post_type);

					$taxonomy_tree[] = array(
						'key'       => $taxonomy->name,
						'label'     => caf_get_builder_taxonomy_label( $taxonomy ),
						'term_data' => $term_data,
					);
				}
			}
			return array(
					'status'        => 'success',
					'taxonomy_list' => $taxonomy_tree,
				);
		} else {
			return array(
					'status'        => 'success',
					'taxonomy_list' => null,
					'message'       => 'taxonomies are not exist',
				);
		}
	} else {
		return array(
				'status'        => 'success',
				'taxonomy_list' => null,
				'message'       => 'post type not exist',
			);
	}
}


function build_term_tree_with_counts( $terms, $taxonomy_name ,$post_type) {
	if ( is_wp_error( $terms ) || empty( $terms ) ) {
		return array();
	}

	$term_lookup = array();
	foreach ( $terms as $term ) {
		$term->children_data           = array();
		$term_lookup[ $term->term_id ] = $term;
	}

	$roots = array();
	foreach ( $terms as $term ) {
		if ( ! empty( $term->parent ) && isset( $term_lookup[ $term->parent ] ) ) {
			$term_lookup[ $term->parent ]->children_data[] = $term;
		} else {
			$roots[] = $term;
		}
	}

	// Helper to get unique post IDs under a term (including descendants)
	$get_post_ids = function ( $term_id, $taxonomy_name ) use ( &$get_post_ids, $term_lookup, $post_type) {
		$args = array(
			'post_type'              => $post_type,
			'post_status'            => 'publish',
			'fields'                 => 'ids',
			'posts_per_page'         => -1,
			'no_found_rows'          => true,
			'update_post_meta_cache' => false,
			'update_post_term_cache' => false,
			'tax_query'              => array(
				array(
					'taxonomy'         => $taxonomy_name,
					'terms'            => $term_id,
					'include_children' => false,
				),
			),
		);

		// Match Woo catalog rules so baked counts match shop / filter results.
		if ( class_exists( 'CAF_Free_Woo' ) ) {
			$args = CAF_Free_Woo::append_product_visibility_to_query_args( $args );
		}

		$query    = new WP_Query( $args );
		$post_ids = ! empty( $query->posts ) ? $query->posts : array();

		// Include child terms (recursively)
		if ( ! empty( $term_lookup[ $term_id ]->children_data ) ) {
			foreach ( $term_lookup[ $term_id ]->children_data as $child ) {
				$child_posts = $get_post_ids( $child->term_id, $taxonomy_name );
				$post_ids    = array_merge( $post_ids, $child_posts );
			}
		}

		// Remove duplicate post IDs
		return array_unique( $post_ids );
	};

	// Recursive conversion with accurate count
	$to_array = function ( $term ) use ( &$to_array, &$get_post_ids, $taxonomy_name ) {
		$post_ids    = $get_post_ids( $term->term_id, $taxonomy_name );
		$total_count = count( $post_ids );

		$children_arr = array();
		if ( ! empty( $term->children_data ) ) {
			foreach ( $term->children_data as $child ) {
				$children_arr[] = $to_array( $child );
			}
		}

		return array(
			'id'            => (int) $term->term_id,
			'name'          => $term->name,
			'slug'          => $term->slug,
			'count'         => (int) $term->count,
			'total_count'   => $total_count, // ✅ unique post count
			'children_data' => $children_arr,
		);
	};

	$output = array();
	foreach ( $roots as $root ) {
		$output[] = $to_array( $root );
	}
	return $output;
}

/* start api for testing puspose*/
add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'caf-custom-builder/v1',
			'/upload-icon/',
			array(
				'methods'             => 'POST',
				'callback'            => 'handle_image_upload',
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			)
		);
	}
);
// phpcs:disable
function handle_image_upload($data)
{
	if ( ! current_user_can( 'manage_options' ) ) {
		return new WP_Error( 'caf_upload_forbidden', 'Unauthorized request.', array( 'status' => 403 ) );
	}

	$files = method_exists( $data, 'get_file_params' ) ? $data->get_file_params() : array();
	if ( empty( $files['file'] ) || empty( $files['file']['tmp_name'] ) ) {
		return rest_ensure_response( array( 'status' => 'error', 'message' => 'No file provided.' ) );
	}

	$file = $files['file'];
	if ( ! isset( $file['error'] ) || UPLOAD_ERR_OK !== (int) $file['error'] ) {
		return rest_ensure_response( array( 'status' => 'error', 'message' => 'Upload failed.' ) );
	}

	$allowed_mimes = array(
		'jpg|jpeg|jpe' => 'image/jpeg',
		'png'          => 'image/png',
		'gif'          => 'image/gif',
		'webp'         => 'image/webp',
	);
	$filetype      = wp_check_filetype_and_ext( $file['tmp_name'], $file['name'], $allowed_mimes );
	if ( empty( $filetype['ext'] ) || empty( $filetype['type'] ) ) {
		return rest_ensure_response( array( 'status' => 'error', 'message' => 'Invalid file type.' ) );
	}

	$target_dir = trailingslashit( __DIR__ ) . 'loader-icons/';
	if ( ! file_exists( $target_dir ) ) {
		wp_mkdir_p( $target_dir );
	}

	$base_name     = 'caf-loader-img-' . time() . '.' . $filetype['ext'];
	$new_file_name = wp_unique_filename( $target_dir, sanitize_file_name( $base_name ) );
	$target_file   = $target_dir . $new_file_name;

	if ( ! move_uploaded_file( $file['tmp_name'], $target_file ) ) {
		return rest_ensure_response( array( 'status' => 'error', 'message' => 'Upload failed.' ) );
	}

	$file_url = plugins_url( 'loader-icons/' . $new_file_name, __FILE__ );
	return rest_ensure_response(
		array(
			'status'   => 'success',
			'message'  => 'File uploaded successfully',
			'fileName' => sanitize_file_name( $file['name'] ),
			'fileUrl'  => esc_url_raw( $file_url ),
		)
	);
}

// phpcs:enable
/* end api for testing puspose*/

function caf_free_get_builder_filters_admin_url() {
	return admin_url( 'edit.php?post_type=caf_posts&builder=1' );
}

function caf_free_register_caf_admin_submenus() {
	remove_submenu_page( 'edit.php?post_type=caf_posts', 'edit.php?post_type=caf_posts' );
	remove_submenu_page( 'edit.php?post_type=caf_posts', 'post-new.php?post_type=caf_posts' );

	add_submenu_page(
		'edit.php?post_type=caf_posts',
		__( 'Filters', 'category-ajax-filter' ),
		__( 'Filters', 'category-ajax-filter' ),
		'manage_options',
		'caf-free-builder-filters',
		'__return_empty_string'
	);

	global $submenu;

	if ( ! isset( $submenu['edit.php?post_type=caf_posts'] ) || ! is_array( $submenu['edit.php?post_type=caf_posts'] ) ) {
		return;
	}

	$builder_url = 'edit.php?post_type=caf_posts&builder=1';

	foreach ( $submenu['edit.php?post_type=caf_posts'] as $key => $menu_item ) {
		if ( ! isset( $menu_item[2] ) ) {
			continue;
		}

		$menu_slug = (string) $menu_item[2];

		if (
			'caf-free-builder-filters' === $menu_slug
			|| false !== strpos( $menu_slug, 'caf-free-builder-filters' )
		) {
			$submenu['edit.php?post_type=caf_posts'][ $key ][2] = $builder_url;
		}
	}
}
add_action( 'admin_menu', 'caf_free_register_caf_admin_submenus', 99998 );

/**
 * Redirect caf_posts list URLs to the React builder screen.
 *
 * @return void
 */
function caf_free_redirect_caf_posts_to_builder() {
	global $pagenow;

	if ( ! is_admin() || 'edit.php' !== $pagenow ) {
		return;
	}

	if ( ! isset( $_GET['post_type'] ) || 'caf_posts' !== $_GET['post_type'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return;
	}

	$page    = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$builder = isset( $_GET['builder'] ) ? (string) wp_unslash( $_GET['builder'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

	if ( 'caf-free-builder-filters' === $page ) {
		wp_safe_redirect( caf_free_get_builder_filters_admin_url() );
		exit;
	}

	if ( '1' === $builder ) {
		return;
	}

	if ( '' !== $page ) {
		return;
	}

	wp_safe_redirect( caf_free_get_builder_filters_admin_url() );
	exit;
}
add_action( 'admin_init', 'caf_free_redirect_caf_posts_to_builder' );

/**
 * Keep "Filters" submenu highlighted on caf_posts builder list screen.
 *
 * @param string $submenu_file Current submenu slug.
 * @return string
 */
function caf_force_filters_submenu_active( $submenu_file ) {
	global $pagenow;

	if ( 'edit.php' !== $pagenow || ! isset( $_GET['post_type'] ) || 'caf_posts' !== $_GET['post_type'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return $submenu_file;
	}

	$page    = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	$builder = isset( $_GET['builder'] ) ? (string) wp_unslash( $_GET['builder'] ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended

	if ( '1' === $builder || '' === $page ) {
		return 'edit.php?post_type=caf_posts&builder=1';
	}

	return $submenu_file;
}
add_filter( 'submenu_file', 'caf_force_filters_submenu_active', 100 );







/* For Testing Purpose */

function get_posts_with_both_terms() {
	$args = array(
		'post_type'      => 'post', // Replace with your custom post type if needed
		'posts_per_page' => -1,
		'tax_query'      => array(
			'relation' => 'AND',
			array(
				'taxonomy' => 'category', // Replace with your taxonomy slug
				'field'    => 'term_id',
				'terms'    => array( 59 ),
				'operator' => 'IN',
			),
			array(
				'taxonomy' => 'category', // Same taxonomy
				'field'    => 'term_id',
				'terms'    => array( 35 ),
				'operator' => 'IN',
			),
		),
	);

	$query = new WP_Query( $args );

	if ( $query->have_posts() ) {
		$output = '<ul>';
		while ( $query->have_posts() ) {
			$query->the_post();
			$output .= '<li><a href="' . get_permalink() . '">' . get_the_title() . '</a></li>';
		}
		$output .= '</ul>';
		wp_reset_postdata();
	} else {
		$output = '<p>No posts found with both terms.</p>';
	}

	return $output;
}

add_shortcode( 'custom_tax_query_posts', 'get_posts_with_both_terms' );

function get_author_avatar_url( $postid ) {

	$author_id = get_post_field( 'post_author', $postid );

	if ( ! $author_id ) {
		return '';
	}

	$avatar_url = get_avatar_url( $author_id );

	return esc_url_raw( $avatar_url );
}

// add_shortcode( 'author_avatar_url', 'get_author_avatar_url_shortcode' );
