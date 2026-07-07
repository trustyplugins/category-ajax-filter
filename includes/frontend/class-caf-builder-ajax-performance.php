<?php
/**
 * AJAX performance helpers for the builder frontend.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * In-request caches, object cache, and lightweight AJAX optimizations.
 */
class CAF_Builder_Ajax_Performance {

	const CACHE_GROUP = 'caf_builder';

	const CACHE_TTL = 43200;

	/**
	 * Cached layout bundles keyed by shortcode index.
	 *
	 * @var array<int, array<string, mixed>>
	 */
	protected static $layout_bundles = array();

	/**
	 * Cached layout CSS snapshots keyed by shortcode index.
	 *
	 * @var array<int, array{css: string, hash: string}>
	 */
	protected static $layout_css_snapshots = array();

	/**
	 * Load and cache layout list entry + builder JSON for one shortcode index.
	 *
	 * @param int $shortindex Shortcode index.
	 * @return array{layout_data: array, optionkey: string, builder_data: object}|null
	 */
	public static function get_layout_bundle( $shortindex ) {
		$shortindex = absint( $shortindex );

		if ( isset( self::$layout_bundles[ $shortindex ] ) ) {
			return self::$layout_bundles[ $shortindex ];
		}

		$cache_key = self::get_layout_bundle_cache_key( $shortindex );
		$cached    = wp_cache_get( $cache_key, self::CACHE_GROUP );
		if ( is_array( $cached ) && ! empty( $cached['builder_data'] ) ) {
			self::$layout_bundles[ $shortindex ] = $cached;
			return $cached;
		}

		$savedlayouts = get_option( 'caf_builder_layouts_list' );
		if ( ! is_array( $savedlayouts ) || ! isset( $savedlayouts[ $shortindex ] ) ) {
			return null;
		}

		$layout_data   = $savedlayouts[ $shortindex ];
		$optionkey     = isset( $layout_data['key'] ) ? (string) $layout_data['key'] : '';
		$layout_status = isset( $layout_data['post_status'] ) ? (string) $layout_data['post_status'] : '';

		if ( '' === $optionkey || 'publish' !== $layout_status ) {
			return null;
		}

		$builder_data = get_option( 'caf_' . $optionkey . '_' . $shortindex );
		if ( empty( $builder_data ) ) {
			return null;
		}

		if ( ! is_object( $builder_data ) ) {
			$builder_data = json_decode( wp_json_encode( $builder_data ) );
		}

		if ( function_exists( 'caf_normalize_builder_layout_data' ) ) {
			$builder_data = caf_normalize_builder_layout_data( $builder_data );
		}

		$bundle = array(
			'layout_data'  => $layout_data,
			'optionkey'    => $optionkey,
			'builder_data' => $builder_data,
		);

		self::$layout_bundles[ $shortindex ] = $bundle;
		wp_cache_set( $cache_key, $bundle, self::CACHE_GROUP, self::CACHE_TTL );

		return $bundle;
	}

	/**
	 * Hash dynamic CSS for change detection between requests.
	 *
	 * @param string $css CSS string.
	 * @return string
	 */
	public static function get_dynamic_css_hash( $css ) {
		return md5( (string) $css );
	}

	/**
	 * Store layout CSS snapshot for lightweight AJAX responses.
	 *
	 * @param int    $shortindex Shortcode index.
	 * @param string $css        Dynamic CSS string.
	 * @return void
	 */
	public static function set_layout_css_snapshot( $shortindex, $css ) {
		$shortindex = absint( $shortindex );
		$css        = (string) $css;
		$hash       = self::get_dynamic_css_hash( $css );

		$snapshot = array(
			'css'  => $css,
			'hash' => $hash,
		);

		self::$layout_css_snapshots[ $shortindex ] = $snapshot;
		wp_cache_set( self::get_layout_css_cache_key( $shortindex ), $snapshot, self::CACHE_GROUP, self::CACHE_TTL );
	}

	/**
	 * Get cached layout CSS hash.
	 *
	 * @param int $shortindex Shortcode index.
	 * @return string
	 */
	public static function get_layout_css_hash( $shortindex ) {
		$snapshot = self::get_layout_css_snapshot( $shortindex );
		return ! empty( $snapshot['hash'] ) ? (string) $snapshot['hash'] : '';
	}

	/**
	 * Get cached layout CSS string.
	 *
	 * @param int $shortindex Shortcode index.
	 * @return string
	 */
	public static function get_layout_css( $shortindex ) {
		$snapshot = self::get_layout_css_snapshot( $shortindex );
		return ! empty( $snapshot['css'] ) ? (string) $snapshot['css'] : '';
	}

	/**
	 * Resolve CSS hash + body for AJAX when collection is skipped.
	 *
	 * @param int    $shortindex      Shortcode index.
	 * @param string $client_css_hash Hash sent by the browser.
	 * @return array{hash: string, css: string}
	 */
	public static function resolve_ajax_css_payload( $shortindex, $client_css_hash = '' ) {
		$cached_css  = self::get_layout_css( $shortindex );
		$cached_hash = self::get_layout_css_hash( $shortindex );

		if ( '' === $cached_hash && '' !== $cached_css ) {
			$cached_hash = self::get_dynamic_css_hash( $cached_css );
		}

		if ( '' !== $client_css_hash ) {
			$hash = $client_css_hash;
			if ( $client_css_hash === $cached_hash || '' === $cached_css ) {
				return array(
					'hash' => $hash,
					'css'  => '',
				);
			}

			return array(
				'hash' => $cached_hash,
				'css'  => $cached_css,
			);
		}

		return array(
			'hash' => $cached_hash,
			'css'  => $cached_css,
		);
	}

	/**
	 * Whether WP_Query should calculate found rows for this layout.
	 *
	 * @param CAF_Builder_Data $data_handler Builder data handler.
	 * @return bool
	 */
	public static function query_needs_found_rows( CAF_Builder_Data $data_handler ) {
		$pagination_item = $data_handler->get_misc_pagination();
		if (
			! empty( $pagination_item )
			&& is_object( $pagination_item )
			&& ! empty( $pagination_item->settings )
			&& is_object( $pagination_item->settings )
			&& ! empty( $pagination_item->settings->is_enable )
			&& 'true' === (string) $pagination_item->settings->is_enable
		) {
			return true;
		}

		return (bool) caf_builder_apply_filters( 'caf_builder_ajax_needs_found_rows', false, $data_handler );
	}

	/**
	 * Inject CSS hash attribute on the main builder container.
	 *
	 * @param string $html Rendered builder HTML.
	 * @param string $hash CSS hash.
	 * @return string
	 */
	public static function inject_css_hash_on_container( $html, $hash ) {
		if ( '' === (string) $hash || '' === (string) $html ) {
			return $html;
		}

		$attribute = ' data-dynamic-css-hash="' . esc_attr( $hash ) . '"';

		$updated = preg_replace(
			'/(<div\b[^>]*\bcaf-builder-container\b[^>]*)(>)/',
			'$1' . $attribute . '$2',
			$html,
			1
		);

		return is_string( $updated ) ? $updated : $html;
	}

	/**
	 * Resolve AJAX response mode.
	 *
	 * @param string $mode Requested mode.
	 * @return string One of full|posts.
	 */
	public static function normalize_response_mode( $mode ) {
		$mode = sanitize_key( (string) $mode );

		return ( 'full' === $mode ) ? 'full' : 'posts';
	}

	/**
	 * Clear cached layout data after save/delete.
	 *
	 * @param int $shortindex Shortcode index.
	 * @return void
	 */
	public static function invalidate_layout_cache( $shortindex ) {
		$shortindex = absint( $shortindex );
		unset( self::$layout_bundles[ $shortindex ], self::$layout_css_snapshots[ $shortindex ] );
		wp_cache_delete( self::get_layout_bundle_cache_key( $shortindex ), self::CACHE_GROUP );
		wp_cache_delete( self::get_layout_css_cache_key( $shortindex ), self::CACHE_GROUP );
	}

	/**
	 * @param int $shortindex Shortcode index.
	 * @return string
	 */
	protected static function get_layout_bundle_cache_key( $shortindex ) {
		return 'layout_bundle_' . absint( $shortindex );
	}

	/**
	 * @param int $shortindex Shortcode index.
	 * @return string
	 */
	protected static function get_layout_css_cache_key( $shortindex ) {
		return 'layout_css_' . absint( $shortindex );
	}

	/**
	 * @param int $shortindex Shortcode index.
	 * @return array{css: string, hash: string}
	 */
	protected static function get_layout_css_snapshot( $shortindex ) {
		$shortindex = absint( $shortindex );

		if ( isset( self::$layout_css_snapshots[ $shortindex ] ) ) {
			return self::$layout_css_snapshots[ $shortindex ];
		}

		$cached = wp_cache_get( self::get_layout_css_cache_key( $shortindex ), self::CACHE_GROUP );
		if ( is_array( $cached ) ) {
			self::$layout_css_snapshots[ $shortindex ] = array(
				'css'  => isset( $cached['css'] ) ? (string) $cached['css'] : '',
				'hash' => isset( $cached['hash'] ) ? (string) $cached['hash'] : '',
			);
			return self::$layout_css_snapshots[ $shortindex ];
		}

		return array(
			'css'  => '',
			'hash' => '',
		);
	}
}
