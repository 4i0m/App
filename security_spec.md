# Security Specification & Threat Model for Q Platform

## 1. Core Data Invariants & Zero-Trust Guarantees

1. **Identity Spoofing Immunity**: A user can never author a post, comment, message, or report impersonating another user's UID (`incoming().authorId == request.auth.uid`).
2. **Privilege Escalation Protection**: An ordinary user cannot self-assign administrative roles, staff titles, or official verification badges during account creation or profile update. Role assignment and verification require administrative credentials or bootstrapped owner privileges.
3. **Owner Bootstrapping**: The platform founder and admins are verified against runtime credentials (`sabosenpai33@gmail.com`) and elevated roles documents, protecting owner sovereignty.
4. **Conversation Confidentiality**: Only confirmed participants (`request.auth.uid in resource.data.participantIds`) can view messages, thread details, or add new messages.
5. **PII and Report Privacy**: Reports and audit logs are visible solely to authorized staff and reporters, forbidding general member access.
6. **Data Immutability**: Historical audit logs cannot be edited or deleted by any user once written. Post creation timestamps and author IDs remain immutable on updates.
7. **Resource Poisoning Defense**: All IDs and string content are constrained with strict `.size()` guards and regex validators to prevent wallet denial / memory exhaustion attacks.

## 2. The "Dirty Dozen" Threat Payloads (Must Return PERMISSION_DENIED)

1. **Payload 1 (Self-Promotion Attack)**: An unprivileged user sends `role: "owner"` during profile creation or profile update.
2. **Payload 2 (Ghost Field Injection)**: An attacker injects `isVerified: true` and `verificationCategory: "official_platform"` into their profile document.
3. **Payload 3 (Impersonated Post Creation)**: An authenticated user sends a post with `authorId: "victim_user_123"`.
4. **Payload 4 (Post Alteration / Update Hijack)**: A user tries to update another user's post content or change the post's `authorId`.
5. **Payload 5 (Eavesdropping on Private Chat)**: An authenticated user queries messages of a conversation where `request.auth.uid` is NOT in `participantIds`.
6. **Payload 6 (Unauthorized Message Injection)**: A malicious user sends a message into a conversation where they are not a participant.
7. **Payload 7 (Audit Log Erasure or Tampering)**: Any user attempts an `update` or `delete` on an `/audit_logs/{id}` entry.
8. **Payload 8 (Moderation Report Snooping)**: A normal member requests `get` or `list` on another user's moderation report.
9. **Payload 9 (Oversized Payload / Denial of Wallet)**: A user submits a post containing a content string exceeding 2000 characters or arbitrary untyped nested objects.
10. **Payload 10 (Follower Count Manipulation)**: A user attempts to directly mutate `stats.followersCount` on an arbitrary user's document.
11. **Payload 11 (Platform Settings Takeover)**: An unauthenticated or non-admin user attempts to write to `/platform_settings/global`.
12. **Payload 12 (Username Squatting / Hijack)**: A user attempts to write a username reservation mapping to a different `userId`.
