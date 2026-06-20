<?php
/**
 * Frontend Builder SEO helpers (structured data).
 *
 * @package TC_CAF_PRO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_PRO_Builder_Seo {

	/**
	 * Whether ItemList schema is enabled for a builder layout.
	 *
	 * @param int $shortindex Builder index.
	 * @return bool
	 */
	public static function is_enabled( $shortindex = 0 ) {
		$layout_enabled = 'Enable' === (string) get_option( 'caf_builder_schema_' . absint( $shortindex ), 'Enable' );
		if ( ! $layout_enabled ) {
			return false;
		}

		return (bool) apply_filters( 'caf_builder_enable_itemlist_json_ld', true, $shortindex );
	}

	/**
	 * Build ItemList schema array for the current query page.
	 *
	 * @param WP_Query $query           Post query.
	 * @param string   $list_url        Canonical URL for the list view.
	 * @param array    $options         Optional settings.
	 * @return array|null Schema array or null when empty.
	 */
	public static function build_itemlist_schema( $query, $list_url = '', $options = array() ) {
		$shortindex = isset( $options['shortindex'] ) ? absint( $options['shortindex'] ) : 0;
		if ( ! self::is_enabled( $shortindex ) ) {
			return null;
		}

		if ( ! apply_filters( 'caf_builder_enable_itemlist_json_ld', true, $query ) ) {
			return null;
		}

		if ( ! ( $query instanceof WP_Query ) || empty( $query->posts ) || ! is_array( $query->posts ) ) {
			return null;
		}

		$position_offset = isset( $options['position_offset'] ) ? absint( $options['position_offset'] ) : 0;
		$list_items      = array();
		$position        = $position_offset;

		foreach ( $query->posts as $post_item ) {
			if ( ! ( $post_item instanceof WP_Post ) ) {
				continue;
			}

			$post_id = absint( $post_item->ID );
			if ( $post_id <= 0 ) {
				continue;
			}

			$permalink = get_permalink( $post_id );
			$name      = get_the_title( $post_id );

			if ( ! is_string( $permalink ) || '' === $permalink ) {
				continue;
			}

			++$position;
			$list_items[] = array(
				'@type'    => 'ListItem',
				'position' => $position,
				'url'      => $permalink,
				'name'     => is_string( $name ) ? $name : '',
			);
		}

		if ( empty( $list_items ) ) {
			return null;
		}

		$schema = array(
			'@context'        => 'https://schema.org',
			'@type'           => 'ItemList',
			'itemListElement' => $list_items,
		);

		if ( isset( $options['number_of_items'] ) ) {
			$schema['numberOfItems'] = absint( $options['number_of_items'] );
		} elseif ( isset( $query->found_posts ) ) {
			$schema['numberOfItems'] = absint( $query->found_posts );
		}

		if ( is_string( $list_url ) && '' !== $list_url ) {
			$schema['url'] = $list_url;
		}

		return apply_filters( 'caf_builder_itemlist_json_ld', $schema, $query, $options );
	}

	/**
	 * Resolve list URL for ItemList schema.
	 *
	 * @return string
	 */
	public static function get_list_url() {
		if ( ! function_exists( 'get_permalink' ) || ! get_queried_object_id() ) {
			return '';
		}

		$list_url = get_permalink( get_queried_object_id() );
		return is_string( $list_url ) ? $list_url : '';
	}

	/**
	 * Resolve position offset for paginated result batches.
	 *
	 * @param int $current_page        Current page number.
	 * @param int $post_count_per_page Posts per page.
	 * @return int
	 */
	public static function get_position_offset( $current_page, $post_count_per_page ) {
		$current_page        = max( 1, absint( $current_page ) );
		$post_count_per_page = absint( $post_count_per_page );

		if ( $post_count_per_page <= 0 || $current_page <= 1 ) {
			return 0;
		}

		return ( $current_page - 1 ) * $post_count_per_page;
	}

	/**
	 * Render ItemList JSON-LD script markup for query results.
	 *
	 * @param WP_Query $query    Post query.
	 * @param string   $list_url Canonical URL for the list view.
	 * @param array    $options  Optional settings (position_offset, number_of_items).
	 * @return string
	 */
	public static function render_itemlist_json_ld( $query, $list_url = '', $options = array() ) {
		$schema = self::build_itemlist_schema( $query, $list_url, $options );
		if ( empty( $schema ) || ! is_array( $schema ) ) {
			return '';
		}

		$json = wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
		if ( ! is_string( $json ) || '' === $json ) {
			return '';
		}

		return '<script type="application/ld+json" class="caf-builder-itemlist-json-ld">' . $json . '</script>';
	}

	/**
	 * Build ItemList JSON-LD for builder AJAX responses.
	 *
	 * @param WP_Query $query               Post query.
	 * @param int      $current_page        Current page.
	 * @param int      $post_count_per_page Posts per page.
	 * @param bool     $append_batch        Whether this batch appends to an existing list (load-more).
	 * @return string
	 */
	public static function render_ajax_itemlist_json_ld( $query, $current_page, $post_count_per_page, $append_batch = false, $shortindex = 0 ) {
		$options = array(
			'shortindex' => absint( $shortindex ),
		);

		if ( $append_batch ) {
			$options['position_offset'] = self::get_position_offset( $current_page, $post_count_per_page );
		}

		return self::render_itemlist_json_ld( $query, self::get_list_url(), $options );
	}
}
