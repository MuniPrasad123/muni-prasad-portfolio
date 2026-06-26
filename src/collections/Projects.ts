import { CollectionConfig } from 'payload'

export const Projects: CollectionConfig = {
  slug: 'projects',
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
      name: 'problemStatement',
      type: 'textarea',
    },
    {
      name: 'role',
      type: 'textarea',
    },
    {
      name: 'outcome',
      type: 'textarea',
    },
    {
      name: 'techStack',
      type: 'array',
      fields: [
        {
          name: 'tech',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'githubLink',
      type: 'text',
    },
    {
      name: 'caseStudyLink',
      type: 'text',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
