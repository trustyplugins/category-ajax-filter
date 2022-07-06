<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}
include TC_CAF_PATH . 'includes/query-variables.php';
if ($qry->have_posts()): while ($qry->have_posts()): $qry->the_post();
        global $post;
        ?>
				<article id="caf-post-layout2" class="caf-post-layout2 caf-col-md-<?php echo esc_attr($caf_desktop_col); ?> caf-col-md-tablet<?php echo esc_attr($caf_tablet_col); ?> caf-col-md-mobile<?php echo esc_attr($caf_mobile_col); ?> caf-mb-5 <?php echo esc_attr($caf_special_post_class); ?> <?php echo esc_attr($caf_post_animation); ?>" data-post-id="<?php echo esc_attr(get_the_id()); ?>">
				<?php
                include TC_CAF_PATH . 'includes/post-variables.php';
        if (isset($image[0])) {
            echo "<a href='" . esc_url($link) . "' target='" . esc_attr($caf_link_target) . "'><div class='caf-featured-img-box' style='background:url(" . esc_url($image[0]) . "
				)'></div></a>";
        } else {
            $image = TC_CAF_URL . 'assets/img/unnamed.jpg';
            echo "<a href='" . esc_url($link) . "' target='" . esc_attr($caf_link_target) . "'><div class='caf-featured-img-box' style='background:url(" . esc_url($image) . "
				)'></div></a>";
        }
        echo "<div id='manage-post-area'>";
        if ((class_exists("TC_CAF_PRO") && $caf_post_cats == "show") || !class_exists("TC_CAF_PRO")) {
           echo caf_get_linked_terms($tax);
        }
        echo "<div class='caf-post-title'><a href='" . esc_url($link) . "' target='" . esc_attr($caf_link_target) . "'><h2>" . esc_html($title) . "</h2></a></div>";
        if ((class_exists("TC_CAF_PRO") && $caf_post_author == "show" || $caf_post_date == "show") || !class_exists("TC_CAF_PRO")) {
            echo "<div class='caf-meta-content'>";
        }
        if ((class_exists("TC_CAF_PRO") && $caf_post_author == "show") || !class_exists("TC_CAF_PRO")) {
            echo "<b><span class='author caf-pl-0'>" . get_the_author() . " - </span></b>";
        }
        if ((class_exists("TC_CAF_PRO") && $caf_post_date == "show")) {
            $caf_post_date_format = apply_filters('tc_caf_post_date_format', $caf_post_date_format, $id);
            echo "<span class='date caf-pl-0'>" . get_the_date($caf_post_date_format) . "</span>";
        }
        if ((!class_exists("TC_CAF_PRO") && $caf_post_date == "show")) {
            $caf_post_date_format = apply_filters('tc_caf_post_date_format', $caf_post_date_format, $id);
            echo "<span class='date caf-col-md-6 caf-pl-0'><i class='fa fa-calendar' aria-hidden='true'></i> " . get_the_date("d, M Y") . "</span>";
        }
        if ((class_exists("TC_CAF_PRO") && $caf_post_author == "show" || $caf_post_date == "show") || !class_exists("TC_CAF_PRO")) {
            echo "</div>";
        }
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