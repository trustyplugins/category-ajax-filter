<?php
/**
 * CAF MCP document API for Cursor.
 *
 * GET structure is read-only except a one-time additive save of missing node ids
 * so ids in the response match disk. manage-modules writes go through normalize.
 * Frontend rendering does not use node ids.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( file_exists( __DIR__ . '/class-caf-mcp-tier.php' ) ) {
	require_once __DIR__ . '/class-caf-mcp-tier.php';
}
if ( file_exists( __DIR__ . '/class-caf-mcp-schemas.php' ) ) {
	require_once __DIR__ . '/class-caf-mcp-schemas.php';
}
if ( file_exists( __DIR__ . '/class-caf-mcp-css.php' ) ) {
	require_once __DIR__ . '/class-caf-mcp-css.php';
}
if ( file_exists( __DIR__ . '/class-caf-mcp-compose.php' ) ) {
	require_once __DIR__ . '/class-caf-mcp-compose.php';
}
if ( file_exists( __DIR__ . '/class-caf-mcp-document.php' ) ) {
	require_once __DIR__ . '/class-caf-mcp-document.php';
}
if ( file_exists( __DIR__ . '/class-caf-mcp-preview.php' ) ) {
	require_once __DIR__ . '/class-caf-mcp-preview.php';
}
if ( file_exists( __DIR__ . '/class-caf-mcp-http.php' ) ) {
	require_once __DIR__ . '/class-caf-mcp-http.php';
}
if ( file_exists( __DIR__ . '/class-caf-mcp-activity.php' ) ) {
	require_once __DIR__ . '/class-caf-mcp-activity.php';
}
if ( file_exists( __DIR__ . '/class-caf-mcp-setup.php' ) ) {
	require_once __DIR__ . '/class-caf-mcp-setup.php';
}

if ( ! class_exists( 'CAF_MCP', false ) ) {

class CAF_MCP {

	const NS             = 'caf-custom-builder/v1';
	const MAX_OPERATIONS = 50;
	const PREVIEW_QUERY  = 'caf_mcp_preview';
	const PREVIEW_TTL    = 3600;

	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_rest_routes' ) );
		if ( did_action( 'rest_api_init' ) ) {
			self::register_rest_routes();
		}
		add_filter( 'query_vars', array( __CLASS__, 'register_preview_query_var' ) );
		add_action( 'template_redirect', array( __CLASS__, 'maybe_render_preview' ), 1 );
		add_filter( 'wp_is_application_passwords_available', array( __CLASS__, 'allow_local_app_passwords' ) );
	}

	/**
	 * WP only allows app passwords on SSL or WP_ENVIRONMENT_TYPE=local.
	 * Local XAMPP is HTTP localhost — enable there so Cursor MCP can authenticate.
	 *
	 * @param bool $available Current.
	 * @return bool
	 */
	public static function allow_local_app_passwords( $available ) {
		if ( $available ) {
			return $available;
		}
		$host = wp_parse_url( home_url(), PHP_URL_HOST );
		return in_array( $host, array( 'localhost', '127.0.0.1' ), true );
	}

	public static function register_rest_routes() {
		register_rest_route(
			self::NS,
			'/mcp/layouts',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'rest_list_layouts' ),
					'permission_callback' => 'caf_pro_rest_permission_manage_options',
					'args'                => array(
						'include_trash' => array(
							'required' => false,
							'type'     => 'boolean',
							'default'  => false,
						),
					),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'rest_create_layout' ),
					'permission_callback' => 'caf_pro_rest_permission_manage_options',
					'args'                => array(
						'label'     => array(
							'required' => true,
							'type'     => 'string',
						),
						'post_type' => array(
							'required' => false,
							'type'     => 'string',
						),
						'taxonomy'  => array(
							'required' => false,
							'type'     => 'string',
						),
						'status'    => array(
							'required' => false,
							'type'     => 'string',
						),
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/layouts/(?P<layout_id>[a-zA-Z0-9_-]+)',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'rest_update_layout' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'layout_id' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/layouts/(?P<layout_id>[a-zA-Z0-9_-]+)/structure',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'rest_get_structure' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'layout_id'       => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
					'element_id'      => array(
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'include_content' => array(
						'required' => false,
						'type'     => 'boolean',
						'default'  => false,
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/layouts/(?P<layout_id>[a-zA-Z0-9_-]+)/revision',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'rest_get_revision' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'layout_id' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/layouts/(?P<layout_id>[a-zA-Z0-9_-]+)/preview',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'rest_create_preview' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'layout_id' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/layouts/(?P<layout_id>[a-zA-Z0-9_-]+)/modules',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'rest_manage_modules' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'layout_id' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/layouts/(?P<layout_id>[a-zA-Z0-9_-]+)/filter',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'rest_build_filter' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'layout_id' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/layouts/(?P<layout_id>[a-zA-Z0-9_-]+)/post',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'rest_build_post' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'layout_id' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/layouts/(?P<layout_id>[a-zA-Z0-9_-]+)/settings',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'rest_update_layout_settings' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'layout_id' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/layouts/(?P<layout_id>[a-zA-Z0-9_-]+)/duplicate',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'rest_duplicate_layout' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'layout_id' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/layouts/(?P<layout_id>[a-zA-Z0-9_-]+)/trash',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'rest_trash_layout' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'layout_id' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/layouts/(?P<layout_id>[a-zA-Z0-9_-]+)/restore',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'rest_restore_layout' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'layout_id' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/layouts/(?P<layout_id>[a-zA-Z0-9_-]+)/delete',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'rest_delete_layout_permanent' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'layout_id' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/layouts/(?P<layout_id>[a-zA-Z0-9_-]+)/query-restriction',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'rest_update_query_restriction' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'layout_id' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/layouts/(?P<layout_id>[a-zA-Z0-9_-]+)/filter-query',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'rest_update_filter_query' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'layout_id' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/layouts/(?P<layout_id>[a-zA-Z0-9_-]+)/export',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'rest_export_layout' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'layout_id' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
					'scope'     => array(
						'required'          => false,
						'sanitize_callback' => 'sanitize_key',
						'default'           => 'full',
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/layouts/(?P<layout_id>[a-zA-Z0-9_-]+)/import',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'rest_import_into_layout' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'layout_id' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/import',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'rest_import_new_layout' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/layouts/(?P<layout_id>[a-zA-Z0-9_-]+)/revisions',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( __CLASS__, 'rest_list_revisions' ),
					'permission_callback' => 'caf_pro_rest_permission_manage_options',
					'args'                => array(
						'layout_id' => array(
							'required'          => true,
							'sanitize_callback' => 'sanitize_key',
						),
					),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( __CLASS__, 'rest_restore_revision' ),
					'permission_callback' => 'caf_pro_rest_permission_manage_options',
					'args'                => array(
						'layout_id' => array(
							'required'          => true,
							'sanitize_callback' => 'sanitize_key',
						),
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/module-schemas',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'rest_list_module_schemas' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'summary' => array(
						'required' => false,
						'type'     => 'boolean',
						'default'  => true,
					),
					'tree'    => array(
						'required'          => false,
						'sanitize_callback' => 'sanitize_key',
						'default'           => 'filter',
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/module-schemas/(?P<module_key>[a-zA-Z0-9_-]+)',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'rest_get_module_schema' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'module_key' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/post-types',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'rest_list_post_types' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/taxonomies',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'rest_list_taxonomies' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'post_type' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
					'search'    => array(
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'limit'     => array(
						'required' => false,
						'type'     => 'integer',
						'default'  => 50,
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/custom-fields',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'rest_list_custom_fields' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'post_type' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/woo-attributes',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'rest_list_woo_attributes' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'post_type' => array(
						'required'          => false,
						'sanitize_callback' => 'sanitize_key',
						'default'           => 'product',
					),
					'search'    => array(
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'limit'     => array(
						'required' => false,
						'type'     => 'integer',
						'default'  => 50,
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/price-range',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'rest_get_price_range' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/media',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'rest_list_media' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'search' => array(
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'limit'  => array(
						'required' => false,
						'type'     => 'integer',
						'default'  => 20,
					),
				),
			)
		);
		register_rest_route(
			self::NS,
			'/mcp/posts',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'rest_list_posts' ),
				'permission_callback' => 'caf_pro_rest_permission_manage_options',
				'args'                => array(
					'post_type' => array(
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
					'search'    => array(
						'required'          => false,
						'sanitize_callback' => 'sanitize_text_field',
					),
					'limit'     => array(
						'required' => false,
						'type'     => 'integer',
						'default'  => 20,
					),
				),
			)
		);
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function rest_list_layouts( $request = null ) {
		$include_trash = false;
		if ( $request instanceof WP_REST_Request ) {
			$include_trash = rest_sanitize_boolean( $request->get_param( 'include_trash' ) );
		}
		$list    = get_option( 'caf_builder_layouts_list', array() );
		$layouts = array();
		if ( ! is_array( $list ) ) {
			$list = array();
		}
		foreach ( $list as $index => $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$status = isset( $item['post_status'] ) ? (string) $item['post_status'] : 'publish';
			if ( 'trash' === $status && ! $include_trash ) {
				continue;
			}
			$key        = isset( $item['key'] ) ? (string) $item['key'] : '';
			$option_key = 'caf_' . $key . '_' . (int) $index;
			$layouts[]  = array(
				'layout_id'  => 'caf_' . (int) $index,
				'index'      => (int) $index,
				'label'      => isset( $item['label'] ) ? (string) $item['label'] : $key,
				'status'     => $status,
				'shortcode'  => "[caf_filter id='caf_" . (int) $index . "']",
				'option_key' => $option_key,
				'has_data'   => (bool) get_option( $option_key ),
			);
		}

		return rest_ensure_response(
			array(
				'status'  => 'success',
				'layouts' => $layouts,
			)
		);
	}

	/**
	 * Create a new builder layout (draft by default). Shortcode id is caf_N.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_create_layout( $request ) {
		$body  = self::request_body( $request );
		$label = isset( $body['label'] ) ? sanitize_text_field( (string) $body['label'] ) : '';
		$label = trim( $label );
		if ( '' === $label ) {
			return new WP_Error(
				'caf_mcp_missing_label',
				__( 'Pass label (the filter name).', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		if ( strlen( $label ) > 200 ) {
			$label = substr( $label, 0, 200 );
		}

		$post_type = isset( $body['post_type'] ) ? sanitize_key( (string) $body['post_type'] ) : '';
		if ( '' === $post_type || '0' === $post_type ) {
			return self::need_post_type_error();
		}
		if ( ! post_type_exists( $post_type ) ) {
			return self::need_post_type_error(
				sprintf(
					/* translators: %s: post type slug */
					__( 'Unknown post_type "%s". Pick one from the list (or ask the user), then call caf-create-layout again.', 'category-ajax-filter' ),
					$post_type
				)
			);
		}

		$taxonomy = isset( $body['taxonomy'] ) ? CAF_MCP_Compose::normalize_bind_taxonomy_key( $body['taxonomy'] ) : '';
		if ( '' !== $taxonomy ) {
			$tax_ok = self::lean_taxonomy_choices( $post_type );
			$keys   = array();
			foreach ( $tax_ok as $row ) {
				if ( isset( $row['key'] ) ) {
					$keys[] = (string) $row['key'];
				}
			}
			if ( ! in_array( $taxonomy, $keys, true ) ) {
				return new WP_Error(
					'caf_mcp_bad_taxonomy',
					sprintf(
						/* translators: %s: post type slug */
						__( 'That taxonomy is not available for post_type %s. Ask the user which taxonomy to bind, or omit taxonomy (checkbox stays unbound like UI Add New).', 'category-ajax-filter' ),
						$post_type
					),
					array(
						'status'     => 400,
						'post_type'  => $post_type,
						'taxonomies' => $tax_ok,
					)
				);
			}
		}

		$status = isset( $body['status'] ) ? sanitize_key( (string) $body['status'] ) : 'draft';
		if ( ! in_array( $status, array( 'draft', 'publish' ), true ) ) {
			return new WP_Error(
				'caf_mcp_bad_status',
				__( 'status must be draft or publish.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}

		if ( ! function_exists( 'caf_save_new_layout_list' ) ) {
			return new WP_Error(
				'caf_mcp_create_unavailable',
				__( 'Layout list helper is not loaded.', 'category-ajax-filter' ),
				array( 'status' => 500 )
			);
		}

		$saved = caf_save_new_layout_list( $label );
		if ( is_wp_error( $saved ) ) {
			return $saved;
		}

		$index      = isset( $saved['index'] ) ? (int) $saved['index'] : 0;
		$option_key = 'caf_' . (string) $saved['key'];
		$doc        = self::new_blank_layout_document(
			$label,
			$post_type,
			$status,
			$option_key,
			$index,
			array(
				'seed_starter' => true,
				'taxonomy'     => $taxonomy,
			)
		);
		if ( is_wp_error( $doc ) ) {
			if ( function_exists( 'caf_delete_builder_layout_permanent' ) ) {
				caf_delete_builder_layout_permanent( array( 'index' => $index ) );
			}
			return $doc;
		}

		$payload = array(
			'layout_id'  => 'caf_' . $index,
			'index'      => $index,
			'option_key' => $option_key,
			'label'      => $label,
			'shortcode'  => "[caf_filter id='caf_" . $index . "']",
		);
		self::persist_layout( $payload, $doc );

		$list = get_option( 'caf_builder_layouts_list', array() );
		if ( is_array( $list ) && isset( $list[ $index ] ) && is_array( $list[ $index ] ) ) {
			$list[ $index ]['post_status'] = $status;
			update_option( 'caf_builder_layouts_list', $list );
		}

		if ( function_exists( 'caf_sync_builder_analytics_option_from_layout' ) ) {
			caf_sync_builder_analytics_option_from_layout( $index, $doc );
		}
		if ( function_exists( 'caf_sync_builder_seo_options_from_layout' ) ) {
			caf_sync_builder_seo_options_from_layout( $index, $doc );
		}

		$checkbox = self::find_module_in_tree( $doc, 'filter', 'checkbox_filter' );
		$bound    = false;
		if ( is_object( $checkbox ) && isset( $checkbox->settings->taxonomy_data ) && is_array( $checkbox->settings->taxonomy_data ) ) {
			$bound = ! empty( $checkbox->settings->taxonomy_data );
		}
		$tax_choices = self::lean_taxonomy_choices( $post_type );
		$next_step   = $bound
			? __( 'Starter matches UI Add New. Continue with style or extra modules if the user asked.', 'category-ajax-filter' )
			: __( 'Starter matches UI Add New (search, unbound checkbox, reset, post card, pagination). Ask which taxonomy to bind, then caf-manage-modules bind_taxonomy on the checkbox id. Do not guess product_cat on a post filter.', 'category-ajax-filter' );

		return rest_ensure_response(
			self::with_preview_links(
				array(
					'status'         => 'success',
					'layout_id'      => $payload['layout_id'],
					'label'          => $label,
					'shortcode'      => $payload['shortcode'],
					'layout_status'  => $status,
					'post_type'      => $post_type,
					'taxonomy'       => $taxonomy,
					'checkbox_bound' => $bound,
					'seeded'         => array(
						'filter' => array( 'search', 'checkbox_filter', 'reset' ),
						'post'   => array(
							'media' => array( 'image' ),
							'meta'  => array( 'author', 'date', 'commentcount' ),
							'body'  => array( 'title', 'categories', 'excerpt', 'button' ),
						),
						'chrome' => array( 'selected', 'result_count', 'sorting', 'pagination' ),
					),
					'taxonomies'     => $tax_choices,
					'next_step'      => $next_step,
					'revision'       => self::get_revision( $option_key ),
					'filter'         => self::lean_tree(
						isset( $doc->filter_layout_data->initial_data ) ? $doc->filter_layout_data->initial_data : array(),
						false
					),
					'post'           => self::lean_tree(
						isset( $doc->post_layout_data->initial_data ) ? $doc->post_layout_data->initial_data : array(),
						false
					),
				),
				$payload
			)
		);
	}

	/**
	 * Rename a layout and/or set draft|publish. Does not change layout_id or shortcode.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_update_layout( $request ) {
		$resolved = self::resolve_layout_ref( (string) $request['layout_id'] );
		if ( is_wp_error( $resolved ) ) {
			return $resolved;
		}

		$body = self::request_body( $request );

		$has_label  = array_key_exists( 'label', $body );
		$has_status = array_key_exists( 'status', $body );
		if ( ! $has_label && ! $has_status ) {
			return new WP_Error(
				'caf_mcp_missing_fields',
				__( 'Pass label and/or status (draft or publish).', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}

		$label = $has_label ? trim( sanitize_text_field( (string) $body['label'] ) ) : '';
		if ( $has_label && '' === $label ) {
			return new WP_Error(
				'caf_mcp_missing_label',
				__( 'label cannot be empty.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		if ( strlen( $label ) > 200 ) {
			$label = substr( $label, 0, 200 );
		}

		$status = '';
		if ( $has_status ) {
			$status = sanitize_key( (string) $body['status'] );
			if ( ! in_array( $status, array( 'draft', 'publish' ), true ) ) {
				return new WP_Error(
					'caf_mcp_bad_status',
					__( 'status must be draft or publish.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
		}

		$index = $resolved['index'];
		$list  = get_option( 'caf_builder_layouts_list', array() );
		if ( ! is_array( $list ) || null === $index || ! isset( $list[ $index ] ) || ! is_array( $list[ $index ] ) ) {
			return new WP_Error(
				'caf_mcp_layout_not_found',
				__( 'That CAF builder layout was not found.', 'category-ajax-filter' ),
				array( 'status' => 404 )
			);
		}

		if ( $has_label ) {
			$list[ $index ]['label'] = $label;
		}
		if ( $has_status ) {
			$list[ $index ]['post_status'] = $status;
		}
		update_option( 'caf_builder_layouts_list', $list );

		$raw = get_option( $resolved['option_key'] );
		if ( ! empty( $raw ) ) {
			$raw = json_decode( wp_json_encode( $raw ) );
			if ( is_object( $raw ) ) {
				$doc = function_exists( 'caf_normalize_builder_layout_data' )
					? caf_normalize_builder_layout_data( $raw, array( 'assign_node_ids' => false ) )
					: $raw;
				if ( ! isset( $doc->common_data ) || ! is_object( $doc->common_data ) ) {
					$doc->common_data = new stdClass();
				}
				if ( $has_label ) {
					$doc->common_data->layout_name = $label;
				}
				if ( $has_status ) {
					$doc->common_data->layout_publish = $status;
				}
				self::persist_layout( $resolved, $doc );
			}
		}

		$fresh_list = get_option( 'caf_builder_layouts_list', array() );
		$item       = ( is_array( $fresh_list ) && isset( $fresh_list[ $index ] ) ) ? $fresh_list[ $index ] : $list[ $index ];

		return rest_ensure_response(
			array(
				'status'        => 'success',
				'layout_id'     => $resolved['layout_id'],
				'label'         => isset( $item['label'] ) ? (string) $item['label'] : $resolved['label'],
				'shortcode'     => $resolved['shortcode'],
				'layout_status' => isset( $item['post_status'] ) ? (string) $item['post_status'] : '',
				'revision'      => self::get_revision( $resolved['option_key'] ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return array<string, mixed>
	 */
	private static function request_body( $request ) {
		$params = $request->get_params();
		$json   = $request->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}
		if ( is_array( $json ) && ! empty( $json ) ) {
			return array_merge( $params, $json );
		}
		return $params;
	}

	/**
	 * Duplicate a layout as a new draft. New layout_id / shortcode.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_duplicate_layout( $request ) {
		$resolved = self::load_layout( (string) $request['layout_id'], true );
		if ( is_wp_error( $resolved ) ) {
			return $resolved;
		}
		if ( ! function_exists( 'caf_save_new_layout_list' ) ) {
			return new WP_Error(
				'caf_mcp_create_unavailable',
				__( 'Layout list helper is not loaded.', 'category-ajax-filter' ),
				array( 'status' => 500 )
			);
		}
		$label = $resolved['label'];
		if ( function_exists( 'caf_generate_unique_layout_name' ) ) {
			$label = caf_generate_unique_layout_name( $label );
		} else {
			$label = $label . ' Copy';
		}
		$saved = caf_save_new_layout_list( $label );
		if ( is_wp_error( $saved ) ) {
			return $saved;
		}
		$index      = (int) $saved['index'];
		$option_key = 'caf_' . (string) $saved['key'];
		$doc        = json_decode( wp_json_encode( $resolved['doc'] ) );
		if ( ! is_object( $doc ) ) {
			$doc = $resolved['doc'];
		}
		if ( ! isset( $doc->common_data ) || ! is_object( $doc->common_data ) ) {
			$doc->common_data = new stdClass();
		}
		$doc->common_data->layout_name    = $label;
		$doc->common_data->layout_key     = $option_key;
		$doc->common_data->layout_index   = $index;
		$doc->common_data->layout_publish = 'draft';
		$payload                          = array(
			'layout_id'  => 'caf_' . $index,
			'index'      => $index,
			'option_key' => $option_key,
			'label'      => $label,
			'shortcode'  => "[caf_filter id='caf_" . $index . "']",
		);
		self::persist_layout( $payload, $doc );
		return rest_ensure_response(
			self::with_preview_links(
				array(
					'status'        => 'success',
					'layout_id'     => $payload['layout_id'],
					'source_id'     => $resolved['layout_id'],
					'label'         => $label,
					'shortcode'     => $payload['shortcode'],
					'layout_status' => 'draft',
					'revision'      => self::get_revision( $option_key ),
				),
				$payload
			)
		);
	}

	/**
	 * Move a layout to trash. Restore with rest_restore_layout.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_trash_layout( $request ) {
		$resolved = self::resolve_layout_ref( (string) $request['layout_id'] );
		if ( is_wp_error( $resolved ) ) {
			return $resolved;
		}
		if ( ! function_exists( 'caf_delete_builder_layout' ) ) {
			return new WP_Error( 'caf_mcp_trash_unavailable', __( 'Trash helper is not loaded.', 'category-ajax-filter' ), array( 'status' => 500 ) );
		}
		caf_delete_builder_layout( array( 'index' => $resolved['index'] ) );
		return rest_ensure_response(
			array(
				'status'        => 'success',
				'layout_id'     => $resolved['layout_id'],
				'layout_status' => 'trash',
				'shortcode'     => $resolved['shortcode'],
			)
		);
	}

	/**
	 * Restore a trashed layout as draft.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_restore_layout( $request ) {
		$resolved = self::resolve_layout_ref( (string) $request['layout_id'] );
		if ( is_wp_error( $resolved ) ) {
			return $resolved;
		}
		if ( ! function_exists( 'caf_restore_builder_layout' ) ) {
			return new WP_Error( 'caf_mcp_restore_unavailable', __( 'Restore helper is not loaded.', 'category-ajax-filter' ), array( 'status' => 500 ) );
		}
		caf_restore_builder_layout( array( 'index' => $resolved['index'] ) );
		$raw = get_option( $resolved['option_key'] );
		if ( ! empty( $raw ) ) {
			$raw = json_decode( wp_json_encode( $raw ) );
			if ( is_object( $raw ) ) {
				if ( ! isset( $raw->common_data ) || ! is_object( $raw->common_data ) ) {
					$raw->common_data = new stdClass();
				}
				$raw->common_data->layout_publish = 'draft';
				self::persist_layout( $resolved, $raw );
			}
		}
		return rest_ensure_response(
			array(
				'status'        => 'success',
				'layout_id'     => $resolved['layout_id'],
				'layout_status' => 'draft',
				'shortcode'     => $resolved['shortcode'],
			)
		);
	}

	/**
	 * Permanently delete a trashed layout. Requires confirm=true.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_delete_layout_permanent( $request ) {
		$resolved = self::resolve_layout_ref( (string) $request['layout_id'] );
		if ( is_wp_error( $resolved ) ) {
			return $resolved;
		}
		$body    = self::request_body( $request );
		$confirm = ! empty( $body['confirm'] );
		if ( ! $confirm ) {
			return new WP_Error(
				'caf_mcp_confirm_required',
				__( 'Permanent delete requires confirm=true. Trash first with caf-trash-layout unless the layout is already in trash.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		$status = isset( $resolved['status'] ) ? (string) $resolved['status'] : '';
		if ( 'trash' !== $status ) {
			$list = get_option( 'caf_builder_layouts_list', array() );
			if ( is_array( $list ) && isset( $list[ $resolved['index'] ]['post_status'] ) ) {
				$status = (string) $list[ $resolved['index'] ]['post_status'];
			}
		}
		if ( 'trash' !== $status ) {
			return new WP_Error(
				'caf_mcp_not_trashed',
				__( 'Move the layout to trash first (caf-trash-layout), then permanently delete.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		if ( ! function_exists( 'caf_delete_builder_layout_permanent' ) ) {
			return new WP_Error( 'caf_mcp_delete_unavailable', __( 'Permanent delete helper is not loaded.', 'category-ajax-filter' ), array( 'status' => 500 ) );
		}
		if ( class_exists( 'CAF_MCP_Document', false ) ) {
			CAF_MCP_Document::delete_mcp_meta( $resolved['option_key'] );
		}
		caf_delete_builder_layout_permanent( array( 'index' => $resolved['index'] ) );
		return rest_ensure_response(
			array(
				'status'    => 'success',
				'layout_id' => $resolved['layout_id'],
				'deleted'   => true,
			)
		);
	}

	/**
	 * Patch include/exclude query restriction and Category / Term Page Mode.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_update_query_restriction( $request ) {
		if ( class_exists( 'CAF_MCP_Tier', false ) ) {
			return CAF_MCP_Tier::pro_only_error( 'query_restriction' );
		}
		if ( ! class_exists( 'CAF_MCP_Document', false ) ) {
			return new WP_Error( 'caf_mcp_document_missing', __( 'Query restriction helper is not loaded.', 'category-ajax-filter' ), array( 'status' => 500 ) );
		}
		$resolved = self::load_layout( (string) $request['layout_id'], true );
		if ( is_wp_error( $resolved ) ) {
			return $resolved;
		}
		$body    = self::request_body( $request );
		$dry_run = ! empty( $body['dry_run'] );
		unset( $body['layout_id'], $body['dry_run'] );
		$applied = CAF_MCP_Document::apply_query_restriction( $resolved['doc'], $body );
		if ( is_wp_error( $applied ) ) {
			return $applied;
		}
		$revision = self::get_revision( $resolved['option_key'] );
		if ( ! $dry_run ) {
			$revision = self::persist_layout( $resolved, $resolved['doc'] );
		}
		return rest_ensure_response(
			array(
				'status'            => 'success',
				'layout_id'         => $resolved['layout_id'],
				'dry_run'           => $dry_run,
				'revision'          => $revision,
				'changed'           => $applied,
				'query_restriction' => CAF_MCP_Document::lean_query_restriction( $resolved['doc'] ),
				'term_page_mode'    => CAF_MCP_Document::lean_term_page_mode( $resolved['doc'] ),
			)
		);
	}

	/**
	 * Layout-level custom-field query conditions (filter_query_data).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_update_filter_query( $request ) {
		if ( class_exists( 'CAF_MCP_Tier', false ) ) {
			return CAF_MCP_Tier::pro_only_error( 'filter_query' );
		}
		if ( ! class_exists( 'CAF_MCP_Document', false ) ) {
			return new WP_Error( 'caf_mcp_document_missing', __( 'Filter query helper is not loaded.', 'category-ajax-filter' ), array( 'status' => 500 ) );
		}
		$resolved = self::load_layout( (string) $request['layout_id'], true );
		if ( is_wp_error( $resolved ) ) {
			return $resolved;
		}
		$body    = self::request_body( $request );
		$dry_run = ! empty( $body['dry_run'] );
		unset( $body['layout_id'], $body['dry_run'] );
		$applied = CAF_MCP_Document::apply_filter_query( $resolved['doc'], $body );
		if ( is_wp_error( $applied ) ) {
			return $applied;
		}
		$revision = self::get_revision( $resolved['option_key'] );
		if ( ! $dry_run ) {
			$revision = self::persist_layout( $resolved, $resolved['doc'] );
		}
		return rest_ensure_response(
			array(
				'status'       => 'success',
				'layout_id'    => $resolved['layout_id'],
				'dry_run'      => $dry_run,
				'revision'     => $revision,
				'changed'      => $applied,
				'filter_query' => CAF_MCP_Document::lean_filter_query( $resolved['doc'] ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_export_layout( $request ) {
		if ( ! class_exists( 'CAF_MCP_Document', false ) ) {
			return new WP_Error( 'caf_mcp_document_missing', __( 'Export helper is not loaded.', 'category-ajax-filter' ), array( 'status' => 500 ) );
		}
		$resolved = self::load_layout( (string) $request['layout_id'], true );
		if ( is_wp_error( $resolved ) ) {
			return $resolved;
		}
		$scope   = sanitize_key( (string) $request->get_param( 'scope' ) );
		$payload = CAF_MCP_Document::export_payload(
			$resolved['doc'],
			$scope,
			$resolved['layout_id'],
			$resolved['label']
		);
		if ( is_wp_error( $payload ) ) {
			return $payload;
		}
		return rest_ensure_response(
			array(
				'status'    => 'success',
				'layout_id' => $resolved['layout_id'],
				'document'  => $payload,
			)
		);
	}

	/**
	 * Replace trees on an existing layout from exported JSON.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_import_into_layout( $request ) {
		if ( ! class_exists( 'CAF_MCP_Document', false ) ) {
			return new WP_Error( 'caf_mcp_document_missing', __( 'Import helper is not loaded.', 'category-ajax-filter' ), array( 'status' => 500 ) );
		}
		$resolved = self::load_layout( (string) $request['layout_id'], true );
		if ( is_wp_error( $resolved ) ) {
			return $resolved;
		}
		$body     = self::request_body( $request );
		$document = isset( $body['document'] ) ? $body['document'] : $body;
		if ( is_array( $document ) && isset( $document['document'] ) ) {
			$document = $document['document'];
		}
		$scope    = isset( $body['scope'] ) ? (string) $body['scope'] : '';
		$mode     = isset( $body['mode'] ) ? (string) $body['mode'] : 'replace';
		$dry_run  = ! empty( $body['dry_run'] );
		$imported = CAF_MCP_Document::import_into( $resolved['doc'], $document, $scope, $mode );
		if ( is_wp_error( $imported ) ) {
			return $imported;
		}
		$revision = self::get_revision( $resolved['option_key'] );
		if ( ! $dry_run ) {
			$revision = self::persist_layout( $resolved, $imported );
		}
		return rest_ensure_response(
			array(
				'status'    => 'success',
				'layout_id' => $resolved['layout_id'],
				'dry_run'   => $dry_run,
				'revision'  => $revision,
				'mode'      => sanitize_key( $mode ),
				'scope'     => sanitize_key( $scope ),
				'settings'  => self::lean_settings( $imported ),
			)
		);
	}

	/**
	 * Create a new draft layout from exported JSON.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_import_new_layout( $request ) {
		if ( ! class_exists( 'CAF_MCP_Document', false ) ) {
			return new WP_Error( 'caf_mcp_document_missing', __( 'Import helper is not loaded.', 'category-ajax-filter' ), array( 'status' => 500 ) );
		}
		if ( ! function_exists( 'caf_save_new_layout_list' ) ) {
			return new WP_Error( 'caf_mcp_create_unavailable', __( 'Layout list helper is not loaded.', 'category-ajax-filter' ), array( 'status' => 500 ) );
		}
		$body     = self::request_body( $request );
		$document = isset( $body['document'] ) ? $body['document'] : null;
		if ( is_array( $document ) && isset( $document['document'] ) ) {
			$document = $document['document'];
		}
		if ( ! $document ) {
			return new WP_Error(
				'caf_mcp_missing_document',
				__( 'Pass document (exported CAF JSON).', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		$label = isset( $body['label'] ) ? sanitize_text_field( (string) $body['label'] ) : '';
		if ( '' === $label && is_array( $document ) && isset( $document['_export_meta']['label'] ) ) {
			$label = sanitize_text_field( (string) $document['_export_meta']['label'] );
		}
		if ( '' === $label ) {
			$label = 'Imported filter';
		}
		$saved = caf_save_new_layout_list( $label );
		if ( is_wp_error( $saved ) ) {
			return $saved;
		}
		$index      = (int) $saved['index'];
		$option_key = 'caf_' . (string) $saved['key'];
		$blank      = self::new_blank_layout_document(
			$label,
			'post',
			'draft',
			$option_key,
			$index,
			array( 'seed_starter' => false )
		);
		if ( is_wp_error( $blank ) ) {
			if ( function_exists( 'caf_delete_builder_layout_permanent' ) ) {
				caf_delete_builder_layout_permanent( array( 'index' => $index ) );
			}
			return $blank;
		}
		$imported   = CAF_MCP_Document::import_into(
			$blank,
			$document,
			isset( $body['scope'] ) ? (string) $body['scope'] : 'full',
			isset( $body['mode'] ) ? (string) $body['mode'] : 'replace'
		);
		if ( is_wp_error( $imported ) ) {
			if ( function_exists( 'caf_delete_builder_layout_permanent' ) ) {
				caf_delete_builder_layout_permanent( array( 'index' => $index ) );
			}
			return $imported;
		}
		$imported->common_data->layout_name    = $label;
		$imported->common_data->layout_key     = $option_key;
		$imported->common_data->layout_index   = $index;
		$imported->common_data->layout_publish = 'draft';
		$payload                               = array(
			'layout_id'  => 'caf_' . $index,
			'index'      => $index,
			'option_key' => $option_key,
			'label'      => $label,
			'shortcode'  => "[caf_filter id='caf_" . $index . "']",
		);
		$revision = self::persist_layout( $payload, $imported );
		return rest_ensure_response(
			self::with_preview_links(
				array(
					'status'        => 'success',
					'layout_id'     => $payload['layout_id'],
					'label'         => $label,
					'shortcode'     => $payload['shortcode'],
					'layout_status' => 'draft',
					'revision'      => $revision,
				),
				$payload
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_list_revisions( $request ) {
		$resolved = self::resolve_layout_ref( (string) $request['layout_id'] );
		if ( is_wp_error( $resolved ) ) {
			return $resolved;
		}
		$snaps = class_exists( 'CAF_MCP_Document', false )
			? CAF_MCP_Document::list_snapshots( $resolved['option_key'] )
			: array();
		return rest_ensure_response(
			array(
				'status'    => 'success',
				'layout_id' => $resolved['layout_id'],
				'revision'  => self::get_revision( $resolved['option_key'] ),
				'snapshots' => $snaps,
			)
		);
	}

	/**
	 * Restore an MCP snapshot. Creates a new snapshot of the restored document.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_restore_revision( $request ) {
		if ( ! class_exists( 'CAF_MCP_Document', false ) ) {
			return new WP_Error( 'caf_mcp_document_missing', __( 'Revision helper is not loaded.', 'category-ajax-filter' ), array( 'status' => 500 ) );
		}
		$resolved = self::load_layout( (string) $request['layout_id'], true );
		if ( is_wp_error( $resolved ) ) {
			return $resolved;
		}
		$body     = self::request_body( $request );
		$revision = isset( $body['revision'] ) ? absint( $body['revision'] ) : 0;
		if ( $revision < 1 ) {
			return new WP_Error(
				'caf_mcp_missing_revision',
				__( 'Pass revision from caf-list-revisions.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		$doc = CAF_MCP_Document::get_snapshot_doc( $resolved['option_key'], $revision );
		if ( ! $doc ) {
			return new WP_Error(
				'caf_mcp_revision_not_found',
				__( 'No snapshot for that revision. MCP keeps the last 5 writes.', 'category-ajax-filter' ),
				array( 'status' => 404 )
			);
		}
		$new_rev = self::persist_layout( $resolved, $doc );
		return rest_ensure_response(
			array(
				'status'    => 'success',
				'layout_id' => $resolved['layout_id'],
				'restored'  => $revision,
				'revision'  => $new_rev,
				'settings'  => self::lean_settings( $doc ),
			)
		);
	}

	/**
	 * Patch layout-level settings (query, filter position, pagination).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_update_layout_settings( $request ) {
		$resolved = self::load_layout( (string) $request['layout_id'], true );
		if ( is_wp_error( $resolved ) ) {
			return $resolved;
		}
		$body    = self::request_body( $request );
		$dry_run = ! empty( $body['dry_run'] );
		$patch   = isset( $body['settings'] ) && is_array( $body['settings'] ) ? $body['settings'] : $body;
		unset( $patch['layout_id'], $patch['dry_run'], $patch['settings'] );
		if ( empty( $patch ) ) {
			return new WP_Error(
				'caf_mcp_missing_settings',
				__( 'Pass last-screen settings (columns, masonry, css/target for Design, custom_class/nonce) or Misc fields: post_type, posts_per_page, order, orderby, filter_position, float_button_position, layout_source, pagination_type, analytics, filter_url, schema, dynamic_term_counts, global_font_family, preview_post_id.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		$applied = self::apply_layout_settings( $resolved['doc'], $patch );
		if ( is_wp_error( $applied ) ) {
			return $applied;
		}
		$revision = self::get_revision( $resolved['option_key'] );
		if ( ! $dry_run ) {
			$revision = self::persist_layout( $resolved, $resolved['doc'] );
		}
		return rest_ensure_response(
			array(
				'status'    => 'success',
				'layout_id' => $resolved['layout_id'],
				'dry_run'   => $dry_run,
				'revision'  => $revision,
				'changed'   => $applied,
				'settings'  => self::lean_settings( $resolved['doc'] ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function rest_list_module_schemas( $request ) {
		$summary = $request->get_param( 'summary' );
		$summary = null === $summary ? true : rest_sanitize_boolean( $summary );
		$tree    = sanitize_key( (string) $request->get_param( 'tree' ) );
		if ( '' === $tree ) {
			$tree = 'filter';
		}
		if ( ! class_exists( 'CAF_MCP_Schemas', false ) ) {
			return rest_ensure_response(
				array(
					'status'  => 'error',
					'widgets' => array(),
				)
			);
		}
		if ( $summary ) {
			return rest_ensure_response(
				array(
					'status'  => 'success',
					'tree'    => $tree,
					'widgets' => CAF_MCP_Schemas::summary( $tree ),
				)
			);
		}
		return rest_ensure_response(
			array(
				'status'  => 'success',
				'tree'    => $tree,
				'schemas' => CAF_MCP_Schemas::all( $tree ),
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_get_module_schema( $request ) {
		$key = sanitize_key( (string) $request['module_key'] );
		if ( ! class_exists( 'CAF_MCP_Schemas', false ) ) {
			return new WP_Error( 'caf_mcp_no_schemas', __( 'Module schemas are not loaded.', 'category-ajax-filter' ), array( 'status' => 500 ) );
		}
		$schema = CAF_MCP_Schemas::get( $key );
		if ( null === $schema ) {
			return new WP_Error(
				'caf_mcp_unknown_module',
				__( 'Unknown module type. Call GET /mcp/module-schemas?summary=true first.', 'category-ajax-filter' ),
				array( 'status' => 404 )
			);
		}
		return rest_ensure_response(
			array(
				'status'      => 'success',
				'module_key'  => $key,
				'schema'      => $schema,
			)
		);
	}

	/**
	 * Public post types the builder can filter (includes product when Woo is active).
	 *
	 * @return WP_REST_Response
	 */
	public static function rest_list_post_types() {
		return rest_ensure_response(
			array(
				'status'             => 'success',
				'post_types'         => self::public_post_type_choices(),
				'woocommerce_active' => class_exists( 'WooCommerce', false ),
			)
		);
	}

	/**
	 * Lean taxonomy + term list for one post type. Not the builder HTML catalog.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_list_taxonomies( $request ) {
		$post_type = sanitize_key( (string) $request->get_param( 'post_type' ) );
		if ( '' === $post_type ) {
			return new WP_Error(
				'caf_mcp_missing_post_type',
				__( 'Pass post_type (from get-layout-structure settings).', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		$search = sanitize_text_field( (string) $request->get_param( 'search' ) );
		$limit  = (int) $request->get_param( 'limit' );
		if ( $limit < 1 ) {
			$limit = 50;
		}
		if ( $limit > 200 ) {
			$limit = 200;
		}

		$tax_objects = get_object_taxonomies( $post_type, 'objects' );
		if ( ! is_array( $tax_objects ) ) {
			$tax_objects = array();
		}
		$list = array();
		foreach ( $tax_objects as $taxonomy ) {
			if ( ! is_object( $taxonomy ) ) {
				continue;
			}
			$name = (string) $taxonomy->name;
			if ( function_exists( 'caf_is_excluded_builder_taxonomy' ) && caf_is_excluded_builder_taxonomy( $name, $post_type ) ) {
				continue;
			}
			$args = array(
				'taxonomy'   => $name,
				'hide_empty' => false,
				'number'     => $limit,
				'orderby'    => 'name',
				'order'      => 'ASC',
			);
			if ( '' !== $search ) {
				$args['search'] = $search;
			}
			$terms = get_terms( $args );
			if ( is_wp_error( $terms ) ) {
				$terms = array();
			}
			$term_out = array();
			foreach ( $terms as $term ) {
				if ( ! is_object( $term ) ) {
					continue;
				}
				$term_out[] = array(
					'id'     => (int) $term->term_id,
					'name'   => (string) $term->name,
					'slug'   => (string) $term->slug,
					'parent' => (int) $term->parent,
					'count'  => (int) $term->count,
				);
			}
			$label = $taxonomy->label;
			if ( function_exists( 'caf_get_builder_taxonomy_label' ) ) {
				$label = caf_get_builder_taxonomy_label( $taxonomy );
			}
			$kind = 'taxonomy';
			if ( class_exists( 'CAF_Woo_Filter_Helper', false ) && CAF_Woo_Filter_Helper::is_woo_product_attribute_taxonomy( $name ) ) {
				$kind = 'attribute';
			} elseif ( 0 === strpos( $name, 'pa_' ) ) {
				$kind = 'attribute';
			}
			$list[] = array(
				'key'        => $name,
				'label'      => (string) $label,
				'kind'       => $kind,
				'term_count' => is_taxonomy_hierarchical( $name ) ? wp_count_terms( array( 'taxonomy' => $name, 'hide_empty' => false ) ) : count( $term_out ),
				'terms'      => $term_out,
			);
		}

		if ( class_exists( 'CAF_Builder_Tier', false ) && CAF_Builder_Tier::can_use_feature( 'filter_author' ) ) {
			self::append_author_taxonomy_choice( $list, $post_type, $search, $limit );
		}

		return rest_ensure_response(
			array(
				'status'    => 'success',
				'post_type' => $post_type,
				'taxonomies'=> $list,
			)
		);
	}

	/**
	 * Builder-visible custom / Woo meta keys for one post type.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_list_custom_fields( $request ) {
		$post_type = sanitize_key( (string) $request->get_param( 'post_type' ) );
		if ( '' === $post_type ) {
			return new WP_Error(
				'caf_mcp_missing_post_type',
				__( 'Pass post_type (from get-layout-structure settings).', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		$keys = array();
		if ( function_exists( 'caf_get_builder_custom_field_keys_for_post_type' ) ) {
			$keys = caf_get_builder_custom_field_keys_for_post_type( $post_type );
		}
		if ( ! is_array( $keys ) ) {
			$keys = array();
		}
		$fields = array();
		foreach ( $keys as $key ) {
			$key = (string) $key;
			if ( '' === $key ) {
				continue;
			}
			$kind = self::custom_field_kind( $key );
			$fields[] = array(
				'key'      => $key,
				'label'    => self::custom_field_label( $key ),
				'kind'     => $kind,
				'range_ok' => in_array( $kind, array( 'woo_price', 'woo_dimension' ), true ),
			);
		}

		return rest_ensure_response(
			array(
				'status'             => 'success',
				'post_type'          => $post_type,
				'woocommerce_active' => class_exists( 'WooCommerce', false ),
				'fields'             => $fields,
			)
		);
	}

	/**
	 * WooCommerce pa_* attribute taxonomies + terms. Same shape as list-taxonomies, filtered.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_list_woo_attributes( $request ) {
		$post_type = sanitize_key( (string) $request->get_param( 'post_type' ) );
		if ( '' === $post_type ) {
			$post_type = 'product';
			$request->set_param( 'post_type', $post_type );
		}
		$response = self::rest_list_taxonomies( $request );
		if ( is_wp_error( $response ) ) {
			return $response;
		}
		$data  = $response instanceof WP_REST_Response ? $response->get_data() : array();
		$attrs = array();
		if ( is_array( $data ) && isset( $data['taxonomies'] ) && is_array( $data['taxonomies'] ) ) {
			foreach ( $data['taxonomies'] as $tax ) {
				if ( is_array( $tax ) && isset( $tax['kind'] ) && 'attribute' === $tax['kind'] ) {
					$attrs[] = $tax;
				}
			}
		}

		return rest_ensure_response(
			array(
				'status'             => 'success',
				'post_type'          => $post_type,
				'woocommerce_active' => class_exists( 'WooCommerce', false ),
				'attributes'         => $attrs,
			)
		);
	}

	/**
	 * Woo price slider defaults (static 0–100 + currency). Catalog scan is not used.
	 *
	 * @return WP_REST_Response
	 */
	public static function rest_get_price_range() {
		$currency = '$';
		if ( class_exists( 'CAF_Woo_Filter_Helper', false ) ) {
			$currency = CAF_Woo_Filter_Helper::get_product_price_currency_symbol();
		}

		return rest_ensure_response(
			array(
				'status'             => 'success',
				'meta_key'           => '_price',
				'min'                => 0,
				'max'                => 100,
				'currency'           => $currency,
				'woocommerce_active' => class_exists( 'WooCommerce', false ),
			)
		);
	}

	/**
	 * Lean post picker for query-restriction include/exclude by posts.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_list_posts( $request ) {
		$post_type = sanitize_key( (string) $request->get_param( 'post_type' ) );
		if ( '' === $post_type || ! post_type_exists( $post_type ) ) {
			return new WP_Error(
				'caf_mcp_missing_post_type',
				__( 'Pass a real post_type from caf-list-post-types.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		$search = sanitize_text_field( (string) $request->get_param( 'search' ) );
		$limit  = (int) $request->get_param( 'limit' );
		if ( $limit < 1 ) {
			$limit = 20;
		}
		if ( $limit > 50 ) {
			$limit = 50;
		}
		$query = new WP_Query(
			array(
				'post_type'              => $post_type,
				'post_status'            => array( 'publish', 'draft', 'pending', 'private' ),
				's'                      => $search,
				'posts_per_page'         => $limit,
				'orderby'                => 'title',
				'order'                  => 'ASC',
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			)
		);
		$posts = array();
		foreach ( $query->posts as $post ) {
			$posts[] = array(
				'id'     => (int) $post->ID,
				'title'  => (string) $post->post_title,
				'status' => (string) $post->post_status,
			);
		}
		return rest_ensure_response(
			array(
				'status'    => 'success',
				'post_type' => $post_type,
				'posts'     => $posts,
			)
		);
	}

	/**
	 * Media Library icons (svg/png/jpg) for term visuals.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function rest_list_media( $request ) {
		$search = sanitize_text_field( (string) $request->get_param( 'search' ) );
		$limit  = (int) $request->get_param( 'limit' );
		$items  = class_exists( 'CAF_MCP_Document', false )
			? CAF_MCP_Document::query_icon_media( $search, $limit )
			: array();
		return rest_ensure_response(
			array(
				'status' => 'success',
				'media'  => $items,
			)
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_get_structure( $request ) {
		$resolved = self::load_layout( (string) $request['layout_id'], true );
		if ( is_wp_error( $resolved ) ) {
			return $resolved;
		}

		$doc     = $resolved['doc'];
		$include = rest_sanitize_boolean( $request->get_param( 'include_content' ) );
		$focus   = (string) $request->get_param( 'element_id' );

		$filter_tree = self::lean_tree(
			isset( $doc->filter_layout_data->initial_data ) ? $doc->filter_layout_data->initial_data : array(),
			$include
		);
		$post_tree   = self::lean_tree(
			isset( $doc->post_layout_data->initial_data ) ? $doc->post_layout_data->initial_data : array(),
			$include
		);
		$preview_tree = class_exists( 'CAF_MCP_Preview', false )
			? CAF_MCP_Preview::catalog( $doc, $include )
			: array();

		if ( '' !== $focus ) {
			if ( class_exists( 'CAF_MCP_Preview', false ) && CAF_MCP_Preview::is_id( $focus ) ) {
				$hit = CAF_MCP_Preview::find_catalog_node( $doc, $focus );
				if ( null === $hit ) {
					return new WP_Error(
						'caf_mcp_element_not_found',
						__( 'No last-screen preview layer has that id.', 'category-ajax-filter' ),
						array( 'status' => 404 )
					);
				}
				$filter_tree  = array();
				$post_tree    = array();
				$preview_tree = array( $hit );
			} else {
				$hit = self::find_in_trees( $focus, $filter_tree, $post_tree );
				if ( null === $hit ) {
					return new WP_Error(
						'caf_mcp_element_not_found',
						__( 'No layout node has that id.', 'category-ajax-filter' ),
						array( 'status' => 404 )
					);
				}
				$filter_tree  = 'filter' === $hit['tree'] ? array( $hit['node'] ) : array();
				$post_tree    = 'post' === $hit['tree'] ? array( $hit['node'] ) : array();
				$preview_tree = array();
			}
		}

		return rest_ensure_response(
			array(
				'status'    => 'success',
				'layout_id' => $resolved['layout_id'],
				'label'     => $resolved['label'],
				'shortcode' => $resolved['shortcode'],
				'revision'  => self::get_revision( $resolved['option_key'] ),
				'settings'  => self::lean_settings( $doc ),
				'filter'    => $filter_tree,
				'post'      => $post_tree,
				'preview'   => $preview_tree,
			)
		);
	}

	/**
	 * Cheap poll token. Builder Save does not bump this — only MCP persist_layout.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_get_revision( $request ) {
		$ref = self::resolve_layout_ref( (string) $request['layout_id'] );
		if ( is_wp_error( $ref ) ) {
			return $ref;
		}
		return rest_ensure_response(
			array(
				'status'    => 'success',
				'layout_id' => $ref['layout_id'],
				'revision'  => self::get_revision( $ref['option_key'] ),
			)
		);
	}

	/**
	 * Admin builder URL that opens this layout (same as clicking Builder).
	 *
	 * @param string $option_key Option key.
	 * @return string
	 */
	public static function builder_edit_url( $option_key ) {
		return add_query_arg(
			array(
				'post_type'  => 'caf_posts',
				'builder'    => '1',
				'caf_layout' => (string) $option_key,
			),
			admin_url( 'edit.php' )
		);
	}

	/**
	 * Reuse one frontend preview token per layout until TTL.
	 *
	 * @param string $layout_id Layout id.
	 * @param string $label Label.
	 * @return string
	 */
	private static function frontend_preview_url( $layout_id, $label ) {
		$layout_id = (string) $layout_id;
		$index_key = 'caf_mcp_fe_tok_' . md5( $layout_id );
		$token     = get_transient( $index_key );
		if ( is_string( $token ) && preg_match( '/^[a-f0-9]{32}$/', $token ) ) {
			$payload = get_transient( self::preview_transient_key( $token ) );
			if ( is_array( $payload ) && isset( $payload['layout_id'] ) && (string) $payload['layout_id'] === $layout_id ) {
				return add_query_arg( self::PREVIEW_QUERY, $token, home_url( '/' ) );
			}
		}
		$token = bin2hex( random_bytes( 16 ) );
		set_transient(
			self::preview_transient_key( $token ),
			array(
				'layout_id' => $layout_id,
				'label'     => (string) $label,
			),
			self::PREVIEW_TTL
		);
		set_transient( $index_key, $token, self::PREVIEW_TTL );
		return add_query_arg( self::PREVIEW_QUERY, $token, home_url( '/' ) );
	}

	/**
	 * Backend builder + frontend shortcode preview.
	 * Returned on create / duplicate / explicit preview. Iterative writes omit these
	 * so agents do not open a new browser tab after every edit.
	 *
	 * @param array $resolved load_layout / resolve_layout_ref payload.
	 * @param bool  $mint_frontend Whether to issue a frontend token.
	 * @return array<string, mixed>
	 */
	public static function preview_links( $resolved, $mint_frontend = true ) {
		$option_key = isset( $resolved['option_key'] ) ? (string) $resolved['option_key'] : '';
		$layout_id  = isset( $resolved['layout_id'] ) ? (string) $resolved['layout_id'] : $option_key;
		$label      = isset( $resolved['label'] ) ? (string) $resolved['label'] : $layout_id;
		if ( '' === $option_key ) {
			$option_key = $layout_id;
		}
		$backend = self::builder_edit_url( $option_key );
		$links   = array(
			'backend_url'  => $backend,
			'url'          => $backend,
			'edit_url'     => $backend,
		);
		if ( $mint_frontend && '' !== $layout_id ) {
			$links['frontend_url'] = self::frontend_preview_url( $layout_id, $label );
			$links['expires_in']   = self::PREVIEW_TTL;
		}
		return $links;
	}

	/**
	 * @param array $payload Response body.
	 * @param array $resolved Layout ref.
	 * @param bool  $mint_frontend Whether to issue a frontend token.
	 * @return array<string, mixed>
	 */
	private static function with_preview_links( $payload, $resolved, $mint_frontend = true ) {
		if ( ! is_array( $payload ) || ! is_array( $resolved ) ) {
			return $payload;
		}
		return array_merge( $payload, self::preview_links( $resolved, $mint_frontend ) );
	}

	/**
	 * Primary url / backend_url is the admin builder.
	 * frontend_url is a 1-hour noindex shortcode render.
	 * Agents must paste these as text, not auto-open browser tabs.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_create_preview( $request ) {
		$ref = self::resolve_layout_ref( (string) $request['layout_id'] );
		if ( is_wp_error( $ref ) ) {
			return $ref;
		}
		if ( ! get_option( $ref['option_key'] ) ) {
			return new WP_Error(
				'caf_mcp_layout_empty',
				__( 'That layout has no saved builder data.', 'category-ajax-filter' ),
				array( 'status' => 404 )
			);
		}

		return rest_ensure_response(
			self::with_preview_links(
				array(
					'status'    => 'success',
					'layout_id' => $ref['layout_id'],
				),
				$ref,
				true
			)
		);
	}

	/**
	 * @param array $vars Query vars.
	 * @return array
	 */
	public static function register_preview_query_var( $vars ) {
		$vars[] = self::PREVIEW_QUERY;
		return $vars;
	}

	/**
	 * Isolated shortcode render. Only runs when the query arg is present.
	 *
	 * @return void
	 */
	public static function maybe_render_preview() {
		if ( is_admin() || wp_doing_ajax() || wp_doing_cron() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
			return;
		}
		$token = isset( $_GET[ self::PREVIEW_QUERY ] ) ? sanitize_text_field( wp_unslash( $_GET[ self::PREVIEW_QUERY ] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( '' === $token || ! preg_match( '/^[a-f0-9]{32}$/', $token ) ) {
			return;
		}

		$payload = get_transient( self::preview_transient_key( $token ) );
		if ( ! is_array( $payload ) || empty( $payload['layout_id'] ) ) {
			status_header( 404 );
			nocache_headers();
			wp_die( esc_html__( 'This CAF preview link has expired.', 'category-ajax-filter' ), '', array( 'response' => 404 ) );
		}

		$layout_id = sanitize_text_field( (string) $payload['layout_id'] );
		$label     = isset( $payload['label'] ) ? (string) $payload['label'] : $layout_id;
		$html      = do_shortcode( "[caf_filter id='" . esc_attr( $layout_id ) . "']" );

		status_header( 200 );
		nocache_headers();
		header( 'Content-Type: text/html; charset=' . get_bloginfo( 'charset' ) );
		add_filter( 'show_admin_bar', '__return_false' );

		echo '<!DOCTYPE html><html ';
		language_attributes();
		echo '><head><meta charset="';
		bloginfo( 'charset' );
		echo '"><meta name="viewport" content="width=device-width, initial-scale=1">';
		echo '<meta name="robots" content="noindex,nofollow">';
		echo '<title>' . esc_html( $label ) . ' — CAF preview</title>';
		wp_head();
		echo '<style>body.caf-mcp-preview-body{margin:0;padding:24px;background:#f6f7f9;}';
		echo '.caf-mcp-preview-wrap{max-width:1200px;margin:0 auto;}</style></head>';
		echo '<body class="caf-mcp-preview-body">';
		echo '<div class="caf-mcp-preview-wrap">';
		echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- CAF renderer HTML.
		echo '</div>';
		wp_footer();
		echo '</body></html>';
		exit;
	}

	/**
	 * @param string $token Preview token.
	 * @return string
	 */
	private static function preview_transient_key( $token ) {
		return 'caf_mcp_pv_' . $token;
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_manage_modules( $request ) {
		$resolved = self::load_layout( (string) $request['layout_id'], true );
		if ( is_wp_error( $resolved ) ) {
			return $resolved;
		}

		$body       = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			$body = $request->get_params();
		}
		$operations = isset( $body['operations'] ) && is_array( $body['operations'] ) ? $body['operations'] : array();
		$dry_run    = ! empty( $body['dry_run'] );

		if ( empty( $operations ) ) {
			return new WP_Error(
				'caf_mcp_no_operations',
				__( 'Pass an operations array: update, move, delete, duplicate, style, layout, bind_taxonomy, bind_custom_field, bind_price, or set_term_visual.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		if ( count( $operations ) > self::MAX_OPERATIONS ) {
			return new WP_Error(
				'caf_mcp_too_many_operations',
				__( 'At most 50 operations per request.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}

		$doc      = $resolved['doc'];
		$applied  = array();
		$errors   = array();
		$revision = self::get_revision( $resolved['option_key'] );

		foreach ( $operations as $i => $op ) {
			if ( ! is_array( $op ) ) {
				$errors[] = array(
					'index'  => $i,
					'code'   => 'caf_mcp_bad_operation',
					'message'=> 'Each operation must be an object.',
				);
				continue;
			}
			if ( $dry_run ) {
				$op['_dry_run'] = true;
			}
			$result = self::apply_operation( $doc, $op );
			if ( is_wp_error( $result ) ) {
				$errors[] = array(
					'index'   => $i,
					'code'    => $result->get_error_code(),
					'message' => $result->get_error_message(),
					'action'  => isset( $op['action'] ) ? (string) $op['action'] : '',
					'element_id' => isset( $op['element_id'] ) ? (string) $op['element_id'] : '',
				);
				continue;
			}
			$applied[] = $result;
		}

		if ( ! $dry_run && ! empty( $applied ) ) {
			$revision        = self::persist_layout( $resolved, $doc );
			$resolved['doc'] = $doc;
		}

		return rest_ensure_response(
			array(
				'status'    => 'success',
				'layout_id' => $resolved['layout_id'],
				'dry_run'   => $dry_run,
				'revision'  => $revision,
				'applied'   => $applied,
				'errors'    => $errors,
				'filter'    => self::lean_tree( isset( $doc->filter_layout_data->initial_data ) ? $doc->filter_layout_data->initial_data : array(), false ),
				'post'      => self::lean_tree( isset( $doc->post_layout_data->initial_data ) ? $doc->post_layout_data->initial_data : array(), false ),
			)
		);
	}

	/**
	 * Insert a JSON filter tree. Agent sends configuration_id; server mints durable ids.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_build_filter( $request ) {
		return self::rest_build_tree( $request, 'filter' );
	}

	/**
	 * Insert a JSON post/card tree (image, title, button, Woo modules, …).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_build_post( $request ) {
		return self::rest_build_tree( $request, 'post' );
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @param string          $tree filter|post.
	 * @return WP_REST_Response|WP_Error
	 */
	private static function rest_build_tree( $request, $tree ) {
		if ( ! class_exists( 'CAF_MCP_Compose', false ) ) {
			return new WP_Error(
				'caf_mcp_compose_missing',
				__( 'Compose is not loaded.', 'category-ajax-filter' ),
				array( 'status' => 500 )
			);
		}

		$tree     = ( 'post' === $tree ) ? 'post' : 'filter';
		$resolved = self::load_layout( (string) $request['layout_id'], true );
		if ( is_wp_error( $resolved ) ) {
			return $resolved;
		}

		$body = self::request_body( $request );

		$default_parent = $tree;
		$parent_id      = isset( $body['parent_id'] ) ? sanitize_text_field( (string) $body['parent_id'] ) : $default_parent;
		$mode           = isset( $body['mode'] ) ? sanitize_key( (string) $body['mode'] ) : 'append';
		$dry_run        = ! empty( $body['dry_run'] );
		$structure      = isset( $body['structure'] ) && is_array( $body['structure'] ) ? $body['structure'] : array();
		$index          = array_key_exists( 'index', $body ) ? $body['index'] : null;

		if ( ! in_array( $mode, array( 'append', 'replace_children' ), true ) ) {
			return new WP_Error(
				'caf_mcp_bad_mode',
				__( 'mode must be append or replace_children.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}

		$doc        = $resolved['doc'];
		$parent_loc = self::resolve_compose_parent( $doc, $parent_id, $tree );
		if ( is_wp_error( $parent_loc ) ) {
			return $parent_loc;
		}

		$hydrated = CAF_MCP_Compose::hydrate( $doc, $structure, $parent_loc['expected'], $tree );
		if ( is_wp_error( $hydrated ) ) {
			return $hydrated;
		}

		$removed_ids = array();
		if ( 'replace_children' === $mode ) {
			$removed_ids = self::replace_compose_children( $doc, $parent_loc );
		}

		$insert_at = ( null === $index || '' === $index ) ? null : (int) $index;
		foreach ( $hydrated['nodes'] as $i => $node ) {
			$at = ( null === $insert_at ) ? null : $insert_at + (int) $i;
			self::splice_in( $doc, $parent_loc, $node, $at );
		}

		$rows = self::tree_rows( $doc, $tree );
		if ( 'root' === $parent_loc['kind'] && empty( $rows ) ) {
			return new WP_Error(
				'caf_mcp_last_row',
				__( 'The last row cannot be deleted.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		if ( 'filter' === $tree && CAF_MCP_Compose::count_search( $rows ) > 1 ) {
			return new WP_Error(
				'caf_mcp_single_instance',
				__( 'A layout can only have one search module.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}

		if ( function_exists( 'caf_ensure_layout_document_node_ids' ) ) {
			caf_ensure_layout_document_node_ids( $doc, false );
		}

		foreach ( $hydrated['map'] as $node ) {
			if ( ! is_object( $node ) ) {
				continue;
			}
			$bind_tax = '';
			if ( ! empty( $node->_mcp_bind_taxonomy ) ) {
				$bind_tax = CAF_MCP_Compose::normalize_bind_taxonomy_key( $node->_mcp_bind_taxonomy );
			}
			unset( $node->_mcp_bind_taxonomy );
			if ( '' === $bind_tax || empty( $node->id ) ) {
				continue;
			}
			$bound = self::op_bind_taxonomy(
				$doc,
				(string) $node->id,
				array( 'taxonomy' => $bind_tax )
			);
			if ( is_wp_error( $bound ) ) {
				return $bound;
			}
		}

		$map      = array();
		$root_ids = array();
		foreach ( $hydrated['map'] as $config_id => $node ) {
			$map[ (string) $config_id ] = ( is_object( $node ) && isset( $node->id ) ) ? (string) $node->id : '';
		}
		foreach ( $hydrated['nodes'] as $node ) {
			if ( is_object( $node ) && isset( $node->id ) ) {
				$root_ids[] = (string) $node->id;
			}
		}

		$revision = self::get_revision( $resolved['option_key'] );
		if ( ! $dry_run ) {
			$revision        = self::persist_layout( $resolved, $doc );
			$resolved['doc'] = $doc;
		}

		return rest_ensure_response(
			array(
				'status'      => 'success',
				'layout_id'   => $resolved['layout_id'],
				'tree'        => $tree,
				'dry_run'     => $dry_run,
				'mode'        => $mode,
				'parent_id'   => $parent_id,
				'revision'    => $revision,
				'map'         => $map,
				'root_ids'    => $root_ids,
				'removed_ids' => $removed_ids,
				'filter'      => self::lean_tree(
					isset( $doc->filter_layout_data->initial_data ) ? $doc->filter_layout_data->initial_data : array(),
					false
				),
				'post'        => self::lean_tree(
					isset( $doc->post_layout_data->initial_data ) ? $doc->post_layout_data->initial_data : array(),
					false
				),
			)
		);
	}

	/**
	 * Resolve caf_N / numeric index / option key without loading the document.
	 *
	 * @param string $layout_id Layout id.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function resolve_layout_ref( $layout_id ) {
		$layout_id = sanitize_text_field( (string) $layout_id );
		$list      = get_option( 'caf_builder_layouts_list', array() );
		if ( ! is_array( $list ) ) {
			$list = array();
		}

		$index = null;
		if ( preg_match( '/^caf_(\d+)$/', $layout_id, $match ) ) {
			$index = (int) $match[1];
		} elseif ( is_numeric( $layout_id ) ) {
			$index = (int) $layout_id;
		}

		$option_key = '';
		$label      = '';
		if ( null !== $index && isset( $list[ $index ] ) && is_array( $list[ $index ] ) ) {
			$key        = isset( $list[ $index ]['key'] ) ? (string) $list[ $index ]['key'] : '';
			$option_key = 'caf_' . $key . '_' . $index;
			$label      = isset( $list[ $index ]['label'] ) ? (string) $list[ $index ]['label'] : $key;
		} elseif ( get_option( $layout_id ) ) {
			$option_key = $layout_id;
			if ( preg_match( '/_(\d+)$/', $layout_id, $tail ) ) {
				$index = (int) $tail[1];
				if ( isset( $list[ $index ]['label'] ) ) {
					$label = (string) $list[ $index ]['label'];
				}
			}
		}

		if ( '' === $option_key ) {
			return new WP_Error(
				'caf_mcp_layout_not_found',
				__( 'That CAF builder layout was not found.', 'category-ajax-filter' ),
				array( 'status' => 404 )
			);
		}

		return array(
			'layout_id'  => null !== $index ? 'caf_' . $index : $option_key,
			'index'      => $index,
			'option_key' => $option_key,
			'label'      => $label,
			'shortcode'  => null !== $index ? "[caf_filter id='caf_" . $index . "']" : '',
		);
	}

	/**
	 * Load a builder layout. Optionally persist newly minted node ids (additive).
	 *
	 * @param string $layout_id caf_N, numeric index, or option key.
	 * @param bool   $persist_ids Write option if missing ids were assigned.
	 * @return array<string, mixed>|WP_Error
	 */
	public static function load_layout( $layout_id, $persist_ids = false ) {
		$ref = self::resolve_layout_ref( $layout_id );
		if ( is_wp_error( $ref ) ) {
			return $ref;
		}

		$raw = get_option( $ref['option_key'] );
		if ( empty( $raw ) ) {
			return new WP_Error(
				'caf_mcp_layout_empty',
				__( 'That layout has no saved builder data.', 'category-ajax-filter' ),
				array( 'status' => 404 )
			);
		}

		$raw = json_decode( wp_json_encode( $raw ) );
		if ( ! is_object( $raw ) ) {
			return new WP_Error(
				'caf_mcp_layout_empty',
				__( 'That layout has no saved builder data.', 'category-ajax-filter' ),
				array( 'status' => 404 )
			);
		}

		$dnd_snap = wp_json_encode( self::dnd_column_data_from_doc( $raw ) );

		$doc = function_exists( 'caf_normalize_builder_layout_data' )
			? caf_normalize_builder_layout_data( $raw, array( 'assign_node_ids' => false ) )
			: $raw;

		$minted = function_exists( 'caf_ensure_layout_document_node_ids' )
			? caf_ensure_layout_document_node_ids( $doc )
			: 0;

		if ( class_exists( 'CAF_MCP_Compose', false ) ) {
			CAF_MCP_Compose::fill_missing_preview_template_defaults( $doc );
		}
		$preview_changed = wp_json_encode( self::dnd_column_data_from_doc( $doc ) ) !== $dnd_snap;

		$payload        = $ref;
		$payload['doc'] = $doc;

		if ( $persist_ids && ( $minted > 0 || $preview_changed ) ) {
			self::persist_layout(
				$payload,
				$doc,
				array(
					'bump_revision' => $preview_changed,
				)
			);
		}

		return $payload;
	}

	/**
	 * Openable layout matching UI Add New: starter modules, collapsed query bar,
	 * preview tree, pagination chrome. Import passes seed_starter=false.
	 *
	 * @param string               $label Layout name.
	 * @param string               $post_type CPT slug.
	 * @param string               $status draft|publish.
	 * @param string               $option_key Option key.
	 * @param int                  $index List index.
	 * @param array<string, mixed> $args seed_starter (default true), taxonomy.
	 * @return object|WP_Error
	 */
	private static function new_blank_layout_document( $label, $post_type, $status, $option_key, $index, $args = array() ) {
		$seed_starter = ! isset( $args['seed_starter'] ) || ! empty( $args['seed_starter'] );
		$taxonomy     = isset( $args['taxonomy'] ) ? sanitize_key( (string) $args['taxonomy'] ) : '';

		$stub = new stdClass();
		$doc  = function_exists( 'caf_normalize_builder_layout_data' )
			? caf_normalize_builder_layout_data( $stub, array( 'assign_node_ids' => false ) )
			: $stub;
		if ( ! isset( $doc->common_data ) || ! is_object( $doc->common_data ) ) {
			$doc->common_data = new stdClass();
		}
		$doc->common_data->layout_name           = $label;
		$doc->common_data->layout_key            = $option_key;
		$doc->common_data->layout_index          = (int) $index;
		$doc->common_data->post_type             = $post_type;
		$doc->common_data->layout_publish        = $status;
		$doc->common_data->layout_schema_version = 5;
		if ( ! isset( $doc->common_data->global_font_family ) || '' === (string) $doc->common_data->global_font_family ) {
			$doc->common_data->global_font_family = 'DM Sans';
		}
		$doc->common_data->filter_url_enabled = false;
		$doc->common_data->schema_enabled     = false;

		self::seed_blank_filter_defaults( $doc );
		self::seed_blank_post_defaults( $doc, $post_type );
		if ( $seed_starter ) {
			$seeded = self::seed_add_new_starter_modules( $doc, $taxonomy );
			if ( is_wp_error( $seeded ) ) {
				return $seeded;
			}
		} else {
			$filter_row = self::hydrate_blank_row( $doc, 'filter' );
			$post_row   = self::hydrate_blank_row( $doc, 'post' );
			$doc->filter_layout_data->initial_data = array( $filter_row );
			$doc->post_layout_data->initial_data   = array( $post_row );
		}
		if ( class_exists( 'CAF_MCP_Compose', false ) ) {
			CAF_MCP_Compose::fill_missing_preview_template_defaults( $doc );
		}
		if ( function_exists( 'caf_ensure_layout_document_node_ids' ) ) {
			caf_ensure_layout_document_node_ids( $doc );
		}
		if ( $seed_starter ) {
			self::apply_pending_taxonomy_binds( $doc );
		}
		return $doc;
	}

	/**
	 * Match UI Add New: Design Filters on, query topbar collapsed (filter_type true).
	 *
	 * @param object $doc Layout document.
	 * @return void
	 */
	private static function seed_blank_filter_defaults( $doc ) {
		if ( ! is_object( $doc ) ) {
			return;
		}
		if ( ! isset( $doc->filter_layout_data ) || ! is_object( $doc->filter_layout_data ) ) {
			$doc->filter_layout_data = new stdClass();
		}
		$fld = $doc->filter_layout_data;
		if ( ! isset( $fld->extra_data ) || ! is_object( $fld->extra_data ) ) {
			$fld->extra_data = new stdClass();
		}
		$extra    = $fld->extra_data;
		$defaults = array(
			'bg_color'                  => '#00000000',
			'custom_css'                => '',
			'filter_type'               => 'true',
			'taxonomy_relation'         => 'AND',
			'meta_relation'             => 'OR',
			'dynamic_term_counts'       => 'false',
			'auto_select_archive_term'  => 'false',
		);
		foreach ( $defaults as $key => $value ) {
			if ( ! isset( $extra->$key ) ) {
				$extra->$key = $value;
			}
		}
		if ( ! isset( $extra->footerSlider ) ) {
			$extra->footerSlider = (object) array(
				'value'  => '30',
				'suffix' => '%',
			);
		}
		if ( ! isset( $extra->category_term_page_mode ) ) {
			$extra->category_term_page_mode = (object) array(
				'enabled'            => 'false',
				'reset_returns_to'   => 'current_term',
				'include_children'   => 'false',
			);
		}
		if ( ! isset( $fld->breadcrumb_data ) || ! is_object( $fld->breadcrumb_data ) ) {
			$fld->breadcrumb_data = new stdClass();
		}
		if ( ! isset( $fld->breadcrumb_data->select_builder ) ) {
			$fld->breadcrumb_data->select_builder = 'false';
		}
		if ( ! isset( $fld->breadcrumb_data->select_layout ) ) {
			$fld->breadcrumb_data->select_layout = 'false';
		}
		if ( ! isset( $fld->filter_query_data ) || ! is_object( $fld->filter_query_data ) ) {
			$fld->filter_query_data = new stdClass();
		}
		$fq = $fld->filter_query_data;
		if ( ! isset( $fq->data_source ) || ! is_object( $fq->data_source ) ) {
			$fq->data_source = new stdClass();
		}
		if ( ! isset( $fq->data_source->taxonomy ) ) {
			$fq->data_source->taxonomy = 'true';
		}
		if ( ! isset( $fq->data_source->custom_field ) ) {
			$fq->data_source->custom_field = 'false';
		}
		if ( ! isset( $fq->taxonomy_relation ) ) {
			$fq->taxonomy_relation = 'AND';
		}
		if ( ! isset( $fq->category_relation ) ) {
			$fq->category_relation = 'IN';
		}
		if ( ! isset( $fq->order_by_meta ) ) {
			$fq->order_by_meta = 'false';
		}
		if ( ! isset( $fq->meta_key ) ) {
			$fq->meta_key = '';
		}
		if ( ! isset( $fq->meta_value ) ) {
			$fq->meta_value = '';
		}
		if ( ! isset( $fq->meta_relation ) ) {
			$fq->meta_relation = 'IN';
		}
	}

	/**
	 * Match UI Add New post extra_data + first sample post for the card preview.
	 *
	 * @param object $doc Layout document.
	 * @param string $post_type CPT slug.
	 * @return void
	 */
	private static function seed_blank_post_defaults( $doc, $post_type ) {
		if ( ! is_object( $doc ) ) {
			return;
		}
		if ( ! isset( $doc->post_layout_data ) || ! is_object( $doc->post_layout_data ) ) {
			$doc->post_layout_data = new stdClass();
		}
		$pld = $doc->post_layout_data;
		if ( ! isset( $pld->extra_data ) || ! is_object( $pld->extra_data ) ) {
			$pld->extra_data = new stdClass();
		}
		$extra = $pld->extra_data;
		if ( ! isset( $extra->layout_source ) ) {
			$extra->layout_source = 'caf_builder';
		}
		if ( ! isset( $extra->bg_color ) ) {
			$extra->bg_color = '#00000000';
		}
		if ( ! isset( $extra->results_selector ) ) {
			$extra->results_selector = 'ul.products';
		}
		if ( ! isset( $extra->slider_data ) ) {
			$extra->slider_data = (object) array(
				'value'  => '30',
				'suffix' => '%',
			);
		}
		if ( ! isset( $pld->breadcrumb_data ) || ! is_object( $pld->breadcrumb_data ) ) {
			$pld->breadcrumb_data = new stdClass();
		}
		if ( ! isset( $pld->breadcrumb_data->select_builder ) ) {
			$pld->breadcrumb_data->select_builder = 'false';
		}
		if ( ! isset( $pld->breadcrumb_data->select_layout ) ) {
			$pld->breadcrumb_data->select_layout = 'false';
		}
		if ( function_exists( 'get_posts' ) ) {
			$ids = get_posts(
				array(
					'post_type'      => $post_type,
					'post_status'    => 'publish',
					'posts_per_page' => 1,
					'orderby'        => 'date',
					'order'          => 'DESC',
					'fields'         => 'ids',
				)
			);
			if ( ! empty( $ids[0] ) ) {
				self::apply_preview_post( $doc, $ids[0] );
			}
		}
	}

	/**
	 * @param object $doc Layout.
	 * @param string $tree filter|post.
	 * @return object
	 */
	private static function hydrate_blank_row( $doc, $tree ) {
		$tree = ( 'post' === $tree ) ? 'post' : 'filter';
		$row  = null;
		if ( class_exists( 'CAF_MCP_Compose', false ) ) {
			$hydrated = CAF_MCP_Compose::hydrate(
				$doc,
				array(
					array(
						'type'             => 'row',
						'configuration_id' => $tree . '-row-1',
						'elements'         => array(
							array(
								'type'             => 'column',
								'configuration_id' => $tree . '-col-1',
							),
						),
					),
				),
				'row',
				$tree
			);
			if ( ! is_wp_error( $hydrated ) && ! empty( $hydrated['nodes'] ) ) {
				$row = $hydrated['nodes'][0];
			}
		}
		if ( ! is_object( $row ) ) {
			$col           = new stdClass();
			$col->type     = 'column';
			$col->settings = (object) array( 'admin_label' => $tree . '-col-1' );
			$col->data     = array();
			$row           = new stdClass();
			$row->type     = 'row';
			$row->settings = (object) array( 'admin_label' => $tree . '-row-1' );
			$row->data     = array( $col );
		}
		return $row;
	}

	/**
	 * Same row/column structure and Design → Layout CSS as UI Add New.
	 *
	 * @param object $doc Layout.
	 * @param string $taxonomy Optional bind for the checkbox.
	 * @return true|WP_Error
	 */
	private static function seed_add_new_starter_modules( $doc, $taxonomy ) {
		if ( ! class_exists( 'CAF_MCP_Compose', false ) ) {
			return true;
		}
		if ( ! isset( $doc->filter_layout_data ) || ! is_object( $doc->filter_layout_data ) ) {
			$doc->filter_layout_data = new stdClass();
		}
		if ( ! isset( $doc->post_layout_data ) || ! is_object( $doc->post_layout_data ) ) {
			$doc->post_layout_data = new stdClass();
		}
		$filter = CAF_MCP_Compose::hydrate(
			$doc,
			CAF_MCP_Compose::add_new_starter_filter_tree( $taxonomy ),
			'row',
			'filter'
		);
		if ( is_wp_error( $filter ) ) {
			return $filter;
		}
		$doc->filter_layout_data->initial_data = $filter['nodes'];
		$post = CAF_MCP_Compose::hydrate(
			$doc,
			CAF_MCP_Compose::add_new_starter_post_tree(),
			'row',
			'post'
		);
		if ( is_wp_error( $post ) ) {
			return $post;
		}
		$doc->post_layout_data->initial_data = $post['nodes'];
		return true;
	}

	/**
	 * @param object $doc Layout.
	 * @param string $tree filter|post.
	 * @return object|null
	 */
	private static function first_column_of( $doc, $tree ) {
		$rows = ( 'post' === $tree )
			? ( isset( $doc->post_layout_data->initial_data ) ? $doc->post_layout_data->initial_data : array() )
			: ( isset( $doc->filter_layout_data->initial_data ) ? $doc->filter_layout_data->initial_data : array() );
		if ( ! is_array( $rows ) ) {
			return null;
		}
		foreach ( $rows as $row ) {
			if ( ! is_object( $row ) || empty( $row->data ) || ! is_array( $row->data ) ) {
				continue;
			}
			foreach ( $row->data as $child ) {
				if ( is_object( $child ) && isset( $child->type ) && 'column' === (string) $child->type ) {
					return $child;
				}
			}
		}
		return null;
	}

	/**
	 * Compose may stamp _mcp_bind_taxonomy; apply after durable ids exist.
	 *
	 * @param object $doc Layout.
	 * @return void
	 */
	private static function apply_pending_taxonomy_binds( $doc ) {
		$rows = isset( $doc->filter_layout_data->initial_data ) ? $doc->filter_layout_data->initial_data : array();
		self::walk_pending_taxonomy_binds( $rows, $doc );
	}

	/**
	 * @param mixed  $nodes Tree.
	 * @param object $doc Layout.
	 * @return void
	 */
	private static function walk_pending_taxonomy_binds( $nodes, $doc ) {
		if ( is_object( $nodes ) ) {
			$nodes = array( $nodes );
		}
		if ( ! is_array( $nodes ) ) {
			return;
		}
		foreach ( $nodes as $node ) {
			if ( ! is_object( $node ) ) {
				continue;
			}
			$bind_tax = '';
			if ( ! empty( $node->_mcp_bind_taxonomy ) ) {
				$bind_tax = CAF_MCP_Compose::normalize_bind_taxonomy_key( $node->_mcp_bind_taxonomy );
			}
			unset( $node->_mcp_bind_taxonomy );
			if ( '' !== $bind_tax && ! empty( $node->id ) ) {
				self::op_bind_taxonomy( $doc, (string) $node->id, array( 'taxonomy' => $bind_tax ) );
			}
			if ( isset( $node->data ) ) {
				self::walk_pending_taxonomy_binds( $node->data, $doc );
			}
		}
	}

	/**
	 * @param string $message Optional override.
	 * @return WP_Error
	 */
	private static function need_post_type_error( $message = '' ) {
		$types = self::public_post_type_choices();
		$bits  = array();
		foreach ( $types as $row ) {
			if ( empty( $row['value'] ) ) {
				continue;
			}
			$bits[] = $row['value'] . ( ! empty( $row['label'] ) ? ' (' . $row['label'] . ')' : '' );
		}
		$list = implode( ', ', $bits );
		if ( '' === $message ) {
			$message = __( 'Ask the user which post type this filter is for, then call caf-create-layout with post_type. Do not default to post. Shop / Woo / products → product.', 'category-ajax-filter' );
		}
		if ( '' !== $list ) {
			$message .= ' ' . sprintf(
				/* translators: %s: post type slugs */
				__( 'Available: %s.', 'category-ajax-filter' ),
				$list
			);
		}
		return new WP_Error(
			'caf_mcp_need_post_type',
			$message,
			array(
				'status'     => 400,
				'ask_user'   => true,
				'post_types' => $types,
			)
		);
	}

	/**
	 * Public post types the builder can filter (same as caf-list-post-types).
	 *
	 * @return array<int, array{value:string,label:string}>
	 */
	public static function public_post_type_choices() {
		if ( ! function_exists( 'get_post_types' ) ) {
			return array();
		}
		$types = get_post_types( array( 'public' => true ), 'objects' );
		$out   = array();
		foreach ( $types as $type ) {
			if ( ! is_object( $type ) || 'attachment' === $type->name ) {
				continue;
			}
			$out[] = array(
				'value' => $type->name,
				'label' => $type->label,
			);
		}
		return $out;
	}

	/**
	 * Taxonomy slugs+labels for a post type (no term lists).
	 *
	 * @param string $post_type CPT slug.
	 * @return array<int, array<string, string>>
	 */
	private static function lean_taxonomy_choices( $post_type ) {
		$out = array();
		if ( ! function_exists( 'get_object_taxonomies' ) ) {
			return $out;
		}
		$tax_objects = get_object_taxonomies( $post_type, 'objects' );
		if ( ! is_array( $tax_objects ) ) {
			return $out;
		}
		foreach ( $tax_objects as $taxonomy ) {
			if ( ! is_object( $taxonomy ) ) {
				continue;
			}
			$name = (string) $taxonomy->name;
			if ( function_exists( 'caf_is_excluded_builder_taxonomy' ) && caf_is_excluded_builder_taxonomy( $name, $post_type ) ) {
				continue;
			}
			$label = $taxonomy->label;
			if ( function_exists( 'caf_get_builder_taxonomy_label' ) ) {
				$label = caf_get_builder_taxonomy_label( $taxonomy );
			}
			$kind = 'taxonomy';
			if ( class_exists( 'CAF_Woo_Filter_Helper', false ) && CAF_Woo_Filter_Helper::is_woo_product_attribute_taxonomy( $name ) ) {
				$kind = 'attribute';
			} elseif ( 0 === strpos( $name, 'pa_' ) ) {
				$kind = 'attribute';
			}
			$out[] = array(
				'key'   => $name,
				'label' => (string) $label,
				'kind'  => $kind,
			);
		}
		if ( class_exists( 'CAF_Builder_Tier', false ) && CAF_Builder_Tier::can_use_feature( 'filter_author' ) ) {
			self::append_author_taxonomy_choice( $out, $post_type, '', 0 );
		}
		return $out;
	}

	/**
	 * @return bool
	 */
	private static function ensure_author_class() {
		if ( class_exists( 'CAF_Author_Virtual_Taxonomies', false ) ) {
			return true;
		}
		if ( ! defined( 'TC_CAF_PATH' ) ) {
			return false;
		}
		$path = TC_CAF_PATH . 'includes/frontend/class-caf-author-virtual-taxonomies.php';
		if ( file_exists( $path ) ) {
			require_once $path;
		}
		return class_exists( 'CAF_Author_Virtual_Taxonomies', false );
	}

	/**
	 * Append Misc → Author (`__caf_author`) to a taxonomy catalog.
	 *
	 * @param array<int, array<string, mixed>> $list      Catalog.
	 * @param string                           $post_type CPT slug.
	 * @param string                           $search    Optional name filter.
	 * @param int                              $limit     0 = lean (no terms).
	 * @return void
	 */
	private static function append_author_taxonomy_choice( &$list, $post_type, $search = '', $limit = 0 ) {
		if ( ! self::ensure_author_class() ) {
			return;
		}
		if ( $limit < 1 ) {
			$list[] = array(
				'key'   => CAF_Author_Virtual_Taxonomies::KEY,
				'label' => __( 'Author', 'category-ajax-filter' ),
				'kind'  => 'author',
			);
			return;
		}

		$search  = strtolower( trim( (string) $search ) );
		$authors = CAF_Author_Virtual_Taxonomies::get_authors_for_post_type( $post_type );
		$terms   = array();
		foreach ( $authors as $author ) {
			$id = isset( $author['id'] ) ? absint( $author['id'] ) : 0;
			if ( $id < 1 ) {
				continue;
			}
			$label = isset( $author['label'] ) ? (string) $author['label'] : (string) $id;
			$slug  = isset( $author['slug'] ) ? (string) $author['slug'] : sanitize_title( $label );
			if ( '' !== $search ) {
				$hay = strtolower( $label . ' ' . $slug . ' author' );
				if ( false === strpos( $hay, $search ) ) {
					continue;
				}
			}
			$terms[] = array(
				'id'     => $id,
				'name'   => $label,
				'slug'   => $slug,
				'parent' => 0,
				'count'  => isset( $author['count'] ) ? absint( $author['count'] ) : 0,
			);
			if ( count( $terms ) >= $limit ) {
				break;
			}
		}
		if ( '' !== $search && empty( $terms ) ) {
			return;
		}
		$list[] = array(
			'key'        => CAF_Author_Virtual_Taxonomies::KEY,
			'label'      => __( 'Author', 'category-ajax-filter' ),
			'kind'       => 'author',
			'term_count' => count( $authors ),
			'terms'      => $terms,
		);
	}

	/**
	 * @param object $doc Layout document.
	 * @return array<string, mixed>
	 */
	private static function lean_settings( $doc ) {
		$common = isset( $doc->common_data ) && is_object( $doc->common_data ) ? $doc->common_data : new stdClass();
		$extra  = null;
		if ( isset( $common->preview_template_data->misc_preview_data->extra ) ) {
			$extra = $common->preview_template_data->misc_preview_data->extra;
		}
		$desktop = ( is_object( $extra ) && isset( $extra->desktop ) && is_object( $extra->desktop ) ) ? $extra->desktop : new stdClass();
		$mobile  = ( is_object( $extra ) && isset( $extra->mobile ) && is_object( $extra->mobile ) ) ? $extra->mobile : new stdClass();
		$post_preview = isset( $common->preview_template_data->post_preview_data ) && is_object( $common->preview_template_data->post_preview_data )
			? $common->preview_template_data->post_preview_data
			: new stdClass();
		$layout_type  = isset( $post_preview->layout_type ) ? sanitize_key( (string) $post_preview->layout_type ) : 'grid';
		if ( ! in_array( $layout_type, array( 'grid', 'slider', 'list' ), true ) ) {
			$layout_type = 'grid';
		}
		$post_area = isset( $post_preview->{$layout_type} ) && is_object( $post_preview->{$layout_type} ) ? $post_preview->{$layout_type} : new stdClass();
		$container_bg = '';
		if ( isset( $common->preview_template_data->misc_preview_data->container->style->desktop->default->backgroundColor ) ) {
			$container_bg = (string) $common->preview_template_data->misc_preview_data->container->style->desktop->default->backgroundColor;
		}

		$post_type = '';
		if ( isset( $common->post_type ) ) {
			$post_type = is_array( $common->post_type )
				? sanitize_key( (string) reset( $common->post_type ) )
				: sanitize_key( (string) $common->post_type );
		}

		$source = isset( $doc->post_layout_data->extra_data->layout_source )
			? sanitize_key( (string) $doc->post_layout_data->extra_data->layout_source )
			: 'caf_builder';

		$pager = self::find_module_in_tree( $doc, 'post', 'pagination' );
		$ppp   = null;
		$ptype = '';
		if ( is_object( $pager ) && isset( $pager->settings ) && is_object( $pager->settings ) ) {
			$ppp   = isset( $pager->settings->posts_per_page ) ? $pager->settings->posts_per_page : null;
			$ptype = isset( $pager->settings->pagination_type ) ? (string) $pager->settings->pagination_type : '';
		}

		$out = array(
			'post_type'              => $post_type,
			'layout_source'          => $source,
			'filter_position'        => isset( $desktop->filterPosition ) ? (string) $desktop->filterPosition : 'inline',
			'filter_position_mobile' => isset( $mobile->filterPosition ) ? (string) $mobile->filterPosition : '',
			'float_button'           => is_object( $desktop ) ? ! empty( $desktop->floatButton ) : false,
			'float_button_value'     => isset( $desktop->floatButtonValue ) ? (string) $desktop->floatButtonValue : '',
			'float_button_position'  => class_exists( 'CAF_MCP_Preview', false )
				? CAF_MCP_Preview::infer_float_button_position( $doc )
				: '',
			'animation_type'         => isset( $desktop->animationType ) ? (string) $desktop->animationType : '',
			'order'                  => isset( $extra->order ) ? (string) $extra->order : '',
			'orderby'                => isset( $extra->orderby ) ? (string) $extra->orderby : '',
			'posts_per_page'         => $ppp,
			'pagination_type'        => $ptype,
			'layout_type'            => $layout_type,
			'columns'                => isset( $post_area->device_columns->desktop ) ? (string) $post_area->device_columns->desktop : '',
			'masonry'                => is_object( $extra ) ? ! empty( $extra->masonary ) : false,
			'no_result'              => is_object( $extra ) && isset( $extra->noresult ) ? (string) $extra->noresult : '',
			'container_background'   => $container_bg,
			'analytics'              => self::read_bool_setting( isset( $common->analytics_enabled ) ? $common->analytics_enabled : null, false ),
			'filter_url'             => self::read_bool_setting( isset( $common->filter_url_enabled ) ? $common->filter_url_enabled : null, true ),
			'schema'                 => self::read_bool_setting( isset( $common->schema_enabled ) ? $common->schema_enabled : null, true ),
			'dynamic_term_counts'    => self::read_bool_setting(
				( isset( $doc->filter_layout_data->extra_data->dynamic_term_counts ) )
					? $doc->filter_layout_data->extra_data->dynamic_term_counts
					: null,
				false
			),
			'global_font_family'     => isset( $common->global_font_family ) ? (string) $common->global_font_family : '',
			'preview_post_id'        => self::lean_preview_post_id( $doc ),
			'query_restriction'      => class_exists( 'CAF_MCP_Document', false )
				? CAF_MCP_Document::lean_query_restriction( $doc )
				: null,
			'term_page_mode'         => class_exists( 'CAF_MCP_Document', false )
				? CAF_MCP_Document::lean_term_page_mode( $doc )
				: null,
			'filter_query'           => class_exists( 'CAF_MCP_Document', false )
				? CAF_MCP_Document::lean_filter_query( $doc )
				: null,
		);
		if ( class_exists( 'CAF_MCP_Preview', false ) ) {
			$out = array_merge( $out, CAF_MCP_Preview::lean_layout_control( $doc ) );
		}
		return $out;
	}

	/**
	 * @param object               $doc Layout.
	 * @param array<string, mixed> $patch Settings.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function apply_layout_settings( $doc, $patch ) {
		if ( class_exists( 'CAF_MCP_Tier', false ) ) {
			$blocked = CAF_MCP_Tier::reject_pro_settings( $patch );
			if ( is_wp_error( $blocked ) ) {
				return $blocked;
			}
		}
		$changed = array();

		if ( array_key_exists( 'post_type', $patch ) ) {
			$type = sanitize_key( (string) $patch['post_type'] );
			if ( '' === $type || ! post_type_exists( $type ) ) {
				return new WP_Error(
					'caf_mcp_bad_post_type',
					__( 'Unknown post_type. Call caf-list-post-types.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			$doc->common_data->post_type = $type;
			$changed['post_type']        = $type;
		}

		if ( array_key_exists( 'layout_source', $patch ) ) {
			$source = sanitize_key( (string) $patch['layout_source'] );
			if ( ! in_array( $source, array( 'caf_builder', 'main_query' ), true ) ) {
				return new WP_Error(
					'caf_mcp_bad_layout_source',
					__( 'layout_source must be caf_builder or main_query.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			if ( ! isset( $doc->post_layout_data ) || ! is_object( $doc->post_layout_data ) ) {
				$doc->post_layout_data = new stdClass();
			}
			if ( ! isset( $doc->post_layout_data->extra_data ) || ! is_object( $doc->post_layout_data->extra_data ) ) {
				$doc->post_layout_data->extra_data = new stdClass();
			}
			$doc->post_layout_data->extra_data->layout_source = $source;
			$changed['layout_source']                         = $source;
		}

		$pager = self::find_module_in_tree( $doc, 'post', 'pagination' );
		if ( array_key_exists( 'posts_per_page', $patch ) ) {
			$n = absint( $patch['posts_per_page'] );
			if ( $n < 1 || $n > 100 ) {
				return new WP_Error(
					'caf_mcp_bad_posts_per_page',
					__( 'posts_per_page must be 1–100.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			if ( ! is_object( $pager ) ) {
				return new WP_Error(
					'caf_mcp_no_pagination',
					__( 'This layout has no pagination module. Add one with caf-build-post (key pagination).', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			if ( ! isset( $pager->settings ) || ! is_object( $pager->settings ) ) {
				$pager->settings = new stdClass();
			}
			$pager->settings->posts_per_page = (string) $n;
			$changed['posts_per_page']       = (string) $n;
		}
		if ( array_key_exists( 'pagination_type', $patch ) ) {
			$type = (string) $patch['pagination_type'];
			$ok   = array( 'number', 'number2', 'load-more', 'button', 'infinite-scroll' );
			if ( ! in_array( $type, $ok, true ) ) {
				return new WP_Error(
					'caf_mcp_bad_pagination_type',
					__( 'pagination_type must be number, number2, load-more, button, or infinite-scroll.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			if ( ! is_object( $pager ) ) {
				$pager = self::find_module_in_tree( $doc, 'post', 'pagination' );
			}
			if ( ! is_object( $pager ) ) {
				return new WP_Error(
					'caf_mcp_no_pagination',
					__( 'This layout has no pagination module. Add one with caf-build-post (key pagination).', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			if ( ! isset( $pager->settings ) || ! is_object( $pager->settings ) ) {
				$pager->settings = new stdClass();
			}
			$pager->settings->pagination_type = $type;
			$changed['pagination_type']       = $type;
		}

		$misc = self::apply_misc_settings( $doc, $patch );
		if ( is_wp_error( $misc ) ) {
			return $misc;
		}
		$changed = array_merge( $changed, $misc );

		if ( class_exists( 'CAF_MCP_Preview', false ) ) {
			$preview = CAF_MCP_Preview::apply_settings_patch( $doc, $patch );
			if ( is_wp_error( $preview ) ) {
				return $preview;
			}
			$changed = array_merge( $changed, $preview );
		}

		if ( empty( $changed ) ) {
			return new WP_Error(
				'caf_mcp_unknown_settings',
				__( 'No supported settings in the patch.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		return $changed;
	}

	/**
	 * Misc drawer: analytics, Filter with URL, Schema, dynamic term counts, global font, builder preview post.
	 *
	 * @param object               $doc Layout.
	 * @param array<string, mixed> $patch Patch.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function apply_misc_settings( $doc, $patch ) {
		$changed = array();
		if ( ! isset( $doc->common_data ) || ! is_object( $doc->common_data ) ) {
			$doc->common_data = new stdClass();
		}

		$analytics = self::patch_bool( $patch, array( 'analytics', 'analytics_enabled' ) );
		if ( null !== $analytics ) {
			$doc->common_data->analytics_enabled = $analytics;
			$changed['analytics']                = $analytics;
		}

		$filter_url = self::patch_bool( $patch, array( 'filter_url', 'filter_url_enabled' ) );
		if ( null !== $filter_url ) {
			$doc->common_data->filter_url_enabled = $filter_url;
			$changed['filter_url']                = $filter_url;
		}

		$schema = self::patch_bool( $patch, array( 'schema', 'schema_enabled' ) );
		if ( null !== $schema ) {
			$doc->common_data->schema_enabled = $schema;
			$changed['schema']                = $schema;
		}

		$dtc = self::patch_bool( $patch, array( 'dynamic_term_counts' ) );
		if ( null !== $dtc ) {
			if ( ! isset( $doc->filter_layout_data ) || ! is_object( $doc->filter_layout_data ) ) {
				$doc->filter_layout_data = new stdClass();
			}
			if ( ! isset( $doc->filter_layout_data->extra_data ) || ! is_object( $doc->filter_layout_data->extra_data ) ) {
				$doc->filter_layout_data->extra_data = new stdClass();
			}
			$doc->filter_layout_data->extra_data->dynamic_term_counts = $dtc ? 'true' : 'false';
			$changed['dynamic_term_counts']                           = $dtc;
		}

		if ( array_key_exists( 'global_font_family', $patch ) || array_key_exists( 'global_font', $patch ) ) {
			$raw  = array_key_exists( 'global_font_family', $patch ) ? $patch['global_font_family'] : $patch['global_font'];
			$font = sanitize_text_field( (string) $raw );
			$font = trim( $font );
			if ( '' === $font ) {
				return new WP_Error(
					'caf_mcp_bad_font',
					__( 'global_font_family cannot be empty. Example: DM Sans.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			$old = isset( $doc->common_data->global_font_family ) ? trim( (string) $doc->common_data->global_font_family ) : 'DM Sans';
			if ( '' === $old ) {
				$old = 'DM Sans';
			}
			$doc->common_data->global_font_family = $font;
			self::propagate_global_font( $doc, $font, $old );
			$changed['global_font_family'] = $font;
		}

		if ( array_key_exists( 'preview_post_id', $patch ) ) {
			$preview = self::apply_preview_post( $doc, $patch['preview_post_id'] );
			if ( is_wp_error( $preview ) ) {
				return $preview;
			}
			$changed['preview_post_id'] = $preview;
		}

		return $changed;
	}

	/**
	 * @param array<string, mixed> $patch Patch.
	 * @param array<int, string>   $keys Keys.
	 * @return bool|null
	 */
	private static function patch_bool( $patch, $keys ) {
		foreach ( $keys as $key ) {
			if ( array_key_exists( $key, $patch ) ) {
				return (bool) rest_sanitize_boolean( $patch[ $key ] );
			}
		}
		return null;
	}

	/**
	 * @param mixed $raw Raw.
	 * @param bool  $default Default.
	 * @return bool
	 */
	private static function read_bool_setting( $raw, $default ) {
		if ( function_exists( 'caf_builder_parse_bool_setting' ) ) {
			return caf_builder_parse_bool_setting( $raw, $default );
		}
		if ( null === $raw || '' === $raw ) {
			return (bool) $default;
		}
		return (bool) rest_sanitize_boolean( $raw );
	}

	/**
	 * @param object $doc Layout.
	 * @return int
	 */
	private static function lean_preview_post_id( $doc ) {
		$raw = isset( $doc->post_layout_data->extra_data->single_post_data ) ? $doc->post_layout_data->extra_data->single_post_data : null;
		if ( is_object( $raw ) ) {
			if ( isset( $raw->value ) ) {
				return absint( $raw->value );
			}
			if ( isset( $raw->id ) ) {
				return absint( $raw->id );
			}
		}
		if ( is_array( $raw ) ) {
			if ( isset( $raw['value'] ) ) {
				return absint( $raw['value'] );
			}
			if ( isset( $raw['id'] ) ) {
				return absint( $raw['id'] );
			}
		}
		return 0;
	}

	/**
	 * @param object $doc Layout.
	 * @param mixed  $raw Post id (0 clears).
	 * @return int|WP_Error
	 */
	private static function apply_preview_post( $doc, $raw ) {
		$id = absint( $raw );
		if ( ! isset( $doc->post_layout_data ) || ! is_object( $doc->post_layout_data ) ) {
			$doc->post_layout_data = new stdClass();
		}
		if ( ! isset( $doc->post_layout_data->extra_data ) || ! is_object( $doc->post_layout_data->extra_data ) ) {
			$doc->post_layout_data->extra_data = new stdClass();
		}
		if ( $id < 1 ) {
			$doc->post_layout_data->extra_data->single_post_data = new stdClass();
			return 0;
		}
		$post = get_post( $id );
		if ( ! $post ) {
			return new WP_Error(
				'caf_mcp_bad_preview_post',
				__( 'Unknown preview_post_id. Call caf-list-posts.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		$title = get_the_title( $post );
		$doc->post_layout_data->extra_data->single_post_data = (object) array(
			'id'        => (int) $post->ID,
			'value'     => (int) $post->ID,
			'title'     => (string) $title,
			'label'     => (string) $title,
			'post_type' => (string) $post->post_type,
		);
		return (int) $post->ID;
	}

	/**
	 * Replace fontFamily slots that still match the previous global font.
	 *
	 * @param object $doc Layout.
	 * @param string $new_font New family.
	 * @param string $old_font Old family.
	 * @return void
	 */
	private static function propagate_global_font( $doc, $new_font, $old_font ) {
		$filter = isset( $doc->filter_layout_data->initial_data ) ? $doc->filter_layout_data->initial_data : array();
		$post   = isset( $doc->post_layout_data->initial_data ) ? $doc->post_layout_data->initial_data : array();
		self::walk_font_nodes( $filter, $new_font, $old_font );
		self::walk_font_nodes( $post, $new_font, $old_font );
		$misc = isset( $doc->common_data->preview_template_data->misc_preview_data )
			? $doc->common_data->preview_template_data->misc_preview_data
			: null;
		if ( is_object( $misc ) ) {
			foreach ( get_object_vars( $misc ) as $item ) {
				if ( is_object( $item ) ) {
					self::walk_font_style( isset( $item->style ) ? $item->style : $item, $new_font, $old_font );
				}
			}
		}
	}

	/**
	 * @param mixed  $nodes Tree.
	 * @param string $new_font New.
	 * @param string $old_font Old.
	 * @return void
	 */
	private static function walk_font_nodes( $nodes, $new_font, $old_font ) {
		if ( ! is_array( $nodes ) ) {
			return;
		}
		foreach ( $nodes as $node ) {
			if ( ! is_object( $node ) ) {
				continue;
			}
			if ( isset( $node->style ) ) {
				self::walk_font_style( $node->style, $new_font, $old_font );
			}
			if ( isset( $node->data ) && is_array( $node->data ) ) {
				self::walk_font_nodes( $node->data, $new_font, $old_font );
			}
		}
	}

	/**
	 * @param mixed  $style Style tree.
	 * @param string $new_font New.
	 * @param string $old_font Old.
	 * @return void
	 */
	private static function walk_font_style( $style, $new_font, $old_font ) {
		if ( is_array( $style ) ) {
			foreach ( $style as $value ) {
				self::walk_font_style( $value, $new_font, $old_font );
			}
			return;
		}
		if ( ! is_object( $style ) ) {
			return;
		}
		if ( isset( $style->fontFamily ) && (string) $style->fontFamily === (string) $old_font ) {
			$style->fontFamily = $new_font;
		}
		foreach ( get_object_vars( $style ) as $value ) {
			if ( is_object( $value ) || is_array( $value ) ) {
				self::walk_font_style( $value, $new_font, $old_font );
			}
		}
	}

	/**
	 * @param object $doc Layout.
	 * @return object extra object.
	 */
	private static function ensure_filter_extra( $doc ) {
		if ( ! isset( $doc->common_data ) || ! is_object( $doc->common_data ) ) {
			$doc->common_data = new stdClass();
		}
		if ( ! isset( $doc->common_data->preview_template_data ) || ! is_object( $doc->common_data->preview_template_data ) ) {
			$doc->common_data->preview_template_data = new stdClass();
		}
		$preview = $doc->common_data->preview_template_data;
		if ( ! isset( $preview->filter_preview_data ) || ! is_object( $preview->filter_preview_data ) ) {
			$preview->filter_preview_data = new stdClass();
		}
		$fpd = $preview->filter_preview_data;
		if ( ! isset( $fpd->extra ) || ! is_object( $fpd->extra ) ) {
			$fpd->extra = new stdClass();
		}
		return $fpd->extra;
	}

	/**
	 * @param object $doc Layout.
	 * @param string $tree filter|post.
	 * @param string $key Module key.
	 * @return object|null
	 */
	private static function find_module_in_tree( $doc, $tree, $key ) {
		$rows = ( 'post' === $tree )
			? ( isset( $doc->post_layout_data->initial_data ) ? $doc->post_layout_data->initial_data : array() )
			: ( isset( $doc->filter_layout_data->initial_data ) ? $doc->filter_layout_data->initial_data : array() );
		$hit = self::find_module_key_walk( $rows, $key );
		if ( $hit ) {
			return $hit;
		}
		if ( ! in_array( $key, array( 'pagination', 'selected', 'result_count', 'sorting' ), true ) ) {
			return null;
		}
		$dnd = array();
		if ( isset( $doc->common_data->preview_template_data->misc_preview_data->dnd_column_data ) ) {
			$dnd = $doc->common_data->preview_template_data->misc_preview_data->dnd_column_data;
		}
		return self::find_chrome_key_walk( $dnd, $key );
	}

	/**
	 * Misc chrome items (pagination etc.) have a key but often no type=module.
	 *
	 * @param mixed  $nodes Zones.
	 * @param string $key Key.
	 * @return object|null
	 */
	private static function find_chrome_key_walk( $nodes, $key ) {
		if ( ! is_array( $nodes ) ) {
			return null;
		}
		foreach ( $nodes as $zone ) {
			if ( ! is_object( $zone ) || empty( $zone->data ) || ! is_array( $zone->data ) ) {
				continue;
			}
			foreach ( $zone->data as $item ) {
				if ( is_object( $item ) && isset( $item->key ) && (string) $item->key === $key ) {
					return $item;
				}
			}
		}
		return null;
	}

	/**
	 * @param mixed  $nodes Tree.
	 * @param string $key Key.
	 * @return object|null
	 */
	private static function find_module_key_walk( $nodes, $key ) {
		if ( ! is_array( $nodes ) ) {
			return null;
		}
		foreach ( $nodes as $node ) {
			if ( is_object( $node ) && isset( $node->key ) && (string) $node->key === $key && isset( $node->type ) && 'module' === $node->type ) {
				return $node;
			}
			if ( is_object( $node ) && isset( $node->data ) ) {
				$hit = self::find_module_key_walk( $node->data, $key );
				if ( $hit ) {
					return $hit;
				}
			}
		}
		return null;
	}

	/**
	 * @param mixed $rows Row list.
	 * @param bool  $include_content Include module settings (still no style trees).
	 * @return array<int, array<string, mixed>>
	 */
	private static function lean_tree( $rows, $include_content ) {
		if ( ! is_array( $rows ) ) {
			return array();
		}
		$out = array();
		foreach ( $rows as $row ) {
			$node = self::lean_node( $row, $include_content );
			if ( null !== $node ) {
				$out[] = $node;
			}
		}
		return $out;
	}

	/**
	 * @param mixed $node Tree node.
	 * @param bool  $include_content Include settings.
	 * @return array<string, mixed>|null
	 */
	private static function lean_node( $node, $include_content ) {
		if ( ! is_object( $node ) ) {
			return null;
		}
		$type = isset( $node->type ) ? (string) $node->type : '';
		if ( ! in_array( $type, array( 'row', 'column', 'module' ), true ) ) {
			return null;
		}
		$title = '';
		if ( isset( $node->settings->admin_label ) && '' !== (string) $node->settings->admin_label ) {
			$title = (string) $node->settings->admin_label;
		} elseif ( isset( $node->title ) ) {
			$title = (string) $node->title;
		} elseif ( isset( $node->key ) ) {
			$title = (string) $node->key;
		}

		$item = array(
			'id'    => isset( $node->id ) ? (string) $node->id : '',
			'type'  => $type,
			'title' => $title,
		);
		if ( 'module' === $type ) {
			$item['key'] = isset( $node->key ) ? (string) $node->key : '';
			if ( $include_content && isset( $node->settings ) ) {
				$item['settings'] = $node->settings;
			}
		}
		if ( isset( $node->data ) && is_array( $node->data ) && 'module' !== $type ) {
			$item['elements'] = self::lean_tree( $node->data, $include_content );
		}
		return $item;
	}

	/**
	 * @param string $id Node id.
	 * @param array  $filter_tree Lean filter tree.
	 * @param array  $post_tree Lean post tree.
	 * @return array{tree:string,node:array}|null
	 */
	private static function find_in_trees( $id, $filter_tree, $post_tree ) {
		$found = self::find_node( $id, $filter_tree );
		if ( null !== $found ) {
			return array(
				'tree' => 'filter',
				'node' => $found,
			);
		}
		$found = self::find_node( $id, $post_tree );
		if ( null !== $found ) {
			return array(
				'tree' => 'post',
				'node' => $found,
			);
		}
		return null;
	}

	/**
	 * @param string $id Node id.
	 * @param array  $nodes Lean nodes.
	 * @return array|null
	 */
	private static function find_node( $id, $nodes ) {
		foreach ( $nodes as $node ) {
			if ( isset( $node['id'] ) && (string) $node['id'] === (string) $id ) {
				return $node;
			}
			if ( ! empty( $node['elements'] ) && is_array( $node['elements'] ) ) {
				$hit = self::find_node( $id, $node['elements'] );
				if ( null !== $hit ) {
					return $hit;
				}
			}
		}
		return null;
	}

	/**
	 * MCP revision option for one layout. Autoload off — poll-only metadata.
	 *
	 * @param string $option_key Layout option key.
	 * @return string
	 */
	/**
	 * Layout Control cards for change detection (full preview JSON can fail).
	 *
	 * @param object $doc Layout document.
	 * @return mixed
	 */
	private static function dnd_column_data_from_doc( $doc ) {
		if ( ! is_object( $doc ) || ! isset( $doc->common_data->preview_template_data->misc_preview_data->dnd_column_data ) ) {
			return null;
		}
		return $doc->common_data->preview_template_data->misc_preview_data->dnd_column_data;
	}

	private static function revision_option_key( $option_key ) {
		return 'caf_mcp_rev_' . md5( (string) $option_key );
	}

	/**
	 * @param string $option_key Layout option key.
	 * @return int
	 */
	private static function get_revision( $option_key ) {
		return absint( get_option( self::revision_option_key( $option_key ), 0 ) );
	}

	/**
	 * @param string $option_key Layout option key.
	 * @return int
	 */
	private static function bump_revision( $option_key ) {
		$next = self::get_revision( $option_key ) + 1;
		update_option( self::revision_option_key( $option_key ), $next, false );
		return $next;
	}

	/**
	 * Persist after MCP writes. Builder Save does not call this, so live
	 * customers who never use MCP never bump the token.
	 *
	 * @param array  $resolved load_layout payload.
	 * @param object $doc Layout document.
	 * @param array  $args { bump_revision: bool }.
	 * @return int Current revision after persist.
	 */
	private static function persist_layout( $resolved, $doc, $args = array() ) {
		if ( function_exists( 'caf_normalize_builder_layout_data' ) ) {
			$doc = caf_normalize_builder_layout_data( $doc, array( 'assign_node_ids' => true ) );
		}
		if ( class_exists( 'CAF_MCP_Compose', false ) ) {
			CAF_MCP_Compose::fill_missing_preview_template_defaults( $doc );
		}
		update_option( $resolved['option_key'], json_decode( wp_json_encode( $doc ) ) );
		if ( isset( $resolved['index'] ) && is_numeric( $resolved['index'] ) ) {
			$index = (int) $resolved['index'];
			if ( function_exists( 'caf_builder_invalidate_layout_cache' ) ) {
				caf_builder_invalidate_layout_cache( $index );
			}
			if ( function_exists( 'caf_sync_builder_analytics_option_from_layout' ) ) {
				caf_sync_builder_analytics_option_from_layout( $index, $doc );
			}
			if ( function_exists( 'caf_sync_builder_seo_options_from_layout' ) ) {
				caf_sync_builder_seo_options_from_layout( $index, $doc );
			}
		}
		$bump = ! isset( $args['bump_revision'] ) || $args['bump_revision'];
		if ( $bump ) {
			$next = self::bump_revision( $resolved['option_key'] );
			if ( class_exists( 'CAF_MCP_Document', false ) ) {
				$label = isset( $resolved['label'] ) ? (string) $resolved['label'] : '';
				CAF_MCP_Document::push_snapshot( $resolved['option_key'], $doc, $next, $label );
			}
			return $next;
		}
		return self::get_revision( $resolved['option_key'] );
	}

	/**
	 * @param object $doc Layout.
	 * @param array  $op Operation.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function apply_operation( $doc, $op ) {
		$action = isset( $op['action'] ) ? sanitize_key( (string) $op['action'] ) : '';
		$id     = isset( $op['element_id'] ) ? sanitize_text_field( (string) $op['element_id'] ) : '';
		if ( '' === $id ) {
			return new WP_Error( 'caf_mcp_missing_id', __( 'Each operation needs element_id.', 'category-ajax-filter' ) );
		}
		if ( class_exists( 'CAF_MCP_Preview', false ) && CAF_MCP_Preview::is_id( $id ) ) {
			if ( in_array( $action, array( 'delete', 'duplicate' ), true ) ) {
				return CAF_MCP_Preview::immutable_error( $action );
			}
			if ( 'move' === $action ) {
				return CAF_MCP_Preview::apply_move(
					$doc,
					$id,
					isset( $op['new_parent_id'] ) ? sanitize_text_field( (string) $op['new_parent_id'] ) : '',
					array_key_exists( 'index', $op ) ? $op['index'] : null
				);
			}
			if ( 'style' === $action ) {
				return CAF_MCP_Preview::apply_style( $doc, $id, $op );
			}
			if ( 'layout' === $action ) {
				return CAF_MCP_Preview::apply_layout( $doc, $id, $op );
			}
			if ( 'update' === $action ) {
				$settings = isset( $op['settings'] ) && is_array( $op['settings'] ) ? $op['settings'] : array();
				return CAF_MCP_Preview::apply_update( $doc, $id, $settings );
			}
			return new WP_Error(
				'caf_mcp_unknown_action',
				__( 'Last-screen preview:* ids support action=style, layout, update, or move (Layout Control cards only).', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		if ( 'update' === $action ) {
			return self::op_update( $doc, $id, isset( $op['settings'] ) && is_array( $op['settings'] ) ? $op['settings'] : array() );
		}
		if ( 'delete' === $action ) {
			return self::op_delete( $doc, $id );
		}
		if ( 'duplicate' === $action ) {
			return self::op_duplicate( $doc, $id );
		}
		if ( 'move' === $action ) {
			return self::op_move(
				$doc,
				$id,
				isset( $op['new_parent_id'] ) ? sanitize_text_field( (string) $op['new_parent_id'] ) : '',
				array_key_exists( 'index', $op ) ? $op['index'] : null
			);
		}
		if ( 'style' === $action ) {
			return self::op_style( $doc, $id, $op );
		}
		if ( 'bind_taxonomy' === $action ) {
			return self::op_bind_taxonomy( $doc, $id, $op );
		}
		if ( 'bind_custom_field' === $action ) {
			if ( class_exists( 'CAF_MCP_Tier', false ) ) {
				return CAF_MCP_Tier::pro_only_error( 'filter_custom_field' );
			}
			return self::op_bind_custom_field( $doc, $id, $op );
		}
		if ( 'bind_price' === $action ) {
			return self::op_bind_price( $doc, $id, $op );
		}
		if ( 'layout' === $action ) {
			return self::op_layout( $doc, $id, $op );
		}
		if ( 'set_term_visual' === $action ) {
			return self::op_set_term_visual( $doc, $id, $op );
		}
		return new WP_Error( 'caf_mcp_unknown_action', __( 'action must be update, move, delete, duplicate, style, layout, bind_taxonomy, bind_custom_field, bind_price, or set_term_visual.', 'category-ajax-filter' ) );
	}

	/**
	 * @param object $doc Layout.
	 * @param string $id Node id.
	 * @return array{tree:string,indexes:array<int,int>}|null
	 */
	private static function locate( $doc, $id ) {
		foreach ( array( 'filter', 'post' ) as $tree ) {
			$rows = self::tree_rows( $doc, $tree );
			$path = self::locate_path( $rows, $id, array() );
			if ( null !== $path ) {
				return array(
					'tree'    => $tree,
					'indexes' => $path,
				);
			}
		}
		return null;
	}

	/**
	 * @param mixed $list Node list.
	 * @param string $id Node id.
	 * @param array<int,int> $path Path so far.
	 * @return array<int,int>|null
	 */
	private static function locate_path( $list, $id, $path ) {
		if ( ! is_array( $list ) ) {
			return null;
		}
		foreach ( $list as $i => $node ) {
			if ( ! is_object( $node ) ) {
				continue;
			}
			$next = array_merge( $path, array( (int) $i ) );
			if ( isset( $node->id ) && (string) $node->id === (string) $id ) {
				return $next;
			}
			if ( isset( $node->data ) && is_array( $node->data ) ) {
				$found = self::locate_path( $node->data, $id, $next );
				if ( null !== $found ) {
					return $found;
				}
			}
		}
		return null;
	}

	/**
	 * @param object $doc Layout.
	 * @param string $tree filter|post.
	 * @return array
	 */
	private static function &tree_rows( &$doc, $tree ) {
		if ( 'post' === $tree ) {
			if ( ! isset( $doc->post_layout_data ) || ! is_object( $doc->post_layout_data ) ) {
				$doc->post_layout_data = new stdClass();
			}
			if ( ! isset( $doc->post_layout_data->initial_data ) || ! is_array( $doc->post_layout_data->initial_data ) ) {
				$doc->post_layout_data->initial_data = array();
			}
			return $doc->post_layout_data->initial_data;
		}
		if ( ! isset( $doc->filter_layout_data ) || ! is_object( $doc->filter_layout_data ) ) {
			$doc->filter_layout_data = new stdClass();
		}
		if ( ! isset( $doc->filter_layout_data->initial_data ) || ! is_array( $doc->filter_layout_data->initial_data ) ) {
			$doc->filter_layout_data->initial_data = array();
		}
		return $doc->filter_layout_data->initial_data;
	}

	/**
	 * @param object $doc Layout.
	 * @param array  $loc Location.
	 * @return object|null
	 */
	private static function node_at( $doc, $loc ) {
		if ( ! $loc ) {
			return null;
		}
		$list = self::tree_rows( $doc, $loc['tree'] );
		$node = null;
		foreach ( $loc['indexes'] as $i => $index ) {
			$list = ( 0 === $i ) ? $list : ( isset( $node->data ) && is_array( $node->data ) ? $node->data : null );
			if ( ! is_array( $list ) || ! isset( $list[ $index ] ) || ! is_object( $list[ $index ] ) ) {
				return null;
			}
			$node = $list[ $index ];
		}
		return $node;
	}

	/**
	 * @param object $doc Layout.
	 * @param array  $loc Location.
	 * @return object|null Spliced node.
	 */
	private static function splice_out( &$doc, $loc ) {
		$indexes = $loc['indexes'];
		$rows    = &self::tree_rows( $doc, $loc['tree'] );
		if ( 1 === count( $indexes ) ) {
			$chunk = array_splice( $rows, $indexes[0], 1 );
			return isset( $chunk[0] ) ? $chunk[0] : null;
		}
		$row = $rows[ $indexes[0] ];
		if ( 2 === count( $indexes ) ) {
			if ( ! isset( $row->data ) || ! is_array( $row->data ) ) {
				return null;
			}
			$chunk = array_splice( $row->data, $indexes[1], 1 );
			return isset( $chunk[0] ) ? $chunk[0] : null;
		}
		$col = isset( $row->data[ $indexes[1] ] ) ? $row->data[ $indexes[1] ] : null;
		if ( ! is_object( $col ) || ! isset( $col->data ) || ! is_array( $col->data ) ) {
			return null;
		}
		$chunk = array_splice( $col->data, $indexes[2], 1 );
		return isset( $chunk[0] ) ? $chunk[0] : null;
	}

	/**
	 * @param object $doc Layout.
	 * @param array  $parent_loc Parent location or tree root.
	 * @param object $node Node to insert.
	 * @param int    $index Insert index.
	 */
	/**
	 * @param object $doc Layout.
	 * @param string $parent_id filter|document|root or a node id.
	 * @return array{kind:string,tree:string,expected:string,indexes?:array<int,int>}|WP_Error
	 */
	private static function resolve_compose_parent( $doc, $parent_id, $tree = 'filter' ) {
		$parent_id = sanitize_text_field( (string) $parent_id );
		$tree      = ( 'post' === $tree ) ? 'post' : 'filter';
		if ( '' === $parent_id || in_array( $parent_id, array( 'filter', 'document', 'root', 'post' ), true ) ) {
			if ( 'post' === $parent_id && 'filter' === $tree ) {
				return new WP_Error(
					'caf_mcp_filter_only',
					__( 'build-filter only writes the filter tree.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			if ( in_array( $parent_id, array( 'filter', 'document', 'root' ), true ) && 'post' === $tree ) {
				return new WP_Error(
					'caf_mcp_wrong_tree',
					__( 'build-post parent_id must be post, or a post-tree row/column id.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			$root_tree = ( 'post' === $parent_id || ( '' === $parent_id && 'post' === $tree ) ) ? 'post' : 'filter';
			return array(
				'kind'     => 'root',
				'tree'     => $root_tree,
				'expected' => 'row',
			);
		}
		$loc = self::locate( $doc, $parent_id );
		if ( ! $loc || $tree !== $loc['tree'] ) {
			return new WP_Error(
				'caf_mcp_parent_not_found',
				__( 'parent_id was not found in that tree.', 'category-ajax-filter' ),
				array( 'status' => 404 )
			);
		}
		$node = self::node_at( $doc, $loc );
		if ( ! $node ) {
			return new WP_Error(
				'caf_mcp_parent_not_found',
				__( 'parent_id was not found in that tree.', 'category-ajax-filter' ),
				array( 'status' => 404 )
			);
		}
		$type = isset( $node->type ) ? (string) $node->type : '';
		if ( 'row' === $type ) {
			$expected = 'column';
		} elseif ( 'column' === $type ) {
			$expected = 'module';
		} else {
			return new WP_Error(
				'caf_mcp_parent_is_module',
				__( 'Modules cannot have children. Pass a row or column parent_id.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		return array(
			'kind'     => 'node',
			'tree'     => $loc['tree'],
			'indexes'  => $loc['indexes'],
			'expected' => $expected,
		);
	}

	/**
	 * @param object $doc Layout.
	 * @param array  $parent_loc Parent from resolve_compose_parent.
	 * @return array<int, string>
	 */
	private static function replace_compose_children( &$doc, $parent_loc ) {
		if ( 'root' === $parent_loc['kind'] ) {
			$rows    = &self::tree_rows( $doc, $parent_loc['tree'] );
			$removed = CAF_MCP_Compose::collect_ids( $rows );
			$rows    = array();
			return $removed;
		}
		$parent = self::node_at( $doc, $parent_loc );
		if ( ! is_object( $parent ) ) {
			return array();
		}
		$removed      = CAF_MCP_Compose::collect_ids( isset( $parent->data ) ? $parent->data : array() );
		$parent->data = array();
		return $removed;
	}

	/**
	 * @param object $doc Layout.
	 * @param array  $parent_loc Parent location or tree root.
	 * @param object $node Node to insert.
	 * @param int    $index Insert index.
	 * @return int|null
	 */
	private static function splice_in( &$doc, $parent_loc, $node, $index ) {
		if ( 'root' === $parent_loc['kind'] ) {
			$rows = &self::tree_rows( $doc, $parent_loc['tree'] );
			$at   = self::clamp_index( $index, count( $rows ) );
			array_splice( $rows, $at, 0, array( $node ) );
			return $at;
		}
		$parent = self::node_at( $doc, $parent_loc );
		if ( ! is_object( $parent ) ) {
			return null;
		}
		if ( ! isset( $parent->data ) || ! is_array( $parent->data ) ) {
			$parent->data = array();
		}
		$at = self::clamp_index( $index, count( $parent->data ) );
		array_splice( $parent->data, $at, 0, array( $node ) );
		return $at;
	}

	/**
	 * @param mixed $index Index.
	 * @param int   $count List length.
	 * @return int
	 */
	private static function clamp_index( $index, $count ) {
		if ( null === $index || '' === $index ) {
			return (int) $count;
		}
		$index = (int) $index;
		if ( $index < 0 ) {
			return 0;
		}
		if ( $index > $count ) {
			return (int) $count;
		}
		return $index;
	}

	/**
	 * @param object $doc Layout.
	 * @param string $id Node id.
	 * @param array  $settings Settings patch.
	 * @return array|WP_Error
	 */
	private static function op_update( $doc, $id, $settings ) {
		$loc  = self::locate( $doc, $id );
		$node = self::node_at( $doc, $loc );
		if ( ! $node ) {
			return new WP_Error( 'caf_mcp_element_not_found', __( 'No layout node has that id.', 'category-ajax-filter' ) );
		}
		if ( ! isset( $node->settings ) || ! is_object( $node->settings ) ) {
			$node->settings = new stdClass();
		}
		$blocked = array( 'id', 'type', 'key', 'data', 'style' );
		$written = array();
		if ( class_exists( 'CAF_MCP_Compose', false ) ) {
			CAF_MCP_Compose::patch_settings( $node, $settings );
			foreach ( $settings as $key => $value ) {
				$key = sanitize_key( (string) $key );
				if ( '' === $key || in_array( $key, $blocked, true ) ) {
					continue;
				}
				$written[] = $key;
			}
			return array(
				'action'     => 'update',
				'element_id' => $id,
				'settings'   => $written,
			);
		}
		foreach ( $settings as $key => $value ) {
			$key = sanitize_key( (string) $key );
			if ( '' === $key || in_array( $key, $blocked, true ) ) {
				continue;
			}
			if ( null === $value ) {
				unset( $node->settings->{$key} );
			} else {
				$node->settings->{$key} = $value;
			}
			$written[] = $key;
		}
		return array(
			'action'     => 'update',
			'element_id' => $id,
			'settings'   => $written,
		);
	}

	/**
	 * Plain CSS onto CAF nested style. Does not replace the whole style tree.
	 *
	 * @param object $doc Layout.
	 * @param string $id Node id.
	 * @param array  $op Operation.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function op_style( $doc, $id, $op ) {
		$loc  = self::locate( $doc, $id );
		$node = self::node_at( $doc, $loc );
		if ( ! $node ) {
			return new WP_Error( 'caf_mcp_element_not_found', __( 'No layout node has that id.', 'category-ajax-filter' ) );
		}
		if ( ! class_exists( 'CAF_MCP_Css', false ) ) {
			return new WP_Error( 'caf_mcp_css_missing', __( 'CSS converter is not loaded.', 'category-ajax-filter' ), array( 'status' => 500 ) );
		}
		$css    = isset( $op['css'] ) ? (string) $op['css'] : '';
		$part   = isset( $op['part'] ) ? (string) $op['part'] : '';
		$device = isset( $op['device'] ) ? (string) $op['device'] : 'desktop';
		return CAF_MCP_Css::apply_to_node( $node, $part, $css, $device );
	}

	/**
	 * @param object $doc Layout.
	 * @param string $id Node id.
	 * @param array  $op Operation.
	 * @return array|WP_Error
	 */
	private static function op_layout( $doc, $id, $op ) {
		$loc  = self::locate( $doc, $id );
		$node = self::node_at( $doc, $loc );
		if ( ! $node ) {
			return new WP_Error( 'caf_mcp_element_not_found', __( 'No layout node has that id.', 'category-ajax-filter' ) );
		}
		if ( ! class_exists( 'CAF_MCP_Document', false ) ) {
			return new WP_Error( 'caf_mcp_document_missing', __( 'Layout helper is not loaded.', 'category-ajax-filter' ), array( 'status' => 500 ) );
		}
		return CAF_MCP_Document::apply_frame_layout( $node, $op );
	}

	/**
	 * @param object $doc Layout.
	 * @param string $id Node id.
	 * @param array  $op Operation.
	 * @return array|WP_Error
	 */
	private static function op_set_term_visual( $doc, $id, $op ) {
		$loc  = self::locate( $doc, $id );
		$node = self::node_at( $doc, $loc );
		if ( ! $node ) {
			return new WP_Error( 'caf_mcp_element_not_found', __( 'No layout node has that id.', 'category-ajax-filter' ) );
		}
		if ( ! class_exists( 'CAF_MCP_Document', false ) ) {
			return new WP_Error( 'caf_mcp_document_missing', __( 'Term visual helper is not loaded.', 'category-ajax-filter' ), array( 'status' => 500 ) );
		}
		return CAF_MCP_Document::apply_term_visual( $node, $op );
	}

	/**
	 * Attach a taxonomy (and optional term ids) onto a filter module.
	 *
	 * @param object $doc Layout.
	 * @param string $id Node id.
	 * @param array  $op Operation.
	 * @return array|WP_Error
	 */
	private static function op_bind_taxonomy( $doc, $id, $op ) {
		$loc  = self::locate( $doc, $id );
		$node = self::node_at( $doc, $loc );
		if ( ! $node ) {
			return new WP_Error( 'caf_mcp_element_not_found', __( 'No layout node has that id.', 'category-ajax-filter' ) );
		}
		$key = isset( $node->key ) ? (string) $node->key : '';
		if ( ! in_array( $key, array( 'checkbox_filter', 'dropdown_filter', 'range_slider' ), true ) ) {
			return new WP_Error(
				'caf_mcp_not_taxonomy_module',
				__( 'bind_taxonomy only works on checkbox_filter, dropdown_filter, or range_slider.', 'category-ajax-filter' )
			);
		}
		$taxonomy = isset( $op['taxonomy'] ) ? CAF_MCP_Compose::normalize_bind_taxonomy_key( $op['taxonomy'] ) : '';
		if ( '__caf_author' === $taxonomy ) {
			if ( class_exists( 'CAF_MCP_Tier', false ) ) {
				return CAF_MCP_Tier::pro_only_error( 'filter_author' );
			}
			return self::op_bind_author( $doc, $id, $node, $op );
		}
		if ( '' === $taxonomy || ! taxonomy_exists( $taxonomy ) ) {
			return new WP_Error(
				'caf_mcp_bad_taxonomy',
				__( 'Pass a real taxonomy from GET /mcp/taxonomies (or taxonomy=author / __caf_author for Filter by author).', 'category-ajax-filter' )
			);
		}
		$wanted = array();
		if ( isset( $op['term_ids'] ) && is_array( $op['term_ids'] ) ) {
			foreach ( $op['term_ids'] as $term_id ) {
				$term_id = absint( $term_id );
				if ( $term_id ) {
					$wanted[ $term_id ] = true;
				}
			}
		}
		$terms = get_terms(
			array(
				'taxonomy'   => $taxonomy,
				'hide_empty' => false,
				'number'     => 200,
				'orderby'    => 'name',
				'order'      => 'ASC',
			)
		);
		if ( is_wp_error( $terms ) ) {
			$terms = array();
		}
		$term_data = array();
		foreach ( $terms as $term ) {
			if ( ! is_object( $term ) ) {
				continue;
			}
			$tid = (int) $term->term_id;
			if ( ! empty( $wanted ) && ! isset( $wanted[ $tid ] ) ) {
				continue;
			}
			$term_data[] = (object) array(
				'key'           => $tid,
				'value'         => (string) $term->name,
				'predefine'     => 'false',
				'icons'         => (object) array(
					'icon'     => '',
					'type'     => 'icon',
					'position' => 'before',
				),
				'is_parent'     => 'false',
				'children_data' => array(),
				'children'      => 'false',
				'parent_id'     => $term->parent ? (int) $term->parent : null,
				'count'         => (int) $term->count,
			);
		}
		if ( ! isset( $node->settings ) || ! is_object( $node->settings ) ) {
			$node->settings = new stdClass();
		}
		$node->settings->data_source       = 'taxonomy';
		$node->settings->custom_field_data = array();
		$node->settings->taxonomy_data     = array(
			(object) array(
				'key'       => $taxonomy,
				'term_data' => $term_data,
			),
		);
		return array(
			'action'     => 'bind_taxonomy',
			'element_id' => $id,
			'taxonomy'   => $taxonomy,
			'kind'       => ( 0 === strpos( $taxonomy, 'pa_' ) ) ? 'attribute' : 'taxonomy',
			'term_count' => count( $term_data ),
		);
	}

	/**
	 * Bind Misc → Author (`__caf_author`) onto checkbox or dropdown.
	 *
	 * @param object $doc  Layout.
	 * @param string $id   Node id.
	 * @param object $node Module node.
	 * @param array  $op   Operation.
	 * @return array|WP_Error
	 */
	private static function op_bind_author( $doc, $id, $node, $op ) {
		$key = isset( $node->key ) ? (string) $node->key : '';
		if ( ! in_array( $key, array( 'checkbox_filter', 'dropdown_filter' ), true ) ) {
			return new WP_Error(
				'caf_mcp_not_author_module',
				__( 'Filter by author only works on checkbox_filter or dropdown_filter.', 'category-ajax-filter' )
			);
		}
		if ( ! self::ensure_author_class() ) {
			return new WP_Error(
				'caf_mcp_author_missing',
				__( 'Author filter is not available.', 'category-ajax-filter' ),
				array( 'status' => 500 )
			);
		}
		$post_type = self::layout_post_type( $doc );
		if ( '' === $post_type ) {
			return new WP_Error(
				'caf_mcp_missing_post_type',
				__( 'Layout has no post_type. Set it with caf-manage-layout-settings before binding authors.', 'category-ajax-filter' )
			);
		}
		$wanted = array();
		if ( isset( $op['term_ids'] ) && is_array( $op['term_ids'] ) ) {
			$wanted = $op['term_ids'];
		}
		$group = CAF_Author_Virtual_Taxonomies::get_module_taxonomy_group( $post_type, $wanted );
		if ( ! $group ) {
			return new WP_Error(
				'caf_mcp_no_authors',
				__( 'No authors with published posts for this post type.', 'category-ajax-filter' )
			);
		}
		if ( ! isset( $node->settings ) || ! is_object( $node->settings ) ) {
			$node->settings = new stdClass();
		}
		$node->settings->data_source       = 'taxonomy';
		$node->settings->custom_field_data = array();
		$node->settings->taxonomy_data     = array( $group );
		return array(
			'action'     => 'bind_taxonomy',
			'element_id' => $id,
			'taxonomy'   => CAF_Author_Virtual_Taxonomies::KEY,
			'kind'       => 'author',
			'term_count' => is_array( $group->term_data ) ? count( $group->term_data ) : 0,
		);
	}

	/**
	 * @param object $doc Layout document.
	 * @return string
	 */
	private static function layout_post_type( $doc ) {
		if ( ! is_object( $doc ) || ! isset( $doc->common_data ) || ! is_object( $doc->common_data ) ) {
			return '';
		}
		$type = $doc->common_data->post_type;
		if ( is_array( $type ) ) {
			return sanitize_key( (string) reset( $type ) );
		}
		return sanitize_key( (string) $type );
	}

	/**
	 * Bind a custom / Woo meta key onto checkbox, dropdown, or range slider.
	 *
	 * @param object $doc Layout.
	 * @param string $id Node id.
	 * @param array  $op Operation.
	 * @return array|WP_Error
	 */
	private static function op_bind_custom_field( $doc, $id, $op ) {
		$loc  = self::locate( $doc, $id );
		$node = self::node_at( $doc, $loc );
		if ( ! $node ) {
			return new WP_Error( 'caf_mcp_element_not_found', __( 'No layout node has that id.', 'category-ajax-filter' ) );
		}
		$key = isset( $node->key ) ? (string) $node->key : '';
		if ( ! in_array( $key, array( 'checkbox_filter', 'dropdown_filter', 'range_slider' ), true ) ) {
			return new WP_Error(
				'caf_mcp_not_custom_field_module',
				__( 'bind_custom_field only works on checkbox_filter, dropdown_filter, or range_slider.', 'category-ajax-filter' )
			);
		}
		$meta_key = self::sanitize_meta_key( isset( $op['meta_key'] ) ? $op['meta_key'] : '' );
		if ( '' === $meta_key || '0' === $meta_key ) {
			return new WP_Error(
				'caf_mcp_bad_meta_key',
				__( 'Pass meta_key from GET /mcp/custom-fields.', 'category-ajax-filter' )
			);
		}
		$kind = self::custom_field_kind( $meta_key );
		if ( 'range_slider' === $key && 'woo_text' === $kind ) {
			return new WP_Error(
				'caf_mcp_not_numeric_meta',
				__( 'SKU and other text fields cannot bind to a range slider. Use checkbox_filter or dropdown_filter.', 'category-ajax-filter' )
			);
		}
		$is_range = ( 'range_slider' === $key );
		$row      = (object) array(
			'custom_field_key'        => $meta_key,
			'custom_field_value_list' => array(),
			'compare_operator'        => $is_range ? 'BETWEEN' : '=',
			'meta_type'               => ( $is_range || 'woo_price' === $kind || 'woo_dimension' === $kind ) ? 'NUMERIC' : 'CHAR',
		);
		$value_count = 0;
		if ( ! $is_range ) {
			$values = array();
			if ( isset( $op['values'] ) && is_array( $op['values'] ) ) {
				foreach ( $op['values'] as $raw ) {
					$val = sanitize_text_field( (string) $raw );
					if ( '' !== $val ) {
						$values[ $val ] = true;
					}
				}
			}
			if ( empty( $values ) ) {
				foreach ( self::distinct_meta_values( $doc, $meta_key ) as $val ) {
					$values[ $val ] = true;
				}
			}
			$list = array();
			foreach ( array_keys( $values ) as $val ) {
				$list[] = (object) array(
					'key'       => (string) $val,
					'label'     => (string) $val,
					'icons'     => (object) array(
						'icon'     => '',
						'type'     => 'icon',
						'position' => 'before',
					),
					'predefine' => 'false',
				);
			}
			$row->custom_field_value_list = $list;
			$value_count                  = count( $list );
		}
		if ( ! isset( $node->settings ) || ! is_object( $node->settings ) ) {
			$node->settings = new stdClass();
		}
		$node->settings->data_source       = 'custom_field';
		$node->settings->taxonomy_data     = array();
		$node->settings->custom_field_data = array( $row );

		$out = array(
			'action'       => 'bind_custom_field',
			'element_id'   => $id,
			'meta_key'     => $meta_key,
			'kind'         => $kind,
			'data_source'  => 'custom_field',
			'value_count'  => $value_count,
		);
		if ( $is_range ) {
			self::apply_range_slider_bind( $node, $op, $kind );
			$slider          = isset( $node->settings->range_slider ) && is_object( $node->settings->range_slider )
				? $node->settings->range_slider
				: new stdClass();
			$out['min']      = isset( $slider->min ) ? $slider->min : 0;
			$out['max']      = isset( $slider->max ) ? $slider->max : 100;
			$out['step']     = isset( $slider->step ) ? $slider->step : 1;
		}
		return $out;
	}

	/**
	 * Bind Woo catalog price (_price) onto a range slider.
	 *
	 * @param object $doc Layout.
	 * @param string $id Node id.
	 * @param array  $op Operation.
	 * @return array|WP_Error
	 */
	private static function op_bind_price( $doc, $id, $op ) {
		$loc  = self::locate( $doc, $id );
		$node = self::node_at( $doc, $loc );
		if ( ! $node ) {
			return new WP_Error( 'caf_mcp_element_not_found', __( 'No layout node has that id.', 'category-ajax-filter' ) );
		}
		$key = isset( $node->key ) ? (string) $node->key : '';
		if ( 'range_slider' !== $key ) {
			return new WP_Error(
				'caf_mcp_not_range_slider',
				__( 'bind_price only works on range_slider. Compose a range_slider first.', 'category-ajax-filter' )
			);
		}
		$op['meta_key'] = '_price';
		$result         = self::op_bind_custom_field( $doc, $id, $op );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		$result['action'] = 'bind_price';
		return $result;
	}

	/**
	 * @param object $node Module node.
	 * @param array  $op Operation.
	 * @param string $kind Field kind.
	 * @return void
	 */
	private static function apply_range_slider_bind( $node, $op, $kind ) {
		if ( ! isset( $node->settings->range_slider ) || ! is_object( $node->settings->range_slider ) ) {
			$node->settings->range_slider = new stdClass();
		}
		$slider = $node->settings->range_slider;
		if ( isset( $op['min'] ) && is_numeric( $op['min'] ) ) {
			$slider->min = (float) $op['min'];
		} elseif ( ! isset( $slider->min ) || ! is_numeric( $slider->min ) ) {
			$slider->min = 0;
		}
		if ( isset( $op['max'] ) && is_numeric( $op['max'] ) ) {
			$slider->max = (float) $op['max'];
		} elseif ( ! isset( $slider->max ) || ! is_numeric( $slider->max ) ) {
			$slider->max = 100;
		}
		if ( (float) $slider->max < (float) $slider->min ) {
			$slider->max = $slider->min;
		}
		if ( isset( $op['step'] ) && is_numeric( $op['step'] ) && (float) $op['step'] > 0 ) {
			$slider->step = (float) $op['step'];
		} elseif ( ! isset( $slider->step ) || ! is_numeric( $slider->step ) || (float) $slider->step <= 0 ) {
			$slider->step = 1;
		}
		$prefix = '';
		if ( 'woo_price' === $kind && class_exists( 'CAF_Woo_Filter_Helper', false ) ) {
			$prefix = CAF_Woo_Filter_Helper::get_product_price_currency_symbol();
			if ( method_exists( 'CAF_Woo_Filter_Helper', 'seed_range_slider_prefix_default' ) ) {
				CAF_Woo_Filter_Helper::seed_range_slider_prefix_default( $slider, $prefix );
			}
		} elseif ( 'woo_dimension' === $kind && class_exists( 'CAF_Woo_Filter_Helper', false ) ) {
			$meta = isset( $node->settings->custom_field_data[0]->custom_field_key )
				? (string) $node->settings->custom_field_data[0]->custom_field_key
				: '';
			$prefix = CAF_Woo_Filter_Helper::get_dimension_unit_label( $meta );
			if ( method_exists( 'CAF_Woo_Filter_Helper', 'seed_range_slider_prefix_default' ) ) {
				CAF_Woo_Filter_Helper::seed_range_slider_prefix_default( $slider, $prefix );
			}
		}
		$node->settings->range_slider = $slider;
	}

	/**
	 * @param mixed $raw Raw meta key.
	 * @return string
	 */
	private static function sanitize_meta_key( $raw ) {
		$key = sanitize_text_field( (string) $raw );
		$key = preg_replace( '/[^A-Za-z0-9_\-]/', '', $key );
		return is_string( $key ) ? $key : '';
	}

	/**
	 * @param string $key Meta key.
	 * @return string
	 */
	private static function custom_field_kind( $key ) {
		$key = (string) $key;
		if ( '_price' === $key ) {
			return 'woo_price';
		}
		if ( in_array( $key, array( '_length', '_width', '_height', '_weight' ), true ) ) {
			return 'woo_dimension';
		}
		if ( '_sku' === $key ) {
			return 'woo_text';
		}
		if ( class_exists( 'CAF_Woo_Filter_Helper', false ) ) {
			if ( CAF_Woo_Filter_Helper::WOO_PRICE_META_KEY === $key ) {
				return 'woo_price';
			}
			if ( CAF_Woo_Filter_Helper::is_woo_dimension_meta_key( $key ) ) {
				return 'woo_dimension';
			}
			if ( CAF_Woo_Filter_Helper::WOO_SKU_META_KEY === $key ) {
				return 'woo_text';
			}
		}
		return 'meta';
	}

	/**
	 * @param string $key Meta key.
	 * @return string
	 */
	private static function custom_field_label( $key ) {
		$map = array(
			'_price'  => 'Price',
			'_length' => 'Length',
			'_width'  => 'Width',
			'_height' => 'Height',
			'_weight' => 'Weight',
			'_sku'    => 'SKU',
		);
		return isset( $map[ $key ] ) ? $map[ $key ] : $key;
	}

	/**
	 * Distinct stored meta values for checkbox/dropdown bind (capped).
	 *
	 * @param object $doc Layout.
	 * @param string $meta_key Meta key.
	 * @return array<int, string>
	 */
	private static function distinct_meta_values( $doc, $meta_key ) {
		global $wpdb;
		$lean      = self::lean_settings( $doc );
		$post_type = isset( $lean['post_type'] ) ? sanitize_key( (string) $lean['post_type'] ) : '';
		if ( '' === $post_type || '' === $meta_key || ! isset( $wpdb ) ) {
			return array();
		}
		$raw = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT DISTINCT pm.meta_value
				FROM {$wpdb->postmeta} pm
				INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
				WHERE p.post_type = %s
				AND p.post_status IN ('publish', 'draft', 'pending', 'private')
				AND pm.meta_key = %s
				AND pm.meta_value <> ''
				LIMIT 100",
				$post_type,
				$meta_key
			)
		);
		if ( ! is_array( $raw ) ) {
			return array();
		}
		$out = array();
		foreach ( $raw as $val ) {
			$val = sanitize_text_field( (string) $val );
			if ( '' !== $val ) {
				$out[] = $val;
			}
		}
		return $out;
	}

	/**
	 * @param object $doc Layout.
	 * @param string $id Node id.
	 * @return array|WP_Error
	 */
	private static function op_delete( &$doc, $id ) {
		$loc = self::locate( $doc, $id );
		if ( ! $loc ) {
			return new WP_Error( 'caf_mcp_element_not_found', __( 'No layout node has that id.', 'category-ajax-filter' ) );
		}
		if ( 1 === count( $loc['indexes'] ) ) {
			$rows = self::tree_rows( $doc, $loc['tree'] );
			if ( count( $rows ) < 2 ) {
				return new WP_Error( 'caf_mcp_last_row', __( 'The last row cannot be deleted.', 'category-ajax-filter' ) );
			}
		}
		$removed = self::splice_out( $doc, $loc );
		if ( ! $removed ) {
			return new WP_Error( 'caf_mcp_delete_failed', __( 'That node could not be removed.', 'category-ajax-filter' ) );
		}
		return array(
			'action'     => 'delete',
			'element_id' => $id,
			'type'       => isset( $removed->type ) ? (string) $removed->type : '',
			'key'        => isset( $removed->key ) ? (string) $removed->key : '',
		);
	}

	/**
	 * @param object $doc Layout.
	 * @param string $id Node id.
	 * @return array|WP_Error
	 */
	private static function op_duplicate( &$doc, $id ) {
		$loc  = self::locate( $doc, $id );
		$node = self::node_at( $doc, $loc );
		if ( ! $node ) {
			return new WP_Error( 'caf_mcp_element_not_found', __( 'No layout node has that id.', 'category-ajax-filter' ) );
		}
		if ( isset( $node->key ) && 'search' === (string) $node->key ) {
			return new WP_Error( 'caf_mcp_single_instance', __( 'Search can only appear once on a filter.', 'category-ajax-filter' ) );
		}
		$copy = json_decode( wp_json_encode( $node ) );
		$used = array();
		$n    = 0;
		if ( function_exists( 'caf_ensure_layout_node_ids' ) ) {
			caf_ensure_layout_node_ids( $doc->filter_layout_data->initial_data, $used, false, $n );
			caf_ensure_layout_node_ids( $doc->post_layout_data->initial_data, $used, false, $n );
			$n = 0;
			caf_ensure_layout_node_ids( $copy, $used, true, $n );
		}
		$parent_loc = self::parent_location( $loc );
		$at         = self::splice_in( $doc, $parent_loc, $copy, (int) end( $loc['indexes'] ) + 1 );
		return array(
			'action'      => 'duplicate',
			'element_id'  => $id,
			'new_id'      => isset( $copy->id ) ? (string) $copy->id : '',
			'index'       => $at,
		);
	}

	/**
	 * @param array $loc Location.
	 * @return array Parent location descriptor.
	 */
	private static function parent_location( $loc ) {
		$indexes = $loc['indexes'];
		if ( 1 === count( $indexes ) ) {
			return array(
				'kind' => 'root',
				'tree' => $loc['tree'],
			);
		}
		array_pop( $indexes );
		return array(
			'kind'    => 'node',
			'tree'    => $loc['tree'],
			'indexes' => $indexes,
		);
	}

	/**
	 * @param object     $doc Layout.
	 * @param string     $id Source id.
	 * @param string     $new_parent_id Target parent id, or filter|post|document.
	 * @param int|null   $index Insert index.
	 * @return array|WP_Error
	 */
	private static function op_move( &$doc, $id, $new_parent_id, $index ) {
		$loc  = self::locate( $doc, $id );
		$node = self::node_at( $doc, $loc );
		if ( ! $node ) {
			return new WP_Error( 'caf_mcp_element_not_found', __( 'No layout node has that id.', 'category-ajax-filter' ) );
		}
		$type = isset( $node->type ) ? (string) $node->type : '';
		$dest = self::resolve_move_parent( $doc, $loc, $type, $new_parent_id );
		if ( is_wp_error( $dest ) ) {
			return $dest;
		}

		$source_parent = self::parent_location( $loc );
		$source_index  = (int) end( $loc['indexes'] );
		$removed       = self::splice_out( $doc, $loc );
		if ( ! $removed ) {
			return new WP_Error( 'caf_mcp_move_failed', __( 'That node could not be moved.', 'category-ajax-filter' ) );
		}

		$insert_at = $index;
		if ( self::same_parent( $source_parent, $dest ) && null !== $index && $source_index < (int) $index ) {
			$insert_at = (int) $index - 1;
		}
		$at = self::splice_in( $doc, $dest, $removed, $insert_at );
		return array(
			'action'        => 'move',
			'element_id'    => $id,
			'new_parent_id' => $new_parent_id,
			'index'         => $at,
			'type'          => $type,
		);
	}

	/**
	 * @param array $a Parent loc.
	 * @param array $b Parent loc.
	 * @return bool
	 */
	private static function same_parent( $a, $b ) {
		if ( $a['kind'] !== $b['kind'] || $a['tree'] !== $b['tree'] ) {
			return false;
		}
		if ( 'root' === $a['kind'] ) {
			return true;
		}
		return isset( $a['indexes'], $b['indexes'] ) && $a['indexes'] === $b['indexes'];
	}

	/**
	 * @param object $doc Layout.
	 * @param array  $source_loc Source location.
	 * @param string $type Node type.
	 * @param string $new_parent_id Parent id or filter|post|document.
	 * @return array|WP_Error
	 */
	private static function resolve_move_parent( $doc, $source_loc, $type, $new_parent_id ) {
		$root_alias = array( 'document', 'filter', 'post', 'root' );
		if ( '' === $new_parent_id || in_array( $new_parent_id, $root_alias, true ) ) {
			if ( 'row' !== $type ) {
				return new WP_Error( 'caf_mcp_bad_parent', __( 'Only rows can sit at the layout root.', 'category-ajax-filter' ) );
			}
			$tree = $source_loc['tree'];
			if ( 'filter' === $new_parent_id || 'post' === $new_parent_id ) {
				$tree = $new_parent_id;
			}
			return array(
				'kind' => 'root',
				'tree' => $tree,
			);
		}
		$parent_loc = self::locate( $doc, $new_parent_id );
		$parent     = self::node_at( $doc, $parent_loc );
		if ( ! $parent ) {
			return new WP_Error( 'caf_mcp_parent_not_found', __( 'new_parent_id was not found.', 'category-ajax-filter' ) );
		}
		$parent_type = isset( $parent->type ) ? (string) $parent->type : '';
		$ok          = ( 'module' === $type && 'column' === $parent_type )
			|| ( 'column' === $type && 'row' === $parent_type );
		if ( ! $ok ) {
			return new WP_Error( 'caf_mcp_bad_parent', __( 'A module moves into a column, a column into a row.', 'category-ajax-filter' ) );
		}
		if ( $parent_loc['tree'] !== $source_loc['tree'] ) {
			return new WP_Error( 'caf_mcp_cross_tree', __( 'Filter modules cannot move onto the post card (or the reverse).', 'category-ajax-filter' ) );
		}
		if ( self::is_descendant( $source_loc, $parent_loc ) ) {
			return new WP_Error( 'caf_mcp_into_self', __( 'A node cannot move inside itself.', 'category-ajax-filter' ) );
		}
		return array(
			'kind'    => 'node',
			'tree'    => $parent_loc['tree'],
			'indexes' => $parent_loc['indexes'],
		);
	}

	/**
	 * @param array $ancestor Source loc.
	 * @param array $maybe Parent loc.
	 * @return bool
	 */
	private static function is_descendant( $ancestor, $maybe ) {
		if ( $ancestor['tree'] !== $maybe['tree'] ) {
			return false;
		}
		$a = $ancestor['indexes'];
		$b = $maybe['indexes'];
		if ( count( $b ) <= count( $a ) ) {
			return false;
		}
		foreach ( $a as $i => $val ) {
			if ( $b[ $i ] !== $val ) {
				return false;
			}
		}
		return true;
	}
}

	CAF_MCP::init();
	if ( class_exists( 'CAF_MCP_Http', false ) ) {
		CAF_MCP_Http::init();
	}
	if ( class_exists( 'CAF_MCP_Setup', false ) ) {
		CAF_MCP_Setup::init();
	}
}
