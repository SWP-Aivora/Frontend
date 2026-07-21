import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { BrowseServicesPage } from '../../../features/services/pages/BrowseServicesPage';

describe('BrowseServicesPage', () => {
  it('shows the missing Client-safe catalog API state instead of calling the Expert mine endpoint', () => {
    render(
      <BrowserRouter>
        <BrowseServicesPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search services')).toBeDisabled();
    expect(screen.getByText(/does not define a Client-safe published services catalog endpoint/i)).toBeInTheDocument();
    expect(screen.getByText(/GET \/api\/v1\/services\/mine is for the Expert's own services/i)).toBeInTheDocument();
  });
});
