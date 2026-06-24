import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Page from './page';

// Mock Supabase client so no real network calls are made
jest.mock('../utils/supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {
        id: 1,
        hotelName: 'Grand Spice Restaurant',
        address: '124, Culinary Avenue, Metro City, IN',
        phone: '+91 9876543210',
        gstNumber: '33ABCDE1234F1Z5',
        gstPercentage: 5,
        footerMessage: 'Thank you for dining with us! Visit again.',
        printFormat: 'thermal',
        billCounter: 1003,
      }, error: null }),
      then: jest.fn(cb => Promise.resolve(cb({ data: [], error: null }))),
    })),
  },
}));

// Mock Cloudinary upload
jest.mock('../utils/cloudinary', () => ({
  uploadImage: jest.fn().mockResolvedValue('https://res.cloudinary.com/test/image.jpg'),
}));

describe('SmartPOS – Login', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the login screen when no user is stored', async () => {
    render(<Page />);
    await waitFor(() => {
      expect(screen.getByText('SmartPOS Pro')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
  });

  it('shows error toast on invalid credentials', async () => {
    const user = userEvent.setup();
    render(<Page />);

    await waitFor(() => expect(screen.getByPlaceholderText('Username')).toBeInTheDocument());

    await user.type(screen.getByPlaceholderText('Username'), 'wronguser');
    await user.type(screen.getByPlaceholderText('Password'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
    });
  });

  it('logs in successfully with correct credentials and shows POS view', async () => {
    const user = userEvent.setup();
    render(<Page />);

    await waitFor(() => expect(screen.getByPlaceholderText('Username')).toBeInTheDocument());

    await user.type(screen.getByPlaceholderText('Username'), 'admin');
    await user.type(screen.getByPlaceholderText('Password'), 'admin123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Point of Sale')).toBeInTheDocument();
    });
  });
});

describe('SmartPOS – POS View (authenticated)', () => {
  beforeEach(() => {
    // Pre-seed login so we skip the login screen
    localStorage.setItem('shbs_user', JSON.stringify({ username: 'admin', role: 'Admin' }));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders the POS terminal view', async () => {
    render(<Page />);
    await waitFor(() => {
      expect(screen.getByText('Point of Sale')).toBeInTheDocument();
    });
  });

  it('shows empty cart message initially', async () => {
    render(<Page />);
    await waitFor(() => {
      expect(screen.getByText('Cart is empty')).toBeInTheDocument();
    });
  });

  it('shows empty menu state with seed button', async () => {
    render(<Page />);
    await waitFor(() => {
      expect(screen.getByText('No dishes found')).toBeInTheDocument();
    });
    expect(screen.getByText('Load Demo Dishes')).toBeInTheDocument();
  });

  it('can navigate to Dashboard tab', async () => {
    const user = userEvent.setup();
    render(<Page />);

    await waitFor(() => expect(screen.getByText('Point of Sale')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /dashboard/i }));

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });
  });

  it('can navigate to Orders tab', async () => {
    const user = userEvent.setup();
    render(<Page />);

    await waitFor(() => expect(screen.getByText('Point of Sale')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /transactions/i }));

    await waitFor(() => {
      expect(screen.getByText('Order Logs')).toBeInTheDocument();
    });
  });

  it('can navigate to Menu Master tab', async () => {
    const user = userEvent.setup();
    render(<Page />);

    await waitFor(() => expect(screen.getByText('Point of Sale')).toBeInTheDocument());

    await user.click(screen.getAllByRole('button', { name: /menu master/i })[0]);

    await waitFor(() => {
      // 'Add New Dish' button is unique to the Menu Master tab
      expect(screen.getByText('Add New Dish')).toBeInTheDocument();
    });
  });

  it('can navigate to Settings tab', async () => {
    const user = userEvent.setup();
    render(<Page />);

    await waitFor(() => expect(screen.getByText('Point of Sale')).toBeInTheDocument());

    await user.click(screen.getAllByRole('button', { name: /settings/i })[0]);

    await waitFor(() => {
      expect(screen.getByText('System Configurations')).toBeInTheDocument();
    });
  });

  it('sign out button returns to login view', async () => {
    const user = userEvent.setup();
    render(<Page />);

    await waitFor(() => expect(screen.getByText('Point of Sale')).toBeInTheDocument());

    const signOutBtn = screen.getAllByRole('button').find(b => b.textContent?.includes('Sign Out'));
    expect(signOutBtn).toBeTruthy();
    await user.click(signOutBtn!);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    });
  });
});
