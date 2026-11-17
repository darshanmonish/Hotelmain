import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Page from '../page';

jest.mock('../../utils/supabaseClient', () => ({
  supabase: {
    from: jest.fn((table: string) => {
      if (table === 'menu') {
        return {
          select: jest.fn().mockResolvedValue({
            data: [
              {
                id: 'm-1',
                name: 'Butter Chicken',
                price: 280,
                category: 'Main Course',
                isAvailable: true,
                isVeg: false,
                imageUrl: '',
                description: 'Creamy gravy',
              },
            ],
            error: null,
          }),
        };
      }
      if (table === 'orders') {
        return {
          select: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 1,
            hotelName: 'Hotel Vetri Vel',
            address: 'Coimbatore',
            phone: '+91 9842999931',
            gstNumber: '',
            gstPercentage: 0,
            footerMessage: 'Thank you',
            printFormat: 'thermal',
            billCounter: 1,
          },
          error: null,
        }),
      };
    }),
  },
}));

jest.mock('../../utils/cloudinary', () => ({
  uploadImage: jest.fn().mockResolvedValue(null),
}));

describe('Menu Master – Add Categories section', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('shbs_user', JSON.stringify({ username: 'admin', role: 'Admin' }));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('adds, persists, exposes in dish modal, prevents duplicates, and removes empty categories', async () => {
    const user = userEvent.setup({ delay: null });
    const { unmount } = render(<Page />);

    await waitFor(() => expect(screen.getAllByRole('button', { name: /menu master/i }).length).toBeGreaterThan(0));
    await user.click(screen.getAllByRole('button', { name: /menu master/i })[0]);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Categories' })).toBeInTheDocument());

    const input = screen.getByLabelText(/add category/i);
    const submitBtn = screen.getByRole('button', { name: /add category/i });

    // Empty submit shows validation error
    await user.click(submitBtn);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Please enter a category name');

    // Add a new category
    await user.type(input, '  South   Indian  ');
    await user.click(submitBtn);

    const southIndianBtn = screen.getByRole('button', { name: /^South Indian 0$/ });
    expect(southIndianBtn).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('shbs_menu_categories') || '{}').added).toContain('South Indian');

    // Duplicate check (case-insensitive)
    await user.type(input, 'south indian');
    await user.click(submitBtn);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Category already exists');

    // Clicking the category pill filters to it and pre-selects it in Add New Dish modal
    await user.click(southIndianBtn);
    expect(screen.getByRole('button', { name: /Add Dish to South Indian/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /add new dish/i }));
    const dishCategorySelect = screen.getByLabelText(/category/i, { selector: 'select#dish-category' });
    expect(dishCategorySelect).toHaveValue('South Indian');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    // Category with active dish cannot be removed; empty category can be removed
    expect(screen.queryByRole('button', { name: 'Remove Main Course category' })).not.toBeInTheDocument();
    const removeSouthIndian = screen.getByRole('button', { name: 'Remove South Indian category' });
    await user.click(removeSouthIndian);

    expect(screen.queryByRole('button', { name: 'Remove South Indian category' })).not.toBeInTheDocument();

    // Re-add and verify persistence across remount
    await user.clear(input);
    await user.type(input, 'Tiffin');
    await user.click(submitBtn);
    expect(screen.getByRole('button', { name: /^Tiffin 0$/ })).toBeInTheDocument();
    unmount();

    render(<Page />);
    await waitFor(() => expect(screen.getAllByRole('button', { name: /menu master/i }).length).toBeGreaterThan(0));
    await user.click(screen.getAllByRole('button', { name: /menu master/i })[0]);
    await waitFor(() => expect(screen.getByRole('button', { name: /^Tiffin 0$/ })).toBeInTheDocument());
  }, 15000);
});
