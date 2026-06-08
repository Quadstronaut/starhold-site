---
title: Tenancy & Security
description: How tenant isolation works and why the platform cannot read your data.
sidebar:
  order: 3
---

QNix is built around a simple rule: **the platform cannot read your data, and every layer of the stack is designed to enforce that.** This page walks through how tenant isolation is structured, where encryption lives at each layer, what the zero-knowledge architecture means in practice, how every action is audited, and how the platform approaches security hardening as a continuous discipline — not a one-time checklist.

For a component-level view of the full stack, see [Architecture](/qnix/architecture/).

---

## Tenant Isolation

Each tenant runs in a dedicated virtual Kubernetes control plane — a vCluster with its own API server and its own resource envelope. From inside a tenant environment, it looks like a private cluster. From outside, it is a namespaced workload on the host cluster with no cross-tenant visibility by construction.

```
Host cluster
  └─ vCluster (Tenant A)   — own API server, own resource quotas
  └─ vCluster (Tenant B)   — own API server, own resource quotas
       ...
```

The vCluster distro in use is the Kubernetes distribution, not k3s — that choice is a locked architectural decision made after a dual-CIDR crash in early testing. Default-deny NetworkPolicies apply inside each vCluster so tenant workloads cannot reach each other or the host cluster control plane through unexpected paths.

Tenant lifecycle — provisioning, suspension, resumption, deletion — is managed through the admin UI. The platform provisions a new vCluster automatically at signup; the operator does not touch the cluster for routine tenant operations.

---

## Encryption

Encryption is applied at every layer. No single layer's failure exposes another's protection.

### In transit: user to cluster

All traffic between users and the cluster is TLS 1.2 or higher with HTTP-to-HTTPS redirection enforced. HSTS headers are set. There is no cleartext path into the cluster.

### In transit: node to node

Node-to-node traffic is encrypted at the kernel level using WireGuard, applied by the Cilium network plugin with `nodeEncryption: true`. This is not application-layer TLS — it is kernel-mode encryption applied to every packet before it crosses the inter-node boundary. The property is verified: only ciphertext appears on the wire between nodes. No configuration is required at the application layer; the plaintext gap simply does not exist.

### At rest: per-tenant volume encryption

Tenant storage volumes use LUKS encryption via a dedicated StorageClass. The LUKS key for each tenant's volumes is sealed in OpenBao under a per-tenant key path. The platform stores only ciphertext on disk; it cannot decrypt without the tenant's session-derived key.

### At rest: secrets in git

Cluster secrets are encrypted in the git repository using SOPS with Age keys. A pre-commit hook treats unencrypted `stringData` in any manifest as a build error — plaintext secrets cannot be committed by accident.

### At rest: cluster datastore

The cluster datastore uses embedded etcd with peer TLS enforced between nodes.

---

## Zero-Knowledge Architecture

The zero-knowledge property is an architectural guarantee, not a policy promise.

At signup, a per-tenant master key is derived from the user's credentials and stored encrypted in OpenBao at a per-tenant key path. The OpenBao admin policy prevents the operator from reading tenant key material — admin credentials cannot retrieve it. The key is released only during an authenticated user session; the platform has no standing access to it.

The architectural guarantee: **the operator cannot read tenant data at rest.** This is enforced at the policy level in OpenBao — the technical mechanism, not an operational agreement.

A recovery envelope is generated at signup so that a user who loses both their password and their recovery key permanently loses access to their data. That outcome is the privacy guarantee, not a bug — data the platform cannot decrypt cannot be handed over under any circumstance.

The customer-facing signup flow for displaying the recovery envelope once and confirming it has been saved is on the roadmap; the key derivation and wrapping model it depends on is in place.

---

## Audit Posture

Every meaningful action on the platform produces an immutable audit record.

Admin actions — tenant lifecycle events, app subscribe and unsubscribe, secret reads, key rotation, invitation grants — are written as rows to the platform's audit tables. These rows are not updatable; the schema enforces append-only semantics. The audit log is exportable and queryable.

OpenBao produces its own audit stream: every key access, every policy evaluation, every administrative action against the secrets vault is emitted as a JSON event with hashed paths to a file audit device. Promtail forwards these events to Loki, where they live in the same query surface as cluster logs and application metrics. Every read of a tenant key produces a log event.

The result: there is no privileged operation — including key access — that does not produce a queryable, durable record.

---

## Hardening Culture

Security hardening on QNix is a continuous practice, not a completed project.

A 34-item hardening sweep ran over the platform during the build, covering TLS configuration, admission policy, image pinning, network policies, security headers, and related controls. That sweep is not the ceiling — it is a baseline that subsequent work builds on.

Trivy scans every running image continuously for known vulnerabilities and feeds findings to the observability stack. A policy engine enforces admission control across all cluster namespaces, including tenant vClusters and any new environments added; wildcard namespace selectors mean new deployments inherit baseline enforcement without manual wiring.

Policy names, enforcement states, and individual hardening item identifiers are not published — an aggregated list of what is in Audit versus Enforce mode is a roadmap for attackers. What is published: enforcement is active and continuous, findings drive remediation, and the platform treats security as an operational discipline rather than a release-gate checkbox.
