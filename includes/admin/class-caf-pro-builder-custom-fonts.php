<?php
/**
 * Builder custom font upload registry.
 *
 * @package TC_CAF_PRO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_PRO_Builder_Custom_Fonts {

	const OPTION_KEY     = 'caf_builder_custom_fonts';
	const UPLOAD_SUBDIR  = 'caf-builder-fonts';
	const MAX_FILE_BYTES = 5242880; // 5 MB.

	/**
	 * Allowed font extensions and MIME types.
	 *
	 * @return array<string,string>
	 */
	public static function get_allowed_mimes() {
		return array(
			'ttf' => 'application/x-font-ttf',
		);
	}

	/**
	 * Extra MIME aliases WordPress finfo may return for TTF files.
	 *
	 * @return array<int,string>
	 */
	protected static function get_allowed_mime_aliases() {
		return array(
			'font/ttf',
			'application/x-font-ttf',
			'application/font-sfnt',
			'font/sfnt',
		);
	}

	/**
	 * @param string $ext Extension.
	 * @param string $mime MIME type.
	 * @return bool
	 */
	protected static function is_allowed_font_mime( $ext, $mime ) {
		$ext  = strtolower( (string) $ext );
		$mime = strtolower( (string) $mime );

		if ( 'ttf' !== $ext ) {
			return false;
		}

		if ( '' === $mime ) {
			return true;
		}

		$aliases = array_merge(
			array( strtolower( self::get_allowed_mimes()['ttf'] ) ),
			array_map( 'strtolower', self::get_allowed_mime_aliases() )
		);

		return in_array( $mime, $aliases, true );
	}

	/**
	 * @param string $header First four file bytes.
	 * @return bool
	 */
	protected static function is_ttf_signature( $header ) {
		return "\x00\x01\x00\x00" === $header || 'true' === $header || 'typ1' === $header;
	}

	/**
	 * Detect font container format from file signature.
	 *
	 * @param string $file_path File path.
	 * @return string
	 */
	protected static function detect_format_from_signature( $file_path ) {
		$handle = fopen( $file_path, 'rb' );
		if ( ! $handle ) {
			return '';
		}

		$header = fread( $handle, 4 );
		fclose( $handle );

		if ( false === $header || strlen( $header ) < 4 ) {
			return '';
		}

		if ( self::is_ttf_signature( $header ) ) {
			return 'ttf';
		}
		if ( 'wOF2' === $header ) {
			return 'woff2';
		}
		if ( 'wOFF' === $header ) {
			return 'woff';
		}
		if ( 'OTTO' === $header ) {
			return 'otf';
		}
		if ( 'ttcf' === $header ) {
			return 'ttc';
		}

		return '';
	}

	/**
	 * Resolve extension/MIME for uploaded font files.
	 *
	 * WordPress MIME detection is unreliable for fonts on some hosts, so fall back
	 * to filename + magic-byte validation.
	 *
	 * @param string $file_path Temp file path.
	 * @param string $original_name Original filename.
	 * @return array{ext:string,type:string}|WP_Error
	 */
	protected static function resolve_uploaded_font_type( $file_path, $original_name ) {
		$allowed   = self::get_allowed_mimes();
		$filetype  = wp_check_filetype_and_ext( $file_path, $original_name, $allowed );
		$ext       = strtolower( (string) ( $filetype['ext'] ?? '' ) );
		$mime      = strtolower( (string) ( $filetype['type'] ?? '' ) );
		$signature = self::detect_format_from_signature( $file_path );

		if ( 'ttc' === $signature ) {
			return new WP_Error(
				'caf_font_collection_unsupported',
				__( 'TrueType Collection (.ttc) fonts are not supported. Please upload a single TTF file.', 'category-ajax-filter-pro' ),
				array( 'status' => 400 )
			);
		}

		if ( in_array( $signature, array( 'otf', 'woff', 'woff2' ), true ) ) {
			return new WP_Error(
				'caf_font_invalid_type',
				__( 'Only TTF font files are supported.', 'category-ajax-filter-pro' ),
				array( 'status' => 400 )
			);
		}

		if ( 'ttf' === $ext && self::is_allowed_font_mime( 'ttf', $mime ) && 'ttf' === $signature ) {
			return array(
				'ext'  => 'ttf',
				'type' => $allowed['ttf'],
			);
		}

		$filename_ext = strtolower( pathinfo( $original_name, PATHINFO_EXTENSION ) );
		if ( 'ttf' === $filename_ext && 'ttf' === $signature ) {
			return array(
				'ext'  => 'ttf',
				'type' => $allowed['ttf'],
			);
		}

		if ( 'ttf' === $signature ) {
			return array(
				'ext'  => 'ttf',
				'type' => $allowed['ttf'],
			);
		}

		return new WP_Error(
			'caf_font_invalid_type',
			__( 'Invalid font file type. Only TTF files are supported.', 'category-ajax-filter-pro' ),
			array( 'status' => 400 )
		);
	}

	/**
	 * @return array<string,array<string,mixed>>
	 */
	public static function get_registry() {
		$stored = get_option( self::OPTION_KEY, array() );
		return is_array( $stored ) ? $stored : array();
	}

	/**
	 * @param array<string,array<string,mixed>> $registry Registry.
	 * @return void
	 */
	protected static function save_registry( $registry ) {
		update_option( self::OPTION_KEY, $registry, false );
	}

	/**
	 * Family name => CSS URL map for client/runtime loaders.
	 *
	 * @return array<string,string>
	 */
	public static function get_family_css_map() {
		$map      = array();
		$registry = self::get_registry();

		foreach ( $registry as $entry ) {
			if ( empty( $entry['family'] ) || empty( $entry['css_url'] ) ) {
				continue;
			}
			$map[ (string) $entry['family'] ] = esc_url_raw( (string) $entry['css_url'] );
		}

		return $map;
	}

	/**
	 * @param string $family Font family.
	 * @return string
	 */
	public static function get_css_url_for_family( $family ) {
		$family = trim( (string) $family );
		if ( '' === $family ) {
			return '';
		}

		$map = self::get_family_css_map();
		return isset( $map[ $family ] ) ? $map[ $family ] : '';
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	public static function get_fonts_for_api() {
		$items    = array();
		$registry = self::get_registry();

		foreach ( $registry as $slug => $entry ) {
			if ( empty( $entry['family'] ) ) {
				continue;
			}

			$items[] = array(
				'slug'    => sanitize_key( $slug ),
				'family'  => (string) $entry['family'],
				'css_url' => isset( $entry['css_url'] ) ? esc_url_raw( (string) $entry['css_url'] ) : '',
				'format'  => isset( $entry['format'] ) ? sanitize_key( (string) $entry['format'] ) : '',
				'weight'  => isset( $entry['weight'] ) ? sanitize_text_field( (string) $entry['weight'] ) : '400',
				'style'   => isset( $entry['style'] ) ? sanitize_key( (string) $entry['style'] ) : 'normal',
				'created' => isset( $entry['created'] ) ? absint( $entry['created'] ) : 0,
			);
		}

		usort(
			$items,
			static function ( $a, $b ) {
				return strcasecmp( (string) $a['family'], (string) $b['family'] );
			}
		);

		return $items;
	}

	/**
	 * @param string $family Font family label.
	 * @return string|WP_Error
	 */
	protected static function validate_family_name( $family ) {
		$family = trim( sanitize_text_field( (string) $family ) );
		$family = preg_replace( '/\s+/u', ' ', $family );

		if ( strlen( $family ) < 2 || strlen( $family ) > 80 ) {
			return new WP_Error(
				'caf_invalid_font_family',
				__( 'Font family name must be between 2 and 80 characters.', 'category-ajax-filter-pro' ),
				array( 'status' => 400 )
			);
		}

		if ( ! preg_match( '/^[\p{L}\p{N}\s\-\'\.]+$/u', $family ) ) {
			return new WP_Error(
				'caf_invalid_font_family',
				__( 'Font family name contains invalid characters.', 'category-ajax-filter-pro' ),
				array( 'status' => 400 )
			);
		}

		return $family;
	}

	/**
	 * @param string $file_path Absolute file path.
	 * @param string $ext File extension.
	 * @return bool
	 */
	/**
	 * @param string $data Binary string.
	 * @param int    $offset Offset.
	 * @return int
	 */
	protected static function read_uint16_be( $data, $offset ) {
		$chunk = substr( $data, $offset, 2 );
		if ( 2 !== strlen( $chunk ) ) {
			return 0;
		}
		$unpack = unpack( 'n', $chunk );
		return $unpack ? (int) $unpack[1] : 0;
	}

	/**
	 * @param string $data Binary string.
	 * @param int    $offset Offset.
	 * @return int
	 */
	protected static function read_uint32_be( $data, $offset ) {
		$chunk = substr( $data, $offset, 4 );
		if ( 4 !== strlen( $chunk ) ) {
			return 0;
		}
		$unpack = unpack( 'N', $chunk );
		return $unpack ? (int) $unpack[1] : 0;
	}

	/**
	 * @param string $filename Original filename.
	 * @return string
	 */
	protected static function family_from_filename( $filename ) {
		$base = pathinfo( sanitize_file_name( (string) $filename ), PATHINFO_FILENAME );
		$base = preg_replace(
			'/(?:^|[\s._-])(regular|normal|bold|italic|oblique|light|medium|semibold|thin|black|extra(?:bold|light)?|condensed|book|roman|mt|ps)(?:$|[\s._-])/i',
			' ',
			$base
		);
		$base = preg_replace( '/[-_.]+/', ' ', (string) $base );
		$base = trim( preg_replace( '/\s+/u', ' ', (string) $base ) );

		return $base;
	}

	/**
	 * @param string $raw Raw name bytes.
	 * @param int    $platform Platform ID.
	 * @param int    $encoding Encoding ID.
	 * @return string
	 */
	protected static function decode_name_record( $raw, $platform, $encoding ) {
		if ( 3 === $platform || ( 0 === $platform && $encoding >= 1 ) ) {
			$decoded = function_exists( 'mb_convert_encoding' )
				? mb_convert_encoding( $raw, 'UTF-8', 'UTF-16BE' )
				: $raw;
			return trim( preg_replace( '/\x00+/', '', (string) $decoded ) );
		}

		if ( 1 === $platform ) {
			return trim( preg_replace( '/[^\x20-\x7E]/', '', $raw ) );
		}

		return trim( $raw );
	}

	/**
	 * @param string $name_table Name table bytes.
	 * @return string
	 */
	protected static function parse_name_table_family( $name_table ) {
		if ( strlen( $name_table ) < 6 ) {
			return '';
		}

		$count         = self::read_uint16_be( $name_table, 2 );
		$string_offset = self::read_uint16_be( $name_table, 4 );
		$best          = '';
		$best_score    = -1;

		for ( $i = 0; $i < $count; $i++ ) {
			$record_offset = 6 + ( $i * 12 );
			if ( strlen( $name_table ) < $record_offset + 12 ) {
				break;
			}

			$platform = self::read_uint16_be( $name_table, $record_offset );
			$encoding = self::read_uint16_be( $name_table, $record_offset + 2 );
			$language = self::read_uint16_be( $name_table, $record_offset + 4 );
			$name_id  = self::read_uint16_be( $name_table, $record_offset + 6 );
			$length   = self::read_uint16_be( $name_table, $record_offset + 8 );
			$offset   = self::read_uint16_be( $name_table, $record_offset + 10 );

			if ( 16 !== $name_id && 1 !== $name_id ) {
				continue;
			}

			$start = $string_offset + $offset;
			if ( strlen( $name_table ) < $start + $length ) {
				continue;
			}

			$value = self::decode_name_record( substr( $name_table, $start, $length ), $platform, $encoding );
			if ( '' === $value ) {
				continue;
			}

			$score = 0;
			if ( 16 === $name_id ) {
				$score += 100;
			}
			if ( 1 === $name_id ) {
				$score += 50;
			}
			if ( 3 === $platform ) {
				$score += 20;
			}
			if ( 0 === $platform ) {
				$score += 15;
			}
			if ( 0x0409 === $language ) {
				$score += 5;
			}

			if ( $score > $best_score ) {
				$best_score = $score;
				$best       = $value;
			}
		}

		return $best;
	}

	/**
	 * @param string $sfnt Full sfnt bytes.
	 * @param string $table_tag Table tag.
	 * @return string
	 */
	protected static function get_sfnt_table_bytes( $sfnt, $table_tag ) {
		if ( strlen( $sfnt ) < 12 ) {
			return '';
		}

		$num_tables = self::read_uint16_be( $sfnt, 4 );
		$offset     = 12;

		for ( $i = 0; $i < $num_tables; $i++ ) {
			if ( strlen( $sfnt ) < $offset + 16 ) {
				break;
			}

			$record      = substr( $sfnt, $offset, 16 );
			$tag         = substr( $record, 0, 4 );
			$table_offset = self::read_uint32_be( $record, 8 );
			$length      = self::read_uint32_be( $record, 12 );

			if ( $tag === $table_tag ) {
				return substr( $sfnt, $table_offset, $length );
			}

			$offset += 16;
		}

		return '';
	}

	/**
	 * @param string $file_path Absolute file path.
	 * @param string $ext File extension.
	 * @param string $original_name Original filename.
	 * @return string
	 */
	public static function extract_font_family_from_file( $file_path, $ext, $original_name = '' ) {
		if ( 'ttf' !== strtolower( (string) $ext ) ) {
			return self::family_from_filename( $original_name );
		}

		$sfnt = file_get_contents( $file_path );
		if ( is_string( $sfnt ) && '' !== $sfnt ) {
			$name_table = self::get_sfnt_table_bytes( $sfnt, 'name' );
			if ( '' !== $name_table ) {
				$family = self::parse_name_table_family( $name_table );
				if ( '' !== $family ) {
					return $family;
				}
			}
		}

		return self::family_from_filename( $original_name );
	}

	/**
	 * @param string $ext File extension.
	 * @return string
	 */
	protected static function css_format_for_extension( $ext ) {
		unset( $ext );
		return 'truetype';
	}

	/**
	 * @return string|WP_Error
	 */
	protected static function get_uploads_base_dir() {
		$upload_dir = wp_upload_dir();
		if ( ! empty( $upload_dir['error'] ) ) {
			return new WP_Error(
				'caf_upload_dir_error',
				__( 'Upload directory is not writable.', 'category-ajax-filter-pro' ),
				array( 'status' => 500 )
			);
		}

		$base_dir = trailingslashit( $upload_dir['basedir'] ) . self::UPLOAD_SUBDIR;
		if ( ! wp_mkdir_p( $base_dir ) ) {
			return new WP_Error(
				'caf_upload_dir_error',
				__( 'Could not create font upload directory.', 'category-ajax-filter-pro' ),
				array( 'status' => 500 )
			);
		}

		self::maybe_add_directory_guards( $base_dir );

		return $base_dir;
	}

	/**
	 * @param string $dir Directory path.
	 * @return void
	 */
	protected static function maybe_add_directory_guards( $dir ) {
		$index_file = trailingslashit( $dir ) . 'index.php';
		if ( ! file_exists( $index_file ) ) {
			file_put_contents( $index_file, "<?php\n// Silence is golden.\n" ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
		}
	}

	/**
	 * @param string               $family Font family.
	 * @param array<string,mixed>  $file Uploaded file array.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function upload_font( $family, $file ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error(
				'caf_font_forbidden',
				__( 'You are not allowed to upload fonts.', 'category-ajax-filter-pro' ),
				array( 'status' => 403 )
			);
		}

		if ( empty( $file ) || ! is_array( $file ) || empty( $file['tmp_name'] ) ) {
			return new WP_Error(
				'caf_font_missing_file',
				__( 'No font file was uploaded.', 'category-ajax-filter-pro' ),
				array( 'status' => 400 )
			);
		}

		if ( ! isset( $file['error'] ) || UPLOAD_ERR_OK !== (int) $file['error'] ) {
			return new WP_Error(
				'caf_font_upload_failed',
				__( 'Font upload failed.', 'category-ajax-filter-pro' ),
				array( 'status' => 400 )
			);
		}

		if ( ! empty( $file['size'] ) && (int) $file['size'] > self::MAX_FILE_BYTES ) {
			return new WP_Error(
				'caf_font_too_large',
				__( 'Font file is too large. Maximum size is 5 MB.', 'category-ajax-filter-pro' ),
				array( 'status' => 400 )
			);
		}

		$original_name = isset( $file['name'] ) ? sanitize_file_name( (string) $file['name'] ) : '';
		$resolved_type = self::resolve_uploaded_font_type( $file['tmp_name'], $original_name );
		if ( is_wp_error( $resolved_type ) ) {
			return $resolved_type;
		}

		$ext = $resolved_type['ext'];

		$detected_family = self::extract_font_family_from_file(
			$file['tmp_name'],
			$ext,
			$original_name
		);
		$family_input    = is_string( $family ) ? trim( $family ) : '';

		if ( '' === $family_input ) {
			if ( '' === trim( $detected_family ) ) {
				return new WP_Error(
					'caf_font_family_required',
					__( 'Could not detect a font family from this file. Please enter a name manually.', 'category-ajax-filter-pro' ),
					array( 'status' => 400 )
				);
			}
			$family = $detected_family;
		} else {
			$family = $family_input;
		}

		$family = self::validate_family_name( $family );
		if ( is_wp_error( $family ) ) {
			return $family;
		}

		$slug = sanitize_title( $family );
		if ( '' === $slug ) {
			return new WP_Error(
				'caf_invalid_font_family',
				__( 'Could not generate a safe font identifier.', 'category-ajax-filter-pro' ),
				array( 'status' => 400 )
			);
		}

		$registry = self::get_registry();
		if ( isset( $registry[ $slug ] ) ) {
			return new WP_Error(
				'caf_font_exists',
				__( 'A custom font with this family name already exists.', 'category-ajax-filter-pro' ),
				array( 'status' => 409 )
			);
		}

		$base_dir = self::get_uploads_base_dir();
		if ( is_wp_error( $base_dir ) ) {
			return $base_dir;
		}

		$font_dir = trailingslashit( $base_dir ) . $slug;
		if ( file_exists( $font_dir ) ) {
			return new WP_Error(
				'caf_font_exists',
				__( 'A custom font with this family name already exists.', 'category-ajax-filter-pro' ),
				array( 'status' => 409 )
			);
		}

		if ( ! wp_mkdir_p( $font_dir ) ) {
			return new WP_Error(
				'caf_font_storage_failed',
				__( 'Could not store the uploaded font.', 'category-ajax-filter-pro' ),
				array( 'status' => 500 )
			);
		}

		self::maybe_add_directory_guards( $font_dir );

		$stored_filename = 'font.' . $ext;
		$target_file     = trailingslashit( $font_dir ) . $stored_filename;

		if ( ! move_uploaded_file( $file['tmp_name'], $target_file ) ) {
			self::delete_directory( $font_dir );
			return new WP_Error(
				'caf_font_storage_failed',
				__( 'Could not store the uploaded font.', 'category-ajax-filter-pro' ),
				array( 'status' => 500 )
			);
		}

		$upload_dir  = wp_upload_dir();
		$font_url    = trailingslashit( $upload_dir['baseurl'] ) . self::UPLOAD_SUBDIR . '/' . $slug . '/' . $stored_filename;
		$css_content = self::build_font_face_css( $family, $font_url, $ext );
		$css_file    = trailingslashit( $font_dir ) . 'font.css';

		if ( false === file_put_contents( $css_file, $css_content ) ) { // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
			@unlink( $target_file ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
			self::delete_directory( $font_dir );
			return new WP_Error(
				'caf_font_storage_failed',
				__( 'Could not generate font stylesheet.', 'category-ajax-filter-pro' ),
				array( 'status' => 500 )
			);
		}

		$css_url = trailingslashit( $upload_dir['baseurl'] ) . self::UPLOAD_SUBDIR . '/' . $slug . '/font.css';

		$registry[ $slug ] = array(
			'family'  => $family,
			'slug'    => $slug,
			'css_url' => esc_url_raw( $css_url ),
			'file'    => $stored_filename,
			'format'  => $ext,
			'weight'  => '400',
			'style'   => 'normal',
			'created' => time(),
		);

		self::save_registry( $registry );

		return array(
			'status'          => 'success',
			'detected_family' => $detected_family,
			'font'            => array(
				'slug'    => $slug,
				'family'  => $family,
				'css_url' => esc_url_raw( $css_url ),
				'format'  => $ext,
				'weight'  => '400',
				'style'   => 'normal',
			),
			'fonts'           => self::get_fonts_for_api(),
		);
	}

	/**
	 * @param string $family Font family.
	 * @param string $font_url Font file URL.
	 * @param string $ext Extension.
	 * @return string
	 */
	protected static function build_font_face_css( $family, $font_url, $ext ) {
		$family_escaped = str_replace( array( '\\', '"' ), array( '\\\\', '\\"' ), $family );
		$font_url       = esc_url_raw( $font_url );
		$format         = self::css_format_for_extension( $ext );

		return "@font-face {\n"
			. "\tfont-family: \"{$family_escaped}\";\n"
			. "\tsrc: url('{$font_url}') format('{$format}');\n"
			. "\tfont-weight: 400;\n"
			. "\tfont-style: normal;\n"
			. "\tfont-display: swap;\n"
			. "}\n";
	}

	/**
	 * @param string $slug Font slug.
	 * @return array<string,mixed>|WP_Error
	 */
	public static function delete_font( $slug ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			return new WP_Error(
				'caf_font_forbidden',
				__( 'You are not allowed to delete fonts.', 'category-ajax-filter-pro' ),
				array( 'status' => 403 )
			);
		}

		$slug = sanitize_key( (string) $slug );
		if ( '' === $slug ) {
			return new WP_Error(
				'caf_font_not_found',
				__( 'Font not found.', 'category-ajax-filter-pro' ),
				array( 'status' => 404 )
			);
		}

		$registry = self::get_registry();
		if ( ! isset( $registry[ $slug ] ) ) {
			return new WP_Error(
				'caf_font_not_found',
				__( 'Font not found.', 'category-ajax-filter-pro' ),
				array( 'status' => 404 )
			);
		}

		$base_dir = self::get_uploads_base_dir();
		if ( is_wp_error( $base_dir ) ) {
			return $base_dir;
		}

		$font_dir = trailingslashit( $base_dir ) . $slug;
		if ( is_dir( $font_dir ) ) {
			self::delete_directory( $font_dir );
		}

		unset( $registry[ $slug ] );
		self::save_registry( $registry );

		return array(
			'status' => 'success',
			'fonts'  => self::get_fonts_for_api(),
		);
	}

	/**
	 * @param string $dir Directory path.
	 * @return void
	 */
	protected static function delete_directory( $dir ) {
		if ( ! is_dir( $dir ) ) {
			return;
		}

		$items = scandir( $dir );
		if ( ! is_array( $items ) ) {
			return;
		}

		foreach ( $items as $item ) {
			if ( '.' === $item || '..' === $item ) {
				continue;
			}

			$path = trailingslashit( $dir ) . $item;
			if ( is_dir( $path ) ) {
				self::delete_directory( $path );
			} else {
				wp_delete_file( $path );
			}
		}

		@rmdir( $dir ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_rmdir, WordPress.PHP.NoSilencedErrors.Discouraged
	}

	/**
	 * @return true|WP_Error
	 */
	protected static function assert_custom_fonts_allowed() {
		if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_use_feature( 'custom_fonts' ) ) {
			return new WP_Error(
				'caf_tier_forbidden',
				__( 'Custom fonts are available in Category Ajax Filter Pro.', 'category-ajax-filter' ),
				array( 'status' => 403 )
			);
		}

		return true;
	}

	/**
	 * REST: list fonts.
	 *
	 * @return WP_REST_Response
	 */
	public static function rest_list_fonts() {
		$allowed = self::assert_custom_fonts_allowed();
		if ( is_wp_error( $allowed ) ) {
			return $allowed;
		}

		return rest_ensure_response(
			array(
				'status' => 'success',
				'fonts'  => self::get_fonts_for_api(),
			)
		);
	}

	/**
	 * REST: upload font.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_upload_font( $request ) {
		$allowed = self::assert_custom_fonts_allowed();
		if ( is_wp_error( $allowed ) ) {
			return $allowed;
		}

		$family = $request->get_param( 'family' );
		$files  = method_exists( $request, 'get_file_params' ) ? $request->get_file_params() : array();
		$file   = isset( $files['file'] ) ? $files['file'] : null;

		$result = self::upload_font( $family, $file );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( $result );
	}

	/**
	 * REST: delete font.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public static function rest_delete_font( $request ) {
		$allowed = self::assert_custom_fonts_allowed();
		if ( is_wp_error( $allowed ) ) {
			return $allowed;
		}

		$slug   = $request->get_param( 'slug' );
		$result = self::delete_font( $slug );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response( $result );
	}
}
