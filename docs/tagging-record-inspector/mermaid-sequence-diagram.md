sequenceDiagram
    participant Chain as ETS Core (On-chain)
    participant Listener as Event Listener
    participant Enrichment as Target Metadata Store
    participant Inspector as Tagging Inspector
    participant Store as Score Storage

    Chain->>Listener: Emit TaggingRecordCreated
    Listener->>Enrichment: Check if Target is Enriched
    alt Not Enriched
        Enrichment-->>Listener: Not Ready
        Listener-->>Listener: Retry Later
    else Enriched
        Enrichment-->>Listener: Return Metadata
        Listener->>Inspector: Submit Tagging Record for Scoring
        Inspector->>Inspector: Check rate-limiting
        Inspector->>Inspector: Check blocked domains
        Inspector->>Inspector: Check metadata (title/desc)
        opt Optional Semantic Check
            Inspector->>Inspector: Run similarity analysis
        end
        Inspector->>Store: Save Score (0–4)
    end
