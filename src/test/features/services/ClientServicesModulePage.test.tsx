import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ClientServicesModulePage } from '../../../features/services/pages/ClientServicesModulePage';

const renderModule = (path: string) => render(
  <MemoryRouter initialEntries={[path]}>
    <ClientServicesModulePage>
      <div>Current services content</div>
    </ClientServicesModulePage>
  </MemoryRouter>
);

describe('ClientServicesModulePage', () => {
  it('highlights Browse Services on the services index route', () => {
    renderModule('/client/services');

    expect(screen.getByRole('heading', { name: 'Services' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse Services' })).toHaveClass('text-primary');
    expect(screen.getByRole('link', { name: 'Browse Services' }).className).toContain('after:bg-primary');
    expect(screen.getByRole('link', { name: 'My Requests' })).not.toHaveClass('text-primary');
  });

  it('highlights My Requests on the service requests route', () => {
    renderModule('/client/services/requests');

    expect(screen.getByRole('heading', { name: 'My Service Requests' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'My Requests' })).toHaveClass('text-primary');
    expect(screen.getByRole('link', { name: 'My Requests' }).className).toContain('after:bg-primary');
    expect(screen.getByRole('link', { name: 'Browse Services' })).not.toHaveClass('text-primary');
  });
});
