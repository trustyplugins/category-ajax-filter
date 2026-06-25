<?php
/**
 * Bundled import library templates (manifest + JSON layout files).
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Builder_Import_Library {

	const LIBRARY_DIR = 'import-library';

	public static function init() {
		add_action( 'wp_ajax_tc_caf_get_import_library_templates', array( __CLASS__, 'ajax_get_templates' ) );
	}

	/**
	 * @return string
	 */
	protected static function get_plugin_path() {
		if ( defined( 'TC_CAF_PRO_PATH' ) ) {
			return (string) TC_CAF_PRO_PATH;
		}

		if ( defined( 'TC_CAF_PATH' ) ) {
			return (string) TC_CAF_PATH;
		}

		return '';
	}

	/**
	 * @return string
	 */
	protected static function get_plugin_url() {
		if ( defined( 'TC_CAF_PRO_URL' ) ) {
			return (string) TC_CAF_PRO_URL;
		}

		if ( defined( 'TC_CAF_URL' ) ) {
			return (string) TC_CAF_URL;
		}

		return '';
	}

	/**
	 * @return string
	 */
	public static function get_library_path() {
		return trailingslashit( self::get_plugin_path() ) . self::LIBRARY_DIR;
	}

	/**
	 * @return array<int, array<string, mixed>>
	 */
	public static function get_templates() {
		$manifest_path = trailingslashit( self::get_library_path() ) . 'manifest.json';

		if ( ! file_exists( $manifest_path ) || ! is_readable( $manifest_path ) ) {
			return array();
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$manifest_raw = file_get_contents( $manifest_path );
		$manifest     = json_decode( (string) $manifest_raw, true );

		if ( ! is_array( $manifest ) ) {
			return array();
		}

		$templates = array();

		foreach ( $manifest as $entry ) {
			$template = self::build_template_from_manifest_entry( $entry );
			if ( null !== $template ) {
				$templates[] = $template;
			}
		}

		return $templates;
	}

	/**
	 * @param mixed $entry Manifest row.
	 * @return array<string, mixed>|null
	 */
	protected static function build_template_from_manifest_entry( $entry ) {
		if ( ! is_array( $entry ) ) {
			return null;
		}

		$id    = isset( $entry['id'] ) ? sanitize_key( (string) $entry['id'] ) : '';
		$title = isset( $entry['title'] ) ? sanitize_text_field( (string) $entry['title'] ) : '';
		$file  = isset( $entry['file'] ) ? (string) $entry['file'] : '';

		if ( '' === $id || '' === $title || '' === $file ) {
			return null;
		}

		$payload = self::read_template_payload( $file );
		if ( null === $payload ) {
			return null;
		}

		$template = array(
			'id'          => $id,
			'title'       => $title,
			'section'     => isset( $entry['section'] ) ? sanitize_key( (string) $entry['section'] ) : '',
			'scope'       => isset( $entry['scope'] ) ? sanitize_key( (string) $entry['scope'] ) : '',
			'description' => isset( $entry['description'] ) ? sanitize_text_field( (string) $entry['description'] ) : '',
			'payload'     => $payload,
		);

		if ( ! empty( $entry['filterLibraryTab'] ) ) {
			$template['filterLibraryTab'] = sanitize_key( (string) $entry['filterLibraryTab'] );
		}

		if ( ! empty( $entry['preview'] ) ) {
			$preview_url = self::resolve_public_asset_url( (string) $entry['preview'] );
			if ( '' !== $preview_url ) {
				$template['preview'] = $preview_url;
			}
		}

		return $template;
	}

	/**
	 * @param string $relative_file Relative path inside import-library.
	 * @return array<string, mixed>|null
	 */
	protected static function read_template_payload( $relative_file ) {
		$resolved_path = self::resolve_library_file_path( $relative_file );

		if ( null === $resolved_path || ! is_readable( $resolved_path ) ) {
			return null;
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$raw     = file_get_contents( $resolved_path );
		$payload = json_decode( (string) $raw, true );

		return is_array( $payload ) ? $payload : null;
	}

	/**
	 * @param string $relative_file Relative path inside import-library.
	 * @return string|null
	 */
	protected static function resolve_library_file_path( $relative_file ) {
		$relative_file = wp_normalize_path( str_replace( '\\', '/', $relative_file ) );
		$relative_file = ltrim( $relative_file, '/' );

		if ( '' === $relative_file || false !== strpos( $relative_file, '..' ) ) {
			return null;
		}

		$library_root = wp_normalize_path( self::get_library_path() );
		$full_path    = wp_normalize_path( $library_root . '/' . $relative_file );

		if ( 0 !== strpos( $full_path, $library_root ) ) {
			return null;
		}

		return $full_path;
	}

	/**
	 * @param string $relative_file Relative preview asset path.
	 * @return string
	 */
	protected static function resolve_public_asset_url( $relative_file ) {
		$resolved_path = self::resolve_library_file_path( $relative_file );

		if ( null === $resolved_path || ! file_exists( $resolved_path ) ) {
			return '';
		}

		$plugin_url   = trailingslashit( self::get_plugin_url() );
		$library_root = wp_normalize_path( self::get_library_path() );
		$relative     = ltrim( str_replace( $library_root, '', wp_normalize_path( $resolved_path ) ), '/' );

		return $plugin_url . self::LIBRARY_DIR . '/' . $relative;
	}

	public static function ajax_get_templates() {
		check_ajax_referer( 'tc_caf_ajax_nonce', 'nonce' );

		if ( ! current_user_can( 'edit_posts' ) ) {
			wp_send_json_error( array( 'message' => 'Permission denied.' ), 403 );
		}

		$templates = self::get_templates();

		if ( empty( $templates ) ) {
			wp_send_json_error(
				array( 'message' => 'No import library templates found.' ),
				404
			);
		}

		wp_send_json_success( $templates );
	}
}

CAF_Builder_Import_Library::init();
