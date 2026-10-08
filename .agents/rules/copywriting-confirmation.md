# Copywriting, Pricing & Policy Confirmation Rule

This rule governs how agents handle user-facing copy, marketing text, pricing tiers, and business policies across all Antigravity projects.

## 1. STOP AND CONFIRM Protocol (MANDATORY)

Agents must **never** auto-apply or silently commit rewrites to customer-facing copy.

Whenever proposing modifications to:
* Headlines, subheadings, and hero messaging
* Pricing numbers, tier definitions, or service bundles
* Refund, cancellation, or fulfillment policies
* Value propositions, diagnostic scores, or audit summaries
* Legal disclaimers or terms of service

The agent **MUST**:
1. Present the exact proposed text side-by-side with the current text in the chat.
2. Clearly explain the rationale for the change.
3. **Wait for explicit user approval** before editing files, running build scripts, or pushing deployments.

## 2. Zero Mock Telemetry in Production
* Never insert mock audit metrics, fake ratings, or simulated diagnostic scores into live customer flows.
* Clearly delineate between sandbox/demo fixtures and live customer data.
