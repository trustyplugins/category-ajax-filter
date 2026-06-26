<?php
/**
 * WordPress Playground demo seed: legacy + builder filters with category terms.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Seed playground content for CAF free tier demos.
 *
 * @return array<string, mixed>
 */
function caf_playground_seed_demo() {
	if ( ! defined( 'TC_CAF_PATH' ) ) {
		return array( 'error' => 'TC_CAF_PATH is not defined.' );
	}

	if ( ! function_exists( 'build_term_tree_with_counts' ) ) {
		require_once TC_CAF_PATH . 'admin/builder-functions.php';
	}

	require_once TC_CAF_PATH . 'includes/caf-legacy-variable-defaults.php';

	$category_names = array( 'News', 'Tutorials', 'Reviews' );
	$term_ids       = array();

	foreach ( $category_names as $name ) {
		$existing = term_exists( $name, 'category' );
		if ( $existing ) {
			$term_ids[] = (int) $existing['term_id'];
			continue;
		}

		$result = wp_insert_term( $name, 'category' );
		if ( ! is_wp_error( $result ) ) {
			$term_ids[] = (int) $result['term_id'];
		}
	}

	if ( empty( $term_ids ) ) {
		$term_ids[] = 1;
	}

	for ( $i = 1; $i <= 12; $i++ ) {
		$post_id = wp_insert_post(
			array(
				'post_title'   => sprintf( 'CAF Demo Post %d', $i ),
				'post_content' => 'Sample content for Category AJAX Filter playground demos.',
				'post_status'  => 'publish',
				'post_type'    => 'post',
			)
		);

		if ( $post_id && ! is_wp_error( $post_id ) ) {
			wp_set_post_categories( $post_id, array( $term_ids[ ( $i - 1 ) % count( $term_ids ) ] ) );
		}
	}

	$taxonomy_payload = caf_playground_build_category_taxonomy_payload( 'post' );

	$legacy_id = caf_playground_create_legacy_filter( $term_ids );
	$builder   = caf_playground_create_builder_filter( $taxonomy_payload );

	$hub_id = wp_insert_post(
		array(
			'post_title'   => 'CAF Playground',
			'post_name'    => 'caf-playground',
			'post_content' => caf_playground_hub_page_content( $legacy_id, $builder['shortcode_id'] ),
			'post_status'  => 'publish',
			'post_type'    => 'page',
		)
	);

	wp_insert_post(
		array(
			'post_title'   => 'Legacy CAF Filter Demo',
			'post_name'    => 'caf-legacy-filter-demo',
			'post_content' => sprintf( '[caf_filter id="%d"]', (int) $legacy_id ),
			'post_status'  => 'publish',
			'post_type'    => 'page',
		)
	);

	wp_insert_post(
		array(
			'post_title'   => 'Builder CAF Filter Demo',
			'post_name'    => 'caf-builder-filter-demo',
			'post_content' => sprintf( '[caf_filter id="%s"]', esc_attr( $builder['shortcode_id'] ) ),
			'post_status'  => 'publish',
			'post_type'    => 'page',
		)
	);

	if ( $hub_id && ! is_wp_error( $hub_id ) ) {
		update_option( 'show_on_front', 'page' );
		update_option( 'page_on_front', $hub_id );
	}

	flush_rewrite_rules( false );

	return array(
		'legacy_filter_id' => $legacy_id,
		'builder_shortcode' => $builder['shortcode_id'],
		'builder_layout_key' => $builder['layout_key'],
	);
}

/**
 * @param string $post_type Post type slug.
 * @return array<int, array<string, mixed>>
 */
function caf_playground_build_category_taxonomy_payload( $post_type = 'post' ) {
	$terms = get_terms(
		array(
			'taxonomy'   => 'category',
			'hide_empty' => false,
		)
	);

	if ( is_wp_error( $terms ) || empty( $terms ) ) {
		return array();
	}

	$term_tree = build_term_tree_with_counts( $terms, 'category', $post_type );

	return array(
		array(
			'key'       => 'category',
			'label'     => __( 'Categories', 'category-ajax-filter' ),
			'term_data' => caf_playground_map_terms_for_checkbox( $term_tree ),
		),
	);
}

/**
 * @param array<int, array<string, mixed>> $terms Term tree nodes.
 * @return array<int, array<string, mixed>>
 */
function caf_playground_map_terms_for_checkbox( $terms ) {
	$mapped = array();

	foreach ( $terms as $term ) {
		if ( empty( $term['id'] ) ) {
			continue;
		}

		$children = array();
		if ( ! empty( $term['children_data'] ) && is_array( $term['children_data'] ) ) {
			$children = caf_playground_map_terms_for_checkbox( $term['children_data'] );
		}

		$mapped[] = array(
			'key'           => (string) $term['id'],
			'value'         => isset( $term['name'] ) ? (string) $term['name'] : '',
			'count'         => isset( $term['total_count'] ) ? (int) $term['total_count'] : (int) ( $term['count'] ?? 0 ),
			'children_data' => $children,
		);
	}

	return $mapped;
}

/**
 * @param array<int, int> $term_ids Category term IDs.
 * @return int Legacy caf_posts ID.
 */
function caf_playground_create_legacy_filter( $term_ids ) {
	$legacy_id = wp_insert_post(
		array(
			'post_title'  => 'Playground Legacy Filter',
			'post_type'   => 'caf_posts',
			'post_status' => 'publish',
		)
	);

	if ( ! $legacy_id || is_wp_error( $legacy_id ) ) {
		return 0;
	}

	foreach ( caf_get_legacy_variable_defaults() as $meta_key => $meta_value ) {
		update_post_meta( $legacy_id, $meta_key, $meta_value );
	}

	update_post_meta( $legacy_id, 'caf_cpt_value', 'post' );
	update_post_meta( $legacy_id, 'caf_taxonomy', 'category' );
	update_post_meta( $legacy_id, 'caf_terms', array_map( 'intval', $term_ids ) );
	update_post_meta( $legacy_id, 'caf_post_orders_by', 'title' );
	update_post_meta( $legacy_id, 'caf_post_order_type', 'asc' );

	return (int) $legacy_id;
}

/**
 * @param array<int, array<string, mixed>> $taxonomy_payload Checkbox taxonomy rows.
 * @return array{shortcode_id: string, layout_key: string}
 */
function caf_playground_create_builder_filter( $taxonomy_payload ) {
	$layout_file = TC_CAF_PATH . 'import-library/full-filter-layout/default-full-layout.json';

	if ( ! file_exists( $layout_file ) ) {
		return array(
			'shortcode_id' => 'caf_0',
			'layout_key'   => '',
		);
	}

	// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	$raw = file_get_contents( $layout_file );
	$layout_data = json_decode( (string) $raw, false );

	if ( ! is_object( $layout_data ) || ! function_exists( 'caf_normalize_builder_layout_data' ) ) {
		return array(
			'shortcode_id' => 'caf_0',
			'layout_key'   => '',
		);
	}

	$layout_data = caf_normalize_builder_layout_data( $layout_data );

	if ( ! isset( $layout_data->common_data ) || ! is_object( $layout_data->common_data ) ) {
		$layout_data->common_data = new stdClass();
	}

	$layout_data->common_data->layout_name    = 'Playground Builder Filter';
	$layout_data->common_data->layout_publish = 'publish';
	$layout_data->common_data->post_type      = 'post';

	if ( isset( $layout_data->filter_layout_data->filter_query_data ) ) {
		$layout_data->filter_layout_data->filter_query_data->taxonomy_data = $taxonomy_payload;
	}

	caf_walk_filter_layout_modules(
		$layout_data->filter_layout_data->initial_data ?? array(),
		static function ( $module ) use ( $taxonomy_payload ) {
			if ( ! is_object( $module ) || empty( $module->key ) || 'checkbox_filter' !== $module->key ) {
				return;
			}

			if ( ! isset( $module->settings ) || ! is_object( $module->settings ) ) {
				$module->settings = new stdClass();
			}

			$module->settings->taxonomy_data = $taxonomy_payload;
			$module->settings->data_source   = 'taxonomy';

			if ( ! isset( $module->settings->label ) || ! is_object( $module->settings->label ) ) {
				$module->settings->label = new stdClass();
			}

			$module->settings->label->is_label = 'true';
			$module->settings->label->value     = __( 'Categories', 'category-ajax-filter' );
		}
	);

	$layout_slug = 'playgroundbuilderfilter';
	$layout_index = 0;
	$layout_key   = $layout_slug . '_' . $layout_index;
	$option_name  = 'caf_' . $layout_key;

	$layout_data->common_data->layout_key   = $option_name;
	$layout_data->common_data->layout_index = $layout_index;

	update_option(
		'caf_builder_layouts_list',
		array(
			array(
				'key'         => $layout_slug,
				'label'       => 'Playground Builder Filter',
				'post_status' => 'publish',
				'post_date'   => current_time( 'mysql' ),
			),
		)
	);

	update_option( $option_name, $layout_data );

	if ( function_exists( 'caf_builder_invalidate_layout_cache' ) ) {
		caf_builder_invalidate_layout_cache( $layout_index );
	}

	return array(
		'shortcode_id' => 'caf_0',
		'layout_key'   => $option_name,
	);
}

/**
 * @param int    $legacy_id Legacy filter post ID.
 * @param string $builder_shortcode Builder shortcode id.
 * @return string
 */
function caf_playground_hub_page_content( $legacy_id, $builder_shortcode ) {
	$legacy_url  = esc_url( home_url( '/caf-legacy-filter-demo/' ) );
	$builder_url = esc_url( home_url( '/caf-builder-filter-demo/' ) );
	$admin_url   = esc_url( admin_url( 'edit.php?post_type=caf_posts&builder=1' ) );

	return sprintf(
		'<!-- wp:heading --><h2>Category AJAX Filter — Playground Demo</h2><!-- /wp:heading -->'
		. '<!-- wp:paragraph --><p>Two ready-made filters are configured with demo categories and posts. Checkbox terms are pre-filled from the <strong>category</strong> taxonomy.</p><!-- /wp:paragraph -->'
		. '<!-- wp:list --><ul>'
		. '<li><a href="%1$s">Legacy filter demo</a> — classic CAF panel (<code>[caf_filter id="%2$d"]</code>)</li>'
		. '<li><a href="%3$s">Builder filter demo</a> — visual builder layout (<code>[caf_filter id="%4$s"]</code>)</li>'
		. '<li><a href="%5$s">Open filter builder</a></li>'
		. '</ul><!-- /wp:list -->',
		$legacy_url,
		(int) $legacy_id,
		$builder_url,
		esc_attr( $builder_shortcode ),
		$admin_url
	);
}
