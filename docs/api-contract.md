# Card API contract

Between `scout-lantern` (SvelteKit frontend) and `kdm-search/backend` (REST API).
Both sides implement against this document. Changes here need agreement from both.

## Connection

- Backend listens on **`0.0.0.0`** (not `127.0.0.1`)
- Port: 3001
- Frontend reaches it via the `BACKEND_URL` env var, e.g. `http://backend:3001`

## GET /api/cards

Returns the card list, optionally filtered.

### Query parameters

| Param | Type   | Required | Meaning                                                                                                            |
| ----- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `q`   | string | no       | Case-insensitive substring match against `name`, `keywords`, and `rules_text`. Absent or empty → return all cards. |

### Success response — 200

Content-Type: `application/json`

```json
{
	"cards": [
		{
			"id": "core-1",
			"name": "Founding Stone",
			"keywords": ["Weapon", "Melee", "Starting Gear"],
			"rules_text": "At the start of the showdown, you may archive this card to gain survival."
		}
	],
	"total": 1
}
```

### Card object

| Field        | Type     | Notes                    |
| ------------ | -------- | ------------------------ |
| `id`         | string   | Stable unique identifier |
| `name`       | string   | Card title               |
| `keywords`   | string[] | May be empty, never null |
| `rules_text` | string   | May be empty, never null |

All four fields are always present. No nulls — use `""` or `[]`.

### `total`

The number of cards in `cards`. Reserved to mean "total matches before pagination"
if pagination is added later.

### No matches — still 200

```json
{ "cards": [], "total": 0 }
```

**Not a 404.** A search with no matches is a successful search that found nothing.
A 404 here would make the frontend render an error page for a normal search.

### Errors — 4xx / 5xx

JSON body:

```json
{ "error": "human-readable message" }
```

The frontend surfaces the status code and renders an error page.

## Notes for the backend

- **Bind `0.0.0.0`.** Inside a container, `127.0.0.1` means "this container only" and the
  frontend cannot reach it. This failure looks like a network problem, not a config one.
- **CORS is not needed.** The frontend's `load` runs server-side in Node — the browser never
  calls this API directly. CORS is a browser policy and does not apply. If CORS middleware
  seems necessary, one side has assumed browser-side fetches; raise it rather than working
  around it.

## Verifying

```bash
curl -s "http://localhost:PORT/api/cards" | head
curl -s "http://localhost:PORT/api/cards?q=stone"
curl -s "http://localhost:PORT/api/cards?q=zzzznotacard"   # expect 200, empty array
```
