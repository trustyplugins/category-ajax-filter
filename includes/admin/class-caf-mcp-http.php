<?php
/**
 * Streamable HTTP MCP (JSON-RPC) so Cursor/Claude connect like Elementor:
 * url + Application Password. No Node on the user's machine.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'CAF_MCP_Http', false ) ) {

class CAF_MCP_Http {

	const NS              = 'caf';
	const OPTION_ENABLED  = 'caf_mcp_agent_access';
	const PROTOCOL        = '2025-03-26';

	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_rest_routes' ) );
		if ( did_action( 'rest_api_init' ) ) {
			self::register_rest_routes();
		}
	}

	/**
	 * @return string
	 */
	public static function endpoint_url() {
		return rest_url( self::NS . '/mcp/' );
	}

	/**
	 * @return bool
	 */
	public static function is_enabled() {
		return (bool) get_option( self::OPTION_ENABLED, false );
	}

	public static function register_rest_routes() {
		$args = array(
			'permission_callback' => array( __CLASS__, 'permission' ),
		);
		register_rest_route(
			self::NS,
			'/mcp',
			array(
				array_merge(
					$args,
					array(
						'methods'  => 'POST',
						'callback' => array( __CLASS__, 'handle' ),
					)
				),
				array_merge(
					$args,
					array(
						'methods'  => 'GET',
						'callback' => array( __CLASS__, 'handle_get' ),
					)
				),
			)
		);
	}

	/**
	 * @return bool|WP_Error
	 */
	public static function permission() {
		if ( ! self::is_enabled() ) {
			return new WP_Error(
				'caf_mcp_disabled',
				__( 'CAF MCP is turned off. Enable it under Filters → CAF MCP.', 'category-ajax-filter' ),
				array( 'status' => 403 )
			);
		}
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error(
				'caf_mcp_forbidden',
				__( 'CAF MCP requires an administrator application password.', 'category-ajax-filter' ),
				array( 'status' => 401 )
			);
		}
		return true;
	}

	/**
	 * @return WP_REST_Response
	 */
	public static function handle_get() {
		return new WP_REST_Response(
			array(
				'jsonrpc' => '2.0',
				'error'   => array(
					'code'    => -32000,
					'message' => 'CAF MCP uses Streamable HTTP. POST JSON-RPC to this URL.',
				),
			),
			405
		);
	}

	/**
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public static function handle( $request ) {
		$body = $request->get_json_params();
		if ( ! is_array( $body ) ) {
			return self::rpc_error( null, -32700, 'Parse error' );
		}
		self::maybe_log_request( $body );
		if ( self::is_list( $body ) ) {
			$out = array();
			foreach ( $body as $msg ) {
				$out[] = self::dispatch_message( is_array( $msg ) ? $msg : array() );
			}
			return new WP_REST_Response( $out, 200 );
		}
		$result = self::dispatch_message( $body );
		if ( null === $result ) {
			return new WP_REST_Response( null, 204 );
		}
		return new WP_REST_Response( $result, 200 );
	}

	/**
	 * @param array $body JSON-RPC message or batch.
	 * @return void
	 */
	private static function maybe_log_request( $body ) {
		if ( ! class_exists( 'CAF_MCP_Setup', false ) ) {
			return;
		}
		$messages = self::is_list( $body ) ? $body : array( $body );
		foreach ( $messages as $msg ) {
			if ( ! is_array( $msg ) ) {
				continue;
			}
			$method = isset( $msg['method'] ) ? (string) $msg['method'] : '';
			$tool   = '';
			$args   = array();
			if ( 'tools/call' === $method ) {
				if ( isset( $msg['params']['name'] ) ) {
					$tool = (string) $msg['params']['name'];
				}
				$args = isset( $msg['params']['arguments'] ) && is_array( $msg['params']['arguments'] ) ? $msg['params']['arguments'] : array();
			}
			CAF_MCP_Setup::log_activity( $method, $tool, $args );
		}
	}

	/**
	 * @param array $msg JSON-RPC message.
	 * @return array<string, mixed>|null
	 */
	private static function dispatch_message( $msg ) {
		$method = isset( $msg['method'] ) ? (string) $msg['method'] : '';
		$id     = array_key_exists( 'id', $msg ) ? $msg['id'] : null;
		$params = isset( $msg['params'] ) && is_array( $msg['params'] ) ? $msg['params'] : array();
		$notify = ! array_key_exists( 'id', $msg );

		if ( '' === $method ) {
			return $notify ? null : self::rpc_error_data( $id, -32600, 'Invalid Request' );
		}

		if ( 0 === strpos( $method, 'notifications/' ) ) {
			return null;
		}

		try {
			if ( 'initialize' === $method ) {
				$version = isset( $params['protocolVersion'] ) ? (string) $params['protocolVersion'] : self::PROTOCOL;
				$supported = array( '2024-11-05', '2025-03-26', '2025-11-25' );
				if ( ! in_array( $version, $supported, true ) ) {
					$version = self::PROTOCOL;
				}
				$plugin_ver = defined( 'TC_CAF_PLUGIN_VERSION' ) ? TC_CAF_PLUGIN_VERSION : '0.1.0';
				return self::rpc_result(
					$id,
					array(
						'protocolVersion' => $version,
						'capabilities'    => array(
							'tools'     => array( 'listChanged' => true ),
							'resources' => array( 'listChanged' => true ),
						),
						'serverInfo'      => array(
							'name'    => 'caf-builder',
							'version' => $plugin_ver . '+mcp-free2',
						),
						'instructions'    => 'CAF Free filter builder. Read resource caf://best-practices before writing. Same limits as the Free builder: checkbox, dropdown, search, reset, customtext, range (_price), Free post modules, pagination numbers. No off-canvas, active-filter chips, sorting, result count, query restriction, author filter, or custom-field filters. Prefer action=style or layout-settings css over custom_css; Design-capable CSS in custom_css is folded into Design. Node ids from structure are durable. Before caf-create-layout, ask for post type if the user did not name one (caf-list-post-types). Bind taxonomy only after the user names one.',
					)
				);
			}
			if ( 'ping' === $method ) {
				return self::rpc_result( $id, new stdClass() );
			}
			if ( 'tools/list' === $method ) {
				return self::rpc_result( $id, array( 'tools' => self::tool_defs() ) );
			}
			if ( 'tools/call' === $method ) {
				$name = isset( $params['name'] ) ? (string) $params['name'] : '';
				$args = isset( $params['arguments'] ) && is_array( $params['arguments'] ) ? $params['arguments'] : array();
				return self::rpc_result( $id, self::call_tool( $name, $args ) );
			}
			if ( 'resources/list' === $method ) {
				return self::rpc_result(
					$id,
					array(
						'resources' => array(
							array(
								'uri'         => 'caf://best-practices',
								'name'        => 'best-practices',
								'description' => 'CAF builder rules: create (ask post type, seed Add New starter), ids, compose, bind taxonomy, preview.',
								'mimeType'    => 'text/markdown',
							),
						),
					)
				);
			}
			if ( 'resources/read' === $method ) {
				$uri = isset( $params['uri'] ) ? (string) $params['uri'] : '';
				if ( 'caf://best-practices' !== $uri ) {
					return self::rpc_error_data( $id, -32002, 'Unknown resource' );
				}
				$file = dirname( __DIR__, 2 ) . '/mcp/best-practices.md';
				$text = file_exists( $file ) ? (string) file_get_contents( $file ) : '';
				return self::rpc_result(
					$id,
					array(
						'contents' => array(
							array(
								'uri'      => $uri,
								'mimeType' => 'text/markdown',
								'text'     => $text,
							),
						),
					)
				);
			}
			return self::rpc_error_data( $id, -32601, 'Method not found' );
		} catch ( Exception $e ) {
			return self::rpc_error_data( $id, -32000, $e->getMessage() );
		}
	}

	/**
	 * @param string               $name Tool.
	 * @param array<string, mixed> $args Args.
	 * @return array<string, mixed>
	 */
	private static function call_tool( $name, $args ) {
		if ( ! class_exists( 'CAF_MCP', false ) ) {
			return self::tool_error( 'CAF MCP is not loaded.' );
		}
		try {
			$data = self::run_tool( $name, $args );
		} catch ( Exception $e ) {
			return self::tool_error( $e->getMessage() );
		}
		if ( is_wp_error( $data ) ) {
			$msg      = $data->get_error_message();
			$err_data = $data->get_error_data();
			if ( is_array( $err_data ) ) {
				unset( $err_data['status'] );
				if ( ! empty( $err_data ) ) {
					$msg .= "\n" . wp_json_encode( $err_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
				}
			}
			return self::tool_error( $msg );
		}
		if ( $data instanceof WP_REST_Response ) {
			$status = $data->get_status();
			$payload = $data->get_data();
			if ( $status >= 400 ) {
				$msg = is_array( $payload ) && isset( $payload['message'] ) ? $payload['message'] : wp_json_encode( $payload );
				return self::tool_error( (string) $msg );
			}
			$data = $payload;
		}
		return array(
			'content' => array(
				array(
					'type' => 'text',
					'text' => wp_json_encode( $data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ),
				),
			),
		);
	}

	/**
	 * @param string               $name Tool.
	 * @param array<string, mixed> $args Args.
	 * @return mixed
	 */
	private static function run_tool( $name, $args ) {
		if ( class_exists( 'CAF_MCP_Tier', false ) && ! CAF_MCP_Tier::is_allowed_tool( $name ) ) {
			throw new Exception( CAF_MCP_Tier::pro_only_message( $name ) );
		}
		switch ( $name ) {
			case 'caf-list-layouts':
				$req = new WP_REST_Request( 'GET' );
				if ( ! empty( $args['include_trash'] ) ) {
					$req->set_param( 'include_trash', true );
				}
				return CAF_MCP::rest_list_layouts( $req );
			case 'caf-duplicate-layout':
				$req = new WP_REST_Request( 'POST' );
				$req->set_url_params( array( 'layout_id' => isset( $args['layout_id'] ) ? $args['layout_id'] : '' ) );
				return CAF_MCP::rest_duplicate_layout( $req );
			case 'caf-trash-layout':
				$req = new WP_REST_Request( 'POST' );
				$req->set_url_params( array( 'layout_id' => isset( $args['layout_id'] ) ? $args['layout_id'] : '' ) );
				return CAF_MCP::rest_trash_layout( $req );
			case 'caf-restore-layout':
				$req = new WP_REST_Request( 'POST' );
				$req->set_url_params( array( 'layout_id' => isset( $args['layout_id'] ) ? $args['layout_id'] : '' ) );
				return CAF_MCP::rest_restore_layout( $req );
			case 'caf-delete-layout':
				return self::post_layout( 'rest_delete_layout_permanent', $args );
			case 'caf-manage-query-restriction':
				return self::post_layout( 'rest_update_query_restriction', $args );
			case 'caf-manage-filter-query':
				return self::post_layout( 'rest_update_filter_query', $args );
			case 'caf-export-layout':
				$req = new WP_REST_Request( 'GET' );
				$req->set_url_params( array( 'layout_id' => isset( $args['layout_id'] ) ? $args['layout_id'] : '' ) );
				if ( ! empty( $args['scope'] ) ) {
					$req->set_param( 'scope', $args['scope'] );
				}
				return CAF_MCP::rest_export_layout( $req );
			case 'caf-import-layout':
				if ( empty( $args['layout_id'] ) ) {
					$req = new WP_REST_Request( 'POST' );
					$req->set_header( 'content-type', 'application/json' );
					$req->set_body( wp_json_encode( $args ) );
					return CAF_MCP::rest_import_new_layout( $req );
				}
				return self::post_layout( 'rest_import_into_layout', $args );
			case 'caf-list-revisions':
				$req = new WP_REST_Request( 'GET' );
				$req->set_url_params( array( 'layout_id' => isset( $args['layout_id'] ) ? $args['layout_id'] : '' ) );
				return CAF_MCP::rest_list_revisions( $req );
			case 'caf-restore-revision':
				return self::post_layout( 'rest_restore_revision', $args );
			case 'caf-list-posts':
				$req = new WP_REST_Request( 'GET' );
				$req->set_param( 'post_type', isset( $args['post_type'] ) ? $args['post_type'] : '' );
				if ( ! empty( $args['search'] ) ) {
					$req->set_param( 'search', $args['search'] );
				}
				if ( isset( $args['limit'] ) ) {
					$req->set_param( 'limit', (int) $args['limit'] );
				}
				return CAF_MCP::rest_list_posts( $req );
			case 'caf-manage-layout-settings':
				return self::post_layout( 'rest_update_layout_settings', $args );
			case 'caf-build-post':
				return self::post_layout( 'rest_build_post', $args );
			case 'caf-create-layout':
				$req = new WP_REST_Request( 'POST' );
				$req->set_param( 'label', isset( $args['label'] ) ? $args['label'] : '' );
				if ( ! empty( $args['post_type'] ) ) {
					$req->set_param( 'post_type', $args['post_type'] );
				}
				if ( ! empty( $args['taxonomy'] ) ) {
					$req->set_param( 'taxonomy', $args['taxonomy'] );
				}
				if ( ! empty( $args['status'] ) ) {
					$req->set_param( 'status', $args['status'] );
				}
				return CAF_MCP::rest_create_layout( $req );
			case 'caf-rename-layout':
				$req = new WP_REST_Request( 'POST' );
				$req->set_url_params( array( 'layout_id' => isset( $args['layout_id'] ) ? $args['layout_id'] : '' ) );
				if ( array_key_exists( 'label', $args ) ) {
					$req->set_param( 'label', $args['label'] );
				}
				if ( array_key_exists( 'status', $args ) ) {
					$req->set_param( 'status', $args['status'] );
				}
				return CAF_MCP::rest_update_layout( $req );
			case 'caf-list-post-types':
				return CAF_MCP::rest_list_post_types();
			case 'caf-list-module-schemas':
				$req = new WP_REST_Request( 'GET' );
				$req->set_param( 'summary', ! isset( $args['summary'] ) || $args['summary'] );
				if ( ! empty( $args['tree'] ) ) {
					$req->set_param( 'tree', $args['tree'] );
				}
				return CAF_MCP::rest_list_module_schemas( $req );
			case 'caf-get-module-schema':
				$req = new WP_REST_Request( 'GET' );
				$req->set_url_params( array( 'module_key' => isset( $args['module_key'] ) ? $args['module_key'] : '' ) );
				return CAF_MCP::rest_get_module_schema( $req );
			case 'caf-get-layout-structure':
				$req = new WP_REST_Request( 'GET' );
				$req->set_url_params( array( 'layout_id' => isset( $args['layout_id'] ) ? $args['layout_id'] : '' ) );
				if ( ! empty( $args['element_id'] ) ) {
					$req->set_param( 'element_id', $args['element_id'] );
				}
				if ( ! empty( $args['include_content'] ) ) {
					$req->set_param( 'include_content', true );
				}
				return CAF_MCP::rest_get_structure( $req );
			case 'caf-list-taxonomies':
				$req = new WP_REST_Request( 'GET' );
				$req->set_param( 'post_type', isset( $args['post_type'] ) ? $args['post_type'] : '' );
				if ( ! empty( $args['search'] ) ) {
					$req->set_param( 'search', $args['search'] );
				}
				if ( isset( $args['limit'] ) ) {
					$req->set_param( 'limit', (int) $args['limit'] );
				}
				return CAF_MCP::rest_list_taxonomies( $req );
			case 'caf-list-custom-fields':
				$req = new WP_REST_Request( 'GET' );
				$req->set_param( 'post_type', isset( $args['post_type'] ) ? $args['post_type'] : '' );
				return CAF_MCP::rest_list_custom_fields( $req );
			case 'caf-list-woo-attributes':
				$req = new WP_REST_Request( 'GET' );
				$req->set_param( 'post_type', isset( $args['post_type'] ) ? $args['post_type'] : 'product' );
				if ( ! empty( $args['search'] ) ) {
					$req->set_param( 'search', $args['search'] );
				}
				if ( isset( $args['limit'] ) ) {
					$req->set_param( 'limit', (int) $args['limit'] );
				}
				return CAF_MCP::rest_list_woo_attributes( $req );
			case 'caf-get-price-range':
				return CAF_MCP::rest_get_price_range();
			case 'caf-list-media':
				$req = new WP_REST_Request( 'GET' );
				if ( ! empty( $args['search'] ) ) {
					$req->set_param( 'search', $args['search'] );
				}
				if ( isset( $args['limit'] ) ) {
					$req->set_param( 'limit', (int) $args['limit'] );
				}
				return CAF_MCP::rest_list_media( $req );
			case 'caf-manage-modules':
				return self::post_layout( 'rest_manage_modules', $args );
			case 'caf-build-filter':
				return self::post_layout( 'rest_build_filter', $args );
			case 'caf-create-preview-link':
				$req = new WP_REST_Request( 'POST' );
				$req->set_url_params( array( 'layout_id' => isset( $args['layout_id'] ) ? $args['layout_id'] : '' ) );
				return CAF_MCP::rest_create_preview( $req );
			default:
				throw new Exception( 'Unknown tool: ' . $name );
		}
	}

	/**
	 * @param string               $method CAF_MCP method.
	 * @param array<string, mixed> $args Args.
	 * @return mixed
	 */
	private static function post_layout( $method, $args ) {
		$layout_id = isset( $args['layout_id'] ) ? $args['layout_id'] : '';
		$body      = $args;
		unset( $body['layout_id'] );
		$req = new WP_REST_Request( 'POST' );
		$req->set_header( 'content-type', 'application/json' );
		$req->set_body( wp_json_encode( $body ) );
		$req->set_url_params( array( 'layout_id' => $layout_id ) );
		return CAF_MCP::$method( $req );
	}

	/**
	 * @return array<int, array<string, mixed>>
	 */
	private static function tool_defs() {
		$empty = array(
			'type'       => 'object',
			'properties' => new stdClass(),
		);
		$tools = array(
			self::tool(
				'caf-list-layouts',
				'List CAF builder layouts. Pick layout_id (caf_N) from the label the user named. Read caf://best-practices first.',
				array(
					'type'       => 'object',
					'properties' => array(
						'include_trash' => array( 'type' => 'boolean', 'description' => 'Include trashed layouts' ),
					),
				)
			),
			self::tool(
				'caf-create-layout',
				'Create a new CAF filter with the same starter as UI Add New (search, unbound checkbox, reset, post card, pagination). Requires post_type — same as the Add New modal. If the user did not name a post type, call caf-list-post-types and ASK before creating. Infer product for shop/Woo/products; do not default to post. Optional taxonomy binds the checkbox; if omitted, ask after create then bind_taxonomy. Do not guess product_cat on a post filter. Returns layout_id, shortcode, backend_url, frontend_url, seeded modules, taxonomies, next_step. Default status is draft.',
				array(
					'type'       => 'object',
					'required'   => array( 'label' ),
					'properties' => array(
						'label'     => array( 'type' => 'string', 'description' => 'Filter name, e.g. Shop filters' ),
						'post_type' => array( 'type' => 'string', 'description' => 'CPT slug from caf-list-post-types. Required. Ask the user if unknown.' ),
						'taxonomy'  => array( 'type' => 'string', 'description' => 'Optional taxonomy slug to bind on the starter checkbox, or author / __caf_author. Omit and ask if unknown.' ),
						'status'    => array( 'type' => 'string', 'enum' => array( 'draft', 'publish' ) ),
					),
				)
			),
			self::tool(
				'caf-rename-layout',
				'Rename a filter or set draft/publish. layout_id and shortcode stay the same.',
				array(
					'type'       => 'object',
					'required'   => array( 'layout_id' ),
					'properties' => array(
						'layout_id' => array( 'type' => 'string', 'description' => 'caf_N from caf-list-layouts' ),
						'label'     => array( 'type' => 'string', 'description' => 'New filter name' ),
						'status'    => array( 'type' => 'string', 'enum' => array( 'draft', 'publish' ) ),
					),
				)
			),
			self::tool(
				'caf-duplicate-layout',
				'Duplicate a filter as a new draft. Returns a new layout_id and shortcode.',
				array(
					'type'       => 'object',
					'required'   => array( 'layout_id' ),
					'properties' => array(
						'layout_id' => array( 'type' => 'string' ),
					),
				)
			),
			self::tool(
				'caf-trash-layout',
				'Move a filter to trash. Restore with caf-restore-layout. Does not delete permanently.',
				array(
					'type'       => 'object',
					'required'   => array( 'layout_id' ),
					'properties' => array(
						'layout_id' => array( 'type' => 'string' ),
					),
				)
			),
			self::tool(
				'caf-restore-layout',
				'Restore a trashed filter as draft. Pass include_trash on caf-list-layouts to see trash.',
				array(
					'type'       => 'object',
					'required'   => array( 'layout_id' ),
					'properties' => array(
						'layout_id' => array( 'type' => 'string' ),
					),
				)
			),
			self::tool(
				'caf-delete-layout',
				'Permanently delete a TRASHED filter. Requires confirm=true. Irreversible. Trash first with caf-trash-layout.',
				array(
					'type'       => 'object',
					'required'   => array( 'layout_id', 'confirm' ),
					'properties' => array(
						'layout_id' => array( 'type' => 'string' ),
						'confirm'   => array( 'type' => 'boolean', 'description' => 'Must be true' ),
					),
				)
			),
			self::tool(
				'caf-manage-query-restriction',
				'Limit the result pool: include/exclude terms or posts, plus Category/Term Page Mode. Do not hand-write query_restriction JSON.',
				array(
					'type'       => 'object',
					'required'   => array( 'layout_id' ),
					'properties' => array(
						'layout_id'          => array( 'type' => 'string' ),
						'dry_run'            => array( 'type' => 'boolean' ),
						'enabled'            => array( 'type' => 'boolean' ),
						'clear'              => array( 'type' => 'boolean' ),
						'taxonomy_relation'  => array( 'type' => 'string', 'enum' => array( 'AND', 'OR' ) ),
						'include'            => array( 'type' => 'object' ),
						'exclude'            => array( 'type' => 'object' ),
						'term_page_mode'     => array( 'type' => 'object' ),
					),
				)
			),
			self::tool(
				'caf-manage-filter-query',
				'Layout-level custom-field query conditions (always-on meta query). Pass conditions [{meta_key, value, compare}] or groups. clear=true resets. Do not hand-write filter_query_data.',
				array(
					'type'       => 'object',
					'required'   => array( 'layout_id' ),
					'properties' => array(
						'layout_id'     => array( 'type' => 'string' ),
						'dry_run'       => array( 'type' => 'boolean' ),
						'clear'         => array( 'type' => 'boolean' ),
						'meta_relation' => array( 'type' => 'string', 'enum' => array( 'AND', 'OR' ) ),
						'conditions'    => array( 'type' => 'array', 'items' => array( 'type' => 'object' ) ),
						'groups'        => array( 'type' => 'array' ),
						'custom_field'  => array( 'type' => 'boolean' ),
					),
				)
			),
			self::tool(
				'caf-export-layout',
				'Export layout JSON (full, filter, post, or layout_settings). Pass the document to caf-import-layout.',
				array(
					'type'       => 'object',
					'required'   => array( 'layout_id' ),
					'properties' => array(
						'layout_id' => array( 'type' => 'string' ),
						'scope'     => array( 'type' => 'string', 'enum' => array( 'full', 'filter', 'post', 'layout_settings' ) ),
					),
				)
			),
			self::tool(
				'caf-import-layout',
				'Import exported CAF JSON. Omit layout_id to create a new draft. Pass layout_id to write onto an existing filter. mode=merge appends modules instead of replacing the tree. scope=layout_settings copies placement/Misc only.',
				array(
					'type'       => 'object',
					'required'   => array( 'document' ),
					'properties' => array(
						'document'  => array( 'type' => 'object' ),
						'layout_id' => array( 'type' => 'string' ),
						'label'     => array( 'type' => 'string' ),
						'scope'     => array( 'type' => 'string', 'enum' => array( 'full', 'filter', 'post', 'layout_settings' ) ),
						'mode'      => array( 'type' => 'string', 'enum' => array( 'replace', 'merge' ) ),
						'dry_run'   => array( 'type' => 'boolean' ),
					),
				)
			),
			self::tool(
				'caf-list-revisions',
				'List the last 5 MCP write snapshots for a layout (poll token is separate).',
				array(
					'type'       => 'object',
					'required'   => array( 'layout_id' ),
					'properties' => array(
						'layout_id' => array( 'type' => 'string' ),
					),
				)
			),
			self::tool(
				'caf-restore-revision',
				'Restore one MCP snapshot by revision number. Creates a new snapshot of the restored document.',
				array(
					'type'       => 'object',
					'required'   => array( 'layout_id', 'revision' ),
					'properties' => array(
						'layout_id' => array( 'type' => 'string' ),
						'revision'  => array( 'type' => 'integer' ),
					),
				)
			),
			self::tool(
				'caf-list-posts',
				'Lean posts for query-restriction include/exclude by posts. Then pass post_ids to caf-manage-query-restriction.',
				array(
					'type'       => 'object',
					'required'   => array( 'post_type' ),
					'properties' => array(
						'post_type' => array( 'type' => 'string' ),
						'search'    => array( 'type' => 'string' ),
						'limit'     => array( 'type' => 'integer' ),
					),
				)
			),
			self::tool(
				'caf-manage-layout-settings',
				'Last-screen Layout Settings + Misc. Active filters (selected chips): selected_enable=true and selected_zone=post_top (above posts) or filter_top (inside the filter / off-canvas panel). Also result_count_enable, sorting_enable, pagination_enable + *_zone. Off-canvas: filter_position=floating + float_button_position=bottom-left|bottom-right|top-left|top-right. Settings: columns, masonry, order, no_result, loader_*, float_button, animation_type. Design: css or target=container|filter|post|post_inner|float|loader. Prefer css over custom_css; Design-capable custom_css is folded into Design. Fine-tune cards with caf-manage-modules on preview:dnd:*.',
				array(
					'type'       => 'object',
					'required'   => array( 'layout_id' ),
					'properties' => array(
						'layout_id'              => array( 'type' => 'string' ),
						'dry_run'                => array( 'type' => 'boolean' ),
						'post_type'              => array( 'type' => 'string' ),
						'posts_per_page'         => array( 'type' => 'integer' ),
						'order'                  => array( 'type' => 'string', 'enum' => array( 'ASC', 'DESC' ) ),
						'orderby'                => array( 'type' => 'string' ),
						'filter_position'        => array( 'type' => 'string', 'enum' => array( 'inline', 'left', 'right', 'top', 'bottom', 'floating' ), 'description' => 'Desktop. floating = off-canvas. Must be floating for a desktop Filter button; mobile-only floating leaves desktop inline.' ),
						'filter_position_mobile' => array( 'type' => 'string', 'enum' => array( 'inline', 'left', 'right', 'top', 'bottom', 'floating' ) ),
						'float_button_position'  => array( 'type' => 'string', 'enum' => array( 'bottom-left', 'bottom-right', 'top-left', 'top-right' ), 'description' => 'Pin the off-canvas Filter button (fixed while scrolling). Turns desktop Floating on.' ),
						'animation_type'         => array( 'type' => 'string', 'enum' => array( 'slide-left-right', 'slide-right-left', 'slide-top-bottom', 'slide-bottom-top' ), 'description' => 'Off-canvas panel slide. Default follows float_button_position.' ),
						'selected_enable'        => array( 'type' => 'boolean', 'description' => 'Show active-filter chips (Layout Control Selected). Chips appear after a visitor picks a term.' ),
						'selected_zone'          => array( 'type' => 'string', 'enum' => array( 'post_top', 'post_bottom', 'filter_top', 'filter_bottom' ), 'description' => 'Where to put active-filter chips. post_top = above the posts; filter_top = inside the filter panel (off-canvas). Turns the card on.' ),
						'selected_close_button'  => array( 'type' => 'boolean', 'description' => 'Show the × on each selected chip.' ),
						'result_count_enable'    => array( 'type' => 'boolean' ),
						'result_count_zone'      => array( 'type' => 'string', 'enum' => array( 'post_top', 'post_bottom', 'filter_top', 'filter_bottom' ) ),
						'sorting_enable'         => array( 'type' => 'boolean' ),
						'sorting_zone'           => array( 'type' => 'string', 'enum' => array( 'post_top', 'post_bottom', 'filter_top', 'filter_bottom' ) ),
						'pagination_enable'      => array( 'type' => 'boolean', 'description' => 'Layout Control pagination card (not the post-tree module).' ),
						'pagination_zone'        => array( 'type' => 'string', 'enum' => array( 'post_top', 'post_bottom', 'filter_top', 'filter_bottom' ) ),
						'layout_source'          => array( 'type' => 'string', 'enum' => array( 'caf_builder', 'main_query' ) ),
						'pagination_type'        => array( 'type' => 'string', 'enum' => array( 'number', 'number2', 'load-more', 'button', 'infinite-scroll' ) ),
						'analytics'              => array( 'type' => 'boolean' ),
						'filter_url'             => array( 'type' => 'boolean' ),
						'schema'                 => array( 'type' => 'boolean' ),
						'dynamic_term_counts'    => array( 'type' => 'boolean' ),
						'global_font_family'     => array( 'type' => 'string', 'description' => 'e.g. DM Sans' ),
						'preview_post_id'        => array( 'type' => 'integer', 'description' => 'Builder canvas post. 0 clears. Use caf-list-posts.' ),
						'columns'                => array( 'type' => 'integer', 'description' => 'Desktop post columns 1–6 (last-screen Settings).' ),
						'columns_tablet'         => array( 'type' => 'integer' ),
						'columns_mobile'         => array( 'type' => 'integer' ),
						'layout_type'            => array( 'type' => 'string', 'enum' => array( 'grid', 'slider', 'list' ) ),
						'masonry'                => array( 'type' => 'boolean' ),
						'no_result'              => array( 'type' => 'string' ),
						'column_gap'             => array( 'type' => 'string' ),
						'row_gap'                => array( 'type' => 'string' ),
						'target'                 => array( 'type' => 'string', 'description' => 'Last-screen layer: container, filter, post, post_inner, float, loader. css without target styles the outer wrapper.' ),
						'css'                    => array( 'type' => 'string', 'description' => 'Design CSS for target (default container). Example: background-color: transparent;' ),
						'device'                 => array( 'type' => 'string', 'enum' => array( 'desktop', 'tablet', 'mobile' ) ),
						'custom_class'           => array( 'type' => 'string' ),
						'custom_css'             => array( 'type' => 'string', 'description' => 'Only for selectors/properties Design cannot store. Prefer css. Design-capable CSS is folded into Design and stripped from custom_css.' ),
						'nonce'                  => array( 'type' => 'boolean' ),
						'scroll_enable'          => array( 'type' => 'boolean' ),
						'scroll_position'        => array( 'type' => 'string' ),
						'container_background'   => array( 'type' => 'string', 'description' => 'Outer wrapper background, e.g. transparent.' ),
						'container_width'        => array( 'type' => 'string' ),
						'filter_width'           => array( 'type' => 'string' ),
						'loader_enable'          => array( 'type' => 'boolean' ),
						'loader_text'            => array( 'type' => 'string' ),
						'float_button'           => array( 'type' => 'boolean' ),
						'float_button_value'     => array( 'type' => 'string', 'description' => 'Off-canvas trigger label (default Filter).' ),
						'float_icon'             => array( 'type' => 'boolean' ),
						'float_icon_value'       => array( 'type' => 'string' ),
					),
				)
			),
			self::tool(
				'caf-get-layout-structure',
				'Lean CAF layout tree (filter, post, preview). preview[] is last-screen layers (preview:container outer wrapper) plus Layout Control zones/cards (preview:dnd:filter_top, preview:dnd:selected, …).',
				array(
					'type'       => 'object',
					'required'   => array( 'layout_id' ),
					'properties' => array(
						'layout_id'       => array( 'type' => 'string', 'description' => 'caf_N from caf-list-layouts' ),
						'element_id'      => array( 'type' => 'string', 'description' => 'Optional durable node id' ),
						'include_content' => array( 'type' => 'boolean', 'description' => 'Include module settings' ),
					),
				)
			),
			self::tool(
				'caf-list-module-schemas',
				'Discover allowed CAF module types. tree=filter (default), post, or layout (settings, query restriction, filter query, row/column).',
				array(
					'type'       => 'object',
					'properties' => array(
						'summary' => array( 'type' => 'boolean', 'description' => 'Default true' ),
						'tree'    => array( 'type' => 'string', 'enum' => array( 'filter', 'post', 'layout' ) ),
					),
				)
			),
			self::tool(
				'caf-get-module-schema',
				'Full JSON schema for one module key.',
				array(
					'type'       => 'object',
					'required'   => array( 'module_key' ),
					'properties' => array(
						'module_key' => array( 'type' => 'string' ),
					),
				)
			),
			self::tool(
				'caf-list-post-types',
				'Public post types this site can filter.',
				$empty
			),
			self::tool(
				'caf-list-taxonomies',
				'Lean taxonomies and terms for a post type. pa_* product attributes have kind=attribute. Filter by author is kind=author key=__caf_author (alias taxonomy=author). Bind with action=bind_taxonomy on checkbox or dropdown — not a WP taxonomy, not range_slider.',
				array(
					'type'       => 'object',
					'required'   => array( 'post_type' ),
					'properties' => array(
						'post_type' => array( 'type' => 'string' ),
						'search'    => array( 'type' => 'string' ),
						'limit'     => array( 'type' => 'integer' ),
					),
				)
			),
			self::tool(
				'caf-list-custom-fields',
				'Builder-visible custom / Woo meta keys for a post type. Then bind with caf-manage-modules action=bind_custom_field (meta_key). _price uses bind_price on range_slider.',
				array(
					'type'       => 'object',
					'required'   => array( 'post_type' ),
					'properties' => array(
						'post_type' => array( 'type' => 'string' ),
					),
				)
			),
			self::tool(
				'caf-list-woo-attributes',
				'WooCommerce pa_* attributes and terms. Bind with caf-manage-modules action=bind_taxonomy (taxonomy=pa_color).',
				array(
					'type'       => 'object',
					'properties' => array(
						'post_type' => array( 'type' => 'string', 'description' => 'Default product' ),
						'search'    => array( 'type' => 'string' ),
						'limit'     => array( 'type' => 'integer' ),
					),
				)
			),
			self::tool(
				'caf-get-price-range',
				'Woo price slider defaults (min 0, max 100, currency). Then bind_price on a range_slider id.',
				$empty
			),
			self::tool(
				'caf-list-media',
				'Media Library icons (svg/png/jpg). Search by title, filename, or attachment id. Then set_term_visual with attachment_id.',
				array(
					'type'       => 'object',
					'properties' => array(
						'search' => array( 'type' => 'string', 'description' => 'Title, filename, or numeric attachment id' ),
						'limit'  => array( 'type' => 'integer' ),
					),
				)
			),
			self::tool(
				'caf-manage-modules',
				'Surgical writes. action: update, move, delete, duplicate, style, layout (row/column or last-screen preview:* Design → Layout), bind_taxonomy (including taxonomy=author / __caf_author on checkbox or dropdown), bind_custom_field, bind_price, set_term_visual. Last-screen Outer Wrapper is element_id=preview:container. Show active-filter chips: action=update element_id=preview:dnd:selected is_enable=true (or caf-manage-layout-settings selected_enable). Move into preview:dnd:post_top (above posts) or preview:dnd:filter_top (inside the filter / off-canvas panel). Same enable/move for result_count, sorting, pagination. Design look: action=style + css (not custom_css). custom_css only when Design has no control; Design-capable CSS in custom_css is folded into Design. Always send element_id.',
				array(
					'type'       => 'object',
					'required'   => array( 'layout_id', 'operations' ),
					'properties' => array(
						'layout_id'  => array( 'type' => 'string' ),
						'dry_run'    => array( 'type' => 'boolean' ),
						'operations' => array( 'type' => 'array', 'items' => array( 'type' => 'object' ) ),
					),
				)
			),
			self::tool(
				'caf-build-post',
				'Insert a JSON post/card tree (image, title, excerpt, button, Woo, pagination). configuration_id only; parent_id omit/post = rows.',
				array(
					'type'       => 'object',
					'required'   => array( 'layout_id', 'structure' ),
					'properties' => array(
						'layout_id'  => array( 'type' => 'string' ),
						'parent_id'  => array( 'type' => 'string' ),
						'mode'       => array( 'type' => 'string', 'enum' => array( 'append', 'replace_children' ) ),
						'index'      => array( 'type' => 'integer' ),
						'dry_run'    => array( 'type' => 'boolean' ),
						'structure'  => array( 'type' => 'array', 'items' => array( 'type' => 'object' ) ),
					),
				)
			),
			self::tool(
				'caf-build-filter',
				'Insert a JSON filter tree. configuration_id only; server mints durable ids. parent_id omit/filter = rows.',
				array(
					'type'       => 'object',
					'required'   => array( 'layout_id', 'structure' ),
					'properties' => array(
						'layout_id'  => array( 'type' => 'string' ),
						'parent_id'  => array( 'type' => 'string' ),
						'mode'       => array( 'type' => 'string', 'enum' => array( 'append', 'replace_children' ) ),
						'index'      => array( 'type' => 'integer' ),
						'dry_run'    => array( 'type' => 'boolean' ),
						'structure'  => array( 'type' => 'array', 'items' => array( 'type' => 'object' ) ),
					),
				)
			),
			self::tool(
				'caf-create-preview-link',
				'Return backend_url (admin builder) and frontend_url (1-hour public shortcode). Call when the user asks for a preview link.',
				array(
					'type'       => 'object',
					'required'   => array( 'layout_id' ),
					'properties' => array(
						'layout_id' => array( 'type' => 'string' ),
					),
				)
			),
		);
		return class_exists( 'CAF_MCP_Tier', false ) ? CAF_MCP_Tier::filter_tool_defs( $tools ) : $tools;
	}

	/**
	 * @param string               $name Name.
	 * @param string               $description Description.
	 * @param array<string, mixed> $schema JSON schema.
	 * @return array<string, mixed>
	 */
	private static function tool( $name, $description, $schema ) {
		return array(
			'name'        => $name,
			'description' => $description,
			'inputSchema' => $schema,
		);
	}

	/**
	 * @param mixed $id RPC id.
	 * @param mixed $result Result.
	 * @return array<string, mixed>
	 */
	private static function rpc_result( $id, $result ) {
		return array(
			'jsonrpc' => '2.0',
			'id'      => $id,
			'result'  => $result,
		);
	}

	/**
	 * @param mixed  $id Id.
	 * @param int    $code Code.
	 * @param string $message Message.
	 * @return WP_REST_Response
	 */
	private static function rpc_error( $id, $code, $message ) {
		return new WP_REST_Response( self::rpc_error_data( $id, $code, $message ), 200 );
	}

	/**
	 * @param mixed  $id Id.
	 * @param int    $code Code.
	 * @param string $message Message.
	 * @return array<string, mixed>
	 */
	private static function rpc_error_data( $id, $code, $message ) {
		return array(
			'jsonrpc' => '2.0',
			'id'      => $id,
			'error'   => array(
				'code'    => $code,
				'message' => $message,
			),
		);
	}

	/**
	 * @param string $message Message.
	 * @return array<string, mixed>
	 */
	private static function tool_error( $message ) {
		return array(
			'content' => array(
				array(
					'type' => 'text',
					'text' => $message,
				),
			),
			'isError' => true,
		);
	}

	/**
	 * @param array $arr Array.
	 * @return bool
	 */
	private static function is_list( $arr ) {
		if ( array() === $arr ) {
			return false;
		}
		return array_keys( $arr ) === range( 0, count( $arr ) - 1 );
	}
}

}
