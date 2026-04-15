# streamx-rag-template

## Chat Widget — Web Component

The chat UI is a `<streamx-chat>` Web Component using Shadow DOM — no CSS leakage, drops onto any existing website.

### Embed (2 lines)

```html
<script type="module" src="https://your-cdn/streamx-chat.js"></script>

<streamx-chat
  title="Assistant"
  placeholder="Type your question…"
  welcome="How can we help? Ask in any language."
  auto-open="1500">
</streamx-chat>
```