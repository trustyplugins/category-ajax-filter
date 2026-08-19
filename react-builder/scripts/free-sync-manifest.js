/**
 * Explicit Pro → Free sync allowlist.
 *
 * Add a file here only after confirming that it contains no Pro-only runtime
 * behavior. Nothing under Pro includes/woocommerce is copied implicitly.
 */
module.exports = {
  wooRuntimeFiles: [
    'includes/woocommerce/class-caf-free-woo.php',
    'includes/frontend/modules/filters/class-caf-filter-range-slider-module.php',
  ],
  /** Shared Free+Pro runtime (no Pro-only behavior). */
  sharedRuntimeFiles: [
    'includes/elementor/class-caf-elementor.php',
    'includes/elementor/widgets/class-caf-elementor-layout-widget.php',
  ],
};
