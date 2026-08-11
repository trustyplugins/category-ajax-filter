<?php
/**
 * Import library templates — local bundled files (Free).
 *
 * Free never calls trustyplugins.com. Pro uses the remote library handler.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Builder_Import_Library {

	public static function init() {
		add_action( 'wp_ajax_tc_caf_get_import_library_templates', array( __CLASS__, 'ajax_get_templates' ) );
		add_action( 'wp_ajax_tc_caf_get_import_library_template', array( __CLASS__, 'ajax_get_template' ) );
	}

	/**
	 * Absolute path to the bundled import-library directory.
	 *
	 * @return string
	 */
	protected static function get_library_root() {
		$root = trailingslashit( TC_CAF_PATH ) . 'import-library';

		return (string) apply_filters( 'caf_import_library_local_root', $root );
	}

	/**
	 * Public URL base for bundled import-library assets (previews).
	 *
	 * @return string
	 */
	protected static function get_library_url() {
		$url = trailingslashit( TC_CAF_URL ) . 'import-library';

		return untrailingslashit( (string) apply_filters( 'caf_import_library_local_url', $url ) );
	}

	/**
	 * @return string
	 */
	protected static function get_manifest_path() {
		return trailingslashit( self::get_library_root() ) . 'manifest.json';
	}

	/**
	 * @return array<string, mixed>|null
	 */
	protected static function read_manifest() {
		$path = self::get_manifest_path();
		if ( ! is_readable( $path ) ) {
			return null;
		}

		$raw = file_get_contents( $path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		if ( false === $raw || '' === $raw ) {
			return null;
		}

		if ( 0 === strncmp( $raw, "\xEF\xBB\xBF", 3 ) ) {
			$raw = substr( $raw, 3 );
		}

		$decoded = json_decode( $raw, true );
		return is_array( $decoded ) ? $decoded : null;
	}

	/**
	 * Resolve a relative library path safely under import-library/.
	 *
	 * @param string $relative Relative path from manifest.
	 * @return string Absolute path or empty string.
	 */
	protected static function resolve_library_path( $relative ) {
		$relative = str_replace( '\\', '/', (string) $relative );
		$relative = ltrim( $relative, '/' );
		if ( '' === $relative || false !== strpos( $relative, '..' ) ) {
			return '';
		}

		$root = wp_normalize_path( trailingslashit( self::get_library_root() ) );
		$path = wp_normalize_path( $root . $relative );

		if ( 0 !== strpos( $path, $root ) ) {
			return '';
		}

		return $path;
	}

	/**
	 * Convert a relative preview path to a plugin URL.
	 *
	 * @param string $preview Relative preview path or absolute URL.
	 * @return string
	 */
	protected static function resolve_preview_url( $preview ) {
		$preview = (string) $preview;
		if ( '' === $preview ) {
			return '';
		}

		if ( preg_match( '#^https?://#i', $preview ) ) {
			return esc_url_raw( $preview );
		}

		$relative = ltrim( str_replace( '\\', '/', $preview ), '/' );
		if ( '' === $relative || false !== strpos( $relative, '..' ) ) {
			return '';
		}

		return esc_url_raw( trailingslashit( self::get_library_url() ) . $relative );
	}

	/**
	 * @return array<int, array<string, mixed>>
	 */
	public static function get_templates() {
		$manifest = self::read_manifest();
		if ( ! is_array( $manifest ) || empty( $manifest['templates'] ) || ! is_array( $manifest['templates'] ) ) {
			return array();
		}

		$templates = array();
		foreach ( $manifest['templates'] as $template ) {
			if ( ! is_array( $template ) ) {
				continue;
			}

			$id = isset( $template['id'] ) ? sanitize_key( (string) $template['id'] ) : '';
			if ( '' === $id ) {
				continue;
			}

			$row = array(
				'id'          => $id,
				'title'       => isset( $template['title'] ) ? sanitize_text_field( (string) $template['title'] ) : $id,
				'section'     => isset( $template['section'] ) ? sanitize_key( (string) $template['section'] ) : '',
				'scope'       => isset( $template['scope'] ) ? sanitize_key( (string) $template['scope'] ) : '',
				'description' => isset( $template['description'] ) ? sanitize_text_field( (string) $template['description'] ) : '',
				'tier'        => 'free',
			);

			if ( ! empty( $template['filterLibraryTab'] ) ) {
				$row['filterLibraryTab'] = sanitize_key( (string) $template['filterLibraryTab'] );
			}
			if ( ! empty( $template['layoutSettingsLibraryTab'] ) ) {
				$row['layoutSettingsLibraryTab'] = sanitize_key( (string) $template['layoutSettingsLibraryTab'] );
			}
			if ( ! empty( $template['preview'] ) ) {
				$preview = self::resolve_preview_url( (string) $template['preview'] );
				if ( '' !== $preview ) {
					$row['preview'] = $preview;
				}
			}

			$templates[] = $row;
		}

		return $templates;
	}

	/**
	 * @param string $template_id Template ID.
	 * @return array<string, mixed>|null
	 */
	public static function get_template( $template_id ) {
		$template_id = sanitize_key( (string) $template_id );
		if ( '' === $template_id ) {
			return null;
		}

		$manifest = self::read_manifest();
		if ( ! is_array( $manifest ) || empty( $manifest['templates'] ) || ! is_array( $manifest['templates'] ) ) {
			return null;
		}

		$file_rel = '';
		$meta     = null;
		foreach ( $manifest['templates'] as $template ) {
			if ( ! is_array( $template ) ) {
				continue;
			}
			$id = isset( $template['id'] ) ? sanitize_key( (string) $template['id'] ) : '';
			if ( $id !== $template_id ) {
				continue;
			}
			$meta     = $template;
			$file_rel = isset( $template['file'] ) ? (string) $template['file'] : ( 'templates/' . $id . '.json' );
			break;
		}

		if ( ! $meta || '' === $file_rel ) {
			return null;
		}

		$path = self::resolve_library_path( $file_rel );
		if ( '' === $path || ! is_readable( $path ) ) {
			return null;
		}

		$raw = file_get_contents( $path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		if ( false === $raw || '' === $raw ) {
			return null;
		}

		if ( 0 === strncmp( $raw, "\xEF\xBB\xBF", 3 ) ) {
			$raw = substr( $raw, 3 );
		}

		$decoded = json_decode( $raw, true );
		if ( ! is_array( $decoded ) ) {
			return null;
		}

		$payload = null;
		if ( isset( $decoded['payload'] ) && is_array( $decoded['payload'] ) ) {
			$payload = $decoded['payload'];
		} elseif ( isset( $decoded['common_data'] ) || isset( $decoded['filter_layout_data'] ) || isset( $decoded['post_layout_data'] ) || isset( $decoded['module_data'] ) ) {
			$payload = $decoded;
		}

		if ( ! is_array( $payload ) || empty( $payload ) ) {
			return null;
		}

		$row = array(
			'id'          => $template_id,
			'title'       => isset( $meta['title'] ) ? sanitize_text_field( (string) $meta['title'] ) : $template_id,
			'section'     => isset( $meta['section'] ) ? sanitize_key( (string) $meta['section'] ) : '',
			'scope'       => isset( $meta['scope'] ) ? sanitize_key( (string) $meta['scope'] ) : '',
			'description' => isset( $meta['description'] ) ? sanitize_text_field( (string) $meta['description'] ) : '',
			'tier'        => 'free',
			'payload'     => $payload,
		);

		if ( ! empty( $meta['filterLibraryTab'] ) ) {
			$row['filterLibraryTab'] = sanitize_key( (string) $meta['filterLibraryTab'] );
		}
		if ( ! empty( $meta['layoutSettingsLibraryTab'] ) ) {
			$row['layoutSettingsLibraryTab'] = sanitize_key( (string) $meta['layoutSettingsLibraryTab'] );
		}
		if ( ! empty( $meta['preview'] ) ) {
			$preview = self::resolve_preview_url( (string) $meta['preview'] );
			if ( '' !== $preview ) {
				$row['preview'] = $preview;
			}
		}

		return $row;
	}

	protected static function verify_library_ajax_request() {
		check_ajax_referer( 'tc_caf_ajax_nonce', 'nonce' );

		if ( ! current_user_can( 'edit_posts' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied.' ), 403 );
		}

		return true;
	}

	public static function ajax_get_templates() {
		self::verify_library_ajax_request();

		$templates = self::get_templates();
		$manifest  = self::read_manifest();
		$version   = is_array( $manifest ) && ! empty( $manifest['manifest_version'] )
			? sanitize_text_field( (string) $manifest['manifest_version'] )
			: '';

		wp_send_json_success(
			array(
				'templates'        => $templates,
				'manifest_version' => $version,
				'cached'           => true,
				'source'           => 'local',
			)
		);
	}

	public static function ajax_get_template() {
		self::verify_library_ajax_request();

		$template_id = isset( $_POST['template_id'] ) ? sanitize_key( wp_unslash( $_POST['template_id'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing
		$template    = self::get_template( $template_id );

		if ( ! $template || empty( $template['payload'] ) ) {
			wp_send_json_error( array( 'message' => 'Template payload is not available.' ), 404 );
		}

		wp_send_json_success( $template );
	}
}

CAF_Builder_Import_Library::init();
