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

import {Direction, DOMRefValue} from '@react-types/shared';
import {act, pointerMap, render, User} from '@react-spectrum/test-utils-internal';
import {Provider} from '../src/Provider';
import {Rating} from '../src/Rating';
import React, {createRef, useState} from 'react';
import userEvent from '@testing-library/user-event';

function ControlledRating(
  props: Omit<React.ComponentProps<typeof Rating>, 'value' | 'onChange'> & {
    onChange?: (value: string) => void;
  }
) {
  let [value, setValue] = useState<string | null>('2');
  return (
    <Rating
      {...props}
      value={value}
      onChange={v => {
        setValue(v);
        props.onChange?.(v);
      }}
    />
  );
}

describe('Rating', () => {
  let testUtilUser = new User();
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('supports uncontrolled selection', async () => {
    let onChange = jest.fn();
    let {getByRole} = render(
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

  it('supports controlled selection and onChange', async () => {
    let onChange = jest.fn();
    let {getByRole} = render(
      <Provider>
        <ControlledRating aria-label="Rate this item" onChange={onChange} />
      </Provider>
    );
    let radioGroupTester = testUtilUser.createTester('RadioGroup', {
      root: getByRole('radiogroup')
    });
    let radios = radioGroupTester.getRadios();
    expect(radios[1]).toBeChecked();

    await radioGroupTester.triggerRadio({radio: radios[4], interactionType: 'keyboard'});
    expect(radios[4]).toBeChecked();
    expect(onChange).toHaveBeenCalledWith('5');
  });

  it('does not change selection when disabled', async () => {
    let onChange = jest.fn();
    let {getAllByRole} = render(
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

  it('exposes invalid state and error message', () => {
    let {getByRole, getByText} = render(
      <Provider>
        <Rating
          label="Rating"
          isInvalid
          errorMessage="A rating is required."
          aria-label="Rate this item"
        />
      </Provider>
    );
    let group = getByRole('radiogroup');
    expect(group).toHaveAttribute('data-invalid', 'true');
    expect(getByText('A rating is required.')).toBeInTheDocument();
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
    expect(radios[4]).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();

    await user.unhover(fifthStar);
    expect(radios[0]).toBeChecked();
    expect(radios[4]).not.toBeChecked();

    await user.click(radios[4]);
    expect(radios[4]).toBeChecked();
    expect(onChange).toHaveBeenCalledWith('5');
  });

  it('has an accessible radiogroup name and horizontal orientation', () => {
    let {getByRole, getAllByRole} = render(
      <Provider>
        <Rating aria-label="Rate this item" defaultValue="2" />
      </Provider>
    );
    let group = getByRole('radiogroup', {name: 'Rate this item'});
    expect(group).toHaveAttribute('aria-orientation', 'horizontal');

    let radios = getAllByRole('radio');
    expect(radios[0]).toHaveAccessibleName('1 star');
    expect(radios[4]).toHaveAccessibleName('5 stars');
  });

  it('navigates between first and last stars with arrow keys on the radiogroup', async () => {
    let {getByRole} = render(
      <Provider>
        <Rating aria-label="Rate this item" defaultValue="3" />
      </Provider>
    );
    let radioGroupTester = testUtilUser.createTester('RadioGroup', {
      root: getByRole('radiogroup')
    });
    let radios = radioGroupTester.getRadios();
    expect(radios[2]).toBeChecked();

    act(() => radios[2].focus());
    await user.keyboard('[ArrowRight]');
    await user.keyboard('[ArrowRight]');
    expect(radioGroupTester.getSelectedRadio()).toBe(radios[4]);

    await user.keyboard('[ArrowLeft]');
    await user.keyboard('[ArrowLeft]');
    await user.keyboard('[ArrowLeft]');
    await user.keyboard('[ArrowLeft]');
    expect(radioGroupTester.getSelectedRadio()).toBe(radios[0]);
  });

  it('forwards ref to the radiogroup element', () => {
    let ref = createRef<DOMRefValue<HTMLDivElement>>();
    let {getByRole} = render(
      <Provider>
        <Rating ref={ref} aria-label="Rate this item" />
      </Provider>
    );
    let group = getByRole('radiogroup');
    expect(ref.current?.UNSAFE_getDOMNode()).toBe(group);
  });

  it('supports a single star when maxValue is 1', async () => {
    let onChange = jest.fn();
    let {getAllByRole} = render(
      <Provider>
        <Rating aria-label="Rate this item" maxValue={1} onChange={onChange} />
      </Provider>
    );
    let radios = getAllByRole('radio');
    expect(radios).toHaveLength(1);
    await user.click(radios[0]);
    expect(radios[0]).toBeChecked();
    expect(onChange).toHaveBeenCalledWith('1');
  });

  it.each`
    Name              | props
    ${'ltr'}          | ${{locale: 'de-DE'}}
    ${'rtl'}          | ${{locale: 'ar-AE'}}
  `(
    '$Name should select stars via horizontal keyboard navigation',
    async function ({props}) {
      let {getByRole} = render(
        <Provider locale={props.locale}>
          <Rating aria-label="Rate this item" defaultValue="1" />
        </Provider>
      );
      let direction = props.locale === 'ar-AE' ? 'rtl' : ('ltr' as Direction);
      let radioGroupTester = testUtilUser.createTester('RadioGroup', {
        root: getByRole('radiogroup'),
        direction
      });
      let radios = radioGroupTester.getRadios();
      expect(radioGroupTester.getRadioGroup()).toHaveAttribute(
        'aria-orientation',
        'horizontal'
      );

      await radioGroupTester.triggerRadio({radio: radios[3], interactionType: 'keyboard'});
      expect(radios[3]).toBeChecked();

      await radioGroupTester.triggerRadio({radio: radios[0], interactionType: 'keyboard'});
      expect(radios[0]).toBeChecked();
    }
  );
});
