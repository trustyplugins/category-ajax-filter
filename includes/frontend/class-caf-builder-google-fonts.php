<?php
/**
 * Google Fonts catalog + CSS2 stylesheet URL builder.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Builder_Google_Fonts {

	/**
	 * Family name => variants list.
	 *
	 * @var array<string, array<int, string>>|null
	 */
	protected static $catalog = null;

	/**
	 * Default weights used in the builder font-weight picker.
	 *
	 * @var array<int, int>
	 */
	protected static $default_weights = array( 100, 200, 300, 400, 500, 600, 700, 800, 900 );

	/**
	 * @return array<string, array<int, string>>
	 */
	public static function get_catalog() {
		if ( null !== self::$catalog ) {
			return self::$catalog;
		}

		self::$catalog = array();

		$path = defined( 'TC_CAF_PATH' )
			? TC_CAF_PATH . 'admin/google-fonts.json'
			: '';

		if ( '' === $path || ! file_exists( $path ) ) {
			return self::$catalog;
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$raw = file_get_contents( $path );
		if ( false === $raw || '' === $raw ) {
			return self::$catalog;
		}

		$data = json_decode( $raw, true );
		if ( ! is_array( $data ) || empty( $data['items'] ) || ! is_array( $data['items'] ) ) {
			return self::$catalog;
		}

		foreach ( $data['items'] as $item ) {
			if ( empty( $item['family'] ) || empty( $item['variants'] ) || ! is_array( $item['variants'] ) ) {
				continue;
			}
			self::$catalog[ (string) $item['family'] ] = array_map( 'strval', $item['variants'] );
		}

		return self::$catalog;
	}

	/**
	 * @param string $family Font family.
	 * @return array<int, string>
	 */
	public static function get_variants_for_family( $family ) {
		$family  = trim( (string) $family );
		$catalog = self::get_catalog();

		return isset( $catalog[ $family ] ) ? $catalog[ $family ] : array();
	}

	/**
	 * Build a Google Fonts CSS2 URL that includes every variant for the family.
	 *
	 * @param string             $family   Font family.
	 * @param array<int, string> $variants Variant slugs from google-fonts.json.
	 * @return string
	 */
	public static function build_stylesheet_url( $family, array $variants = array() ) {
		$family = trim( (string) $family );
		if ( '' === $family ) {
			return '';
		}

		if ( empty( $variants ) ) {
			$variants = self::get_variants_for_family( $family );
		}

		$axis_pairs = self::variants_to_axis_pairs( $variants );
		if ( empty( $axis_pairs ) ) {
			$axis_pairs = self::default_weight_axis_pairs();
		}

		$family_param = preg_replace( '/\s+/', '+', $family );
		$has_italic   = false;

		foreach ( $axis_pairs as $pair ) {
			if ( 1 === (int) $pair[0] ) {
				$has_italic = true;
				break;
			}
		}

		if ( ! $has_italic ) {
			$weights = array();
			foreach ( $axis_pairs as $pair ) {
				$weights[] = (int) $pair[1];
			}
			$weights = array_values( array_unique( $weights ) );
			sort( $weights, SORT_NUMERIC );

			return sprintf(
				'https://fonts.googleapis.com/css2?family=%s:wght@%s&display=swap',
				$family_param,
				implode( ';', $weights )
			);
		}

		usort(
			$axis_pairs,
			function ( $a, $b ) {
				if ( (int) $a[0] !== (int) $b[0] ) {
					return (int) $a[0] - (int) $b[0];
				}
				return (int) $a[1] - (int) $b[1];
			}
		);

		$chunks = array();
		foreach ( $axis_pairs as $pair ) {
			$chunks[] = (int) $pair[0] . ',' . (int) $pair[1];
		}

		return sprintf(
			'https://fonts.googleapis.com/css2?family=%s:ital,wght@%s&display=swap',
			$family_param,
			implode( ';', $chunks )
		);
	}

	/**
	 * @param array<int, string> $variants Variant slugs.
	 * @return array<int, array{0:int,1:int}>
	 */
	protected static function variants_to_axis_pairs( array $variants ) {
		$pairs = array();

		foreach ( $variants as $variant ) {
			$variant = strtolower( trim( (string) $variant ) );
			if ( '' === $variant ) {
				continue;
			}

			if ( 'regular' === $variant ) {
				$pairs[] = array( 0, 400 );
				continue;
			}

			if ( 'italic' === $variant ) {
				$pairs[] = array( 1, 400 );
				continue;
			}

			if ( preg_match( '/^(\d+)italic$/', $variant, $matches ) ) {
				$pairs[] = array( 1, (int) $matches[1] );
				continue;
			}

			if ( ctype_digit( $variant ) ) {
				$pairs[] = array( 0, (int) $variant );
			}
		}

		$unique = array();
		foreach ( $pairs as $pair ) {
			$key = $pair[0] . ',' . $pair[1];
			$unique[ $key ] = $pair;
		}

		return array_values( $unique );
	}

	/**
	 * @return array<int, array{0:int,1:int}>
	 */
	protected static function default_weight_axis_pairs() {
		$pairs = array();
		foreach ( self::$default_weights as $weight ) {
			$pairs[] = array( 0, (int) $weight );
		}
		return $pairs;
	}
}
