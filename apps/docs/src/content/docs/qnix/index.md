---
title: What is QNix
description: The encrypted, multi-tenant Kubernetes platform Starhold's own products run on.
sidebar:
  order: 1
---

**QNix is a private, encrypted, multi-tenant Kubernetes platform** — built from scratch by Kyle Green (Quadstronaut) over sixteen weeks and ~1,080 commits. It exists because Starhold needed infrastructure that takes privacy seriously at every layer, not as an afterthought.

## Starhold runs on it

Every Starhold product — Shushgame, the custom Discord bots, this documentation site — runs on QNix. That's not marketing copy; it's the credibility test. The platform handles real traffic, real tenants, and real failure modes every day.

## What it's built to do

- **Encryption everywhere.** Traffic between users and the cluster is TLS-terminated. Traffic between nodes is kernel-level WireGuard — no plaintext leaves the box. Data at rest uses per-tenant keys the platform itself cannot read.
- **Hard tenant isolation.** Each tenant runs in its own Kubernetes control plane (vCluster). Your environment cannot touch another's, and the platform cannot decrypt your data.
- **Sleep-wake economics.** Apps scale to zero when idle and wake on the first request — with a real progress bar, not a 5xx. Reserved capacity only when you need it.

## Coming soon as a hosted offering

QNix is being opened as a hosted platform. If you want a private, encrypted environment for your own apps without operating the infrastructure yourself, [join the waitlist](https://starhold.dev/contact).
