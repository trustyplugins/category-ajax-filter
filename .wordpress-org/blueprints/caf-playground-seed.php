<?php
require_once 'wordpress/wp-load.php';

if ( get_option( 'caf_wporg_preview_seeded' ) ) {
	return;
}

$caf_preview_mu_plugin = <<<'CAF_MU_PLUGIN'
{{CAF_PREVIEW_MU_PLUGIN}}
CAF_MU_PLUGIN;


update_option( 'blogname', 'CAF Builder Preview' );
update_option( 'permalink_structure', '/%postname%/' );
update_option( 'blogdescription', 'Try the CAF Builder with posts, recipes, and WooCommerce products.' );

delete_transient( '_wc_activation_redirect' );
update_option(
	'woocommerce_onboarding_profile',
	array(
		'skipped'   => true,
		'completed' => true,
	)
);
update_option( 'woocommerce_task_list_hidden', 'yes' );
update_option( 'woocommerce_task_list_complete', 'yes' );
update_option( 'woocommerce_coming_soon', 'no' );
update_option( 'woocommerce_store_pages_only', 'no' );
update_option( 'woocommerce_show_marketplace_suggestions', 'no' );
update_option( 'woocommerce_allow_tracking', 'no' );
update_option( 'woocommerce_default_country', 'US:CA' );
update_option( 'woocommerce_currency', 'USD' );
update_option( 'woocommerce_setup_jetpack_opted_in', 'no' );

$mu_dir = WP_CONTENT_DIR . '/mu-plugins';
if ( ! is_dir( $mu_dir ) ) {
	wp_mkdir_p( $mu_dir );
}

$mu_file = $mu_dir . '/caf-playground-demo.php';
if ( ! file_exists( $mu_file ) ) {
	file_put_contents( $mu_file, $caf_preview_mu_plugin );
}

if ( ! function_exists( 'caf_preview_register_recipe_cpt' ) && file_exists( $mu_file ) ) {
	require_once $mu_file;
}
if ( function_exists( 'caf_preview_register_recipe_cpt' ) ) {
	caf_preview_register_recipe_cpt();
}

function caf_pv_term( $name, $taxonomy ) {
	$existing = term_exists( $name, $taxonomy );
	if ( $existing ) {
		return (int) ( is_array( $existing ) ? $existing['term_id'] : $existing );
	}
	$created = wp_insert_term( $name, $taxonomy );
	return is_wp_error( $created ) ? 0 : (int) $created['term_id'];
}

$news     = caf_pv_term( 'News', 'category' );
$guides   = caf_pv_term( 'Guides', 'category' );
$reviews  = caf_pv_term( 'Reviews', 'category' );

$blog_posts = array(
	array( 'How AJAX Filters Improve Shop UX', 'Visitors find products faster when filters update without a page reload.', array( $guides ) ),
	array( 'Five Layout Ideas for a Product Grid', 'Use columns, gaps, and pagination to keep long catalogs easy to scan.', array( $guides ) ),
	array( 'Why Custom Post Types Need Filters', 'Recipes, jobs, and listings work best when visitors can narrow by taxonomy.', array( $news ) ),
	array( 'WooCommerce Category Filter Tips', 'Combine categories, attributes, and price so shoppers can refine quickly.', array( $reviews ) ),
	array( 'Building a Recipe Directory', 'A custom post type plus cuisine and meal-type taxonomies makes recipes searchable.', array( $news ) ),
	array( 'From Classic Panel to CAF Builder', 'The drag-and-drop builder lets you design filters, cards, and layout in three steps.', array( $reviews ) ),
);

foreach ( $blog_posts as $item ) {
	wp_insert_post(
		array(
			'post_title'   => $item[0],
			'post_content' => $item[1],
			'post_excerpt' => $item[1],
			'post_status'  => 'publish',
			'post_type'    => 'post',
			'post_category'=> $item[2],
		)
	);
}

$cuisines = array(
	'Italian'       => caf_pv_term( 'Italian', 'cuisine' ),
	'Indian'        => caf_pv_term( 'Indian', 'cuisine' ),
	'American'      => caf_pv_term( 'American', 'cuisine' ),
	'Japanese'      => caf_pv_term( 'Japanese', 'cuisine' ),
	'Mexican'       => caf_pv_term( 'Mexican', 'cuisine' ),
	'Mediterranean' => caf_pv_term( 'Mediterranean', 'cuisine' ),
	'Thai'          => caf_pv_term( 'Thai', 'cuisine' ),
);
$meals = array(
	'Breakfast' => caf_pv_term( 'Breakfast', 'meal-type' ),
	'Lunch'     => caf_pv_term( 'Lunch', 'meal-type' ),
	'Dinner'    => caf_pv_term( 'Dinner', 'meal-type' ),
	'Dessert'   => caf_pv_term( 'Dessert', 'meal-type' ),
);
$diets = array(
	'Vegetarian' => caf_pv_term( 'Vegetarian', 'diet-type' ),
	'Vegan'      => caf_pv_term( 'Vegan', 'diet-type' ),
	'Non-Veg'    => caf_pv_term( 'Non-Veg', 'diet-type' ),
);
$methods = array(
	'Bake'     => caf_pv_term( 'Bake', 'cooking-method' ),
	'Grill'    => caf_pv_term( 'Grill', 'cooking-method' ),
	'No-cook'  => caf_pv_term( 'No-cook', 'cooking-method' ),
	'Simmer'   => caf_pv_term( 'Simmer', 'cooking-method' ),
	'Stovetop' => caf_pv_term( 'Stovetop', 'cooking-method' ),
);
$preps = array(
	'10 min' => caf_pv_term( '10 min', 'prep-time' ),
	'15 min' => caf_pv_term( '15 min', 'prep-time' ),
	'20 min' => caf_pv_term( '20 min', 'prep-time' ),
	'25 min' => caf_pv_term( '25 min', 'prep-time' ),
	'30 min' => caf_pv_term( '30 min', 'prep-time' ),
	'45 min' => caf_pv_term( '45 min', 'prep-time' ),
	'60 min' => caf_pv_term( '60 min', 'prep-time' ),
);

$recipes = array(
	array( 'Margherita Pizza', 'Classic tomato, mozzarella, and basil pizza.', 'Italian', 'Dinner', 'Vegetarian', 'Bake', '30 min' ),
	array( 'Chicken Tikka', 'Yogurt-marinated grilled chicken with warm spices.', 'Indian', 'Dinner', 'Non-Veg', 'Grill', '45 min' ),
	array( 'Avocado Toast', 'Smashed avocado on toasted bread with lemon and chili.', 'American', 'Breakfast', 'Vegan', 'No-cook', '10 min' ),
	array( 'Miso Soup', 'Light Japanese soup with tofu, seaweed, and scallions.', 'Japanese', 'Lunch', 'Vegetarian', 'Simmer', '20 min' ),
	array( 'Beef Tacos', 'Seasoned beef in warm tortillas with salsa and lime.', 'Mexican', 'Dinner', 'Non-Veg', 'Stovetop', '25 min' ),
	array( 'Quinoa Salad', 'Mediterranean quinoa with cucumber, tomato, and herbs.', 'Mediterranean', 'Lunch', 'Vegan', 'No-cook', '15 min' ),
	array( 'Chocolate Cake', 'Rich cocoa cake with a simple chocolate frosting.', 'American', 'Dessert', 'Vegetarian', 'Bake', '60 min' ),
	array( 'Pad Thai', 'Stir-fried rice noodles with tamarind, egg, and peanuts.', 'Thai', 'Dinner', 'Non-Veg', 'Stovetop', '30 min' ),
);

foreach ( $recipes as $item ) {
	$id = wp_insert_post(
		array(
			'post_title'   => $item[0],
			'post_content' => $item[1],
			'post_excerpt' => $item[1],
			'post_status'  => 'publish',
			'post_type'    => 'recipe',
		)
	);
	if ( ! $id || is_wp_error( $id ) ) {
		continue;
	}
	wp_set_object_terms( $id, array( (int) $cuisines[ $item[2] ] ), 'cuisine' );
	wp_set_object_terms( $id, array( (int) $meals[ $item[3] ] ), 'meal-type' );
	wp_set_object_terms( $id, array( (int) $diets[ $item[4] ] ), 'diet-type' );
	wp_set_object_terms( $id, array( (int) $methods[ $item[5] ] ), 'cooking-method' );
	wp_set_object_terms( $id, array( (int) $preps[ $item[6] ] ), 'prep-time' );
}

if ( class_exists( 'WooCommerce' ) && class_exists( 'WC_Product_Simple' ) ) {
	$clothing    = caf_pv_term( 'Clothing', 'product_cat' );
	$electronics = caf_pv_term( 'Electronics', 'product_cat' );
	$home        = caf_pv_term( 'Home', 'product_cat' );
	$accessories = caf_pv_term( 'Accessories', 'product_cat' );
	$sale_tag    = caf_pv_term( 'Sale', 'product_tag' );
	$new_tag     = caf_pv_term( 'New', 'product_tag' );

	$color_taxonomy = 'pa_color';
	if ( function_exists( 'wc_create_attribute' ) && ! taxonomy_exists( $color_taxonomy ) ) {
		wc_create_attribute(
			array(
				'name'         => 'Color',
				'slug'         => 'color',
				'type'         => 'select',
				'order_by'     => 'menu_order',
				'has_archives' => false,
			)
		);
		register_taxonomy(
			$color_taxonomy,
			array( 'product' ),
			array(
				'labels'       => array( 'name' => 'Color' ),
				'hierarchical' => false,
				'show_ui'      => false,
				'query_var'    => true,
				'rewrite'      => false,
			)
		);
	}

	$colors = array(
		'Red'   => caf_pv_term( 'Red', $color_taxonomy ),
		'Blue'  => caf_pv_term( 'Blue', $color_taxonomy ),
		'Green' => caf_pv_term( 'Green', $color_taxonomy ),
		'Black' => caf_pv_term( 'Black', $color_taxonomy ),
	);

	$attr_id = 0;
	if ( function_exists( 'wc_attribute_taxonomy_id_by_name' ) ) {
		$attr_id = (int) wc_attribute_taxonomy_id_by_name( 'color' );
	}

	$products = array(
		array( 'Red Hoodie', '29', '19', array( $clothing ), array( $sale_tag ), 'Red', true ),
		array( 'Blue T-Shirt', '18', '', array( $clothing ), array( $new_tag ), 'Blue', false ),
		array( 'Black Sneakers', '79', '', array( $clothing ), array( $new_tag ), 'Black', true ),
		array( 'Green Cap', '15', '', array( $clothing ), array(), 'Green', false ),
		array( 'Wireless Headphones', '89', '69', array( $electronics ), array( $sale_tag ), 'Black', true ),
		array( 'Phone Stand', '24', '', array( $electronics ), array( $new_tag ), 'Blue', false ),
		array( 'Ceramic Vase', '42', '', array( $home ), array(), 'Red', false ),
		array( 'Desk Lamp', '55', '', array( $home ), array( $new_tag ), 'Black', false ),
		array( 'Canvas Tote', '22', '', array( $accessories ), array(), 'Green', false ),
		array( 'Leather Wallet', '35', '28', array( $accessories ), array( $sale_tag ), 'Red', true ),
	);

	foreach ( $products as $item ) {
		$product = new WC_Product_Simple();
		$product->set_name( $item[0] );
		$product->set_status( 'publish' );
		$product->set_catalog_visibility( 'visible' );
		$product->set_regular_price( $item[1] );
		if ( '' !== $item[2] ) {
			$product->set_sale_price( $item[2] );
		}
		$product->set_short_description( 'Sample product for the CAF builder preview.' );
		$product->set_description( 'Use this product in the CAF Builder to test category, tag, color, and price filters.' );
		$product->set_category_ids( array_filter( $item[3] ) );
		$product->set_tag_ids( array_filter( $item[4] ) );
		$product->set_featured( ! empty( $item[6] ) );
		$product->set_manage_stock( false );
		$product->set_stock_status( 'instock' );

		if ( taxonomy_exists( $color_taxonomy ) && ! empty( $colors[ $item[5] ] ) ) {
			$attribute = new WC_Product_Attribute();
			if ( $attr_id ) {
				$attribute->set_id( $attr_id );
			}
			$attribute->set_name( $color_taxonomy );
			$attribute->set_options( array( $item[5] ) );
			$attribute->set_visible( true );
			$attribute->set_variation( false );
			$product->set_attributes( array( $attribute ) );
		}

		$product_id = $product->save();
		if ( $product_id && taxonomy_exists( $color_taxonomy ) ) {
			wp_set_object_terms( $product_id, array( $item[5] ), $color_taxonomy );
		}
	}
}

flush_rewrite_rules( false );
update_option( 'caf_wporg_preview_seeded', '1' );
