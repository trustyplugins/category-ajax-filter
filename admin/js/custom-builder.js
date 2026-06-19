jQuery(function(){

    jQuery("body").on("click",".trusty-manage-bar-sec-label i.caf-plus",function(){
      jQuery(this).toggleClass("fa-minus");
      jQuery(this).closest("li").find("ul").eq(0).toggleClass("tc_caf_active_list");
    })
})

jQuery(document).ready(function($) {
// const searchParams = new URLSearchParams(window.location.search);
// const islayoutPresent = searchParams.has('layout-label');
// const ispostTypePresent = searchParams.has('tc-post-type');
// if (islayoutPresent && ispostTypePresent) {
//  const layout = searchParams.get('layout-label');
//  const postType = searchParams.get('tc-post-type');
//  $('body.post-new-php.post-type-caf_posts').find('#titlewrap').find("#title").val(layout);
//  $('body').find('#general').find('#custom-post-type-select').val(postType);
// }

const searchParams = new URLSearchParams(window.location.search);
const islayoutPresent = searchParams.has('layout-label');
const ispostTypePresent = searchParams.has('tc-post-type');

if (islayoutPresent && ispostTypePresent) {
    const layout = searchParams.get('layout-label');
    const postType = searchParams.get('tc-post-type');

    if ($('body').hasClass('post-new-php') && $('body').hasClass('post-type-caf_posts')) {
        const $titleInput = $('#titlewrap #title');
        if ($titleInput.length) {
            $titleInput
                .val(layout)
                .removeAttr('placeholder')
                .removeAttr('data-placeholder')
                .trigger('input')
                .trigger('change');
        }
    }

    const $postTypeSelect = $('#general #custom-post-type-select');
    if ($postTypeSelect.length) {
        $postTypeSelect.val(postType).trigger('change');
    }
}



}) 
