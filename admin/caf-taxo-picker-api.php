<?php
/** CAF taxonomy picker REST helpers (paginated roots + search). */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Taxonomy picker defaults (builder settings browse).
 */
function caf_taxo_picker_limits() {
	return array(
		'root_limit'  => 50,
		'child_limit' => 50,
		'search_limit'=> 40,
	);
}

/**
 * Fetch all terms for a taxonomy (objects).
 *
 * @param string $taxonomy Taxonomy slug.
 * @return array
 */
function caf_taxo_picker_get_terms( $taxonomy ) {
	$terms = get_terms(
		array(
			'taxonomy'   => $taxonomy,
			'hide_empty' => false,
		)
	);
	if ( is_wp_error( $terms ) || empty( $terms ) ) {
		return array();
	}
	return $terms;
}

/**
 * Count descendants in a children_data tree (any depth).
 *
 * @param array $children Children nodes.
 * @return int
 */
function caf_taxo_picker_count_descendants( $children ) {
	$n = 0;
	if ( ! is_array( $children ) ) {
		return 0;
	}
	foreach ( $children as $child ) {
		$n += 1;
		if ( ! empty( $child['children_data'] ) && is_array( $child['children_data'] ) ) {
			$n += caf_taxo_picker_count_descendants( $child['children_data'] );
		}
	}
	return $n;
}

/**
 * Hard-cap descendants under a root (preorder). No child load-more.
 *
 * @param array $children Children nodes.
 * @param int   $limit    Max descendants.
 * @return array{0: array, 1: int} Truncated children + how many taken.
 */
function caf_taxo_picker_limit_descendants( $children, $limit ) {
	$remaining = max( 0, (int) $limit );
	$take      = function ( $node ) use ( &$take, &$remaining ) {
		if ( $remaining <= 0 || ! is_array( $node ) ) {
			return null;
		}
		--$remaining;
		$copy                   = $node;
		$copy['children_data']  = array();
		if ( ! empty( $node['children_data'] ) && is_array( $node['children_data'] ) ) {
			foreach ( $node['children_data'] as $child ) {
				if ( $remaining <= 0 ) {
					break;
				}
				$taken = $take( $child );
				if ( null !== $taken ) {
					$copy['children_data'][] = $taken;
				}
			}
		}
		return $copy;
	};

	$out = array();
	if ( ! is_array( $children ) ) {
		return array( $out, 0 );
	}
	$start = $remaining;
	foreach ( $children as $child ) {
		if ( $remaining <= 0 ) {
			break;
		}
		$taken = $take( $child );
		if ( null !== $taken ) {
			$out[] = $taken;
		}
	}
	return array( $out, $start - $remaining );
}

/**
 * Build hierarchical term arrays from WP term objects (uses term->count for picker perf).
 *
 * @param array $terms WP_Term list.
 * @return array{roots: array, lookup: array, term_total: int}
 */
function caf_taxo_picker_build_tree( $terms ) {
	$by_id = array();
	foreach ( $terms as $term ) {
		$by_id[ (int) $term->term_id ] = array(
			'id'            => (int) $term->term_id,
			'name'          => $term->name,
			'slug'          => $term->slug,
			'parent'        => (int) $term->parent,
			'count'         => (int) $term->count,
			'total_count'   => (int) $term->count,
			'children_data' => array(),
		);
	}

	$roots = array();
	foreach ( $by_id as $id => $node ) {
		$parent = (int) $node['parent'];
		if ( $parent && isset( $by_id[ $parent ] ) ) {
			$by_id[ $parent ]['children_data'][] = $id; // store child ids temporarily
		} else {
			$roots[] = $id;
		}
	}

	$build = function ( $id ) use ( &$build, &$by_id ) {
		$node     = $by_id[ $id ];
		$child_ids = $node['children_data'];
		$children  = array();
		if ( is_array( $child_ids ) ) {
			foreach ( $child_ids as $cid ) {
				if ( is_int( $cid ) || ( is_string( $cid ) && ctype_digit( (string) $cid ) ) ) {
					$children[] = $build( (int) $cid );
				}
			}
		}
		return array(
			'id'            => (int) $node['id'],
			'name'          => $node['name'],
			'slug'          => $node['slug'],
			'count'         => (int) $node['count'],
			'total_count'   => (int) $node['total_count'],
			'children_data' => $children,
		);
	};

	$root_nodes = array();
	foreach ( $roots as $rid ) {
		$root_nodes[] = $build( $rid );
	}

	$flat_lookup = array();
	foreach ( $terms as $term ) {
		$flat_lookup[ (int) $term->term_id ] = $term;
	}

	return array(
		'roots'      => $root_nodes,
		'lookup'     => $flat_lookup,
		'term_total' => count( $terms ),
	);
}

/**
 * Apply root pagination + per-root child cap.
 *
 * @param array $roots       Full root list.
 * @param int   $root_offset Offset.
 * @param int   $root_limit  Page size.
 * @param int   $child_limit Max descendants per root.
 * @return array
 */
function caf_taxo_picker_paginate_roots( $roots, $root_offset, $root_limit, $child_limit ) {
	$root_offset = max( 0, (int) $root_offset );
	$root_limit  = max( 1, (int) $root_limit );
	$child_limit = max( 0, (int) $child_limit );
	$slice       = array_slice( $roots, $root_offset, $root_limit );
	$out         = array();

	foreach ( $slice as $root ) {
		$children_total = caf_taxo_picker_count_descendants( $root['children_data'] );
		list( $capped, $shown ) = caf_taxo_picker_limit_descendants( $root['children_data'], $child_limit );
		$root['children_data']       = $capped;
		$root['children_total']      = $children_total;
		$root['children_truncated']  = $children_total > $child_limit;
		$root['children_shown']      = $shown;
		$out[]                       = $root;
	}

	return $out;
}

/**
 * Build breadcrumb path for a term.
 *
 * @param int   $term_id Term ID.
 * @param array $lookup  term_id => WP_Term.
 * @return array{0: string, 1: array}
 */
function caf_taxo_picker_breadcrumb( $term_id, $lookup ) {
	$path = array();
	$guard = 0;
	$id    = (int) $term_id;
	while ( $id && isset( $lookup[ $id ] ) && $guard < 50 ) {
		$term   = $lookup[ $id ];
		array_unshift(
			$path,
			array(
				'id'   => (int) $term->term_id,
				'name' => $term->name,
			)
		);
		$id = (int) $term->parent;
		++$guard;
	}
	$names = array_map(
		function ( $p ) {
			return $p['name'];
		},
		$path
	);
	return array( implode( ' › ', $names ), $path );
}

/**
 * Build one taxonomy picker payload (paginated roots).
 *
 * @param object $taxonomy    Taxonomy object.
 * @param string $post_type   Post type.
 * @param int    $root_offset Offset.
 * @param int    $root_limit  Root page size.
 * @param int    $child_limit Child cap per root.
 * @return array|null
 */
function caf_taxo_picker_build_taxonomy_payload( $taxonomy, $post_type, $root_offset, $root_limit, $child_limit ) {
	$terms = caf_taxo_picker_get_terms( $taxonomy->name );
	$is_pa = ( 0 === strpos( $taxonomy->name, 'pa_' ) );

	if ( empty( $terms ) && ! $is_pa ) {
		return null;
	}

	$built       = caf_taxo_picker_build_tree( $terms );
	$roots       = $built['roots'];
	$root_total  = count( $roots );
	$term_data   = caf_taxo_picker_paginate_roots( $roots, $root_offset, $root_limit, $child_limit );
	$loaded      = min( $root_total, $root_offset + count( $term_data ) );

	return array(
		'key'            => $taxonomy->name,
		'label'          => caf_get_builder_taxonomy_label( $taxonomy ),
		'term_data'      => $term_data,
		'root_total'     => $root_total,
		'root_offset'    => (int) $root_offset,
		'root_limit'     => (int) $root_limit,
		'roots_loaded'   => $loaded,
		'has_more_roots' => $loaded < $root_total,
		'term_total'     => (int) $built['term_total'],
		'child_limit'    => (int) $child_limit,
		'picker'         => true,
	);
}

/**
 * Bootstrap: all taxonomy headers + first page of roots (capped children).
 *
 * @param WP_REST_Request $request Request.
 * @return array
 */
function caf_get_taxo_picker_bootstrap( $request ) {
	$post_type   = sanitize_key( (string) $request->get_param( 'post-type' ) );
	$limits      = caf_taxo_picker_limits();
	$root_limit  = max( 1, (int) ( $request->get_param( 'root_limit' ) ?: $limits['root_limit'] ) );
	$child_limit = max( 0, (int) ( $request->get_param( 'child_limit' ) ?: $limits['child_limit'] ) );

	if ( '' === $post_type ) {
		return array(
			'status'        => 'success',
			'taxonomy_list' => null,
			'message'       => 'post type not exist',
		);
	}

	$taxonomies    = get_object_taxonomies( $post_type, 'objects' );
	$taxonomy_tree = array();

	if ( ! empty( $taxonomies ) ) {
		foreach ( $taxonomies as $taxonomy ) {
			if ( function_exists( 'caf_is_excluded_builder_taxonomy' ) && caf_is_excluded_builder_taxonomy( $taxonomy->name, $post_type ) ) {
				continue;
			}
			$payload = caf_taxo_picker_build_taxonomy_payload( $taxonomy, $post_type, 0, $root_limit, $child_limit );
			if ( null !== $payload ) {
				$taxonomy_tree[] = $payload;
			}
		}
	}

	if ( 'product' === $post_type && class_exists( 'CAF_Woo_Virtual_Taxonomies' ) ) {
		$virtual_groups = CAF_Woo_Virtual_Taxonomies::get_builder_taxonomy_groups();
		if ( ! empty( $virtual_groups ) ) {
			foreach ( $virtual_groups as $group ) {
				$roots      = isset( $group['term_data'] ) && is_array( $group['term_data'] ) ? $group['term_data'] : array();
				$root_total = count( $roots );
				$term_data  = caf_taxo_picker_paginate_roots( $roots, 0, $root_limit, $child_limit );
				$taxonomy_tree[] = array_merge(
					$group,
					array(
						'term_data'      => $term_data,
						'root_total'     => $root_total,
						'root_offset'    => 0,
						'root_limit'     => $root_limit,
						'roots_loaded'   => count( $term_data ),
						'has_more_roots' => count( $term_data ) < $root_total,
						'term_total'     => caf_taxo_picker_count_descendants( $roots ) + $root_total,
						'child_limit'    => $child_limit,
						'picker'         => true,
					)
				);
			}
		}
	}

	return array(
		'status'        => 'success',
		'taxonomy_list' => $taxonomy_tree,
	);
}

/**
 * Load more roots for one taxonomy.
 *
 * @param WP_REST_Request $request Request.
 * @return array
 */
function caf_get_taxo_picker_roots( $request ) {
	$post_type   = sanitize_key( (string) $request->get_param( 'post-type' ) );
	$taxonomy    = sanitize_key( (string) $request->get_param( 'taxonomy' ) );
	$limits      = caf_taxo_picker_limits();
	$root_offset = max( 0, (int) ( $request->get_param( 'root_offset' ) ?: 0 ) );
	$root_limit  = max( 1, (int) ( $request->get_param( 'root_limit' ) ?: $limits['root_limit'] ) );
	$child_limit = max( 0, (int) ( $request->get_param( 'child_limit' ) ?: $limits['child_limit'] ) );

	if ( '' === $post_type || '' === $taxonomy ) {
		return array(
			'status'  => 'error',
			'message' => 'post-type and taxonomy required',
		);
	}

	$tax_obj = get_taxonomy( $taxonomy );
	if ( ! $tax_obj || ( function_exists( 'caf_is_excluded_builder_taxonomy' ) && caf_is_excluded_builder_taxonomy( $taxonomy, $post_type ) ) ) {
		return array(
			'status'  => 'error',
			'message' => 'invalid taxonomy',
		);
	}

	$payload = caf_taxo_picker_build_taxonomy_payload( $tax_obj, $post_type, $root_offset, $root_limit, $child_limit );
	if ( null === $payload ) {
		return array(
			'status'    => 'success',
			'term_data' => array(),
			'meta'      => array(
				'root_total'     => 0,
				'has_more_roots' => false,
				'roots_loaded'   => $root_offset,
			),
		);
	}

	return array(
		'status'    => 'success',
		'key'       => $payload['key'],
		'term_data' => $payload['term_data'],
		'meta'      => array(
			'root_total'     => $payload['root_total'],
			'root_offset'    => $payload['root_offset'],
			'root_limit'     => $payload['root_limit'],
			'roots_loaded'   => $payload['roots_loaded'],
			'has_more_roots' => $payload['has_more_roots'],
			'term_total'     => $payload['term_total'],
			'child_limit'    => $payload['child_limit'],
		),
	);
}

/**
 * Search terms in one taxonomy (full catalog; beyond browse cap).
 *
 * @param WP_REST_Request $request Request.
 * @return array
 */
function caf_get_taxo_picker_search( $request ) {
	$post_type = sanitize_key( (string) $request->get_param( 'post-type' ) );
	$taxonomy  = sanitize_key( (string) $request->get_param( 'taxonomy' ) );
	$search    = sanitize_text_field( (string) $request->get_param( 'search' ) );
	$limits    = caf_taxo_picker_limits();
	$limit     = max( 1, (int) ( $request->get_param( 'limit' ) ?: $limits['search_limit'] ) );

	if ( '' === $post_type || '' === $taxonomy || '' === trim( $search ) ) {
		return array(
			'status' => 'success',
			'hits'   => array(),
		);
	}

	if ( function_exists( 'caf_is_excluded_builder_taxonomy' ) && caf_is_excluded_builder_taxonomy( $taxonomy, $post_type ) ) {
		return array(
			'status' => 'success',
			'hits'   => array(),
		);
	}

	$terms  = caf_taxo_picker_get_terms( $taxonomy );
	$built  = caf_taxo_picker_build_tree( $terms );
	$lookup = $built['lookup'];
	$q      = strtolower( trim( $search ) );
	$hits   = array();

	foreach ( $terms as $term ) {
		$name = strtolower( (string) $term->name );
		list( $breadcrumb, $path ) = caf_taxo_picker_breadcrumb( (int) $term->term_id, $lookup );
		$crumb_l = strtolower( $breadcrumb );
		if ( false === strpos( $name, $q ) && false === strpos( $crumb_l, $q ) ) {
			continue;
		}
		$parent_id = (int) $term->parent;
		$hits[]    = array(
			'id'          => (int) $term->term_id,
			'name'        => $term->name,
			'slug'        => $term->slug,
			'count'       => (int) $term->count,
			'total_count' => (int) $term->count,
			'parent'      => $parent_id,
			'parent_id'   => $parent_id,
			'breadcrumb'  => $breadcrumb,
			'path'        => $path,
			'children_data' => array(),
		);
		if ( count( $hits ) >= $limit ) {
			break;
		}
	}

	return array(
		'status' => 'success',
		'hits'   => $hits,
	);
}

/**
 * Flat lite list of all terms in a taxonomy (Select All / isAllSelected).
 *
 * @param WP_REST_Request $request Request.
 * @return array
 */
function caf_get_taxo_picker_all_terms_lite( $request ) {
	$post_type = sanitize_key( (string) $request->get_param( 'post-type' ) );
	$taxonomy  = sanitize_key( (string) $request->get_param( 'taxonomy' ) );

	if ( '' === $post_type || '' === $taxonomy ) {
		return array(
			'status' => 'success',
			'terms'  => array(),
		);
	}

	if ( function_exists( 'caf_is_excluded_builder_taxonomy' ) && caf_is_excluded_builder_taxonomy( $taxonomy, $post_type ) ) {
		return array(
			'status' => 'success',
			'terms'  => array(),
		);
	}

	$terms = caf_taxo_picker_get_terms( $taxonomy );
	$out   = array();
	foreach ( $terms as $term ) {
		$out[] = array(
			'id'            => (int) $term->term_id,
			'name'          => $term->name,
			'slug'          => $term->slug,
			'count'         => (int) $term->count,
			'total_count'   => (int) $term->count,
			'children_data' => array(),
		);
	}

	return array(
		'status' => 'success',
		'terms'  => $out,
	);
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
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
			)
		);
	}
);
// phpcs:disable
