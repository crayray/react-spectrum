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

import type { Meta, StoryObj } from "@storybook/react";
import { Rating } from "../src/Rating";
import { useState } from "react";

const meta: Meta<typeof Rating> = {
  component: Rating,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Rating",
};

export default meta;
type Story = StoryObj<typeof Rating>;

export const Example: Story = {
  args: {
    "aria-label": "Rating",
    defaultValue: 5,
  },
};

export const ReadOnly: Story = {
  args: {
    "aria-label": "Average rating",
    value: 4,
    isReadOnly: true,
  },
};

export const Disabled: Story = {
  args: {
    "aria-label": "Rating",
    defaultValue: 2,
    isDisabled: true,
  },
};

export const Controlled: Story = {
  render: (args) => {
    let [value, setValue] = useState(2);
    return (
      <Rating {...args} value={value} onChange={setValue} aria-label="Rating" />
    );
  },
};
