import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/shared/components/ui/Button';

export type PolicyType = 'terms' | 'privacy';

const POLICY_TEXT: Record<PolicyType, { title: string; text: string }> = {
  terms: {
    title: 'Terms of Service',
    text: `Last updated: June 28, 2026

AIVORA provides an AI expert marketplace where Clients and Experts can connect, discuss work, create projects, manage milestones, exchange deliverables, use wallet features, and resolve project issues through the platform.

These Terms of Service explain what you can expect from AIVORA, what AIVORA expects from you, how project and payment features work, and what happens when problems or disagreements occur.

By creating an account or using AIVORA, you agree to these Terms and to the Privacy Policy. If you do not agree, you must not use the platform.

These Terms are written to describe platform rules and user responsibilities. They do not provide legal, financial, tax, employment, or professional advice.

1. User Accounts and Roles

Users may register as Clients, Experts, Admins, or other supported roles.

You are responsible for providing accurate account information, keeping your login credentials secure, and maintaining the confidentiality of your account. Activity performed through your account may be treated as your activity.

You must not impersonate another person, create fake accounts, share accounts to bypass platform controls, misuse platform features, or engage in fraudulent, abusive, misleading, or unlawful activity.

AIVORA may suspend, restrict, or remove accounts that violate these Terms, platform rules, security requirements, or applicable law.

2. Client and Expert Profiles

Clients may provide profile information such as company name, industry, company size, website, and business description.

Experts may provide profile information such as professional title, bio, skills, categories, portfolio links, hourly rate, experience, availability, ratings, and other work-related details.

You are responsible for keeping profile information accurate, current, and not misleading. AIVORA may review, hide, reject, or remove profile content that appears inaccurate, abusive, unlawful, or inconsistent with platform requirements.

3. Jobs, Proposals, and Project Creation

Clients may create job posts that describe project needs, budgets, timelines, scope, required skills, and expected outcomes.

Experts may submit proposals that include cover letters, proposed budgets, timelines, milestones, and delivery plans. Clients may shortlist, reject, or accept proposals.

When a Client accepts a proposal, AIVORA may create a project between the Client and the selected Expert. Other proposals for that job may be rejected or closed according to platform logic.

Clients and Experts should review the scope, budget, milestones, acceptance criteria, and timeline before starting work. Clear project terms help both sides understand what will be delivered and when payment may be released.

4. Wallets, AICOIN, and Payment Providers

AIVORA may provide an in-platform wallet using AICOIN or another supported currency. Wallet balances may include available balance, held balance, total earned, transaction history, deposits, withdrawals, transfers, milestone funding, payment release, refunds, and related records.

Clients may deposit funds into their wallet using supported payment methods, including VNPay where available. Payment providers may apply their own terms, fees, processing rules, availability limits, verification requirements, and processing times.

AIVORA may record payment provider callback data, transaction references, payment statuses, and other payment metadata required to process deposits, withdrawals, refunds, and transaction confirmations.

Wallet credits, demo deposits, or test balances may be limited to platform testing or demonstration purposes and may not represent withdrawable cash value unless AIVORA expressly states otherwise.

5. Milestone Funding and Staged Payments

AIVORA allows Clients to create and fund project milestones. Each milestone may include a title, description, acceptance criteria, amount, currency, due date, order, and status.

When a Client funds a milestone, 30% of the milestone amount is transferred to the Expert immediately so work can begin.

The remaining 70% is processed when the Client approves the submitted deliverable, subject to the platform commission model.

A platform commission equal to 10% of the total milestone amount is applied, so the Expert receives 90% of the total milestone amount overall.

6. Deliverables, Review, and Payment Release

Experts may submit deliverables for funded milestones through the platform. Deliverables may include descriptions, file links, or other submitted work.

Clients are responsible for reviewing submitted deliverables against the agreed milestone scope and acceptance criteria.

If the Client approves the deliverable, the milestone may be marked approved or completed, and AIVORA processes the remaining milestone payment according to the staged-payment model.

Once a milestone has been approved and payment has been released, the release is generally final for that milestone, except where applicable law, payment provider rules, fraud review, chargeback handling, or platform administrative review requires otherwise.

7. Revision Requests

If a Client believes that a submitted deliverable does not meet the agreed milestone requirements, the Client may request revisions before approving the milestone.

Revision requests should be specific, reasonable, and related to the agreed milestone scope and acceptance criteria. Clients must not use revision requests to expand the scope without agreement or avoid payment for properly completed work.

Experts should respond to reasonable revision requests in good faith and within agreed project timelines where possible.

8. Disputes

A dispute may be opened only when the relevant project or milestone is still active, funded, submitted, under review, disputed, or otherwise not finally completed.

A dispute generally cannot be opened after the milestone has already been approved by the Client and the remaining milestone payment has been processed through the normal completion process.

Disputes should be used only when there is a genuine disagreement about the milestone scope, acceptance criteria, submitted deliverable, payment release, refund, or performance of the agreed work.

During a dispute, AIVORA may review relevant account information, project records, milestone details, payment records, deliverables, dispute reasons, descriptions, messages, notifications, and other platform records.

AIVORA administrators may resolve a dispute by processing all or part of the remaining milestone balance, refunding all or part of an eligible balance to the Client, splitting funds, requesting revision, closing the dispute, or taking another action supported by the platform and applicable rules.

9. Refunds, Withdrawals, and Chargebacks

Refunds may be available for eligible milestone balances that have not yet been processed to the Expert.

If a dispute results in a refund decision, AIVORA may return all or part of an eligible milestone balance to the Client depending on the dispute outcome.

After a milestone has been approved and payment has been released to the Expert, refunds for that milestone are generally not available through the standard dispute process.

Withdrawals may be subject to identity checks, wallet balance requirements, payment provider rules, processing times, fees, fraud review, and other platform controls.

If a payment is reversed, charged back, cancelled, suspected to be fraudulent, or processed incorrectly, AIVORA may adjust wallet balances, freeze funds, suspend withdrawals, request information, or take reasonable corrective action.

10. Messages, Files, and External Links

AIVORA may provide messaging, notifications, and file upload features. You are responsible for the content you send, upload, or link through the platform.

You must not upload malicious files, harmful links, illegal content, infringing content, confidential information you are not authorized to share, or content that violates another person's rights.

Some files or media may be stored or processed by third-party services such as Cloudinary or other supported providers.

Users should be careful when opening external links, portfolio links, payment links, or files shared by other users.

11. Reviews and Ratings

Clients and Experts may be able to submit reviews after project completion. Reviews must be truthful, relevant to the project, and based on real experience.

You must not manipulate reviews, submit fake reviews, threaten users for reviews, offer improper incentives for reviews, or submit reviews that are abusive, discriminatory, defamatory, or unrelated to the project.

AIVORA may remove, hide, or moderate reviews that violate platform rules.

12. AI Features and Recommendations

AIVORA may provide AI-assisted features such as job drafting, suggested milestones, expert matching, recommendations, summaries, or other automated assistance.

AI-generated output may be incomplete, inaccurate, or unsuitable for a specific project. Users are responsible for reviewing and editing AI-assisted content before relying on it, publishing it, or using it in a project.

AIVORA does not guarantee that AI recommendations will identify every suitable Expert, job, proposal, risk, or requirement.

13. Intellectual Property and User Content

You retain ownership of content you submit to AIVORA, subject to any separate agreement between a Client and an Expert.

By submitting content to the platform, you grant AIVORA a limited permission to host, store, display, process, transmit, and use that content as needed to operate, secure, improve, and administer the platform.

Unless the Client and Expert agree otherwise in writing, rights to project deliverables transfer according to the agreed project terms only after the relevant milestone payment has been released.

You must not submit content that infringes copyrights, trademarks, trade secrets, privacy rights, publicity rights, or other rights of any third party.

14. Prohibited Conduct

Users must not commit fraud, submit false information, circumvent platform payment flows, manipulate reviews, abuse refunds or disputes, harass other users, upload malware, interfere with security, scrape or attack the service, or use AIVORA for illegal activity.

Clients must not use revision or dispute processes to avoid payment for properly completed work.

Experts must not submit copied, incomplete, harmful, misleading, or unauthorized deliverables.

15. Platform Role and No Employment Relationship

AIVORA provides a platform for Clients and Experts to connect, manage projects, fund milestones, submit deliverables, communicate, review work, and resolve disputes.

AIVORA is not a party to the independent service relationship between Clients and Experts unless expressly stated otherwise. AIVORA does not guarantee user performance, project results, professional qualifications, uninterrupted work, or a specific outcome.

Clients and Experts are independent users of the platform. These Terms do not create an employment, partnership, agency, franchise, or joint venture relationship between AIVORA and any user.

16. Availability, Security, and Changes to the Platform

AIVORA may change, suspend, or discontinue parts of the platform at any time. The platform may be unavailable due to maintenance, upgrades, outages, security incidents, third-party provider issues, or events outside AIVORA's control.

AIVORA may use security controls such as authentication, authorization, rate limiting, logging, moderation, and administrative review to protect the platform and its users.

17. Limitation of Liability

To the fullest extent permitted by applicable law, AIVORA is not responsible for indirect, incidental, special, consequential, exemplary, or punitive damages, lost profits, lost data, lost business opportunities, or disputes between users.

AIVORA's responsibility for any claim related to the platform is limited to the amount permitted by applicable law and any mandatory consumer protection rules that apply.

Nothing in these Terms limits liability that cannot legally be limited.

18. Changes to These Terms

AIVORA may update these Terms of Service from time to time. When changes are made, the updated version may be posted on the platform with a new "Last updated" date.

Continued use of the platform after the Terms are updated means that you accept the revised Terms.

19. Contact

If you have questions about these Terms of Service, please contact the AIVORA support team through the platform.`,
  },
  privacy: {
    title: 'Privacy Policy',
    text: `Last updated: June 28, 2026

When you use AIVORA, you trust us with information related to your account, profile, projects, wallet activity, messages, deliverables, and disputes. This Privacy Policy explains what information we collect, why we collect it, how we use it, when it may be shared, and what choices you have.

By creating an account or using AIVORA, you agree to the collection and use of information as described in this Privacy Policy.

1. Information We Collect

AIVORA collects information to provide marketplace features, protect accounts, process project activity, manage wallet and milestone records, support communication, and improve the platform.

Account information may include full name, email address, password hash, phone number, avatar URL, role, account status, login activity, refresh token information, and related authentication records.

Client profile information may include company name, industry, company size, website, description, ratings, review totals, job history, project activity, and other profile information.

Expert profile information may include title, bio, hourly rate, experience years, availability status, skills, categories, portfolio links, completed project counts, success rate, response time, ratings, reviews, verification-related information, and expert review records.

Job, proposal, project, and milestone information may include project ideas, AI-assisted job drafts, descriptions, budgets, currencies, scopes, timelines, skills, proposals, cover letters, proposed budgets, proposed timelines, proposed milestones, project records, milestone details, acceptance criteria, due dates, statuses, and collaboration records.

Wallet, payment, and transaction information may include wallet balances, available balances, held balances, total earned amounts, currencies, transaction history, payment records, milestone funding records, release records, refund records, withdrawal records, transfer records, payment statuses, transaction references, and payment-related metadata.

AIVORA may use third-party payment providers, including VNPay or other supported services, to process deposits, withdrawals, payment confirmations, callbacks, and transaction status updates. Those providers may process payment information under their own policies.

Deliverables, files, and messages may include deliverables, file URLs, dispute reasons, dispute descriptions, resolution notes, messages, read receipts, notifications, and communication records created through the platform.

Files and media may be stored or processed by third-party providers such as Cloudinary or other supported storage services.

AI feature information may include prompts, project ideas, job descriptions, suggested skills, suggested milestones, recommendation results, match scores, generated content, confidence scores, and related AI-assistance activity.

Technical, security, and usage information may include device information, browser type, IP address, request data, route activity, login activity, error logs, session information, rate-limit records, usage activity, API trace IDs, and security logs.

2. How We Use Information

AIVORA may use collected information to:

Create, authenticate, and manage user accounts.

Protect account security and prevent unauthorized access.

Display Client and Expert profiles, ratings, reviews, skills, and expert discovery information.

Support job posting, AI-assisted job drafting, proposal submission, hiring, project creation, project management, and milestone tracking.

Process wallet transactions, deposits, withdrawals, transfers, milestone funding, payment releases, refunds, and payment status updates.

Support deliverable submission, Client approval, revision requests, and project completion.

Provide messages, notifications, chat, read confirmations, and project communication features.

Handle disputes between Clients and Experts, including administrative decisions.

Review Expert profiles, moderate content, enforce platform rules, and manage platform safety.

Provide AI recommendations, expert matching, job suggestions, and related platform features.

Detect, prevent, and investigate fraud, spam, abuse, payment misuse, security incidents, and policy violations.

Improve the platform, user experience, service reliability, and technical performance.

Comply with legal, regulatory, tax, accounting, payment provider, security, or administrative requirements.

3. How Information Is Shared

AIVORA does not sell user personal information.

Certain information may be shared between Clients and Experts to support normal platform activities. A Client may see an Expert's profile, skills, proposal, submitted deliverables, reviews, messages, and project activity. An Expert may see relevant job details, milestone information, Client information, messages, and project records.

AIVORA administrators may access relevant account, profile, job, proposal, project, wallet, payment, message, deliverable, review, notification, and dispute information when needed for moderation, dispute resolution, Expert review, user support, fraud prevention, security, or platform management.

Payment-related information may be shared with third-party payment providers to process deposits, withdrawals, refunds, transaction confirmations, payment callbacks, and payment status updates.

AIVORA may share information with service providers that support hosting, database storage, file storage, media handling, cloud infrastructure, analytics, logging, email, notifications, security, or other technical operations.

AIVORA may disclose information if required by law, regulation, legal process, payment provider rules, security investigation, fraud prevention, dispute handling, or to protect the rights, safety, and property of AIVORA, its users, or others.

4. Milestone Payments and Dispute Records

AIVORA keeps records of milestone funding, staged payments, payment releases, refunds, split payments, revision decisions, frozen funds, and dispute outcomes.

When a milestone is funded, the system records the 30% transfer to the Expert. When the Client approves the Expert's deliverable, the system records the milestone approval, completion, remaining payment processing, and platform commission.

Dispute records may include dispute reasons, descriptions, related messages, project information, milestone status, payment records, administrative decisions, resolution type, resolution notes, and timestamps.

Disputes are generally available only while a milestone or project is not finally completed. Once a milestone has been approved by the Client and the remaining payment has been processed, a new dispute for that completed milestone is generally not available through the standard dispute process.

5. Data Storage and Security

AIVORA uses reasonable technical and organizational measures to protect user information from unauthorized access, loss, misuse, alteration, or disclosure.

Security measures may include password hashing, authentication tokens, authorization policies, role-based access controls, rate limiting, administrative access controls, logging, and security monitoring.

However, no online platform can guarantee absolute security. Users are responsible for keeping their login credentials confidential and notifying AIVORA if they suspect unauthorized account access.

6. Data Retention

AIVORA may retain user information for as long as necessary to provide platform services, maintain wallet, payment, transaction, project, message, review, and dispute records, comply with legal obligations, resolve conflicts, prevent fraud, protect platform security, and enforce platform policies.

Some information may be retained after an account is deactivated where necessary for legal, accounting, security, fraud prevention, dispute resolution, or administrative purposes.

7. User Choices and Rights

Users may review and update certain account and profile information through the platform.

Users may request support regarding account information, privacy concerns, or data-related questions through AIVORA's support channels.

Some requests may be limited where information must be retained for wallet records, payment records, dispute history, fraud prevention, legal compliance, security, or platform integrity.

8. Cookies, Tokens, and Local Storage

AIVORA may use cookies, browser storage, authentication tokens, refresh tokens, or similar technologies to keep users signed in, remember preferences, support authentication, improve performance, and maintain platform functionality.

Users may control cookies through browser settings, but disabling cookies, browser storage, or token storage may affect login, authentication, security, and other platform features.

9. Third-Party Links and Services

AIVORA may contain links to third-party websites, portfolios, payment providers, external files, or other resources.

AIVORA is not responsible for the privacy practices, content, or security of third-party websites or services. Users should review the privacy policies of those third-party services before using them.

10. Children's Privacy

AIVORA is not intended for users who are not legally permitted to create an account or use online services in their jurisdiction.

Users must meet the required age and legal capacity requirements to use the platform.

11. International Use

Users may access AIVORA from different locations. Information may be processed, stored, or transferred in locations where AIVORA, its infrastructure, or its service providers operate.

By using the platform, you understand that your information may be processed according to this Privacy Policy and applicable law.

12. Changes to This Privacy Policy

AIVORA may update this Privacy Policy from time to time. When changes are made, the updated version may be posted on the platform with a new "Last updated" date.

Continued use of AIVORA after the Privacy Policy is updated means that you accept the updated policy.

13. Contact

If you have questions about this Privacy Policy or how AIVORA handles user information, please contact the AIVORA support team through the platform.`,
  },
};

export const PolicyDialog = ({
  type,
  children,
}: {
  type: PolicyType;
  children: React.ReactNode;
}) => {
  const policy = POLICY_TEXT[type];

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-slate-950/35 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[71] flex max-h-[86vh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95">
          <div className="border-b border-slate-100 px-6 py-5">
            <Dialog.Title className="text-2xl font-black tracking-tight text-slate-950">
              {policy.title}
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm font-medium text-slate-500">
              Please review this policy before creating your AIVORA account.
            </Dialog.Description>
          </div>

          <div className="overflow-y-auto px-6 py-5">
            <div className="whitespace-pre-wrap text-sm font-medium leading-7 text-slate-600">
              {policy.text}
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-100 bg-white px-6 py-4">
            <Dialog.Close asChild>
              <Button type="button" className="rounded-full px-8 font-bold">
                Close
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
