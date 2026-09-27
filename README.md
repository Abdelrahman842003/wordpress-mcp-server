# WordPress Model Context Protocol (MCP) Server

A feature-complete, production-grade **Model Context Protocol (MCP)** server for full management and administration of **WordPress** websites.

With this MCP server, AI assistants (such as Claude Desktop, Antigravity, Cursor, etc.) can manage posts, pages, plugins, themes, global site settings, custom post types (CPTs), post metadata, media files, comments, and execute arbitrary raw REST API requests.

---

## 🚀 Key Features & Capabilities

- 📝 **Posts & Pages**: Search, list, create, update, draft, publish, and delete posts and static pages.
- 🖼️ **Media Library**: Upload images and media from local disk directly to WordPress, list media.
- 🏷️ **Taxonomies**: Manage categories and tags (create, filter, associate with posts).
- 💬 **Comments**: Moderate, approve, spam, or reply to post comments.
- 🔌 **Plugins Management**: List, install from WordPress.org, activate/deactivate, and delete plugins.
- 🎨 **Themes Management**: List installed themes and switch active site themes.
- ⚙️ **Site Settings**: View and update general site settings (`site title`, `tagline`, `timezone`, `date format`, etc.).
- 📦 **Custom Post Types (CPTs) & Meta**: Query and modify entries for any custom post type registered on your site, read/write custom post metadata.
- 🌐 **Generic Raw REST API (`wp_raw_request`)**: Execute raw HTTP requests (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) to any WordPress endpoint—including third-party plugin APIs like **WooCommerce**, **ACF**, **Elementor**, or custom namespaces.

---

## 🔑 WordPress Setup: Application Passwords

This server uses standard WordPress **Application Passwords** for secure authentication over REST API.

1. Log in to your WordPress Dashboard as an Administrator.
2. Go to **Users** -> **Profile** (or **Users** -> **Edit User** for your admin user).
3. Scroll down to the **Application Passwords** section.
4. Enter a name (e.g. `MCP Server`) and click **Add New Application Password**.
5. Copy the generated password (e.g. `abcd 1234 efgh 5678 ijkl 9012`).

---

## 📦 Installation & Setup

### 1. Build the Server

```bash
cd /home/abdelrahman/.gemini/antigravity/scratch/wordpress-mcp-server
npm install
npm run build
```

### 2. Environment Variables Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your credentials in `.env`:

```env
WP_URL=https://your-wordpress-site.com
WP_USERNAME=your_admin_username
WP_APPLICATION_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
```

---

## 💻 Integration with AI Clients

### Claude Desktop Configuration

Add the following entry to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "wordpress": {
      "command": "node",
      "args": [
        "/home/abdelrahman/.gemini/antigravity/scratch/wordpress-mcp-server/dist/index.js"
      ],
      "env": {
        "WP_URL": "https://your-wordpress-site.com",
        "WP_USERNAME": "your_admin_username",
        "WP_APPLICATION_PASSWORD": "xxxx xxxx xxxx xxxx xxxx xxxx"
      }
    }
  }
}
```

---

## 🛠️ List of Provided MCP Tools

| Tool Name | Description |
|---|---|
| `wp_get_site_info` | Get site title, description, URL, namespaces, and API routes. |
| `wp_list_posts` | Filter and list WordPress posts. |
| `wp_get_post` | Retrieve post details by ID. |
| `wp_create_post` | Create a new post (supports draft/publish, categories, tags, meta). |
| `wp_update_post` | Update existing post details or metadata. |
| `wp_delete_post` | Trash or permanently delete a post. |
| `wp_list_pages` | List static pages. |
| `wp_get_page` | Get static page by ID. |
| `wp_create_page` | Create a static page. |
| `wp_update_page` | Update static page content/metadata. |
| `wp_delete_page` | Delete a static page. |
| `wp_upload_media` | Upload media file from local filesystem to Media Library. |
| `wp_list_media` | List media files. |
| `wp_list_categories` | List categories. |
| `wp_create_category` | Create a category. |
| `wp_list_tags` | List tags. |
| `wp_create_tag` | Create a post tag. |
| `wp_list_comments` | List comments. |
| `wp_create_comment` | Post a comment. |
| `wp_update_comment` | Moderate comment status (approve/spam/trash). |
| `wp_list_plugins` | List installed plugins. |
| `wp_install_plugin` | Install and activate plugin from WordPress.org. |
| `wp_update_plugin_status` | Activate/deactivate installed plugin. |
| `wp_delete_plugin` | Uninstall/delete plugin. |
| `wp_list_themes` | List installed themes. |
| `wp_activate_theme` | Switch active site theme. |
| `wp_get_settings` | Read site general settings. |
| `wp_update_settings` | Update site general settings. |
| `wp_get_post_types` | Get registered CPTs. |
| `wp_cpt_request` | List, get, create, update, or delete CPT items. |
| `wp_raw_request` | Generic tool to call any REST endpoint (WooCommerce, custom APIs). |

---

## 📄 License

MIT License.
