---
title: Architecture
description: GitOps-governed Kubernetes with encryption at every layer — the full QNix stack, component by component.
sidebar:
  order: 2
---

QNix is a multi-layer platform. Each layer has a job; each hands clean interfaces to the layer above it. This page walks the stack from control plane to economics, naming every component without soft-pedaling complexity.

Audience: you're evaluating whether this is the platform you want to run on. If you need depth on the isolation and zero-knowledge model, see [Tenancy & Security](/qnix/tenancy-security/).

---

## Control Plane

```
Kubernetes (k3s distribution)
  └─ embedded etcd          — HA cluster datastore; peer TLS enforced
  └─ Flux v2 (GitOps)       — every cluster change is a reconciled commit
  └─ SOPS + Age             — secrets encrypted in git; pre-commit hook blocks plaintext stringData
  └─ Renovate               — dependency-bump PRs, automated
```

The cluster runs on a lightweight Kubernetes distribution with embedded etcd as the datastore — a deliberate upgrade from the SQLite-WAL prototype once WAL retention risk became real. Flux reconciles the entire cluster from git; nothing is applied by hand in normal operation. SOPS+Age seals secrets at rest in the repository; the pre-commit hook makes unencrypted `stringData` a build error, not a policy hope. Renovate generates dependency-bump PRs on a cadence so chart and image drift stays auditable.

---

## Network

```
Cilium CNI
  └─ WireGuard nodeEncryption — kernel-mode inter-node encryption; zero plaintext leaves any box
  └─ Hubble Relay             — L4/L7 flow observability
  └─ default-deny NetworkPolicies — every namespace isolated; positive allow-lists only
Traefik                      — cluster ingress; TLS 1.2+; HTTP→HTTPS 308; ForwardAuth
cert-manager                 — TLS issuance and renewal; wildcard support
ExternalDNS (Porkbun webhook) — DNS records kept in sync with cluster state
```

Cilium replaced the initial CNI. The critical property it enables: WireGuard node-to-node encryption at kernel level, applied to every packet before it crosses the inter-node boundary. No configuration required at the application layer — the plaintext gap simply does not exist. Hubble gives L4/L7 flow visibility for debugging without opening a packet sniffer.

Traefik handles ingress — TLS termination, ForwardAuth chaining to Authentik on every route, and the error-middleware fallback that serves the wake-shim interstitial when a tenant app is scaling from zero. cert-manager manages certificates automatically. ExternalDNS keeps DNS records aligned with what the cluster actually exposes.

The cluster spans geo-distributed nodes. Cilium treats them as a flat, encrypted fabric.

---

## Tenancy

```
vCluster operator
  └─ one vCluster per tenant — own Kubernetes API server, own resource envelope
  └─ k8s distro (not k3s)   — avoids the dual-CIDR crash discovered early in the build
  └─ default-deny + allowlist NetworkPolicies inside each vCluster
```

Each tenant gets a dedicated virtual Kubernetes control plane. From inside a tenant's environment, it looks like a private cluster. From outside, it is a namespaced workload on the host cluster with no cross-tenant visibility. The k8s vCluster distro is a locked architectural decision — the k3s distro hit a dual-CIDR crash that was caught in early testing and never revisited.

---

## Identity

```
Authentik
  └─ SSO for every platform UI and every tenant app
  └─ ForwardAuth — no app ships its own auth; Authentik gates every route
  └─ native OIDC — apps that support it get direct OIDC integration (no proxy hop)
  └─ MFA enrolled across multiple devices
```

Authentik is the single identity plane. Every admin UI, customer UI, and tenant app is gated through it — either via ForwardAuth (proxy-level, zero changes to the app) or native OIDC (for apps that support the standard). The platform runs two OIDC issuers: one for the admin surface, one for the customer surface. There is no route on the platform that bypasses Authentik in normal operation.

---

## Secrets

```
OpenBao (HA)
  └─ per-tenant key namespace  — kv-v2 at tenant/<id>/
  └─ admin-deny policy         — admin cannot read tenant keys
  └─ session-gated key release — key only available during authenticated session
  └─ audit → Loki              — every key access is an immutable log event
```

OpenBao (the OSS Vault fork) is the secrets backend. Per-tenant key paths are isolated under policy; the admin-deny policy is the technical enforcement of the zero-knowledge claim — admin credentials cannot retrieve tenant key material. Keys are released only to authenticated sessions. Every access and every administrative action against OpenBao produces an audit event that streams to Loki.

OpenBao runs HA with embedded Raft. Unsealing is a human-in-the-loop operation; the unseal key material is SOPS-encrypted and held off-cluster.

---

## Storage

```
Longhorn                — distributed block storage; per-tenant LUKS-encrypted StorageClass
Garage                  — self-hosted S3 (AGPL-3); geo-distributed across nodes
Velero                  — scheduled backups to Garage; restore via admin UI
pvc-autoresizer         — PVCs grow on filesystem pressure; opt-in per annotation
snapshot-controller     — VolumeSnapshot support; enables CSI snapshot path for Velero
```

Longhorn provides distributed block storage with a per-tenant encrypted StorageClass. Volumes provisioned for tenant workloads use LUKS encryption keyed from OpenBao — the platform stores only ciphertext; it cannot decrypt without the tenant's session-derived key.

Garage is the cluster's S3 layer, used for Velero backup targets and any app that needs object storage. It is deployed across nodes so backup targets survive a single-node loss. Velero schedules nightly backups with a restore path surfaced in the admin UI. pvc-autoresizer watches filesystem pressure and grows PVCs before they fill — prevents the class of incident where a log partition kills a running app.

---

## Policy & Scanning

```
Kyverno              — admission policy engine; enforces across all namespaces including tenant vClusters
Trivy Operator       — continuous CVE scanning; image results fed to observability stack
Renovate             — automated dependency-bump PRs across all four repositories
```

Kyverno enforces admission policy cluster-wide. Policies cover the host cluster and extend coverage to stage and tenant namespaces; wildcard namespace selectors ensure new environments inherit baseline enforcement without manual wiring.

Trivy scans every running image continuously and feeds findings to the observability stack. Renovate generates PRs when upstream chart or image versions change, keeping the dependency surface visible and auditable rather than accumulating silently.

---

## Observability

```
kube-prometheus-stack
  └─ Prometheus          — metrics collection; federation-aware
  └─ Grafana             — dashboards per namespace and per tenant
  └─ AlertManager        — alert routing → Discord (3 channels: critical / warning / general)
Loki + Promtail          — log aggregation; auth-enabled; per-namespace label selectors
Hubble Relay             — Cilium L4/L7 network flow capture
prometheus-blackbox-exporter — synthetic probes for BYOU domain + tenant uptime
custom Discord proxy     — bridges AlertManager → Discord; resolves alert-state idiosyncrasies
```

The observability stack is deployed per environment. Prometheus scrapes cluster and application metrics; Grafana surfaces per-namespace and per-tenant dashboards. AlertManager routes to Discord on three channels, with a custom proxy that handles alert resolution state correctly.

Loki aggregates all logs. OpenBao audit events stream through Promtail into Loki so every key access lives in the same query surface as application logs and cluster events. Hubble gives flow-level network visibility. The blackbox exporter provides synthetic probes for tenant subdomains and custom domains.

No polling, no agent callbacks. Every signal is push or scrape on a schedule.

---

## Economics

```
KEDA                — request-driven autoscaler; scale-to-zero for tenant apps
custom wake-shim    — branded "warming up" interstitial served by Traefik error-middleware during scale-from-zero
always_on flag      — per-app override in admin catalog; exempts app from scale-to-zero
```

KEDA watches Traefik request metrics on a per-tenant-app basis. When traffic on a service hits zero for the idle threshold, the Deployment scales to zero. When the next request arrives, Traefik's error middleware intercepts it and serves the wake-shim: a progress page with a real state machine (cold → scheduling → pulling → starting → ready), estimated seconds remaining, and auto-redirect when the pod becomes available. The shim is served by the platform's own API — no 5xx reaches the user during wake.

The economics property: idle tenant apps consume no compute. Operator costs track actual usage rather than reserved headroom.

---

## How the Layers Connect

```
Control Plane (GitOps source of truth)
  │
  ├── Network (Cilium encrypted fabric + Traefik ingress)
  │     └── every route ForwardAuth'd through Identity
  │
  ├── Tenancy (vCluster per tenant)
  │     ├── Identity (Authentik OIDC per tenant app)
  │     ├── Secrets (OpenBao per-tenant key path)
  │     └── Storage (Longhorn-encrypted PVCs)
  │
  ├── Policy & Scanning (Kyverno + Trivy, cluster-wide)
  │
  ├── Observability (Prometheus + Loki + Hubble, per env)
  │
  └── Economics (KEDA + wake-shim on the Traefik edge)
```

The design principle throughout: no single layer trusts the one below it. Network encryption exists because the storage layer's LUKS keys are not a substitute for in-flight protection. Admission policy exists because RBAC alone is not sufficient. Audit logging exists because the zero-knowledge claim requires proof, not assertion.
