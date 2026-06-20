<?php
/**
 * Frontend Builder URL filter state (readable shareable query strings).
 *
 * Readable examples (builder index 0):
 *   ?caf_0_category=electric-cars
 *   ?caf_0_category=12,15
 *   ?caf_0_cf_color=red
 *   ?caf_0_s=keyword
 *   ?caf_0_orderby=date&caf_0_order=DESC
 *
 * Legacy personal-link style:
 *   ?caf_term=electric-cars&caf_tax=category
 *   ?caf_0_term=12&caf_0_tax=category
 *
 * @package TC_CAF_PRO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_PRO_Builder_Url_State {

	const LEGACY_BLOB_PREFIX = 'caf_filter_';

	/**
	 * Reserved readable suffixes (not taxonomy names).
	 *
	 * @var array<int, string>
	 */
	protected static $reserved_suffixes = array(
		's',
		'orderby',
		'order',
		'tax',
		'term',
	);

	/**
	 * Whether filter URLs are enabled.
	 *
	 * @param int $shortindex Builder index.
	 * @return bool
	 */
	public static function is_enabled( $shortindex ) {
		$layout_enabled = 'Enable' === (string) get_option( 'caf_builder_filter_url_' . absint( $shortindex ), 'Enable' );
		if ( ! $layout_enabled ) {
			return false;
		}

		return (bool) apply_filters( 'caf_builder_enable_filter_urls', true, $shortindex );
	}

	/**
	 * Readable param prefix for a builder instance.
	 *
	 * @param int $shortindex Builder index.
	 * @return string
	 */
	public static function get_readable_prefix( $shortindex ) {
		return 'caf_' . absint( $shortindex ) . '_';
	}

	/**
	 * Legacy blob param (backward compatibility).
	 *
	 * @param int $shortindex Builder index.
	 * @return string
	 */
	public static function get_legacy_blob_param_name( $shortindex ) {
		return self::LEGACY_BLOB_PREFIX . absint( $shortindex );
	}

	/**
	 * Parse filter state from the current request.
	 *
	 * @param int $shortindex Builder index.
	 * @return array
	 */
	public static function get_state_from_request( $shortindex ) {
		if ( ! self::is_enabled( $shortindex ) ) {
			return array();
		}

		$state = self::parse_readable_request_params( $shortindex );
		if ( ! empty( $state ) ) {
			return $state;
		}

		$legacy = self::parse_legacy_term_link_params( $shortindex );
		if ( ! empty( $legacy ) ) {
			return $legacy;
		}

		return self::parse_legacy_blob_param( $shortindex );
	}

	/**
	 * Whether the current request included URL filter state.
	 *
	 * @param int $shortindex Builder index.
	 * @return bool
	 */
	public static function request_has_state( $shortindex ) {
		return ! empty( self::get_state_from_request( $shortindex ) );
	}

	/**
	 * Extract WP_Query args from parsed URL state.
	 *
	 * @param array $state Parsed state.
	 * @return array
	 */
	public static function state_to_query_args( $state ) {
		if ( empty( $state ) || ! is_array( $state ) ) {
			return array();
		}

		$args = array();
		foreach ( array( 'tax_query', 'meta_query', 's', 'caf_search_keyword', 'caf_search_source', 'caf_search_custom_field', 'orderby', 'order' ) as $key ) {
			if ( ! array_key_exists( $key, $state ) ) {
				continue;
			}
			$args[ $key ] = $state[ $key ];
		}

		if ( function_exists( 'caf_builder_validate_query_args' ) ) {
			$args = caf_builder_validate_query_args( $args );
		}

		if ( function_exists( 'clean_query_args' ) ) {
			$args = clean_query_args( $args );
		}

		return $args;
	}

	/**
	 * Merge URL filter args into initial page-load query args.
	 *
	 * @param array $args       Base page-load args.
	 * @param int   $shortindex Builder index.
	 * @return array
	 */
	public static function apply_to_page_load_args( $args, $shortindex ) {
		if ( ! is_array( $args ) ) {
			$args = array();
		}

		$url_args = self::state_to_query_args( self::get_state_from_request( $shortindex ) );
		if ( empty( $url_args ) ) {
			return $args;
		}

		if ( array_key_exists( 'tax_query', $url_args ) ) {
			if ( ! empty( $url_args['tax_query'] ) ) {
				$args['tax_query'] = $url_args['tax_query'];
			} else {
				unset( $args['tax_query'] );
			}
		}

		if ( array_key_exists( 'meta_query', $url_args ) ) {
			if ( ! empty( $url_args['meta_query'] ) ) {
				$args['meta_query'] = $url_args['meta_query'];
			} else {
				unset( $args['meta_query'] );
			}
		}

		foreach ( array( 's', 'caf_search_keyword', 'caf_search_source', 'caf_search_custom_field', 'orderby', 'order' ) as $key ) {
			if ( ! array_key_exists( $key, $url_args ) ) {
				continue;
			}
			if ( '' === $url_args[ $key ] || null === $url_args[ $key ] ) {
				unset( $args[ $key ] );
				continue;
			}
			$args[ $key ] = $url_args[ $key ];
		}

		return $args;
	}

	/**
	 * Parse readable caf_{index}_* query params.
	 *
	 * @param int $shortindex Builder index.
	 * @return array
	 */
	protected static function parse_readable_request_params( $shortindex ) {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( empty( $_GET ) || ! is_array( $_GET ) ) {
			return array();
		}

		$prefix     = self::get_readable_prefix( $shortindex );
		$tax_groups = array();
		$meta_items = array();
		$state      = array();

		foreach ( $_GET as $raw_key => $raw_value ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			if ( ! is_string( $raw_key ) || 0 !== strpos( $raw_key, $prefix ) ) {
				continue;
			}

			$suffix = substr( $raw_key, strlen( $prefix ) );
			if ( '' === $suffix ) {
				continue;
			}

			$value = sanitize_text_field( wp_unslash( (string) $raw_value ) );
			if ( '' === $value ) {
				continue;
			}

			if ( 's' === $suffix ) {
				$state['s']                  = $value;
				$state['caf_search_keyword'] = $value;
				continue;
			}

			if ( 'orderby' === $suffix ) {
				$state['orderby'] = sanitize_key( $value );
				continue;
			}

			if ( 'order' === $suffix ) {
				$state['order'] = strtoupper( sanitize_text_field( $value ) );
				continue;
			}

			if ( 0 === strpos( $suffix, 'cf_' ) ) {
				$meta_key = sanitize_key( substr( $suffix, 3 ) );
				if ( '' !== $meta_key ) {
					$meta_items[] = array(
						'key'     => $meta_key,
						'value'   => $value,
						'compare' => '=',
						'type'    => 'CHAR',
					);
				}
				continue;
			}

			if ( 0 === strpos( $suffix, 'range_' ) ) {
				$meta_key = sanitize_key( substr( $suffix, 6 ) );
				$clause   = self::parse_range_token( $meta_key, $value );
				if ( ! empty( $clause ) ) {
					$meta_items[] = $clause;
				}
				continue;
			}

			if ( in_array( $suffix, self::$reserved_suffixes, true ) ) {
				continue;
			}

			$taxonomy = sanitize_key( $suffix );
			if ( '' === $taxonomy ) {
				continue;
			}

			$tokens = array_filter( array_map( 'trim', explode( ',', $value ) ) );
			foreach ( $tokens as $token ) {
				$term_id = self::resolve_term_token( $taxonomy, $token );
				if ( $term_id > 0 ) {
					if ( ! isset( $tax_groups[ $taxonomy ] ) ) {
						$tax_groups[ $taxonomy ] = array();
					}
					$tax_groups[ $taxonomy ][] = $term_id;
				}
			}
		}

		if ( ! empty( $tax_groups ) ) {
			$state['tax_query'] = self::build_tax_query_from_groups( $tax_groups, $shortindex );
		}

		if ( ! empty( $meta_items ) ) {
			$state['meta_query'] = count( $meta_items ) > 1
				? array_merge( array( 'relation' => 'AND' ), $meta_items )
				: $meta_items;
		}

		return $state;
	}

	/**
	 * Legacy personal-link params: caf_term + caf_tax (global or scoped).
	 *
	 * @param int $shortindex Builder index.
	 * @return array
	 */
	protected static function parse_legacy_term_link_params( $shortindex ) {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$scoped_term = 'caf_' . absint( $shortindex ) . '_term';
		$scoped_tax  = 'caf_' . absint( $shortindex ) . '_tax';
		$term_raw    = '';
		$tax_raw     = '';

		if ( isset( $_GET[ $scoped_term ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$term_raw = sanitize_text_field( wp_unslash( (string) $_GET[ $scoped_term ] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$tax_raw  = isset( $_GET[ $scoped_tax ] ) ? sanitize_key( wp_unslash( (string) $_GET[ $scoped_tax ] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		} elseif ( 0 === absint( $shortindex ) && isset( $_GET['caf_term'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$term_raw = sanitize_text_field( wp_unslash( (string) $_GET['caf_term'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$tax_raw  = isset( $_GET['caf_tax'] ) ? sanitize_key( wp_unslash( (string) $_GET['caf_tax'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		}

		/**
		 * Map bare taxonomy query vars to builder URL state.
		 * Example: array( 'category' => 'category', 'product_cat' => 'product_cat' )
		 */
		$bare_tax_map = apply_filters( 'caf_builder_url_bare_taxonomy_params', array(), $shortindex );
		if ( '' === $term_raw && is_array( $bare_tax_map ) ) {
			foreach ( $bare_tax_map as $param => $taxonomy ) {
				if ( ! isset( $_GET[ $param ] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
					continue;
				}
				$term_raw = sanitize_text_field( wp_unslash( (string) $_GET[ $param ] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				$tax_raw  = sanitize_key( (string) $taxonomy );
				break;
			}
		}

		if ( '' === $term_raw || '' === $tax_raw ) {
			return array();
		}

		$term_id = self::resolve_term_token( $tax_raw, $term_raw );
		if ( $term_id <= 0 ) {
			return array();
		}

		return array(
			'tax_query' => array(
				array(
					'taxonomy' => $tax_raw,
					'field'    => 'term_id',
					'terms'    => array( $term_id ),
					'operator' => 'IN',
				),
			),
		);
	}

	/**
	 * Backward compatibility for encoded caf_filter_{index} blobs.
	 *
	 * @param int $shortindex Builder index.
	 * @return array
	 */
	protected static function parse_legacy_blob_param( $shortindex ) {
		$key = self::get_legacy_blob_param_name( $shortindex );
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! isset( $_GET[ $key ] ) ) {
			return array();
		}

		$raw = sanitize_text_field( wp_unslash( (string) $_GET[ $key ] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return self::decode_legacy_blob( $raw );
	}

	/**
	 * Resolve a term token (numeric ID or slug) to term_id.
	 *
	 * @param string $taxonomy Taxonomy slug.
	 * @param string $token    Term id or slug.
	 * @return int
	 */
	protected static function resolve_term_token( $taxonomy, $token ) {
		$taxonomy = sanitize_key( (string) $taxonomy );
		$token    = trim( (string) $token );

		if ( '' === $taxonomy || '' === $token ) {
			return 0;
		}

		if ( ctype_digit( $token ) ) {
			$term = get_term( (int) $token, $taxonomy );
			return ( $term && ! is_wp_error( $term ) ) ? (int) $term->term_id : 0;
		}

		$slug = sanitize_title( $token );
		$term = get_term_by( 'slug', $slug, $taxonomy );
		if ( $term && ! is_wp_error( $term ) ) {
			return (int) $term->term_id;
		}

		return 0;
	}

	/**
	 * Build tax_query array from taxonomy => term IDs map.
	 *
	 * @param array $tax_groups Taxonomy groups.
	 * @param int   $shortindex Builder index.
	 * @return array
	 */
	protected static function build_tax_query_from_groups( $tax_groups, $shortindex ) {
		$clauses = array();

		foreach ( $tax_groups as $taxonomy => $term_ids ) {
			$term_ids = array_values( array_unique( array_map( 'absint', $term_ids ) ) );
			$term_ids = array_filter( $term_ids );
			if ( empty( $term_ids ) ) {
				continue;
			}

			$clauses[] = array(
				'taxonomy' => sanitize_key( $taxonomy ),
				'field'    => 'term_id',
				'terms'    => $term_ids,
				'operator' => 'IN',
			);
		}

		if ( empty( $clauses ) ) {
			return array();
		}

		if ( count( $clauses ) > 1 ) {
			$relation = apply_filters( 'caf_builder_url_tax_query_relation', 'AND', $shortindex, $tax_groups );
			return array_merge( array( 'relation' => $relation ), $clauses );
		}

		return $clauses;
	}

	/**
	 * Parse range token value (e.g. 10-200 or <=200).
	 *
	 * @param string $meta_key Meta key.
	 * @param string $value    Raw value.
	 * @return array
	 */
	protected static function parse_range_token( $meta_key, $value ) {
		$meta_key = sanitize_key( (string) $meta_key );
		$value    = trim( (string) $value );

		if ( '' === $meta_key || '' === $value ) {
			return array();
		}

		if ( preg_match( '/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/', $value, $matches ) ) {
			return array(
				'key'     => $meta_key,
				'value'   => array( (float) $matches[1], (float) $matches[2] ),
				'compare' => 'BETWEEN',
				'type'    => 'NUMERIC',
			);
		}

		if ( preg_match( '/^<=(.+)$/', $value, $matches ) ) {
			return array(
				'key'     => $meta_key,
				'value'   => (float) $matches[1],
				'compare' => '<=',
				'type'    => 'NUMERIC',
			);
		}

		return array(
			'key'     => $meta_key,
			'value'   => $value,
			'compare' => '=',
			'type'    => 'CHAR',
		);
	}

	/**
	 * Decode legacy base64 JSON blob.
	 *
	 * @param string $raw Encoded payload.
	 * @return array
	 */
	protected static function decode_legacy_blob( $raw ) {
		$raw = trim( (string) $raw );
		if ( '' === $raw ) {
			return array();
		}

		$raw = strtr( $raw, '-_', '+/' );
		$pad = strlen( $raw ) % 4;
		if ( $pad > 0 ) {
			$raw .= str_repeat( '=', 4 - $pad );
		}

		$json = base64_decode( $raw, true ); // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_decode
		if ( ! is_string( $json ) || '' === $json ) {
			return array();
		}

		$state = json_decode( $json, true );
		return is_array( $state ) ? $state : array();
	}

	/**
	 * Resolve term slug for URL output.
	 *
	 * @param string $taxonomy Taxonomy slug.
	 * @param int    $term_id  Term ID.
	 * @return string
	 */
	public static function get_term_slug_for_url( $taxonomy, $term_id ) {
		$term = get_term( absint( $term_id ), sanitize_key( $taxonomy ) );
		if ( $term && ! is_wp_error( $term ) && ! empty( $term->slug ) ) {
			return (string) $term->slug;
		}
		return (string) absint( $term_id );
	}
}
