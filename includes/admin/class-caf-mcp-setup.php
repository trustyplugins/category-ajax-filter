<?php
/**
 * Filters → CAF MCP. Enable access, pick a client, generate a paste-into-AI prompt.
 *
 * @package Category_Ajax_Filter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! class_exists( 'CAF_MCP_Activity', false ) && file_exists( __DIR__ . '/class-caf-mcp-activity.php' ) ) {
	require_once __DIR__ . '/class-caf-mcp-activity.php';
}

if ( ! class_exists( 'CAF_MCP_Setup', false ) ) {

class CAF_MCP_Setup {

	const PAGE            = 'caf-mcp';
	const APP_PREFIX      = 'CAF MCP';
	const OPTION_ACTIVITY = 'caf_mcp_activity';
	const ACTIVITY_MAX    = 80;
	const ACTIVITY_ROW    = 8;

	/**
	 * Application password used on the current request, if any.
	 *
	 * @var array<string, mixed>|null
	 */
	private static $current_auth = null;

	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'register_admin_page' ), 21 );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue' ) );
		add_filter( 'admin_body_class', array( __CLASS__, 'admin_body_class' ) );
		add_action( 'wp_ajax_caf_mcp_set_enabled', array( __CLASS__, 'ajax_set_enabled' ) );
		add_action( 'wp_ajax_caf_mcp_generate_prompt', array( __CLASS__, 'ajax_generate_prompt' ) );
		add_action( 'wp_ajax_caf_mcp_list_connections', array( __CLASS__, 'ajax_list_connections' ) );
		add_action( 'wp_ajax_caf_mcp_revoke_connection', array( __CLASS__, 'ajax_revoke_connection' ) );
		add_action( 'wp_ajax_caf_mcp_revoke_all_connections', array( __CLASS__, 'ajax_revoke_all_connections' ) );
		add_action( 'application_password_did_authenticate', array( __CLASS__, 'remember_auth' ), 10, 2 );
	}

	public static function register_admin_page() {
		add_submenu_page(
			'edit.php?post_type=caf_posts',
			__( 'CAF MCP', 'category-ajax-filter' ),
			__( 'CAF MCP', 'category-ajax-filter' ),
			'manage_options',
			self::PAGE,
			array( __CLASS__, 'render' ),
			9
		);
	}

	/**
	 * @param string $classes Body classes.
	 * @return string
	 */
	public static function admin_body_class( $classes ) {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( $screen && isset( $screen->id ) && 'caf_posts_page_' . self::PAGE === $screen->id ) {
			$classes .= ' caf-mcp-page';
		}
		return $classes;
	}

	/**
	 * @param string $hook Hook.
	 * @return void
	 */
	public static function enqueue( $hook ) {
		if ( 'caf_posts_page_' . self::PAGE !== $hook ) {
			return;
		}
		$ver = defined( 'TC_CAF_PLUGIN_VERSION' ) ? TC_CAF_PLUGIN_VERSION : false;
		wp_enqueue_style(
			'google-fonts-inter',
			'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
			array(),
			null
		);
		wp_enqueue_style(
			'caf-mcp-setup',
			TC_CAF_URL . 'admin/css/caf-mcp-setup.css',
			array( 'google-fonts-inter' ),
			$ver
		);
		wp_enqueue_script(
			'caf-mcp-setup',
			TC_CAF_URL . 'admin/js/caf-mcp-setup.js',
			array(),
			$ver,
			true
		);
		wp_localize_script(
			'caf-mcp-setup',
			'cafMcpSetup',
			array(
				'ajax'    => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( 'caf_mcp_setup' ),
				'enabled' => class_exists( 'CAF_MCP_Http', false ) && CAF_MCP_Http::is_enabled(),
				'i18n'    => array(
					'copied'     => __( 'Copied', 'category-ajax-filter' ),
					'copy'       => __( 'Copy prompt', 'category-ajax-filter' ),
					'failed'     => __( 'Could not generate a prompt.', 'category-ajax-filter' ),
					'ack'        => __( 'Tick the checkbox first. Generating a prompt creates an application password for this site.', 'category-ajax-filter' ),
					'enable'     => __( 'Turn on CAF MCP access first.', 'category-ajax-filter' ),
					'revoke'     => __( 'Revoke this client? It will be disconnected immediately. Generate a new prompt to reconnect.', 'category-ajax-filter' ),
					'revokeAll'  => __( 'Revoke every CAF MCP credential on this site? All connected AI clients will be disconnected.', 'category-ajax-filter' ),
					'revokeFail' => __( 'Could not revoke that client.', 'category-ajax-filter' ),
					'turnOn'     => __( 'Turn on', 'category-ajax-filter' ),
					'turnOff'    => __( 'Turn off', 'category-ajax-filter' ),
				),
			)
		);
	}

	public static function render() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		$enabled = class_exists( 'CAF_MCP_Http', false ) && CAF_MCP_Http::is_enabled();
		$https   = is_ssl() || self::is_local_host();
		$apps    = function_exists( 'wp_is_application_passwords_available' ) && wp_is_application_passwords_available();
		$client_keys = array_keys( self::clients() );
		$first       = isset( $client_keys[0] ) ? $client_keys[0] : 'claude-code';
		?>
		<div class="wrap caf-mcp-setup">
			<h1 class="screen-reader-text"><?php esc_html_e( 'Category Ajax Filter MCP', 'category-ajax-filter' ); ?></h1>
			<header class="caf-mcp-head">
				<p class="caf-mcp-head__eyebrow"><?php esc_html_e( 'Model Context Protocol', 'category-ajax-filter' ); ?></p>
				<p class="caf-mcp-head__title"><?php esc_html_e( 'Category Ajax Filter MCP', 'category-ajax-filter' ); ?></p>
				<p class="caf-mcp-head__lead">
					<?php esc_html_e( 'Give AI agents the full power of the CAF builder. Connect Cursor, Claude, Codex, or any MCP client to this site.', 'category-ajax-filter' ); ?>
					<a href="https://modelcontextprotocol.io/" target="_blank" rel="noopener noreferrer"><?php esc_html_e( 'What is MCP?', 'category-ajax-filter' ); ?></a>
				</p>
			</header>

			<?php if ( ! $https ) : ?>
				<div class="notice notice-warning"><p><?php esc_html_e( 'Application passwords need HTTPS (or a local site). This site is neither — MCP login may fail.', 'category-ajax-filter' ); ?></p></div>
			<?php endif; ?>
			<?php if ( ! $apps ) : ?>
				<div class="notice notice-error"><p><?php esc_html_e( 'WordPress application passwords are disabled (a security plugin may have turned them off).', 'category-ajax-filter' ); ?></p></div>
			<?php endif; ?>

			<section class="caf-mcp-card caf-mcp-gate" id="caf-mcp-off" <?php echo $enabled ? 'hidden' : ''; ?>>
				<h2><?php esc_html_e( 'MCP access is off', 'category-ajax-filter' ); ?></h2>
				<p><?php esc_html_e( 'Turn it on to connect Cursor, Claude, Codex, or another MCP client.', 'category-ajax-filter' ); ?></p>
				<button type="button" class="button button-primary caf-mcp-toggle" data-enable="1"><?php esc_html_e( 'Turn on MCP access', 'category-ajax-filter' ); ?></button>
			</section>

			<section class="caf-mcp-card" id="caf-mcp-on" <?php echo $enabled ? '' : 'hidden'; ?>>
				<div class="caf-mcp-setup__tabs" role="tablist">
					<?php foreach ( self::clients() as $key => $client ) : ?>
						<button type="button" class="caf-mcp-setup__tab<?php echo $first === $key ? ' is-active' : ''; ?>" data-client="<?php echo esc_attr( $key ); ?>" role="tab">
							<?php echo esc_html( $client['label'] ); ?>
						</button>
					<?php endforeach; ?>
				</div>

				<div class="caf-mcp-connect" id="caf-mcp-clients">
					<div class="caf-mcp-connect__left">
						<?php foreach ( self::clients() as $key => $client ) : ?>
							<div class="caf-mcp-setup__panel<?php echo $first === $key ? ' is-active' : ''; ?>" data-panel="<?php echo esc_attr( $key ); ?>">
								<h2><?php echo esc_html( sprintf( /* translators: %s client name */ __( 'Connect this site to %s', 'category-ajax-filter' ), $client['label'] ) ); ?></h2>
								<p><?php echo esc_html( $client['help'] ); ?></p>
							</div>
						<?php endforeach; ?>
						<label class="caf-mcp-setup__ack">
							<input type="checkbox" id="caf-mcp-ack" />
							<span><?php echo wp_kses( __( 'I understand that clicking <strong>Generate Prompt</strong> will create an application password for this site.', 'category-ajax-filter' ), array( 'strong' => array() ) ); ?></span>
						</label>
						<p class="caf-mcp-setup__actions">
							<button type="button" class="button button-primary" id="caf-mcp-generate" disabled>
								<span class="dashicons dashicons-media-text"></span>
								<?php esc_html_e( 'Generate Prompt', 'category-ajax-filter' ); ?>
							</button>
							<button type="button" class="button" id="caf-mcp-copy" hidden><?php esc_html_e( 'Copy prompt', 'category-ajax-filter' ); ?></button>
							<button type="button" class="button" id="caf-mcp-copy-test" hidden><?php esc_html_e( 'Copy test prompt', 'category-ajax-filter' ); ?></button>
						</p>
						<p class="caf-mcp-setup__error" id="caf-mcp-error" hidden></p>
						<p class="caf-mcp-setup__manual-link"><a href="#caf-mcp-manual-wrap" id="caf-mcp-manual-link"><?php esc_html_e( 'Prefer manual configuration?', 'category-ajax-filter' ); ?></a></p>
					</div>
					<div class="caf-mcp-connect__right">
						<label class="caf-mcp-setup__prompt-label" for="caf-mcp-prompt"><?php esc_html_e( 'Setup prompt', 'category-ajax-filter' ); ?></label>
						<textarea id="caf-mcp-prompt" class="caf-mcp-setup__prompt" rows="16" readonly placeholder="<?php esc_attr_e( 'Your setup prompt will appear here after you generate it.', 'category-ajax-filter' ); ?>"></textarea>
					</div>
				</div>

				<div id="caf-mcp-manual-wrap" class="caf-mcp-setup__manual" hidden>
					<pre id="caf-mcp-manual"></pre>
				</div>
			</section>

			<section class="caf-mcp-card caf-mcp-connections" id="caf-mcp-connections">
				<h2><?php esc_html_e( 'Connected clients', 'category-ajax-filter' ); ?></h2>
				<p class="caf-mcp-connections__lead"><?php esc_html_e( 'Each generated prompt creates an application password for one AI app. Revoke a client to disconnect it immediately.', 'category-ajax-filter' ); ?></p>
				<div id="caf-mcp-connections-wrap">
					<?php self::render_connections_inner(); ?>
				</div>
			</section>

			<section class="caf-mcp-card caf-mcp-kill" id="caf-mcp-kill" <?php echo $enabled ? '' : 'hidden'; ?>>
				<h2><?php esc_html_e( 'Turn off MCP access', 'category-ajax-filter' ); ?></h2>
				<p><?php esc_html_e( 'Agents won’t be able to reach the MCP server until you turn this back on. Revoke a client above if that app must not reconnect later.', 'category-ajax-filter' ); ?></p>
				<button type="button" class="button caf-mcp-toggle" data-enable="0"><?php esc_html_e( 'Turn off', 'category-ajax-filter' ); ?></button>
			</section>
		</div>
		<?php
	}

	public static function ajax_set_enabled() {
		check_ajax_referer( 'caf_mcp_setup' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'forbidden' ), 403 );
		}
		$on = ! empty( $_POST['enabled'] ) && '1' === (string) wp_unslash( $_POST['enabled'] );
		update_option( CAF_MCP_Http::OPTION_ENABLED, $on ? '1' : '0', false );
		wp_send_json_success(
			array(
				'enabled' => $on,
				'url'     => CAF_MCP_Http::endpoint_url(),
			)
		);
	}

	public static function ajax_generate_prompt() {
		check_ajax_referer( 'caf_mcp_setup' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'forbidden' ), 403 );
		}
		if ( ! CAF_MCP_Http::is_enabled() ) {
			wp_send_json_error( array( 'message' => __( 'Turn on CAF MCP access first.', 'category-ajax-filter' ) ), 400 );
		}
		if ( ! class_exists( 'WP_Application_Passwords' ) || ! wp_is_application_passwords_available() ) {
			wp_send_json_error( array( 'message' => __( 'Application passwords are not available on this site.', 'category-ajax-filter' ) ), 400 );
		}

		$client_key = isset( $_POST['client'] ) ? sanitize_key( wp_unslash( $_POST['client'] ) ) : 'claude-code';
		$clients    = self::clients();
		if ( ! isset( $clients[ $client_key ] ) ) {
			$client_key = 'claude-code';
		}

		$user = wp_get_current_user();
		$name = self::APP_PREFIX . ' (' . $clients[ $client_key ]['label'] . ')';
		$existing = WP_Application_Passwords::get_user_application_passwords( $user->ID );
		if ( is_array( $existing ) ) {
			foreach ( $existing as $item ) {
				if ( isset( $item['name'], $item['uuid'] ) && $name === $item['name'] ) {
					WP_Application_Passwords::delete_application_password( $user->ID, $item['uuid'] );
				}
			}
		}

		$created = WP_Application_Passwords::create_new_application_password(
			$user->ID,
			array( 'name' => $name )
		);
		if ( is_wp_error( $created ) || empty( $created[0] ) ) {
			$msg = is_wp_error( $created ) ? $created->get_error_message() : 'empty';
			wp_send_json_error( array( 'message' => $msg ), 500 );
		}

		$password = (string) $created[0];
		$payload  = self::build_payload( $client_key, $user->user_login, $password );
		$payload['connections_html'] = self::get_connections_html();
		wp_send_json_success( $payload );
	}

	public static function ajax_list_connections() {
		check_ajax_referer( 'caf_mcp_setup' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'forbidden' ), 403 );
		}
		wp_send_json_success( array( 'html' => self::get_connections_html() ) );
	}

	public static function ajax_revoke_connection() {
		check_ajax_referer( 'caf_mcp_setup' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'forbidden' ), 403 );
		}
		if ( ! class_exists( 'WP_Application_Passwords' ) ) {
			wp_send_json_error( array( 'message' => __( 'Application passwords are not available on this site.', 'category-ajax-filter' ) ), 400 );
		}
		$user_id = isset( $_POST['user_id'] ) ? absint( wp_unslash( $_POST['user_id'] ) ) : 0;
		$uuid    = isset( $_POST['uuid'] ) ? sanitize_text_field( wp_unslash( $_POST['uuid'] ) ) : '';
		if ( $user_id < 1 || ! wp_is_uuid( $uuid ) || ! self::can_revoke( $user_id, $uuid ) ) {
			wp_send_json_error( array( 'message' => __( 'That client is not in the CAF MCP list.', 'category-ajax-filter' ) ), 400 );
		}
		$deleted = WP_Application_Passwords::delete_application_password( $user_id, $uuid );
		if ( is_wp_error( $deleted ) ) {
			wp_send_json_error( array( 'message' => $deleted->get_error_message() ), 500 );
		}
		wp_send_json_success( array( 'html' => self::get_connections_html() ) );
	}

	public static function ajax_revoke_all_connections() {
		check_ajax_referer( 'caf_mcp_setup' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( array( 'message' => 'forbidden' ), 403 );
		}
		if ( ! class_exists( 'WP_Application_Passwords' ) ) {
			wp_send_json_error( array( 'message' => __( 'Application passwords are not available on this site.', 'category-ajax-filter' ) ), 400 );
		}
		foreach ( self::get_connections() as $row ) {
			if ( empty( $row['user_id'] ) || empty( $row['uuid'] ) ) {
				continue;
			}
			WP_Application_Passwords::delete_application_password( (int) $row['user_id'], (string) $row['uuid'] );
		}
		wp_send_json_success( array( 'html' => self::get_connections_html() ) );
	}

	/**
	 * @param WP_User $user User.
	 * @param array   $item Application password item.
	 * @return void
	 */
	public static function remember_auth( $user, $item ) {
		if ( ! $user instanceof WP_User || ! is_array( $item ) ) {
			return;
		}
		self::$current_auth = array(
			'user_id' => (int) $user->ID,
			'uuid'    => isset( $item['uuid'] ) ? (string) $item['uuid'] : '',
			'name'    => isset( $item['name'] ) ? (string) $item['name'] : '',
		);
	}

	/**
	 * Record an authenticated MCP JSON-RPC call. Stores a short summary only — no payloads or secrets.
	 *
	 * @param string               $method JSON-RPC method.
	 * @param string               $tool   Tool name when method is tools/call.
	 * @param array<string, mixed> $args   Tool arguments (not stored).
	 * @return void
	 */
	public static function log_activity( $method, $tool = '', $args = array() ) {
		$method = sanitize_text_field( (string) $method );
		$tool   = sanitize_text_field( (string) $tool );
		if ( ! is_array( $args ) ) {
			$args = array();
		}
		if ( '' === $method || 'ping' === $method || 0 === strpos( $method, 'notifications/' ) ) {
			return;
		}
		if ( in_array( $method, array( 'tools/list', 'resources/list', 'resources/read' ), true ) ) {
			return;
		}

		$summary = class_exists( 'CAF_MCP_Activity', false )
			? CAF_MCP_Activity::summarize( $method, $tool, $args )
			: '';
		if ( '' === $summary ) {
			return;
		}

		$user   = wp_get_current_user();
		$auth   = is_array( self::$current_auth ) ? self::$current_auth : array();
		$uuid   = isset( $auth['uuid'] ) ? (string) $auth['uuid'] : '';
		$log    = self::get_activity();
		$layout = class_exists( 'CAF_MCP_Activity', false )
			? CAF_MCP_Activity::layout_id( isset( $args['layout_id'] ) ? $args['layout_id'] : '' )
			: '';

		if ( 'initialize' === $method && ! empty( $log[0] ) && is_array( $log[0] ) ) {
			$prev = $log[0];
			if ( isset( $prev['uuid'], $prev['method'], $prev['t'] )
				&& $uuid === (string) $prev['uuid']
				&& 'initialize' === (string) $prev['method']
				&& ( time() - (int) $prev['t'] ) < 120
			) {
				return;
			}
		}

		$entry = array(
			't'       => time(),
			'uid'     => (int) $user->ID,
			'login'   => (string) $user->user_login,
			'uuid'    => $uuid,
			'name'    => isset( $auth['name'] ) ? (string) $auth['name'] : '',
			'ip'      => self::request_ip(),
			'ua'      => self::request_ua(),
			'method'  => $method,
			'tool'    => $tool,
			'layout'  => $layout,
			'summary' => $summary,
		);
		array_unshift( $log, $entry );
		$log = array_slice( $log, 0, self::ACTIVITY_MAX );
		update_option( self::OPTION_ACTIVITY, $log, false );
	}

	/**
	 * @return string
	 */
	private static function get_connections_html() {
		ob_start();
		self::render_connections_inner();
		return (string) ob_get_clean();
	}

	private static function render_connections_inner() {
		$rows = self::get_connections();
		if ( empty( $rows ) ) {
			echo '<p class="caf-mcp-setup__empty">';
			esc_html_e( 'No CAF MCP credentials yet. Generate a prompt above to connect an AI client.', 'category-ajax-filter' );
			echo '</p>';
			return;
		}

		echo '<div class="caf-mcp-conn-list">';
		foreach ( $rows as $row ) {
			$meta = array();
			if ( ! empty( $row['user_label'] ) ) {
				$meta[] = $row['user_label'];
			}
			$meta[] = $row['last_seen_label'];
			if ( ! empty( $row['last_ip'] ) ) {
				$meta[] = $row['last_ip'];
			}
			$log = self::activity_for_uuid( isset( $row['uuid'] ) ? (string) $row['uuid'] : '' );
			echo '<article class="caf-mcp-conn caf-mcp-conn--' . esc_attr( $row['status'] ) . '">';
			echo '<div class="caf-mcp-conn__head">';
			echo '<div class="caf-mcp-conn__main">';
			echo '<div class="caf-mcp-conn__title"><strong>' . esc_html( $row['client'] ) . '</strong>';
			echo ' <span class="caf-mcp-setup__badge caf-mcp-setup__badge--' . esc_attr( $row['status'] ) . '">' . esc_html( $row['status_label'] ) . '</span></div>';
			if ( ! empty( $row['other'] ) ) {
				echo '<p class="caf-mcp-conn__note">' . esc_html__( 'Not created from this page — used MCP anyway.', 'category-ajax-filter' ) . '</p>';
			}
			echo '<p class="caf-mcp-conn__meta">' . esc_html( implode( ' · ', $meta ) ) . '</p>';
			echo '</div>';
			echo '<button type="button" class="caf-mcp-revoke" data-user="' . esc_attr( (string) $row['user_id'] ) . '" data-uuid="' . esc_attr( $row['uuid'] ) . '">' . esc_html__( 'Revoke', 'category-ajax-filter' ) . '</button>';
			echo '</div>';
			self::render_connection_log( $log );
			echo '</article>';
		}
		echo '</div>';
		echo '<p class="caf-mcp-conn-actions"><button type="button" class="caf-mcp-revoke--all" id="caf-mcp-revoke-all">' . esc_html__( 'Revoke all', 'category-ajax-filter' ) . '</button></p>';
	}

	/**
	 * Compact per-client log, collapsed by default.
	 *
	 * @param array<int, array<string, mixed>> $log Rows newest first.
	 * @return void
	 */
	private static function render_connection_log( $log ) {
		$count = is_array( $log ) ? count( $log ) : 0;
		echo '<details class="caf-mcp-conn__log">';
		echo '<summary>';
		echo '<span class="caf-mcp-conn__log-label">' . esc_html__( 'Activity', 'category-ajax-filter' ) . '</span>';
		if ( $count > 0 ) {
			echo '<span class="caf-mcp-conn__log-count">' . esc_html( (string) $count ) . '</span>';
		} else {
			echo '<span class="caf-mcp-conn__log-empty">' . esc_html__( 'None yet', 'category-ajax-filter' ) . '</span>';
		}
		echo '</summary>';
		if ( $count < 1 ) {
			echo '<p class="caf-mcp-conn__log-none">' . esc_html__( 'This client has not called CAF MCP yet.', 'category-ajax-filter' ) . '</p>';
			echo '</details>';
			return;
		}
		echo '<ol class="caf-mcp-conn__log-list">';
		foreach ( $log as $item ) {
			$when   = self::format_when( isset( $item['t'] ) ? (int) $item['t'] : 0 );
			$action = ! empty( $item['summary'] )
				? (string) $item['summary']
				: self::format_action_label(
					isset( $item['method'] ) ? (string) $item['method'] : '',
					isset( $item['tool'] ) ? (string) $item['tool'] : '',
					isset( $item['layout'] ) ? (string) $item['layout'] : ''
				);
			echo '<li><span class="caf-mcp-conn__log-time">' . esc_html( $when ) . '</span><span class="caf-mcp-conn__log-action">' . esc_html( $action ) . '</span></li>';
		}
		echo '</ol></details>';
	}

	/**
	 * @param string $uuid Password uuid.
	 * @return array<int, array<string, mixed>>
	 */
	private static function activity_for_uuid( $uuid ) {
		if ( '' === $uuid ) {
			return array();
		}
		$out = array();
		foreach ( self::get_activity() as $item ) {
			if ( empty( $item['uuid'] ) || (string) $item['uuid'] !== $uuid ) {
				continue;
			}
			$out[] = $item;
			if ( count( $out ) >= self::ACTIVITY_ROW ) {
				break;
			}
		}
		return $out;
	}

	/**
	 * @return array<int, array<string, mixed>>
	 */
	private static function get_connections() {
		if ( ! class_exists( 'WP_Application_Passwords' ) ) {
			return array();
		}
		$activity = self::get_activity();
		$latest   = array();
		foreach ( $activity as $item ) {
			if ( empty( $item['uuid'] ) || isset( $latest[ $item['uuid'] ] ) ) {
				continue;
			}
			$latest[ $item['uuid'] ] = $item;
		}

		$users = get_users(
			array(
				'meta_key' => WP_Application_Passwords::USERMETA_KEY_APPLICATION_PASSWORDS,
				'number'   => 80,
			)
		);
		$rows  = array();
		foreach ( $users as $user ) {
			if ( ! $user instanceof WP_User ) {
				continue;
			}
			$passwords = WP_Application_Passwords::get_user_application_passwords( $user->ID );
			if ( ! is_array( $passwords ) ) {
				continue;
			}
			foreach ( $passwords as $item ) {
				if ( ! is_array( $item ) || empty( $item['uuid'] ) ) {
					continue;
				}
				$name   = isset( $item['name'] ) ? (string) $item['name'] : '';
				$uuid   = (string) $item['uuid'];
				$is_caf = self::is_caf_password( $name );
				if ( ! $is_caf && ! isset( $latest[ $uuid ] ) ) {
					continue;
				}
				$seen       = isset( $latest[ $uuid ] ) ? $latest[ $uuid ] : array();
				$last_ts    = 0;
				$last_ip    = isset( $item['last_ip'] ) ? (string) $item['last_ip'] : '';
				$last_action = '';
				$ua         = '';
				if ( ! empty( $seen['t'] ) ) {
					$last_ts     = (int) $seen['t'];
					$last_action = ! empty( $seen['summary'] )
						? (string) $seen['summary']
						: self::format_action( isset( $seen['method'] ) ? (string) $seen['method'] : '', isset( $seen['tool'] ) ? (string) $seen['tool'] : '' );
					if ( ! empty( $seen['ip'] ) ) {
						$last_ip = (string) $seen['ip'];
					}
					if ( ! empty( $seen['ua'] ) ) {
						$ua = (string) $seen['ua'];
					}
				} elseif ( ! empty( $item['last_used'] ) ) {
					$last_ts = (int) $item['last_used'];
				}
				$status = 'idle';
				$label  = __( 'Idle', 'category-ajax-filter' );
				if ( $last_ts < 1 ) {
					$status = 'never';
					$label  = __( 'Never used', 'category-ajax-filter' );
				} elseif ( ( time() - $last_ts ) <= 15 * MINUTE_IN_SECONDS ) {
					$status = 'active';
					$label  = __( 'Active', 'category-ajax-filter' );
				}
				$rows[] = array(
					'uuid'            => $uuid,
					'user_id'         => (int) $user->ID,
					'client'          => self::client_label_from_name( $name ),
					'user_label'      => $user->display_name ? $user->display_name : $user->user_login,
					'user_email'      => (string) $user->user_email,
					'status'          => $status,
					'status_label'    => $label,
					'last_seen_label' => $last_ts ? self::format_when( $last_ts ) : __( 'Never', 'category-ajax-filter' ),
					'created_label'   => ! empty( $item['created'] ) ? self::format_when( (int) $item['created'] ) : '',
					'last_ip'         => $last_ip,
					'last_action'     => $last_action,
					'user_agent'      => $ua,
					'other'           => ! $is_caf,
				);
			}
		}

		usort(
			$rows,
			static function ( $a, $b ) {
				$order = array(
					'active' => 0,
					'idle'   => 1,
					'never'  => 2,
				);
				$sa    = isset( $order[ $a['status'] ] ) ? $order[ $a['status'] ] : 9;
				$sb    = isset( $order[ $b['status'] ] ) ? $order[ $b['status'] ] : 9;
				if ( $sa === $sb ) {
					return strcasecmp( (string) $a['client'], (string) $b['client'] );
				}
				return $sa - $sb;
			}
		);

		return $rows;
	}

	/**
	 * @param int    $user_id User id.
	 * @param string $uuid    Password uuid.
	 * @return bool
	 */
	private static function can_revoke( $user_id, $uuid ) {
		foreach ( self::get_connections() as $row ) {
			if ( (int) $row['user_id'] === (int) $user_id && (string) $row['uuid'] === (string) $uuid ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @param string $name Password name.
	 * @return bool
	 */
	private static function is_caf_password( $name ) {
		return 0 === strpos( (string) $name, self::APP_PREFIX );
	}

	/**
	 * @param string $name Password name.
	 * @return string
	 */
	private static function client_label_from_name( $name ) {
		$name = (string) $name;
		if ( preg_match( '/^\Q' . self::APP_PREFIX . '\E\s*\((.+)\)\s*$/', $name, $m ) ) {
			return (string) $m[1];
		}
		if ( self::is_caf_password( $name ) ) {
			return self::APP_PREFIX;
		}
		return $name ? $name : __( 'Unknown client', 'category-ajax-filter' );
	}

	/**
	 * @param string $method Method.
	 * @param string $tool   Tool.
	 * @return string
	 */
	private static function format_action( $method, $tool ) {
		return self::format_action_label( $method, $tool, '' );
	}

	/**
	 * Human line for the compact activity log. No secrets.
	 *
	 * @param string $method JSON-RPC method.
	 * @param string $tool   Tool name.
	 * @param string $layout Layout id.
	 * @return string
	 */
	private static function format_action_label( $method, $tool, $layout ) {
		if ( class_exists( 'CAF_MCP_Activity', false ) ) {
			return CAF_MCP_Activity::format_legacy( $method, $tool, $layout );
		}
		return $tool ? $tool : $method;
	}


	/**
	 * @param int $timestamp Unix time.
	 * @return string
	 */
	private static function format_when( $timestamp ) {
		$timestamp = (int) $timestamp;
		if ( $timestamp < 1 ) {
			return '';
		}
		$diff = human_time_diff( $timestamp, time() );
		if ( ( time() - $timestamp ) < DAY_IN_SECONDS ) {
			return sprintf( /* translators: %s: human time difference */ __( '%s ago', 'category-ajax-filter' ), $diff );
		}
		return wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), $timestamp );
	}

	/**
	 * @return array<int, array<string, mixed>>
	 */
	private static function get_activity() {
		$log = get_option( self::OPTION_ACTIVITY, array() );
		return is_array( $log ) ? $log : array();
	}

	/**
	 * @return string
	 */
	private static function request_ip() {
		if ( empty( $_SERVER['REMOTE_ADDR'] ) ) {
			return '';
		}
		$ip = sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) );
		return filter_var( $ip, FILTER_VALIDATE_IP ) ? $ip : '';
	}

	/**
	 * @return string
	 */
	private static function request_ua() {
		if ( empty( $_SERVER['HTTP_USER_AGENT'] ) ) {
			return '';
		}
		return substr( sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ), 0, 120 );
	}

	/**
	 * @return array<string, array<string, string>>
	 */
	private static function clients() {
		return array(
			'claude-code'    => array(
				'label'       => 'Claude Code',
				'help'        => __( 'Paste this prompt into Claude Code to connect your site. As part of this process, an application password will be created to enable the connection.', 'category-ajax-filter' ),
				'config_path' => '~/.claude.json  ·  %USERPROFILE%\\.claude.json',
			),
			'claude-desktop' => array(
				'label'       => 'Claude Desktop',
				'help'        => __( 'Do not paste this into an AI chat. Copy the JSON into claude_desktop_config.json yourself, then fully quit and reopen Claude Desktop.', 'category-ajax-filter' ),
				'config_path' => __( 'Windows: %APPDATA%\\Claude\\claude_desktop_config.json  ·  macOS: ~/Library/Application Support/Claude/claude_desktop_config.json  ·  Linux: ~/.config/Claude/claude_desktop_config.json', 'category-ajax-filter' ),
			),
			'codex'          => array(
				'label'       => 'Codex',
				'help'        => __( 'Paste this prompt into Codex to connect your site. As part of this process, an application password will be created to enable the connection.', 'category-ajax-filter' ),
				'config_path' => '~/.codex/config.toml  ·  %USERPROFILE%\\.codex\\config.toml',
			),
			'cursor'         => array(
				'label'       => 'Cursor',
				'help'        => __( 'Paste this prompt into a new Cursor chat, or add the JSON yourself. Then reload MCP in Cursor Settings.', 'category-ajax-filter' ),
				'config_path' => '~/.cursor/mcp.json  ·  %USERPROFILE%\\.cursor\\mcp.json',
			),
			'other'          => array(
				'label'       => 'Other',
				'help'        => __( 'Any MCP client that can POST JSON-RPC to an HTTPS URL with an Authorization header. Use the URL and Basic auth from the generated prompt.', 'category-ajax-filter' ),
				'config_path' => __( 'See the generated prompt for URL and Basic auth.', 'category-ajax-filter' ),
			),
		);
	}

	/**
	 * @param string $client Client key.
	 * @param string $username WP user login.
	 * @param string $password Application password.
	 * @return array<string, string>
	 */
	private static function build_payload( $client, $username, $password ) {
		$url    = CAF_MCP_Http::endpoint_url();
		$slug   = sanitize_title( get_bloginfo( 'name' ) );
		$server = ( $slug ? $slug : 'site' ) . '-caf';
		$basic  = base64_encode( $username . ':' . $password );

		$cursor_json = array(
			'mcpServers' => array(
				$server => array(
					'url'     => $url,
					'headers' => array(
						'Authorization' => 'Basic ' . $basic,
					),
				),
			),
		);
		$claude_json = array(
			'mcpServers' => array(
				$server => array(
					'type'    => 'http',
					'url'     => $url,
					'headers' => array(
						'Authorization' => 'Basic ' . $basic,
					),
				),
			),
		);
		$desktop_json = array(
			'mcpServers' => array(
				$server => array(
					'command' => 'npx',
					'args'    => array( '-y', 'mcp-remote', $url, '--header', 'Authorization:${AUTH_HEADER}' ),
					'env'     => array(
						'AUTH_HEADER' => 'Basic ' . $basic,
					),
				),
			),
		);
		$codex = "[mcp_servers.{$server}]\nurl = \"{$url}\"\n\n[mcp_servers.{$server}.headers]\nAuthorization = \"Basic {$basic}\"\n";

		$config_json = $cursor_json;
		$config_path = '~/.cursor/mcp.json for Linux/MacOS and %USERPROFILE%\\.cursor\\mcp.json for Windows';
		$manual      = wp_json_encode( $cursor_json, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );

		if ( 'claude-code' === $client ) {
			$config_json = $claude_json;
			$config_path = '~/.claude.json for Linux/MacOS and %USERPROFILE%\\.claude.json for Windows';
			$manual      = wp_json_encode( $claude_json, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
		} elseif ( 'claude-desktop' === $client ) {
			$http_json    = wp_json_encode( $cursor_json, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
			$remote_json  = wp_json_encode( $desktop_json, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES );
			$prompt       = self::claude_desktop_instructions( $server, $http_json, $remote_json );
			return array(
				'prompt'      => $prompt,
				'test_prompt' => 'In Claude Desktop, list the tools on the CAF MCP server "' . $server . '", then list CAF layouts.',
				'manual'      => $http_json,
				'result_help' => __( 'Do not paste this into Claude or Cursor chat. Copy these steps, edit the config file on this computer, then fully quit and reopen Claude Desktop.', 'category-ajax-filter' ),
				'server_name' => $server,
				'url'         => $url,
			);
		} elseif ( 'codex' === $client ) {
			$config_path = '~/.codex/config.toml for Linux/MacOS and %USERPROFILE%\\.codex\\config.toml for Windows';
			$manual      = $codex;
		}

		$pretty = is_array( $config_json ) ? wp_json_encode( $config_json, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) : $manual;

		$prompt  = "I want to add this WordPress site as an MCP server to this AI client.\n\n";
		$prompt .= "Connection details:\n";
		$prompt .= '- Server URL: ' . $url . "\n";
		$prompt .= '- Username: ' . $username . "\n";
		$prompt .= '- Application password: ' . $password . "\n";
		$prompt .= '- Server name to use in the config: ' . $server . "\n\n";
		$prompt .= "Please:\n";
		$prompt .= '1. Open or create the config file at: ' . $config_path . "\n";
		$prompt .= "2. Add this MCP server configuration to the existing servers (do not remove other MCP servers):\n\n";
		$prompt .= "```json\n" . $pretty . "\n```\n\n";
		if ( 'codex' === $client ) {
			$prompt .= "For Codex, write this TOML instead of JSON:\n\n```toml\n" . $codex . "```\n\n";
		}
		$prompt .= "3. Save the file\n";
		$prompt .= "4. Restart or reload the AI client if needed\n";

		$test = 'Use the CAF MCP server "' . $server . '". List its tools, then list CAF layouts on this WordPress site.';

		return array(
			'prompt'      => $prompt,
			'test_prompt' => $test,
			'manual'      => $manual,
			'result_help' => __( 'Treat this like a password. Paste it into a new chat in that app, or add the JSON/TOML to the config file yourself (Windows, macOS, or Linux). Then reload the client.', 'category-ajax-filter' ),
			'server_name' => $server,
			'url'         => $url,
		);
	}

	/**
	 * Human steps for Claude Desktop on every OS. Never ask an AI to write this file.
	 *
	 * @param string $server Server id.
	 * @param string $http_json HTTP url+headers JSON.
	 * @param string $remote_json npx mcp-remote fallback JSON.
	 * @return string
	 */
	private static function claude_desktop_instructions( $server, $http_json, $remote_json ) {
		$out  = "Add CAF MCP in Claude Desktop yourself. Do not paste this into Claude, Cursor, or any other AI chat — they cannot edit Claude Desktop's config.\n\n";
		$out .= "1. Fully quit Claude Desktop (closing the window is not enough).\n";
		$out .= "   - Windows: right-click the Claude icon in the system tray → Quit.\n";
		$out .= "   - macOS: Claude menu → Quit Claude.\n";
		$out .= "   - Linux: quit the Claude Desktop app completely.\n\n";
		$out .= "2. Open this file in Notepad, TextEdit, or any editor. Create the folder and file if they do not exist:\n";
		$out .= "   - Windows: %APPDATA%\\Claude\\claude_desktop_config.json\n";
		$out .= "     (paste that into File Explorer's address bar and press Enter)\n";
		$out .= "   - macOS: ~/Library/Application Support/Claude/claude_desktop_config.json\n";
		$out .= "   - Linux: ~/.config/Claude/claude_desktop_config.json\n\n";
		$out .= "3. Merge the server \"" . $server . "\" into mcpServers. Keep any other servers already in the file.\n\n";
		$out .= "Use this first (HTTP, no Node.js):\n\n";
		$out .= $http_json . "\n\n";
		$out .= "4. Save the file, then open Claude Desktop again.\n";
		$out .= "5. Start a new chat and ask it to list CAF layouts.\n\n";
		$out .= "If the server does not appear, Claude Desktop on your version may not accept URL+headers. Replace the server block with this fallback (install Node.js from nodejs.org first, any OS):\n\n";
		$out .= $remote_json . "\n";
		return $out;
	}

	/**
	 * @return bool
	 */
	private static function is_local_host() {
		$host = wp_parse_url( home_url(), PHP_URL_HOST );
		return in_array( $host, array( 'localhost', '127.0.0.1' ), true );
	}
}

}
