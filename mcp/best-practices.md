# CAF Free builder — agent rules

You are editing a **Category Ajax Filter** (Free) layout. Same limits as the Free builder. Pro-only features are not in this catalog.

## Loop

1. `caf-list-layouts` — pick the layout the user named (`layout_id` like `caf_3`).
2. Library: `caf-create-layout`, `caf-rename-layout`, `caf-duplicate-layout`, `caf-trash-layout`, `caf-restore-layout`. Permanent delete: trash first, then `caf-delete-layout`.
3. Last-screen settings → `caf-manage-layout-settings` (columns, order, inline filter position, pagination **numbers**, Design `css` / `target`). Do not set `filter_position=floating`, off-canvas pin, selected chips, sorting, result count, query restriction, or custom-field filters — those are Pro.
4. `caf-get-layout-structure` — lean tree. Node ids are durable.
5. `caf-list-module-schemas` (`tree=filter` or `tree=post`) / `caf-get-module-schema` before a new type.
6. Catalogs: `caf-list-taxonomies`, `caf-list-woo-attributes`, `caf-get-price-range`, `caf-list-posts`, `caf-list-media`.
7. Write:
   - Filter UI → `caf-build-filter` (checkbox, dropdown, search, reset, customtext, range on `_price`).
   - Results card → `caf-build-post` (image, title, excerpt, button, author, date, commentcount, categories, Woo image/price/ATC/badges, pagination).
   - One node → `caf-manage-modules` (`update`, `move`, `delete`, `duplicate`, `style`, `layout`, `bind_taxonomy`, `bind_price`).
8. Import/export → `caf-export-layout` / `caf-import-layout`. Revisions follow Free caps. Preview → `caf-create-preview-link`.

After a write, use **ids from that response**. Do not invent ids. `dry_run` does not persist.

## Create a filter

- If the user did not name a post type, call `caf-list-post-types` and **ask** before `caf-create-layout`.
- Infer `product` for shop / Woo / products.
- Create seeds search + unbound checkbox + reset, a post card, and pagination. Bind taxonomy only after the user names one.

## Design vs custom CSS

Prefer `action=style` / layout-settings `css` for colors, padding, fonts, borders, flex, hover. Do not put those in `custom_css`. If you do, the server folds them into Design and strips them from `custom_css`. Use `custom_css` only for `::before`, `:nth-child`, `@keyframes`, other selectors, `transform`, `animation`, `filter`, `clip-path`, `content`, `grid-template-*`.

## Free vs Pro

Do not tell the user to click the builder to unlock Pro MCP tools. Those tools are not registered on Free. If they need off-canvas, active-filter chips, sorting, query restriction, author filter, or custom-field filters, that is Category Ajax Filter Pro.
