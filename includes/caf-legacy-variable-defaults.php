<?php
/**
 * Default legacy filter/post appearance variables (PHP 8+ safe).
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @return array<string, mixed>
 */
function caf_get_legacy_variable_defaults() {
	return array(
		'caf_sec_bg_color'          => '#ffffff00',
		'caf_filter_status'         => 'on',
		'caf_filter_layout'         => 'filter-layout1',
		'caf_filter_primary_color'  => '#fff',
		'caf_filter_sec_color'      => '#262626',
		'caf_filter_sec_color2'     => '#fcb040',
		'caf_post_primary_color'    => '#262626',
		'caf_post_sec_color'        => '#fcb040',
		'caf_post_sec_color2'       => '#262626',
		'caf_post_layout'           => 'post-layout1',
		'caf_col_opt'               => array(
			'caf_col_desktop_large' => '3',
			'caf_col_desktop'       => '3',
			'caf_col_tablet'        => '2',
			'caf_col_mobile'        => '1',
		),
		'caf_image_size'            => 'large',
		'caf_post_animation'        => 'animate-off',
		'caf_empty_res'             => 'No Result.',
		'caf_link_target'           => 'new_window',
		'caf_per_page'              => '3',
		'caf_filter_font'           => 'inherit',
		'caf_filter_transform'      => 'capitalize',
		'caf_filter_font_size'      => '12',
		'caf_post_font'             => 'inherit',
		'caf_post_title_transform'  => 'capitalize',
		'caf_post_title_font_size'  => '12',
		'caf_post_title_font_color' => '#23282d',
		'caf_post_desc_font_size'   => '12',
		'caf_post_desc_font_color'  => '#23282d',
		'caf_special_post_class'    => '',
	);
}
