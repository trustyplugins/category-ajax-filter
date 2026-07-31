<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}
// Marks Free shared runtime for Pro conflict detection (avoid Cannot redeclare fatals).
if (!defined('CAF_FREE_RUNTIME_LOADED')) {
    define('CAF_FREE_RUNTIME_LOADED', true);
}
require_once TC_CAF_PATH . 'includes/builder/class-caf-builder-tier.php';
require_once TC_CAF_PATH . 'includes/admin/class-caf-support-diagnostics.php';
require_once TC_CAF_PATH . 'includes/class-caf-builder-frontend.php';
require_once TC_CAF_PATH . 'admin/functions.php';
new CAF_init();
new CAF_Embed_Admin_Css_Js;
new CAF_Meta_Boxes();
require_once TC_CAF_PATH . 'admin/class-caf-builder-admin.php';
require_once TC_CAF_PATH . 'admin/builder-functions.php';
CAF_Support_Diagnostics::init();
CAF_Builder_Frontend::instance();
new CAF_load_scripts();
new CAF_shortcode();
require TC_CAF_PATH . 'admin/ajax-actions.php';
new CAF_admin_ajax();

// Elementor: simple CAF Filter picker widget.
$caf_elementor_bootstrap = TC_CAF_PATH . 'includes/elementor/class-caf-elementor.php';
if ( file_exists( $caf_elementor_bootstrap ) ) {
	require_once $caf_elementor_bootstrap;
	if ( class_exists( 'CAF_Elementor' ) ) {
		CAF_Elementor::instance();
	}
}
