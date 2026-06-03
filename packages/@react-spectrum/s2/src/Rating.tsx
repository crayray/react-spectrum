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

import {forwardRef, useState} from 'react';
import {Radio, RadioGroup} from 'react-aria-components';
import {style} from '../style' with {type: 'macro'};

export interface RatingProps {
  /** The current rating (controlled). */
  value?: number,
  /** The default rating (uncontrolled). */
  defaultValue?: number,
  /** Handler called when the rating changes. */
  onChange?: (value: number) => void,
  /**
   * The maximum rating / number of stars.
   * @default 5
   */
  maxRating?: number,
  /** Whether the rating is a read-only display rather than an input. */
  isReadOnly?: boolean,
  /** Whether the rating is disabled. */
  isDisabled?: boolean,
  /** A visible label is not rendered; provide an accessible name. */
  'aria-label'?: string
}

const container = style({
  display: 'flex',
  alignItems: 'center',
  gap: 4
});

const starButton = style<{isDisabled?: boolean}>({
  display: 'inline-flex',
  padding: 2,
  borderRadius: 'sm',
  outlineStyle: 'none',
  cursor: {
    default: 'pointer',
    isDisabled: 'default'
  }
});

const starIcon = style<{isFilled: boolean, isDisabled?: boolean}>({
  width: 24,
  height: 24,
  transition: 'default',
  color: {
    default: 'gray-400',
    isFilled: 'yellow-1000',
    isDisabled: 'gray-300'
  }
});

const STAR_PATH =
  'M12 2.5l2.95 5.98 6.6.96-4.78 4.65 1.13 6.57L12 18.6l-5.9 3.1 1.13-6.57L2.46 9.44l6.6-.96z';

function Star({isFilled, isDisabled}: {isFilled: boolean, isDisabled?: boolean}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={starIcon({isFilled, isDisabled})}>
      <path fill="currentColor" d={STAR_PATH} />
    </svg>
  );
}

/**
 * A Rating lets users view or set a star rating. As an input it uses radiogroup
 * semantics (one option per star); as a read-only display it is exposed as an image
 * with a summary label.
 */
export const Rating = /*#__PURE__*/ forwardRef<HTMLDivElement, RatingProps>(function Rating(
  props,
  ref
) {
  let {
    value,
    defaultValue,
    onChange,
    maxRating = 5,
    isReadOnly,
    isDisabled,
    'aria-label': ariaLabel = 'Rating'
  } = props;

  let isControlled = value !== undefined;
  let [internalValue, setInternalValue] = useState(defaultValue ?? 0);
  let currentValue = isControlled ? value! : internalValue;
  let [hoveredValue, setHoveredValue] = useState<number | null>(null);
  let displayValue = hoveredValue ?? currentValue;

  if (isReadOnly) {
    return (
      <div
        ref={ref}
        role="img"
        aria-label={`Rated ${currentValue} out of ${maxRating} stars`}
        className={container()}>
        {Array.from({length: maxRating}, (_, i) => (
          <Star key={i} isFilled={i < currentValue} isDisabled={isDisabled} />
        ))}
      </div>
    );
  }

  let handleChange = (next: string) => {
    let nextValue = Number(next);
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  };

  return (
    <RadioGroup
      ref={ref}
      aria-label={ariaLabel}
      value={String(currentValue)}
      onChange={handleChange}
      isDisabled={isDisabled}
      orientation="horizontal"
      className={container()}
      onPointerLeave={() => setHoveredValue(null)}>
      {Array.from({length: maxRating}, (_, i) => {
        let starValue = i + 1;
        return (
          <Radio
            key={starValue}
            value={String(starValue)}
            aria-label={`${starValue} ${starValue === 1 ? 'Star' : 'Stars'}`}
            className={starButton({isDisabled})}
            onHoverStart={() => setHoveredValue(starValue)}>
            <Star isFilled={starValue <= displayValue} isDisabled={isDisabled} />
          </Radio>
        );
      })}
    </RadioGroup>
  );
});
