<?php
/**
 * Font Awesome class helpers for builder frontend output.
 *
 * Builder UI / saved layouts use FA4-style icon class names (admin loads FA4).
 * Frontend enqueues FA5 `all.min.css`, where some FA4 glyph names were renamed.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Map known FA4 icon token names to FA5 equivalents (frontend CSS).
 *
 * Only glyph tokens — modifiers like fa-spin / fa-pulse are unchanged.
 *
 * @return array<string, string>
 */
function caf_builder_fa4_to_fa5_icon_token_map() {
	return array(
		'fa-circle-o-notch' => 'fa-circle-notch',
		'fa-refresh'        => 'fa-sync',
	);
}

/**
 * Normalize a space-separated icon class string for FA5 frontend output.
 *
 * Safe for loader Style list icons and other saved FA4 class strings.
 * Unknown tokens pass through unchanged.
 *
 * @param string $classes Icon class attribute value.
 * @return string
 */
function caf_builder_normalize_fa_icon_classes_for_frontend( $classes ) {
	$raw = trim( preg_replace( '/\s+/', ' ', (string) $classes ) );
	if ( '' === $raw ) {
		return '';
	}

	$map   = caf_builder_fa4_to_fa5_icon_token_map();
	$parts = preg_split( '/\s+/', $raw );
	if ( ! is_array( $parts ) ) {
		return $raw;
	}

	$out = array();
	foreach ( $parts as $token ) {
		$token = (string) $token;
		if ( '' === $token ) {
			continue;
		}
		$out[] = isset( $map[ $token ] ) ? $map[ $token ] : $token;
	}

	return implode( ' ', $out );
}
