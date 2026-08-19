# Conversation summary

This is a concise decision record, not a verbatim transcript.

## Website direction

- The original Hugo-based site was considered visually inconsistent and difficult to control.
- The user requested removal of Hugo labels, icons, and compilation behavior.
- During visual exploration, the user selected the color direction from design option 2 and the layout direction from option 1.
- The preferred result is a calm academic/editorial portfolio rather than a generic template.
- Desktop layouts should use the available width well; mobile layouts must not overflow.

## Information architecture

- The user prefers separate pages rather than one continuous long page.
- Primary pages are Home, About, Research, Skills, and Contact.
- Research projects require a second level of independent detail pages.
- Search and display controls should remain on the right side of the navigation.
- The unclear `ZC / 22` label and duplicate Home link were questioned. The accepted solution is a clear `ZILIN CHEN` wordmark as the home entry, with no separate Home menu item.

## Technical direction

- The site was rebuilt in `MyWebsite` using plain HTML, CSS, and JavaScript.
- Hugo and other build systems should not be reintroduced.
- GitHub Pages is the intended public host; `.nojekyll` prevents processing by Jekyll.
- Content updates should be possible through natural-language requests without requiring the user to understand HTML.

## Discussed but deferred

- A database-backed guestbook with public/private messages was explored.
- GitHub Pages alone cannot safely accept anonymous private writes.
- Supabase was discussed as a possible backend, but the user chose not to add that operational complexity for now.

## Current request

- Preserve project memory in Git so future work can recover context quickly.
- Provide a complete English/Chinese interface with a switch beside the light/dark mode control.
