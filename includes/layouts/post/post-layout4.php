<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}
include TC_CAF_PATH . 'includes/query-variables.php';
if ($qry->have_posts()): while ($qry->have_posts()): $qry->the_post();
        global $post;
        ?>
						<article id="caf-post-layout4" class="caf-post-layout4 caf-col-md-12 caf-col-md-tablet12 caf-col-md-mobile12 caf-mb-10 <?php echo esc_attr($caf_special_post_class); ?> <?php echo esc_attr($caf_post_animation); ?>" data-post-id="<?php echo esc_attr(get_the_id()); ?>">
						<?php
        include TC_CAF_PATH . 'includes/post-variables.php';
        if (isset($image[0])) {
            echo "<a href='" . esc_url($link) . "' target='" . esc_attr($caf_link_target) . "' class='caf-f-img'><div class='caf-featured-img-box' style='background:url(" . esc_url($image[0]) . "
						)'></div></a>";
        } else {
            $image = TC_CAF_URL . 'assets/img/unnamed.jpg';
            echo "<a href='" . esc_url($link) . "' target='" . esc_attr($caf_link_target) . "' class='caf-f-img'><div class='caf-featured-img-box' style='background:url(" . esc_url($image) . "
						)'></div>
						</a>";
        }
        echo "<div id='manage-post-area'>";
        echo "<a href='" . esc_url($link) . "' target='" . esc_attr($caf_link_target) . "'><div class='caf-post-title'><h2>" . esc_html($title) . "</h2></div></a>";
        if ((class_exists("TC_CAF_PRO") && $caf_post_cats == "show") || !class_exists("TC_CAF_PRO")) {
            echo caf_get_linked_terms($tax);
        }
        if ((class_exists("TC_CAF_PRO") && $caf_post_dsc == "show") || !class_exists("TC_CAF_PRO")) {
            echo "<div class='caf-content'>" . wp_kses_post($caf_content) . "</div>";
        }
        if ($caf_content) {
            if ((class_exists("TC_CAF_PRO") && $caf_post_rd == "show") || !class_exists("TC_CAF_PRO")) {
                $rd_more = esc_html('Read More');
                echo "<div class='caf-content-read-more'><a class='caf-read-more' href='" . esc_url($link) . "' target='" . esc_attr($caf_link_target) . "'>" . apply_filters('tc_caf_post_layout_read_more', $rd_more, $id) . "</a></div>";
            }}
        echo "</div>";
        ?>
						</article>
						<?php
    endwhile;
/**** Pagination*****/
    if (isset($_POST["params"]["load_more"])) {
        //do something
    } else {
        $caf_pagination->caf_ajax_pager($qry, $page, $caf_post_layout, $caf_pagi_type, $filter_id);
    }
    $response = [
        'status' => 200,
        'found' => $qry->found_posts,
        'message' => 'ok',
    ];
    wp_reset_postdata();
else:
    echo "<div class='error-of-empty-result error-caf'>" . esc_html($caf_empty_res) . "</div>";
    $response = [
        'status' => 201,
        'message' => 'No posts found',
        'content' => '',
    ];
endif;