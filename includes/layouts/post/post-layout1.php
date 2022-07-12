<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}
include TC_CAF_PATH . 'includes/query-variables.php';
if ($qry->have_posts()): while ($qry->have_posts()): $qry->the_post();
        global $post;
        ?>
		<article id="caf-post-layout1" class="caf-post-layout1 caf-col-md-<?php echo esc_attr($caf_desktop_col); ?> caf-col-md-tablet<?php echo esc_attr($caf_tablet_col); ?> caf-col-md-mobile<?php echo esc_attr($caf_mobile_col); ?> caf-mb-5 <?php echo esc_attr($caf_special_post_class); ?> <?php echo esc_attr($caf_post_animation); ?>" data-post-id="<?php echo esc_attr(get_the_id()); ?>">
		<div class="manage-layout1">
		<?php
        include TC_CAF_PATH . 'includes/post-variables.php';
        // class='caf-featured-img-box'
        echo caf_get_post_image($image, $link, $caf_link_target, $caf_post_layout);
        echo "<div id='manage-post-area'>";
        echo "<div class='caf-post-title'><a href='" . esc_url($link) . "' data-id='" . esc_attr($post->ID) . "'><h2>" . esc_attr($title) . "</h2></a></div>";
        // class='caf-meta-content'
        echo caf_meta_content_container_start($caf_post_author, $caf_post_date, $caf_post_layout);
        // span class='author caf-col-md-4 caf-pl-0'
        echo caf_get_post_author($caf_post_author, $caf_post_layout);
        // span class='date caf-pl-0'
        echo caf_get_post_date($caf_post_date, $caf_post_date_format, $id, $caf_post_layout);
        if ((!class_exists("TC_CAF_PRO") && $caf_post_date == "show")) {
            $caf_post_date_format = apply_filters('tc_caf_post_date_format', $caf_post_date_format, $id);
            echo "<span class='date caf-col-md-6 caf-pl-0'><i class='fa fa-calendar' aria-hidden='true'></i> " . get_the_date("d, M Y") . "</span>";
        }
        if ((class_exists("TC_CAF_PRO") && $caf_post_comments == "show") || !class_exists("TC_CAF_PRO")) {
            echo "<span class='comment caf-col-md-3 caf-pl-0'><i class='fa fa-comment' aria-hidden='true'></i> " . get_comments_number() . "</span>";
        }
        // </div>
        echo caf_meta_content_container_end($caf_post_author, $caf_post_date, $caf_post_layout);
        // class='caf-content'
        echo caf_get_post_content($caf_post_dsc, $caf_content,$caf_post_layout);
        // class='caf-content-read-more'
        echo caf_get_post_read_more($caf_content, $caf_post_rd, $link, $caf_link_target, $id,$caf_post_layout);
        echo "</div>";
        ?>
		</div>
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
//$empty_res.='<div class="empty-response">No Posts Found.</div>';
    //echo $empty_res;
    $response = [
        'status' => 201,
        'message' => 'No posts found',
        'content' => '',
    ];
endif;