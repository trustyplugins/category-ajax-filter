<?php
/**
 * MCP document helpers: query restriction, import/export, snapshots.
 * Does not change frontend rendering by itself — callers persist the layout.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'CAF_MCP_Document', false ) ) {

class CAF_MCP_Document {

	const MAX_SNAPSHOTS    = 5;
	const MAX_IMPORT_BYTES = 2097152;

	/**
	 * @param object $doc Layout.
	 * @return object filter_layout_data.extra_data
	 */
	public static function ensure_filter_layout_extra( $doc ) {
		if ( ! isset( $doc->filter_layout_data ) || ! is_object( $doc->filter_layout_data ) ) {
			$doc->filter_layout_data = new stdClass();
		}
		$fl = $doc->filter_layout_data;
		if ( ! isset( $fl->extra_data ) || ! is_object( $fl->extra_data ) ) {
			$fl->extra_data = new stdClass();
		}
		return $fl->extra_data;
	}

	/**
	 * @return object
	 */
	public static function empty_qr_side() {
		return (object) array(
			'by'         => '',
			'taxonomies' => array(),
			'taxonomy'   => '',
			'term_data'  => array(),
			'post_data'  => array(),
		);
	}

	/**
	 * @param object $doc Layout.
	 * @return object
	 */
	public static function ensure_query_restriction( $doc ) {
		$extra = self::ensure_filter_layout_extra( $doc );
		if ( ! isset( $extra->query_restriction ) || ! is_object( $extra->query_restriction ) ) {
			$extra->query_restriction = (object) array(
				'enabled' => 'false',
				'include' => self::empty_qr_side(),
				'exclude' => self::empty_qr_side(),
			);
		}
		$qr = $extra->query_restriction;
		if ( ! isset( $qr->include ) || ! is_object( $qr->include ) ) {
			$qr->include = self::empty_qr_side();
		}
		if ( ! isset( $qr->exclude ) || ! is_object( $qr->exclude ) ) {
			$qr->exclude = self::empty_qr_side();
		}
		return $qr;
	}

	/**
	 * @param object $doc Layout.
	 * @return object
	 */
	public static function ensure_term_page_mode( $doc ) {
		$extra = self::ensure_filter_layout_extra( $doc );
		if ( ! isset( $extra->category_term_page_mode ) || ! is_object( $extra->category_term_page_mode ) ) {
			$extra->category_term_page_mode = (object) array(
				'enabled'           => 'false',
				'reset_returns_to'  => 'current_term',
				'include_children'  => 'false',
			);
		}
		return $extra->category_term_page_mode;
	}

	/**
	 * Lean query-restriction summary for structure / settings responses.
	 *
	 * @param object $doc Layout.
	 * @return array<string, mixed>
	 */
	public static function lean_query_restriction( $doc ) {
		$extra = ( isset( $doc->filter_layout_data ) && is_object( $doc->filter_layout_data ) && isset( $doc->filter_layout_data->extra_data ) && is_object( $doc->filter_layout_data->extra_data ) )
			? $doc->filter_layout_data->extra_data
			: null;
		$qr = ( $extra && isset( $extra->query_restriction ) && is_object( $extra->query_restriction ) )
			? $extra->query_restriction
			: null;
		return array(
			'enabled'           => ( $qr && isset( $qr->enabled ) ) ? (string) $qr->enabled : 'false',
			'taxonomy_relation' => ( $extra && isset( $extra->taxonomy_relation ) ) ? (string) $extra->taxonomy_relation : 'OR',
			'include'           => self::lean_qr_side( $qr && isset( $qr->include ) ? $qr->include : null ),
			'exclude'           => self::lean_qr_side( $qr && isset( $qr->exclude ) ? $qr->exclude : null ),
		);
	}

	/**
	 * @param object $doc Layout.
	 * @return array<string, mixed>
	 */
	public static function lean_term_page_mode( $doc ) {
		$extra = ( isset( $doc->filter_layout_data ) && is_object( $doc->filter_layout_data ) && isset( $doc->filter_layout_data->extra_data ) && is_object( $doc->filter_layout_data->extra_data ) )
			? $doc->filter_layout_data->extra_data
			: null;
		$mode = ( $extra && isset( $extra->category_term_page_mode ) && is_object( $extra->category_term_page_mode ) )
			? $extra->category_term_page_mode
			: null;
		return array(
			'enabled'          => ( $mode && isset( $mode->enabled ) ) ? (string) $mode->enabled : 'false',
			'reset_returns_to' => ( $mode && isset( $mode->reset_returns_to ) ) ? (string) $mode->reset_returns_to : 'current_term',
			'include_children' => ( $mode && isset( $mode->include_children ) ) ? (string) $mode->include_children : 'false',
		);
	}

	/**
	 * @param object $doc Layout.
	 * @param array  $patch Patch.
	 * @return array<string, mixed>|WP_Error
	 */
	public static function apply_query_restriction( $doc, $patch ) {
		$changed = array();
		if ( ! empty( $patch['clear'] ) ) {
			$extra                      = self::ensure_filter_layout_extra( $doc );
			$extra->query_restriction   = (object) array(
				'enabled' => 'false',
				'include' => self::empty_qr_side(),
				'exclude' => self::empty_qr_side(),
			);
			$changed['query_restriction'] = self::lean_query_restriction( $doc );
			return $changed;
		}

		$qr = self::ensure_query_restriction( $doc );

		if ( array_key_exists( 'enabled', $patch ) ) {
			$qr->enabled         = self::bool_flag( $patch['enabled'] );
			$changed['enabled']  = $qr->enabled;
		}

		if ( array_key_exists( 'taxonomy_relation', $patch ) ) {
			$rel = strtoupper( sanitize_key( (string) $patch['taxonomy_relation'] ) );
			if ( ! in_array( $rel, array( 'AND', 'OR' ), true ) ) {
				return new WP_Error(
					'caf_mcp_bad_taxonomy_relation',
					__( 'taxonomy_relation must be AND or OR.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			$extra                      = self::ensure_filter_layout_extra( $doc );
			$extra->taxonomy_relation   = $rel;
			$changed['taxonomy_relation'] = $rel;
		}

		foreach ( array( 'include', 'exclude' ) as $side_key ) {
			if ( ! array_key_exists( $side_key, $patch ) ) {
				continue;
			}
			$side = self::build_qr_side( $patch[ $side_key ] );
			if ( is_wp_error( $side ) ) {
				return $side;
			}
			$qr->{$side_key}         = $side;
			$changed[ $side_key ]    = self::lean_qr_side( $side );
		}

		if ( isset( $changed['include'] ) || isset( $changed['exclude'] ) ) {
			$has_include = isset( $qr->include->by ) && '' !== (string) $qr->include->by;
			$has_exclude = isset( $qr->exclude->by ) && '' !== (string) $qr->exclude->by;
			if ( ( $has_include || $has_exclude ) && ! array_key_exists( 'enabled', $patch ) ) {
				$qr->enabled        = 'true';
				$changed['enabled'] = 'true';
			}
		}

		if ( array_key_exists( 'term_page_mode', $patch ) && is_array( $patch['term_page_mode'] ) ) {
			$mode_changed = self::apply_term_page_mode( $doc, $patch['term_page_mode'] );
			if ( is_wp_error( $mode_changed ) ) {
				return $mode_changed;
			}
			$changed['term_page_mode'] = $mode_changed;
		}

		if ( empty( $changed ) ) {
			return new WP_Error(
				'caf_mcp_missing_restriction',
				__( 'Pass enabled, include, exclude, taxonomy_relation, term_page_mode, or clear=true.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}

		return $changed;
	}

	/**
	 * @param object $doc Layout.
	 * @param array  $patch Patch.
	 * @return array<string, mixed>|WP_Error
	 */
	public static function apply_term_page_mode( $doc, $patch ) {
		$mode    = self::ensure_term_page_mode( $doc );
		$changed = array();
		if ( array_key_exists( 'enabled', $patch ) ) {
			$mode->enabled        = self::bool_flag( $patch['enabled'] );
			$changed['enabled']   = $mode->enabled;
		}
		if ( array_key_exists( 'reset_returns_to', $patch ) ) {
			$reset = sanitize_key( (string) $patch['reset_returns_to'] );
			if ( ! in_array( $reset, array( 'current_term', 'all' ), true ) ) {
				return new WP_Error(
					'caf_mcp_bad_reset_returns_to',
					__( 'reset_returns_to must be current_term or all.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			$mode->reset_returns_to        = $reset;
			$changed['reset_returns_to']   = $reset;
		}
		if ( array_key_exists( 'include_children', $patch ) ) {
			$mode->include_children      = self::bool_flag( $patch['include_children'] );
			$changed['include_children'] = $mode->include_children;
		}
		return $changed;
	}

	/**
	 * Layout-level custom-field query conditions (filter_query_data).
	 *
	 * @param object $doc Layout.
	 * @return object
	 */
	public static function ensure_filter_query( $doc ) {
		if ( ! isset( $doc->filter_layout_data ) || ! is_object( $doc->filter_layout_data ) ) {
			$doc->filter_layout_data = new stdClass();
		}
		$fl = $doc->filter_layout_data;
		if ( ! isset( $fl->filter_query_data ) || ! is_object( $fl->filter_query_data ) ) {
			$fl->filter_query_data = new stdClass();
		}
		$fq = $fl->filter_query_data;
		if ( ! isset( $fq->data_source ) || ! is_object( $fq->data_source ) ) {
			$fq->data_source = new stdClass();
		}
		if ( ! isset( $fq->data_source->taxonomy ) ) {
			$fq->data_source->taxonomy = 'false';
		}
		if ( ! isset( $fq->data_source->custom_field ) ) {
			$fq->data_source->custom_field = 'false';
		}
		if ( ! isset( $fq->taxonomy_data ) || ! is_array( $fq->taxonomy_data ) ) {
			$fq->taxonomy_data = array();
		}
		if ( ! isset( $fq->custom_field_data ) || ! is_array( $fq->custom_field_data ) ) {
			$fq->custom_field_data = array();
		}
		if ( ! isset( $fq->meta_relation ) ) {
			$fq->meta_relation = 'OR';
		}
		return $fq;
	}

	/**
	 * @param object $doc Layout.
	 * @return array<string, mixed>
	 */
	public static function lean_filter_query( $doc ) {
		$fq = ( isset( $doc->filter_layout_data ) && is_object( $doc->filter_layout_data ) && isset( $doc->filter_layout_data->filter_query_data ) && is_object( $doc->filter_layout_data->filter_query_data ) )
			? $doc->filter_layout_data->filter_query_data
			: null;
		$groups = array();
		if ( $fq && isset( $fq->custom_field_data ) && is_array( $fq->custom_field_data ) ) {
			foreach ( $fq->custom_field_data as $group ) {
				$rows = array();
				foreach ( (array) $group as $row ) {
					$lean = self::lean_filter_query_row( $row );
					if ( $lean ) {
						$rows[] = $lean;
					}
				}
				if ( ! empty( $rows ) ) {
					$groups[] = $rows;
				}
			}
		}
		$flat = array();
		foreach ( $groups as $rows ) {
			foreach ( $rows as $row ) {
				$flat[] = $row;
			}
		}
		return array(
			'custom_field'  => ( $fq && isset( $fq->data_source->custom_field ) ) ? (string) $fq->data_source->custom_field : 'false',
			'taxonomy'      => ( $fq && isset( $fq->data_source->taxonomy ) ) ? (string) $fq->data_source->taxonomy : 'false',
			'meta_relation' => ( $fq && isset( $fq->meta_relation ) ) ? strtoupper( (string) $fq->meta_relation ) : 'OR',
			'conditions'    => $flat,
			'groups'        => $groups,
		);
	}

	/**
	 * @param object $doc Layout.
	 * @param array  $patch Patch.
	 * @return array<string, mixed>|WP_Error
	 */
	public static function apply_filter_query( $doc, $patch ) {
		$changed = array();
		$fq      = self::ensure_filter_query( $doc );

		if ( ! empty( $patch['clear'] ) ) {
			$fq->data_source->custom_field = 'false';
			$fq->custom_field_data         = array();
			$fq->meta_relation             = 'OR';
			$changed['clear']              = true;
			$changed['filter_query']       = self::lean_filter_query( $doc );
			return $changed;
		}

		if ( array_key_exists( 'meta_relation', $patch ) ) {
			$rel = strtoupper( sanitize_key( (string) $patch['meta_relation'] ) );
			if ( ! in_array( $rel, array( 'AND', 'OR' ), true ) ) {
				return new WP_Error(
					'caf_mcp_bad_meta_relation',
					__( 'meta_relation must be AND or OR.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			$fq->meta_relation          = $rel;
			$changed['meta_relation']   = $rel;
		}

		$groups = null;
		if ( isset( $patch['groups'] ) && is_array( $patch['groups'] ) ) {
			$groups = array();
			foreach ( $patch['groups'] as $g_index => $raw_group ) {
				if ( ! is_array( $raw_group ) ) {
					return new WP_Error(
						'caf_mcp_bad_filter_query_group',
						sprintf( __( 'groups[%d] must be an array of conditions.', 'category-ajax-filter' ), (int) $g_index ),
						array( 'status' => 400 )
					);
				}
				$built = array();
				foreach ( $raw_group as $r_index => $raw_row ) {
					$row = self::build_filter_query_row( $raw_row );
					if ( is_wp_error( $row ) ) {
						return $row;
					}
					$built[] = $row;
				}
				if ( ! empty( $built ) ) {
					$groups[] = $built;
				}
			}
		} elseif ( isset( $patch['conditions'] ) && is_array( $patch['conditions'] ) ) {
			$rows = array();
			foreach ( $patch['conditions'] as $raw_row ) {
				$row = self::build_filter_query_row( $raw_row );
				if ( is_wp_error( $row ) ) {
					return $row;
				}
				$rows[] = $row;
			}
			$rel = isset( $fq->meta_relation ) ? strtoupper( (string) $fq->meta_relation ) : 'OR';
			if ( 'AND' === $rel ) {
				$groups = empty( $rows ) ? array() : array( $rows );
			} else {
				$groups = array();
				foreach ( $rows as $row ) {
					$groups[] = array( $row );
				}
			}
		}

		if ( null !== $groups ) {
			$fq->custom_field_data         = $groups;
			$fq->data_source->custom_field = empty( $groups ) ? 'false' : 'true';
			$changed['conditions']         = self::lean_filter_query( $doc )['conditions'];
			$changed['custom_field']       = $fq->data_source->custom_field;
		}

		if ( array_key_exists( 'custom_field', $patch ) && null === $groups ) {
			$fq->data_source->custom_field = self::bool_flag( $patch['custom_field'] );
			$changed['custom_field']       = $fq->data_source->custom_field;
		}

		if ( empty( $changed ) ) {
			return new WP_Error(
				'caf_mcp_missing_filter_query',
				__( 'Pass conditions, groups, meta_relation, custom_field, or clear=true.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}

		$changed['filter_query'] = self::lean_filter_query( $doc );
		return $changed;
	}

	/**
	 * Row/column width, gap, and device visibility. Matches builder style JSON.
	 *
	 * @param object $node Row or column node.
	 * @param array  $patch Patch.
	 * @return array<string, mixed>|WP_Error
	 */
	public static function apply_frame_layout( $node, $patch ) {
		if ( ! is_object( $node ) ) {
			return new WP_Error( 'caf_mcp_element_not_found', __( 'No layout node has that id.', 'category-ajax-filter' ) );
		}
		$type          = isset( $node->type ) ? (string) $node->type : '';
		$allow_preview = ! empty( $patch['allow_preview'] );
		if ( ! in_array( $type, array( 'row', 'column' ), true ) && ! $allow_preview ) {
			return new WP_Error(
				'caf_mcp_not_frame',
				__( 'action=layout only works on row or column nodes, or last-screen preview:* layers. Use action=style or update for modules.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}

		$device = isset( $patch['device'] ) ? sanitize_key( (string) $patch['device'] ) : 'desktop';
		if ( ! in_array( $device, array( 'desktop', 'tablet', 'mobile' ), true ) ) {
			$device = 'desktop';
		}

		$changed = array();
		$css     = array();
		if ( array_key_exists( 'width', $patch ) ) {
			$width = self::sanitize_css_size( $patch['width'] );
			if ( is_wp_error( $width ) ) {
				return $width;
			}
			$css[]            = 'width:' . $width;
			$changed['width'] = $width;
		}
		if ( array_key_exists( 'gap', $patch ) ) {
			$gap = self::sanitize_css_size( $patch['gap'] );
			if ( is_wp_error( $gap ) ) {
				return $gap;
			}
			$css[]          = 'gap:' . $gap;
			$changed['gap'] = $gap;
		}
		if ( array_key_exists( 'display', $patch ) ) {
			$display = sanitize_key( (string) $patch['display'] );
			if ( ! in_array( $display, array( 'flex', 'block' ), true ) ) {
				return new WP_Error(
					'caf_mcp_bad_display',
					__( 'display must be flex or block (Design → Layout → Display).', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			$css[]              = 'display:' . $display;
			$changed['display'] = $display;
		}
		$direction = '';
		foreach ( array( 'direction', 'flex_flow', 'flexFlow', 'flex_direction' ) as $dir_key ) {
			if ( ! array_key_exists( $dir_key, $patch ) ) {
				continue;
			}
			$direction = self::normalize_flex_direction( $patch[ $dir_key ] );
			if ( '' === $direction ) {
				return new WP_Error(
					'caf_mcp_bad_direction',
					__( 'direction must be row, column, row-reverse, or column-reverse (Design → Layout → Direction).', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			break;
		}
		$wrap = '';
		if ( array_key_exists( 'wrap', $patch ) ) {
			$wrap = self::normalize_flex_wrap( $patch['wrap'] );
			if ( '' === $wrap ) {
				return new WP_Error(
					'caf_mcp_bad_wrap',
					__( 'wrap must be nowrap, wrap, or wrap-reverse.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
		}
		if ( '' !== $direction || '' !== $wrap ) {
			$flow               = trim( $direction . ( '' !== $wrap ? ' ' . $wrap : '' ) );
			$css[]              = 'flex-flow:' . $flow;
			$changed['flexFlow'] = $flow;
		}
		$justify_raw = null;
		foreach ( array( 'justify', 'justify_content', 'justifyContent', 'align_x', 'spread' ) as $j_key ) {
			if ( array_key_exists( $j_key, $patch ) ) {
				$justify_raw = $patch[ $j_key ];
				break;
			}
		}
		if ( null !== $justify_raw ) {
			$justify = self::normalize_justify( $justify_raw );
			if ( '' === $justify ) {
				return new WP_Error(
					'caf_mcp_bad_justify',
					__( 'justify must be flex-start, center, flex-end, space-between (spread), space-around, or space-evenly (Design → Layout → Align X).', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			$css[]                      = 'justify-content:' . $justify;
			$changed['justifyContent'] = $justify;
		}
		$align_raw = null;
		foreach ( array( 'align', 'align_items', 'alignItems', 'align_y' ) as $a_key ) {
			if ( array_key_exists( $a_key, $patch ) ) {
				$align_raw = $patch[ $a_key ];
				break;
			}
		}
		if ( null !== $align_raw ) {
			$align = self::normalize_align( $align_raw );
			if ( '' === $align ) {
				return new WP_Error(
					'caf_mcp_bad_align',
					__( 'align must be flex-start, center, flex-end, stretch, or baseline (Design → Layout → Align Y).', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			$css[]                   = 'align-items:' . $align;
			$changed['alignItems'] = $align;
		}
		if ( array_key_exists( 'float', $patch ) ) {
			$float = sanitize_key( (string) $patch['float'] );
			if ( ! in_array( $float, array( 'none', 'left', 'right' ), true ) ) {
				return new WP_Error(
					'caf_mcp_bad_float',
					__( 'float must be none, left, or right.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			$css[]            = 'float:' . $float;
			$changed['float'] = $float;
		}
		if ( ! empty( $css ) ) {
			$css_text = implode( ';', $css ) . ';';
			if ( class_exists( 'CAF_MCP_Css', false ) ) {
				$written = CAF_MCP_Css::apply_to_node( $node, 'self', $css_text, $device );
				if ( is_wp_error( $written ) ) {
					return $written;
				}
				$changed['written'] = isset( $written['written'] ) ? $written['written'] : array();
			} else {
				self::write_style_props( $node, $device, $css );
			}
		}

		if ( ! $allow_preview ) {
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
			foreach ( array( 'desktop', 'tablet', 'mobile' ) as $dev ) {
				$key = 'hide_on_' . $dev;
				if ( ! array_key_exists( $key, $patch ) ) {
					continue;
				}
				$hidden                             = self::bool_flag( $patch[ $key ] );
				$node->settings->visibility->{$dev} = $hidden;
				$changed[ $key ]                    = $hidden;
			}
		}

		if ( empty( $changed ) ) {
			return new WP_Error(
				'caf_mcp_missing_layout',
				__( 'Pass width, gap, display, direction, justify, align, wrap, float, hide_on_desktop, hide_on_tablet, or hide_on_mobile.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}

		$changed['action']     = 'layout';
		$changed['element_id'] = isset( $node->id ) ? (string) $node->id : '';
		$changed['device']     = $device;
		$changed['type']       = $type;
		return $changed;
	}

	/**
	 * Per-term color / icon / image on checkbox or dropdown.
	 *
	 * @param object $node Filter module.
	 * @param array  $patch Patch.
	 * @return array<string, mixed>|WP_Error
	 */
	public static function apply_term_visual( $node, $patch ) {
		if ( ! is_object( $node ) ) {
			return new WP_Error( 'caf_mcp_element_not_found', __( 'No layout node has that id.', 'category-ajax-filter' ) );
		}
		$key = isset( $node->key ) ? (string) $node->key : '';
		if ( ! in_array( $key, array( 'checkbox_filter', 'dropdown_filter' ), true ) ) {
			return new WP_Error(
				'caf_mcp_not_term_module',
				__( 'set_term_visual only works on checkbox_filter or dropdown_filter. Bind terms first.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}

		$items = array();
		if ( isset( $patch['terms'] ) && is_array( $patch['terms'] ) ) {
			$items = $patch['terms'];
		} else {
			$one = array();
			if ( isset( $patch['term_id'] ) ) {
				$one['term_id'] = $patch['term_id'];
			}
			foreach ( array( 'color', 'icon', 'image_url', 'attachment_id', 'media_search', 'media_name', 'svg_markup', 'generate', 'position', 'all', 'term', 'term_name', '_dry_run' ) as $field ) {
				if ( array_key_exists( $field, $patch ) ) {
					$one[ $field ] = $patch[ $field ];
				}
			}
			$items[] = $one;
		}

		$mode    = 'icon';
		$painted = 0;
		$missed  = array();
		$uploads = array();
		if ( ! isset( $node->settings ) || ! is_object( $node->settings ) ) {
			$node->settings = new stdClass();
		}

		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$merged    = array_merge( $patch, $item );
			$row_icons = self::resolve_term_icons( $node, $merged );
			if ( is_wp_error( $row_icons ) ) {
				return $row_icons;
			}
			if ( isset( $row_icons->type ) && 'color' === $row_icons->type ) {
				$mode = 'color';
			}
			$all = ! empty( $merged['all'] ) || ( isset( $merged['term_id'] ) && '*' === (string) $merged['term_id'] );
			if ( $all ) {
				$painted += self::paint_all_term_icons( $node, $row_icons );
				continue;
			}
			$term_id = isset( $merged['term_id'] ) ? (string) $merged['term_id'] : '';
			if ( '' === $term_id && isset( $merged['term'] ) ) {
				$term_id = (string) $merged['term'];
			}
			if ( '' === $term_id && isset( $merged['term_name'] ) ) {
				$term_id = (string) $merged['term_name'];
			}
			if ( '' === $term_id ) {
				return new WP_Error(
					'caf_mcp_missing_term_id',
					__( 'Pass term_id (from bind_taxonomy / bind_custom_field), term/term_name, terms[], or all=true.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			if ( self::paint_term_icons( $node, $term_id, $row_icons ) ) {
				++$painted;
				if ( isset( $row_icons->icon ) && is_object( $row_icons->icon ) && ! empty( $row_icons->icon->id ) ) {
					$uploads[] = (int) $row_icons->icon->id;
				}
			} else {
				$missed[] = $term_id;
			}
		}

		$node->settings->term_visual = $mode;
		$node->settings->show_icon   = 'true';

		if ( 0 === $painted ) {
			return new WP_Error(
				'caf_mcp_term_not_found',
				__( 'No matching term. Bind the taxonomy or custom field first, then pass that term_id (or all=true).', 'category-ajax-filter' ),
				array( 'status' => 404 )
			);
		}

		return array(
			'action'         => 'set_term_visual',
			'element_id'     => isset( $node->id ) ? (string) $node->id : '',
			'term_visual'    => $mode,
			'painted'        => $painted,
			'missed'         => $missed,
			'attachment_ids' => array_values( array_unique( $uploads ) ),
		);
	}

	/**
	 * @param object $doc Layout.
	 * @param string $scope full|filter|post|layout_settings.
	 * @param string $layout_id caf_N.
	 * @param string $label Name.
	 * @return array<string, mixed>|WP_Error
	 */
	public static function export_payload( $doc, $scope, $layout_id, $label ) {
		$scope = self::normalize_import_scope( $scope, null );
		if ( is_wp_error( $scope ) ) {
			return $scope;
		}
		if ( ! in_array( $scope, array( 'full', 'filter', 'post', 'layout_settings' ), true ) ) {
			return new WP_Error(
				'caf_mcp_bad_export_scope',
				__( 'scope must be full, filter, post, or layout_settings.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		$copy = json_decode( wp_json_encode( $doc ) );
		if ( ! is_object( $copy ) ) {
			return new WP_Error(
				'caf_mcp_export_failed',
				__( 'Layout could not be exported.', 'category-ajax-filter' ),
				array( 'status' => 500 )
			);
		}
		$meta_scope = 'full_layout';
		if ( 'post' === $scope ) {
			$meta_scope = 'post_layout';
		} elseif ( 'filter' === $scope ) {
			$meta_scope = 'filter_layout';
		} elseif ( 'layout_settings' === $scope ) {
			$meta_scope = 'layout_settings';
		}
		$payload = array(
			'_export_meta' => array(
				'version'     => '1.0.0',
				'plugin'      => 'category-ajax-filter',
				'exported_at' => gmdate( 'c' ),
				'scope'       => $meta_scope,
				'layout_id'   => $layout_id,
				'label'       => $label,
			),
		);
		if ( 'layout_settings' === $scope ) {
			$common = isset( $copy->common_data ) && is_object( $copy->common_data ) ? $copy->common_data : new stdClass();
			$out    = new stdClass();
			if ( isset( $common->preview_template_data ) ) {
				$out->preview_template_data = $common->preview_template_data;
			}
			foreach ( array( 'analytics_enabled', 'filter_url_enabled', 'schema_enabled', 'global_font_family', 'post_type' ) as $field ) {
				if ( isset( $common->{$field} ) ) {
					$out->{$field} = $common->{$field};
				}
			}
			$payload['common_data'] = $out;
		} elseif ( 'filter' === $scope ) {
			$payload['common_data']        = isset( $copy->common_data ) ? $copy->common_data : new stdClass();
			$payload['filter_layout_data'] = isset( $copy->filter_layout_data ) ? $copy->filter_layout_data : new stdClass();
		} elseif ( 'post' === $scope ) {
			$payload['common_data']      = isset( $copy->common_data ) ? $copy->common_data : new stdClass();
			$payload['post_layout_data'] = isset( $copy->post_layout_data ) ? $copy->post_layout_data : new stdClass();
		} else {
			$payload['common_data']        = isset( $copy->common_data ) ? $copy->common_data : new stdClass();
			$payload['filter_layout_data'] = isset( $copy->filter_layout_data ) ? $copy->filter_layout_data : new stdClass();
			$payload['post_layout_data']   = isset( $copy->post_layout_data ) ? $copy->post_layout_data : new stdClass();
		}
		return $payload;
	}

	/**
	 * Merge an imported document into a target layout. Keeps identity fields.
	 *
	 * @param object $target Current layout.
	 * @param mixed  $incoming Imported JSON (array or object).
	 * @param string $scope full|filter|post|layout_settings.
	 * @param string $mode replace|merge.
	 * @return object|WP_Error
	 */
	public static function import_into( $target, $incoming, $scope, $mode = 'replace' ) {
		$incoming = self::as_object( $incoming );
		if ( ! is_object( $incoming ) ) {
			return new WP_Error(
				'caf_mcp_bad_import',
				__( 'document must be a CAF layout JSON object.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		$encoded = wp_json_encode( $incoming );
		if ( ! is_string( $encoded ) || strlen( $encoded ) > self::MAX_IMPORT_BYTES ) {
			return new WP_Error(
				'caf_mcp_import_too_large',
				__( 'Import JSON is larger than 2 MB.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}

		$meta  = isset( $incoming->_export_meta ) && is_object( $incoming->_export_meta ) ? $incoming->_export_meta : null;
		$scope = self::normalize_import_scope( $scope, $meta );
		if ( is_wp_error( $scope ) ) {
			return $scope;
		}

		$mode = sanitize_key( (string) $mode );
		if ( '' === $mode ) {
			$mode = 'replace';
		}
		if ( $meta && isset( $meta->scope ) && in_array( (string) $meta->scope, array( 'filter_module', 'module' ), true ) ) {
			$mode = 'merge';
		}
		if ( ! in_array( $mode, array( 'replace', 'merge' ), true ) ) {
			return new WP_Error(
				'caf_mcp_bad_import_mode',
				__( 'mode must be replace or merge.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		if ( 'layout_settings' === $scope ) {
			$mode = 'replace';
		}

		$identity = array(
			'layout_key'     => isset( $target->common_data->layout_key ) ? $target->common_data->layout_key : '',
			'layout_name'    => isset( $target->common_data->layout_name ) ? $target->common_data->layout_name : '',
			'layout_index'   => isset( $target->common_data->layout_index ) ? $target->common_data->layout_index : 0,
			'layout_publish' => isset( $target->common_data->layout_publish ) ? $target->common_data->layout_publish : 'draft',
		);

		if ( 'layout_settings' === $scope ) {
			$applied = self::import_layout_settings( $target, $incoming );
			if ( is_wp_error( $applied ) ) {
				return $applied;
			}
		} else {
			if ( 'filter' === $scope || 'full' === $scope ) {
				if ( ! isset( $incoming->filter_layout_data ) ) {
					return new WP_Error(
						'caf_mcp_import_missing_filter',
						__( 'Imported JSON has no filter_layout_data.', 'category-ajax-filter' ),
						array( 'status' => 400 )
					);
				}
				if ( 'merge' === $mode ) {
					$merged = self::merge_tree_modules( $target, $incoming, 'filter' );
					if ( is_wp_error( $merged ) ) {
						return $merged;
					}
				} else {
					$target->filter_layout_data = json_decode( wp_json_encode( $incoming->filter_layout_data ) );
				}
			}
			if ( 'post' === $scope || 'full' === $scope ) {
				if ( ! isset( $incoming->post_layout_data ) ) {
					return new WP_Error(
						'caf_mcp_import_missing_post',
						__( 'Imported JSON has no post_layout_data.', 'category-ajax-filter' ),
						array( 'status' => 400 )
					);
				}
				if ( 'merge' === $mode ) {
					$merged = self::merge_tree_modules( $target, $incoming, 'post' );
					if ( is_wp_error( $merged ) ) {
						return $merged;
					}
				} else {
					$target->post_layout_data = json_decode( wp_json_encode( $incoming->post_layout_data ) );
				}
			}
			if ( 'full' === $scope && 'replace' === $mode && isset( $incoming->common_data ) ) {
				$common = json_decode( wp_json_encode( $incoming->common_data ) );
				if ( is_object( $common ) ) {
					$target->common_data = $common;
				}
			} elseif ( isset( $incoming->common_data->post_type ) && isset( $target->common_data ) ) {
				$target->common_data->post_type = $incoming->common_data->post_type;
			}
		}

		if ( ! isset( $target->common_data ) || ! is_object( $target->common_data ) ) {
			$target->common_data = new stdClass();
		}
		$target->common_data->layout_key     = $identity['layout_key'];
		$target->common_data->layout_name    = $identity['layout_name'];
		$target->common_data->layout_index   = $identity['layout_index'];
		$target->common_data->layout_publish = $identity['layout_publish'];

		if ( function_exists( 'caf_normalize_builder_layout_data' ) ) {
			$target = caf_normalize_builder_layout_data( $target, array( 'assign_node_ids' => true ) );
		}

		return $target;
	}

	/**
	 * @param string $option_key Layout option key.
	 * @return string
	 */
	public static function snapshot_option_key( $option_key ) {
		return 'caf_mcp_snap_' . md5( (string) $option_key );
	}

	/**
	 * @param string $option_key Layout option.
	 * @param object $doc Layout.
	 * @param int    $revision Revision number.
	 * @param string $label Layout label.
	 * @return void
	 */
	public static function push_snapshot( $option_key, $doc, $revision, $label ) {
		$key  = self::snapshot_option_key( $option_key );
		$list = get_option( $key, array() );
		if ( ! is_array( $list ) ) {
			$list = array();
		}
		$copy = json_decode( wp_json_encode( $doc ) );
		$list[] = array(
			'revision'  => (int) $revision,
			'saved_at'  => time(),
			'label'     => (string) $label,
			'doc'       => $copy,
		);
		if ( count( $list ) > self::MAX_SNAPSHOTS ) {
			$list = array_slice( $list, -1 * self::MAX_SNAPSHOTS );
		}
		update_option( $key, array_values( $list ), false );
	}

	/**
	 * @param string $option_key Layout option.
	 * @return array<int, array<string, mixed>>
	 */
	public static function list_snapshots( $option_key ) {
		$list = get_option( self::snapshot_option_key( $option_key ), array() );
		if ( ! is_array( $list ) ) {
			return array();
		}
		$out = array();
		foreach ( array_reverse( $list ) as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			$out[] = array(
				'revision' => isset( $row['revision'] ) ? (int) $row['revision'] : 0,
				'saved_at' => isset( $row['saved_at'] ) ? gmdate( 'c', (int) $row['saved_at'] ) : '',
				'label'    => isset( $row['label'] ) ? (string) $row['label'] : '',
			);
		}
		return $out;
	}

	/**
	 * @param string $option_key Layout option.
	 * @param int    $revision Revision.
	 * @return object|null
	 */
	public static function get_snapshot_doc( $option_key, $revision ) {
		$list = get_option( self::snapshot_option_key( $option_key ), array() );
		if ( ! is_array( $list ) ) {
			return null;
		}
		$revision = (int) $revision;
		foreach ( $list as $row ) {
			if ( ! is_array( $row ) ) {
				continue;
			}
			if ( (int) $row['revision'] !== $revision ) {
				continue;
			}
			$doc = isset( $row['doc'] ) ? json_decode( wp_json_encode( $row['doc'] ) ) : null;
			return is_object( $doc ) ? $doc : null;
		}
		return null;
	}

	/**
	 * @param string $option_key Layout option.
	 * @return void
	 */
	public static function delete_mcp_meta( $option_key ) {
		delete_option( self::snapshot_option_key( $option_key ) );
		delete_option( 'caf_mcp_rev_' . md5( (string) $option_key ) );
	}

	/**
	 * @param mixed $raw Side patch (array) or empty string to clear.
	 * @return object|WP_Error
	 */
	private static function build_qr_side( $raw ) {
		if ( '' === $raw || null === $raw ) {
			return self::empty_qr_side();
		}
		if ( ! is_array( $raw ) ) {
			return new WP_Error(
				'caf_mcp_bad_restriction_side',
				__( 'include/exclude must be an object: { by, taxonomy, term_ids } or { by, post_ids }.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		$by = isset( $raw['by'] ) ? sanitize_key( (string) $raw['by'] ) : '';
		if ( ! in_array( $by, array( '', 'terms', 'posts' ), true ) ) {
			return new WP_Error(
				'caf_mcp_bad_restriction_by',
				__( 'include/exclude by must be empty, terms, or posts.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		$side = self::empty_qr_side();
		$side->by = $by;
		if ( 'terms' === $by ) {
			$rows = array();
			if ( isset( $raw['taxonomies'] ) && is_array( $raw['taxonomies'] ) ) {
				foreach ( $raw['taxonomies'] as $row ) {
					if ( ! is_array( $row ) ) {
						continue;
					}
					$built = self::qr_taxonomy_row( $row );
					if ( is_wp_error( $built ) ) {
						return $built;
					}
					if ( $built ) {
						$rows[] = $built;
					}
				}
			} else {
				$built = self::qr_taxonomy_row( $raw );
				if ( is_wp_error( $built ) ) {
					return $built;
				}
				if ( $built ) {
					$rows[] = $built;
				}
			}
			$side->taxonomies = $rows;
			if ( ! empty( $rows ) ) {
				$first            = $rows[0];
				$side->taxonomy   = isset( $first->taxonomy ) ? (string) $first->taxonomy : '';
				$side->term_data  = isset( $first->term_data ) ? $first->term_data : array();
			}
		}
		if ( 'posts' === $by ) {
			$ids = array();
			if ( isset( $raw['post_ids'] ) && is_array( $raw['post_ids'] ) ) {
				$ids = $raw['post_ids'];
			} elseif ( isset( $raw['post_data'] ) && is_array( $raw['post_data'] ) ) {
				foreach ( $raw['post_data'] as $row ) {
					if ( is_array( $row ) && isset( $row['value'] ) ) {
						$ids[] = $row['value'];
					} elseif ( is_numeric( $row ) ) {
						$ids[] = $row;
					}
				}
			}
			$posts = array();
			foreach ( $ids as $id ) {
				$id = absint( $id );
				if ( $id < 1 ) {
					continue;
				}
				$title   = get_the_title( $id );
				$posts[] = (object) array(
					'value' => (string) $id,
					'label' => $title ? (string) $title : (string) $id,
				);
			}
			$side->post_data = $posts;
		}
		return $side;
	}

	/**
	 * @param array $row Row.
	 * @return object|null|WP_Error
	 */
	private static function qr_taxonomy_row( $row ) {
		$taxonomy = isset( $row['taxonomy'] ) ? sanitize_key( (string) $row['taxonomy'] ) : '';
		if ( '' === $taxonomy ) {
			return null;
		}
		if ( ! taxonomy_exists( $taxonomy ) ) {
			return new WP_Error(
				'caf_mcp_bad_taxonomy',
				__( 'Unknown taxonomy. Call caf-list-taxonomies first.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		$term_ids = array();
		if ( isset( $row['term_ids'] ) && is_array( $row['term_ids'] ) ) {
			$term_ids = $row['term_ids'];
		} elseif ( isset( $row['term_data'] ) && is_array( $row['term_data'] ) ) {
			foreach ( $row['term_data'] as $term ) {
				if ( is_array( $term ) && isset( $term['key'] ) ) {
					$term_ids[] = $term['key'];
				} elseif ( is_numeric( $term ) ) {
					$term_ids[] = $term;
				}
			}
		}
		$term_data = array();
		foreach ( $term_ids as $term_id ) {
			$term_id = absint( $term_id );
			if ( $term_id < 1 ) {
				continue;
			}
			$term = get_term( $term_id, $taxonomy );
			if ( ! $term || is_wp_error( $term ) ) {
				continue;
			}
			$term_data[] = (object) array(
				'key'  => (int) $term->term_id,
				'name' => (string) $term->name,
			);
		}
		return (object) array(
			'taxonomy'  => $taxonomy,
			'term_data' => $term_data,
		);
	}

	/**
	 * @param object $side Side.
	 * @return array<string, mixed>
	 */
	private static function lean_qr_side( $side ) {
		if ( ! is_object( $side ) ) {
			$side = self::empty_qr_side();
		}
		$by    = isset( $side->by ) ? (string) $side->by : '';
		$taxes = array();
		if ( isset( $side->taxonomies ) && is_array( $side->taxonomies ) ) {
			foreach ( $side->taxonomies as $row ) {
				if ( is_array( $row ) ) {
					$row = (object) $row;
				}
				if ( ! is_object( $row ) ) {
					continue;
				}
				$terms = array();
				if ( isset( $row->term_data ) && is_array( $row->term_data ) ) {
					foreach ( $row->term_data as $term ) {
						if ( is_array( $term ) ) {
							$term = (object) $term;
						}
						if ( ! is_object( $term ) ) {
							continue;
						}
						$terms[] = array(
							'id'   => isset( $term->key ) ? (int) $term->key : 0,
							'name' => isset( $term->name ) ? (string) $term->name : '',
						);
					}
				}
				$taxes[] = array(
					'taxonomy' => isset( $row->taxonomy ) ? (string) $row->taxonomy : '',
					'terms'    => $terms,
				);
			}
		}
		$posts = array();
		if ( isset( $side->post_data ) && is_array( $side->post_data ) ) {
			foreach ( $side->post_data as $post ) {
				if ( is_array( $post ) ) {
					$post = (object) $post;
				}
				if ( ! is_object( $post ) ) {
					continue;
				}
				$posts[] = array(
					'id'    => isset( $post->value ) ? absint( $post->value ) : 0,
					'title' => isset( $post->label ) ? (string) $post->label : '',
				);
			}
		}
		return array(
			'by'         => $by,
			'taxonomies' => $taxes,
			'post_ids'   => $posts,
		);
	}

	/**
	 * @param string      $scope Raw scope.
	 * @param object|null $meta Export meta.
	 * @return string|WP_Error
	 */
	private static function normalize_import_scope( $scope, $meta ) {
		$scope = sanitize_key( (string) $scope );
		if ( '' === $scope && $meta && isset( $meta->scope ) ) {
			$scope = sanitize_key( (string) $meta->scope );
		}
		$map = array(
			'full'            => 'full',
			'full_layout'     => 'full',
			'filter'          => 'filter',
			'filter_layout'   => 'filter',
			'filter_module'   => 'filter',
			'module'          => 'filter',
			'post'            => 'post',
			'post_layout'     => 'post',
			'layout_settings' => 'layout_settings',
		);
		if ( '' === $scope ) {
			return 'full';
		}
		if ( ! isset( $map[ $scope ] ) ) {
			return new WP_Error(
				'caf_mcp_bad_import_scope',
				__( 'scope must be full, filter, post, or layout_settings.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		return $map[ $scope ];
	}

	/**
	 * @param object $target Host layout.
	 * @param object $incoming Import JSON.
	 * @return true|WP_Error
	 */
	private static function import_layout_settings( $target, $incoming ) {
		if ( ! isset( $incoming->common_data ) || ! is_object( $incoming->common_data ) ) {
			return new WP_Error(
				'caf_mcp_import_missing_settings',
				__( 'Imported JSON has no layout settings (common_data.preview_template_data).', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		$src = $incoming->common_data;
		if ( ! isset( $target->common_data ) || ! is_object( $target->common_data ) ) {
			$target->common_data = new stdClass();
		}
		if ( isset( $src->preview_template_data ) ) {
			$target->common_data->preview_template_data = json_decode( wp_json_encode( $src->preview_template_data ) );
		} else {
			return new WP_Error(
				'caf_mcp_import_missing_settings',
				__( 'Imported JSON has no layout settings (common_data.preview_template_data).', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		foreach ( array( 'analytics_enabled', 'filter_url_enabled', 'schema_enabled', 'global_font_family', 'post_type' ) as $field ) {
			if ( isset( $src->{$field} ) ) {
				$target->common_data->{$field} = $src->{$field};
			}
		}
		return true;
	}

	/**
	 * Append imported modules into the first row's last column. Remints ids.
	 *
	 * @param object $target Host layout.
	 * @param object $incoming Import JSON.
	 * @param string $tree filter|post.
	 * @return true|WP_Error
	 */
	private static function merge_tree_modules( $target, $incoming, $tree ) {
		$tree     = ( 'post' === $tree ) ? 'post' : 'filter';
		$prop     = ( 'post' === $tree ) ? 'post_layout_data' : 'filter_layout_data';
		$incoming_tree = isset( $incoming->{$prop} ) ? json_decode( wp_json_encode( $incoming->{$prop} ) ) : null;
		if ( ! is_object( $incoming_tree ) ) {
			return new WP_Error(
				'caf_mcp_import_missing_tree',
				__( 'Imported JSON is missing that layout tree.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}

		$modules = array();
		self::collect_modules( isset( $incoming_tree->initial_data ) ? $incoming_tree->initial_data : array(), $modules );
		if ( empty( $modules ) ) {
			return new WP_Error(
				'caf_mcp_import_no_modules',
				__( 'Imported JSON does not contain a filter/post module to merge.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}

		if ( ! isset( $target->{$prop} ) || ! is_object( $target->{$prop} ) ) {
			$target->{$prop} = new stdClass();
		}
		$host = $target->{$prop};
		if ( ! isset( $host->initial_data ) || ! is_array( $host->initial_data ) ) {
			$host->initial_data = array();
		}

		if ( empty( $host->initial_data ) ) {
			$host->initial_data = isset( $incoming_tree->initial_data ) && is_array( $incoming_tree->initial_data )
				? $incoming_tree->initial_data
				: array();
			self::strip_node_ids( $host->initial_data );
			return true;
		}

		$column = self::last_column_of_first_row( $host->initial_data );
		if ( ! $column ) {
			return new WP_Error(
				'caf_mcp_import_no_column',
				__( 'Current layout has no columns to merge into.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		if ( ! isset( $column->data ) || ! is_array( $column->data ) ) {
			$column->data = array();
		}

		$host_search = 0;
		if ( 'filter' === $tree && class_exists( 'CAF_MCP_Compose', false ) ) {
			$host_search = CAF_MCP_Compose::count_search( $host->initial_data );
		}

		foreach ( $modules as $module ) {
			$copy = json_decode( wp_json_encode( $module ) );
			if ( ! is_object( $copy ) ) {
				continue;
			}
			self::strip_node_ids( $copy );
			$mod_key = isset( $copy->key ) ? (string) $copy->key : '';
			if ( 'filter' === $tree && 'search' === $mod_key && $host_search > 0 ) {
				continue;
			}
			if ( 'filter' === $tree && 'search' === $mod_key ) {
				++$host_search;
			}
			$column->data[] = $copy;
		}

		if ( 'filter' === $tree && class_exists( 'CAF_MCP_Compose', false ) && CAF_MCP_Compose::count_search( $host->initial_data ) > 1 ) {
			return new WP_Error(
				'caf_mcp_single_instance',
				__( 'A layout can only have one search module.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}

		return true;
	}

	/**
	 * @param mixed $nodes Tree.
	 * @param array $out Modules.
	 * @return void
	 */
	private static function collect_modules( $nodes, &$out ) {
		if ( is_object( $nodes ) ) {
			$type = isset( $nodes->type ) ? (string) $nodes->type : '';
			if ( 'module' === $type || ( isset( $nodes->key ) && ! in_array( $type, array( 'row', 'column' ), true ) ) ) {
				$out[] = $nodes;
				return;
			}
			if ( isset( $nodes->data ) ) {
				self::collect_modules( $nodes->data, $out );
			}
			if ( isset( $nodes->initial_data ) ) {
				self::collect_modules( $nodes->initial_data, $out );
			}
			return;
		}
		if ( ! is_array( $nodes ) ) {
			return;
		}
		foreach ( $nodes as $node ) {
			self::collect_modules( $node, $out );
		}
	}

	/**
	 * @param array $rows Row list.
	 * @return object|null
	 */
	private static function last_column_of_first_row( $rows ) {
		if ( ! is_array( $rows ) || empty( $rows ) || ! is_object( $rows[0] ) ) {
			return null;
		}
		$row = $rows[0];
		if ( ! isset( $row->data ) || ! is_array( $row->data ) || empty( $row->data ) ) {
			return null;
		}
		$last = null;
		foreach ( $row->data as $child ) {
			if ( is_object( $child ) && isset( $child->type ) && 'column' === $child->type ) {
				$last = $child;
			}
		}
		return $last;
	}

	/**
	 * @param mixed $node Node or list.
	 * @return void
	 */
	private static function strip_node_ids( $node ) {
		if ( is_array( $node ) ) {
			foreach ( $node as $child ) {
				self::strip_node_ids( $child );
			}
			return;
		}
		if ( ! is_object( $node ) ) {
			return;
		}
		unset( $node->id );
		if ( isset( $node->data ) ) {
			self::strip_node_ids( $node->data );
		}
	}

	/**
	 * @param mixed $row Raw condition.
	 * @return object|WP_Error
	 */
	private static function build_filter_query_row( $row ) {
		if ( is_object( $row ) ) {
			$row = (array) json_decode( wp_json_encode( $row ), true );
		}
		if ( ! is_array( $row ) ) {
			return new WP_Error(
				'caf_mcp_bad_filter_query_row',
				__( 'Each condition needs meta_key and value.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		$meta_key = isset( $row['meta_key'] ) ? $row['meta_key'] : ( isset( $row['custom_field_key'] ) ? $row['custom_field_key'] : '' );
		$meta_key = preg_replace( '/[^a-zA-Z0-9_\-]/', '', (string) $meta_key );
		if ( '' === $meta_key || '0' === $meta_key ) {
			return new WP_Error(
				'caf_mcp_bad_meta_key',
				__( 'Pass meta_key from caf-list-custom-fields.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		$compare = isset( $row['compare'] ) ? $row['compare'] : ( isset( $row['compare_operator'] ) ? $row['compare_operator'] : '=' );
		$compare = strtoupper( trim( (string) $compare ) );
		$allowed = array( '=', '!=', '>', '>=', '<', '<=', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN', 'BETWEEN' );
		if ( ! in_array( $compare, $allowed, true ) ) {
			return new WP_Error(
				'caf_mcp_bad_compare',
				__( 'compare must be =, !=, >, >=, <, <=, LIKE, NOT LIKE, IN, NOT IN, or BETWEEN.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		$meta_type = isset( $row['meta_type'] ) ? strtoupper( sanitize_key( (string) $row['meta_type'] ) ) : 'CHAR';
		$types     = array( 'CHAR', 'NUMERIC', 'DATE', 'DATETIME', 'DECIMAL', 'SIGNED', 'UNSIGNED' );
		if ( ! in_array( $meta_type, $types, true ) ) {
			$meta_type = 'CHAR';
		}

		$values = array();
		if ( isset( $row['values'] ) && is_array( $row['values'] ) ) {
			foreach ( $row['values'] as $raw ) {
				$val = sanitize_text_field( (string) $raw );
				if ( '' !== $val ) {
					$values[] = $val;
				}
			}
		} elseif ( array_key_exists( 'value', $row ) ) {
			if ( is_array( $row['value'] ) ) {
				foreach ( $row['value'] as $raw ) {
					$val = sanitize_text_field( (string) $raw );
					if ( '' !== $val ) {
						$values[] = $val;
					}
				}
			} else {
				$val = sanitize_text_field( (string) $row['value'] );
				if ( '' !== $val ) {
					$values[] = $val;
				}
			}
		} elseif ( isset( $row['custom_field_value'] ) ) {
			$val = sanitize_text_field( (string) $row['custom_field_value'] );
			if ( '' !== $val ) {
				$values[] = $val;
			}
		}
		if ( empty( $values ) ) {
			return new WP_Error(
				'caf_mcp_missing_query_value',
				__( 'Each condition needs a value (or values[] for IN / BETWEEN).', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		if ( 'BETWEEN' === $compare && count( $values ) < 2 ) {
			return new WP_Error(
				'caf_mcp_bad_between',
				__( 'BETWEEN needs two values.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}

		$list = array();
		foreach ( $values as $val ) {
			$list[] = (object) array(
				'key'   => $val,
				'value' => $val,
			);
		}

		return (object) array(
			'custom_field_key'        => $meta_key,
			'custom_field_value'      => $values[0],
			'custom_field_value_list' => $list,
			'compare_operator'        => $compare,
			'meta_type'               => $meta_type,
		);
	}

	/**
	 * @param mixed $row Row.
	 * @return array<string, mixed>|null
	 */
	private static function lean_filter_query_row( $row ) {
		if ( is_array( $row ) ) {
			$row = (object) $row;
		}
		if ( ! is_object( $row ) ) {
			return null;
		}
		$key = isset( $row->custom_field_key ) ? (string) $row->custom_field_key : '';
		if ( '' === $key ) {
			return null;
		}
		$values = array();
		if ( isset( $row->custom_field_value_list ) && is_array( $row->custom_field_value_list ) ) {
			foreach ( $row->custom_field_value_list as $entry ) {
				if ( is_object( $entry ) && isset( $entry->key ) ) {
					$values[] = (string) $entry->key;
				} elseif ( is_scalar( $entry ) ) {
					$values[] = (string) $entry;
				}
			}
		}
		if ( empty( $values ) && isset( $row->custom_field_value ) ) {
			$values[] = (string) $row->custom_field_value;
		}
		return array(
			'meta_key'  => $key,
			'value'     => ( 1 === count( $values ) ) ? $values[0] : $values,
			'compare'   => isset( $row->compare_operator ) ? (string) $row->compare_operator : '=',
			'meta_type' => isset( $row->meta_type ) ? (string) $row->meta_type : 'CHAR',
		);
	}

	/**
	 * @param mixed $raw Size.
	 * @return string|WP_Error
	 */
	/**
	 * Design → Layout → Direction. Stored as flexFlow.
	 *
	 * @param mixed $raw Raw value.
	 * @return string
	 */
	private static function normalize_flex_direction( $raw ) {
		$v = strtolower( str_replace( array( '_', ' ' ), '-', trim( (string) $raw ) ) );
		$map = array(
			'row'             => 'row',
			'horizontal'      => 'row',
			'column'          => 'column',
			'vertical'        => 'column',
			'row-reverse'     => 'row-reverse',
			'column-reverse'  => 'column-reverse',
		);
		return isset( $map[ $v ] ) ? $map[ $v ] : '';
	}

	/**
	 * @param mixed $raw Raw value.
	 * @return string
	 */
	private static function normalize_flex_wrap( $raw ) {
		if ( is_bool( $raw ) ) {
			return $raw ? 'wrap' : 'nowrap';
		}
		$v = strtolower( str_replace( array( '_', ' ' ), '-', trim( (string) $raw ) ) );
		$map = array(
			'nowrap'        => 'nowrap',
			'wrap'          => 'wrap',
			'wrap-reverse'  => 'wrap-reverse',
			'true'          => 'wrap',
			'false'         => 'nowrap',
		);
		return isset( $map[ $v ] ) ? $map[ $v ] : '';
	}

	/**
	 * Design → Layout → Align X. "spread" is Space between.
	 *
	 * @param mixed $raw Raw value.
	 * @return string
	 */
	private static function normalize_justify( $raw ) {
		if ( true === $raw || 1 === $raw || '1' === $raw ) {
			return 'space-between';
		}
		$v = strtolower( str_replace( array( '_', ' ' ), '-', trim( (string) $raw ) ) );
		$map = array(
			'spread'         => 'space-between',
			'space-between'  => 'space-between',
			'between'        => 'space-between',
			'space-around'   => 'space-around',
			'around'         => 'space-around',
			'space-evenly'   => 'space-evenly',
			'evenly'         => 'space-evenly',
			'flex-start'     => 'flex-start',
			'start'          => 'flex-start',
			'left'           => 'flex-start',
			'center'         => 'center',
			'flex-end'       => 'flex-end',
			'end'            => 'flex-end',
			'right'          => 'flex-end',
		);
		return isset( $map[ $v ] ) ? $map[ $v ] : '';
	}

	/**
	 * Design → Layout → Align Y.
	 *
	 * @param mixed $raw Raw value.
	 * @return string
	 */
	private static function normalize_align( $raw ) {
		$v = strtolower( str_replace( array( '_', ' ' ), '-', trim( (string) $raw ) ) );
		$map = array(
			'flex-start' => 'flex-start',
			'start'      => 'flex-start',
			'top'        => 'flex-start',
			'center'     => 'center',
			'flex-end'   => 'flex-end',
			'end'        => 'flex-end',
			'bottom'     => 'flex-end',
			'stretch'    => 'stretch',
			'baseline'   => 'baseline',
		);
		return isset( $map[ $v ] ) ? $map[ $v ] : '';
	}

	private static function sanitize_css_size( $raw ) {
		$raw = trim( (string) $raw );
		if ( '' === $raw ) {
			return new WP_Error(
				'caf_mcp_bad_size',
				__( 'width/gap cannot be empty.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		if ( preg_match( '/^(auto|0)$/i', $raw ) ) {
			return strtolower( $raw );
		}
		if ( preg_match( '/^\d+(\.\d+)?$/', $raw ) ) {
			$n = (float) $raw;
			if ( $n < 0 || $n > 100 ) {
				return new WP_Error(
					'caf_mcp_bad_size',
					__( 'Bare numbers are treated as percent and must be 0–100.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			return ( 0 === fmod( $n, 1.0 ) ) ? ( (string) (int) $n ) . '%' : ( (string) $n ) . '%';
		}
		if ( preg_match( '/^\d+(\.\d+)?(px|%|rem|em)$/i', $raw ) ) {
			return $raw;
		}
		return new WP_Error(
			'caf_mcp_bad_size',
			__( 'width/gap must be a number (percent), or a CSS size like 50%, 240px, 1.5rem.', 'category-ajax-filter' ),
			array( 'status' => 400 )
		);
	}

	/**
	 * @param object $node Node.
	 * @param string $device Device.
	 * @param array  $css Prop strings width:50%.
	 * @return void
	 */
	private static function write_style_props( $node, $device, $css ) {
		if ( ! isset( $node->style ) || ! is_object( $node->style ) ) {
			$node->style = new stdClass();
		}
		if ( ! isset( $node->style->{$device} ) || ! is_object( $node->style->{$device} ) ) {
			$node->style->{$device} = new stdClass();
		}
		if ( ! isset( $node->style->{$device}->default ) || ! is_object( $node->style->{$device}->default ) ) {
			$node->style->{$device}->default = new stdClass();
		}
		$bucket = $node->style->{$device}->default;
		foreach ( $css as $rule ) {
			$parts = explode( ':', $rule, 2 );
			if ( 2 !== count( $parts ) ) {
				continue;
			}
			$prop           = trim( $parts[0] );
			$val            = trim( $parts[1] );
			$bucket->{$prop} = $val;
		}
	}

	/**
	 * Builder-native uploaded icon object (type svg even for png/jpg).
	 *
	 * @param array  $file { id, url, mime, title }.
	 * @param string $position before|after.
	 * @return object
	 */
	public static function uploaded_icon_payload( $file, $position = 'before' ) {
		if ( ! in_array( $position, array( 'before', 'after' ), true ) ) {
			$position = 'before';
		}
		return (object) array(
			'type'     => 'svg',
			'icon'     => (object) array(
				'id'    => isset( $file['id'] ) ? (int) $file['id'] : 0,
				'url'   => isset( $file['url'] ) ? (string) $file['url'] : '',
				'mime'  => isset( $file['mime'] ) ? (string) $file['mime'] : '',
				'title' => isset( $file['title'] ) ? (string) $file['title'] : '',
			),
			'position' => $position,
		);
	}

	/**
	 * @param object $node Module.
	 * @param array  $patch Patch.
	 * @return object|WP_Error
	 */
	private static function resolve_term_icons( $node, $patch ) {
		$position = isset( $patch['position'] ) ? sanitize_key( (string) $patch['position'] ) : 'before';
		if ( ! in_array( $position, array( 'before', 'after' ), true ) ) {
			$position = 'before';
		}
		$dry   = ! empty( $patch['_dry_run'] );
		$color = isset( $patch['color'] ) ? trim( (string) $patch['color'] ) : '';
		$icon  = isset( $patch['icon'] ) ? sanitize_text_field( (string) $patch['icon'] ) : '';

		if ( '' !== $color ) {
			if ( ! preg_match( '/^#([0-9a-f]{3}|[0-9a-f]{6})$/i', $color ) ) {
				return new WP_Error(
					'caf_mcp_bad_color',
					__( 'color must be a hex value like #ff0000.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			$icons = (object) array(
				'type'     => 'color',
				'icon'     => $color,
				'color'    => $color,
				'position' => $position,
			);
			if ( '' !== $icon ) {
				$icons->icon_backup = (object) array(
					'type' => 'icon',
					'icon' => $icon,
				);
			}
			return $icons;
		}

		if ( ! empty( $patch['generate'] ) ) {
			$label = self::term_label_for_generate( $node, $patch );
			if ( $dry ) {
				return new WP_Error(
					'caf_mcp_dry_run_media',
					__( 'dry_run cannot generate or upload media. Omit dry_run to generate and apply.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			$file = self::generate_or_explain( $label );
			if ( is_wp_error( $file ) ) {
				return $file;
			}
			return self::uploaded_icon_payload( $file, $position );
		}

		$attachment_id = isset( $patch['attachment_id'] ) ? (int) $patch['attachment_id'] : 0;
		if ( $attachment_id < 0 ) {
			$attachment_id = 0;
		}
		if ( $attachment_id > 0 ) {
			$file = self::file_from_attachment_id( $attachment_id );
			if ( is_wp_error( $file ) ) {
				return $file;
			}
			return self::uploaded_icon_payload( $file, $position );
		}

		$media_search = '';
		if ( isset( $patch['media_search'] ) ) {
			$media_search = sanitize_text_field( (string) $patch['media_search'] );
		} elseif ( isset( $patch['media_name'] ) ) {
			$media_search = sanitize_text_field( (string) $patch['media_name'] );
		}
		if ( '' !== $media_search ) {
			$file = self::file_from_media_search( $media_search, true );
			if ( is_wp_error( $file ) ) {
				return $file;
			}
			return self::uploaded_icon_payload( $file, $position );
		}

		$image = isset( $patch['image_url'] ) ? trim( (string) $patch['image_url'] ) : '';
		if ( '' !== $image ) {
			if ( ! preg_match( '/^https?:\/\//i', $image ) ) {
				return new WP_Error(
					'caf_mcp_bad_image',
					__( 'image_url must be an http(s) URL.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			$file = self::file_from_image_url( $image, self::term_label_for_generate( $node, $patch ), $dry );
			if ( is_wp_error( $file ) ) {
				return $file;
			}
			return self::uploaded_icon_payload( $file, $position );
		}

		$svg = isset( $patch['svg_markup'] ) ? (string) $patch['svg_markup'] : '';
		if ( '' !== trim( $svg ) ) {
			if ( $dry ) {
				return new WP_Error(
					'caf_mcp_dry_run_media',
					__( 'dry_run cannot generate or upload media. Omit dry_run to sideload SVG and apply.', 'category-ajax-filter' ),
					array( 'status' => 400 )
				);
			}
			$file = self::file_from_svg_markup( $svg, self::term_label_for_generate( $node, $patch ) );
			if ( is_wp_error( $file ) ) {
				return $file;
			}
			return self::uploaded_icon_payload( $file, $position );
		}

		if ( '' !== $icon ) {
			return (object) array(
				'type'     => 'icon',
				'icon'     => $icon,
				'position' => $position,
			);
		}

		return new WP_Error(
			'caf_mcp_missing_term_visual',
			__( 'Pass color (#hex), icon (Font Awesome class), attachment_id, media_search, image_url, or svg_markup.', 'category-ajax-filter' ),
			array( 'status' => 400 )
		);
	}

	/**
	 * @param object $node Module.
	 * @param array  $patch Patch.
	 * @return string
	 */
	private static function term_label_for_generate( $node, $patch ) {
		foreach ( array( 'term', 'term_name' ) as $key ) {
			if ( ! empty( $patch[ $key ] ) ) {
				$label = sanitize_text_field( (string) $patch[ $key ] );
				if ( '' !== $label ) {
					return $label;
				}
			}
		}
		$term_id = isset( $patch['term_id'] ) ? (string) $patch['term_id'] : '';
		if ( '' !== $term_id ) {
			$found = self::find_term_label( $node, $term_id );
			if ( '' !== $found ) {
				return $found;
			}
			return $term_id;
		}
		return 'term';
	}

	/**
	 * @param object $node Module.
	 * @param string $term_id Term key or name.
	 * @return string
	 */
	private static function find_term_label( $node, $term_id ) {
		$lists = array();
		if ( isset( $node->settings->taxonomy_data ) && is_array( $node->settings->taxonomy_data ) ) {
			foreach ( $node->settings->taxonomy_data as $tax ) {
				if ( is_object( $tax ) && isset( $tax->term_data ) ) {
					$lists[] = $tax->term_data;
				}
			}
		}
		if ( isset( $node->settings->custom_field_data ) && is_array( $node->settings->custom_field_data ) ) {
			foreach ( $node->settings->custom_field_data as $group ) {
				if ( is_object( $group ) && isset( $group->custom_field_value_list ) ) {
					$lists[] = $group->custom_field_value_list;
				}
			}
		}
		foreach ( $lists as $list ) {
			$label = self::find_term_label_in_list( $list, $term_id );
			if ( '' !== $label ) {
				return $label;
			}
		}
		return '';
	}

	/**
	 * @param mixed  $terms Terms.
	 * @param string $term_id Needle.
	 * @return string
	 */
	private static function find_term_label_in_list( $terms, $term_id ) {
		if ( ! is_array( $terms ) ) {
			return '';
		}
		$needle = strtolower( trim( (string) $term_id ) );
		foreach ( $terms as $term ) {
			if ( ! is_object( $term ) ) {
				continue;
			}
			$key = isset( $term->key ) ? (string) $term->key : '';
			$val = isset( $term->value ) ? (string) $term->value : '';
			if ( $key === (string) $term_id || strtolower( trim( $val ) ) === $needle ) {
				return '' !== $val ? $val : $key;
			}
			if ( isset( $term->children_data ) ) {
				$child = self::find_term_label_in_list( $term->children_data, $term_id );
				if ( '' !== $child ) {
					return $child;
				}
			}
		}
		return '';
	}

	/**
	 * @param string $label Term label.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function generate_or_explain( $label ) {
		unset( $label );
		return new WP_Error(
			'caf_mcp_generate_unavailable',
			__( 'Icon generation is not available. Pass svg_markup (<svg>…</svg>), image_url, caf-list-media + attachment_id, or media_search.', 'category-ajax-filter' ),
			array( 'status' => 400 )
		);
	}

	/**
	 * @param int $attachment_id Attachment ID.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function file_from_attachment_id( $attachment_id ) {
		if ( ! function_exists( 'wp_get_attachment_url' ) ) {
			return new WP_Error(
				'caf_mcp_media_unavailable',
				__( 'WordPress media helpers are not loaded.', 'category-ajax-filter' ),
				array( 'status' => 500 )
			);
		}
		$post = get_post( $attachment_id );
		if ( ! $post || 'attachment' !== $post->post_type ) {
			return new WP_Error(
				'caf_mcp_bad_attachment',
				__( 'attachment_id is not a Media Library file.', 'category-ajax-filter' ),
				array( 'status' => 404 )
			);
		}
		$url = wp_get_attachment_url( $attachment_id );
		if ( ! is_string( $url ) || '' === $url || ! self::is_allowed_icon_url( $url ) ) {
			return new WP_Error(
				'caf_mcp_bad_attachment',
				__( 'That attachment is not an allowed icon (svg, png, jpg, jpeg).', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		$path = explode( '?', (string) $url )[0];
		return array(
			'id'       => (int) $attachment_id,
			'url'      => $url,
			'mime'     => (string) $post->post_mime_type,
			'title'    => (string) $post->post_title,
			'filename' => basename( $path ),
		);
	}

	/**
	 * @param string $search Title/filename/id.
	 * @param bool   $unique_only Error when several match.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function file_from_media_search( $search, $unique_only ) {
		$hits = self::query_icon_media( $search, 8 );
		if ( is_wp_error( $hits ) ) {
			return $hits;
		}
		if ( 1 === count( $hits ) ) {
			return $hits[0];
		}
		if ( empty( $hits ) ) {
			return new WP_Error(
				'caf_mcp_media_not_found',
				__( 'No Media Library icon matched that name. Use caf-list-media or pass attachment_id.', 'category-ajax-filter' ),
				array( 'status' => 404 )
			);
		}
		if ( ! $unique_only ) {
			return $hits[0];
		}
		$labels = array();
		foreach ( $hits as $hit ) {
			$labels[] = (int) $hit['id'] . ' ' . $hit['title'];
		}
		return new WP_Error(
			'caf_mcp_media_ambiguous',
			sprintf(
				/* translators: %s: id + title list. */
				__( 'Several media matches: %s. Pass attachment_id.', 'category-ajax-filter' ),
				implode( ', ', $labels )
			),
			array( 'status' => 400 )
		);
	}

	/**
	 * Lean Media Library icons (svg/png/jpg).
	 *
	 * @param string $search Search.
	 * @param int    $limit  Limit.
	 * @return array<int, array<string, mixed>>
	 */
	public static function query_icon_media( $search, $limit = 20 ) {
		$limit = (int) $limit;
		if ( $limit < 1 ) {
			$limit = 20;
		}
		if ( $limit > 50 ) {
			$limit = 50;
		}
		$out = array();
		$search = trim( (string) $search );
		if ( '' !== $search && ctype_digit( $search ) ) {
			$file = self::file_from_attachment_id( (int) $search );
			if ( ! is_wp_error( $file ) ) {
				$out[] = $file;
			}
		}
		if ( ! class_exists( 'WP_Query', false ) ) {
			return $out;
		}
		$query = new WP_Query(
			array(
				'post_type'              => 'attachment',
				'post_status'            => 'inherit',
				'post_mime_type'         => array( 'image/jpeg', 'image/png', 'image/svg+xml' ),
				's'                      => $search,
				'posts_per_page'         => $limit,
				'orderby'                => 'date',
				'order'                  => 'DESC',
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			)
		);
		$seen = array();
		foreach ( $out as $row ) {
			$seen[ (int) $row['id'] ] = true;
		}
		foreach ( $query->posts as $post ) {
			$id = (int) $post->ID;
			if ( isset( $seen[ $id ] ) ) {
				continue;
			}
			$url = function_exists( 'wp_get_attachment_url' ) ? wp_get_attachment_url( $id ) : '';
			if ( ! is_string( $url ) || '' === $url || ! self::is_allowed_icon_url( $url ) ) {
				continue;
			}
			$seen[ $id ] = true;
			$out[]       = array(
				'id'       => $id,
				'title'    => (string) $post->post_title,
				'filename' => basename( (string) wp_parse_url( $url, PHP_URL_PATH ) ),
				'url'      => $url,
				'mime'     => (string) $post->post_mime_type,
			);
			if ( count( $out ) >= $limit ) {
				break;
			}
		}
		return $out;
	}

	/**
	 * @param string $url URL.
	 * @return bool
	 */
	public static function is_allowed_icon_url( $url ) {
		$path = strtolower( (string) $url );
		$path = explode( '#', explode( '?', $path )[0] )[0];
		return (bool) preg_match( '/\.(svg|png|jpe?g)$/', $path );
	}

	/**
	 * @param string $url   Image URL.
	 * @param string $label Title.
	 * @param bool   $dry   Skip sideload.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function file_from_image_url( $url, $label, $dry ) {
		if ( function_exists( 'attachment_url_to_postid' ) ) {
			$existing = attachment_url_to_postid( $url );
			if ( $existing > 0 ) {
				return self::file_from_attachment_id( $existing );
			}
		}
		if ( ! self::is_allowed_icon_url( $url ) ) {
			return new WP_Error(
				'caf_mcp_bad_image',
				__( 'image_url must end with .svg, .png, .jpg, or .jpeg.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		if ( $dry ) {
			return new WP_Error(
				'caf_mcp_dry_run_media',
				__( 'dry_run cannot sideload a remote image. Omit dry_run, or pass attachment_id for a file already in the Media Library.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		return self::sideload_remote_icon( $url, $label );
	}

	/**
	 * @param string $svg   Markup.
	 * @param string $label Title.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function file_from_svg_markup( $svg, $label ) {
		if ( strlen( $svg ) > 100000 ) {
			return new WP_Error(
				'caf_mcp_svg_too_long',
				__( 'svg_markup must be 100000 characters or fewer.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		if ( ! preg_match( '/<svg[\s\S]*<\/svg>/i', $svg, $match ) ) {
			return new WP_Error(
				'caf_mcp_bad_svg',
				__( 'svg_markup must contain an <svg>…</svg> document.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		if ( ! function_exists( 'caf_builder_sanitize_inline_svg_markup' ) && defined( 'TC_CAF_PATH' ) ) {
			$helper = TC_CAF_PATH . 'includes/frontend/caf-builder-uploaded-icon.php';
			if ( is_readable( $helper ) ) {
				require_once $helper;
			}
		}
		$clean = function_exists( 'caf_builder_sanitize_inline_svg_markup' )
			? caf_builder_sanitize_inline_svg_markup( $match[0] )
			: '';
		if ( '' === trim( (string) $clean ) || false === stripos( $clean, '<svg' ) ) {
			return new WP_Error(
				'caf_mcp_bad_svg',
				__( 'That SVG was not safe to save.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		return self::sideload_bytes_fallback( $clean, 'image/svg+xml', $label );
	}

	/**
	 * @param string $url   Remote URL.
	 * @param string $label Title.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function sideload_remote_icon( $url, $label ) {
		if ( ! function_exists( 'download_url' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}
		$tmp = download_url( $url, 30 );
		if ( is_wp_error( $tmp ) ) {
			return $tmp;
		}
		$bytes = (string) file_get_contents( $tmp );
		wp_delete_file( $tmp );
		if ( strlen( $bytes ) > 2000000 ) {
			return new WP_Error(
				'caf_mcp_image_too_large',
				__( 'That icon file is larger than 2MB.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		$ext  = strtolower( (string) pathinfo( (string) wp_parse_url( $url, PHP_URL_PATH ), PATHINFO_EXTENSION ) );
		$mime = 'image/png';
		if ( 'svg' === $ext ) {
			$mime = 'image/svg+xml';
			if ( function_exists( 'caf_builder_sanitize_inline_svg_markup' ) ) {
				$bytes = caf_builder_sanitize_inline_svg_markup( $bytes );
				if ( '' === trim( (string) $bytes ) ) {
					return new WP_Error(
						'caf_mcp_bad_svg',
						__( 'That SVG was not safe to save.', 'category-ajax-filter' ),
						array( 'status' => 400 )
					);
				}
			}
		} elseif ( 'jpg' === $ext || 'jpeg' === $ext ) {
			$mime = 'image/jpeg';
		}
		return self::sideload_bytes_fallback( $bytes, $mime, $label );
	}

	/**
	 * @param string $bytes Bytes.
	 * @param string $mime  Mime.
	 * @param string $label Title.
	 * @return array<string, mixed>|WP_Error
	 */
	private static function sideload_bytes_fallback( $bytes, $mime, $label ) {
		if ( ! defined( 'ABSPATH' ) ) {
			return new WP_Error( 'caf_mcp_media_unavailable', __( 'Cannot sideload without WordPress.', 'category-ajax-filter' ) );
		}
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';
		$ext = 'png';
		if ( 'image/jpeg' === $mime ) {
			$ext = 'jpg';
		} elseif ( 'image/svg+xml' === $mime ) {
			$ext = 'svg';
		}
		$slug     = sanitize_title( $label );
		$slug     = '' !== $slug ? $slug : 'term';
		$filename = 'caf-term-icon-' . $slug . '-' . wp_generate_password( 6, false, false ) . '.' . $ext;
		$tmp      = wp_tempnam( $filename );
		if ( ! $tmp || false === file_put_contents( $tmp, $bytes ) ) {
			if ( $tmp ) {
				wp_delete_file( $tmp );
			}
			return new WP_Error( 'caf_mcp_sideload_failed', __( 'Could not write the icon temp file.', 'category-ajax-filter' ) );
		}
		$file = array(
			'name'     => $filename,
			'type'     => $mime,
			'tmp_name' => $tmp,
			'error'    => 0,
			'size'     => filesize( $tmp ),
		);
		$id   = media_handle_sideload( $file, 0, $label );
		if ( is_wp_error( $id ) ) {
			wp_delete_file( $tmp );
			return $id;
		}
		$url = wp_get_attachment_url( (int) $id );
		return array(
			'id'    => (int) $id,
			'url'   => is_string( $url ) ? $url : '',
			'mime'  => $mime,
			'title' => $label,
		);
	}

	/**
	 * @param object $node Module.
	 * @param string $term_id Term key.
	 * @param object $icons Icons object.
	 * @return bool
	 */
	private static function paint_term_icons( $node, $term_id, $icons ) {
		if ( ! isset( $node->settings ) || ! is_object( $node->settings ) ) {
			return false;
		}
		$found = false;
		if ( isset( $node->settings->taxonomy_data ) && is_array( $node->settings->taxonomy_data ) ) {
			foreach ( $node->settings->taxonomy_data as $tax ) {
				if ( ! is_object( $tax ) || ! isset( $tax->term_data ) ) {
					continue;
				}
				if ( self::paint_term_list( $tax->term_data, $term_id, $icons ) ) {
					$found = true;
				}
			}
		}
		if ( isset( $node->settings->custom_field_data ) && is_array( $node->settings->custom_field_data ) ) {
			foreach ( $node->settings->custom_field_data as $group ) {
				if ( is_object( $group ) && isset( $group->custom_field_value_list ) ) {
					if ( self::paint_term_list( $group->custom_field_value_list, $term_id, $icons ) ) {
						$found = true;
					}
				}
			}
		}
		return $found;
	}

	/**
	 * @param object $node Module.
	 * @param object $icons Icons.
	 * @return int
	 */
	private static function paint_all_term_icons( $node, $icons ) {
		$count = 0;
		if ( ! isset( $node->settings ) || ! is_object( $node->settings ) ) {
			return 0;
		}
		if ( isset( $node->settings->taxonomy_data ) && is_array( $node->settings->taxonomy_data ) ) {
			foreach ( $node->settings->taxonomy_data as $tax ) {
				if ( is_object( $tax ) && isset( $tax->term_data ) ) {
					$count += self::paint_all_term_list( $tax->term_data, $icons );
				}
			}
		}
		if ( isset( $node->settings->custom_field_data ) && is_array( $node->settings->custom_field_data ) ) {
			foreach ( $node->settings->custom_field_data as $group ) {
				if ( is_object( $group ) && isset( $group->custom_field_value_list ) ) {
					$count += self::paint_all_term_list( $group->custom_field_value_list, $icons );
				}
			}
		}
		return $count;
	}

	/**
	 * @param mixed  $terms Term list.
	 * @param string $term_id Term key.
	 * @param object $icons Icons.
	 * @return bool
	 */
	private static function paint_term_list( &$terms, $term_id, $icons ) {
		if ( ! is_array( $terms ) ) {
			return false;
		}
		$found = false;
		foreach ( $terms as $term ) {
			if ( ! is_object( $term ) ) {
				continue;
			}
			$key = isset( $term->key ) ? (string) $term->key : '';
			$val = isset( $term->value ) ? strtolower( trim( (string) $term->value ) ) : '';
			$needle = strtolower( trim( (string) $term_id ) );
			if ( $key === (string) $term_id || ( '' !== $needle && $val === $needle ) ) {
				$term->icons = json_decode( wp_json_encode( $icons ) );
				$found       = true;
			}
			if ( isset( $term->children_data ) && is_array( $term->children_data ) ) {
				if ( self::paint_term_list( $term->children_data, $term_id, $icons ) ) {
					$found = true;
				}
			}
		}
		return $found;
	}

	/**
	 * @param mixed  $terms Term list.
	 * @param object $icons Icons.
	 * @return int
	 */
	private static function paint_all_term_list( &$terms, $icons ) {
		if ( ! is_array( $terms ) ) {
			return 0;
		}
		$count = 0;
		foreach ( $terms as $term ) {
			if ( ! is_object( $term ) ) {
				continue;
			}
			$term->icons = json_decode( wp_json_encode( $icons ) );
			++$count;
			if ( isset( $term->children_data ) && is_array( $term->children_data ) ) {
				$count += self::paint_all_term_list( $term->children_data, $icons );
			}
		}
		return $count;
	}

	/**
	 * @param mixed $value Value.
	 * @return string true|false
	 */
	private static function bool_flag( $value ) {
		if ( true === $value || 1 === $value || '1' === $value || 'true' === $value ) {
			return 'true';
		}
		return 'false';
	}

	/**
	 * @param mixed $value Value.
	 * @return object|null
	 */
	private static function as_object( $value ) {
		if ( is_object( $value ) ) {
			return $value;
		}
		if ( is_array( $value ) ) {
			$obj = json_decode( wp_json_encode( $value ) );
			return is_object( $obj ) ? $obj : null;
		}
		if ( is_string( $value ) && '' !== $value ) {
			$obj = json_decode( $value );
			return is_object( $obj ) ? $obj : null;
		}
		return null;
	}
}

}
