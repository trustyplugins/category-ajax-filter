<?php
  if (!class_exists( 'CAF_Fa_Icons' ) ) {
    class CAF_Fa_Icons {
     var $icons;
      public function __construct()
      {
      
      }
      public function caf_generate_icon_array() {
        $icons = get_option( 'caf_fa_icons' );
        if ( ! $icons ) {
              $json_path = defined( 'TC_CAF_PATH' ) ? TC_CAF_PATH . 'admin/fa-icons/fontawesome-5.json' : '';
              $json_url  = defined( 'TC_CAF_URL' ) ? TC_CAF_URL . 'admin/fa-icons/fontawesome-5.json' : '';
              $raw       = ( $json_path && file_exists( $json_path ) ) ? file_get_contents( $json_path ) : false;
              if ( false === $raw && $json_url ) {
                  $raw = wp_remote_retrieve_body( wp_remote_get( $json_url ) );
              }
              $all_icons = $raw ? json_decode( $raw, true ) : array();
              $icons     = array();
              if ( is_array( $all_icons ) ) {
                  foreach ( $all_icons as $icon ) {
                      $icons[] = array( 'class' => $icon );
                  }
                  if ( ! empty( $icons ) ) {
                      update_option( 'caf_fa_icons', $icons );
                  }
              }
            }
            $this->icons = $icons;
      }
    
  }
}