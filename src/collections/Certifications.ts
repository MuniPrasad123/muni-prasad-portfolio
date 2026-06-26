import { CollectionConfig } from 'payload'

export const Certifications: CollectionConfig = {
  slug: 'certifications',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Completed', value: 'completed' },
        { label: 'Pending', value: 'pending' },
      ],
      defaultValue: 'completed',
    },
    {
      name: 'badge',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
