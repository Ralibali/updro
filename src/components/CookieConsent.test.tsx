import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CookieConsent from './CookieConsent';
import { initGa4 } from '@/lib/ga4Runtime';

beforeEach(() => {
  localStorage.clear();
  history.replaceState({}, '', '/?email=private@example.test');
  window.gtag = vi.fn();
});
afterEach(cleanup);

describe('consent with shared Google tag', () => {
  it('gives the application sole ownership of pageviews and removes private query parameters', () => {
    initGa4({ measurementId: 'G-TEST123', hosts: [location.hostname], excluded: ['/admin'], consentKey: 'test' });
    render(<MemoryRouter><CookieConsent /></MemoryRouter>);
    expect(vi.mocked(window.gtag!).mock.calls.filter(call => call[0] === 'event')).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Acceptera alla' }));
    const calls = vi.mocked(window.gtag!).mock.calls;
    const adsConfigs = calls.filter(call => call[0] === 'config' && String(call[1]).startsWith('AW-'));
    expect(adsConfigs).toHaveLength(1);
    expect(adsConfigs[0][2]).toMatchObject({ send_page_view: false, page_location: location.origin + '/' });
    expect(calls.filter(call => call[0] === 'event' && call[1] === 'page_view')).toHaveLength(1);
    expect(JSON.stringify(calls)).not.toContain('private@example.test');
  });
});
