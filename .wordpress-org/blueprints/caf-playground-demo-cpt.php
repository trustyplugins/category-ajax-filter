<?php
/**
 * CAF WordPress.org Live Preview - Recipe CPT + taxonomies.
 * Loaded as an mu-plugin so the CPT survives after the blueprint seed request.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function caf_preview_register_recipe_cpt() {
	if ( ! post_type_exists( 'recipe' ) ) {
		register_post_type(
			'recipe',
			array(
				'label'        => 'Recipes',
				'labels'       => array(
					'name'          => 'Recipes',
					'singular_name' => 'Recipe',
					'add_new_item'  => 'Add New Recipe',
					'edit_item'     => 'Edit Recipe',
					'search_items'  => 'Search Recipes',
				),
				'public'       => true,
				'has_archive'  => true,
				'show_in_rest' => true,
				'menu_icon'    => 'dashicons-carrot',
				'supports'     => array( 'title', 'editor', 'excerpt', 'thumbnail' ),
			)
		);
	}

	$taxes = array(
		'cuisine'         => 'Cuisines',
		'meal-type'       => 'Meal Types',
		'diet-type'       => 'Diet Types',
		'cooking-method'  => 'Cooking Methods',
		'prep-time'       => 'Prep Times',
	);

	foreach ( $taxes as $tax => $label ) {
		if ( taxonomy_exists( $tax ) ) {
			continue;
		}
		register_taxonomy(
			$tax,
			'recipe',
			array(
				'label'        => $label,
				'public'       => true,
				'hierarchical' => true,
				'show_in_rest' => true,
			)
		);
	}
}
add_action( 'init', 'caf_preview_register_recipe_cpt', 0 );
