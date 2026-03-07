# Demo Page Template

Use this template when creating a practical demonstration page (`demo/<topic-id>-demo.md`) for a topic note. Demo pages provide hands-on code walkthroughs and are hidden from the main sidebar navigation.

---

## Placement & Naming

- **Location**: `docs/<domain-path>/demo/<topic-id>-demo.md`
- **ID convention**: `<topic-id>-demo` — e.g., `thread-lifecycle-demo`
- **Link from topic note**: Add a callout block in the topic note's `## Code Examples` section or near the top, e.g.:

```markdown
:::tip Practical Demo
See the [Thread Lifecycle Demo](./demo/thread-lifecycle-demo.md) for step-by-step runnable examples.
:::
```

---

## Demo Folder Setup

Every `demo/` subfolder needs exactly these two files before adding any demo pages:

### `demo/_category_.json`

```json
{
  "className": "hidden"
}
```

This assigns the `hidden` CSS class to the sidebar category item. The CSS rule (in `src/css/custom.css`) hides it:

```css
/* Hide demo pages from sidebar navigation */
.menu__list .hidden > .menu__list-item-collapsible,
.menu__list .hidden {
  display: none;
}
```

> Add this CSS rule once to `src/css/custom.css` — it applies to all `demo/` folders across all domains automatically.

---

## Demo Page Template

```markdown
---
id: <topic-id>-demo
title: "<Topic Name> — Practical Demo"
description: Hands-on code examples and step-by-step walkthroughs for <Topic Name>.
sidebar_position: 1
pagination_next: null
pagination_prev: null
tags:
  - java
  - <difficulty>
  - demo
last_updated: YYYY-MM-DD
---


Note: demo pages are intended to be hidden from the main sidebar and typically should not show prev/next navigation. The `pagination_next: null` and `pagination_prev: null` frontmatter keys explicitly suppress Docusaurus' generated pagination bar for that doc. Keep these keys in the demo frontmatter to avoid navigation links that point into the visible sidebar order.
# <Topic Name> — Practical Demo

> Hands-on examples for [<Topic Name>](../<topic-id>.md). Start simple, build up to real-world usage.

:::info Prerequisites
Before running these examples, make sure you understand the [<Topic Name>](../<topic-id>.md) concepts — particularly [Foundational Concept](../../<domain>/<foundational-topic-id>.md).
:::

---

## Example 1: <Simple Scenario Title>

Brief explanation of what this example demonstrates (1–2 sentences).

```java title="<FileName>.java" showLineNumbers {<highlight-lines>}
// Example description
public class Example1 {
    public static void main(String[] args) {
        // Step 1: setup
        // Step 2: action  ← explain non-obvious lines here
        // Step 3: verify
    }
}
```

**Expected Output:**
```
<output here>
```

:::tip Key takeaway
What should the reader notice or remember from this example.
:::

---

## Example 2: <Intermediate Scenario Title>

Brief explanation (1–2 sentences).

```java title="<FileName>.java" showLineNumbers {<highlight-lines>}
// More complex example
```

**Expected Output:**
```
<output here>
```

---

## Example 3: <Real-World / Advanced Scenario Title>

Brief explanation (1–2 sentences). This example reflects production usage patterns.

```java title="<FileName>.java" showLineNumbers {<highlight-lines>}
// Production-realistic example
```

**Expected Output:**
```
<output here>
```

:::warning Common Mistake
What beginners often get wrong when implementing this in a real project.
:::

---

## Exercises

Try these on your own to solidify understanding:

1. **Easy**: Modify Example 1 to [change something minor].
2. **Medium**: Build on Example 2 to [add a meaningful variation].
3. **Hard**: Combine what you learned to [tackle a realistic problem].

---

## Back to Topic

Return to the [<Topic Name>](../<topic-id>.md) note for theory, interview questions, and further reading.
```

---

## Code Block Conventions for Demo Pages

### Line Highlighting

Use `{line-range}` after the language to highlight key lines:

````
```java title="ThreadExample.java" showLineNumbers {3,7-9}
public class ThreadExample {
    public static void main(String[] args) throws InterruptedException {
        Thread t = Thread.ofVirtual().start(() -> {  // ← highlighted: virtual thread creation
            System.out.println("Running: " + Thread.currentThread());
        });

        t.join(); // ← highlighted: wait for completion
        // execution continues only after thread finishes
        System.out.println("Done");
    }
}
```
````

### Output Blocks

Always add an output block immediately after each code block using a plain `text` fence:

````
**Expected Output:**
```
Running: VirtualThread[#21]/runnable@ForkJoinPool-1-worker-1
Done
```
````

### Line Numbers

Enable globally in `docusaurus.config.ts` under `themeConfig.prism`:
```js
themeConfig: {
  prism: {
    // ... other prism config
  },
}
```
And in `docusaurus.config.ts` set per block (or globally for demo pages):
```js
// In docusaurus.config.ts, enable showLineNumbers globally:
docs: {
  // No global setting — use showLineNumbers per code block
}
```
Use `showLineNumbers` in each demo code block individually to keep it opt-in for topic notes but standard in demos.

---

## What Belongs on a Demo Page vs. a Topic Note

| Content | Topic Note | Demo Page |
|---------|-----------|-----------|
| Concept explanation | ✅ | ❌ |
| Architecture diagrams | ✅ | ❌ |
| Interview Q&A | ✅ | ❌ |
| Short illustrative snippets | ✅ | ✅ |
| Full runnable programs | ❌ | ✅ |
| Step-by-step walkthroughs | ❌ | ✅ |
| Expected output blocks | ❌ | ✅ |
| Practice exercises | ❌ | ✅ |
| Multiple complexity levels | ❌ | ✅ |
