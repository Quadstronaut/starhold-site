---
title: Hosting on QNix
description: Private, encrypted app hosting — join the waitlist.
sidebar:
  order: 5
---

QNix is being built as a hosted platform. Here's what it's being built to do.

## Your own private encrypted environment

The offering is planned to take you from "never heard of us" to a working private environment in under five minutes — no infrastructure knowledge required. A vCluster (your own Kubernetes control plane) is provisioned automatically at signup. Your data lands in it, encrypted with keys the platform cannot read.

## A curated app catalog

The platform is being built around a catalog of self-hostable apps — admin-curated, source-pinned, ready to deploy into your environment. Adding an app is planned to be a cart-and-checkout flow, not a YAML edit.

## Apps that sleep when you're not using them

Tenant apps are planned to scale to zero after an idle period and wake on the first authenticated request. When a sleeping app is woken, a progress page shows the real state — cold, scheduling, pulling, starting, ready — and redirects automatically when the pod is up. You're never left staring at a 502.

## Your data stays yours

The zero-knowledge design is a cornerstone, not a feature. Per-tenant keys are sealed in a secrets vault under your identity. The platform cannot decrypt your data at rest. Export everything is planned as a first-class operation. Delete means delete — once the recovery envelope is gone, the data is gone permanently.

## Invite others into your apps

Cross-tenant invitations are on the roadmap. Planned to let you grant another user access to a specific app in your environment — existing customer or email-only — with full auditability and revocation at any time.

## Join the waitlist

QNix hosting has no launch date and no pricing published yet. If this sounds like what you've been looking for, [get in touch](https://starhold.dev/contact) and we'll add you to the list.
