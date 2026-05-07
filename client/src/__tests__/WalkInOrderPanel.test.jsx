/**
 * Tests for the WalkInOrderPanel component — verifying that
 * walk-in orders can be placed without a phone number or customer ID.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WalkInOrderPanel from '../components/WalkInOrderPanel';
import * as api from '../api';

// Mock the API module
jest.mock('../api');

const mockMenuItems = [
  {
    _id: 'item1',
    name: 'Mango Smoothie',
    category: 'Smoothies',
    price: 120,
    sizes: [{ name: 'Regular', price: 120 }],
    isAvailable: true,
  },
  {
    _id: 'item2',
    name: 'Strawberry Smoothie',
    category: 'Smoothies',
    price: 130,
    sizes: [{ name: 'Regular', price: 130 }],
    isAvailable: true,
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  api.fetchMenu.mockResolvedValue({ data: { items: mockMenuItems } });
});

describe('WalkInOrderPanel', () => {
  it('renders without crashing', async () => {
    render(<WalkInOrderPanel />);
    expect(screen.getByText('Walk-in Order')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Mango Smoothie')).toBeInTheDocument();
    });
  });

  it('allows placing an order without a phone number (walk-in fix)', async () => {
    api.placeOrder.mockResolvedValue({
      data: {
        success: true,
        order: {
          _id: 'order1',
          orderNumber: 'ORD-20260313-0001',
          customerName: 'Walk-in Customer',
          isWalkin: true,
          total: 120,
        },
      },
    });

    render(<WalkInOrderPanel />);

    // Wait for menu to load
    await waitFor(() => {
      expect(screen.getByText('Mango Smoothie')).toBeInTheDocument();
    });

    // Add item to cart
    const addBtn = screen
      .getAllByText('+')
      .find((btn) => btn.closest('[data-testid]') || btn);
    fireEvent.click(addBtn);

    // Place order — no phone entered
    const placeBtn = screen.getByText('Place Walk-in Order');
    fireEvent.click(placeBtn);

    await waitFor(() => {
      expect(api.placeOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          isWalkin: true,
          // customerPhone may be undefined — server generates it
        })
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(/ORD-20260313-0001 placed successfully/i)
      ).toBeInTheDocument();
    });
  });

  it('sends isWalkin: true and no customerId', async () => {
    api.placeOrder.mockResolvedValue({
      data: {
        success: true,
        order: {
          _id: 'order2',
          orderNumber: 'ORD-20260313-0002',
          customerName: 'Walk-in Customer',
          isWalkin: true,
          total: 120,
        },
      },
    });

    render(<WalkInOrderPanel />);
    await waitFor(() => screen.getByText('Mango Smoothie'));

    // Add item
    fireEvent.click(screen.getAllByText('+')[0]);

    fireEvent.click(screen.getByText('Place Walk-in Order'));

    await waitFor(() => {
      const callArg = api.placeOrder.mock.calls[0][0];
      expect(callArg.isWalkin).toBe(true);
      expect(callArg.customerId).toBeUndefined();
    });
  });

  it('shows an error if no items are selected', async () => {
    render(<WalkInOrderPanel />);
    await waitFor(() => screen.getByText('Mango Smoothie'));

    fireEvent.click(screen.getByText('Place Walk-in Order'));

    // Button should be disabled when cart is empty — no API call
    expect(api.placeOrder).not.toHaveBeenCalled();
  });

  it('shows a server error message on failure', async () => {
    api.placeOrder.mockRejectedValue({
      response: { data: { message: 'Failed to create order' } },
    });

    render(<WalkInOrderPanel />);
    await waitFor(() => screen.getByText('Mango Smoothie'));

    fireEvent.click(screen.getAllByText('+')[0]);
    fireEvent.click(screen.getByText('Place Walk-in Order'));

    await waitFor(() => {
      expect(screen.getByText('Failed to create order')).toBeInTheDocument();
    });
  });
});
