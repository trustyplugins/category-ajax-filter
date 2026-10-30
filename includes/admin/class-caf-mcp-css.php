<?php
/**
 * Map plain CSS onto CAF nested style objects.
 * Builder JSON stays camelCase longhands. Frontend generator already reads those.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'CAF_MCP_Css', false ) ) {

class CAF_MCP_Css {

	const MAX_CSS_BYTES = 8000;

	/**
	 * @param object $node Layout node.
	 * @param string $part Style part (container, header, …) or empty for auto.
	 * @param string $css CSS text.
	 * @param string $device Default device when CSS has no @media.
	 * @return array<string, mixed>|WP_Error
	 */
	public static function apply_to_node( $node, $part, $css, $device = 'desktop' ) {
		$parsed = self::parse( $css, $device );
		if ( is_wp_error( $parsed ) ) {
			return $parsed;
		}

		$part = self::resolve_part( $node, $part );
		if ( is_wp_error( $part ) ) {
			return $part;
		}

		if ( ! isset( $node->style ) || ! is_object( $node->style ) ) {
			$node->style = new stdClass();
		}

		$written = array();
		foreach ( $parsed as $patch ) {
			$bucket = self::ensure_bucket( $node->style, $part, $patch['device'], $patch['state'] );
			foreach ( $patch['props'] as $key => $value ) {
				$bucket->{$key} = $value;
				$written[]      = ( $part ? $part . '.' : '' ) . $patch['device'] . '.' . $patch['state'] . '.' . $key;
			}
			self::fold_bucket_flex_aliases( $bucket );
		}

		return array(
			'action'     => 'style',
			'element_id' => isset( $node->id ) ? (string) $node->id : '',
			'part'       => $part,
			'written'    => $written,
		);
	}

	/**
	 * Prefer Design panel JSON. Keep custom_css only for selectors/properties Design cannot store.
	 *
	 * @param object $node Style-bearing node.
	 * @param string $css  Incoming custom_css.
	 * @param string $part Style part or empty.
	 * @return array{custom_css:string,design_written:array<int,string>,folded:bool,note:string}
	 */
	public static function apply_preferring_design( $node, $css, $part = '' ) {
		$css = is_string( $css ) ? $css : '';
		$out = array(
			'custom_css'      => $css,
			'design_written'  => array(),
			'folded'          => false,
			'note'            => '',
		);
		if ( '' === trim( $css ) ) {
			return $out;
		}
		$split = self::split_design_and_custom( $css );
		if ( '' !== $split['design'] ) {
			$applied = self::apply_to_node( $node, $part, $split['design'] );
			if ( ! is_wp_error( $applied ) ) {
				$out['design_written'] = isset( $applied['written'] ) && is_array( $applied['written'] ) ? $applied['written'] : array();
				$out['folded']         = ! empty( $out['design_written'] );
			} else {
				$out['custom_css'] = trim( $split['design'] . "\n" . $split['custom'] );
				$out['note']       = (string) $applied->get_error_message();
				return $out;
			}
		}
		$out['custom_css'] = $split['custom'];
		if ( $out['folded'] && '' === trim( $out['custom_css'] ) ) {
			$out['note'] = 'Saved to Design panel. custom_css was not needed.';
		} elseif ( $out['folded'] ) {
			$out['note'] = 'Design-capable CSS was saved to the Design panel. custom_css kept only for selectors or properties Design cannot express.';
		} elseif ( '' !== trim( $out['custom_css'] ) ) {
			$out['note'] = 'custom_css kept because Design has no matching control.';
		}
		return $out;
	}

	/**
	 * @param string $css CSS.
	 * @return array{design:string,custom:string}
	 */
	public static function split_design_and_custom( $css ) {
		$css = self::strip_comments( is_string( $css ) ? $css : '' );
		$css = trim( $css );
		if ( '' === $css ) {
			return array(
				'design' => '',
				'custom' => '',
			);
		}
		$design = array();
		$custom = array();
		foreach ( self::split_top_level_rules( $css ) as $rule ) {
			$rule = trim( $rule );
			if ( '' === $rule ) {
				continue;
			}
			if ( preg_match( '/^@(keyframes|font-face|supports|layer|import)\b/i', $rule ) ) {
				$custom[] = $rule;
				continue;
			}
			if ( preg_match( '/^@media\s*/i', $rule ) ) {
				$media = self::split_media_rule( $rule );
				if ( '' !== $media['design'] ) {
					$design[] = $media['design'];
				}
				if ( '' !== $media['custom'] ) {
					$custom[] = $media['custom'];
				}
				continue;
			}
			$parts = self::split_qualified_or_bare( $rule );
			if ( '' !== $parts['design'] ) {
				$design[] = $parts['design'];
			}
			if ( '' !== $parts['custom'] ) {
				$custom[] = $parts['custom'];
			}
		}
		return array(
			'design' => trim( implode( "\n", $design ) ),
			'custom' => trim( implode( "\n", $custom ) ),
		);
	}

	/**
	 * @param string $css CSS.
	 * @return array<int, string>
	 */
	private static function split_top_level_rules( $css ) {
		$rules = array();
		$buf   = '';
		$depth = 0;
		$len   = strlen( $css );
		for ( $i = 0; $i < $len; $i++ ) {
			$ch   = $css[ $i ];
			$buf .= $ch;
			if ( '{' === $ch ) {
				++$depth;
			} elseif ( '}' === $ch && $depth > 0 ) {
				--$depth;
				if ( 0 === $depth ) {
					$rules[] = trim( $buf );
					$buf     = '';
				}
			}
		}
		if ( '' !== trim( $buf ) ) {
			$rules[] = trim( $buf );
		}
		return $rules;
	}

	/**
	 * @param string $rule @media rule.
	 * @return array{design:string,custom:string}
	 */
	private static function split_media_rule( $rule ) {
		$open = strpos( $rule, '{' );
		if ( false === $open ) {
			return array(
				'design' => '',
				'custom' => $rule,
			);
		}
		$inner = self::extract_block( $rule, $open );
		if ( null === $inner ) {
			return array(
				'design' => '',
				'custom' => $rule,
			);
		}
		$query = trim( substr( $rule, 0, $open ) );
		$split = self::split_design_and_custom( $inner['body'] );
		$design = '';
		$custom = '';
		if ( '' !== $split['design'] ) {
			$design = $query . ' { ' . $split['design'] . ' }';
		}
		if ( '' !== $split['custom'] ) {
			$custom = $query . ' { ' . $split['custom'] . ' }';
		}
		return array(
			'design' => $design,
			'custom' => $custom,
		);
	}

	/**
	 * @param string $rule Bare declarations or selector { body }.
	 * @return array{design:string,custom:string}
	 */
	private static function split_qualified_or_bare( $rule ) {
		$open = strpos( $rule, '{' );
		if ( false === $open ) {
			return self::partition_declaration_css( $rule );
		}
		$selector = trim( substr( $rule, 0, $open ) );
		$inner    = self::extract_block( $rule, $open );
		if ( null === $inner ) {
			return array(
				'design' => '',
				'custom' => $rule,
			);
		}
		if ( ! self::is_self_selector( $selector ) ) {
			return array(
				'design' => '',
				'custom' => $rule,
			);
		}
		$parts = self::partition_declaration_css( $inner['body'] );
		$state = self::self_selector_state( $selector );
		if ( '' !== $state ) {
			if ( '' !== $parts['design'] ) {
				$parts['design'] = '&:' . $state . ' { ' . $parts['design'] . ' }';
			}
			if ( '' !== $parts['custom'] ) {
				$parts['custom'] = '&:' . $state . ' { ' . $parts['custom'] . ' }';
			}
			return $parts;
		}
		if ( '' !== $parts['custom'] ) {
			$orig = $selector;
			if ( '' === $orig ) {
				$orig = '&';
			}
			$parts['custom'] = $orig . ' { ' . $parts['custom'] . ' }';
		}
		return $parts;
	}

	/**
	 * @param string $selector Selector.
	 * @return string hover|selected|empty
	 */
	private static function self_selector_state( $selector ) {
		$sel = strtolower( trim( (string) $selector ) );
		$sel = preg_replace( '/\s+/', '', $sel );
		if ( ! preg_match( '/:(hover|focus|active|selected)$/', $sel, $match ) ) {
			return '';
		}
		$state = $match[1];
		if ( 'focus' === $state || 'active' === $state ) {
			return 'hover';
		}
		return $state;
	}

	/**
	 * @param string $selector Selector.
	 * @return bool
	 */
	private static function is_self_selector( $selector ) {
		$sel = strtolower( trim( (string) $selector ) );
		$sel = preg_replace( '/\s+/', '', $sel );
		if ( '' === $sel || '&' === $sel ) {
			return true;
		}
		if ( preg_match( '/^&?:(hover|focus|active|selected)$/', $sel ) ) {
			return true;
		}
		$classes = array(
			'caf-builder-preview-template-container',
			'caf-builder-preview-template',
		);
		foreach ( $classes as $class ) {
			if ( '.' . $class === $sel ) {
				return true;
			}
			if ( preg_match( '/^\.' . preg_quote( $class, '/' ) . ':(hover|focus|active|selected)$/', $sel ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Split a declaration list (optional &:hover blocks) into Design vs leftover.
	 *
	 * @param string $body Body.
	 * @return array{design:string,custom:string}
	 */
	private static function partition_declaration_css( $body ) {
		$design = array();
		$custom = array();
		$chunks = self::split_state_chunks( $body, 'desktop' );
		foreach ( $chunks as $chunk ) {
			$parted = self::partition_plain_declarations( $chunk['body'] );
			$state  = isset( $chunk['state'] ) ? (string) $chunk['state'] : 'default';
			if ( '' !== $parted['design'] ) {
				$design[] = 'default' === $state ? $parted['design'] : '&:' . $state . ' { ' . $parted['design'] . ' }';
			}
			if ( '' !== $parted['custom'] ) {
				$custom[] = 'default' === $state ? $parted['custom'] : '&:' . $state . ' { ' . $parted['custom'] . ' }';
			}
		}
		return array(
			'design' => trim( implode( ' ', $design ) ),
			'custom' => trim( implode( ' ', $custom ) ),
		);
	}

	/**
	 * @param string $body Declaration list.
	 * @return array{design:string,custom:string}
	 */
	private static function partition_plain_declarations( $body ) {
		$design = array();
		$custom = array();
		foreach ( self::split_declarations( $body ) as $decl ) {
			$decl = trim( $decl );
			if ( '' === $decl || false === strpos( $decl, ':' ) ) {
				continue;
			}
			list( $raw_prop, $raw_val ) = array_map( 'trim', explode( ':', $decl, 2 ) );
			$prop                       = strtolower( $raw_prop );
			$val                        = self::sanitize_value( $raw_val );
			if ( self::is_design_property( $prop ) && null !== $val && ! empty( self::expand_property( $prop, $val ) ) ) {
				$design[] = $decl;
			} else {
				$custom[] = $decl;
			}
		}
		return array(
			'design' => implode( '; ', $design ) . ( $design ? ';' : '' ),
			'custom' => implode( '; ', $custom ) . ( $custom ? ';' : '' ),
		);
	}

	/**
	 * Properties the Design panel stores (and action=style maps).
	 *
	 * @param string $prop Kebab-case.
	 * @return bool
	 */
	private static function is_design_property( $prop ) {
		$prop = strtolower( (string) $prop );
		$exact = array(
			'display'           => true,
			'flex'              => true,
			'flex-flow'         => true,
			'flex-direction'    => true,
			'flex-wrap'         => true,
			'justify-content'   => true,
			'align-items'       => true,
			'align-content'     => true,
			'align-self'        => true,
			'gap'               => true,
			'column-gap'        => true,
			'row-gap'           => true,
			'float'             => true,
			'width'             => true,
			'height'            => true,
			'min-width'         => true,
			'min-height'        => true,
			'max-width'         => true,
			'max-height'        => true,
			'padding'           => true,
			'margin'            => true,
			'border'            => true,
			'border-width'      => true,
			'border-style'      => true,
			'border-color'      => true,
			'border-radius'     => true,
			'background'        => true,
			'background-color'  => true,
			'color'             => true,
			'font-family'       => true,
			'font-size'         => true,
			'font-weight'       => true,
			'font-style'        => true,
			'line-height'       => true,
			'letter-spacing'    => true,
			'text-align'        => true,
			'text-transform'    => true,
			'text-decoration'   => true,
			'box-shadow'        => true,
			'opacity'           => true,
			'overflow'          => true,
			'overflow-x'        => true,
			'overflow-y'        => true,
			'position'          => true,
			'top'               => true,
			'right'             => true,
			'bottom'            => true,
			'left'              => true,
			'inset'             => true,
			'z-index'           => true,
			'cursor'            => true,
			'white-space'       => true,
			'visibility'        => true,
			'box-sizing'        => true,
			'vertical-align'    => true,
			'object-fit'        => true,
			'object-position'   => true,
		);
		if ( isset( $exact[ $prop ] ) ) {
			return true;
		}
		if ( preg_match( '/^(padding|margin)-(top|right|bottom|left)$/', $prop ) ) {
			return true;
		}
		if ( preg_match( '/^border-(top|right|bottom|left)(-(width|style|color))?$/', $prop ) ) {
			return true;
		}
		if ( preg_match( '/^border-(top|bottom)-(left|right)-radius$/', $prop ) ) {
			return true;
		}
		return false;
	}

	/**
	 * @param string $css CSS.
	 * @param string $device Default device.
	 * @return array<int, array{device:string,state:string,props:array<string,string>}>|WP_Error
	 */
	public static function parse( $css, $device = 'desktop' ) {
		$css = is_string( $css ) ? $css : '';
		if ( '' === trim( $css ) ) {
			return new WP_Error( 'caf_mcp_css_empty', __( 'css is required for action=style.', 'category-ajax-filter' ), array( 'status' => 400 ) );
		}
		if ( strlen( $css ) > self::MAX_CSS_BYTES ) {
			return new WP_Error( 'caf_mcp_css_too_long', __( 'css must be 8000 characters or fewer.', 'category-ajax-filter' ), array( 'status' => 400 ) );
		}

		$device = self::normalize_device( $device );
		$css    = self::strip_comments( $css );
		if ( self::is_blocked_css( $css ) ) {
			return new WP_Error( 'caf_mcp_css_unsafe', __( 'That CSS is not allowed (url/expression/@import).', 'category-ajax-filter' ), array( 'status' => 400 ) );
		}

		$chunks = self::split_chunks( $css, $device );
		$out    = array();
		foreach ( $chunks as $chunk ) {
			$props = self::parse_declarations( $chunk['body'] );
			if ( empty( $props ) ) {
				continue;
			}
			$out[] = array(
				'device' => $chunk['device'],
				'state'  => $chunk['state'],
				'props'  => $props,
			);
		}
		if ( empty( $out ) ) {
			return new WP_Error( 'caf_mcp_css_empty', __( 'No usable CSS declarations were found.', 'category-ajax-filter' ), array( 'status' => 400 ) );
		}
		return $out;
	}

	/**
	 * @param object $node Node.
	 * @param string $part Requested part.
	 * @return string|WP_Error
	 */
	private static function resolve_part( $node, $part ) {
		$part = sanitize_key( (string) $part );
		if ( in_array( $part, array( 'self', 'root', '_root' ), true ) ) {
			$part = '';
		}
		$post_desktop = array(
			'image',
			'title',
			'excerpt',
			'button',
			'author',
			'date',
			'commentcount',
			'categories',
			'customfield',
			'woo_product_image',
			'product_price',
			'woo_product_rating',
			'woo_add_to_cart',
			'badges',
		);
		$key = isset( $node->key ) ? (string) $node->key : '';
		$is_post_desktop = in_array( $key, $post_desktop, true )
			|| ( 'customtext' === $key && self::uses_root_style( $node ) );
		if ( $is_post_desktop ) {
			if ( '' === $part || 'container' === $part ) {
				self::drop_spurious_container_part( $node );
				return '';
			}
			return $part;
		}
		if ( self::is_filter_shaped_style( $node ) ) {
			if ( '' === $part || 'container' === $part ) {
				return 'container';
			}
			return $part;
		}
		if ( '' === $part || 'container' === $part ) {
			if ( self::uses_root_style( $node ) || self::is_root_style_frame( $node ) ) {
				self::drop_spurious_container_part( $node );
				return '';
			}
		}
		if ( '' !== $part ) {
			return $part;
		}
		if ( isset( $node->style ) && is_object( $node->style ) && isset( $node->style->container ) && is_object( $node->style->container ) ) {
			return 'container';
		}
		return '';
	}

	/**
	 * Filter modules and Layout Control cards store Design on style.container.
	 * Outer Wrapper, rows, columns, and preview layers store it on style.desktop.
	 *
	 * @param object $node Node.
	 * @return bool
	 */
	private static function is_filter_shaped_style( $node ) {
		$key = isset( $node->key ) ? (string) $node->key : '';
		$filter_keys = array(
			'checkbox_filter',
			'dropdown_filter',
			'search',
			'reset',
			'range_slider',
			'woo_rating_filter',
			'pagination',
			'woo_attribute_swatch',
			'selected',
			'result_count',
			'sorting',
		);
		if ( in_array( $key, $filter_keys, true ) ) {
			return true;
		}
		if ( 'customtext' === $key && ! self::uses_root_style( $node ) ) {
			return true;
		}
		return isset( $node->style )
			&& is_object( $node->style )
			&& isset( $node->style->container )
			&& is_object( $node->style->container )
			&& ! self::is_device_style_tree( $node->style );
	}

	/**
	 * @param object $node Node.
	 * @return bool
	 */
	private static function is_root_style_frame( $node ) {
		$type = isset( $node->type ) ? (string) $node->type : '';
		return in_array( $type, array( 'row', 'column' ), true );
	}

	/**
	 * @param object $node Node.
	 * @return bool
	 */
	private static function uses_root_style( $node ) {
		if ( self::is_root_style_frame( $node ) ) {
			return true;
		}
		return isset( $node->style ) && is_object( $node->style ) && self::is_device_style_tree( $node->style );
	}

	/**
	 * Live CAF device tree is style.desktop.default, not style.container.desktop.
	 *
	 * @param object $style Style object.
	 * @return bool
	 */
	private static function is_device_style_tree( $style ) {
		if ( ! is_object( $style ) || ! isset( $style->desktop ) || ! is_object( $style->desktop ) ) {
			return false;
		}
		$desktop = $style->desktop;
		return isset( $desktop->default ) || isset( $desktop->hover ) || isset( $desktop->selected ) || isset( $desktop->placeholder );
	}

	/**
	 * MCP used to nest part=container under style.container on root-style nodes.
	 * Frontend reads style.desktop, so drop that unused nest after a correct write.
	 *
	 * @param object $node Node.
	 * @return void
	 */
	private static function drop_spurious_container_part( $node ) {
		if ( isset( $node->style ) && is_object( $node->style ) && isset( $node->style->container ) ) {
			unset( $node->style->container );
		}
	}

	/**
	 * @param object $style Root style object.
	 * @param string $part Part or empty.
	 * @param string $device Device.
	 * @param string $state State.
	 * @return object
	 */
	private static function ensure_bucket( $style, $part, $device, $state ) {
		$cursor = $style;
		if ( '' !== $part ) {
			if ( ! isset( $cursor->{$part} ) || ! is_object( $cursor->{$part} ) ) {
				$cursor->{$part} = new stdClass();
			}
			$cursor = $cursor->{$part};
		}
		if ( ! isset( $cursor->{$device} ) || ! is_object( $cursor->{$device} ) ) {
			$cursor->{$device} = new stdClass();
		}
		if ( ! isset( $cursor->{$device}->{$state} ) || ! is_object( $cursor->{$device}->{$state} ) ) {
			$cursor->{$device}->{$state} = new stdClass();
		}
		return $cursor->{$device}->{$state};
	}

	/**
	 * @param string $css CSS.
	 * @param string $device Default device.
	 * @return array<int, array{device:string,state:string,body:string}>
	 */
	private static function split_chunks( $css, $device ) {
		$chunks = array();
		$rest   = trim( $css );
		while ( '' !== $rest ) {
			if ( preg_match( '/^@media\s*([^{]+)\{/i', $rest, $match ) ) {
				$inner = self::extract_block( $rest, strlen( $match[0] ) - 1 );
				if ( null === $inner ) {
					break;
				}
				$media_device = self::device_from_media( $match[1], $device );
				foreach ( self::split_state_chunks( $inner['body'], $media_device ) as $piece ) {
					$chunks[] = $piece;
				}
				$rest = ltrim( $inner['after'] );
				continue;
			}
			$pieces = self::split_state_chunks( $rest, $device );
			return array_merge( $chunks, $pieces );
		}
		return $chunks;
	}

	/**
	 * @param string $css CSS fragment.
	 * @param string $device Device.
	 * @return array<int, array{device:string,state:string,body:string}>
	 */
	private static function split_state_chunks( $css, $device ) {
		$chunks = array();
		$rest   = trim( $css );
		$plain  = '';
		while ( '' !== $rest ) {
			if ( preg_match( '/^&?:(hover|selected|focus|active)\s*\{/i', $rest, $match ) ) {
				if ( '' !== trim( $plain ) ) {
					$chunks[] = array(
						'device' => $device,
						'state'  => 'default',
						'body'   => $plain,
					);
					$plain    = '';
				}
				$inner = self::extract_block( $rest, strlen( $match[0] ) - 1 );
				if ( null === $inner ) {
					break;
				}
				$state = strtolower( $match[1] );
				if ( 'focus' === $state || 'active' === $state ) {
					$state = 'hover';
				}
				$chunks[] = array(
					'device' => $device,
					'state'  => $state,
					'body'   => $inner['body'],
				);
				$rest = ltrim( $inner['after'] );
				continue;
			}
			if ( preg_match( '/^[&.]selected\s*\{/i', $rest, $match ) ) {
				if ( '' !== trim( $plain ) ) {
					$chunks[] = array(
						'device' => $device,
						'state'  => 'default',
						'body'   => $plain,
					);
					$plain    = '';
				}
				$inner = self::extract_block( $rest, strlen( $match[0] ) - 1 );
				if ( null === $inner ) {
					break;
				}
				$chunks[] = array(
					'device' => $device,
					'state'  => 'selected',
					'body'   => $inner['body'],
				);
				$rest = ltrim( $inner['after'] );
				continue;
			}
			if ( '{' === $rest[0] ) {
				$inner = self::extract_block( $rest, 0 );
				$rest  = $inner ? ltrim( $inner['after'] ) : '';
				continue;
			}
			$plain .= $rest[0];
			$rest   = substr( $rest, 1 );
		}
		if ( '' !== trim( $plain ) ) {
			$chunks[] = array(
				'device' => $device,
				'state'  => 'default',
				'body'   => $plain,
			);
		}
		return $chunks;
	}

	/**
	 * @param string $css Full string.
	 * @param int    $open_brace Index of '{'.
	 * @return array{body:string,after:string}|null
	 */
	private static function extract_block( $css, $open_brace ) {
		$len   = strlen( $css );
		$depth = 0;
		for ( $i = $open_brace; $i < $len; $i++ ) {
			if ( '{' === $css[ $i ] ) {
				++$depth;
			} elseif ( '}' === $css[ $i ] ) {
				--$depth;
				if ( 0 === $depth ) {
					return array(
						'body'  => substr( $css, $open_brace + 1, $i - $open_brace - 1 ),
						'after' => substr( $css, $i + 1 ),
					);
				}
			}
		}
		return null;
	}

	/**
	 * @param string $query @media query.
	 * @param string $fallback Device.
	 * @return string
	 */
	private static function device_from_media( $query, $fallback ) {
		if ( preg_match( '/max-width\s*:\s*(\d+)/i', $query, $match ) ) {
			$px = (int) $match[1];
			if ( $px <= 767 ) {
				return 'mobile';
			}
			if ( $px <= 1024 ) {
				return 'tablet';
			}
		}
		if ( preg_match( '/\b(mobile|tablet|desktop)\b/i', $query, $match ) ) {
			return self::normalize_device( $match[1] );
		}
		return $fallback;
	}

	/**
	 * @param string $body Declaration list.
	 * @return array<string, string>
	 */
	private static function parse_declarations( $body ) {
		$props = array();
		$parts = self::split_declarations( $body );
		foreach ( $parts as $decl ) {
			$decl = trim( $decl );
			if ( '' === $decl || false === strpos( $decl, ':' ) ) {
				continue;
			}
			list( $raw_prop, $raw_val ) = array_map( 'trim', explode( ':', $decl, 2 ) );
			$prop                       = strtolower( $raw_prop );
			if ( ! preg_match( '/^[a-z-]+$/', $prop ) ) {
				continue;
			}
			$val = self::sanitize_value( $raw_val );
			if ( null === $val ) {
				continue;
			}
			foreach ( self::expand_property( $prop, $val ) as $camel => $expanded ) {
				$props[ $camel ] = $expanded;
			}
		}
		return $props;
	}

	/**
	 * @param string $body Body.
	 * @return array<int, string>
	 */
	private static function split_declarations( $body ) {
		$out   = array();
		$buf   = '';
		$depth = 0;
		$len   = strlen( $body );
		for ( $i = 0; $i < $len; $i++ ) {
			$ch = $body[ $i ];
			if ( '(' === $ch ) {
				++$depth;
			} elseif ( ')' === $ch && $depth > 0 ) {
				--$depth;
			}
			if ( ';' === $ch && 0 === $depth ) {
				$out[] = $buf;
				$buf   = '';
				continue;
			}
			$buf .= $ch;
		}
		if ( '' !== trim( $buf ) ) {
			$out[] = $buf;
		}
		return $out;
	}

	/**
	 * @param string $prop Kebab property.
	 * @param string $value Value.
	 * @return array<string, string>
	 */
	private static function expand_property( $prop, $value ) {
		$boxes = array(
			'padding'      => array( 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft' ),
			'margin'       => array( 'marginTop', 'marginRight', 'marginBottom', 'marginLeft' ),
			'border-width' => array( 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth' ),
			'border-style' => array( 'borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle' ),
			'border-color' => array( 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor' ),
			'inset'        => array( 'top', 'right', 'bottom', 'left' ),
		);
		if ( isset( $boxes[ $prop ] ) ) {
			$sides = self::split_box_values( $value );
			$out   = array();
			foreach ( $boxes[ $prop ] as $i => $key ) {
				$out[ $key ] = $sides[ $i ];
			}
			return $out;
		}
		if ( 'border-radius' === $prop ) {
			$sides = self::split_box_values( $value );
			return array(
				'borderTopLeftRadius'     => $sides[0],
				'borderTopRightRadius'    => $sides[1],
				'borderBottomRightRadius' => $sides[2],
				'borderBottomLeftRadius'  => $sides[3],
			);
		}
		if ( 'background' === $prop && preg_match( '/^(#|rgb|hsl|transparent|[a-z]+$)/i', $value ) ) {
			return array( 'backgroundColor' => $value );
		}
		if ( 'flex-direction' === $prop ) {
			$dir = self::flex_direction_token( $value );
			return $dir ? array( 'flexFlow' => $dir ) : array();
		}
		if ( 'flex-flow' === $prop ) {
			return self::expand_flex_flow( $value );
		}
		return array( self::to_camel( $prop ) => $value );
	}

	/**
	 * CAF Design → Layout Direction reads flexFlow (row|column|…), not flexDirection.
	 *
	 * @param object $bucket Style state object.
	 * @return void
	 */
	public static function fold_bucket_flex_aliases( $bucket ) {
		if ( ! is_object( $bucket ) || ! isset( $bucket->flexDirection ) ) {
			return;
		}
		$dir = self::flex_direction_token( (string) $bucket->flexDirection );
		if ( $dir ) {
			$bucket->flexFlow = $dir;
		}
		unset( $bucket->flexDirection );
	}

	/**
	 * Heal MCP-written flexDirection onto flexFlow so Design → Align matches preview.
	 *
	 * @param object $doc Layout document.
	 * @return void
	 */
	public static function fold_document_flex_aliases( $doc ) {
		if ( ! is_object( $doc ) ) {
			return;
		}
		if ( isset( $doc->filter_layout_data->initial_data ) ) {
			self::fold_tree_flex_aliases( $doc->filter_layout_data->initial_data );
		}
		if ( isset( $doc->post_layout_data->initial_data ) ) {
			self::fold_tree_flex_aliases( $doc->post_layout_data->initial_data );
		}
	}

	/**
	 * @param mixed $nodes Tree.
	 * @return void
	 */
	private static function fold_tree_flex_aliases( $nodes ) {
		if ( is_array( $nodes ) ) {
			foreach ( $nodes as $child ) {
				self::fold_tree_flex_aliases( $child );
			}
			return;
		}
		if ( ! is_object( $nodes ) ) {
			return;
		}
		if ( isset( $nodes->style ) ) {
			self::fold_style_tree_flex_aliases( $nodes->style );
		}
		if ( isset( $nodes->data ) ) {
			self::fold_tree_flex_aliases( $nodes->data );
		}
	}

	/**
	 * @param mixed $node Style subtree.
	 * @return void
	 */
	private static function fold_style_tree_flex_aliases( $node ) {
		if ( is_array( $node ) ) {
			foreach ( $node as $child ) {
				self::fold_style_tree_flex_aliases( $child );
			}
			return;
		}
		if ( ! is_object( $node ) ) {
			return;
		}
		self::fold_bucket_flex_aliases( $node );
		foreach ( get_object_vars( $node ) as $child ) {
			if ( is_object( $child ) || is_array( $child ) ) {
				self::fold_style_tree_flex_aliases( $child );
			}
		}
	}

	/**
	 * @param string $value flex-flow value.
	 * @return array<string, string>
	 */
	private static function expand_flex_flow( $value ) {
		$bits = preg_split( '/\s+/', strtolower( trim( (string) $value ) ) );
		$bits = is_array( $bits ) ? array_values( array_filter( $bits, 'strlen' ) ) : array();
		$out  = array();
		if ( isset( $bits[0] ) ) {
			$dir = self::flex_direction_token( $bits[0] );
			if ( $dir ) {
				$out['flexFlow'] = $dir;
			}
		}
		if ( isset( $bits[1] ) && in_array( $bits[1], array( 'wrap', 'nowrap', 'wrap-reverse' ), true ) ) {
			$out['flexWrap'] = $bits[1];
		}
		return $out;
	}

	/**
	 * @param string $value flex-direction or first flex-flow token.
	 * @return string
	 */
	private static function flex_direction_token( $value ) {
		$bits = preg_split( '/\s+/', strtolower( trim( (string) $value ) ) );
		$dir  = ( is_array( $bits ) && isset( $bits[0] ) ) ? $bits[0] : '';
		if ( in_array( $dir, array( 'row', 'column', 'row-reverse', 'column-reverse' ), true ) ) {
			return $dir;
		}
		return '';
	}

	/**
	 * @param string $value Box shorthand.
	 * @return array{0:string,1:string,2:string,3:string}
	 */
	private static function split_box_values( $value ) {
		$bits = preg_split( '/\s+/', trim( $value ) );
		$bits = array_values( array_filter( $bits, 'strlen' ) );
		if ( 1 === count( $bits ) ) {
			return array( $bits[0], $bits[0], $bits[0], $bits[0] );
		}
		if ( 2 === count( $bits ) ) {
			return array( $bits[0], $bits[1], $bits[0], $bits[1] );
		}
		if ( 3 === count( $bits ) ) {
			return array( $bits[0], $bits[1], $bits[2], $bits[1] );
		}
		return array( $bits[0], $bits[1], $bits[2], $bits[3] );
	}

	/**
	 * @param string $prop Kebab.
	 * @return string
	 */
	private static function to_camel( $prop ) {
		return preg_replace_callback(
			'/-([a-z])/',
			static function ( $m ) {
				return strtoupper( $m[1] );
			},
			$prop
		);
	}

	/**
	 * @param string $value Raw value.
	 * @return string|null
	 */
	private static function sanitize_value( $value ) {
		$value = trim( $value );
		$value = rtrim( $value, ';' );
		if ( '' === $value ) {
			return null;
		}
		$lower = strtolower( $value );
		if ( false !== strpos( $lower, 'javascript:' ) || false !== strpos( $lower, 'expression(' ) || false !== strpos( $lower, 'url(' ) ) {
			return null;
		}
		if ( preg_match( '/[<>]|\\\\0/', $value ) ) {
			return null;
		}
		return $value;
	}

	/**
	 * @param string $css CSS.
	 * @return bool
	 */
	private static function is_blocked_css( $css ) {
		$lower = strtolower( $css );
		if ( false !== strpos( $lower, '@import' ) || false !== strpos( $lower, 'javascript:' ) || false !== strpos( $lower, 'expression(' ) || false !== strpos( $lower, 'url(' ) ) {
			return true;
		}
		return false;
	}

	/**
	 * @param string $css CSS.
	 * @return string
	 */
	private static function strip_comments( $css ) {
		return preg_replace( '/\/\*.*?\*\//s', '', $css );
	}

	/**
	 * @param string $device Device.
	 * @return string
	 */
	private static function normalize_device( $device ) {
		$device = sanitize_key( (string) $device );
		if ( in_array( $device, array( 'desktop', 'tablet', 'mobile' ), true ) ) {
			return $device;
		}
		return 'desktop';
	}
}

}
