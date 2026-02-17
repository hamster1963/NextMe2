import type { Block } from 'payload'

export const CodeBlock: Block = {
  slug: 'codeBlock',
  interfaceName: 'CodeBlock',
  labels: {
    singular: 'Code block',
    plural: 'Code blocks',
  },
  fields: [
    {
      name: 'language',
      type: 'select',
      defaultValue: 'typescript',
      options: [
        {
          label: 'TypeScript',
          value: 'typescript',
        },
        {
          label: 'JavaScript',
          value: 'javascript',
        },
        {
          label: 'JSON',
          value: 'json',
        },
        {
          label: 'Bash',
          value: 'bash',
        },
        {
          label: 'Markdown',
          value: 'markdown',
        },
        {
          label: 'Plain text',
          value: 'plaintext',
        },
      ],
    },
    {
      name: 'code',
      type: 'code',
      label: false,
      required: true,
    },
  ],
}
