<?php
/**
 * Frontend Builder CSS Collector
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Builder_Css {

	/**
	 * Collected CSS rules.
	 *
	 * @var array
	 */
	protected $rules = array();

	/**
	 * Whether new CSS rules should be collected.
	 *
	 * @var bool
	 */
	protected $collection_enabled = true;

	/**
	 * Stop collecting CSS (used during lightweight AJAX post refreshes).
	 *
	 * @return void
	 */
	public function disable_collection() {
		$this->collection_enabled = false;
	}

	/**
	 * Re-enable CSS collection.
	 *
	 * @return void
	 */
	public function enable_collection() {
		$this->collection_enabled = true;
	}

	/**
	 * Whether CSS collection is active.
	 *
	 * @return bool
	 */
	public function is_collection_enabled() {
		return $this->collection_enabled;
	}

	/**
	 * Add a CSS rule block.
	 *
	 * @param string $css CSS string.
	 * @return void
	 */
	public function add( $css ) {
		if ( ! $this->collection_enabled || ! is_string( $css ) ) {
			return;
		}

		$css = trim( $css );

		if ( '' === $css ) {
			return;
		}

		$this->rules[] = $css;
	}

	/**
	 * Add multiple CSS rule blocks.
	 *
	 * @param array $css_rules Array of CSS strings.
	 * @return void
	 */
	public function add_multiple( $css_rules ) {
		if ( ! is_array( $css_rules ) ) {
			return;
		}

		foreach ( $css_rules as $css ) {
			$this->add( $css );
		}
	}

	/**
	 * Add CSS only if condition is true.
	 *
	 * @param bool   $condition Whether CSS should be added.
	 * @param string $css       CSS string.
	 * @return void
	 */
	public function add_if( $condition, $css ) {
		if ( ! $condition ) {
			return;
		}

		$this->add( $css );
	}

	/**
	 * Check whether any CSS exists.
	 *
	 * @return bool
	 */
	public function has_css() {
		return ! empty( $this->rules );
	}

	/**
	 * Get all collected CSS rules as array.
	 *
	 * @return array
	 */
	public function get_rules() {
		return $this->rules;
	}

	/**
	 * Get final CSS output string.
	 *
	 * @return string
	 */
	public function get_css() {
		if ( empty( $this->rules ) ) {
			return '';
		}

		return implode( "\n", $this->rules );
	}

	/**
	 * Get unique CSS output string.
	 *
	 * Useful if repeated generation adds same CSS block multiple times.
	 *
	 * @return string
	 */
	public function get_unique_css() {
		if ( empty( $this->rules ) ) {
			return '';
		}

		if ( ! class_exists( 'CAF_Builder_Css_Optimizer' ) ) {
			require_once __DIR__ . '/class-caf-builder-css-optimizer.php';
		}

		return CAF_Builder_Css_Optimizer::optimize_collected_css( $this->rules );
	}

	/**
	 * Merge another CSS collector into this one.
	 *
	 * @param CAF_Builder_Css $css_builder Another CSS builder instance.
	 * @return void
	 */
	public function merge( $css_builder ) {
		if ( ! $css_builder instanceof CAF_Builder_Css ) {
			return;
		}

		$this->add_multiple( $css_builder->get_rules() );
	}

	/**
	 * Clear collected CSS.
	 *
	 * @return void
	 */
	public function reset() {
		$this->rules = array();
	}
}