<?php
include_once TC_CAF_PATH.'includes/query-variables.php';
if ( $qry->have_posts() ) : while ( $qry->have_posts() ) : $qry->the_post();
global $post;
?>
<article id="caf-post-layout2" class="caf-post-layout2 caf-col-md-<?php echo esc_attr($caf_desktop_col); ?> caf-col-md-tablet<?php echo esc_attr($caf_tablet_col); ?> caf-col-md-mobile<?php echo esc_attr($caf_mobile_col); ?> caf-mb-5 <?php echo esc_attr($caf_special_post_class); ?> <?php echo esc_attr($caf_post_animation); ?>" data-post-id="<?php echo esc_attr(get_the_id()); ?>">
<?php
$caf_post_id=get_the_ID();
$title= get_the_title();
$image = wp_get_attachment_image_src( get_post_thumbnail_id( $post->ID ), $caf_image_size );
$link=get_the_permalink();
$caf_content=$post->post_excerpt;
 if(empty($caf_content)) {
 $caf_content=$post->post_content; 
 }
 $caf_content= preg_replace('#\[[^\]]+\]#', '',$caf_content);
 $c_length=apply_filters('tc_caf_excerpt_length',30,$id);
 $caf_content=wp_trim_words($caf_content,$c_length);
if($image[0]) {
echo "<a href='".esc_url($link)."' target='".esc_attr($caf_link_target)."'><div class='caf-featured-img-box' style='background:url(".esc_url($image[0])."
)'></div></a>";
}
else{
$image=TC_CAF_URL.'assets/img/unnamed.jpg';
echo "<a href='".esc_url($link)."' target='".esc_attr($caf_link_target)."'><div class='caf-featured-img-box' style='background:url(".esc_url($image)."
)'></div></a>";
}	
echo "<div id='manage-post-area'>";
 if((class_exists("TC_CAF_PRO") && $caf_post_cats=="show") ||  !class_exists("TC_CAF_PRO")) { 
echo "<div class='caf-meta-content-cats'>";
	echo "<ul class='caf-mb-0'>";
if(is_array($tax)) {
 $cats=array();
  foreach($tax as $tx) {
   $cats[]=get_the_terms($caf_post_id,$tx);
  }
 }
 else {
	$cats=get_the_terms($caf_post_id,$tax);
 }
	foreach ($cats as $index=>$cat) {
		if($index<3) {
   if(class_exists("TC_CAF_PRO")) {
    if(isset($cat[0])) {
	$clink=get_category_link($cat[0]->term_id);
	echo "<li><a href='".esc_url($clink)."' target='_blank'>".esc_html($cat[0]->name)."</a></li>";
		}
   }
   else {
    $clink=get_category_link($cat->term_id);
	echo "<li><a href='".esc_url($clink)."' target='_blank'>".esc_html($cat->name)."</a></li>";
   }
  }
	}
	echo "</ul>";
echo "</div>";
 }
echo "<div class='caf-post-title'><a href='".esc_url($link)."' target='".esc_attr($caf_link_target)."'><h2>".esc_html($title)."</h2></a></div>";
  if((class_exists("TC_CAF_PRO") && $caf_post_author=="show" || $caf_post_date=="show") ||  !class_exists("TC_CAF_PRO")) { 
echo "<div class='caf-meta-content'>";
  }
 if((class_exists("TC_CAF_PRO") && $caf_post_author=="show") ||  !class_exists("TC_CAF_PRO")) { 
echo"<b><span class='author caf-pl-0'>".get_the_author()." - </span></b>";
 }
 if((class_exists("TC_CAF_PRO") && $caf_post_date=="show") ||  !class_exists("TC_CAF_PRO")) { 
echo"<span class='date caf-pl-0'>".get_the_date('M, d Y ')."</span>";
 }
 if((class_exists("TC_CAF_PRO") && $caf_post_author=="show" || $caf_post_date=="show") ||  !class_exists("TC_CAF_PRO")) {
echo "</div>";
 }
echo "</div>";
?>		
</article>
<?php
endwhile;
/**** Pagination*****/
if(isset($_POST["params"]["load_more"])) {
 //do something
}
else {
$caf_pagination->caf_ajax_pager($qry,$page,$caf_post_layout,$caf_pagi_type,$filter_id);
}
$response = [
                'status'=> 200,
                'found' => $qry->found_posts,
	            'message'=>'ok'
            ];
 wp_reset_postdata();
 else :
echo "<div class='error-of-empty-result error-caf'>".esc_html($caf_empty_res)."</div>";	
$response = [
	'status'  => 201,
	'message' => 'No posts found',
	'content' =>'' ,
];
 endif;
 echo "<style>
 ".$target_div." .error-caf {font-family:".$caf_post_font.";background-color: ".$caf_post_sec_color."; color: ".$caf_post_primary_color.";font-size:".$caf_post_title_font_size."px;}
#caf-post-layout-container".$target_div.".post-layout2 {background-color: ".$caf_sec_bg_color."; font-family:".$caf_post_font.";}
".$target_div." #caf-post-layout2 .caf-post-title h2 {font-family:".$caf_post_font.";font-size:".$caf_post_title_font_size."px;text-transform:".$caf_post_title_transform.";}
".$target_div." #caf-post-layout2 .caf-meta-content-cats li a {font-family:".$caf_post_font.";}
".$target_div." #caf-post-layout2 span.author,".$target_div." #caf-post-layout2 span.date,".$target_div." #caf-post-layout2 span.comment,".$target_div." #caf-post-layout2 .caf-content,".$target_div." #caf-post-layout2 a.caf-read-more {font-family:".$caf_post_font.";}

".$target_div." #caf-post-layout2 .caf-meta-content-cats li a,".$target_div." #caf-post-layout2 #manage-post-area:hover h2, ".$target_div." #caf-post-layout2 span.date {color: ".$caf_post_primary_color.";}

".$target_div." #caf-post-layout2 .caf-meta-content,".$target_div." #caf-post-layout2 .caf-content,".$target_div." #caf-post-layout2 #manage-post-area h2 {color: ".$caf_post_sec_color.";}

".$target_div." #caf-post-layout2 .error-caf{background-color: ".$caf_post_primary_color."; color: ".$caf_post_sec_color2.";font-family:".$caf_post_font.";}

".$target_div." #caf-post-layout2 #manage-post-area {background-color: ".$caf_post_sec_color2.";border: 3px solid ".$caf_post_sec_color.";}
".$target_div." #caf-post-layout2 .caf-featured-img-box {border:4px solid ".$caf_post_sec_color2."}

".$target_div." ul#caf-layout-pagination.post-layout2 li span.current { background: ".$caf_post_sec_color.";color: ".$caf_post_sec_color2.";font-family:".$caf_post_font.";}

".$target_div." ul#caf-layout-pagination.post-layout2 li a{background-color: ".$caf_post_sec_color2.";color:".$caf_post_primary_color.";font-family:".$caf_post_font.";}
".$target_div." .status i {color:".$caf_post_primary_color.";}
</style>";