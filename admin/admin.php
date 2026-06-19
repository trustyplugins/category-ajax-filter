<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}
require_once TC_CAF_PATH . 'includes/builder/class-caf-builder-tier.php';
require_once TC_CAF_PATH . 'includes/admin/class-caf-support-diagnostics.php';
require_once TC_CAF_PATH . 'admin/functions.php';
new CAF_init();
new CAF_Embed_Admin_Css_Js;
new CAF_Meta_Boxes();
require_once TC_CAF_PATH . 'admin/class-caf-builder-admin.php';
require_once TC_CAF_PATH . 'admin/builder-functions.php';
CAF_Support_Diagnostics::init();
new CAF_load_scripts();
new CAF_shortcode();
require TC_CAF_PATH . 'admin/ajax-actions.php';
new CAF_admin_ajax();
