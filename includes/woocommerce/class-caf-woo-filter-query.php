<?php
/**
 * WooCommerce filter query adjustments.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Woo_Filter_Query {

	/**
	 * Register query hooks.
	 */
	public static function init() {
		add_filter( 'caf_builder_ajax_query_args', array( __CLASS__, 'filter_ajax_query_args' ), 20, 2 );
	}

	/**
	 * Apply WooCommerce-specific query transformations.
	 *
	 * @param array<string, mixed> $args    Query args.
	 * @param array<string, mixed> $context Hook context.
	 * @return array<string, mixed>
	 */
	public static function filter_ajax_query_args( $args, $context ) {
		if ( ! is_array( $args ) ) {
			return $args;
		}

		$args = self::apply_on_sale_filter( $args );
		$args = self::apply_rating_filter( $args );
		$args = self::normalize_stock_meta_query( $args );

		return $args;
	}

	/**
	 * @param array<string, mixed> $args Query args.
	 * @return array<string, mixed>
	 */
	protected static function apply_on_sale_filter( $args ) {
		if ( empty( $args['meta_query'] ) || ! is_array( $args['meta_query'] ) ) {
			return $args;
		}

		$sale_values = self::collect_meta_values_for_key( $args['meta_query'], '_on_sale' );
		if ( empty( $sale_values ) ) {
			return $args;
		}

		$sale_ids = CAF_Woo_Filter_Helper::get_on_sale_product_ids();
		$args['meta_query'] = self::strip_meta_key_from_query( $args['meta_query'], '_on_sale' );

		if ( empty( $sale_ids ) ) {
			$args['post__in'] = array( 0 );
			return $args;
		}

		if ( ! empty( $args['post__in'] ) && is_array( $args['post__in'] ) ) {
			$args['post__in'] = array_values( array_intersect( array_map( 'absint', $args['post__in'] ), $sale_ids ) );
			if ( empty( $args['post__in'] ) ) {
				$args['post__in'] = array( 0 );
			}
		} else {
			$args['post__in'] = $sale_ids;
		}

		if ( empty( $args['meta_query'] ) ) {
			unset( $args['meta_query'] );
		}

		return $args;
	}

	/**
	 * Rating uses the highest selected threshold only (OR semantics across stars).
	 *
	 * @param array<string, mixed> $args Query args.
	 * @return array<string, mixed>
	 */
	protected static function apply_rating_filter( $args ) {
		if ( empty( $args['meta_query'] ) || ! is_array( $args['meta_query'] ) ) {
			return $args;
		}

		$rating_values = self::collect_meta_values_for_key( $args['meta_query'], '_wc_average_rating' );
		if ( empty( $rating_values ) ) {
			return $args;
		}

		$threshold = max( array_map( 'floatval', $rating_values ) );
		$args['meta_query'] = self::replace_meta_key_clauses(
			$args['meta_query'],
			'_wc_average_rating',
			array(
				'key'     => '_wc_average_rating',
				'value'   => $threshold,
				'compare' => '>=',
				'type'    => 'DECIMAL',
			)
		);

		return $args;
	}

	/**
	 * @param array<string, mixed> $args Query args.
	 * @return array<string, mixed>
	 */
	protected static function normalize_stock_meta_query( $args ) {
		if ( empty( $args['meta_query'] ) || ! is_array( $args['meta_query'] ) ) {
			return $args;
		}

		$args['meta_query'] = self::map_meta_clauses(
			$args['meta_query'],
			static function ( $clause ) {
				if ( ! is_array( $clause ) || empty( $clause['key'] ) || '_stock_status' !== $clause['key'] ) {
					return $clause;
				}

				if ( isset( $clause['value'] ) && is_array( $clause['value'] ) ) {
					$clause['compare'] = 'IN';
					$clause['type']    = 'CHAR';
				}

				return $clause;
			}
		);

		return $args;
	}

	/**
	 * @param array<string, mixed> $meta_query Meta query.
	 * @param string               $meta_key   Meta key.
	 * @return array<string, mixed>
	 */
	protected static function strip_meta_key_from_query( $meta_query, $meta_key ) {
		return self::map_meta_clauses(
			$meta_query,
			static function ( $clause ) use ( $meta_key ) {
				if ( is_array( $clause ) && isset( $clause['key'] ) && $meta_key === $clause['key'] ) {
					return null;
				}
				return $clause;
			}
		);
	}

	/**
	 * @param array<string, mixed> $meta_query Meta query.
	 * @param string               $meta_key   Meta key.
	 * @param array<string, mixed> $replacement Replacement clause.
	 * @return array<string, mixed>
	 */
	protected static function replace_meta_key_clauses( $meta_query, $meta_key, $replacement ) {
		$found = false;
		$next  = self::map_meta_clauses(
			$meta_query,
			static function ( $clause ) use ( $meta_key, $replacement, &$found ) {
				if ( is_array( $clause ) && isset( $clause['key'] ) && $meta_key === $clause['key'] ) {
					if ( ! $found ) {
						$found = true;
						return $replacement;
					}
					return null;
				}
				return $clause;
			}
		);

		if ( ! $found ) {
			$next[] = $replacement;
		}

		return $next;
	}

	/**
	 * @param array<string, mixed> $meta_query Meta query.
	 * @param string               $meta_key   Meta key.
	 * @return array<int, mixed>
	 */
	protected static function collect_meta_values_for_key( $meta_query, $meta_key ) {
		$values = array();
		self::map_meta_clauses(
			$meta_query,
			static function ( $clause ) use ( $meta_key, &$values ) {
				if ( is_array( $clause ) && isset( $clause['key'] ) && $meta_key === $clause['key'] ) {
					if ( isset( $clause['value'] ) && is_array( $clause['value'] ) ) {
						$values = array_merge( $values, $clause['value'] );
					} elseif ( isset( $clause['value'] ) ) {
						$values[] = $clause['value'];
					}
				}
				return $clause;
			}
		);
		return $values;
	}

	/**
	 * @param array<string, mixed> $meta_query Meta query.
	 * @param callable             $mapper     Mapper callback.
	 * @return array<string, mixed>
	 */
	protected static function map_meta_clauses( $meta_query, $mapper ) {
		if ( ! is_array( $meta_query ) ) {
			return $meta_query;
		}

		$next = array();
		foreach ( $meta_query as $key => $clause ) {
			if ( 'relation' === $key ) {
				$next['relation'] = $clause;
				continue;
			}

			if ( is_array( $clause ) && isset( $clause['relation'] ) ) {
				$mapped = self::map_meta_clauses( $clause, $mapper );
				if ( ! empty( $mapped ) ) {
					$next[] = $mapped;
				}
				continue;
			}

			$mapped = $mapper( $clause );
			if ( null !== $mapped ) {
				$next[] = $mapped;
			}
		}

		return $next;
	}
}

CAF_Woo_Filter_Query::init();
