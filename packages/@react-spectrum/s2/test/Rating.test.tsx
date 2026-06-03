/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {pointerMap, render} from '@react-spectrum/test-utils-internal';
import {Rating} from '../src/Rating';
import React from 'react';
import userEvent from '@testing-library/user-event';

describe('Rating', () => {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('renders a radiogroup with one option per star', () => {
    let {getByRole, getAllByRole} = render(<Rating aria-label="Rating" maxRating={5} />);
    expect(getByRole('radiogroup')).toBeInTheDocument();
    expect(getAllByRole('radio')).toHaveLength(5);
  });

  it('calls onChange with the selected rating', async () => {
    let onChange = jest.fn();
    let {getByLabelText} = render(<Rating aria-label="Rating" onChange={onChange} />);
    await user.click(getByLabelText('3 Stars'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('labels a single star without pluralizing', () => {
    let {getByLabelText} = render(<Rating aria-label="Rating" />);
    expect(getByLabelText('1 Star')).toBeInTheDocument();
  });

  it('renders read-only mode as an image with a summary label and no radiogroup', () => {
    let {getByRole, queryByRole} = render(<Rating value={4} isReadOnly aria-label="Average" />);
    expect(getByRole('img')).toHaveAttribute('aria-label', 'Rated 4 out of 5 stars');
    expect(queryByRole('radiogroup')).not.toBeInTheDocument();
  });
});
