<?php
/**
 * Frontend Builder Post Renderer
 *
 * @package TC_CAF_PRO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_PRO_Builder_Post_Renderer {

	/**
	 * Builder data handler.
	 *
	 * @var CAF_PRO_Builder_Data
	 */
	protected $data_handler;

	/**
	 * Builder CSS collector.
	 *
	 * @var CAF_PRO_Builder_Css
	 */
	protected $css_builder;
	/**
	 * Style generator instance.
	 *
	 * @var CAF_PRO_Builder_Style_Generator
	 */
	protected $style_generator;
	/**
	 * Query object.
	 *
	 * @var WP_Query
	 */
	protected $query;
	/**
	 * Whether post item CSS has already been collected.
	 *
	 * @var bool
	 */
	protected $post_item_css_collected = false;
	/**
	 * Constructor.
	 *
	 * @param CAF_PRO_Builder_Data            $data_handler Builder data handler.
	 * @param CAF_PRO_Builder_Css             $css_builder  CSS collector.
	 * @param WP_Query                        $query        Query object.
	 * @param CAF_PRO_Builder_Style_Generator $style_generator Style generator.
	 */
	public function __construct( CAF_PRO_Builder_Data $data_handler, CAF_PRO_Builder_Css $css_builder, $query, CAF_PRO_Builder_Style_Generator $style_generator ) {
		$this->data_handler    = $data_handler;
		$this->css_builder     = $css_builder;
		$this->query           = $query;
		$this->style_generator = $style_generator;
	}

	/**
	 * Render full post layout.
	 *
	 * @return string
	 */
	public function render() {
		$extra_data = $this->data_handler->get_post_layout_extra_data();
		if (
			! empty( $extra_data->layout_source )
			&& 'elementor_loop' === (string) $extra_data->layout_source
			&& ! empty( $extra_data->loop_template_id )
		) {
			return $this->render_elementor_loop_posts( absint( $extra_data->loop_template_id ) );
		}

		$loop_data       = $this->data_handler->get_post_layout_loop_data();
		$dummy_image_url = $this->data_handler->get_dummy_image_url();

		if ( ! ( $this->query instanceof WP_Query ) ) {
			$this->maybe_collect_post_item_css_without_posts( $loop_data, $dummy_image_url );
			return $this->render_empty_message();
		}

		if ( ! $this->query->have_posts() ) {
			$this->maybe_collect_post_item_css_without_posts( $loop_data, $dummy_image_url );
			return $this->render_empty_message();
		}

		ob_start();

		while ( $this->query->have_posts() ) {
			$this->query->the_post();

			global $post;

			$post_id   = isset( $post->ID ) ? absint( $post->ID ) : 0;
			$image_url = get_the_post_thumbnail_url( $post_id, 'full' );

			echo '<article class="caf-builder-post-area post-id-' . esc_attr( $post_id ) . '" data-post-id="' . esc_attr( $post_id ) . '">';

			if ( ! empty( $loop_data ) && is_array( $loop_data ) ) {
				foreach ( $loop_data as $row_key => $row ) {
					echo $this->render_row( $row, $row_key, $post_id, $image_url, $dummy_image_url ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				}
			}

			echo '</article>';
			$this->post_item_css_collected = true;
		}

		wp_reset_postdata();

		return ob_get_clean();
	}

	/**
	 * Collect post-item CSS from layout JSON when the query has no posts.
	 *
	 * Mirrors the first-post render pass so AJAX hash snapshots stay complete
	 * even when the initial filter returns zero results.
	 *
	 * @param array  $loop_data       Post layout rows from builder data.
	 * @param string $dummy_image_url Dummy image URL.
	 * @return void
	 */
	protected function maybe_collect_post_item_css_without_posts( $loop_data, $dummy_image_url ) {
		if ( $this->post_item_css_collected || empty( $loop_data ) || ! is_array( $loop_data ) ) {
			return;
		}

		if ( ! $this->css_builder->is_collection_enabled() ) {
			return;
		}

		$post_id   = 0;
		$image_url = '';

		ob_start();
		foreach ( $loop_data as $row_key => $row ) {
			echo $this->render_row( $row, $row_key, $post_id, $image_url, $dummy_image_url ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		}
		ob_end_clean();

		$this->post_item_css_collected = true;
	}

	/**
	 * Render one row.
	 *
	 * @param object $row             Row object.
	 * @param int    $row_key         Row key.
	 * @param int    $post_id         Post ID.
	 * @param string $image_url       Post image URL.
	 * @param string $dummy_image_url Dummy image URL.
	 * @return string
	 */
	protected function render_row( $row, $row_key, $post_id, $image_url, $dummy_image_url ) {
		if ( empty( $row ) || ! is_object( $row ) ) {
			return '';
		}

		if ( empty( $row->type ) || 'row' !== $row->type ) {
			return '';
		}

		$row_class    = 'caf-builder-row-main caf-row-' . absint( $row_key );
		$custom_class = '';
		$row_settings = isset( $row->settings ) ? $row->settings : new stdClass();
		$row_style    = isset( $row->style ) ? $row->style : null;
		$row_selector = '.caf-builder-post-area .caf-row-' . absint( $row_key );
		$row_data     = isset( $row->data ) && is_array( $row->data ) ? $row->data : array();
		$row_bg_style = '';

		if ( ! empty( $row_settings->custom_class ) ) {
			$custom_class = sanitize_html_class( $row_settings->custom_class );
			$row_class   .= ' ' . $custom_class;
		}
		$row_class .= $this->get_visibility_classes( $row_settings );

		if ( ! empty( $row_settings->background_image ) && 'post-img' === $row_settings->background_image && ! empty( $image_url ) ) {
			$row_bg_style = 'background-image:url(' . esc_url( $image_url ) . ');';
		}
		if ( ! $this->post_item_css_collected ) {
			$this->collect_row_css( $row_style, $row_selector, $row_settings );
		}
		$html = '<div class="' . esc_attr( $row_class ) . '"';

		if ( ! empty( $row_bg_style ) ) {
			$html .= ' style="' . esc_attr( $row_bg_style ) . '"';
		}

		$html .= '>';

		foreach ( $row_data as $column_key => $column ) {
			$html .= $this->render_column( $column, $row_key, $column_key, $post_id, $image_url, $dummy_image_url );
		}

		$html .= '</div>';

		return $html;
	}

	/**
	 * Render one column.
	 *
	 * @param object $column          Column object.
	 * @param int    $row_key         Row key.
	 * @param int    $column_key      Column key.
	 * @param int    $post_id         Post ID.
	 * @param string $image_url       Post image URL.
	 * @param string $dummy_image_url Dummy image URL.
	 * @return string
	 */
	protected function render_column( $column, $row_key, $column_key, $post_id, $image_url, $dummy_image_url ) {
		if ( empty( $column ) || ! is_object( $column ) ) {
			return '';
		}

		if ( empty( $column->type ) || 'column' !== $column->type ) {
			return '';
		}

		$column_class    = 'caf-builder-column-main caf-column-' . absint( $column_key );
		$custom_class    = '';
		$column_settings = isset( $column->settings ) ? $column->settings : new stdClass();
		$column_style    = isset( $column->style ) ? $column->style : null;
		$column_selector = '.caf-builder-post-area .caf-row-' . absint( $row_key ) . ' .caf-column-' . absint( $column_key );
		$column_data     = isset( $column->data ) && is_array( $column->data ) ? $column->data : array();
		$column_bg_style = '';

		if ( ! empty( $column_settings->custom_class ) ) {
			$custom_class  = sanitize_html_class( $column_settings->custom_class );
			$column_class .= ' ' . $custom_class;
		}
		$column_class .= $this->get_visibility_classes( $column_settings );

		if ( ! empty( $column_settings->background_image ) && 'post-img' === $column_settings->background_image && ! empty( $image_url ) ) {
			$column_bg_style = 'background-image:url(' . esc_url( $image_url ) . ');';
		}
		if ( ! $this->post_item_css_collected ) {
			$this->collect_column_css( $column_style, $column_selector, $column_settings );
		}
		$html = '<div class="' . esc_attr( $column_class ) . '"';

		if ( ! empty( $column_bg_style ) ) {
			$html .= ' style="' . esc_attr( $column_bg_style ) . '"';
		}

		$html .= '>';

		foreach ( $column_data as $module_key => $module ) {
			$html .= $this->render_module( $module, $row_key, $column_key, $module_key, $post_id, $image_url, $dummy_image_url );
		}

		$html .= '</div>';

		return $html;
	}

	/**
	 * Render one post module.
	 *
	 * @param object $module          Module object.
	 * @param int    $row_key         Row key.
	 * @param int    $column_key      Column key.
	 * @param int    $module_key      Module key.
	 * @param int    $post_id         Post ID.
	 * @param string $image_url       Post image URL.
	 * @param string $dummy_image_url Dummy image URL.
	 * @return string
	 */
	protected function render_module( $module, $row_key, $column_key, $module_key, $post_id, $image_url, $dummy_image_url ) {
		if ( empty( $module ) || ! is_object( $module ) ) {
			return '';
		}

		$module_type     = isset( $module->key ) ? sanitize_key( $module->key ) : 'unknown';
		$module_settings = isset( $module->settings ) ? $module->settings : new stdClass();
		$module_settings = apply_filters(
			'caf_builder_module_settings',
			$module_settings,
			$this->get_hook_context(
				array(
					'scope'       => 'post_renderer',
					'module_type' => $module_type,
					'module'      => $module,
					'row_key'     => $row_key,
					'column_key'  => $column_key,
					'module_key'  => $module_key,
					'post_id'     => $post_id,
				)
			)
		);
		if ( ! is_object( $module_settings ) ) {
			$module_settings = is_array( $module_settings ) ? (object) $module_settings : new stdClass();
		}
		$module_for_render           = clone $module;
		$module_for_render->settings = $module_settings;
		$module_style    = isset( $module->style ) ? $module->style : null;
		$custom_class    = ! empty( $module_settings->custom_class ) ? sanitize_html_class( $module_settings->custom_class ) : '';
		$module_class    = 'caf-builder-module-main caf-module-post caf-module-type-' . $module_type . ' caf-module-' . absint( $module_key );
		$module_selector = '.caf-builder-post-area .caf-row-' . absint( $row_key ) . ' .caf-column-' . absint( $column_key ) . ' .caf-module-' . absint( $module_key );
		$module_bg_style = '';

		if ( ! empty( $custom_class ) ) {
			$module_class .= ' ' . $custom_class;
		}
		$module_class .= $this->get_visibility_classes( $module_settings );

		if ( ! empty( $module_settings->background_image ) && 'post-img' === $module_settings->background_image && ! empty( $image_url ) ) {
			$module_bg_style = 'background-image:url(' . esc_url( $image_url ) . ');';
		}

		$module_content = $this->render_module_content( $module_for_render, $row_key, $column_key, $module_key, $post_id, $image_url, $dummy_image_url );
		$module_content = apply_filters(
			'caf_builder_module_content_html',
			$module_content,
			$module_for_render,
			$this->get_hook_context(
				array(
					'module_type' => $module_type,
					'row_key'     => $row_key,
					'column_key'  => $column_key,
					'module_key'  => $module_key,
					'post_id'     => $post_id,
				)
			)
		);
		$module_content = apply_filters(
			'caf_builder_module_content_html_' . $module_type,
			$module_content,
			$module_for_render,
			$this->get_hook_context(
				array(
					'module_type' => $module_type,
					'row_key'     => $row_key,
					'column_key'  => $column_key,
					'module_key'  => $module_key,
					'post_id'     => $post_id,
				)
			)
		);

		if ( '' === trim( (string) $module_content ) ) {
			return '';
		}

		if ( ! $this->post_item_css_collected ) {
			$this->collect_module_css( $module_style, $module_selector, $module_type, $module_settings );
		}

		$html = '<div class="' . esc_attr( $module_class ) . '"';

		if ( ! empty( $module_bg_style ) ) {
			$html .= ' style="' . esc_attr( $module_bg_style ) . '"';
		}

		$html .= ' data-module-type="' . esc_attr( $module_type ) . '">';
		$html .= $module_content;
		$html .= '</div>';

		return apply_filters(
			'caf_builder_module_html',
			$html,
			$module_for_render,
			$this->get_hook_context(
				array(
					'module_type' => $module_type,
					'row_key'     => $row_key,
					'column_key'  => $column_key,
					'module_key'  => $module_key,
					'post_id'     => $post_id,
				)
			)
		);
	}

	/**
	 * Render module content.
	 *
	 * @param object $module          Module object.
	 * @param int    $row_key         Row key.
	 * @param int    $column_key      Column key.
	 * @param int    $module_key      Module key.
	 * @param int    $post_id         Post ID.
	 * @param string $image_url       Post image URL.
	 * @param string $dummy_image_url Dummy image URL.
	 * @return string
	 */
	protected function render_module_content( $module, $row_key, $column_key, $module_key, $post_id, $image_url, $dummy_image_url ) {
		$module_type = isset( $module->key ) ? sanitize_key( $module->key ) : '';

		switch ( $module_type ) {
			case 'image':
				return $this->render_image_module( $module, $row_key, $column_key, $module_key, $post_id, $dummy_image_url );

			case 'title':
				return $this->render_title_module( $module, $row_key, $column_key, $module_key, $post_id );

			case 'author':
				return $this->render_author_module( $module, $post_id );

			case 'date':
				return $this->render_date_module( $module, $post_id );

			case 'commentcount':
				return $this->render_comment_count_module( $module, $post_id );

			case 'excerpt':
				return $this->render_excerpt_module( $module, $row_key, $column_key, $module_key, $post_id );

			case 'button':
				return $this->render_button_module( $module, $row_key, $column_key, $module_key, $post_id );

			case 'categories':
				return $this->render_categories_module( $module, $row_key, $column_key, $module_key, $post_id );

			case 'customtext':
				return $this->render_custom_text_module( $module );

			case 'customfield':
				return $this->render_custom_field_module( $module, $post_id );

			default:
				return '<!-- Post module renderer not attached for: ' . esc_html( $module_type ) . ' -->';
		}
	}

	/**
	 * Render image module.
	 *
	 * @param object $module          Module object.
	 * @param int    $row_key         Row key.
	 * @param int    $column_key      Column key.
	 * @param int    $module_key      Module key.
	 * @param int    $post_id         Post ID.
	 * @param string $dummy_image_url Dummy image URL.
	 * @return string
	 */
	protected function render_image_module( $module, $row_key, $column_key, $module_key, $post_id, $dummy_image_url ) {
		$settings   = isset( $module->settings ) ? $module->settings : new stdClass();
		$link_data  = isset( $settings->link ) ? $settings->link : new stdClass();
		$image_data    = wp_get_attachment_image_src( get_post_thumbnail_id( $post_id ), 'full' );
		$image_src     = '';
		$attachment_id = 0;
		$image_size    = ! empty( $settings->image_size ) ? (string) $settings->image_size : 'full';
		$image_mode    = ! empty( $settings->image_source ) ? (string) $settings->image_source : 'featured_image';

		if ( 'custom_field' === $image_mode ) {
			$field_key   = isset( $settings->custom_field ) ? (string) $settings->custom_field : '';
			$field_value = ( '' !== $field_key && '0' !== $field_key ) ? $this->get_custom_field_value( $field_key, $post_id ) : '';

			if ( is_array( $field_value ) ) {
				if ( ! empty( $field_value['sizes'] ) && is_array( $field_value['sizes'] ) && ! empty( $field_value['sizes'][ $image_size ] ) ) {
					$image_src = $field_value['sizes'][ $image_size ];
				} elseif ( ! empty( $field_value['url'] ) ) {
					$image_src = $field_value['url'];
				} elseif ( ! empty( $field_value['ID'] ) ) {
					$attachment_id = absint( $field_value['ID'] );
					$sized         = wp_get_attachment_image_src( $attachment_id, $image_size );
					$image_src     = ( is_array( $sized ) && ! empty( $sized[0] ) ) ? $sized[0] : wp_get_attachment_url( $attachment_id );
					if ( is_array( $sized ) && ! empty( $sized[1] ) && ! empty( $sized[2] ) ) {
						$image_data = $sized;
					}
				}
			} elseif ( is_string( $field_value ) || is_numeric( $field_value ) ) {
				$field_value = trim( (string) $field_value );
				if ( '' !== $field_value ) {
					if ( is_numeric( $field_value ) && get_post_mime_type( (int) $field_value ) ) {
						$attachment_id = absint( $field_value );
						$sized         = wp_get_attachment_image_src( $attachment_id, $image_size );
						$image_src     = ( is_array( $sized ) && ! empty( $sized[0] ) ) ? $sized[0] : wp_get_attachment_url( $attachment_id );
						if ( is_array( $sized ) && ! empty( $sized[1] ) && ! empty( $sized[2] ) ) {
							$image_data = $sized;
						}
					} elseif ( filter_var( $field_value, FILTER_VALIDATE_URL ) ) {
						$image_src = $field_value;
					}
				}
			}
		}

		$fallback_src = ! empty( $settings->placeholder_image ) ? (string) $settings->placeholder_image : $dummy_image_url;

		if ( '' === $image_src ) {
			if ( 'featured_image' === $image_mode && is_array( $image_data ) && ! empty( $image_data[0] ) ) {
				$thumb_id = get_post_thumbnail_id( $post_id );
				if ( $thumb_id ) {
					$attachment_id = absint( $thumb_id );
				}
				if ( $thumb_id && 'full' !== $image_size ) {
					$sized = wp_get_attachment_image_src( $thumb_id, $image_size );
					if ( is_array( $sized ) && ! empty( $sized[0] ) ) {
						$image_src = $sized[0];
						if ( ! empty( $sized[1] ) && ! empty( $sized[2] ) ) {
							$image_data = $sized;
						}
					}
				}
				if ( '' === $image_src ) {
					$image_src = $image_data[0];
				}
			}

			if ( '' === $image_src ) {
				$image_src = $fallback_src;
			}
		}

		$image_alt = $this->get_post_image_alt_text( $post_id, $attachment_id );
		$image_tag = $this->build_post_image_tag( $image_src, $image_alt, $attachment_id, $image_data, $fallback_src );

		$html = '';

		if ( $this->is_truthy_setting( isset( $link_data->visibility ) ? $link_data->visibility : false ) ) {
			$link_url = get_permalink( $post_id );
			$target   = '_self';

			if ( ! empty( $link_data->type ) && 'custom-url' === $link_data->type && ! empty( $link_data->customlink ) ) {
				$link_url = $link_data->customlink;
			}
			if ( ! empty( $link_data->type ) && 'custom-url' === $link_data->type && ! empty( $link_data->custom_field ) ) {
				$custom_link = $this->get_custom_field_value( (string) $link_data->custom_field, $post_id );
				if ( is_string( $custom_link ) && '' !== $custom_link ) {
					$link_url = $custom_link;
				}
			}

			if ( ! empty( $link_data->target ) && 'new-tab' === $link_data->target ) {
				$target = '_blank';
			}

			$html .= '<a href="' . esc_url( $link_url ) . '" target="' . esc_attr( $target ) . '">';
			$html .= $image_tag;
			$html .= '</a>';

			return $html;
		}

		$html .= $image_tag;

		return $html;
	}

	/**
	 * Render title module.
	 *
	 * @param object $module     Module object.
	 * @param int    $row_key    Row key.
	 * @param int    $column_key Column key.
	 * @param int    $module_key Module key.
	 * @param int    $post_id    Post ID.
	 * @return string
	 */
	protected function render_title_module( $module, $row_key, $column_key, $module_key, $post_id ) {
		$settings  = isset( $module->settings ) ? $module->settings : new stdClass();
		$link_data = isset( $settings->link ) ? $settings->link : new stdClass();
		$icon_data = isset( $settings->icons ) ? $settings->icons : new stdClass();
		$title     = get_the_title( $post_id );
		$prefix    = isset( $settings->prefix ) ? $settings->prefix : new stdClass();
		$suffix    = isset( $settings->suffix ) ? $settings->suffix : new stdClass();
		$avatar      = $this->get_post_author_avatar_url( $post_id );
		$avatar_alt  = $this->get_post_author_display_name( $post_id );
		$html        = '';

		$module_style      = isset( $module->style ) ? $module->style : null;
		$title_prefix_html = $this->render_title_meta_affix( $prefix, 'prefix', $avatar, $avatar_alt );
		$title_suffix_html = $this->render_title_meta_affix( $suffix, 'suffix', $avatar, $avatar_alt );
		$title_full_html   = $this->build_affix_layout_content_html(
			$title_prefix_html,
			esc_html( $title ),
			'caf-builder-title-value',
			$title_suffix_html,
			'caf-builder-title-suffix-wrapper',
			$module_style,
			'h2'
		);

		if ( $this->is_truthy_setting( isset( $link_data->visibility ) ? $link_data->visibility : false ) ) {
			$url    = get_permalink( $post_id );
			$target = '_self';

			if ( ! empty( $link_data->type ) && 'custom-url' === $link_data->type && ! empty( $link_data->customlink ) ) {
				$url = $link_data->customlink;
			}
			if ( ! empty( $link_data->type ) && 'custom-url' === $link_data->type && ! empty( $link_data->custom_field ) ) {
				$custom_link = $this->get_custom_field_value( (string) $link_data->custom_field, $post_id );
				if ( is_string( $custom_link ) && '' !== $custom_link ) {
					$url = $custom_link;
				}
			}

			if ( ! empty( $link_data->target ) && 'new-tab' === $link_data->target ) {
				$target = '_blank';
			}

			$html .= '<a href="' . esc_url( $url ) . '" target="' . esc_attr( $target ) . '">';
			$html .= $this->render_inline_icon( $icon_data, 'before-title', 'margin-right: 5px;' );
			$html .= $title_full_html;
			$html .= $this->render_inline_icon( $icon_data, 'after-title', 'margin-left: 5px;' );
			$html .= '</a>';

			return $html;
		}

		$html .= $this->render_inline_icon( $icon_data, 'before-title', 'margin-right: 5px;' );
		$html .= $title_full_html;
		$html .= $this->render_inline_icon( $icon_data, 'after-title', 'margin-left: 5px;' );

		return $html;
	}

	/**
	 * Render title prefix/suffix metadata.
	 *
	 * @param object $affix_data Prefix or suffix settings.
	 * @param string $type       Either "prefix" or "suffix".
	 * @return string
	 */
	protected function render_title_meta_affix( $affix_data, $type, $avatar_url = '', $avatar_alt = '' ) {
		if ( empty( $affix_data ) || ! is_object( $affix_data ) ) {
			return '';
		}

		if ( ! isset( $affix_data->is_enable ) || 'true' !== (string) $affix_data->is_enable ) {
			return '';
		}

		$wrapper_class      = 'prefix' === $type ? 'caf-builder-prefix-col' : 'caf-builder-suffix-col';
		$meta_type          = isset( $affix_data->meta_type ) ? (string) $affix_data->meta_type : 'text';
		$meta_type_specific = '';
		$content            = '';

		if ( 'icon' === $meta_type && ! empty( $affix_data->icons ) && is_object( $affix_data->icons ) ) {
			$icon_settings = $affix_data->icons;
			$icon_type     = isset( $icon_settings->type ) ? (string) $icon_settings->type : 'icon';
			$icon_value    = isset( $icon_settings->icon ) ? $icon_settings->icon : '';
			$show_icon     = $this->is_truthy_setting( isset( $icon_settings->visibility ) ? $icon_settings->visibility : false );

			if ( $show_icon && 'icon' === $icon_type && is_string( $icon_value ) && '' !== $icon_value ) {
				$content = '<i data-icon-name="' . esc_attr( $icon_value ) . '" class="' . esc_attr( $icon_value ) . '"></i>';
			}
			if ( $show_icon && 'svg' === $icon_type && is_object( $icon_value ) && ! empty( $icon_value->url ) ) {
				$content = '<img class="svg-dynamic" src="' . esc_url( $icon_value->url ) . '" alt="" />';
			}
		} elseif ( 'avatar' === $meta_type && ! empty( $avatar_url ) ) {
			$meta_type_specific = '-avatar';
			$alt_text           = is_string( $avatar_alt ) && '' !== trim( $avatar_alt ) ? trim( $avatar_alt ) : __( 'Author avatar', 'tc-caf-pro' );
			$content            = '<img class="caf-author-avatar" src="' . esc_url( $avatar_url ) . '" alt="' . esc_attr( $alt_text ) . '" />';
		} else {
			$meta_text = isset( $affix_data->meta_text ) ? wp_kses_post( (string) $affix_data->meta_text ) : '';
			$content   = $meta_text;
		}

		if ( '' === $content ) {
			return '';
		}

		return '<span class="' . esc_attr( $wrapper_class . $meta_type_specific ) . '">' . $content . '</span>';
	}

	/**
	 * Render author module.
	 *
	 * @param object $module  Module object.
	 * @param int    $post_id Post ID.
	 * @return string
	 */
	protected function render_author_module( $module, $post_id ) {
		$settings    = isset( $module->settings ) ? $module->settings : new stdClass();
		$prefix      = isset( $settings->prefix ) ? $settings->prefix : new stdClass();
		$suffix      = isset( $settings->suffix ) ? $settings->suffix : new stdClass();
		$author_id   = get_post_field( 'post_author', $post_id );
		$author_name = get_the_author_meta( 'display_name', $author_id );
		$author_meta = $this->get_post_author_avatar_url( $post_id );

		$module_style = isset( $module->style ) ? $module->style : null;

		return $this->build_affix_layout_content_html(
			$this->render_title_meta_affix( $prefix, 'prefix', $author_meta ),
			esc_html( $author_name ),
			'caf-builder-author-name',
			$this->render_title_meta_affix( $suffix, 'suffix', $author_meta ),
			'caf-builder-author-wrapper',
			$module_style
		);
	}

	/**
	 * Resolve post author's avatar URL.
	 *
	 * @param int $post_id Post ID.
	 * @return string
	 */
	protected function get_post_author_avatar_url( $post_id ) {
		$author_id = (int) get_post_field( 'post_author', $post_id );
		if ( $author_id <= 0 ) {
			return '';
		}

		return (string) get_avatar_url( $author_id );
	}

	/**
	 * Render date module.
	 *
	 * @param object $module  Module object.
	 * @param int    $post_id Post ID.
	 * @return string
	 */
	protected function render_date_module( $module, $post_id ) {
		$settings    = isset( $module->settings ) ? $module->settings : new stdClass();
		$icon_data   = isset( $settings->icons ) ? $settings->icons : new stdClass();
		$prefix      = isset( $settings->prefix ) ? $settings->prefix : new stdClass();
		$suffix      = isset( $settings->suffix ) ? $settings->suffix : new stdClass();
		$date_format = 'F j, Y';
		if ( ! empty( $settings->date_format ) && 'custom' === (string) $settings->date_format && ! empty( $settings->custom_format ) ) {
			$date_format = (string) $settings->custom_format;
		} elseif ( ! empty( $settings->date_format ) ) {
			$date_format = (string) $settings->date_format;
		}

		$module_style = isset( $module->style ) ? $module->style : null;
		$date_value   = esc_html( get_the_date( $date_format, $post_id ) );
		$html         = $this->render_wrapped_icon( $icon_data, 'before-date', 'before', 'date', 'margin-right: 5px;' );
		$html        .= $this->build_affix_layout_content_html(
			$this->render_title_meta_affix( $prefix, 'prefix' ),
			$date_value,
			'caf-builder-date-value',
			$this->render_title_meta_affix( $suffix, 'suffix' ),
			'caf-builder-date-suffix-wrapper',
			$module_style
		);
		$html        .= $this->render_wrapped_icon( $icon_data, 'after-date', 'after', 'date', 'margin-left: 5px;' );

		return $html;
	}

	/**
	 * Render comment count module.
	 *
	 * @param object $module  Module object.
	 * @param int    $post_id Post ID.
	 * @return string
	 */
	protected function render_comment_count_module( $module, $post_id ) {
		$settings  = isset( $module->settings ) ? $module->settings : new stdClass();
		$icon_data = isset( $settings->icons ) ? $settings->icons : new stdClass();
		$prefix    = isset( $settings->prefix ) ? $settings->prefix : new stdClass();
		$suffix    = isset( $settings->suffix ) ? $settings->suffix : new stdClass();

		$module_style   = isset( $module->style ) ? $module->style : null;
		$comment_value  = esc_html( get_comments_number( $post_id ) );
		$html           = $this->render_wrapped_icon( $icon_data, 'before-comment', 'before', 'commentcount', 'margin-right: 5px;' );
		$html          .= $this->build_affix_layout_content_html(
			$this->render_title_meta_affix( $prefix, 'prefix' ),
			$comment_value,
			'caf-builder-comment-value',
			$this->render_title_meta_affix( $suffix, 'suffix' ),
			'caf-builder-comment-suffix-wrapper',
			$module_style
		);
		$html          .= $this->render_wrapped_icon( $icon_data, 'after-comment', 'after', 'commentcount', 'margin-left: 5px;' );

		return $html;
	}

	/**
	 * Render excerpt module.
	 *
	 * @param object $module     Module object.
	 * @param int    $row_key    Row key.
	 * @param int    $column_key Column key.
	 * @param int    $module_key Module key.
	 * @param int    $post_id    Post ID.
	 * @return string
	 */
	protected function render_excerpt_module( $module, $row_key, $column_key, $module_key, $post_id ) {
		$settings       = isset( $module->settings ) ? $module->settings : new stdClass();
		$html_render    = $this->is_truthy_setting( isset( $settings->htmlRender ) ? $settings->htmlRender : false );
		$excerpt_length = 20;

		if ( isset( $settings->excerptLength ) && '' !== (string) $settings->excerptLength ) {
			$excerpt_length = absint( $settings->excerptLength );
		}

		$post        = get_post( $post_id );
		$description = $post ? wp_strip_all_tags( (string) $post->post_content ) : '';
		$raw_excerpt = wp_strip_all_tags( get_the_excerpt( $post_id ) );
		$source_text = $html_render
			? ( '' !== $description ? $description : $raw_excerpt )
			: ( '' !== $raw_excerpt ? $raw_excerpt : $description );

		return esc_html( $this->trim_excerpt_to_words( $source_text, $excerpt_length ) );
	}

	/**
	 * Trim excerpt text to a word limit (matches builder ModuleExcerpt).
	 *
	 * @param string $text       Source text.
	 * @param int    $word_limit Word limit.
	 * @return string
	 */
	protected function trim_excerpt_to_words( $text, $word_limit ) {
		$normalized = trim( preg_replace( '/\s+/u', ' ', (string) $text ) );
		if ( '' === $normalized ) {
			return '';
		}
		if ( $word_limit <= 0 ) {
			return $normalized;
		}

		$words = preg_split( '/\s+/u', $normalized );
		if ( ! is_array( $words ) || count( $words ) <= $word_limit ) {
			return $normalized;
		}

		return implode( ' ', array_slice( $words, 0, $word_limit ) ) . '...';
	}

	/**
	 * Render button module.
	 *
	 * @param object $module     Module object.
	 * @param int    $row_key    Row key.
	 * @param int    $column_key Column key.
	 * @param int    $module_key Module key.
	 * @param int    $post_id    Post ID.
	 * @return string
	 */
	protected function render_button_module( $module, $row_key, $column_key, $module_key, $post_id ) {
		$settings    = isset( $module->settings ) ? $module->settings : new stdClass();
		$link_data   = isset( $settings->link ) ? $settings->link : new stdClass();
		$icon_data   = isset( $settings->icons ) ? $settings->icons : new stdClass();
		$prefix      = isset( $settings->prefix ) ? $settings->prefix : new stdClass();
		$suffix      = isset( $settings->suffix ) ? $settings->suffix : new stdClass();
		$button_text = ! empty( $settings->changeButtonValue ) ? $settings->changeButtonValue : __( 'Read More', 'tc-caf-pro' );
		$module_style = isset( $module->style ) ? $module->style : null;
		$button_html  = $this->build_affix_layout_content_html(
			$this->render_title_meta_affix( $prefix, 'prefix' ),
			esc_html( $button_text ),
			'caf-builder-button-value',
			$this->render_title_meta_affix( $suffix, 'suffix' ),
			'caf-builder-button-suffix-wrapper',
			$module_style
		);
		$html         = '';

		if ( $this->is_truthy_setting( isset( $link_data->visibility ) ? $link_data->visibility : false ) ) {
			$url    = get_permalink( $post_id );
			$target = '_self';

			if ( ! empty( $link_data->type ) && 'custom-url' === $link_data->type && ! empty( $link_data->customlink ) ) {
				$url = $link_data->customlink;
			}
			if ( ! empty( $link_data->type ) && 'custom-url' === $link_data->type && ! empty( $link_data->custom_field ) ) {
				$custom_link = $this->get_custom_field_value( (string) $link_data->custom_field, $post_id );
				if ( is_string( $custom_link ) && '' !== $custom_link ) {
					$url = $custom_link;
				}
			}

			if ( ! empty( $link_data->target ) && 'new-tab' === $link_data->target ) {
				$target = '_blank';
			}

			$html .= '<a href="' . esc_url( $url ) . '" target="' . esc_attr( $target ) . '">';
			$html .= $this->render_inline_icon( $icon_data, 'before-button', 'margin-right: 5px;' );
			$html .= $button_html;
			$html .= $this->render_inline_icon( $icon_data, 'after-button', 'margin-left: 5px;' );
			$html .= '</a>';

			return $html;
		}

		$html .= $this->render_inline_icon( $icon_data, 'before-button', 'margin-right: 5px;' );
		$html .= $button_html;
		$html .= $this->render_inline_icon( $icon_data, 'after-button', 'margin-left: 5px;' );

		return $html;
	}

	/**
	 * Render categories module.
	 *
	 * @param object $module     Module object.
	 * @param int    $row_key    Row key.
	 * @param int    $column_key Column key.
	 * @param int    $module_key Module key.
	 * @param int    $post_id    Post ID.
	 * @return string
	 */
	protected function render_categories_module( $module, $row_key, $column_key, $module_key, $post_id ) {
		$settings   = isset( $module->settings ) ? $module->settings : new stdClass();
		$style      = isset( $module->style ) ? $module->style : null;
		$categories = isset( $settings->categories ) ? $settings->categories : array();
		$html       = '';

		if ( is_string( $categories ) ) {
			$categories = array( $categories );
		}
		if ( empty( $categories ) || ! is_array( $categories ) ) {
			return '';
		}
		$limit           = isset( $settings->limit ) ? absint( $settings->limit ) : 0;
		$separator       = isset( $settings->separator ) ? (string) $settings->separator : 'none';
		$last_separator  = $this->is_truthy_setting( isset( $settings->last_separator ) ? $settings->last_separator : false );
		$terms_rendered  = 0;
		$link_visibility = $this->is_truthy_setting( isset( $settings->link->visibility ) ? $settings->link->visibility : false );
		$link_target     = ( ! empty( $settings->link->target ) && 'new-tab' === $settings->link->target ) ? '_blank' : '_self';

		$term_selector = '.caf-builder-post-area .caf-row-' . absint( $row_key ) . ' .caf-column-' . absint( $column_key ) . ' .caf-module-' . absint( $module_key ) . ' .caf-module-term-name';
		$term_style    = ( ! empty( $style ) && is_object( $style ) && ! empty( $style->meta ) && is_object( $style->meta ) ) ? $style->meta : $style;

		if ( ! empty( $term_style ) ) {
			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$term_style,
					'default',
					$term_selector,
					array(
						'background_image_mode' => 'conditional',
						'settings'              => $settings,
					)
				)
			);

			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$term_style,
					'hover',
					$term_selector . ':hover',
					array(
						'background_image_mode' => 'conditional',
						'settings'              => $settings,
					)
				)
			);
		}

		foreach ( $categories as $taxonomy ) {
			$terms = wp_get_post_terms( $post_id, $taxonomy );

			if ( empty( $terms ) || is_wp_error( $terms ) ) {
				continue;
			}
			if ( $limit > 0 ) {
				$terms = array_slice( $terms, 0, $limit );
			}

			$total = count( $terms );
			foreach ( $terms as $idx => $term ) {
				$cls = 'caf-module-term-name caf-module-term-name-' . esc_attr( $module_key ) . ' term-tax-' . esc_attr( $taxonomy );
				if ( $link_visibility ) {
					$term_link = get_term_link( $term );
					$html     .= '<a class="' . $cls . '" href="' . esc_url( is_wp_error( $term_link ) ? '#' : $term_link ) . '" target="' . esc_attr( $link_target ) . '" term-id="' . esc_attr( $term->term_id ) . '">';
				} else {
					$html .= '<div class="' . $cls . '" term-id="' . esc_attr( $term->term_id ) . '">';
				}

				$html .= esc_html( $term->name );

				if ( 'none' !== $separator && $total > 1 && $idx !== $total - 1 ) {
					$html .= '<span class="caf-builder-term-separator">' . esc_html( $separator ) . '</span>';
				}
				if ( 'none' !== $separator && $last_separator && $idx === $total - 1 ) {
					$html .= '<span class="caf-builder-term-separator caf-last-separator">' . esc_html( $separator ) . '</span>';
				}

				$html .= $link_visibility ? '</a>' : '</div>';
				++$terms_rendered;
			}
		}
		if ( 0 === $terms_rendered ) {
			return '';
		}

		return $html;
	}

	/**
	 * Render custom text module.
	 *
	 * @param object $module Module object.
	 * @return string
	 */
	protected function render_custom_text_module( $module ) {
		$settings    = isset( $module->settings ) ? $module->settings : new stdClass();
		$custom_text = isset( $settings->customText ) ? $settings->customText : __( 'Custom Text', 'tc-caf-pro' );
		$icon_data   = isset( $settings->icons ) ? $settings->icons : new stdClass();
		$html        = '';

		$html .= $this->render_inline_icon( $icon_data, 'before-customtext', 'margin-right: 5px;' );
		$html .= wp_kses_post( (string) $custom_text );
		$html .= $this->render_inline_icon( $icon_data, 'after-customtext', 'margin-left: 5px;' );

		return $html;
	}

	/**
	 * Render custom field module.
	 *
	 * @param object $module  Module object.
	 * @param int    $post_id Post ID.
	 * @return string
	 */
	protected function render_custom_field_module( $module, $post_id ) {
		$settings         = isset( $module->settings ) ? $module->settings : new stdClass();
		$label_data       = isset( $settings->label ) ? $settings->label : new stdClass();
		$icon_data        = isset( $label_data->icons ) ? $label_data->icons : new stdClass();
		$prefix           = isset( $settings->prefix ) ? $settings->prefix : new stdClass();
		$suffix           = isset( $settings->suffix ) ? $settings->suffix : new stdClass();
		$custom_field_key = isset( $settings->customField ) ? $settings->customField : ( isset( $settings->custom_field ) ? $settings->custom_field : '0' );
		$custom_field_val = '';

		if ( '0' !== (string) $custom_field_key ) {
			$field_value = $this->get_custom_field_value( (string) $custom_field_key, $post_id );
			if ( ! $this->is_custom_field_display_value_empty( $field_value ) ) {
				$custom_field_val = is_scalar( $field_value ) ? (string) $field_value : wp_json_encode( $field_value );
			}
		}

		if ( '' === $custom_field_val ) {
			return '';
		}

		if ( ! empty( $label_data->is_label ) && 'true' === $label_data->is_label && '0' !== (string) $custom_field_key ) {
			$label_text = ! empty( $label_data->value ) ? $label_data->value : __( 'Label', 'tc-caf-pro' );
			$html       = '<div class="caf-builder-custom-filed-label">';
			$html      .= $this->render_wrapped_icon( $icon_data, 'before-label', 'before', 'custom-field-label', 'margin-right: 5px;' );
			$html .= esc_html( $label_text );
			$html .= $this->render_wrapped_icon( $icon_data, 'after-label', 'after', 'custom-field-label', 'margin-left: 5px;' );
			$html .= '</div>';

			$module_style = isset( $module->style ) ? $module->style : null;
			$html        .= $this->build_affix_layout_content_html(
				$this->render_title_meta_affix( $prefix, 'prefix' ),
				esc_html( $custom_field_val ),
				'caf-builder-custom-filed-value',
				$this->render_title_meta_affix( $suffix, 'suffix' ),
				'caf-builder-custom-filed-suffix-wrapper',
				$module_style
			);

			return $html;
		}

		$module_style = isset( $module->style ) ? $module->style : null;

		return $this->build_affix_layout_content_html(
			$this->render_title_meta_affix( $prefix, 'prefix' ),
			esc_html( $custom_field_val ),
			'caf-builder-custom-filed-value',
			$this->render_title_meta_affix( $suffix, 'suffix' ),
			'caf-builder-custom-filed-suffix-wrapper',
			$module_style
		);
	}

	/**
	 * Render empty state message.
	 *
	 * @return string
	 */
	protected function render_empty_message() {
		$empty_message = __( 'No Result Found', 'tc-caf-pro' );
		$misc_data     = $this->data_handler->get_misc_preview_data();

		if (
			isset( $misc_data->extra ) &&
			is_object( $misc_data->extra ) &&
			isset( $misc_data->extra->noresult )
		) {
			$custom_message = trim( wp_strip_all_tags( (string) $misc_data->extra->noresult ) );
			if ( '' !== $custom_message ) {
				$empty_message = $custom_message;
			}
		}

		return '<p class="caf-builder-post-error">' . esc_html( $empty_message ) . '</p>';
	}

	/**
	 * Collect row CSS placeholder.
	 *
	 * @param mixed  $style    Style object.
	 * @param string $selector CSS selector.
	 * @return void
	 */
	/**
	 * Collect row CSS.
	 *
	 * @param mixed  $style    Style object.
	 * @param string $selector CSS selector.
	 * @param object $settings Row settings.
	 * @return void
	 */
	protected function collect_row_css( $style, $selector, $settings = null ) {
		if ( empty( $style ) || empty( $selector ) ) {
			return;
		}

		$this->css_builder->add(
			$this->style_generator->generate_responsive_css(
				$style,
				'default',
				$selector,
				array(
					'background_image_mode' => 'conditional',
					'settings'              => $settings,
				)
			)
		);

		$this->css_builder->add(
			$this->style_generator->generate_responsive_css(
				$style,
				'hover',
				$selector . ':hover',
				array(
					'background_image_mode' => 'conditional',
					'settings'              => $settings,
				)
			)
		);
	}

	/**
	 * Collect column CSS.
	 *
	 * @param mixed  $style    Style object.
	 * @param string $selector CSS selector.
	 * @param object $settings Column settings.
	 * @return void
	 */
	protected function collect_column_css( $style, $selector, $settings = null ) {
		if ( empty( $style ) || empty( $selector ) ) {
			return;
		}

		$this->css_builder->add(
			$this->style_generator->generate_responsive_css(
				$style,
				'default',
				$selector,
				array(
					'background_image_mode' => 'conditional',
					'settings'              => $settings,
				)
			)
		);

		$this->css_builder->add(
			$this->style_generator->generate_responsive_css(
				$style,
				'hover',
				$selector . ':hover',
				array(
					'background_image_mode' => 'conditional',
					'settings'              => $settings,
				)
			)
		);
	}

	/**
	 * Collect module CSS.
	 *
	 * @param mixed  $style       Style object.
	 * @param string $selector    CSS selector.
	 * @param string $module_type Module type.
	 * @param object $settings    Module settings.
	 * @return void
	 */
	protected function collect_module_css( $style, $selector, $module_type, $settings = null ) {
		if ( empty( $style ) || empty( $selector ) || empty( $module_type ) ) {
			return;
		}

		$link_modules = array( 'title', 'button' );
		$is_link_module = in_array( $module_type, $link_modules, true ) && $this->is_truthy_setting( isset( $settings->link->visibility ) ? $settings->link->visibility : false );

		if ( $is_link_module ) {
			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$style,
					'default',
					$selector . ' a',
					array(
						'background_image_mode' => 'conditional',
						'settings'              => $settings,
					)
				)
			);

			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$style,
					'hover',
					$selector . ' a:hover',
					array(
						'background_image_mode' => 'conditional',
						'settings'              => $settings,
					)
				)
			);

			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$style,
					'default',
					$selector,
					array(
						'allowed_properties' => array( 'justify-content' ),
						'force_width_100'    => true,
						'justify_width_100'  => true,
					)
				)
			);

			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$style,
					'hover',
					$selector . ':hover',
					array(
						'allowed_properties' => array( 'justify-content' ),
						'force_width_100'    => true,
						'justify_width_100'  => true,
					)
				)
			);
		} elseif ( 'image' === $module_type ) {
			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$style,
					'default',
					$selector,
					array(
						'allowed_properties' => array( 'justify-content' ),
						'force_width_100'    => true,
						'justify_width_100'  => true,
					)
				)
			);

			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$style,
					'hover',
					$selector . ':hover',
					array(
						'allowed_properties' => array( 'justify-content' ),
						'force_width_100'    => true,
						'justify_width_100'  => true,
					)
				)
			);
		} else {
			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$style,
					'default',
					$selector,
					array(
						'background_image_mode' => 'conditional',
						'settings'              => $settings,
					)
				)
			);

			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$style,
					'hover',
					$selector . ':hover',
					array(
						'background_image_mode' => 'conditional',
						'settings'              => $settings,
					)
				)
			);
		}

		$this->collect_module_affix_css( $style, $selector, $settings, $module_type );

		if ( 'image' === $module_type ) {
			$image_selector = $selector . ' img';
			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$style,
					'default',
					$image_selector,
					array(
						'background_image_mode' => 'conditional',
						'settings'              => $settings,
					)
				)
			);
			$this->css_builder->add(
				$this->style_generator->generate_responsive_css(
					$style,
					'hover',
					$image_selector . ':hover',
					array(
						'background_image_mode' => 'conditional',
						'settings'              => $settings,
					)
				)
			);
		}
	}

	/**
	 * Collect module prefix/suffix/meta CSS.
	 *
	 * Mirrors backend preview style targets for affix content,
	 * including avatar-specific image selectors.
	 *
	 * @param mixed  $style    Module style object.
	 * @param string $selector Module selector.
	 * @param object $settings    Module settings.
	 * @param string $module_type Module type.
	 * @return void
	 */
	protected function collect_module_affix_css( $style, $selector, $settings = null, $module_type = '' ) {
		if ( empty( $style ) || ! is_object( $style ) || empty( $selector ) ) {
			return;
		}

		$wrapper_map = array(
			'title'        => '.caf-builder-title-suffix-wrapper',
			'author'       => '.caf-builder-author-wrapper',
			'date'         => '.caf-builder-date-suffix-wrapper',
			'commentcount' => '.caf-builder-comment-suffix-wrapper',
			'button'       => '.caf-builder-button-suffix-wrapper',
			'customfield'  => '.caf-builder-custom-filed-suffix-wrapper',
		);

		$meta_selectors = array();
		if ( ! empty( $module_type ) && isset( $wrapper_map[ $module_type ] ) ) {
			$meta_selectors[] = $selector . ' ' . $wrapper_map[ $module_type ];
		} else {
			$meta_selectors[] = $selector . ' .caf-builder-title-suffix-wrapper';
		}

		$map = array(
			'meta'   => $meta_selectors,
			'prefix' => array(
				$selector . ' .caf-builder-prefix-col',
				$selector . ' .caf-builder-prefix-col-avatar img',
			),
			'suffix' => array(
				$selector . ' .caf-builder-suffix-col',
				$selector . ' .caf-builder-suffix-col-avatar img',
			),
		);

		foreach ( $map as $style_key => $selectors ) {
			if ( empty( $style->{$style_key} ) || ! is_object( $style->{$style_key} ) ) {
				continue;
			}

			foreach ( $selectors as $target_selector ) {
				$this->css_builder->add(
					$this->style_generator->generate_responsive_css(
						$style->{$style_key},
						'default',
						$target_selector,
						array(
							'background_image_mode' => 'conditional',
							'settings'              => $settings,
						)
					)
				);

				$this->css_builder->add(
					$this->style_generator->generate_responsive_css(
						$style->{$style_key},
						'hover',
						$target_selector . ':hover',
						array(
							'background_image_mode' => 'conditional',
							'settings'              => $settings,
						)
					)
				);
			}
		}
	}

	/**
	 * Build affix layout markup matching builder preview wrappers.
	 *
	 * @param string       $prefix_html      Prefix HTML.
	 * @param string       $main_html        Main value HTML (escaped).
	 * @param string       $main_value_class Main value wrapper class.
	 * @param string       $suffix_html      Suffix HTML.
	 * @param string       $wrapper_class    Suffix wrapper class when prefix is present.
	 * @param object|null  $style            Module style object.
	 * @param string       $main_value_tag   Semantic wrapper tag for the main value.
	 * @return string
	 */
	protected function build_affix_layout_content_html( $prefix_html, $main_html, $main_value_class, $suffix_html, $wrapper_class, $style, $main_value_tag = 'span' ) {
		$main_value_tag = $this->sanitize_semantic_value_tag( $main_value_tag );
		$has_prefix     = '' !== $prefix_html;
		$has_suffix     = '' !== $suffix_html;

		if ( ! $has_suffix ) {
			return $prefix_html . $this->wrap_main_value_html( $main_html, $main_value_class, $main_value_tag );
		}

		$layout_class = $this->get_module_style_justify_content( $style );

		if ( $has_prefix ) {
			$inner  = $this->wrap_main_value_html( $main_html, $main_value_class, $main_value_tag );
			$inner .= $suffix_html;

			return $prefix_html . '<div class="' . esc_attr( trim( $wrapper_class . ' caf-layout-' . $layout_class ) ) . '">' . $inner . '</div>';
		}

		return $this->wrap_main_value_html( $main_html, $main_value_class, $main_value_tag ) . $suffix_html;
	}

	/**
	 * Read module justify-content for affix wrapper layout class.
	 *
	 * @param object|null $style   Module style object.
	 * @param string      $default Default justify value.
	 * @return string
	 */
	protected function get_module_style_justify_content( $style, $default = 'flex-start' ) {
		if ( empty( $style ) || ! is_object( $style ) ) {
			return $default;
		}

		$device = $this->get_active_frontend_device_key();

		if ( isset( $style->{$device} ) && is_object( $style->{$device} ) && isset( $style->{$device}->default ) && is_object( $style->{$device}->default ) && isset( $style->{$device}->default->justifyContent ) ) {
			return sanitize_key( (string) $style->{$device}->default->justifyContent );
		}

		if ( isset( $style->desktop ) && is_object( $style->desktop ) && isset( $style->desktop->default ) && is_object( $style->desktop->default ) && isset( $style->desktop->default->justifyContent ) ) {
			return sanitize_key( (string) $style->desktop->default->justifyContent );
		}

		return $default;
	}

	/**
	 * Resolve active device key for frontend rendering.
	 *
	 * @return string
	 */
	protected function get_active_frontend_device_key() {
		$user_agent = isset( $_SERVER['HTTP_USER_AGENT'] ) ? strtolower( (string) wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ) : '';
		$is_tablet  = false !== strpos( $user_agent, 'ipad' )
			|| false !== strpos( $user_agent, 'tablet' )
			|| false !== strpos( $user_agent, 'kindle' )
			|| false !== strpos( $user_agent, 'silk' )
			|| false !== strpos( $user_agent, 'playbook' );

		if ( $is_tablet ) {
			return 'tablet';
		}

		if ( wp_is_mobile() ) {
			return 'mobile';
		}

		return 'desktop';
	}

	/**
	 * Render posts using an Elementor loop-item template.
	 *
	 * @param int $template_id Elementor library template ID.
	 * @return string
	 */
	protected function render_elementor_loop_posts( $template_id ) {
		if ( $template_id <= 0 || ! ( $this->query instanceof WP_Query ) ) {
			return $this->render_empty_message();
		}

		if ( ! $this->query->have_posts() ) {
			return $this->render_empty_message();
		}

		if ( ! did_action( 'elementor/loaded' ) || ! class_exists( '\Elementor\Plugin' ) ) {
			return $this->render_empty_message();
		}

		if ( ! defined( 'ELEMENTOR_PRO_VERSION' ) || ! class_exists( '\ElementorPro\Plugin' ) ) {
			return $this->render_empty_message();
		}

		ob_start();

		while ( $this->query->have_posts() ) {
			$this->query->the_post();
			global $post;

			$post_id = isset( $post->ID ) ? absint( $post->ID ) : 0;
			echo '<article class="caf-builder-post-area post-id-' . esc_attr( $post_id ) . '" data-post-id="' . esc_attr( $post_id ) . '">';
			echo \Elementor\Plugin::instance()->frontend->get_builder_content( $template_id, true ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo '</article>';
		}

		wp_reset_postdata();

		return ob_get_clean();
	}

	/**
	 * Build device visibility classes from builder settings.
	 *
	 * @param object|null $settings Settings object.
	 * @return string
	 */
	protected function get_visibility_classes( $settings ) {
		if ( empty( $settings ) || ! is_object( $settings ) || empty( $settings->visibility ) || ! is_object( $settings->visibility ) ) {
			return '';
		}

		$classes = array();
		if ( isset( $settings->visibility->desktop ) && 'true' === (string) $settings->visibility->desktop ) {
			$classes[] = 'caf-hide-desktop';
		}
		if ( isset( $settings->visibility->tablet ) && 'true' === (string) $settings->visibility->tablet ) {
			$classes[] = 'caf-hide-tablet';
		}
		if ( isset( $settings->visibility->mobile ) && 'true' === (string) $settings->visibility->mobile ) {
			$classes[] = 'caf-hide-mobile';
		}

		return empty( $classes ) ? '' : ' ' . implode( ' ', $classes );
	}

	/**
	 * Render inline icon.
	 *
	 * @param object $icon_data Icon settings.
	 * @param string $position  Icon position.
	 * @param string $style     Inline style.
	 * @return string
	 */
	protected function render_inline_icon( $icon_data, $position, $style = '' ) {
		if ( empty( $icon_data ) || ! is_object( $icon_data ) ) {
			return '';
		}

		if ( ! $this->is_truthy_setting( isset( $icon_data->visibility ) ? $icon_data->visibility : false ) ) {
			return '';
		}

		if ( empty( $icon_data->icon ) || empty( $icon_data->position ) || $position !== $icon_data->position ) {
			return '';
		}
		$icon_type  = isset( $icon_data->type ) ? (string) $icon_data->type : 'icon';
		$icon_value = $icon_data->icon;
		if ( 'svg' === $icon_type && is_object( $icon_value ) && ! empty( $icon_value->url ) ) {
			return '<img class="svg-dynamic" src="' . esc_url( $icon_value->url ) . '" alt="" style="' . esc_attr( $style ) . '" />';
		}
		if ( is_string( $icon_value ) && '' !== $icon_value ) {
			return '<i data-icon-name="' . esc_attr( $icon_value ) . '" value="' . esc_attr( $icon_value ) . '" class="' . esc_attr( $icon_value ) . '" style="' . esc_attr( $style ) . '"></i>';
		}
		return '';
	}

	/**
	 * Check if a setting value is truthy.
	 *
	 * @param mixed $value Setting value.
	 * @return bool
	 */
	protected function is_truthy_setting( $value ) {
		if ( true === $value || 1 === $value || '1' === (string) $value ) {
			return true;
		}
		if ( is_string( $value ) && 'true' === strtolower( $value ) ) {
			return true;
		}
		return false;
	}

	/**
	 * Whether a custom field value should be treated as empty for display.
	 *
	 * @param mixed $value Field value.
	 * @return bool
	 */
	protected function is_custom_field_display_value_empty( $value ) {
		if ( null === $value || false === $value ) {
			return true;
		}

		if ( is_string( $value ) ) {
			return '' === trim( $value );
		}

		if ( is_array( $value ) ) {
			return empty( $value );
		}

		if ( is_object( $value ) ) {
			return empty( get_object_vars( $value ) );
		}

		return false;
	}

	/**
	 * Get custom field value from ACF or post meta.
	 *
	 * @param string $field_key Field key/meta key.
	 * @param int    $post_id   Post ID.
	 * @return mixed
	 */
	protected function get_custom_field_value( $field_key, $post_id ) {
		if ( '' === $field_key ) {
			return '';
		}
		if ( function_exists( 'get_field' ) ) {
			$acf_value = get_field( $field_key, $post_id );
			if ( null !== $acf_value && '' !== $acf_value ) {
				return $acf_value;
			}
		}
		$meta_value = get_post_meta( $post_id, $field_key, true );
		return $meta_value;
	}

	/**
	 * Render wrapped icon.
	 *
	 * @param object $icon_data  Icon settings.
	 * @param string $position   Icon position.
	 * @param string $wrap_class Wrap class part.
	 * @param string $type_class Type class part.
	 * @param string $style      Inline style.
	 * @return string
	 */
	protected function render_wrapped_icon( $icon_data, $position, $wrap_class, $type_class, $style = '' ) {
		$icon = $this->render_inline_icon( $icon_data, $position, $style );

		if ( empty( $icon ) ) {
			return '';
		}

		return '<span class="caf-builder-post-layout-icon ' . esc_attr( $wrap_class ) . ' ' . esc_attr( $type_class ) . '">' . $icon . '</span>';
	}

	/**
	 * Build common hook context.
	 *
	 * @param array $extra Extra context values.
	 * @return array
	 */
	protected function get_hook_context( $extra = array() ) {
		$context = array(
			'builder_index'  => $this->data_handler->get_short_index(),
			'instance_class' => $this->data_handler->get_instance_class(),
			'post_type'      => $this->data_handler->get_post_type(),
			'is_ajax'        => wp_doing_ajax(),
		);

		if ( ! empty( $extra ) ) {
			$context = array_merge( $context, $extra );
		}

		return $context;
	}

	/**
	 * Resolve image alt text from attachment meta or post title.
	 *
	 * @param int $post_id       Post ID.
	 * @param int $attachment_id Attachment ID.
	 * @return string
	 */
	protected function get_post_image_alt_text( $post_id, $attachment_id = 0 ) {
		$attachment_id = absint( $attachment_id );
		if ( $attachment_id <= 0 ) {
			$attachment_id = absint( get_post_thumbnail_id( $post_id ) );
		}

		if ( $attachment_id > 0 ) {
			$alt = get_post_meta( $attachment_id, '_wp_attachment_image_alt', true );
			if ( is_string( $alt ) && '' !== trim( $alt ) ) {
				return trim( $alt );
			}
		}

		$title = get_the_title( $post_id );
		return is_string( $title ) ? trim( $title ) : '';
	}

	/**
	 * Get post author display name for accessible image labels.
	 *
	 * @param int $post_id Post ID.
	 * @return string
	 */
	protected function get_post_author_display_name( $post_id ) {
		$author_id = (int) get_post_field( 'post_author', $post_id );
		if ( $author_id <= 0 ) {
			return '';
		}

		$name = get_the_author_meta( 'display_name', $author_id );
		return is_string( $name ) ? trim( $name ) : '';
	}

	/**
	 * Build an SEO-friendly post image tag with alt and dimensions.
	 *
	 * @param string   $image_src     Image URL.
	 * @param string   $alt_text      Alt text.
	 * @param int      $attachment_id Attachment ID.
	 * @param array|null $image_data  wp_get_attachment_image_src data.
	 * @return string
	 */
	protected function build_post_image_tag( $image_src, $alt_text, $attachment_id = 0, $image_data = null, $fallback_src = '' ) {
		if ( ! is_string( $image_src ) || '' === $image_src ) {
			return '';
		}

		$attrs = array(
			'src' => $image_src,
			'alt' => is_string( $alt_text ) ? $alt_text : '',
		);

		if ( is_string( $fallback_src ) && '' !== $fallback_src && $fallback_src !== $image_src ) {
			$attrs['data-caf-fallback-src'] = $fallback_src;
			$attrs['onerror']                 = 'this.onerror=null;this.src=this.getAttribute(\'data-caf-fallback-src\');';
		}

		if ( is_array( $image_data ) && ! empty( $image_data[1] ) && ! empty( $image_data[2] ) ) {
			$attrs['width']  = absint( $image_data[1] );
			$attrs['height'] = absint( $image_data[2] );
		} elseif ( $attachment_id > 0 ) {
			$meta = wp_get_attachment_metadata( $attachment_id );
			if ( is_array( $meta ) && ! empty( $meta['width'] ) && ! empty( $meta['height'] ) ) {
				$attrs['width']  = absint( $meta['width'] );
				$attrs['height'] = absint( $meta['height'] );
			}
		}

		$html = '<img';
		foreach ( $attrs as $attr_key => $attr_value ) {
			if ( 'src' === $attr_key ) {
				$html .= ' src="' . esc_url( $attr_value ) . '"';
				continue;
			}
			if ( 'width' === $attr_key || 'height' === $attr_key ) {
				$html .= ' ' . esc_attr( $attr_key ) . '="' . esc_attr( (string) $attr_value ) . '"';
				continue;
			}
			$html .= ' ' . esc_attr( $attr_key ) . '="' . esc_attr( (string) $attr_value ) . '"';
		}
		$html .= ' />';

		return $html;
	}

	/**
	 * Sanitize semantic wrapper tag for affix/title output.
	 *
	 * @param string $tag     Requested tag.
	 * @param string $default Fallback tag.
	 * @return string
	 */
	protected function sanitize_semantic_value_tag( $tag, $default = 'span' ) {
		$allowed = array( 'span', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' );
		$tag     = strtolower( sanitize_key( (string) $tag ) );

		return in_array( $tag, $allowed, true ) ? $tag : $default;
	}

	/**
	 * Wrap main module value markup with a semantic tag and builder class.
	 *
	 * @param string $main_html        Main HTML (escaped).
	 * @param string $main_value_class Builder class.
	 * @param string $main_value_tag   Semantic tag.
	 * @return string
	 */
	protected function wrap_main_value_html( $main_html, $main_value_class, $main_value_tag ) {
		$main_value_tag = $this->sanitize_semantic_value_tag( $main_value_tag );

		return '<' . $main_value_tag . ' class="' . esc_attr( $main_value_class ) . '">' . $main_html . '</' . $main_value_tag . '>';
	}
}
