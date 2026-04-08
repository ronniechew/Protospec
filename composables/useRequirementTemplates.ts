export const useRequirementTemplates = () => {
  const templates = [
    {
      id: 'ecommerce',
      name: 'E-commerce Website',
      description: 'Online store with products, cart, and payments',
      content: 'Build a responsive e-commerce website with the following features:\n\n- User authentication and registration\n- Product catalog with categories and search\n- Shopping cart functionality\n- Secure payment gateway integration (Stripe/PayPal)\n- Order management system\n- Admin dashboard for product management\n- Mobile-responsive design\n- Basic SEO optimization'
    },
    {
      id: 'mobile-app',
      name: 'Mobile App',
      description: 'Native mobile application for iOS and Android',
      content: 'Develop a cross-platform mobile application with:\n\n- User onboarding and authentication\n- Core feature functionality\n- Push notifications\n- Offline data synchronization\n- In-app purchases or subscription model\n- Analytics integration\n- App store deployment\n- Performance optimization for mobile devices'
    },
    {
      id: 'saas-dashboard',
      name: 'SaaS Dashboard',
      description: 'Web-based admin dashboard for business operations',
      content: 'Create a comprehensive SaaS dashboard including:\n\n- Multi-tenant user management\n- Role-based access control\n- Data visualization and reporting\n- API integrations with third-party services\n- Real-time notifications\n- Audit logging\n- White-labeling capabilities\n- Scalable backend architecture'
    },
    {
      id: 'api-integration',
      name: 'API Integration',
      description: 'Connect existing systems with external APIs',
      content: 'Implement API integrations between existing systems:\n\n- Authentication and authorization with OAuth 2.0\n- RESTful API development and documentation\n- Webhook handling for real-time updates\n- Error handling and retry mechanisms\n- Rate limiting and throttling\n- Data transformation and mapping\n- Comprehensive testing suite\n- Monitoring and alerting'
    },
    {
      id: 'landing-page',
      name: 'Landing Page',
      description: 'High-conversion marketing landing page',
      content: 'Design and develop a high-conversion landing page featuring:\n\n- Compelling headline and value proposition\n- Engaging hero section with call-to-action\n- Feature highlights with visuals\n- Social proof and testimonials\n- Lead capture form with validation\n- Mobile-optimized responsive design\n- Fast loading performance\n- A/B testing capabilities'
    }
  ]

  const applyTemplate = (templateId: string, currentRequirements: string): string => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return currentRequirements
    
    if (currentRequirements.trim()) {
      return `${currentRequirements}\n\n---\n\n${template.content}`
    }
    return template.content
  }

  return {
    templates,
    applyTemplate
  }
}