<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}
include TC_CAF_PATH . 'includes/query-variables.php';
if ($qry->have_posts()): while ($qry->have_posts()): $qry->the_post();
include TC_CAF_PATH . 'includes/post-variables.php';
        global $post;
        // <article>
        echo caf_article_container_start($caf_desktop_col,$caf_tablet_col,$caf_mobile_col,$caf_special_post_class,$caf_post_animation,$cats_class,$caf_post_layout);    
        // class='caf-featured-img-box'
        echo caf_get_post_image($image, $link, $caf_link_target, $caf_post_layout);
        echo "<div id='manage-post-area'>";
        // class='caf-post-title'
        echo caf_get_post_title($link,$title,$caf_post_layout);
        //echo "<a href='" . esc_url($link) . "' target='" . esc_attr($caf_link_target) . "'><div class='caf-post-title'><h2>" . esc_html($title) . "</h2></div></a>";
        //.caf-meta-content-cats -> .ul.caf-mb-0 -> li
        echo caf_get_linked_terms($tax, $caf_post_cats, $caf_post_layout);
        // class='caf-content'
        echo caf_get_post_content($caf_post_dsc, $caf_content,$caf_post_layout);
        // class='caf-content-read-more'
        echo caf_get_post_read_more($caf_content, $caf_post_rd, $link, $caf_link_target, $id,$caf_post_layout);
        echo "</div>";
        // </article>
        echo caf_article_container_end();
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