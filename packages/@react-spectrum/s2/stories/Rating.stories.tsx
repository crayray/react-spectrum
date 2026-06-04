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

import type {Meta, StoryObj} from '@storybook/react';
import {Rating} from '../src/Rating';
import React, {useState} from 'react';
import {StaticColorDecorator} from './utils';

const meta: Meta<typeof Rating> = {
  component: Rating,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    onChange: {table: {category: 'Events'}},
    label: {control: {type: 'text'}},
    description: {control: {type: 'text'}},
    errorMessage: {control: {type: 'text'}},
    contextualHelp: {table: {disable: true}}
  },
  decorators: [StaticColorDecorator],
  tags: ['autodocs'],
  title: 'Rating'
};

export default meta;
type Story = StoryObj<typeof Rating>;

export const Example: Story = {
  render: args => <Rating {...args} />,
  args: {
    label: 'Rating',
    defaultValue: '3'
  }
};

export const DefaultValue: Story = {
  render: args => <Rating {...args} />,
  args: {
    label: 'Rating',
    defaultValue: '4'
  },
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const Controlled: Story = {
  render: function Render(args) {
    let [value, setValue] = useState('2');
    return (
      <Rating
        {...args}
        value={value}
        onChange={setValue}
        label={`Rating: ${value} stars`}
      />
    );
  },
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const Disabled: Story = {
  render: args => <Rating {...args} />,
  args: {
    label: 'Rating',
    defaultValue: '3',
    isDisabled: true
  },
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const ReadOnly: Story = {
  render: args => <Rating {...args} />,
  args: {
    label: 'Average rating',
    value: '4',
    isReadOnly: true
  },
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const HalfStars: Story = {
  render: args => <Rating {...args} />,
  args: {
    label: 'Rating',
    allowHalf: true,
    defaultValue: '3.5'
  },
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const CustomMaxValue: Story = {
  render: args => <Rating {...args} />,
  args: {
    label: 'Rating',
    maxValue: 10,
    defaultValue: '7'
  },
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const ErrorAndDescription: Story = {
  render: args => <Rating {...args} />,
  args: {
    label: 'Rating',
    description: 'Select a rating from 1 to 5 stars.',
    errorMessage: 'A rating is required.',
    isInvalid: true,
    isRequired: true
  },
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const Sizes: Story = {
  render: args => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <Rating {...args} size="S" label="Small" defaultValue="3" />
      <Rating {...args} size="M" label="Medium" defaultValue="3" />
      <Rating {...args} size="L" label="Large" defaultValue="3" />
      <Rating {...args} size="XL" label="Extra large" defaultValue="3" />
    </div>
  ),
  parameters: {
    docs: {
      disable: true
    }
  }
};
