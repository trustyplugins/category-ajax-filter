<?php
/**
 * Frontend Builder Query Handler
 *
 * @package TC_CAF_PRO
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_PRO_Builder_Query {

	/**
	 * Builder data handler instance.
	 *
	 * @var CAF_PRO_Builder_Data
	 */
	protected $data_handler;

	/**
	 * Last built query args.
	 *
	 * @var array
	 */
	protected $query_args = array();

	/**
	 * Constructor.
	 *
	 * @param CAF_PRO_Builder_Data $data_handler Builder data handler.
	 */
	public function __construct( CAF_PRO_Builder_Data $data_handler ) {
		$this->data_handler = $data_handler;
	}

	/**
	 * Get last built query args.
	 *
	 * @return array
	 */
	public function get_query_args() {
		return $this->query_args;
	}

	/**
	 * Build initial page load query.
	 *
	 * @return WP_Query
	 */
	public function get_page_load_query() {
		$args = $this->get_page_load_args();
		$args = apply_filters(
			'caf_builder_query_args',
			$args,
			$this->get_hook_context(
				array(
					'mode' => 'page_load',
				)
			)
		);

		$args             = $this->sanitize_query_args( $args );
		$this->query_args = $args;
		do_action( 'caf_builder_before_query', $args, $this->get_hook_context( array( 'mode' => 'page_load' ) ) );
		$query = new WP_Query( $args );
		do_action( 'caf_builder_after_query', $query, $args, $this->get_hook_context( array( 'mode' => 'page_load' ) ) );
		return $query;
	}
	/**
	 * Set query args manually.
	 *
	 * @param array $query_args Query arguments.
	 * @return void
	 */
	public function set_query_args( $query_args ) {
		$this->query_args = $this->sanitize_query_args( $query_args );
	}
	/**
	 * Build manual filter query from saved filter query data.
	 *
	 * @return WP_Query
	 */
	public function get_filter_query() {
		$args = $this->get_filter_query_args();
		$args = apply_filters(
			'caf_builder_query_args',
			$args,
			$this->get_hook_context(
				array(
					'mode' => 'filter_query',
				)
			)
		);

		$args             = $this->sanitize_query_args( $args );
		$this->query_args = $args;
		do_action( 'caf_builder_before_query', $args, $this->get_hook_context( array( 'mode' => 'filter_query' ) ) );
		$query = new WP_Query( $args );
		do_action( 'caf_builder_after_query', $query, $args, $this->get_hook_context( array( 'mode' => 'filter_query' ) ) );
		return $query;
	}

	/**
	 * Build page load query args.
	 *
	 * This matches your previous build_query_page_load() logic.
	 *
	 * @return array
	 */
	public function get_page_load_args() {
		$tax_query            = array();
		$meta_query           = array();
		$filter_loop_data     = $this->data_handler->get_filter_layout_loop_data();
		// Saved options may decode filter rows as nested arrays; normalize to objects for $row->data access.
		if ( ! empty( $filter_loop_data ) && is_array( $filter_loop_data ) && isset( $filter_loop_data[0] ) && is_array( $filter_loop_data[0] ) ) {
			$decoded = json_decode( wp_json_encode( $filter_loop_data ), false );
			if ( is_array( $decoded ) ) {
				$filter_loop_data = $decoded;
			}
		}
		$filter_layout_extra  = $this->data_handler->get_filter_layout_extra_data();
		$misc_pagination_data = $this->data_handler->get_misc_pagination();
		// echo "<pre>";
		// print_r($misc_pagination_data);
		// echo "</pre>";
		$taxonomy_relation = $this->normalize_tax_query_root_relation(
			isset( $filter_layout_extra->taxonomy_relation ) ? $filter_layout_extra->taxonomy_relation : 'OR'
		);
		$meta_relation     = $this->normalize_meta_query_root_relation(
			isset( $filter_layout_extra->meta_relation ) ? $filter_layout_extra->meta_relation : 'OR'
		);
		$posts_per_page    = isset( $misc_pagination_data->settings->posts_per_page ) ? absint( $misc_pagination_data->settings->posts_per_page ) : 10;

		if ( ! empty( $filter_loop_data ) ) {
			foreach ( $filter_loop_data as $row ) {
				if ( empty( $row->data ) || ! is_array( $row->data ) ) {
					continue;
				}

				foreach ( $row->data as $column ) {
					if ( empty( $column->data ) || ! is_array( $column->data ) ) {
						continue;
					}

					foreach ( $column->data as $module ) {
						if ( empty( $module->settings ) || ! is_object( $module->settings ) ) {
							continue;
						}

						if ( in_array( $module->key, array( 'search', 'reset' ), true ) ) {
							continue;
						}

						$module_type     = isset( $module->key ) ? sanitize_key( $module->key ) : 'unknown';
						$module_settings = apply_filters(
							'caf_builder_module_settings',
							$module->settings,
							$this->get_hook_context(
								array(
									'mode'        => 'page_load',
									'module_type' => $module_type,
									'module'      => $module,
								)
							)
						);
						if ( ! is_object( $module_settings ) ) {
							if ( is_array( $module_settings ) ) {
								$module_settings = json_decode( wp_json_encode( $module_settings ), false );
							}
							if ( ! is_object( $module_settings ) ) {
								$module_settings = is_array( $module_settings ) ? (object) $module_settings : new stdClass();
							}
						}
						$multiple_term   = isset( $module_settings->multiple_term ) ? $module_settings->multiple_term : 'false';
						$cat_relation    = isset( $module_settings->category_relation ) ? $module_settings->category_relation : 'OR';

						if ( isset( $module_settings->data_source ) && 'taxonomy' === $module_settings->data_source ) {
							$module_tax_query = $this->build_tax_query_from_module( $module_settings, $multiple_term, $cat_relation );

							$module_tax_query = apply_filters(
								'caf_builder_module_tax_query',
								$module_tax_query,
								$this->get_hook_context(
									array(
										'mode'            => 'page_load',
										'module_type'     => $module_type,
										'module'          => $module,
										'module_settings' => $module_settings,
									)
								)
							);

							if ( ! empty( $module_tax_query ) ) {
								foreach ( $module_tax_query as $tax_piece ) {
									$tax_query[] = $tax_piece;
								}
							}
						}

						if ( isset( $module_settings->data_source ) && 'custom_field' === $module_settings->data_source ) {
							$module_meta_query = $this->build_meta_query_from_module( $module_settings, $multiple_term, $module_type );

							$module_meta_query = apply_filters(
								'caf_builder_module_meta_query',
								$module_meta_query,
								$this->get_hook_context(
									array(
										'mode'            => 'page_load',
										'module_type'     => $module_type,
										'module'          => $module,
										'module_settings' => $module_settings,
									)
								)
							);

							if ( ! empty( $module_meta_query ) ) {
								$meta_query[] = $module_meta_query;
							}
						}
					}
				}
			}
		}

		$tax_query = apply_filters( 'caf_builder_page_load_tax_query', $tax_query, $this->get_hook_context( array( 'mode' => 'page_load' ) ) );
		if ( count( $tax_query ) > 1 ) {
			$tax_query['relation'] = $taxonomy_relation;
		}

		$meta_query = apply_filters( 'caf_builder_page_load_meta_query', $meta_query, $this->get_hook_context( array( 'mode' => 'page_load' ) ) );
		if ( count( $meta_query ) > 1 ) {
			$meta_query['relation'] = $meta_relation;
		}

		$args = array(
			'post_type'      => $this->data_handler->get_post_type(),
			'post_status'    => 'publish',
			'posts_per_page' => $posts_per_page > 0 ? $posts_per_page : 2,
			'paged'          => 1,
		);

		if ( ! empty( $tax_query ) ) {
			$args['tax_query'] = $tax_query;
		}

		if ( ! empty( $meta_query ) ) {
			$args['meta_query'] = $meta_query;
		}

		$args = $this->data_handler->apply_default_sort_to_query_args( $args );

		$args = apply_filters( 'caf_builder_page_load_query_args', $args, $this->get_hook_context( array( 'mode' => 'page_load' ) ) );

		if ( $this->should_log_page_load_debug() ) {
			$this->log_page_load_debug(
				array(
					'builder_index' => $this->data_handler->get_short_index(),
					'has_filters'   => $this->data_handler->has_filters(),
					'tax_query'      => isset( $args['tax_query'] ) ? $args['tax_query'] : array(),
					'meta_query'     => isset( $args['meta_query'] ) ? $args['meta_query'] : array(),
					'post_type'      => isset( $args['post_type'] ) ? $args['post_type'] : '',
					'posts_per_page' => isset( $args['posts_per_page'] ) ? $args['posts_per_page'] : '',
				)
			);
		}

		return $args;
	}

	/**
	 * Whether to log page-load query debug (constant, filter, or admin query arg).
	 *
	 * @return bool
	 */
	protected function should_log_page_load_debug() {
		if ( defined( 'CAF_PRO_DEBUG_PAGE_LOAD' ) && CAF_PRO_DEBUG_PAGE_LOAD ) {
			return true;
		}
		if ( apply_filters( 'caf_pro_debug_page_load_query', false, $this->get_hook_context( array( 'mode' => 'page_load' ) ) ) ) {
			return true;
		}
		if ( is_admin() ) {
			return false;
		}
		if ( ! function_exists( 'wp_get_current_user' ) ) {
			return false;
		}
		$user = wp_get_current_user();
		if ( ! $user || ! $user->exists() ) {
			return false;
		}
		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}
		return isset( $_GET['caf_debug_page_load'] ) && '1' === (string) wp_unslash( $_GET['caf_debug_page_load'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
	}

	/**
	 * Log page-load tax/meta for debugging (PHP error_log or caf_pro_page_load_debug action).
	 *
	 * @param array $payload Debug payload.
	 * @return void
	 */
	protected function log_page_load_debug( array $payload ) {
		do_action( 'caf_pro_page_load_debug', $payload, $this->get_hook_context( array( 'mode' => 'page_load' ) ) );
		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		error_log( '[CAF_PRO page_load] ' . wp_json_encode( $payload, JSON_UNESCAPED_SLASHES | JSON_PARTIAL_OUTPUT_ON_ERROR ) );
	}

	/**
	 * Build filter query args from filter_query_data.
	 *
	 * This matches your previous build_filter_query() logic.
	 *
	 * @return array
	 */
	public function get_filter_query_args() {
		$tax_query         = array();
		$meta_query        = array();
		$filter_query_data = $this->data_handler->get_filter_query_data();

		if ( isset( $filter_query_data->data_source->taxonomy ) && 'true' === $filter_query_data->data_source->taxonomy ) {
			$taxonomy_data = isset( $filter_query_data->taxonomy_data ) ? $filter_query_data->taxonomy_data : array();

			if ( is_array( $taxonomy_data ) && ! empty( $taxonomy_data ) ) {
				$tax_query = $this->build_tax_query_groups( $taxonomy_data );
			}
		}

		if ( isset( $filter_query_data->data_source->custom_field ) && 'true' === $filter_query_data->data_source->custom_field ) {
			$custom_field_data = isset( $filter_query_data->custom_field_data ) ? $filter_query_data->custom_field_data : array();

			if ( is_array( $custom_field_data ) && ! empty( $custom_field_data ) ) {
				$meta_query = $this->build_meta_query_groups( $custom_field_data );
			}
		}
		$tax_query  = apply_filters( 'caf_builder_filter_tax_query', $tax_query, $this->get_hook_context( array( 'mode' => 'filter_query' ) ) );
		$meta_query = apply_filters( 'caf_builder_filter_meta_query', $meta_query, $this->get_hook_context( array( 'mode' => 'filter_query' ) ) );

		$args = array(
			'post_type'      => $this->data_handler->get_post_type(),
			'post_status'    => 'publish',
			'posts_per_page' => -1,
		);

		if ( ! empty( $tax_query ) ) {
			$args['tax_query'] = $tax_query;
		}

		if ( ! empty( $meta_query ) ) {
			$args['meta_query'] = $meta_query;
		}

		return apply_filters( 'caf_builder_filter_query_args', $args, $this->get_hook_context( array( 'mode' => 'filter_query' ) ) );
	}

	/**
	 * Build common hook context.
	 *
	 * @param array $extra Additional context values.
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
	 * Build taxonomy query array from grouped taxonomy data.
	 *
	 * @param array $taxonomy_data Grouped taxonomy data.
	 * @return array
	 */
	public function build_tax_query_groups( $taxonomy_data ) {
		$tax_query = array();

		foreach ( $taxonomy_data as $group ) {
			$group_entry = array(
				'relation' => 'AND',
			);

			foreach ( $group as $tax ) {
				$term_ids = array();

				if ( ! empty( $tax->term_data ) ) {
					$term_ids = array_column( (array) $tax->term_data, 'key' );
				}

				if ( empty( $term_ids ) ) {
					continue;
				}

				$group_entry[] = array(
					'taxonomy' => isset( $tax->key ) ? $tax->key : '',
					'field'    => 'term_id',
					'terms'    => $term_ids,
					'operator' => isset( $tax->operator ) ? $tax->operator : 'IN',
				);
			}

			if ( count( $group_entry ) <= 1 ) {
				continue;
			}

			$tax_query[] = $group_entry;
		}

		if ( empty( $tax_query ) ) {
			return array();
		}

		if ( count( $tax_query ) > 1 ) {
			$tax_query['relation'] = 'OR';
		}

		return $tax_query;
	}

	/**
	 * Build meta query array from grouped custom field data.
	 *
	 * @param array $custom_field_data Grouped custom field data.
	 * @return array
	 */
	public function build_meta_query_groups( $custom_field_data ) {
		$meta_query = array(
			'relation' => 'OR',
		);

		foreach ( $custom_field_data as $group ) {
			$group_entry = array(
				'relation' => 'AND',
			);

			foreach ( $group as $field ) {
				$values = isset( $field->custom_field_value_list ) ? (array) $field->custom_field_value_list : array();

				if ( empty( $values ) ) {
					continue;
				}

				$compare = isset( $field->compare_operator ) ? $field->compare_operator : '=';
				$value   = count( $values ) > 1 ? $values : $values[0];

				if ( count( $values ) > 1 && '=' === $compare ) {
					$compare = 'IN';
				}

				$group_entry[] = array(
					'key'     => isset( $field->custom_field_key ) ? $field->custom_field_key : '',
					'value'   => $value,
					'compare' => $compare,
					'type'    => isset( $field->meta_type ) ? $field->meta_type : 'CHAR',
				);
			}

			if ( count( $group_entry ) <= 1 ) {
				continue;
			}

			$meta_query[] = $group_entry;
		}

		return count( $meta_query ) > 1 ? $meta_query : array();
	}

	/**
	 * Coerce predefined_terms (array, associative object, or string) to a list of strings.
	 *
	 * @param mixed $value Raw predefined_terms.
	 * @return string[]
	 */
	protected function normalize_settings_string_list( $value ) {
		if ( null === $value || false === $value ) {
			return array();
		}
		if ( is_string( $value ) ) {
			$t = trim( $value );
			return '' === $t ? array() : array( $t );
		}
		if ( is_array( $value ) ) {
			$out = array();
			foreach ( $value as $v ) {
				$t = trim( (string) $v );
				if ( '' !== $t ) {
					$out[] = $t;
				}
			}
			return $out;
		}
		if ( is_object( $value ) ) {
			$out = array();
			foreach ( (array) $value as $v ) {
				if ( is_scalar( $v ) ) {
					$t = trim( (string) $v );
					if ( '' !== $t ) {
						$out[] = $t;
					}
				}
			}
			return $out;
		}
		return array();
	}

	/**
	 * Module taxonomy_data as array of row objects (fixes nested arrays from get_option).
	 *
	 * @param object $module_settings Module settings.
	 * @return array
	 */
	protected function get_normalized_module_taxonomy_data( $module_settings ) {
		if ( empty( $module_settings->taxonomy_data ) || ! is_array( $module_settings->taxonomy_data ) ) {
			return array();
		}
		$rows = $module_settings->taxonomy_data;
		if ( isset( $rows[0] ) && is_array( $rows[0] ) ) {
			$decoded = json_decode( wp_json_encode( $rows ), false );
			$rows    = is_array( $decoded ) ? $decoded : $rows;
		}
		return $rows;
	}

	/**
	 * Resolve a bare term key (no "taxonomy___" prefix) to taxonomy___term_id using layout taxonomy_data.
	 *
	 * @param object $module_settings Module settings.
	 * @param string $bare_key        Term key / id from saved data.
	 * @return string Empty string if not found.
	 */
	protected function resolve_taxonomy_predefined_token( $module_settings, $bare_key ) {
		$bare_key = trim( (string) $bare_key );
		if ( '' === $bare_key || false !== strpos( $bare_key, '___' ) ) {
			return '';
		}
		$taxonomy_rows = $this->get_normalized_module_taxonomy_data( $module_settings );
		if ( empty( $taxonomy_rows ) ) {
			return '';
		}
		$finder = function ( $nodes, $tax_key ) use ( &$finder, $bare_key ) {
			if ( ! is_array( $nodes ) ) {
				return '';
			}
			foreach ( $nodes as $td ) {
				if ( is_object( $td ) && isset( $td->key ) && (string) $td->key === $bare_key ) {
					return (string) $tax_key . '___' . (string) $td->key;
				}
				if ( is_object( $td ) && ! empty( $td->children_data ) && is_array( $td->children_data ) ) {
					$found = $finder( $td->children_data, $tax_key );
					if ( '' !== $found ) {
						return $found;
					}
				}
			}
			return '';
		};
		foreach ( $taxonomy_rows as $tax ) {
			if ( empty( $tax->key ) || empty( $tax->term_data ) || ! is_array( $tax->term_data ) ) {
				continue;
			}
			$found = $finder( $tax->term_data, (string) $tax->key );
			if ( '' !== $found ) {
				return $found;
			}
		}
		return '';
	}

	/**
	 * Collect taxonomy___term_id tokens from predefined_terms plus term_data.predefine (single- and multi-select).
	 * Normalizes bare term ids to taxonomy___term_id for page-load tax_query.
	 *
	 * @param object $module_settings Module settings.
	 * @return string[]
	 */
	protected function get_effective_taxonomy_predefined_tokens( $module_settings ) {
		$tokens = $this->normalize_settings_string_list(
			isset( $module_settings->predefined_terms ) ? $module_settings->predefined_terms : null
		);

		// Always merge term rows marked default in the layout (needed for single-select checkboxes/dropdowns).
		$taxonomy_rows = $this->get_normalized_module_taxonomy_data( $module_settings );
		if ( ! empty( $taxonomy_rows ) ) {
			$walker = function ( $nodes, $tax_key ) use ( &$walker, &$tokens ) {
				if ( ! is_array( $nodes ) ) {
					return;
				}
				foreach ( $nodes as $td ) {
					if ( is_object( $td ) && isset( $td->key ) && ! empty( $td->predefine ) && 'true' === (string) $td->predefine ) {
						$tok = (string) $tax_key . '___' . (string) $td->key;
						if ( ! in_array( $tok, $tokens, true ) ) {
							$tokens[] = $tok;
						}
					}
					if ( is_object( $td ) && ! empty( $td->children_data ) && is_array( $td->children_data ) ) {
						$walker( $td->children_data, $tax_key );
					}
				}
			};
			foreach ( $taxonomy_rows as $tax ) {
				if ( empty( $tax->key ) || empty( $tax->term_data ) || ! is_array( $tax->term_data ) ) {
					continue;
				}
				$walker( $tax->term_data, (string) $tax->key );
			}
		}

		$tokens = array_values( array_unique( $tokens ) );
		$out    = array();
		foreach ( $tokens as $tok ) {
			if ( false !== strpos( $tok, '___' ) ) {
				$out[] = $tok;
				continue;
			}
			$resolved = $this->resolve_taxonomy_predefined_token( $module_settings, $tok );
			if ( '' !== $resolved ) {
				$out[] = $resolved;
			}
		}

		return array_values( array_unique( $out ) );
	}

	/**
	 * Top-level tax_query relation from layout "Select Taxonomy Relation" (WP only allows AND/OR here).
	 *
	 * @param string $relation Raw saved value.
	 * @return string
	 */
	protected function normalize_tax_query_root_relation( $relation ) {
		$r = strtoupper( trim( (string) $relation ) );
		return ( 'AND' === $r ) ? 'AND' : 'OR';
	}

	/**
	 * Top-level meta_query relation from layout "Select Meta Relation" (WP only allows AND/OR between clauses).
	 *
	 * @param string $relation Raw saved value (may be IN, NOT IN, etc. from older UI).
	 * @return string
	 */
	protected function normalize_meta_query_root_relation( $relation ) {
		$r = strtoupper( trim( (string) $relation ) );
		return ( 'AND' === $r ) ? 'AND' : 'OR';
	}

	/**
	 * Tax query segment(s) for one filter module on page load.
	 * category_relation OR = match any selected term (IN / OR between taxonomies); AND = match all (AND operator / nested AND).
	 * Returns a list of pieces to append to the layout tax_query (layout taxonomy_relation combines multiple modules).
	 *
	 * @param object $module_settings Module settings.
	 * @param string $multiple_term   'true' if multi-select.
	 * @param string $cat_relation    Module category_relation (OR|AND).
	 * @return array List of tax_query clauses or one nested group (each item is one appendable piece).
	 */
	protected function build_tax_query_from_module( $module_settings, $multiple_term, $cat_relation ) {
		$token_list = $this->get_effective_taxonomy_predefined_tokens( $module_settings );
		if ( empty( $token_list ) ) {
			return array();
		}

		$term_and_mode = ( 'AND' === strtoupper( trim( (string) $cat_relation ) ) );

		if ( 'true' !== $multiple_term ) {
			$term = $token_list[0];
			if ( empty( $term ) ) {
				return array();
			}
			$parts = explode( '___', (string) $term, 2 );

			$taxonomy = isset( $parts[0] ) ? $parts[0] : '';
			$term_id  = isset( $parts[1] ) ? $parts[1] : '';

			if ( '' === $taxonomy || '' === $term_id ) {
				return array();
			}

			return array(
				array(
					'taxonomy' => $taxonomy,
					'field'    => 'term_id',
					'terms'    => absint( $term_id ),
					'operator' => 'IN',
				),
			);
		}

		$by_tax = array();
		foreach ( $token_list as $term ) {
			$parts = explode( '___', (string) $term, 2 );

			$taxonomy = isset( $parts[0] ) ? $parts[0] : '';
			$term_id  = isset( $parts[1] ) ? $parts[1] : '';

			if ( '' === $taxonomy || '' === $term_id ) {
				continue;
			}
			if ( ! isset( $by_tax[ $taxonomy ] ) ) {
				$by_tax[ $taxonomy ] = array();
			}
			$by_tax[ $taxonomy ][] = absint( $term_id );
		}

		foreach ( $by_tax as $tx => $ids ) {
			$by_tax[ $tx ] = array_values( array_unique( array_filter( $ids ) ) );
		}

		$clauses = array();
		foreach ( $by_tax as $taxonomy => $term_ids ) {
			if ( empty( $term_ids ) ) {
				continue;
			}
			if ( 1 === count( $term_ids ) ) {
				$clauses[] = array(
					'taxonomy' => $taxonomy,
					'field'    => 'term_id',
					'terms'    => $term_ids[0],
					'operator' => 'IN',
				);
			} else {
				$clauses[] = array(
					'taxonomy' => $taxonomy,
					'field'    => 'term_id',
					'terms'    => $term_ids,
					'operator' => $term_and_mode ? 'AND' : 'IN',
				);
			}
		}

		if ( empty( $clauses ) ) {
			return array();
		}

		if ( 1 === count( $clauses ) ) {
			return array( $clauses[0] );
		}

		$nested = array( 'relation' => $term_and_mode ? 'AND' : 'OR' );
		foreach ( $clauses as $c ) {
			$nested[] = $c;
		}

		return array( $nested );
	}

	/**
	 * Build one meta query item from one filter module.
	 *
	 * @param object $module_settings Module settings.
	 * @param string $multiple_term   Multiple term flag.
	 * @param string $module_type     Module key (unused in free tier).
	 * @return array
	 */
	protected function get_primary_custom_field_group_for_page_load( $module_settings ) {
		if ( empty( $module_settings->custom_field_data ) ) {
			return null;
		}
		$data = $module_settings->custom_field_data;
		if ( is_array( $data ) && ! empty( $data[0] ) && is_object( $data[0] ) ) {
			return $data[0];
		}
		if ( is_object( $data ) ) {
			return $data;
		}
		return null;
	}

	/**
	 * @param mixed $entry cf_predefined_terms row (object, array, or scalar).
	 * @return string
	 */
	protected function normalize_cf_predefined_entry_to_scalar( $entry ) {
		if ( is_object( $entry ) && isset( $entry->value ) ) {
			return (string) $entry->value;
		}
		if ( is_array( $entry ) && isset( $entry['value'] ) ) {
			return (string) $entry['value'];
		}
		if ( is_object( $entry ) && isset( $entry->key ) ) {
			return (string) $entry->key;
		}
		return (string) $entry;
	}

	/**
	 * Values marked predefine on custom_field_value rows (checkbox multi).
	 *
	 * @param object $module_settings Module settings.
	 * @return string[]
	 */
	protected function collect_cf_predefine_values_from_field_groups( $module_settings ) {
		$vals   = array();
		$groups = array();
		if ( ! empty( $module_settings->custom_field_data ) && is_array( $module_settings->custom_field_data ) ) {
			$groups = $module_settings->custom_field_data;
		} elseif ( ! empty( $module_settings->custom_field_data ) && is_object( $module_settings->custom_field_data ) ) {
			$groups = array( $module_settings->custom_field_data );
		}
		foreach ( $groups as $group ) {
			if ( ! is_object( $group ) ) {
				continue;
			}
			$list = array();
			if ( isset( $group->custom_field_value ) && is_array( $group->custom_field_value ) ) {
				$list = $group->custom_field_value;
			} elseif ( isset( $group->custom_field_value_list ) && is_array( $group->custom_field_value_list ) ) {
				$list = $group->custom_field_value_list;
			}
			foreach ( $list as $tv ) {
				if ( is_object( $tv ) && isset( $tv->key ) && ! empty( $tv->predefine ) && 'true' === (string) $tv->predefine ) {
					$k = (string) $tv->key;
					if ( '' !== $k && ! in_array( $k, $vals, true ) ) {
						$vals[] = $k;
					}
				}
			}
		}
		return $vals;
	}

	protected function build_meta_query_from_module( $module_settings, $multiple_term, $module_type = '' ) {
		$custom_field_data = $this->get_primary_custom_field_group_for_page_load( $module_settings );
		if ( ! $custom_field_data ) {
			return array();
		}

		$custom_field_key = isset( $custom_field_data->custom_field_key ) ? trim( (string) $custom_field_data->custom_field_key ) : '';
		if ( '' === $custom_field_key || '0' === $custom_field_key ) {
			return array();
		}

		$value = '';
		if ( 'true' === $multiple_term ) {
			$value = array();
			if ( ! empty( $module_settings->cf_predefined_terms ) && is_array( $module_settings->cf_predefined_terms ) ) {
				foreach ( $module_settings->cf_predefined_terms as $entry ) {
					$v = $this->normalize_cf_predefined_entry_to_scalar( $entry );
					if ( '' !== $v && ! in_array( $v, $value, true ) ) {
						$value[] = $v;
					}
				}
			}
			foreach ( $this->collect_cf_predefine_values_from_field_groups( $module_settings ) as $v ) {
				if ( '' !== $v && ! in_array( $v, $value, true ) ) {
					$value[] = $v;
				}
			}
		} else {
			if ( ! empty( $module_settings->cf_predefined_terms ) && is_array( $module_settings->cf_predefined_terms ) && isset( $module_settings->cf_predefined_terms[0] ) ) {
				$value = $this->normalize_cf_predefined_entry_to_scalar( $module_settings->cf_predefined_terms[0] );
			}
			if ( '' === $value ) {
				$from_groups = $this->collect_cf_predefine_values_from_field_groups( $module_settings );
				if ( ! empty( $from_groups[0] ) ) {
					$value = $from_groups[0];
				}
			}
		}

		if ( '' === $value || array() === $value ) {
			return array();
		}

		return array(
			'key'     => $custom_field_key,
			'value'   => $value,
			'compare' => isset( $custom_field_data->compare_operator ) ? $custom_field_data->compare_operator : '=',
			'type'    => isset( $custom_field_data->meta_type ) ? $custom_field_data->meta_type : 'CHAR',
		);
	}

	/**
	 * Sanitize query args after hook overrides.
	 *
	 * @param mixed $args Raw query args.
	 * @return array
	 */
	protected function sanitize_query_args( $args ) {
		if ( ! is_array( $args ) ) {
			$args = array();
		}

		$args['post_type']   = isset( $args['post_type'] ) ? $args['post_type'] : $this->data_handler->get_post_type();
		$args['post_status'] = isset( $args['post_status'] ) ? $args['post_status'] : 'publish';

		if ( isset( $args['posts_per_page'] ) ) {
			$ppp                  = (int) $args['posts_per_page'];
			$args['posts_per_page'] = ( -1 === $ppp ) ? -1 : max( 1, absint( $ppp ) );
		}

		if ( isset( $args['paged'] ) ) {
			$args['paged'] = max( 1, absint( $args['paged'] ) );
		}

		if ( isset( $args['order'] ) ) {
			$order         = strtoupper( sanitize_text_field( (string) $args['order'] ) );
			$args['order'] = in_array( $order, array( 'ASC', 'DESC' ), true ) ? $order : 'DESC';
		}

		if ( isset( $args['orderby'] ) && ! is_array( $args['orderby'] ) ) {
			$args['orderby'] = sanitize_key( (string) $args['orderby'] );
		}

		if ( isset( $args['tax_query'] ) && ! is_array( $args['tax_query'] ) ) {
			unset( $args['tax_query'] );
		}

		if ( isset( $args['meta_query'] ) && ! is_array( $args['meta_query'] ) ) {
			unset( $args['meta_query'] );
		}

		return $args;
	}
}
