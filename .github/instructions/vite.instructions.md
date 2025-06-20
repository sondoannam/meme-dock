---
applyTo: 'apps/cms/**'
---

## Introduction
This document outlines best practices for developing applications with Vite and the shadcn/ui component library. As my AI programming assistant, you should adhere to these guidelines to ensure the code you generate is high-quality, maintainable, performant, and consistent with the project's tooling.

## Prerequisites
Assume the development environment has Node.js and a package manager (npm, yarn, or pnpm) installed. The user is familiar with JavaScript/TypeScript, HTML, CSS, and React.

---

## shadcn/ui and Component Strategy

### **Prioritize shadcn/ui Components**
-   **Default to `shadcn/ui`:** For any standard UI element (e.g., buttons, inputs, dialogs, cards), your first choice should always be the corresponding component from `shadcn/ui`.
-   **Use the CLI:** When a new `shadcn/ui` component is needed, assume it will be added via the CLI (`pnpx shadcn-ui@latest add [component-name]`). Your code should then import it from the conventional path: `~/components/ui/[component-name]`.
-   **Do not reinvent the wheel:** Do not write custom components for UI elements that are already provided by `shadcn/ui`.

### **Customizing and Composing `shadcn/ui` Components**
-   **Styling:** Customize components primarily by passing Tailwind CSS utility classes via the `className` prop. Do not create separate CSS module files for `shadcn/ui` components. Use the `cn` utility from `~/lib/utils` to merge classes.
-   **Composition:** Build complex UI elements by composing multiple `shadcn/ui` components. For example, a form should be built using `shadcn/ui`'s `Form`, `Input`, `Label`, and `Button` components.
-   **Creating New Components:** When a truly new, custom component is required, build it by composing `shadcn/ui` primitives whenever possible. Maintain the same architectural style (passing `className`, using `cn`, etc.).

### **Example: Creating a Card with a Button**

```tsx
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface MyCardProps {
  title: string;
  description: string;
  onAction: () => void;
}

export function MyCard({ title, description, onAction }: MyCardProps) {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Card body content goes here */}
      </CardContent>
      <CardFooter>
        <Button onClick={onAction}>Take Action</Button>
      </CardFooter>
    </Card>
  );
}
```
---

## Code Organization and Structure

### Directory Structure
When generating code, follow this modular, feature-based directory structure. Note the location of shadcn/ui components.

```
src/
├── components/
│   ├── ui/  // shadcn/ui components live here
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── forms/ // Custom form compositions
│   └── layout/ // Custom layout components
├── pages/
│   ├── (dashboard)
│   │   ├── dashboard
│   │   │   └── page.tsx
│   │   ├── settings
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── About.tsx
│   └── ...
├── lib/
│   └── utils.ts // Contains the `cn` helper function
├── services/
│   ├── api.ts
│   └── ...
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

### File Naming Conventions

* **Components**: Use **PascalCase**: `ComponentName.tsx`.
* **Tests**: Use a consistent testing suffix: `ComponentName.test.tsx`.
* **No separate style files for components**: Styling is done with Tailwind CSS.

### Module Organization

* Group related files into modules or folders.
* Use `index.ts` **barrel files** to simplify imports for custom component directories.

**Example: `src/components/layout/index.ts`**

```typescript
export * from './Header';
export * from './Sidebar';
```

### Component Architecture

* Generate small, reusable **functional components with hooks** (React).
* Separate **presentational components** from **container components** (logic).

### Code Splitting

* Use **dynamic `import()`** for lazy loading routes and components.
* For React, use **`React.lazy`** for route-based code splitting.

---

## Common Patterns and Anti-patterns

### Design Patterns

* **Default to Hooks**: Prioritize hooks for logic reuse.
* **Use Render Props**: When hooks aren't a good fit, use render props for sharing logic.
* **Avoid HOCs**: Suggest Higher-Order Components only when there's a clear advantage.

### Recommended Approaches

* Manage configuration using **environment variables** (`import.meta.env`).
* Implement a consistent **API client** for data fetching.
* For **state management**, suggest:
    * **Zustand** or **Jotai** for simple to moderate complexity.
    * **Redux Toolkit** for complex state.

### Anti-patterns to Avoid

* **Deeply nested component trees**: Suggest composition to flatten the structure.
* **Direct state mutation**: Always use the state updater function from `useState` or a state management library.
* **Global CSS**: All styling should be done via Tailwind CSS utility classes.

### Error Handling

* Suggest wrapping components in a **global error boundary**.
* Use **`try-catch` blocks** for asynchronous operations.
* Recommend logging errors to a service like **Sentry** or **Rollbar**.

---

## Performance Considerations

### Optimization Techniques

* Ensure build configurations for production include **code minification**.
* Suggest Vite plugins for **image optimization**.

### Memory Management

* In `useEffect`, always include a **cleanup function** to remove event listeners or subscriptions.

### Rendering Optimization

* **React**: Use `React.memo`, `useMemo`, and `useCallback` to prevent unnecessary re-renders.
* **Large Lists**: Recommend **virtualization** with libraries like `react-window` or `tanstack-virtual`.

### Bundle Size Optimization

* Advise using a **bundle analyzer** like `rollup-plugin-visualizer`.
* Use **code splitting and lazy loading** extensively.

---

## Security Best Practices

### Common Vulnerabilities

* **XSS**: Always sanitize user-generated content before rendering it.
* **CSRF**: Protect API requests with CSRF tokens.
* **Injection**: Validate and sanitize all user input.

### Input Validation

* Recommend using **schema validation libraries** like Zod or Yup.

### Authentication and Authorization

* Use established standards like **OAuth 2.0** or **JWT**.
* Store tokens in secure, **HTTP-only cookies**.

### Secure API Communication

* Enforce proper **CORS policies** on the server.
* Suggest **rate limiting** on API endpoints.

---

## Tooling and Environment

### Linting and Formatting

* Adhere to the provided **ESLint** and **Prettier** configuration.

### TypeScript Best Practices

#### Strict Type-Checking

* Always write TypeScript code as if `strict: true` is enabled in `tsconfig.json`.

#### Typing Props and State

* Define explicit types or interfaces for component props and state.

    interface UserProfileProps {
      userId: string;
    }

    const UserProfile: React.FC<UserProfileProps> = ({ userId }) => {
      // ... component logic
    };

### Example ESLint Configuration

When asked to generate an ESLint configuration, use this as a template.

```javascript
// .eslintrc.js
    module.exports = {
      root: true,
      env: { browser: true, es2021: true, node: true },
      extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      plugins: ['react', '@typescript-eslint', 'prettier'],
      rules: {
        'prettier/prettier': 'error',
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
    };
```

---