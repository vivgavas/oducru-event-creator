# ODUCRU Event Creator

An AI-powered event invitation generator for run club organizers. Generate professional, engaging social media content in seconds.

**🔗 Live Demo:** (https://oducru-event-creator.vercel.app)

---

## Problem

Run club organizers spend 10-15 minutes crafting social media posts for each event. Posts are often inconsistent and fail to communicate key details like pace expectations, leading to runners showing up unprepared or feeling excluded.

## Solution

ODUCRU generates optimized event invitations in two formats:
- **SHORT** (under 280 characters) - Perfect for Instagram, Twitter, and quick shares
- **LONG** (3-5 sentences) - Detailed, inclusive messaging for Facebook and event pages

The AI ensures consistent tone, includes all critical details (time, location, pace), and maintains ODUCRU's welcoming, judgment-free brand voice.

---

## Features

✅ **AI-Powered Content Generation** - Claude Sonnet 4.5 creates engaging, inclusive invitations  
✅ **Dual Format Output** - SHORT and LONG versions optimized for different platforms  
✅ **Mobile-Responsive Design** - Works seamlessly on any device  
✅ **One-Click Copy** - Copy buttons for instant sharing  
✅ **Secure Backend** - API keys protected via environment variables  
✅ **Instant Results** - Generate invitations in 5-10 seconds  

---

## Tech Stack

### Frontend
- **HTML/CSS/JavaScript** - Vanilla implementation, no frameworks
- **Responsive Design** - Mobile-first approach with Plus Jakarta Sans typography
- **Hosted on Vercel** - Global CDN for fast load times

### Backend
- **Vercel Serverless Functions** - Node.js backend at `/api/generate-invitation`
- **Claude API (Anthropic)** - Claude Sonnet 4.5 for content generation
- **Environment Variables** - Secure API key management

### Deployment
- **GitHub** - Version control and source of truth
- **Vercel** - Automated CI/CD (auto-deploy on push to main)

---

## Architecture

```
User Input → Vercel Function → Claude API → Response → User Display
   (Form)      (Middleware)      (AI Gen)    (JSON)      (Results)
```

**Why this architecture?**
- **Serverless** - No servers to manage, auto-scaling, pay-per-use
- **Secure** - API key never exposed to browser
- **Fast** - Edge functions + CDN = low latency globally
- **Simple** - Minimal dependencies, easy to maintain

---

## Product Decisions

### AI Model Selection
Evaluated **Claude Sonnet 4.5 vs ChatGPT-4** across multiple test cases:
- Social runs
- Tempo workouts  
- Beginner-friendly events

**Winner:** Claude Sonnet 4.5 (25/30 vs 23/30)
- Better tone authenticity for running community
- More consistent character count adherence
- Stronger inclusive language alignment with brand values

### UX Philosophy
**Rejected:** Email-based delivery (too many steps)  
**Chosen:** Instant on-page results (immediate gratification)

**Principle:** Reduce friction. Users want results now, not in their inbox later.

---

## Local Development

### Prerequisites
- Node.js 18+ (for Vercel CLI)
- Claude API key from (https://console.anthropic.com)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/vivgavas/oducru-event-creator.git
cd oducru-event-creator
```

2. **Install Vercel CLI**
```bash
npm install -g vercel
```

3. **Set environment variable**
```bash
# Create .env file
echo "CLAUDE_API_KEY=your_api_key_here" > .env
```

4. **Run locally**
```bash
vercel dev
```

5. **Open browser**
```
http://localhost:3000
```

### Project Structure
```
oducru-event-creator/
├── index.html              # Frontend UI
├── api/
│   └── generate-invitation.js  # Serverless function
└── README.md              # This file
```

---

## Deployment

**Automatic deployment via Vercel:**
1. Push to `main` branch on GitHub
2. Vercel automatically builds and deploys
3. Live at (https://oducru-event-creator.vercel.app)

**Manual deployment:**
```bash
vercel --prod
```

---

## Roadmap

### Current (MVP)
- ✅ AI invitation generation
- ✅ SHORT + LONG format output
- ✅ Mobile-responsive UI
- ✅ Copy to clipboard

### Planned (V2)
- [ ] RSVP system with form generation
- [ ] Pace group auto-assignment
- [ ] Email confirmations with calendar invites (.ics)
- [ ] Organizer dashboard with RSVP analytics
- [ ] T-24h reminder emails
- [ ] Multi-event management

### Future (V3)
- [ ] Attendance prediction using historical data
- [ ] Personalized runner recommendations
- [ ] Route summaries from map data
- [ ] Event recap generation

---

## Success Metrics

**Target KPIs:**
- **No-edit rate:** ≥70% of organizers use AI content without modifications
- **Time savings:** 10 min → 30 sec (95% reduction)
- **User satisfaction:** ≥4.0/5.0 rating
- **Adoption:** ≥60% of organizers reuse for 2+ events

---

## Learning Outcomes

This project demonstrates:
- **AI Product Management** - Model evaluation, prompt engineering, cost optimization
- **Full-Stack Development** - Frontend + serverless backend integration
- **API Integration** - Working with modern LLM APIs (Claude)
- **Cloud Architecture** - Serverless functions, environment variables, CDN hosting
- **Product Thinking** - User research, problem validation, UX design decisions

---

## Contributing

This is a personal portfolio project, but feedback is welcome!

**Found a bug?** Open an issue  
**Have a suggestion?** Start a discussion

---

## License

MIT License - feel free to use this code for learning purposes.

---

## Contact

**Built by:** Vivin Gavas Manoharan
**LinkedIn:** (https://www.linkedin.com/in/vivinmanoharan/)
**Email:** oducrew.run@gmail.com

---

## Acknowledgments

- **Anthropic** - Claude API for AI generation
- **Vercel** - Serverless hosting platform
- **ODUCRU Community** - Inspiration and problem validation

---

**⭐ If you find this project helpful, please star the repo!**
