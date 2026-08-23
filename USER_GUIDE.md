# Operio — How to Use Each Feature

A practical guide to every feature in the app: what it's for, who can use it, and exactly how to use it.

---

## Getting Started

### Creating your account
- **First person at your company:** go to the site → tap **Sign up** → fill in your name, email, password, company name, business type, country/city, branch name, and working hours. This makes you the **Organization Owner** with full access.
- **Everyone else:** an owner or manager must generate an invite code for you first (see **Employees**, below). Go to `/join`, enter the code plus your name/email/password, and your account is created with whatever role the code was set to.

### Switching language
Tap the globe icon (🌐) in the top bar of most pages to switch between English and Arabic. The whole app — including layout direction — flips automatically.

### Dark mode
The app is dark by default and follows your device's theme automatically. There's no manual toggle.

---

## Bottom Navigation

Five buttons, always visible at the bottom of the screen (same on phone and desktop):

| Button | What it does |
|---|---|
| **Home** | Your dashboard — today's waste cost, task completion %, out-of-stock count, critical issues count. Tap a stat to jump to that section. |
| **Tasks** | Your assigned to-dos. |
| **Capture** (center, highlighted) | The fastest way to log anything that just happened — waste, damage, an issue, out-of-stock, a mistake, equipment problem, or a photo note. Designed to take under 30 seconds. |
| **Reports** | Rolled-up view of everything logged across the branch. |
| **More** | Everything else — organized into Work, Reports, How-To Instructions, and More. |

---

## Work Section
*(More → Work)*

### Checklists
- **To do a checklist:** tap **Checklists**, pick one (e.g. "Opening Checklist"), check off each item as you complete it, then submit.
- **To create a new checklist template** (managers/owners only): tap **New checklist**, give it a title and type (opening, closing, cleaning, food safety, equipment, manager, weekly, monthly), then list the steps — one per line.

### Breaks
- Tap **Break in/out** → **Start break** when you leave, **End break** when you're back. Managers can see who's currently on break in real time.

### Reminders
- **To add a reminder:** tap **Reminders** → type what needs doing (e.g. "Water the plants"), pick a category (Watering, Expiry dates, Deep clean, Chemical solution, Other), pick how often it repeats (One-time, Daily, Weekly, Monthly), and set the due date/time.
- **To complete one:** tap **Done** next to it. If it repeats, it automatically reschedules itself for the next due date. If it was one-time, it disappears from the list.
- Overdue reminders show with a red bell icon; upcoming ones show amber.

### Till Handover
- At the end of a shift, tap **Till Handover**, enter opening cash, expected cash, actual cash counted, card payments, cash payments, and refunds. The variance (actual vs. expected) is calculated automatically and flagged if it's unusually large — add a note explaining why in that case.

### Menu Experiments
- **To start a trial:** tap **Menu Experiments → New experiment**, name the product, add recipe notes and cost per unit, list ingredients.
- **To log results:** update prepared/sold/waste counts as the trial runs, and move its status forward: Testing → Needs changes → Approved/Rejected → Launched.
- Anyone can leave feedback on an experiment in its comment thread.

### Manual Purchases
- Tap **Manual Purchases**, enter the item, supplier (optional), amount, and why it was needed. A manager can then **Approve** it from the same list.

### Business Trips
- Tap **Business Trips**, enter destination, purpose, and distance in km — compensation is tracked against distance.

### Overtime
- Tap **Overtime**, enter hours worked and the reason. A manager reviews it and taps **Approve** or **Reject**.

---

## Reports Section
*(More → Reports)*

### Walk & Report
- Tap **Walk & Report → Start a walk**, choose a type (Opening, Closing, Food Safety, Cleaning, Equipment, Store Readiness, or Custom). At each stop, log the issue, a note, the action taken, and optionally attach a photo. Tap **Add stop** to keep going, then **Finish walk** to auto-generate the report.

### Incidents
- Tap **Incidents**, choose a category (Issue, Mistake, Equipment problem, Photo note), describe what happened, set a severity (Low/Medium/High), and attach a photo if useful. This is framed around learning and prevention — not blame.

### Out of Stock
- Log through **Capture** or the **Out of Stock** page directly. Once restocked, tap **Resolve** to clear it from the active list.

### Waste / Damage
- Logged through **Capture** — pick "Report Waste" or "Report Damage", describe it, set severity, attach a photo. Cost is tracked so managers can see total waste cost on the dashboard.

### Critical Issues
- These are simply your **high-severity Incidents** — tap **Critical Issues** in the menu to jump straight to the Incidents list filtered to what matters most.

### Inventory Count
- Tap **Inventory Count**, enter the item name, quantity, and unit (pcs, kg, L, etc.), plus an optional note. Entries are timestamped and listed newest-first; tap the trash icon to remove a miscount.

---

## How-To Instructions Section
*(More → How-To Instructions)*

Three categories: **Cleaning**, **Maintenance**, **Preparation**.

- **To find a guide:** tap the category, then tap a guide's title to expand and read the full step-by-step instructions.
- **To add a guide** (owners/managers/supervisors only): open a category → fill in a title and the instructions → tap **Add guide**. Guides are specific to your organization — write them for your own equipment and recipes (e.g. "Espresso Machine Cleaning," "V60 Hoffmann Method").
- **To remove a guide** (owners/managers/supervisors only): expand it and tap **Delete**.

---

## Stars Board
*(More → Stars Board — visible to everyone, awarding is management-only)*

- **Everyone** can see who's currently Star of the Week / Star of the Month and read why they were picked.
- **Managers/supervisors** additionally see a **KPI Suggestion** box at the top: the system automatically scores every employee (0–100) over the past 7 days using task completion, checklist completion, reports filed, and till accuracy — and shows who's currently leading, with the breakdown.
- **To award a star:** pick an employee from the dropdown, choose Week or Month, optionally explain why, and tap **Award star**. The suggestion is just that — a suggestion; you always make the final call.

---

## Other Features

### Search
Tap the search icon (top of Home) to search across tasks, waste reports, incidents, employees, and branches at once.

### Employees *(owners/managers)*
- **To invite someone:** tap **Employees → Generate invite code**, choose their role, and share the resulting code with them. They redeem it at `/join`.

### Branches *(owners/operations managers)*
Add and manage multiple branch locations if your organization has more than one.

### KPIs *(owners/operations managers)*
A branch-by-branch scoreboard: waste cost, waste report count, incident count, and task compliance %, so you can compare performance across locations.

### Subscription
Shows your current plan, trial countdown (if applicable), and how many branches/users you're using against your plan's limits.

### Settings *(organization owner only)*
Change the organization's default language and currency.

### Profile
Edit your name, bio, and profile photo (automatically compressed before upload).

### Platform Admin *(SaaS operator only — not a customer-facing role)*
A separate, cross-organization dashboard showing totals across every company on the platform: organizations, users, branches, and subscription status. This role is granted manually and isn't something a normal customer account can reach.

---

## Quick Reference — Who Can Do What

| Feature | Employee | Supervisor | Branch Manager | Operations Manager | Organization Owner |
|---|:---:|:---:|:---:|:---:|:---:|
| Tasks, Capture, Checklists (fill), Breaks, Reminders | ✅ | ✅ | ✅ | ✅ | ✅ |
| Till, Purchases, Trips, Overtime (submit) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve purchases/overtime | | ✅ | ✅ | ✅ | ✅ |
| Award Stars | | ✅ | ✅ | ✅ | ✅ |
| Create Checklist templates | | | ✅ | ✅ | ✅ |
| Add/edit How-To guides | | ✅ | ✅ | ✅ | ✅ |
| Generate invite codes | | | ✅ | ✅ | ✅ |
| Manage Branches, view KPIs | | | | ✅ | ✅ |
| Change org Settings | | | | | ✅ |
