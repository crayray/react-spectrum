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

import {
  Radio,
  RadioGroup,
  RadioGroupProps as AriaRadioGroupProps
} from 'react-aria-components/RadioGroup';
import {ContextValue} from 'react-aria-components/slots';
import {focusRing, style} from '../style' with {type: 'macro'};
import {
  field,
  getAllowedOverrides,
  StyleProps
} from './style-utils' with {type: 'macro'};
import {
  DOMRef,
  DOMRefValue,
  GlobalDOMAttributes,
  HelpTextProps,
  SpectrumLabelableProps
} from '@react-types/shared';
import {FieldLabel, HelpText} from './Field';
import {FormContext, useFormProps} from './Form';
import intlMessages from '../intl/*.json';
import React, {createContext, forwardRef, useContext, useMemo, useState} from 'react';
import {useDOMRef} from './useDOMRef';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';
import {useSpectrumContextProps} from './useSpectrumContextProps';

const STAR_FILLED_PATH =
  'm9.241.3 2.161 5.715 6.106.289a.255.255 0 0 1 .147.454l-4.77 3.823 1.612 5.9a.255.255 0 0 1-.386.28L9.002 13.4l-5.11 3.358a.255.255 0 0 1-.386-.28l1.612-5.9-4.77-3.821A.255.255 0 0 1 .495 6.3l6.107-.285L8.763.3a.255.255 0 0 1 .478 0Z';
const STAR_OUTLINE_PATH =
  'm9.031 2.541 1.777 4.753 5.11.241-3.987 3.2 1.336 4.913-4.266-2.782-4.282 2.808 1.352-4.937-3.987-3.2 5.1-.245ZM9.042.412a.369.369 0 0 0-.349.239L6.486 6.326l-6.1.293a.375.375 0 0 0-.217.667l4.762 3.821L3.318 17a.376.376 0 0 0 .362.475.371.371 0 0 0 .2-.063l5.121-3.351 5.095 3.324a.371.371 0 0 0 .2.062.376.376 0 0 0 .363-.475l-1.595-5.866 4.767-3.826a.375.375 0 0 0-.217-.667l-6.1-.287L9.393.655a.369.369 0 0 0-.351-.243Z';

export interface RatingProps
  extends
    Omit<
      AriaRadioGroupProps,
      'className' | 'style' | 'render' | 'children' | 'orientation' | keyof GlobalDOMAttributes
    >,
    StyleProps,
    SpectrumLabelableProps,
    HelpTextProps {
  /**
   * The maximum rating value.
   *
   * @default 5
   */
  maxValue?: number;
  /**
   * Whether half-star values are allowed.
   */
  allowHalf?: boolean;
  /**
   * The size of the Rating.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL';
}

export const RatingContext =
  createContext<ContextValue<Partial<RatingProps>, DOMRefValue<HTMLDivElement>>>(null);

function getRatingValues(maxValue: number, allowHalf: boolean): string[] {
  if (!allowHalf) {
    return Array.from({length: maxValue}, (_, i) => String(i + 1));
  }
  let values: string[] = [];
  for (let v = 0.5; v <= maxValue; v += 0.5) {
    values.push(String(v));
  }
  return values;
}

function parseRatingValue(value: string | null | undefined): number | null {
  if (value == null || value === '') {
    return null;
  }
  let parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

const starRow = style({
  display: 'flex',
  flexDirection: 'row',
  gap: 4,
  alignItems: 'center'
});

const readOnlyRow = style({
  display: 'flex',
  flexDirection: 'row',
  gap: 4,
  alignItems: 'center',
  gridArea: 'input'
});

interface StarStyleProps {
  size?: RatingProps['size'];
  isFilled?: boolean;
}

const starIcon = style<StarStyleProps>(
  {
    flexShrink: 0,
    width: {
      size: {
        S: 16,
        M: 20,
        L: 24,
        XL: 28
      }
    },
    height: {
      size: {
        S: 16,
        M: 20,
        L: 24,
        XL: 28
      }
    },
    fill: {
      default: 'gray-500',
      isFilled: 'yellow-700'
    },
    forcedColorAdjust: 'none'
  },
  getAllowedOverrides()
);

const radioWrapper = style({
  ...focusRing(),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 2,
  margin: -2,
  borderRadius: 'sm',
  cursor: {
    default: 'pointer',
    isDisabled: 'default'
  },
  disableTapHighlight: true
});

interface RatingStarProps extends StarStyleProps {
  filled: boolean;
}

function RatingStar({filled, size = 'M'}: RatingStarProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 18 18"
      className={starIcon({size, isFilled: filled})}>
      <path d={filled ? STAR_FILLED_PATH : STAR_OUTLINE_PATH} />
    </svg>
  );
}

/**
 * Ratings allow users to select a value on a scale of stars.
 */
export const Rating = /*#__PURE__*/ forwardRef(function Rating(
  props: RatingProps,
  ref: DOMRef<HTMLDivElement>
) {
  [props, ref] = useSpectrumContextProps(props, ref, RatingContext);
  let formContext = useContext(FormContext);
  props = useFormProps(props);
  let domRef = useDOMRef(ref);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');

  let {
    label,
    description,
    errorMessage,
    maxValue = 5,
    allowHalf = false,
    size = 'M',
    isReadOnly,
    labelPosition = 'top',
    labelAlign = 'start',
    necessityIndicator = 'icon',
    UNSAFE_className = '',
    UNSAFE_style,
    value,
    defaultValue,
    ...groupProps
  } = props;

  let ratingValues = useMemo(() => getRatingValues(maxValue, allowHalf), [maxValue, allowHalf]);
  let [hoveredRating, setHoveredRating] = useState<string | undefined>(undefined);

  let normalizedDefault =
    defaultValue != null ? String(defaultValue) : defaultValue;
  let normalizedValue = value != null ? String(value) : value;

  let fieldClassName =
    UNSAFE_className +
    style(
      {
        ...field()
      },
      getAllowedOverrides()
    )(
      {
        size,
        labelPosition,
        isInForm: !!formContext
      },
      props.styles
    );

  if (isReadOnly) {
    let displayValue = parseRatingValue(normalizedValue ?? normalizedDefault) ?? 0;

    return (
      <div ref={domRef} style={UNSAFE_style} className={fieldClassName}>
        {label != null && (
          <FieldLabel
            size={size}
            labelPosition={labelPosition}
            labelAlign={labelAlign}
            necessityIndicator={necessityIndicator}
            contextualHelp={props.contextualHelp}>
            {label}
          </FieldLabel>
        )}
        <div
          role="img"
          aria-label={stringFormatter.format('rating.readOnly', {
            value: displayValue,
            maxValue
          })}
          className={readOnlyRow}>
          {ratingValues.map(ratingValue => {
            let numericValue = Number(ratingValue);
            let filled = displayValue >= numericValue;
            return <RatingStar key={ratingValue} filled={filled} size={size} />;
          })}
        </div>
        <HelpText size={size} description={description} showErrorIcon>
          {errorMessage}
        </HelpText>
      </div>
    );
  }

  return (
    <RadioGroup
      {...groupProps}
      value={normalizedValue}
      defaultValue={normalizedDefault}
      orientation="horizontal"
      isReadOnly={isReadOnly}
      ref={domRef}
      style={UNSAFE_style}
      className={fieldClassName}>
      {({isDisabled, isInvalid, state}) => {
        let committedValue = parseRatingValue(state.selectedValue);
        let previewValue =
          hoveredRating != null
            ? parseRatingValue(hoveredRating)
            : committedValue;

        return (
          <>
            {label != null && (
              <FieldLabel
                isDisabled={isDisabled}
                isRequired={props.isRequired}
                size={size}
                labelPosition={labelPosition}
                labelAlign={labelAlign}
                necessityIndicator={necessityIndicator}
                contextualHelp={props.contextualHelp}>
                {label}
              </FieldLabel>
            )}
            <div
              className={starRow}
              style={{gridArea: 'input'}}
              onPointerOver={e => {
                let target = e.target as HTMLElement;
                let rating = target.closest('[data-rating]')?.getAttribute('data-rating');
                if (rating) {
                  setHoveredRating(rating);
                }
              }}
              onPointerLeave={() => setHoveredRating(undefined)}>
              {ratingValues.map(ratingValue => {
                let numericValue = Number(ratingValue);
                let filled =
                  previewValue != null && numericValue <= previewValue;
                return (
                  <Radio
                    key={ratingValue}
                    value={ratingValue}
                    aria-label={stringFormatter.format('rating.optionLabel', {
                      value: numericValue
                    })}
                    className={renderProps =>
                      radioWrapper({
                        ...renderProps,
                        isDisabled: renderProps.isDisabled || isDisabled
                      })
                    }>
                    <span data-rating={ratingValue}>
                      <RatingStar filled={filled} size={size} />
                    </span>
                  </Radio>
                );
              })}
            </div>
            <HelpText
              size={size}
              isDisabled={isDisabled}
              isInvalid={isInvalid}
              description={description}
              showErrorIcon>
              {errorMessage}
            </HelpText>
          </>
        );
      }}
    </RadioGroup>
  );
});
