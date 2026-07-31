<?php
/**
 * Frontend builder CSS optimizer.
 *
 * @package TC_CAF
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Compress declaration lists and group identical selector blocks.
 */
class CAF_Builder_Css_Optimizer {

	/**
	 * Optimize an array of `property:value;` rules.
	 *
	 * @param array $rules Declaration rules.
	 * @return array
	 */
	public static function optimize_declaration_rules( $rules ) {
		if ( empty( $rules ) || ! is_array( $rules ) ) {
			return array();
		}

		$map = self::rules_to_map( $rules );
		$map = self::remove_neutral_declarations( $map );
		$map = self::collapse_box_sides( $map, 'padding' );
		$map = self::collapse_box_sides( $map, 'margin' );
		$map = self::collapse_border_radius( $map );
		$map = self::collapse_border_sides( $map );

		return self::map_to_rules( $map );
	}

	/**
	 * Deduplicate and group identical CSS blocks (including @media wrappers).
	 *
	 * @param array $blocks Raw CSS blocks.
	 * @return string
	 */
	public static function optimize_collected_css( $blocks ) {
		if ( empty( $blocks ) || ! is_array( $blocks ) ) {
			return '';
		}

		$plain_blocks = array();
		$media_blocks = array();

		foreach ( $blocks as $block ) {
			$block = trim( (string) $block );
			if ( '' === $block ) {
				continue;
			}

			if ( preg_match( '/^@media\s+(.+?)\s*\{\s*(.+?)\s*\}$/s', $block, $matches ) ) {
				$media_query = trim( $matches[1] );
				$inner       = trim( $matches[2] );
				if ( ! isset( $media_blocks[ $media_query ] ) ) {
					$media_blocks[ $media_query ] = array();
				}
				$media_blocks[ $media_query ][] = $inner;
				continue;
			}

			$plain_blocks[] = $block;
		}

		$output = self::group_selector_blocks( $plain_blocks );

		foreach ( $media_blocks as $media_query => $inner_blocks ) {
			$grouped_inner = self::group_selector_blocks( $inner_blocks );
			foreach ( $grouped_inner as $inner_block ) {
				$output[] = '@media ' . $media_query . ' { ' . $inner_block . ' }';
			}
		}

		return implode( "\n", $output );
	}

	/**
	 * Parse rules into a property map (last declaration wins).
	 *
	 * @param array $rules Rules array.
	 * @return array
	 */
	protected static function rules_to_map( $rules ) {
		$map = array();

		foreach ( $rules as $rule ) {
			if ( ! is_string( $rule ) || false === strpos( $rule, ':' ) ) {
				continue;
			}

			$parts = explode( ':', $rule, 2 );
			$prop  = trim( $parts[0] );
			$value = rtrim( trim( $parts[1] ), ';' );

			if ( '' === $prop || '' === $value ) {
				continue;
			}

			$map[ $prop ] = $value;
		}

		return $map;
	}

	/**
	 * Convert property map back to rule strings.
	 *
	 * @param array $map Property map.
	 * @return array
	 */
	protected static function map_to_rules( $map ) {
		$rules = array();

		foreach ( $map as $property => $value ) {
			$rules[] = $property . ':' . $value . ';';
		}

		return $rules;
	}

	/**
	 * Remove empty/neutral declarations that do not affect rendering.
	 *
	 * @param array $map Property map.
	 * @return array
	 */
	protected static function remove_neutral_declarations( $map ) {
		foreach ( $map as $property => $value ) {
			if ( self::is_neutral_declaration( $property, $value ) ) {
				unset( $map[ $property ] );
			}
		}

		return $map;
	}

	/**
	 * Whether a declaration is safe to omit.
	 *
	 * @param string $property CSS property.
	 * @param string $value    CSS value.
	 * @return bool
	 */
	protected static function is_neutral_declaration( $property, $value ) {
		$normalized_value = strtolower( trim( $value ) );

		if ( '' === $normalized_value ) {
			return true;
		}

		if ( 'float' === $property && 'none' === $normalized_value ) {
			return true;
		}

		if ( 'text-decoration' === $property && 'inherit' === $normalized_value ) {
			return true;
		}

		if ( 'font-style' === $property && 'normal' === $normalized_value ) {
			return true;
		}

		if ( 'line-height' === $property && 'normal' === $normalized_value ) {
			return true;
		}

		if ( 'box-shadow' === $property && self::is_zero_box_shadow( $normalized_value ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Detect no-op box-shadow values.
	 *
	 * @param string $value CSS value.
	 * @return bool
	 */
	protected static function is_zero_box_shadow( $value ) {
		return (bool) preg_match(
			'/^0(px|em|rem|%)?\s+0(px|em|rem|%)?\s+0(px|em|rem|%)?\s+0(px|em|rem|%)?(\s+[^;]+)?$/',
			$value
		);
	}

	/**
	 * Collapse padding/margin into shorthand.
	 *
	 * @param array  $map    Property map.
	 * @param string $prefix Property prefix.
	 * @return array
	 */
	protected static function collapse_box_sides( $map, $prefix ) {
		$sides = array( 'top', 'right', 'bottom', 'left' );
		$keys  = array();

		foreach ( $sides as $side ) {
			$key = $prefix . '-' . $side;
			if ( ! array_key_exists( $key, $map ) ) {
				return $map;
			}
			$keys[] = $key;
		}

		$values = array();
		foreach ( $keys as $key ) {
			$values[] = $map[ $key ];
			unset( $map[ $key ] );
		}

		$map[ $prefix ] = self::build_quad_shorthand( $values );

		return $map;
	}

	/**
	 * Collapse corner radius declarations.
	 *
	 * @param array $map Property map.
	 * @return array
	 */
	protected static function collapse_border_radius( $map ) {
		$corners = array(
			'border-top-left-radius',
			'border-top-right-radius',
			'border-bottom-right-radius',
			'border-bottom-left-radius',
		);

		foreach ( $corners as $corner ) {
			if ( ! array_key_exists( $corner, $map ) ) {
				return $map;
			}
		}

		$values = array();
		foreach ( $corners as $corner ) {
			$values[] = $map[ $corner ];
			unset( $map[ $corner ] );
		}

		$map['border-radius'] = self::build_quad_shorthand( $values );

		return $map;
	}

	/**
	 * Collapse border-top/right/bottom/left width, style, and color.
	 *
	 * @param array $map Property map.
	 * @return array
	 */
	protected static function collapse_border_sides( $map ) {
		$components = array( 'width', 'style', 'color' );

		foreach ( $components as $component ) {
			$map = self::collapse_border_component( $map, $component );
		}

		return self::collapse_unified_border( $map );
	}

	/**
	 * Collapse one border component (width|style|color) across four sides.
	 *
	 * @param array  $map       Property map.
	 * @param string $component Border component name.
	 * @return array
	 */
	protected static function collapse_border_component( $map, $component ) {
		$sides = array( 'top', 'right', 'bottom', 'left' );
		$keys  = array();

		foreach ( $sides as $side ) {
			$key = 'border-' . $side . '-' . $component;
			if ( ! array_key_exists( $key, $map ) ) {
				return $map;
			}
			$keys[] = $key;
		}

		$values = array();
		foreach ( $keys as $key ) {
			$values[] = $map[ $key ];
			unset( $map[ $key ] );
		}

		$map[ 'border-' . $component ] = self::build_quad_shorthand( $values );

		return $map;
	}

	/**
	 * Combine uniform border-width/style/color into border shorthand.
	 *
	 * @param array $map Property map.
	 * @return array
	 */
	protected static function collapse_unified_border( $map ) {
		if (
			! isset( $map['border-width'], $map['border-style'], $map['border-color'] )
		) {
			return $map;
		}

		$width = trim( (string) $map['border-width'] );
		$style = trim( (string) $map['border-style'] );
		$color = trim( (string) $map['border-color'] );

		if ( false !== strpos( $width, ' ' ) || false !== strpos( $style, ' ' ) ) {
			return $map;
		}

		unset( $map['border-width'], $map['border-style'], $map['border-color'] );
		$map['border'] = $width . ' ' . $style . ' ' . $color;

		return $map;
	}

	/**
	 * Build CSS 1–4 value shorthand from top/right/bottom/left.
	 *
	 * @param array $values Side values.
	 * @return string
	 */
	protected static function build_quad_shorthand( $values ) {
		$values = array_map( array( __CLASS__, 'normalize_length_value' ), $values );

		if ( $values[0] === $values[1] && $values[1] === $values[2] && $values[2] === $values[3] ) {
			return $values[0];
		}

		if ( $values[0] === $values[2] && $values[1] === $values[3] ) {
			return $values[0] . ' ' . $values[1];
		}

		if ( $values[1] === $values[3] ) {
			return $values[0] . ' ' . $values[1] . ' ' . $values[2];
		}

		return implode( ' ', $values );
	}

	/**
	 * Normalize length tokens for shorthand comparison.
	 *
	 * @param string $value CSS value.
	 * @return string
	 */
	protected static function normalize_length_value( $value ) {
		$value = trim( (string) $value );

		if ( preg_match( '/^0(?:px|em|rem|%)?$/i', $value ) ) {
			return '0';
		}

		return $value;
	}

	/**
	 * Group selector blocks that share the same declaration body.
	 *
	 * @param array $blocks Selector blocks or full rules.
	 * @return array
	 */
	protected static function group_selector_blocks( $blocks ) {
		$groups     = array();
		$unparsed   = array();
		$order_keys = array();

		foreach ( $blocks as $block ) {
			$block = trim( (string) $block );
			if ( '' === $block ) {
				continue;
			}

			if ( ! preg_match( '/^(.+?)\s*\{\s*(.+?)\s*\}$/s', $block, $matches ) ) {
				$unparsed[] = $block;
				continue;
			}

			$body = self::normalize_declaration_block( $matches[2] );
			if ( ! isset( $groups[ $body ] ) ) {
				$groups[ $body ] = array();
				$order_keys[]    = $body;
			}

			$groups[ $body ][] = trim( $matches[1] );
		}

		$output = array();

		foreach ( $order_keys as $body ) {
			$selectors = array_unique( $groups[ $body ] );
			$output[]  = implode( ', ', $selectors ) . ' { ' . $body . ' }';
		}

		return array_merge( $output, $unparsed );
	}

	/**
	 * Normalize declaration text for stable grouping keys.
	 *
	 * @param string $body Declaration block body.
	 * @return string
	 */
	protected static function normalize_declaration_block( $body ) {
		$body = trim( preg_replace( '/\s+/', ' ', (string) $body ) );
		return rtrim( $body, ';' ) . ( '' !== $body ? ';' : '' );
	}
}
