<?php
/**
 * Import library templates — remote API only (trustyplugins.com).
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Builder_Import_Library {

	const DEFAULT_API_BASE = 'https://trustyplugins.com/wp-json/caf/v1';

	const FREE_TIER_LICENSE_KEY = 'caf-free-tier';

	const CACHE_LIST_PREFIX = 'caf_import_library_list_v5_';

	const CACHE_PAYLOAD_PREFIX = 'caf_import_library_payload_v5_';

	const CACHE_VERSION_PREFIX = 'caf_import_library_version_v5_';

	const DEFAULT_LIST_CACHE_TTL = DAY_IN_SECONDS;

	const DEFAULT_PAYLOAD_CACHE_TTL = 259200;

	const REMOTE_UNCHANGED = '__unchanged__';

	public static function init() {
		add_action( 'wp_ajax_tc_caf_get_import_library_templates', array( __CLASS__, 'ajax_get_templates' ) );
		add_action( 'wp_ajax_tc_caf_get_import_library_template', array( __CLASS__, 'ajax_get_template' ) );
		add_action( 'admin_post_CategoryAjaxFilterPro_el_activate_license', array( __CLASS__, 'clear_template_cache' ), 20 );
		add_action( 'admin_post_CategoryAjaxFilterPro_el_deactivate_license', array( __CLASS__, 'clear_template_cache' ), 20 );
	}

	protected static function get_api_base_url() {
		if ( defined( 'CAF_IMPORT_LIBRARY_API_BASE' ) ) {
			return untrailingslashit( (string) CAF_IMPORT_LIBRARY_API_BASE );
		}

		return untrailingslashit( (string) apply_filters( 'caf_import_library_api_base', self::DEFAULT_API_BASE ) );
	}

	protected static function get_list_cache_ttl() {
		$ttl = (int) apply_filters( 'caf_import_library_cache_ttl', self::DEFAULT_LIST_CACHE_TTL );

		return max( 300, $ttl );
	}

	protected static function get_payload_cache_ttl() {
		$ttl = (int) apply_filters( 'caf_import_library_payload_cache_ttl', self::DEFAULT_PAYLOAD_CACHE_TTL );

		return max( 300, $ttl );
	}

	protected static function is_remote_enabled() {
		if ( ! apply_filters( 'caf_import_library_use_remote', true ) ) {
			return false;
		}

		return '' !== self::get_api_base_url();
	}

	protected static function get_client_site_url() {
		return untrailingslashit( home_url( '/' ) );
	}

	protected static function get_client_license_key() {
		if ( class_exists( 'CAF_Pro_License' ) ) {
			$key = CAF_Pro_License::get_stored_license_key();
			if ( '' !== $key ) {
				return $key;
			}
		}

		if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::is_pro() ) {
			if ( defined( 'CAF_IMPORT_LIBRARY_FREE_LICENSE_KEY' ) && '' !== CAF_IMPORT_LIBRARY_FREE_LICENSE_KEY ) {
				return (string) CAF_IMPORT_LIBRARY_FREE_LICENSE_KEY;
			}

			return self::FREE_TIER_LICENSE_KEY;
		}

		return '';
	}

	protected static function get_request_user_agent() {
		if ( class_exists( 'CAF_Builder_Tier' ) && CAF_Builder_Tier::is_pro() ) {
			$version = defined( 'TC_CAF_PRO_PLUGIN_VERSION' ) ? TC_CAF_PRO_PLUGIN_VERSION : '10.0';

			return 'CAF-Pro/' . $version;
		}

		$version = defined( 'TC_CAF_PLUGIN_VERSION' ) ? TC_CAF_PLUGIN_VERSION : '3.0';

		return 'CAF-Free/' . $version;
	}

	protected static function get_cache_scope_hash() {
		$license_key   = self::get_client_license_key();
		$license_valid = class_exists( 'CAF_Pro_License' ) && CAF_Pro_License::can_use_feature( 'import_library' );

		return md5( self::get_client_site_url() . '|' . $license_key . '|' . ( $license_valid ? '1' : '0' ) );
	}

	protected static function get_list_cache_key() {
		return self::CACHE_LIST_PREFIX . self::get_cache_scope_hash();
	}

	protected static function get_version_cache_key() {
		return self::CACHE_VERSION_PREFIX . self::get_cache_scope_hash();
	}

	protected static function get_payload_cache_key( $template_id ) {
		return self::CACHE_PAYLOAD_PREFIX . self::get_cache_scope_hash() . '_' . sanitize_key( (string) $template_id );
	}

	protected static function get_cached_manifest_version() {
		$version = get_transient( self::get_version_cache_key() );

		return is_string( $version ) ? $version : '';
	}

	/**
	 * @param string                               $manifest_version Remote manifest version.
	 * @param array<int, array<string, mixed>>     $templates        Template list.
	 * @return void
	 */
	protected static function store_list_cache( $manifest_version, $templates ) {
		set_transient( self::get_list_cache_key(), $templates, self::get_list_cache_ttl() );

		if ( '' !== $manifest_version ) {
			set_transient( self::get_version_cache_key(), $manifest_version, self::get_list_cache_ttl() );
		}
	}

	/**
	 * @return array<int, array<string, mixed>>
	 */
	public static function get_templates() {
		if ( ! self::is_remote_enabled() ) {
			return array();
		}

		$cached          = get_transient( self::get_list_cache_key() );
		$cached_version  = self::get_cached_manifest_version();
		$cached_templates = is_array( $cached ) ? $cached : array();

		if ( ! empty( $cached_templates ) && '' !== $cached_version ) {
			$remote = self::fetch_remote_templates( false, '', $cached_version );

			if ( self::REMOTE_UNCHANGED === $remote ) {
				return $cached_templates;
			}

			if ( is_array( $remote ) && ! empty( $remote ) ) {
				return $remote;
			}

			return $cached_templates;
		}

		$templates = self::fetch_remote_templates( false, '', '' );

		return is_array( $templates ) ? $templates : array();
	}

	/**
	 * @param string $template_id Template ID.
	 * @return array<string, mixed>|null
	 */
	public static function get_template( $template_id ) {
		if ( ! self::is_remote_enabled() ) {
			return null;
		}

		$template_id = sanitize_key( (string) $template_id );

		if ( '' === $template_id ) {
			return null;
		}

		$cached = get_transient( self::get_payload_cache_key( $template_id ) );

		if ( is_array( $cached ) && ! empty( $cached['payload'] ) && is_array( $cached['payload'] ) ) {
			return $cached;
		}

		$templates = self::fetch_remote_templates( true, $template_id, '' );

		if ( empty( $templates ) || ! is_array( $templates ) ) {
			return null;
		}

		$template = $templates[0];

		if ( ! empty( $template['payload'] ) && is_array( $template['payload'] ) ) {
			set_transient( self::get_payload_cache_key( $template_id ), $template, self::get_payload_cache_ttl() );
		}

		return $template;
	}

	protected static function should_expose_fetch_diagnostics() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}

		if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
			return true;
		}

		return (bool) apply_filters( 'caf_import_library_expose_fetch_diagnostics', false );
	}

	/** @var array<string, mixed>|null */
	protected static $last_fetch_error = null;

	public static function get_last_fetch_error() {
		return self::$last_fetch_error;
	}

	protected static function fail_remote_fetch( $message, $context = array() ) {
		self::$last_fetch_error = array_merge(
			array(
				'message' => $message,
			),
			$context
		);

		return array();
	}

	/**
	 * @param bool   $include_payload Whether to include template JSON payloads.
	 * @param string $template_id     Optional single-template ID.
	 * @param string $manifest_version Client manifest version for conditional list fetch.
	 * @return array<int, array<string, mixed>>|string
	 */
	protected static function fetch_remote_templates( $include_payload = false, $template_id = '', $manifest_version = '' ) {
		self::$last_fetch_error = null;

		$api_base    = self::get_api_base_url();
		$license_key = self::get_client_license_key();
		$site_url    = self::get_client_site_url();

		if ( '' === $license_key ) {
			return self::fail_remote_fetch(
				'License key is missing on this site. Please activate your CAF PRO license.',
				array( 'code' => 'missing_license_key' )
			);
		}

		$timestamp = (string) time();

		$query_args = array(
			'include_payload' => $include_payload ? '1' : '0',
			'license_key'     => $license_key,
			'site_url'        => $site_url,
		);

		if ( ! $include_payload && '' === sanitize_key( (string) $template_id ) && '' !== (string) $manifest_version ) {
			$query_args['client_manifest_version'] = (string) $manifest_version;
		}

		$template_id = sanitize_key( (string) $template_id );

		if ( '' !== $template_id ) {
			$endpoint = $api_base . '/library/templates/' . rawurlencode( $template_id );
		} else {
			$endpoint = $api_base . '/library/templates';
		}

		$url = add_query_arg( $query_args, $endpoint );

		$response = wp_remote_get(
			$url,
			array(
				'timeout' => $include_payload ? 60 : 30,
				'headers' => array(
					'X-CAF-Timestamp'   => $timestamp,
					'X-CAF-License-Key' => $license_key,
					'X-CAF-Site-Url'    => $site_url,
					'User-Agent'        => self::get_request_user_agent(),
				),
			)
		);

		if ( is_wp_error( $response ) ) {
			return self::fail_remote_fetch(
				$response->get_error_message(),
				array(
					'code'    => $response->get_error_code(),
					'api_url' => $url,
				)
			);
		}

		$code     = (int) wp_remote_retrieve_response_code( $response );
		$raw_body = (string) wp_remote_retrieve_body( $response );
		$decoded  = self::decode_remote_json_body( $raw_body );
		$body     = $decoded['body'];

		$server_code   = is_array( $body ) && isset( $body['code'] ) ? (string) $body['code'] : '';
		$server_msg    = is_array( $body ) && isset( $body['message'] ) ? (string) $body['message'] : '';
		$response_hint = self::describe_http_response( $code, $server_code, $raw_body );

		if ( 200 !== $code ) {
			return self::fail_remote_fetch(
				$response_hint,
				array(
					'http_code'      => $code,
					'server_code'    => $server_code,
					'server_message' => $server_msg,
					'api_url'        => $url,
				)
			);
		}

		if ( is_array( $body ) && ! empty( $body['unchanged'] ) ) {
			return self::REMOTE_UNCHANGED;
		}

		$remote_manifest_version = is_array( $body ) && ! empty( $body['manifest_version'] )
			? sanitize_text_field( (string) $body['manifest_version'] )
			: '';

		$templates = self::extract_templates_from_response( $body, $raw_body );

		if ( null === $templates ) {
			return self::fail_remote_fetch(
				'Library server returned an unexpected response format.',
				array(
					'http_code'    => $code,
					'api_url'      => $url,
					'body_length'  => strlen( $raw_body ),
					'json_error'   => $decoded['error'],
					'body_preview' => self::preview_response_body( $raw_body ),
				)
			);
		}

		$templates = self::normalize_templates( $templates );

		if ( empty( $templates ) ) {
			return self::fail_remote_fetch(
				'Library server returned templates, but none could be parsed.',
				array(
					'http_code'          => $code,
					'raw_template_count' => is_array( $body ) && isset( $body['data'] ) && is_array( $body['data'] ) ? count( $body['data'] ) : 0,
					'api_url'            => $url,
				)
			);
		}

		if ( ! $include_payload && '' === $template_id && '' !== $remote_manifest_version ) {
			self::store_list_cache( $remote_manifest_version, $templates );
		}

		return $templates;
	}

	protected static function decode_remote_json_body( $raw_body ) {
		$raw_body = ltrim( (string) $raw_body, "\xEF\xBB\xBF" );

		if ( '' === $raw_body ) {
			return array(
				'body'  => null,
				'error' => 'empty_body',
			);
		}

		$decode_flags = defined( 'JSON_INVALID_UTF8_SUBSTITUTE' ) ? JSON_INVALID_UTF8_SUBSTITUTE : 0;
		$body         = json_decode( $raw_body, true, 2048, $decode_flags );
		$error        = JSON_ERROR_NONE === json_last_error() ? '' : json_last_error_msg();

		return array(
			'body'  => $body,
			'error' => $error,
		);
	}

	/**
	 * @param mixed  $body     Decoded JSON body.
	 * @param string $raw_body Raw HTTP body.
	 * @return array<int, array<string, mixed>>|null
	 */
	protected static function extract_templates_from_response( $body, $raw_body ) {
		if ( is_array( $body ) && ! empty( $body['success'] ) && is_array( $body['data'] ) ) {
			if ( self::is_list_array( $body['data'] ) ) {
				return $body['data'];
			}

			return array( $body['data'] );
		}

		if ( is_array( $body ) && self::is_list_array( $body ) ) {
			return $body;
		}

		if ( is_string( $raw_body ) && '<' === substr( ltrim( $raw_body ), 0, 1 ) ) {
			return null;
		}

		return null;
	}

	protected static function is_list_array( $value ) {
		if ( ! is_array( $value ) ) {
			return false;
		}

		if ( array() === $value ) {
			return true;
		}

		return array_keys( $value ) === range( 0, count( $value ) - 1 );
	}

	protected static function preview_response_body( $raw_body ) {
		$preview = preg_replace( '/\s+/', ' ', trim( (string) $raw_body ) );

		if ( ! is_string( $preview ) ) {
			return '';
		}

		if ( strlen( $preview ) > 240 ) {
			return substr( $preview, 0, 240 ) . '...';
		}

		return $preview;
	}

	protected static function describe_http_response( $http_code, $server_code, $raw_body ) {
		if ( 401 === $http_code ) {
			if ( 'caf_tl_auth_invalid_license' === $server_code ) {
				return 'Authentication failed: license is not valid for this site. Please activate your CAF PRO license.';
			}
			if ( 'caf_tl_auth_missing' === $server_code ) {
				return 'Authentication failed: missing license key or site URL.';
			}
			if ( 'caf_tl_auth_expired' === $server_code ) {
				return 'Authentication failed: request timestamp expired (check server clock/timezone).';
			}

			return 'Authentication failed (HTTP 401). Please verify your license is active for this domain.';
		}

		if ( 403 === $http_code && false !== stripos( $raw_body, 'cloudflare' ) ) {
			return 'Request blocked by Cloudflare (HTTP 403). Whitelist wp-json/caf/v1/* or disable bot protection for REST API.';
		}

		if ( 429 === $http_code ) {
			return 'Rate limit exceeded on the library server (HTTP 429). Try again later.';
		}

		if ( 404 === $http_code ) {
			return 'No templates found on the library server (HTTP 404). Check manifest.json on trustyplugins.com.';
		}

		if ( $server_code ) {
			return sprintf( 'Library server error (HTTP %1$d): %2$s', $http_code, $server_code );
		}

		return sprintf( 'Library server returned HTTP %d.', $http_code );
	}

	protected static function normalize_templates( $templates ) {
		$normalized = array();

		foreach ( $templates as $template ) {
			if ( ! is_array( $template ) ) {
				continue;
			}

			$id = isset( $template['id'] ) ? sanitize_key( (string) $template['id'] ) : '';
			if ( '' === $id ) {
				continue;
			}

			$template['id'] = $id;

			if ( ! empty( $template['preview'] ) ) {
				$template['preview'] = esc_url_raw( (string) $template['preview'] );
			}

			$normalized[] = $template;
		}

		return $normalized;
	}

	public static function clear_template_cache() {
		$cached = get_transient( self::get_list_cache_key() );

		if ( is_array( $cached ) ) {
			foreach ( $cached as $template ) {
				if ( is_array( $template ) && ! empty( $template['id'] ) ) {
					delete_transient( self::get_payload_cache_key( (string) $template['id'] ) );
				}
			}
		}

		delete_transient( self::get_list_cache_key() );
		delete_transient( self::get_version_cache_key() );
	}

	protected static function verify_library_ajax_request() {
		check_ajax_referer( 'tc_caf_ajax_nonce', 'nonce' );

		if (
			class_exists( 'CAF_Pro_License' )
			&& class_exists( 'CAF_Builder_Tier' )
			&& CAF_Builder_Tier::is_pro()
			&& ! CAF_Pro_License::can_use_feature( 'import_library' )
		) {
			wp_send_json_error( array( 'message' => 'CAF PRO license is not active.' ), 403 );
		}

		if ( ! current_user_can( 'edit_posts' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied.' ), 403 );
		}

		if ( ! self::is_remote_enabled() ) {
			wp_send_json_error(
				array( 'message' => 'Import library API is not configured.' ),
				500
			);
		}

		return true;
	}

	protected static function send_fetch_error_response() {
		$error_payload = array(
			'message' => 'Could not load templates from the library server. Please try again later.',
		);

		if ( self::should_expose_fetch_diagnostics() ) {
			$fetch_error = self::get_last_fetch_error();
			if ( is_array( $fetch_error ) && ! empty( $fetch_error ) ) {
				$error_payload['diagnostics'] = $fetch_error;
				if ( ! empty( $fetch_error['message'] ) ) {
					$error_payload['message'] = (string) $fetch_error['message'];
				}
			}
		}

		wp_send_json_error( $error_payload, 502 );
	}

	public static function ajax_get_templates() {
		self::verify_library_ajax_request();

		$templates = self::get_templates();

		if ( empty( $templates ) ) {
			self::send_fetch_error_response();
		}

		wp_send_json_success(
			array(
				'templates'        => $templates,
				'manifest_version' => self::get_cached_manifest_version(),
				'cached'           => false !== get_transient( self::get_list_cache_key() ),
			)
		);
	}

	public static function ajax_get_template() {
		self::verify_library_ajax_request();

		$template_id = isset( $_POST['template_id'] ) ? sanitize_key( wp_unslash( (string) $_POST['template_id'] ) ) : '';

		if ( '' === $template_id ) {
			wp_send_json_error( array( 'message' => 'Template ID is required.' ), 400 );
		}

		$template = self::get_template( $template_id );

		if ( empty( $template ) || empty( $template['payload'] ) || ! is_array( $template['payload'] ) ) {
			self::send_fetch_error_response();
		}

		wp_send_json_success( $template );
	}
}

CAF_Builder_Import_Library::init();
