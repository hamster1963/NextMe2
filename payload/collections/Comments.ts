import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone.ts'
import { authenticated } from '../access/authenticated.ts'

export const Comments: CollectionConfig = {
  slug: 'comments',
  access: {
    admin: authenticated,
    create: anyone,
    delete: authenticated,
    read: ({ req: { user } }) => {
      if (user) {
        return true
      }

      return {
        status: {
          equals: 'published',
        },
      }
    },
    update: authenticated,
  },
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'post', 'status', 'createdAt'],
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc, req }) => {
        if (!data || typeof data !== 'object') {
          return data
        }

        const nextReply =
          typeof data.reply?.content === 'string'
            ? data.reply.content.trim()
            : ''
        const prevReply =
          typeof originalDoc?.reply?.content === 'string'
            ? originalDoc.reply.content.trim()
            : ''

        if (!nextReply) {
          data.reply = undefined
          return data
        }

        if (nextReply !== prevReply) {
          data.reply = {
            ...(data.reply || {}),
            content: nextReply,
            repliedAt: new Date().toISOString(),
            repliedBy: req.user?.id || data.reply?.repliedBy,
          }
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: true,
      index: true,
    },
    {
      name: 'authorName',
      type: 'text',
      required: true,
      maxLength: 80,
    },
    {
      name: 'authorEmail',
      type: 'email',
      admin: {
        description: 'Optional, used only for moderation reference.',
      },
      access: {
        read: authenticated,
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      maxLength: 2000,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'published',
      options: [
        {
          label: 'Published',
          value: 'published',
        },
        {
          label: 'Hidden',
          value: 'hidden',
        },
      ],
      access: {
        create: authenticated,
        update: authenticated,
      },
    },
    {
      name: 'reply',
      type: 'group',
      access: {
        create: authenticated,
        update: authenticated,
      },
      fields: [
        {
          name: 'content',
          type: 'textarea',
          maxLength: 2000,
        },
        {
          name: 'repliedAt',
          type: 'date',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'repliedBy',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            readOnly: true,
          },
        },
      ],
    },
  ],
}
