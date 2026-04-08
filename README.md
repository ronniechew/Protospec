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

Protospec uses a hybrid approach combining rule-based estimation with LLM-assisted refinement:

- **Rule-based engine**: Provides transparent, explainable estimates using predefined complexity matrices
- **LLM-assisted refinement**: Analyzes requirements for completeness and suggests adjustments based on historical patterns
- **Human-in-the-loop**: Estimates above certain thresholds require human review

This approach prioritizes reversibility by keeping core logic in adjustable rules while enhancing accuracy through LLM insights.

## Roadmap

- [ ] Implement PDF generation with professional templates
- [ ] Add LLM integration for requirement analysis
- [ ] Create admin dashboard for rate card management
- [ ] Implement client portal for quote tracking
- [ ] Add historical project comparison features

## License

MIT License