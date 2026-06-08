---
title: The Build Chronicle
description: Sixteen weeks from a single compose file to an encrypted multi-tenant platform — the unvarnished log.
sidebar:
  order: 4
---

Sixteen weeks. Roughly 1,080 commits across four repositories. One SSH lockout. Three CNI configurations. Two datastore engines. One operator, one AI coding assistant, and a commit log that doesn't lie.

This is not a polished retrospective. It's the war journal — era by era, incident by incident, with the real commit messages.

---

## Era 1 — Docker-Compose Homelab

**Late winter 2026 · Single node, Caddy in front, every app a compose file**

It started as a homelab. Flat collection of `containers/<app>/compose.yaml` directories, all reverse-proxied by Caddy, no orchestrator, no GitOps, no secrets management. Apps went up with `git pull && docker compose up -d`.

The first few weeks were exploration: Wiki.js, Syncthing, media tools, a Minecraft server, some things that didn't survive the month. A recurring pattern: add something, break something, roll it back, learn something.

The signature commit from this era: a database got its permissions forcibly corrected while it was running. It did not appreciate this. Reverted same day.

Late in the era: the first security pass. Volume permissions normalized, `security_opt` applied to Syncthing, a few more careful decisions. And the commit message that lives forever: **"this happened because I forgot I had a nano terminal open."** One terminal left open, one edit that shouldn't have happened, one note to future-self in the permanent record.

At the end of February the stack was: one Debian node, Docker Compose, Caddy, Postgres on bind-mount data directories. Secrets in plain text in the repository. No orchestrator.

---

## Era 2 — Kubernetes Awakening

**Early March 2026 · Three weeks that took the platform from a compose stack to a Flux-governed multi-tenant cluster**

The migration decision: k3s. Traefik came in as the new ingress, replacing Caddy. The first day of migration also produced a commit message for the ages — the engineer's frustration with an early AI-assisted attempt went into the log verbatim, unfiltered, and is now part of the permanent record.

Flux landed mid-March: GitOps reconciliation from day one. The moment it went live, `git pull && docker compose up -d` was retired forever. SOPS+Age encrypted the first secrets in the same session — **plaintext-in-git ended here**. Authentik SSO followed the next day.

Then the **78-commit day** — March 19, possibly the densest single day in the project's history. In one session, in commit order: Trivy for CVE scanning, Prometheus and Loki for observability, AlertManager wired to Discord, Kyverno deployed, vCluster operator live with the first tenant, ExternalDNS automatically managing DNS, the Platform API and Admin UI repositories born, Caddy fully erased from the platform. Uptime Kuma replaced by Prometheus. The three application repositories all saw their first commits the same afternoon.

There was also a cluster-wide outage that day from monitoring CPU limits triggering CFS throttling. Fixed same day. The lesson went into the runbook and hasn't been revisited since: no CPU limits on infrastructure namespaces, ever.

The vCluster setup produced its own discovery: the k3s distro inside vCluster hits a dual-CIDR crash. Switch to the k8s distro. That rule is permanent.

By late March the stack was: k3s, Traefik, Flux GitOps, SOPS+Age, Authentik SSO, Trivy, Prometheus + Loki + Grafana + AlertManager, Kyverno in Audit mode, vCluster multi-tenancy with one demo tenant, ExternalDNS. Three application repos live.

---

## Era 3 — Hardening + Multi-Node

**Late March 2026 · Security passes, a second tenant, and then the lockout**

A full security sweep landed at the end of March — structured as priority waves, 34 discrete hardening items. TLS minimums, HTTP-to-HTTPS redirects, image pinning, probe enforcement, Kubernetes capabilities restricted, rate limiting, Helm chart pins, Flux webhook secrets. The Velero backup infrastructure started. A second tenant joined the cluster.

Days after the sweep: a firewall misconfiguration locked the operator out. Recovery came through the cluster's own UI.

The remarkable part isn't the mistake — it's what happened during the lockout. Cilium CNI work began on paper first, then configuration attempts bouncing between tunnel modes trying to find k3s compatibility. The Admin UI got a major redesign in the same window. Permanent dark mode shipped.

The cluster stayed up the entire time. The platform was already resilient enough to be operated from inside itself.

---

## Era 4 — Recovery + Cornerstone Encryption

**Late April 2026 · SSH back, then a fast and dense push to encrypt everything**

Shell access returned. The first session after recovery was documentation: capture the state, understand what had been building in the dark. Then the work accelerated.

Multi-node expansion completed — geo-distributed nodes, Cilium CNI live cross-node. The same session: Helm chart bumps, Loki PVC growth, Trivy throttling, Longhorn exempted from a noisy policy.

Then the **kine → etcd migration**. The original k3s datastore was a SQLite+WAL setup (via kine). It was functional but carried WAL retention risk. The cutover to embedded etcd took one day — peer TLS enabled, kube-prometheus-stack upgrade unblocked in the same session after three failed attempts. The etcd migration is the kind of quiet upgrade that prevents a future incident from ever having a name.

Velero came back online with a canary restore on Homebox — first byte-identical restore in the project's history. All app PVCs migrated to the high-availability storage class. Default-deny NetworkPolicies applied across every active namespace.

Then the **Cilium hairpin NAT bug**. OIDC auth for both the admin and customer UIs broke. The root cause: Cilium evaluates NetworkPolicy post-DNAT. Traefik's egress had to be explicitly opened to the container port, not the Service port. Two PRs, multiple image bumps, several hours to root-cause a rule that looked correct until you knew how Cilium works. The Customer UI shipped end-to-end in the same session.

April 29 was the design lock day. In one session: the end-state vision document rewritten, the operator runbook consolidated, 17 one-question-at-a-time design decisions captured and locked, the Platform API with a public catalog and cart, the Admin UI with catalog management, the Customer UI with a working cart and checkout flow. All four repositories touched.

---

## Era 5 — Cornerstone Foundations

**Late April → mid-May 2026 · Encryption at every layer becomes real**

The project entered a structured wave execution. Phase 0 was "cornerstone foundations" — encryption at every layer, per-tenant secrets isolation, GitOps hygiene.

Day one of the wave: five iterations in a single calendar day.

Cilium WireGuard `nodeEncryption` went live. Host firewalls opened in advance, Cilium DaemonSet rolled, WireGuard encryption verified live, `tcpdump` confirmed only ciphertext crossing the inter-node boundary. Zero plaintext VXLAN. **Cornerstone 1 closed.**

OpenBao deployed (HA). The initial deployment hit latent bugs: a double-path in the image override, probe timing too aggressive for the disk backing. Fixed in follow-up PRs.

That same evening: a review of the audit log revealed it had been empty since project launch. A migration schema mismatch meant every audit INSERT was silently rolling back inside its transaction. No audit row had ever been written — months of events, gone. A schema fix got it running; `/audit` populated within minutes of merge. The lesson: always run a startup schema-drift check.

Fifteen PRs shipped in the day's final iteration: OpenBao formally unblocked, Flux Image Automation restored after a long-standing gap, Catalog Phase 2 rendering real HelmRelease provisioning, Grafana dashboards finally appearing.

The Renovate install landed in early May. First big harvest: 25 PRs merged in one AFK session — chart patches, security fixes, deferred holds with documented rationale. Dependency management became automated instead of manual from this point.

May 6: OpenBao initialized and unsealed — five key shares, three-threshold. The init JSON SOPS-encrypted with a sub-second plaintext window. Per-system GitHub PATs split from the shared token. Per-tenant secret path layout done; admin-deny policy active and smoke-tested. The per-tenant key derivation design doc, 19 unit tests, the provisioner policy — all shipped before the feature was wired end-to-end.

Mid-May: OpenBao session-gated key fetch. When an authenticated user session exists, the key is available. When it doesn't, the key is not. The audit→Loki pipe followed: OpenBao audit events streaming via Promtail into the same Loki query surface as every other log.

A geo-enrichment IP allowlist shipped in six PRs across all surfaces — admin UI with counters, per-route table, revocation modal, a "my IP" affordance. A checkout-path bug surfaced during this work: the catch-all Traefik route had been attaching an IP allowlist to `/checkout` since deployment. It would have blocked every customer at signup. Caught months before the first real customer existed.

---

## Era 6 — Customer Surface + Audit Cycle

**Late May 2026 · Five days, twelve PRs for auto-sleep, and a top-to-bottom feasibility audit**

A full second environment was provisioned in one evening: cluster overlay scaffold, six new namespaces, Postgres, Authentik, OpenBao initialized in-cluster, observability stack, application replicas, Velero schedules, a smoke-test tenant. End-to-end in one session.

A sweep of the Loki error logs that same week surfaced four independent latent bugs: an Authentik network policy using the Service port instead of the container port (same post-DNAT pattern as the April hairpin incident, manifesting again), Kyverno self-flagging on stale replica sets, a NetworkPolicy egress rule blocking in-cluster OIDC discovery for 15+ apps, and a dev environment variable rejecting a test promo code because the environment label said "production." None were new — they had all been running quietly. All fixed in the same session.

Then **KEDA auto-sleep** — twelve PRs in one push. KEDA itself, a per-tenant StorageClass with the right `nodeDownPodDeletionPolicy` for scale-from-zero, the wake event model, the wake-shim HTML served by the Platform API with a real progress state machine (cold → scheduling → pulling → starting → ready), the `/wake/{app_id}` route, the KEDA `ScaledObject` per non-always-on tenant app using a Prometheus scaler on Traefik request metrics, the customer-facing wake failure message, the admin wake-shim gallery for testing. Twenty-two unit tests. All in one session.

The test-feasibility audit closed the era. Four parallel agents swept platform API tests, both UIs, manifests, and policy coherence. The synthesized punchlist closed in five PRs. The two most critical findings: two undefined variable references in the tenant provisioning code that would have crashed on the first real payment webhook — after the tenant row was committed, before the vCluster was ready — producing half-provisioned tenants. The free-promo path took a different code branch, so testing had been hiding both bugs. Pytest got wired into CI in the same PR. The test suite had been growing for months; nothing had ever run it automatically.

Stage Kyverno coverage, manifest validation CI, pvc-autoresizer cluster-wide, a CronJob to defeat a k3s addon manager that kept reverting a storage class setting — all closed the same week.

---

## By the Numbers

| | |
|---|---|
| Project age | ~16 weeks |
| Total commits | ~1,080 across four repositories |
| Infra repository | 689 commits |
| Platform API | 158 commits |
| Admin UI | 156 commits |
| Customer UI | 78 commits |
| Datastore engines | 2 (SQLite+WAL → embedded etcd) |
| CNI iterations | 3 (Flannel → Cilium VXLAN → Cilium WireGuard) |
| Hardening items | 34-item sweep, structured across priority waves |
| Tenants on cluster | 2 active dev tenants at close |
| Worst day | ~78 commits — Trivy, Loki, Kyverno, vCluster, ExternalDNS, Platform API, Admin UI, Caddy retired, cluster-wide outage, all in one session |

---

## What the Chronicle Proves

The platform was not designed, then built. It was built, then understood, then redesigned — multiple times — with each cycle tightening the architecture. The encryption cornerstones landed before the customer surface did. The audit log was broken for months before anyone looked; fixing it required seeing that it was broken. The hairpin NAT rule bit three separate subsystems in three separate eras.

These are not embarrassments. They are the normal shape of building something real. What distinguishes the log: when something broke, it got documented, the rule got written, and the next engineer who hit the same class of problem found a note waiting for them.

The war journal is the architecture's second half.
