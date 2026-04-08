# Protospec

A system that consumes raw software requirements and outputs a structured development quotation in MYR, calibrated for the Malaysian SME market.

## Features

- **Requirement Analysis**: Agentic workflow to decompose user prompts into functional and non-functional requirements
- **Complexity Matrix**: Logic engine that assigns weightage based on technical difficulty
- **Estimation Engine**: Converts complexity into estimated man-hours with tiered hourly rates in MYR
- **Rapid Quote Generation**: Designed for quick entry and fast time-to-quote

## Tech Stack

- **Frontend**: Nuxt 4 with Vue 3 and Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, and Edge Functions)
- **Deployment**: Ready for Vercel or Netlify deployment

## Architecture

### Bounded Contexts

1. **Requirement Discovery Context** - Handles intake and decomposition of user requirements
2. **Estimation Context** - Contains complexity matrix logic and weight calculations
3. **Quotation Generation Context** - Formats estimates into presentable quotes
4. **Knowledge Management Context** - Stores historical project data and rate cards

### Database Schema

The Supabase schema includes tables for:
- Rate cards and rate entries (flexible pricing structure)
- Requirement categories with complexity weights
- Historical projects for reference and learning
- Individual project requirements with analysis
- Final quotations with PDF generation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/protospec.git
   cd protospec
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Update with your Supabase URL and keys
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

### Supabase Setup

1. Create a new Supabase project
2. Run the schema.sql file in the SQL editor
3. Deploy the Edge Functions:
   ```bash
   supabase functions deploy estimate
   ```
4. Update your `.env` file with your Supabase credentials

## Estimation Logic

Protospec uses a comprehensive hybrid approach combining rule-based estimation with optional AI-powered LLM integration:

- **Rule-based engine**: Provides transparent, explainable estimates using predefined complexity matrices with support for client tiers (startup, growing, enterprise)
- **AI-powered estimation (optional)**: Uses Google's Gemini API to analyze requirements and provide detailed cost breakdowns with confidence scores
- **Graceful fallback**: Automatically falls back to rule-based estimation when AI is unavailable or fails
- **Client-side API key management**: Users can configure their own Gemini API key via the settings page, stored securely in localStorage
- **Project Complexity Multiplier**: Automatically calculates overall project complexity based on requirement interactions and scope
- **Seasonal Rate Adjustments**: Supports quarterly rate adjustments for peak demand periods
- **Historical Project Comparison**: Compares new estimates against similar completed projects for accuracy validation
- **Enhanced Error Handling**: Comprehensive validation and error reporting throughout the estimation pipeline

This approach prioritizes reversibility by keeping core logic in adjustable rules while enhancing accuracy through optional AI insights.

## Roadmap

- [x] Implement PDF generation with professional templates
- [x] Add LLM integration for requirement analysis
- [x] Implement robust Gemini API integration with settings page
- [ ] Create admin dashboard for rate card management
- [ ] Implement client portal for quote tracking
- [x] Add historical project comparison features
- [ ] Enhanced seasonal rate adjustments UI

## License

MIT License