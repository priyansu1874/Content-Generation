// Configuration for different app integrations
export interface AppIntegration {
  name: string;
  type: 'external' | 'iframe' | 'api' | 'internal';
  url?: string;
  apiEndpoint?: string;
  description: string;
  icon: string;
  requiresAuth?: boolean;
}

export const appIntegrations: Record<string, AppIntegration[]> = {
  'newsletter': [
    {
      name: 'Mailchimp',
      type: 'external',
      url: 'https://mailchimp.com/create/',
      description: 'Create newsletters in Mailchimp',
      icon: 'mailchimp'
    },
    {
      name: 'ConvertKit',
      type: 'external',
      url: 'https://app.convertkit.com/broadcasts/new',
      description: 'Create newsletters in ConvertKit',
      icon: 'convertkit'
    }
  ],
  'facebook-post': [
    {
      name: 'Facebook Creator Studio',
      type: 'external',
      url: 'https://business.facebook.com/creatorstudio',
      description: 'Create Facebook posts',
      icon: 'facebook'
    }
  ],
  'carousel': [
    {
      name: 'Canva',
      type: 'external',
      url: 'https://www.canva.com/create/instagram-carousel/',
      description: 'Create carousels in Canva',
      icon: 'canva'
    },
    {
      name: 'Figma',
      type: 'external',
      url: 'https://www.figma.com/',
      description: 'Design carousels in Figma',
      icon: 'figma'
    }
  ],
  'twitter-post': [
    {
      name: 'Twitter/X',
      type: 'external',
      url: 'https://twitter.com/compose/tweet',
      description: 'Post directly to X (Twitter)',
      icon: 'twitter'
    },
    {
      name: 'Hootsuite',
      type: 'external',
      url: 'https://hootsuite.com/dashboard',
      description: 'Schedule tweets with Hootsuite',
      icon: 'hootsuite'
    }
  ],
  'thought-leadership': [
    {
      name: 'LinkedIn Article',
      type: 'external',
      url: 'https://www.linkedin.com/pulse/new/',
      description: 'Publish LinkedIn articles',
      icon: 'linkedin'
    },
    {
      name: 'Medium',
      type: 'external',
      url: 'https://medium.com/new-story',
      description: 'Publish thought leadership on Medium',
      icon: 'medium'
    }
  ]
};
