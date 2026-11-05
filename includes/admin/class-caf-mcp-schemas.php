<?php
/**
 * JSON schemas for CAF MCP (discover, then manage-modules.update).
 * Read-only. Does not change frontend rendering.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'CAF_MCP_Schemas', false ) ) {

class CAF_MCP_Schemas {

	/**
	 * @return array<string, array<string, mixed>>
	 */
	public static function all( $tree = 'filter' ) {
		if ( 'post' === $tree ) {
			return self::post_all();
		}
		if ( 'layout' === $tree ) {
			return self::layout_all();
		}
		$bool = array( 'true', 'false' );
		$map  = array(
			'checkbox_filter'   => self::checkbox( $bool ),
			'dropdown_filter'   => self::dropdown( $bool ),
			'search'            => self::search( $bool ),
			'reset'             => self::reset(),
			'range_slider'      => self::range_slider(),
			'customtext'        => self::customtext(),
			'woo_rating_filter' => self::rating(),
		);
		return class_exists( 'CAF_MCP_Tier', false ) ? CAF_MCP_Tier::filter_schema_map( 'filter', $map ) : $map;
	}

	/**
	 * @return array<string, array<string, mixed>>
	 */
	public static function post_all() {
		$map = array(
			'image'              => self::schema( 'Featured image on the result card. Settings: size, source, placeholder, link. Design: action=style on the module root (omit part). Advanced: custom_class, admin_label, hide_on_desktop|tablet|mobile.', array( 'admin_label' => self::text( 'Navigator name.' ), 'custom_class' => self::text( 'Extra CSS class.' ), 'hide_on_desktop' => self::text( 'true to hide on desktop.' ), 'image_size' => self::text( 'WP image size slug (medium_large default).' ), 'image_source' => self::enum( array( 'featured_image', 'custom_field' ), 'Featured image or custom field.' ), 'custom_field' => self::text( 'Meta key when image_source is custom_field.' ), 'placeholder' => self::text( 'Placeholder image URL.' ), 'link_to_post' => self::text( 'true to wrap in the post URL.' ), 'link_type' => self::enum( array( 'post-url', 'custom-url' ), 'Post URL or custom field URL.' ), 'link_target' => self::enum( array( 'same-tab', 'new-tab' ), 'Open in.' ), 'link_custom_field' => self::text( 'Meta key when link_type is custom-url.' ) ), array() ),
			'title'              => self::schema( 'Post title. Settings: link + prefix/suffix (text or icon). Design parts: omit/root, prefix, suffix, meta. Advanced: custom_class, hide_on_*.', array( 'admin_label' => self::text( 'Navigator name.' ), 'custom_class' => self::text( 'Extra CSS class.' ), 'hide_on_desktop' => self::text( 'true to hide on desktop.' ), 'link_to_post' => self::text( 'true to link the title.' ), 'link_type' => self::enum( array( 'post-url', 'custom-url' ), 'Post URL or custom field URL.' ), 'link_target' => self::enum( array( 'same-tab', 'new-tab' ), 'Open in.' ), 'prefix_enable' => self::text( 'true/false.' ), 'prefix_text' => self::text( 'Turns prefix on as text.' ), 'prefix_type' => self::enum( array( 'text', 'icon' ), 'Prefix content type.' ), 'prefix_icon' => self::text( 'FA class when prefix_type is icon.' ), 'suffix_enable' => self::text( 'true/false.' ), 'suffix_text' => self::text( 'Turns suffix on as text.' ), 'suffix_type' => self::enum( array( 'text', 'icon' ), 'Suffix content type.' ), 'suffix_icon' => self::text( 'FA class when suffix_type is icon.' ) ), array( 'prefix', 'suffix', 'meta' ) ),
			'excerpt'            => self::schema( 'Post excerpt. Settings: excerpt_length (excerptLength), html_render (htmlRender). Design: module root. Advanced: custom_class, hide_on_*.', array( 'admin_label' => self::text( 'Navigator name.' ), 'custom_class' => self::text( 'Extra CSS class.' ), 'hide_on_desktop' => self::text( 'true to hide on desktop.' ), 'excerpt_length' => self::text( 'Word count (excerptLength). Default 20.' ), 'html_render' => self::text( 'true to render HTML (off by default).' ) ), array() ),
			'author'             => self::schema( 'Post author. Settings: prefix/suffix (text, icon, or avatar). Design parts: root, prefix, suffix. Advanced: custom_class, hide_on_*.', array( 'admin_label' => self::text( 'Navigator name.' ), 'custom_class' => self::text( 'Extra CSS class.' ), 'hide_on_desktop' => self::text( 'true to hide on desktop.' ), 'prefix_enable' => self::text( 'true/false.' ), 'prefix_text' => self::text( 'Turns prefix on as text (default By).' ), 'prefix_type' => self::enum( array( 'text', 'icon', 'avatar' ), 'Prefix type.' ), 'prefix_icon' => self::text( 'FA class.' ), 'suffix_enable' => self::text( 'true/false.' ), 'suffix_text' => self::text( 'Turns suffix on as text.' ), 'show_avatar' => self::text( 'true/false. Stored as avatar_status.' ) ), array( 'prefix', 'suffix' ) ),
			'date'               => self::schema( 'Post date. Settings: date_format, custom_format, prefix/suffix. Design: root + prefix/suffix. Advanced: custom_class, hide_on_*.', array( 'admin_label' => self::text( 'Navigator name.' ), 'custom_class' => self::text( 'Extra CSS class.' ), 'hide_on_desktop' => self::text( 'true to hide on desktop.' ), 'date_format' => self::text( 'PHP date format or custom. Default F j, Y.' ), 'custom_format' => self::text( 'When date_format is custom.' ), 'prefix_enable' => self::text( 'true/false.' ), 'prefix_text' => self::text( 'Turns prefix on as text.' ), 'prefix_type' => self::enum( array( 'text', 'icon' ), 'Prefix type.' ), 'suffix_text' => self::text( 'Turns suffix on as text.' ) ), array( 'prefix', 'suffix' ) ),
			'commentcount'       => self::schema( 'Comment count. Settings: prefix/suffix. Design: root + prefix/suffix. Advanced: custom_class, hide_on_*.', array( 'admin_label' => self::text( 'Navigator name.' ), 'custom_class' => self::text( 'Extra CSS class.' ), 'hide_on_desktop' => self::text( 'true to hide on desktop.' ), 'prefix_enable' => self::text( 'true/false.' ), 'prefix_text' => self::text( 'Turns prefix on as text.' ), 'suffix_enable' => self::text( 'true/false.' ), 'suffix_text' => self::text( 'Turns suffix on as text (default Comments).' ), 'suffix_type' => self::enum( array( 'text', 'icon' ), 'Suffix type.' ) ), array( 'prefix', 'suffix' ) ),
			'categories'         => self::schema( 'Terms on the card as chips. Settings: taxonomy, limit, separator (none or ,), last_separator, term link. Design: module root. Advanced: custom_class, hide_on_*.', array( 'admin_label' => self::text( 'Navigator name.' ), 'custom_class' => self::text( 'Extra CSS class.' ), 'hide_on_desktop' => self::text( 'true to hide on desktop.' ), 'taxonomy' => self::text( 'Taxonomy slug (stored as categories).' ), 'limit' => self::text( 'Max terms shown. Default 2.' ), 'separator' => self::enum( array( 'none', ',' ), 'Between terms.' ), 'last_separator' => self::text( 'true to show separator before the last term.' ), 'link_to_post' => self::text( 'true to link each term.' ), 'link_target' => self::enum( array( 'same-tab', 'new-tab' ), 'Open in.' ) ), array() ),
			'customfield'        => self::schema( 'Custom field value on the card. Settings: custom_field_key + prefix/suffix. Design: root + prefix/suffix. Advanced: custom_class, hide_on_*.', array( 'admin_label' => self::text( 'Navigator name.' ), 'custom_class' => self::text( 'Extra CSS class.' ), 'hide_on_desktop' => self::text( 'true to hide on desktop.' ), 'custom_field_key' => self::text( 'Meta key from caf-list-custom-fields.' ), 'prefix_enable' => self::text( 'true/false.' ), 'prefix_text' => self::text( 'Prefix text (on by default).' ), 'prefix_type' => self::enum( array( 'text', 'icon' ), 'Prefix type.' ), 'suffix_text' => self::text( 'Suffix text (on by default).' ) ), array( 'prefix', 'suffix' ) ),
			'customtext'         => self::schema( 'Static text on the result card (not the filter Custom Text module). Settings: label_text / customText. Design: module root. Advanced: custom_class, hide_on_*.', array( 'admin_label' => self::text( 'Navigator name.' ), 'custom_class' => self::text( 'Extra CSS class.' ), 'hide_on_desktop' => self::text( 'true to hide on desktop.' ), 'customText' => self::text( 'Visible text.' ), 'label_text' => self::text( 'Alias for customText.' ) ), array() ),
			'button'             => self::schema( 'Read more / card button. Settings: label_text, link, prefix/suffix. Design: root (hover darkens) + prefix/suffix/meta. Advanced: custom_class, hide_on_*. Do not send camelCase changeButtonValue.', array( 'admin_label' => self::text( 'Navigator name.' ), 'custom_class' => self::text( 'Extra CSS class.' ), 'hide_on_desktop' => self::text( 'true to hide on desktop.' ), 'label_text' => self::text( 'Button label (changeButtonValue).' ), 'link_to_post' => self::text( 'true/false. Default true.' ), 'link_type' => self::enum( array( 'post-url', 'custom-url' ), 'Post URL or custom field URL.' ), 'link_target' => self::enum( array( 'same-tab', 'new-tab' ), 'Open in.' ), 'prefix_enable' => self::text( 'true/false.' ), 'prefix_text' => self::text( 'Turns prefix on as text.' ), 'prefix_type' => self::enum( array( 'text', 'icon' ), 'Prefix type.' ), 'prefix_icon' => self::text( 'FA class.' ), 'suffix_text' => self::text( 'Turns suffix on as text (replaces the default arrow).' ), 'suffix_type' => self::enum( array( 'text', 'icon' ), 'Suffix type.' ), 'suffix_icon' => self::text( 'FA class.' ) ), array( 'prefix', 'suffix', 'meta' ) ),
			'pagination'         => self::schema( 'Result pagination on the post tree (also last-screen chrome via preview:dnd:pagination). Style parts: container, meta, meta1, meta2.', array( 'admin_label' => self::text( 'Navigator name.' ), 'custom_class' => self::text( 'Extra CSS class.' ), 'hide_on_desktop' => self::text( 'true to hide on desktop.' ), 'posts_per_page' => self::integer( 'Results per page.', 1, 100 ), 'pagination_type' => self::enum( array( 'number', 'number2', 'load-more', 'button', 'infinite-scroll' ), 'Pager style.' ), 'load_more_text' => self::text( 'Load more label.' ), 'prev_text' => self::text( 'Previous label (sets type to text).' ), 'next_text' => self::text( 'Next label (sets type to text).' ) ), array( 'container', 'meta', 'meta1', 'meta2' ) ),
			'woo_product_image'  => self::schema( 'WooCommerce product image. Settings match post image plus gallery source and gallery_image_limit. Design: module root. Advanced: custom_class, hide_on_*.', array( 'admin_label' => self::text( 'Navigator name.' ), 'custom_class' => self::text( 'Extra CSS class.' ), 'hide_on_desktop' => self::text( 'true to hide on desktop.' ), 'image_size' => self::text( 'WP image size slug.' ), 'image_source' => self::enum( array( 'featured_image', 'gallery' ), 'Featured or gallery.' ), 'gallery_image_limit' => self::text( 'Gallery images. Default 2.' ), 'link_to_post' => self::text( 'true to wrap in the product URL.' ), 'link_target' => self::enum( array( 'same-tab', 'new-tab' ), 'Open in.' ) ), array() ),
			'product_price'      => self::schema( 'WooCommerce product price. Settings: show_price, prefix/suffix (optional text_visibility). Design: root + prefix/suffix. Advanced: custom_class, hide_on_*.', array( 'admin_label' => self::text( 'Navigator name.' ), 'custom_class' => self::text( 'Extra CSS class.' ), 'hide_on_desktop' => self::text( 'true to hide on desktop.' ), 'show_price' => self::enum( array( 'default', 'regular', 'sale', 'lowest_price', 'highest_price' ), 'Which price to show.' ), 'prefix_text' => self::text( 'Turns prefix on as text.' ), 'prefix_type' => self::enum( array( 'text', 'icon' ), 'Prefix type.' ), 'prefix_text_visibility' => self::enum( array( 'all', 'simple_products', 'variable_products', 'grouped_products' ), 'Where prefix shows.' ), 'suffix_text' => self::text( 'Turns suffix on as text.' ) ), array( 'prefix', 'suffix' ) ),
			'woo_product_rating' => self::schema( 'WooCommerce product stars. Settings: rating_display, prefix/suffix count_separator. Star color is part=star. Advanced: custom_class, hide_on_*.', array( 'admin_label' => self::text( 'Navigator name.' ), 'custom_class' => self::text( 'Extra CSS class.' ), 'hide_on_desktop' => self::text( 'true to hide on desktop.' ), 'rating_display' => self::enum( array( 'stars', 'average_value' ), 'Stars or numeric average.' ), 'prefix_text' => self::text( 'Turns prefix on as text.' ), 'prefix_count_separator' => self::enum( array( 'none', 'brackets', 'hyphen', 'slash' ), 'Count punctuation.' ), 'suffix_text' => self::text( 'Turns suffix on as text.' ) ), array( 'prefix', 'suffix', 'star' ) ),
			'woo_add_to_cart'    => self::schema( 'WooCommerce add to cart. Settings: label_text, button_text_mode, atc_behaviour (ajax|product_page), after_atc, prefix/suffix. Design: root (hover darkens). Advanced: custom_class, hide_on_*.', array( 'admin_label' => self::text( 'Navigator name.' ), 'custom_class' => self::text( 'Extra CSS class.' ), 'hide_on_desktop' => self::text( 'true to hide on desktop.' ), 'label_text' => self::text( 'Button label (changeButtonValue).' ), 'button_text_mode' => self::enum( array( 'woo_default', 'custom', 'icon_only', 'by_product_type' ), 'How the label is chosen.' ), 'atc_behaviour' => self::enum( array( 'ajax', 'product_page' ), 'Ajax add or go to the product.' ), 'after_atc' => self::enum( array( 'none', 'cart', 'checkout', 'custom_text' ), 'After adding.' ), 'after_atc_text' => self::text( 'Shown when after_atc is custom_text.' ), 'prefix_text' => self::text( 'Turns prefix on as text.' ), 'prefix_type' => self::enum( array( 'text', 'icon' ), 'Prefix type.' ), 'suffix_text' => self::text( 'Turns suffix on as text.' ) ), array( 'prefix', 'suffix' ) ),
			'badges'             => self::schema( 'Sale / featured / new / stock / discount / best-seller badge. Settings: badge_type, badge_text (writes badge_settings.{type}.custom_text), prefix/suffix. Design: root + prefix/suffix. Advanced: custom_class, hide_on_*.', array( 'admin_label' => self::text( 'Navigator name.' ), 'custom_class' => self::text( 'Extra CSS class.' ), 'hide_on_desktop' => self::text( 'true to hide on desktop.' ), 'badge_type' => self::enum( array( 'sale', 'featured', 'new', 'stock_status_text', 'stock_quantity', 'discount', 'best_seller' ), 'Badge kind.' ), 'badge_text' => self::text( 'Custom badge label for the current type.' ), 'prefix_text' => self::text( 'Turns prefix on as text.' ), 'suffix_text' => self::text( 'Turns suffix on as text.' ) ), array( 'prefix', 'suffix' ) ),
			'woo_attribute_swatch' => self::schema( 'WooCommerce attribute swatch on the product card (color/image chips). Compose uses Add Module defaults (heading off, icons on, term labels hidden). Bind with settings.taxonomy (pa_* from caf-list-woo-attributes) then set_term_visual. Style parts match checkbox (container/header/meta1).', array( 'admin_label' => self::text( 'Navigator name.' ), 'taxonomy' => self::text( 'Woo attribute taxonomy, e.g. pa_color. Binds like a checkbox — do not hand-write taxonomy_data.' ) ), array( 'container', 'header', 'input', 'meta', 'meta1', 'meta2', 'icon' ) ),
		);
		return class_exists( 'CAF_MCP_Tier', false ) ? CAF_MCP_Tier::filter_schema_map( 'post', $map ) : $map;
	}

	/**
	 * @param string $tree filter|post.
	 * @return array<int, array{type:string,description:string}>
	 */
	public static function summary( $tree = 'filter' ) {
		$list = array();
		foreach ( self::all( $tree ) as $type => $schema ) {
			$desc = '';
			if ( isset( $schema['llm_guidance']['instructions'] ) ) {
				$desc = (string) $schema['llm_guidance']['instructions'];
			}
			$list[] = array(
				'type'        => $type,
				'description' => $desc,
			);
		}
		return $list;
	}

	/**
	 * @param string $type Module key.
	 * @return array<string, mixed>|null
	 */
	public static function get( $type ) {
		foreach ( array( 'filter', 'post', 'layout' ) as $tree ) {
			$all = self::all( $tree );
			if ( isset( $all[ $type ] ) ) {
				return $all[ $type ];
			}
		}
		return null;
	}

	/**
	 * Layout-level schemas (not modules). Write with caf-manage-layout-settings / caf-manage-query-restriction / caf-manage-filter-query.
	 *
	 * @return array<string, array<string, mixed>>
	 */
	private static function layout_all() {
		$bool = array( 'true', 'false' );
		return array(
			'layout_settings'    => self::schema(
				'Last-screen Layout Settings (Settings / Design / Advanced) plus Misc. Off-canvas: filter_position=floating + float_button_position=bottom-left|bottom-right|top-left|top-right. Write with caf-manage-layout-settings, or caf-manage-modules action=style on preview:container (outer wrapper), preview:filter, preview:post, preview:post_inner, preview:float, preview:loader. Layout Control cards: preview:dnd:selected|result_count|sorting|pagination.',
				array(
					'post_type'              => self::text( 'CPT slug from caf-list-post-types.' ),
					'posts_per_page'         => self::integer( 'Results per page (pagination module).', 1, 100 ),
					'order'                  => self::enum( array( 'ASC', 'DESC' ), 'Query order (misc extra).' ),
					'orderby'                => self::enum( array( 'date', 'title', 'ID', 'rand', 'menu_order', 'modified', 'comment_count', 'popularity', 'rating', 'price', 'price-desc' ), 'Query orderby.' ),
					'filter_position'        => self::enum( array( 'inline', 'left', 'right', 'top', 'bottom', 'floating' ), 'Desktop filter placement. floating = off-canvas (must set desktop, not only mobile).' ),
					'filter_position_mobile' => self::enum( array( 'inline', 'left', 'right', 'top', 'bottom', 'floating' ), 'Mobile filter placement.' ),
					'float_button_position'  => self::enum( array( 'bottom-left', 'bottom-right', 'top-left', 'top-right' ), 'Pin the off-canvas Filter button (fixed). Turns desktop Floating on.' ),
					'animation_type'         => self::enum( array( 'slide-left-right', 'slide-right-left', 'slide-top-bottom', 'slide-bottom-top' ), 'Off-canvas panel slide direction.' ),
					'float_button'           => self::enum( $bool, 'Show the off-canvas Filter trigger.' ),
					'float_button_value'     => self::text( 'Off-canvas trigger label.' ),
					'selected_enable'        => self::enum( $bool, 'Show active-filter chips (Layout Control Selected).' ),
					'selected_zone'          => self::enum( array( 'post_top', 'post_bottom', 'filter_top', 'filter_bottom' ), 'post_top = above posts; filter_top = inside the filter panel.' ),
					'selected_close_button'  => self::enum( $bool, 'Show × on each selected chip.' ),
					'result_count_enable'    => self::enum( $bool, 'Show result count.' ),
					'result_count_zone'      => self::enum( array( 'post_top', 'post_bottom', 'filter_top', 'filter_bottom' ), 'Result count zone.' ),
					'sorting_enable'         => self::enum( $bool, 'Show sorting.' ),
					'sorting_zone'           => self::enum( array( 'post_top', 'post_bottom', 'filter_top', 'filter_bottom' ), 'Sorting zone.' ),
					'pagination_enable'      => self::enum( $bool, 'Show Layout Control pagination card.' ),
					'pagination_zone'        => self::enum( array( 'post_top', 'post_bottom', 'filter_top', 'filter_bottom' ), 'Pagination card zone.' ),
					'layout_source'          => self::enum( array( 'caf_builder', 'main_query' ), 'Builder query vs theme main query.' ),
					'pagination_type'        => self::enum( array( 'number', 'number2', 'load-more', 'button', 'infinite-scroll' ), 'Pager style.' ),
					'analytics'              => self::enum( $bool, 'Record interactions for Analytics.' ),
					'filter_url'             => self::enum( $bool, 'Shareable filter links in the address bar.' ),
					'schema'                 => self::enum( $bool, 'ItemList JSON-LD for the result list.' ),
					'dynamic_term_counts'    => self::enum( $bool, 'Recalculate term counts as visitors filter.' ),
					'global_font_family'     => self::text( 'Global builder font, e.g. DM Sans.' ),
					'preview_post_id'        => self::integer( 'Builder canvas post. 0 clears. Use caf-list-posts.', 0, 999999999 ),
					'columns'                => self::integer( 'Desktop post columns 1–6.', 1, 6 ),
					'layout_type'            => self::enum( array( 'grid', 'slider', 'list' ), 'Post layout type.' ),
					'masonry'                => self::enum( $bool, 'Masonry grid.' ),
					'no_result'              => self::text( 'Empty-result message.' ),
					'target'                 => self::text( 'Last-screen Design layer: container, filter, post, post_inner, float, loader.' ),
					'css'                    => self::text( 'Design CSS. Without target, styles the outer wrapper (preview:container).' ),
					'container_background'   => self::text( 'Outer wrapper background, e.g. transparent.' ),
					'custom_class'           => self::text( 'Advanced custom class on target (default container).' ),
					'custom_css'             => self::text( 'Only when Design has no control. Prefer css; Design-capable CSS is folded into Design.' ),
					'nonce'                  => self::enum( $bool, 'Enable nonce on the container.' ),
					'scroll_enable'          => self::enum( $bool, 'Scroll to container.' ),
				),
				array()
			),
			'chrome_zone'        => self::schema(
				'Layout Control drop zone (filter_top, filter_bottom, post_top, post_bottom). element_id=preview:dnd:filter_top (etc). Cards move here with action=move new_parent_id + index. Design → Layout: action=layout (display, direction, justify/spread, align, gap). Advanced: action=update custom_class, hide_on_desktop|tablet|mobile.',
				array(
					'custom_class'    => self::text( 'Extra CSS class on the zone.' ),
					'hide_on_desktop' => self::enum( $bool, 'Hide this zone on desktop.' ),
					'hide_on_tablet'  => self::enum( $bool, 'Hide this zone on tablet.' ),
					'hide_on_mobile'  => self::enum( $bool, 'Hide this zone on mobile.' ),
				),
				array()
			),
			'chrome_selected'    => self::schema(
				'Layout Control Selected (active filters) card. element_id=preview:dnd:selected. Add New seeds it in post_top. Settings: close_button, is_enable. Design parts: container (Outer Wrapper), meta (Item), meta1 (Close Icon). Advanced: custom_class, hide_on_*. Move with action=move into preview:dnd:filter_top|filter_bottom|post_top|post_bottom.',
				array(
					'is_enable'       => self::enum( $bool, 'Show the selected-filters chips.' ),
					'close_button'    => self::enum( $bool, 'Show the close icon on each chip.' ),
					'custom_class'    => self::text( 'Extra CSS class.' ),
					'hide_on_desktop' => self::enum( $bool, 'Hide on desktop.' ),
					'hide_on_tablet'  => self::enum( $bool, 'Hide on tablet.' ),
					'hide_on_mobile'  => self::enum( $bool, 'Hide on mobile.' ),
				),
				array( 'container', 'meta', 'meta1' )
			),
			'chrome_result_count' => self::schema(
				'Layout Control Result Count card. element_id=preview:dnd:result_count. Settings: prefix_text / suffix_text (default Showing / Results), prefix_enable / suffix_enable. Design parts: container (All), meta (Prefix), meta1 (Suffix).',
				array(
					'is_enable'       => self::enum( $bool, 'Show the result count.' ),
					'prefix_text'     => self::text( 'Text before the count (turns prefix on). Default Showing.' ),
					'suffix_text'     => self::text( 'Text after the count (turns suffix on). Default Results.' ),
					'prefix_enable'   => self::enum( $bool, 'Show prefix.' ),
					'suffix_enable'   => self::enum( $bool, 'Show suffix.' ),
					'custom_class'    => self::text( 'Extra CSS class.' ),
					'hide_on_desktop' => self::enum( $bool, 'Hide on desktop.' ),
					'hide_on_tablet'  => self::enum( $bool, 'Hide on tablet.' ),
					'hide_on_mobile'  => self::enum( $bool, 'Hide on mobile.' ),
				),
				array( 'container', 'meta', 'meta1' )
			),
			'chrome_sorting'     => self::schema(
				'Layout Control Sorting card. element_id=preview:dnd:sorting. Keep at least one of Sort Order or Sort By on. Settings: order_enable, order_values (ASC,DESC), order_placeholder, order_icon_position, orderby_enable, orderby_values (title, ID, date, rand, plus Woo menu_order/popularity/rating/price/price-desc), orderby_placeholder, orderby_icon_position. Design parts: container (Outer Wrapper), meta (Sort Order), meta1 (dropdown item), meta2 (Order Wrapper), meta3 (Order By Wrapper), meta4 (dropdown outer), meta5 (Order By).',
				array(
					'is_enable'              => self::enum( $bool, 'Show sorting.' ),
					'order_enable'           => self::enum( $bool, 'Show the Sort Order dropdown.' ),
					'order_values'           => self::text( 'ASC and/or DESC (array or csv). Keep at least one.' ),
					'order_placeholder'      => self::text( 'Sort Order placeholder. Default Order.' ),
					'order_icon_position'    => self::enum( array( 'left', 'right' ), 'Sort Order caret side.' ),
					'orderby_enable'         => self::enum( $bool, 'Show the Sort By dropdown.' ),
					'orderby_values'         => self::text( 'title, ID, date, rand, menu_order, popularity, rating, price, price-desc.' ),
					'orderby_placeholder'    => self::text( 'Sort By placeholder. Default Order By.' ),
					'orderby_icon_position'  => self::enum( array( 'left', 'right' ), 'Sort By caret side.' ),
					'custom_class'           => self::text( 'Extra CSS class.' ),
					'hide_on_desktop'        => self::enum( $bool, 'Hide on desktop.' ),
					'hide_on_tablet'         => self::enum( $bool, 'Hide on tablet.' ),
					'hide_on_mobile'         => self::enum( $bool, 'Hide on mobile.' ),
				),
				array( 'container', 'meta', 'meta1', 'meta2', 'meta3', 'meta4', 'meta5' )
			),
			'chrome_pagination'  => self::schema(
				'Layout Control Pagination card (last-screen chrome, not the post-tree pagination module). element_id=preview:dnd:pagination. Add New seeds it in post_bottom (number2, 9 per page). Settings: pagination_type, posts_per_page, ellipsis_enable, ellipsis_value, prev_type/text/icon, next_type/text/icon, load_more_text, load_more_icon_enable, load_more_icon. Design parts: container, meta (Button / Load More), meta1 (Numbers), meta2 (number group).',
				array(
					'is_enable'             => self::enum( $bool, 'Show pagination.' ),
					'pagination_type'       => self::enum( array( 'number', 'number2', 'load-more', 'button', 'infinite-scroll' ), 'Pager style.' ),
					'posts_per_page'        => self::integer( 'Results per page.', 1, 100 ),
					'ellipsis_enable'       => self::enum( $bool, 'Show ellipsis on number pagers.' ),
					'ellipsis_value'        => self::text( 'Ellipsis symbol. Default ...' ),
					'prev_type'             => self::enum( array( 'text', 'icon' ), 'Previous control.' ),
					'prev_text'             => self::text( 'Previous label when type is text.' ),
					'prev_icon'             => self::text( 'FA class when type is icon, e.g. fas fa-arrow-left.' ),
					'next_type'             => self::enum( array( 'text', 'icon' ), 'Next control.' ),
					'next_text'             => self::text( 'Next label when type is text.' ),
					'next_icon'             => self::text( 'FA class when type is icon.' ),
					'load_more_text'        => self::text( 'Load more label.' ),
					'load_more_icon_enable' => self::enum( $bool, 'Show icon on load more.' ),
					'load_more_icon'        => self::text( 'FA class for load more.' ),
					'custom_class'          => self::text( 'Extra CSS class.' ),
					'hide_on_desktop'       => self::enum( $bool, 'Hide on desktop.' ),
					'hide_on_tablet'        => self::enum( $bool, 'Hide on tablet.' ),
					'hide_on_mobile'        => self::enum( $bool, 'Hide on mobile.' ),
				),
				array( 'container', 'meta', 'meta1', 'meta2' )
			),
			'preview_container'  => self::schema(
				'Last-screen Outer Wrapper (.caf-builder-preview-template-container). Design + Advanced. element_id=preview:container. action=style for background/padding/flex; action=update for custom_class, custom_css, nonce, scroll_enable. Prefer style over custom_css.',
				array(
					'custom_class'    => self::text( 'Extra CSS class.' ),
					'custom_css'      => self::text( 'Only when Design has no control. Design-capable CSS is folded into Design.' ),
					'nonce'           => self::enum( $bool, 'Enable nonce.' ),
					'scroll_enable'   => self::enum( $bool, 'Scroll to container.' ),
					'scroll_position' => self::text( 'Scroll offset, default -100.' ),
				),
				array()
			),
			'query_restriction'  => self::schema(
				'Limit the result pool (include/exclude terms or posts). Write with caf-manage-query-restriction. Do not hand-write extra_data.query_restriction.',
				array(
					'enabled'           => self::enum( $bool, 'Turn restriction on.' ),
					'taxonomy_relation' => self::enum( array( 'AND', 'OR' ), 'How multiple include taxonomies combine.' ),
					'include_by'        => self::enum( array( '', 'terms', 'posts' ), 'Include side: none, terms, or specific posts.' ),
					'exclude_by'        => self::enum( array( '', 'terms', 'posts' ), 'Exclude side: none, terms, or specific posts.' ),
					'clear'             => self::enum( $bool, 'Reset restriction off.' ),
				),
				array()
			),
			'term_page_mode'     => self::schema(
				'Category / Term Page Mode (Misc). Nested under caf-manage-query-restriction as term_page_mode.',
				array(
					'enabled'          => self::enum( $bool, 'Restrict to the current archive term.' ),
					'reset_returns_to' => self::enum( array( 'current_term', 'all' ), 'Where Reset goes.' ),
					'include_children' => self::enum( $bool, 'Include child terms of the archive term.' ),
				),
				array()
			),
			'filter_query'       => self::schema(
				'Always-on custom-field query conditions. Write with caf-manage-filter-query. Do not hand-write filter_query_data.custom_field_data.',
				array(
					'meta_key'  => self::text( 'Meta key from caf-list-custom-fields.' ),
					'value'     => self::text( 'Match value. Use values[] for IN / BETWEEN.' ),
					'compare'   => self::enum( array( '=', '!=', '>', '>=', '<', '<=', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN', 'BETWEEN' ), 'Compare operator.' ),
					'meta_type' => self::enum( array( 'CHAR', 'NUMERIC', 'DATE', 'DATETIME', 'DECIMAL' ), 'Meta type.' ),
					'clear'     => self::enum( $bool, 'Reset conditions off.' ),
				),
				array()
			),
			'row'                => self::schema(
				'Filter or post row. Design → Layout is manage-modules action=layout: display (flex|block), direction (row|column, stored as flexFlow), justify/spread (space-between), align, gap, width, hide_on_*.',
				array(
					'width'           => self::text( 'Column/row width: 50, 50%, or 240px. Bare numbers are percent.' ),
					'gap'             => self::text( 'Flex gap, e.g. 10px.' ),
					'hide_on_desktop' => self::enum( $bool, 'Hide this row on desktop.' ),
					'hide_on_tablet'  => self::enum( $bool, 'Hide this row on tablet.' ),
					'hide_on_mobile'  => self::enum( $bool, 'Hide this row on mobile.' ),
				),
				array()
			),
			'column'             => self::schema(
				'Filter or post column. Design → Layout is action=layout: width=50 for half width; display+direction+justify/spread to align children (Add New meta column is flex row space-between).',
				array(
					'width'           => self::text( 'Width: 50, 50%, or 240px. Bare numbers are percent.' ),
					'gap'             => self::text( 'Flex gap, e.g. 10px.' ),
					'hide_on_desktop' => self::enum( $bool, 'Hide this column on desktop.' ),
					'hide_on_tablet'  => self::enum( $bool, 'Hide this column on tablet.' ),
					'hide_on_mobile'  => self::enum( $bool, 'Hide this column on mobile.' ),
				),
				array()
			),
		);
	}

	/**
	 * @param array<int, string> $bool true/false.
	 * @return array<string, mixed>
	 */
	private static function checkbox( $bool ) {
		return self::schema(
			'Checkbox filter. Compose uses the same Add Module defaults as the builder (label on, close_toggle false, header/meta/input styles). Bind a taxonomy (or pa_* attribute) with bind_taxonomy, or pass settings.taxonomy on caf-build-filter. Filter by author: taxonomy=author or __caf_author (kind=author from caf-list-taxonomies). Custom field: bind_custom_field. Term colors/icons: action=set_term_visual (color, FA icon, attachment_id, media_search, image_url, svg_markup). Uploaded icons store type=svg like the builder. Design Layout: part=meta1 Single Item (term row, Align Right = justify-content:flex-end when flex-flow is row); part=meta2 Color/swatch+label (default flex-flow column = swatch above label). flex-direction maps to flexFlow so Design → Align updates.',
			array(
				'admin_label'          => self::text( 'Name in the builder navigator.' ),
				'label_text'           => self::text( 'Visible filter heading.' ),
				'multiple_term'        => self::enum( $bool, 'Allow more than one term at once.' ),
				'show_checkbox'        => self::enum( $bool, 'Show the tick box.' ),
				'show_icon'            => self::enum( $bool, 'Show term icons.' ),
				'show_count'           => self::enum( $bool, 'Show post counts.' ),
				'term_show_more'       => self::enum( $bool, 'Show more / show less for long lists.' ),
				'show_more_count'      => self::enum( $bool, 'Show a count on the show-more control.' ),
				'enable_toggle'        => self::enum( $bool, 'Collapsible section.' ),
				'close_toggle'         => self::enum( $bool, 'Start collapsed when toggle is on.' ),
				'is_label'             => self::enum( $bool, 'Show the heading.' ),
				'label_icon'           => self::enum( $bool, 'Show an icon next to the heading.' ),
				'hide_term_label'      => self::enum( $bool, 'Hide term names (icon/color only).' ),
				'hide_on_desktop'      => self::enum( $bool, 'Hide on desktop.' ),
				'hide_on_tablet'       => self::enum( $bool, 'Hide on tablet.' ),
				'hide_on_mobile'       => self::enum( $bool, 'Hide on mobile.' ),
				'category_relation'    => self::enum( array( 'OR', 'AND' ), 'How selected terms combine.' ),
				'term_visual'          => self::enum( array( 'icon', 'color' ), 'Per-term swatch mode.' ),
				'term_label_display'   => self::enum( array( 'show', 'hide', 'tooltip' ), 'How term labels appear.' ),
				'count_separator'      => self::enum( array( 'brackets', 'hyphen', 'none', 'custom' ), 'Count punctuation.' ),
				'show_more_count_separator' => self::enum( array( 'brackets', 'hyphen', 'none', 'custom' ), 'Show-more count punctuation.' ),
				'toggle_position'      => self::enum( array( 'left', 'right' ), 'Chevron side.' ),
				'label_icon_position'  => self::enum( array( 'before-label', 'after-label' ), 'Heading icon side.' ),
				'term_visible_limit'   => self::integer( 'How many terms show before Show more.', 1, 100 ),
				'show_more_label'      => self::text( 'Show more text.' ),
				'show_less_label'      => self::text( 'Show less text.' ),
				'count_prefix'         => self::text( 'Text before the count.' ),
				'count_suffix'         => self::text( 'Text after the count.' ),
				'custom_class'         => self::text( 'Extra CSS class.' ),
			),
			array( 'container', 'header', 'input', 'meta', 'mainmeta', 'selectmeta', 'meta1', 'meta2', 'meta3', 'meta4', 'icon', 'icon2', 'icon3', 'selecticon', 'count', 'showmore' )
		);
	}

	/**
	 * @param array<int, string> $bool true/false.
	 * @return array<string, mixed>
	 */
	private static function dropdown( $bool ) {
		return self::schema(
			'Dropdown filter. Compose uses the same Add Module style tree as the builder (select field, options, Single Item layout parts). Bind a taxonomy / pa_* with bind_taxonomy, or pass settings.taxonomy on caf-build-filter. Filter by author: taxonomy=author or __caf_author. Custom field: bind_custom_field. Multiple + All option are Content settings. Term colors/icons: action=set_term_visual.',
			array(
				'admin_label'      => self::text( 'Name in the builder navigator.' ),
				'label_text'       => self::text( 'Visible filter heading.' ),
				'show_count'       => self::enum( $bool, 'Show post counts.' ),
				'multiple_term'    => self::enum( $bool, 'Allow more than one term.' ),
				'enable_toggle'    => self::enum( $bool, 'Collapsible section.' ),
				'close_toggle'     => self::enum( $bool, 'Start collapsed when toggle is on.' ),
				'toggle_position'  => self::enum( array( 'left', 'right' ), 'Chevron side.' ),
				'show_icon'        => self::enum( $bool, 'Show term icons.' ),
				'all_option'       => self::enum( $bool, 'Show an All option.' ),
				'all_label'        => self::text( 'Label for the All option.' ),
				'custom_class'     => self::text( 'Extra CSS class.' ),
			),
			array( 'container', 'header', 'input', 'meta', 'mainmeta', 'selectmeta', 'meta1', 'meta2', 'meta3', 'meta4', 'icon', 'icon2', 'icon3', 'selecticon', 'count', 'showmore' )
		);
	}

	/**
	 * @param array<int, string> $bool true/false.
	 * @return array<string, mixed>
	 */
	private static function search( $bool ) {
		return self::schema(
			'Keyword search. Only one per filter. Compose uses the same Add Module defaults as the builder: heading on, search icon left, clear icon on (when typing), voice off, keyword mode, source = post titles. Do not omit label — the builder reads settings.label.is_label. Style the field with part=input; search/voice/clear icons are part=icon, icon2, icon3.',
			array(
				'admin_label'           => self::text( 'Name in the builder navigator.' ),
				'label_text'            => self::text( 'Visible heading (label.value + search_label).' ),
				'is_label'              => self::enum( $bool, 'Show the heading.' ),
				'placeholder'           => self::text( 'Input placeholder (search_placeholder).' ),
				'search_trigger'        => self::enum( array( 'typing', 'enter_icon' ), 'When the query runs.' ),
				'search_title'          => self::enum( $bool, 'Search in post titles (source.title boolean).' ),
				'search_content'        => self::enum( $bool, 'Search in post content (source.descriptions boolean).' ),
				'search_everything'     => self::enum( $bool, 'Search all sources (source.everything).' ),
				'search_custom_field'   => self::enum( $bool, 'Also search a custom field (source.custom_field).' ),
				'custom_field'          => self::text( 'Meta key to search when search_custom_field is true. Use caf-list-custom-fields.' ),
				'voice'                 => self::enum( $bool, 'Voice control (voice_icon.is_enable). Default false.' ),
				'search_icon_position'  => self::enum( array( 'left', 'right' ), 'Magnifying-glass side. Default left.' ),
				'enable_toggle'         => self::enum( $bool, 'Collapsible heading.' ),
				'close_toggle'          => self::enum( $bool, 'Start collapsed when toggle is on.' ),
				'custom_class'          => self::text( 'Extra CSS class.' ),
			),
			array( 'container', 'header', 'input', 'icon', 'icon2', 'icon3' )
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	private static function reset() {
		return self::schema(
			'Reset button. Compose uses the same Add Module defaults as the builder (redo icon on, heading off). label_text is the button text only — it does not turn on a heading.',
			array(
				'admin_label'  => self::text( 'Name in the builder navigator.' ),
				'label_text'   => self::text( 'Button text (reset_label). Does not show a module heading.' ),
				'custom_class' => self::text( 'Extra CSS class.' ),
			),
			array( 'container', 'icon' )
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	private static function range_slider() {
		return self::schema(
			'Numeric range / Woo price slider. Compose uses Add Module defaults (heading on, min 0 max 100 step 1, track+handle styles). Bind Woo price with bind_price, or another numeric meta with bind_custom_field (meta_key). slider_min/max/step/prefix/suffix map onto settings.range_slider — do not hand-write custom_field_data or range_slider JSON. Track is part=meta2; handle is part=meta3.',
			array(
				'admin_label'  => self::text( 'Name in the builder navigator.' ),
				'label_text'   => self::text( 'Visible heading.' ),
				'slider_min'   => self::text( 'Minimum (range_slider.min).' ),
				'slider_max'   => self::text( 'Maximum (range_slider.max).' ),
				'slider_step'  => self::text( 'Step size (range_slider.step).' ),
				'prefix'       => self::text( 'Shown before the value (e.g. $). Enables prefix.' ),
				'suffix'       => self::text( 'Shown after the value. Enables suffix.' ),
				'enable_toggle'=> self::enum( array( 'true', 'false' ), 'Collapsible heading.' ),
				'custom_class' => self::text( 'Extra CSS class.' ),
			),
			array( 'container', 'header', 'meta', 'meta1', 'meta2', 'meta3' )
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	private static function customtext() {
		return self::schema(
			'Static heading or help text inside the filter. Compose uses Add Module defaults (text "Custom Text", optional icon off).',
			array(
				'admin_label'  => self::text( 'Name in the builder navigator.' ),
				'customText'   => self::text( 'Visible text (also customtext).' ),
				'custom_class' => self::text( 'Extra CSS class.' ),
			),
			array( 'container', 'icon' )
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	private static function rating() {
		return self::schema(
			'WooCommerce product rating filter. Requires WooCommerce. Compose uses Add Module defaults (5 stars, gte, stars layout, heading on, no checkbox chrome). Star rows are part=meta1; star color is part=icon (empty gray, selected gold).',
			array(
				'admin_label'     => self::text( 'Name in the builder navigator.' ),
				'label_text'      => self::text( 'Visible heading.' ),
				'star_count'      => self::integer( 'How many stars to show.', 3, 10 ),
				'rating_compare'  => self::enum( array( 'gte', 'lte', 'eq' ), 'Match products at, above, or below the selected rating.' ),
				'rating_display'  => self::enum( array( 'stars', 'star_picker' ), 'How stars are shown.' ),
				'enable_toggle'   => self::enum( array( 'true', 'false' ), 'Collapsible heading.' ),
				'custom_class'    => self::text( 'Extra CSS class.' ),
			),
			array( 'container', 'header', 'meta', 'meta1', 'meta2', 'icon' )
		);
	}

	/**
	 * @param string               $instructions Short guidance.
	 * @param array<string, mixed> $properties Setting properties.
	 * @param array<int, string>   $style_parts Style part names (CSS converter later).
	 * @return array<string, mixed>
	 */
	private static function schema( $instructions, $properties, $style_parts ) {
		return array(
			'type'       => 'object',
			'properties' => $properties,
			'llm_guidance' => array(
				'instructions'    => $instructions,
				'style_parts'     => $style_parts,
				'devices'         => array( 'desktop', 'tablet', 'mobile' ),
				'states'          => array( 'default', 'hover', 'selected' ),
				'write'           => 'POST manage-modules: action=update + settings for content. action=style + css + part for look. action=layout on row/column (width, gap, hide_on_*). action=bind_taxonomy + taxonomy (+ optional term_ids) for terms/pa_* attributes. action=bind_custom_field + meta_key (optional values) for custom fields. action=bind_price on range_slider for Woo _price. action=set_term_visual + term_id + color|icon|attachment_id|media_search|image_url|svg_markup. GET …/media lists svg/png/jpg. POST …/filter to add a JSON tree (configuration_id only; server mints ids).',
			),
		);
	}

	/**
	 * @param string $description Description.
	 * @return array<string, mixed>
	 */
	private static function text( $description ) {
		return array(
			'type'        => 'string',
			'description' => $description,
		);
	}

	/**
	 * @param array<int, string> $enum Allowed values.
	 * @param string             $description Description.
	 * @return array<string, mixed>
	 */
	private static function enum( $enum, $description ) {
		return array(
			'type'        => 'string',
			'enum'        => $enum,
			'description' => $description,
		);
	}

	/**
	 * @param string $description Description.
	 * @param int    $min Min.
	 * @param int    $max Max.
	 * @return array<string, mixed>
	 */
	private static function integer( $description, $min, $max ) {
		return array(
			'type'        => 'integer',
			'minimum'     => $min,
			'maximum'     => $max,
			'description' => $description,
		);
	}
}

}
