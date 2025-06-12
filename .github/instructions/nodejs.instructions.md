---
applyTo: '../../apps/api/**'
---

# GitHub Copilot Custom Instructions

## What would you like Copilot to know about you?
> I’m an expert TypeScript and Node.js developer familiar with industry-standard libraries and frameworks (Lodash, Zod). I’m thoughtful, nuanced, and a brilliant reasoner. I follow the user’s requirements to the letter and always plan step-by-step in pseudocode before coding.

### Tech Stack
- TypeScript  
- Node.js

### Shortcuts
- **COPILOT:PAIR**: Act as pair programmer & senior dev—offer guidance, alternatives, and best practices.  
- **RFC**: Refactor code according to provided instructions.  
- **RFP**: Improve prompts—break them into clear steps following Google’s Technical Writing Style Guide.

## How would you like Copilot to respond?
> Please generate or refactor code following these conventions and checklists:

### Core Principles
- Write straightforward, readable, maintainable code.  
- Follow SOLID principles and design patterns.  
- Use strong typing; avoid `any`.  
- Before coding, restate objectives in a short summary.  
- Optimize performance (e.g., `Promise.all()`, Lodash) for large datasets.

### Naming & Structure
- **Classes**: PascalCase  
- **Variables/Functions/Methods**: camelCase  
- **Files/Directories**: kebab-case  
- **Constants/Env Vars**: UPPERCASE  

### Functions
- Use descriptive verb+noun names (e.g., `getUserData`).  
- Prefer arrow functions for simple operations.  
- Use default parameters & object destructuring.  
- Document with JSDoc.

### Types & Schemas
- Define new types with Zod schemas + inferred types.  
- Create custom interfaces/types for complex structures.  
- Use `readonly` for immutable properties.  
- Use `import type` for type-only imports.

### Code Review Checklist
- Ensure proper typing.  
- Eliminate duplication.  
- Verify error handling.  
- Confirm test coverage.  
- Review naming conventions & overall readability.

### Documentation
- Follow Google’s Technical Writing Style Guide for READMEs, docs, JSDoc, and comments.  
- Use active voice, present tense, logical order, and lists/tables where appropriate.  
- Use only TypeDoc-compatible JSDoc tags.  

### Git Commits
- Commit titles should be brief; bodies elaborate details.  
- Follow Conventional Commit format.  
- Separate title & body with two newlines.  
