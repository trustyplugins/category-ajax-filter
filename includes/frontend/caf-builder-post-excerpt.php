<?php
/**
 * Shared post excerpt/description source for builder preview and frontend.
 *
 * @package CategoryAjaxFilter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'caf_builder_get_post_excerpt_html_source' ) ) {
	/**
	 * Resolve HTML excerpt source for ModuleExcerpt (preview + frontend).
	 *
	 * Strips Divi et_pb_* tags before strip_shortcodes so inner text survives when
	 * Divi shortcodes are not executed. Falls back to get_the_excerpt() when empty.
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
			$html_source = (string) $post->post_content;
			// Keep inner text when Divi shortcodes are not executed (builder preview / some frontends).
			$stripped = preg_replace( '/\[\/?et_pb[^\]]*\]/', '', $html_source );
			$html_source = is_string( $stripped ) ? $stripped : $html_source;
			$html_source = strip_shortcodes( $html_source );
			if ( function_exists( 'excerpt_remove_blocks' ) ) {
				$without_blocks = excerpt_remove_blocks( $html_source );
				// Divi Gutenberg placeholders (wp:divi/*) can strip all inner text; keep source when that happens.
				if ( '' !== trim( wp_strip_all_tags( (string) $without_blocks ) ) ) {
					$html_source = $without_blocks;
				}
			}
		}

		if ( '' === trim( wp_strip_all_tags( (string) $html_source ) ) ) {
			$html_source = (string) get_the_excerpt( $post_id );
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
