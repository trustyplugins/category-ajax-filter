import './index.css';
import './utils/autoHideScrollbar';
import { render } from '@wordpress/element';
import LayoutsList from './LayoutsList';
import AnalyticsDashboardV2 from './MainComponents/AnalyticsDashboardV2';
import CafAntdProvider from './components/CafAntdProvider';
import { isProTier } from './tier/capabilities';

import { Provider } from 'react-redux';
import { store } from './store/store';

// Layout list (WP admin main area)
if (document.getElementById('caf-builder-analytics-root') && isProTier()) {
  render(
    <Provider store={store}>
      <CafAntdProvider>
        <AnalyticsDashboardV2 />
      </CafAntdProvider>
    </Provider>,
    document.getElementById('caf-builder-analytics-root')
  );
} else if (document.getElementById('wpbody-content')) {
  render(
    <Provider store={store}>
      <CafAntdProvider>
        <LayoutsList />
      </CafAntdProvider>
    </Provider>,
    document.getElementById('wpbody-content')
  );
}