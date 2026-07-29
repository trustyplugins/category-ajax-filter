<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}
class CAF_admin_ajax
{
    public function __construct()
    {
        // Admin-only: do not register nopriv — taxonomy/terms listing is for the filter editor UI.
        add_action('wp_ajax_tc_caf_get_taxonomy', array($this, 'tc_caf_get_taxonomy'));
        add_action('wp_ajax_tc_caf_get_terms', array($this, 'tc_caf_get_terms'));
    }

    /**
     * Shared auth for admin AJAX used by the CAF filter metabox.
     */
    private function caf_admin_ajax_authorize()
    {
        check_ajax_referer('tc_caf_ajax_nonce', 'nonce_ajax');
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => 'Forbidden'), 403);
        }
    }

    public function tc_caf_get_taxonomy()
    {
        $this->caf_admin_ajax_authorize();

        $data = array(
            'tax' => array(),
            'tax1' => '',
            'terms' => '',
        );

        $posttype = isset($_POST['cpt']) ? sanitize_key(wp_unslash($_POST['cpt'])) : '';
        if ($posttype === '') {
            echo wp_json_encode($data);
            wp_die();
        }

        $taxonomies = get_object_taxonomies($posttype);
        $data['tax'] = $taxonomies;
        $data['tax1'] = !empty($taxonomies[0]) ? $taxonomies[0] : '';

        if ($data['tax1']) {
            $terms = get_terms(array(
                'taxonomy' => $data['tax1'],
                'hide_empty' => false,
            ));
            $data['terms'] = (!is_wp_error($terms) && !empty($terms)) ? $terms : '';
        }

        echo wp_json_encode($data);
        wp_die();
    }

    public function tc_caf_get_terms()
    {
        $this->caf_admin_ajax_authorize();

        $data = array(
            'terms' => '',
        );

        $taxonomy = isset($_POST['taxonomy']) ? sanitize_key(wp_unslash($_POST['taxonomy'])) : '';
        if ($taxonomy === '' || !taxonomy_exists($taxonomy)) {
            echo wp_json_encode($data);
            wp_die();
        }

        $terms = get_terms(array(
            'taxonomy' => $taxonomy,
            'hide_empty' => false,
        ));
        $data['terms'] = (!is_wp_error($terms) && !empty($terms)) ? $terms : '';

        echo wp_json_encode($data);
        wp_die();
    }

}