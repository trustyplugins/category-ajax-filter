<?php
/**
 * JSON compose for CAF filter trees (build-filter).
 * Agent never invents durable ids. configuration_id is per-request only.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'CAF_MCP_Compose', false ) ) {

class CAF_MCP_Compose {

	const MAX_NODES = 80;
	const ALLOWED_MODULES = array(
		'checkbox_filter',
		'dropdown_filter',
		'search',
		'reset',
		'range_slider',
		'customtext',
		'woo_rating_filter',
	);

	const ALLOWED_POST_MODULES = array(
		'image',
		'title',
		'excerpt',
		'author',
		'date',
		'commentcount',
		'categories',
		'customfield',
		'customtext',
		'button',
		'pagination',
		'woo_product_image',
		'product_price',
		'woo_product_rating',
		'woo_add_to_cart',
		'badges',
		'woo_attribute_swatch',
	);

	const POST_CARD_MODULES = array(
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

	/**
	 * Turn agent specs into CAF nodes. Strips incoming ids; caller stamps new ones.
	 *
	 * @param object $doc Layout (for cloning existing module shells).
	 * @param array  $structure Spec list.
	 * @param string $expected_type row|column|module.
	 * @param string $tree filter|post.
	 * @return array{nodes:array,map:array<string,object>}|WP_Error
	 */
	public static function hydrate( $doc, $structure, $expected_type, $tree = 'filter' ) {
		if ( ! is_array( $structure ) || empty( $structure ) ) {
			return new WP_Error(
				'caf_mcp_empty_composition',
				__( 'Pass a structure array of rows, columns, or modules.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}

		$count = 0;
		self::count_specs( $structure, $count );
		if ( $count > self::MAX_NODES ) {
			return new WP_Error(
				'caf_mcp_too_many_nodes',
				__( 'At most 80 nodes per compose request.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}

		$seen = array();
		$map  = array();
		$out  = array();
		$tree = ( 'post' === $tree ) ? 'post' : 'filter';
		foreach ( $structure as $i => $spec ) {
			$node = self::hydrate_spec( $doc, $spec, $expected_type, $seen, $map, (string) $i, $tree );
			if ( is_wp_error( $node ) ) {
				return $node;
			}
			$out[] = $node;
		}
		if ( 'filter' === $tree && self::count_search( $out ) > 1 ) {
			return new WP_Error(
				'caf_mcp_single_instance',
				__( 'A layout can only have one search module.', 'category-ajax-filter' ),
				array( 'status' => 400 )
			);
		}
		return array(
			'nodes' => $out,
			'map'   => $map,
		);
	}

	/**
	 * UI Add New filter canvas: one row, one column, search + unbound checkbox + reset.
	 *
	 * @param string $taxonomy Optional taxonomy slug to bind on the checkbox.
	 * @return array<int, array<string, mixed>>
	 */
	public static function add_new_starter_filter_tree( $taxonomy = '' ) {
		return array(
			array(
				'type'             => 'row',
				'configuration_id' => 'starter-filter-row',
				'css'              => 'display:flex;flex-flow:column;gap:10px;width:100%;height:auto;padding:10px;margin-top:0;margin-right:0;margin-bottom:10px;margin-left:0;background-color:rgb(255,255,255);border-width:1px;border-style:solid;border-color:rgb(221,221,221);box-shadow:0px 0px 0px 0px #333333;',
				'elements'         => array(
					array(
						'type'             => 'column',
						'configuration_id' => 'starter-filter-col',
						'css'              => 'display:block;width:100%;padding:0;margin:0;background-color:#ffffff00;border-width:0px;',
						'elements'         => self::add_new_starter_filter_specs( $taxonomy ),
					),
				),
			),
		);
	}

	/**
	 * UI Add New post card: one row, three columns (image / meta row / body).
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public static function add_new_starter_post_tree() {
		$mod = static function ( $key ) {
			return array(
				'type'             => 'module',
				'key'              => $key,
				'configuration_id' => 'starter-' . $key,
			);
		};
		return array(
			array(
				'type'             => 'row',
				'configuration_id' => 'starter-post-row',
				'css'              => 'display:flex;flex-flow:column;gap:10px;width:100%;height:auto;padding-top:0;padding-right:0;padding-bottom:25px;padding-left:0;margin:0;background-color:rgb(255,255,255);border-width:1px;border-style:solid;border-color:rgb(221,221,221);border-top-left-radius:20px;border-top-right-radius:20px;box-shadow:0px 0px 0px 0px #333333;',
				'elements'         => array(
					array(
						'type'             => 'column',
						'configuration_id' => 'starter-post-media',
						'css'              => 'display:flex;flex-flow:column;justify-content:flex-start;align-items:flex-start;width:100%;padding:0;margin:0;',
						'elements'         => array( $mod( 'image' ) ),
					),
					array(
						'type'             => 'column',
						'configuration_id' => 'starter-post-meta',
						'css'              => 'display:flex;flex-flow:row;justify-content:space-between;align-items:flex-start;width:100%;padding:15px;margin:0;',
						'elements'         => array( $mod( 'author' ), $mod( 'date' ), $mod( 'commentcount' ) ),
					),
					array(
						'type'             => 'column',
						'configuration_id' => 'starter-post-body',
						'css'              => 'display:flex;flex-flow:column;gap:10px;justify-content:flex-start;align-items:flex-start;width:100%;padding-top:0;padding-right:15px;padding-bottom:0;padding-left:15px;margin:0;',
						'elements'         => array( $mod( 'title' ), $mod( 'categories' ), $mod( 'excerpt' ), $mod( 'button' ) ),
					),
				),
			),
		);
	}

	/**
	 * Canonical bind key. `author` / `filter_author` → `__caf_author` (not a WP taxonomy).
	 *
	 * @param mixed $raw Incoming taxonomy / alias.
	 * @return string
	 */
	public static function normalize_bind_taxonomy_key( $raw ) {
		$key = sanitize_key( (string) $raw );
		if ( in_array( $key, array( 'author', 'filter_author', '__caf_author' ), true ) ) {
			return '__caf_author';
		}
		return $key;
	}

	/**
	 * UI Add New filter canvas: search, unbound checkbox, reset.
	 * Pass taxonomy only when the user named one — never guess product_cat.
	 *
	 * @param string $taxonomy Optional taxonomy slug to bind on the checkbox.
	 * @return array<int, array<string, mixed>>
	 */
	public static function add_new_starter_filter_specs( $taxonomy = '' ) {
		$checkbox = array(
			'type'             => 'module',
			'key'              => 'checkbox_filter',
			'configuration_id' => 'starter-checkbox',
		);
		$taxonomy = self::normalize_bind_taxonomy_key( $taxonomy );
		if ( '' !== $taxonomy ) {
			$checkbox['taxonomy'] = $taxonomy;
		}
		return array(
			array(
				'type'             => 'module',
				'key'              => 'search',
				'configuration_id' => 'starter-search',
			),
			$checkbox,
			array(
				'type'             => 'module',
				'key'              => 'reset',
				'configuration_id' => 'starter-reset',
			),
		);
	}

	/**
	 * UI Add New post card: image, meta, title, categories, excerpt, button.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public static function add_new_starter_post_specs() {
		$keys = array( 'image', 'author', 'date', 'commentcount', 'title', 'categories', 'excerpt', 'button' );
		$out  = array();
		foreach ( $keys as $key ) {
			$out[] = array(
				'type'             => 'module',
				'key'              => $key,
				'configuration_id' => 'starter-' . $key,
			);
		}
		return $out;
	}

	/**
	 * Collect durable ids from a node list (for removed_ids).
	 *
	 * @param mixed $nodes Tree.
	 * @return array<int, string>
	 */
	public static function collect_ids( $nodes ) {
		$ids = array();
		self::walk_ids( $nodes, $ids );
		return $ids;
	}

	/**
	 * @param mixed $nodes Tree.
	 * @return int
	 */
	public static function count_search( $nodes ) {
		$n = 0;
		self::walk_search( $nodes, $n );
		return $n;
	}

	/**
	 * @param array  $specs Specs.
	 * @param int    $count Counter.
	 * @return void
	 */
	private static function count_specs( $specs, &$count ) {
		if ( ! is_array( $specs ) ) {
			return;
		}
		foreach ( $specs as $spec ) {
			if ( ! is_array( $spec ) ) {
				continue;
			}
			++$count;
			if ( isset( $spec['elements'] ) && is_array( $spec['elements'] ) ) {
				self::count_specs( $spec['elements'], $count );
			}
		}
	}

	/**
	 * @param mixed $nodes Nodes.
	 * @param array $ids Ids.
	 * @return void
	 */
	private static function walk_ids( $nodes, &$ids ) {
		if ( is_object( $nodes ) ) {
			$nodes = array( $nodes );
		}
		if ( ! is_array( $nodes ) ) {
			return;
		}
		foreach ( $nodes as $node ) {
			if ( ! is_object( $node ) ) {
				continue;
			}
			if ( isset( $node->id ) && is_string( $node->id ) && '' !== $node->id ) {
				$ids[] = $node->id;
			}
			if ( isset( $node->data ) ) {
				self::walk_ids( $node->data, $ids );
			}
		}
	}

	/**
	 * @param mixed $nodes Nodes.
	 * @param int   $n Count.
	 * @return void
	 */
	private static function walk_search( $nodes, &$n ) {
		if ( is_object( $nodes ) ) {
			$nodes = array( $nodes );
		}
		if ( ! is_array( $nodes ) ) {
			return;
		}
		foreach ( $nodes as $node ) {
			if ( ! is_object( $node ) ) {
				continue;
			}
			if ( isset( $node->key ) && 'search' === (string) $node->key ) {
				++$n;
			}
			if ( isset( $node->data ) ) {
				self::walk_search( $node->data, $n );
			}
		}
	}

	/**
	 * @param object     $doc Layout.
	 * @param mixed      $spec Spec.
	 * @param string     $expected row|column|module.
	 * @param array      $seen configuration_ids.
	 * @param array      $map configuration_id → node (filled, ids later).
	 * @param string     $path Path for errors.
	 * @param string     $tree filter|post.
	 * @return object|WP_Error
	 */
	private static function hydrate_spec( $doc, $spec, $expected, &$seen, &$map, $path, $tree = 'filter' ) {
		if ( ! is_array( $spec ) ) {
			return self::err( 'caf_mcp_bad_spec', sprintf( 'structure[%s] must be an object.', $path ) );
		}
		$type = isset( $spec['type'] ) ? sanitize_key( (string) $spec['type'] ) : '';
		if ( $type !== $expected ) {
			return self::err( 'caf_mcp_bad_type', sprintf( 'structure[%s] must be type=%s.', $path, $expected ) );
		}
		$config_id = isset( $spec['configuration_id'] ) ? sanitize_text_field( (string) $spec['configuration_id'] ) : '';
		if ( '' === $config_id ) {
			return self::err( 'caf_mcp_missing_config_id', sprintf( 'structure[%s] needs configuration_id.', $path ) );
		}
		if ( isset( $seen[ $config_id ] ) ) {
			return self::err( 'caf_mcp_duplicate_config_id', sprintf( 'configuration_id "%s" is used twice.', $config_id ) );
		}
		$seen[ $config_id ] = true;

		$child_type = '';
		if ( 'row' === $type ) {
			$node       = self::make_row( $doc, $tree );
			$child_type = 'column';
		} elseif ( 'column' === $type ) {
			$node       = self::make_column( $doc, $tree );
			$child_type = 'module';
		} else {
			$key     = isset( $spec['key'] ) ? sanitize_key( (string) $spec['key'] ) : '';
			$allowed = ( 'post' === $tree ) ? self::ALLOWED_POST_MODULES : self::ALLOWED_MODULES;
			if ( class_exists( 'CAF_MCP_Tier', false ) ) {
				$allowed = CAF_MCP_Tier::allowed_compose_modules( $tree, $allowed );
			}
			if ( ! in_array( $key, $allowed, true ) ) {
				return self::err(
					'caf_mcp_unknown_module',
					sprintf( 'Unknown module key at structure[%s]. Use GET /mcp/module-schemas?summary=true.', $path )
				);
			}
			$node = self::make_module( $doc, $key, $tree );
		}

		unset( $node->id );
		if ( ! isset( $node->settings ) || ! is_object( $node->settings ) ) {
			$node->settings = new stdClass();
		}
		$node->settings->admin_label = $config_id;
		$bind_tax = '';
		if ( isset( $spec['taxonomy'] ) ) {
			$bind_tax = self::normalize_bind_taxonomy_key( $spec['taxonomy'] );
		} elseif ( isset( $spec['settings'] ) && is_array( $spec['settings'] ) && isset( $spec['settings']['taxonomy'] ) ) {
			$bind_tax = self::normalize_bind_taxonomy_key( $spec['settings']['taxonomy'] );
		}
		if ( isset( $spec['settings'] ) && is_array( $spec['settings'] ) ) {
			self::merge_settings( $node, $spec['settings'] );
		}
		if ( '' !== $bind_tax && 'post' === $tree && isset( $node->key ) && 'categories' === (string) $node->key ) {
			$node->settings->categories = $bind_tax;
			$bind_tax                   = '';
		}
		if ( '' !== $bind_tax ) {
			$node->_mcp_bind_taxonomy = $bind_tax;
		}

		$css = isset( $spec['css'] ) ? (string) $spec['css'] : '';
		if ( '' !== trim( $css ) && class_exists( 'CAF_MCP_Css', false ) ) {
			$part   = isset( $spec['part'] ) ? (string) $spec['part'] : '';
			$device = isset( $spec['device'] ) ? (string) $spec['device'] : 'desktop';
			$styled = CAF_MCP_Css::apply_to_node( $node, $part, $css, $device );
			if ( is_wp_error( $styled ) ) {
				return $styled;
			}
		}

		$elements = isset( $spec['elements'] ) && is_array( $spec['elements'] ) ? $spec['elements'] : array();
		if ( 'module' === $type && ! empty( $elements ) ) {
			return self::err( 'caf_mcp_module_children', sprintf( 'Modules cannot have elements (structure[%s]).', $path ) );
		}
		$node->data = array();
		if ( '' !== $child_type ) {
			foreach ( $elements as $j => $child_spec ) {
				$child = self::hydrate_spec( $doc, $child_spec, $child_type, $seen, $map, $path . '.elements.' . $j, $tree );
				if ( is_wp_error( $child ) ) {
					return $child;
				}
				$node->data[] = $child;
			}
		}
		if ( 'row' === $type && empty( $node->data ) ) {
			$node->data[] = self::make_column( $doc, $tree );
			unset( $node->data[0]->id );
		}

		$map[ $config_id ] = $node;
		return $node;
	}

	/**
	 * Settings patch used by compose and manage-modules update.
	 *
	 * @param object $node Node.
	 * @param array  $settings Patch.
	 * @return void
	 */
	public static function patch_settings( $node, $settings ) {
		if ( ! is_object( $node ) ) {
			return;
		}
		if ( ! isset( $node->settings ) || ! is_object( $node->settings ) ) {
			$node->settings = new stdClass();
		}
		if ( ! is_array( $settings ) ) {
			return;
		}
		self::merge_settings( $node, $settings );
	}

	/**
	 * Fill missing Add Module keys on already-saved modules (MCP search was thin).
	 *
	 * @param object            $layout_data Layout document.
	 * @param array<int,string> $keys Module keys.
	 * @return void
	 */
	public static function fill_missing_filter_module_defaults( $layout_data, $keys = null ) {
		if ( ! is_object( $layout_data ) ) {
			return;
		}
		if ( ! is_array( $keys ) || empty( $keys ) ) {
			$keys = array( 'search', 'reset', 'customtext', 'range_slider', 'woo_rating_filter' );
		}
		if ( isset( $layout_data->filter_layout_data ) && is_object( $layout_data->filter_layout_data ) && isset( $layout_data->filter_layout_data->initial_data ) && is_array( $layout_data->filter_layout_data->initial_data ) ) {
			self::walk_fill_modules( $layout_data->filter_layout_data->initial_data, $keys, 'filter' );
		}
		if ( isset( $layout_data->post_layout_data ) && is_object( $layout_data->post_layout_data ) && isset( $layout_data->post_layout_data->initial_data ) && is_array( $layout_data->post_layout_data->initial_data ) ) {
			$post_keys = array_merge( self::POST_CARD_MODULES, array( 'customtext', 'pagination', 'woo_attribute_swatch' ) );
			self::walk_fill_modules( $layout_data->post_layout_data->initial_data, $post_keys, 'post' );
		}
		self::fill_missing_preview_template_defaults( $layout_data );
	}

	/**
	 * Preview screen (last builder step) reads post_preview_data.inner.style
	 * and misc_preview_data.loader.icon_data.source without a guard.
	 * UI Add New ships those trees; MCP blanks did not.
	 * Fill missing keys only — never overwrite saved preview values.
	 *
	 * @param object $layout_data Layout document.
	 * @return void
	 */
	public static function fill_missing_preview_template_defaults( $layout_data ) {
		if ( ! is_object( $layout_data ) ) {
			return;
		}
		if ( ! isset( $layout_data->common_data ) || ! is_object( $layout_data->common_data ) ) {
			$layout_data->common_data = new stdClass();
		}
		$defaults = json_decode( wp_json_encode( self::default_preview_template_data() ) );
		if ( ! is_object( $defaults ) ) {
			return;
		}
		if ( ! isset( $layout_data->common_data->preview_template_data ) || ! is_object( $layout_data->common_data->preview_template_data ) ) {
			$layout_data->common_data->preview_template_data = $defaults;
			return;
		}
		self::merge_missing_object( $layout_data->common_data->preview_template_data, $defaults );
		self::heal_dnd_chrome_from_add_new( $layout_data );
	}

	/**
	 * Same shape as BuilderLayoutData.js preview_template_data (Add New).
	 *
	 * @return array<string, mixed>
	 */
	private static function default_preview_template_data() {
		$hover = new stdClass();
		return array(
			'misc_preview_data'   => array(
				'container' => array(
					'scroll'       => array(
						'desktop' => array(
							'is_enable' => 'false',
							'position'  => '-100',
						),
						'tablet'  => new stdClass(),
						'mobile'  => new stdClass(),
					),
					'custom_class' => '',
					'custom_css'   => '',
					'nonce'        => 'false',
					'style' => array(
						'desktop' => array(
							'default' => array(
								'paddingTop'      => '20px',
								'paddingRight'    => '20px',
								'paddingBottom'   => '20px',
								'paddingLeft'     => '20px',
								'fontSize'        => '14px',
								'display'         => 'flex',
								'backgroundColor' => 'rgba(255,255,255,0)',
								'flexFlow'        => 'row',
								'gap'             => '30px',
								'width'           => '100%',
								'height'          => 'auto',
								'boxShadow'       => '0px 0px 0px 0px  #333333',
								'float'           => 'none',
							),
							'hover'   => $hover,
						),
						'tablet'  => array(
							'default' => array(
								'flexFlow' => 'column',
								'gap'      => '20px',
							),
							'hover'   => $hover,
						),
						'mobile'  => array(
							'default' => array(
								'flexFlow'      => 'column',
								'gap'           => '20px',
								'paddingTop'    => '0px',
								'paddingBottom' => '0px',
								'paddingLeft'   => '0px',
								'paddingRight'  => '0px',
							),
							'hover'   => $hover,
						),
					),
				),
				'extra'           => array(
					'masonary'  => false,
					'order'     => 'ASC',
					'orderby'   => 'title',
					'noresult'  => 'No Result.',
					'desktop'   => array(
						'filterPosition'    => 'inline',
						'floatButtonValue'  => 'Filter',
						'floatButton'       => true,
						'floatIcon'         => true,
						'animationType'     => 'slide-right-left',
						'animationPosition' => 'right',
						'overlay'           => 'rgba(32, 31, 31, 0.624)',
						'floatIconValue'    => 'fas fa-list-ul',
					),
					'tablet'    => new stdClass(),
					'mobile'    => array(
						'floatIconValue' => 'fas fa-list-ul',
						'filterPosition' => 'floating',
					),
				),
				'loader'          => array(
					'is_enable'    => 'true',
					'loader_type'  => 'true',
					'loader_text'  => 'Loading...',
					'overlay'      => 'true',
					'custom_class' => '',
					'icon_data'    => array(
						'source' => 'list',
						'icon'   => 'fa fa-spinner fa-pulse',
						'url'    => '',
						'upload' => '',
						'style'  => array(
							'desktop' => array(
								'default' => array(
									'fontSize' => '14px',
									'overlay'  => 'rgba(255,255,255,0)',
								),
								'hover'   => $hover,
							),
							'tablet'  => array(
								'default' => new stdClass(),
								'hover'   => $hover,
							),
							'mobile'  => array(
								'default' => new stdClass(),
								'hover'   => $hover,
							),
						),
					),
				),
				'dnd_column_data' => self::default_misc_dnd_column_data(),
			),
			'post_preview_data'   => array(
				'layout_type'  => 'grid',
				'custom_class' => '',
				'grid'         => array(
					'device_columns' => array(
						'desktop' => '3',
						'tablet'  => '1',
						'mobile'  => '1',
					),
					'style'          => array(
						'desktop' => array(
							'default' => array(
								'width'         => '75%',
								'paddingLeft'   => '0px',
								'height'        => 'auto',
								'paddingTop'    => '0px',
								'paddingBottom' => '0px',
								'paddingRight'  => '0px',
								'boxShadow'     => '0px 0px 0px 0px  #333333',
							),
							'hover'   => $hover,
						),
						'tablet'  => array(
							'default' => array(
								'width' => '100%',
							),
							'hover'   => $hover,
						),
						'mobile'  => array(
							'default' => array(
								'width'         => '100%',
								'paddingLeft'   => '10px',
								'paddingRight'  => '10px',
							),
							'hover'   => $hover,
						),
					),
				),
				'inner'        => array(
					'style' => array(
						'desktop' => array(
							'default' => array(
								'columnGap' => '15px',
								'rowGap'    => '15px',
							),
							'hover'   => $hover,
						),
						'tablet'  => array(
							'default' => array(
								'columnGap' => '10px',
								'rowGap'    => '10px',
							),
							'hover'   => $hover,
						),
						'mobile'  => array(
							'default' => array(
								'columnGap' => '10px',
								'rowGap'    => '10px',
							),
							'hover'   => $hover,
						),
					),
				),
			),
			'filter_preview_data' => array(
				'custom_class' => '',
				'style'        => array(
					'desktop' => array(
						'default' => array(
							'width'         => '25%',
							'paddingTop'    => '0px',
							'paddingRight'  => '0px',
							'paddingBottom' => '0px',
							'paddingLeft'   => '0px',
							'height'        => 'auto',
							'boxShadow'     => '0px 0px 0px 0px  #333333',
						),
						'hover'   => $hover,
					),
					'tablet'  => array(
						'default' => array(
							'width' => '100%',
						),
						'hover'   => $hover,
					),
					'mobile'  => array(
						'default' => array(
							'width' => '100%',
						),
						'hover'   => $hover,
					),
				),
			),
		);
	}

	/**
	 * UI Add New chrome: filter top/bottom empty; post top has selected +
	 * result count + sorting; post bottom has pagination (9 per page).
	 *
	 * @return array<int, array<string, mixed>>
	 */
	private static function default_misc_dnd_column_data() {
		$vis = array(
			'mobile'  => 'false',
			'tablet'  => 'false',
			'desktop' => 'false',
		);
		$pager = array(
			'key'      => 'pagination',
			'label'    => 'Pagination',
			'settings' => self::default_module_settings( 'pagination' ),
			'style'    => self::default_pagination_style(),
		);
		$zone_box = array(
			'boxShadow'     => '0px 0px 0px 0px  #333333',
			'top'           => 'auto',
			'right'         => 'auto',
			'bottom'        => 'auto',
			'left'          => 'auto',
			'width'         => '100%',
			'height'        => 'auto',
			'paddingTop'    => '0px',
			'paddingBottom' => '0px',
			'paddingRight'  => '0px',
			'paddingLeft'   => '0px',
			'display'       => 'flex',
			'flexFlow'      => 'row',
			'float'         => 'none',
		);
		return array(
			self::misc_zone( 'filter_top', 'Filter Top', array(), $zone_box ),
			self::misc_zone( 'filter_bottom', 'Filter Bottom', array(), array( 'display' => 'flex', 'flexFlow' => 'row', 'float' => 'none' ) ),
			self::misc_zone(
				'post_top',
				'Post Layout Top',
				array(
					array(
						'key'      => 'selected',
						'label'    => 'Selected',
						'settings' => array(
							'is_enable'    => 'true',
							'close_button' => 'true',
							'custom_class' => '',
							'visibility'   => $vis,
						),
						'style'    => self::default_selected_style(),
					),
					array(
						'key'      => 'result_count',
						'label'    => 'Result Count',
						'settings' => array(
							'is_enable'    => 'true',
							'custom_class' => '',
							'prefix'       => array(
								'is_enable' => 'true',
								'value'     => 'Showing',
							),
							'suffix'       => array(
								'is_enable' => 'true',
								'value'     => 'Results',
							),
							'visibility'   => $vis,
						),
						'style'    => self::default_result_count_style(),
					),
					array(
						'key'      => 'sorting',
						'label'    => 'Sorting',
						'settings' => array(
							'is_enable'  => 'true',
							'order'      => array(
								'is_enable'     => 'true',
								'values'        => array( 'DESC', 'ASC' ),
								'placeholder'   => 'Order',
								'icon_position' => 'right',
							),
							'order_by'   => array(
								'is_enable'     => 'true',
								'values'        => array( 'ID', 'date', 'rand', 'title' ),
								'placeholder'   => 'Order By',
								'icon_position' => 'right',
							),
							'custom_class' => '',
							'label'        => array(
								'is_label'   => 'false',
								'label_text' => 'Sorting',
								'style'      => array(
									'desktop' => array(
										'default' => array( 'fontSize' => '14px' ),
										'hover'   => new stdClass(),
									),
									'tablet'  => array(
										'default' => new stdClass(),
										'hover'   => new stdClass(),
									),
									'mobile'  => array(
										'default' => new stdClass(),
										'hover'   => new stdClass(),
									),
								),
							),
							'visibility'   => $vis,
						),
						'style'    => self::default_sorting_style(),
					),
				),
				array_merge(
					$zone_box,
					array(
						'justifyContent' => 'space-between',
						'alignItems'     => 'flex-start',
						'marginBottom'   => '15px',
					)
				),
				array(
					'flexFlow' => 'column',
					'gap'      => '6px',
				),
				array(
					'flexFlow' => 'column',
					'gap'      => '10px',
				)
			),
			self::misc_zone( 'post_bottom', 'Post Layout Bottom', array( $pager ), $zone_box ),
		);
	}

	/**
	 * Add New chrome card (selected, result_count, sorting, pagination).
	 *
	 * @param string $key Item key.
	 * @return object|null
	 */
	public static function default_chrome_item( $key ) {
		$key = sanitize_key( (string) $key );
		foreach ( self::default_misc_dnd_column_data() as $zone ) {
			if ( empty( $zone['data'] ) || ! is_array( $zone['data'] ) ) {
				continue;
			}
			foreach ( $zone['data'] as $item ) {
				if ( isset( $item['key'] ) && (string) $item['key'] === $key ) {
					return json_decode( wp_json_encode( $item ) );
				}
			}
		}
		return null;
	}

	/**
	 * @param string               $key Zone key.
	 * @param string               $label Zone label.
	 * @param array<int, mixed>    $items Chrome items.
	 * @param array<string, mixed> $desktop Extra desktop styles.
	 * @param array<string, mixed> $tablet Extra tablet styles.
	 * @param array<string, mixed> $mobile Extra mobile styles.
	 * @return array<string, mixed>
	 */
	private static function misc_zone( $key, $label, $items, $desktop, $tablet = array(), $mobile = array() ) {
		$hover = new stdClass();
		$base  = array(
			'display'  => 'flex',
			'flexFlow' => 'row',
			'float'    => 'none',
			'width'    => '100%',
			'height'   => 'auto',
		);
		return array(
			'key'      => $key,
			'label'    => $label,
			'settings' => array(
				'custom_class' => '',
				'visibility'   => array(
					'mobile'  => 'false',
					'tablet'  => 'false',
					'desktop' => 'false',
				),
			),
			'style'    => array(
				'desktop' => array(
					'default' => array_merge( $base, $desktop ),
					'hover'   => $hover,
				),
				'tablet'  => array(
					'default' => $tablet,
					'hover'   => $hover,
				),
				'mobile'  => array(
					'default' => $mobile,
					'hover'   => $hover,
				),
			),
			'data'     => $items,
		);
	}

	/**
	 * Fill empty Layout Control card/zone styles from UI Add New (BuilderLayoutData.js).
	 *
	 * @param object $layout_data Layout document.
	 * @return void
	 */
	private static function heal_dnd_chrome_from_add_new( $layout_data ) {
		$misc = isset( $layout_data->common_data->preview_template_data->misc_preview_data )
			? $layout_data->common_data->preview_template_data->misc_preview_data
			: null;
		if ( ! is_object( $misc ) || ! isset( $misc->dnd_column_data ) ) {
			return;
		}
		if ( is_object( $misc->dnd_column_data ) ) {
			$list = array();
			foreach ( $misc->dnd_column_data as $zone ) {
				$list[] = $zone;
			}
			$misc->dnd_column_data = $list;
		}
		if ( ! is_array( $misc->dnd_column_data ) ) {
			return;
		}
		$defaults = json_decode( wp_json_encode( self::default_misc_dnd_column_data() ) );
		if ( ! is_array( $defaults ) ) {
			return;
		}
		$zones = array();
		foreach ( $defaults as $zone ) {
			if ( is_object( $zone ) && isset( $zone->key ) ) {
				$zones[ (string) $zone->key ] = $zone;
			}
		}
		foreach ( $misc->dnd_column_data as $zone ) {
			if ( ! is_object( $zone ) || ! isset( $zone->key ) ) {
				continue;
			}
			$key = (string) $zone->key;
			if ( ! isset( $zones[ $key ] ) ) {
				continue;
			}
			$seed = $zones[ $key ];
			if ( isset( $zone->style ) && is_object( $zone->style ) && isset( $seed->style ) && is_object( $seed->style ) ) {
				self::merge_missing_object( $zone->style, $seed->style );
			} elseif ( ! isset( $zone->style ) && isset( $seed->style ) ) {
				$zone->style = json_decode( wp_json_encode( $seed->style ) );
			}
			if ( empty( $zone->data ) || ! is_array( $zone->data ) || empty( $seed->data ) || ! is_array( $seed->data ) ) {
				continue;
			}
			$items = array();
			foreach ( $seed->data as $item ) {
				if ( is_object( $item ) && isset( $item->key ) ) {
					$items[ (string) $item->key ] = $item;
				}
			}
			foreach ( $zone->data as $item ) {
				if ( ! is_object( $item ) || ! isset( $item->key ) ) {
					continue;
				}
				$ik = (string) $item->key;
				if ( ! isset( $items[ $ik ] ) ) {
					continue;
				}
				$seed_item = $items[ $ik ];
				if ( isset( $item->style ) && is_object( $item->style ) && isset( $seed_item->style ) && is_object( $seed_item->style ) ) {
					self::merge_missing_object( $item->style, $seed_item->style );
				} elseif ( ! isset( $item->style ) && isset( $seed_item->style ) ) {
					$item->style = json_decode( wp_json_encode( $seed_item->style ) );
				}
				if ( isset( $item->settings ) && is_object( $item->settings ) && isset( $seed_item->settings ) && is_object( $seed_item->settings ) ) {
					self::merge_missing_object( $item->settings, $seed_item->settings );
				}
			}
		}
	}

	/**
	 * @param object $target Existing object.
	 * @param object $defaults Defaults.
	 * @return void
	 */
	private static function merge_missing_object( $target, $defaults ) {
		if ( ! is_object( $target ) || ! is_object( $defaults ) ) {
			return;
		}
		foreach ( get_object_vars( $defaults ) as $key => $value ) {
			if ( ! isset( $target->$key ) ) {
				$target->$key = json_decode( wp_json_encode( $value ) );
				continue;
			}
			if ( is_object( $target->$key ) && is_object( $value ) ) {
				self::merge_missing_object( $target->$key, $value );
			}
		}
	}

	/**
	 * @param mixed             $nodes Tree.
	 * @param array<int,string> $keys Module keys.
	 * @return void
	 */
	private static function walk_fill_modules( $nodes, $keys, $tree = 'filter' ) {
		if ( ! is_array( $nodes ) ) {
			return;
		}
		foreach ( $nodes as $node ) {
			if ( ! is_object( $node ) ) {
				continue;
			}
			if ( isset( $node->type ) && 'module' === (string) $node->type ) {
				$mod_key = isset( $node->key ) ? (string) $node->key : '';
				if ( in_array( $mod_key, $keys, true ) ) {
					self::apply_builder_module_defaults( $node, null, $tree );
					if ( 'search' === $mod_key ) {
						self::heal_search_style_from_checkbox_leak( $node );
					}
					if ( 'range_slider' === $mod_key ) {
						self::heal_range_style_from_checkbox_leak( $node );
					}
					if ( 'woo_rating_filter' === $mod_key ) {
						self::heal_rating_style_from_checkbox_leak( $node );
					}
					if ( 'woo_attribute_swatch' === $mod_key ) {
						self::heal_swatch_style_from_checkbox_leak( $node );
					}
				}
			}
			if ( isset( $node->data ) ) {
				self::walk_fill_modules( $node->data, $keys, $tree );
			}
		}
	}

	/**
	 * @param object $node Node.
	 * @param array  $settings Patch.
	 * @return void
	 */
	private static function merge_settings( $node, $settings ) {
		$blocked = array( 'id', 'type', 'key', 'data', 'style', 'taxonomy', 'bind_taxonomy', 'term_ids' );
		$mod_key = isset( $node->key ) ? (string) $node->key : '';
		foreach ( $settings as $key => $value ) {
			$key = sanitize_key( (string) $key );
			if ( 'categories' === $mod_key && 'taxonomy' === $key ) {
				$node->settings->categories = sanitize_key( (string) $value );
				unset( $node->settings->taxonomy );
				continue;
			}
			if ( '' === $key || in_array( $key, $blocked, true ) ) {
				continue;
			}
			if ( null === $value ) {
				unset( $node->settings->{$key} );
				continue;
			}
			if ( in_array( $key, array( 'hide_on_desktop', 'hide_on_tablet', 'hide_on_mobile' ), true ) ) {
				$dev = str_replace( 'hide_on_', '', $key );
				if ( ! isset( $node->settings->visibility ) || ! is_object( $node->settings->visibility ) ) {
					$node->settings->visibility = (object) array(
						'mobile'  => 'false',
						'tablet'  => 'false',
						'desktop' => 'false',
					);
				}
				$node->settings->visibility->{$dev} = self::bool_word( $value );
				unset( $node->settings->{$key} );
				continue;
			}
			if ( 'label' === $key ) {
				self::merge_label_object( $node, $value );
				continue;
			}
			if ( 'is_label' === $key ) {
				if ( ! isset( $node->settings->label ) || ! is_object( $node->settings->label ) ) {
					$node->settings->label = self::default_label();
				}
				$node->settings->label->is_label = self::bool_word( $value );
				continue;
			}
			if ( 'search' === $mod_key && self::apply_search_alias( $node, $key, $value ) ) {
				continue;
			}
			if ( 'reset' === $mod_key && self::apply_reset_alias( $node, $key, $value ) ) {
				continue;
			}
			if ( 'range_slider' === $mod_key && self::apply_range_alias( $node, $key, $value ) ) {
				continue;
			}
			if ( 'woo_rating_filter' === $mod_key && self::apply_rating_alias( $node, $key, $value ) ) {
				continue;
			}
			if ( self::is_post_card_module( $mod_key, null, $node ) && self::apply_post_card_alias( $node, $key, $value ) ) {
				continue;
			}
			if ( 'pagination' === $mod_key && self::apply_pagination_alias( $node, $key, $value ) ) {
				continue;
			}
			$node->settings->{$key} = json_decode( wp_json_encode( $value ) );
			if ( 'label_text' === $key ) {
				if ( self::is_post_card_module( $mod_key, null, $node ) ) {
					unset( $node->settings->label_text );
					continue;
				}
				$text = sanitize_text_field( (string) $value );
				if ( ! isset( $node->settings->label ) || ! is_object( $node->settings->label ) ) {
					$node->settings->label = self::default_label();
				}
				$node->settings->label->value    = $text;
				$node->settings->label->is_label = 'true';
				if ( 'search' === $mod_key ) {
					$node->settings->search_label = $text;
				}
			}
			if ( 'customtext' === $key ) {
				$node->settings->customText = sanitize_text_field( (string) $value );
			}
			if ( 'label_text' === $key && 'button' === $mod_key ) {
				$node->settings->changeButtonValue = sanitize_text_field( (string) $value );
				unset( $node->settings->label_text );
			}
			if ( 'custom_field' === $key && 'search' === $mod_key ) {
				$cf = sanitize_text_field( (string) $value );
				if ( '' !== $cf && '0' !== $cf ) {
					self::search_source( $node )->custom_field = true;
				}
			}
		}
	}

	/**
	 * Map MCP search aliases onto builder nested objects. Returns true when consumed.
	 *
	 * @param object $node Node.
	 * @param string $key Setting key.
	 * @param mixed  $value Raw value.
	 * @return bool
	 */
	private static function apply_search_alias( $node, $key, $value ) {
		if ( 'placeholder' === $key ) {
			$node->settings->search_placeholder = sanitize_text_field( (string) $value );
			unset( $node->settings->placeholder );
			return true;
		}
		if ( 'voice' === $key || 'voice_search' === $key ) {
			$bag             = self::search_icon_bag( $node, 'voice_icon' );
			$bag->is_enable  = self::bool_word( $value );
			unset( $node->settings->voice, $node->settings->voice_search );
			return true;
		}
		if ( 'search_title' === $key ) {
			self::search_source( $node )->title = self::source_flag( $value );
			unset( $node->settings->search_title );
			return true;
		}
		if ( 'search_content' === $key ) {
			self::search_source( $node )->descriptions = self::source_flag( $value );
			unset( $node->settings->search_content );
			return true;
		}
		if ( 'search_everything' === $key ) {
			self::search_source( $node )->everything = self::source_flag( $value );
			unset( $node->settings->search_everything );
			return true;
		}
		if ( 'search_custom_field' === $key ) {
			self::search_source( $node )->custom_field = self::source_flag( $value );
			unset( $node->settings->search_custom_field );
			return true;
		}
		if ( 'search_icon_position' === $key ) {
			$pos = strtolower( sanitize_key( (string) $value ) );
			if ( ! in_array( $pos, array( 'left', 'right' ), true ) ) {
				$pos = 'left';
			}
			self::search_icon_bag( $node, 'search_icon' )->position = $pos;
			unset( $node->settings->search_icon_position );
			return true;
		}
		return false;
	}

	/**
	 * @param mixed $value Raw.
	 * @return bool
	 */
	private static function source_flag( $value ) {
		return 'true' === self::bool_word( $value );
	}

	/**
	 * @param object $node Node.
	 * @return object
	 */
	private static function search_source( $node ) {
		if ( ! isset( $node->settings->source ) || ! is_object( $node->settings->source ) ) {
			$node->settings->source = (object) array(
				'everything'    => false,
				'title'         => true,
				'descriptions'  => false,
				'custom_field'  => false,
			);
		}
		return $node->settings->source;
	}

	/**
	 * @param object $node Node.
	 * @param string $prop search_icon|voice_icon|clear_icon.
	 * @return object
	 */
	private static function search_icon_bag( $node, $prop ) {
		if ( ! isset( $node->settings->{$prop} ) || ! is_object( $node->settings->{$prop} ) ) {
			$node->settings->{$prop} = new stdClass();
		}
		return $node->settings->{$prop};
	}

	/**
	 * @param object $node Node.
	 * @param string $key Setting key.
	 * @param mixed  $value Raw value.
	 * @return bool
	 */
	private static function apply_reset_alias( $node, $key, $value ) {
		if ( 'label_text' === $key ) {
			$node->settings->reset_label = sanitize_text_field( (string) $value );
			unset( $node->settings->label_text );
			return true;
		}
		return false;
	}

	/**
	 * @param object $node Node.
	 * @param string $key Setting key.
	 * @param mixed  $value Raw value.
	 * @return bool
	 */
	private static function apply_range_alias( $node, $key, $value ) {
		$slider = self::range_slider_bag( $node );
		if ( 'slider_min' === $key ) {
			$slider->min = is_numeric( $value ) ? 0 + $value : 0;
			unset( $node->settings->slider_min );
			return true;
		}
		if ( 'slider_max' === $key ) {
			$slider->max = is_numeric( $value ) ? 0 + $value : 100;
			unset( $node->settings->slider_max );
			return true;
		}
		if ( 'slider_step' === $key ) {
			$step         = is_numeric( $value ) ? 0 + $value : 1;
			$slider->step = $step > 0 ? $step : 1;
			unset( $node->settings->slider_step );
			return true;
		}
		if ( 'prefix' === $key ) {
			self::set_range_affix( $slider, 'prefix', $value );
			unset( $node->settings->prefix );
			return true;
		}
		if ( 'suffix' === $key ) {
			self::set_range_affix( $slider, 'suffix', $value );
			unset( $node->settings->suffix );
			return true;
		}
		return false;
	}

	/**
	 * @param object $slider Range settings.
	 * @param string $prop prefix|suffix.
	 * @param mixed  $value Raw.
	 * @return void
	 */
	private static function set_range_affix( $slider, $prop, $value ) {
		if ( ! isset( $slider->{$prop} ) || ! is_object( $slider->{$prop} ) ) {
			$slider->{$prop} = (object) array(
				'is_enable' => 'false',
				'value'     => 'prefix' === $prop ? 'Prefix' : 'Suffix',
			);
		}
		if ( is_bool( $value ) || in_array( strtolower( (string) $value ), array( 'true', 'false', '1', '0', 'yes', 'no', 'on', 'off' ), true ) ) {
			$slider->{$prop}->is_enable = self::bool_word( $value );
			return;
		}
		$text = sanitize_text_field( (string) $value );
		$slider->{$prop}->value     = $text;
		$slider->{$prop}->is_enable = '' !== $text ? 'true' : 'false';
	}

	/**
	 * @param object $node Node.
	 * @return object
	 */
	private static function range_slider_bag( $node ) {
		if ( ! isset( $node->settings->range_slider ) || ! is_object( $node->settings->range_slider ) ) {
			$node->settings->range_slider = (object) array(
				'min'            => 0,
				'max'            => 100,
				'step'           => 1,
				'default_values' => (object) array( 'is_enable' => 'false' ),
				'prefix'         => (object) array(
					'is_enable' => 'false',
					'value'     => 'Prefix',
				),
				'suffix'         => (object) array(
					'is_enable' => 'false',
					'value'     => 'Suffix',
				),
			);
		}
		return $node->settings->range_slider;
	}

	/**
	 * @param object $node Node.
	 * @param string $key Setting key.
	 * @param mixed  $value Raw value.
	 * @return bool
	 */
	private static function apply_rating_alias( $node, $key, $value ) {
		if ( 'star_count' === $key ) {
			$n = intval( $value );
			if ( $n < 3 || $n > 10 ) {
				$n = 5;
			}
			$node->settings->star_count = (string) $n;
			return true;
		}
		return false;
	}

	/**
	 * @param object $node Node.
	 * @param string $key Setting key.
	 * @param mixed  $value Raw value.
	 * @return bool
	 */
	private static function apply_excerpt_alias( $node, $key, $value ) {
		if ( in_array( $key, array( 'excerpt_length', 'length', 'excerptlength' ), true ) ) {
			$n = intval( $value );
			if ( $n < 1 ) {
				$n = 20;
			}
			$node->settings->excerptLength = (string) $n;
			unset( $node->settings->excerpt_length, $node->settings->length, $node->settings->excerptlength );
			return true;
		}
		if ( 'html_render' === $key || 'htmlrender' === $key ) {
			$node->settings->htmlRender = self::source_flag( $value );
			unset( $node->settings->html_render, $node->settings->htmlrender );
			return true;
		}
		return false;
	}

	/**
	 * Map MCP aliases onto post image / title / excerpt / button builder keys.
	 *
	 * @param object $node Node.
	 * @param string $key Setting key (already sanitize_key).
	 * @param mixed  $value Raw value.
	 * @return bool
	 */
	private static function apply_post_card_alias( $node, $key, $value ) {
		$mod = isset( $node->key ) ? (string) $node->key : '';
		if ( 'excerpt' === $mod && self::apply_excerpt_alias( $node, $key, $value ) ) {
			return true;
		}
		if ( in_array( $mod, array( 'button', 'woo_add_to_cart' ), true ) && in_array( $key, array( 'label_text', 'button_text', 'text', 'changebuttonvalue' ), true ) ) {
			$node->settings->changeButtonValue = sanitize_text_field( (string) $value );
			unset( $node->settings->label_text, $node->settings->button_text, $node->settings->text, $node->settings->changebuttonvalue );
			return true;
		}
		if ( 'customtext' === $mod && in_array( $key, array( 'label_text', 'text', 'customtext' ), true ) ) {
			$node->settings->customText = sanitize_text_field( (string) $value );
			unset( $node->settings->label_text, $node->settings->text, $node->settings->customtext );
			return true;
		}
		if ( in_array( $mod, array( 'image', 'title', 'button', 'woo_product_image', 'woo_add_to_cart', 'categories' ), true ) && in_array( $key, array( 'link_to_post', 'enable_link', 'linktopost', 'enablelink' ), true ) ) {
			self::set_post_link_visibility( $node, self::source_flag( $value ) );
			unset( $node->settings->link_to_post, $node->settings->enable_link, $node->settings->linktopost, $node->settings->enablelink );
			return true;
		}
		if ( in_array( $mod, array( 'image', 'woo_product_image' ), true ) && ( 'placeholder' === $key || 'placeholderimage' === $key ) ) {
			$node->settings->placeholder_image = sanitize_text_field( (string) $value );
			unset( $node->settings->placeholder, $node->settings->placeholderimage );
			return true;
		}
		if ( in_array( $mod, array( 'title', 'button', 'author', 'date', 'commentcount', 'customfield', 'product_price', 'woo_product_rating', 'woo_add_to_cart', 'badges' ), true ) && in_array( $key, array( 'prefix_text', 'prefixtext' ), true ) ) {
			self::set_post_affix_text( $node, 'prefix', $value );
			unset( $node->settings->prefix_text, $node->settings->prefixtext );
			return true;
		}
		if ( in_array( $mod, array( 'title', 'button', 'author', 'date', 'commentcount', 'customfield', 'product_price', 'woo_product_rating', 'woo_add_to_cart', 'badges' ), true ) && in_array( $key, array( 'suffix_text', 'suffixtext' ), true ) ) {
			self::set_post_affix_text( $node, 'suffix', $value );
			unset( $node->settings->suffix_text, $node->settings->suffixtext );
			return true;
		}
		if ( 'date' === $mod && ( 'format' === $key || 'dateformat' === $key ) ) {
			$node->settings->date_format = sanitize_text_field( (string) $value );
			unset( $node->settings->format, $node->settings->dateformat );
			return true;
		}
		if ( 'customfield' === $mod && in_array( $key, array( 'custom_field_key', 'meta_key', 'customfieldkey' ), true ) ) {
			$node->settings->custom_field = sanitize_text_field( (string) $value );
			unset( $node->settings->custom_field_key, $node->settings->meta_key, $node->settings->customfieldkey );
			return true;
		}
		if ( 'categories' === $mod && in_array( $key, array( 'taxonomy', 'term_taxonomy' ), true ) ) {
			$node->settings->categories = sanitize_key( (string) $value );
			unset( $node->settings->taxonomy, $node->settings->term_taxonomy );
			return true;
		}
		if ( 'author' === $mod && in_array( $key, array( 'show_avatar', 'avatar' ), true ) ) {
			$node->settings->avatar_status = self::bool_word( $value );
			unset( $node->settings->show_avatar, $node->settings->avatar );
			return true;
		}
		if ( 'badges' === $mod && ( 'type' === $key || 'badgetype' === $key ) ) {
			$node->settings->badge_type = sanitize_key( (string) $value );
			unset( $node->settings->type, $node->settings->badgetype );
			return true;
		}
		if ( in_array( $mod, array( 'title', 'image' ), true ) && 'label_text' === $key ) {
			unset( $node->settings->label_text );
			return true;
		}
		if ( self::apply_post_affix_alias( $node, $key, $value ) ) {
			return true;
		}
		if ( self::apply_post_link_alias( $node, $key, $value ) ) {
			return true;
		}
		if ( in_array( $mod, array( 'image', 'woo_product_image' ), true ) && in_array( $key, array( 'image_source', 'imagesource' ), true ) ) {
			$src = sanitize_key( (string) $value );
			if ( 'customfield' === $src || 'custom-field' === $src ) {
				$src = 'custom_field';
			}
			if ( 'featured' === $src || 'featuredimage' === $src ) {
				$src = 'featured_image';
			}
			if ( ! in_array( $src, array( 'featured_image', 'custom_field', 'gallery' ), true ) ) {
				$src = 'featured_image';
			}
			if ( 'gallery' === $src && 'woo_product_image' !== $mod ) {
				$src = 'featured_image';
			}
			$node->settings->image_source = $src;
			unset( $node->settings->imagesource );
			return true;
		}
		if ( 'woo_product_image' === $mod && in_array( $key, array( 'gallery_image_limit', 'galleryimagelimit', 'gallery_limit' ), true ) ) {
			$n = intval( $value );
			if ( $n < 1 ) {
				$n = 2;
			}
			$node->settings->gallery_image_limit = (string) $n;
			unset( $node->settings->galleryimagelimit, $node->settings->gallery_limit );
			return true;
		}
		if ( 'author' === $mod && in_array( $key, array( 'avatar_type', 'avatartype' ), true ) ) {
			$node->settings->avatar_type = sanitize_key( (string) $value );
			unset( $node->settings->avatartype );
			return true;
		}
		if ( 'date' === $mod && in_array( $key, array( 'custom_format', 'customformat' ), true ) ) {
			$node->settings->custom_format = sanitize_text_field( (string) $value );
			$node->settings->date_format   = 'custom';
			unset( $node->settings->customformat );
			return true;
		}
		if ( 'categories' === $mod && 'separator' === $key ) {
			$sep = (string) $value;
			$node->settings->separator = in_array( $sep, array( 'none', ',' ), true ) ? $sep : sanitize_text_field( $sep );
			return true;
		}
		if ( 'categories' === $mod && in_array( $key, array( 'last_separator', 'lastseparator' ), true ) ) {
			$node->settings->last_separator = self::source_flag( $value );
			unset( $node->settings->lastseparator );
			return true;
		}
		if ( 'product_price' === $mod && in_array( $key, array( 'show_price', 'showprice', 'price_display' ), true ) ) {
			$mode = sanitize_key( (string) $value );
			if ( 'lowest' === $mode ) {
				$mode = 'lowest_price';
			}
			if ( 'highest' === $mode ) {
				$mode = 'highest_price';
			}
			if ( ! in_array( $mode, array( 'default', 'regular', 'sale', 'lowest_price', 'highest_price' ), true ) ) {
				$mode = 'default';
			}
			$node->settings->show_price = $mode;
			unset( $node->settings->showprice, $node->settings->price_display );
			return true;
		}
		if ( 'woo_product_rating' === $mod && in_array( $key, array( 'rating_display', 'ratingdisplay' ), true ) ) {
			$mode = sanitize_key( (string) $value );
			if ( 'average' === $mode || 'number' === $mode || 'averagevalue' === $mode ) {
				$mode = 'average_value';
			}
			if ( 'star' === $mode ) {
				$mode = 'stars';
			}
			$node->settings->rating_display = in_array( $mode, array( 'stars', 'average_value' ), true ) ? $mode : 'stars';
			unset( $node->settings->ratingdisplay );
			return true;
		}
		if ( 'woo_add_to_cart' === $mod && self::apply_atc_alias( $node, $key, $value ) ) {
			return true;
		}
		if ( 'badges' === $mod && in_array( $key, array( 'badge_text', 'badgetext', 'custom_text' ), true ) ) {
			$type = isset( $node->settings->badge_type ) ? (string) $node->settings->badge_type : 'sale';
			if ( ! isset( $node->settings->badge_settings ) || ! is_object( $node->settings->badge_settings ) ) {
				$node->settings->badge_settings = new stdClass();
			}
			if ( ! isset( $node->settings->badge_settings->{$type} ) || ! is_object( $node->settings->badge_settings->{$type} ) ) {
				$node->settings->badge_settings->{$type} = new stdClass();
			}
			$node->settings->badge_settings->{$type}->text_source = 'custom';
			$node->settings->badge_settings->{$type}->custom_text = sanitize_text_field( (string) $value );
			unset( $node->settings->badge_text, $node->settings->badgetext, $node->settings->custom_text );
			return true;
		}
		return false;
	}

	/**
	 * Prefix / suffix Settings (enable, text vs icon, FA class).
	 *
	 * @param object $node Node.
	 * @param string $key  Setting key.
	 * @param mixed  $value Raw.
	 * @return bool
	 */
	private static function apply_post_affix_alias( $node, $key, $value ) {
		$mod = isset( $node->key ) ? (string) $node->key : '';
		$affix_mods = array( 'title', 'button', 'author', 'date', 'commentcount', 'customfield', 'product_price', 'woo_product_rating', 'woo_add_to_cart', 'badges' );
		if ( ! in_array( $mod, $affix_mods, true ) ) {
			return false;
		}
		foreach ( array( 'prefix', 'suffix' ) as $which ) {
			if ( $key === $which . '_enable' || $key === $which . 'enable' ) {
				$bag             = self::ensure_post_affix( $node, $which );
				$bag->is_enable  = self::bool_word( $value );
				unset( $node->settings->{$which . '_enable'}, $node->settings->{$which . 'enable'} );
				return true;
			}
			if ( $key === $which . '_type' || $key === $which . 'type' ) {
				$bag  = self::ensure_post_affix( $node, $which );
				$type = sanitize_key( (string) $value );
				if ( 'author' !== $mod && 'avatar' === $type ) {
					$type = 'text';
				}
				if ( ! in_array( $type, array( 'text', 'icon', 'avatar' ), true ) ) {
					$type = 'text';
				}
				$bag->meta_type = $type;
				$bag->is_enable = 'true';
				unset( $node->settings->{$which . '_type'}, $node->settings->{$which . 'type'} );
				return true;
			}
			if ( $key === $which . '_icon' || $key === $which . 'icon' ) {
				$bag = self::ensure_post_affix( $node, $which );
				if ( ! isset( $bag->icons ) || ! is_object( $bag->icons ) ) {
					$bag->icons = new stdClass();
				}
				$bag->icons->visibility = true;
				$bag->icons->type       = 'icon';
				$bag->icons->icon       = sanitize_text_field( (string) $value );
				$bag->meta_type         = 'icon';
				$bag->is_enable         = 'true';
				unset( $node->settings->{$which . '_icon'}, $node->settings->{$which . 'icon'} );
				return true;
			}
			if ( $key === $which . '_text_visibility' || $key === $which . 'textvisibility' ) {
				$bag  = self::ensure_post_affix( $node, $which );
				$mode = sanitize_key( (string) $value );
				if ( 'simple' === $mode ) {
					$mode = 'simple_products';
				}
				if ( 'variable' === $mode ) {
					$mode = 'variable_products';
				}
				if ( 'grouped' === $mode ) {
					$mode = 'grouped_products';
				}
				if ( ! in_array( $mode, array( 'all', 'simple_products', 'variable_products', 'grouped_products' ), true ) ) {
					$mode = 'all';
				}
				$bag->text_visibility = $mode;
				unset( $node->settings->{$which . '_text_visibility'}, $node->settings->{$which . 'textvisibility'} );
				return true;
			}
			if ( $key === $which . '_count_separator' || $key === $which . 'countseparator' ) {
				$bag  = self::ensure_post_affix( $node, $which );
				$sep  = sanitize_key( (string) $value );
				$bag->count_separator = in_array( $sep, array( 'none', 'brackets', 'hyphen', 'slash' ), true ) ? $sep : 'none';
				unset( $node->settings->{$which . '_count_separator'}, $node->settings->{$which . 'countseparator'} );
				return true;
			}
		}
		return false;
	}

	/**
	 * Link Settings (enable, Post URL vs custom field, open in).
	 *
	 * @param object $node Node.
	 * @param string $key  Setting key.
	 * @param mixed  $value Raw.
	 * @return bool
	 */
	private static function apply_post_link_alias( $node, $key, $value ) {
		$mod = isset( $node->key ) ? (string) $node->key : '';
		if ( ! in_array( $mod, array( 'image', 'title', 'button', 'woo_product_image', 'woo_add_to_cart', 'categories' ), true ) ) {
			return false;
		}
		$link = self::ensure_post_link( $node );
		if ( in_array( $key, array( 'link_type', 'linktype' ), true ) ) {
			$type = strtolower( trim( (string) $value ) );
			$type = str_replace( '_', '-', $type );
			if ( in_array( $type, array( 'custom-url', 'customurl', 'custom-field', 'customfield', 'cf' ), true ) ) {
				$type = 'custom-url';
			} else {
				$type = 'post-url';
			}
			$link->type       = $type;
			$link->visibility = true;
			unset( $node->settings->link_type, $node->settings->linktype );
			return true;
		}
		if ( in_array( $key, array( 'link_url', 'linkurl', 'customlink', 'custom_url' ), true ) ) {
			$raw              = (string) $value;
			$link->customlink = function_exists( 'esc_url_raw' ) ? esc_url_raw( $raw ) : sanitize_text_field( $raw );
			$link->visibility = true;
			if ( empty( $link->type ) || 'post-url' === $link->type ) {
				$link->type = 'custom-url';
			}
			unset( $node->settings->link_url, $node->settings->linkurl, $node->settings->customlink, $node->settings->custom_url );
			return true;
		}
		if ( in_array( $key, array( 'link_target', 'linktarget', 'open_in' ), true ) ) {
			$target = strtolower( str_replace( '_', '-', (string) $value ) );
			if ( in_array( $target, array( 'new-tab', 'new', 'blank', '_blank', 'new-window' ), true ) ) {
				$target = 'new-tab';
			} else {
				$target = 'same-tab';
			}
			$link->target     = $target;
			$link->visibility = true;
			unset( $node->settings->link_target, $node->settings->linktarget, $node->settings->open_in );
			return true;
		}
		if ( in_array( $key, array( 'link_custom_field', 'linkcustomfield', 'link_meta' ), true ) ) {
			$link->custom_field = sanitize_text_field( (string) $value );
			$link->type         = 'custom-url';
			$link->visibility   = true;
			unset( $node->settings->link_custom_field, $node->settings->linkcustomfield, $node->settings->link_meta );
			return true;
		}
		return false;
	}

	/**
	 * @param object $node Node.
	 * @param string $key  Setting key.
	 * @param mixed  $value Raw.
	 * @return bool
	 */
	private static function apply_atc_alias( $node, $key, $value ) {
		if ( in_array( $key, array( 'atc_behaviour', 'atcbehaviour', 'ajax' ), true ) ) {
			if ( 'ajax' === $key ) {
				$node->settings->atc_behaviour = self::source_flag( $value ) ? 'ajax' : 'product_page';
			} else {
				$mode = sanitize_key( (string) $value );
				$node->settings->atc_behaviour = ( 'product_page' === $mode || 'productpage' === $mode ) ? 'product_page' : 'ajax';
			}
			unset( $node->settings->atcbehaviour, $node->settings->ajax );
			return true;
		}
		if ( in_array( $key, array( 'after_atc', 'afteratc' ), true ) ) {
			$mode = sanitize_key( (string) $value );
			if ( 'custom' === $mode ) {
				$mode = 'custom_text';
			}
			if ( ! in_array( $mode, array( 'none', 'cart', 'checkout', 'custom_text' ), true ) ) {
				$mode = 'none';
			}
			$node->settings->after_atc = $mode;
			unset( $node->settings->afteratc );
			return true;
		}
		if ( in_array( $key, array( 'after_atc_text', 'afteratctext' ), true ) ) {
			$node->settings->after_atc_text = sanitize_text_field( (string) $value );
			$node->settings->after_atc      = 'custom_text';
			unset( $node->settings->afteratctext );
			return true;
		}
		if ( in_array( $key, array( 'button_text_mode', 'buttontextmode' ), true ) ) {
			$mode = sanitize_key( (string) $value );
			if ( 'icon' === $mode ) {
				$mode = 'icon_only';
			}
			if ( 'type' === $mode || 'by_type' === $mode ) {
				$mode = 'by_product_type';
			}
			if ( ! in_array( $mode, array( 'woo_default', 'custom', 'icon_only', 'by_product_type' ), true ) ) {
				$mode = 'woo_default';
			}
			$node->settings->button_text_mode = $mode;
			unset( $node->settings->buttontextmode );
			return true;
		}
		return false;
	}

	/**
	 * @param object $node Node.
	 * @param string $which prefix|suffix.
	 * @return object
	 */
	private static function ensure_post_affix( $node, $which ) {
		if ( ! isset( $node->settings->{$which} ) || ! is_object( $node->settings->{$which} ) ) {
			$node->settings->{$which} = self::default_post_affix( 'false', 'text', 'prefix' === $which ? 'Prefix' : 'Suffix' );
		}
		return $node->settings->{$which};
	}

	/**
	 * @param object $node Node.
	 * @return object
	 */
	private static function ensure_post_link( $node ) {
		if ( ! isset( $node->settings->link ) || ! is_object( $node->settings->link ) ) {
			$node->settings->link = self::default_post_link( false, 'post-url' );
		}
		return $node->settings->link;
	}

	/**
	 * @param object $node Node.
	 * @param string $key Setting key.
	 * @param mixed  $value Raw value.
	 * @return bool
	 */
	private static function apply_pagination_alias( $node, $key, $value ) {
		if ( 'load_more_text' === $key || 'loadmoretext' === $key ) {
			if ( ! isset( $node->settings->load_more ) || ! is_object( $node->settings->load_more ) ) {
				$node->settings->load_more = (object) array( 'text' => 'Load More' );
			}
			$node->settings->load_more->text = sanitize_text_field( (string) $value );
			unset( $node->settings->load_more_text, $node->settings->loadmoretext );
			return true;
		}
		if ( in_array( $key, array( 'prev_text', 'prevtext' ), true ) ) {
			if ( ! isset( $node->settings->prev ) || ! is_object( $node->settings->prev ) ) {
				$node->settings->prev = new stdClass();
			}
			$node->settings->prev->text = sanitize_text_field( (string) $value );
			$node->settings->prev->type = 'text';
			unset( $node->settings->prev_text, $node->settings->prevtext );
			return true;
		}
		if ( in_array( $key, array( 'next_text', 'nexttext' ), true ) ) {
			if ( ! isset( $node->settings->next ) || ! is_object( $node->settings->next ) ) {
				$node->settings->next = new stdClass();
			}
			$node->settings->next->text = sanitize_text_field( (string) $value );
			$node->settings->next->type = 'text';
			unset( $node->settings->next_text, $node->settings->nexttext );
			return true;
		}
		return false;
	}

	/**
	 * @param object $node Node.
	 * @param bool   $on Link on.
	 * @return void
	 */
	private static function set_post_link_visibility( $node, $on ) {
		if ( ! isset( $node->settings->link ) || ! is_object( $node->settings->link ) ) {
			$node->settings->link = self::default_post_link( $on, $on ? 'post-url' : '' );
			return;
		}
		$node->settings->link->visibility = $on;
		if ( $on ) {
			if ( empty( $node->settings->link->type ) ) {
				$node->settings->link->type = 'post-url';
			}
			if ( '' === (string) $node->settings->link->target ) {
				$node->settings->link->target = 'same-tab';
			}
		}
	}

	/**
	 * @param object $node Node.
	 * @param string $which prefix|suffix.
	 * @param mixed  $value Text.
	 * @return void
	 */
	private static function set_post_affix_text( $node, $which, $value ) {
		$text = sanitize_text_field( (string) $value );
		if ( ! isset( $node->settings->{$which} ) || ! is_object( $node->settings->{$which} ) ) {
			$node->settings->{$which} = self::default_post_affix( 'true', 'text', $text );
			return;
		}
		$node->settings->{$which}->is_enable = 'true';
		$node->settings->{$which}->meta_type = 'text';
		$node->settings->{$which}->meta_text = $text;
	}

	/**
	 * @param string $key Module key.
	 * @return bool
	 */
	private static function is_post_card_module( $key, $tree = null, $node = null ) {
		$key = (string) $key;
		if ( 'customtext' === $key ) {
			if ( 'post' === $tree ) {
				return true;
			}
			if ( 'filter' === $tree ) {
				return false;
			}
			return is_object( $node ) && isset( $node->style ) && is_object( $node->style )
				&& isset( $node->style->desktop ) && ! isset( $node->style->container );
		}
		return in_array( $key, self::POST_CARD_MODULES, true );
	}

	/**
	 * @param object $doc Layout.
	 * @return object
	 */
	private static function make_row( $doc, $tree = 'filter' ) {
		$found = self::find_type( self::tree_data( $doc, $tree ), 'row' );
		if ( $found ) {
			$copy       = json_decode( wp_json_encode( $found ) );
			$copy->data = array();
			unset( $copy->id );
			return $copy;
		}
		$row           = new stdClass();
		$row->type     = 'row';
		$row->settings = self::default_frame_settings();
		$row->style    = self::empty_root_style();
		$row->data     = array();
		return $row;
	}

	/**
	 * @param object $doc Layout.
	 * @return object
	 */
	private static function make_column( $doc, $tree = 'filter' ) {
		$row = self::find_type( self::tree_data( $doc, $tree ), 'row' );
		$col = null;
		if ( $row && isset( $row->data ) && is_array( $row->data ) ) {
			foreach ( $row->data as $child ) {
				if ( is_object( $child ) && isset( $child->type ) && 'column' === $child->type ) {
					$col = $child;
					break;
				}
			}
		}
		if ( $col ) {
			$copy       = json_decode( wp_json_encode( $col ) );
			$copy->data = array();
			unset( $copy->id );
			return $copy;
		}
		$column           = new stdClass();
		$column->type     = 'column';
		$column->settings = self::default_frame_settings();
		$column->style    = self::empty_root_style();
		$column->data     = array();
		return $column;
	}

	/**
	 * @param object $doc Layout.
	 * @param string $key Module key.
	 * @return object
	 */
	private static function make_module( $doc, $key, $tree = 'filter' ) {
		$found = self::find_module_key( self::tree_data( $doc, $tree ), $key );
		if ( $found ) {
			$copy = json_decode( wp_json_encode( $found ) );
			unset( $copy->id );
			if ( isset( $copy->settings->taxonomy_data ) ) {
				$copy->settings->taxonomy_data = array();
			}
			self::apply_builder_module_defaults( $copy, $doc, $tree );
			return $copy;
		}
		$module           = new stdClass();
		$module->type     = 'module';
		$module->key      = $key;
		$module->title    = $key;
		$module->settings = self::default_module_settings( $key, $tree );
		$module->style    = self::default_module_style( $key, $tree );
		$module->data     = array();
		self::apply_builder_module_defaults( $module, $doc, $tree );
		return $module;
	}

	/**
	 * @return object
	 */
	private static function default_frame_settings() {
		return (object) array(
			'collapse_status' => 'false',
			'custom_class'    => '',
			'admin_label'     => '',
			'visibility'      => (object) array(
				'mobile'  => 'false',
				'tablet'  => 'false',
				'desktop' => 'false',
			),
		);
	}

	/**
	 * @param string $key Module key.
	 * @return object
	 */
	private static function default_module_settings( $key, $tree = 'filter' ) {
		$vis = (object) array(
			'mobile'  => 'false',
			'tablet'  => 'false',
			'desktop' => 'false',
		);
		$label = self::default_label();
		$base = array(
			'custom_class' => '',
			'admin_label'  => '',
			'visibility'   => $vis,
		);
		if ( 'search' === $key ) {
			return (object) array_merge(
				$base,
				array(
					'search_label'       => 'Search',
					'search_placeholder' => 'Search...',
					'search_trigger'     => 'enter_icon',
					'smart_ai_search'    => (object) array( 'is_enable' => 'false' ),
					'keyword_search'     => (object) array( 'is_enable' => 'true' ),
					'custom_field'       => '0',
					'char_limit'         => (object) array(
						'is_enable' => 'false',
						'limit'     => '3',
					),
					'source'             => (object) array(
						'everything'   => false,
						'title'        => true,
						'descriptions' => false,
						'custom_field' => false,
					),
					'search_icon'        => (object) array(
						'is_enable' => 'true',
						'position'  => 'left',
						'icon'      => '',
						'type'      => 'icon',
					),
					'voice_icon'         => (object) array(
						'is_enable'   => 'false',
						'position'    => 'right',
						'icon'        => '',
						'type'        => 'icon',
						'placeholder' => 'Listening Now...',
					),
					'clear_icon'         => (object) array(
						'is_enable'  => 'true',
						'position'   => 'right',
						'icon'       => '',
						'type'       => 'icon',
						'visibility' => 'type',
					),
					'label'              => $label,
					'enable_toggle'      => 'false',
					'toggle_position'    => 'right',
					'close_toggle'       => 'false',
					'taxonomy_data'      => array(),
					'predefined_terms'   => array(),
					'cf_predefined_terms'=> array(),
				)
			);
		}
		if ( 'reset' === $key ) {
			return (object) array_merge(
				$base,
				array(
					'label'                => (object) array(
						'is_label' => 'false',
						'value'    => 'Label',
					),
					'reset_label'          => 'Reset Filters',
					'icons'                => (object) array(
						'visibility' => true,
						'icon'       => 'fas fa-redo',
						'type'       => 'icon',
					),
					'taxonomy_data'        => array(),
					'predefined_terms'     => array(),
					'cf_predefined_terms'  => array(),
				)
			);
		}
		if ( 'customtext' === $key ) {
			return (object) array_merge(
				$base,
				array(
					'customText'       => 'post' === $tree ? '' : 'Custom Text',
					'background_image' => '',
					'icons'            => (object) array(
						'visibility' => false,
						'icon'       => '',
						'position'   => 'before-customtext',
						'type'       => 'icon',
					),
				)
			);
		}
		if ( 'range_slider' === $key ) {
			$range_label        = json_decode( wp_json_encode( $label ) );
			$range_label->value = 'Range Slider';
			return (object) array_merge(
				$base,
				array(
					'label'               => $range_label,
					'data_source'         => 'custom_field',
					'custom_field_data'   => array(
						(object) array(
							'custom_field_key'        => '0',
							'custom_field_value_list' => array(),
							'compare_operator'        => '=',
							'meta_type'               => 'CHAR',
						),
					),
					'range_slider'        => (object) array(
						'min'            => 0,
						'max'            => 100,
						'step'           => 1,
						'default_values' => (object) array( 'is_enable' => 'false' ),
						'prefix'         => (object) array(
							'is_enable' => 'false',
							'value'     => 'Prefix',
						),
						'suffix'         => (object) array(
							'is_enable' => 'false',
							'value'     => 'Suffix',
						),
					),
					'enable_toggle'       => 'false',
					'toggle_position'     => 'right',
					'close_toggle'        => 'false',
					'taxonomy_data'       => array(),
					'predefined_terms'    => array(),
					'cf_predefined_terms' => array(),
				)
			);
		}
		if ( 'woo_rating_filter' === $key ) {
			$rating_label        = json_decode( wp_json_encode( $label ) );
			$rating_label->value = 'Star rating';
			return (object) array_merge(
				$base,
				array(
					'label'            => $rating_label,
					'show_checkbox'    => 'false',
					'show_icon'        => 'false',
					'show_count'       => 'false',
					'multiple_term'    => 'false',
					'enable_toggle'    => 'false',
					'toggle_position'  => 'right',
					'close_toggle'     => 'false',
					'rating_display'   => 'stars',
					'star_count'       => '5',
					'rating_compare'   => 'gte',
					'default_value'    => '',
				)
			);
		}
		if ( 'title' === $key ) {
			return (object) array_merge(
				$base,
				array(
					'background_image' => '',
					'link'             => self::default_post_link( false, '' ),
					'prefix'           => self::default_post_affix( 'false', 'text', 'Prefix' ),
					'suffix'           => self::default_post_affix( 'false', 'text', 'Suffix' ),
				)
			);
		}
		if ( 'image' === $key || 'woo_product_image' === $key ) {
			$image = array(
				'background_image'  => '',
				'image_size'        => 'medium_large',
				'placeholder_image' => '',
				'image_source'      => 'featured_image',
				'custom_field'      => '0',
				'link'              => self::default_post_link( false, 'post-url' ),
			);
			if ( 'woo_product_image' === $key ) {
				$image['gallery_image_limit'] = '2';
				$image['auto_scroll']         = 'false';
				$image['auto_scroll_delay']   = '1000';
			}
			return (object) array_merge( $base, $image );
		}
		if ( 'excerpt' === $key ) {
			return (object) array_merge(
				$base,
				array(
					'background_image' => '',
					'excerptLength'    => '20',
					'htmlRender'       => false,
				)
			);
		}
		if ( 'button' === $key ) {
			return (object) array_merge(
				$base,
				array(
					'background_image'   => '',
					'changeButtonValue'  => 'Read More',
					'link'               => self::default_post_link( true, 'post-url' ),
					'prefix'             => self::default_post_affix( 'false', 'text', 'Prefix' ),
					'suffix'             => self::default_post_affix( 'true', 'icon', 'Suffix', 'fas fa-arrow-right' ),
				)
			);
		}
		if ( 'author' === $key ) {
			return (object) array_merge(
				$base,
				array(
					'background_image' => '',
					'icons'            => (object) array(
						'visibility' => true,
						'icon'       => 'far fa-user',
						'position'   => 'before-author',
						'type'       => 'icon',
					),
					'avatar_status'    => 'true',
					'avatar_type'      => 'default',
					'prefix'           => self::default_post_affix( 'true', 'text', 'By', 'fas fa-tag', true ),
					'suffix'           => self::default_post_affix( 'false', 'icon', 'Suffix', 'fas fa-tag', true ),
				)
			);
		}
		if ( 'date' === $key ) {
			return (object) array_merge(
				$base,
				array(
					'background_image' => '',
					'date_format'      => 'F j, Y',
					'prefix'           => self::default_post_affix( 'false', 'text', 'Prefix' ),
					'suffix'           => self::default_post_affix( 'false', 'text', 'Suffix' ),
				)
			);
		}
		if ( 'commentcount' === $key ) {
			return (object) array_merge(
				$base,
				array(
					'background_image' => '',
					'prefix'           => self::default_post_affix( 'false', 'text', 'Prefix' ),
					'suffix'           => self::default_post_affix( 'true', 'text', 'Comments' ),
				)
			);
		}
		if ( 'categories' === $key ) {
			return (object) array_merge(
				$base,
				array(
					'background_image' => '',
					'limit'            => 2,
					'separator'        => 'none',
					'last_separator'   => false,
					'link'             => (object) array(
						'visibility' => false,
						'target'     => 'same-tab',
					),
					'categories'       => '0',
				)
			);
		}
		if ( 'customfield' === $key ) {
			return (object) array_merge(
				$base,
				array(
					'background_image' => '',
					'custom_field'     => '0',
					'prefix'           => self::default_post_affix( 'true', 'text', 'Prefix' ),
					'suffix'           => self::default_post_affix( 'true', 'text', 'Suffix' ),
				)
			);
		}
		if ( 'product_price' === $key ) {
			$price_affix = self::default_post_affix( 'false', 'regular_price', 'Prefix', '', false, array( 'text_visibility' => 'all' ) );
			return (object) array_merge(
				$base,
				array(
					'background_image' => '',
					'show_price'       => 'default',
					'prefix'           => $price_affix,
					'suffix'           => self::default_post_affix( 'false', 'regular_price', 'Suffix', '', false, array( 'text_visibility' => 'all' ) ),
				)
			);
		}
		if ( 'woo_product_rating' === $key ) {
			$rating_affix = self::default_post_affix( 'false', 'text', 'Prefix', '', false, array( 'count_separator' => 'none' ) );
			return (object) array_merge(
				$base,
				array(
					'background_image' => '',
					'rating_display'   => 'stars',
					'prefix'           => $rating_affix,
					'suffix'           => self::default_post_affix( 'false', 'text', 'Suffix', '', false, array( 'count_separator' => 'none' ) ),
				)
			);
		}
		if ( 'woo_attribute_swatch' === $key ) {
			$swatch_label           = json_decode( wp_json_encode( $label ) );
			$swatch_label->is_label = 'false';
			return (object) array_merge(
				$base,
				array(
					'taxonomy_data'       => array(),
					'taxonomy_relation'   => 'OR',
					'category_relation'   => 'OR',
					'meta_relation'       => 'IN',
					'predefined_terms'    => array(),
					'cf_predefined_terms' => array(),
					'label'               => $swatch_label,
					'multiple_term'       => 'false',
					'show_checkbox'       => 'false',
					'show_icon'           => 'true',
					'term_visual'         => 'icon',
					'hide_term_label'     => 'true',
					'show_count'          => 'false',
					'count_separator'     => 'brackets',
					'enable_toggle'       => 'false',
					'toggle_position'     => 'right',
					'close_toggle'        => 'false',
					'data_source'         => 'taxonomy',
					'custom_field_data'   => array(),
				)
			);
		}
		if ( 'woo_add_to_cart' === $key ) {
			return (object) array_merge(
				$base,
				array(
					'background_image'    => '',
					'changeButtonValue'   => 'Add to cart',
					'button_text_mode'    => 'woo_default',
					'button_text_type_key'=> 'simple',
					'button_text_by_type' => (object) array(
						'simple'       => 'Add to cart',
						'variable'     => 'Select options',
						'grouped'      => 'View products',
						'external'     => 'Buy product',
						'subscription' => 'Subscribe',
					),
					'button_icon'         => (object) array(
						'icons' => (object) array(
							'visibility' => true,
							'icon'       => 'fas fa-shopping-cart',
							'type'       => 'icon',
							'position'   => 'before-button',
						),
					),
					'atc_behaviour'       => 'ajax',
					'after_atc'           => 'none',
					'after_atc_text'      => 'Added',
					'link'                => self::default_post_link( true, 'post-url' ),
					'prefix'              => self::default_post_affix( 'false', 'text', 'Prefix' ),
					'suffix'              => self::default_post_affix( 'false', 'icon', 'Suffix', 'fas fa-shopping-cart', false ),
				)
			);
		}
		if ( 'badges' === $key ) {
			return (object) array_merge(
				$base,
				array(
					'background_image' => '',
					'badge_type'       => 'sale',
					'badge_settings'   => (object) array(
						'sale'              => (object) array(
							'text_source' => 'default',
							'custom_text' => 'Sale',
						),
						'featured'          => (object) array(
							'text_source' => 'default',
							'custom_text' => 'Featured',
						),
						'new'               => (object) array(
							'text_source' => 'default',
							'custom_text' => 'New',
							'condition'   => 'default',
							'days'        => 30,
						),
						'stock_status_text' => (object) array(
							'display'     => 'current',
							'text_source' => 'default',
							'custom_text' => 'In stock',
						),
						'stock_quantity'    => (object) array(
							'low_stock_threshold_enable' => 'false',
							'show_when_quantity'         => 5,
						),
						'discount'          => (object) array(
							'discount_type' => 'percentage',
						),
						'best_seller'       => (object) array(
							'text_source'    => 'default',
							'custom_text'    => 'Best Seller',
							'min_sale'       => 'default',
							'min_sale_count' => 1,
						),
					),
					'prefix'           => self::default_post_affix( 'false', 'text', 'Prefix' ),
					'suffix'           => self::default_post_affix( 'false', 'text', 'Suffix' ),
				)
			);
		}
		if ( 'pagination' === $key ) {
			return (object) array_merge(
				$base,
				array(
					'is_enable'       => 'true',
					'posts_per_page'  => '9',
					'pagination_type' => 'number2',
					'ellipsis'        => (object) array(
						'is_enable' => 'true',
						'value'     => '...',
					),
					'load_more'       => (object) array(
						'text'        => 'Load More',
						'icon_enable' => 'true',
						'icons'       => (object) array(
							'visibility' => true,
							'icon'       => 'fas fa-arrow-right',
							'type'       => 'icon',
						),
					),
					'prev'            => (object) array(
						'text'  => 'Previous',
						'type'  => 'icon',
						'icons' => (object) array(
							'visibility' => true,
							'icon'       => 'fas fa-long-arrow-alt-left',
							'type'       => 'icon',
						),
					),
					'next'            => (object) array(
						'text'  => 'Next',
						'type'  => 'icon',
						'icons' => (object) array(
							'visibility' => true,
							'icon'       => 'fas fa-long-arrow-alt-right',
							'type'       => 'icon',
						),
					),
				)
			);
		}
		$tax = array(
			'taxonomy_data'               => array(),
			'taxonomy_relation'           => 'OR',
			'category_relation'           => 'OR',
			'meta_relation'               => 'IN',
			'predefined_terms'            => array(),
			'cf_predefined_terms'         => array(),
			'label'                       => $label,
			'multiple_term'               => 'false',
			'show_checkbox'               => 'checkbox_filter' === $key ? 'true' : 'false',
			'show_icon'                   => 'false',
			'term_visual'                 => 'icon',
			'hide_term_label'             => 'false',
			'term_label_display'          => 'show',
			'show_count'                  => 'false',
			'count_separator'             => 'brackets',
			'term_show_more'              => 'false',
			'term_visible_limit'          => '10',
			'show_more_label'             => 'Show more',
			'show_less_label'             => 'Show less',
			'show_more_count'             => 'true',
			'show_more_count_separator'   => 'brackets',
			'show_more_count_prefix'      => '',
			'show_more_count_suffix'      => '',
			'enable_toggle'               => 'false',
			'toggle_position'             => 'right',
			'close_toggle'                => 'false',
			'data_source'                 => 'taxonomy',
			'custom_field_data'           => array(),
		);
		if ( 'dropdown_filter' === $key ) {
			$tax['dropdown_data'] = (object) array(
				'icons'      => (object) array(
					'icon_switch'    => true,
					'active_icon'    => 'fas fa-arrow-up',
					'inactive_icon'  => '',
					'active_type'    => 'icon',
					'inactive_type'  => 'icon',
					'position'       => 'right',
				),
				'all_option' => (object) array(
					'value'     => 'All',
					'is_enable' => 'false',
					'icons'     => (object) array(
						'visibility' => false,
						'icon'       => '',
						'type'       => 'icon',
					),
				),
			);
		}
		return (object) array_merge( $base, $tax );
	}

	/**
	 * Match NewModulePopUp checkbox/dropdown heading defaults.
	 *
	 * @return object
	 */
	private static function default_label() {
		return (object) array(
			'is_label' => 'true',
			'value'    => 'Label',
			'icons'    => (object) array(
				'visibility' => false,
				'icon'       => '',
				'position'   => 'before-label',
				'type'       => 'icon',
			),
		);
	}

	/**
	 * @param bool   $visible Link on.
	 * @param string $type post-url or empty.
	 * @return object
	 */
	private static function default_post_link( $visible, $type ) {
		$on = (bool) $visible;
		return (object) array(
			'visibility'   => $on,
			'type'         => (string) $type,
			'customlink'   => '',
			'target'       => $on || 'post-url' === $type ? 'same-tab' : '',
			'condition'    => $on ? '' : ( 'post-url' === $type ? false : '' ),
			'custom_field' => '0',
		);
	}

	/**
	 * @param string               $enabled true|false.
	 * @param string               $meta_type text|icon|regular_price.
	 * @param string               $text Affix label.
	 * @param string               $icon FA class when icon.
	 * @param bool|null            $icon_visible Override icon visibility.
	 * @param array<string, mixed> $extra Extra keys (text_visibility, count_separator).
	 * @return object
	 */
	private static function default_post_affix( $enabled, $meta_type, $text, $icon = '', $icon_visible = null, $extra = array() ) {
		$on = 'true' === $enabled;
		$bag = array(
			'is_enable' => $enabled,
			'meta_type' => $meta_type,
			'meta_text' => $text,
			'icons'     => (object) array(
				'visibility' => null === $icon_visible ? ( $on && '' !== $icon ) : (bool) $icon_visible,
				'icon'       => $icon,
				'type'       => 'icon',
			),
		);
		foreach ( $extra as $extra_key => $extra_value ) {
			$bag[ $extra_key ] = $extra_value;
		}
		return (object) $bag;
	}

	/**
	 * Fill missing Add-Module settings/styles so a blank layout checkbox looks like the builder UI.
	 *
	 * @param object      $module Module.
	 * @param object|null $doc Layout.
	 * @return void
	 */
	private static function apply_builder_module_defaults( $module, $doc = null, $tree = null ) {
		if ( ! is_object( $module ) ) {
			return;
		}
		$key = isset( $module->key ) ? (string) $module->key : '';
		if ( ! isset( $module->settings ) || ! is_object( $module->settings ) ) {
			$module->settings = new stdClass();
		}
		if ( self::is_post_card_module( $key, $tree, $module ) || 'pagination' === $key ) {
			self::heal_post_card_settings( $module, $key );
		}
		$defaults = self::default_module_settings( $key, null === $tree ? 'filter' : $tree );
		foreach ( get_object_vars( $defaults ) as $setting_key => $setting_value ) {
			if ( ! isset( $module->settings->{$setting_key} ) ) {
				$module->settings->{$setting_key} = json_decode( wp_json_encode( $setting_value ) );
			}
		}
		if ( self::is_post_card_module( $key, $tree, $module ) || 'pagination' === $key ) {
			self::fill_post_nested_settings( $module, $defaults );
		}
		if ( isset( $module->settings->label ) && is_object( $module->settings->label ) ) {
			$label_defaults = self::default_label();
			if ( ! isset( $module->settings->label->icons ) || ! is_object( $module->settings->label->icons ) ) {
				$module->settings->label->icons = $label_defaults->icons;
			}
			if ( ! isset( $module->settings->label->is_label ) ) {
				$module->settings->label->is_label = 'true';
			}
			if ( ! isset( $module->settings->label->value ) ) {
				$module->settings->label->value = 'Label';
			}
		}
		$post_type = '';
		if ( is_object( $doc ) && isset( $doc->common_data ) && is_object( $doc->common_data ) && isset( $doc->common_data->post_type ) ) {
			$post_type = is_array( $doc->common_data->post_type )
				? sanitize_key( (string) reset( $doc->common_data->post_type ) )
				: sanitize_key( (string) $doc->common_data->post_type );
		}
		if ( '' !== $post_type && ! isset( $module->settings->post_type ) ) {
			$module->settings->post_type = $post_type;
		}
		if ( self::is_post_card_module( $key, $tree, $module ) ) {
			self::ensure_post_card_style( $module, $key );
			return;
		}
		$style_defaults = self::default_module_style( $key, null === $tree ? 'filter' : $tree );
		if ( ! isset( $module->style ) || ! is_object( $module->style ) ) {
			$module->style = $style_defaults;
			return;
		}
		foreach ( get_object_vars( $style_defaults ) as $part => $bucket ) {
			if ( ! is_object( $bucket ) ) {
				continue;
			}
			if ( ! isset( $module->style->{$part} ) || ! is_object( $module->style->{$part} ) ) {
				$module->style->{$part} = json_decode( wp_json_encode( $bucket ) );
				continue;
			}
			foreach ( get_object_vars( $bucket ) as $device => $dev ) {
				if ( ! is_object( $dev ) ) {
					continue;
				}
				if ( ! isset( $module->style->{$part}->{$device} ) || ! is_object( $module->style->{$part}->{$device} ) ) {
					$module->style->{$part}->{$device} = json_decode( wp_json_encode( $dev ) );
					continue;
				}
				foreach ( get_object_vars( $dev ) as $state => $css ) {
					$existing = isset( $module->style->{$part}->{$device}->{$state} ) && is_object( $module->style->{$part}->{$device}->{$state} )
						? $module->style->{$part}->{$device}->{$state}
						: null;
					if ( null === $existing ) {
						$module->style->{$part}->{$device}->{$state} = json_decode( wp_json_encode( $css ) );
						continue;
					}
					if ( is_object( $css ) && 0 < count( get_object_vars( $css ) ) && 0 === count( get_object_vars( $existing ) ) ) {
						$module->style->{$part}->{$device}->{$state} = json_decode( wp_json_encode( $css ) );
					}
				}
			}
		}
	}

	/**
	 * @param mixed $value Patch.
	 * @return void
	 */
	private static function merge_label_object( $node, $value ) {
		$incoming = json_decode( wp_json_encode( $value ) );
		if ( ! isset( $node->settings->label ) || ! is_object( $node->settings->label ) ) {
			$node->settings->label = self::default_label();
		}
		if ( ! is_object( $incoming ) ) {
			return;
		}
		foreach ( get_object_vars( $incoming ) as $label_key => $label_value ) {
			if ( 'icons' === $label_key && is_object( $label_value ) ) {
				if ( ! isset( $node->settings->label->icons ) || ! is_object( $node->settings->label->icons ) ) {
					$node->settings->label->icons = self::default_label()->icons;
				}
				foreach ( get_object_vars( $label_value ) as $icon_key => $icon_value ) {
					$node->settings->label->icons->{$icon_key} = $icon_value;
				}
				continue;
			}
			$node->settings->label->{$label_key} = $label_value;
		}
	}

	/**
	 * @param mixed $value Raw bool-ish.
	 * @return string
	 */
	private static function bool_word( $value ) {
		if ( is_bool( $value ) ) {
			return $value ? 'true' : 'false';
		}
		$word = strtolower( trim( (string) $value ) );
		if ( in_array( $word, array( 'false', '0', 'no', 'off' ), true ) ) {
			return 'false';
		}
		if ( in_array( $word, array( 'true', '1', 'yes', 'on' ), true ) ) {
			return 'true';
		}
		return 'true';
	}

	/**
	 * Builder Add Module desktop.default styles.
	 *
	 * @param string $key Module key.
	 * @return object
	 */
	private static function default_module_style( $key, $tree = 'filter' ) {
		if ( self::is_post_card_module( $key, $tree ) ) {
			return self::default_post_module_style( $key );
		}
		if ( 'pagination' === $key ) {
			return self::default_pagination_style();
		}
		if ( 'woo_attribute_swatch' === $key ) {
			$style = self::load_checkbox_style_defaults();
			self::apply_swatch_style_overrides( $style );
			return $style;
		}
		if ( in_array( $key, array( 'reset', 'customtext' ), true ) ) {
			$style = self::empty_part_style( array( 'container', 'icon' ) );
			if ( 'reset' === $key ) {
				self::apply_reset_style_overrides( $style );
			} else {
				self::apply_customtext_style_overrides( $style );
			}
			return $style;
		}
		if ( in_array( $key, array( 'checkbox_filter', 'dropdown_filter', 'search', 'range_slider', 'woo_rating_filter' ), true ) ) {
			$style = self::load_checkbox_style_defaults();
			if ( 'dropdown_filter' === $key ) {
				self::apply_dropdown_style_overrides( $style );
			}
			if ( 'search' === $key ) {
				self::apply_search_style_overrides( $style );
			}
			if ( 'range_slider' === $key ) {
				self::apply_range_style_overrides( $style );
			}
			if ( 'woo_rating_filter' === $key ) {
				self::apply_rating_style_overrides( $style );
			}
			return $style;
		}
		$parts = array( 'container' );
		if ( class_exists( 'CAF_MCP_Schemas', false ) ) {
			$schema = CAF_MCP_Schemas::get( $key );
			if ( isset( $schema['llm_guidance']['style_parts'] ) && is_array( $schema['llm_guidance']['style_parts'] ) ) {
				$parts = $schema['llm_guidance']['style_parts'];
			}
		}
		$style = self::empty_part_style( $parts );
		if ( in_array( 'header', $parts, true ) ) {
			$style->header = self::style_part(
				array(
					'width'           => '100%',
					'height'          => 'auto',
					'position'        => 'relative',
					'paddingTop'      => '0px',
					'paddingRight'    => '0',
					'paddingBottom'   => '10px',
					'paddingLeft'     => '0',
					'color'           => '#000',
					'fontFamily'      => 'DM Sans',
					'fontWeight'      => '400',
					'fontSize'        => '20px',
					'display'         => 'flex',
					'backgroundColor' => 'rgba(255,255,255,0)',
				)
			);
		}
		return $style;
	}

	/**
	 * Full Add Module style tree (Single Item layout parts included).
	 *
	 * @return object
	 */
	private static function load_checkbox_style_defaults() {
		static $cached = null;
		if ( null !== $cached ) {
			return json_decode( wp_json_encode( $cached ) );
		}
		$path = dirname( __FILE__ ) . '/mcp-checkbox-style-defaults.json';
		$raw  = is_readable( $path ) ? file_get_contents( $path ) : '';
		$decoded = json_decode( $raw );
		if ( ! is_object( $decoded ) ) {
			$decoded = self::empty_part_style(
				array( 'container', 'header', 'input', 'meta', 'mainmeta', 'selectmeta', 'meta1', 'meta2', 'meta3', 'meta4', 'icon', 'icon2', 'icon3', 'selecticon', 'count', 'showmore' )
			);
		}
		$cached = $decoded;
		return json_decode( wp_json_encode( $cached ) );
	}

	/**
	 * Search left-col uses style.meta1. Checkbox Single Item (padding 12/20 + border)
	 * leaked onto MCP search and boxed the magnifying glass.
	 *
	 * @param object $node Module.
	 * @return void
	 */
	private static function heal_search_style_from_checkbox_leak( $node ) {
		if ( ! is_object( $node ) || ! isset( $node->style ) || ! is_object( $node->style ) ) {
			return;
		}
		$meta1 = isset( $node->style->meta1->desktop->default ) && is_object( $node->style->meta1->desktop->default )
			? $node->style->meta1->desktop->default
			: null;
		if ( ! $meta1 ) {
			return;
		}
		$pad_l = isset( $meta1->paddingLeft ) ? (string) $meta1->paddingLeft : '';
		$pad_t = isset( $meta1->paddingTop ) ? (string) $meta1->paddingTop : '';
		$border = isset( $meta1->borderTopWidth ) ? (string) $meta1->borderTopWidth : '';
		$leaked = ( '20px' === $pad_l && '12px' === $pad_t ) || ( '1px' === $border && '20px' === $pad_l );
		if ( ! $leaked ) {
			return;
		}
		self::apply_search_style_overrides( $node->style );
	}

	/**
	 * Range track is style.meta2 (8px bar). Checkbox meta2 is a flex row.
	 *
	 * @param object $node Module.
	 * @return void
	 */
	private static function heal_range_style_from_checkbox_leak( $node ) {
		if ( ! is_object( $node ) || ! isset( $node->style ) || ! is_object( $node->style ) ) {
			return;
		}
		$meta2 = isset( $node->style->meta2->desktop->default ) && is_object( $node->style->meta2->desktop->default )
			? $node->style->meta2->desktop->default
			: null;
		if ( ! $meta2 ) {
			return;
		}
		$height  = isset( $meta2->height ) ? (string) $meta2->height : '';
		$display = isset( $meta2->display ) ? (string) $meta2->display : '';
		if ( '8px' === $height ) {
			return;
		}
		if ( 'flex' === $display || 'auto' === $height || '' === $height ) {
			self::apply_range_style_overrides( $node->style );
		}
	}

	/**
	 * Rating star rows are style.meta1. Checkbox Single Item chrome boxed the stars.
	 *
	 * @param object $node Module.
	 * @return void
	 */
	private static function heal_rating_style_from_checkbox_leak( $node ) {
		if ( ! is_object( $node ) || ! isset( $node->style ) || ! is_object( $node->style ) ) {
			return;
		}
		$meta1 = isset( $node->style->meta1->desktop->default ) && is_object( $node->style->meta1->desktop->default )
			? $node->style->meta1->desktop->default
			: null;
		if ( ! $meta1 ) {
			return;
		}
		$pad_l  = isset( $meta1->paddingLeft ) ? (string) $meta1->paddingLeft : '';
		$border = isset( $meta1->borderTopWidth ) ? (string) $meta1->borderTopWidth : '';
		if ( '20px' === $pad_l || '1px' === $border ) {
			self::apply_rating_style_overrides( $node->style );
		}
	}

	/**
	 * Swatch chips use 5px padding. Checkbox Single Item (20px / 1px border) leaked onto MCP swatches.
	 *
	 * @param object $node Module.
	 * @return void
	 */
	private static function heal_swatch_style_from_checkbox_leak( $node ) {
		if ( ! is_object( $node ) || ! isset( $node->style ) || ! is_object( $node->style ) ) {
			return;
		}
		$meta1 = isset( $node->style->meta1->desktop->default ) && is_object( $node->style->meta1->desktop->default )
			? $node->style->meta1->desktop->default
			: null;
		if ( ! $meta1 ) {
			return;
		}
		$pad_l = isset( $meta1->paddingLeft ) ? (string) $meta1->paddingLeft : '';
		if ( '20px' === $pad_l || '12px' === $pad_l ) {
			self::apply_swatch_style_overrides( $node->style );
		}
	}

	/**
	 * Search Add Module styles (input field + icon/voice/clear).
	 * Left/right icon columns are meta1/meta2 — must not keep checkbox Single Item CSS.
	 *
	 * @param object $style Style.
	 * @return void
	 */
	private static function apply_search_style_overrides( $style ) {
		self::overlay_style_default(
			$style,
			'container',
			array(
				'paddingBottom' => '0px',
				'fontFamily'    => 'Open Sans',
			)
		);
		self::overlay_style_default(
			$style,
			'header',
			array(
				'display'  => 'flex',
				'flexFlow' => 'row',
			)
		);
		self::replace_style_state(
			$style,
			'input',
			array(
				'width'                   => '100%',
				'height'                  => '50px',
				'position'                => 'relative',
				'paddingTop'              => '0px',
				'paddingRight'            => '10px',
				'paddingBottom'           => '0px',
				'paddingLeft'             => '10px',
				'marginTop'               => '0',
				'marginRight'             => '0',
				'marginBottom'            => '0',
				'marginLeft'              => '0',
				'backgroundColor'         => 'rgb(255,255,255)',
				'color'                   => '#000',
				'fontFamily'              => 'DM Sans',
				'fontWeight'              => '400',
				'fontSize'                => '16px',
				'borderTopLeftRadius'     => '8px',
				'borderBottomLeftRadius'  => '8px',
				'borderTopRightRadius'    => '8px',
				'borderBottomRightRadius' => '8px',
				'borderTopWidth'          => '2px',
				'borderRightWidth'        => '2px',
				'borderBottomWidth'       => '2px',
				'borderLeftWidth'         => '2px',
				'borderTopColor'          => 'rgb(235,230,231)',
				'borderRightColor'        => 'rgb(235,230,231)',
				'borderBottomColor'       => 'rgb(235,230,231)',
				'borderLeftColor'         => 'rgb(235,230,231)',
				'borderTopStyle'          => 'solid',
				'borderRightStyle'        => 'solid',
				'borderBottomStyle'       => 'solid',
				'borderLeftStyle'         => 'solid',
				'gap'                     => '5px',
			)
		);
		self::replace_style_state(
			$style,
			'input',
			array(
				'backgroundColor'   => 'rgb(246,247,251)',
				'borderTopWidth'    => '2px',
				'borderRightWidth'  => '2px',
				'borderBottomWidth' => '2px',
				'borderLeftWidth'   => '2px',
				'borderTopColor'    => 'rgb(149,149,149)',
				'borderRightColor'  => 'rgb(149,149,149)',
				'borderBottomColor' => 'rgb(149,149,149)',
				'borderLeftColor'   => 'rgb(149,149,149)',
				'borderTopStyle'    => 'solid',
				'borderRightStyle'  => 'solid',
				'borderBottomStyle' => 'solid',
				'borderLeftStyle'   => 'solid',
			),
			'selected'
		);
		self::replace_style_state(
			$style,
			'input',
			array( 'color' => 'rgb(191,191,191)' ),
			'placeholder'
		);
		$icon_col = array(
			'width'                   => 'auto',
			'height'                  => 'auto',
			'position'                => 'relative',
			'paddingTop'              => '0px',
			'paddingRight'            => '0px',
			'paddingBottom'           => '0px',
			'paddingLeft'             => '0px',
			'marginTop'               => '0px',
			'marginRight'             => '0',
			'marginBottom'            => '0',
			'marginLeft'              => '0',
			'backgroundColor'         => 'unset',
			'fontFamily'              => 'Open Sans',
			'textTransform'           => 'capitalize',
			'fontSize'                => '16px',
			'color'                   => '#dd3333',
			'display'                 => 'flex',
			'flexFlow'                => 'row',
			'alignItems'              => 'center',
			'justifyContent'          => 'flex-start',
			'gap'                     => '0px',
			'float'                   => 'none',
			'borderTopLeftRadius'     => '0px',
			'borderTopRightRadius'    => '0px',
			'borderBottomLeftRadius'  => '0px',
			'borderBottomRightRadius' => '0px',
			'borderTopColor'          => '#c6bdbd',
			'borderRightColor'        => '#c6bdbd',
			'borderBottomColor'       => '#c6bdbd',
			'borderLeftColor'         => '#c6bdbd',
			'borderTopWidth'          => '0px',
			'borderRightWidth'        => '0px',
			'borderBottomWidth'       => '0px',
			'borderLeftWidth'         => '0px',
			'borderTopStyle'          => 'solid',
			'borderRightStyle'        => 'solid',
			'borderBottomStyle'       => 'solid',
			'borderLeftStyle'         => 'solid',
		);
		self::replace_style_state( $style, 'meta1', $icon_col );
		self::replace_style_state( $style, 'meta1', array(), 'hover' );
		self::replace_style_state( $style, 'meta1', array(), 'selected' );
		$icon_col['gap'] = '5px';
		self::replace_style_state( $style, 'meta2', $icon_col );
		self::replace_style_state( $style, 'meta2', array(), 'hover' );
		self::replace_style_state( $style, 'meta2', array(), 'selected' );
		self::replace_style_state(
			$style,
			'icon',
			array(
				'fontSize'      => '18px',
				'color'         => 'rgb(96,96,96)',
				'paddingBottom' => '0px',
				'paddingTop'    => '0px',
				'paddingRight'  => '0px',
				'paddingLeft'   => '0px',
				'display'       => 'flex',
				'gap'           => '0px',
				'marginRight'   => '0px',
			)
		);
		self::replace_style_state(
			$style,
			'icon2',
			array(
				'fontSize'      => '18px',
				'color'         => 'rgb(20,134,0)',
				'paddingBottom' => '0px',
				'paddingTop'    => '0px',
				'paddingRight'  => '0px',
				'paddingLeft'   => '0px',
			)
		);
		self::replace_style_state(
			$style,
			'icon3',
			array(
				'fontSize'      => '18px',
				'color'         => 'rgb(96,96,96)',
				'paddingTop'    => '0px',
				'paddingBottom' => '0px',
				'paddingLeft'   => '0px',
				'paddingRight'  => '0px',
			)
		);
	}

	/**
	 * Reset Add Module: redo icon + label row.
	 *
	 * @param object $style Style.
	 * @return void
	 */
	private static function apply_reset_style_overrides( $style ) {
		self::replace_style_state(
			$style,
			'container',
			array(
				'width'           => 'auto',
				'height'          => 'auto',
				'position'        => 'relative',
				'paddingTop'      => '10px',
				'paddingRight'    => '0',
				'paddingBottom'   => '10px',
				'paddingLeft'     => '0',
				'marginTop'       => '10px',
				'marginRight'     => '0',
				'marginBottom'    => '0',
				'marginLeft'      => '0',
				'backgroundColor' => 'rgba(231,26,26,0)',
				'color'           => 'rgb(0,0,0)',
				'fontFamily'      => 'Open Sans',
				'fontSize'        => '16px',
				'display'         => 'flex',
				'flexFlow'        => 'row',
				'alignItems'      => 'center',
				'justifyContent'  => 'flex-start',
				'gap'             => '5px',
				'float'           => 'none',
				'fontStyle'       => 'normal',
				'textTransform'   => 'inherit',
				'textDecoration'  => 'inherit',
				'boxShadow'       => '0px 0px 0px 0px  #333333',
				'top'             => 'auto',
				'right'           => 'auto',
				'bottom'          => 'auto',
				'left'            => 'auto',
			)
		);
		self::replace_style_state(
			$style,
			'container',
			array( 'backgroundColor' => 'rgba(3,3,3,0)' ),
			'hover'
		);
		self::replace_style_state(
			$style,
			'icon',
			array(
				'fontSize' => '15px',
				'color'    => 'rgb(96,96,96)',
				'width'    => 'auto',
				'height'   => 'auto',
				'boxShadow'=> '0px 0px 0px 0px  #333333',
			)
		);
	}

	/**
	 * Custom text Add Module.
	 *
	 * @param object $style Style.
	 * @return void
	 */
	private static function apply_customtext_style_overrides( $style ) {
		self::replace_style_state(
			$style,
			'container',
			array(
				'width'           => '100%',
				'height'          => 'auto',
				'position'        => 'relative',
				'paddingTop'      => '0px',
				'paddingRight'    => '0',
				'paddingBottom'   => '0px',
				'paddingLeft'     => '0',
				'marginTop'       => '0',
				'marginRight'     => '0',
				'marginBottom'    => '0',
				'marginLeft'      => '0',
				'backgroundColor' => '#ffffff',
				'color'           => 'rgb(0,0,0)',
				'fontFamily'      => 'DM Sans',
				'fontSize'        => '14px',
				'display'         => 'flex',
				'flexFlow'        => 'row',
				'alignItems'      => 'center',
				'justifyContent'  => 'flex-start',
				'gap'             => '5px',
				'float'           => 'none',
				'boxShadow'       => '0px 0px 0px 0px  #333333',
				'top'             => 'auto',
				'right'           => 'auto',
				'bottom'          => 'auto',
				'left'            => 'auto',
			)
		);
		self::replace_style_state(
			$style,
			'icon',
			array(
				'fontSize' => '15px',
				'color'    => 'rgb(96,96,96)',
				'width'    => 'auto',
				'height'   => 'auto',
				'boxShadow'=> '0px 0px 0px 0px  #333333',
			)
		);
		if ( isset( $style->container->mobile ) && is_object( $style->container->mobile ) ) {
			if ( ! isset( $style->container->mobile->default ) || ! is_object( $style->container->mobile->default ) ) {
				$style->container->mobile->default = new stdClass();
			}
			$style->container->mobile->default->fontSize = '12px';
		}
	}

	/**
	 * Range slider track (meta2) + handle (meta3).
	 *
	 * @param object $style Style.
	 * @return void
	 */
	private static function apply_range_style_overrides( $style ) {
		self::overlay_style_default(
			$style,
			'container',
			array(
				'width'           => 'auto',
				'paddingTop'      => '0',
				'paddingBottom'   => '0',
				'backgroundColor' => '#ffffff',
				'fontFamily'      => 'Open Sans',
			)
		);
		self::overlay_style_default(
			$style,
			'header',
			array(
				'paddingTop'      => '10px',
				'backgroundColor' => '#ffffff',
				'fontFamily'      => 'DM Sans',
				'fontWeight'      => '400',
				'fontSize'        => '20px',
			)
		);
		self::replace_style_state(
			$style,
			'meta',
			array(
				'width'          => '100%',
				'height'         => 'auto',
				'position'       => 'relative',
				'display'        => 'flex',
				'flexFlow'       => 'column',
				'alignItems'     => 'flex-start',
				'justifyContent' => 'flex-start',
				'gap'            => '20px',
				'float'          => 'none',
				'paddingTop'     => '0',
				'paddingRight'   => '0',
				'paddingBottom'  => '20px',
				'paddingLeft'    => '0',
				'marginTop'      => '0',
				'marginRight'    => '0',
				'marginBottom'   => '0',
				'marginLeft'     => '0',
			)
		);
		self::replace_style_state(
			$style,
			'meta1',
			array(
				'fontFamily' => 'Open Sans',
				'fontSize'   => '16px',
				'color'      => 'rgb(96,96,96)',
			)
		);
		self::replace_style_state( $style, 'meta1', array(), 'hover' );
		self::replace_style_state( $style, 'meta1', array(), 'selected' );
		self::replace_style_state(
			$style,
			'meta2',
			array(
				'display'                 => 'block',
				'flexFlow'                => 'unset',
				'alignItems'              => 'unset',
				'justifyContent'          => 'unset',
				'gap'                     => 'unset',
				'float'                   => 'none',
				'position'                => 'relative',
				'width'                   => '95%',
				'height'                  => '8px',
				'backgroundColor'         => 'rgb(235,230,231)',
				'borderTopLeftRadius'     => '4px',
				'borderTopRightRadius'    => '4px',
				'borderBottomLeftRadius'  => '4px',
				'borderBottomRightRadius' => '4px',
				'paddingTop'              => '0px',
				'paddingRight'            => '0px',
				'paddingBottom'           => '0px',
				'paddingLeft'             => '0px',
				'boxShadow'               => '0px 0px 0px 0px #333333',
				'marginLeft'              => '6px',
			)
		);
		self::replace_style_state( $style, 'meta2', array(), 'hover' );
		self::replace_style_state( $style, 'meta2', array( 'backgroundColor' => 'rgb(0,0,0)' ), 'active' );
		self::replace_style_state(
			$style,
			'meta3',
			array(
				'display'                 => 'block',
				'flexFlow'                => 'unset',
				'alignItems'              => 'unset',
				'justifyContent'          => 'unset',
				'gap'                     => 'unset',
				'float'                   => 'none',
				'position'                => 'absolute',
				'boxSizing'               => 'border-box',
				'width'                   => '25px',
				'height'                  => '25px',
				'backgroundColor'         => 'rgb(255,255,255)',
				'borderTopLeftRadius'     => '50%',
				'borderTopRightRadius'    => '50%',
				'borderBottomLeftRadius'  => '50%',
				'borderBottomRightRadius' => '50%',
				'borderTopWidth'          => '3px',
				'borderRightWidth'        => '3px',
				'borderBottomWidth'       => '3px',
				'borderLeftWidth'         => '3px',
				'borderTopStyle'          => 'solid',
				'borderRightStyle'        => 'solid',
				'borderBottomStyle'       => 'solid',
				'borderLeftStyle'         => 'solid',
				'borderTopColor'          => 'rgb(6,6,6)',
				'borderRightColor'        => 'rgb(6,6,6)',
				'borderBottomColor'       => 'rgb(6,6,6)',
				'borderLeftColor'         => 'rgb(6,6,6)',
				'paddingLeft'             => '0px',
				'paddingRight'            => '0px',
				'paddingTop'              => '0px',
				'paddingBottom'           => '0px',
				'marginLeft'              => '-8px',
				'marginRight'             => '0px',
				'marginTop'               => '-8px',
				'marginBottom'            => '0px',
				'boxShadow'               => '0px 0px 0px 0px #333333',
			)
		);
		self::replace_style_state(
			$style,
			'meta3',
			array(
				'borderTopWidth'     => '3px',
				'borderRightWidth'   => '3px',
				'borderBottomWidth'  => '3px',
				'borderLeftWidth'    => '3px',
				'borderTopColor'     => 'rgb(86,86,86)',
				'borderRightColor'   => 'rgb(86,86,86)',
				'borderBottomColor'  => 'rgb(86,86,86)',
				'borderLeftColor'    => 'rgb(86,86,86)',
				'borderTopStyle'     => 'solid',
				'borderRightStyle'   => 'solid',
				'borderBottomStyle'  => 'solid',
				'borderLeftStyle'    => 'solid',
			),
			'hover'
		);
	}

	/**
	 * Woo star rating: no checkbox row chrome; gold selected stars.
	 *
	 * @param object $style Style.
	 * @return void
	 */
	private static function apply_rating_style_overrides( $style ) {
		self::overlay_style_default(
			$style,
			'container',
			array(
				'backgroundColor' => 'rgba(255,255,255,0)',
				'fontFamily'      => 'Open Sans',
			)
		);
		self::overlay_style_default(
			$style,
			'header',
			array(
				'paddingTop'      => '0px',
				'backgroundColor' => 'rgba(255,255,255,0)',
				'fontFamily'      => 'DM Sans',
				'fontWeight'      => '400',
				'fontSize'        => '20px',
			)
		);
		self::replace_style_state( $style, 'input', array() );
		self::replace_style_state( $style, 'input', array(), 'hover' );
		self::replace_style_state( $style, 'input', array(), 'selected' );
		self::replace_style_state( $style, 'input', array(), 'placeholder' );
		self::replace_style_state(
			$style,
			'meta',
			array(
				'width'           => '100%',
				'height'          => 'auto',
				'position'        => 'relative',
				'paddingTop'      => '0px',
				'paddingRight'    => '0',
				'paddingBottom'   => '0',
				'paddingLeft'     => '0',
				'marginTop'       => '0',
				'marginRight'     => '0',
				'marginBottom'    => '0',
				'marginLeft'      => '0',
				'backgroundColor' => 'rgba(255,255,255,0)',
				'fontFamily'      => 'Open Sans',
				'fontSize'        => '16px',
				'color'           => '#333333',
				'display'         => 'flex',
				'flexFlow'        => 'column',
				'alignItems'      => 'flex-start',
				'justifyContent'  => 'flex-start',
				'gap'             => '8px',
				'float'           => 'none',
				'flexWrap'        => 'nowrap',
				'boxShadow'       => '0px 0px 0px 0px  #333333',
			)
		);
		self::replace_style_state(
			$style,
			'meta1',
			array(
				'width'                   => 'auto',
				'height'                  => 'auto',
				'position'                => 'relative',
				'paddingTop'              => '0px',
				'paddingRight'            => '0',
				'paddingBottom'           => '0px',
				'paddingLeft'             => '0',
				'marginTop'               => '0px',
				'marginRight'             => '0',
				'marginBottom'            => '0',
				'marginLeft'              => '0',
				'backgroundColor'         => 'rgba(255,255,255,0)',
				'fontFamily'              => 'DM Sans',
				'fontSize'                => '16px',
				'color'                   => 'rgb(3,3,3)',
				'display'                 => 'flex',
				'flexFlow'                => 'row',
				'alignItems'              => 'center',
				'justifyContent'          => 'flex-start',
				'gap'                     => '0px',
				'float'                   => 'none',
				'borderTopLeftRadius'     => '0px',
				'borderTopRightRadius'    => '0px',
				'borderBottomLeftRadius'  => '0px',
				'borderBottomRightRadius' => '0px',
				'borderTopWidth'          => '0px',
				'borderRightWidth'        => '0px',
				'borderBottomWidth'       => '0px',
				'borderLeftWidth'         => '0px',
				'borderTopStyle'          => 'none',
				'borderRightStyle'        => 'none',
				'borderBottomStyle'       => 'none',
				'borderLeftStyle'         => 'none',
				'borderTopColor'          => 'rgba(255,255,255,0)',
				'borderRightColor'        => 'rgba(255,255,255,0)',
				'borderBottomColor'       => 'rgba(255,255,255,0)',
				'borderLeftColor'         => 'rgba(255,255,255,0)',
				'boxShadow'               => '0px 0px 0px 0px  #333333',
			)
		);
		self::replace_style_state( $style, 'meta1', array(), 'hover' );
		self::replace_style_state( $style, 'meta1', array(), 'selected' );
		self::overlay_style_default(
			$style,
			'meta2',
			array(
				'display'        => 'flex',
				'flexFlow'       => 'row',
				'alignItems'     => 'center',
				'justifyContent' => 'flex-start',
				'gap'            => '2px',
				'float'          => 'none',
			)
		);
		self::replace_style_state( $style, 'meta3', array() );
		self::replace_style_state( $style, 'meta3', array(), 'hover' );
		self::replace_style_state( $style, 'meta3', array(), 'selected' );
		self::replace_style_state(
			$style,
			'icon',
			array(
				'fontSize' => '18px',
				'color'    => 'rgb(220, 220, 220)',
			)
		);
		self::replace_style_state( $style, 'icon', array( 'color' => 'rgb(255, 183, 0)' ), 'hover' );
		self::replace_style_state( $style, 'icon', array( 'color' => 'rgb(255, 183, 0)' ), 'selected' );
	}

	/**
	 * Product attribute swatch: compact chips, icons on, labels hidden.
	 *
	 * @param object $style Style.
	 * @return void
	 */
	private static function apply_swatch_style_overrides( $style ) {
		self::overlay_style_default(
			$style,
			'header',
			array(
				'fontSize'        => '20px',
				'fontWeight'      => '400',
				'fontFamily'      => 'DM Sans',
				'backgroundColor' => 'rgba(255,255,255,0)',
			)
		);
		self::overlay_style_default(
			$style,
			'input',
			array(
				'width'                  => '18px',
				'height'                 => '18px',
				'borderTopWidth'         => '2px',
				'borderRightWidth'       => '2px',
				'borderBottomWidth'      => '2px',
				'borderLeftWidth'        => '2px',
				'borderTopColor'         => 'rgb(209,213,220)',
				'borderRightColor'       => 'rgb(209,213,220)',
				'borderBottomColor'      => 'rgb(209,213,220)',
				'borderLeftColor'        => 'rgb(209,213,220)',
				'borderTopLeftRadius'    => '4px',
				'borderTopRightRadius'   => '4px',
				'borderBottomLeftRadius' => '4px',
				'borderBottomRightRadius'=> '4px',
			)
		);
		self::overlay_style_default(
			$style,
			'input',
			array(
				'backgroundColor'   => 'rgb(0,0,0)',
				'borderTopWidth'    => '2px',
				'borderRightWidth'  => '2px',
				'borderBottomWidth' => '2px',
				'borderLeftWidth'   => '2px',
				'borderTopColor'    => 'rgb(3,3,3)',
				'borderRightColor'  => 'rgb(3,3,3)',
				'borderBottomColor' => 'rgb(3,3,3)',
				'borderLeftColor'   => 'rgb(3,3,3)',
			),
			'selected'
		);
		self::overlay_style_default(
			$style,
			'meta',
			array(
				'flexWrap'       => 'wrap',
				'gap'            => '10px',
				'paddingTop'     => '0px',
				'paddingBottom'  => '0',
				'backgroundColor'=> 'rgba(255,255,255,0)',
			)
		);
		self::overlay_style_default(
			$style,
			'meta1',
			array(
				'paddingTop'    => '5px',
				'paddingRight'  => '5px',
				'paddingBottom' => '5px',
				'paddingLeft'   => '5px',
				'gap'           => '5px',
			)
		);
		self::overlay_style_default(
			$style,
			'meta2',
			array(
				'justifyContent' => 'center',
				'gap'            => '0px',
			)
		);
		self::overlay_style_default(
			$style,
			'icon',
			array(
				'fontSize' => '18px',
				'color'    => 'rgb(0,0,0)',
			)
		);
	}

	/**
	 * @param object               $style Style tree.
	 * @param string               $part Part name.
	 * @param array<string, mixed> $props CSS map.
	 * @param string               $state default|hover|selected|placeholder.
	 * @return void
	 */
	private static function overlay_style_default( $style, $part, $props, $state = 'default' ) {
		if ( ! is_object( $style ) || ! is_array( $props ) ) {
			return;
		}
		if ( ! isset( $style->{$part} ) || ! is_object( $style->{$part} ) ) {
			return;
		}
		if ( ! isset( $style->{$part}->desktop ) || ! is_object( $style->{$part}->desktop ) ) {
			return;
		}
		if ( ! isset( $style->{$part}->desktop->{$state} ) || ! is_object( $style->{$part}->desktop->{$state} ) ) {
			$style->{$part}->desktop->{$state} = new stdClass();
		}
		foreach ( $props as $css_key => $css_value ) {
			$style->{$part}->desktop->{$state}->{$css_key} = $css_value;
		}
	}

	/**
	 * Replace a style state so checkbox leftovers cannot leak (search icon column).
	 *
	 * @param object               $style Style tree.
	 * @param string               $part Part name.
	 * @param array<string, mixed> $props CSS map.
	 * @param string               $state default|hover|selected|placeholder.
	 * @return void
	 */
	private static function replace_style_state( $style, $part, $props, $state = 'default' ) {
		if ( ! is_object( $style ) || ! is_array( $props ) ) {
			return;
		}
		if ( ! isset( $style->{$part} ) || ! is_object( $style->{$part} ) ) {
			$style->{$part} = (object) array(
				'desktop' => (object) array(
					'default'  => new stdClass(),
					'hover'    => new stdClass(),
					'selected' => new stdClass(),
				),
				'tablet'  => (object) array(
					'default' => new stdClass(),
					'hover'   => new stdClass(),
				),
				'mobile'  => (object) array(
					'default' => new stdClass(),
					'hover'   => new stdClass(),
				),
			);
		}
		if ( ! isset( $style->{$part}->desktop ) || ! is_object( $style->{$part}->desktop ) ) {
			$style->{$part}->desktop = new stdClass();
		}
		$style->{$part}->desktop->{$state} = (object) $props;
	}

	/**
	 * Dropdown shares the checkbox style tree; header / input / meta defaults differ.
	 *
	 * @param object $style Style.
	 * @return void
	 */
	private static function apply_dropdown_style_overrides( $style ) {
		if ( isset( $style->header->desktop->default ) && is_object( $style->header->desktop->default ) ) {
			$style->header->desktop->default->paddingTop      = '10px';
			$style->header->desktop->default->backgroundColor = '#ffffff';
			$style->header->desktop->default->fontFamily      = 'Montserrat';
			$style->header->desktop->default->fontWeight      = '700';
			$style->header->desktop->default->fontSize        = '22px';
		}
		if ( isset( $style->input->desktop->default ) && is_object( $style->input->desktop->default ) ) {
			$style->input->desktop->default->color = '#000';
		}
		if ( isset( $style->meta->desktop->default ) && is_object( $style->meta->desktop->default ) ) {
			$style->meta->desktop->default->paddingTop      = '10px';
			$style->meta->desktop->default->backgroundColor = '#ffffff';
			$style->meta->desktop->default->gap             = '15px';
		}
	}

	/**
	 * @param array<string, mixed> $default Default CSS map.
	 * @param array<string, mixed> $hover Hover map.
	 * @param array<string, mixed> $selected Selected map.
	 * @return object
	 */
	private static function style_part( $default, $hover = array(), $selected = array() ) {
		$desktop = (object) array(
			'default'  => (object) $default,
			'hover'    => (object) $hover,
			'selected' => (object) $selected,
		);
		return (object) array(
			'desktop' => $desktop,
			'tablet'  => self::empty_device_style(),
			'mobile'  => self::empty_device_style(),
		);
	}

	/**
	 * @return object
	 */
	private static function empty_device_style() {
		return (object) array(
			'default'  => new stdClass(),
			'hover'    => new stdClass(),
			'selected' => new stdClass(),
		);
	}

	/**
	 * @return object
	 */
	private static function empty_root_style() {
		$style = new stdClass();
		foreach ( array( 'desktop', 'tablet', 'mobile' ) as $device ) {
			$style->{$device} = (object) array(
				'default' => new stdClass(),
				'hover'   => new stdClass(),
			);
		}
		return $style;
	}

	/**
	 * Post card modules use style.desktop.default (not filter style.container).
	 *
	 * @param object $module Module.
	 * @param string $key Module key.
	 * @return void
	 */
	private static function ensure_post_card_style( $module, $key ) {
		$has_root = isset( $module->style ) && is_object( $module->style )
			&& isset( $module->style->desktop ) && is_object( $module->style->desktop )
			&& isset( $module->style->desktop->default ) && is_object( $module->style->desktop->default )
			&& 0 < count( get_object_vars( $module->style->desktop->default ) );
		$defaults = self::default_post_module_style( $key );
		if ( ! $has_root ) {
			$module->style = $defaults;
			return;
		}
		unset( $module->style->container, $module->style->header, $module->style->input, $module->style->meta1, $module->style->meta2, $module->style->meta3 );
		foreach ( array( 'meta', 'prefix', 'suffix', 'star' ) as $part ) {
			if ( isset( $defaults->{$part} ) && ( ! isset( $module->style->{$part} ) || ! is_object( $module->style->{$part} ) ) ) {
				$module->style->{$part} = json_decode( wp_json_encode( $defaults->{$part} ) );
			}
		}
	}

	/**
	 * sanitize_key smashes camelCase (excerptLength → excerptlength). Promote onto builder keys.
	 *
	 * @param object $module Module.
	 * @param string $key Module key.
	 * @return void
	 */
	private static function heal_post_card_settings( $module, $key ) {
		if ( 'excerpt' === $key ) {
			if ( isset( $module->settings->excerptlength ) ) {
				$n = intval( $module->settings->excerptlength );
				$module->settings->excerptLength = (string) ( $n < 1 ? 20 : $n );
				unset( $module->settings->excerptlength );
			}
			if ( isset( $module->settings->htmlrender ) ) {
				$module->settings->htmlRender = self::source_flag( $module->settings->htmlrender );
				unset( $module->settings->htmlrender );
			}
		}
		if ( in_array( $key, array( 'button', 'woo_add_to_cart' ), true ) && isset( $module->settings->changebuttonvalue ) ) {
			$module->settings->changeButtonValue = sanitize_text_field( (string) $module->settings->changebuttonvalue );
			unset( $module->settings->changebuttonvalue );
		}
		if ( 'customtext' === $key && isset( $module->settings->customtext ) && ! isset( $module->settings->customText ) ) {
			$module->settings->customText = sanitize_text_field( (string) $module->settings->customtext );
			unset( $module->settings->customtext );
		}
	}

	/**
	 * Fill missing nested link / prefix / suffix keys without replacing agent values.
	 *
	 * @param object $module Module.
	 * @param object $defaults Default settings.
	 * @return void
	 */
	private static function fill_post_nested_settings( $module, $defaults ) {
		self::fill_missing_object_keys( $module->settings, $defaults );
	}

	/**
	 * @param object $target Existing object.
	 * @param object $defaults Defaults.
	 * @return void
	 */
	private static function fill_missing_object_keys( $target, $defaults ) {
		if ( ! is_object( $target ) || ! is_object( $defaults ) ) {
			return;
		}
		foreach ( get_object_vars( $defaults ) as $nested_key => $nested_value ) {
			if ( ! isset( $target->{$nested_key} ) ) {
				$target->{$nested_key} = json_decode( wp_json_encode( $nested_value ) );
				continue;
			}
			if ( is_object( $nested_value ) && is_object( $target->{$nested_key} ) ) {
				self::fill_missing_object_keys( $target->{$nested_key}, $nested_value );
			}
		}
	}

	/**
	 * Add Module styles for post image / title / excerpt / button.
	 *
	 * @param string $key Module key.
	 * @return object
	 */
	private static function default_post_module_style( $key ) {
		$style = self::empty_root_style();
		$affix = (object) array(
			'desktop' => (object) array(
				'default' => (object) array(
					'boxShadow' => '0px 0px 0px 0px #333333',
					'width'     => 'auto',
					'height'    => 'auto',
				),
				'hover'   => new stdClass(),
			),
			'tablet'  => (object) array(
				'default' => new stdClass(),
				'hover'   => new stdClass(),
			),
			'mobile'  => (object) array(
				'default' => new stdClass(),
				'hover'   => new stdClass(),
			),
		);
		$meta = (object) array(
			'desktop' => (object) array(
				'default' => (object) array(
					'display'        => 'flex',
					'justifyContent' => 'flex-start',
					'gap'            => '0px',
					'flexFlow'       => 'row',
				),
				'hover'   => new stdClass(),
			),
			'tablet'  => (object) array(
				'default' => new stdClass(),
				'hover'   => new stdClass(),
			),
			'mobile'  => (object) array(
				'default' => new stdClass(),
				'hover'   => new stdClass(),
			),
		);
		$affix_pad = json_decode( wp_json_encode( $affix ) );
		$affix_pad->desktop->default->paddingTop    = '0px';
		$affix_pad->desktop->default->paddingBottom = '0px';
		$affix_pad->desktop->default->paddingRight  = '0px';
		$affix_pad->desktop->default->paddingLeft   = '0px';
		$meta_gap5 = json_decode( wp_json_encode( $meta ) );
		$meta_gap5->desktop->default->gap = '5px';
		if ( 'image' === $key || 'woo_product_image' === $key ) {
			$style->desktop->default = (object) array(
				'height'                 => 'auto',
				'position'               => 'relative',
				'paddingTop'             => '0px',
				'paddingRight'           => '0',
				'paddingBottom'          => '0px',
				'paddingLeft'            => '0',
				'marginTop'              => '0',
				'marginRight'            => '0',
				'marginBottom'           => '0',
				'marginLeft'             => '0',
				'backgroundColor'        => '#00000000',
				'color'                  => '#4c5866',
				'fontFamily'             => 'Open Sans',
				'fontSize'               => '14px',
				'flexBasis'              => 'auto',
				'justifyContent'         => 'flex-start',
				'boxShadow'              => '0px 0px 0px 0px #333333',
				'top'                    => 'auto',
				'right'                  => 'auto',
				'bottom'                 => 'auto',
				'left'                   => 'auto',
				'width'                  => '100%',
				'borderTopLeftRadius'    => '20px',
				'borderTopRightRadius'   => '20px',
			);
			return $style;
		}
		if ( 'title' === $key ) {
			$style->desktop->default = (object) array(
				'height'          => 'auto',
				'position'        => 'relative',
				'paddingTop'      => '0px',
				'paddingRight'    => '0',
				'paddingBottom'   => '0px',
				'paddingLeft'     => '0',
				'marginTop'       => '0',
				'marginRight'     => '0',
				'marginBottom'    => '0',
				'marginLeft'      => '0',
				'backgroundColor' => '#ffffff',
				'color'           => 'rgb(0,0,0)',
				'fontFamily'      => 'DM Sans',
				'fontSize'        => '24px',
				'flexBasis'       => 'auto',
				'justifyContent'  => 'flex-start',
				'boxShadow'       => '0px 0px 0px 0px #333333',
				'top'             => 'auto',
				'right'           => 'auto',
				'bottom'          => 'auto',
				'left'            => 'auto',
				'fontWeight'      => '700',
				'width'           => '100%',
			);
			$style->mobile->default = (object) array( 'fontSize' => '18px' );
			$style->meta            = json_decode( wp_json_encode( $meta ) );
			$style->prefix          = json_decode( wp_json_encode( $affix ) );
			$style->suffix          = json_decode( wp_json_encode( $affix ) );
			return $style;
		}
		if ( 'excerpt' === $key ) {
			$style->desktop->default = (object) array(
				'height'          => 'auto',
				'position'        => 'relative',
				'paddingTop'      => '10px',
				'paddingRight'    => '0',
				'paddingBottom'   => '10px',
				'paddingLeft'     => '0',
				'marginTop'       => '0',
				'marginRight'     => '0',
				'marginBottom'    => '0',
				'marginLeft'      => '0',
				'backgroundColor' => '#ffffff',
				'color'           => 'rgb(96,96,96)',
				'fontFamily'      => 'DM Sans',
				'fontSize'        => '16px',
				'flexBasis'       => 'auto',
				'justifyContent'  => 'flex-start',
				'boxShadow'       => '0px 0px 0px 0px #333333',
				'top'             => 'auto',
				'right'           => 'auto',
				'bottom'          => 'auto',
				'left'            => 'auto',
				'fontStyle'       => 'normal',
				'textTransform'   => 'inherit',
				'textDecoration'  => 'inherit',
				'width'           => '100%',
				'fontWeight'      => '400',
			);
			$style->mobile->default = (object) array( 'fontSize' => '14px' );
			return $style;
		}
		if ( 'product_price' === $key || 'woo_product_rating' === $key ) {
			$style->desktop->default = (object) array(
				'height'          => 'auto',
				'position'        => 'relative',
				'paddingTop'      => '0px',
				'paddingRight'    => '0',
				'paddingBottom'   => '0px',
				'paddingLeft'     => '0',
				'marginTop'       => '0',
				'marginRight'     => '0',
				'marginBottom'    => '0',
				'marginLeft'      => '0',
				'backgroundColor' => '#ffffff',
				'color'           => 'rgb(0,0,0)',
				'fontFamily'      => 'DM Sans',
				'fontSize'        => '24px',
				'flexBasis'       => 'auto',
				'justifyContent'  => 'flex-start',
				'boxShadow'       => '0px 0px 0px 0px #333333',
				'top'             => 'auto',
				'right'           => 'auto',
				'bottom'          => 'auto',
				'left'            => 'auto',
				'fontWeight'      => '700',
				'width'           => '100%',
			);
			$style->mobile->default = (object) array( 'fontSize' => '18px' );
			$style->meta            = json_decode( wp_json_encode( $meta ) );
			$style->prefix          = json_decode( wp_json_encode( $affix ) );
			$style->suffix          = json_decode( wp_json_encode( $affix ) );
			if ( 'woo_product_rating' === $key ) {
				$style->star = (object) array(
					'desktop' => (object) array(
						'default' => new stdClass(),
						'hover'   => (object) array( 'color' => '#FFC107' ),
					),
				);
			}
			return $style;
		}
		if ( in_array( $key, array( 'author', 'date', 'commentcount', 'customfield' ), true ) ) {
			$style->desktop->default = (object) array(
				'height'          => 'auto',
				'position'        => 'relative',
				'paddingTop'      => '0px',
				'paddingRight'    => '0',
				'paddingBottom'   => '0px',
				'paddingLeft'     => '0',
				'marginTop'       => '0',
				'marginRight'     => '0',
				'marginBottom'    => '0',
				'marginLeft'      => '0',
				'backgroundColor' => '#ffffff',
				'color'           => 'rgb(144,144,144)',
				'fontFamily'      => 'DM Sans',
				'fontSize'        => '14px',
				'flexBasis'       => 'auto',
				'justifyContent'  => 'flex-start',
				'boxShadow'       => '0px 0px 0px 0px #333333',
				'top'             => 'auto',
				'right'           => 'auto',
				'bottom'          => 'auto',
				'left'            => 'auto',
				'display'         => 'flex',
				'gap'             => '5px',
				'width'           => 'auto',
			);
			if ( 'author' === $key ) {
				$style->desktop->default->fontStyle      = 'normal';
				$style->desktop->default->textTransform  = 'capitalize';
				$style->desktop->default->textDecoration = 'inherit';
			}
			if ( 'customfield' === $key ) {
				$style->desktop->default->color = '#4c5866';
			}
			$style->mobile->default = (object) array( 'fontSize' => '12px' );
			$style->meta            = json_decode( wp_json_encode( $meta_gap5 ) );
			$style->prefix          = json_decode( wp_json_encode( $affix_pad ) );
			$style->suffix          = json_decode( wp_json_encode( $affix_pad ) );
			if ( 'customfield' === $key ) {
				$style->prefix->desktop->default->fontFamily = 'DM Sans';
				$style->suffix->desktop->default->fontFamily = 'DM Sans';
			}
			return $style;
		}
		if ( 'categories' === $key ) {
			$style->desktop->default = (object) array(
				'height'          => 'auto',
				'position'        => 'relative',
				'paddingTop'      => '0px',
				'paddingRight'    => '0',
				'paddingBottom'   => '0px',
				'paddingLeft'     => '0',
				'marginTop'       => '0',
				'marginRight'     => '0',
				'marginBottom'    => '0',
				'marginLeft'      => '0',
				'backgroundColor' => '#ffffff',
				'color'           => 'rgb(96,96,96)',
				'fontFamily'      => 'DM Sans',
				'fontSize'        => '15px',
				'flexBasis'       => 'auto',
				'justifyContent'  => 'flex-start',
				'boxShadow'       => '0px 0px 0px 0px #333333',
				'top'             => 'auto',
				'right'           => 'auto',
				'bottom'          => 'auto',
				'left'            => 'auto',
				'display'         => 'flex',
				'gap'             => '8px',
				'width'           => 'auto',
			);
			$style->mobile->default = (object) array( 'fontSize' => '12px' );
			$style->meta            = (object) array(
				'desktop' => (object) array(
					'default' => (object) array(
						'boxShadow'               => '0px 0px 0px 0px #333333',
						'borderTopWidth'          => '1px',
						'borderRightWidth'        => '1px',
						'borderBottomWidth'       => '1px',
						'borderLeftWidth'         => '1px',
						'borderTopColor'          => 'rgb(235,230,231)',
						'borderRightColor'        => 'rgb(235,230,231)',
						'borderBottomColor'       => 'rgb(235,230,231)',
						'borderLeftColor'         => 'rgb(235,230,231)',
						'borderTopStyle'          => 'solid',
						'borderRightStyle'        => 'solid',
						'borderBottomStyle'       => 'solid',
						'borderLeftStyle'         => 'solid',
						'backgroundColor'         => 'rgb(246,247,251)',
						'paddingTop'              => '6px',
						'paddingBottom'           => '6px',
						'paddingLeft'             => '15px',
						'paddingRight'            => '15px',
						'borderTopLeftRadius'     => '10px',
						'borderTopRightRadius'    => '10px',
						'borderBottomLeftRadius'  => '10px',
						'borderBottomRightRadius' => '10px',
					),
					'hover'   => new stdClass(),
				),
				'tablet'  => (object) array(
					'default' => new stdClass(),
					'hover'   => new stdClass(),
				),
				'mobile'  => (object) array(
					'default' => new stdClass(),
					'hover'   => new stdClass(),
				),
			);
			return $style;
		}
		if ( 'customtext' === $key ) {
			$style->desktop->default = (object) array(
				'height'          => 'auto',
				'position'        => 'relative',
				'paddingTop'      => '0px',
				'paddingRight'    => '0',
				'paddingBottom'   => '0px',
				'paddingLeft'     => '0',
				'marginTop'       => '0',
				'marginRight'     => '0',
				'marginBottom'    => '0',
				'marginLeft'      => '0',
				'backgroundColor' => '#ffffff',
				'color'           => 'rgb(0,0,0)',
				'fontFamily'      => 'DM Sans',
				'fontSize'        => '14px',
				'flexBasis'       => 'auto',
				'justifyContent'  => 'flex-start',
				'boxShadow'       => '0px 0px 0px 0px  #333333',
				'width'           => '100%',
				'top'             => 'auto',
				'right'           => 'auto',
				'bottom'          => 'auto',
				'left'            => 'auto',
			);
			$style->mobile->default = (object) array( 'fontSize' => '12px' );
			return $style;
		}
		if ( 'badges' === $key ) {
			$style->desktop->default = (object) array(
				'boxShadow'               => '0px 0px 0px 0px  #333333',
				'top'                     => 'auto',
				'right'                   => 'auto',
				'bottom'                  => 'auto',
				'left'                    => 'auto',
				'fontFamily'              => 'DM Sans',
				'color'                   => 'rgb(255,255,255)',
				'fontSize'                => '12px',
				'display'                 => 'flex',
				'gap'                     => '6px',
				'backgroundColor'         => 'rgb(255,90,90)',
				'width'                   => 'auto',
				'height'                  => 'auto',
				'paddingTop'              => '6px',
				'paddingBottom'           => '6px',
				'paddingLeft'             => '12px',
				'paddingRight'            => '12px',
				'borderTopLeftRadius'     => '4px',
				'borderTopRightRadius'    => '4px',
				'borderBottomLeftRadius'  => '4px',
				'borderBottomRightRadius' => '4px',
				'marginTop'               => '0',
			);
			$style->desktop->hover = (object) array(
				'backgroundColor' => 'rgb(220,60,60)',
			);
			$style->mobile->default = (object) array(
				'paddingTop'    => '5px',
				'paddingBottom' => '5px',
				'paddingLeft'   => '10px',
				'paddingRight'  => '10px',
				'fontSize'      => '11px',
			);
			$style->meta   = json_decode( wp_json_encode( $meta ) );
			$style->prefix = json_decode( wp_json_encode( $affix ) );
			$style->suffix = json_decode( wp_json_encode( $affix ) );
			return $style;
		}
		$style->desktop->default = (object) array(
			'boxShadow'               => '0px 0px 0px 0px  #333333',
			'top'                     => 'auto',
			'right'                   => 'auto',
			'bottom'                  => 'auto',
			'left'                    => 'auto',
			'fontFamily'              => 'DM Sans',
			'color'                   => 'rgb(247,247,247)',
			'fontSize'                => '16px',
			'display'                 => 'flex',
			'gap'                     => '8px',
			'backgroundColor'         => 'rgb(96,96,96)',
			'width'                   => 'auto',
			'height'                  => 'auto',
			'paddingTop'              => '15px',
			'paddingBottom'           => '15px',
			'paddingLeft'             => '25px',
			'paddingRight'            => '25px',
			'borderTopLeftRadius'     => '8px',
			'borderTopRightRadius'    => '8px',
			'borderBottomLeftRadius'  => '8px',
			'borderBottomRightRadius' => '8px',
			'marginTop'               => '10px',
		);
		$style->desktop->hover = (object) array(
			'backgroundColor' => 'rgb(0,0,0)',
		);
		$style->mobile->default = (object) array(
			'paddingTop'    => '10px',
			'paddingBottom' => '10px',
			'paddingLeft'   => '20px',
			'paddingRight'  => '20px',
			'fontSize'      => '14px',
		);
		$style->meta   = json_decode( wp_json_encode( $meta ) );
		$style->prefix = json_decode( wp_json_encode( $affix ) );
		$style->suffix = json_decode( wp_json_encode( $affix ) );
		return $style;
	}

	/**
	 * Selected chips — BuilderLayoutData.js dnd selected style.
	 *
	 * @return object
	 */
	private static function default_selected_style() {
		$style = self::empty_part_style( array( 'container', 'meta', 'meta1' ) );
		self::replace_style_state(
			$style,
			'container',
			array(
				'display'        => 'flex',
				'width'          => 'auto',
				'boxShadow'      => '0px 0px 0px 0px  #333333',
				'top'            => 'auto',
				'right'          => 'auto',
				'bottom'         => 'auto',
				'left'           => 'auto',
				'height'         => 'auto',
				'paddingTop'     => '0px',
				'paddingBottom'  => '0px',
				'paddingLeft'    => '0px',
				'paddingRight'   => '0px',
				'flexFlow'       => 'row',
				'alignItems'     => 'center',
				'float'          => 'none',
				'gap'            => '6px',
				'marginTop'      => '0px',
				'marginBottom'   => '0px',
			)
		);
		self::replace_style_state(
			$style,
			'meta',
			array(
				'boxShadow'               => '0px 0px 0px 0px  #333333',
				'width'                   => 'auto',
				'height'                  => 'auto',
				'paddingTop'              => '8px',
				'paddingBottom'           => '8px',
				'paddingLeft'             => '10px',
				'paddingRight'            => '10px',
				'display'                 => 'flex',
				'flexFlow'                => 'row-reverse',
				'float'                   => 'none',
				'alignItems'              => 'center',
				'gap'                     => '3px',
				'borderTopWidth'          => '1px',
				'borderRightWidth'        => '1px',
				'borderBottomWidth'       => '1px',
				'borderLeftWidth'         => '1px',
				'borderTopColor'          => 'rgb(221,221,221)',
				'borderRightColor'        => 'rgb(221,221,221)',
				'borderBottomColor'       => 'rgb(221,221,221)',
				'borderLeftColor'         => 'rgb(221,221,221)',
				'borderTopStyle'          => 'solid',
				'borderRightStyle'        => 'solid',
				'borderBottomStyle'       => 'solid',
				'borderLeftStyle'         => 'solid',
				'borderTopLeftRadius'     => '5px',
				'borderTopRightRadius'    => '5px',
				'borderBottomLeftRadius'  => '5px',
				'borderBottomRightRadius' => '5px',
				'backgroundColor'         => 'rgb(255,255,255)',
				'fontFamily'              => 'DM Sans',
			)
		);
		self::replace_style_state(
			$style,
			'meta1',
			array(
				'color'      => 'rgb(163,163,163)',
				'fontFamily' => 'DM Sans',
			)
		);
		return $style;
	}

	/**
	 * Result count — BuilderLayoutData.js dnd result_count style.
	 *
	 * @return object
	 */
	private static function default_result_count_style() {
		$style = self::empty_part_style( array( 'container', 'meta', 'meta1' ) );
		self::replace_style_state(
			$style,
			'container',
			array(
				'display'        => 'flex',
				'width'          => 'auto',
				'boxShadow'      => '0px 0px 0px 0px  #333333',
				'top'            => 'auto',
				'right'          => 'auto',
				'bottom'         => 'auto',
				'left'           => 'auto',
				'paddingTop'     => '0px',
				'paddingBottom'  => '0px',
				'paddingLeft'    => '0px',
				'paddingRight'   => '0px',
				'height'         => 'auto',
				'flexFlow'       => 'row',
				'gap'            => '5px',
				'alignItems'     => 'center',
				'float'          => 'none',
				'fontFamily'     => 'DM Sans',
				'fontWeight'     => '800',
				'fontSize'       => '18px',
				'color'          => 'rgb(0,0,0)',
				'fontStyle'      => 'normal',
				'textTransform'  => 'inherit',
				'textDecoration' => 'inherit',
			)
		);
		self::replace_style_state(
			$style,
			'meta',
			array(
				'boxShadow'      => '0px 0px 0px 0px  #333333',
				'paddingTop'     => '0px',
				'paddingBottom'  => '0px',
				'paddingLeft'    => '0px',
				'paddingRight'   => '0px',
				'width'          => 'auto',
				'height'         => 'auto',
				'fontFamily'     => 'DM Sans',
				'fontSize'       => '15px',
				'fontWeight'     => '300',
				'color'          => 'rgb(96,96,96)',
			)
		);
		self::replace_style_state(
			$style,
			'meta1',
			array(
				'boxShadow'      => '0px 0px 0px 0px  #333333',
				'paddingTop'     => '0px',
				'paddingBottom'  => '0px',
				'paddingLeft'    => '0px',
				'paddingRight'   => '0px',
				'width'          => 'auto',
				'height'         => 'auto',
				'fontFamily'     => 'DM Sans',
				'fontWeight'     => '300',
				'fontSize'       => '15px',
				'color'          => 'rgb(96,96,96)',
			)
		);
		return $style;
	}

	/**
	 * Sorting dropdowns — BuilderLayoutData.js dnd sorting style.
	 *
	 * @return object
	 */
	private static function default_sorting_style() {
		$style = self::empty_part_style( array( 'container', 'meta', 'meta1', 'meta2', 'meta3', 'meta4', 'meta5' ) );
		self::replace_style_state(
			$style,
			'container',
			array(
				'display'       => 'flex',
				'width'         => 'auto',
				'boxShadow'     => '0px 0px 0px 0px  #333333',
				'top'           => 'auto',
				'right'         => 'auto',
				'bottom'        => 'auto',
				'left'          => 'auto',
				'height'        => 'auto',
				'paddingTop'    => '0px',
				'paddingBottom' => '0px',
				'paddingLeft'   => '0px',
				'paddingRight'  => '0px',
				'flexFlow'      => 'row',
				'float'         => 'none',
				'gap'           => '10px',
				'marginBottom'  => '0px',
			)
		);
		self::replace_style_state(
			$style,
			'meta',
			array(
				'width'                   => '130px',
				'display'                 => 'flex',
				'justifyContent'          => 'space-between',
				'flexFlow'                => 'row',
				'float'                   => 'none',
				'height'                  => '35px',
				'paddingTop'              => '0px',
				'paddingBottom'           => '0px',
				'paddingLeft'             => '10px',
				'paddingRight'            => '10px',
				'borderTopWidth'          => '1px',
				'borderRightWidth'        => '1px',
				'borderBottomWidth'       => '1px',
				'borderLeftWidth'         => '1px',
				'borderTopColor'          => 'rgb(221,221,221)',
				'borderRightColor'        => 'rgb(221,221,221)',
				'borderBottomColor'       => 'rgb(221,221,221)',
				'borderLeftColor'         => 'rgb(221,221,221)',
				'borderTopStyle'          => 'solid',
				'borderRightStyle'        => 'solid',
				'borderBottomStyle'       => 'solid',
				'borderLeftStyle'         => 'solid',
				'borderTopLeftRadius'     => '5px',
				'borderTopRightRadius'    => '5px',
				'borderBottomLeftRadius'  => '5px',
				'borderBottomRightRadius' => '5px',
				'alignItems'              => 'center',
				'backgroundColor'         => 'rgb(255,255,255)',
				'fontFamily'              => 'DM Sans',
			)
		);
		self::replace_style_state(
			$style,
			'meta1',
			array(
				'boxShadow'               => '0px 0px 0px 0px  #333333',
				'width'                   => '100%',
				'height'                  => 'auto',
				'backgroundColor'         => 'rgb(255,255,255)',
				'paddingLeft'             => '10px',
				'paddingRight'            => '10px',
				'paddingTop'              => '8px',
				'paddingBottom'           => '8px',
				'borderTopWidth'          => '0px',
				'borderRightWidth'        => '0px',
				'borderBottomWidth'       => '1px',
				'borderLeftWidth'         => '0px',
				'borderTopColor'          => 'rgb(221,221,221)',
				'borderRightColor'        => 'rgb(221,221,221)',
				'borderBottomColor'       => 'rgb(245,245,245)',
				'borderLeftColor'         => 'rgb(221,221,221)',
				'borderTopStyle'          => 'solid',
				'borderRightStyle'        => 'solid',
				'borderBottomStyle'       => 'solid',
				'borderLeftStyle'         => 'solid',
				'fontFamily'              => 'DM Sans',
			)
		);
		self::replace_style_state( $style, 'meta1', array( 'backgroundColor' => 'rgb(246,247,251)' ), 'hover' );
		self::replace_style_state( $style, 'meta1', array( 'backgroundColor' => 'rgb(246,247,251)' ), 'selected' );
		self::replace_style_state(
			$style,
			'meta2',
			array(
				'width'  => '100%',
				'height' => 'auto',
			)
		);
		self::replace_style_state(
			$style,
			'meta3',
			array(
				'width'  => '100%',
				'height' => 'auto',
			)
		);
		self::replace_style_state(
			$style,
			'meta4',
			array(
				'paddingTop'              => '0px',
				'paddingBottom'           => '0px',
				'paddingLeft'             => '0px',
				'paddingRight'            => '0px',
				'boxShadow'               => '0px 0px 0px 0px  #333333',
				'width'                   => '100%',
				'height'                  => 'auto',
				'borderTopWidth'          => '1px',
				'borderRightWidth'        => '1px',
				'borderBottomWidth'       => '1px',
				'borderLeftWidth'         => '1px',
				'borderTopColor'          => 'rgb(235,230,231)',
				'borderRightColor'        => 'rgb(235,230,231)',
				'borderBottomColor'       => 'rgb(235,230,231)',
				'borderLeftColor'         => 'rgb(235,230,231)',
				'borderTopStyle'          => 'solid',
				'borderRightStyle'        => 'solid',
				'borderBottomStyle'       => 'solid',
				'borderLeftStyle'         => 'solid',
				'marginTop'               => '5px',
				'borderTopLeftRadius'     => '6px',
				'borderBottomLeftRadius'  => '6px',
				'borderTopRightRadius'    => '6px',
				'borderBottomRightRadius' => '6px',
			)
		);
		self::replace_style_state(
			$style,
			'meta5',
			array(
				'width'          => '130px',
				'display'        => 'flex',
				'height'         => '35px',
				'paddingTop'     => '0px',
				'paddingBottom'  => '0px',
				'paddingLeft'    => '10px',
				'paddingRight'   => '10px',
			)
		);
		return $style;
	}

	/**
	 * Pagination uses filter-shaped parts (container / meta / meta1 / meta2).
	 *
	 * @return object
	 */
	private static function default_pagination_style() {
		$style = self::empty_part_style( array( 'container', 'meta', 'meta1', 'meta2' ) );
		self::replace_style_state(
			$style,
			'container',
			array(
				'display'         => 'flex',
				'width'           => '100%',
				'boxShadow'       => '0px 0px 0px 0px  #333333',
				'top'             => 'auto',
				'right'           => 'auto',
				'bottom'          => 'auto',
				'left'            => 'auto',
				'flexFlow'        => 'row',
				'justifyContent'  => 'center',
				'gap'             => '10px',
				'height'          => 'auto',
				'paddingTop'      => '0px',
				'paddingBottom'   => '0px',
				'paddingLeft'     => '0px',
				'paddingRight'    => '0px',
				'marginTop'       => '30px',
				'float'           => 'none',
			)
		);
		self::replace_style_state(
			$style,
			'meta',
			array(
				'boxShadow'               => '0px 0px 0px 0px  #333333',
				'fontFamily'              => 'DM Sans',
				'height'                  => 'auto',
				'width'                   => 'auto',
				'paddingTop'              => '12px',
				'paddingBottom'           => '12px',
				'paddingLeft'             => '25px',
				'paddingRight'            => '25px',
				'borderTopWidth'          => '1px',
				'borderRightWidth'        => '1px',
				'borderBottomWidth'       => '1px',
				'borderLeftWidth'         => '1px',
				'borderTopColor'          => 'rgb(221,221,221)',
				'borderRightColor'        => 'rgb(221,221,221)',
				'borderBottomColor'       => 'rgb(221,221,221)',
				'borderLeftColor'         => 'rgb(221,221,221)',
				'borderTopStyle'          => 'solid',
				'borderRightStyle'        => 'solid',
				'borderBottomStyle'       => 'solid',
				'borderLeftStyle'         => 'solid',
				'fontSize'                => '16px',
				'borderTopLeftRadius'     => '5px',
				'borderTopRightRadius'    => '5px',
				'borderBottomLeftRadius'  => '5px',
				'borderBottomRightRadius' => '5px',
				'backgroundColor'         => 'rgb(255,255,255)',
				'display'                 => 'flex',
				'flexFlow'                => 'row',
				'gap'                     => '8px',
			)
		);
		self::replace_style_state( $style, 'meta', array( 'backgroundColor' => 'rgb(246,247,251)' ), 'hover' );
		self::replace_style_state(
			$style,
			'meta1',
			array(
				'boxShadow'               => '0px 0px 0px 0px  #333333',
				'fontFamily'              => 'DM Sans',
				'width'                   => '48px',
				'height'                  => '48px',
				'paddingTop'              => '0px',
				'paddingBottom'           => '0px',
				'paddingLeft'             => '0px',
				'paddingRight'            => '0px',
				'borderTopWidth'          => '1px',
				'borderRightWidth'        => '1px',
				'borderBottomWidth'       => '1px',
				'borderLeftWidth'         => '1px',
				'borderTopColor'          => 'rgb(221,221,221)',
				'borderRightColor'        => 'rgb(221,221,221)',
				'borderBottomColor'       => 'rgb(221,221,221)',
				'borderLeftColor'         => 'rgb(221,221,221)',
				'borderTopStyle'          => 'solid',
				'borderRightStyle'        => 'solid',
				'borderBottomStyle'       => 'solid',
				'borderLeftStyle'         => 'solid',
				'fontSize'                => '16px',
				'borderTopLeftRadius'     => '5px',
				'borderTopRightRadius'    => '5px',
				'borderBottomLeftRadius'  => '5px',
				'borderBottomRightRadius' => '5px',
				'backgroundColor'         => 'rgb(255,255,255)',
			)
		);
		self::replace_style_state( $style, 'meta1', array( 'backgroundColor' => 'rgb(246,247,251)' ), 'hover' );
		self::replace_style_state(
			$style,
			'meta1',
			array(
				'backgroundColor' => 'rgb(96,96,96)',
				'color'           => 'rgb(255,255,255)',
			),
			'selected'
		);
		self::replace_style_state(
			$style,
			'meta2',
			array(
				'display'        => 'flex',
				'flexFlow'       => 'row',
				'float'          => 'none',
				'gap'            => '10px',
				'justifyContent' => 'center',
				'alignItems'     => 'center',
			)
		);
		return $style;
	}

	/**
	 * @param array<int, string> $parts Parts.
	 * @return object
	 */
	private static function empty_part_style( $parts ) {
		$style = new stdClass();
		foreach ( $parts as $part ) {
			$part = sanitize_key( (string) $part );
			if ( '' === $part ) {
				continue;
			}
			$bucket = new stdClass();
			foreach ( array( 'desktop', 'tablet', 'mobile' ) as $device ) {
				$bucket->{$device} = (object) array(
					'default'  => new stdClass(),
					'hover'    => new stdClass(),
					'selected' => new stdClass(),
				);
			}
			$style->{$part} = $bucket;
		}
		return $style;
	}

	/**
	 * @param object $doc Layout.
	 * @param string $tree filter|post.
	 * @return array
	 */
	private static function tree_data( $doc, $tree ) {
		if ( 'post' === $tree ) {
			return isset( $doc->post_layout_data->initial_data ) && is_array( $doc->post_layout_data->initial_data )
				? $doc->post_layout_data->initial_data
				: array();
		}
		return isset( $doc->filter_layout_data->initial_data ) && is_array( $doc->filter_layout_data->initial_data )
			? $doc->filter_layout_data->initial_data
			: array();
	}

	/**
	 * @param mixed  $nodes Tree.
	 * @param string $type Type.
	 * @return object|null
	 */
	private static function find_type( $nodes, $type ) {
		if ( ! is_array( $nodes ) ) {
			return null;
		}
		foreach ( $nodes as $node ) {
			if ( is_object( $node ) && isset( $node->type ) && (string) $node->type === $type ) {
				return $node;
			}
			if ( is_object( $node ) && isset( $node->data ) ) {
				$hit = self::find_type( $node->data, $type );
				if ( $hit ) {
					return $hit;
				}
			}
		}
		return null;
	}

	/**
	 * @param string $code Code.
	 * @param string $message Message.
	 * @return WP_Error
	 */
	private static function err( $code, $message ) {
		return new WP_Error( $code, $message, array( 'status' => 400 ) );
	}

	/**
	 * @param mixed  $nodes Tree.
	 * @param string $key Module key.
	 * @return object|null
	 */
	private static function find_module_key( $nodes, $key ) {
		if ( ! is_array( $nodes ) ) {
			return null;
		}
		foreach ( $nodes as $node ) {
			if ( is_object( $node ) && isset( $node->key ) && (string) $node->key === $key && isset( $node->type ) && 'module' === $node->type ) {
				return $node;
			}
			if ( is_object( $node ) && isset( $node->data ) ) {
				$hit = self::find_module_key( $node->data, $key );
				if ( $hit ) {
					return $hit;
				}
			}
		}
		return null;
	}
}

}
