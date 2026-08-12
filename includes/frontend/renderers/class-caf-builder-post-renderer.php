<?php
/**
 * Frontend Builder Post Renderer
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Builder_Post_Renderer {

	/**
	 * Builder data handler.
	 *
	 * @var CAF_Builder_Data
	 */
	protected $data_handler;

	/**
	 * Builder CSS collector.
	 *
	 * @var CAF_Builder_Css
	 */
	protected $css_builder;
	/**
	 * Style generator instance.
	 *
	 * @var CAF_Builder_Style_Generator
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
	 * @param CAF_Builder_Data            $data_handler Builder data handler.
	 * @param CAF_Builder_Css             $css_builder  CSS collector.
	 * @param WP_Query                        $query        Query object.
	 * @param CAF_Builder_Style_Generator $style_generator Style generator.
	 */
	public function __construct( CAF_Builder_Data $data_handler, CAF_Builder_Css $css_builder, $query, CAF_Builder_Style_Generator $style_generator ) {
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
		$loop_data       = $this->data_handler->get_post_layout_loop_data();
		$dummy_image_url = $this->data_handler->get_dummy_image_url();

		$this->collect_post_layout_css( $loop_data );

		if ( ! ( $this->query instanceof WP_Query ) ) {
			return $this->render_empty_message();
		}

		if ( ! $this->query->have_posts() ) {
			return $this->render_empty_message();
		}

		ob_start();

		while ( $this->query->have_posts() ) {
			$this->query->the_post();

			global $post;

			$post_id   = isset( $post->ID ) ? absint( $post->ID ) : 0;
			$image_url = get_the_post_thumbnail_url( $post_id, 'full' );
			if ( is_string( $image_url ) && '' !== $image_url && function_exists( 'caf_normalize_frontend_media_url' ) ) {
				$image_url = caf_normalize_frontend_media_url( $image_url );
			}

			echo '<article class="caf-builder-post-area post-id-' . esc_attr( $post_id ) . '" data-post-id="' . esc_attr( $post_id ) . '">';

			if ( ! empty( $loop_data ) && is_array( $loop_data ) ) {
				foreach ( $loop_data as $row_key => $row ) {
					echo $this->render_row( $row, $row_key, $post_id, $image_url, $dummy_image_url ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				}
			}

			echo '</article>';
		}

		wp_reset_postdata();

		return ob_get_clean();
	}

	/**
	 * Collect row/column/module CSS from layout JSON (independent of post content).
	 *
	 * Ensures module styles are registered even when the first rendered post
	 * skips a module because its value is empty (e.g. custom field).
	 *
	 * @param array $loop_data Post layout rows from builder data.
	 * @return void
	 */
	protected function collect_post_layout_css( $loop_data ) {
		if ( $this->post_item_css_collected || empty( $loop_data ) || ! is_array( $loop_data ) ) {
			return;
		}

		if ( ! $this->css_builder->is_collection_enabled() ) {
			return;
		}

		foreach ( $loop_data as $row_key => $row ) {
			if ( empty( $row ) || ! is_object( $row ) || empty( $row->type ) || 'row' !== $row->type ) {
				continue;
			}

			$row_settings = isset( $row->settings ) ? $row->settings : new stdClass();
			$row_style    = isset( $row->style ) ? $row->style : null;
			$row_selector = '.caf-builder-post-area .caf-row-' . absint( $row_key );
			$this->collect_row_css( $row_style, $row_selector, $row_settings );

			$row_data = isset( $row->data ) && is_array( $row->data ) ? $row->data : array();
			foreach ( $row_data as $column_key => $column ) {
				if ( empty( $column ) || ! is_object( $column ) || empty( $column->type ) || 'column' !== $column->type ) {
					continue;
				}

				$column_settings = isset( $column->settings ) ? $column->settings : new stdClass();
				$column_style    = isset( $column->style ) ? $column->style : null;
				$column_selector = '.caf-builder-post-area .caf-row-' . absint( $row_key ) . ' .caf-column-' . absint( $column_key );
				$this->collect_column_css( $column_style, $column_selector, $column_settings );

				$column_data = isset( $column->data ) && is_array( $column->data ) ? $column->data : array();
				foreach ( $column_data as $module_key => $module ) {
					if ( empty( $module ) || ! is_object( $module ) ) {
						continue;
					}

					$module_type = isset( $module->key ) ? sanitize_key( $module->key ) : 'unknown';
					if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_use_post_module( $module_type ) ) {
						continue;
					}

					$module_settings = $this->resolve_module_settings_for_css(
						$module,
						$module_type,
						$row_key,
						$column_key,
						$module_key
					);
					$module_style    = isset( $module->style ) ? $module->style : null;
					$module_selector = '.caf-builder-post-area .caf-row-' . absint( $row_key ) . ' .caf-column-' . absint( $column_key ) . ' .caf-module-' . absint( $module_key );
					$this->collect_module_css( $module_style, $module_selector, $module_type, $module_settings );
					if ( 'categories' === $module_type ) {
						$this->collect_categories_term_css( $module_style, $module_selector, $module_settings );
					}
				}
			}
		}

		$this->post_item_css_collected = true;
	}

	/**
	 * Resolve module settings for layout-level CSS collection.
	 *
	 * @param object $module      Module object.
	 * @param string $module_type Module type slug.
	 * @param int    $row_key     Row key.
	 * @param int    $column_key  Column key.
	 * @param int    $module_key  Module key.
	 * @return object
	 */
	protected function resolve_module_settings_for_css( $module, $module_type, $row_key, $column_key, $module_key ) {
		$module_settings = isset( $module->settings ) ? $module->settings : new stdClass();
		$module_settings = caf_builder_apply_filters(
			'caf_builder_module_settings',
			$module_settings,
			$this->get_hook_context(
				array(
					'scope'       => 'post_layout_css',
					'module_type' => $module_type,
					'module'      => $module,
					'row_key'     => $row_key,
					'column_key'  => $column_key,
					'module_key'  => $module_key,
					'post_id'     => 0,
				)
			)
		);

		if ( ! is_object( $module_settings ) ) {
			$module_settings = is_array( $module_settings ) ? (object) $module_settings : new stdClass();
		}

		return $module_settings;
	}

	/**
	 * Collect post-item CSS from layout JSON when the query has no posts.
	 *
	 * @param array  $loop_data       Post layout rows from builder data.
	 * @param string $dummy_image_url Dummy image URL.
	 * @return void
	 */
	protected function maybe_collect_post_item_css_without_posts( $loop_data, $dummy_image_url ) {
		$this->collect_post_layout_css( $loop_data );
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

		$module_type = isset( $module->key ) ? sanitize_key( $module->key ) : 'unknown';
		if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_use_post_module( $module_type ) ) {
			return '';
		}

		$module_settings = isset( $module->settings ) ? $module->settings : new stdClass();
		$module_settings = caf_builder_apply_filters(
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
		if ( class_exists( 'CAF_Builder_Tier' ) ) {
			$module_settings = CAF_Builder_Tier::sanitize_post_module_settings( $module_type, $module_settings );
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
		$module_content = caf_builder_apply_filters(
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
		$module_content = caf_builder_apply_filters(
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

		$is_link_root = $this->is_link_root_post_module( $module_type, $module_settings );

		if ( $is_link_root ) {
			if ( 'woo_add_to_cart' === $module_type ) {
				$module_class .= ' caf-module-button';
			}

			$html = $this->apply_link_root_module_shell(
				$module_content,
				$module_class,
				array(
					'data-module-type' => $module_type,
				),
				$module_bg_style
			);

			return caf_builder_apply_filters(
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

		$html = '<div class="' . esc_attr( $module_class ) . '"';

		if ( ! empty( $module_bg_style ) ) {
			$html .= ' style="' . esc_attr( $module_bg_style ) . '"';
		}

		$html .= ' data-module-type="' . esc_attr( $module_type ) . '">';
		$html .= $module_content;
		$html .= '</div>';

		return caf_builder_apply_filters(
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

			case 'woo_product_image':
				return class_exists( 'CAF_Free_Woo' )
					? CAF_Free_Woo::render_product_image( $module, $post_id, $dummy_image_url )
					: '';

			case 'product_price':
				return class_exists( 'CAF_Free_Woo' )
					? CAF_Free_Woo::render_product_price( $module, $post_id )
					: '';

			case 'woo_add_to_cart':
				return class_exists( 'CAF_Free_Woo' )
					? CAF_Free_Woo::render_add_to_cart( $module, $post_id )
					: '';

			case 'badges':
				return class_exists( 'CAF_Free_Woo' )
					? CAF_Free_Woo::render_badges( $module, $post_id )
					: '';

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

		$fallback_src = ! empty( $settings->placeholder_image ) ? (string) $settings->placeholder_image : $dummy_image_url;

		if ( '' === $image_src ) {
			if ( is_array( $image_data ) && ! empty( $image_data[0] ) ) {
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
			$alt_text           = is_string( $avatar_alt ) && '' !== trim( $avatar_alt ) ? trim( $avatar_alt ) : __( 'Author avatar', 'category-ajax-filter' );
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

		if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_use_feature( 'post_prefix_suffix' ) ) {
			$prefix = (object) array(
				'is_enable' => 'false',
				'meta_type' => 'text',
				'meta_text' => '',
			);
			$suffix = (object) array(
				'is_enable' => 'true',
				'meta_type' => 'text',
				'meta_text' => 'comments',
			);
		}

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
			$excerpt_length = (int) $settings->excerptLength;
		}

		$post = get_post( $post_id );

		if ( $html_render ) {
			$html_source = '';
			if ( $post && '' !== trim( (string) $post->post_content ) ) {
				$html_source = (string) $post->post_content;
				$html_source = strip_shortcodes( $html_source );
				if ( function_exists( 'excerpt_remove_blocks' ) ) {
					$html_source = excerpt_remove_blocks( $html_source );
				}
			}
			if ( '' === trim( wp_strip_all_tags( $html_source ) ) ) {
				$html_source = (string) get_the_excerpt( $post_id );
			}

			$trimmed = $this->trim_html_excerpt_to_words( $html_source, $excerpt_length );
			return wp_kses_post( $trimmed );
		}

		$raw_excerpt = wp_strip_all_tags( (string) get_the_excerpt( $post_id ) );
		$description = $post ? wp_strip_all_tags( (string) $post->post_content ) : '';
		$source_text = '' !== trim( $raw_excerpt ) ? $raw_excerpt : $description;

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
	 * Trim HTML by word count while keeping tags balanced (matches builder ModuleExcerpt).
	 *
	 * @param string $html       Source HTML.
	 * @param int    $word_limit Word limit.
	 * @return string
	 */
	protected function trim_html_excerpt_to_words( $html, $word_limit ) {
		$content = (string) $html;
		if ( '' === trim( $content ) ) {
			return '';
		}
		if ( $word_limit <= 0 ) {
			return $content;
		}

		$words     = 0;
		$output    = '';
		$open_tags = array();
		$truncated = false;

		if ( ! preg_match_all( '/(<[^>]+?>|[^<>\s]+|\s+)/u', $content, $tokens ) || empty( $tokens[0] ) ) {
			return $this->trim_excerpt_to_words( wp_strip_all_tags( $content ), $word_limit );
		}

		foreach ( $tokens[0] as $token ) {
			if ( preg_match( '/^<[^>]+>$/', $token ) ) {
				$output .= $token;
				if ( preg_match( '/^<([a-z0-9]+)(?![^>]*\/>)(?:\s[^>]*)?>$/i', $token, $matches ) ) {
					$tag = strtolower( $matches[1] );
					if ( ! in_array( $tag, array( 'br', 'hr', 'img', 'input', 'meta', 'link', 'source', 'area', 'base', 'col', 'embed', 'wbr' ), true ) ) {
						$open_tags[] = $tag;
					}
				} elseif ( preg_match( '/^<\/([a-z0-9]+)>$/i', $token, $matches ) ) {
					array_pop( $open_tags );
				}
			} elseif ( '' === trim( $token ) ) {
				$output .= $token;
			} else {
				$output .= $token;
				++$words;
				if ( $words >= $word_limit ) {
					$truncated = true;
					break;
				}
			}
		}

		while ( ! empty( $open_tags ) ) {
			$output .= '</' . array_pop( $open_tags ) . '>';
		}

		if ( $truncated ) {
			$output .= '...';
		}

		return trim( $output );
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
		$button_text = ! empty( $settings->changeButtonValue ) ? $settings->changeButtonValue : __( 'Read More', 'category-ajax-filter' );
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
				$cls = 'caf-module-term-name caf-module-term-name-' . esc_attr( $idx ) . ' term-tax-' . esc_attr( $taxonomy );
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
	 * Render empty state message.
	 *
	 * @return string
	 */
	protected function render_empty_message() {
		$empty_message = __( 'No Result Found', 'category-ajax-filter' );
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
	 * Collect categories term item CSS from layout JSON.
	 *
	 * @param mixed  $style    Module style object.
	 * @param string $selector Module selector.
	 * @param object $settings Module settings.
	 * @return void
	 */
	protected function collect_categories_term_css( $style, $selector, $settings = null ) {
		$categories = isset( $settings->categories ) ? $settings->categories : array();

		if ( is_string( $categories ) ) {
			$categories = array( $categories );
		}
		if ( empty( $categories ) || ! is_array( $categories ) ) {
			return;
		}

		$term_selector = $selector . ' .caf-module-term-name';
		$term_style    = ( ! empty( $style ) && is_object( $style ) && ! empty( $style->meta ) && is_object( $style->meta ) ) ? $style->meta : $style;

		if ( empty( $term_style ) ) {
			return;
		}

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

		$link_modules   = array( 'title', 'button', 'woo_add_to_cart' );
		$is_link_root   = $this->is_link_root_post_module( $module_type, $settings );
		$is_link_module = in_array( $module_type, $link_modules, true ) && (
			'woo_add_to_cart' === $module_type
			|| $this->is_truthy_setting( isset( $settings->link->visibility ) ? $settings->link->visibility : false )
		);

		if ( $is_link_module ) {
			if ( $is_link_root ) {
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
			} else {
				$link_selector       = $selector . ' a';
				$link_hover_selector = $selector . ' a:hover';
				if ( 'woo_add_to_cart' === $module_type ) {
					$link_selector       = $selector . ' a.caf-woo-add-to-cart-button';
					$link_hover_selector = $selector . ' a.caf-woo-add-to-cart-button:hover';
				}

				$this->css_builder->add(
					$this->style_generator->generate_responsive_css(
						$style,
						'default',
						$link_selector,
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
						$link_hover_selector,
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
			}
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
			'title'           => '.caf-builder-title-suffix-wrapper',
			'author'          => '.caf-builder-author-wrapper',
			'date'            => '.caf-builder-date-suffix-wrapper',
			'commentcount'    => '.caf-builder-comment-suffix-wrapper',
			'button'          => '.caf-builder-button-suffix-wrapper',
			'product_price'   => '.caf-builder-price-suffix-wrapper',
			'woo_add_to_cart' => '.caf-builder-button-suffix-wrapper',
			'badges'          => '.caf-builder-badges-suffix-wrapper',
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

		if ( class_exists( 'CAF_Builder_Tier' ) && ! CAF_Builder_Tier::can_use_feature( 'label_show_icon' ) ) {
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
	 * Whether the module root is the anchor (no wrapper div), matching builder preview.
	 *
	 * @param string $module_type     Module key.
	 * @param object $module_settings Module settings.
	 * @return bool
	 */
	protected function is_link_root_post_module( $module_type, $module_settings ) {
		if ( 'woo_add_to_cart' === $module_type ) {
			return true;
		}

		if ( 'button' === $module_type ) {
			return $this->is_truthy_setting(
				isset( $module_settings->link->visibility ) ? $module_settings->link->visibility : false
			);
		}

		return false;
	}

	/**
	 * Merge module shell classes/attributes onto the root anchor for link-root modules.
	 *
	 * @param string $html          Module HTML starting with <a>.
	 * @param string $module_class  Module classes for the shell.
	 * @param array  $attributes    Extra data attributes.
	 * @param string $inline_style  Optional inline style.
	 * @return string
	 */
	protected function apply_link_root_module_shell( $html, $module_class, $attributes = array(), $inline_style = '' ) {
		$html = trim( (string) $html );
		if ( '' === $html || false === stripos( $html, '<a' ) ) {
			return $html;
		}

		$replaced = preg_replace_callback(
			'/<a\b([^>]*)>/i',
			function ( $matches ) use ( $module_class, $attributes, $inline_style ) {
				$attr_string = $matches[1];

				if ( preg_match( '/\bclass=(["\'])(.*?)\1/i', $attr_string, $class_match ) ) {
					$merged_class = trim( $module_class . ' ' . $class_match[2] );
					$attr_string  = preg_replace(
						'/\bclass=(["\'])(.*?)\1/i',
						'class="' . esc_attr( $merged_class ) . '"',
						$attr_string,
						1
					);
				} else {
					$attr_string .= ' class="' . esc_attr( $module_class ) . '"';
				}

				foreach ( $attributes as $attr_name => $attr_value ) {
					if ( '' === (string) $attr_value ) {
						continue;
					}
					$attr_name = preg_replace( '/[^a-zA-Z0-9_\-:]/', '', (string) $attr_name );
					$attr_string .= sprintf(
						' %s="%s"',
						esc_attr( $attr_name ),
						esc_attr( (string) $attr_value )
					);
				}

				if ( '' !== trim( (string) $inline_style ) ) {
					if ( preg_match( '/\bstyle=(["\'])(.*?)\1/i', $attr_string, $style_match ) ) {
						$merged_style = trim( $style_match[2] . ' ' . $inline_style );
						$attr_string  = preg_replace(
							'/\bstyle=(["\'])(.*?)\1/i',
							'style="' . esc_attr( $merged_style ) . '"',
							$attr_string,
							1
						);
					} else {
						$attr_string .= ' style="' . esc_attr( $inline_style ) . '"';
					}
				}

				return '<a' . $attr_string . '>';
			},
			$html,
			1
		);

		return is_string( $replaced ) ? $replaced : $html;
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

		if ( function_exists( 'caf_normalize_frontend_media_url' ) ) {
			$image_src = caf_normalize_frontend_media_url( $image_src );
			if ( is_string( $fallback_src ) && '' !== $fallback_src ) {
				$fallback_src = caf_normalize_frontend_media_url( $fallback_src );
			}
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
