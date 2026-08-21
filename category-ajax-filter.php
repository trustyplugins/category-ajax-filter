<?php
/*
Plugin Name: Category AJAX Filter – Posts, Custom Post Types & Product Filter
Description: Filter posts/custom post types by category without page reload. Easy to sort/filter and display posts on page with Ajax. It Supports Divi, Elementor and other page builders.
Version: 3.0.1
Author: Trusty Plugins
Author URI: https://trustyplugins.com
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain: category-ajax-filter
Domain Path: /languages
 */
// Block direct access to the main plugin file.
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/** Pro plugin basename — Free and Pro must not run together (Pro replaces Free). */
if (!defined('CAF_PRO_PLUGIN_BASENAME')) {
    define('CAF_PRO_PLUGIN_BASENAME', 'category-ajax-filter-pro/caf-pro.php');
}

/**
 * Whether the Pro plugin is currently active.
 *
 * @return bool
 */
function tc_caf_is_pro_plugin_active()
{
    if (!function_exists('is_plugin_active')) {
        require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }
    return function_exists('is_plugin_active') && is_plugin_active(CAF_PRO_PLUGIN_BASENAME);
}

/*
 * If Pro is already active, do not bootstrap Free at all.
 * Defining shared constants/functions here would break Pro (Cannot redeclare / wrong CAF_BUILDER_TIER).
 */
if (tc_caf_is_pro_plugin_active()) {
    add_action(
        'admin_notices',
        static function () {
            if (!current_user_can('activate_plugins')) {
                return;
            }
            echo '<div class="notice notice-warning is-dismissible"><p>';
            echo esc_html__(
                'Category AJAX Filter Free is installed but inactive for runtime because Category AJAX Filter Pro is active. Pro replaces Free — deactivate or delete Free to avoid confusion. Your filters are managed by Pro.',
                'category-ajax-filter'
            );
            echo '</p></div>';
        }
    );
    // Soft self-deactivate so only Pro stays in active_plugins.
    add_action(
        'plugins_loaded',
        static function () {
            if (!function_exists('deactivate_plugins')) {
                require_once ABSPATH . 'wp-admin/includes/plugin.php';
            }
            if (function_exists('deactivate_plugins') && function_exists('is_plugin_active')) {
                $free = plugin_basename(__FILE__);
                if (is_plugin_active($free) && tc_caf_is_pro_plugin_active()) {
                    deactivate_plugins($free);
                }
            }
        },
        1
    );
    return;
}

/*---- CONFIGURATION >>>> DEFINE CURRENT VERSION ----*/
if (!defined('CAF_CURRENT_VERSION')) {
    define('CAF_CURRENT_VERSION', '3.0.1');
}
if (!defined('CAF_OPTIONS')) {
    define('CAF_OPTIONS', 'Category Ajax Filter');
}
if (!defined('TC_CAF_PATH')) {
    define('TC_CAF_PATH', plugin_dir_path(__FILE__));
}
if (!defined('CAF_BUILDER_TIER')) {
    define('CAF_BUILDER_TIER', 'free');
}

require_once TC_CAF_PATH . 'includes/builder/class-caf-builder-tier.php';
require_once TC_CAF_PATH . 'includes/builder/class-caf-builder-hooks.php';
$caf_free_woo_runtime = TC_CAF_PATH . 'includes/woocommerce/class-caf-free-woo.php';
if (file_exists($caf_free_woo_runtime)) {
    require_once $caf_free_woo_runtime;
}

class TC_CAF_Plugin
{
    public function __construct()
    {
        add_action('plugins_loaded', array($this, 'tc_caf_load_plugin_textdomain'));
        $this->tc_caf_plugin_constants();

        // Pro may have become active after this file started loading (edge cases).
        if (tc_caf_is_pro_plugin_active()) {
            return;
        }

        require_once TC_CAF_PATH . 'admin/admin.php';

        /*---- UPDATE THE CURRENT ACTIVE VERSION OF THE PLUGIN ----*/
        if (!get_option('tc_caf_plugin_version')) {
            update_option('tc_caf_plugin_version', TC_CAF_PLUGIN_VERSION);
        }
    }

    /*---- LOAD PLUGIN TEXTDOMAIN ----*/
    public function tc_caf_load_plugin_textdomain()
    {
        load_plugin_textdomain('category-ajax-filter', false, dirname(plugin_basename(__FILE__)) . '/languages/');
    }

    /*---- set plugin constants ----*/
    public function tc_caf_plugin_constants()
    {
        if (!defined('TC_CAF_URL')) {
            define('TC_CAF_URL', plugin_dir_url(__FILE__));
        }
        if (!defined('TC_CAF_PATH')) {
            define('TC_CAF_PATH', plugin_dir_path(__FILE__));
        }
        if (!defined('TC_CAF_PLUGIN_VERSION')) {
            define('TC_CAF_PLUGIN_VERSION', '3.0.1');
        }
    }
}

// Instantiate the plugin class.
$tc_caf_plugin = new TC_CAF_Plugin();

register_activation_hook(__FILE__, 'tc_caf_activate');
register_deactivation_hook(__FILE__, 'tc_caf_deactivate');

/**
 * Free activation — refuse if Pro is already active.
 */
function tc_caf_activate()
{
    if (tc_caf_is_pro_plugin_active()) {
        deactivate_plugins(plugin_basename(__FILE__));
        set_transient('caf_free_blocked_by_pro_notice', 1, 5 * MINUTE_IN_SECONDS);
        return;
    }
    // Fresh installs often use plain permalinks; flushing helps /wp-json/ resolve.
    if (function_exists('flush_rewrite_rules')) {
        flush_rewrite_rules();
    }
}

function tc_caf_deactivate()
{
}

add_action(
    'admin_notices',
    static function () {
        if (!current_user_can('activate_plugins')) {
            return;
        }
        if (!get_transient('caf_free_blocked_by_pro_notice')) {
            return;
        }
        delete_transient('caf_free_blocked_by_pro_notice');
        echo '<div class="notice notice-error is-dismissible"><p>';
        echo esc_html__(
            'Category AJAX Filter Free cannot run while Category AJAX Filter Pro is active. Pro replaces Free — keep Pro active; your existing filters stay available under Pro.',
            'category-ajax-filter'
        );
        echo '</p></div>';
    }
);
