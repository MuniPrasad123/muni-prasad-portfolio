import { CollectionConfig } from 'payload'

export const Experiences: CollectionConfig = {
  slug: 'experiences',
  admin: {
    useAsTitle: 'role',
  },
  fields: [
    {
      name: 'role',
      type: 'text',
      required: true,
    },
    {
      name: 'company',
      type: 'text',
      required: true,
    },
    {
      name: 'dateRange',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'skillsUsed',
      type: 'array',
      fields: [
        {
          name: 'skill',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
