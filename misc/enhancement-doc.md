I want enhance my existing customization for github copilot with new or modified as mentioned below. Kindly assist me in implementing the following enhancements for my GitHub Copilot customization:
check all the guidelines and change in related files in .github folder. figure out which files need to be modified or created based on the enhancements mentioned below and make the necessary changes to implement these features effectively.

## 1. Skill Reference (in Docusaurus-ops maybe I'm unsure) to generate index.md for each domain folder (new feature)
I need your help with the following content:

- Create a skill reference that provides the right **topics and subtopics** for each domain folder in my Docusaurus project to start writing notes for that domain.
- Base suggestions on:
    - my experience level (Java/Spring Boot developer returning after a gap)
    - the project expectations and note structure
- Use the output as a **ready-list to generate notes** and build each domain `index.md`.
- Keep the order in a clear **learning flow**: **foundational → intermediate → advanced**.
- For every item, provide:
    - **Topic Name**
    - one-line **topic summary** (on the next line)
    - **Subtopics** with one-line summaries
- Keep it concise but complete, so I can directly use it for planning and writing notes.
- The topics should be listed in a logical order that builds upon each other, starting with foundational concepts and progressing to more advanced topics.
- Update the Docusaurus Ops Skill.md file to reflect the new reference structure and content (modification)

refer https://dev.java/learn/ and spring docs how they create index page

- Also include creating index file for whole domain and then for each topic and subtopic as well.

Use this output format:

```markdown
# **Topic Name**:
One-line summary.

- **Subtopic Name**:
One-line summary.

- **Subtopic Name**:
One-line summary.
```

## 2. I want something like this:

Let's say, I have 2 topics, thread and multithreading 
- I directly opened multithreading, now I don't know what is even thread means so I need to link `thread` word in multi-threading explanation back to the thread topic so that I can easily navigate and understand the foundational concept before diving into the more complex topic. Link only the most relevant foundational topic to the advanced topic.

## 3. I want a new page for pratical demonstration of the topic, code snippets and examples (new feature)

- create a page for each topics and save it in a `demo` folder within the respective domain folder.
- Link the demo page in topic files where relevant to provide easy access to practical demonstrations and examples.
- Ensure that each demo page is well-structured, with clear explanations and code snippets that illustrate the concepts discussed in the topic. Start with simple examples and gradually increase complexity to cater to different learning levels.
- Update the Docusaurus Ops Skill.md file to include links to the new demo pages and ensure that the structure reflects the addition of practical demonstration content (modification).
- make demo pages hidden from main sidebar navigation and also no pagination connection but accessible through links in the topic files using the technique as mentioned below:
    - In demo page front matter, set `pagination_next` and `pagination_prev` to `null`.
    - In the topic files, link to the demo pages using relative paths, ensuring that the links are clear and easy to follow for users looking for practical examples.
    - create a `_category_.json` file in the `demo` folder add 
    ```json
    {
        "className": "hidden"
    }
    ```
    - add CSS to hide the demo category from the sidebar navigation:
    ```css
    .menu__list .hidden {
        display: none;  
    }
    ```
- Ensure that demo pages clearly explains detailed the practical application of the topic, with step-by-step instructions and code snippets that are easy to understand and follow. 

### 3.1 some things related to code blocks in demo pages:
- Ensure that code blocks in the demo pages are properly formatted and syntax-highlighted for better readability.
- Include comments in the code snippets to explain key parts of the code and enhance understanding for users who may be new to the topic.
- add title as filename if needed and lines to be highlighted in the code blocks to draw attention to important sections of the code. for example, use the following syntax for code blocks: {2,5-7} to highlight lines 2 and 5 to 7 in the code snippet.
    ```java title="Example.java" {2,5-7}
    // Java code snippet here

    ```
- add configuration to make line numbers visible. check Docusaurus documentation for the correct configuration to enable line numbers in code blocks.
- add a output section attached to the code blocks. if it is not possible to add an output section directly in the code block, create a separate section below the code block to display the expected output of the code snippet.

## 4. I want you to follow the template for creating sections in notes but if possible have a flexibility to modify the template as per the topic requirement (modification)

for eg, 
- for some topics, I may want to include a "Best Practices" section, while for others, I may want to include a "Common Pitfalls" section. The template should be flexible enough to accommodate these variations while maintaining a consistent structure across all notes.
- Also, like for some topics, I may want to include a "Use Cases" section to illustrate real-world applications of the topic, while for others, this section may not be necessary. The template should allow for the inclusion or exclusion of such sections based on the specific needs of each topic.
- then also for some topics, instead of writing "what it is" section you can try the topic or concept name as the section name itself like "Thread" instead of "What is Thread?" and then in the content explain what thread is. This will make the notes more concise and to the point, while still providing all the necessary information about the topic.


## summary

In summary, I want to enhance my GitHub Copilot customization by implementing above mentioned features and modifications. This includes creating a skill reference for Docusaurus Ops and note scaffolder for generating index.md files, linking foundational topics to advanced topics, creating demo pages for practical demonstrations, and allowing flexibility in the note template structure. These enhancements will help me create comprehensive and well-structured notes for my learning journey as a Java/Spring Boot developer.