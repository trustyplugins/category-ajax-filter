<?php
/**
 * Client error logging and system diagnostics for CAF support (free).
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CAF_Support_Diagnostics {

	const OPTION_KEY      = 'caf_client_error_log';
	const MAX_LOG_ENTRIES = 50;

	public static function init() {
		add_action( 'rest_api_init', array( __CLASS__, 'register_rest_routes' ) );
		add_action( 'admin_menu', array( __CLASS__, 'register_admin_page' ), 99999 );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_admin_assets' ) );
		add_filter( 'admin_body_class', array( __CLASS__, 'append_admin_body_class' ) );
	}

	public static function append_admin_body_class( $classes ) {
		if ( ! is_admin() || ! isset( $_GET['page'], $_GET['post_type'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return $classes;
		}

		$current_page = sanitize_key( wp_unslash( $_GET['page'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$post_type    = sanitize_key( wp_unslash( $_GET['post_type'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		if ( 'caf_posts' === $post_type && 'caf_support_diagnostics' === $current_page ) {
			$classes .= ' caf-builder-support-diagnostics-page';
		}

		return $classes;
	}

	public static function enqueue_admin_assets( $hook_suffix ) {
		if ( 'caf_posts_page_caf_support_diagnostics' !== $hook_suffix ) {
			return;
		}

		wp_enqueue_style(
			'caf-builder-support-diagnostics',
			TC_CAF_URL . 'admin/css/caf-builder-support-diagnostics.css',
			array(),
			defined( 'TC_CAF_PLUGIN_VERSION' ) ? TC_CAF_PLUGIN_VERSION : false
		);
	}

	public static function get_support_env() {
		$theme = wp_get_theme();

		return array(
			'plugin_version' => defined( 'TC_CAF_PLUGIN_VERSION' ) ? TC_CAF_PLUGIN_VERSION : 'unknown',
			'wp_version'     => get_bloginfo( 'version' ),
			'php_version'    => PHP_VERSION,
			'theme'          => $theme->get( 'Name' ),
		);
	}

	public static function register_rest_routes() {
		register_rest_route(
			'caf-custom-builder/v1',
			'/log-client-error',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'rest_log_client_error' ),
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			)
		);

		register_rest_route(
			'caf-custom-builder/v1',
			'/client-error-log',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'rest_get_client_error_log' ),
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			)
		);
	}

	public static function rest_log_client_error( WP_REST_Request $request ) {
		$payload = $request->get_json_params();
		if ( ! is_array( $payload ) ) {
			return new WP_REST_Response( array( 'success' => false ), 400 );
		}

		$entry = self::sanitize_log_entry( $payload );
		if ( empty( $entry['error_id'] ) ) {
			return new WP_REST_Response( array( 'success' => false ), 400 );
		}

		$log   = get_option( self::OPTION_KEY, array() );
		$log   = is_array( $log ) ? $log : array();
		$log[] = $entry;

		if ( count( $log ) > self::MAX_LOG_ENTRIES ) {
			$log = array_slice( $log, -1 * self::MAX_LOG_ENTRIES );
		}

		update_option( self::OPTION_KEY, $log, false );

		return new WP_REST_Response(
			array(
				'success'  => true,
				'error_id' => $entry['error_id'],
			),
			200
		);
	}

	public static function rest_get_client_error_log() {
		$log = get_option( self::OPTION_KEY, array() );
		$log = is_array( $log ) ? array_reverse( $log ) : array();

		return new WP_REST_Response(
			array(
				'success' => true,
				'log'     => $log,
			),
			200
		);
	}

	private static function sanitize_log_entry( array $payload ) {
		$environment = isset( $payload['environment'] ) && is_array( $payload['environment'] )
			? $payload['environment']
			: array();

		return array(
			'error_id'        => sanitize_text_field( $payload['errorId'] ?? '' ),
			'timestamp'       => sanitize_text_field( $payload['timestamp'] ?? gmdate( 'c' ) ),
			'type'            => sanitize_key( $payload['type'] ?? 'section' ),
			'section'         => sanitize_key( $payload['section'] ?? '' ),
			'module_key'      => sanitize_key( $payload['moduleKey'] ?? '' ),
			'module_label'    => sanitize_text_field( $payload['moduleLabel'] ?? '' ),
			'message'         => sanitize_text_field( $payload['message'] ?? '' ),
			'stack'           => self::sanitize_multiline( $payload['stack'] ?? '' ),
			'component_stack' => self::sanitize_multiline( $payload['componentStack'] ?? '' ),
			'environment'     => array(
				'plugin_version' => sanitize_text_field( $environment['pluginVersion'] ?? '' ),
				'wp_version'     => sanitize_text_field( $environment['wpVersion'] ?? '' ),
				'php_version'    => sanitize_text_field( $environment['phpVersion'] ?? '' ),
				'theme'          => sanitize_text_field( $environment['theme'] ?? '' ),
				'user_agent'     => sanitize_text_field( $environment['userAgent'] ?? '' ),
				'page'           => sanitize_text_field( $environment['page'] ?? '' ),
			),
		);
	}

	private static function sanitize_multiline( $value ) {
		$value = is_string( $value ) ? $value : '';
		return substr( sanitize_textarea_field( $value ), 0, 4000 );
	}

	public static function register_admin_page() {
		add_submenu_page(
			'edit.php?post_type=caf_posts',
			__( 'Logs', 'category-ajax-filter' ),
			__( 'Logs', 'category-ajax-filter' ),
			'manage_options',
			'caf_support_diagnostics',
			array( __CLASS__, 'render_admin_page' ),
			12
		);
	}

	public static function render_admin_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		if ( isset( $_POST['caf_clear_error_log'] ) && check_admin_referer( 'caf_clear_error_log' ) ) {
			delete_option( self::OPTION_KEY );
			echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__( 'Error log cleared.', 'category-ajax-filter' ) . '</p></div>';
		}

		$log            = get_option( self::OPTION_KEY, array() );
		$log            = is_array( $log ) ? array_reverse( $log ) : array();
		$support_env    = self::get_support_env();
		$active_plugins = get_option( 'active_plugins', array() );
		$theme          = wp_get_theme();

		?>
		<div class="wrap caf-builder-support-diagnostics">
			<h1 class="caf-builder-support-diagnostics__title"><?php esc_html_e( 'CAF Logs', 'category-ajax-filter' ); ?></h1>
			<p class="caf-builder-support-diagnostics__intro"><?php esc_html_e( 'Use this page when troubleshooting builder issues. Users can copy an Error ID from the builder and you can match it below.', 'category-ajax-filter' ); ?></p>

			<section class="caf-builder-support-diagnostics__section caf-builder-support-diagnostics__section--system">
				<h2 class="caf-builder-support-diagnostics__section-title"><?php esc_html_e( 'System information', 'category-ajax-filter' ); ?></h2>
				<table class="widefat striped caf-builder-support-diagnostics__system-table">
					<tbody>
						<tr><th><?php esc_html_e( 'Plugin version', 'category-ajax-filter' ); ?></th><td><?php echo esc_html( $support_env['plugin_version'] ); ?></td></tr>
						<tr><th><?php esc_html_e( 'WordPress', 'category-ajax-filter' ); ?></th><td><?php echo esc_html( $support_env['wp_version'] ); ?></td></tr>
						<tr><th><?php esc_html_e( 'PHP', 'category-ajax-filter' ); ?></th><td><?php echo esc_html( $support_env['php_version'] ); ?></td></tr>
						<tr><th><?php esc_html_e( 'Theme', 'category-ajax-filter' ); ?></th><td><?php echo esc_html( $theme->get( 'Name' ) ); ?></td></tr>
						<tr><th><?php esc_html_e( 'Active plugins', 'category-ajax-filter' ); ?></th><td><?php echo esc_html( count( (array) $active_plugins ) ); ?></td></tr>
					</tbody>
				</table>
			</section>

			<section class="caf-builder-support-diagnostics__section caf-builder-support-diagnostics__section--errors">
				<h2 class="caf-builder-support-diagnostics__section-title"><?php esc_html_e( 'Recent builder errors', 'category-ajax-filter' ); ?></h2>
				<form method="post" class="caf-builder-support-diagnostics__toolbar">
					<?php wp_nonce_field( 'caf_clear_error_log' ); ?>
					<button type="submit" name="caf_clear_error_log" class="button caf-builder-support-diagnostics__clear-btn"><?php esc_html_e( 'Clear error log', 'category-ajax-filter' ); ?></button>
				</form>

			<?php if ( empty( $log ) ) : ?>
				<p class="caf-builder-support-diagnostics__empty"><?php esc_html_e( 'No errors logged yet.', 'category-ajax-filter' ); ?></p>
			<?php else : ?>
				<table class="widefat striped caf-builder-support-diagnostics__error-table">
					<thead>
						<tr>
							<th><?php esc_html_e( 'Error ID', 'category-ajax-filter' ); ?></th>
							<th><?php esc_html_e( 'Time', 'category-ajax-filter' ); ?></th>
							<th><?php esc_html_e( 'Type', 'category-ajax-filter' ); ?></th>
							<th><?php esc_html_e( 'Section / Module', 'category-ajax-filter' ); ?></th>
							<th><?php esc_html_e( 'Message', 'category-ajax-filter' ); ?></th>
						</tr>
					</thead>
					<tbody>
						<?php foreach ( $log as $entry ) : ?>
							<tr class="caf-builder-support-diagnostics__error-row">
								<td class="caf-builder-support-diagnostics__error-id"><code><?php echo esc_html( $entry['error_id'] ?? '' ); ?></code></td>
								<td class="caf-builder-support-diagnostics__error-time"><?php echo esc_html( $entry['timestamp'] ?? '' ); ?></td>
								<td class="caf-builder-support-diagnostics__error-type"><?php echo esc_html( $entry['type'] ?? '' ); ?></td>
								<td class="caf-builder-support-diagnostics__error-context">
									<?php
									echo esc_html( $entry['section'] ?? '' );
									if ( ! empty( $entry['module_key'] ) ) {
										echo ' / ' . esc_html( $entry['module_key'] );
									}
									?>
								</td>
								<td class="caf-builder-support-diagnostics__error-message"><?php echo esc_html( $entry['message'] ?? '' ); ?></td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			<?php endif; ?>
			</section>
		</div>
		<?php
	}
}
