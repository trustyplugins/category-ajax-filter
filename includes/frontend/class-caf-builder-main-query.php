<?php
/**
 * Apply CAF filter URL state to the page main / WooCommerce query.
 *
 * Used when a builder has post layout_source = main_query.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Builder_Main_Query {

	/**
	 * Cached builder indexes that use main_query listing target.
	 *
	 * @var array<int, int>|null
	 */
	protected static $main_query_indexes = null;

	/**
	 * Active builder index for the current request (or null).
	 *
	 * @var int|null
	 */
	protected static $active_index = null;

	/**
	 * Whether filters have been registered.
	 *
	 * @var bool
	 */
	protected static $booted = false;

	/**
	 * Whether this request is serving a Main Query JSON fragment.
	 *
	 * @var bool
	 */
	protected static $serving_fragment = false;

	/**
	 * Builder index forced for this request (e.g. shortcode on a custom page).
	 *
	 * @var int|null
	 */
	protected static $bound_index = null;

	/**
	 * Cached main_query indexes detected on the current singular page.
	 *
	 * @var array<int, int>|null
	 */
	protected static $page_shortcode_indexes = null;

	/**
	 * Register hooks.
	 *
	 * @return void
	 */
	public static function init() {
		if ( self::$booted ) {
			return;
		}
		self::$booted = true;

		// Detect [caf_filter] on custom pages early so Elementor/Divi product queries bind.
		add_action( 'wp', array( __CLASS__, 'maybe_bind_from_current_page' ), 1 );

		add_action( 'pre_get_posts', array( __CLASS__, 'apply_to_main_query' ), 20 );
		add_action( 'woocommerce_product_query', array( __CLASS__, 'apply_to_woo_query' ), 20 );
		// Divi Shop / Elementor Products / [products] shortcode â€” not the main query.
		add_filter( 'woocommerce_shortcode_products_query', array( __CLASS__, 'apply_to_shortcode_products_query' ), 20, 3 );
		// Elementor Loop Grid / Posts custom queries.
		add_filter( 'elementor/query/query_args', array( __CLASS__, 'apply_to_elementor_query_args' ), 20, 2 );
		add_filter( 'elementor/query/get_query_args/current_query', array( __CLASS__, 'apply_to_elementor_current_query_args' ), 20 );
		add_filter( 'elementor_pro/query_control/get_query_args/current_query', array( __CLASS__, 'apply_to_elementor_current_query_args' ), 20 );
		// Bare ?product_cat= (etc.) is a public WP query var and breaks Divi/Woo shortcode paging.
		add_filter( 'request', array( __CLASS__, 'strip_bare_tax_query_vars_on_shop' ), 5 );
		add_filter( 'caf_builder_url_tax_query_relation', array( __CLASS__, 'filter_url_tax_query_relation' ), 10, 2 );
		// Full-page render â†’ JSON listing chunks (faster client transfer/parse; keeps builder markup).
		add_action( 'template_redirect', array( __CLASS__, 'maybe_start_fragment_buffer' ), 1 );

		// Reliable admin-ajax listing for Elementor/Divi/custom pages (avoids full-page fragment issues).
		add_action( 'wp_ajax_get_caf_main_query_listing', array( __CLASS__, 'ajax_render_listing' ) );
		add_action( 'wp_ajax_nopriv_get_caf_main_query_listing', array( __CLASS__, 'ajax_render_listing' ) );
	}

	/**
	 * Force a Main Query layout to own this request (custom page shortcode).
	 *
	 * @param int $shortindex Builder index.
	 * @return void
	 */
	public static function bind_layout_to_request( $shortindex ) {
		$shortindex = absint( $shortindex );
		if ( $shortindex < 0 || ! self::is_main_query_layout( $shortindex ) ) {
			return;
		}

		self::$bound_index  = $shortindex;
		self::$active_index = $shortindex;
	}

	/**
	 * On singular pages, bind Main Query layouts whose [caf_filter] shortcode is present.
	 * Enables Elementor/Divi/[products] loops on any page (not only shop/category archives).
	 *
	 * @return void
	 */
	public static function maybe_bind_from_current_page() {
		if ( is_admin() || wp_doing_ajax() || is_feed() ) {
			return;
		}

		// Archives already resolve via builder_matches_current_archive().
		if ( ! is_singular() ) {
			return;
		}

		$indexes = self::get_main_query_indexes_on_current_page();
		if ( empty( $indexes ) ) {
			return;
		}

		// Prefer URL-stated layout among page shortcodes; else first on page.
		if ( class_exists( 'CAF_Builder_Url_State' ) ) {
			foreach ( $indexes as $index ) {
				$state = CAF_Builder_Url_State::get_state_from_request( $index );
				if ( ! empty( $state ) ) {
					self::bind_layout_to_request( $index );
					return;
				}
			}
		}

		self::bind_layout_to_request( $indexes[0] );
	}

	/**
	 * Main Query builder indexes referenced by [caf_filter] on the current singular page.
	 *
	 * @return array<int, int>
	 */
	public static function get_main_query_indexes_on_current_page() {
		if ( null !== self::$page_shortcode_indexes ) {
			return self::$page_shortcode_indexes;
		}

		self::$page_shortcode_indexes = array();
		$candidates                     = self::get_main_query_indexes();
		if ( empty( $candidates ) || ! is_singular() ) {
			return self::$page_shortcode_indexes;
		}

		$post = get_queried_object();
		if ( ! ( $post instanceof WP_Post ) ) {
			return self::$page_shortcode_indexes;
		}

		$haystacks = array();
		if ( ! empty( $post->post_content ) ) {
			$haystacks[] = (string) $post->post_content;
		}

		$elementor_data = get_post_meta( $post->ID, '_elementor_data', true );
		if ( is_string( $elementor_data ) && '' !== $elementor_data ) {
			$haystacks[] = $elementor_data;
		} elseif ( is_array( $elementor_data ) ) {
			$encoded = wp_json_encode( $elementor_data );
			if ( is_string( $encoded ) ) {
				$haystacks[] = $encoded;
			}
		}

		$found_ids = array();
		foreach ( $haystacks as $content ) {
			$found_ids = array_merge( $found_ids, self::extract_builder_shortcode_ids_from_content( $content ) );
		}
		$found_ids = array_values( array_unique( array_filter( $found_ids ) ) );

		foreach ( $found_ids as $builder_id ) {
			$index = self::parse_builder_shortindex( $builder_id );
			if ( null === $index ) {
				continue;
			}
			if ( in_array( $index, $candidates, true ) ) {
				self::$page_shortcode_indexes[] = $index;
			}
		}

		self::$page_shortcode_indexes = array_values( array_unique( self::$page_shortcode_indexes ) );
		return self::$page_shortcode_indexes;
	}

	/**
	 * Parse caf_{n} shortcode id to builder index.
	 *
	 * @param string $id Shortcode id.
	 * @return int|null
	 */
	protected static function parse_builder_shortindex( $id ) {
		if ( ! is_string( $id ) || 0 !== strpos( $id, 'caf_' ) ) {
			return null;
		}
		$suffix = substr( $id, 4 );
		if ( '' === $suffix || ! is_numeric( $suffix ) ) {
			return null;
		}
		return (int) $suffix;
	}

	/**
	 * Extract visual-builder shortcode ids (caf_*) from HTML / Elementor JSON.
	 *
	 * @param string $content Content blob.
	 * @return array<int, string>
	 */
	protected static function extract_builder_shortcode_ids_from_content( $content ) {
		$ids = array();
		if ( ! is_string( $content ) || '' === $content || false === stripos( $content, 'caf_filter' ) ) {
			return $ids;
		}

		// Classic shortcode: [caf_filter id='caf_0'] or id="caf_0"
		if ( preg_match_all( '/\[caf_filter\b[^\]]*?\bid\s*=\s*([\'"])([^\'"]+)\1/i', $content, $matches, PREG_SET_ORDER ) ) {
			foreach ( $matches as $match ) {
				$id = trim( (string) $match[2] );
				if ( 0 === strpos( $id, 'caf_' ) ) {
					$ids[] = $id;
				}
			}
		}

		// Elementor Shortcode widget JSON often escapes quotes: id=\"caf_0\" or id=\\\"caf_0\\\"
		if ( preg_match_all( '/caf_filter[^\]]*?\bid\\\\*=\\\\*[\'"](caf_\d+)[\'"]/i', $content, $json_matches ) ) {
			foreach ( (array) $json_matches[1] as $id ) {
				$id = trim( (string) $id );
				if ( 0 === strpos( $id, 'caf_' ) ) {
					$ids[] = $id;
				}
			}
		}

		// Loose fallback: caf_N near caf_filter in builder JSON.
		if ( preg_match_all( '/caf_filter[\s\S]{0,120}?(caf_\d+)/i', $content, $loose_matches ) ) {
			foreach ( (array) $loose_matches[1] as $id ) {
				$ids[] = trim( (string) $id );
			}
		}

		return array_values( array_unique( $ids ) );
	}

	/**
	 * Use layout taxonomy_relation for multi-taxonomy URL filter state.
	 *
	 * @param string $relation   Default relation.
	 * @param int    $shortindex Builder index.
	 * @return string
	 */
	public static function filter_url_tax_query_relation( $relation, $shortindex ) {
		$shortindex = absint( $shortindex );
		if ( ! self::is_main_query_layout( $shortindex ) ) {
			return $relation;
		}

		$bundle = class_exists( 'CAF_Builder_Ajax_Performance' )
			? CAF_Builder_Ajax_Performance::get_layout_bundle( $shortindex )
			: null;
		if ( empty( $bundle['builder_data'] ) || ! class_exists( 'CAF_Builder_Data' ) ) {
			return $relation;
		}

		$data_handler = new CAF_Builder_Data( $bundle['builder_data'], $shortindex );
		$extra        = $data_handler->get_filter_layout_extra_data();
		$layout_rel   = isset( $extra->taxonomy_relation ) ? strtoupper( (string) $extra->taxonomy_relation ) : '';
		if ( in_array( $layout_rel, array( 'AND', 'OR' ), true ) ) {
			return $layout_rel;
		}

		return $relation;
	}

	/**
	 * Whether a layout uses main_query listing target.
	 *
	 * @param int $shortindex Builder index.
	 * @return bool
	 */
	public static function is_main_query_layout( $shortindex ) {
		return in_array( absint( $shortindex ), self::get_main_query_indexes(), true );
	}

	/**
	 * Builder indexes with layout_source = main_query.
	 *
	 * @return array<int, int>
	 */
	public static function get_main_query_indexes() {
		if ( null !== self::$main_query_indexes ) {
			return self::$main_query_indexes;
		}

		self::$main_query_indexes = array();
		$layouts                  = get_option( 'caf_builder_layouts_list', array() );
		if ( ! is_array( $layouts ) ) {
			return self::$main_query_indexes;
		}

		foreach ( $layouts as $index => $layout ) {
			$index = absint( $index );
			if ( $index < 0 || ! is_array( $layout ) ) {
				continue;
			}
			if ( isset( $layout['post_status'] ) && 'publish' !== (string) $layout['post_status'] ) {
				continue;
			}

			$bundle = class_exists( 'CAF_Builder_Ajax_Performance' )
				? CAF_Builder_Ajax_Performance::get_layout_bundle( $index )
				: null;
			if ( empty( $bundle['builder_data'] ) || ! is_object( $bundle['builder_data'] ) ) {
				continue;
			}

			$extra = isset( $bundle['builder_data']->post_layout_data->extra_data )
				? $bundle['builder_data']->post_layout_data->extra_data
				: null;
			if ( ! is_object( $extra ) ) {
				continue;
			}

			$source = isset( $extra->layout_source ) ? sanitize_key( (string) $extra->layout_source ) : 'caf_builder';
			if ( 'main_query' === $source ) {
				self::$main_query_indexes[] = $index;
			}
		}

		self::$main_query_indexes = array_values( array_unique( self::$main_query_indexes ) );
		return self::$main_query_indexes;
	}

	/**
	 * Resolve which main_query builder owns the current request.
	 *
	 * Order: explicit bind â†’ URL filter state â†’ shortcode on singular page â†’ archive match.
	 *
	 * @return int|null
	 */
	public static function resolve_active_builder_index() {
		if ( null !== self::$active_index ) {
			return self::$active_index > -1 ? self::$active_index : null;
		}

		$candidates = self::get_main_query_indexes();
		if ( empty( $candidates ) ) {
			self::$active_index = -1;
			return null;
		}

		if ( null !== self::$bound_index && in_array( self::$bound_index, $candidates, true ) ) {
			self::$active_index = self::$bound_index;
			return self::$bound_index;
		}

		if ( class_exists( 'CAF_Builder_Url_State' ) ) {
			foreach ( $candidates as $index ) {
				$state = CAF_Builder_Url_State::get_state_from_request( $index );
				if ( ! empty( $state ) ) {
					self::$active_index = $index;
					return $index;
				}
			}
		}

		// Custom pages: [caf_filter] for a Main Query layout on this page.
		$page_indexes = self::get_main_query_indexes_on_current_page();
		if ( ! empty( $page_indexes ) ) {
			self::$active_index = $page_indexes[0];
			return $page_indexes[0];
		}

		foreach ( $candidates as $index ) {
			if ( self::builder_matches_current_archive( $index ) ) {
				self::$active_index = $index;
				return $index;
			}
		}

		self::$active_index = -1;
		return null;
	}

	/**
	 * Whether a main_query layout should control the current archive / shop query.
	 *
	 * @param int $shortindex Builder index.
	 * @return bool
	 */
	protected static function builder_matches_current_archive( $shortindex ) {
		$shortindex = absint( $shortindex );
		$bundle     = class_exists( 'CAF_Builder_Ajax_Performance' )
			? CAF_Builder_Ajax_Performance::get_layout_bundle( $shortindex )
			: null;
		if ( empty( $bundle['builder_data'] ) || ! class_exists( 'CAF_Builder_Data' ) ) {
			return false;
		}

		$data_handler = new CAF_Builder_Data( $bundle['builder_data'], $shortindex );
		$post_type    = $data_handler->get_post_type();
		if ( '' === $post_type ) {
			$post_type = 'post';
		}

		if ( method_exists( $data_handler, 'is_post_type_available' ) && ! $data_handler->is_post_type_available() ) {
			return false;
		}
		if ( function_exists( 'caf_builder_layout_post_type_is_queryable' ) && ! caf_builder_layout_post_type_is_queryable( $post_type ) ) {
			return false;
		}

		if ( 'product' === $post_type ) {
			if ( function_exists( 'is_shop' ) && ( is_shop() || is_product_taxonomy() ) ) {
				return true;
			}
			return is_post_type_archive( 'product' );
		}

		if ( is_post_type_archive( $post_type ) ) {
			return true;
		}

		if ( 'post' === $post_type && ( is_home() || is_category() || is_tag() || is_author() || is_date() || is_search() ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Apply filter state on the main WP_Query.
	 *
	 * @param WP_Query $query Query.
	 * @return void
	 */
	public static function apply_to_main_query( $query ) {
		if ( ! ( $query instanceof WP_Query ) || ! $query->is_main_query() || is_admin() ) {
			return;
		}

		self::apply_filter_state_to_query( $query );
	}

	/**
	 * Apply filter state on WooCommerce product queries.
	 *
	 * Scoped to the main query only. Related / upsell / widget product queries
	 * must not inherit shop filters. Divi's Shop module temporarily promotes its
	 * shortcode query to main before this fires, which is intentional.
	 *
	 * @param WP_Query $query Product query.
	 * @return void
	 */
	public static function apply_to_woo_query( $query ) {
		if ( ! ( $query instanceof WP_Query ) || ! $query->is_main_query() || is_admin() ) {
			return;
		}
		self::apply_filter_state_to_query( $query );
	}

	/**
	 * Apply CAF filters to Woo [products] shortcode queries (Divi Shop / Elementor Products).
	 *
	 * Also syncs pagination from ?product-page= / ?paged= / pretty /page/N/ so Theme
	 * Builder pagination stays aligned when CAF filter params are present.
	 *
	 * @param array<string, mixed> $query_args Shortcode query args.
	 * @param array<string, mixed> $attributes Shortcode attributes.
	 * @param string               $type       Shortcode type.
	 * @return array<string, mixed>
	 */
	public static function apply_to_shortcode_products_query( $query_args, $attributes = array(), $type = '' ) {
		unset( $attributes, $type );
		return self::merge_filter_args_into_query_array( $query_args, true );
	}

	/**
	 * Apply CAF filters to Elementor Loop Grid / Posts custom queries.
	 *
	 * Skips non-product listings when the active Main Query builder targets products.
	 *
	 * @param array<string, mixed> $query_args Query args.
	 * @param mixed                $widget     Elementor widget (unused).
	 * @return array<string, mixed>
	 */
	public static function apply_to_elementor_query_args( $query_args, $widget = null ) {
		unset( $widget );
		if ( ! self::query_args_look_like_product_listing( $query_args ) ) {
			return is_array( $query_args ) ? $query_args : array();
		}
		return self::merge_filter_args_into_query_array( $query_args, false );
	}

	/**
	 * Apply CAF filters when Elementor uses Current Query / Archive query vars.
	 *
	 * @param array<string, mixed> $query_args Current query vars.
	 * @return array<string, mixed>
	 */
	public static function apply_to_elementor_current_query_args( $query_args ) {
		return self::merge_filter_args_into_query_array( $query_args, true );
	}

	/**
	 * Merge active Main Query filter args into an Elementor/Woo query-args array.
	 *
	 * @param array<string, mixed> $query_args          Existing args.
	 * @param bool                 $sync_shortcode_page Whether to sync product-page / paged.
	 * @return array<string, mixed>
	 */
	protected static function merge_filter_args_into_query_array( $query_args, $sync_shortcode_page = false ) {
		if ( is_admin() || ! is_array( $query_args ) ) {
			return is_array( $query_args ) ? $query_args : array();
		}

		if ( ! empty( $query_args['caf_main_query_applied'] ) ) {
			return $sync_shortcode_page ? self::sync_shortcode_paged_arg( $query_args ) : $query_args;
		}

		$index = self::resolve_active_builder_index();
		if ( null === $index ) {
			return $sync_shortcode_page ? self::sync_shortcode_paged_arg( $query_args ) : $query_args;
		}

		$args = self::build_filter_args_for_index( $index );
		if ( self::args_have_filter_constraints( $args ) ) {
			$query_args = self::merge_args_into_query_array( $query_args, $args );
			$query_args['caf_main_query_applied'] = 1;
		}

		return $sync_shortcode_page ? self::sync_shortcode_paged_arg( $query_args ) : $query_args;
	}

	/**
	 * Prevent bare CAF taxonomy GET params from being treated as WP query vars on the shop.
	 *
	 * CAF uses SEO params like ?product_cat=shirts. That key is also a public taxonomy query
	 * var, so WordPress rewrites /shop/?product_cat=shirts into a product-category query.
	 * That breaks Divi's Shop module posts-per-page and product-page pagination.
	 *
	 * CAF still reads filters from $_GET via Url_State.
	 *
	 * @param array<string, mixed> $query_vars Parsed request vars.
	 * @return array<string, mixed>
	 */
	public static function strip_bare_tax_query_vars_on_shop( $query_vars ) {
		if ( is_admin() || ! is_array( $query_vars ) || empty( self::get_main_query_indexes() ) ) {
			return $query_vars;
		}

		if ( ! self::current_request_path_is_shop() ) {
			return $query_vars;
		}

		$taxonomies = array();
		if ( function_exists( 'get_object_taxonomies' ) ) {
			$taxonomies = get_object_taxonomies( 'product' );
		}
		if ( ! is_array( $taxonomies ) || empty( $taxonomies ) ) {
			$taxonomies = array( 'product_cat', 'product_tag' );
		}

		foreach ( $taxonomies as $taxonomy ) {
			$taxonomy = sanitize_key( (string) $taxonomy );
			if ( '' === $taxonomy ) {
				continue;
			}
			// Only strip when the value came from the query string (CAF filter URL).
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended
			if ( isset( $_GET[ $taxonomy ] ) && array_key_exists( $taxonomy, $query_vars ) ) {
				unset( $query_vars[ $taxonomy ] );
			}
		}

		return $query_vars;
	}

	/**
	 * Whether the current request path is the WooCommerce shop (optionally /page/N/).
	 *
	 * Path-based â€” query vars alone are unreliable because ?product_cat= on /shop/
	 * makes WP parse the request as a product taxonomy archive.
	 *
	 * @return bool
	 */
	protected static function current_request_path_is_shop() {
		if ( ! function_exists( 'wc_get_page_id' ) ) {
			return false;
		}

		$shop_id = (int) wc_get_page_id( 'shop' );
		if ( $shop_id <= 0 ) {
			return false;
		}

		$shop_url  = get_permalink( $shop_id );
		$shop_path = untrailingslashit( (string) wp_parse_url( (string) $shop_url, PHP_URL_PATH ) );
		if ( '' === $shop_path ) {
			return false;
		}

		$req = isset( $_SERVER['REQUEST_URI'] )
			? (string) wp_unslash( $_SERVER['REQUEST_URI'] ) // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			: '';
		$req_path = untrailingslashit( (string) wp_parse_url( $req, PHP_URL_PATH ) );
		if ( '' === $req_path ) {
			return false;
		}

		if ( $req_path === $shop_path ) {
			return true;
		}

		return (bool) preg_match(
			'#^' . preg_quote( $shop_path, '#' ) . '/page/\d+$#',
			$req_path
		);
	}

	/**
	 * Ensure shortcode product queries honour pretty page / product-page pagination.
	 *
	 * @param array<string, mixed> $query_args Query args.
	 * @return array<string, mixed>
	 */
	protected static function sync_shortcode_paged_arg( array $query_args ) {
		$page = 0;

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( isset( $_GET['product-page'] ) ) {
			$page = absint( wp_unslash( $_GET['product-page'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		}
		if ( $page < 1 && isset( $_GET['paged'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			$page = absint( wp_unslash( $_GET['paged'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		}
		if ( $page < 1 ) {
			$qv_paged = (int) get_query_var( 'paged' );
			if ( $qv_paged > 1 ) {
				$page = $qv_paged;
			}
		}
		if ( $page < 1 ) {
			$qv_page = (int) get_query_var( 'page' );
			if ( $qv_page > 1 ) {
				$page = $qv_page;
			}
		}

		if ( $page > 1 ) {
			$query_args['paged'] = $page;
		}

		return $query_args;
	}

	/**
	 * Merge URL / default filters + restriction into a WP_Query instance.
	 *
	 * @param WP_Query $query Query.
	 * @return void
	 */
	protected static function apply_filter_state_to_query( $query ) {
		if ( $query->get( 'caf_main_query_applied' ) ) {
			return;
		}

		$index = self::resolve_active_builder_index();
		if ( null === $index ) {
			return;
		}

		$args = self::build_filter_args_for_index( $index );
		if ( ! self::args_have_filter_constraints( $args ) ) {
			return;
		}

		self::merge_args_into_query( $query, $args );
		$query->set( 'caf_main_query_applied', 1 );
	}

	/**
	 * Whether args include anything that should modify the theme query.
	 *
	 * @param array<string, mixed> $args Args.
	 * @return bool
	 */
	protected static function args_have_filter_constraints( $args ) {
		if ( empty( $args ) || ! is_array( $args ) ) {
			return false;
		}

		foreach ( array( 'tax_query', 'meta_query', 'post__in', 'post__not_in' ) as $key ) {
			if ( ! empty( $args[ $key ] ) ) {
				return true;
			}
		}

		foreach ( array( 's', 'caf_search_keyword', 'orderby', 'order' ) as $key ) {
			if ( isset( $args[ $key ] ) && '' !== $args[ $key ] && null !== $args[ $key ] ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Build filter query args for a builder index (URL + module defaults + include/exclude).
	 *
	 * Reuses page-load query builder so Main Query stays aligned with CAF listing settings,
	 * but never forces CAF posts_per_page / post_type onto the theme query.
	 *
	 * @param int $shortindex Builder index.
	 * @return array<string, mixed>
	 */
	public static function build_filter_args_for_index( $shortindex ) {
		$shortindex = absint( $shortindex );

		$bundle = class_exists( 'CAF_Builder_Ajax_Performance' )
			? CAF_Builder_Ajax_Performance::get_layout_bundle( $shortindex )
			: null;

		if ( empty( $bundle['builder_data'] ) || ! class_exists( 'CAF_Builder_Data' ) || ! class_exists( 'CAF_Builder_Query' ) ) {
			return self::build_url_only_args( $shortindex );
		}

		$data_handler  = new CAF_Builder_Data( $bundle['builder_data'], $shortindex );
		$query_builder = new CAF_Builder_Query( $data_handler );
		$page_args     = $query_builder->get_page_load_args();

		$allowed_keys = array(
			'tax_query',
			'meta_query',
			'post__in',
			'post__not_in',
			's',
			'caf_search_keyword',
			'caf_search_source',
			'caf_search_custom_field',
			'orderby',
			'order',
		);

		$args = array();
		foreach ( $allowed_keys as $key ) {
			if ( array_key_exists( $key, $page_args ) ) {
				$args[ $key ] = $page_args[ $key ];
			}
		}

		$url_has_state = class_exists( 'CAF_Builder_Url_State' )
			&& CAF_Builder_Url_State::request_has_state( $shortindex );

		// Keep theme / Woo catalog sorting under Woo's control.
		// Woo (and [products] / Archive Products) already map ?orderby=price|popularity|rating
		// via get_catalog_ordering_args(). Merging raw CAF "orderby" would clobber that.
		unset( $args['orderby'], $args['order'] );

		$context = array(
			'source'        => 'main_query',
			'builder_index' => $shortindex,
			'data_handler'  => $data_handler,
			'url_has_state' => $url_has_state,
		);
		$args    = apply_filters( 'caf_builder_main_query_args', $args, $context );

		return is_array( $args ) ? $args : array();
	}

	/**
	 * Fallback when layout bundle cannot be loaded.
	 *
	 * @param int $shortindex Builder index.
	 * @return array<string, mixed>
	 */
	protected static function build_url_only_args( $shortindex ) {
		if ( ! class_exists( 'CAF_Builder_Url_State' ) ) {
			return array();
		}
		$state = CAF_Builder_Url_State::get_state_from_request( $shortindex );
		$args  = CAF_Builder_Url_State::state_to_query_args( $state );
		if ( ! is_array( $args ) ) {
			return array();
		}

		// Convert virtual Woo filters (_on_sale, stock, etc.) the same as page-load.
		if ( class_exists( 'CAF_Woo_Filter_Query' ) ) {
			$args = CAF_Woo_Filter_Query::filter_ajax_query_args(
				$args,
				array(
					'mode'          => 'main_query_url',
					'builder_index' => absint( $shortindex ),
				)
			);
		}

		if ( ! is_array( $args ) ) {
			return array();
		}

		// Same as build_filter_args_for_index â€” never push raw orderby onto theme queries.
		unset( $args['orderby'], $args['order'] );

		return $args;
	}

	/**
	 * Whether Elementor/Woo query args look like a product listing (not a posts Loop Grid).
	 *
	 * @param array<string, mixed> $query_args Query args.
	 * @return bool
	 */
	protected static function query_args_look_like_product_listing( $query_args ) {
		if ( ! is_array( $query_args ) ) {
			return false;
		}

		$post_type = isset( $query_args['post_type'] ) ? $query_args['post_type'] : null;
		if ( null === $post_type || '' === $post_type ) {
			// Current Query on shop / product archive usually already matches via resolve_active.
			return true;
		}
		if ( 'product' === $post_type || 'any' === $post_type ) {
			return true;
		}
		if ( is_array( $post_type ) && in_array( 'product', $post_type, true ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Merge WP_Query-style args into an existing query without wiping archive context.
	 *
	 * @param WP_Query             $query Query.
	 * @param array<string, mixed> $args  Filter args.
	 * @return void
	 */
	protected static function merge_args_into_query( $query, array $args ) {
		$merged = self::merge_args_into_query_array(
			array(
				'tax_query'              => $query->get( 'tax_query' ),
				'meta_query'             => $query->get( 'meta_query' ),
				'post__in'               => $query->get( 'post__in' ),
				'post__not_in'           => $query->get( 'post__not_in' ),
				's'                      => $query->get( 's' ),
				'orderby'                => $query->get( 'orderby' ),
				'order'                  => $query->get( 'order' ),
				'caf_search_keyword'     => $query->get( 'caf_search_keyword' ),
				'caf_search_source'      => $query->get( 'caf_search_source' ),
				'caf_search_custom_field'=> $query->get( 'caf_search_custom_field' ),
			),
			$args
		);

		foreach ( $merged as $key => $value ) {
			if ( null === $value || '' === $value || ( is_array( $value ) && empty( $value ) ) ) {
				continue;
			}
			$query->set( $key, $value );
		}
	}

	/**
	 * Merge filter args into a WP_Query args array (shortcode products query).
	 *
	 * @param array<string, mixed> $query_args Existing args.
	 * @param array<string, mixed> $args       Filter args.
	 * @return array<string, mixed>
	 */
	protected static function merge_args_into_query_array( array $query_args, array $args ) {
		if ( ! empty( $args['tax_query'] ) && is_array( $args['tax_query'] ) ) {
			$existing = isset( $query_args['tax_query'] ) && is_array( $query_args['tax_query'] )
				? $query_args['tax_query']
				: array();
			if ( ! empty( $existing ) ) {
				$query_args['tax_query'] = array(
					'relation' => 'AND',
					$existing,
					$args['tax_query'],
				);
			} else {
				$query_args['tax_query'] = $args['tax_query'];
			}
		}

		if ( ! empty( $args['meta_query'] ) && is_array( $args['meta_query'] ) ) {
			$existing = isset( $query_args['meta_query'] ) && is_array( $query_args['meta_query'] )
				? $query_args['meta_query']
				: array();
			if ( ! empty( $existing ) ) {
				$query_args['meta_query'] = array(
					'relation' => 'AND',
					$existing,
					$args['meta_query'],
				);
			} else {
				$query_args['meta_query'] = $args['meta_query'];
			}
		}

		foreach ( array( 's', 'orderby', 'order' ) as $key ) {
			if ( ! array_key_exists( $key, $args ) ) {
				continue;
			}
			if ( '' === $args[ $key ] || null === $args[ $key ] ) {
				continue;
			}
			$query_args[ $key ] = $args[ $key ];
		}

		if ( ! empty( $args['post__in'] ) && is_array( $args['post__in'] ) ) {
			$incoming = array_values( array_filter( array_map( 'absint', $args['post__in'] ) ) );
			$existing = isset( $query_args['post__in'] ) && is_array( $query_args['post__in'] )
				? array_values( array_filter( array_map( 'absint', $query_args['post__in'] ) ) )
				: array();
			if ( ! empty( $existing ) ) {
				$incoming = array_values( array_intersect( $existing, $incoming ) );
				if ( empty( $incoming ) ) {
					$incoming = array( 0 );
				}
			}
			$query_args['post__in'] = $incoming;
		}

		if ( ! empty( $args['post__not_in'] ) && is_array( $args['post__not_in'] ) ) {
			$incoming = array_values( array_filter( array_map( 'absint', $args['post__not_in'] ) ) );
			$existing = isset( $query_args['post__not_in'] ) && is_array( $query_args['post__not_in'] )
				? array_map( 'absint', $query_args['post__not_in'] )
				: array();
			if ( ! empty( $existing ) ) {
				$incoming = array_values( array_unique( array_merge( $existing, $incoming ) ) );
			}
			$query_args['post__not_in'] = $incoming;

			if ( ! empty( $query_args['post__in'] ) && is_array( $query_args['post__in'] ) ) {
				$filtered_in = array_values(
					array_diff(
						array_filter( array_map( 'absint', $query_args['post__in'] ) ),
						$incoming
					)
				);
				$query_args['post__in'] = ! empty( $filtered_in ) ? $filtered_in : array( 0 );
			}
		}

		foreach ( array( 'caf_search_keyword', 'caf_search_source', 'caf_search_custom_field' ) as $key ) {
			if ( ! empty( $args[ $key ] ) ) {
				$query_args[ $key ] = $args[ $key ];
			}
		}

		return $query_args;
	}

	/**
	 * Whether this front request wants a Main Query JSON fragment response.
	 *
	 * @return bool
	 */
	protected static function is_fragment_request() {
		$header = isset( $_SERVER['HTTP_X_CAF_FRAGMENT'] )
			? (string) wp_unslash( $_SERVER['HTTP_X_CAF_FRAGMENT'] ) // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			: '';

		if ( '1' === $header ) {
			return true;
		}

		// Query-flag fallback when proxies / servers strip custom request headers.
		$flag = isset( $_GET['_caf_fragment'] ) // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			? sanitize_text_field( wp_unslash( (string) $_GET['_caf_fragment'] ) ) // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			: '';

		return '1' === $flag;
	}

	/**
	 * Buffer the rendered page and return only listing HTML chunks as JSON.
	 *
	 * Keeps Divi/Elementor markup intact while shrinking the payload the browser parses.
	 *
	 * @return void
	 */
	public static function maybe_start_fragment_buffer() {
		if ( self::$serving_fragment || is_admin() || wp_doing_ajax() || wp_doing_cron() || is_feed() ) {
			return;
		}

		if ( ! self::is_fragment_request() ) {
			return;
		}

		if ( empty( self::get_main_query_indexes() ) ) {
			return;
		}

		// Only on pages Main Query might own (shop / product archives / matched builder).
		if ( null === self::resolve_active_builder_index() ) {
			return;
		}

		self::$serving_fragment = true;

		add_filter( 'show_admin_bar', '__return_false', 999 );
		add_action( 'wp_enqueue_scripts', array( __CLASS__, 'dequeue_assets_for_fragment' ), 99999 );
		add_action( 'wp_print_styles', array( __CLASS__, 'dequeue_assets_for_fragment' ), 99999 );
		add_action( 'wp_print_scripts', array( __CLASS__, 'dequeue_assets_for_fragment' ), 99999 );

		ob_start( array( __CLASS__, 'finalize_fragment_buffer' ) );
	}

	/**
	 * Drop front-end assets on fragment requests (HTML is discarded except listing chunks).
	 *
	 * @return void
	 */
	public static function dequeue_assets_for_fragment() {
		if ( ! self::$serving_fragment ) {
			return;
		}

		global $wp_scripts, $wp_styles;

		if ( $wp_scripts instanceof WP_Scripts && ! empty( $wp_scripts->queue ) ) {
			foreach ( (array) $wp_scripts->queue as $handle ) {
				wp_dequeue_script( $handle );
			}
		}

		if ( $wp_styles instanceof WP_Styles && ! empty( $wp_styles->queue ) ) {
			foreach ( (array) $wp_styles->queue as $handle ) {
				wp_dequeue_style( $handle );
			}
		}
	}

	/**
	 * Output-buffer callback: convert full HTML page into JSON listing chunks.
	 *
	 * @param string $html Full page HTML.
	 * @return string JSON or original HTML when extraction fails / headers already sent.
	 */
	public static function finalize_fragment_buffer( $html ) {
		$html = is_string( $html ) ? $html : '';

		if ( '' === $html ) {
			return $html;
		}

		$chunks = self::extract_listing_chunks_from_html( $html );
		$has_listing = ( ! empty( $chunks['products'] ) || ! empty( $chunks['empty'] ) );

		if ( ! $has_listing ) {
			// Let the client fall back to full HTML parse.
			if ( ! headers_sent() ) {
				header( 'X-CAF-Fragment-Response: html-fallback' );
			}
			return $html;
		}

		$payload = wp_json_encode(
			array(
				'success' => true,
				'data'    => $chunks,
			)
		);

		if ( false === $payload ) {
			return $html;
		}

		if ( ! headers_sent() ) {
			header_remove( 'Content-Type' );
			header( 'Content-Type: application/json; charset=UTF-8' );
			header( 'X-CAF-Fragment-Response: json' );
			header( 'Vary: X-CAF-Fragment' );
			header( 'Cache-Control: no-store, no-cache, must-revalidate, max-age=0' );
		}

		return $payload;
	}

	/**
	 * Extract product grid / empty / companion HTML from a rendered page.
	 *
	 * @param string $html Page HTML.
	 * @return array{products:string,products_selector:string,empty:string,empty_selector:string,companions:array<string,string>}
	 */
	protected static function extract_listing_chunks_from_html( $html ) {
		$chunks = array(
			'products'          => '',
			'products_selector' => '',
			'empty'             => '',
			'empty_selector'    => '',
			'companions'        => array(),
		);

		if ( '' === $html || ! class_exists( 'DOMDocument' ) ) {
			return $chunks;
		}

		$previous = libxml_use_internal_errors( true );
		$dom      = new DOMDocument();
		$loaded   = $dom->loadHTML(
			'<?xml encoding="utf-8" ?>' . $html,
			LIBXML_HTML_NODEFDTD | LIBXML_NONET
		);
		libxml_clear_errors();
		libxml_use_internal_errors( $previous );

		if ( ! $loaded ) {
			return $chunks;
		}

		$xpath = new DOMXPath( $dom );

		$product_selectors = array(
			// Prefer shop chrome wrappers so count/order/products swap atomically (Elementor/Divi).
			'.elementor-widget-woocommerce-products .woocommerce',
			'.elementor-widget-wc-archive-products .woocommerce',
			'.elementor-wc-products .woocommerce',
			'.et_pb_shop .woocommerce',
			'.et_pb_shop ul.products',
			'.elementor-wc-products ul.products',
			'.elementor-widget-wc-archive-products ul.products',
			'.elementor-widget-woocommerce-products ul.products',
			'.elementor-widget-loop-grid .elementor-loop-container',
			'.elementor-loop-container',
			'ul.products',
			'.woocommerce ul.products',
			'.wp-block-woocommerce-product-collection',
			'ul.wc-block-product-template',
			'.wc-block-product-template',
		);

		$empty_selectors = array(
			'.woocommerce-no-products-found',
			'.elementor-products-nothing-found',
			'.elementor-nothing-found.elementor-products-nothing-found',
			'.wc-block-product-collection-no-results',
		);

		$companion_selectors = array(
			'.wp-block-woocommerce-product-results-count',
			'.wc-block-product-results-count',
			'p.woocommerce-result-count',
			'.woocommerce-result-count',
			'.wp-block-woocommerce-catalog-sorting',
			'.wc-block-catalog-sorting',
			'form.woocommerce-ordering',
			'.woocommerce-ordering',
			'nav.woocommerce-pagination',
			'.woocommerce-pagination',
			'.ast-woocommerce-pagination',
			'.ast-pagination',
			'nav.elementor-pagination',
			'.elementor-pagination',
			'.wp-block-query-pagination',
			'.wc-block-pagination',
			'.wc-block-components-pagination',
		);

		$product_match = self::dom_query_first_outer_html( $xpath, $product_selectors );
		if ( ! empty( $product_match['html'] ) ) {
			$chunks['products']          = $product_match['html'];
			$chunks['products_selector'] = $product_match['selector'];
		}

		$empty_match = self::dom_query_first_outer_html( $xpath, $empty_selectors );
		if ( ! empty( $empty_match['html'] ) ) {
			$chunks['empty']          = $empty_match['html'];
			$chunks['empty_selector'] = $empty_match['selector'];
		}

		foreach ( $companion_selectors as $selector ) {
			$match = self::dom_query_first_outer_html( $xpath, array( $selector ) );
			if ( ! empty( $match['html'] ) ) {
				$chunks['companions'][ $selector ] = $match['html'];
			}
		}

		return $chunks;
	}

	/**
	 * Find the first matching CSS-ish selector and return its outer HTML.
	 *
	 * Supports simple ".class", "tag.class", "tag.class.class", and
	 * descendant "a b" patterns used by Main Query selectors.
	 *
	 * @param DOMXPath             $xpath     XPath.
	 * @param array<int, string>   $selectors Selectors in priority order.
	 * @return array{html:string,selector:string}
	 */
	protected static function dom_query_first_outer_html( DOMXPath $xpath, array $selectors ) {
		foreach ( $selectors as $selector ) {
			$selector = trim( (string) $selector );
			if ( '' === $selector ) {
				continue;
			}

			$query = self::css_to_xpath( $selector );
			if ( '' === $query ) {
				continue;
			}

			$nodes = $xpath->query( $query );
			if ( ! ( $nodes instanceof DOMNodeList ) || 0 === $nodes->length ) {
				continue;
			}

			for ( $i = 0; $i < $nodes->length; $i++ ) {
				$node = $nodes->item( $i );
				if ( ! ( $node instanceof DOMElement ) ) {
					continue;
				}
				// Skip CAF itself.
				if ( self::dom_element_is_inside_caf( $node ) ) {
					continue;
				}
				$html = $node->ownerDocument ? $node->ownerDocument->saveHTML( $node ) : '';
				if ( is_string( $html ) && '' !== $html ) {
					return array(
						'html'     => $html,
						'selector' => $selector,
					);
				}
			}
		}

		return array(
			'html'     => '',
			'selector' => '',
		);
	}

	/**
	 * Convert a limited CSS selector subset to XPath.
	 *
	 * @param string $selector CSS selector.
	 * @return string
	 */
	protected static function css_to_xpath( $selector ) {
		$parts = preg_split( '/\s+/', trim( (string) $selector ) );
		if ( empty( $parts ) || ! is_array( $parts ) ) {
			return '';
		}

		$segments = array();
		foreach ( $parts as $part ) {
			$part = trim( (string) $part );
			if ( '' === $part ) {
				continue;
			}

			$tag     = '*';
			$classes = array();

			if ( preg_match( '/^([a-zA-Z][a-zA-Z0-9_-]*)((?:\.[a-zA-Z0-9_-]+)+)$/', $part, $m ) ) {
				$tag     = $m[1];
				$classes = array_filter( explode( '.', ltrim( $m[2], '.' ) ) );
			} elseif ( preg_match( '/^((?:\.[a-zA-Z0-9_-]+)+)$/', $part, $m ) ) {
				$classes = array_filter( explode( '.', ltrim( $m[1], '.' ) ) );
			} elseif ( preg_match( '/^([a-zA-Z][a-zA-Z0-9_-]*)$/', $part, $m ) ) {
				$tag = $m[1];
			} else {
				return '';
			}

			$segment = $tag;
			foreach ( $classes as $class ) {
				$class = sanitize_html_class( $class );
				if ( '' === $class ) {
					continue;
				}
				$segment .= '[contains(concat(" ", normalize-space(@class), " "), " ' . $class . ' ")]';
			}
			$segments[] = $segment;
		}

		if ( empty( $segments ) ) {
			return '';
		}

		// //seg1[...]/seg2[...]  (descendant chain).
		return '//' . implode( '//', $segments );
	}

	/**
	 * Whether a DOM element sits inside CAF filter markup.
	 *
	 * @param DOMElement $el Element.
	 * @return bool
	 */
	protected static function dom_element_is_inside_caf( DOMElement $el ) {
		$node = $el;
		while ( $node instanceof DOMElement ) {
			$class = ' ' . $node->getAttribute( 'class' ) . ' ';
			if ( false !== strpos( $class, ' caf-builder-container ' ) || false !== strpos( $class, ' caf-filter-only ' ) ) {
				return true;
			}
			$node = $node->parentNode;
		}
		return false;
	}

	/**
	 * Default catalog posts_per_page (Woo rowsÃ—columns, else WP Reading setting).
	 *
	 * @return int
	 */
	public static function get_default_catalog_per_page() {
		$per_page = 0;

		if ( function_exists( 'wc_get_default_products_per_row' ) && function_exists( 'wc_get_default_product_rows_per_page' ) ) {
			$per_page = (int) wc_get_default_products_per_row() * (int) wc_get_default_product_rows_per_page();
		}

		if ( $per_page <= 0 ) {
			$cols = (int) get_option( 'woocommerce_catalog_columns', 0 );
			$rows = (int) get_option( 'woocommerce_catalog_rows', 0 );
			if ( $cols > 0 && $rows > 0 ) {
				$per_page = $cols * $rows;
			}
		}

		if ( $per_page <= 0 ) {
			$per_page = (int) get_option( 'posts_per_page', 10 );
		}

		/**
		 * Filter default Main Query catalog posts_per_page used for AJAX listing.
		 *
		 * @param int $per_page Posts per page.
		 */
		$per_page = (int) apply_filters( 'caf_main_query_default_per_page', $per_page );

		return max( 1, min( 100, $per_page ) );
	}

	/**
	 * Admin-ajax: render filtered product listing HTML for Main Query / Elementor / Divi.
	 *
	 * More reliable than full-page fragment GET on custom Elementor pages.
	 *
	 * @return void
	 */
	public static function ajax_render_listing() {
		if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), 'tc_caf_ajax_nonce' ) ) {
			wp_send_json_error(
				array(
					'message' => esc_html__( 'Security check failed.', 'category-ajax-filter' ),
				)
			);
		}

		if ( ! class_exists( 'WooCommerce' ) && ! function_exists( 'wc_get_template_part' ) ) {
			wp_send_json_error(
				array(
					'message' => esc_html__( 'WooCommerce is required.', 'category-ajax-filter' ),
				)
			);
		}

		$shortindex = isset( $_POST['caf_index'] ) ? absint( $_POST['caf_index'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( ! self::is_main_query_layout( $shortindex ) ) {
			wp_send_json_error(
				array(
					'message' => esc_html__( 'Not a Main Query layout.', 'category-ajax-filter' ),
				)
			);
		}

		self::bind_layout_to_request( $shortindex );

		if ( function_exists( 'load_builder_ajax_dependencies' ) ) {
			load_builder_ajax_dependencies();
		}

		$limit = isset( $_POST['limit'] ) ? absint( $_POST['limit'] ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( $limit <= 0 ) {
			// Respect Woo/Elementor/Divi catalog size, not a hardcoded fallback.
			$limit = self::get_default_catalog_per_page();
		}
		if ( $limit > 100 ) {
			$limit = 100;
		}

		$columns = isset( $_POST['columns'] ) ? absint( $_POST['columns'] ) : 4; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( $columns <= 0 ) {
			$columns = 4;
		}
		if ( $columns > 8 ) {
			$columns = 8;
		}

		$products_class = isset( $_POST['products_class'] ) // phpcs:ignore WordPress.Security.NonceVerification.Missing
			? sanitize_text_field( wp_unslash( (string) $_POST['products_class'] ) ) // phpcs:ignore WordPress.Security.NonceVerification.Missing
			: '';
		if ( '' === $products_class ) {
			$products_class = 'products columns-' . $columns;
		} elseif ( false === strpos( ' ' . $products_class . ' ', ' products ' ) ) {
			$products_class = trim( 'products ' . $products_class );
		}

		$page = isset( $_POST['page'] ) ? absint( $_POST['page'] ) : 1; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( $page <= 0 ) {
			$page = 1;
		}

		$query_args = array(
			'post_type'           => 'product',
			'post_status'         => 'publish',
			'posts_per_page'      => $limit,
			'paged'               => $page,
			'ignore_sticky_posts' => true,
		);

		// Prefer client-posted filter params (same shape as CAF builder AJAX).
		$posted = isset( $_POST['params'] ) && is_array( $_POST['params'] ) ? wp_unslash( $_POST['params'] ) : array(); // phpcs:ignore WordPress.Security.NonceVerification.Missing,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		if ( ! empty( $posted ) && function_exists( 'clean_query_args' ) ) {
			$posted = clean_query_args( $posted );
		} elseif ( ! empty( $posted ) && class_exists( 'CAF_Builder_Query' ) ) {
			// Fallback light sanitize when helper is unavailable.
			$posted = self::sanitize_posted_query_args( $posted );
		} else {
			$posted = array();
		}

		$selected_filters = isset( $_POST['selected_filters'] ) && is_array( $_POST['selected_filters'] ) // phpcs:ignore WordPress.Security.NonceVerification.Missing
			? wp_unslash( $_POST['selected_filters'] ) // phpcs:ignore WordPress.Security.NonceVerification.Missing,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
			: array();

		if ( ! empty( $posted ) ) {
			$query_args = array_merge( $query_args, $posted );
			$query_args['post_type']      = 'product';
			$query_args['posts_per_page'] = $limit;
			$query_args['paged']          = $page;

			$query_args = apply_filters(
				'caf_builder_ajax_query_args',
				$query_args,
				array(
					'builder_index'    => $shortindex,
					'is_ajax'          => true,
					'selected_filters' => $selected_filters,
					'response_mode'    => 'main_query_listing',
					'source'           => 'main_query',
				)
			);
		} else {
			$filter_args = self::build_filter_args_for_index( $shortindex );
			$query_args  = self::merge_args_into_query_array( $query_args, $filter_args );
		}

		// Keep Woo catalog visibility rules.
		if ( function_exists( 'WC' ) && isset( WC()->query ) && is_object( WC()->query ) && method_exists( WC()->query, 'get_tax_query' ) ) {
			$tax_query = WC()->query->get_tax_query();
			if ( ! empty( $tax_query ) && is_array( $tax_query ) ) {
				$existing = isset( $query_args['tax_query'] ) && is_array( $query_args['tax_query'] )
					? $query_args['tax_query']
					: array();
				$query_args['tax_query'] = array_merge( array( 'relation' => 'AND' ), $existing, $tax_query );
			}
		}

		$query_args = apply_filters( 'woocommerce_shortcode_products_query', $query_args, array(), 'products' );
		$query_args = apply_filters( 'caf_builder_main_query_ajax_query_args', $query_args, $shortindex );

		// Public listing: never allow client to override status (or related attack keys).
		unset(
			$query_args['author'],
			$query_args['author_name'],
			$query_args['author__in'],
			$query_args['author__not_in'],
			$query_args['perm'],
			$query_args['has_password'],
			$query_args['post_password']
		);
		$query_args['post_status']    = 'publish';
		$query_args['post_type']      = 'product';
		$query_args['posts_per_page'] = $limit;
		$query_args['paged']          = $page;

		$loop = new WP_Query( $query_args );
		$found = (int) $loop->found_posts;

		$products_html  = '';
		$products_inner = '';

		if ( $loop->have_posts() ) {
			if ( function_exists( 'wc_setup_loop' ) ) {
				wc_setup_loop(
					array(
						'columns'      => $columns,
						'name'         => 'products',
						'is_shortcode' => true,
						'is_paginated' => true,
						'total'        => $found,
						'total_pages'  => (int) $loop->max_num_pages,
						'per_page'     => $limit,
						'current_page' => $page,
					)
				);
			}

			ob_start();
			while ( $loop->have_posts() ) {
				$loop->the_post();
				wc_get_template_part( 'content', 'product' );
			}
			$products_inner = ob_get_clean();
			wp_reset_postdata();

			$products_html = '<ul class="' . esc_attr( $products_class ) . '">' . $products_inner . '</ul>';
		} else {
			wp_reset_postdata();
		}

		$total_pages = max( 1, (int) $loop->max_num_pages );

		$result_count_html = '';
		if ( $found > 0 ) {
			$from = ( ( $page - 1 ) * $limit ) + 1;
			$to   = min( $page * $limit, $found );
			$text = ( 1 === $found )
				? esc_html__( 'Showing the single result', 'woocommerce' )
				: sprintf(
					/* translators: 1: first result number, 2: last result number, 3: total results */
					esc_html__( 'Showing %1$d&ndash;%2$d of %3$d results', 'woocommerce' ),
					(int) $from,
					(int) $to,
					(int) $found
				);
			$result_count_html = '<p class="woocommerce-result-count" role="status" aria-relevant="all">' . $text . '</p>';
		}

		$pagination_html = self::render_ajax_pagination_html(
			$page,
			$total_pages,
			isset( $_POST['base_url'] ) ? (string) wp_unslash( $_POST['base_url'] ) : '' // phpcs:ignore WordPress.Security.NonceVerification.Missing,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized
		);

		if ( function_exists( 'wc_reset_loop' ) ) {
			wc_reset_loop();
		}

		$empty_html = '';
		if ( '' === $products_html ) {
			$empty_html = '<p class="woocommerce-info woocommerce-no-products-found">' .
				esc_html__( 'No products were found matching your selection.', 'woocommerce' ) .
				'</p>';
		}

		$companions = array(
			'p.woocommerce-result-count' => $result_count_html,
			'.woocommerce-result-count'  => $result_count_html,
		);
		if ( '' !== $pagination_html ) {
			$companions['nav.woocommerce-pagination'] = $pagination_html;
			$companions['.woocommerce-pagination']    = $pagination_html;
		}

		wp_send_json_success(
			array(
				'products'          => $products_html,
				'products_inner'    => $products_inner,
				'products_selector' => 'ul.products',
				'result_count_html' => $result_count_html,
				'pagination_html'   => $pagination_html,
				'empty'             => $empty_html,
				'empty_selector'    => '.woocommerce-no-products-found',
				'found_posts'       => $found,
				'total_pages'       => $total_pages,
				'current_page'      => $page,
				'companions'        => $companions,
			)
		);
	}

	/**
	 * Build WooCommerce-style shortcode pagination (uses ?product-page=N links).
	 *
	 * @param int    $current_page Current page.
	 * @param int    $total_pages  Total pages.
	 * @param string $base_url     Page URL without product-page (optional).
	 * @return string
	 */
	protected static function render_ajax_pagination_html( $current_page, $total_pages, $base_url = '' ) {
		$current_page = max( 1, absint( $current_page ) );
		$total_pages  = max( 1, absint( $total_pages ) );

		if ( $total_pages <= 1 ) {
			return '';
		}

		$base_url = esc_url_raw( trim( (string) $base_url ) );
		if ( '' === $base_url ) {
			$base_url = home_url( '/' );
		}

		$parts = wp_parse_url( $base_url );
		$path  = isset( $parts['path'] ) ? (string) $parts['path'] : '/';
		$query = array();
		if ( ! empty( $parts['query'] ) ) {
			parse_str( (string) $parts['query'], $query );
		}
		unset( $query['product-page'], $query['product_page'], $query['paged'], $query['page'] );

		$scheme_host = '';
		if ( ! empty( $parts['scheme'] ) && ! empty( $parts['host'] ) ) {
			$scheme_host = $parts['scheme'] . '://' . $parts['host'];
			if ( ! empty( $parts['port'] ) ) {
				$scheme_host .= ':' . (int) $parts['port'];
			}
		}

		$base_with_query = $scheme_host . $path;
		if ( ! empty( $query ) ) {
			$base_with_query = add_query_arg( $query, $base_with_query );
		}

		// Avoid URL-encoding %#% (same trick Woo uses for shortcode pagination).
		$base_link = esc_url_raw( add_query_arg( 'product-page', 999999999, $base_with_query ) );
		$base_link = str_replace( array( '999999999', urlencode( '999999999' ) ), '%#%', $base_link );

		$links = paginate_links(
			array(
				'base'      => $base_link,
				'format'    => '',
				'add_args'  => false,
				'current'   => $current_page,
				'total'     => $total_pages,
				'prev_text' => '&larr;',
				'next_text' => '&rarr;',
				'type'      => 'list',
				'end_size'  => 3,
				'mid_size'  => 3,
			)
		);

		if ( ! is_string( $links ) || '' === $links ) {
			return '';
		}

		return '<nav class="woocommerce-pagination" aria-label="' . esc_attr__( 'Product Pagination', 'woocommerce' ) . '">' . $links . '</nav>';
	}

	/**
	 * Light sanitize for posted query args when clean_query_args() is unavailable.
	 *
	 * @param array<string, mixed> $args Posted args.
	 * @return array<string, mixed>
	 */
	protected static function sanitize_posted_query_args( $args ) {
		if ( ! is_array( $args ) ) {
			return array();
		}
		$out = array();
		foreach ( array( 'tax_query', 'meta_query', 'post__in', 'post__not_in', 's', 'orderby', 'order' ) as $key ) {
			if ( array_key_exists( $key, $args ) ) {
				$out[ $key ] = $args[ $key ];
			}
		}
		return $out;
	}
}

