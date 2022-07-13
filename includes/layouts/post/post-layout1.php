<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}
include TC_CAF_PATH . 'includes/query-variables.php';
if ($qry->have_posts()): while ($qry->have_posts()): $qry->the_post();
        global $post;
        include TC_CAF_PATH . 'includes/post-variables.php';
        // <article>
        echo caf_article_container_start($caf_desktop_col,$caf_tablet_col,$caf_mobile_col,$caf_special_post_class,$caf_post_animation,$cats_class,$caf_post_layout);
        ?>
		<div class="manage-layout1">
		<?php
        // class='caf-featured-img-box'
        echo caf_get_post_image($image, $link, $caf_link_target, $caf_post_layout);
        echo "<div id='manage-post-area'>";
        // class='caf-post-title'
        echo caf_get_post_title($link,$title,$caf_post_layout);
        // class='caf-meta-content'
        echo caf_meta_content_container_start($caf_post_author, $caf_post_date, $caf_post_layout);
        // span class='author caf-col-md-4 caf-pl-0'
        echo caf_get_post_author($caf_post_author, $caf_post_layout);
        // span class='date caf-pl-0'
        echo caf_get_post_date($caf_post_date, $caf_post_date_format, $id, $caf_post_layout);
        // class='comment'
        echo caf_get_post_comment_count($caf_post_comments,$caf_post_layout);
        // </div>
        echo caf_meta_content_container_end($caf_post_author, $caf_post_date, $caf_post_layout);
        // class='caf-content'
        echo caf_get_post_content($caf_post_dsc, $caf_content,$caf_post_layout);
        // class='caf-content-read-more'
        echo caf_get_post_read_more($caf_content, $caf_post_rd, $link, $caf_link_target, $id,$caf_post_layout);
        echo "</div>";
        ?>
		</div>
		<?php
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
//$empty_res.='<div class="empty-response">No Posts Found.</div>';
    //echo $empty_res;
    $response = [
        'status' => 201,
        'message' => 'No posts found',
        'content' => '',
    ];
endif;