<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}
class CAF_shortcode_render
{
    public function __construct()
    {
        add_shortcode("caf_filter", array($this, "caf_filter_call"));
        add_filter('tc_caf_post_layout_read_more', array($this, 'tc_caf_post_layout_read_more'), 5, 2);
    }
    public function tc_caf_post_layout_read_more($text, $id)
    {
        $text = 'Read More';
        return $text;
    }
    public function caf_filter_call($atts)
    {
        ob_start();
        $caf_filter = new CAF_front_filter();
        static $b = 1;
        $atts = shortcode_atts(array(
            'id' => '',
        ), $atts);
        $id = $atts['id'];
        include TC_CAF_PATH . 'includes/front-variables.php';
        if (get_post_meta($id, 'caf_cpt_value')) {
            $caf_cpt_value = get_post_meta($id, 'caf_cpt_value', true);
        }
        $pt = get_post_type($id);
        wp_enqueue_script("jquery");
        wp_enqueue_script('tc-caf-frontend-scripts');
        $post_style = ("tc-caf-" . $caf_post_layout);
        $filter_style = ("tc-caf-" . $caf_filter_layout);
        wp_enqueue_style('tc-caf-common-style');
        wp_enqueue_style($filter_style);
        wp_enqueue_style($post_style);
        wp_enqueue_style('tc-caf-font-awesome-style');
        $handle = "tc-caf-dynamic-style-" . $caf_filter_layout;
        wp_enqueue_style($handle, TC_CAF_URL . '/assets/css/dynamic-styles.css', '', TC_CAF_PLUGIN_VERSION);
        setDynamicFilterCssFree($id, $handle, $caf_filter_layout, $b, 'shortcode');
        if (($id && !empty($id) && get_post_type($id) == 'caf_posts')) {
            if ($caf_filter_layout == 'filter-layout3') {$cl = 'sidebar';} else { $cl = '';}
            //var_dump($tax);
            if (is_array($tax)) {
                $tax = implode(",", $tax);
            }
            //var_dump($tax);
            echo '<div id="caf-post-layout-container" class="caf-post-layout-container ' . $cl . ' ' . $caf_filter_layout . ' ' . $caf_post_layout . ' data-target-div' . $b . '" data-post-type="' . $caf_cpt_value . '" data-tax="' . $tax . '" data-terms="' . $trm . '" data-per-page="' . $caf_per_page . '" data-selected-terms="' . $trm . '" data-filter-id="' . $id . '" data-post-layout="' . $caf_post_layout . '" data-target-div="data-target-div' . $b . '">';
            if ($caf_filter_status == 'on') {
                if ($caf_filter_layout && strlen($caf_filter_layout) > 13) {
                    $filepath = TC_CAF_PATH . "includes/layouts/filter/" . $caf_filter_layout . ".php";
                    if (file_exists($filepath)) {
                        include $filepath;
                    } else {
                        echo "<div class='error-of-filter-layout error-caf'>" . esc_html('Filter Layout is not Available.', 'tc_caf') . "</div>";
                    }
                }
            }
            setDynamicFilterCssFree($id, $handle, $caf_post_layout, $b, 'shortcode');
            echo "<div id='manage-ajax-response' class='caf-row'>";
            if ($caf_post_layout && strlen($caf_post_layout) > 11) {
                echo '<div class="status"><i class="fa fa-spinner" aria-hidden="true"></i></div>';
                echo '<div class="content"></div>';
            }
            echo "</div>";
            echo "</div>";
        } else {
            if (empty($id)) {
                echo "<div class='error-of-missing-id error-caf'>" . esc_html__('Nothing Found, Missing id as an argument.', 'tc_caf') . ' <a href="https://caf.trustyplugins.com/docs/documentation/getting-started/" target="_blank">' . esc_html__('See Documentation', 'tc_caf') . "</a></div>";
            } else {
                echo "<div class='error-of-missing-id error-caf'>" . esc_html__('Nothing Found, ID Mismatched.', 'tc_caf') . ' <a href="https://caf.trustyplugins.com/docs/documentation/getting-started/" target="_blank">' . esc_html__('See Documentation', 'tc_caf') . "</a></div>";
            }
        }
        $output = ob_get_contents();
        ob_end_clean();
        $b++;
        return $output;

    }
}
class CAF_get_filter_posts
{
    public function __construct()
    {
        add_action('wp_ajax_get_filter_posts', array($this, 'get_filter_posts'));
        add_action('wp_ajax_nopriv_get_filter_posts', array($this, 'get_filter_posts'));
    }
    public function get_filter_posts()
    {
        $filter_id = sanitize_text_field($_POST['params']['filter-id']);
        $caf_security = 'disable';
        if (get_post_meta($filter_id, "caf_special_security", true)) {
            $caf_security = get_post_meta($filter_id, "caf_special_security", true);
        }
        if ($caf_security == 'enable') {
            if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'tc_caf_ajax_nonce')) {
                die('Permission denied');
            }

        }
/*** Default response ***/
        $response = [
            'status' => 500,
            'message' => 'Something is wrong, please try again later ...',
            'content' => false,
            'found' => 0,
        ];
        $tax = sanitize_text_field($_POST['params']['tax']);
        $post_type = sanitize_text_field($_POST['params']['post-type']);

        $term = sanitize_text_field($_POST['params']['term']);
        $page = intval($_POST['params']['page']);
        $per_page = intval($_POST['params']['per-page']);
        $caf_post_layout = sanitize_text_field($_POST['params']['caf-post-layout']);
        $target_div = sanitize_text_field($_POST['params']['data-target-div']);
        if ($per_page == '-1') {$per_page = '5';}
        /*** Check if term exists ***/
        $terms = explode(',', $term);
        if (!is_array($terms)):
            $response = [
                'status' => 501,
                'message' => 'Term doesn\'t exist',
                'content' => 0,
            ];
            die(json_encode($response));
        else:
            if ($terms == 'all'):
                $tax_qry[] = [
                    'taxonomy' => $tax,
                    'field' => 'term_id',
                    'terms' => $terms,
                    'operator' => 'IN',
                ];
            else:
                $tax_qry[] = [
                    'taxonomy' => $tax,
                    'field' => 'term_id',
                    'terms' => $terms,
                ];
            endif;
        endif;
        $default_order_by = 'title';
        $default_order_by = apply_filters('tc_caf_filter_posts_order_by', $default_order_by);
        $default_order = "asc";
        $default_order = apply_filters('tc_caf_filter_posts_order', $default_order);
        /*** Setup query ***/
        $args = [
            'paged' => $page,
            'post_type' => $post_type,
            'post_status' => 'publish',
            'posts_per_page' => $per_page,
            'tax_query' => $tax_qry,
            'orderby' => $default_order_by,
            'order' => $default_order,
        ];
        $qry = new WP_Query($args);
        ob_start();
        echo '<div class="status"></div>';
        if ($caf_post_layout && strlen($caf_post_layout) > 11) {
            $filepath = TC_CAF_PATH . "includes/layouts/post/" . $caf_post_layout . ".php";
            if (file_exists($filepath)) {
                include_once $filepath;
            } else {
                echo "<div class='error-of-post-layout error-caf'>" . esc_html('Post Layout is not Available.', 'tc_caf') . "</div>";
                $response = [
                    'status' => 404,
                    'message' => 'No posts found',
                    //'content' =>'ok',
                ];
            }
        }
//include_once TC_CAF_PATH.'includes/layouts/post/post-layout1.php';
        $response['content'] = ob_get_clean();
        die(json_encode($response));
        //die();
    }
}

class CAF_content_length
{
    public $caf_post_id, $words;
    public function get_caf_content($caf_post_id)
    {
        $content = get_the_content();
        $content = preg_replace('#\[[^\]]+\]#', '', $content);
        $content = wp_trim_words($content, '40');
        return $content;
    }

    public function get_caf_content2($caf_post_id, $words)
    {
        $content = get_the_content();
        $content = preg_replace('#\[[^\]]+\]#', '', $content);
        $content = wp_trim_words($content, $words);
        return $content;
    }
}

class CAF_front_filter
{
    public function __construct()
    {

        add_filter('tc_caf_add_custom_list_before_filter', array($this, 'tc_caf_add_custom_list_before_filter'), 5);
        add_filter('tc_caf_add_custom_span_before_filter', array($this, 'tc_caf_add_custom_span_before_filter'), 5);
        add_filter('tc_caf_custom_title_before_sidebar_filter', array($this, 'tc_caf_custom_title_before_sidebar_filter'), 5);
        add_filter('tc_caf_filter_order_by', array($this, 'tc_caf_filter_order_by'), 5, 1);
        add_filter('tc_caf_filter_all_text', array($this, 'tc_caf_filter_all_text'), 5, 1);
        add_filter('tc_caf_filter_posts_order_by', array($this, 'tc_caf_filter_posts_order_by'), 5, 1);
        add_filter('tc_caf_filter_posts_order', array($this, 'tc_caf_filter_posts_order'), 5, 1);
    }

    public function tc_caf_add_custom_span_before_filter()
    {
        return esc_html__('I want to check out ', 'category-ajax-filter');
    }
    public function tc_caf_add_custom_list_before_filter()
    {
        return esc_html__('Everything', 'category-ajax-filter');
    }
    public function tc_caf_custom_title_before_sidebar_filter()
    {
        return _e('Categories', 'category-ajax-filter');

    }
    public function tc_caf_filter_order_by($terms_sel)
    {
        return $terms_sel;
    }
    public function tc_caf_filter_posts_order_by($default)
    {
        return 'title';
    }
    public function tc_caf_filter_posts_order($default)
    {
        return 'asc';
    }
    public function tc_caf_filter_all_text($all_text)
    {
        return 'All';
    }
}
class CAF_ajax_pagination
{
    public function caf_ajax_pager($query, $paged, $caf_post_layout, $caf_pagi_type, $filter_id)
    {
        //echo $caf_pagi_type;
        // $filter_id
        if (class_exists("TC_CAF_PRO")) {
            $caf_pagination_status = 'on';
            if (get_post_meta($filter_id, 'caf_pagination_status')) {
                $caf_pagination_status = get_post_meta($filter_id, 'caf_pagination_status', true);
            }
            if ($caf_pagination_status == "off") {
                return;
            }
        }
        if ($caf_pagi_type == 'number') {
            $this->caf_number_pagination($query, $paged, $caf_post_layout, $caf_pagi_type, $filter_id);
        } else {
            if (class_exists("TC_CAF_PRO")) {
                include TC_CAF_PRO_PATH . "includes/pagination.php";
            } else {
                $this->caf_number_pagination($query, $paged, $caf_post_layout, $caf_pagi_type, $filter_id);
            }
        }
    }
    public function caf_number_pagination($query, $paged, $caf_post_layout, $caf_pagi_type, $filter_id)
    {
        if (!$query) {
            return;
        }

        $prev_text = 'Prev';
        $next_text = 'Next';
        $prev_text = apply_filters('tc_caf_filter_prev_text', $prev_text, $filter_id);
        $next_text = apply_filters('tc_caf_filter_next_text', $next_text, $filter_id);

        $paginate = paginate_links([
            'base' => '%_%',
            'type' => 'array',
            'total' => $query->max_num_pages,
            'format' => '#page=%#%',
            'current' => max(1, $paged),
            'prev_text' => $prev_text,
            'next_text' => $next_text,
        ]);
        if ($query->max_num_pages > 1): ?>
        <ul id="caf-layout-pagination" class="caf-pagination <?php echo $caf_post_layout; ?>">
            <?php foreach ($paginate as $page): ?>
                <li><?php echo $page; ?></li>
            <?php endforeach;?>
        </ul>
    <?php endif;
    }
}
new CAF_get_filter_posts();

function caf_get_cats($tax)
{
    global $post;
    $caf_post_id = get_the_ID();
    if (is_array($tax)) {
        $cats = array();
        foreach ($tax as $tx) {
            $cats[] = get_the_terms($caf_post_id, $tx);
        }
    } else {
        $cats = get_the_terms($caf_post_id, $tax);
    }
    return $cats;
}
function caf_get_first_class($cats) {
    $cats_class = '';
        if (is_array($cats)) {
            if (isset($cats)) {
                if (class_exists("TC_CAF_PRO")) {
                    if (isset($cats[0][0]->name)) {
                        $cats_class = $cats[0][0]->name;
                    }
                } else {
                    if (isset($cats[0]->name)) {
                        $cats_class = $cats[0]->name;
                    }
                }
                $cats_class = str_replace(' ', '_', $cats_class);
                $cats_class = "tp_" . $cats_class;
            } else { $cats_class = '';}}
            return $cats_class;
}
function caf_get_linked_terms($tax,$caf_post_cats,$caf_post_layout) {
    $cats=caf_get_cats($tax);
    if ((class_exists("TC_CAF_PRO") && $caf_post_cats == "show") || !class_exists("TC_CAF_PRO")) {
    echo "<div class='caf-meta-content-cats'>";
    echo "<ul class='caf-mb-0'>";
    if (is_array($cats)) {
        foreach ($cats as $index => $cat) {
            //  if ($index < 3) {
            if (class_exists("TC_CAF_PRO")) {
                if ($cat) {
                    foreach ($cat as $ct) {
                        if ($ct) {
                            $clink = get_category_link($ct->term_id);
                            echo "<li><a href='" . esc_url($clink) . "' target='_blank'>" . esc_html($ct->name) . "</a></li>";
                        }
                    }
                }
            } else {
                $clink = get_category_link($cat->term_id);
                echo "<li><a href='" . esc_url($clink) . "' target='_blank'>" . esc_html($cat->name) . "</a></li>";
            }
            // }
        }
    }
    echo "</ul>";
    echo "</div>";
}
}
function caf_get_post_image($image,$link,$caf_link_target,$caf_post_layout) {
    
    if($caf_post_layout=='post-layout4') {
    if (isset($image[0])) {
        echo "<a href='" . esc_url($link) . "' target='" . esc_attr($caf_link_target) . "' class='caf-f-img'><div class='caf-featured-img-box' style='background:url(" . esc_url($image[0]) . "
                    )'></div></a>";
    } else {
        $image = TC_CAF_URL . 'assets/img/unnamed.jpg';
        echo "<a href='" . esc_url($link) . "' target='" . esc_attr($caf_link_target) . "' class='caf-f-img'><div class='caf-featured-img-box' style='background:url(" . esc_url($image) . "
                    )'></div>
                    </a>";
    }
}
else {
    if (isset($image[0])) {
        echo "<a href='" . esc_url($link) . "' target='" . esc_attr($caf_link_target) . "'><div class='caf-featured-img-box' style='background:url(" . esc_url($image[0]) . "
                                            )'></div></a>";
    } else {
        $image = TC_CAF_URL . 'assets/img/unnamed.jpg';
        echo "<a href='" . esc_url($link) . "' target='" . esc_attr($caf_link_target) . "'><div class='caf-featured-img-box' style='background:url(" . esc_url($image) . "
                                            )'></div></a>";
    }
}
}
function caf_meta_content_container_start($caf_post_author,$caf_post_date,$caf_post_layout) {
    if ((class_exists("TC_CAF_PRO") && $caf_post_author == "show" || $caf_post_date == "show") || !class_exists("TC_CAF_PRO")) {
        echo "<div class='caf-meta-content'>";
    }
}
function caf_get_post_author($caf_post_author,$caf_post_layout) {
    if ((class_exists("TC_CAF_PRO") && $caf_post_author == "show") || !class_exists("TC_CAF_PRO")) {
        if($caf_post_layout=='post-layout1') {
            echo "<span class='author caf-col-md-4 caf-pl-0'><i class='fa fa-user' aria-hidden='true'></i> " . get_the_author() . "</span>";
        }
        else {
        echo "<b><span class='author caf-pl-0'>" . get_the_author() . " - </span></b>";
        }
    }
}
function caf_get_post_date($caf_post_date,$caf_post_date_format,$id,$caf_post_layout) {
    if ((class_exists("TC_CAF_PRO") && $caf_post_date == "show")) {
      $caf_post_date_format = apply_filters('tc_caf_post_date_format', $caf_post_date_format, $id);
      if($caf_post_layout=='post-layout1') {
        echo "<span class='date caf-col-md-6 caf-pl-0'><i class='fa fa-calendar' aria-hidden='true'></i> " . get_the_date($caf_post_date_format) . "</span>";
    }
    else {
        echo "<span class='date caf-pl-0'>" . get_the_date($caf_post_date_format) . "</span>";
    }
    }
}
function caf_meta_content_container_end($caf_post_author,$caf_post_date,$caf_post_layout) {
    if ((class_exists("TC_CAF_PRO") && $caf_post_author == "show" || $caf_post_date == "show") || !class_exists("TC_CAF_PRO")) {
        echo "</div>";
    }
}
function caf_get_post_content($caf_post_dsc,$caf_content) {
    if ((class_exists("TC_CAF_PRO") && $caf_post_dsc == "show") || !class_exists("TC_CAF_PRO")) {
        echo "<div class='caf-content'>" . wp_kses_post($caf_content) . "</div>";
    }
}
function caf_get_post_read_more($caf_content,$caf_post_rd,$link,$caf_link_target,$id) {
    if ($caf_content) {
        if ((class_exists("TC_CAF_PRO") && $caf_post_rd == "show") || !class_exists("TC_CAF_PRO")) {
            $rd_more = esc_html('Read More');
            echo "<div class='caf-content-read-more'><a class='caf-read-more' href='" . esc_url($link) . "' target='" . esc_attr($caf_link_target) . "'>" . apply_filters('tc_caf_post_layout_read_more', $rd_more, $id) . "</a></div>";
        }}
}