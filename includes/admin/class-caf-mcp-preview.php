<?php
/**
 * Last-screen preview layers (Layout Settings / Design / Advanced).
 * Virtual ids like preview:container map onto preview_template_data.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'CAF_MCP_Preview', false ) ) {

class CAF_MCP_Preview {

	const ID_PREFIX = 'preview:';

	/**
	 * Stable last-screen layer ids (Design / Advanced / Settings).
	 *
	 * @return array<string, string>
	 */
	public static function layer_titles() {
		return array(
			'container'  => 'Outer Wrapper (.caf-builder-preview-template-container)',
			'filter'     => 'Filter area',
			'post'       => 'Post layout (grid / slider / list)',
			'post_inner' => 'Post inner (column / row gap)',
			'float'      => 'Floating filter button',
			'loader'     => 'Loader',
			'extra'      => 'Misc extra (order, masonry, filter position, float panel)',
		);
	}

	/**
	 * @param string $id Element id.
	 * @return bool
	 */
	public static function is_id( $id ) {
		$id = strtolower( (string) $id );
		return 0 === strpos( $id, self::ID_PREFIX );
	}

	/**
	 * @param string $id Element id.
	 * @return string Normalized target (container, filter, dnd:pagination, …).
	 */
	public static function normalize_target( $id ) {
		$raw = strtolower( trim( (string) $id ) );
		if ( 0 === strpos( $raw, self::ID_PREFIX ) ) {
			$raw = substr( $raw, strlen( self::ID_PREFIX ) );
		}
		$aliases = array(
			'outer'              => 'container',
			'wrapper'            => 'container',
			'preview_container'  => 'container',
			'preview-container'  => 'container',
			'filter_area'        => 'filter',
			'post_area'          => 'post',
			'grid'               => 'post',
			'inner'              => 'post_inner',
			'float_button'       => 'float',
			'meta'               => 'float',
			'pagination'         => 'dnd:pagination',
			'sorting'            => 'dnd:sorting',
			'selected'           => 'dnd:selected',
			'result_count'       => 'dnd:result_count',
			'filter_top'         => 'dnd:filter_top',
			'filter_bottom'      => 'dnd:filter_bottom',
			'post_top'           => 'dnd:post_top',
			'post_bottom'        => 'dnd:post_bottom',
		);
		if ( isset( $aliases[ $raw ] ) ) {
			return $aliases[ $raw ];
		}
		return $raw;
	}

	/**
	 * Lean last-screen nodes for caf-get-layout-structure.
	 *
	 * @param object $doc Layout.
	 * @param bool   $include_content Include settings / style hint.
	 * @return array<int, array<string, mixed>>
	 */
	public static function catalog( $doc, $include_content = false ) {
		self::ensure_document( $doc );
		$out = array();
		foreach ( self::layer_titles() as $key => $title ) {
			$item = array(
				'id'    => self::ID_PREFIX . $key,
				'type'  => 'preview',
				'key'   => $key,
				'title' => $title,
				'tab'   => ( 'extra' === $key || 'loader' === $key ) ? 'settings' : 'design',
			);
			if ( $include_content ) {
				$item['settings']    = self::lean_layer_settings( $doc, $key );
				$item['style_hint']  = self::style_hint( self::style_node( $doc, $key ) );
			}
			$out[] = $item;
		}
		$dnd = self::dnd_list( $doc );
		foreach ( $dnd as $entry ) {
			$key  = isset( $entry['key'] ) ? (string) $entry['key'] : '';
			$kind = isset( $entry['kind'] ) ? (string) $entry['kind'] : 'item';
			if ( '' === $key ) {
				continue;
			}
			$item = array(
				'id'    => self::ID_PREFIX . 'dnd:' . $key,
				'type'  => 'preview',
				'key'   => $key,
				'title' => isset( $entry['label'] ) ? (string) $entry['label'] : $key,
				'tab'   => 'design',
				'zone'  => $kind,
				'kind'  => $kind,
			);
			if ( 'item' === $kind ) {
				$parent = isset( $entry['parent'] ) ? (string) $entry['parent'] : '';
				if ( '' !== $parent ) {
					$item['parent_id'] = self::ID_PREFIX . 'dnd:' . $parent;
					$item['zone']      = $parent;
				}
				if ( isset( $entry['index'] ) ) {
					$item['index'] = (int) $entry['index'];
				}
				$item['enabled'] = ! empty( $entry['enabled'] );
			}
			if ( $include_content && isset( $entry['node'] ) && is_object( $entry['node'] ) ) {
				$item['settings']   = isset( $entry['node']->settings ) ? $entry['node']->settings : new stdClass();
				$item['style_hint'] = self::style_hint( $entry['node'] );
			}
			$out[] = $item;
		}
		return $out;
	}

	/**
	 * @param object $doc Layout.
	 * @param string $id  preview:… id.
	 * @return array<string, mixed>|null
	 */
	public static function find_catalog_node( $doc, $id ) {
		$want = strtolower( (string) $id );
		foreach ( self::catalog( $doc, true ) as $node ) {
			if ( isset( $node['id'] ) && strtolower( (string) $node['id'] ) === $want ) {
				return $node;
			}
		}
		return null;
	}

	/**
	 * @param object $doc Layout.
	 * @param string $id  Element id.
	 * @param array  $op  Operation.
	 * @return array<string, mixed>|WP_Error
	 */
	public static function apply_style( $doc, $id, $op ) {
		$node = self::style_node_for_id( $doc, $id );
		if ( is_wp_error( $node ) ) {
			return $node;
		}
		if ( ! class_exists( 'CAF_MCP_Css', false ) ) {
			return new WP_Error( 'caf_mcp_css_missing', __( 'CSS converter is not loaded.', 'category-ajax-filter' ), array( 'status' => 500 ) );
		}
		$css    = isset( $op['css'] ) ? (string) $op['css'] : '';
		$part   = isset( $op['part'] ) ? (string) $op['part'] : 'self';
		$device = isset( $op['device'] ) ? (string) $op['device'] : 'desktop';
		$target = self::normalize_target( $id );
		if ( 0 === strpos( $target, 'dnd:' ) ) {
			$part = self::chrome_style_part( substr( $target, 4 ), $part );
		}
		$result = CAF_MCP_Css::apply_to_node( $node, $part, $css, $device );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		$result['element_id'] = self::ID_PREFIX . self::normalize_target( $id );
		return $result;
	}

	/**
	 * Design → Layout on a last-screen layer.
	 *
	 * @param object $doc Layout.
	 * @param string $id  Element id.
	 * @param array  $op  Operation.
	 * @return array<string, mixed>|WP_Error
	 */
	public static function apply_layout( $doc, $id, $op ) {
		$node = self::style_node_for_id( $doc, $id );
		if ( is_wp_error( $node ) ) {
			return $node;
		}
		if ( ! class_exists( 'CAF_MCP_Document', false ) ) {
			return new WP_Error( 'caf_mcp_document_missing', __( 'Layout helper is not loaded.', 'category-ajax-filter' ), array( 'status' => 500 ) );
		}
		$op['allow_preview'] = true;
		$target              = self::normalize_target( $id );
		$hide                = array();
		if ( 0 === strpos( $target, 'dnd:' ) ) {
			$hide = self::apply_hide_flags( $node, $op );
		}
		$result = CAF_MCP_Document::apply_frame_layout( $node, $op );
		if ( is_wp_error( $result ) ) {
			if ( ! empty( $hide ) && 'caf_mcp_missing_layout' === $result->get_error_code() ) {
				return array(
					'action'     => 'layout',
					'element_id' => self::ID_PREFIX . $target,
					'settings'   => $hide,
				);
			}
			return $result;
		}
		if ( ! empty( $hide ) ) {
			$result['settings'] = $hide;
		}
		$result['element_id'] = self::ID_PREFIX . $target;
		return $result;
	}

	/**
	 * Settings / Advanced fields on a last-screen layer.
	 *
	 * @param object               $doc Layout.
	 * @param string               $id  Element id.
	 * @param array<string, mixed> $settings Patch.
	 * @return array<string, mixed>|WP_Error
	 */
	public static function apply_update( $doc, $id, $settings ) {
		$target = self::normalize_target( $id );
		self::ensure_document( $doc );
		if ( ! is_array( $settings ) || empty( $settings ) ) {
			return new WP_Error(
				'caf_mcp_missing_settings',
				__( 'Pass settings for this last-screen layer.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		if ( 0 === strpos( $target, 'dnd:' ) ) {
			$item = self::find_dnd_node( $doc, substr( $target, 4 ) );
			if ( ! $item ) {
				return self::unknown_target( $id );
			}
			return self::patch_chrome( $item, $settings, $id );
		}
		switch ( $target ) {
			case 'container':
				return self::patch_container( $doc, $settings, $id );
			case 'filter':
				$node = self::filter_node( $doc );
				return self::patch_object_fields( $node, $settings, array( 'custom_class', 'custom_css', 'nonce' ), $id );
			case 'post':
				return self::patch_post( $doc, $settings, $id );
			case 'post_inner':
				return new WP_Error(
					'caf_mcp_use_style',
					__( 'Post inner gaps are Design fields. Use action=style (column-gap / row-gap) on preview:post_inner.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			case 'float':
				$node = self::float_node( $doc );
				return self::patch_object_fields( $node, $settings, array( 'custom_class' ), $id );
			case 'loader':
				return self::patch_loader( $doc, $settings, $id );
			case 'extra':
				return self::patch_extra( $doc, $settings, $id );
		}
		return self::unknown_target( $id );
	}

	/**
	 * Flat last-screen fields on caf-manage-layout-settings.
	 *
	 * @param object               $doc Layout.
	 * @param array<string, mixed> $patch Patch.
	 * @return array<string, mixed>|WP_Error
	 */
	public static function apply_settings_patch( $doc, $patch ) {
		if ( class_exists( 'CAF_MCP_Tier', false ) ) {
			$blocked = CAF_MCP_Tier::reject_pro_settings( $patch );
			if ( is_wp_error( $blocked ) ) {
				return $blocked;
			}
		}
		$changed = array();
		self::ensure_document( $doc );

		$css_target = '';
		if ( array_key_exists( 'target', $patch ) ) {
			$css_target = self::normalize_target( (string) $patch['target'] );
		} elseif ( array_key_exists( 'preview_target', $patch ) ) {
			$css_target = self::normalize_target( (string) $patch['preview_target'] );
		}
		if ( array_key_exists( 'css', $patch ) ) {
			if ( '' === $css_target ) {
				$css_target = 'container';
			}
			$styled = self::apply_style(
				$doc,
				self::ID_PREFIX . $css_target,
				array(
					'css'    => $patch['css'],
					'device' => isset( $patch['device'] ) ? $patch['device'] : 'desktop',
					'part'   => isset( $patch['part'] ) ? $patch['part'] : 'self',
				)
			);
			if ( is_wp_error( $styled ) ) {
				return $styled;
			}
			$changed['css']    = $styled;
			$changed['target'] = self::ID_PREFIX . $css_target;
		} elseif ( '' !== $css_target && self::patch_has_layout_keys( $patch ) ) {
			$laid = self::apply_layout( $doc, self::ID_PREFIX . $css_target, $patch );
			if ( is_wp_error( $laid ) ) {
				return $laid;
			}
			$changed['layout'] = $laid;
			$changed['target'] = self::ID_PREFIX . $css_target;
		}

		$misc = self::apply_misc_extra_aliases( $doc, $patch );
		if ( is_wp_error( $misc ) ) {
			return $misc;
		}
		$changed = array_merge( $changed, $misc );

		$post = self::apply_post_aliases( $doc, $patch );
		if ( is_wp_error( $post ) ) {
			return $post;
		}
		$changed = array_merge( $changed, $post );

		$loader = self::apply_loader_aliases( $doc, $patch );
		if ( is_wp_error( $loader ) ) {
			return $loader;
		}
		$changed = array_merge( $changed, $loader );

		$adv = self::apply_advanced_aliases( $doc, $patch );
		if ( is_wp_error( $adv ) ) {
			return $adv;
		}
		$changed = array_merge( $changed, $adv );

		$offcanvas = self::apply_float_offcanvas( $doc, $patch );
		if ( is_wp_error( $offcanvas ) ) {
			return $offcanvas;
		}
		$changed = array_merge( $changed, $offcanvas );

		$chrome = self::apply_layout_control_aliases( $doc, $patch );
		if ( is_wp_error( $chrome ) ) {
			return $chrome;
		}
		$changed = array_merge( $changed, $chrome );

		return $changed;
	}

	/**
	 * @param object $doc Layout.
	 * @return object misc extra.
	 */
	public static function ensure_misc_extra( $doc ) {
		self::ensure_document( $doc );
		$misc = $doc->common_data->preview_template_data->misc_preview_data;
		if ( ! isset( $misc->extra ) || ! is_object( $misc->extra ) ) {
			$misc->extra = new stdClass();
		}
		return $misc->extra;
	}

	/**
	 * @param string $action Action.
	 * @return WP_Error
	 */
	public static function immutable_error( $action ) {
		return new WP_Error(
			'caf_mcp_preview_immutable',
			sprintf(
				/* translators: %s: action name */
				__( 'Last-screen layers cannot be %s. Style them with action=style / layout / update and preview:container (or another preview:* id from structure).', 'category-ajax-filter' ),
				sanitize_key( (string) $action )
			),
			array( 'status' => 400 )
		);
	}

	/**
	 * @param object $doc Layout.
	 * @return void
	 */
	private static function ensure_document( $doc ) {
		if ( ! is_object( $doc ) ) {
			return;
		}
		if ( class_exists( 'CAF_MCP_Compose', false ) ) {
			CAF_MCP_Compose::fill_missing_preview_template_defaults( $doc );
		}
		if ( ! isset( $doc->common_data ) || ! is_object( $doc->common_data ) ) {
			$doc->common_data = new stdClass();
		}
		if ( ! isset( $doc->common_data->preview_template_data ) || ! is_object( $doc->common_data->preview_template_data ) ) {
			$doc->common_data->preview_template_data = new stdClass();
		}
		$preview = $doc->common_data->preview_template_data;
		if ( ! isset( $preview->misc_preview_data ) || ! is_object( $preview->misc_preview_data ) ) {
			$preview->misc_preview_data = new stdClass();
		}
		if ( ! isset( $preview->post_preview_data ) || ! is_object( $preview->post_preview_data ) ) {
			$preview->post_preview_data = new stdClass();
		}
		if ( ! isset( $preview->filter_preview_data ) || ! is_object( $preview->filter_preview_data ) ) {
			$preview->filter_preview_data = new stdClass();
		}
	}

	/**
	 * @param object $doc Layout.
	 * @param string $id  Element id.
	 * @return object|WP_Error Node with a style tree.
	 */
	private static function style_node_for_id( $doc, $id ) {
		$target = self::normalize_target( $id );
		self::ensure_document( $doc );
		if ( 0 === strpos( $target, 'dnd:' ) ) {
			$item = self::find_dnd_node( $doc, substr( $target, 4 ) );
			return $item ? $item : self::unknown_target( $id );
		}
		$node = self::style_node( $doc, $target );
		return $node ? $node : self::unknown_target( $id );
	}

	/**
	 * @param object $doc    Layout.
	 * @param string $target Normalized target.
	 * @return object|null
	 */
	private static function style_node( $doc, $target ) {
		$preview = isset( $doc->common_data->preview_template_data ) ? $doc->common_data->preview_template_data : null;
		if ( ! is_object( $preview ) ) {
			return null;
		}
		$misc = isset( $preview->misc_preview_data ) && is_object( $preview->misc_preview_data ) ? $preview->misc_preview_data : null;
		switch ( $target ) {
			case 'container':
				if ( ! $misc ) {
					return null;
				}
				if ( ! isset( $misc->container ) || ! is_object( $misc->container ) ) {
					$misc->container = new stdClass();
				}
				return $misc->container;
			case 'filter':
				return self::filter_node( $doc );
			case 'post':
				return self::post_layout_node( $doc );
			case 'post_inner':
				$post = isset( $preview->post_preview_data ) && is_object( $preview->post_preview_data ) ? $preview->post_preview_data : null;
				if ( ! $post ) {
					return null;
				}
				if ( ! isset( $post->inner ) || ! is_object( $post->inner ) ) {
					$post->inner = new stdClass();
				}
				return $post->inner;
			case 'float':
				return self::float_node( $doc );
			case 'loader':
				if ( ! $misc ) {
					return null;
				}
				if ( ! isset( $misc->loader ) || ! is_object( $misc->loader ) ) {
					$misc->loader = new stdClass();
				}
				if ( ! isset( $misc->loader->icon_data ) || ! is_object( $misc->loader->icon_data ) ) {
					$misc->loader->icon_data = new stdClass();
				}
				return $misc->loader->icon_data;
			case 'extra':
				return null;
		}
		return null;
	}

	/**
	 * @param object $doc Layout.
	 * @return object
	 */
	private static function filter_node( $doc ) {
		$preview = $doc->common_data->preview_template_data;
		if ( ! isset( $preview->filter_preview_data ) || ! is_object( $preview->filter_preview_data ) ) {
			$preview->filter_preview_data = new stdClass();
		}
		return $preview->filter_preview_data;
	}

	/**
	 * @param object $doc Layout.
	 * @return object
	 */
	private static function float_node( $doc ) {
		$misc = $doc->common_data->preview_template_data->misc_preview_data;
		if ( ! isset( $misc->meta ) || ! is_object( $misc->meta ) ) {
			$misc->meta = new stdClass();
		}
		return $misc->meta;
	}

	/**
	 * @param object $doc Layout.
	 * @return object
	 */
	private static function post_layout_node( $doc ) {
		$post = $doc->common_data->preview_template_data->post_preview_data;
		$type = isset( $post->layout_type ) ? sanitize_key( (string) $post->layout_type ) : 'grid';
		if ( ! in_array( $type, array( 'grid', 'slider', 'list' ), true ) ) {
			$type = 'grid';
		}
		if ( ! isset( $post->{$type} ) || ! is_object( $post->{$type} ) ) {
			$post->{$type} = new stdClass();
		}
		return $post->{$type};
	}

	/**
	 * @param object $doc Layout.
	 * @param string $key Zone or item key.
	 * @return object|null
	 */
	private static function find_dnd_node( $doc, $key ) {
		$key  = sanitize_key( (string) $key );
		$list = self::dnd_list( $doc );
		foreach ( $list as $entry ) {
			if ( isset( $entry['key'] ) && (string) $entry['key'] === $key && isset( $entry['node'] ) ) {
				return $entry['node'];
			}
		}
		return null;
	}

	/**
	 * @param object $doc Layout.
	 * @return array<int, array<string, mixed>>
	 */
	private static function dnd_list( $doc ) {
		$out = array();
		$dnd = array();
		if ( isset( $doc->common_data->preview_template_data->misc_preview_data->dnd_column_data ) ) {
			$dnd = $doc->common_data->preview_template_data->misc_preview_data->dnd_column_data;
		}
		if ( ! is_array( $dnd ) ) {
			return $out;
		}
		foreach ( $dnd as $zone ) {
			if ( ! is_object( $zone ) ) {
				continue;
			}
			$zone_key = isset( $zone->key ) ? (string) $zone->key : '';
			if ( '' !== $zone_key ) {
				$out[] = array(
					'key'   => $zone_key,
					'label' => isset( $zone->label ) ? (string) $zone->label : $zone_key,
					'kind'  => 'zone',
					'node'  => $zone,
				);
			}
			if ( empty( $zone->data ) || ! is_array( $zone->data ) ) {
				continue;
			}
			foreach ( $zone->data as $item_index => $item ) {
				if ( ! is_object( $item ) || ! isset( $item->key ) ) {
					continue;
				}
				$item_key = (string) $item->key;
				$enabled  = true;
				if ( isset( $item->settings ) && is_object( $item->settings ) && isset( $item->settings->is_enable ) ) {
					$enabled = ( 'true' === (string) $item->settings->is_enable );
				}
				$out[] = array(
					'key'     => $item_key,
					'label'   => isset( $item->label ) ? (string) $item->label : $item_key,
					'kind'    => 'item',
					'node'    => $item,
					'parent'  => $zone_key,
					'index'   => (int) $item_index,
					'enabled' => $enabled,
				);
			}
		}
		return $out;
	}

	/**
	 * @param object $node Style-bearing object.
	 * @return array<string, mixed>
	 */
	private static function style_hint( $node ) {
		if ( ! is_object( $node ) || ! isset( $node->style ) || ! is_object( $node->style ) ) {
			return array();
		}
		$style = $node->style;
		if ( isset( $style->container ) && is_object( $style->container ) ) {
			$style = $style->container;
		}
		$default = isset( $style->desktop->default ) && is_object( $style->desktop->default ) ? $style->desktop->default : null;
		if ( ! $default ) {
			return array();
		}
		$hint = array();
		foreach ( array( 'backgroundColor', 'width', 'display', 'flexFlow', 'gap', 'columnGap', 'rowGap', 'paddingTop' ) as $prop ) {
			if ( isset( $default->{$prop} ) ) {
				$hint[ $prop ] = $default->{$prop};
			}
		}
		return $hint;
	}

	/**
	 * @param object $doc    Layout.
	 * @param string $target Target key.
	 * @return object
	 */
	private static function lean_layer_settings( $doc, $target ) {
		$preview = $doc->common_data->preview_template_data;
		$misc    = $preview->misc_preview_data;
		switch ( $target ) {
			case 'container':
				$c = isset( $misc->container ) && is_object( $misc->container ) ? $misc->container : new stdClass();
				return (object) array(
					'custom_class' => isset( $c->custom_class ) ? (string) $c->custom_class : '',
					'nonce'        => isset( $c->nonce ) ? (string) $c->nonce : 'false',
				);
			case 'filter':
				$f = $preview->filter_preview_data;
				return (object) array(
					'custom_class' => isset( $f->custom_class ) ? (string) $f->custom_class : '',
				);
			case 'post':
				$p = $preview->post_preview_data;
				$n = self::post_layout_node( $doc );
				return (object) array(
					'layout_type'    => isset( $p->layout_type ) ? (string) $p->layout_type : 'grid',
					'custom_class'   => isset( $p->custom_class ) ? (string) $p->custom_class : '',
					'device_columns' => isset( $n->device_columns ) ? $n->device_columns : new stdClass(),
				);
			case 'loader':
				$l = isset( $misc->loader ) && is_object( $misc->loader ) ? $misc->loader : new stdClass();
				return (object) array(
					'is_enable'   => isset( $l->is_enable ) ? (string) $l->is_enable : 'true',
					'loader_type' => isset( $l->loader_type ) ? (string) $l->loader_type : 'true',
					'loader_text' => isset( $l->loader_text ) ? (string) $l->loader_text : '',
					'overlay'     => isset( $l->overlay ) ? (string) $l->overlay : 'true',
					'source'      => isset( $l->icon_data->source ) ? (string) $l->icon_data->source : '',
				);
			case 'extra':
				return self::ensure_misc_extra( $doc );
		}
		return new stdClass();
	}

	/**
	 * @param object               $doc Layout.
	 * @param array<string, mixed> $settings Patch.
	 * @param string               $id Element id.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function patch_container( $doc, $settings, $id ) {
		$node    = self::style_node( $doc, 'container' );
		$written = array();
		$fold    = null;
		foreach ( array( 'custom_class', 'custom_css', 'nonce' ) as $key ) {
			if ( ! array_key_exists( $key, $settings ) ) {
				continue;
			}
			$value = self::sanitize_adv_field( $key, $settings[ $key ] );
			if ( is_wp_error( $value ) ) {
				return $value;
			}
			if ( 'custom_css' === $key ) {
				$fold = self::fold_custom_css_to_design( $node, $value, $written );
				continue;
			}
			$node->{$key} = $value;
			$written[]    = $key;
		}
		if ( array_key_exists( 'scroll_enable', $settings ) || array_key_exists( 'is_enable', $settings ) ) {
			$raw = array_key_exists( 'scroll_enable', $settings ) ? $settings['scroll_enable'] : $settings['is_enable'];
			self::ensure_scroll( $node );
			$device = self::patch_device( $settings );
			$node->scroll->{$device}->is_enable = self::bool_flag( $raw );
			$written[]                          = 'scroll.is_enable';
		}
		if ( array_key_exists( 'scroll_position', $settings ) || array_key_exists( 'position', $settings ) ) {
			$raw = array_key_exists( 'scroll_position', $settings ) ? $settings['scroll_position'] : $settings['position'];
			self::ensure_scroll( $node );
			$device = self::patch_device( $settings );
			$node->scroll->{$device}->position = sanitize_text_field( (string) $raw );
			$written[]                         = 'scroll.position';
		}
		if ( empty( $written ) ) {
			return new WP_Error(
				'caf_mcp_unknown_settings',
				__( 'Container Advanced fields: custom_class, custom_css, nonce, scroll_enable, scroll_position. Design uses action=style + css.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		$out = array(
			'action'     => 'update',
			'element_id' => $id,
			'settings'   => $written,
		);
		if ( is_array( $fold ) ) {
			if ( ! empty( $fold['design_written'] ) ) {
				$out['design_from_custom_css'] = $fold['design_written'];
			}
			if ( ! empty( $fold['note'] ) ) {
				$out['note'] = $fold['note'];
			}
		}
		return $out;
	}

	/**
	 * MCP custom_css: fold Design-capable CSS onto style JSON.
	 *
	 * @param object             $node    Style node.
	 * @param string             $css     Sanitized CSS.
	 * @param array<int, string> $written Written keys (by ref).
	 * @return array<string, mixed>|null
	 */
	private static function fold_custom_css_to_design( $node, $css, &$written ) {
		$fold = null;
		if ( class_exists( 'CAF_MCP_Css', false ) && is_string( $css ) && '' !== trim( $css ) ) {
			$fold = CAF_MCP_Css::apply_preferring_design( $node, $css );
			$css  = isset( $fold['custom_css'] ) ? (string) $fold['custom_css'] : '';
			if ( ! empty( $fold['design_written'] ) ) {
				$written[] = 'style';
			}
		}
		$node->custom_css = is_string( $css ) ? $css : '';
		$written[]        = 'custom_css';
		return is_array( $fold ) ? $fold : null;
	}

	/**
	 * @param object $node Container.
	 * @return void
	 */
	private static function ensure_scroll( $node ) {
		if ( ! isset( $node->scroll ) || ! is_object( $node->scroll ) ) {
			$node->scroll = new stdClass();
		}
		foreach ( array( 'desktop', 'tablet', 'mobile' ) as $device ) {
			if ( ! isset( $node->scroll->{$device} ) || ! is_object( $node->scroll->{$device} ) ) {
				$node->scroll->{$device} = new stdClass();
			}
		}
	}

	/**
	 * @param object               $doc Layout.
	 * @param array<string, mixed> $settings Patch.
	 * @param string               $id Element id.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function patch_post( $doc, $settings, $id ) {
		$post    = $doc->common_data->preview_template_data->post_preview_data;
		$written = array();
		if ( array_key_exists( 'layout_type', $settings ) ) {
			$type = sanitize_key( (string) $settings['layout_type'] );
			if ( ! in_array( $type, array( 'grid', 'slider', 'list' ), true ) ) {
				return new WP_Error(
					'caf_mcp_bad_layout_type',
					__( 'layout_type must be grid, slider, or list.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			$post->layout_type = $type;
			$written[]         = 'layout_type';
		}
		if ( array_key_exists( 'custom_class', $settings ) ) {
			$post->custom_class = sanitize_text_field( (string) $settings['custom_class'] );
			$written[]          = 'custom_class';
		}
		$cols = self::read_columns_patch( $settings );
		if ( is_wp_error( $cols ) ) {
			return $cols;
		}
		if ( ! empty( $cols ) ) {
			$node = self::post_layout_node( $doc );
			if ( ! isset( $node->device_columns ) || ! is_object( $node->device_columns ) ) {
				$node->device_columns = new stdClass();
			}
			foreach ( $cols as $device => $n ) {
				$node->device_columns->{$device} = (string) $n;
				$written[]                       = 'columns.' . $device;
			}
		}
		if ( empty( $written ) ) {
			return new WP_Error(
				'caf_mcp_unknown_settings',
				__( 'Post Settings fields: layout_type, columns / columns_tablet / columns_mobile, custom_class. Gaps use action=style on preview:post_inner.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		return array(
			'action'     => 'update',
			'element_id' => $id,
			'settings'   => $written,
		);
	}

	/**
	 * @param object               $doc Layout.
	 * @param array<string, mixed> $settings Patch.
	 * @param string               $id Element id.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function patch_loader( $doc, $settings, $id ) {
		$misc = $doc->common_data->preview_template_data->misc_preview_data;
		if ( ! isset( $misc->loader ) || ! is_object( $misc->loader ) ) {
			$misc->loader = new stdClass();
		}
		$loader  = $misc->loader;
		$written = array();
		$map     = array(
			'is_enable'    => 'is_enable',
			'loader_enable'=> 'is_enable',
			'loader_type'  => 'loader_type',
			'loader_text'  => 'loader_text',
			'overlay'      => 'overlay',
			'loader_overlay' => 'overlay',
			'custom_class' => 'custom_class',
		);
		foreach ( $map as $in => $out ) {
			if ( ! array_key_exists( $in, $settings ) ) {
				continue;
			}
			if ( in_array( $out, array( 'is_enable', 'loader_type', 'overlay' ), true ) ) {
				$loader->{$out} = self::bool_flag( $settings[ $in ] );
			} else {
				$loader->{$out} = sanitize_text_field( (string) $settings[ $in ] );
			}
			$written[] = $out;
		}
		if ( array_key_exists( 'icon', $settings ) || array_key_exists( 'loader_icon', $settings ) ) {
			$icon = array_key_exists( 'icon', $settings ) ? $settings['icon'] : $settings['loader_icon'];
			if ( ! isset( $loader->icon_data ) || ! is_object( $loader->icon_data ) ) {
				$loader->icon_data = new stdClass();
			}
			$loader->icon_data->source = 'list';
			$loader->icon_data->icon   = sanitize_text_field( (string) $icon );
			$written[]                 = 'icon_data.icon';
		}
		if ( empty( $written ) ) {
			return new WP_Error(
				'caf_mcp_unknown_settings',
				__( 'Loader Settings: is_enable, loader_type, loader_text, overlay, icon. Loader Design uses action=style on preview:loader.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		return array(
			'action'     => 'update',
			'element_id' => $id,
			'settings'   => $written,
		);
	}

	/**
	 * @param object               $doc Layout.
	 * @param array<string, mixed> $settings Patch.
	 * @param string               $id Element id.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function patch_extra( $doc, $settings, $id ) {
		$changed = self::apply_misc_extra_aliases( $doc, $settings );
		if ( is_wp_error( $changed ) ) {
			return $changed;
		}
		if ( empty( $changed ) ) {
			return new WP_Error(
				'caf_mcp_unknown_settings',
				__( 'Misc extra Settings: order, orderby, no_result, masonry, filter_position, float_button, float_button_value, float_icon, animation_type, overlay.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		return array(
			'action'     => 'update',
			'element_id' => $id,
			'settings'   => array_keys( $changed ),
		);
	}

	/**
	 * @param object               $node Object.
	 * @param array<string, mixed> $settings Patch.
	 * @param array<int, string>   $keys Allowed keys.
	 * @param string               $id Element id.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function patch_object_fields( $node, $settings, $keys, $id ) {
		if ( ! isset( $node->settings ) || ! is_object( $node->settings ) ) {
			// Chrome items keep settings on the node; layers use top-level keys.
		}
		$written = array();
		$fold    = null;
		foreach ( $keys as $key ) {
			if ( ! array_key_exists( $key, $settings ) ) {
				continue;
			}
			$value = self::sanitize_adv_field( $key, $settings[ $key ] );
			if ( is_wp_error( $value ) ) {
				return $value;
			}
			if ( 'custom_css' === $key ) {
				$fold = self::fold_custom_css_to_design( $node, $value, $written );
				continue;
			}
			if ( isset( $node->settings ) && is_object( $node->settings ) && in_array( $key, array( 'custom_class' ), true ) && ! isset( $node->{$key} ) ) {
				$node->settings->{$key} = $value;
			} else {
				$node->{$key} = $value;
			}
			$written[] = $key;
		}
		if ( isset( $node->settings ) && is_object( $node->settings ) ) {
			$blocked = array( 'id', 'type', 'key', 'data', 'style' );
			foreach ( $settings as $key => $value ) {
				$key = sanitize_key( (string) $key );
				if ( '' === $key || in_array( $key, $blocked, true ) || in_array( $key, $keys, true ) ) {
					continue;
				}
				if ( class_exists( 'CAF_MCP_Compose', false ) ) {
					CAF_MCP_Compose::patch_settings( $node, array( $key => $value ) );
				} else {
					$node->settings->{$key} = $value;
				}
				$written[] = $key;
			}
		}
		if ( empty( $written ) ) {
			return new WP_Error(
				'caf_mcp_unknown_settings',
				__( 'No supported settings in the patch.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		$out = array(
			'action'     => 'update',
			'element_id' => $id,
			'settings'   => array_values( array_unique( $written ) ),
		);
		if ( is_array( $fold ) ) {
			if ( ! empty( $fold['design_written'] ) ) {
				$out['design_from_custom_css'] = $fold['design_written'];
			}
			if ( ! empty( $fold['note'] ) ) {
				$out['note'] = $fold['note'];
			}
		}
		return $out;
	}

	/**
	 * @param object               $doc Layout.
	 * @param array<string, mixed> $patch Patch.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function apply_misc_extra_aliases( $doc, $patch ) {
		$extra   = self::ensure_misc_extra( $doc );
		$changed = array();
		$device  = self::patch_device( $patch );

		if ( array_key_exists( 'order', $patch ) ) {
			$order = strtoupper( sanitize_key( (string) $patch['order'] ) );
			if ( ! in_array( $order, array( 'ASC', 'DESC' ), true ) ) {
				return new WP_Error( 'caf_mcp_bad_order', __( 'order must be ASC or DESC.', 'category-ajax-filter' ), array( 'status' => 400 ) );
			}
			$extra->order     = $order;
			$changed['order'] = $order;
		}
		if ( array_key_exists( 'orderby', $patch ) ) {
			$orderby = sanitize_key( (string) $patch['orderby'] );
			$allowed = array( 'date', 'title', 'id', 'ID', 'rand', 'menu_order', 'modified', 'comment_count', 'popularity', 'rating', 'price', 'price-desc' );
			if ( ! in_array( $orderby, $allowed, true ) && 'id' !== $orderby ) {
				return new WP_Error(
					'caf_mcp_bad_orderby',
					__( 'Unsupported orderby. Use date, title, ID, rand, menu_order, modified, comment_count, popularity, rating, price, or price-desc.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			if ( 'id' === $orderby ) {
				$orderby = 'ID';
			}
			$extra->orderby     = $orderby;
			$changed['orderby'] = $orderby;
		}
		if ( array_key_exists( 'no_result', $patch ) || array_key_exists( 'noresult', $patch ) ) {
			$raw = array_key_exists( 'no_result', $patch ) ? $patch['no_result'] : $patch['noresult'];
			$extra->noresult     = sanitize_text_field( (string) $raw );
			$changed['no_result'] = $extra->noresult;
		}
		if ( array_key_exists( 'masonry', $patch ) || array_key_exists( 'masonary', $patch ) ) {
			$raw = array_key_exists( 'masonry', $patch ) ? $patch['masonry'] : $patch['masonary'];
			$on = ( 'true' === self::bool_flag( $raw ) );
			$extra->masonary    = $on;
			$changed['masonry'] = $on;
		}

		$positions = array( 'inline', 'left', 'right', 'top', 'bottom', 'floating' );
		if ( array_key_exists( 'filter_position', $patch ) ) {
			$pos = sanitize_key( (string) $patch['filter_position'] );
			if ( ! in_array( $pos, $positions, true ) ) {
				return new WP_Error(
					'caf_mcp_bad_filter_position',
					__( 'filter_position must be inline, left, right, top, bottom, or floating.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			if ( ! isset( $extra->desktop ) || ! is_object( $extra->desktop ) ) {
				$extra->desktop = new stdClass();
			}
			$extra->desktop->filterPosition = $pos;
			$changed['filter_position']     = $pos;
		}
		if ( array_key_exists( 'filter_position_mobile', $patch ) ) {
			$pos = sanitize_key( (string) $patch['filter_position_mobile'] );
			if ( ! in_array( $pos, $positions, true ) ) {
				return new WP_Error(
					'caf_mcp_bad_filter_position',
					__( 'filter_position_mobile must be inline, left, right, top, bottom, or floating.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			if ( ! isset( $extra->mobile ) || ! is_object( $extra->mobile ) ) {
				$extra->mobile = new stdClass();
			}
			$extra->mobile->filterPosition     = $pos;
			$changed['filter_position_mobile'] = $pos;
		}
		if ( array_key_exists( 'filter_position_tablet', $patch ) ) {
			$pos = sanitize_key( (string) $patch['filter_position_tablet'] );
			if ( ! in_array( $pos, $positions, true ) ) {
				return new WP_Error(
					'caf_mcp_bad_filter_position',
					__( 'filter_position_tablet must be inline, left, right, top, bottom, or floating.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			if ( ! isset( $extra->tablet ) || ! is_object( $extra->tablet ) ) {
				$extra->tablet = new stdClass();
			}
			$extra->tablet->filterPosition     = $pos;
			$changed['filter_position_tablet'] = $pos;
		}

		$float_map = array(
			'float_button'       => 'floatButton',
			'float_button_value' => 'floatButtonValue',
			'float_icon'         => 'floatIcon',
			'float_icon_value'   => 'floatIconValue',
			'animation_type'     => 'animationType',
			'animation_position' => 'animationPosition',
			'overlay'            => 'overlay',
		);
		foreach ( $float_map as $in => $out ) {
			if ( ! array_key_exists( $in, $patch ) ) {
				continue;
			}
			if ( ! isset( $extra->{$device} ) || ! is_object( $extra->{$device} ) ) {
				$extra->{$device} = new stdClass();
			}
			if ( in_array( $out, array( 'floatButton', 'floatIcon' ), true ) ) {
				$extra->{$device}->{$out} = ( 'true' === self::bool_flag( $patch[ $in ] ) );
			} else {
				$extra->{$device}->{$out} = sanitize_text_field( (string) $patch[ $in ] );
			}
			$changed[ $in ] = $extra->{$device}->{$out};
		}
		return $changed;
	}

	/**
	 * Off-canvas Filter button: pin a corner and turn desktop Floating on.
	 *
	 * Mixed desktop-inline + mobile-floating layouts keep the in-flow filter
	 * on desktop. Pinning the trigger must also set extra.desktop.filterPosition
	 * to floating or the live page ignores the button.
	 *
	 * @param object               $doc   Layout.
	 * @param array<string, mixed> $patch Patch.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function apply_float_offcanvas( $doc, $patch ) {
		$changed = array();
		$raw     = null;
		foreach ( array( 'float_button_position', 'float_position', 'float_button_corner' ) as $key ) {
			if ( array_key_exists( $key, $patch ) ) {
				$raw = $patch[ $key ];
				break;
			}
		}

		$corner = null;
		if ( null !== $raw ) {
			$corner = self::normalize_float_corner( $raw );
			if ( null === $corner ) {
				return new WP_Error(
					'caf_mcp_bad_float_button_position',
					__( 'float_button_position must be bottom-left, bottom-right, top-left, or top-right.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
		}

		$wants_floating = ( null !== $corner );
		if ( array_key_exists( 'filter_position', $patch ) ) {
			$wants_floating = ( 'floating' === sanitize_key( (string) $patch['filter_position'] ) ) || $wants_floating;
		}

		if ( ! $wants_floating ) {
			return $changed;
		}

		$extra = self::ensure_misc_extra( $doc );
		if ( ! isset( $extra->desktop ) || ! is_object( $extra->desktop ) ) {
			$extra->desktop = new stdClass();
		}

		if ( 'floating' !== ( isset( $extra->desktop->filterPosition ) ? (string) $extra->desktop->filterPosition : '' ) ) {
			$extra->desktop->filterPosition = 'floating';
			$changed['filter_position']     = 'floating';
		}

		if ( ! array_key_exists( 'float_button', $patch ) ) {
			$extra->desktop->floatButton = true;
			$changed['float_button']     = true;
		}

		if ( null !== $corner ) {
			if ( ! class_exists( 'CAF_MCP_Css', false ) ) {
				return new WP_Error( 'caf_mcp_css_missing', __( 'CSS converter is not loaded.', 'category-ajax-filter' ), array( 'status' => 500 ) );
			}
			$css     = self::float_corner_css( $corner );
			$node    = self::float_node( $doc );
			$devices = array( 'desktop', 'mobile' );
			if ( array_key_exists( 'device', $patch ) ) {
				$devices = array( self::patch_device( $patch ) );
			}
			foreach ( $devices as $device ) {
				$styled = CAF_MCP_Css::apply_to_node( $node, 'self', $css, $device );
				if ( is_wp_error( $styled ) ) {
					return $styled;
				}
			}
			$changed['float_button_position'] = $corner;

			if ( ! array_key_exists( 'animation_type', $patch ) ) {
				$slide                          = self::float_corner_animation( $corner );
				$extra->desktop->animationType  = $slide;
				$changed['animation_type']      = $slide;
			}
		}

		$skip_post_width = ( array_key_exists( 'css', $patch ) && in_array( self::normalize_target( isset( $patch['target'] ) ? (string) $patch['target'] : '' ), array( 'post', 'post_inner' ), true ) );
		if ( ! $skip_post_width && class_exists( 'CAF_MCP_Css', false ) ) {
			$post   = self::post_layout_node( $doc );
			$styled = CAF_MCP_Css::apply_to_node( $post, 'self', 'width:100%;', 'desktop' );
			if ( is_wp_error( $styled ) ) {
				return $styled;
			}
			$changed['post_width'] = '100%';
		}

		return $changed;
	}

	/**
	 * @param mixed $raw Corner string.
	 * @return string|null bottom-left|bottom-right|top-left|top-right
	 */
	private static function normalize_float_corner( $raw ) {
		$key = strtolower( trim( (string) $raw ) );
		$key = str_replace( array( '_', '/', ',', '+' ), '-', $key );
		$key = preg_replace( '/\s+/', '-', $key );
		$key = preg_replace( '/-+/', '-', $key );
		$key = trim( (string) $key, '-' );
		$map = array(
			'bottom-left'  => 'bottom-left',
			'left-bottom'  => 'bottom-left',
			'bottomleft'   => 'bottom-left',
			'leftbottom'   => 'bottom-left',
			'bl'           => 'bottom-left',
			'bottom-right' => 'bottom-right',
			'right-bottom' => 'bottom-right',
			'bottomright'  => 'bottom-right',
			'rightbottom'  => 'bottom-right',
			'br'           => 'bottom-right',
			'top-left'     => 'top-left',
			'left-top'     => 'top-left',
			'topleft'      => 'top-left',
			'lefttop'      => 'top-left',
			'tl'           => 'top-left',
			'top-right'    => 'top-right',
			'right-top'    => 'top-right',
			'topright'     => 'top-right',
			'righttop'     => 'top-right',
			'tr'           => 'top-right',
		);
		return isset( $map[ $key ] ) ? $map[ $key ] : null;
	}

	/**
	 * @param string $corner Corner.
	 * @return string
	 */
	private static function float_corner_css( $corner ) {
		$css = array(
			'bottom-left'  => 'position:fixed;left:24px;bottom:24px;top:auto;right:auto;z-index:99999;',
			'bottom-right' => 'position:fixed;right:24px;bottom:24px;top:auto;left:auto;z-index:99999;',
			'top-left'     => 'position:fixed;left:24px;top:24px;bottom:auto;right:auto;z-index:99999;',
			'top-right'    => 'position:fixed;right:24px;top:24px;bottom:auto;left:auto;z-index:99999;',
		);
		return isset( $css[ $corner ] ) ? $css[ $corner ] : $css['bottom-left'];
	}

	/**
	 * @param string $corner Corner.
	 * @return string
	 */
	private static function float_corner_animation( $corner ) {
		if ( false !== strpos( $corner, 'left' ) ) {
			return 'slide-left-right';
		}
		if ( false !== strpos( $corner, 'right' ) ) {
			return 'slide-right-left';
		}
		return 'slide-right-left';
	}

	/**
	 * @param object $doc Layout.
	 * @return string
	 */
	public static function infer_float_button_position( $doc ) {
		self::ensure_document( $doc );
		$meta = self::float_node( $doc );
		$slot = null;
		if ( isset( $meta->style->desktop->default ) && is_object( $meta->style->desktop->default ) ) {
			$slot = $meta->style->desktop->default;
		} elseif ( isset( $meta->style->container->desktop->default ) && is_object( $meta->style->container->desktop->default ) ) {
			$slot = $meta->style->container->desktop->default;
		}
		if ( ! is_object( $slot ) ) {
			return '';
		}
		$pos = isset( $slot->position ) ? strtolower( (string) $slot->position ) : '';
		if ( ! in_array( $pos, array( 'fixed', 'sticky' ), true ) ) {
			return '';
		}
		$left   = isset( $slot->left ) ? strtolower( (string) $slot->left ) : 'auto';
		$right  = isset( $slot->right ) ? strtolower( (string) $slot->right ) : 'auto';
		$top    = isset( $slot->top ) ? strtolower( (string) $slot->top ) : 'auto';
		$bottom = isset( $slot->bottom ) ? strtolower( (string) $slot->bottom ) : 'auto';
		$is_l   = ( '' !== $left && 'auto' !== $left );
		$is_r   = ( '' !== $right && 'auto' !== $right );
		$is_t   = ( '' !== $top && 'auto' !== $top );
		$is_b   = ( '' !== $bottom && 'auto' !== $bottom );
		if ( $is_l && $is_b ) {
			return 'bottom-left';
		}
		if ( $is_r && $is_b ) {
			return 'bottom-right';
		}
		if ( $is_l && $is_t ) {
			return 'top-left';
		}
		if ( $is_r && $is_t ) {
			return 'top-right';
		}
		return '';
	}

	/**
	 * Enable / place Layout Control cards from caf-manage-layout-settings.
	 *
	 * Agents were missing action=update is_enable on preview:dnd:*. These
	 * aliases are the command surface for “show active filters”.
	 *
	 * @param object               $doc   Layout.
	 * @param array<string, mixed> $patch Patch.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function apply_layout_control_aliases( $doc, $patch ) {
		$changed = array();
		$cards   = array(
			'selected'     => array(
				'enable' => array( 'selected_enable', 'show_selected', 'active_filters', 'selected_filters', 'show_active_filters' ),
				'zone'   => array( 'selected_zone', 'selected_position', 'active_filters_zone' ),
			),
			'result_count' => array(
				'enable' => array( 'result_count_enable', 'show_result_count' ),
				'zone'   => array( 'result_count_zone' ),
			),
			'sorting'      => array(
				'enable' => array( 'sorting_enable', 'show_sorting' ),
				'zone'   => array( 'sorting_zone' ),
			),
			'pagination'   => array(
				'enable' => array( 'layout_pagination_enable', 'pagination_enable', 'show_pagination' ),
				'zone'   => array( 'pagination_zone' ),
			),
		);

		foreach ( $cards as $card => $keys ) {
			$enable_raw = self::first_patch_value( $patch, $keys['enable'] );
			$zone_raw   = self::first_patch_value( $patch, $keys['zone'] );
			if ( null === $enable_raw && null === $zone_raw ) {
				continue;
			}

			$id = self::ID_PREFIX . 'dnd:' . $card;
			if ( null !== $enable_raw ) {
				$updated = self::apply_update( $doc, $id, array( 'is_enable' => $enable_raw ) );
				if ( is_wp_error( $updated ) ) {
					return $updated;
				}
				$changed[ $card . '_enable' ] = self::bool_flag( $enable_raw );
			}

			if ( null !== $zone_raw ) {
				$zone = self::normalize_chrome_zone( $zone_raw );
				if ( null === $zone ) {
					return new WP_Error(
						'caf_mcp_bad_chrome_zone',
						__( 'Layout Control zone must be post_top, post_bottom, filter_top, or filter_bottom (above the posts, below the posts, or inside the filter panel).', 'category-ajax-filter' ),
						array( 'status' => 400 )
					);
				}
				$index = ( 'selected' === $card && in_array( $zone, array( 'post_top', 'filter_top' ), true ) ) ? 0 : null;
				$moved = self::apply_move( $doc, $id, self::ID_PREFIX . 'dnd:' . $zone, $index );
				if ( is_wp_error( $moved ) ) {
					return $moved;
				}
				$changed[ $card . '_zone' ] = $zone;
				if ( null === $enable_raw ) {
					$updated = self::apply_update( $doc, $id, array( 'is_enable' => true ) );
					if ( is_wp_error( $updated ) ) {
						return $updated;
					}
					$changed[ $card . '_enable' ] = 'true';
				}
			}
		}

		if ( array_key_exists( 'selected_close_button', $patch ) || array_key_exists( 'selected_clear', $patch ) ) {
			$raw     = array_key_exists( 'selected_close_button', $patch ) ? $patch['selected_close_button'] : $patch['selected_clear'];
			$updated = self::apply_update( $doc, self::ID_PREFIX . 'dnd:selected', array( 'close_button' => $raw ) );
			if ( is_wp_error( $updated ) ) {
				return $updated;
			}
			$changed['selected_close_button'] = self::bool_flag( $raw );
		}

		return $changed;
	}

	/**
	 * @param array<string, mixed> $patch Patch.
	 * @param array<int, string>   $keys  Keys.
	 * @return mixed|null
	 */
	private static function first_patch_value( $patch, $keys ) {
		foreach ( $keys as $key ) {
			if ( array_key_exists( $key, $patch ) ) {
				return $patch[ $key ];
			}
		}
		return null;
	}

	/**
	 * @param mixed $raw Zone string.
	 * @return string|null post_top|post_bottom|filter_top|filter_bottom
	 */
	private static function normalize_chrome_zone( $raw ) {
		$key = strtolower( trim( (string) $raw ) );
		$key = str_replace( array( '_', '/', ' ' ), '-', $key );
		$key = preg_replace( '/-+/', '-', $key );
		$key = trim( (string) $key, '-' );
		$map = array(
			'post-top'         => 'post_top',
			'posttop'          => 'post_top',
			'above-posts'      => 'post_top',
			'aboveposts'       => 'post_top',
			'above-the-posts'  => 'post_top',
			'posts'            => 'post_top',
			'results'          => 'post_top',
			'post'             => 'post_top',
			'post-bottom'      => 'post_bottom',
			'postbottom'       => 'post_bottom',
			'below-posts'      => 'post_bottom',
			'belowposts'       => 'post_bottom',
			'filter-top'       => 'filter_top',
			'filtertop'        => 'filter_top',
			'filter'           => 'filter_top',
			'filter-panel'     => 'filter_top',
			'inside-filter'    => 'filter_top',
			'panel'            => 'filter_top',
			'filter-bottom'    => 'filter_bottom',
			'filterbottom'     => 'filter_bottom',
		);
		return isset( $map[ $key ] ) ? $map[ $key ] : ( in_array( $key, array( 'post_top', 'post_bottom', 'filter_top', 'filter_bottom' ), true ) ? $key : null );
	}

	/**
	 * Lean Layout Control card enable + zone for settings reads.
	 *
	 * @param object $doc Layout.
	 * @return array<string, mixed>
	 */
	public static function lean_layout_control( $doc ) {
		self::ensure_document( $doc );
		$out = array(
			'selected_enable'      => false,
			'selected_zone'        => '',
			'result_count_enable'  => false,
			'result_count_zone'    => '',
			'sorting_enable'       => false,
			'sorting_zone'         => '',
			'pagination_enable'    => false,
			'pagination_zone'      => '',
		);
		foreach ( self::dnd_list( $doc ) as $entry ) {
			if ( empty( $entry['kind'] ) || 'item' !== $entry['kind'] ) {
				continue;
			}
			$key = isset( $entry['key'] ) ? (string) $entry['key'] : '';
			if ( ! isset( $out[ $key . '_enable' ] ) ) {
				continue;
			}
			$out[ $key . '_enable' ] = ! empty( $entry['enabled'] );
			$out[ $key . '_zone' ]   = isset( $entry['parent'] ) ? (string) $entry['parent'] : '';
		}
		return $out;
	}

	/**
	 * @param object               $doc Layout.
	 * @param array<string, mixed> $patch Patch.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function apply_post_aliases( $doc, $patch ) {
		$changed = array();
		$subset  = array();
		foreach ( array( 'layout_type', 'custom_class', 'columns', 'grid_columns', 'columns_desktop', 'columns_tablet', 'columns_mobile' ) as $key ) {
			if ( array_key_exists( $key, $patch ) ) {
				$subset[ $key ] = $patch[ $key ];
			}
		}
		if ( array_key_exists( 'column_gap', $patch ) || array_key_exists( 'row_gap', $patch ) ) {
			$css = array();
			if ( array_key_exists( 'column_gap', $patch ) ) {
				$css[] = 'column-gap:' . sanitize_text_field( (string) $patch['column_gap'] );
			}
			if ( array_key_exists( 'row_gap', $patch ) ) {
				$css[] = 'row-gap:' . sanitize_text_field( (string) $patch['row_gap'] );
			}
			$styled = self::apply_style(
				$doc,
				self::ID_PREFIX . 'post_inner',
				array(
					'css'    => implode( ';', $css ) . ';',
					'device' => isset( $patch['device'] ) ? $patch['device'] : 'desktop',
				)
			);
			if ( is_wp_error( $styled ) ) {
				return $styled;
			}
			$changed['post_inner'] = $styled;
		}
		if ( empty( $subset ) ) {
			return $changed;
		}
		$updated = self::patch_post( $doc, $subset, self::ID_PREFIX . 'post' );
		if ( is_wp_error( $updated ) ) {
			return $updated;
		}
		$changed['post'] = $updated;
		return $changed;
	}

	/**
	 * @param object               $doc Layout.
	 * @param array<string, mixed> $patch Patch.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function apply_loader_aliases( $doc, $patch ) {
		$subset = array();
		foreach ( array( 'loader_enable', 'is_enable', 'loader_type', 'loader_text', 'loader_overlay', 'overlay', 'loader_icon', 'icon' ) as $key ) {
			if ( array_key_exists( $key, $patch ) ) {
				$subset[ $key ] = $patch[ $key ];
			}
		}
		if ( empty( $subset ) ) {
			return array();
		}
		$updated = self::patch_loader( $doc, $subset, self::ID_PREFIX . 'loader' );
		if ( is_wp_error( $updated ) ) {
			return $updated;
		}
		return array( 'loader' => $updated );
	}

	/**
	 * @param object               $doc Layout.
	 * @param array<string, mixed> $patch Patch.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function apply_advanced_aliases( $doc, $patch ) {
		$changed = array();
		$subset  = array();
		foreach ( array( 'custom_class', 'custom_css', 'nonce', 'scroll_enable', 'scroll_position' ) as $key ) {
			if ( array_key_exists( $key, $patch ) ) {
				$subset[ $key ] = $patch[ $key ];
			}
		}
		$target = 'container';
		if ( array_key_exists( 'target', $patch ) && '' !== (string) $patch['target'] ) {
			$target = self::normalize_target( (string) $patch['target'] );
		}
		if ( ! empty( $subset ) && in_array( $target, array( 'container', 'filter', 'post' ), true ) ) {
			if ( 'container' === $target ) {
				$updated = self::patch_container( $doc, $subset, self::ID_PREFIX . 'container' );
			} elseif ( 'filter' === $target ) {
				$updated = self::patch_object_fields( self::filter_node( $doc ), $subset, array( 'custom_class', 'custom_css', 'nonce' ), self::ID_PREFIX . 'filter' );
			} else {
				$updated = self::patch_post( $doc, $subset, self::ID_PREFIX . 'post' );
			}
			if ( is_wp_error( $updated ) ) {
				return $updated;
			}
			$changed['advanced'] = $updated;
		}
		if ( array_key_exists( 'filter_width', $patch ) ) {
			$styled = self::apply_style(
				$doc,
				self::ID_PREFIX . 'filter',
				array(
					'css'    => 'width:' . sanitize_text_field( (string) $patch['filter_width'] ) . ';',
					'device' => isset( $patch['device'] ) ? $patch['device'] : 'desktop',
				)
			);
			if ( is_wp_error( $styled ) ) {
				return $styled;
			}
			$changed['filter_width'] = $styled;
		}
		if ( array_key_exists( 'container_width', $patch ) ) {
			$styled = self::apply_style(
				$doc,
				self::ID_PREFIX . 'container',
				array(
					'css'    => 'width:' . sanitize_text_field( (string) $patch['container_width'] ) . ';',
					'device' => isset( $patch['device'] ) ? $patch['device'] : 'desktop',
				)
			);
			if ( is_wp_error( $styled ) ) {
				return $styled;
			}
			$changed['container_width'] = $styled;
		}
		if ( array_key_exists( 'container_background', $patch ) || array_key_exists( 'background', $patch ) ) {
			$raw = array_key_exists( 'container_background', $patch ) ? $patch['container_background'] : $patch['background'];
			$styled = self::apply_style(
				$doc,
				self::ID_PREFIX . 'container',
				array(
					'css'    => 'background-color:' . sanitize_text_field( (string) $raw ) . ';',
					'device' => isset( $patch['device'] ) ? $patch['device'] : 'desktop',
				)
			);
			if ( is_wp_error( $styled ) ) {
				return $styled;
			}
			$changed['container_background'] = $styled;
		}
		return $changed;
	}

	/**
	 * @param array<string, mixed> $settings Patch.
	 * @return array<string, int>|WP_Error
	 */
	private static function read_columns_patch( $settings ) {
		$out = array();
		$map = array(
			'columns'          => 'desktop',
			'grid_columns'     => 'desktop',
			'columns_desktop'  => 'desktop',
			'columns_tablet'   => 'tablet',
			'columns_mobile'   => 'mobile',
		);
		foreach ( $map as $key => $device ) {
			if ( ! array_key_exists( $key, $settings ) ) {
				continue;
			}
			$n = function_exists( 'absint' ) ? absint( $settings[ $key ] ) : abs( (int) $settings[ $key ] );
			if ( $n < 1 || $n > 6 ) {
				return new WP_Error(
					'caf_mcp_bad_columns',
					__( 'columns must be 1–6.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			$out[ $device ] = $n;
		}
		return $out;
	}

	/**
	 * @param array<string, mixed> $patch Patch.
	 * @return bool
	 */
	private static function patch_has_layout_keys( $patch ) {
		foreach ( array( 'width', 'gap', 'display', 'direction', 'flex_flow', 'flexFlow', 'justify', 'spread', 'align', 'wrap', 'float', 'hide_on_desktop', 'hide_on_tablet', 'hide_on_mobile' ) as $key ) {
			if ( array_key_exists( $key, $patch ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @param array<string, mixed> $patch Patch.
	 * @return string
	 */
	private static function patch_device( $patch ) {
		$device = isset( $patch['device'] ) ? sanitize_key( (string) $patch['device'] ) : 'desktop';
		if ( ! in_array( $device, array( 'desktop', 'tablet', 'mobile' ), true ) ) {
			return 'desktop';
		}
		return $device;
	}

	/**
	 * @param string $key   Field.
	 * @param mixed  $value Raw.
	 * @return string|WP_Error
	 */
	private static function sanitize_adv_field( $key, $value ) {
		if ( 'custom_css' === $key ) {
			$css = is_string( $value ) ? $value : '';
			if ( strlen( $css ) > 8000 ) {
				return new WP_Error( 'caf_mcp_css_too_long', __( 'custom_css must be 8000 characters or fewer.', 'category-ajax-filter' ), array( 'status' => 400 ) );
			}
			$lower = strtolower( $css );
			if ( false !== strpos( $lower, 'javascript:' ) || false !== strpos( $lower, 'expression(' ) || false !== strpos( $lower, '@import' ) || false !== strpos( $css, '<' ) ) {
				return new WP_Error( 'caf_mcp_css_unsafe', __( 'That custom_css is not allowed.', 'category-ajax-filter' ), array( 'status' => 400 ) );
			}
			return $css;
		}
		if ( 'nonce' === $key ) {
			return self::bool_flag( $value );
		}
		return sanitize_text_field( (string) $value );
	}

	/**
	 * @param mixed $raw Raw.
	 * @return string true|false
	 */
	private static function bool_flag( $raw ) {
		if ( function_exists( 'rest_sanitize_boolean' ) ) {
			return rest_sanitize_boolean( $raw ) ? 'true' : 'false';
		}
		$v = strtolower( (string) $raw );
		if ( in_array( $v, array( '1', 'true', 'yes', 'on' ), true ) ) {
			return 'true';
		}
		if ( is_bool( $raw ) ) {
			return $raw ? 'true' : 'false';
		}
		return 'false';
	}

	/**
	 * Drag a Layout Control card into filter_top / filter_bottom / post_top / post_bottom.
	 *
	 * @param object     $doc           Layout.
	 * @param string     $id            preview:dnd:{item}.
	 * @param string     $new_parent_id Destination zone id.
	 * @param int|null   $index         Insert index.
	 * @return array<string, mixed>|WP_Error
	 */
	public static function apply_move( $doc, $id, $new_parent_id, $index ) {
		$target = self::normalize_target( $id );
		if ( 0 !== strpos( $target, 'dnd:' ) ) {
			return self::immutable_error( 'move' );
		}
		$item_key = substr( $target, 4 );
		if ( self::is_zone_key( $item_key ) ) {
			return new WP_Error(
				'caf_mcp_preview_immutable',
				__( 'Layout Control zones cannot be moved. Move selected, result_count, sorting, or pagination into a zone.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		if ( ! self::is_item_key( $item_key ) ) {
			return self::unknown_target( $id );
		}
		$dest_key = self::normalize_zone_key( $new_parent_id );
		if ( '' === $dest_key ) {
			return new WP_Error(
				'caf_mcp_bad_parent',
				__( 'new_parent_id must be preview:dnd:filter_top, filter_bottom, post_top, or post_bottom.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		self::ensure_document( $doc );
		$misc = $doc->common_data->preview_template_data->misc_preview_data;
		if ( ! isset( $misc->dnd_column_data ) || ! is_array( $misc->dnd_column_data ) ) {
			return self::unknown_target( $id );
		}

		$found      = null;
		$from_key   = '';
		$from_index = 0;
		foreach ( $misc->dnd_column_data as $zone ) {
			if ( ! is_object( $zone ) || empty( $zone->data ) || ! is_array( $zone->data ) ) {
				continue;
			}
			foreach ( $zone->data as $i => $node ) {
				if ( ! is_object( $node ) || ! isset( $node->key ) || (string) $node->key !== $item_key ) {
					continue;
				}
				$found      = $node;
				$from_key   = isset( $zone->key ) ? (string) $zone->key : '';
				$from_index = (int) $i;
				array_splice( $zone->data, $i, 1 );
				$zone->data = array_values( $zone->data );
				break 2;
			}
		}
		if ( ! $found ) {
			$found = class_exists( 'CAF_MCP_Compose', false ) ? CAF_MCP_Compose::default_chrome_item( $item_key ) : null;
			if ( ! is_object( $found ) ) {
				return self::unknown_target( $id );
			}
		}

		$dest = self::find_dnd_node( $doc, $dest_key );
		if ( ! is_object( $dest ) ) {
			return self::unknown_target( $new_parent_id );
		}
		if ( ! isset( $dest->data ) || ! is_array( $dest->data ) ) {
			$dest->data = array();
		}
		$at = ( null === $index || '' === $index ) ? count( $dest->data ) : (int) $index;
		if ( $from_key === $dest_key && $from_index < $at ) {
			--$at;
		}
		$at = max( 0, min( $at, count( $dest->data ) ) );
		array_splice( $dest->data, $at, 0, array( $found ) );
		$dest->data = array_values( $dest->data );

		return array(
			'action'        => 'move',
			'element_id'    => self::ID_PREFIX . 'dnd:' . $item_key,
			'new_parent_id' => self::ID_PREFIX . 'dnd:' . $dest_key,
			'index'         => $at,
		);
	}

	/**
	 * Settings / Advanced on a Layout Control zone or card.
	 *
	 * @param object               $node     Zone or item.
	 * @param array<string, mixed> $settings Patch.
	 * @param string               $id       Element id.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function patch_chrome( $node, $settings, $id ) {
		if ( ! isset( $node->settings ) || ! is_object( $node->settings ) ) {
			$node->settings = new stdClass();
		}
		$key     = isset( $node->key ) ? (string) $node->key : '';
		$written = array();
		$hide    = self::apply_hide_flags( $node, $settings );
		if ( ! empty( $hide ) ) {
			$written = array_merge( $written, $hide );
		}
		if ( array_key_exists( 'custom_class', $settings ) ) {
			$node->settings->custom_class = sanitize_text_field( (string) $settings['custom_class'] );
			$written[]                    = 'custom_class';
		}
		if ( self::is_zone_key( $key ) ) {
			if ( empty( $written ) ) {
				return new WP_Error(
					'caf_mcp_unknown_settings',
					__( 'Layout Control zones support custom_class and hide_on_desktop|tablet|mobile. Cards use action=update on preview:dnd:selected|result_count|sorting|pagination.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			return array(
				'action'     => 'update',
				'element_id' => $id,
				'settings'   => array_values( array_unique( $written ) ),
			);
		}

		$typed = self::patch_chrome_item( $node, $settings, $key );
		if ( is_wp_error( $typed ) ) {
			return $typed;
		}
		$written = array_merge( $written, $typed );

		$mapped = self::chrome_mapped_keys( $key );
		$rest   = array();
		foreach ( $settings as $skey => $value ) {
			$clean = sanitize_key( (string) $skey );
			if ( '' === $clean || in_array( $clean, $mapped, true ) || in_array( $skey, $mapped, true ) ) {
				continue;
			}
			$rest[ $skey ] = $value;
		}
		if ( ! empty( $rest ) && class_exists( 'CAF_MCP_Compose', false ) ) {
			CAF_MCP_Compose::patch_settings( $node, $rest );
			$written = array_merge( $written, array_keys( $rest ) );
		}
		if ( empty( $written ) ) {
			return new WP_Error(
				'caf_mcp_unknown_settings',
				__( 'No supported Layout Control settings in the patch.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		return array(
			'action'     => 'update',
			'element_id' => $id,
			'settings'   => array_values( array_unique( $written ) ),
		);
	}

	/**
	 * @param object               $node     Chrome item.
	 * @param array<string, mixed> $settings Patch.
	 * @param string               $key      Item key.
	 * @return array<int, string>|WP_Error
	 */
	private static function patch_chrome_item( $node, $settings, $key ) {
		$s       = $node->settings;
		$written = array();

		if ( array_key_exists( 'is_enable', $settings ) || array_key_exists( 'enable', $settings ) || array_key_exists( 'enabled', $settings ) ) {
			$raw           = array_key_exists( 'is_enable', $settings ) ? $settings['is_enable'] : ( array_key_exists( 'enable', $settings ) ? $settings['enable'] : $settings['enabled'] );
			$s->is_enable  = self::bool_flag( $raw );
			$written[]     = 'is_enable';
		}

		if ( 'selected' === $key && array_key_exists( 'close_button', $settings ) ) {
			$s->close_button = self::bool_flag( $settings['close_button'] );
			$written[]       = 'close_button';
		}

		if ( 'result_count' === $key ) {
			$prefix_written = self::patch_affix( $s, 'prefix', $settings, array( 'prefix', 'prefix_text', 'prefix_enable' ) );
			$suffix_written = self::patch_affix( $s, 'suffix', $settings, array( 'suffix', 'suffix_text', 'suffix_enable' ) );
			$written        = array_merge( $written, $prefix_written, $suffix_written );
		}

		if ( 'sorting' === $key ) {
			$sort = self::patch_sorting( $s, $settings );
			if ( is_wp_error( $sort ) ) {
				return $sort;
			}
			$written = array_merge( $written, $sort );
		}

		if ( 'pagination' === $key ) {
			$page = self::patch_chrome_pagination( $s, $settings );
			if ( is_wp_error( $page ) ) {
				return $page;
			}
			$written = array_merge( $written, $page );
		}

		return $written;
	}

	/**
	 * @param object               $s        Settings.
	 * @param string               $which    prefix|suffix.
	 * @param array<string, mixed> $settings Patch.
	 * @param array<int, string>   $keys     Incoming keys.
	 * @return array<int, string>
	 */
	private static function patch_affix( $s, $which, $settings, $keys ) {
		$written = array();
		$text_key = $which . '_text';
		$on_key   = $which . '_enable';
		if ( array_key_exists( $which, $settings ) && is_array( $settings[ $which ] ) ) {
			if ( ! isset( $s->{$which} ) || ! is_object( $s->{$which} ) ) {
				$s->{$which} = new stdClass();
			}
			if ( array_key_exists( 'is_enable', $settings[ $which ] ) ) {
				$s->{$which}->is_enable = self::bool_flag( $settings[ $which ]['is_enable'] );
			}
			if ( array_key_exists( 'value', $settings[ $which ] ) ) {
				$s->{$which}->value = sanitize_text_field( (string) $settings[ $which ]['value'] );
			}
			$written[] = $which;
		}
		if ( array_key_exists( $on_key, $settings ) ) {
			if ( ! isset( $s->{$which} ) || ! is_object( $s->{$which} ) ) {
				$s->{$which} = new stdClass();
			}
			$s->{$which}->is_enable = self::bool_flag( $settings[ $on_key ] );
			$written[]              = $on_key;
		}
		if ( array_key_exists( $text_key, $settings ) || ( array_key_exists( $which, $settings ) && is_string( $settings[ $which ] ) ) ) {
			if ( ! isset( $s->{$which} ) || ! is_object( $s->{$which} ) ) {
				$s->{$which} = new stdClass();
			}
			$raw                    = array_key_exists( $text_key, $settings ) ? $settings[ $text_key ] : $settings[ $which ];
			$s->{$which}->value     = sanitize_text_field( (string) $raw );
			$s->{$which}->is_enable = 'true';
			$written[]              = $text_key;
		}
		return $written;
	}

	/**
	 * @param object               $s        Settings.
	 * @param array<string, mixed> $settings Patch.
	 * @return array<int, string>|WP_Error
	 */
	private static function patch_sorting( $s, $settings ) {
		$written = array();
		if ( ! isset( $s->order ) || ! is_object( $s->order ) ) {
			$s->order = (object) array(
				'is_enable'     => 'true',
				'values'        => array( 'DESC', 'ASC' ),
				'placeholder'   => 'Order',
				'icon_position' => 'right',
			);
		}
		if ( ! isset( $s->order_by ) || ! is_object( $s->order_by ) ) {
			$s->order_by = (object) array(
				'is_enable'     => 'true',
				'values'        => array( 'ID', 'date', 'rand', 'title' ),
				'placeholder'   => 'Order By',
				'icon_position' => 'right',
			);
		}

		if ( array_key_exists( 'order', $settings ) && is_array( $settings['order'] ) ) {
			$nested = $settings['order'];
			if ( array_key_exists( 'is_enable', $nested ) && ! array_key_exists( 'order_enable', $settings ) ) {
				$settings['order_enable'] = $nested['is_enable'];
			}
			if ( array_key_exists( 'values', $nested ) && ! array_key_exists( 'order_values', $settings ) ) {
				$settings['order_values'] = $nested['values'];
			}
			if ( array_key_exists( 'placeholder', $nested ) && ! array_key_exists( 'order_placeholder', $settings ) ) {
				$settings['order_placeholder'] = $nested['placeholder'];
			}
			if ( array_key_exists( 'icon_position', $nested ) && ! array_key_exists( 'order_icon_position', $settings ) ) {
				$settings['order_icon_position'] = $nested['icon_position'];
			}
			$written[] = 'order';
		}
		if ( array_key_exists( 'order_by', $settings ) && is_array( $settings['order_by'] ) ) {
			$nested = $settings['order_by'];
			if ( array_key_exists( 'is_enable', $nested ) && ! array_key_exists( 'orderby_enable', $settings ) && ! array_key_exists( 'order_by_enable', $settings ) ) {
				$settings['orderby_enable'] = $nested['is_enable'];
			}
			if ( array_key_exists( 'values', $nested ) && ! array_key_exists( 'orderby_values', $settings ) && ! array_key_exists( 'order_by_values', $settings ) ) {
				$settings['orderby_values'] = $nested['values'];
			}
			if ( array_key_exists( 'placeholder', $nested ) && ! array_key_exists( 'orderby_placeholder', $settings ) && ! array_key_exists( 'order_by_placeholder', $settings ) ) {
				$settings['orderby_placeholder'] = $nested['placeholder'];
			}
			if ( array_key_exists( 'icon_position', $nested ) && ! array_key_exists( 'orderby_icon_position', $settings ) && ! array_key_exists( 'order_by_icon_position', $settings ) ) {
				$settings['orderby_icon_position'] = $nested['icon_position'];
			}
			$written[] = 'order_by';
		}

		$order_on = null;
		if ( array_key_exists( 'order_enable', $settings ) ) {
			$order_on = self::bool_flag( $settings['order_enable'] );
			$written[] = 'order_enable';
		}
		$orderby_on = null;
		if ( array_key_exists( 'orderby_enable', $settings ) || array_key_exists( 'order_by_enable', $settings ) ) {
			$raw        = array_key_exists( 'orderby_enable', $settings ) ? $settings['orderby_enable'] : $settings['order_by_enable'];
			$orderby_on = self::bool_flag( $raw );
			$written[]  = 'orderby_enable';
		}
		$next_order   = null !== $order_on ? $order_on : (string) $s->order->is_enable;
		$next_orderby = null !== $orderby_on ? $orderby_on : (string) $s->order_by->is_enable;
		if ( 'false' === $next_order && 'false' === $next_orderby ) {
			return new WP_Error(
				'caf_mcp_bad_sorting',
				__( 'Keep at least one of Sort Order or Sort By enabled.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		if ( null !== $order_on ) {
			$s->order->is_enable = $order_on;
		}
		if ( null !== $orderby_on ) {
			$s->order_by->is_enable = $orderby_on;
		}

		if ( array_key_exists( 'order_values', $settings ) ) {
			$vals = self::sanitize_order_values( $settings['order_values'] );
			if ( is_wp_error( $vals ) ) {
				return $vals;
			}
			$s->order->values = $vals;
			$written[]        = 'order_values';
		}
		if ( array_key_exists( 'order_placeholder', $settings ) ) {
			$s->order->placeholder = sanitize_text_field( (string) $settings['order_placeholder'] );
			$written[]             = 'order_placeholder';
		}
		if ( array_key_exists( 'order_icon_position', $settings ) ) {
			$pos = self::sanitize_icon_side( $settings['order_icon_position'] );
			if ( is_wp_error( $pos ) ) {
				return $pos;
			}
			$s->order->icon_position = $pos;
			$written[]               = 'order_icon_position';
		}

		$by_values = null;
		if ( array_key_exists( 'orderby_values', $settings ) ) {
			$by_values = $settings['orderby_values'];
		} elseif ( array_key_exists( 'order_by_values', $settings ) ) {
			$by_values = $settings['order_by_values'];
		}
		if ( null !== $by_values ) {
			$vals = self::sanitize_orderby_values( $by_values );
			if ( is_wp_error( $vals ) ) {
				return $vals;
			}
			$s->order_by->values = $vals;
			$written[]           = 'orderby_values';
		}
		if ( array_key_exists( 'orderby_placeholder', $settings ) || array_key_exists( 'order_by_placeholder', $settings ) ) {
			$raw                         = array_key_exists( 'orderby_placeholder', $settings ) ? $settings['orderby_placeholder'] : $settings['order_by_placeholder'];
			$s->order_by->placeholder    = sanitize_text_field( (string) $raw );
			$written[]                   = 'orderby_placeholder';
		}
		if ( array_key_exists( 'orderby_icon_position', $settings ) || array_key_exists( 'order_by_icon_position', $settings ) ) {
			$raw = array_key_exists( 'orderby_icon_position', $settings ) ? $settings['orderby_icon_position'] : $settings['order_by_icon_position'];
			$pos = self::sanitize_icon_side( $raw );
			if ( is_wp_error( $pos ) ) {
				return $pos;
			}
			$s->order_by->icon_position = $pos;
			$written[]                  = 'orderby_icon_position';
		}
		return $written;
	}

	/**
	 * @param object               $s        Settings.
	 * @param array<string, mixed> $settings Patch.
	 * @return array<int, string>|WP_Error
	 */
	private static function patch_chrome_pagination( $s, $settings ) {
		$written = array();
		if ( array_key_exists( 'pagination_type', $settings ) ) {
			$type = sanitize_key( (string) $settings['pagination_type'] );
			if ( ! in_array( $type, array( 'number', 'number2', 'load-more', 'button', 'infinite-scroll' ), true ) ) {
				return new WP_Error(
					'caf_mcp_bad_pagination_type',
					__( 'pagination_type must be number, number2, load-more, button, or infinite-scroll.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			$s->pagination_type = $type;
			$written[]          = 'pagination_type';
		}
		if ( array_key_exists( 'posts_per_page', $settings ) ) {
			$n = function_exists( 'absint' ) ? absint( $settings['posts_per_page'] ) : abs( (int) $settings['posts_per_page'] );
			if ( $n < 1 || $n > 100 ) {
				return new WP_Error( 'caf_mcp_bad_posts_per_page', __( 'posts_per_page must be 1–100.', 'category-ajax-filter' ), array( 'status' => 400 ) );
			}
			$s->posts_per_page = (string) $n;
			$written[]         = 'posts_per_page';
		}
		if ( array_key_exists( 'ellipsis_enable', $settings ) || array_key_exists( 'ellipsis_value', $settings ) || array_key_exists( 'ellipsis', $settings ) ) {
			if ( ! isset( $s->ellipsis ) || ! is_object( $s->ellipsis ) ) {
				$s->ellipsis = (object) array(
					'is_enable' => 'true',
					'value'     => '...',
				);
			}
			if ( array_key_exists( 'ellipsis', $settings ) && is_array( $settings['ellipsis'] ) ) {
				if ( array_key_exists( 'is_enable', $settings['ellipsis'] ) ) {
					$s->ellipsis->is_enable = self::bool_flag( $settings['ellipsis']['is_enable'] );
				}
				if ( array_key_exists( 'value', $settings['ellipsis'] ) ) {
					$s->ellipsis->value = sanitize_text_field( (string) $settings['ellipsis']['value'] );
				}
				$written[] = 'ellipsis';
			}
			if ( array_key_exists( 'ellipsis_enable', $settings ) ) {
				$s->ellipsis->is_enable = self::bool_flag( $settings['ellipsis_enable'] );
				$written[]              = 'ellipsis_enable';
			}
			if ( array_key_exists( 'ellipsis_value', $settings ) ) {
				$s->ellipsis->value = sanitize_text_field( (string) $settings['ellipsis_value'] );
				$written[]          = 'ellipsis_value';
			}
		}
		foreach ( array( 'prev', 'next' ) as $side ) {
			$type_key = $side . '_type';
			$text_key = $side . '_text';
			$icon_key = $side . '_icon';
			if ( ! array_key_exists( $type_key, $settings ) && ! array_key_exists( $text_key, $settings ) && ! array_key_exists( $icon_key, $settings ) ) {
				continue;
			}
			if ( ! isset( $s->{$side} ) || ! is_object( $s->{$side} ) ) {
				$s->{$side} = new stdClass();
			}
			if ( array_key_exists( $type_key, $settings ) ) {
				$type = sanitize_key( (string) $settings[ $type_key ] );
				if ( ! in_array( $type, array( 'text', 'icon' ), true ) ) {
					return new WP_Error(
						'caf_mcp_bad_pagination_meta',
						__( 'prev_type / next_type must be text or icon.', 'category-ajax-filter' ),
						array( 'status' => 400 )
					);
				}
				$s->{$side}->type = $type;
				$written[]        = $type_key;
			}
			if ( array_key_exists( $text_key, $settings ) ) {
				$s->{$side}->text = sanitize_text_field( (string) $settings[ $text_key ] );
				$s->{$side}->type = isset( $s->{$side}->type ) ? $s->{$side}->type : 'text';
				$written[]        = $text_key;
			}
			if ( array_key_exists( $icon_key, $settings ) ) {
				self::set_nested_icon( $s->{$side}, $settings[ $icon_key ] );
				$s->{$side}->type = 'icon';
				$written[]        = $icon_key;
			}
		}
		if ( array_key_exists( 'load_more_text', $settings ) || array_key_exists( 'load_more_icon_enable', $settings ) || array_key_exists( 'load_more_icon', $settings ) ) {
			if ( ! isset( $s->load_more ) || ! is_object( $s->load_more ) ) {
				$s->load_more = new stdClass();
			}
			if ( array_key_exists( 'load_more_text', $settings ) ) {
				$s->load_more->text = sanitize_text_field( (string) $settings['load_more_text'] );
				$written[]          = 'load_more_text';
			}
			if ( array_key_exists( 'load_more_icon_enable', $settings ) ) {
				$s->load_more->icon_enable = self::bool_flag( $settings['load_more_icon_enable'] );
				$written[]                 = 'load_more_icon_enable';
			}
			if ( array_key_exists( 'load_more_icon', $settings ) ) {
				self::set_nested_icon( $s->load_more, $settings['load_more_icon'] );
				$s->load_more->icon_enable = 'true';
				$written[]                 = 'load_more_icon';
			}
		}
		return $written;
	}

	/**
	 * Design inner-tab aliases for Layout Control cards.
	 *
	 * @param string $key  Item or zone key.
	 * @param string $part Requested part.
	 * @return string
	 */
	private static function chrome_style_part( $key, $part ) {
		$part = sanitize_key( (string) $part );
		if ( in_array( $part, array( 'self', 'root', '_root', '' ), true ) ) {
			return 'self';
		}
		$aliases = array();
		if ( 'selected' === $key ) {
			$aliases = array(
				'outer'      => 'container',
				'wrapper'    => 'container',
				'item'       => 'meta',
				'chip'       => 'meta',
				'close'      => 'meta1',
				'close_icon' => 'meta1',
				'icon'       => 'meta1',
			);
		} elseif ( 'result_count' === $key ) {
			$aliases = array(
				'all'    => 'container',
				'outer'  => 'container',
				'prefix' => 'meta',
				'suffix' => 'meta1',
			);
		} elseif ( 'sorting' === $key ) {
			$aliases = array(
				'outer'           => 'container',
				'wrapper'         => 'container',
				'sort_order'      => 'meta',
				'order'           => 'meta',
				'item'            => 'meta1',
				'dropdown_item'   => 'meta1',
				'order_wrapper'   => 'meta2',
				'orderby_wrapper' => 'meta3',
				'dropdown'        => 'meta4',
				'order_by'        => 'meta5',
				'orderby'         => 'meta5',
			);
		} elseif ( 'pagination' === $key ) {
			$aliases = array(
				'button'        => 'meta',
				'load_more'     => 'meta',
				'loadmore'      => 'meta',
				'numbers'       => 'meta1',
				'page'          => 'meta1',
				'numbers_group' => 'meta2',
			);
		}
		return isset( $aliases[ $part ] ) ? $aliases[ $part ] : $part;
	}

	/**
	 * @param object               $node     Zone or item.
	 * @param array<string, mixed> $settings Patch.
	 * @return array<int, string>
	 */
	private static function apply_hide_flags( $node, $settings ) {
		$written = array();
		foreach ( array( 'desktop', 'tablet', 'mobile' ) as $dev ) {
			$key = 'hide_on_' . $dev;
			if ( ! array_key_exists( $key, $settings ) ) {
				continue;
			}
			if ( ! isset( $node->settings ) || ! is_object( $node->settings ) ) {
				$node->settings = new stdClass();
			}
			if ( ! isset( $node->settings->visibility ) || ! is_object( $node->settings->visibility ) ) {
				$node->settings->visibility = (object) array(
					'mobile'  => 'false',
					'tablet'  => 'false',
					'desktop' => 'false',
				);
			}
			$node->settings->visibility->{$dev} = self::bool_flag( $settings[ $key ] );
			$written[]                          = $key;
		}
		return $written;
	}

	/**
	 * @param object $parent Parent (prev/next/load_more).
	 * @param mixed  $icon   FA class.
	 * @return void
	 */
	private static function set_nested_icon( $parent, $icon ) {
		if ( ! isset( $parent->icons ) || ! is_object( $parent->icons ) ) {
			$parent->icons = new stdClass();
		}
		$parent->icons->visibility = true;
		$parent->icons->type       = 'icon';
		$parent->icons->icon       = sanitize_text_field( (string) $icon );
	}

	/**
	 * @param mixed $raw Values.
	 * @return array<int, string>|WP_Error
	 */
	private static function sanitize_order_values( $raw ) {
		$list = self::as_string_list( $raw );
		$out  = array();
		foreach ( $list as $item ) {
			$item = strtoupper( sanitize_key( (string) $item ) );
			if ( ! in_array( $item, array( 'ASC', 'DESC' ), true ) ) {
				return new WP_Error(
					'caf_mcp_bad_order_values',
					__( 'order_values must be ASC and/or DESC.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			if ( ! in_array( $item, $out, true ) ) {
				$out[] = $item;
			}
		}
		if ( empty( $out ) ) {
			return new WP_Error(
				'caf_mcp_bad_order_values',
				__( 'Keep at least one sort direction (ASC or DESC).', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		return $out;
	}

	/**
	 * @param mixed $raw Values.
	 * @return array<int, string>|WP_Error
	 */
	private static function sanitize_orderby_values( $raw ) {
		$list    = self::as_string_list( $raw );
		$allowed = array( 'title', 'ID', 'date', 'rand', 'menu_order', 'popularity', 'rating', 'price', 'price-desc' );
		$out     = array();
		foreach ( $list as $item ) {
			$item = (string) $item;
			if ( 'id' === strtolower( $item ) ) {
				$item = 'ID';
			}
			if ( 'pricedesc' === sanitize_key( $item ) || 'price_desc' === sanitize_key( $item ) ) {
				$item = 'price-desc';
			}
			if ( ! in_array( $item, $allowed, true ) ) {
				return new WP_Error(
					'caf_mcp_bad_orderby_values',
					__( 'orderby_values: title, ID, date, rand, menu_order, popularity, rating, price, price-desc.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			if ( ! in_array( $item, $out, true ) ) {
				$out[] = $item;
			}
		}
		if ( empty( $out ) ) {
			return new WP_Error(
				'caf_mcp_bad_orderby_values',
				__( 'Keep at least one Sort By option.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		return $out;
	}

	/**
	 * @param mixed $raw Side.
	 * @return string|WP_Error
	 */
	private static function sanitize_icon_side( $raw ) {
		$side = sanitize_key( (string) $raw );
		if ( ! in_array( $side, array( 'left', 'right' ), true ) ) {
			return new WP_Error(
				'caf_mcp_bad_icon_position',
				__( 'icon_position must be left or right.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		return $side;
	}

	/**
	 * @param mixed $raw List or csv.
	 * @return array<int, string>
	 */
	private static function as_string_list( $raw ) {
		if ( is_array( $raw ) ) {
			return $raw;
		}
		$str = trim( (string) $raw );
		if ( '' === $str ) {
			return array();
		}
		return preg_split( '/\s*,\s*/', $str );
	}

	/**
	 * @param string $key Item key.
	 * @return array<int, string>
	 */
	private static function chrome_mapped_keys( $key ) {
		$common = array( 'custom_class', 'custom_css', 'is_enable', 'enable', 'enabled', 'hide_on_desktop', 'hide_on_tablet', 'hide_on_mobile' );
		if ( 'selected' === $key ) {
			return array_merge( $common, array( 'close_button' ) );
		}
		if ( 'result_count' === $key ) {
			return array_merge( $common, array( 'prefix', 'prefix_text', 'prefix_enable', 'suffix', 'suffix_text', 'suffix_enable' ) );
		}
		if ( 'sorting' === $key ) {
			return array_merge(
				$common,
				array(
					'order',
					'order_by',
					'order_enable',
					'order_values',
					'order_placeholder',
					'order_icon_position',
					'orderby_enable',
					'order_by_enable',
					'orderby_values',
					'order_by_values',
					'orderby_placeholder',
					'order_by_placeholder',
					'orderby_icon_position',
					'order_by_icon_position',
				)
			);
		}
		if ( 'pagination' === $key ) {
			return array_merge(
				$common,
				array(
					'pagination_type',
					'posts_per_page',
					'ellipsis',
					'ellipsis_enable',
					'ellipsis_value',
					'prev_type',
					'prev_text',
					'prev_icon',
					'next_type',
					'next_text',
					'next_icon',
					'load_more_text',
					'load_more_icon_enable',
					'load_more_icon',
				)
			);
		}
		return $common;
	}

	/**
	 * @param string $key Key.
	 * @return bool
	 */
	private static function is_zone_key( $key ) {
		return in_array( (string) $key, array( 'filter_top', 'filter_bottom', 'post_top', 'post_bottom' ), true );
	}

	/**
	 * @param string $key Key.
	 * @return bool
	 */
	private static function is_item_key( $key ) {
		return in_array( (string) $key, array( 'selected', 'result_count', 'sorting', 'pagination' ), true );
	}

	/**
	 * @param string $id Parent id.
	 * @return string Zone key or empty.
	 */
	private static function normalize_zone_key( $id ) {
		$target = self::normalize_target( $id );
		if ( 0 === strpos( $target, 'dnd:' ) ) {
			$target = substr( $target, 4 );
		}
		return self::is_zone_key( $target ) ? $target : '';
	}

	/**
	 * @param string $id Element id.
	 * @return WP_Error
	 */
	private static function unknown_target( $id ) {
		return new WP_Error(
			'caf_mcp_element_not_found',
			sprintf(
				/* translators: %s: element id */
				__( 'Unknown last-screen id %s. Use preview:container, preview:filter, preview:post, preview:post_inner, preview:float, preview:loader, preview:extra, or preview:dnd:selected|result_count|sorting|pagination|filter_top|filter_bottom|post_top|post_bottom (see structure.preview).', 'category-ajax-filter' ),
				sanitize_text_field( (string) $id )
			),
			array( 'status' => 404 )
		);
	}
}

}
