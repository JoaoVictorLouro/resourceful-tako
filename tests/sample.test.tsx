import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'

const Page = () => {
  return <div>Works</div>
};

test('Page', () => {
  render(<Page />);
  expect(screen.getByText('Works')).toBeDefined();
})
