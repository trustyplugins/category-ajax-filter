<?php
/**
 * Shared post excerpt/description source for builder preview and frontend.
 *
 * @package CategoryAjaxFilter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'caf_builder_strip_divi_shortcodes_keep_text' ) ) {
	/**
	 * Remove Divi et_pb_* shortcode tags while keeping inner text.
	 *
	 * Also handles texturized / entity-encoded attribute quotes from get_the_excerpt().
	 *
	 * @param string $html Source HTML or excerpt text.
	 * @return string
	 */
	function caf_builder_strip_divi_shortcodes_keep_text( $html ) {
		$html = (string) $html;
		if ( '' === $html ) {
			return '';
		}

		// Decode entities so texturized quotes (&#8221; / &#8243;) still match et_pb tags.
		$working = html_entity_decode( $html, ENT_QUOTES | ENT_HTML5, 'UTF-8' );

		$stripped = preg_replace( '/\[\/?et_pb[^\]]*\]/', '', $working );
		$working  = is_string( $stripped ) ? $stripped : $working;
		$working  = strip_shortcodes( $working );

		if ( function_exists( 'excerpt_remove_blocks' ) ) {
			$without_blocks = excerpt_remove_blocks( $working );
			if ( '' !== trim( wp_strip_all_tags( (string) $without_blocks ) ) ) {
				$working = $without_blocks;
			}
		}

		return is_string( $working ) ? $working : '';
	}
}

if ( ! function_exists( 'caf_builder_excerpt_source_has_text' ) ) {
	/**
	 * Whether excerpt HTML still has visible text (not empty / not shortcode leftovers).
	 *
	 * @param string $html Candidate HTML.
	 * @return bool
	 */
	function caf_builder_excerpt_source_has_text( $html ) {
		$plain = trim( wp_strip_all_tags( (string) $html ) );
		if ( '' === $plain ) {
			return false;
		}
		// Reject leftover shortcode-looking soup (e.g. texturized Divi tags).
		if ( false !== strpos( $plain, '[et_pb' ) || false !== strpos( $plain, '[/et_pb' ) ) {
			return false;
		}
		return true;
	}
}

if ( ! function_exists( 'caf_builder_get_post_excerpt_html_source' ) ) {
	/**
	 * Resolve HTML excerpt source for ModuleExcerpt (preview + frontend).
	 *
	 * Strips Divi et_pb_* tags before strip_shortcodes so inner text survives when
	 * Divi shortcodes are not executed. Falls back when empty (product short
	 * description / cleaned get_the_excerpt) without leaking raw Divi tags.
	 *
	 * @param int|null $post_id Post ID.
	 * @return string
	 */
	function caf_builder_get_post_excerpt_html_source( $post_id = null ) {
		if ( ! $post_id ) {
			$post_id = get_the_ID();
		}

		$post = get_post( $post_id );
		if ( ! $post ) {
			return '';
		}

		$html_source = '';
		if ( '' !== trim( (string) $post->post_content ) ) {
			// Keep inner text when Divi shortcodes are not executed (builder preview / some frontends).
			$html_source = caf_builder_strip_divi_shortcodes_keep_text( (string) $post->post_content );
		}

		if ( ! caf_builder_excerpt_source_has_text( $html_source ) ) {
			$html_source = '';

			// Prefer explicit short description (Woo products / manual excerpts).
			$manual_excerpt = trim( (string) $post->post_excerpt );
			if ( '' !== $manual_excerpt ) {
				$candidate = caf_builder_strip_divi_shortcodes_keep_text( $manual_excerpt );
				if ( caf_builder_excerpt_source_has_text( $candidate ) ) {
					$html_source = $candidate;
				}
			}
		}

		if ( ! caf_builder_excerpt_source_has_text( $html_source ) ) {
			// Last resort: WP excerpt, but strip Divi again (fallback previously leaked tags).
			$candidate = caf_builder_strip_divi_shortcodes_keep_text( (string) get_the_excerpt( $post_id ) );
			$html_source = caf_builder_excerpt_source_has_text( $candidate ) ? $candidate : '';
		}

		return is_string( $html_source ) ? $html_source : '';
	}
}

if ( ! function_exists( 'caf_builder_preview_post_description' ) ) {
	/**
	 * Builder preview description source for ModuleExcerpt.
	 *
	 * Does not apply word limits — React ModuleExcerpt handles excerptLength + htmlRender.
	 *
	 * @param int|null $post_id Post ID.
	 * @return string
	 */
	function caf_builder_preview_post_description( $post_id = null ) {
		if ( ! $post_id ) {
			$post_id = get_the_ID();
		}

		if ( function_exists( 'caf_builder_get_post_excerpt_html_source' ) ) {
			return caf_builder_get_post_excerpt_html_source( $post_id );
		}

		$post = get_post( $post_id );
		return $post ? (string) $post->post_content : '';
	}
}
