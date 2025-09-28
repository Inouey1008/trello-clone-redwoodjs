import type { Meta, StoryObj } from '@storybook/react'

import ProjectPage from './ProjectPage'

const meta: Meta<typeof ProjectPage> = {
  component: ProjectPage,
}

export default meta

type Story = StoryObj<typeof ProjectPage>

export const Primary: Story = {}
