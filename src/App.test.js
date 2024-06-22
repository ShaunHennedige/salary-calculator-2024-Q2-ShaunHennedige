import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

describe('App', () => {
  test('renders the salary calculator title', () => {
    render(<App />);
    expect(screen.getByText('Calculate Your Salary')).toBeInTheDocument();
  });

  test('updates basic salary when input changes', () => {
    render(<App />);
    const basicSalaryInput = screen.getByLabelText('Basic Salary');
    fireEvent.change(basicSalaryInput, { target: { value: '50000' } });
    expect(basicSalaryInput.value).toBe('50000');
  });

  test('adds a new earnings item', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('+ Add New Allowance'));
    
    await waitFor(() => {
      expect(screen.getByText('Add New Earnings')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('E.g. Travel'), { target: { value: 'Bonus' } });
    fireEvent.change(screen.getByPlaceholderText('E.g. 10000'), { target: { value: '5000' } });
    fireEvent.click(screen.getByText('Add'));

    expect(screen.getByText('Bonus: 5000.00')).toBeInTheDocument();
  });

  test('adds a new deduction item', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('+ Add New Deduction'));
    
    await waitFor(() => {
      expect(screen.getByText('Add New Deductions')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('E.g. Travel'), { target: { value: 'Tax' } });
    fireEvent.change(screen.getByPlaceholderText('E.g. 10000'), { target: { value: '2000' } });
    fireEvent.click(screen.getByText('Add'));

    expect(screen.getByText('Tax: 2000.00')).toBeInTheDocument();
  });

  test('deletes an earnings item', async () => {
    render(<App />);
    fireEvent.click(screen.getByText('+ Add New Allowance'));
    
    await waitFor(() => {
      expect(screen.getByText('Add New Earnings')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('E.g. Travel'), { target: { value: 'Bonus' } });
    fireEvent.change(screen.getByPlaceholderText('E.g. 10000'), { target: { value: '5000' } });
    fireEvent.click(screen.getByText('Add'));

    const deleteButton = screen.getAllByRole('button', { name: '' })[1]; // Assuming it's the second button
    fireEvent.click(deleteButton);

    expect(screen.queryByText('Bonus: 5000.00')).not.toBeInTheDocument();
  });

  test('resets the calculator', () => {
    render(<App />);
    const basicSalaryInput = screen.getByLabelText('Basic Salary');
    fireEvent.change(basicSalaryInput, { target: { value: '50000' } });

    fireEvent.click(screen.getByText('Reset'));

    expect(basicSalaryInput.value).toBe('');
  });

  test('calculates salary correctly', async () => {
    render(<App />);
    const basicSalaryInput = screen.getByLabelText('Basic Salary');
    fireEvent.change(basicSalaryInput, { target: { value: '100000' } });

    await waitFor(() => {
      expect(screen.getByText('100000.00')).toBeInTheDocument(); // Basic Salary
      expect(screen.getByText('92000.00')).toBeInTheDocument(); // Net Salary (approx)
      expect(screen.getByText('115000.00')).toBeInTheDocument(); // CTC (approx)
    });
  });
});