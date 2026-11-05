<?php
/**
 * Short professional MCP activity lines for the CAF MCP connections log.
 *
 * MCP never receives the user's chat prompt — only the tool name and arguments.
 * These lines describe what was asked and what ran, without storing payloads.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'CAF_MCP_Activity', false ) ) {

class CAF_MCP_Activity {

	/**
	 * @param string               $method JSON-RPC method.
	 * @param string               $tool   Tool name.
	 * @param array<string, mixed> $args   Tool arguments (not stored).
	 * @return string Empty to skip catalog, plumbing, or dry-run calls.
	 */
	public static function summarize( $method, $tool, $args ) {
		$method = (string) $method;
		$tool   = (string) $tool;
		if ( ! is_array( $args ) ) {
			$args = array();
		}
		if ( 'initialize' === $method ) {
			return __( 'Connected', 'category-ajax-filter' );
		}
		if ( 'tools/call' !== $method || '' === $tool ) {
			return '';
		}
		if ( ! empty( $args['dry_run'] ) ) {
			return '';
		}
		if ( in_array( $tool, self::skip_tools(), true ) ) {
			return '';
		}

		$layout = self::layout_id( isset( $args['layout_id'] ) ? $args['layout_id'] : '' );
		$label  = self::clip_text( isset( $args['label'] ) ? $args['label'] : '' );
		$scope  = isset( $args['scope'] ) ? sanitize_key( (string) $args['scope'] ) : '';

		switch ( $tool ) {
			case 'caf-create-layout':
				$ptype = isset( $args['post_type'] ) ? sanitize_key( (string) $args['post_type'] ) : '';
				if ( $label && $ptype ) {
					return sprintf(
						/* translators: 1: filter name, 2: post type slug */
						__( 'Created “%1$s” for %2$s', 'category-ajax-filter' ),
						$label,
						$ptype
					);
				}
				return $label
					? sprintf( /* translators: %s: filter name */ __( 'Created “%s”', 'category-ajax-filter' ), $label )
					: __( 'Created a layout', 'category-ajax-filter' );
			case 'caf-rename-layout':
				if ( $label && $layout ) {
					return sprintf( /* translators: 1: layout id, 2: new name */ __( 'Renamed %1$s to “%2$s”', 'category-ajax-filter' ), $layout, $label );
				}
				if ( isset( $args['status'] ) && 'draft' === (string) $args['status'] ) {
					return self::with_layout( __( 'Set to draft', 'category-ajax-filter' ), $layout );
				}
				if ( isset( $args['status'] ) && 'publish' === (string) $args['status'] ) {
					return self::with_layout( __( 'Published', 'category-ajax-filter' ), $layout );
				}
				return self::with_layout( __( 'Renamed a layout', 'category-ajax-filter' ), $layout );
			case 'caf-duplicate-layout':
				return self::with_layout( __( 'Duplicated', 'category-ajax-filter' ), $layout );
			case 'caf-trash-layout':
				return self::with_layout( __( 'Moved to trash', 'category-ajax-filter' ), $layout );
			case 'caf-restore-layout':
				return self::with_layout( __( 'Restored from trash', 'category-ajax-filter' ), $layout );
			case 'caf-delete-layout':
				return self::with_layout( __( 'Permanently deleted', 'category-ajax-filter' ), $layout );
			case 'caf-export-layout':
				if ( 'filter' === $scope ) {
					return self::with_layout( __( 'Exported the filter', 'category-ajax-filter' ), $layout );
				}
				if ( 'post' === $scope ) {
					return self::with_layout( __( 'Exported the post card', 'category-ajax-filter' ), $layout );
				}
				if ( 'layout_settings' === $scope ) {
					return self::with_layout( __( 'Exported settings', 'category-ajax-filter' ), $layout );
				}
				return self::with_layout( __( 'Exported', 'category-ajax-filter' ), $layout );
			case 'caf-import-layout':
				$mode = isset( $args['mode'] ) ? sanitize_key( (string) $args['mode'] ) : '';
				if ( '' === $layout ) {
					return $label
						? sprintf( /* translators: %s: filter name */ __( 'Imported as “%s”', 'category-ajax-filter' ), $label )
						: __( 'Imported a new layout', 'category-ajax-filter' );
				}
				if ( 'merge' === $mode ) {
					return self::with_layout( __( 'Merged into', 'category-ajax-filter' ), $layout );
				}
				return self::with_layout( __( 'Imported into', 'category-ajax-filter' ), $layout );
			case 'caf-manage-layout-settings':
				return self::summarize_layout_settings( $args, $layout );
			case 'caf-manage-query-restriction':
				return self::with_layout( __( 'Changed query restriction', 'category-ajax-filter' ), $layout );
			case 'caf-manage-filter-query':
				return self::with_layout( __( 'Changed filter query', 'category-ajax-filter' ), $layout );
			case 'caf-manage-modules':
				return self::summarize_manage_modules( $args, $layout );
			case 'caf-build-filter':
				$mods = self::module_labels_from_structure( isset( $args['structure'] ) ? $args['structure'] : array() );
				$mode = isset( $args['mode'] ) ? sanitize_key( (string) $args['mode'] ) : '';
				if ( $mods ) {
					$joined = self::join_short( $mods );
					$verb   = ( 'replace_children' === $mode )
						? sprintf( /* translators: %s: module names */ __( 'Replaced filters with %s', 'category-ajax-filter' ), $joined )
						: sprintf( /* translators: %s: module names */ __( 'Added %s', 'category-ajax-filter' ), $joined );
					return $layout ? $verb . ' on ' . $layout : $verb;
				}
				return self::with_layout( __( 'Updated the filter', 'category-ajax-filter' ), $layout );
			case 'caf-build-post':
				$mods = self::module_labels_from_structure( isset( $args['structure'] ) ? $args['structure'] : array() );
				if ( $mods ) {
					$verb = sprintf( /* translators: %s: module names */ __( 'Updated the post card (%s)', 'category-ajax-filter' ), self::join_short( $mods ) );
					return $layout ? $verb . ' on ' . $layout : $verb;
				}
				return self::with_layout( __( 'Updated the post card', 'category-ajax-filter' ), $layout );
			case 'caf-restore-revision':
				$rev = isset( $args['revision'] ) ? absint( $args['revision'] ) : 0;
				if ( $rev > 0 && $layout ) {
					return sprintf( /* translators: 1: layout id, 2: revision number */ __( 'Restored %1$s to revision %2$d', 'category-ajax-filter' ), $layout, $rev );
				}
				return self::with_layout( __( 'Restored a revision', 'category-ajax-filter' ), $layout );
			case 'caf-create-preview-link':
				return self::with_layout( __( 'Requested a preview', 'category-ajax-filter' ), $layout );
			default:
				return $layout ? $tool . ' · ' . $layout : $tool;
		}
	}

	/**
	 * Fallback for older log rows that have no stored summary.
	 *
	 * @param string $method JSON-RPC method.
	 * @param string $tool   Tool name.
	 * @param string $layout Layout id.
	 * @return string
	 */
	public static function format_legacy( $method, $tool, $layout ) {
		$args = array();
		if ( $layout ) {
			$args['layout_id'] = $layout;
		}
		$line = self::summarize( $method, $tool, $args );
		if ( '' !== $line ) {
			return $line;
		}
		$labels = array(
			'caf-list-layouts'         => __( 'Listed layouts', 'category-ajax-filter' ),
			'caf-get-layout-structure' => __( 'Read layout structure', 'category-ajax-filter' ),
			'caf-list-revisions'       => __( 'Listed revisions', 'category-ajax-filter' ),
			'caf-list-posts'           => __( 'Listed posts', 'category-ajax-filter' ),
			'caf-list-post-types'      => __( 'Listed post types', 'category-ajax-filter' ),
			'caf-list-taxonomies'      => __( 'Listed taxonomies', 'category-ajax-filter' ),
			'caf-list-custom-fields'   => __( 'Listed custom fields', 'category-ajax-filter' ),
			'caf-list-woo-attributes'  => __( 'Listed Woo attributes', 'category-ajax-filter' ),
			'caf-list-media'           => __( 'Listed media', 'category-ajax-filter' ),
			'caf-list-module-schemas'  => __( 'Listed module schemas', 'category-ajax-filter' ),
			'caf-get-module-schema'    => __( 'Read a module schema', 'category-ajax-filter' ),
			'caf-get-price-range'      => __( 'Read price range', 'category-ajax-filter' ),
		);
		if ( 'tools/call' === $method && $tool && isset( $labels[ $tool ] ) ) {
			return self::with_layout( $labels[ $tool ], $layout );
		}
		if ( 'tools/call' === $method && $tool ) {
			return self::with_layout( $tool, $layout );
		}
		return $method ? (string) $method : '';
	}

	/**
	 * @param mixed $value Layout id candidate.
	 * @return string
	 */
	public static function layout_id( $value ) {
		$id = sanitize_text_field( (string) $value );
		return preg_match( '/^caf_[a-z0-9]+$/i', $id ) ? $id : '';
	}

	/**
	 * @return array<int, string>
	 */
	private static function skip_tools() {
		return array(
			'caf-list-layouts',
			'caf-get-layout-structure',
			'caf-list-module-schemas',
			'caf-get-module-schema',
			'caf-list-posts',
			'caf-list-post-types',
			'caf-list-taxonomies',
			'caf-list-custom-fields',
			'caf-list-woo-attributes',
			'caf-get-price-range',
			'caf-list-media',
			'caf-list-revisions',
		);
	}

	/**
	 * @param mixed $text Raw label.
	 * @return string
	 */
	private static function clip_text( $text ) {
		$text = trim( wp_strip_all_tags( (string) $text ) );
		if ( '' === $text ) {
			return '';
		}
		if ( function_exists( 'mb_strlen' ) && mb_strlen( $text ) > 40 ) {
			return mb_substr( $text, 0, 37 ) . '…';
		}
		if ( strlen( $text ) > 40 ) {
			return substr( $text, 0, 37 ) . '…';
		}
		return $text;
	}

	/**
	 * @param string $phrase Action phrase.
	 * @param string $layout Layout id.
	 * @return string
	 */
	private static function with_layout( $phrase, $layout ) {
		$phrase = (string) $phrase;
		$layout = self::layout_id( $layout );
		if ( '' === $layout ) {
			return $phrase;
		}
		if ( preg_match( '/\b(into|on|of|from)\s*$/i', $phrase ) ) {
			return $phrase . ' ' . $layout;
		}
		return $phrase . ' · ' . $layout;
	}

	/**
	 * @param array<int, string> $parts Unique short names.
	 * @return string
	 */
	private static function join_short( $parts ) {
		$parts = array_values( array_unique( array_filter( array_map( 'strval', $parts ) ) ) );
		if ( count( $parts ) > 3 ) {
			$parts   = array_slice( $parts, 0, 3 );
			$parts[] = __( 'more', 'category-ajax-filter' );
		}
		$n = count( $parts );
		if ( 0 === $n ) {
			return '';
		}
		if ( 1 === $n ) {
			return $parts[0];
		}
		$and = __( 'and', 'category-ajax-filter' );
		if ( 2 === $n ) {
			return $parts[0] . ' ' . $and . ' ' . $parts[1];
		}
		$last = array_pop( $parts );
		return implode( ', ', $parts ) . ', ' . $and . ' ' . $last;
	}

	/**
	 * @param mixed $node Structure node or list.
	 * @return array<int, string>
	 */
	private static function module_labels_from_structure( $node ) {
		$out = array();
		self::collect_module_labels( $node, $out );
		return $out;
	}

	/**
	 * @param mixed              $node Structure.
	 * @param array<int, string> $out  Collected labels.
	 * @return void
	 */
	private static function collect_module_labels( $node, &$out ) {
		if ( ! is_array( $node ) ) {
			return;
		}
		if ( isset( $node['key'] ) ) {
			$label = self::module_label( (string) $node['key'] );
			if ( $label && ! in_array( $label, $out, true ) ) {
				$out[] = $label;
			}
		}
		foreach ( $node as $child ) {
			if ( is_array( $child ) ) {
				self::collect_module_labels( $child, $out );
			}
		}
	}

	/**
	 * @param string $key Module key.
	 * @return string
	 */
	private static function module_label( $key ) {
		$key    = sanitize_key( $key );
		$labels = array(
			'checkbox_filter'      => __( 'checkbox', 'category-ajax-filter' ),
			'dropdown_filter'      => __( 'dropdown', 'category-ajax-filter' ),
			'search'               => __( 'search', 'category-ajax-filter' ),
			'reset'                => __( 'reset', 'category-ajax-filter' ),
			'range_slider'         => __( 'range slider', 'category-ajax-filter' ),
			'customtext'           => __( 'custom text', 'category-ajax-filter' ),
			'woo_rating_filter'    => __( 'star rating', 'category-ajax-filter' ),
			'image'                => __( 'image', 'category-ajax-filter' ),
			'title'                => __( 'title', 'category-ajax-filter' ),
			'excerpt'              => __( 'description', 'category-ajax-filter' ),
			'author'               => __( 'author', 'category-ajax-filter' ),
			'date'                 => __( 'date', 'category-ajax-filter' ),
			'commentcount'         => __( 'comments', 'category-ajax-filter' ),
			'categories'           => __( 'categories', 'category-ajax-filter' ),
			'customfield'          => __( 'custom field', 'category-ajax-filter' ),
			'button'               => __( 'button', 'category-ajax-filter' ),
			'pagination'           => __( 'pagination', 'category-ajax-filter' ),
			'woo_product_image'    => __( 'product image', 'category-ajax-filter' ),
			'product_price'        => __( 'price', 'category-ajax-filter' ),
			'woo_product_rating'   => __( 'product rating', 'category-ajax-filter' ),
			'woo_add_to_cart'      => __( 'add to cart', 'category-ajax-filter' ),
			'badges'               => __( 'badges', 'category-ajax-filter' ),
			'woo_attribute_swatch' => __( 'attribute swatch', 'category-ajax-filter' ),
		);
		return isset( $labels[ $key ] ) ? $labels[ $key ] : '';
	}

	/**
	 * @param array<string, mixed> $args   Tool args.
	 * @param string               $layout Layout id.
	 * @return string
	 */
	private static function summarize_manage_modules( $args, $layout ) {
		$ops  = isset( $args['operations'] ) && is_array( $args['operations'] ) ? $args['operations'] : array();
		$bits = array();
		foreach ( $ops as $op ) {
			if ( ! is_array( $op ) ) {
				continue;
			}
			$action = isset( $op['action'] ) ? sanitize_key( (string) $op['action'] ) : '';
			$phrase = '';
			switch ( $action ) {
				case 'style':
					$eid    = isset( $op['element_id'] ) ? strtolower( (string) $op['element_id'] ) : '';
					$phrase = ( 0 === strpos( $eid, 'preview:dnd:' ) )
						? __( 'Styled a layout control', 'category-ajax-filter' )
						: ( ( 0 === strpos( $eid, 'preview:' ) )
							? __( 'Styled last-screen layout', 'category-ajax-filter' )
							: __( 'Styled a module', 'category-ajax-filter' ) );
					break;
				case 'layout':
					$eid    = isset( $op['element_id'] ) ? strtolower( (string) $op['element_id'] ) : '';
					$phrase = ( 0 === strpos( $eid, 'preview:' ) )
						? __( 'Changed last-screen layout', 'category-ajax-filter' )
						: __( 'Changed module layout', 'category-ajax-filter' );
					break;
				case 'update':
					$eid    = isset( $op['element_id'] ) ? strtolower( (string) $op['element_id'] ) : '';
					$phrase = ( 0 === strpos( $eid, 'preview:dnd:' ) )
						? __( 'Updated a layout control', 'category-ajax-filter' )
						: __( 'Updated a module', 'category-ajax-filter' );
					break;
				case 'move':
					$eid    = isset( $op['element_id'] ) ? strtolower( (string) $op['element_id'] ) : '';
					$phrase = ( 0 === strpos( $eid, 'preview:dnd:' ) )
						? __( 'Moved a layout control', 'category-ajax-filter' )
						: __( 'Moved a module', 'category-ajax-filter' );
					break;
				case 'delete':
					$phrase = __( 'Removed a module', 'category-ajax-filter' );
					break;
				case 'duplicate':
					$phrase = __( 'Duplicated a module', 'category-ajax-filter' );
					break;
				case 'bind_taxonomy':
					$phrase = self::summarize_bind_taxonomy( $op );
					break;
				case 'bind_custom_field':
					$phrase = __( 'Bound a custom field', 'category-ajax-filter' );
					break;
				case 'bind_price':
					$phrase = __( 'Bound price', 'category-ajax-filter' );
					break;
				case 'set_term_visual':
					$phrase = self::summarize_term_visual( $op );
					break;
			}
			if ( $phrase && ! in_array( $phrase, $bits, true ) ) {
				$generic_visual = in_array(
					$phrase,
					array(
						__( 'Generated a term icon', 'category-ajax-filter' ),
						__( 'Set a term color', 'category-ajax-filter' ),
						__( 'Set a term icon', 'category-ajax-filter' ),
					),
					true
				);
				if ( $generic_visual && ! empty( $bits ) ) {
					continue;
				}
				$bits[] = $phrase;
			}
		}
		if ( empty( $bits ) ) {
			return self::with_layout( __( 'Edited a module', 'category-ajax-filter' ), $layout );
		}
		return self::with_layout( self::join_short( $bits ), $layout );
	}

	/**
	 * @param array<string, mixed> $op Bind operation.
	 * @return string
	 */
	private static function summarize_bind_taxonomy( $op ) {
		$tax       = isset( $op['taxonomy'] ) ? sanitize_key( (string) $op['taxonomy'] ) : '';
		$tax_label = $tax ? self::taxonomy_label( $tax ) : __( 'a taxonomy', 'category-ajax-filter' );
		$ids       = self::term_ids_from_op( $op );
		$named     = self::term_names_from_op( $op );

		if ( empty( $ids ) && empty( $named ) ) {
			return sprintf( /* translators: %s: taxonomy label */ __( 'Bound %s', 'category-ajax-filter' ), $tax_label );
		}

		$omitted = self::omitted_term_names( $tax, $ids );
		if ( count( $omitted ) >= 1 && count( $omitted ) <= 3 ) {
			return sprintf(
				/* translators: 1: term names, 2: taxonomy label */
				__( 'Removed %1$s from %2$s', 'category-ajax-filter' ),
				self::join_short( self::quoted_names( $omitted ) ),
				$tax_label
			);
		}

		$kept = $named ? $named : self::term_names_from_ids( $ids, $tax );
		if ( count( $kept ) >= 1 && count( $kept ) <= 3 ) {
			return sprintf(
				/* translators: 1: taxonomy label, 2: term names */
				__( 'Set %1$s to %2$s', 'category-ajax-filter' ),
				$tax_label,
				self::join_short( self::quoted_names( $kept ) )
			);
		}

		return sprintf( /* translators: %s: taxonomy label */ __( 'Changed terms in %s', 'category-ajax-filter' ), $tax_label );
	}

	/**
	 * @param array<string, mixed> $op Visual operation.
	 * @return string
	 */
	private static function summarize_term_visual( $op ) {
		$term = self::term_label_from_visual_op( $op );
		if ( ! empty( $op['all'] ) || ( isset( $op['term_id'] ) && '*' === (string) $op['term_id'] ) ) {
			if ( ! empty( $op['generate'] ) ) {
				return __( 'Generated icons for all terms', 'category-ajax-filter' );
			}
			if ( isset( $op['color'] ) && '' !== (string) $op['color'] ) {
				return __( 'Set color on all terms', 'category-ajax-filter' );
			}
			return __( 'Set icons on all terms', 'category-ajax-filter' );
		}
		if ( $term ) {
			$quoted = self::join_short( self::quoted_names( array( $term ) ) );
			if ( ! empty( $op['generate'] ) ) {
				return sprintf( /* translators: %s: term name */ __( 'Generated an icon for %s', 'category-ajax-filter' ), $quoted );
			}
			if ( isset( $op['color'] ) && '' !== (string) $op['color'] ) {
				return sprintf( /* translators: %s: term name */ __( 'Set color on %s', 'category-ajax-filter' ), $quoted );
			}
			return sprintf( /* translators: %s: term name */ __( 'Set icon on %s', 'category-ajax-filter' ), $quoted );
		}
		if ( ! empty( $op['generate'] ) ) {
			return __( 'Generated a term icon', 'category-ajax-filter' );
		}
		if ( isset( $op['color'] ) && '' !== (string) $op['color'] ) {
			return __( 'Set a term color', 'category-ajax-filter' );
		}
		return __( 'Set a term icon', 'category-ajax-filter' );
	}

	/**
	 * @param string $taxonomy Taxonomy slug.
	 * @return string
	 */
	private static function taxonomy_label( $taxonomy ) {
		$taxonomy = sanitize_key( $taxonomy );
		if ( function_exists( 'get_taxonomy' ) ) {
			$obj = get_taxonomy( $taxonomy );
			if ( $obj && ! empty( $obj->labels->name ) ) {
				$label = self::clip_text( (string) $obj->labels->name );
				if ( $label ) {
					return strtolower( $label );
				}
			}
		}
		$map = array(
			'product_cat'  => __( 'product categories', 'category-ajax-filter' ),
			'product_tag'  => __( 'product tags', 'category-ajax-filter' ),
			'category'     => __( 'categories', 'category-ajax-filter' ),
			'post_tag'     => __( 'tags', 'category-ajax-filter' ),
			'__caf_author' => __( 'authors', 'category-ajax-filter' ),
			'author'       => __( 'authors', 'category-ajax-filter' ),
		);
		return isset( $map[ $taxonomy ] ) ? $map[ $taxonomy ] : $taxonomy;
	}

	/**
	 * @param array<string, mixed> $op Operation.
	 * @return array<int, int>
	 */
	private static function term_ids_from_op( $op ) {
		$ids = array();
		if ( empty( $op['term_ids'] ) || ! is_array( $op['term_ids'] ) ) {
			return $ids;
		}
		foreach ( $op['term_ids'] as $id ) {
			$id = absint( $id );
			if ( $id ) {
				$ids[] = $id;
			}
		}
		return array_values( array_unique( $ids ) );
	}

	/**
	 * @param array<string, mixed> $op Operation.
	 * @return array<int, string>
	 */
	private static function term_names_from_op( $op ) {
		$names = array();
		if ( empty( $op['terms'] ) || ! is_array( $op['terms'] ) ) {
			return $names;
		}
		foreach ( $op['terms'] as $name ) {
			if ( is_array( $name ) ) {
				if ( isset( $name['name'] ) ) {
					$name = $name['name'];
				} elseif ( isset( $name['value'] ) ) {
					$name = $name['value'];
				} else {
					continue;
				}
			}
			$name = self::clip_text( $name );
			if ( $name ) {
				$names[] = $name;
			}
		}
		return $names;
	}

	/**
	 * @param array<int, int> $ids      Term ids kept on the filter.
	 * @param string          $taxonomy Taxonomy slug.
	 * @return array<int, string>
	 */
	private static function term_names_from_ids( $ids, $taxonomy ) {
		$names = array();
		if ( ! function_exists( 'get_term' ) ) {
			return $names;
		}
		foreach ( $ids as $id ) {
			$term = $taxonomy ? get_term( (int) $id, $taxonomy ) : get_term( (int) $id );
			if ( $term && ! is_wp_error( $term ) && ! empty( $term->name ) ) {
				$names[] = (string) $term->name;
			}
		}
		return $names;
	}

	/**
	 * Term names in the taxonomy that were not included in term_ids.
	 *
	 * @param string          $taxonomy Taxonomy slug.
	 * @param array<int, int> $ids      Kept term ids.
	 * @return array<int, string>
	 */
	private static function omitted_term_names( $taxonomy, $ids ) {
		if ( '' === $taxonomy || empty( $ids ) || ! function_exists( 'get_terms' ) ) {
			return array();
		}
		$all = get_terms(
			array(
				'taxonomy'   => $taxonomy,
				'hide_empty' => false,
				'number'     => 200,
				'fields'     => 'id=>name',
			)
		);
		if ( ! is_array( $all ) || empty( $all ) ) {
			return array();
		}
		$wanted  = array_fill_keys( $ids, true );
		$omitted = array();
		foreach ( $all as $id => $name ) {
			if ( isset( $wanted[ (int) $id ] ) ) {
				continue;
			}
			$name = self::clip_text( $name );
			if ( $name ) {
				$omitted[] = $name;
			}
		}
		return $omitted;
	}

	/**
	 * @param array<string, mixed> $op Visual operation.
	 * @return string
	 */
	private static function term_label_from_visual_op( $op ) {
		foreach ( array( 'term_name', 'term', 'media_search', 'media_name' ) as $key ) {
			if ( ! empty( $op[ $key ] ) && ! is_array( $op[ $key ] ) ) {
				$label = self::clip_text( $op[ $key ] );
				if ( $label ) {
					return $label;
				}
			}
		}
		if ( empty( $op['term_id'] ) || '*' === (string) $op['term_id'] || ! function_exists( 'get_term' ) ) {
			return '';
		}
		$id = absint( $op['term_id'] );
		if ( $id < 1 ) {
			$maybe = self::clip_text( $op['term_id'] );
			return is_numeric( (string) $op['term_id'] ) ? '' : $maybe;
		}
		$term = get_term( $id );
		if ( $term && ! is_wp_error( $term ) && ! empty( $term->name ) ) {
			return self::clip_text( $term->name );
		}
		return '';
	}

	/**
	 * @param array<int, string> $names Term names.
	 * @return array<int, string>
	 */
	private static function quoted_names( $names ) {
		$out = array();
		foreach ( $names as $name ) {
			$name = self::clip_text( $name );
			if ( $name ) {
				$out[] = '“' . $name . '”';
			}
		}
		return $out;
	}

	/**
	 * @param array<string, mixed> $args   Tool args.
	 * @param string               $layout Layout id.
	 * @return string
	 */
	private static function summarize_layout_settings( $args, $layout ) {
		$bits = array();
		if ( isset( $args['post_type'] ) && '' !== (string) $args['post_type'] ) {
			$pt = sanitize_key( (string) $args['post_type'] );
			$bits[] = $pt
				? sprintf( /* translators: %s: post type slug */ __( 'Set post type to %s', 'category-ajax-filter' ), $pt )
				: __( 'Changed post type', 'category-ajax-filter' );
		}
		if ( isset( $args['filter_position'] ) ) {
			$pos = sanitize_key( (string) $args['filter_position'] );
			$bits[] = $pos
				? sprintf( /* translators: %s: position */ __( 'Moved filter %s', 'category-ajax-filter' ), $pos )
				: __( 'Changed filter position', 'category-ajax-filter' );
		}
		if ( isset( $args['float_button_position'] ) || isset( $args['float_position'] ) ) {
			$raw = isset( $args['float_button_position'] ) ? $args['float_button_position'] : $args['float_position'];
			$corner = sanitize_key( (string) $raw );
			$bits[] = $corner
				? sprintf( /* translators: %s: corner */ __( 'Pinned off-canvas filter %s', 'category-ajax-filter' ), $corner )
				: __( 'Pinned off-canvas filter button', 'category-ajax-filter' );
		}
		if ( isset( $args['selected_enable'] ) || isset( $args['selected_zone'] ) || isset( $args['active_filters'] ) ) {
			$bits[] = __( 'Updated active-filter chips', 'category-ajax-filter' );
		}
		if ( isset( $args['pagination_type'] ) ) {
			$bits[] = __( 'Changed pagination', 'category-ajax-filter' );
		}
		if ( isset( $args['posts_per_page'] ) ) {
			$bits[] = __( 'Changed posts per page', 'category-ajax-filter' );
		}
		if ( isset( $args['css'] ) || isset( $args['container_background'] ) || isset( $args['target'] ) ) {
			$bits[] = __( 'Styled last-screen layout', 'category-ajax-filter' );
		}
		if ( isset( $args['columns'] ) || isset( $args['layout_type'] ) ) {
			$bits[] = __( 'Changed post layout', 'category-ajax-filter' );
		}
		if ( empty( $bits ) ) {
			return self::with_layout( __( 'Changed layout settings', 'category-ajax-filter' ), $layout );
		}
		return self::with_layout( self::join_short( $bits ), $layout );
	}
}

}
