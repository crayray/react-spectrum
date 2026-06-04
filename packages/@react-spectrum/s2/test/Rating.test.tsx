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

jest.mock('react-aria/src/live-announcer/LiveAnnouncer');

import {pointerMap, render, User} from '@react-spectrum/test-utils-internal';
import {Provider} from '../src/Provider';
import {Rating} from '../src/Rating';
import React, {useState} from 'react';
import userEvent from '@testing-library/user-event';

function ControlledRating(props: Omit<React.ComponentProps<typeof Rating>, 'value' | 'onChange'>) {
  let [value, setValue] = useState<string | null>('2');
  return <Rating {...props} value={value} onChange={setValue} />;
}

describe('Rating', () => {
  let testUtilUser = new User();
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('supports uncontrolled selection', async () => {
    let onChange = jest.fn();
    let {getByRole, getAllByRole} = render(
      <Provider>
        <Rating aria-label="Rate this item" defaultValue="1" onChange={onChange} />
      </Provider>
    );
    let radioGroupTester = testUtilUser.createTester('RadioGroup', {
      root: getByRole('radiogroup')
    });
    let radios = radioGroupTester.getRadios();
    expect(radios[0]).toBeChecked();

    await radioGroupTester.triggerRadio({radio: radios[3], interactionType: 'mouse'});
    expect(radios[3]).toBeChecked();
    expect(onChange).toHaveBeenCalledWith('4');
  });

  it('supports controlled selection', async () => {
    let {getByRole} = render(
      <Provider>
        <ControlledRating aria-label="Rate this item" />
      </Provider>
    );
    let radioGroupTester = testUtilUser.createTester('RadioGroup', {
      root: getByRole('radiogroup')
    });
    let radios = radioGroupTester.getRadios();
    expect(radios[1]).toBeChecked();

    await radioGroupTester.triggerRadio({radio: radios[4], interactionType: 'keyboard'});
    expect(radios[4]).toBeChecked();
  });

  it('does not change selection when disabled', async () => {
    let onChange = jest.fn();
    let {getByRole, getAllByRole} = render(
      <Provider>
        <Rating
          aria-label="Rate this item"
          defaultValue="2"
          isDisabled
          onChange={onChange}
        />
      </Provider>
    );
    let radios = getAllByRole('radio');
    expect(radios[1]).toBeChecked();
    await user.click(radios[4]);
    expect(radios[1]).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders read-only display with img role', () => {
    let {getByRole, queryByRole} = render(
      <Provider>
        <Rating label="Average" value="3" isReadOnly />
      </Provider>
    );
    let img = getByRole('img');
    expect(img).toHaveAttribute('aria-label', 'Rated 3 out of 5 stars');
    expect(queryByRole('radiogroup')).toBeNull();
  });

  it('supports half-star values when allowHalf is set', async () => {
    let onChange = jest.fn();
    let {getByRole, getAllByRole} = render(
      <Provider>
        <Rating
          aria-label="Rate this item"
          allowHalf
          defaultValue="2.5"
          onChange={onChange}
        />
      </Provider>
    );
    let radios = getAllByRole('radio');
    expect(radios).toHaveLength(10);
    expect(radios[4]).toBeChecked();

    let radioGroupTester = testUtilUser.createTester('RadioGroup', {
      root: getByRole('radiogroup')
    });
    await radioGroupTester.triggerRadio({radio: radios[7], interactionType: 'mouse'});
    expect(radios[7]).toBeChecked();
    expect(onChange).toHaveBeenCalledWith('4');
  });

  it('previews hover without committing the value', async () => {
    let onChange = jest.fn();
    let {getAllByRole, container} = render(
      <Provider>
        <Rating aria-label="Rate this item" defaultValue="1" onChange={onChange} />
      </Provider>
    );
    let radios = getAllByRole('radio');
    let fifthStar = container.querySelector('[data-rating="5"]') as HTMLElement;
    await user.hover(fifthStar);
    expect(radios[0]).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();

    await user.unhover(fifthStar);
    await user.click(radios[4]);
    expect(radios[4]).toBeChecked();
    expect(onChange).toHaveBeenCalledWith('5');
  });
});
