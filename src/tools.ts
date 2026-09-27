import { z } from 'zod';
import { WordPressClient } from './wp-client.js';

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodTypeAny;
  handler: (client: WordPressClient, args: any) => Promise<any>;
}

export function zodToJsonSchema(schema: z.ZodTypeAny): any {
  if (!schema) return { type: 'object', properties: {} };

  let current: z.ZodTypeAny = schema;
  let description: string | undefined = current.description;

  if (current instanceof z.ZodOptional) {
    const inner = zodToJsonSchema(current._def.innerType);
    return description ? { ...inner, description } : inner;
  }
  if (current instanceof z.ZodDefault) {
    const inner = zodToJsonSchema(current._def.innerType);
    const defVal = typeof current._def.defaultValue === 'function' ? current._def.defaultValue() : current._def.defaultValue;
    return { ...inner, default: defVal, ...(description ? { description } : {}) };
  }
  if (current instanceof z.ZodString) {
    return { type: 'string', ...(description ? { description } : {}) };
  }
  if (current instanceof z.ZodNumber) {
    return { type: 'number', ...(description ? { description } : {}) };
  }
  if (current instanceof z.ZodBoolean) {
    return { type: 'boolean', ...(description ? { description } : {}) };
  }
  if (current instanceof z.ZodEnum) {
    return { type: 'string', enum: current._def.values, ...(description ? { description } : {}) };
  }
  if (current instanceof z.ZodArray) {
    return {
      type: 'array',
      items: zodToJsonSchema(current._def.type),
      ...(description ? { description } : {}),
    };
  }
  if (current instanceof z.ZodRecord) {
    return {
      type: 'object',
      additionalProperties: true,
      ...(description ? { description } : {}),
    };
  }
  if (current instanceof z.ZodObject) {
    const shape = current.shape;
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      const propSchema = value as z.ZodTypeAny;
      properties[key] = zodToJsonSchema(propSchema);

      const isOptional = propSchema instanceof z.ZodOptional || propSchema instanceof z.ZodDefault;
      if (!isOptional) {
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      ...(required.length > 0 ? { required } : {}),
      ...(description ? { description } : {}),
    };
  }

  return { type: 'object', properties: {} };
}

export const tools: MCPToolDefinition[] = [
  // --- Site Info ---
  {
    name: 'wp_get_site_info',
    description: 'Get basic information and metadata about the WordPress site, REST API namespaces, and routes.',
    inputSchema: z.object({}),
    handler: async (client) => {
      return await client.getSiteInfo();
    },
  },

  // --- Posts ---
  {
    name: 'wp_list_posts',
    description: 'List posts with optional filters (search, category, status, limit, page, order).',
    inputSchema: z.object({
      page: z.number().optional().describe('Page number (default 1)'),
      per_page: z.number().optional().describe('Items per page (max 100, default 10)'),
      search: z.string().optional().describe('Search keyword'),
      status: z.enum(['publish', 'future', 'draft', 'pending', 'private', 'trash', 'any']).optional().describe('Post status'),
      categories: z.string().optional().describe('Comma-separated category IDs'),
      tags: z.string().optional().describe('Comma-separated tag IDs'),
      author: z.number().optional().describe('Author ID'),
      slug: z.string().optional().describe('Filter by exact slug'),
      order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
      orderby: z.enum(['date', 'title', 'id', 'relevance', 'modified']).optional().describe('Sort by field'),
    }),
    handler: async (client, args) => {
      return await client.listPosts(args);
    },
  },

  {
    name: 'wp_get_post',
    description: 'Get details of a specific WordPress post by ID.',
    inputSchema: z.object({
      id: z.number().describe('The post ID'),
    }),
    handler: async (client, args) => {
      return await client.getPost(args.id);
    },
  },

  {
    name: 'wp_create_post',
    description: 'Create a new WordPress post.',
    inputSchema: z.object({
      title: z.string().describe('Post title'),
      content: z.string().describe('Post HTML or plain text content'),
      status: z.enum(['publish', 'future', 'draft', 'pending', 'private']).optional().default('draft').describe('Post status'),
      slug: z.string().optional().describe('Custom slug'),
      excerpt: z.string().optional().describe('Post excerpt'),
      categories: z.array(z.number()).optional().describe('Array of Category IDs'),
      tags: z.array(z.number()).optional().describe('Array of Tag IDs'),
      featured_media: z.number().optional().describe('Featured Image Media ID'),
      comment_status: z.enum(['open', 'closed']).optional().describe('Allow comments'),
      meta: z.record(z.any()).optional().describe('Custom post metadata object'),
    }),
    handler: async (client, args) => {
      return await client.createPost(args);
    },
  },

  {
    name: 'wp_update_post',
    description: 'Update an existing WordPress post.',
    inputSchema: z.object({
      id: z.number().describe('The post ID to update'),
      title: z.string().optional().describe('New post title'),
      content: z.string().optional().describe('New post content'),
      status: z.enum(['publish', 'future', 'draft', 'pending', 'private', 'trash']).optional().describe('New status'),
      slug: z.string().optional().describe('New slug'),
      excerpt: z.string().optional().describe('New excerpt'),
      categories: z.array(z.number()).optional().describe('Updated Category IDs'),
      tags: z.array(z.number()).optional().describe('Updated Tag IDs'),
      featured_media: z.number().optional().describe('Featured Media ID'),
      comment_status: z.enum(['open', 'closed']).optional().describe('Comment status'),
      meta: z.record(z.any()).optional().describe('Custom post metadata object'),
    }),
    handler: async (client, args) => {
      return await client.updatePost(args);
    },
  },

  {
    name: 'wp_delete_post',
    description: 'Delete a WordPress post (move to trash or delete permanently).',
    inputSchema: z.object({
      id: z.number().describe('The post ID to delete'),
      force: z.boolean().optional().default(false).describe('Whether to permanently delete instead of moving to trash'),
    }),
    handler: async (client, args) => {
      return await client.deletePost(args.id, args.force);
    },
  },

  // --- Pages ---
  {
    name: 'wp_list_pages',
    description: 'List WordPress static pages.',
    inputSchema: z.object({
      page: z.number().optional(),
      per_page: z.number().optional(),
      search: z.string().optional(),
      status: z.string().optional(),
      parent: z.number().optional(),
    }),
    handler: async (client, args) => {
      return await client.listPages(args);
    },
  },

  {
    name: 'wp_get_page',
    description: 'Get details of a specific WordPress page by ID.',
    inputSchema: z.object({
      id: z.number().describe('Page ID'),
    }),
    handler: async (client, args) => {
      return await client.getPage(args.id);
    },
  },

  {
    name: 'wp_create_page',
    description: 'Create a new static page in WordPress.',
    inputSchema: z.object({
      title: z.string().describe('Page title'),
      content: z.string().describe('Page content'),
      status: z.enum(['publish', 'future', 'draft', 'pending', 'private']).optional().default('draft'),
      slug: z.string().optional(),
      parent: z.number().optional().describe('Parent page ID for hierarchical pages'),
      menu_order: z.number().optional(),
      meta: z.record(z.any()).optional(),
    }),
    handler: async (client, args) => {
      return await client.createPage(args);
    },
  },

  {
    name: 'wp_update_page',
    description: 'Update an existing WordPress static page.',
    inputSchema: z.object({
      id: z.number().describe('Page ID to update'),
      title: z.string().optional(),
      content: z.string().optional(),
      status: z.enum(['publish', 'future', 'draft', 'pending', 'private']).optional(),
      slug: z.string().optional(),
      parent: z.number().optional(),
      menu_order: z.number().optional(),
      meta: z.record(z.any()).optional(),
    }),
    handler: async (client, args) => {
      return await client.updatePage(args);
    },
  },

  {
    name: 'wp_delete_page',
    description: 'Delete a static page.',
    inputSchema: z.object({
      id: z.number().describe('Page ID'),
      force: z.boolean().optional().default(false).describe('Permanently delete if true'),
    }),
    handler: async (client, args) => {
      return await client.deletePage(args.id, args.force);
    },
  },

  // --- Media ---
  {
    name: 'wp_upload_media',
    description: 'Upload an image or file from local disk to WordPress Media Library.',
    inputSchema: z.object({
      filePath: z.string().describe('Absolute file path on local filesystem'),
      title: z.string().optional().describe('Media title'),
      altText: z.string().optional().describe('Alternative text for images'),
    }),
    handler: async (client, args) => {
      return await client.uploadMedia(args.filePath, args.title, args.altText);
    },
  },

  {
    name: 'wp_list_media',
    description: 'List files in WordPress Media Library.',
    inputSchema: z.object({
      page: z.number().optional(),
      per_page: z.number().optional(),
      media_type: z.enum(['image', 'video', 'audio', 'application']).optional(),
      mime_type: z.string().optional(),
      search: z.string().optional(),
    }),
    handler: async (client, args) => {
      return await client.listMedia(args);
    },
  },

  // --- Taxonomies ---
  {
    name: 'wp_list_categories',
    description: 'List WordPress categories.',
    inputSchema: z.object({
      search: z.string().optional(),
      hide_empty: z.boolean().optional(),
      parent: z.number().optional(),
    }),
    handler: async (client, args) => {
      return await client.listCategories(args);
    },
  },

  {
    name: 'wp_create_category',
    description: 'Create a new category in WordPress.',
    inputSchema: z.object({
      name: z.string().describe('Category name'),
      description: z.string().optional(),
      parent: z.number().optional().describe('Parent category ID'),
    }),
    handler: async (client, args) => {
      return await client.createCategory(args.name, args.description, args.parent);
    },
  },

  {
    name: 'wp_list_tags',
    description: 'List WordPress tags.',
    inputSchema: z.object({
      search: z.string().optional(),
      hide_empty: z.boolean().optional(),
    }),
    handler: async (client, args) => {
      return await client.listTags(args);
    },
  },

  {
    name: 'wp_create_tag',
    description: 'Create a new post tag in WordPress.',
    inputSchema: z.object({
      name: z.string().describe('Tag name'),
      description: z.string().optional(),
    }),
    handler: async (client, args) => {
      return await client.createTag(args.name, args.description);
    },
  },

  // --- Comments ---
  {
    name: 'wp_list_comments',
    description: 'List post comments.',
    inputSchema: z.object({
      post: z.number().optional().describe('Filter comments by Post ID'),
      status: z.enum(['approve', 'hold', 'spam', 'trash', 'all']).optional(),
      search: z.string().optional(),
    }),
    handler: async (client, args) => {
      return await client.listComments(args);
    },
  },

  {
    name: 'wp_create_comment',
    description: 'Post a comment on a WordPress post.',
    inputSchema: z.object({
      postId: z.number().describe('Post ID'),
      content: z.string().describe('Comment content text'),
      authorName: z.string().optional(),
      authorEmail: z.string().optional(),
    }),
    handler: async (client, args) => {
      return await client.createComment(args.postId, args.content, args.authorName, args.authorEmail);
    },
  },

  {
    name: 'wp_update_comment',
    description: 'Approve, hold, spam, or trash a comment.',
    inputSchema: z.object({
      commentId: z.number().describe('Comment ID'),
      status: z.enum(['approved', 'hold', 'spam', 'trash']).describe('New comment status'),
    }),
    handler: async (client, args) => {
      return await client.updateComment(args.commentId, args.status);
    },
  },

  // --- Plugins ---
  {
    name: 'wp_list_plugins',
    description: 'List installed plugins on the WordPress site.',
    inputSchema: z.object({}),
    handler: async (client) => {
      return await client.listPlugins();
    },
  },

  {
    name: 'wp_install_plugin',
    description: 'Install and activate a plugin from WordPress.org repository by slug.',
    inputSchema: z.object({
      slug: z.string().describe('Plugin slug (e.g. "woocommerce", "contact-form-7")'),
    }),
    handler: async (client, args) => {
      return await client.installPlugin(args.slug);
    },
  },

  {
    name: 'wp_update_plugin_status',
    description: 'Activate or deactivate an installed plugin.',
    inputSchema: z.object({
      plugin: z.string().describe('Plugin identifier (e.g. "woocommerce/woocommerce.php")'),
      status: z.enum(['active', 'inactive']).describe('Target status'),
    }),
    handler: async (client, args) => {
      return await client.updatePluginStatus(args.plugin, args.status);
    },
  },

  {
    name: 'wp_delete_plugin',
    description: 'Delete/uninstall an installed plugin from WordPress.',
    inputSchema: z.object({
      plugin: z.string().describe('Plugin file path (e.g. "akismet/akismet.php")'),
    }),
    handler: async (client, args) => {
      return await client.deletePlugin(args.plugin);
    },
  },

  // --- Themes ---
  {
    name: 'wp_list_themes',
    description: 'List installed themes on the WordPress site.',
    inputSchema: z.object({}),
    handler: async (client) => {
      return await client.listThemes();
    },
  },

  {
    name: 'wp_activate_theme',
    description: 'Switch and activate an installed WordPress theme by stylesheet name.',
    inputSchema: z.object({
      stylesheet: z.string().describe('Theme stylesheet directory name (e.g. "twentytwentyfour")'),
    }),
    handler: async (client, args) => {
      return await client.activateTheme(args.stylesheet);
    },
  },

  // --- Site Settings ---
  {
    name: 'wp_get_settings',
    description: 'Retrieve site settings (site title, tagline, timezone, date/time format, admin email, etc.).',
    inputSchema: z.object({}),
    handler: async (client) => {
      return await client.getSettings();
    },
  },

  {
    name: 'wp_update_settings',
    description: 'Update site general settings.',
    inputSchema: z.object({
      title: z.string().optional().describe('Site Title'),
      description: z.string().optional().describe('Tagline / Site Description'),
      email: z.string().optional().describe('Admin Email'),
      timezone: z.string().optional().describe('Timezone string e.g. "Africa/Cairo"'),
      date_format: z.string().optional().describe('Date format string e.g. "F j, Y"'),
      time_format: z.string().optional().describe('Time format string e.g. "g:i a"'),
      posts_per_page: z.number().optional().describe('Default posts per page'),
      default_category: z.number().optional().describe('Default category ID'),
    }),
    handler: async (client, args) => {
      return await client.updateSettings(args);
    },
  },

  // --- Custom Post Types (CPTs) & Meta ---
  {
    name: 'wp_get_post_types',
    description: 'Retrieve all registered post types and their REST API base endpoints.',
    inputSchema: z.object({}),
    handler: async (client) => {
      return await client.getPostTypes();
    },
  },

  {
    name: 'wp_cpt_request',
    description: 'Generic handler to list, get, create, update, or delete items for any Custom Post Type (CPT).',
    inputSchema: z.object({
      rest_base: z.string().describe('REST base of the CPT (e.g., "portfolio", "books", "products")'),
      action: z.enum(['list', 'get', 'create', 'update', 'delete']).describe('Operation to perform'),
      id: z.number().optional().describe('Target item ID (required for get, update, delete)'),
      data: z.record(z.any()).optional().describe('Payload object for create/update (including title, content, meta)'),
      params: z.record(z.any()).optional().describe('Query parameters for list or delete (e.g. { force: true })'),
    }),
    handler: async (client, args) => {
      return await client.handleCptRequest(args);
    },
  },

  // --- Generic WP Raw REST Request ---
  {
    name: 'wp_raw_request',
    description: 'Execute arbitrary raw REST API requests to any WordPress endpoint (including WooCommerce, ACF, custom plugins).',
    inputSchema: z.object({
      endpoint: z.string().describe('Relative REST endpoint path (e.g. "/wp-json/wc/v3/orders" or "wp/v2/users")'),
      method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional().default('GET').describe('HTTP method'),
      params: z.record(z.any()).optional().describe('URL Query Parameters'),
      data: z.record(z.any()).optional().describe('JSON request body'),
      headers: z.record(z.string()).optional().describe('Custom HTTP headers'),
    }),
    handler: async (client, args) => {
      return await client.rawRequest(args);
    },
  },
];
