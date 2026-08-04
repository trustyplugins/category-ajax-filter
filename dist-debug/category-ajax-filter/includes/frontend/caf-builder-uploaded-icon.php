<?php
/**
 * Uploaded icon helpers for builder frontend output.
 *
 * Mirrors react-builder CafUploadedIcon: inline SVG when possible so icon
 * font-size styling applies on the frontend the same way as in the builder.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Allowed uploaded icon extensions.
 *
 * @return string[]
 */
function caf_builder_uploaded_icon_extensions() {
	return array( 'svg', 'png', 'jpg', 'jpeg' );
}

/**
 * Resolve file extension from a media URL.
 *
 * @param string $url Media URL.
 * @return string
 */
function caf_builder_get_uploaded_icon_extension( $url ) {
	$path = strtolower( (string) wp_parse_url( (string) $url, PHP_URL_PATH ) );
	if ( preg_match( '/\.([a-z0-9]+)$/', $path, $matches ) ) {
		return (string) $matches[1];
	}
	return '';
}

/**
 * Whether the URL points to an uploaded SVG icon.
 *
 * @param string $url Media URL.
 * @return bool
 */
function caf_builder_is_svg_icon_url( $url ) {
	return 'svg' === caf_builder_get_uploaded_icon_extension( $url );
}

/**
 * Whether the URL is an allowed uploaded icon type.
 *
 * @param string $url Media URL.
 * @return bool
 */
function caf_builder_is_uploaded_icon_url( $url ) {
	return in_array( caf_builder_get_uploaded_icon_extension( $url ), caf_builder_uploaded_icon_extensions(), true );
}

/**
 * Allowed HTML for inline SVG icons from the media library.
 *
 * @return array<string, array<string, bool>>
 */
function caf_builder_get_inline_svg_allowed_html() {
	return array(
		'svg'            => array(
			'xmlns'               => true,
			'viewbox'             => true,
			'viewBox'             => true,
			'width'               => true,
			'height'              => true,
			'fill'                => true,
			'stroke'              => true,
			'class'               => true,
			'aria-hidden'         => true,
			'role'                => true,
			'focusable'           => true,
			'preserveaspectratio' => true,
			'preserveAspectRatio' => true,
		),
		'g'              => array(
			'fill'      => true,
			'stroke'    => true,
			'transform' => true,
			'class'     => true,
			'opacity'   => true,
		),
		'path'           => array(
			'd'               => true,
			'fill'            => true,
			'stroke'          => true,
			'stroke-width'    => true,
			'stroke-linecap'  => true,
			'stroke-linejoin' => true,
			'fill-rule'       => true,
			'clip-rule'       => true,
			'opacity'         => true,
			'transform'       => true,
			'class'           => true,
		),
		'circle'         => array(
			'cx'     => true,
			'cy'     => true,
			'r'      => true,
			'fill'   => true,
			'stroke' => true,
			'class'  => true,
		),
		'rect'           => array(
			'x'      => true,
			'y'      => true,
			'width'  => true,
			'height' => true,
			'rx'     => true,
			'ry'     => true,
			'fill'   => true,
			'stroke' => true,
			'class'  => true,
		),
		'line'           => array(
			'x1'     => true,
			'y1'     => true,
			'x2'     => true,
			'y2'     => true,
			'stroke' => true,
			'class'  => true,
		),
		'polyline'       => array(
			'points' => true,
			'fill'   => true,
			'stroke' => true,
			'class'  => true,
		),
		'polygon'        => array(
			'points' => true,
			'fill'   => true,
			'stroke' => true,
			'class'  => true,
		),
		'ellipse'        => array(
			'cx'     => true,
			'cy'     => true,
			'rx'     => true,
			'ry'     => true,
			'fill'   => true,
			'stroke' => true,
			'class'  => true,
		),
		'defs'           => array(),
		'clippath'       => array( 'id' => true ),
		'clipPath'       => array( 'id' => true ),
		'use'            => array(
			'href'       => true,
			'xlink:href' => true,
			'x'          => true,
			'y'          => true,
		),
		'lineargradient' => array(
			'id'            => true,
			'x1'            => true,
			'y1'            => true,
			'x2'            => true,
			'y2'            => true,
			'gradientUnits' => true,
		),
		'linearGradient' => array(
			'id'            => true,
			'x1'            => true,
			'y1'            => true,
			'x2'            => true,
			'y2'            => true,
			'gradientUnits' => true,
		),
		'radialgradient' => array(
			'id' => true,
			'cx' => true,
			'cy' => true,
			'r'  => true,
		),
		'radialGradient' => array(
			'id' => true,
			'cx' => true,
			'cy' => true,
			'r'  => true,
		),
		'stop'           => array(
			'offset'       => true,
			'stop-color'   => true,
			'stop-opacity' => true,
			'style'        => true,
		),
		'title'          => array(),
		'desc'           => array(),
	);
}

/**
 * Sanitize inline SVG markup from a trusted media-library upload.
 *
 * @param string $svg Raw SVG contents.
 * @return string
 */
function caf_builder_sanitize_inline_svg_markup( $svg ) {
	$svg = (string) $svg;
	if ( '' === trim( $svg ) ) {
		return '';
	}

	$svg = preg_replace( '/<\?xml.*?\?>/is', '', $svg );
	$svg = preg_replace( '/<!DOCTYPE.*?>/is', '', $svg );
	$svg = preg_replace( '/<script\b[^>]*>.*?<\/script>/is', '', $svg );
	$svg = preg_replace( '/\s(on[a-z]+)\s*=\s*(["\']).*?\2/i', '', $svg );

	return wp_kses( trim( $svg ), caf_builder_get_inline_svg_allowed_html() );
}

/**
 * Resolve a local filesystem path for an uploaded media URL.
 *
 * @param string $url           Media URL.
 * @param int    $attachment_id Optional attachment ID.
 * @return string
 */
function caf_builder_get_local_path_for_uploaded_icon( $url, $attachment_id = 0 ) {
	$url = (string) $url;
	if ( '' === $url ) {
		return '';
	}

	$attachment_id = absint( $attachment_id );
	if ( $attachment_id > 0 ) {
		$attached = get_attached_file( $attachment_id );
		if ( is_string( $attached ) && '' !== $attached && file_exists( $attached ) ) {
			return $attached;
		}
	}

	$resolved_id = attachment_url_to_postid( $url );
	if ( $resolved_id > 0 ) {
		$attached = get_attached_file( $resolved_id );
		if ( is_string( $attached ) && '' !== $attached && file_exists( $attached ) ) {
			return $attached;
		}
	}

	$upload_dir = wp_upload_dir();
	if ( ! empty( $upload_dir['baseurl'] ) && ! empty( $upload_dir['basedir'] ) && 0 === strpos( $url, $upload_dir['baseurl'] ) ) {
		$relative = substr( $url, strlen( $upload_dir['baseurl'] ) );
		$path     = $upload_dir['basedir'] . $relative;
		if ( file_exists( $path ) ) {
			return $path;
		}
	}

	return '';
}

/**
 * Load sanitized inline SVG markup for an uploaded icon URL.
 *
 * @param string $url           Media URL.
 * @param int    $attachment_id Optional attachment ID.
 * @return string
 */
function caf_builder_get_inline_svg_markup( $url, $attachment_id = 0 ) {
	static $cache = array();

	$url = (string) $url;
	if ( '' === $url || ! caf_builder_is_svg_icon_url( $url ) ) {
		return '';
	}

	$cache_key = md5( $url . '|' . absint( $attachment_id ) );
	if ( isset( $cache[ $cache_key ] ) ) {
		return $cache[ $cache_key ];
	}

	$path = caf_builder_get_local_path_for_uploaded_icon( $url, $attachment_id );
	if ( '' === $path ) {
		$cache[ $cache_key ] = '';
		return '';
	}

	// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	$raw = file_get_contents( $path );
	if ( ! is_string( $raw ) || '' === trim( $raw ) ) {
		$cache[ $cache_key ] = '';
		return '';
	}

	$cache[ $cache_key ] = caf_builder_sanitize_inline_svg_markup( $raw );
	return $cache[ $cache_key ];
}

/**
 * Render uploaded icon markup: inline SVG when possible, otherwise <img>.
 *
 * @param string $url           Media URL.
 * @param string $class_name    CSS classes.
 * @param int    $attachment_id Optional attachment ID.
 * @param string $style         Optional inline style attribute value.
 * @return string
 */
function caf_builder_render_uploaded_icon_markup( $url, $class_name = 'caf-inline-svg-icon', $attachment_id = 0, $style = '' ) {
	$url = (string) $url;
	if ( '' === $url || ! caf_builder_is_uploaded_icon_url( $url ) ) {
		return '';
	}

	$class_name = trim( (string) $class_name );
	if ( '' === $class_name ) {
		$class_name = 'caf-inline-svg-icon';
	}

	$style_attr = '' !== trim( (string) $style ) ? ' style="' . esc_attr( (string) $style ) . '"' : '';

	if ( caf_builder_is_svg_icon_url( $url ) ) {
		$svg_markup = caf_builder_get_inline_svg_markup( $url, $attachment_id );
		if ( '' !== $svg_markup ) {
			return '<span class="' . esc_attr( $class_name ) . '"' . $style_attr . ' aria-hidden="true">' . $svg_markup . '</span>';
		}
	}

	return '<img src="' . esc_url( $url ) . '" class="' . esc_attr( $class_name ) . '" alt=""' . $style_attr . ' />';
}
