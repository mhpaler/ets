# Marketing & Distribution Roadmap - Machine-Optimized Structure

## PROJECT_META
```yaml
parallel_track: true
persona_lead: "Mad Max (The Signal Architect)"
main_objective: "Architect self-replicating distribution systems"
philosophy: "Everything is distribution. Design for remixability. Be slightly cryptic."
last_updated: 2025-10-31
```

## ACTIVE_WORK
```yaml
current_phase: "Deep Quiet Construction"
current_status: "Setting up automation foundations"
completion_percent: 5
exact_task: "Landing page deployed, marketing infrastructure created"
next_priority: "Marketing agent architecture design"
resume_action: "Design reactive agent system for signal harvesting"
timeline_to_t4: "1-2 months until prototype ready for T-4 weeks"
blocking_items:
  - "Need content archive from previous work"
  - "API keys for social platforms"
current_signals: "New landing page as first breadcrumb"
```

## PHASE_TIMELINE
```yaml
phases:
  - name: "Deep Quiet Construction"
    duration: "Now → 1-2 months"
    status: ACTIVE
    objectives:
      - Build marketing automation system
      - Gather and organize content archive
      - Set up social presence foundations
      - Create voice implementations
    deliverables:
      - Marketing agent app
      - Content library organized
      - @etsxyz voice activated
      - Landing page live (DONE)

  - name: "Transition Phase"
    duration: "1-2 months → T-4 weeks"
    status: PENDING
    objectives:
      - Have working Tagcaster prototype
      - Begin content generation
      - Test automation systems
      - Refine voice consistency
    deliverables:
      - Tagcaster identity established
      - 50+ prewritten posts queued
      - Automation running daily
      - Screenshots/assets ready

  - name: "Ambient Signal"
    duration: "T-4 → T-2 weeks"
    status: PENDING
    objectives:
      - Begin subtle public hints
      - Update all social bios
      - Start dropping breadcrumbs
    deliverables:
      - Bio updates across platforms
      - Cryptic posts scheduled
      - Early Farcaster activity

  - name: "Proof-of-Life Logs"
    duration: "T-2 → Launch"
    status: PENDING
    objectives:
      - Public journaling of progress
      - Share technical milestones
      - Build anticipation
    deliverables:
      - Screenshots of working product
      - Console logs as content
      - Technical threads

  - name: "The Reveal"
    duration: "Launch week"
    status: PENDING
    objectives:
      - Announce Tagcaster MVP
      - Link to ETS protocol
      - Activate all channels
    deliverables:
      - Launch posts across platforms
      - Long-form blog on Paragraph
      - Live product on Base/Base Sepolia
```

## AUTOMATION_ARCHITECTURE
```yaml
marketing_agent:
  location: "/apps/marketing-agent"
  status: NOT_STARTED

  signal_harvesters:
    - type: "GitHub Monitor"
      inputs: ["commits", "PRs", "issues", "releases"]
      output: "draft posts"
    - type: "Blockchain Monitor"
      inputs: ["contract events", "temporal logs", "subgraph status"]
      output: "system status posts"
    - type: "Development Monitor"
      inputs: ["roadmap progress", "test results", "deployments"]
      output: "builder updates"

  content_generators:
    - voice: "@etsxyz"
      style: "cryptic oracle"
      frequency: "1-3 posts/week"
      auto_approve: false
    - voice: "@mikepaler"
      style: "honest builder"
      frequency: "1-2 posts/week"
      auto_approve: false
    - voice: "Tagcaster"
      style: "utility focused"
      frequency: "TBD"
      auto_approve: false
    - voice: "Paragraph Blog"
      style: "long-form reflective"
      frequency: "1-2 posts/month"
      auto_approve: false

  publishing_pipeline:
    queue: "file-based initially, DB later"
    approval: "CLI interface with Claude"
    platforms:
      - X: "via Typefully or API"
      - Farcaster: "via Neynar SDK"
      - Paragraph: "via API"
    safety:
      max_posts_per_day: 3
      max_posts_per_week: 10
      duplicate_detection: true
```

## CONTENT_STRATEGY
```yaml
themes:
  quiet_construction:
    - "We've been here all along"
    - "The infrastructure was always running"
    - "Hashtags remembering their value"

  archaeological_hints:
    - Reference 2021 origins
    - Show evolution of thinking
    - "Found in the archives" series

  technical_poetry:
    - "The graph is asleep. For now."
    - "Refactoring is remembering"
    - "A tag is not a post. It's a proof."

  tagcaster_teasers:
    - "Hashtags on Farcaster"
    - "Every cast, a coin"
    - "No gas, just tags"

mad_max_principles:
  - "Attention is the new gravity. Bend it, don't chase it."
  - "Every meme is a transaction in the attention economy."
  - "If your story doesn't mutate, it dies."
  - "Distribution is just physics applied to belief."
```

## IMMEDIATE_ACTIONS
```yaml
week_1_priorities:
  - task: "Create marketing-agent app structure"
    status: PENDING
    dependencies: []
  - task: "Implement GitHub signal harvester"
    status: PENDING
    dependencies: ["marketing-agent structure"]
  - task: "Build @etsxyz voice generator"
    status: PENDING
    dependencies: ["marketing-agent structure"]
  - task: "Set up content queue system"
    status: PENDING
    dependencies: ["marketing-agent structure"]
  - task: "Collect content archive from user"
    status: PENDING
    dependencies: []

week_2_priorities:
  - task: "Add blockchain monitoring"
    status: PENDING
  - task: "Implement approval workflow"
    status: PENDING
  - task: "Connect first publishing platform"
    status: PENDING
  - task: "Generate first batch of content"
    status: PENDING
```

## ASSETS_NEEDED
```yaml
from_user:
  - old_content_archive: "Screenshots, posts, diagrams from 2021-2024"
  - api_keys:
    - openai_or_claude: "For content generation"
    - twitter_api: "Or Typefully access"
    - farcaster_api: "Neynar or direct"
    - paragraph_api: "If available"

from_development:
  - tagcaster_branding: "Logo, colors, voice guide"
  - technical_diagrams: "Architecture visuals"
  - product_screenshots: "As features complete"
```

## SUCCESS_METRICS
```yaml
pre_launch:
  - content_library_size: "> 100 pieces ready"
  - automation_reliability: "> 95% uptime"
  - voice_consistency: "Distinct and recognizable"
  - engagement_growth: "Organic followers increasing"

post_launch:
  - tagcaster_users: "Number of Farcaster users tagging"
  - tag_coins_created: "Via Tagcaster channel"
  - viral_moments: "Posts that self-replicate"
  - community_participation: "User-generated content"
```

## MAD_MAX_NOTES
```yaml
current_thinking: |
  The landing page is the first signal. Not an announcement, just a shift in reality.
  People will discover it, wonder what changed, start asking questions.
  That curiosity becomes the distribution mechanism.

next_move: |
  Don't explain. Let them find the breadcrumbs.
  The automation should feel like the protocol itself is speaking.
  Every post is a node in the network of meaning we're building.

reminder: |
  "They don't chase attention — they bend its laws."
```

---

*This roadmap runs parallel to technical development. Mad Max orchestrates while Chad builds.*