Create a complete production-level `FRONTEND.md` documentation file for my application.

The document must serve as the main frontend UI/UX development guide for designers and developers. It should clearly define all pages, layouts, components, colors, typography, spacing, responsive behavior, interaction rules, accessibility standards, and implementation guidelines.

## Project Context

Project Name: `[Enter project name]`

Project Type: `[CRM / Admin Dashboard / SaaS / Loan Management System / Salon Management System / E-commerce / Other]`

Frontend Stack:

* Next.js
* React
* TypeScript
* Tailwind CSS
* Shadcn UI or reusable custom components
* Lucide React icons
* React Hook Form
* Zod validation
* TanStack Table
* Recharts, when charts are required

The design should feel modern, professional, clean, consistent, responsive, accessible, and suitable for a production-level application.

# Required `FRONTEND.md` Structure

## 1. Document Overview

Explain:

* Purpose of the frontend documentation
* Target users of the document
* Design goals
* Product design principles
* Frontend development standards
* How developers should use this document

Define the main UI principles:

* Clarity
* Consistency
* Accessibility
* Responsiveness
* Reusability
* Performance
* Minimal visual clutter
* Clear user feedback
* Predictable navigation

## 2. Application Page Inventory

Create a complete list of all frontend pages grouped by module.

Use this structure for every page:

* Page name
* Route
* Purpose
* User roles
* Main sections
* Main components
* Primary actions
* Secondary actions
* Empty state
* Loading state
* Error state
* Responsive behavior

Include common page groups such as:

### Authentication

* Login
* OTP Verification
* Forgot Password
* Reset Password
* Create Password
* Two-Factor Authentication
* Session Expired
* Unauthorized Access

### Dashboard

* Main Dashboard
* Role-Based Dashboard
* Analytics Dashboard
* Activity Dashboard

### User Management

* User List
* Add User
* Edit User
* User Details
* User Permissions
* User Activity
* User Sessions

### Customer Management

* Customer List
* Add Customer
* Edit Customer
* Customer Details
* Customer Documents
* Customer Transactions
* Customer Activity History

### Main Business Modules

Add all project-specific pages, including:

* List pages
* Create pages
* Edit pages
* Detail pages
* Approval pages
* Status-based pages
* Calendar pages
* Reports
* Analytics
* Notifications
* Settings
* Profile
* Security
* Help and support
* Audit logs
* Error pages

Also include:

* 403 page
* 404 page
* 500 page
* Maintenance page
* No internet page

## 3. Information Architecture

Document:

* Main navigation hierarchy
* Parent and child menu structure
* Page grouping
* Breadcrumb behavior
* Back-navigation behavior
* Default landing pages
* Role-based navigation
* Permission-based page visibility
* Mobile navigation structure
* Deep-link behavior

## 4. Application Layout

Define the full application shell.

### Desktop Layout

Include:

* Sidebar width
* Collapsed sidebar width
* Header height
* Content maximum width
* Main content padding
* Page background
* Content scrolling behavior
* Sticky header behavior
* Sticky sidebar behavior
* Footer behavior

Recommended starting dimensions:

* Expanded sidebar: `260px`
* Collapsed sidebar: `72px`
* Desktop header: `64px`
* Tablet header: `60px`
* Mobile header: `56px`
* Desktop page padding: `24px–32px`
* Tablet page padding: `20px–24px`
* Mobile page padding: `16px`
* Maximum content width: `1440px`

Explain how these values should be adjusted when required.

### Mobile Layout

Define:

* Mobile header
* Hamburger menu
* Drawer navigation
* Bottom navigation, when applicable
* Mobile action buttons
* Sticky bottom action area
* Mobile filter drawer
* Responsive table alternatives

## 5. Sidebar Design System

Document the sidebar completely.

Include:

* Expanded state
* Collapsed state
* Mobile drawer state
* Logo placement
* Workspace or branch selector
* Menu group headings
* Main navigation items
* Submenu behavior
* Active menu state
* Hover state
* Focus state
* Disabled state
* Badge design
* Notification count
* Icons
* Tooltip behavior
* Sidebar footer
* Profile menu
* Logout action

Recommended dimensions:

* Expanded width: `260px`
* Collapsed width: `72px`
* Menu item height: `44px`
* Horizontal padding: `12px`
* Icon size: `20px`
* Icon and text gap: `12px`
* Border radius: `8px`
* Group spacing: `20px`
* Submenu left indentation: `32px`

Define how long menu names, nested menus, scrolling, and permission-based items should behave.

## 6. Header and Top Navigation

Document:

* Page title
* Breadcrumb
* Global search
* Command palette
* Branch or organization selector
* Quick-create button
* Notifications
* Theme switcher
* Language selector
* User avatar
* Profile menu
* Help menu
* Mobile header

Define dimensions, spacing, states, dropdown behavior, and responsive visibility.

## 7. Color Design System

Create a complete semantic color system with HEX codes and usage rules.

Include both light and dark themes.

Define:

### Brand Colors

* Primary
* Primary hover
* Primary active
* Primary light
* Secondary
* Accent

### Surface Colors

* App background
* Sidebar background
* Header background
* Card background
* Elevated surface
* Input background
* Muted background

### Text Colors

* Primary text
* Secondary text
* Muted text
* Disabled text
* Inverse text
* Link text

### Border Colors

* Default border
* Strong border
* Input border
* Divider
* Focus border

### Status Colors

* Success
* Warning
* Error
* Information
* Pending
* Approved
* Rejected
* Draft
* Inactive

For every color, provide:

* Color name
* HEX code
* CSS variable
* Tailwind token
* Usage
* Light-theme value
* Dark-theme value
* Contrast guidance

Use semantic tokens such as:

```css
--background
--foreground
--card
--card-foreground
--primary
--primary-foreground
--secondary
--secondary-foreground
--muted
--muted-foreground
--accent
--accent-foreground
--border
--input
--ring
--success
--warning
--destructive
--info
```

Do not rely only on raw colors. Explain that components must use semantic design tokens.

## 8. Typography System

Define:

* Primary UI font
* Heading font, when different
* Font fallbacks
* Font weights
* Line heights
* Letter spacing
* Text colors
* Number formatting
* Currency formatting

Create a typography scale for:

* Display
* H1
* H2
* H3
* H4
* Page title
* Section title
* Card title
* Body large
* Body regular
* Body small
* Label
* Caption
* Helper text
* Button text
* Table text
* Badge text

For every style, provide:

* Font size
* Font weight
* Line height
* Letter spacing
* Desktop behavior
* Mobile behavior
* Typical usage

Recommended starting sizes:

* Display: `40px`
* H1: `32px`
* H2: `28px`
* H3: `24px`
* H4: `20px`
* Page title: `24px`
* Section title: `18px`
* Body: `14px–16px`
* Label: `14px`
* Caption: `12px`

## 9. Spacing System

Use a consistent spacing scale based on multiples of four.

Document:

* `4px`
* `8px`
* `12px`
* `16px`
* `20px`
* `24px`
* `32px`
* `40px`
* `48px`
* `64px`

Explain spacing rules for:

* Page sections
* Cards
* Forms
* Tables
* Modal content
* Buttons
* Sidebar
* Headers
* Empty states
* Mobile layouts

## 10. Grid and Responsive Breakpoints

Define:

* Mobile
* Large mobile
* Tablet
* Small desktop
* Desktop
* Large desktop

Suggested breakpoints:

* `sm: 640px`
* `md: 768px`
* `lg: 1024px`
* `xl: 1280px`
* `2xl: 1536px`

Document:

* Column count
* Gutter width
* Page margins
* Card stacking
* Form column behavior
* Sidebar behavior
* Table behavior
* Chart behavior
* Modal behavior
* Button behavior

## 11. Button Design System

Define all button variants:

* Primary
* Secondary
* Outline
* Ghost
* Destructive
* Success
* Link
* Icon-only
* Split button
* Loading button
* Floating action button

Define sizes:

* Extra small
* Small
* Medium
* Large
* Icon button

For every button, specify:

* Height
* Padding
* Font size
* Font weight
* Border radius
* Icon size
* Icon gap
* Minimum width
* Hover state
* Active state
* Focus state
* Disabled state
* Loading state

Recommended sizes:

* Small: `32px`
* Medium: `40px`
* Large: `48px`
* Icon small: `32px × 32px`
* Icon medium: `40px × 40px`
* Icon large: `48px × 48px`

Include rules for:

* Button priority
* Maximum number of primary buttons per section
* Full-width mobile buttons
* Destructive action confirmation
* Button labels
* Icon placement

## 12. Form Design System

Document:

* Text input
* Number input
* Currency input
* Email input
* Phone input
* Password input
* Search input
* Select
* Multi-select
* Combobox
* Autocomplete
* Date picker
* Date-range picker
* Time picker
* File upload
* Image upload
* Checkbox
* Radio group
* Toggle
* Textarea
* OTP input
* Rich text editor
* Slider

For each field, define:

* Height
* Label placement
* Placeholder style
* Prefix and suffix
* Icons
* Required indicator
* Helper text
* Error message
* Success state
* Disabled state
* Read-only state
* Focus state
* Character counter

Recommended dimensions:

* Standard input height: `40px`
* Large input height: `48px`
* Textarea minimum height: `96px`
* Label gap: `6px`
* Field gap: `16px`
* Section gap: `24px`

Also explain:

* Validation timing
* Inline error handling
* Server-side error handling
* Form submission
* Unsaved-change warning
* Multi-step forms
* Save draft
* Previous, Next, Preview, and Submit actions

## 13. Card Design System

Define:

* Standard card
* KPI card
* Summary card
* Profile card
* Action card
* Chart card
* List card
* Warning card
* Interactive card
* Collapsible card

Specify:

* Padding
* Border
* Shadow
* Radius
* Header
* Body
* Footer
* Hover behavior
* Selected state
* Loading state
* Mobile behavior

## 14. Table Design System

Create a production-level table standard.

Include:

* Table header
* Rows
* Columns
* Sorting
* Search
* Filtering
* Pagination
* Column visibility
* Row selection
* Bulk actions
* Sticky header
* Sticky columns
* Expandable rows
* Inline editing
* Status badges
* Action menu
* Empty state
* Loading skeleton
* Error state
* Export
* Print
* Mobile behavior

Define:

* Header height
* Row height
* Cell padding
* Text size
* Numeric alignment
* Date formatting
* Currency formatting
* Action-column width
* Maximum visible columns

Recommended dimensions:

* Header height: `44px`
* Compact row: `44px`
* Default row: `52px`
* Comfortable row: `60px`
* Cell horizontal padding: `16px`

On mobile, define when to:

* Use horizontal scrolling
* Hide secondary columns
* Convert rows into cards
* Open details in a drawer
* Use a responsive column selector

## 15. Search, Filter, and Sorting Standards

Document:

* Global search
* Page search
* Search debounce
* Filter bar
* Advanced filter drawer
* Filter chips
* Applied filter count
* Clear filters
* Saved filters
* Default sorting
* Multi-column sorting
* Date filters
* Status filters
* User or branch filters

## 16. Tabs, Accordions, and Navigation Controls

Define:

* Horizontal tabs
* Vertical tabs
* Segmented controls
* Accordions
* Stepper
* Pagination
* Breadcrumb
* Back button

Specify dimensions, active states, overflow behavior, accessibility, and mobile handling.

## 17. Modal, Dialog, Drawer, and Popover System

Define:

* Confirmation modal
* Form modal
* Information modal
* Full-screen modal
* Side drawer
* Bottom sheet
* Popover
* Tooltip
* Dropdown menu
* Command menu

Specify:

* Widths
* Maximum height
* Padding
* Header
* Footer
* Backdrop
* Close behavior
* Escape-key behavior
* Outside-click behavior
* Focus trap
* Destructive confirmation
* Mobile transformation rules

Recommended modal widths:

* Small: `400px`
* Medium: `560px`
* Large: `720px`
* Extra large: `960px`

## 18. Status and Feedback Components

Document:

* Toast
* Alert
* Banner
* Inline validation
* Progress bar
* Spinner
* Skeleton
* Badge
* Status dot
* Empty state
* Success state
* Error state
* Offline state
* Saving indicator
* Auto-save status

Define placement, duration, color usage, icons, and action behavior.

## 19. Badge and Status System

Create a standardized status mapping.

For every status, include:

* Label
* Text color
* Background color
* Border color
* Icon or status dot
* Usage

Include examples such as:

* New
* Draft
* Pending
* In Review
* Approved
* Active
* Completed
* Overdue
* Rejected
* Failed
* Cancelled
* Inactive

Do not use color alone to communicate status.

## 20. Dashboard Design Guidelines

Document:

* Page header
* Date filters
* Branch filters
* KPI cards
* Trend indicators
* Quick actions
* Recent activity
* Pending tasks
* Data tables
* Charts
* Alerts
* Performance summary

Explain when to use:

* Bar charts
* Line charts
* Area charts
* Donut charts
* Progress bars
* Tables instead of charts

Avoid excessive graphs. Prioritize useful business information and actionable data.

## 21. Charts and Data Visualization

Define:

* Chart colors
* Grid lines
* Axis labels
* Tooltips
* Legends
* Empty states
* Loading states
* Number formatting
* Responsive heights
* Accessibility
* Data-density limits
* Comparison charts
* Trend indicators

Include rules for dark mode and color-blind accessibility.

## 22. Icons and Illustrations

Document:

* Main icon library
* Default icon sizes
* Stroke width
* Button icons
* Navigation icons
* Status icons
* Empty-state illustrations
* Decorative illustrations

Recommended sizes:

* `16px` for compact actions
* `18px` for form controls
* `20px` for navigation
* `24px` for prominent actions
* `32px+` for empty states

Do not mix unrelated icon styles.

## 23. Image and Media Guidelines

Define:

* Avatar sizes
* Profile images
* Thumbnails
* Banners
* Document previews
* Image aspect ratios
* Object-fit behavior
* Fallback images
* Lazy loading
* Compression
* Accepted upload formats
* Upload-size limits

## 24. Empty, Loading, and Error States

For every page and major component, define:

### Empty State

* Illustration or icon
* Title
* Description
* Primary action
* Secondary action

### Loading State

* Skeleton layout
* Spinner usage
* Progressive loading
* Disabled actions
* Preventing layout shift

### Error State

* Clear error message
* Retry action
* Support option
* Error code, when useful
* Preservation of user-entered data

## 25. Interaction and Animation Guidelines

Define:

* Hover transitions
* Page transitions
* Dropdown animation
* Modal animation
* Drawer animation
* Accordion animation
* Loading animation
* Button feedback
* Drag-and-drop feedback

Recommended durations:

* Micro-interaction: `120–180ms`
* Standard transition: `200–250ms`
* Modal or drawer: `250–300ms`

Use animations carefully and support reduced-motion preferences.

## 26. Accessibility Standards

The application should target WCAG 2.1 AA or newer applicable standards.

Document:

* Keyboard navigation
* Visible focus indicators
* Semantic HTML
* ARIA labels
* Form labels
* Error announcements
* Color contrast
* Screen-reader support
* Table accessibility
* Modal focus management
* Skip navigation
* Reduced motion
* Touch-target sizes

Minimum touch target: `44px × 44px`.

## 27. Theme System

Document:

* Light mode
* Dark mode
* System mode
* Theme persistence
* Theme switcher
* Semantic tokens
* Chart themes
* Image handling
* Logo variants
* Shadow behavior
* Border behavior

Provide sample CSS variables for both themes.

## 28. Role and Permission-Based UI

Explain:

* Hiding unauthorized menu items
* Protecting routes
* Disabling restricted actions
* Read-only states
* Approval permissions
* Branch-based access
* Role-specific dashboards
* Permission fallback screens

Frontend permission checks must not replace backend authorization.

## 29. Page-Level Documentation Template

Create a reusable template for documenting every page:

```md
## Page Name

- Route:
- Module:
- User Roles:
- Purpose:
- Page Layout:
- Header Actions:
- Main Components:
- Filters:
- Table Columns:
- Form Fields:
- Validation:
- Primary Actions:
- Secondary Actions:
- Empty State:
- Loading State:
- Error State:
- Permissions:
- Desktop Behavior:
- Tablet Behavior:
- Mobile Behavior:
- API Requirements:
- Notes:
```

Use this template to document all important pages in the application.

## 30. Component Inventory

Create a complete reusable component list grouped into:

* Layout components
* Navigation components
* Form components
* Data-display components
* Feedback components
* Overlay components
* Business-specific components
* Utility components

For every component, mention:

* Name
* Purpose
* Props
* Variants
* Sizes
* States
* Accessibility
* Responsive behavior
* Reuse locations

## 31. Recommended Frontend Folder Structure

Provide a scalable feature-based Next.js structure such as:

```text
src/
├── app/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   ├── tables/
│   ├── feedback/
│   └── shared/
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── users/
│   ├── customers/
│   └── settings/
├── hooks/
├── lib/
├── services/
├── stores/
├── types/
├── constants/
├── config/
├── styles/
└── utils/
```

Explain what should be stored in every folder.

## 32. Naming Conventions

Define standards for:

* Files
* Folders
* React components
* Hooks
* Utility functions
* API functions
* Types
* Interfaces
* Constants
* CSS variables
* Routes
* Query keys
* Form schemas

## 33. State Management Guidelines

Explain how to manage:

* Local state
* Global state
* Server state
* Form state
* URL state
* Filter state
* Authentication state
* Theme state
* Modal state

Recommend suitable tools and when each should be used.

## 34. API Integration Standards

Document:

* API service structure
* Request handling
* Response typing
* Authentication tokens
* Refresh tokens
* Loading states
* Error handling
* Retry strategy
* Cancellation
* Pagination
* File upload
* File download
* Optimistic updates
* Cache invalidation

## 35. Performance Guidelines

Include:

* Code splitting
* Dynamic imports
* Lazy loading
* Image optimization
* Font optimization
* Memoization
* Virtualized tables
* Pagination
* Debounced search
* Bundle-size monitoring
* Avoiding unnecessary re-renders
* Core Web Vitals
* Skeleton loading
* Route prefetching

## 36. Security Guidelines

Document frontend security rules:

* Never store sensitive data unnecessarily
* Secure token handling
* Input sanitization
* XSS prevention
* CSRF considerations
* Safe external links
* File-upload validation
* Permission checks
* Masking sensitive information
* Auto logout
* Session expiry
* Secure error messages

## 37. Testing Standards

Include:

* Unit testing
* Component testing
* Integration testing
* End-to-end testing
* Accessibility testing
* Responsive testing
* Cross-browser testing
* Visual regression testing
* Form-validation testing
* Permission testing
* Loading and failure-state testing

## 38. Browser and Device Support

Define support for:

* Chrome
* Edge
* Firefox
* Safari
* Android browsers
* iOS Safari

Include minimum screen widths and testing devices.

## 39. Content and Microcopy Guidelines

Document:

* Button-label rules
* Form labels
* Placeholder usage
* Confirmation messages
* Error messages
* Success messages
* Empty-state text
* Date format
* Time format
* Currency format
* Number format
* Capitalization
* Terminology consistency

Use clear action-based labels such as:

* `Add Customer`
* `Save Changes`
* `Submit for Approval`
* `Download Report`

Avoid vague labels such as:

* `Click Here`
* `Proceed`
* `Do It`

## 40. Final Frontend Checklist

Create a detailed checklist covering:

* All pages documented
* Responsive behavior completed
* Dark mode checked
* Accessibility checked
* Permissions checked
* Loading states added
* Empty states added
* Error states added
* Form validation completed
* Mobile navigation completed
* Tables tested
* Browser testing completed
* Performance reviewed
* Security reviewed
* No hard-coded colors
* No duplicated components
* No missing routes
* No broken links
* No placeholder content
* API errors handled
* Final design consistency review completed

# Output Requirements

Generate the complete content of the `FRONTEND.md` file.

The output must:

* Be written in professional Markdown
* Use clear headings and subheadings
* Include tables where useful
* Include real values instead of vague suggestions
* Include practical component dimensions
* Include light and dark theme color tokens
* Include desktop, tablet, and mobile behavior
* Cover all important application pages
* Avoid unnecessary repetition
* Be detailed enough for developers to implement the frontend without guessing
* Keep design decisions consistent throughout the document
* Clearly mark any project-specific information that must be replaced
* Include examples for buttons, forms, tables, modals, status badges, and layouts
* End with a production-readiness checklist

Do not create only an outline. Generate a complete, implementation-ready `FRONTEND.md` document.
